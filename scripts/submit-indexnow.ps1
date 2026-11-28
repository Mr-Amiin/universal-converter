param(
    [string]$UrlsFile = ".\indexnow-urls.txt"
)

$ErrorActionPreference = "Stop"

$SiteHost = "www.theuniversalconverter.com"
$Key = "a0be64dd3d1249a18c53841e382304fb"
$KeyLocation = "https://www.theuniversalconverter.com/a0be64dd3d1249a18c53841e382304fb.txt"
$Endpoint = "https://api.indexnow.org/indexnow"
$BatchSize = 10000

if (!(Test-Path -LiteralPath $UrlsFile)) {
    throw "URL file not found: $UrlsFile"
}

$Urls = @(
    Get-Content -LiteralPath $UrlsFile |
    ForEach-Object { $_.Trim() } |
    Where-Object { $_ -and !$_.StartsWith("#") } |
    Select-Object -Unique
)

if ($Urls.Count -eq 0) {
    Write-Host "No URLs to submit." -ForegroundColor Yellow
    exit 0
}

foreach ($Url in $Urls) {
    $Parsed = $null

    if (
        ![uri]::TryCreate($Url, [System.UriKind]::Absolute, [ref]$Parsed) -or
        $Parsed.Scheme -ne "https" -or
        $Parsed.Host -ne $SiteHost -or
        $Parsed.UserInfo
    ) {
        throw "Invalid or unauthorized URL: $Url"
    }
}

Write-Host "Validated $($Urls.Count) unique URLs." -ForegroundColor Cyan

$BatchCount = [math]::Ceiling($Urls.Count / $BatchSize)

for ($i = 0; $i -lt $Urls.Count; $i += $BatchSize) {
    $End = [math]::Min($i + $BatchSize - 1, $Urls.Count - 1)
    $Batch = @($Urls[$i..$End])

    $Body = @{
        host = $SiteHost
        key = $Key
        keyLocation = $KeyLocation
        urlList = $Batch
    } | ConvertTo-Json -Depth 3

    Write-Host "Submitting $($Batch.Count) URL(s)..."

    $Response = Invoke-WebRequest `
        -Uri $Endpoint `
        -Method POST `
        -ContentType "application/json; charset=utf-8" `
        -Body $Body

    Write-Host "HTTP $($Response.StatusCode) - Accepted" -ForegroundColor Green
}

Write-Host "All batches submitted successfully." -ForegroundColor Green

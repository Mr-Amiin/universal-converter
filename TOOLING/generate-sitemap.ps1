# generate-sitemap.ps1
#
# The sitemap is now a SITEMAP INDEX (sitemap.xml) plus numbered files
# (sitemap-0001.xml, sitemap-0002.xml, ...) with at most 10,000 URLs each.
# A single sitemap.xml with every URL exceeded Google's 50 MB limit, so this
# script no longer writes one. It simply runs the Python generator, which
# scans the real pages (index/canonical/noindex aware) and writes the index and
# the split files. build.py runs the same generator when it builds dist/; a host
# that serves the repository root as-is (GitHub Pages) uses the committed files that
# this script refreshes (equivalent to: python3 update_sitemaps.py).
#
# Usage (from the repository root):
#   powershell -NoProfile -ExecutionPolicy Bypass -File .\generate-sitemap.ps1
$ErrorActionPreference = "Stop"

$Root = Split-Path -Parent $MyInvocation.MyCommand.Path
$Generator = Join-Path $Root "generate_sitemaps.py"
if (-not (Test-Path $Generator)) {
  throw "generate_sitemaps.py not found next to this script ($Generator)."
}

$python = Get-Command python3 -ErrorAction SilentlyContinue
if (-not $python) { $python = Get-Command python -ErrorAction SilentlyContinue }
if (-not $python) { throw "Python 3 is required to generate the sitemaps." }

# Refresh the committed copies in the repository root (not dist/).
& $python.Source $Generator --site-dir $Root --out-dir $Root
if ($LASTEXITCODE -ne 0) { throw "Sitemap generation failed (exit code $LASTEXITCODE)." }

& $python.Source (Join-Path $Root "validate_sitemaps.py") --site-dir $Root
if ($LASTEXITCODE -ne 0) { throw "Sitemap validation failed (exit code $LASTEXITCODE)." }

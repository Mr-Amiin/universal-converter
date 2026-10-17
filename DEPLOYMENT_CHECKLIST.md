# Deployment checklist (GitHub Pages, `main`, repository root)

Nothing here has been run for you: the ZIP is not committed, pushed or deployed.

## Before committing
- [ ] Extract the ZIP over your repository root. **Do not** bring back `_redirects` / `_headers` from the earlier ZIP; if you did, run `git checkout -- _redirects _headers`.
- [ ] Run `python3 update_sitemaps.py --check` (about 2 minutes). Expect: `OK: ... current and valid.` and `327,580 URLs`, `33` sitemap files.
- [ ] `git status`: you should see 132 modified and 39 new files (121 of the modified ones are the `area/`, `length/`, `temperature/` pages). `dist/` must not be added.

## Commit these together (one commit)
- [ ] `sitemap.xml` **and all 33** `sitemap-0001.xml` … `sitemap-0033.xml`
- [ ] the 121 pages, `search-index.json`, `TOOLING/seo-conversion-registry.json`
- [ ] `generate_sitemaps.py`, `validate_sitemaps.py`, `update_sitemaps.py`, `tests/test_sitemaps.py`, `TOOLING/sitemap-retired-urls.txt`, `build.py`, `sitemap.html`, `launch-checklist.md`, the two `generate-sitemap.ps1`, `generate_seo_pages_from_sitemap.py` (both copies), `scripts/generate-sitemap.js`
- [ ] optional: `.github/workflows/sitemap-check.yml` (read-only check; does not block or change publishing)

## Confirm the hosting setup (I could not)
- [ ] GitHub → Settings → Pages: is the source "Deploy from a branch", `main`, `/ (root)`? Is the custom domain set?
- [ ] The tracked tree is 8.1 GB; GitHub documents a 1 GB limit and a 10-minute deployment timeout for Pages. Check the latest "pages build and deployment" run under Actions and make sure it is succeeding.

## After the deployment finishes (these are live checks I have NOT done)
- [ ] Open `https://theuniversalconverter.com/sitemap.xml`: expect an index listing `sitemap-0001.xml` … `sitemap-0033.xml`.
- [ ] Open `https://theuniversalconverter.com/sitemap-0033.xml` and one middle part: expect XML, HTTP 200.
- [ ] Open `https://theuniversalconverter.com/area/acres-to-square-feet/`: expect a normal page whose canonical tag is that same URL.
- [ ] Open `https://theuniversalconverter.com/acres-to-square-feet/`: expect **404 (no redirect)**; this is expected and intended.
- [ ] Optional command line check: `curl -sI https://theuniversalconverter.com/sitemap.xml | head -1`

## Search Console
- [ ] Submit (or resubmit) `https://theuniversalconverter.com/sitemap.xml`.
- [ ] Wait for processing; acceptance and indexing are outside this package and have not been verified.

## Whenever pages change later
- [ ] `python3 update_sitemaps.py`, then commit `sitemap.xml` and every `sitemap-*.xml` with the page changes.

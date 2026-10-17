# Universal Converter: sitemap fix, hosting-specific final report (GitHub Pages)

Nothing was committed, pushed or deployed, and no hosting, DNS, domain or publishing setting was touched.

**Two kinds of evidence are kept apart throughout this report:**
- **Repository-file tests**: run on the files in the repository (all results below).
- **Live HTTP / Google verification**: **none.** Every request from my environment to theuniversalconverter.com failed, and GitHub's API was not reachable for this repository. No live URL, no 301, no GitHub Pages setting and no Search Console result has been verified.

This supersedes all earlier reports. **Do not apply `_redirects` or `_headers` from the previous ZIP**: it contained 242 Netlify redirect rules that do nothing on GitHub Pages. This ZIP deliberately contains neither file; both are identical to the repository's original versions. If you already extracted the previous ZIP, restore them with `git checkout -- _redirects _headers`.

## 1. What the hosting evidence shows
| Evidence (repository files) | Points to |
|---|---|
| `CNAME` (`theuniversalconverter.com`) and a root `404.html`, both from the first commit | GitHub Pages-style publishing |
| No `netlify.toml` in the entire git history (33 commits); the only Netlify mentions are comments in `build.py` and a line in `launch-checklist.md` | Not Netlify |
| No `.github/` directory ever existed; `fetch-rates.yml` sits in the repo root, where GitHub does not run it | No Actions-based deployment in the repo |
| No `.nojekyll`, `_config.yml`, `vercel.json`, `wrangler.toml`, etc. | Nothing contradicts "publish from branch, root" |
| Your statement: GitHub Pages from `main`, repository root | Working assumption used for the design |

**Not confirmed:** I could not read the repository's Pages settings or Actions history. Please confirm under Settings → Pages.

**Unresolved conflict to check:** the tracked tree is **327,778 files / 8.1 GB**. GitHub's documentation states "Published GitHub Pages sites may be no larger than 1 GB" and "deployments will timeout if they take longer than 10 minutes" ([limits page](https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits)). An 8.1 GB root cannot fit those limits, so either the site is served some other way than I assumed, or the live site is not the whole repository. I cannot resolve this from the repository. It does not change the sitemap fix, but it matters for the CI check (below) and for where the files must end up.

## 2. Redirects: what was wrong and what was done
- `_redirects` and `_headers` are Netlify conventions. I found no GitHub Pages documentation that applies them, and a community thread states Pages does not support HTTP 301 redirects. The 242 rules I added earlier therefore **would not have produced 301s** on GitHub Pages. They were removed; `_redirects` (26 original rules) and `_headers` are byte-identical to the original commit.
- The validator and generator no longer treat `_redirects` as evidence that anything works: it is ignored unless `--honor-redirects` is passed (meant for a host that really applies it).
- The 121 old root URLs are instead **documented as retired** in `TOOLING/sitemap-retired-urls.txt` (exactly the 121 I derived independently from the original commit). The "nothing valid was lost" guard accepts a dropped URL only if it is in that file; a URL cannot be both retired and listed or have a page of its own (check 14).
- **Effect on the 121 root URLs (e.g. `/acres-to-square-feet/`):** per the repository files they had no page before and still have none, so they should keep answering HTTP 404 (predicted, not observed). They are no longer advertised anywhere: not in the sitemap, not in any canonical tag, not in the search index. Since they never served a page, there is no working URL, ranking or link equity to lose, and a sitemap no longer submits URLs that answer 404.

Alternatives for real redirects, and their trade-offs (none implemented; each needs your decision):
| Option | Gives you | Cost / risk |
|---|---|---|
| **A. Leave them as 404 (current)** | Nothing to maintain; no new files | No redirect for anyone who has the old root URL (they never worked) |
| **B. 121 static stub pages** at the root paths with `<meta http-equiv="refresh">` + canonical to the nested page | A client-side redirect that works on a static host | Response is HTTP 200, not 301; adds 121 thin pages that must not be listed in the sitemap; search engines may treat it differently from a 301 |
| **C. Put a CDN/proxy in front** (e.g. a service with redirect rules) | Real HTTP 301s | Needs a DNS/hosting change: not authorized |
| **D. Move to a host that applies `_redirects`** | Real 301s plus `_headers` | A hosting change: not authorized; also see the size limit above |
| **E. JavaScript redirect inside `404.html`** | Soft landing for visitors | Status stays 404; weakest for search engines |

## 3. How the sitemap is generated on this hosting
GitHub Pages serving the repository root runs no `build.py` (it produces `dist/`, which is not what the root serves), and the repository has no deployment workflow. So **the committed `sitemap.xml` + `sitemap-0001…0033.xml` in the repository root are the deployed artifact**, and they are refreshed manually and committed:

```
python3 update_sitemaps.py          # regenerate + validate (about 2 to 3 minutes, not the ~47-minute build.py)
git add sitemap.xml sitemap-*.xml   # plus any changed pages, then commit together
python3 update_sitemaps.py --check  # verify the committed files are current and valid, changes nothing
```
- `update_sitemaps.py` (new) runs `generate_sitemaps.py` then `validate_sitemaps.py` on the repository root; it never touches anything else. The generator and validator now **default to the repository root, never `dist/`**, so a leftover local build folder can't be scanned by accident. `--check` ignores CRLF/LF differences (Windows checkouts).
- `.github/workflows/sitemap-check.yml` (new, optional): runs the unit tests and `update_sitemaps.py --check` on pushes to `main`, pull requests and manual dispatch, filtered to HTML/sitemap/tooling paths. It has `contents: read`, **never commits, pushes or deploys**, and does not change how the site is published. With Pages publishing straight from a branch it **cannot block a deployment**; it only reports. It has not been run on GitHub (I could only parse the YAML and run the same two commands locally), and checking out an 8 GB repository on a hosted runner is untested. Committing this file is optional.
- `build.py` keeps its sitemap step for any flow that publishes `dist/`, but it is not part of the GitHub Pages deployment. New tooling and `.github` are excluded from `dist/`.
- Everything in the repository root, including the new `.py` tooling, is publicly downloadable, as the existing scripts already are.

## 4. Validation: repository files only
| Check | Result |
|---|---|
| HTML files in the repository | 327,623 |
| Excluded | 43 (5 `noindex`; 38 duplicate-path copies whose canonical target is itself listed). Every one has a documented reason: `evidence/excluded-pages.csv` |
| Canonical URLs with no page | 0 |
| Reconciliation | 327,623 − 43 + 0 = **327,580 URLs** |
| Sitemap parts / index | **33** parts, all present; the index references exactly those 33; none missing, none stray |
| Largest part | 10,000 URLs, 1,289,104 bytes (limits 50,000 / 52,428,800) |
| Canonical correctness | all 327,580 listed URLs map to exactly one page whose single canonical tag equals the URL, none `noindex` (checked by an independent `html.parser` script and by the validator) |
| Against the original 327,574-URL sitemap | 327,453 unchanged + **121 documented retired** + 0 lost; 6 flagship pages added |
| Without the retired list | the same 121 are correctly reported as lost (negative test) |
| 121 pages | each differs from the original commit only by root→nested URL substitution (canonical + 2 JSON-LD URL fields) |
| `search-index.json` | regenerates byte-identically; all 7,578 URLs resolve to a page in the repository |
| `_redirects` / `_headers` | identical to the original commit |
| Tests | 73/73 pass, including the whole-repository coverage test; the CI command (`update_sitemaps.py --check`) exits 0 on the repository root in about 2 minutes |

The earlier full `build.py` run (exit 0, ~49 min) also passed with the same counts; it is not needed for this deployment.

## 5. Not verified / still open
1. Live behaviour of any URL (sitemap, nested pages, retired root URLs) and Search Console acceptance: **not verified.**
2. The Pages source setting, and the 8.1 GB vs 1 GB limit conflict (section 1).
3. The new workflow on a real GitHub runner.
4. Pre-existing items I noticed and did **not** change: `launch-checklist.md` line 16 still describes Netlify rewriting `/converter`; `404.html` (and `STATIC/404.html`) send visitors to `/converter?slug=…`, a path that only existed as a Netlify rewrite, so on a static host it falls through to the home page after a delay; `fetch-rates.yml` is not in `.github/workflows/`, so it does not run; the 38 duplicate-path files (`STATIC/`, `templates/`, `index - Copy*.html`, …) are still published (correctly canonicalised and excluded from the sitemap); `validate_shared_nav.py` flagged `temperature/index.html` in an earlier run (not re-run).

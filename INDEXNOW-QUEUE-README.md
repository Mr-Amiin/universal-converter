# Persistent IndexNow queue — local review package

This package replaces the current one-shot IndexNow workflow/script with a durable queue. It is intended for local review first; do not publish it until the repository owner approves.

## What changes

- Watches pushes to `main`, plus a 15-minute scheduled drain and manual dispatch.
- A push run waits for the matching GitHub Pages deployment to reach `success` before scanning.
- Compares the last scanned successful Pages deployment to the latest successful Pages deployment.
- Adds new/modified public `.html` pages to a persistent queue on the separate orphan branch `indexnow-queue`.
- Stores pending URLs in files of at most 1,000 URLs each.
- Submits no more than one 1,000-URL batch per run. Scheduled runs continue draining the queue even when there are no new deployments.
- Removes a batch only after IndexNow acknowledges receipt with HTTP 200 or 202. HTTP 202 means the URLs were received while key validation is pending; network/API errors leave the batch queued for retry.
- If the API acknowledges a batch but saving the queue removal fails, the remote batch remains and may be resubmitted. This is at-least-once delivery; duplicate IndexNow notifications are preferable to losing URLs.
- Deleted URLs are reported only and removed from the pending queue if they had not yet been submitted.
- Queue state is stored separately from `main`, so GitHub Pages continues publishing from `main` only.

## Initial backfill checkpoint

The queue's initial checkpoint is commit `30dadfdccdef` (deployment `7912191772`, created `2026-11-19T11:47:39Z`), the successful Pages deployment before the subsequent SEO/internal-linking rollout series. The first queue run will diff from this checkpoint to the latest successful Pages deployment and enqueue eligible public HTML changes in that range.

This targeted backfill includes the later merged work such as PR #29 (category hubs), PR #31 (“Expand internal linking and multilingual category hubs”), PR #32 (“internal linking”), and PR #35 (“Checkpoint completed internal linking pages (87,688)”). PR #35's title reports 87,688 pages; PR #31 and #32 also contain internal-linking/category page changes. The script computes the exact eligible HTML URL count from Git history and filesystem checks at runtime. This is **not** a full sitemap or full-site submission. Changes deployed before the November 19 checkpoint are not automatically backfilled.

## Settings

- Website: `https://www.theuniversalconverter.com`
- Host: `www.theuniversalconverter.com`
- Secret: repository Actions secret `INDEXNOW_KEY` (already created)
- Batch cap: 1,000 URLs
- Schedule: every 15 minutes
- Queue branch: `indexnow-queue` (created automatically on first run)
- Deleted URLs: report only; never submit
- `update-rates.yml`: untouched
- Existing manual script `scripts/submit-indexnow.ps1`: untouched

## Required GitHub Actions permissions

The workflow asks for `contents: write` and `deployments: read`. `contents: write` is needed to create/update the orphan queue branch. The repository's existing currency workflow already uses a write-capable token for its separate data branch; this package does not edit that workflow.

The `GITHUB_TOKEN` push to `indexnow-queue` does not trigger this workflow because the push trigger is restricted to `main`.

## Runtime behavior and limits

- At most one batch is submitted in each run. With the 15-minute schedule, 200,000 queued URLs require approximately 200 batches (about 50 hours of scheduled intervals), assuming runs execute normally and no repeated failures. GitHub may delay scheduled runs; the branch keeps the pending queue durable for later runs.
- GitHub concurrency uses `queue: max` to serialize queue updates. GitHub allows up to 100 pending runs in this queue; later scheduled or deployment events can resume from the durable queue if events are delayed or dropped.
- The workflow fails safely if the saved checkpoint is not an ancestor of the deployed commit, or if it cannot verify a successful Pages deployment.
- API acceptance is not a guarantee that Bing will crawl or index every page.

## Files

- `.github/workflows/indexnow-submit.yml` — replacement workflow
- `scripts/indexnow-submit.py` — persistent queue logic
- `tests/indexnow/test_queue_helpers.py` — offline unit/integration tests

## Local tests

From the repository root:

```powershell
python -m py_compile .\scripts\indexnow-submit.py
python -m unittest discover -s .\tests\indexnow -v
```

These tests do not call the live IndexNow or GitHub APIs or push to GitHub. The orphan-branch integration test pushes only to a temporary local bare Git repository.

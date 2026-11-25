#!/usr/bin/env python3
"""Submit changed public HTML pages from a successful GitHub Pages deployment.

Policy:
- Only added/modified HTML pages are submitted.
- Deleted HTML pages are recorded, never submitted.
- At most 1,000 URLs are submitted per deployment.
- Any overflow is preserved in the report artifact.
- If a previous successful github-pages deployment cannot be identified,
  fail closed: do not submit the whole site.
"""

from __future__ import annotations

import json
import os
import subprocess
import sys
import time
from datetime import datetime, timezone
from pathlib import Path, PurePosixPath
from urllib.error import HTTPError, URLError
from urllib.parse import quote, urlencode
from urllib.request import Request, urlopen

SITE_HOST = "www.theuniversalconverter.com"
SITE_ORIGIN = f"https://{SITE_HOST}"
INDEXNOW_ENDPOINT = "https://api.indexnow.org/indexnow"
MAX_URLS = 1000
KEY_FILE_SUFFIX = ".txt"
REPORT_DIR = Path("indexnow-report")
MAX_DEPLOYMENT_PAGES = 100
MAX_STATUS_PAGES = 10
PAGES_DEPLOYMENT_TIMEOUT_SECONDS = 25 * 60
PAGES_DEPLOYMENT_POLL_SECONDS = 15

# These are repository/tooling locations, not public converter pages.
EXCLUDED_PARTS = {
    ".git", ".github", ".vscode", "node_modules", "tests", "test",
    "scripts", "sitemap-rebuild-staging", "coverage", "vendor",
}
RETRYABLE_HTTP_CODES = {408, 425, 429, 500, 502, 503, 504}


def parse_github_time(value: str) -> datetime:
    if not value:
        raise RuntimeError("A deployment/status record has no created_at timestamp.")
    try:
        parsed = datetime.fromisoformat(value.replace("Z", "+00:00"))
    except ValueError as exc:
        raise RuntimeError(f"Invalid GitHub timestamp: {value!r}") from exc
    if parsed.tzinfo is None:
        parsed = parsed.replace(tzinfo=timezone.utc)
    return parsed.astimezone(timezone.utc)


def deployment_order_key(deployment: dict) -> tuple[datetime, int]:
    return parse_github_time(deployment.get("created_at", "")), int(deployment["id"])


def gh_api(path: str):
    token = os.environ.get("GH_TOKEN")
    if not token:
        raise RuntimeError("GH_TOKEN is missing.")
    req = Request(
        "https://api.github.com" + path,
        headers={
            "Accept": "application/vnd.github+json",
            "Authorization": f"Bearer {token}",
            "X-GitHub-Api-Version": "2022-11-28",
            "User-Agent": "universal-converter-indexnow",
        },
    )
    with urlopen(req, timeout=30) as response:
        return json.loads(response.read().decode("utf-8"))


def deployment_status_history(repo: str, deployment_id: int) -> list[dict]:
    """Fetch the complete retained status history for one deployment.

    GitHub marks earlier successful Pages deployments as inactive when a newer
    deployment succeeds. That later inactive status does not erase the earlier
    success. GitHub retains previous deployment statuses for 90 days, so a
    baseline outside that window cannot be proven and is handled fail-closed.
    """
    collected: list[dict] = []
    for page in range(1, MAX_STATUS_PAGES + 1):
        page_statuses = gh_api(
            f"/repos/{repo}/deployments/{deployment_id}/statuses"
            f"?per_page=100&page={page}"
        )
        if not isinstance(page_statuses, list):
            raise RuntimeError(
                f"Unexpected deployment-status response for deployment {deployment_id}."
            )
        collected.extend(page_statuses)
        if len(page_statuses) < 100:
            return collected
    raise RuntimeError(
        f"Deployment {deployment_id} has more than {MAX_STATUS_PAGES * 100} "
        "status records; refusing to make a partial success determination."
    )


def latest_deployment_status(statuses: list[dict]) -> dict | None:
    if not statuses:
        return None
    # Select by timestamp and status ID, not response-array order.
    return max(
        statuses,
        key=lambda status: (
            parse_github_time(status.get("created_at", "")),
            int(status.get("id", 0)),
        ),
    )


def deployment_was_successful(repo: str, deployment_id: int) -> bool:
    """Return true if this deployment ever reached success.

    Do not require success to be the latest state: Pages automatically marks
    prior successful, non-production deployments inactive after a newer
    deployment succeeds. The historical success is the evidence that the
    content was actually deployed.
    """
    return any(
        status.get("state") == "success"
        for status in deployment_status_history(repo, deployment_id)
    )


def previous_successful_deployment(
    repo: str, current_deployment: dict
) -> tuple[str, int] | None:
    current_key = deployment_order_key(current_deployment)
    candidates: list[dict] = []

    # Gather all Pages deployments within a conservative pagination ceiling,
    # then compare their actual creation times rather than trusting API order.
    for page in range(1, MAX_DEPLOYMENT_PAGES + 1):
        query = urlencode({"environment": "github-pages", "per_page": 100, "page": page})
        deployments = gh_api(f"/repos/{repo}/deployments?{query}")
        for deployment in deployments:
            if int(deployment.get("id", 0)) == int(current_deployment["id"]):
                continue
            if deployment.get("environment") != "github-pages":
                continue
            if deployment.get("ref") != "main":
                continue
            if not deployment.get("sha"):
                continue
            if deployment_order_key(deployment) < current_key:
                candidates.append(deployment)
        if len(deployments) < 100:
            break
    else:
        raise RuntimeError(
            "Deployment history exceeded the safe scan limit; refusing to guess a baseline."
        )

    # Newest earlier deployment first. Accept any deployment that reached
    # success, even if GitHub later changed its latest state to inactive.
    candidates.sort(key=deployment_order_key, reverse=True)
    for deployment in candidates:
        if deployment_was_successful(repo, int(deployment["id"])):
            return deployment["sha"], int(deployment["id"])
        time.sleep(0.05)
    return None


def wait_for_successful_pages_deployment(
    repo: str, expected_sha: str, expected_ref: str
) -> dict:
    """Wait for the Pages deployment created by the exact main push.

    This uses the push event as the trigger for branch-based Pages, then polls
    GitHub's deployment API until the matching commit has a successful status.
    GitHub may later mark that deployment inactive after a newer deployment
    succeeds, so any historical success status is accepted as proof it was
    deployed. Each run processes its own exact deployed commit; it does not
    skip a deployment merely because a newer one has also succeeded.
    """
    deadline = time.monotonic() + PAGES_DEPLOYMENT_TIMEOUT_SECONDS
    last_state = "no matching deployment record yet"

    while time.monotonic() < deadline:
        matches: list[dict] = []
        for page in range(1, 6):
            query = urlencode({
                "environment": "github-pages", "per_page": 100, "page": page
            })
            deployments = gh_api(f"/repos/{repo}/deployments?{query}")
            for deployment in deployments:
                if (
                    deployment.get("environment") == "github-pages"
                    and deployment.get("ref") == expected_ref
                    and deployment.get("sha") == expected_sha
                ):
                    matches.append(deployment)
            if len(deployments) < 100:
                break

        matches.sort(key=deployment_order_key, reverse=True)
        if matches:
            current = matches[0]
            statuses = deployment_status_history(repo, int(current["id"]))
            latest = latest_deployment_status(statuses)
            if latest is None:
                last_state = f"deployment {current['id']} has no status yet"
            else:
                state = latest.get("state", "unknown")
                last_state = f"deployment {current['id']} latest status is {state}"
                # A later Pages deployment can change this deployment's latest
                # state from success to inactive before this queued workflow
                # run polls it. Historical success is still valid evidence that
                # this exact commit was deployed and must still be processed.
                if any(status.get("state") == "success" for status in statuses):
                    print(
                        "Confirmed this commit reached a successful GitHub Pages "
                        f"deployment: {current['id']} ({expected_sha}); latest status={state}."
                    )
                    return current
                if state in {"failure", "error", "inactive"}:
                    raise RuntimeError(
                        "The matching GitHub Pages deployment has no successful "
                        f"status and ended in state={state}; refusing to submit."
                    )

        time.sleep(PAGES_DEPLOYMENT_POLL_SECONDS)

    raise RuntimeError(
        "Timed out waiting for a successful github-pages deployment for "
        f"{expected_ref} at {expected_sha}. Last observation: {last_state}."
    )


def changed_paths(previous_sha: str, deployed_sha: str):
    # NUL-delimited output safely handles spaces, tabs, and newlines in paths.
    # --no-renames makes renames explicit as a deletion plus an addition.
    output = subprocess.check_output(
        [
            "git", "diff", "--name-status", "-z", "--no-renames",
            previous_sha, deployed_sha, "--",
        ]
    )
    fields = output.decode("utf-8").split("\0")
    added_or_modified: list[str] = []
    deleted: list[str] = []
    index = 0
    while index < len(fields) - 1:
        status = fields[index]
        path = fields[index + 1]
        index += 2
        if not status or not path:
            continue
        if status in {"A", "M", "T"}:
            added_or_modified.append(path)
        elif status == "D":
            deleted.append(path)
    return added_or_modified, deleted


def public_html_url(path_text: str, require_file: bool) -> str | None:
    try:
        relative = PurePosixPath(path_text)
        parts = relative.parts
        if (
            not parts
            or relative.is_absolute()
            or ".." in parts
            or any(part in EXCLUDED_PARTS or part.startswith(".") for part in parts)
        ):
            return None

        lower_name = parts[-1].lower()
        if not lower_name.endswith(".html"):
            return None
        if ".tmp" in lower_name or lower_name.endswith((".bak.html", ".old.html")):
            return None

        if require_file:
            root = Path.cwd().resolve()
            candidate = root
            for part in parts:
                candidate = candidate / part
                if candidate.is_symlink():
                    return None
            resolved = candidate.resolve()
            if not resolved.is_relative_to(root) or not resolved.is_file():
                return None

        encoded_parts = [quote(part, safe="-._~") for part in parts]
        if lower_name == "index.html":
            folder_parts = encoded_parts[:-1]
            route = "/" if not folder_parts else "/".join(["", *folder_parts, ""])
        else:
            route = "/" + "/".join(encoded_parts)
        return SITE_ORIGIN + route
    except (UnicodeEncodeError, ValueError, OSError):
        return None


def write_report(lines: list[str]):
    REPORT_DIR.mkdir(parents=True, exist_ok=True)
    (REPORT_DIR / "summary.txt").write_text(
        "\n".join(lines) + "\n", encoding="utf-8"
    )


def write_urls(filename: str, urls: list[str]):
    REPORT_DIR.mkdir(parents=True, exist_ok=True)
    (REPORT_DIR / filename).write_text(
        "".join(url + "\n" for url in urls), encoding="utf-8"
    )


def retry_delay(error: HTTPError, attempt: int) -> int:
    retry_after = error.headers.get("Retry-After", "") if error.headers else ""
    if retry_after.isdigit():
        return min(max(int(retry_after), 1), 60)
    return min(5 * (2 ** attempt), 30)


def submit(urls: list[str], key: str):
    payload = {
        "host": SITE_HOST,
        "key": key,
        "keyLocation": f"{SITE_ORIGIN}/{key}{KEY_FILE_SUFFIX}",
        "urlList": urls,
    }
    body = json.dumps(payload, ensure_ascii=False).encode("utf-8")
    request = Request(
        INDEXNOW_ENDPOINT,
        data=body,
        headers={"Content-Type": "application/json; charset=utf-8"},
        method="POST",
    )

    for attempt in range(4):
        try:
            with urlopen(request, timeout=60) as response:
                return response.status, response.read().decode("utf-8", "replace")
        except HTTPError as error:
            detail = error.read().decode("utf-8", "replace")
            if error.code in RETRYABLE_HTTP_CODES and attempt < 3:
                delay = retry_delay(error, attempt)
                print(
                    f"IndexNow HTTP {error.code}; retrying in {delay}s "
                    f"(attempt {attempt + 1}/4).",
                    file=sys.stderr,
                )
                time.sleep(delay)
                continue
            raise RuntimeError(
                f"IndexNow returned HTTP {error.code}: {detail}"
            ) from error
        except URLError as error:
            if attempt < 3:
                delay = min(5 * (2 ** attempt), 30)
                print(
                    f"IndexNow network error; retrying in {delay}s "
                    f"(attempt {attempt + 1}/4): {error}",
                    file=sys.stderr,
                )
                time.sleep(delay)
                continue
            raise RuntimeError(f"IndexNow request failed after retries: {error}") from error

    raise RuntimeError("IndexNow submission exhausted its retry loop.")


def main():
    REPORT_DIR.mkdir(parents=True, exist_ok=True)
    repo = os.environ.get("GITHUB_REPOSITORY")
    pushed_sha = os.environ.get("GITHUB_SHA")
    pushed_ref = os.environ.get("GITHUB_REF")
    key = os.environ.get("INDEXNOW_KEY", "").strip()
    if not repo or not pushed_sha or not pushed_ref:
        raise RuntimeError("GitHub repository/commit/ref environment is missing.")
    if pushed_ref != "refs/heads/main":
        write_report([
            "Result: skipped",
            f"Reason: push ref was {pushed_ref!r}, not refs/heads/main.",
        ])
        print("Not a main-branch push; skipped.")
        return
    if not key:
        raise RuntimeError("INDEXNOW_KEY secret is missing.")
    if not (8 <= len(key) <= 128) or any(
        c not in "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-"
        for c in key
    ):
        raise RuntimeError("INDEXNOW_KEY does not match the IndexNow key format.")

    # Branch-based GitHub Pages deployments are created after the main push.
    # Wait for the deployment for this exact commit before calculating changes.
    current = wait_for_successful_pages_deployment(repo, pushed_sha, "main")
    deployed_sha = current["sha"]
    deployment_id = int(current["id"])

    # Process this exact successful deployment, even if newer commits have
    # already deployed. This preserves a separate diff for every deployed
    # revision and avoids losing intermediate changes when runs are queued.
    previous = previous_successful_deployment(repo, current)
    if previous is None:
        write_report([
            "Result: skipped safely",
            f"Current deployment: {deployment_id} ({deployed_sha})",
            "Reason: no earlier successful main/github-pages deployment was found.",
            "No full-site submission was attempted.",
        ])
        print("No previous successful production deployment found; fail-closed skip.")
        return

    previous_sha, previous_id = previous
    # The full-history checkout should contain both commits. Fail closed if it
    # does not; never substitute the current branch tip or the whole site.
    subprocess.check_call(["git", "cat-file", "-e", f"{previous_sha}^{{commit}}"])

    changed, deleted = changed_paths(previous_sha, deployed_sha)
    changed_urls = sorted({
        url for path in changed
        if (url := public_html_url(path, require_file=True))
    })
    deleted_urls = sorted({
        url for path in deleted
        if (url := public_html_url(path, require_file=False))
    })

    selected = changed_urls[:MAX_URLS]
    overflow = changed_urls[MAX_URLS:]
    write_urls("submitted-candidates.txt", selected)
    write_urls("not-submitted-over-limit.txt", overflow)
    write_urls("deleted-report-only.txt", deleted_urls)

    summary = [
        "Result: preparing live IndexNow submission",
        f"Site: {SITE_ORIGIN}",
        f"Current deployment: {deployment_id} ({deployed_sha})",
        f"Current deployment created at: {current['created_at']}",
        f"Previous successful deployment: {previous_id} ({previous_sha})",
        f"Changed/added public HTML URLs found: {len(changed_urls)}",
        f"URLs selected for submission (limit {MAX_URLS}): {len(selected)}",
        f"Changed URLs over the limit (not submitted): {len(overflow)}",
        f"Deleted URLs (report only, not submitted): {len(deleted_urls)}",
    ]

    if not selected:
        summary[0] = "Result: no changed public HTML pages; nothing submitted"
        write_report(summary)
        print("\n".join(summary))
        return

    http_status, response_body = submit(selected, key)
    if http_status == 200:
        summary[0] = "Result: submitted successfully (IndexNow HTTP 200)"
    elif http_status == 202:
        summary[0] = "Result: received; IndexNow key validation pending (HTTP 202)"
    else:
        raise RuntimeError(f"Unexpected IndexNow HTTP status: {http_status}")

    summary.append(
        "Note: IndexNow receipt does not guarantee crawling or indexing."
    )
    if response_body.strip():
        summary.append(f"Response body: {response_body.strip()[:1000]}")
    write_report(summary)
    print("\n".join(summary))
    if overflow:
        print(
            "WARNING: URLs beyond the 1,000-URL cap are in the report artifact, "
            "not submitted.",
            file=sys.stderr,
        )


if __name__ == "__main__":
    try:
        main()
    except Exception as exc:
        REPORT_DIR.mkdir(parents=True, exist_ok=True)
        (REPORT_DIR / "error.txt").write_text(
            f"{type(exc).__name__}: {exc}\n", encoding="utf-8"
        )
        print(f"ERROR: {exc}", file=sys.stderr)
        sys.exit(1)

#!/usr/bin/env python3
"""Safety checks used by the exchange-rate workflow so rate data can only ever reach the `data` branch.

    python3 scripts/rates_publish_guard.py pages  < pages-api-response.json   (or --unreadable)
    git diff --cached --name-only | python3 scripts/rates_publish_guard.py staged
    git push --porcelain ...      | python3 scripts/rates_publish_guard.py push

Exit code 0 = safe, 1 = unsafe (the message says why).
"""
import json
import sys

DATA_BRANCH = "data"
ALLOWED_FILES = {"rates.json"}


def pages_source_safe(payload):
    """GitHub Pages must never be built from the data branch."""
    if not isinstance(payload, dict):
        return False, "could not read the repository's GitHub Pages settings (fail closed)"
    build_type = payload.get("build_type")
    branch = (payload.get("source") or {}).get("branch")
    if build_type == "workflow":
        return True, "Pages is deployed by a workflow (this workflow has no Pages permissions and no push trigger)"
    if build_type == "legacy" and branch and branch != DATA_BRANCH:
        return True, f"Pages is built from branch '{branch}', not '{DATA_BRANCH}'"
    return False, f"Pages source is unsafe or unknown (build_type={build_type!r}, branch={branch!r})"


def staged_files_safe(names):
    names = {n.strip() for n in names if n.strip()}
    if not names:
        return True, "nothing staged"
    if names <= ALLOWED_FILES:
        return True, f"staged: {sorted(names)}"
    return False, f"refusing to publish: staged files {sorted(names)} are not exactly {sorted(ALLOWED_FILES)}"


def push_output_safe(porcelain):
    """Every ref updated by `git push --porcelain` must be refs/heads/data."""
    refs = []
    for line in porcelain.splitlines():
        parts = line.split("\t")
        if len(parts) >= 2 and ":" in parts[1]:
            refs.append(parts[1].split(":", 1)[1])
    if refs and all(r == f"refs/heads/{DATA_BRANCH}" for r in refs):
        return True, f"pushed refs: {refs}"
    return False, f"refusing: push touched {refs or 'no recognisable refs'}; only refs/heads/{DATA_BRANCH} is allowed"


def main(argv):
    mode = argv[1] if len(argv) > 1 else ""
    if mode == "pages":
        payload = None
        if "--unreadable" not in argv:
            try:
                payload = json.loads(sys.stdin.read())
            except ValueError:
                payload = None
        ok, why = pages_source_safe(payload)
    elif mode == "staged":
        ok, why = staged_files_safe(sys.stdin.read().splitlines())
    elif mode == "push":
        ok, why = push_output_safe(sys.stdin.read())
    else:
        print(__doc__)
        return 1
    print(("OK: " if ok else "UNSAFE: ") + why)
    return 0 if ok else 1


if __name__ == "__main__":
    sys.exit(main(sys.argv))

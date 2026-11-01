#!/usr/bin/env bash
# Publishes <data-dir>/rates.json to the `data` branch ONLY (never main), with independent guards:
#   1. the working copy must be on the `data` branch
#   2. only rates.json may be staged
#   3. the push is explicitly HEAD:refs/heads/data and every ref it touches is checked
#   4. the remote `main` SHA must be identical before and after
# usage: scripts/publish_rates.sh <data-dir> [observation-date]
# optional env: GIT_AUTH_HEADER (e.g. "AUTHORIZATION: basic ...") for HTTPS pushes
set -euo pipefail
DATA_DIR=${1:?usage: publish_rates.sh <data-dir> [observation-date]}
OBSERVED=${2:-unknown}
GUARD="$(cd "$(dirname "$0")" && pwd)/rates_publish_guard.py"
PYTHON_BIN=${PYTHON_BIN:-python3}
cd "$DATA_DIR"

[ "$(git symbolic-ref --short HEAD)" = "data" ] || { echo "UNSAFE: not on the data branch" >&2; exit 1; }
git add rates.json
git diff --cached --name-only | "$PYTHON_BIN" "$GUARD" staged
if git diff --cached --quiet; then echo "nothing to publish"; exit 0; fi

GIT=(git)
if [ -n "${GIT_AUTH_HEADER:-}" ]; then GIT=(git -c "http.extraheader=${GIT_AUTH_HEADER}"); fi

MAIN_BEFORE=$("${GIT[@]}" ls-remote origin refs/heads/main | cut -f1)
git -c user.name="github-actions[bot]" -c user.email="41898282+github-actions[bot]@users.noreply.github.com" \
    commit -q -m "rates: provider observation ${OBSERVED} [skip ci]"
OUT=$("${GIT[@]}" push --porcelain origin HEAD:refs/heads/data 2>&1) || { echo "$OUT" >&2; exit 1; }
echo "$OUT"
echo "$OUT" | "$PYTHON_BIN" "$GUARD" push
MAIN_AFTER=$("${GIT[@]}" ls-remote origin refs/heads/main | cut -f1)
if [ "$MAIN_BEFORE" != "$MAIN_AFTER" ]; then echo "UNSAFE: remote main changed (${MAIN_BEFORE} -> ${MAIN_AFTER})" >&2; exit 1; fi
echo "OK: published to data only; main unchanged at ${MAIN_AFTER:-<none>}"

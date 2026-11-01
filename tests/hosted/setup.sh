#!/usr/bin/env bash
# Sets up a folder to run the hosted test suites in, in one go:
#   tests/hosted/setup.sh /path/to/folder        (default: ./hosted-run, created if missing)
#   cd /path/to/folder && python3 run.py          (or any other suite)
# Rerun it after `python3 tools/build.py` to refresh the app in the folder. Needs python3 with Playwright and npm;
# if Chromium isn't found, set PLAYWRIGHT_BROWSERS_PATH (e.g. /opt/pw-browsers).
set -euo pipefail
here="$(cd "$(dirname "$0")" && pwd)"
repo="$(cd "$here/../.." && pwd)"
out="${1:-hosted-run}"
mkdir -p "$out"
out="$(cd "$out" && pwd)"
# the app, with the Supabase library swapped for the mock (config.js can stay: the mock ignores it)
rm -rf "$out/site" && cp -r "$repo/docs" "$out/site"
cp "$here/mock-supabase.js" "$out/site/supabase.js"
# the suites, their helpers and the sample backup sit next to site/
cp "$here"/*.py "$here/mock-supabase.js" "$here/routine-export.zip" "$out/"
# jszip for the backup tests, installed into this folder (its own package.json stops npm using a parent folder's)
if [ ! -f "$out/node_modules/jszip/dist/jszip.min.js" ]; then
  [ -f "$out/package.json" ] || echo '{"private":true}' > "$out/package.json"
  (cd "$out" && npm i jszip --silent --no-audit --no-fund >/dev/null)
fi
echo "Ready: cd \"$out\" && python3 run.py"

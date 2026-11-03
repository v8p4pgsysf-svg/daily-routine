#!/usr/bin/env bash
# Runs every test in one go and prints one line per suite, so a session doesn't have to run them one by one.
#   tests/run-all.sh                  app suite + all hosted suites (about 6–8 minutes)
#   tests/run-all.sh --quick          app suite + run.py only (about 2 minutes)
#   tests/run-all.sh --sweeps         also the screenshot sweeps (layout-review, screens-sweep)
# Rebuilds the app first (tools/build.py), so the hosted suites never test an old build.
# Needs node, python3 with Playwright and npm; jsdom and jszip are installed into the work folder on first use.
# Work folder: $RUN_DIR, or a temp folder. Logs for each suite are kept there (<suite>.log).
set -uo pipefail
here="$(cd "$(dirname "$0")" && pwd)"; repo="$(cd "$here/.." && pwd)"
work="${RUN_DIR:-${TMPDIR:-/tmp}/routine-tests}"; mkdir -p "$work"
export PLAYWRIGHT_BROWSERS_PATH="${PLAYWRIGHT_BROWSERS_PATH:-/opt/pw-browsers}"
quick=0; sweeps=0
for a in "$@"; do case "$a" in --quick) quick=1;; --sweeps) sweeps=1;; esac; done
fail=0
line(){ printf '%-20s %s\n' "$1" "$2"; }

python3 "$repo/tools/build.py" >/dev/null || { echo "build failed"; exit 1; }

# app suite (jsdom)
if [ ! -d "$work/jsd/node_modules/jsdom" ]; then
  mkdir -p "$work/jsd" && (cd "$work/jsd" && echo '{"private":true}' > package.json && npm i jsdom --silent --no-audit --no-fund >/dev/null)
fi
timeout 300 env NODE_PATH="$work/jsd/node_modules" node "$repo/tests/app.test.js" "$repo/src/weekly-routine.html" > "$work/app.log" 2>&1; rc=$?
p=$(grep -c '^PASS' "$work/app.log"); f=$(grep -c '^FAIL' "$work/app.log")
if [ $rc -eq 0 ] && [ "$f" -eq 0 ]; then line app "ok ($p checks)"; else line app "FAILED ($f failed, exit $rc): see $work/app.log"; fail=1; fi

# hosted suites (Playwright against the mock Supabase)
"$here/hosted/setup.sh" "$work/hosted" >/dev/null || { echo "hosted setup failed"; exit 1; }
suites="run"
[ $quick -eq 0 ] && suites="run photo-encryption feedback forgot-password home-screen review-photos settings-workouts share-card"
[ $sweeps -eq 1 ] && suites="$suites layout-review screens-sweep"
for s in $suites; do
  (cd "$work/hosted" && timeout 300 python3 "$s.py" > "$s.log" 2>&1); rc=$?
  last=$(tail -1 "$work/hosted/$s.log" | cut -c1-60); f=$(grep -c '^FAIL' "$work/hosted/$s.log")
  if [ $rc -eq 0 ] && [ "$f" -eq 0 ]; then line "$s" "ok ($last)"
  elif [ $rc -eq 124 ]; then line "$s" "TIMED OUT: see $work/hosted/$s.log"; fail=1
  else line "$s" "FAILED ($f failed, exit $rc): see $work/hosted/$s.log"; fail=1; fi
done
[ $fail -eq 0 ] && echo "ALL CLEAN" || echo "NOT CLEAN"
exit $fail

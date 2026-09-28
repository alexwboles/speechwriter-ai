#!/usr/bin/env bash
# SpeechWriter AI smoke tests — 12 checks. Exit non-zero on first failure.
set -u
cd "$(dirname "$0")/.."
pass=0; fail=0
check() { # $1 = description, rest = command
  local desc="$1"; shift
  if "$@" >/dev/null 2>&1; then echo "PASS: $desc"; pass=$((pass+1));
  else echo "FAIL: $desc"; fail=$((fail+1)); fi
}

check "index.html exists" test -f index.html
check "css/style.css exists" test -f css/style.css
check "js/speechbank.js exists" test -f js/speechbank.js
check "js/logic.js exists" test -f js/logic.js
check "js/app.js exists" test -f js/app.js
check "speechbank.js syntax valid" node --check js/speechbank.js
check "logic.js syntax valid" node --check js/logic.js
check "app.js syntax valid" node --check js/app.js
check "5 occasions in bank" node -e "const b=require('./js/speechbank.js'); if(Object.keys(b.OCCASIONS).length!==5) throw new Error('count')"
check "every tone has openings and closings" node -e "
  const b=require('./js/speechbank.js');
  for (const [k,v] of Object.entries(b.OCCASIONS))
    for (const t of v.tones) {
      if(!v.openings[t]||!v.openings[t].length) throw new Error(k+'/'+t+' no openings');
      if(!v.closings[t]||!v.closings[t].length) throw new Error(k+'/'+t+' no closings');
    }"
check "eulogy excludes funny tone" node -e "
  const b=require('./js/speechbank.js');
  if(b.OCCASIONS.eulogy.tones.includes('funny')) throw new Error('eulogy has funny')"
check "every occasion has 3 beats + tips + toasts" node -e "
  const b=require('./js/speechbank.js');
  for (const [k,v] of Object.entries(b.OCCASIONS)) {
    if(v.beats.length!==3) throw new Error(k+' beats');
    if(!v.tips.length||!v.toasts.length) throw new Error(k+' tips/toasts');
  }"

echo "--- smoke: $pass passed, $fail failed ---"
exit $((fail>0))

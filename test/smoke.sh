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

check "lengthGuidance flags over-limit drafts" node -e "
  const L=require('./js/logic.js');
  const ok=L.lengthGuidance('wedding',400);
  if(ok.over||ok.limit!==650) throw new Error('under: '+JSON.stringify(ok));
  const over=L.lengthGuidance('graduation',500);
  if(!over.over||over.overBy!==110||over.limit!==390) throw new Error('over: '+JSON.stringify(over));"
check "sectionMinutes covers 6 sections, sums to speech words" node -e "
  const L=require('./js/logic.js'); const B=require('./js/speechbank.js');
  const s=L.buildSpeech({occasion:'birthday',name:'Sam',relationship:'friend',tone:'funny',stories:['aaa bbb','ccc ddd eee','fff'],variant:0},B);
  const secs=L.sectionMinutes(s);
  if(secs.length!==6) throw new Error('sections='+secs.length);
  const expect=L.wordCount(s.opening+' '+s.closing+' '+s.toast+' '+s.beats.map(b=>b.text).join(' '));
  const sum=secs.reduce((a,x)=>a+x.words,0);
  if(sum!==expect) throw new Error('sum='+sum+' expect='+expect);"
check "speechToMarkdown has all sections" node -e "
  const L=require('./js/logic.js'); const B=require('./js/speechbank.js');
  const s=L.buildSpeech({occasion:'retirement',name:'Jo',relationship:'colleague',tone:'formal',stories:['x','y','z'],variant:0},B);
  const md=L.speechToMarkdown(s);
  for(const h of ['# Retirement','## Opening','## Story 1','## Story 3','## Closing','## Toast']) if(!md.includes(h)) throw new Error('missing '+h);
  if(!md.includes('Jo')) throw new Error('name missing');"
for id in mdBtn cueBtn cueSheet cueCards printCueBtn closeCueBtn savedSearch timingBox lengthWarn; do
  check "index.html has #$id" grep -q "id=\"$id\"" index.html
done
for fn in lengthGuidance sectionMinutes speechToMarkdown renderCueCards downloadText; do
  check "app.js uses $fn" grep -q "$fn" js/app.js
done

echo "--- smoke: $pass passed, $fail failed ---"
exit $((fail>0))

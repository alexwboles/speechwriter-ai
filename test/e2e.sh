#!/usr/bin/env bash
# SpeechWriter AI e2e tests — 8 flows exercising real logic in Node. Exit non-zero on failure.
set -u
cd "$(dirname "$0")/.."
pass=0; fail=0
flow() { # $1 = description, $2 = node script
  if node -e "$2" >/dev/null 2>&1; then echo "PASS: $1"; pass=$((pass+1));
  else echo "FAIL: $1"; fail=$((fail+1)); fi
}

flow "wedding draft fills name, relationship, partner" "
  const L=require('./js/logic.js'); const B=require('./js/speechbank.js');
  const s=L.buildSpeech({occasion:'wedding',name:'Maya',relationship:'sister',tone:'heartfelt',partner:'Jordan',stories:['a','b','c'],variant:0},B);
  if(!s.opening.includes('Maya')) throw new Error('name missing: '+s.opening);
  if(!s.toast.includes('Jordan')) throw new Error('partner missing: '+s.toast);
  if(s.beats.length!==3) throw new Error('beats');
"

flow "funny tone rejected for eulogy, falls back to heartfelt" "
  const L=require('./js/logic.js'); const B=require('./js/speechbank.js');
  const errs=L.validateInput({occasion:'eulogy',tone:'funny',name:'Pat'},B);
  if(!errs.length) throw new Error('expected validation error');
  const s=L.buildSpeech({occasion:'eulogy',name:'Pat',relationship:'friend',tone:'funny',stories:['','',''],variant:0},B);
  if(s.tone!=='heartfelt') throw new Error('tone='+s.tone);
"

flow "variant 1 differs from variant 0 (opening or closing)" "
  const L=require('./js/logic.js'); const B=require('./js/speechbank.js');
  const mk=v=>L.buildSpeech({occasion:'birthday',name:'Sam',relationship:'friend',tone:'funny',stories:['','',''],variant:v},B);
  const a=mk(0), b=mk(1);
  if(a.opening===b.opening && a.closing===b.closing) throw new Error('variants identical');
"

flow "word count and timing estimate are sane" "
  const L=require('./js/logic.js'); const B=require('./js/speechbank.js');
  const s=L.buildSpeech({occasion:'graduation',name:'Alex',relationship:'parent',tone:'formal',stories:['one two','three four five','six'],variant:0},B);
  const text=L.renderText(s); const wc=L.wordCount(text);
  if(wc<40) throw new Error('too few words: '+wc);
  const est=L.estimateMinutes(wc);
  if(Math.abs(est.minutes - wc/130) > 0.001) throw new Error('timing math');
"

flow "renderText includes all beats and toast" "
  const L=require('./js/logic.js'); const B=require('./js/speechbank.js');
  const s=L.buildSpeech({occasion:'retirement',name:'Jo',relationship:'colleague',tone:'heartfelt',stories:['x','y','z'],variant:0},B);
  const t=L.renderText(s);
  if(!t.includes('[1]')||!t.includes('[3]')) throw new Error('beats missing');
  if(!t.includes(s.toast)) throw new Error('toast missing');
"

flow "validation catches missing name and bad occasion" "
  const L=require('./js/logic.js'); const B=require('./js/speechbank.js');
  const e1=L.validateInput({occasion:'wedding',tone:'funny',name:'  '},B);
  if(!e1.some(e=>/name/i.test(e))) throw new Error('name not caught');
  const e2=L.validateInput({occasion:'nope',tone:'funny',name:'Bo'},B);
  if(!e2.some(e=>/occasion/i.test(e))) throw new Error('occasion not caught');
"

flow "practice checklist has 6 base items, eulogy adds support item" "
  const L=require('./js/logic.js');
  const base=L.practiceChecklist('birthday');
  const eu=L.practiceChecklist('eulogy');
  if(base.length!==6) throw new Error('base='+base.length);
  if(eu.length!==7) throw new Error('eulogy='+eu.length);
  if(!eu.some(i=>i.id==='support')) throw new Error('no support item');
"

flow "relNoun maps common relationships with articles" "
  const L=require('./js/logic.js');
  if(L.relNoun('sister')!=='a sister') throw new Error('sister');
  if(L.relNoun('best friend')!=='a best friend') throw new Error('best friend');
  if(!L.fill('I am {relNoun} of {name}.',{relNoun:'a brother',name:'Kim'}).includes('a brother of Kim')) throw new Error('fill');
"

echo "--- e2e: $pass passed, $fail failed ---"
exit $((fail>0))

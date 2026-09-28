# 🎤 SpeechWriter AI

**Write a toast they'll remember — in 15 minutes.** Pick the occasion, your relationship, and a tone → SpeechWriter AI drafts a structured speech (opening, 3 story beats with prompts, closing, toast line), estimates delivery time, and gives you a practice checklist. All running 100% locally in your browser.

## The problem

Everyone dreads the wedding toast, the retirement speech, the eulogy. Blank-page panic produces speeches that are too long, too generic, or read straight off a phone. SpeechWriter AI gives you a proven structure — you supply the stories, it supplies the shape:

1. **5 occasions** — wedding, birthday, retirement, graduation, eulogy (eulogies get a respectful tone set: no jokes bank)
2. **3 tones** — heartfelt, funny, formal, with occasion-appropriate openings and closings
3. **3 story-beat prompts** — specific questions with hints, because one concrete memory beats a biography
4. **Toast lines** — a clean closer for raising the glass
5. **Timing estimate** — word count → spoken minutes at ~130 wpm, so you don't run long
6. **Practice checklist** — write it out, read aloud 3×, cut 10%, cue cards… with progress saved
7. **Optional AI polish** — paste your own OpenAI API key for a rewrite in your voice (never required)

## How to run

No build step, no server, no account. Just open `index.html` in any browser — or serve it statically:

```bash
npx serve .        # or: python3 -m http.server 8080
```

Your drafts and checklist live in `localStorage` (`speechwriter.speeches.v1`, `speechwriter.checks.v1`). Nothing ever leaves your device. If you use the optional AI polish, your key is sent only to OpenAI's API, directly from your browser.

## How speeches are built

Each occasion has a template bank (`js/speechbank.js`) with openings/closings per tone and 3 story-beat prompts. `buildSpeech()` in `js/logic.js` fills `{name}`, `{rel}`, and `{partner}` placeholders, slots in your stories, and picks a variant (the 🎲 button tries another opening/closing pair). Pure functions — fully testable in Node.

## Tests

```bash
bash test/smoke.sh   # static + logic checks
bash test/e2e.sh     # end-to-end speech-building flows
```

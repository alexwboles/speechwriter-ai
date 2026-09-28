/* SpeechWriter AI — core logic: template filling, speech assembly,
   word counts, timing estimates, practice checklists. Pure functions. */
"use strict";

/** Fill {name}, {rel}, {relNoun}, {partner} placeholders. */
function fill(template, vars) {
  return String(template).replace(/\{(\w+)\}/g, (_, k) =>
    vars[k] != null && vars[k] !== "" ? vars[k] : "{" + k + "}");
}

function relNoun(rel) {
  const map = {
    friend: "a friend", "best friend": "a best friend", sibling: "a sibling",
    brother: "a brother", sister: "a sister", parent: "a parent",
    mother: "a mother", father: "a father", child: "a child",
    son: "a son", daughter: "a daughter", partner: "a partner",
    spouse: "a spouse", colleague: "a colleague", mentor: "a mentor", cousin: "a cousin"
  };
  return map[rel] || "a " + rel;
}

/** Validate builder inputs; returns array of error strings (empty = ok). */
function validateInput(input, bank) {
  const errs = [];
  const occ = bank.OCCASIONS[input.occasion];
  if (!occ) errs.push("Pick an occasion.");
  if (occ && !occ.tones.includes(input.tone)) errs.push("That tone isn't available for this occasion.");
  if (!input.name || !input.name.trim()) errs.push("Enter the honoree's name.");
  return errs;
}

/**
 * Assemble a structured speech draft.
 * input: {occasion, name, relationship, tone, partner, stories:[s1,s2,s3], variant}
 * Returns {opening, beats:[{prompt,text}], closing, toast, tips}.
 */
function buildSpeech(input, bank) {
  const occ = bank.OCCASIONS[input.occasion];
  const tone = occ.tones.includes(input.tone) ? input.tone : occ.tones[0];
  const v = Number.isInteger(input.variant) ? input.variant : 0;
  const vars = {
    name: input.name.trim(),
    rel: input.relationship || "friend",
    relNoun: relNoun(input.relationship || "friend"),
    partner: (input.partner || "").trim() || "their partner"
  };
  const pick = arr => arr[v % arr.length];
  const beats = occ.beats.map((b, i) => ({
    prompt: b.prompt,
    hint: b.hint,
    text: (input.stories && input.stories[i] || "").trim()
  }));
  return {
    occasion: input.occasion,
    tone,
    opening: fill(pick(occ.openings[tone]), vars),
    beats,
    closing: fill(pick(occ.closings[tone]), vars),
    toast: fill(pick(occ.toasts), vars),
    tips: occ.tips.slice()
  };
}

/** Full plain-text rendering of a built speech (for copy + word count). */
function renderText(speech) {
  const parts = [speech.opening, ""];
  speech.beats.forEach((b, i) => {
    parts.push("[" + (i + 1) + "] " + b.prompt);
    parts.push(b.text || "(add your story here)");
    parts.push("");
  });
  parts.push(speech.closing, "", speech.toast);
  return parts.join("\n");
}

function wordCount(text) {
  const w = String(text).trim().split(/\s+/).filter(Boolean);
  return w.length === 1 && w[0] === "" ? 0 : w.length;
}

/** ~130 spoken words per minute; returns {minutes, words, rangeLabel}. */
function estimateMinutes(words) {
  const mins = words / 130;
  return { minutes: mins, words, rangeLabel: mins < 2 ? "under 2 min" : "about " + Math.round(mins) + " min" };
}

/** Generic practice checklist, with occasion-specific extras. */
function practiceChecklist(occasion) {
  const base = [
    { id: "write", text: "Write the full draft out — don't wing any section" },
    { id: "read3", text: "Read it aloud 3 times, timing yourself" },
    { id: "cut", text: "Cut 10%: remove your weakest story or line" },
    { id: "cards", text: "Transfer to cue cards (one beat per card)" },
    { id: "audience", text: "Rehearse once in front of a trusted person" },
    { id: "breathe", text: "Mark 2 pause spots — silence beats rushing" }
  ];
  if (occasion === "eulogy") base.push({ id: "support", text: "Ask someone to stand nearby in case you need support" });
  if (occasion === "wedding") base.push({ id: "mic", text: "Check mic/AV with the DJ or planner beforehand" });
  return base;
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = { fill, relNoun, validateInput, buildSpeech, renderText, wordCount, estimateMinutes, practiceChecklist };
}

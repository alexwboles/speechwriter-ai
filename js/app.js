/* SpeechWriter AI — DOM glue. Bank + logic are loaded globally. */
(function () {
  "use strict";
  const $ = id => document.getElementById(id);
  const LS_SPEECHES = "speechwriter.speeches.v1";
  const LS_CHECKS = "speechwriter.checks.v1";
  let currentSpeech = null;
  let currentText = "";

  function loadJSON(k, fb) { try { return JSON.parse(localStorage.getItem(k)) ?? fb; } catch { return fb; } }
  function saveJSON(k, v) { localStorage.setItem(k, JSON.stringify(v)); }

  function initSelectors() {
    const occ = $("occasion");
    Object.entries(OCCASIONS).forEach(([k, v]) => {
      const o = document.createElement("option"); o.value = k; o.textContent = v.label; occ.appendChild(o);
    });
    const rel = $("relationship");
    RELATIONSHIPS.forEach(r => {
      const o = document.createElement("option"); o.value = r;
      o.textContent = r[0].toUpperCase() + r.slice(1); rel.appendChild(o);
    });
    refreshTones(); refreshPrompts(); refreshTips();
    occ.addEventListener("change", () => { refreshTones(); refreshPrompts(); refreshTips(); renderChecklist(); });
  }

  function refreshTones() {
    const t = $("tone"); t.innerHTML = "";
    OCCASIONS[$("occasion").value].tones.forEach(k => {
      const o = document.createElement("option"); o.value = k; o.textContent = TONES[k]; t.appendChild(o);
    });
    $("partnerWrap").style.display = $("occasion").value === "wedding" ? "" : "none";
  }

  function refreshPrompts() {
    const box = $("storyPrompts"); box.innerHTML = "<h3>Your 3 story beats</h3>";
    OCCASIONS[$("occasion").value].beats.forEach((b, i) => {
      const lab = document.createElement("label");
      lab.innerHTML = "<strong>" + (i + 1) + ". " + b.prompt + "</strong><span class='muted'>" + b.hint + "</span>";
      const ta = document.createElement("textarea");
      ta.id = "story" + i; ta.rows = 2; ta.placeholder = "A sentence or two — specific beats general.";
      lab.appendChild(ta); box.appendChild(lab);
    });
  }

  function refreshTips() {
    $("tipsList").innerHTML = OCCASIONS[$("occasion").value].tips.map(t => "<li>" + t + "</li>").join("");
  }

  function draft(variant) {
    const input = {
      occasion: $("occasion").value,
      relationship: $("relationship").value,
      tone: $("tone").value,
      name: $("name").value,
      partner: $("partner").value,
      stories: [0, 1, 2].map(i => $("story" + i).value),
      variant: variant == null ? Math.floor(Math.random() * 2) : variant
    };
    const errs = validateInput(input, { OCCASIONS });
    $("formErrors").textContent = errs.join(" ");
    if (errs.length) return;
    currentSpeech = buildSpeech(input, { OCCASIONS });
    currentText = renderText(currentSpeech);
    const wc = wordCount(currentText), est = estimateMinutes(wc);
    $("outOpening").textContent = currentSpeech.opening;
    $("outBeats").innerHTML = currentSpeech.beats.map((b, i) =>
      "<p class='part-label'>Story " + (i + 1) + " — " + b.prompt + "</p><p>" +
      (b.text ? escapeHtml(b.text) : "<span class='muted'>(add your story here)</span>") + "</p>").join("");
    $("outClosing").textContent = currentSpeech.closing;
    $("outToast").textContent = currentSpeech.toast;
    $("metaLine").textContent = "· " + wc + " words · " + est.rangeLabel + " spoken";
    $("result").classList.remove("hidden");
    $("result").scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  }

  function renderChecklist() {
    const done = loadJSON(LS_CHECKS, {});
    const items = practiceChecklist($("occasion").value);
    $("checkList").innerHTML = items.map(it =>
      "<li><label><input type='checkbox' data-id='" + it.id + "'" + (done[it.id] ? " checked" : "") + "> " + it.text + "</label></li>").join("");
    const n = items.filter(it => done[it.id]).length;
    $("checkProgress").textContent = n + " of " + items.length + " complete";
    $("checkList").querySelectorAll("input").forEach(cb =>
      cb.addEventListener("change", () => {
        const d = loadJSON(LS_CHECKS, {}); d[cb.dataset.id] = cb.checked; saveJSON(LS_CHECKS, d); renderChecklist();
      }));
  }

  function renderSaved() {
    const all = loadJSON(LS_SPEECHES, []);
    $("savedList").innerHTML = all.length ? all.map((s, i) =>
      "<li><strong>" + escapeHtml(s.name) + "</strong> <span class='muted'>" +
      (OCCASIONS[s.occasion] ? OCCASIONS[s.occasion].label : s.occasion) + " · " + s.words + " words</span> " +
      "<button data-load='" + i + "'>Load</button> <button data-del='" + i + "'>✕</button></li>").join("")
      : "<li class='muted'>No saved speeches yet.</li>";
    $("savedList").querySelectorAll("[data-del]").forEach(b => b.addEventListener("click", () => {
      const a = loadJSON(LS_SPEECHES, []); a.splice(+b.dataset.del, 1); saveJSON(LS_SPEECHES, a); renderSaved();
    }));
    $("savedList").querySelectorAll("[data-load]").forEach(b => b.addEventListener("click", () => {
      const s = loadJSON(LS_SPEECHES, [])[+b.dataset.load];
      if (!s) return;
      $("occasion").value = s.occasion; refreshTones(); refreshPrompts(); refreshTips();
      $("tone").value = s.tone; $("name").value = s.name;
      (s.stories || []).forEach((t, i) => { if ($("story" + i)) $("story" + i).value = t; });
      draft(s.variant);
    }));
  }

  document.addEventListener("DOMContentLoaded", () => {
    initSelectors(); renderChecklist(); renderSaved();
    $("draftBtn").addEventListener("click", () => draft());
    $("shuffleBtn").addEventListener("click", () => draft());
    $("copyBtn").addEventListener("click", async () => {
      try { await navigator.clipboard.writeText(currentText); $("copyMsg").textContent = "Copied!"; }
      catch { $("copyMsg").textContent = "Copy blocked by browser — select the text manually."; }
    });
    $("saveBtn").addEventListener("click", () => {
      if (!currentSpeech) return;
      const all = loadJSON(LS_SPEECHES, []);
      all.unshift({
        occasion: currentSpeech.occasion, tone: currentSpeech.tone, name: $("name").value.trim(),
        stories: [0, 1, 2].map(i => $("story" + i).value), variant: 0,
        words: wordCount(currentText), savedAt: new Date().toISOString().slice(0, 10)
      });
      saveJSON(LS_SPEECHES, all.slice(0, 20)); renderSaved();
      $("copyMsg").textContent = "Saved.";
    });
    $("polishBtn").addEventListener("click", async () => {
      const key = $("apiKey").value.trim();
      if (!key) { $("aiMsg").textContent = "Paste your OpenAI API key first (optional)."; return; }
      if (!currentText) { $("aiMsg").textContent = "Draft a speech first."; return; }
      $("aiMsg").textContent = "Polishing…";
      try {
        const r = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: { "Content-Type": "application/json", "Authorization": "Bearer " + key },
          body: JSON.stringify({ model: "gpt-4o-mini", messages: [
            { role: "system", content: "Rewrite this speech draft keeping its structure (opening, 3 story beats, closing, toast). Keep it warm and natural, same approximate length." },
            { role: "user", content: currentText }
          ]})
        });
        const j = await r.json();
        const out = j.choices && j.choices[0] && j.choices[0].message.content;
        $("aiMsg").textContent = out ? "Polished version (not saved — copy what you like):\n\n" + out : "The API didn't return text. Your draft is unchanged.";
      } catch { $("aiMsg").textContent = "Couldn't reach the API. Your draft is unchanged."; }
    });
  });
})();

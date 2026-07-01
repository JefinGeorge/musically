'use strict';

var chunkCD2SD4KN_cjs = require('./chunk-CD2SD4KN.cjs');
var lit = require('lit');
var decorators_js = require('lit/decorators.js');
var unsafeHtml_js = require('lit/directives/unsafe-html.js');

exports.ChordDiagram = class ChordDiagram extends lit.LitElement {
  constructor() {
    super(...arguments);
    this.chord = "";
    this.instrument = "piano";
    this.diagramOnly = false;
  }
  themeOptions() {
    const cs = getComputedStyle(this);
    const get = (name, fallback) => cs.getPropertyValue(name).trim() || fallback;
    return {
      accent: get("--musically-accent", "#1d4ed8"),
      root: get("--musically-root", "#1e3a8a"),
      paper: get("--musically-paper", "#fffdf8")
    };
  }
  render() {
    if (!this.chord) return lit.nothing;
    const diagram = chunkCD2SD4KN_cjs.getDiagramSVG(this.chord, this.instrument, this.themeOptions());
    return lit.html`
      <div class="card">
        ${this.diagramOnly ? lit.nothing : lit.html`<div class="name">${this.chord}</div>`}
        ${unsafeHtml_js.unsafeHTML(diagram)}
        ${this.diagramOnly ? lit.nothing : lit.html`<div class="notes">${chunkCD2SD4KN_cjs.chordNotes(this.chord).join(" \xB7 ")}</div>`}
      </div>
    `;
  }
};
exports.ChordDiagram.styles = lit.css`
    :host {
      display: inline-block;
      font-family: var(--musically-font, ui-sans-serif, system-ui, sans-serif);
    }
    .card {
      background: var(--musically-paper, #fffdf8);
      border: 1px solid var(--musically-border, #e4dcc8);
      border-radius: 8px;
      padding: 10px 12px 8px;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 6px;
      min-width: 86px;
    }
    .name {
      font-weight: 700;
      color: var(--musically-accent, #1d4ed8);
      font-size: 15px;
    }
    .notes {
      font-size: 10.5px;
      color: var(--musically-muted, #8a8169);
      letter-spacing: 0.3px;
    }
    svg {
      display: block;
    }
  `;
chunkCD2SD4KN_cjs.__decorateClass([
  decorators_js.property()
], exports.ChordDiagram.prototype, "chord", 2);
chunkCD2SD4KN_cjs.__decorateClass([
  decorators_js.property()
], exports.ChordDiagram.prototype, "instrument", 2);
chunkCD2SD4KN_cjs.__decorateClass([
  decorators_js.property({ type: Boolean, attribute: "diagram-only" })
], exports.ChordDiagram.prototype, "diagramOnly", 2);
exports.ChordDiagram = chunkCD2SD4KN_cjs.__decorateClass([
  decorators_js.customElement("chord-diagram")
], exports.ChordDiagram);
exports.ChordSheet = class ChordSheet extends lit.LitElement {
  constructor() {
    super(...arguments);
    this.body = "";
    this.title = "";
    this.artist = "";
    this.songKey = "";
    this.transpose = 0;
    this.instrument = "piano";
    this.showDiagrams = true;
    this.readonly = false;
    this.language = "";
    this.languages = [];
    this.transliterations = [];
    this.tab = "editor";
    this.xlitTab = 0;
  }
  emitChange() {
    this.dispatchEvent(
      new CustomEvent("change", {
        detail: {
          body: this.body,
          title: this.title,
          artist: this.artist,
          language: this.language,
          songKey: this.songKey,
          transpose: this.transpose,
          instrument: this.instrument,
          transliterations: this.transliterations
        },
        bubbles: true,
        composed: true
      })
    );
  }
  onInput(e) {
    this.body = e.target.value;
    this.emitChange();
  }
  setTranspose(n) {
    this.transpose = n;
    this.emitChange();
  }
  setInstrument(i) {
    this.instrument = i;
    this.emitChange();
  }
  // ── Transliterations ──────────────────────────────────────────────
  addTransliteration() {
    const used = new Set(this.transliterations.map((t) => t.language));
    const next = this.languages.find((l) => !used.has(l.code) && l.code !== this.language);
    this.transliterations = [...this.transliterations, { language: next?.code ?? "", body: "" }];
    this.xlitTab = this.transliterations.length - 1;
    this.emitChange();
  }
  updateTransliteration(i, patch) {
    this.transliterations = this.transliterations.map((t, idx) => idx === i ? { ...t, ...patch } : t);
    this.emitChange();
  }
  removeTransliteration(i) {
    this.transliterations = this.transliterations.filter((_, idx) => idx !== i);
    this.xlitTab = Math.max(0, Math.min(this.xlitTab, this.transliterations.length - 1));
    this.emitChange();
  }
  langName(code) {
    return this.languages.find((l) => l.code === code)?.name ?? code;
  }
  // ── Small render helpers ──────────────────────────────────────────
  renderLangSelect(value, onChange) {
    return lit.html`<select
      .value=${value}
      @change=${(e) => onChange(e.target.value)}
    >
      ${value && !this.languages.some((l) => l.code === value) ? lit.html`<option value=${value}>${value}</option>` : lit.nothing}
      ${this.languages.map((l) => lit.html`<option value=${l.code}>${l.name}</option>`)}
    </select>`;
  }
  renderFields() {
    return lit.html`
      <div class="fields">
        <label class="field grow">
          Title
          <input
            class="title-input"
            .value=${this.title}
            placeholder="Song title"
            @input=${(e) => {
      this.title = e.target.value;
      this.emitChange();
    }}
          />
        </label>
        <label class="field">
          Language
          ${this.renderLangSelect(this.language, (v) => {
      this.language = v;
      this.emitChange();
    })}
        </label>
        <label class="field">
          Key
          <select
            .value=${this.songKey}
            @change=${(e) => {
      this.songKey = e.target.value;
      this.emitChange();
    }}
          >
            <option value="">—</option>
            ${chunkCD2SD4KN_cjs.SONG_KEYS.map((k) => lit.html`<option value=${k}>${k}</option>`)}
          </select>
        </label>
      </div>
    `;
  }
  renderTabs() {
    const tabs = [
      { id: "editor", label: "Editor" },
      { id: "translit", label: `Transliterations${this.transliterations.length ? ` (${this.transliterations.length})` : ""}` },
      { id: "chords", label: "Chords" }
    ];
    return lit.html`<div class="tabs">
      ${tabs.map(
      (t) => lit.html`<button
          class=${"tab" + (this.tab === t.id ? " active" : "")}
          @click=${() => this.tab = t.id}
        >
          ${t.label}
        </button>`
    )}
    </div>`;
  }
  renderTransposeToolbar() {
    const instruments = ["piano", "guitar", "ukulele"];
    return lit.html`
      <div class="toolbar">
        <div class="group">
          <span class="label">Transpose</span>
          <button class="step" @click=${() => this.setTranspose(this.transpose - 1)}>−</button>
          <span class="step-val">${this.transpose > 0 ? "+" : ""}${this.transpose}</span>
          <button class="step" @click=${() => this.setTranspose(this.transpose + 1)}>+</button>
        </div>
        <div class="group spacer">
          ${instruments.map(
      (i) => lit.html`<button
              class=${i === this.instrument ? "active" : ""}
              @click=${() => this.setInstrument(i)}
            >
              ${i}
            </button>`
    )}
        </div>
      </div>
    `;
  }
  renderChordsTab() {
    const chords = chunkCD2SD4KN_cjs.getChordsInSong(this.body, this.transpose);
    const instruments = ["piano", "guitar", "ukulele"];
    return lit.html`
      <div class="toolbar">
        <span class="label">Diagrams for</span>
        <div class="group">
          ${instruments.map(
      (i) => lit.html`<button
              class=${i === this.instrument ? "active" : ""}
              @click=${() => this.setInstrument(i)}
            >
              ${i}
            </button>`
    )}
        </div>
      </div>
      ${chords.length ? lit.html`<div class="diagrams">
            ${chords.map(
      (c) => lit.html`<chord-diagram .chord=${c} .instrument=${this.instrument}></chord-diagram>`
    )}
          </div>` : lit.html`<div class="empty">No chords yet — add some like [C] or [G7] in the lyrics.</div>`}
    `;
  }
  renderTransliterationsTab() {
    if (!this.transliterations.length) {
      return lit.html`
        <div class="empty">No transliterations yet.</div>
        <button @click=${() => this.addTransliteration()}>+ Add transliteration</button>
      `;
    }
    const active = this.transliterations[Math.min(this.xlitTab, this.transliterations.length - 1)];
    const activeIdx = this.transliterations.indexOf(active);
    return lit.html`
      <div class="tabs">
        ${this.transliterations.map(
      (t, i) => lit.html`<button
            class=${"tab" + (i === this.xlitTab ? " active" : "")}
            @click=${() => this.xlitTab = i}
          >
            ${this.langName(t.language) || `#${i + 1}`}
          </button>`
    )}
        <button class="tab" @click=${() => this.addTransliteration()}>+ Add</button>
      </div>
      <div class="translit-head">
        <label class="field">
          Language
          ${this.renderLangSelect(active.language, (v) => this.updateTransliteration(activeIdx, { language: v }))}
        </label>
        <span class="spacer" style="margin-left:auto"></span>
        <button @click=${() => this.removeTransliteration(activeIdx)}>Remove</button>
      </div>
      <div class="body split">
        <textarea
          .value=${active.body}
          @input=${(e) => this.updateTransliteration(activeIdx, { body: e.target.value })}
          spellcheck="false"
          placeholder="Transliterated lyrics with the same [chords]"
        ></textarea>
        ${this.renderSheet(active.body)}
      </div>
    `;
  }
  renderLine(line) {
    if (line.type === "blank") return lit.html`<div class="blank"></div>`;
    if (line.type === "section")
      return lit.html`<div class="section">${line.label}</div>`;
    return lit.html`<div class="line">
      ${line.segments.map(
      (s) => lit.html`<span class="seg"
          ><span class="chord">${s.chord ?? "\xA0"}</span
          ><span class="lyric">${s.text || (s.chord ? "\xA0" : "")}</span
        ></span>`
    )}
    </div>`;
  }
  renderSheet(body = this.body) {
    const lines = chunkCD2SD4KN_cjs.parseChordPro(body, this.transpose);
    const displayKey = this.songKey ? chunkCD2SD4KN_cjs.transposeNote(this.songKey, this.transpose) : "";
    const offset = this.transpose !== 0 ? ` (${this.transpose > 0 ? "+" : ""}${this.transpose})` : "";
    const blocks = [];
    let cur = { type: null, label: null, lines: [] };
    for (const line of lines) {
      if (line.type === "section") {
        if (cur.label || cur.lines.length) blocks.push(cur);
        cur = { type: line.sectionType, label: line.label, lines: [] };
      } else {
        cur.lines.push(line);
      }
    }
    if (cur.label || cur.lines.length) blocks.push(cur);
    return lit.html`
      <div class="sheet">
        <div class="header">
          <div class="title">${this.title || "Untitled"}</div>
          <div class="meta">
            ${this.artist}${this.artist && displayKey ? " \xB7 " : ""}${displayKey ? "Key of " + displayKey : ""}${offset}
          </div>
        </div>
        ${blocks.map(
      (b) => lit.html`<div class="block" data-section=${b.type ?? lit.nothing}>
            ${b.label ? lit.html`<div class="section">${b.label}</div>` : lit.nothing}
            ${b.lines.map((line) => this.renderLine(line))}
          </div>`
    )}
      </div>
    `;
  }
  render() {
    if (this.readonly) {
      const chords = chunkCD2SD4KN_cjs.getChordsInSong(this.body, this.transpose);
      return lit.html`
        ${this.renderSheet()}
        ${this.showDiagrams && chords.length ? lit.html`<div class="diagrams-label">Chords used — ${this.instrument}</div>
              <div class="diagrams">
                ${chords.map(
        (c) => lit.html`<chord-diagram .chord=${c} .instrument=${this.instrument}></chord-diagram>`
      )}
              </div>` : lit.nothing}
      `;
    }
    return lit.html`
      ${this.renderFields()}
      ${this.renderTabs()}
      ${this.tab === "editor" ? lit.html`
            ${this.renderTransposeToolbar()}
            <div class="body split">
              <textarea
                .value=${this.body}
                @input=${this.onInput}
                spellcheck="false"
                placeholder="# Verse 1&#10;[C]Type your lyrics with [G]chords in brackets"
              ></textarea>
              ${this.renderSheet()}
            </div>
          ` : this.tab === "translit" ? this.renderTransliterationsTab() : this.renderChordsTab()}
    `;
  }
};
exports.ChordSheet.styles = lit.css`
    :host {
      display: block;
      font-family: var(--musically-font, ui-sans-serif, system-ui, sans-serif);
      color: var(--musically-text, #33312c);
    }
    .toolbar {
      display: flex;
      align-items: center;
      gap: 12px;
      flex-wrap: wrap;
      margin-bottom: 12px;
    }
    .toolbar .group {
      display: flex;
      align-items: center;
      gap: 4px;
    }
    .toolbar .label {
      font-size: 12px;
      color: var(--musically-muted, #8a8169);
    }
    .toolbar .spacer {
      margin-left: auto;
    }
    button {
      font: inherit;
      font-size: 13px;
      padding: 6px 11px;
      border-radius: 6px;
      border: 1px solid var(--musically-border, #d8cfb8);
      background: var(--musically-paper, #fffdf8);
      color: var(--musically-text, #33312c);
      cursor: pointer;
      text-transform: capitalize;
    }
    button:hover {
      border-color: var(--musically-accent, #1d4ed8);
    }
    button.active {
      background: var(--musically-accent, #1d4ed8);
      border-color: var(--musically-accent, #1d4ed8);
      color: var(--musically-on-accent, #fff);
      font-weight: 600;
    }
    button.step {
      width: 28px;
      padding: 0;
      height: 28px;
      text-transform: none;
    }
    .step-val {
      min-width: 26px;
      text-align: center;
      font-weight: 700;
    }
    .body {
      display: grid;
      gap: 16px;
    }
    .body.split {
      grid-template-columns: 1fr 1.1fr;
    }
    textarea {
      width: 100%;
      min-height: 320px;
      resize: vertical;
      box-sizing: border-box;
      padding: 14px;
      border: 1px solid var(--musically-border, #d8cfb8);
      border-radius: 8px;
      background: var(--musically-paper, #fffdf8);
      color: var(--musically-text, #33312c);
      font-family: ui-monospace, Menlo, monospace;
      font-size: 13.5px;
      line-height: 1.7;
      outline: none;
    }
    .sheet {
      background: var(--musically-paper, #fffdf8);
      border: 1px solid var(--musically-border, #e4dcc8);
      border-radius: 14px;
      padding: 28px 32px;
      box-shadow: var(--musically-shadow, 0 1px 2px rgba(80, 70, 40, 0.05), 0 6px 20px -10px rgba(80, 70, 40, 0.12));
    }
    .header {
      border-bottom: 1px solid var(--musically-border, #ece3cf);
      padding-bottom: 14px;
      margin-bottom: 20px;
    }
    .header .title {
      font-size: 24px;
      font-weight: 700;
      letter-spacing: -0.02em;
    }
    .header .meta {
      font-size: 13px;
      color: var(--musically-muted, #8a8169);
      margin-top: 4px;
    }
    .section {
      font-weight: 700;
      color: var(--musically-accent, #1d4ed8);
      font-size: 12px;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      margin: 22px 0 8px;
      opacity: 0.9;
    }
    .section:first-child {
      margin-top: 0;
    }
    .blank {
      height: 12px;
    }
    .line {
      margin-bottom: 12px;
      line-height: 1.15;
    }
    .seg {
      display: inline-flex;
      flex-direction: column;
      align-items: flex-start;
      vertical-align: bottom;
    }
    .seg .chord {
      color: var(--musically-accent, #1d4ed8);
      font-weight: 700;
      font-size: 13px;
      letter-spacing: -0.01em;
      height: 1.45em;
      white-space: pre;
    }
    .seg .lyric {
      white-space: pre;
      font-size: 16.5px;
      line-height: 1.5;
    }
    .diagrams {
      margin-top: 18px;
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
    }
    .diagrams-label {
      font-size: 13px;
      font-weight: 700;
      margin: 18px 0 8px;
      text-transform: capitalize;
    }
    @media (max-width: 720px) {
      .body.split {
        grid-template-columns: 1fr;
      }
    }

    /* Header fields (title / language / key) */
    .fields {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
      margin-bottom: 14px;
    }
    .field {
      display: flex;
      flex-direction: column;
      gap: 4px;
      font-size: 12px;
      color: var(--musically-muted, #8a8169);
    }
    .field.grow {
      flex: 1;
      min-width: 180px;
    }
    input.title-input,
    select {
      font: inherit;
      font-size: 14px;
      padding: 8px 10px;
      border-radius: 8px;
      border: 1px solid var(--musically-border, #d8cfb8);
      background: var(--musically-paper, #fffdf8);
      color: var(--musically-text, #33312c);
      outline: none;
    }
    input.title-input:focus,
    select:focus,
    textarea:focus {
      border-color: var(--musically-accent, #1d4ed8);
    }

    /* Tabs */
    .tabs {
      display: flex;
      gap: 4px;
      border-bottom: 1px solid var(--musically-border, #e4dcc8);
      margin-bottom: 16px;
    }
    .tab {
      font: inherit;
      font-size: 13px;
      font-weight: 600;
      padding: 8px 14px;
      border: none;
      border-bottom: 2px solid transparent;
      background: none;
      /* Use the real text colour (dimmed) rather than the faint muted colour, so labels stay
         readable in light and dark. */
      color: var(--musically-text, #33312c);
      opacity: 0.65;
      cursor: pointer;
      margin-bottom: -1px;
    }
    .tab:hover {
      opacity: 1;
    }
    .tab.active {
      /* Keep the label in the readable text colour; the accent underline signals "selected"
         (accent-as-text contrast is unreliable across themes). */
      color: var(--musically-text, #33312c);
      border-bottom-color: var(--musically-accent, #1d4ed8);
      opacity: 1;
    }

    /* Section colour blocks (also readable by mobile via data-section) */
    .block {
      margin: 0 0 4px;
    }
    .block[data-section] {
      padding: 8px 14px;
      margin: 10px 0;
      border-left: 3px solid transparent;
      border-radius: 8px;
    }
    .block[data-section] .section {
      margin-top: 0;
    }
    /* Default web look: a coloured left-border cue only — no background fill, so lyric/chord text
       stays fully readable. Apps still get the section type via [data-section] to colour as they
       wish, and a faint fill can be opted into with --musically-section-fill (e.g. 8%). */
    .block[data-section="chorus"] {
      border-left-color: var(--musically-accent, #1d4ed8);
      background: color-mix(in srgb, var(--musically-accent, #1d4ed8) var(--musically-section-fill, 0%), transparent);
    }
    .block[data-section="pre-chorus"] {
      border-left-color: var(--musically-section-prechorus, #b8791b);
      background: color-mix(in srgb, var(--musically-section-prechorus, #b8791b) var(--musically-section-fill, 0%), transparent);
    }
    .block[data-section="bridge"] {
      border-left-color: var(--musically-section-bridge, #7c3aed);
      background: color-mix(in srgb, var(--musically-section-bridge, #7c3aed) var(--musically-section-fill, 0%), transparent);
    }
    .block[data-section="intro"],
    .block[data-section="outro"] {
      border-left-color: var(--musically-muted, #8a8169);
      background: color-mix(in srgb, var(--musically-muted, #8a8169) var(--musically-section-fill, 0%), transparent);
    }
    .block[data-section="verse"] {
      border-left-color: color-mix(in srgb, var(--musically-text, #33312c) 25%, transparent);
    }

    .translit-head {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 10px;
    }
    .empty {
      color: var(--musically-muted, #8a8169);
      font-size: 14px;
      padding: 20px 0;
    }
  `;
chunkCD2SD4KN_cjs.__decorateClass([
  decorators_js.property()
], exports.ChordSheet.prototype, "body", 2);
chunkCD2SD4KN_cjs.__decorateClass([
  decorators_js.property()
], exports.ChordSheet.prototype, "title", 2);
chunkCD2SD4KN_cjs.__decorateClass([
  decorators_js.property()
], exports.ChordSheet.prototype, "artist", 2);
chunkCD2SD4KN_cjs.__decorateClass([
  decorators_js.property({ attribute: "song-key" })
], exports.ChordSheet.prototype, "songKey", 2);
chunkCD2SD4KN_cjs.__decorateClass([
  decorators_js.property({ type: Number })
], exports.ChordSheet.prototype, "transpose", 2);
chunkCD2SD4KN_cjs.__decorateClass([
  decorators_js.property()
], exports.ChordSheet.prototype, "instrument", 2);
chunkCD2SD4KN_cjs.__decorateClass([
  decorators_js.property({ type: Boolean, attribute: "show-diagrams" })
], exports.ChordSheet.prototype, "showDiagrams", 2);
chunkCD2SD4KN_cjs.__decorateClass([
  decorators_js.property({ type: Boolean })
], exports.ChordSheet.prototype, "readonly", 2);
chunkCD2SD4KN_cjs.__decorateClass([
  decorators_js.property()
], exports.ChordSheet.prototype, "language", 2);
chunkCD2SD4KN_cjs.__decorateClass([
  decorators_js.property({ attribute: false })
], exports.ChordSheet.prototype, "languages", 2);
chunkCD2SD4KN_cjs.__decorateClass([
  decorators_js.property({ attribute: false })
], exports.ChordSheet.prototype, "transliterations", 2);
chunkCD2SD4KN_cjs.__decorateClass([
  decorators_js.state()
], exports.ChordSheet.prototype, "tab", 2);
chunkCD2SD4KN_cjs.__decorateClass([
  decorators_js.state()
], exports.ChordSheet.prototype, "xlitTab", 2);
exports.ChordSheet = chunkCD2SD4KN_cjs.__decorateClass([
  decorators_js.customElement("chord-sheet")
], exports.ChordSheet);
//# sourceMappingURL=elements.cjs.map
//# sourceMappingURL=elements.cjs.map
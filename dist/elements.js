import { __decorateClass, getDiagramSVG, chordNotes, SONG_KEYS, getChordsInSong, displayLines, parseChordPro, transposeNote } from './chunk-XZCL2JQ3.js';
import { css, LitElement, nothing, html } from 'lit';
import { property, customElement, state } from 'lit/decorators.js';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';

var ChordDiagram = class extends LitElement {
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
    if (!this.chord) return nothing;
    const diagram = getDiagramSVG(this.chord, this.instrument, this.themeOptions());
    return html`
      <div class="card">
        ${this.diagramOnly ? nothing : html`<div class="name">${this.chord}</div>`}
        ${unsafeHTML(diagram)}
        ${this.diagramOnly ? nothing : html`<div class="notes">${chordNotes(this.chord).join(" \xB7 ")}</div>`}
      </div>
    `;
  }
};
ChordDiagram.styles = css`
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
__decorateClass([
  property()
], ChordDiagram.prototype, "chord", 2);
__decorateClass([
  property()
], ChordDiagram.prototype, "instrument", 2);
__decorateClass([
  property({ type: Boolean, attribute: "diagram-only" })
], ChordDiagram.prototype, "diagramOnly", 2);
ChordDiagram = __decorateClass([
  customElement("chord-diagram")
], ChordDiagram);
var ChordSheet = class extends LitElement {
  constructor() {
    super(...arguments);
    this.body = "";
    this.title = "";
    this.artist = "";
    this.author = "";
    this.composer = "";
    this.musicDirector = "";
    this.chordsContributedBy = "";
    this.songKey = "";
    this.hasChords = false;
    this.tempo = 0;
    this.preferredKey = "";
    this.mode = "";
    this.timeSignature = "";
    this.rhythmPattern = "";
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
          author: this.author,
          composer: this.composer,
          musicDirector: this.musicDirector,
          chordsContributedBy: this.chordsContributedBy,
          language: this.language,
          songKey: this.songKey,
          hasChords: this.hasChords,
          tempo: this.tempo,
          preferredKey: this.preferredKey,
          mode: this.mode,
          timeSignature: this.timeSignature,
          rhythmPattern: this.rhythmPattern,
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
    this.transliterations = [...this.transliterations, { language: next?.code ?? "", body: "", title: "" }];
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
    const known = this.languages.some((l) => l.code === value);
    return html`<select @change=${(e) => onChange(e.target.value)}>
      ${value && !known ? html`<option value=${value} .selected=${true}>${value}</option>` : nothing}
      ${this.languages.map((l) => html`<option value=${l.code} .selected=${l.code === value}>${l.name}</option>`)}
    </select>`;
  }
  renderFields() {
    return html`
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
            @change=${(e) => {
      this.songKey = e.target.value;
      this.emitChange();
    }}
          >
            <option value="" .selected=${!this.songKey}>—</option>
            ${SONG_KEYS.map((k) => html`<option value=${k} .selected=${k === this.songKey}>${k}</option>`)}
          </select>
        </label>
      </div>
    `;
  }
  renderTabs() {
    const tabs = [
      { id: "editor", label: "Editor" },
      { id: "credits", label: "Credits" },
      { id: "music", label: "Music" },
      { id: "translit", label: `Transliterations${this.transliterations.length ? ` (${this.transliterations.length})` : ""}` },
      { id: "chords", label: "Chords" }
    ];
    return html`<div class="tabs">
      ${tabs.map(
      (t) => html`<button
          class=${"tab" + (this.tab === t.id ? " active" : "")}
          @click=${() => this.tab = t.id}
        >
          ${t.label}
        </button>`
    )}
    </div>`;
  }
  /** A labelled free-text field bound to one string property, emitting `change` on input. */
  renderTextField(label, value, assign, placeholder = "") {
    return html`<label class="field grow">
      ${label}
      <input
        class="text-input"
        .value=${value}
        placeholder=${placeholder}
        @input=${(e) => {
      assign(e.target.value);
      this.emitChange();
    }}
      />
    </label>`;
  }
  // ── Credits tab (author / composer / music director / performing artist) ──
  renderCreditsTab() {
    return html`<div class="meta-grid">
      ${this.renderTextField("Author (lyricist)", this.author, (v) => this.author = v, "e.g. Charles Wesley")}
      ${this.renderTextField("Composer", this.composer, (v) => this.composer = v, "e.g. Felix Mendelssohn")}
      ${this.renderTextField("Music director", this.musicDirector, (v) => this.musicDirector = v)}
      ${this.renderTextField("Performing artist", this.artist, (v) => this.artist = v)}
    </div>`;
  }
  // ── Music tab (chords flag + performance metadata) ──
  renderMusicTab() {
    return html`
      <label class="check">
        <input
          type="checkbox"
          .checked=${this.hasChords}
          @change=${(e) => {
      this.hasChords = e.target.checked;
      this.emitChange();
    }}
        />
        <span class="check-text">
          Officially carries music chords
          <small>When off, the song is shown as lyrics-only — any [chords] in the body are ignored.</small>
        </span>
      </label>
      <div class="meta-grid">
        <label class="field grow">
          Tempo (BPM)
          <input
            class="text-input"
            type="number"
            min="0"
            .value=${this.tempo ? String(this.tempo) : ""}
            placeholder="e.g. 72"
            @input=${(e) => {
      this.tempo = Number(e.target.value) || 0;
      this.emitChange();
    }}
          />
        </label>
        <label class="field">
          Preferred key
          <select
            @change=${(e) => {
      this.preferredKey = e.target.value;
      this.emitChange();
    }}
          >
            <option value="" .selected=${!this.preferredKey}>—</option>
            ${SONG_KEYS.map((k) => html`<option value=${k} .selected=${k === this.preferredKey}>${k}</option>`)}
          </select>
        </label>
        <label class="field">
          Tonality
          <select
            @change=${(e) => {
      this.mode = e.target.value;
      this.emitChange();
    }}
          >
            <option value="" .selected=${!this.mode}>—</option>
            <option value="major" .selected=${this.mode === "major"}>Major</option>
            <option value="minor" .selected=${this.mode === "minor"}>Minor</option>
          </select>
        </label>
        ${this.renderTextField("Time signature", this.timeSignature, (v) => this.timeSignature = v, "e.g. 4/4")}
        ${this.renderTextField("Rhythm pattern", this.rhythmPattern, (v) => this.rhythmPattern = v, "e.g. D DU UDU")}
      </div>
    `;
  }
  renderTransposeToolbar() {
    const instruments = ["piano", "guitar", "ukulele"];
    return html`
      <div class="toolbar">
        <div class="group">
          <span class="label">Transpose</span>
          <button class="step" @click=${() => this.setTranspose(this.transpose - 1)}>−</button>
          <span class="step-val">${this.transpose > 0 ? "+" : ""}${this.transpose}</span>
          <button class="step" @click=${() => this.setTranspose(this.transpose + 1)}>+</button>
        </div>
        <div class="group spacer">
          ${instruments.map(
      (i) => html`<button
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
    const chords = getChordsInSong(this.body, this.transpose);
    const instruments = ["piano", "guitar", "ukulele"];
    return html`
      ${chords.length ? html`<div class="meta-grid chords-credit">
            ${this.renderTextField(
      "Chords contributed by",
      this.chordsContributedBy,
      (v) => this.chordsContributedBy = v,
      "Credit the chords contributor"
    )}
          </div>` : nothing}
      <div class="toolbar chords-tools">
        <span class="label">Diagrams for</span>
        <div class="group">
          ${instruments.map(
      (i) => html`<button
              class=${i === this.instrument ? "active" : ""}
              @click=${() => this.setInstrument(i)}
            >
              ${i}
            </button>`
    )}
        </div>
      </div>
      ${chords.length ? html`<div class="diagrams">
            ${chords.map(
      (c) => html`<chord-diagram .chord=${c} .instrument=${this.instrument}></chord-diagram>`
    )}
          </div>` : html`<div class="empty">No chords yet — add some like [C] or [G7] in the lyrics.</div>`}
    `;
  }
  renderTransliterationsTab() {
    if (!this.transliterations.length) {
      return html`
        <div class="empty">No transliterations yet.</div>
        <button @click=${() => this.addTransliteration()}>+ Add transliteration</button>
      `;
    }
    const active = this.transliterations[Math.min(this.xlitTab, this.transliterations.length - 1)];
    const activeIdx = this.transliterations.indexOf(active);
    return html`
      <div class="tabs">
        ${this.transliterations.map(
      (t, i) => html`<button
            class=${"tab" + (i === this.xlitTab ? " active" : "")}
            @click=${() => this.xlitTab = i}
          >
            ${this.langName(t.language) || `#${i + 1}`}
          </button>`
    )}
        <button class="tab" @click=${() => this.addTransliteration()}>+ Add</button>
      </div>
      <div class="translit-head">
        <label class="field grow">
          Title
          <input
            class="title-input"
            .value=${active.title ?? ""}
            placeholder="Song title in this script"
            @input=${(e) => this.updateTransliteration(activeIdx, { title: e.target.value })}
          />
        </label>
        <label class="field">
          Language
          ${this.renderLangSelect(active.language, (v) => this.updateTransliteration(activeIdx, { language: v }))}
        </label>
        <label class="field grow">
          Transliterated by
          <input
            class="text-input"
            .value=${active.transliteratedBy ?? ""}
            placeholder="Credit the transliterator"
            @input=${(e) => this.updateTransliteration(activeIdx, { transliteratedBy: e.target.value })}
          />
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
    if (line.type === "blank") return html`<div class="blank"></div>`;
    if (line.type === "section")
      return html`<div class="section">${line.label}</div>`;
    return html`<div class="line">
      ${line.segments.map(
      (s) => html`<span class="seg"
          ><span class="chord">${s.chord ?? "\xA0"}</span
          ><span class="lyric">${s.text || (s.chord ? "\xA0" : "")}</span
        ></span>`
    )}
    </div>`;
  }
  renderSheet(body = this.body) {
    const lines = displayLines(parseChordPro(body, this.transpose), this.hasChords);
    const displayKey = this.songKey ? transposeNote(this.songKey, this.transpose) : "";
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
    return html`
      <div class=${"sheet" + (this.hasChords ? "" : " lyrics-only")}>
        <div class="header">
          <div class="title">${this.title || "Untitled"}</div>
          <div class="meta">
            ${this.artist}${this.artist && displayKey ? " \xB7 " : ""}${displayKey ? "Key of " + displayKey : ""}${offset}
          </div>
        </div>
        ${blocks.map(
      (b) => html`<div class="block" data-section=${b.type ?? nothing}>
            ${b.label ? html`<div class="section">${b.label}</div>` : nothing}
            ${b.lines.map((line) => this.renderLine(line))}
          </div>`
    )}
      </div>
    `;
  }
  render() {
    if (this.readonly) {
      const chords = getChordsInSong(this.body, this.transpose);
      return html`
        ${this.renderSheet()}
        ${this.hasChords && this.showDiagrams && chords.length ? html`<div class="diagrams-label">Chords used — ${this.instrument}</div>
              <div class="diagrams">
                ${chords.map(
        (c) => html`<chord-diagram .chord=${c} .instrument=${this.instrument}></chord-diagram>`
      )}
              </div>` : nothing}
      `;
    }
    return html`
      ${this.renderFields()}
      ${this.renderTabs()}
      ${this.tab === "editor" ? html`
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
          ` : this.tab === "credits" ? this.renderCreditsTab() : this.tab === "music" ? this.renderMusicTab() : this.tab === "translit" ? this.renderTransliterationsTab() : this.renderChordsTab()}
    `;
  }
};
ChordSheet.styles = css`
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
      height: 10px;
    }
    .line {
      margin-bottom: 6px;
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
    /* Lyrics-only (no official chords): drop the empty chord row and tighten the lines so only the
       section breaks add vertical space. */
    .sheet.lyrics-only .seg .chord {
      display: none;
    }
    .sheet.lyrics-only .line {
      margin-bottom: 1px;
    }
    .sheet.lyrics-only .seg .lyric {
      line-height: 1.42;
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
      /* Keep the label in the readable text colour; the accent underline signals "selected".
         background:none is required to beat the generic button.active (accent fill) rule —
         otherwise the active tab gets dark text on a blue fill. */
      background: none;
      color: var(--musically-text, #33312c);
      border-color: transparent;
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
    /* Each section gets a coloured left-border cue plus a faint background tint so verses, choruses,
       etc. are visually distinct while text stays readable. The tint strength is tunable with
       --musically-section-fill (default 9%); set it to 0% for a border-only look. */
    .block[data-section="chorus"] {
      border-left-color: var(--musically-accent, #1d4ed8);
      background: color-mix(in srgb, var(--musically-accent, #1d4ed8) var(--musically-section-fill, 9%), transparent);
    }
    .block[data-section="pre-chorus"] {
      border-left-color: var(--musically-section-prechorus, #b8791b);
      background: color-mix(in srgb, var(--musically-section-prechorus, #b8791b) var(--musically-section-fill, 9%), transparent);
    }
    .block[data-section="bridge"] {
      border-left-color: var(--musically-section-bridge, #7c3aed);
      background: color-mix(in srgb, var(--musically-section-bridge, #7c3aed) var(--musically-section-fill, 9%), transparent);
    }
    .block[data-section="intro"],
    .block[data-section="outro"] {
      border-left-color: var(--musically-muted, #8a8169);
      background: color-mix(in srgb, var(--musically-muted, #8a8169) var(--musically-section-fill, 9%), transparent);
    }
    .block[data-section="verse"] {
      border-left-color: color-mix(in srgb, var(--musically-text, #33312c) 25%, transparent);
      background: color-mix(in srgb, var(--musically-text, #33312c) 4%, transparent);
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

    /* Credits / Music metadata tabs */
    .meta-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      gap: 12px;
    }
    /* Chords tab: breathing room under the "Chords contributed by" field
       and the "Diagrams for" toolbar before the diagram strip. */
    .meta-grid.chords-credit {
      margin-bottom: 20px;
    }
    .toolbar.chords-tools {
      margin-bottom: 20px;
    }
    input.text-input {
      font: inherit;
      font-size: 14px;
      padding: 8px 10px;
      border-radius: 8px;
      border: 1px solid var(--musically-border, #d8cfb8);
      background: var(--musically-paper, #fffdf8);
      color: var(--musically-text, #33312c);
      outline: none;
    }
    input.text-input:focus {
      border-color: var(--musically-accent, #1d4ed8);
    }
    .check {
      display: flex;
      align-items: flex-start;
      gap: 10px;
      padding: 4px 0 14px;
      cursor: pointer;
    }
    .check input {
      width: 18px;
      height: 18px;
      margin-top: 2px;
      accent-color: var(--musically-accent, #1d4ed8);
    }
    .check .check-text {
      font-size: 14px;
      color: var(--musically-text, #33312c);
    }
    .check .check-text small {
      display: block;
      font-size: 12px;
      color: var(--musically-muted, #8a8169);
      margin-top: 2px;
    }
  `;
__decorateClass([
  property()
], ChordSheet.prototype, "body", 2);
__decorateClass([
  property()
], ChordSheet.prototype, "title", 2);
__decorateClass([
  property()
], ChordSheet.prototype, "artist", 2);
__decorateClass([
  property()
], ChordSheet.prototype, "author", 2);
__decorateClass([
  property()
], ChordSheet.prototype, "composer", 2);
__decorateClass([
  property({ attribute: "music-director" })
], ChordSheet.prototype, "musicDirector", 2);
__decorateClass([
  property({ attribute: "chords-contributed-by" })
], ChordSheet.prototype, "chordsContributedBy", 2);
__decorateClass([
  property({ attribute: "song-key" })
], ChordSheet.prototype, "songKey", 2);
__decorateClass([
  property({ type: Boolean, attribute: "has-chords" })
], ChordSheet.prototype, "hasChords", 2);
__decorateClass([
  property({ type: Number })
], ChordSheet.prototype, "tempo", 2);
__decorateClass([
  property({ attribute: "preferred-key" })
], ChordSheet.prototype, "preferredKey", 2);
__decorateClass([
  property()
], ChordSheet.prototype, "mode", 2);
__decorateClass([
  property({ attribute: "time-signature" })
], ChordSheet.prototype, "timeSignature", 2);
__decorateClass([
  property({ attribute: "rhythm-pattern" })
], ChordSheet.prototype, "rhythmPattern", 2);
__decorateClass([
  property({ type: Number })
], ChordSheet.prototype, "transpose", 2);
__decorateClass([
  property()
], ChordSheet.prototype, "instrument", 2);
__decorateClass([
  property({ type: Boolean, attribute: "show-diagrams" })
], ChordSheet.prototype, "showDiagrams", 2);
__decorateClass([
  property({ type: Boolean })
], ChordSheet.prototype, "readonly", 2);
__decorateClass([
  property()
], ChordSheet.prototype, "language", 2);
__decorateClass([
  property({ attribute: false })
], ChordSheet.prototype, "languages", 2);
__decorateClass([
  property({ attribute: false })
], ChordSheet.prototype, "transliterations", 2);
__decorateClass([
  state()
], ChordSheet.prototype, "tab", 2);
__decorateClass([
  state()
], ChordSheet.prototype, "xlitTab", 2);
ChordSheet = __decorateClass([
  customElement("chord-sheet")
], ChordSheet);

export { ChordDiagram, ChordSheet };
//# sourceMappingURL=elements.js.map
//# sourceMappingURL=elements.js.map
/**
 * Musically — Web Components (Lit)
 * Defines <chord-sheet> and <chord-diagram>, built on the framework-agnostic
 * core in ./index. Importing this module registers both custom elements.
 *
 * Theme via CSS custom properties on the element or a parent:
 *   --musically-accent     chord / highlight color   (#1d4ed8)
 *   --musically-on-accent  text on an accent fill     (#fff)
 *   --musically-root       root-note highlight        (#1e3a8a)
 *   --musically-paper      sheet / white-key bg       (#fffdf8)
 *   --musically-text       lyric color                (#33312c)
 *   --musically-border     card / divider color       (#e4dcc8)
 *   --musically-muted      secondary text             (#8a8169)
 *   --musically-shadow     sheet box-shadow
 *   --musically-font       sheet font family
 */

import { LitElement, html, css, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { unsafeHTML } from "lit/directives/unsafe-html.js";
import {
  parseChordPro,
  displayLines,
  getChordsInSong,
  chordNotes,
  getDiagramSVG,
  transposeNote,
  SONG_KEYS,
} from "./index.js";
import type { Instrument, SheetLine, SectionType } from "./index.js";

/** A language option for the editor's dropdowns. */
export interface LanguageOption {
  code: string;
  name: string;
}

/** An alternate-script version of the lyrics: its own language + ChordPro body, and an optional
 *  title rendered in that script (shown by the reader when viewing this transliteration). */
export interface Transliteration {
  language: string;
  body: string;
  title?: string;
  /** Credit for the person who produced this transliteration (free text). */
  transliteratedBy?: string;
}

/* ================================================================== */
/* <chord-diagram>                                                    */
/* ================================================================== */

@customElement("chord-diagram")
export class ChordDiagram extends LitElement {
  /** Chord symbol, e.g. "Cmaj7", "F#m", "D/F#". */
  @property() chord = "";
  /** Instrument to draw the diagram for. */
  @property() instrument: Instrument = "piano";
  /** Hide the chord name and note list, showing only the diagram. */
  @property({ type: Boolean, attribute: "diagram-only" }) diagramOnly = false;

  static styles = css`
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

  private themeOptions() {
    const cs = getComputedStyle(this);
    const get = (name: string, fallback: string) =>
      cs.getPropertyValue(name).trim() || fallback;
    return {
      accent: get("--musically-accent", "#1d4ed8"),
      root: get("--musically-root", "#1e3a8a"),
      paper: get("--musically-paper", "#fffdf8"),
    };
  }

  render() {
    if (!this.chord) return nothing;
    const diagram = getDiagramSVG(this.chord, this.instrument, this.themeOptions());
    return html`
      <div class="card">
        ${this.diagramOnly ? nothing : html`<div class="name">${this.chord}</div>`}
        ${unsafeHTML(diagram)}
        ${this.diagramOnly
          ? nothing
          : html`<div class="notes">${chordNotes(this.chord).join(" · ")}</div>`}
      </div>
    `;
  }
}

/* ================================================================== */
/* <chord-sheet>                                                      */
/* ================================================================== */

@customElement("chord-sheet")
export class ChordSheet extends LitElement {
  /** Lyrics with inline [chords]. Lines starting with "#" become section labels. */
  @property() body = "";
  /** Song title shown in the header. */
  @property() title = "";
  /** Performing artist (free text). */
  @property() artist = "";
  /** Lyricist / author (free text). */
  @property() author = "";
  /** Composer (free text). */
  @property() composer = "";
  /** Music director (free text). */
  @property({ attribute: "music-director" }) musicDirector = "";
  /** Credit for the person who contributed the music chords (free text). */
  @property({ attribute: "chords-contributed-by" }) chordsContributedBy = "";
  /** Copyright line for the credits footer, shown verbatim (e.g. "© 2026 World Healing Music"). */
  @property() copyright = "";
  /** Licensing line for the credits footer, shown verbatim (e.g. "CCLI License #1234567"). */
  @property() license = "";
  /** Usage-permission line for the credits footer, shown verbatim (e.g. "Used by permission."). */
  @property() permissions = "";
  /** Original key; transposes along with the song. */
  @property({ attribute: "song-key" }) songKey = "";
  /**
   * Whether the song *officially* carries embedded music chords. When false the song is treated as
   * lyrics-only: any [chords] in the body are ignored on display and inter-line spacing is tightened.
   */
  @property({ type: Boolean, attribute: "has-chords" }) hasChords = false;
  /** Beats per minute (0 = unset). */
  @property({ type: Number }) tempo = 0;
  /** Preferred performance key (independent of the transposable original `songKey`). */
  @property({ attribute: "preferred-key" }) preferredKey = "";
  /** Tonality: "major" | "minor" | "". */
  @property() mode = "";
  /** Time signature, e.g. "4/4", "6/8". */
  @property({ attribute: "time-signature" }) timeSignature = "";
  /** Free-text rhythm / strumming pattern. */
  @property({ attribute: "rhythm-pattern" }) rhythmPattern = "";
  /** Semitones to shift all chords. */
  @property({ type: Number }) transpose = 0;
  /** Diagram instrument. */
  @property() instrument: Instrument = "piano";
  /** Toggle the "chords used" diagram strip. */
  @property({ type: Boolean, attribute: "show-diagrams" }) showDiagrams = true;
  /** Hide the editor + toolbar and render only the sheet. */
  @property({ type: Boolean }) readonly = false;
  /** BCP-47 language of the primary lyrics (drives the language picker's value). */
  @property() language = "";
  /** Options for the language dropdowns. When empty the current value is still shown. */
  @property({ attribute: false }) languages: LanguageOption[] = [];
  /** Alternate-script versions of the lyrics, each with its own language + ChordPro body. */
  @property({ attribute: false }) transliterations: Transliteration[] = [];

  /** Which editor tab is active. */
  @state() private tab: "editor" | "credits" | "music" | "translit" | "chords" | "permissions" = "editor";
  /** Which transliteration tab is active (index into transliterations). */
  @state() private xlitTab = 0;

  static styles = css`
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
    /* Permissions tab: full-width stacked lines (copyright / license / permissions). */
    .perm-fields {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    /* Credits / licensing footer under the lyrics — fine print. */
    .credits-footer {
      margin-top: 18px;
      padding-top: 10px;
      border-top: 1px solid var(--musically-border, #e4dcc8);
      font-size: 11px;
      line-height: 1.5;
      color: var(--musically-muted, #8a8169);
    }
    .credit-line {
      margin: 1px 0;
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

  private emitChange() {
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
          copyright: this.copyright,
          license: this.license,
          permissions: this.permissions,
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
          transliterations: this.transliterations,
        },
        bubbles: true,
        composed: true,
      })
    );
  }

  private onInput(e: Event) {
    this.body = (e.target as HTMLTextAreaElement).value;
    this.emitChange();
  }

  private setTranspose(n: number) {
    this.transpose = n;
    this.emitChange();
  }

  private setInstrument(i: Instrument) {
    this.instrument = i;
    this.emitChange();
  }

  // ── Transliterations ──────────────────────────────────────────────
  private addTransliteration() {
    const used = new Set(this.transliterations.map((t) => t.language));
    const next = this.languages.find((l) => !used.has(l.code) && l.code !== this.language);
    this.transliterations = [...this.transliterations, { language: next?.code ?? "", body: "", title: "" }];
    this.xlitTab = this.transliterations.length - 1;
    this.emitChange();
  }
  private updateTransliteration(i: number, patch: Partial<Transliteration>) {
    this.transliterations = this.transliterations.map((t, idx) => (idx === i ? { ...t, ...patch } : t));
    this.emitChange();
  }
  private removeTransliteration(i: number) {
    this.transliterations = this.transliterations.filter((_, idx) => idx !== i);
    this.xlitTab = Math.max(0, Math.min(this.xlitTab, this.transliterations.length - 1));
    this.emitChange();
  }

  private langName(code: string) {
    return this.languages.find((l) => l.code === code)?.name ?? code;
  }

  // ── Small render helpers ──────────────────────────────────────────
  private renderLangSelect(value: string, onChange: (v: string) => void) {
    // Mark the chosen <option> with `.selected` rather than binding the select's `.value`: a native
    // <select>'s value can't be set before its options exist (and options may load async), so a
    // restored language/key would otherwise not show on first render.
    const known = this.languages.some((l) => l.code === value);
    return html`<select @change=${(e: Event) => onChange((e.target as HTMLSelectElement).value)}>
      ${value && !known
        ? html`<option value=${value} .selected=${true}>${value}</option>`
        : nothing}
      ${this.languages.map((l) => html`<option value=${l.code} .selected=${l.code === value}>${l.name}</option>`)}
    </select>`;
  }

  private renderFields() {
    return html`
      <div class="fields">
        <label class="field grow">
          Title
          <input
            class="title-input"
            .value=${this.title}
            placeholder="Song title"
            @input=${(e: Event) => {
              this.title = (e.target as HTMLInputElement).value;
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
            @change=${(e: Event) => {
              this.songKey = (e.target as HTMLSelectElement).value;
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

  private renderTabs() {
    const tabs: { id: "editor" | "credits" | "music" | "translit" | "chords" | "permissions"; label: string }[] = [
      { id: "editor", label: "Editor" },
      { id: "credits", label: "Credits" },
      { id: "music", label: "Music" },
      { id: "translit", label: `Transliterations${this.transliterations.length ? ` (${this.transliterations.length})` : ""}` },
      { id: "chords", label: "Chords" },
      { id: "permissions", label: "Permissions" },
    ];
    return html`<div class="tabs">
      ${tabs.map(
        (t) => html`<button
          class=${"tab" + (this.tab === t.id ? " active" : "")}
          @click=${() => (this.tab = t.id)}
        >
          ${t.label}
        </button>`
      )}
    </div>`;
  }

  /** A labelled free-text field bound to one string property, emitting `change` on input. */
  private renderTextField(label: string, value: string, assign: (v: string) => void, placeholder = "") {
    return html`<label class="field grow">
      ${label}
      <input
        class="text-input"
        .value=${value}
        placeholder=${placeholder}
        @input=${(e: Event) => {
          assign((e.target as HTMLInputElement).value);
          this.emitChange();
        }}
      />
    </label>`;
  }

  // ── Credits tab (author / composer / music director / performing artist) ──
  private renderCreditsTab() {
    return html`<div class="meta-grid">
      ${this.renderTextField("Author (lyricist)", this.author, (v) => (this.author = v), "e.g. Charles Wesley")}
      ${this.renderTextField("Composer", this.composer, (v) => (this.composer = v), "e.g. Felix Mendelssohn")}
      ${this.renderTextField("Music director", this.musicDirector, (v) => (this.musicDirector = v))}
      ${this.renderTextField("Performing artist", this.artist, (v) => (this.artist = v))}
    </div>`;
  }

  // ── Permissions tab (copyright / license / usage) — each a full line in the credits footer ──
  private renderPermissionsTab() {
    return html`<div class="perm-fields">
      ${this.renderTextField("Copyright", this.copyright, (v) => (this.copyright = v), "e.g. © 2026 World Healing Music")}
      ${this.renderTextField("License", this.license, (v) => (this.license = v), "e.g. CCLI License #1234567")}
      ${this.renderTextField("Permissions", this.permissions, (v) => (this.permissions = v), "e.g. Used by permission.")}
    </div>`;
  }

  // ── Music tab (chords flag + performance metadata) ──
  private renderMusicTab() {
    return html`
      <label class="check">
        <input
          type="checkbox"
          .checked=${this.hasChords}
          @change=${(e: Event) => {
            this.hasChords = (e.target as HTMLInputElement).checked;
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
            @input=${(e: Event) => {
              this.tempo = Number((e.target as HTMLInputElement).value) || 0;
              this.emitChange();
            }}
          />
        </label>
        <label class="field">
          Preferred key
          <select
            @change=${(e: Event) => {
              this.preferredKey = (e.target as HTMLSelectElement).value;
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
            @change=${(e: Event) => {
              this.mode = (e.target as HTMLSelectElement).value;
              this.emitChange();
            }}
          >
            <option value="" .selected=${!this.mode}>—</option>
            <option value="major" .selected=${this.mode === "major"}>Major</option>
            <option value="minor" .selected=${this.mode === "minor"}>Minor</option>
          </select>
        </label>
        ${this.renderTextField("Time signature", this.timeSignature, (v) => (this.timeSignature = v), "e.g. 4/4")}
        ${this.renderTextField("Rhythm pattern", this.rhythmPattern, (v) => (this.rhythmPattern = v), "e.g. D DU UDU")}
      </div>
    `;
  }

  private renderTransposeToolbar() {
    const instruments: Instrument[] = ["piano", "guitar", "ukulele"];
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

  private renderChordsTab() {
    const chords = getChordsInSong(this.body, this.transpose);
    const instruments: Instrument[] = ["piano", "guitar", "ukulele"];
    return html`
      ${chords.length
        ? html`<div class="meta-grid chords-credit">
            ${this.renderTextField(
              "Chords contributed by",
              this.chordsContributedBy,
              (v) => (this.chordsContributedBy = v),
              "Credit the chords contributor"
            )}
          </div>`
        : nothing}
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
      ${chords.length
        ? html`<div class="diagrams">
            ${chords.map(
              (c) => html`<chord-diagram .chord=${c} .instrument=${this.instrument}></chord-diagram>`
            )}
          </div>`
        : html`<div class="empty">No chords yet — add some like [C] or [G7] in the lyrics.</div>`}
    `;
  }

  private renderTransliterationsTab() {
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
            @click=${() => (this.xlitTab = i)}
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
            @input=${(e: Event) => this.updateTransliteration(activeIdx, { title: (e.target as HTMLInputElement).value })}
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
            @input=${(e: Event) => this.updateTransliteration(activeIdx, { transliteratedBy: (e.target as HTMLInputElement).value })}
          />
        </label>
        <span class="spacer" style="margin-left:auto"></span>
        <button @click=${() => this.removeTransliteration(activeIdx)}>Remove</button>
      </div>
      <div class="body split">
        <textarea
          .value=${active.body}
          @input=${(e: Event) => this.updateTransliteration(activeIdx, { body: (e.target as HTMLTextAreaElement).value })}
          spellcheck="false"
          placeholder="Transliterated lyrics with the same [chords]"
        ></textarea>
        ${this.renderSheet(active.body)}
      </div>
    `;
  }

  private renderLine(line: SheetLine) {
    if (line.type === "blank") return html`<div class="blank"></div>`;
    if (line.type === "section")
      return html`<div class="section">${line.label}</div>`;
    return html`<div class="line">
      ${line.segments.map(
        (s) => html`<span class="seg"
          ><span class="chord">${s.chord ?? "\u00A0"}</span
          ><span class="lyric">${s.text || (s.chord ? "\u00A0" : "")}</span
        ></span>`
      )}
    </div>`;
  }

  /**
   * Credits / licensing footer shown as fine print under the lyrics. Each line appears only when its
   * source field is non-empty. Author/composer get a prefix; copyright/permissions/license are shown
   * verbatim as entered (docs/21).
   */
  private renderCreditsFooter() {
    const lines = [
      this.author.trim() ? `Written by ${this.author.trim()}` : "",
      this.composer.trim() ? `Composed by ${this.composer.trim()}` : "",
      this.copyright.trim(),
      this.permissions.trim(),
      this.license.trim(),
    ].filter((l) => l);
    if (!lines.length) return nothing;
    return html`<div class="credits-footer">
      ${lines.map((l) => html`<div class="credit-line">${l}</div>`)}
    </div>`;
  }

  private renderSheet(body: string = this.body) {
    // Lyrics-only songs (no official chords) drop embedded chords + inter-line blanks.
    const lines = displayLines(parseChordPro(body, this.transpose), this.hasChords);
    const displayKey = this.songKey ? transposeNote(this.songKey, this.transpose) : "";
    const offset = this.transpose !== 0 ? ` (${this.transpose > 0 ? "+" : ""}${this.transpose})` : "";

    // Group lines into section blocks so each section can be colour-tagged (data-section),
    // which mobile apps read for background colours.
    type Block = { type: SectionType | null; label: string | null; lines: SheetLine[] };
    const blocks: Block[] = [];
    let cur: Block = { type: null, label: null, lines: [] };
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
            ${this.artist}${this.artist && displayKey ? " · " : ""}${displayKey ? "Key of " + displayKey : ""}${offset}
          </div>
        </div>
        ${blocks.map(
          (b) => html`<div class="block" data-section=${b.type ?? nothing}>
            ${b.label ? html`<div class="section">${b.label}</div>` : nothing}
            ${b.lines.map((line) => this.renderLine(line))}
          </div>`
        )}
        ${this.renderCreditsFooter()}
      </div>
    `;
  }

  render() {
    // Read-only: just the rendered sheet (+ optional diagram strip) — song/display views.
    if (this.readonly) {
      const chords = getChordsInSong(this.body, this.transpose);
      return html`
        ${this.renderSheet()}
        ${this.hasChords && this.showDiagrams && chords.length
          ? html`<div class="diagrams-label">Chords used — ${this.instrument}</div>
              <div class="diagrams">
                ${chords.map(
                  (c) => html`<chord-diagram .chord=${c} .instrument=${this.instrument}></chord-diagram>`
                )}
              </div>`
          : nothing}
      `;
    }

    // Editor: title/language/key fields, then tabbed Editor / Transliterations / Chords.
    return html`
      ${this.renderFields()}
      ${this.renderTabs()}
      ${this.tab === "editor"
        ? html`
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
          `
        : this.tab === "credits"
          ? this.renderCreditsTab()
          : this.tab === "music"
            ? this.renderMusicTab()
            : this.tab === "translit"
              ? this.renderTransliterationsTab()
              : this.tab === "chords"
                ? this.renderChordsTab()
                : this.renderPermissionsTab()}
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "chord-sheet": ChordSheet;
    "chord-diagram": ChordDiagram;
  }
}

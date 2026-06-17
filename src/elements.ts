/**
 * Musically — Web Components (Lit)
 * Defines <chord-sheet> and <chord-diagram>, built on the framework-agnostic
 * core in ./index. Importing this module registers both custom elements.
 *
 * Theme via CSS custom properties on the element or a parent:
 *   --musically-accent   chord / highlight color   (#1d4ed8)
 *   --musically-root     root-note highlight        (#1e3a8a)
 *   --musically-paper    sheet / white-key bg       (#fffdf8)
 *   --musically-text     lyric color                (#33312c)
 *   --musically-border   card / divider color       (#e4dcc8)
 *   --musically-muted    secondary text             (#8a8169)
 *   --musically-font     sheet font family
 */

import { LitElement, html, css, nothing } from "lit";
import { customElement, property } from "lit/decorators.js";
import { unsafeHTML } from "lit/directives/unsafe-html.js";
import {
  parseChordPro,
  getChordsInSong,
  chordNotes,
  getDiagramSVG,
  transposeNote,
} from "./index.js";
import type { Instrument, SheetLine } from "./index.js";

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
  /** Artist / author. */
  @property() artist = "";
  /** Original key; transposes along with the song. */
  @property({ attribute: "song-key" }) songKey = "";
  /** Semitones to shift all chords. */
  @property({ type: Number }) transpose = 0;
  /** Diagram instrument. */
  @property() instrument: Instrument = "piano";
  /** Toggle the "chords used" diagram strip. */
  @property({ type: Boolean, attribute: "show-diagrams" }) showDiagrams = true;
  /** Hide the editor + toolbar and render only the sheet. */
  @property({ type: Boolean }) readonly = false;

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
    button.active {
      background: var(--musically-accent, #1d4ed8);
      border-color: var(--musically-accent, #1d4ed8);
      color: #fff;
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
      border-radius: 10px;
      padding: 26px 30px;
      box-shadow: 0 1px 3px rgba(80, 70, 40, 0.08);
    }
    .header {
      border-bottom: 1px solid var(--musically-border, #ece3cf);
      padding-bottom: 12px;
      margin-bottom: 18px;
    }
    .header .title {
      font-size: 22px;
      font-weight: 700;
    }
    .header .meta {
      font-size: 13px;
      color: var(--musically-muted, #8a8169);
      margin-top: 2px;
    }
    .section {
      font-weight: 700;
      color: var(--musically-accent, #1d4ed8);
      font-size: 13px;
      letter-spacing: 1px;
      text-transform: uppercase;
      margin: 18px 0 6px;
    }
    .section:first-child {
      margin-top: 0;
    }
    .blank {
      height: 12px;
    }
    .line {
      margin-bottom: 10px;
      line-height: 1.1;
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
      font-size: 12.5px;
      height: 1.4em;
      white-space: pre;
    }
    .seg .lyric {
      white-space: pre;
      font-size: 16px;
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
  `;

  private emitChange() {
    this.dispatchEvent(
      new CustomEvent("change", {
        detail: {
          body: this.body,
          title: this.title,
          artist: this.artist,
          transpose: this.transpose,
          instrument: this.instrument,
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

  private renderSheet() {
    const lines = parseChordPro(this.body, this.transpose);
    const displayKey = this.songKey
      ? transposeNote(this.songKey, this.transpose)
      : "";
    const offset =
      this.transpose !== 0
        ? ` (${this.transpose > 0 ? "+" : ""}${this.transpose})`
        : "";
    return html`
      <div class="sheet">
        <div class="header">
          <div class="title">${this.title || "Untitled"}</div>
          <div class="meta">
            ${this.artist}${this.artist && displayKey ? " · " : ""}${displayKey
              ? "Key of " + displayKey
              : ""}${offset}
          </div>
        </div>
        ${lines.map((line) => this.renderLine(line))}
      </div>
    `;
  }

  render() {
    const chords = getChordsInSong(this.body, this.transpose);
    const instruments: Instrument[] = ["piano", "guitar", "ukulele"];
    return html`
      ${this.readonly
        ? nothing
        : html`
            <div class="toolbar">
              <div class="group">
                <span class="label">Transpose</span>
                <button class="step" @click=${() => this.setTranspose(this.transpose - 1)}>
                  −
                </button>
                <span class="step-val"
                  >${this.transpose > 0 ? "+" : ""}${this.transpose}</span
                >
                <button class="step" @click=${() => this.setTranspose(this.transpose + 1)}>
                  +
                </button>
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
          `}

      <div class="body ${this.readonly ? "" : "split"}">
        ${this.readonly
          ? nothing
          : html`<textarea
              .value=${this.body}
              @input=${this.onInput}
              spellcheck="false"
              placeholder="# Verse 1&#10;[C]Type your lyrics with [G]chords in brackets"
            ></textarea>`}
        ${this.renderSheet()}
      </div>

      ${this.showDiagrams && chords.length
        ? html`
            <div class="diagrams-label">Chords used — ${this.instrument}</div>
            <div class="diagrams">
              ${chords.map(
                (c) =>
                  html`<chord-diagram
                    .chord=${c}
                    .instrument=${this.instrument}
                  ></chord-diagram>`
              )}
            </div>
          `
        : nothing}
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "chord-sheet": ChordSheet;
    "chord-diagram": ChordDiagram;
  }
}

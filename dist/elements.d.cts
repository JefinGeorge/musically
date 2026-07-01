import * as lit_html from 'lit-html';
import * as lit from 'lit';
import { LitElement, nothing } from 'lit';
import { Instrument } from './index.cjs';

/** A language option for the editor's dropdowns. */
interface LanguageOption {
    code: string;
    name: string;
}
/** An alternate-script version of the lyrics: its own language + ChordPro body. */
interface Transliteration {
    language: string;
    body: string;
}
declare class ChordDiagram extends LitElement {
    /** Chord symbol, e.g. "Cmaj7", "F#m", "D/F#". */
    chord: string;
    /** Instrument to draw the diagram for. */
    instrument: Instrument;
    /** Hide the chord name and note list, showing only the diagram. */
    diagramOnly: boolean;
    static styles: lit.CSSResult;
    private themeOptions;
    render(): typeof nothing | lit_html.TemplateResult<1>;
}
declare class ChordSheet extends LitElement {
    /** Lyrics with inline [chords]. Lines starting with "#" become section labels. */
    body: string;
    /** Song title shown in the header. */
    title: string;
    /** Artist / author. */
    artist: string;
    /** Original key; transposes along with the song. */
    songKey: string;
    /** Semitones to shift all chords. */
    transpose: number;
    /** Diagram instrument. */
    instrument: Instrument;
    /** Toggle the "chords used" diagram strip. */
    showDiagrams: boolean;
    /** Hide the editor + toolbar and render only the sheet. */
    readonly: boolean;
    /** BCP-47 language of the primary lyrics (drives the language picker's value). */
    language: string;
    /** Options for the language dropdowns. When empty the current value is still shown. */
    languages: LanguageOption[];
    /** Alternate-script versions of the lyrics, each with its own language + ChordPro body. */
    transliterations: Transliteration[];
    /** Which editor tab is active. */
    private tab;
    /** Which transliteration tab is active (index into transliterations). */
    private xlitTab;
    static styles: lit.CSSResult;
    private emitChange;
    private onInput;
    private setTranspose;
    private setInstrument;
    private addTransliteration;
    private updateTransliteration;
    private removeTransliteration;
    private langName;
    private renderLangSelect;
    private renderFields;
    private renderTabs;
    private renderTransposeToolbar;
    private renderChordsTab;
    private renderTransliterationsTab;
    private renderLine;
    private renderSheet;
    render(): lit_html.TemplateResult<1>;
}
declare global {
    interface HTMLElementTagNameMap {
        "chord-sheet": ChordSheet;
        "chord-diagram": ChordDiagram;
    }
}

export { ChordDiagram, ChordSheet, type LanguageOption, type Transliteration };

/**
 * Musically — framework-agnostic core
 * Chord theory, ChordPro parsing, and SVG chord-diagram generation.
 * No framework and no DOM dependencies — safe to use in React, Angular,
 * plain HTML, Node, or SSR.
 */
type Instrument = "piano" | "guitar" | "ukulele";
interface ParsedChord {
    /** Root note, e.g. "C", "F#", "Bb" */
    root: string;
    /** Quality / suffix, e.g. "m7", "maj7", "sus4" ("" for a major triad) */
    quality: string;
    /** Bass note after a slash, e.g. the "F#" in "D/F#", or null */
    bass: string | null;
}
interface ChordSegment {
    /** Chord shown above this chunk of text, or null for plain lyric text */
    chord: string | null;
    /** The lyric text this segment carries */
    text: string;
}
/** Canonical song-section types, derived from a section header so apps can colour them. */
declare const SECTION_TYPES: readonly ["intro", "verse", "pre-chorus", "chorus", "bridge", "outro", "section"];
type SectionType = (typeof SECTION_TYPES)[number];
/** Infer a canonical [SectionType] from a section header label (e.g. "Pre-Chorus 2" → "pre-chorus"). */
declare function sectionTypeFromLabel(label: string): SectionType;
/** Musical keys for the editor's key picker: majors then minors, both enharmonic spellings. */
declare const SONG_KEYS: string[];
type SheetLine = {
    type: "section";
    label: string;
    sectionType: SectionType;
} | {
    type: "lyric";
    segments: ChordSegment[];
} | {
    type: "blank";
};
interface DiagramOptions {
    /** Highlight color for chord tones (default "#1d4ed8") */
    accent?: string;
    /** Highlight color for the root note (default "#1e3a8a") */
    root?: string;
    /** Background of unpressed piano white keys / paper (default "#fffdf8") */
    paper?: string;
    /** Unpressed piano black keys (default "#3a352c") */
    black?: string;
    /** Strong lines: nut, key borders (default "#3a352c") */
    line?: string;
    /** Light lines: frets, strings (default "#cdc4b0") */
    lineLight?: string;
    /** Muted / open string markers (default "#9a917c") */
    muted?: string;
}
declare const SHARP_NOTES: readonly ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
declare const GUITAR_SHAPES: Record<string, number[]>;
declare const UKULELE_SHAPES: Record<string, number[]>;
/** Parse a chord symbol into root / quality / bass. Returns null if unparseable. */
declare function parseChord(symbol: string): ParsedChord | null;
/** Transpose a single note name by a number of semitones (output uses sharps). */
declare function transposeNote(note: string, steps: number): string;
/** Transpose a full chord symbol (including any slash bass) by semitones. */
declare function transposeChord(symbol: string, steps: number): string;
/** Get the interval pattern (semitones from root) for a chord quality. */
declare function qualityIntervals(quality: string): number[];
/** Get the note names that make up a chord, e.g. chordNotes("Cmaj7") -> ["C","E","G","B"]. */
declare function chordNotes(symbol: string): string[];
/** Look up a fingering shape for a chord on guitar or ukulele. Returns null if not in the library. */
declare function getShape(symbol: string, instrument: "guitar" | "ukulele"): number[] | null;
/** Parse a single line of ChordPro-style text into chord/text segments. */
declare function parseLine(line: string): ChordSegment[];
/**
 * Parse a whole song into structured lines.
 * Lines starting with "#" become section labels; blank lines are preserved.
 * Pass a `transpose` value to shift every chord in the output.
 */
declare function parseChordPro(text: string, transpose?: number): SheetLine[];
/** Collect the unique chords used in a song, in order of first appearance. */
declare function getChordsInSong(text: string, transpose?: number): string[];
/**
 * Generate a chord diagram as an SVG string.
 * Piano works for any chord (computed from theory); guitar/ukulele use the
 * built-in shape library and fall back to a placeholder when a shape is unknown.
 */
declare function getDiagramSVG(symbol: string, instrument?: Instrument, options?: DiagramOptions): string;

export { type ChordSegment, type DiagramOptions, GUITAR_SHAPES, type Instrument, type ParsedChord, SECTION_TYPES, SHARP_NOTES, SONG_KEYS, type SectionType, type SheetLine, UKULELE_SHAPES, chordNotes, getChordsInSong, getDiagramSVG, getShape, parseChord, parseChordPro, parseLine, qualityIntervals, sectionTypeFromLabel, transposeChord, transposeNote };

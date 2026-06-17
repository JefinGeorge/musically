import { describe, it, expect } from "vitest";
import {
  SHARP_NOTES,
  GUITAR_SHAPES,
  UKULELE_SHAPES,
  parseChord,
  transposeNote,
  transposeChord,
  qualityIntervals,
  chordNotes,
  getShape,
  parseLine,
  parseChordPro,
  getChordsInSong,
  getDiagramSVG,
  type SheetLine,
} from "../src/index.js";

describe("parseChord", () => {
  it("parses a bare major triad", () => {
    expect(parseChord("C")).toEqual({ root: "C", quality: "", bass: null });
  });

  it("parses sharps and flats in the root", () => {
    expect(parseChord("F#m")).toEqual({ root: "F#", quality: "m", bass: null });
    expect(parseChord("Bb7")).toEqual({ root: "Bb", quality: "7", bass: null });
  });

  it("uppercases the root letter but preserves the accidental", () => {
    expect(parseChord("c#")).toEqual({ root: "C#", quality: "", bass: null });
    expect(parseChord("gb")).toEqual({ root: "Gb", quality: "", bass: null });
  });

  it("captures the quality / suffix", () => {
    expect(parseChord("Gmaj7")).toEqual({ root: "G", quality: "maj7", bass: null });
    expect(parseChord("Dsus4")).toEqual({ root: "D", quality: "sus4", bass: null });
  });

  it("splits a slash bass note", () => {
    expect(parseChord("D/F#")).toEqual({ root: "D", quality: "", bass: "F#" });
    expect(parseChord("Am7/G")).toEqual({ root: "A", quality: "m7", bass: "G" });
  });

  it("returns null for input that does not start with a note letter", () => {
    expect(parseChord("H")).toBeNull();
    expect(parseChord("")).toBeNull();
    expect(parseChord("123")).toBeNull();
  });

  it("coerces non-string input via String()", () => {
    // @ts-expect-error exercising runtime coercion
    expect(parseChord(null)).toBeNull();
  });
});

describe("transposeNote", () => {
  it("shifts a note up by semitones", () => {
    expect(transposeNote("C", 2)).toBe("D");
    expect(transposeNote("C", 1)).toBe("C#");
  });

  it("shifts down with negative steps", () => {
    expect(transposeNote("C", -1)).toBe("B");
    expect(transposeNote("C", -2)).toBe("A#");
  });

  it("wraps around the octave", () => {
    expect(transposeNote("A", 3)).toBe("C");
    expect(transposeNote("B", 1)).toBe("C");
  });

  it("handles large offsets within the range the +1200 guard covers", () => {
    expect(transposeNote("C", 12)).toBe("C");
    expect(transposeNote("C", -12)).toBe("C");
    // The +1200 offset keeps any step down to -1200 non-negative before the modulo.
    expect(transposeNote("C", -11)).toBe("C#");
    expect(transposeNote("C", -1199)).toBe("C#");
  });

  it("normalizes flats to their sharp spelling on output", () => {
    expect(transposeNote("Db", 0)).toBe("C#");
    expect(transposeNote("Bb", 2)).toBe("C");
  });

  it("is case-insensitive on input", () => {
    expect(transposeNote("c", 2)).toBe("D");
  });

  it("returns the input unchanged for an unknown note", () => {
    expect(transposeNote("H", 2)).toBe("H");
  });
});

describe("transposeChord", () => {
  it("returns the symbol unchanged when steps is 0", () => {
    expect(transposeChord("C/E", 0)).toBe("C/E");
  });

  it("transposes the root and keeps the quality", () => {
    expect(transposeChord("Cmaj7", 2)).toBe("Dmaj7");
    expect(transposeChord("Am", 3)).toBe("Cm");
  });

  it("transposes both the root and the slash bass", () => {
    expect(transposeChord("D/F#", 2)).toBe("E/G#");
  });

  it("returns the input unchanged when it cannot be parsed", () => {
    expect(transposeChord("H7", 2)).toBe("H7");
  });
});

describe("qualityIntervals", () => {
  it("returns the major triad for an empty quality", () => {
    expect(qualityIntervals("")).toEqual([0, 4, 7]);
  });

  it("looks up known qualities", () => {
    expect(qualityIntervals("m")).toEqual([0, 3, 7]);
    expect(qualityIntervals("maj7")).toEqual([0, 4, 7, 11]);
    expect(qualityIntervals("dim7")).toEqual([0, 3, 6, 9]);
  });

  it("trims surrounding whitespace before lookup", () => {
    expect(qualityIntervals("  m7  ")).toEqual([0, 3, 7, 10]);
  });

  it("falls back to a major triad for unknown qualities", () => {
    expect(qualityIntervals("wat")).toEqual([0, 4, 7]);
  });
});

describe("chordNotes", () => {
  it("computes a major triad", () => {
    expect(chordNotes("C")).toEqual(["C", "E", "G"]);
  });

  it("computes a seventh chord", () => {
    expect(chordNotes("Cmaj7")).toEqual(["C", "E", "G", "B"]);
    expect(chordNotes("G7")).toEqual(["G", "B", "D", "F"]);
  });

  it("wraps notes across the octave boundary", () => {
    expect(chordNotes("Am")).toEqual(["A", "C", "E"]);
  });

  it("works from a flat root (normalized to sharps)", () => {
    expect(chordNotes("Bb")).toEqual(["A#", "D", "F"]);
  });

  it("returns an empty array for an unparseable symbol", () => {
    expect(chordNotes("H")).toEqual([]);
    expect(chordNotes("")).toEqual([]);
  });
});

describe("getShape", () => {
  it("looks up a basic guitar shape", () => {
    expect(getShape("C", "guitar")).toEqual(GUITAR_SHAPES.C);
    expect(getShape("Em", "guitar")).toEqual([0, 2, 2, 0, 0, 0]);
  });

  it("looks up a ukulele shape", () => {
    expect(getShape("C", "ukulele")).toEqual([0, 0, 0, 3]);
  });

  it("normalizes a flat root to its sharp key (Bb -> A#)", () => {
    expect(getShape("Bb", "guitar")).toEqual(GUITAR_SHAPES["A#"]);
  });

  it("maps quality aliases through QUALITY_TOKEN (min -> m)", () => {
    expect(getShape("Amin", "guitar")).toEqual(GUITAR_SHAPES.Am);
  });

  it("strips whitespace inside the quality before token lookup", () => {
    expect(getShape("A min", "guitar")).toEqual(GUITAR_SHAPES.Am);
  });

  it("returns null when no shape exists in the library", () => {
    expect(getShape("C#dim", "guitar")).toBeNull();
    expect(getShape("F", "ukulele")).not.toBeNull();
    expect(getShape("Bm", "ukulele")).toBeNull();
  });

  it("returns null for an unparseable symbol", () => {
    expect(getShape("H", "guitar")).toBeNull();
  });
});

describe("parseLine", () => {
  it("returns a single plain-text segment for a chordless line", () => {
    expect(parseLine("just lyrics")).toEqual([{ chord: null, text: "just lyrics" }]);
  });

  it("pairs a chord with the text that follows it", () => {
    expect(parseLine("[C]Hello")).toEqual([{ chord: "C", text: "Hello" }]);
  });

  it("keeps leading lyric text before the first chord", () => {
    expect(parseLine("Oh [G]when the saints")).toEqual([
      { chord: null, text: "Oh " },
      { chord: "G", text: "when the saints" },
    ]);
  });

  it("handles multiple chords in one line", () => {
    expect(parseLine("[C]Twin[G]kle [Am]star")).toEqual([
      { chord: "C", text: "Twin" },
      { chord: "G", text: "kle " },
      { chord: "Am", text: "star" },
    ]);
  });

  it("handles adjacent chords with no text between them", () => {
    expect(parseLine("[C][G]end")).toEqual([
      { chord: "C", text: "" },
      { chord: "G", text: "end" },
    ]);
  });

  it("handles a trailing chord with no following text", () => {
    expect(parseLine("end[C]")).toEqual([
      { chord: null, text: "end" },
      { chord: "C", text: "" },
    ]);
  });

  it("returns a single empty segment for an empty line", () => {
    expect(parseLine("")).toEqual([{ chord: null, text: "" }]);
  });
});

describe("parseChordPro", () => {
  it("marks blank lines", () => {
    const lines = parseChordPro("\n   \n");
    expect(lines.every((l) => l.type === "blank")).toBe(true);
  });

  it("turns leading-# lines into section labels", () => {
    const [line] = parseChordPro("# Verse 1");
    expect(line).toEqual({ type: "section", label: "Verse 1" });
  });

  it("parses lyric lines into segments", () => {
    const [line] = parseChordPro("[C]Hi") as SheetLine[];
    expect(line).toEqual({ type: "lyric", segments: [{ chord: "C", text: "Hi" }] });
  });

  it("transposes every chord when given a transpose value", () => {
    const [line] = parseChordPro("[C]Hi [G]there", 2);
    expect(line).toEqual({
      type: "lyric",
      segments: [
        { chord: "D", text: "Hi " },
        { chord: "A", text: "there" },
      ],
    });
  });

  it("leaves plain-text (null-chord) segments untouched when transposing", () => {
    const [line] = parseChordPro("just words", 5);
    expect(line).toEqual({ type: "lyric", segments: [{ chord: null, text: "just words" }] });
  });

  it("parses a multi-line song into a mix of line types", () => {
    const song = "# Verse\n[C]Line one\n\nplain";
    const types = parseChordPro(song).map((l) => l.type);
    expect(types).toEqual(["section", "lyric", "blank", "lyric"]);
  });
});

describe("getChordsInSong", () => {
  it("collects unique chords in first-appearance order", () => {
    const song = "[C]a [G]b [C]c [Am]d";
    expect(getChordsInSong(song)).toEqual(["C", "G", "Am"]);
  });

  it("returns an empty list for a song with no chords", () => {
    expect(getChordsInSong("just lyrics\nmore lyrics")).toEqual([]);
  });

  it("ignores section and blank lines", () => {
    expect(getChordsInSong("# Chorus\n\n[D]hey")).toEqual(["D"]);
  });

  it("reflects transposition in the collected chords", () => {
    expect(getChordsInSong("[C]a [G]b", 2)).toEqual(["D", "A"]);
  });
});

describe("getDiagramSVG", () => {
  it("defaults to a piano diagram", () => {
    const svg = getDiagramSVG("C");
    expect(svg).toMatch(/^<svg[\s\S]*<\/svg>$/);
    expect(svg).toContain("<rect");
  });

  it("produces a fretboard diagram for a known guitar shape", () => {
    const svg = getDiagramSVG("C", "guitar");
    expect(svg).toContain("<svg");
    expect(svg).toContain("<circle");
  });

  it("produces a fretboard diagram for a known ukulele shape", () => {
    const svg = getDiagramSVG("C", "ukulele");
    expect(svg).toContain("<svg");
  });

  it("falls back to a 'no shape' placeholder for an unknown guitar shape", () => {
    const svg = getDiagramSVG("C#dim", "guitar");
    expect(svg).toContain("no shape");
  });

  it("applies custom colors from options", () => {
    const svg = getDiagramSVG("C", "piano", { accent: "#ff0000" });
    expect(svg).toContain("#ff0000");
  });

  it("renders mute (×) and open (○) markers on the fretboard", () => {
    // C major on guitar is [-1, 3, 2, 0, 1, 0] -> has a mute and open strings
    const svg = getDiagramSVG("C", "guitar");
    expect(svg).toContain("×");
    expect(svg).toContain("<circle"); // open-string ring
  });
});

describe("note tables (sanity)", () => {
  it("SHARP_NOTES has 12 entries starting at C", () => {
    expect(SHARP_NOTES).toHaveLength(12);
    expect(SHARP_NOTES[0]).toBe("C");
  });

  it("guitar shapes are 6 strings, ukulele shapes are 4", () => {
    expect(GUITAR_SHAPES.C).toHaveLength(6);
    expect(UKULELE_SHAPES.C).toHaveLength(4);
  });
});

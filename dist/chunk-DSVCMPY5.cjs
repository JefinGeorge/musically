'use strict';

var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __decorateClass = (decorators, target, key, kind) => {
  var result = kind > 1 ? void 0 : kind ? __getOwnPropDesc(target, key) : target;
  for (var i = decorators.length - 1, decorator; i >= 0; i--)
    if (decorator = decorators[i])
      result = (kind ? decorator(target, key, result) : decorator(result)) || result;
  if (kind && result) __defProp(target, key, result);
  return result;
};

// src/index.ts
var SECTION_TYPES = [
  "intro",
  "verse",
  "pre-chorus",
  "chorus",
  "bridge",
  "outro",
  "section"
];
function sectionTypeFromLabel(label) {
  const s = label.toLowerCase().replace(/[\s_-]+/g, "");
  if (s.startsWith("intro")) return "intro";
  if (s.startsWith("prechorus") || s.startsWith("prehook")) return "pre-chorus";
  if (s.startsWith("chorus") || s.startsWith("refrain") || s.startsWith("hook")) return "chorus";
  if (s.startsWith("verse")) return "verse";
  if (s.startsWith("bridge")) return "bridge";
  if (s.startsWith("outro") || s.startsWith("ending") || s.startsWith("coda")) return "outro";
  return "section";
}
var SONG_KEYS = [
  "C",
  "C#",
  "Db",
  "D",
  "D#",
  "Eb",
  "E",
  "F",
  "F#",
  "Gb",
  "G",
  "G#",
  "Ab",
  "A",
  "A#",
  "Bb",
  "B",
  "Cm",
  "C#m",
  "Dbm",
  "Dm",
  "D#m",
  "Ebm",
  "Em",
  "Fm",
  "F#m",
  "Gbm",
  "Gm",
  "G#m",
  "Abm",
  "Am",
  "A#m",
  "Bbm",
  "Bm"
];
var SHARP_NOTES = [
  "C",
  "C#",
  "D",
  "D#",
  "E",
  "F",
  "F#",
  "G",
  "G#",
  "A",
  "A#",
  "B"
];
var NOTE_INDEX = {
  C: 0,
  "B#": 0,
  "C#": 1,
  DB: 1,
  D: 2,
  "D#": 3,
  EB: 3,
  E: 4,
  FB: 4,
  "E#": 5,
  F: 5,
  "F#": 6,
  GB: 6,
  G: 7,
  "G#": 8,
  AB: 8,
  A: 9,
  "A#": 10,
  BB: 10,
  B: 11,
  CB: 11
};
var QUALITY_INTERVALS = {
  "": [0, 4, 7],
  maj: [0, 4, 7],
  M: [0, 4, 7],
  major: [0, 4, 7],
  m: [0, 3, 7],
  min: [0, 3, 7],
  "-": [0, 3, 7],
  minor: [0, 3, 7],
  "5": [0, 7],
  "6": [0, 4, 7, 9],
  m6: [0, 3, 7, 9],
  min6: [0, 3, 7, 9],
  "7": [0, 4, 7, 10],
  dom7: [0, 4, 7, 10],
  maj7: [0, 4, 7, 11],
  M7: [0, 4, 7, 11],
  major7: [0, 4, 7, 11],
  m7: [0, 3, 7, 10],
  min7: [0, 3, 7, 10],
  "-7": [0, 3, 7, 10],
  m7b5: [0, 3, 6, 10],
  min7b5: [0, 3, 6, 10],
  dim: [0, 3, 6],
  o: [0, 3, 6],
  dim7: [0, 3, 6, 9],
  o7: [0, 3, 6, 9],
  aug: [0, 4, 8],
  "+": [0, 4, 8],
  sus2: [0, 2, 7],
  sus4: [0, 5, 7],
  sus: [0, 5, 7],
  "9": [0, 4, 7, 10, 14],
  maj9: [0, 4, 7, 11, 14],
  m9: [0, 3, 7, 10, 14],
  add9: [0, 4, 7, 14],
  madd9: [0, 3, 7, 14]
};
var QUALITY_TOKEN = {
  "": "",
  maj: "",
  M: "",
  major: "",
  m: "m",
  min: "m",
  "-": "m",
  minor: "m",
  "7": "7",
  dom7: "7",
  maj7: "maj7",
  M7: "maj7",
  major7: "maj7",
  m7: "m7",
  min7: "m7",
  "-7": "m7",
  dim: "dim",
  o: "dim",
  aug: "aug",
  "+": "aug",
  sus4: "sus4",
  sus: "sus4",
  sus2: "sus2",
  "6": "6",
  m6: "m6",
  add9: "add9"
};
var GUITAR_SHAPES = {
  C: [-1, 3, 2, 0, 1, 0],
  Cmaj7: [-1, 3, 2, 0, 0, 0],
  C7: [-1, 3, 2, 3, 1, 0],
  Cadd9: [-1, 3, 2, 0, 3, 0],
  D: [-1, -1, 0, 2, 3, 2],
  Dm: [-1, -1, 0, 2, 3, 1],
  D7: [-1, -1, 0, 2, 1, 2],
  Dmaj7: [-1, -1, 0, 2, 2, 2],
  Dm7: [-1, -1, 0, 2, 1, 1],
  Dsus4: [-1, -1, 0, 2, 3, 3],
  Dsus2: [-1, -1, 0, 2, 3, 0],
  E: [0, 2, 2, 1, 0, 0],
  Em: [0, 2, 2, 0, 0, 0],
  E7: [0, 2, 0, 1, 0, 0],
  Em7: [0, 2, 0, 0, 0, 0],
  Emaj7: [0, 2, 1, 1, 0, 0],
  Esus4: [0, 2, 2, 2, 0, 0],
  F: [1, 3, 3, 2, 1, 1],
  Fmaj7: [-1, -1, 3, 2, 1, 0],
  F7: [1, 3, 1, 2, 1, 1],
  G: [3, 2, 0, 0, 0, 3],
  G7: [3, 2, 0, 0, 0, 1],
  Gmaj7: [3, 2, 0, 0, 0, 2],
  A: [-1, 0, 2, 2, 2, 0],
  Am: [-1, 0, 2, 2, 1, 0],
  A7: [-1, 0, 2, 0, 2, 0],
  Amaj7: [-1, 0, 2, 1, 2, 0],
  Am7: [-1, 0, 2, 0, 1, 0],
  Asus4: [-1, 0, 2, 2, 3, 0],
  Asus2: [-1, 0, 2, 2, 0, 0],
  "A#": [-1, 1, 3, 3, 3, 1],
  B7: [-1, 2, 1, 2, 0, 2],
  Bm: [-1, 2, 4, 4, 3, 2]
};
var UKULELE_SHAPES = {
  C: [0, 0, 0, 3],
  Cmaj7: [0, 0, 0, 2],
  C7: [0, 0, 0, 1],
  D: [2, 2, 2, 0],
  Dm: [2, 2, 1, 0],
  D7: [2, 2, 2, 3],
  E: [4, 4, 4, 2],
  Em: [0, 4, 3, 2],
  E7: [1, 2, 0, 2],
  F: [2, 0, 1, 0],
  G: [0, 2, 3, 2],
  G7: [0, 2, 1, 2],
  Gmaj7: [0, 2, 2, 2],
  A: [2, 1, 0, 0],
  Am: [2, 0, 0, 0],
  A7: [0, 1, 0, 0],
  Amaj7: [1, 1, 0, 0],
  Am7: [0, 0, 0, 0],
  "A#": [3, 2, 1, 1],
  B7: [2, 3, 2, 2]
};
function parseChord(symbol) {
  const m = String(symbol).match(/^([A-Ga-g][#b]?)(.*)$/);
  if (!m) return null;
  const root = m[1][0].toUpperCase() + (m[1][1] || "");
  let rest = m[2];
  let bass = null;
  const slash = rest.indexOf("/");
  if (slash >= 0) {
    bass = rest.slice(slash + 1);
    rest = rest.slice(0, slash);
  }
  return { root, quality: rest, bass };
}
function transposeNote(note, steps) {
  const idx = NOTE_INDEX[String(note).toUpperCase()];
  if (idx == null) return note;
  return SHARP_NOTES[(idx + steps + 1200) % 12];
}
function transposeChord(symbol, steps) {
  if (!steps) return symbol;
  const p = parseChord(symbol);
  if (!p) return symbol;
  let out = transposeNote(p.root, steps) + p.quality;
  if (p.bass) out += "/" + transposeNote(p.bass, steps);
  return out;
}
function qualityIntervals(quality) {
  const q = (quality || "").trim();
  return QUALITY_INTERVALS[q] ?? [0, 4, 7];
}
function chordNotes(symbol) {
  const p = parseChord(symbol);
  if (!p) return [];
  const rootIdx = NOTE_INDEX[p.root.toUpperCase()];
  if (rootIdx == null) return [];
  return qualityIntervals(p.quality).map((i) => SHARP_NOTES[(rootIdx + i) % 12]);
}
function canonicalRoot(root) {
  const i = NOTE_INDEX[String(root).toUpperCase()];
  return i == null ? root : SHARP_NOTES[i];
}
function getShape(symbol, instrument) {
  const p = parseChord(symbol);
  if (!p) return null;
  const dict = instrument === "guitar" ? GUITAR_SHAPES : UKULELE_SHAPES;
  const token = QUALITY_TOKEN[(p.quality || "").replace(/\s/g, "")] ?? p.quality;
  return dict[canonicalRoot(p.root) + token] ?? null;
}
function parseLine(line) {
  const re = /\[([^\]]*)\]/g;
  const parts = [];
  let last = 0;
  let m;
  while ((m = re.exec(line)) !== null) {
    parts.push({ type: "text", text: line.slice(last, m.index) });
    parts.push({ type: "chord", chord: m[1] });
    last = re.lastIndex;
  }
  parts.push({ type: "text", text: line.slice(last) });
  const out = [];
  if (parts[0].type === "text" && parts[0].text !== "") {
    out.push({ chord: null, text: parts[0].text });
  }
  for (let i = 1; i < parts.length; i++) {
    const part = parts[i];
    if (part.type === "chord") {
      const nextPart = parts[i + 1];
      const next = nextPart && nextPart.type === "text" ? nextPart.text : "";
      out.push({ chord: part.chord, text: next });
      if (nextPart && nextPart.type === "text") i++;
    } else if (part.text) {
      out.push({ chord: null, text: part.text });
    }
  }
  if (out.length === 0) out.push({ chord: null, text: "" });
  return out;
}
function parseChordPro(text, transpose = 0) {
  return String(text).split("\n").map((raw) => {
    const trimmed = raw.trim();
    if (trimmed === "") return { type: "blank" };
    if (trimmed.startsWith("#")) {
      const label = trimmed.replace(/^#\s*/, "");
      return { type: "section", label, sectionType: sectionTypeFromLabel(label) };
    }
    let segments = parseLine(raw);
    if (transpose) {
      segments = segments.map((s) => ({
        ...s,
        chord: s.chord ? transposeChord(s.chord, transpose) : null
      }));
    }
    return { type: "lyric", segments };
  });
}
function displayLines(lines, hasChords) {
  if (hasChords) return lines;
  const out = [];
  for (const line of lines) {
    if (line.type === "blank") continue;
    if (line.type === "lyric") {
      out.push({ type: "lyric", segments: line.segments.map((s) => ({ chord: null, text: s.text })) });
    } else {
      out.push(line);
    }
  }
  return out;
}
function getChordsInSong(text, transpose = 0) {
  const seen = /* @__PURE__ */ new Set();
  const list = [];
  for (const line of parseChordPro(text, transpose)) {
    if (line.type !== "lyric") continue;
    for (const seg of line.segments) {
      if (seg.chord && !seen.has(seg.chord)) {
        seen.add(seg.chord);
        list.push(seg.chord);
      }
    }
  }
  return list;
}
var DEFAULTS = {
  accent: "#1d4ed8",
  root: "#1e3a8a",
  paper: "#fffdf8",
  black: "#3a352c",
  line: "#3a352c",
  lineLight: "#cdc4b0",
  muted: "#9a917c"
};
function svgWrap(width, height, body) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img">${body}</svg>`;
}
function pianoSVG(notes, o) {
  const pcs = new Set(notes.map((n) => NOTE_INDEX[n.toUpperCase()]));
  const rootPc = notes.length ? NOTE_INDEX[notes[0].toUpperCase()] : -1;
  const whitePcs = [0, 2, 4, 5, 7, 9, 11];
  const ww = 18, wh = 66, bw = 11, bh = 42, octaves = 2;
  const whites = [];
  for (let oct = 0; oct < octaves; oct++) whitePcs.forEach((pc) => whites.push(pc));
  let body = "";
  whites.forEach((pc, i) => {
    const on = pcs.has(pc);
    const fill = on ? pc === rootPc ? o.root : o.accent : o.paper;
    body += `<rect x="${i * ww}" y="0" width="${ww - 1}" height="${wh}" rx="2" fill="${fill}" stroke="${o.lineLight}" stroke-width="1"/>`;
  });
  const blackInOct = { 0: 1, 1: 3, 3: 6, 4: 8, 5: 10 };
  for (let oct = 0; oct < octaves; oct++) {
    [0, 1, 3, 4, 5].forEach((wIdx) => {
      const pc = blackInOct[wIdx];
      const globalWhite = oct * 7 + wIdx;
      const x = (globalWhite + 1) * ww - bw / 2;
      const on = pcs.has(pc);
      const fill = on ? pc === rootPc ? o.root : o.accent : o.black;
      body += `<rect x="${x}" y="0" width="${bw}" height="${bh}" rx="1" fill="${fill}"/>`;
    });
  }
  return svgWrap(whites.length * ww, wh + 2, body);
}
function fretboardSVG(frets, o) {
  const strings = frets.length;
  const span = 18, padX = 12, top = 18, fretH = 22, fretCount = 4;
  const W = padX * 2 + (strings - 1) * span;
  const H = top + fretCount * fretH + 6;
  const x = (i) => padX + i * span;
  let body = `<rect x="${padX}" y="${top}" width="${(strings - 1) * span}" height="3" fill="${o.line}"/>`;
  for (let f = 0; f < fretCount; f++) {
    const y = top + (f + 1) * fretH;
    body += `<line x1="${padX}" y1="${y}" x2="${padX + (strings - 1) * span}" y2="${y}" stroke="${o.lineLight}" stroke-width="1"/>`;
  }
  frets.forEach((_, i) => {
    body += `<line x1="${x(i)}" y1="${top}" x2="${x(i)}" y2="${top + fretCount * fretH}" stroke="${o.lineLight}" stroke-width="1"/>`;
  });
  frets.forEach((f, i) => {
    if (f === -1) {
      body += `<text x="${x(i)}" y="${top - 5}" text-anchor="middle" font-size="11" fill="${o.muted}">\xD7</text>`;
    } else if (f === 0) {
      body += `<circle cx="${x(i)}" cy="${top - 8}" r="4" fill="none" stroke="${o.muted}" stroke-width="1.3"/>`;
    } else {
      body += `<circle cx="${x(i)}" cy="${top + (f - 0.5) * fretH}" r="6" fill="${o.accent}"/>`;
    }
  });
  return svgWrap(W, H, body);
}
function placeholderSVG(o) {
  return svgWrap(96, 70, `<text x="48" y="40" text-anchor="middle" font-size="11" fill="${o.muted}">no shape</text>`);
}
function getDiagramSVG(symbol, instrument = "piano", options = {}) {
  const o = { ...DEFAULTS, ...options };
  if (instrument === "piano") return pianoSVG(chordNotes(symbol), o);
  const shape = getShape(symbol, instrument);
  return shape ? fretboardSVG(shape, o) : placeholderSVG(o);
}

exports.GUITAR_SHAPES = GUITAR_SHAPES;
exports.SECTION_TYPES = SECTION_TYPES;
exports.SHARP_NOTES = SHARP_NOTES;
exports.SONG_KEYS = SONG_KEYS;
exports.UKULELE_SHAPES = UKULELE_SHAPES;
exports.__decorateClass = __decorateClass;
exports.chordNotes = chordNotes;
exports.displayLines = displayLines;
exports.getChordsInSong = getChordsInSong;
exports.getDiagramSVG = getDiagramSVG;
exports.getShape = getShape;
exports.parseChord = parseChord;
exports.parseChordPro = parseChordPro;
exports.parseLine = parseLine;
exports.qualityIntervals = qualityIntervals;
exports.sectionTypeFromLabel = sectionTypeFromLabel;
exports.transposeChord = transposeChord;
exports.transposeNote = transposeNote;
//# sourceMappingURL=chunk-DSVCMPY5.cjs.map
//# sourceMappingURL=chunk-DSVCMPY5.cjs.map
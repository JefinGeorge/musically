# 🎵 Musically

A framework-agnostic UI toolkit for **creating, editing, and displaying chord-over-lyric song sheets** — with switchable chord diagrams for piano, guitar, and ukulele.

Musically ships as standard **Web Components**, so it drops into **React, Angular, Vue, or plain HTML** with the same API. A headless **core** is also exported if you only need the music-theory logic (parsing, transposing, chord notes) without any UI.

---

## Features

- **Chord-over-lyric sheets** — write lyrics with inline chords (ChordPro style) and render them neatly aligned.
- **Structured sections** — lines starting with `#` become labelled sections (intro, verse, pre-chorus, chorus, bridge, outro), inferred from the heading and rendered with a faint per-type background tint.
- **Credits & performance metadata** *(v2.2)* — capture author, composer, music director, and performing artist, plus tempo, preferred key, tonality, time signature, and rhythm pattern, in dedicated **Credits** and **Music** tabs.
- **Official "has chords" flag** *(v2.2)* — mark whether a song genuinely carries chords. Lyrics-only songs ignore any embedded `[chords]` on display and render tightly, with vertical space only between sections.
- **Transpose** — shift an entire song up or down by semitones, with the key updated automatically.
- **Switchable diagrams** — piano, guitar, and ukulele. Piano is computed from music theory (works for *any* chord); guitar/ukulele use a built-in shape library.
- **Multi-language & transliterations** — tag a sheet with its language, offer a language list, and attach alternate-script versions shown in their own tab. Each transliteration can credit its author via **Transliterated by** *(v2.4)*.
- **Contributor credits** *(v2.4)* — credit a chords contributor via **Chords contributed by** in the Chords tab (shown only when the song has chords).
- **Permissions & credits footer** *(v2.5)* — a **Permissions** tab collects `copyright`, `license`, and `permissions` lines; the reader renders a fine-print footer under the lyrics with each non-empty line — `Written by …`, `Composed by …`, then the copyright / permissions / license lines verbatim.
- **Video link** *(v2.6)* — collect an external video URL for a song (YouTube, Vimeo, or any other streaming platform) in the **Music** tab. Stored as a link, never an embed: the reader shows a **▶ Watch video** link and the mobile apps hand it to the phone.
- **Search tags** *(v2.7)* — a **Tags** tab collects up to 10 (a hard stop) comma-separated search tags (`tags`) — other ways people type the song, e.g. `yesu` for *Yeshu*, `nadha` for *natha*. Never shown on the sheet; the host's search matches them. `parseTags()` cleans a typed list the same way.
- **Reader mode** — set `readonly` to hide the editor and show only the sheet, with the credits footer and video link. The editor stacks into one column on narrow screens (≤ 720px).
- **Themeable** — restyle everything through CSS custom properties.
- **Headless core** — use the theory engine on its own, no UI required.

---

## Installation

```bash
npm install musically
```

---

## Quick start

### Plain HTML / any framework

```html
<script type="module">
  import 'musically/elements';
</script>

<chord-sheet
  title="Amazing Grace"
  artist="Traditional"
  song-key="G"
  transpose="0"
  instrument="guitar"
  has-chords
  body="A[G]mazing [G7]grace how [C]sweet the [G]sound"
></chord-sheet>
```

> `has-chords` tells Musically the song genuinely carries chords, so they're rendered. Omit it for a **lyrics-only** song — any `[chords]` in the body are then ignored on display.

### React (v19+)

React 19 passes properties to custom elements natively, so you can use the element directly.

```jsx
import 'musically/elements';

export function Song() {
  return (
    <chord-sheet
      title="Amazing Grace"
      artist="Traditional"
      song-key="G"
      transpose={2}
      instrument="piano"
      has-chords
      body={`# Verse 1
A[G]mazing [G7]grace how [C]sweet the [G]sound
That [G]saved a [Em]wretch like [D]me`}
    />
  );
}
```

> **Using React 18 or earlier?** Custom-element *properties* and events aren't bound automatically. Wrap the element once with [`@lit/react`](https://www.npmjs.com/package/@lit/react):
>
> ```jsx
> import { createComponent } from '@lit/react';
> import * as React from 'react';
> import { ChordSheet } from 'musically/elements';
>
> export const ChordSheetReact = createComponent({
>   tagName: 'chord-sheet',
>   elementClass: ChordSheet,
>   react: React,
>   events: { onChange: 'change' },
> });
> ```

### Angular

Register the elements once (e.g. in `main.ts`), then allow custom tags in any module/standalone component that uses them.

```ts
// main.ts
import 'musically/elements';
```

```ts
// app.component.ts (standalone) — or add to your NgModule
import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

@Component({
  selector: 'app-root',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <chord-sheet
      [attr.title]="title"
      [attr.transpose]="transpose"
      instrument="ukulele"
      has-chords
      [attr.body]="body"
    ></chord-sheet>
  `,
})
export class AppComponent {
  title = 'Amazing Grace';
  transpose = 0;
  body = 'A[G]mazing [G7]grace how [C]sweet the [G]sound';
}
```

> Bind primitive values with `[attr.x]`. For large/structured input or to listen for changes, get an `ElementRef` and set properties / add an event listener directly.

### A full editor — properties in, `change` out

Strings and numbers can be attributes; lists (`languages`, `transliterations`, `tags`) are **properties only**, so set them from JavaScript. Every edit fires one `change` event carrying the whole song — save `event.detail` as it is.

```html
<chord-sheet id="song"></chord-sheet>

<script type="module">
  import 'musically/elements';

  const sheet = document.getElementById('song');
  Object.assign(sheet, {
    title: 'Yeshu ninne',
    language: 'ml',
    languages: [{ code: 'ml', name: 'Malayalam' }, { code: 'ml-Latn', name: 'Malayalam (English letters)' }],
    body: '# Verse 1\n[G]Yeshu ninne [C]njan sthuthikkum',
    hasChords: true,
    songKey: 'G',
    author: 'Traditional',
    videoUrl: 'https://youtu.be/dQw4w9WgXcQ',
    tags: ['yesu', 'yeshuve'],
    transliterations: [
      { language: 'ml-Latn', title: 'Yeshu ninne', body: '...', transliteratedBy: 'A. Contributor' },
    ],
  });

  sheet.addEventListener('change', (e) => {
    const song = e.detail; // { body, title, ..., videoUrl, tags, transliterations }
    save(song);
  });

  // Show the same song read-only (no editor, no tabs):
  // sheet.readonly = true;
</script>
```

---

## Components

### `<chord-sheet>`

The full editor + sheet renderer.

| Attribute / Property | Type | Default | Description |
|---|---|---|---|
| `body` | `string` | `""` | Lyrics with inline `[chords]`. Lines starting with `#` become section labels. |
| `title` | `string` | `""` | Song title shown in the header. |
| `artist` | `string` | `""` | Performing artist. |
| `author` | `string` | `""` | Lyricist / author. *(v2.2)* |
| `composer` | `string` | `""` | Composer. *(v2.2)* |
| `music-director` | `string` | `""` | Music director. *(v2.2)* |
| `chords-contributed-by` | `string` | `""` | Credit for the person who contributed the chords. Shown in the Chords tab only when the song has chords. *(v2.4)* |
| `copyright` | `string` | `""` | Copyright line, shown verbatim in the credits footer (e.g. `© 2026 World Healing Music`). Collected in the Permissions tab. *(v2.5)* |
| `license` | `string` | `""` | Licensing line, shown verbatim in the credits footer (e.g. `CCLI License #1234567`). Permissions tab. *(v2.5)* |
| `permissions` | `string` | `""` | Usage-permission line, shown verbatim in the credits footer (e.g. `Used by permission.`). Permissions tab. *(v2.5)* |
| `tags` | `string[]` | `[]` | Search tags — other spellings of the song, at most 10 (`MAX_SONG_TAGS`; the tab won't take more). Property only (no attribute). Tags tab. *(v2.7)* |
| `song-key` | `string` | `""` | Original key (transposes along with the song). |
| `has-chords` | `boolean` | `false` | Whether the song *officially* carries chords. When `false`, embedded `[chords]` are ignored on display and inter-line spacing is tightened (lyrics-only). *(v2.2)* |
| `tempo` | `number` | `0` | Beats per minute (`0` = unset). *(v2.2)* |
| `preferred-key` | `string` | `""` | Preferred performance key (independent of the transposable `song-key`). *(v2.2)* |
| `mode` | `"major" \| "minor" \| ""` | `""` | Tonality. *(v2.2)* |
| `time-signature` | `string` | `""` | e.g. `4/4`, `6/8`. *(v2.2)* |
| `rhythm-pattern` | `string` | `""` | Free-text strumming / rhythm pattern. *(v2.2)* |
| `video-url` | `string` | `""` | External link to a video of the song — YouTube, Vimeo, or any other streaming platform. Collected in the Music tab, normalised on blur, and rendered as a **▶ Watch video** link on the sheet. Never embedded. *(v2.6)* |
| `transpose` | `number` | `0` | Semitones to shift all chords. |
| `instrument` | `"piano" \| "guitar" \| "ukulele"` | `"piano"` | Diagram instrument. |
| `show-diagrams` | `boolean` | `true` | Toggle the "chords used" diagram strip (only shown when `has-chords` is set). |
| `readonly` | `boolean` | `false` | Hide the editor and show only the sheet. |
| `language` | `string` | `""` | BCP-47 language of the sheet's lyrics. |
| `languages` | `LanguageOption[]` | `[]` | Selectable languages for the editor's language dropdown. **Property only** (set via JS, not an attribute). |
| `transliterations` | `Transliteration[]` | `[]` | Alternate-script versions, shown in the Transliterations tab. **Property only.** |

`LanguageOption` is `{ code: string; name: string }`; `Transliteration` is `{ language: string; body: string; title?: string; transliteratedBy?: string }` — `transliteratedBy` credits whoever produced that transliteration.

The editor is organised into **Editor**, **Credits**, **Music**, **Transliterations**, **Chords**, **Permissions**, and **Tags** tabs. Section labels (lines starting with `#`) are classified as `intro`, `verse`, `pre-chorus`, `chorus`, `bridge`, `outro`, or generic `section`. In `readonly` (reader) mode a fine-print credits footer is rendered under the lyrics from `author`/`composer`/`copyright`/`permissions`/`license` — each line shown only when non-empty.

**Event:** `change` — fired when the body or any field changes. `event.detail` contains `{ body, title, artist, author, composer, musicDirector, chordsContributedBy, copyright, license, permissions, language, songKey, hasChords, tempo, preferredKey, mode, timeSignature, rhythmPattern, videoUrl, tags, transpose, instrument, transliterations }`.

### `<chord-diagram>`

A single chord diagram, on its own.

| Attribute / Property | Type | Default | Description |
|---|---|---|---|
| `chord` | `string` | — | Chord symbol, e.g. `Cmaj7`, `F#m`, `D/F#`. |
| `instrument` | `"piano" \| "guitar" \| "ukulele"` | `"piano"` | How to draw it. |

```html
<chord-diagram chord="Cmaj7" instrument="guitar"></chord-diagram>
```

---

## Search tags *(v2.7)*

People type the same song in different ways — *Yeshu* as `yesu`, *natha* as `nadha`. The **Tags** tab collects up to **10** of those spellings for a song so your search can find it however it's typed.

- Type them on one line, separated by commas: `yesu, nadha, karthave`. The tab label shows the count — **Tags (3)** — and each tag appears as a chip.
- Musically cleans the list as you type: spaces trimmed, empty entries and repeats (ignoring case) dropped, each tag cut to 40 characters. The text you're typing isn't rewritten until you leave the field.
- **10 is a hard stop.** Once there are 10, typing an 11th is refused (the text stays as it was) and the note says to remove one first; pasting a longer list keeps the first 10. Tags set by your app that are already over 10 (old data) are flagged with how many to remove, not silently dropped — still check `detail.tags.length > MAX_SONG_TAGS` before saving.
- Tags are never shown on the sheet — they're for search only.

Use the same cleaning on your server so the two never disagree:

```js
import { parseTags, MAX_SONG_TAGS } from 'musically';

const tags = parseTags(req.body.tags);   // string "a, b" or string[]
if (tags.length > MAX_SONG_TAGS) throw new Error(`At most ${MAX_SONG_TAGS} tags`);
```

A good search ranks a tag match **after** title matches and **before** credits and lyrics, so a song whose title starts with what was typed still comes first.

---

## Headless core (no UI)

Import just the music-theory functions if you want to build your own UI:

```js
import {
  transposeChord,
  chordNotes,
  parseChordPro,
  displayLines,
  sectionTypeFromLabel,
  getDiagramSVG,
  normalizeVideoUrl,
  parseTags,
} from 'musically';

transposeChord('Am7', 2);        // → "Bm7"
chordNotes('Cmaj7');             // → ["C", "E", "G", "B"]

const lines = parseChordPro('# Verse\n[C]Hello [G]world');
// → structured lines/segments you can render however you like

// Adapt lines for a lyrics-only song: drops chords + blank lines so only
// section breaks add space (pass `true` to keep chords unchanged).
displayLines(lines, false);

sectionTypeFromLabel('Pre-Chorus 2'); // → "pre-chorus"
getDiagramSVG('G', 'guitar');          // → SVG markup string

// Vet a pasted video link before storing or opening it. Adds a missing scheme;
// returns null for anything that isn't an http(s) address.
normalizeVideoUrl('youtu.be/dQw4w9WgXcQ'); // → "https://youtu.be/dQw4w9WgXcQ"
normalizeVideoUrl('javascript:alert(1)');  // → null

// Clean a typed list of search tags (see "Search tags").
parseTags('yesu, Yesu ,nadha,,');          // → ["yesu", "nadha"]
```

Also exported: `parseChord`, `transposeNote`, `qualityIntervals`, `getShape`, `parseLine`, `getChordsInSong`, the tables `SHARP_NOTES`, `SONG_KEYS`, `SECTION_TYPES`, `GUITAR_SHAPES`, `UKULELE_SHAPES`, the limits `MAX_SONG_TAGS` (10) and `MAX_TAG_LENGTH` (40), and the types `Instrument`, `SectionType`, `SheetLine`, `ChordSegment`, `ParsedChord`, `DiagramOptions`. From `musically/elements`: `ChordSheet`, `ChordDiagram`, `LanguageOption`, `Transliteration`.

---

## Theming

All visuals are driven by CSS custom properties. Override them on the element or a parent:

```css
chord-sheet {
  --musically-accent: #b45309;   /* chord color */
  --musically-paper:  #fffdf8;   /* sheet background */
  --musically-text:   #33312c;   /* lyric color */
  --musically-font:   'Georgia', serif;
  --musically-section-fill: 9%;  /* section background tint strength; 0% = border only */
}
```

| Property | Used for |
|---|---|
| `--musically-accent` | Chords, active tab underline, buttons |
| `--musically-on-accent` | Text on accent-coloured buttons |
| `--musically-root` | Root note in chord diagrams |
| `--musically-paper` | Sheet and input background |
| `--musically-text` | Lyrics and labels |
| `--musically-muted` | Hints, credits footer, tag chips |
| `--musically-border` | Field, tab and footer borders |
| `--musically-warn` | Warnings (a video link that can't open, too many tags) |
| `--musically-shadow` | Sheet shadow |
| `--musically-font` | Sheet font |
| `--musically-section-fill` | Section tint strength (`0%` = border only) |
| `--musically-section-prechorus`, `--musically-section-bridge` | Tint colours for those section types |

---

## ChordPro cheatsheet

```
# Section labels start with a hash
[C]Put chords in brackets [G]right before the syllable
A chord [Am]mid-word works fine
Leave a blank line between sections
```

---

## Browser support

Works in all evergreen browsers that support native Web Components (custom elements + shadow DOM). For older targets, include a [web components polyfill](https://github.com/webcomponents/polyfills).

---

## Changelog

| Version | What changed |
|---|---|
| **2.7.2** | Transliterations tab: the title takes the full row beside the language; **Transliterated by** moves to its own line. |
| 2.7.1 | The Tags tab stops at 10 — an 11th tag can't be typed, and a pasted list keeps its first 10. |
| 2.7.0 | **Tags** tab — up to 10 comma-separated search tags (`tags`), emitted in `change`. `parseTags()`, `MAX_SONG_TAGS`, `MAX_TAG_LENGTH` exported. Dev tooling updated to vitest 4 (security advisories). |
| 2.6.0 | **Video link** on the Music tab (`video-url`), shown as **▶ Watch video** in the reader. `normalizeVideoUrl()` exported. |
| 2.5.0 | **Permissions** tab (`copyright`, `license`, `permissions`) and the credits footer under the lyrics. |
| 2.4.x | Credit fields — **Transliterated by** on each transliteration, **Chords contributed by** on the Chords tab; Chords tab spacing. |
| 2.3.x | Title on each transliteration; selected language and key restored on load. |
| 2.2.0 | **Credits** and **Music** tabs, the `has-chords` flag (lyrics-only rendering), performance metadata, section background tints. |
| 2.1.0 | Full song editor — section types, dropdowns, tabs, transliterations; theming and polish. |
| 2.0.0 | Rewritten as Web Components (`<chord-sheet>`, `<chord-diagram>`) with a headless core. |

---

## Contributing

Issues and pull requests are welcome. To run locally (Node 20+ and npm 11 for development; the published package runs anywhere with Node 18+ or a modern browser):

```bash
git clone https://github.com/JefinGeorge/Musically.git
cd Musically
npm install
npm run dev        # rebuild on change
npm test           # vitest
npm run typecheck
npm run build      # dist/ — committed with each release
```

To release: bump `version` in `package.json`, push to `master`, then publish a GitHub Release — the **Publish to npm** workflow builds and publishes it.

## License

MIT © Jefin George

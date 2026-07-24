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
- **Performance & print views** — a clean, large reading layout for live use.
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
| `song-key` | `string` | `""` | Original key (transposes along with the song). |
| `has-chords` | `boolean` | `false` | Whether the song *officially* carries chords. When `false`, embedded `[chords]` are ignored on display and inter-line spacing is tightened (lyrics-only). *(v2.2)* |
| `tempo` | `number` | `0` | Beats per minute (`0` = unset). *(v2.2)* |
| `preferred-key` | `string` | `""` | Preferred performance key (independent of the transposable `song-key`). *(v2.2)* |
| `mode` | `"major" \| "minor" \| ""` | `""` | Tonality. *(v2.2)* |
| `time-signature` | `string` | `""` | e.g. `4/4`, `6/8`. *(v2.2)* |
| `rhythm-pattern` | `string` | `""` | Free-text strumming / rhythm pattern. *(v2.2)* |
| `transpose` | `number` | `0` | Semitones to shift all chords. |
| `instrument` | `"piano" \| "guitar" \| "ukulele"` | `"piano"` | Diagram instrument. |
| `show-diagrams` | `boolean` | `true` | Toggle the "chords used" diagram strip (only shown when `has-chords` is set). |
| `readonly` | `boolean` | `false` | Hide the editor and show only the sheet. |
| `language` | `string` | `""` | BCP-47 language of the sheet's lyrics. |
| `languages` | `LanguageOption[]` | `[]` | Selectable languages for the editor's language dropdown. **Property only** (set via JS, not an attribute). |
| `transliterations` | `Transliteration[]` | `[]` | Alternate-script versions, shown in the Transliterations tab. **Property only.** |

`LanguageOption` is `{ code: string; name: string }`; `Transliteration` is `{ language: string; body: string; title?: string; transliteratedBy?: string }` — `transliteratedBy` credits whoever produced that transliteration.

The editor is organised into **Editor**, **Credits**, **Music**, **Transliterations**, **Chords**, and **Permissions** tabs. Section labels (lines starting with `#`) are classified as `intro`, `verse`, `pre-chorus`, `chorus`, `bridge`, `outro`, or generic `section`. In `readonly` (reader) mode a fine-print credits footer is rendered under the lyrics from `author`/`composer`/`copyright`/`permissions`/`license` — each line shown only when non-empty.

**Event:** `change` — fired when the body or any field changes. `event.detail` contains `{ body, title, artist, author, composer, musicDirector, chordsContributedBy, copyright, license, permissions, language, songKey, hasChords, tempo, preferredKey, mode, timeSignature, rhythmPattern, transpose, instrument, transliterations }`.

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
```

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

## Contributing

Issues and pull requests are welcome. To run locally:

```bash
git clone https://github.com/JefinGeorge/Musically.git
cd Musically
npm install
npm run dev
```

## License

MIT © Jefin George

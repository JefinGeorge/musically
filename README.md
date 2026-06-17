# 🎵 Musically

A framework-agnostic UI toolkit for **creating, editing, and displaying chord-over-lyric song sheets** — with switchable chord diagrams for piano, guitar, and ukulele.

Musically ships as standard **Web Components**, so it drops into **React, Angular, Vue, or plain HTML** with the same API. A headless **core** is also exported if you only need the music-theory logic (parsing, transposing, chord notes) without any UI.

---

## Features

- **Chord-over-lyric sheets** — write lyrics with inline chords (ChordPro style) and render them neatly aligned.
- **Transpose** — shift an entire song up or down by semitones, with the key updated automatically.
- **Switchable diagrams** — piano, guitar, and ukulele. Piano is computed from music theory (works for *any* chord); guitar/ukulele use a built-in shape library.
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
  body="A[G]mazing [G7]grace how [C]sweet the [G]sound"
></chord-sheet>
```

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
| `artist` | `string` | `""` | Artist / author. |
| `song-key` | `string` | `""` | Original key (transposes along with the song). |
| `transpose` | `number` | `0` | Semitones to shift all chords. |
| `instrument` | `"piano" \| "guitar" \| "ukulele"` | `"piano"` | Diagram instrument. |
| `show-diagrams` | `boolean` | `true` | Toggle the "chords used" diagram strip. |
| `readonly` | `boolean` | `false` | Hide the editor and show only the sheet. |

**Event:** `change` — fired when the body or settings change. `event.detail` contains `{ body, title, artist, transpose, instrument }`.

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
  getDiagramSVG,
} from 'musically';

transposeChord('Am7', 2);        // → "Bm7"
chordNotes('Cmaj7');             // → ["C", "E", "G", "B"]
parseChordPro('[C]Hello [G]world');
// → structured lines/segments you can render however you like

getDiagramSVG('G', 'guitar');    // → SVG markup string
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

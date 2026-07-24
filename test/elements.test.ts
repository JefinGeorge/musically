// @vitest-environment happy-dom
import { describe, it, expect, beforeEach, afterEach } from "vitest";
// Importing the module registers <chord-diagram> and <chord-sheet>.
import { ChordDiagram, ChordSheet } from "../src/elements.js";

/** Mount an element, wait for its first render, and return it. */
async function mount<T extends HTMLElement & { updateComplete: Promise<unknown> }>(
  el: T
): Promise<T> {
  document.body.appendChild(el);
  await el.updateComplete;
  return el;
}

afterEach(() => {
  document.body.innerHTML = "";
});

describe("custom element registration", () => {
  it("registers <chord-diagram> and <chord-sheet>", () => {
    expect(customElements.get("chord-diagram")).toBe(ChordDiagram);
    expect(customElements.get("chord-sheet")).toBe(ChordSheet);
  });

  it("creating via tag name yields the right class", () => {
    expect(document.createElement("chord-diagram")).toBeInstanceOf(ChordDiagram);
    expect(document.createElement("chord-sheet")).toBeInstanceOf(ChordSheet);
  });
});

describe("<chord-diagram>", () => {
  let el: ChordDiagram;
  beforeEach(() => {
    el = document.createElement("chord-diagram") as ChordDiagram;
  });

  it("renders nothing when no chord is set", async () => {
    await mount(el);
    // The card markup only appears once a chord is present.
    expect(el.shadowRoot?.querySelector(".card")).toBeNull();
  });

  it("renders the name, an SVG diagram, and the note list for a chord", async () => {
    el.chord = "Cmaj7";
    await mount(el);
    const root = el.shadowRoot!;
    expect(root.querySelector(".name")?.textContent).toBe("Cmaj7");
    expect(root.querySelector("svg")).not.toBeNull();
    expect(root.querySelector(".notes")?.textContent).toBe("C · E · G · B");
  });

  it("defaults to a piano diagram (white-key rects)", async () => {
    el.chord = "C";
    await mount(el);
    expect(el.shadowRoot!.querySelectorAll("rect").length).toBeGreaterThan(0);
  });

  it("draws a fretboard with finger dots for a guitar chord", async () => {
    el.chord = "C";
    el.instrument = "guitar";
    await mount(el);
    expect(el.shadowRoot!.querySelector("circle")).not.toBeNull();
  });

  it("hides the name and notes when diagram-only", async () => {
    el.chord = "C";
    el.diagramOnly = true;
    await mount(el);
    const root = el.shadowRoot!;
    expect(root.querySelector(".name")).toBeNull();
    expect(root.querySelector(".notes")).toBeNull();
    expect(root.querySelector("svg")).not.toBeNull();
  });

  it("re-renders when the chord changes", async () => {
    el.chord = "C";
    await mount(el);
    expect(el.shadowRoot!.querySelector(".name")?.textContent).toBe("C");
    el.chord = "G";
    await el.updateComplete;
    expect(el.shadowRoot!.querySelector(".name")?.textContent).toBe("G");
    expect(el.shadowRoot!.querySelector(".notes")?.textContent).toBe("G · B · D");
  });

  it("reflects the diagram-only attribute to the property", async () => {
    el.setAttribute("diagram-only", "");
    el.chord = "C";
    await mount(el);
    expect(el.diagramOnly).toBe(true);
    expect(el.shadowRoot!.querySelector(".name")).toBeNull();
  });
});

describe("<chord-sheet>", () => {
  let el: ChordSheet;
  beforeEach(() => {
    el = document.createElement("chord-sheet") as ChordSheet;
  });

  it("renders the editor toolbar and textarea by default", async () => {
    await mount(el);
    const root = el.shadowRoot!;
    expect(root.querySelector(".toolbar")).not.toBeNull();
    expect(root.querySelector("textarea")).not.toBeNull();
  });

  it("hides the toolbar and textarea in readonly mode", async () => {
    el.readonly = true;
    await mount(el);
    const root = el.shadowRoot!;
    expect(root.querySelector(".toolbar")).toBeNull();
    expect(root.querySelector("textarea")).toBeNull();
    expect(root.querySelector(".sheet")).not.toBeNull();
  });

  it("shows the title, artist, and key in the header", async () => {
    el.title = "My Song";
    el.artist = "Me";
    el.songKey = "C";
    await mount(el);
    const meta = el.shadowRoot!.querySelector(".meta")?.textContent ?? "";
    expect(el.shadowRoot!.querySelector(".title")?.textContent).toBe("My Song");
    expect(meta).toContain("Me");
    expect(meta).toContain("Key of C");
  });

  it("falls back to 'Untitled' with no title", async () => {
    await mount(el);
    expect(el.shadowRoot!.querySelector(".title")?.textContent).toBe("Untitled");
  });

  it("renders sections, lyric lines, and blank lines", async () => {
    el.body = "# Verse\n[C]Hello\n\nplain";
    el.hasChords = true;
    await mount(el);
    const root = el.shadowRoot!;
    expect(root.querySelector(".section")?.textContent).toBe("Verse");
    expect(root.querySelectorAll(".line").length).toBe(2);
    expect(root.querySelector(".blank")).not.toBeNull();
    expect(root.querySelector(".seg .chord")?.textContent).toBe("C");
  });

  it("renders a 'chords used' diagram strip (readonly) when chords are present", async () => {
    el.body = "[C]a [G]b";
    el.hasChords = true;
    el.readonly = true;
    await mount(el);
    const diagrams = el.shadowRoot!.querySelectorAll("chord-diagram");
    expect(diagrams.length).toBe(2);
    expect(el.shadowRoot!.querySelector(".diagrams-label")?.textContent).toContain("piano");
  });

  it("omits the diagram strip when show-diagrams is off (readonly)", async () => {
    el.body = "[C]a";
    el.readonly = true;
    el.showDiagrams = false;
    await mount(el);
    expect(el.shadowRoot!.querySelector("chord-diagram")).toBeNull();
  });

  it("omits the diagram strip when the song has no chords (readonly)", async () => {
    el.body = "just lyrics";
    el.readonly = true;
    await mount(el);
    expect(el.shadowRoot!.querySelector("chord-diagram")).toBeNull();
  });

  it("transposes the displayed chords and key", async () => {
    el.body = "[C]a [G]b";
    el.hasChords = true;
    el.songKey = "C";
    el.transpose = 2;
    await mount(el);
    const chords = [...el.shadowRoot!.querySelectorAll(".seg .chord")].map(
      (n) => n.textContent
    );
    expect(chords).toEqual(["D", "A"]);
    expect(el.shadowRoot!.querySelector(".meta")?.textContent).toContain("Key of D");
    expect(el.shadowRoot!.querySelector(".meta")?.textContent).toContain("(+2)");
  });

  it("transpose +/- buttons update the value and emit a change event", async () => {
    await mount(el);
    let detail: any = null;
    el.addEventListener("change", (e) => (detail = (e as CustomEvent).detail));

    const [minus, plus] = el.shadowRoot!.querySelectorAll<HTMLButtonElement>(
      "button.step"
    );
    plus.click();
    await el.updateComplete;
    expect(el.transpose).toBe(1);
    expect(detail.transpose).toBe(1);
    expect(el.shadowRoot!.querySelector(".step-val")?.textContent).toBe("+1");

    minus.click();
    minus.click();
    await el.updateComplete;
    expect(el.transpose).toBe(-1);
    expect(el.shadowRoot!.querySelector(".step-val")?.textContent).toBe("-1");
  });

  it("instrument buttons switch the active instrument and emit change", async () => {
    el.body = "[C]a";
    await mount(el);
    let detail: any = null;
    el.addEventListener("change", (e) => (detail = (e as CustomEvent).detail));

    const guitarBtn = [...el.shadowRoot!.querySelectorAll<HTMLButtonElement>("button")].find(
      (b) => b.textContent?.trim() === "guitar"
    )!;
    guitarBtn.click();
    await el.updateComplete;

    expect(el.instrument).toBe("guitar");
    expect(detail.instrument).toBe("guitar");
    expect(guitarBtn.classList.contains("active")).toBe(true);
  });

  it("editing the textarea updates body and emits change", async () => {
    el.hasChords = true;
    await mount(el);
    let detail: any = null;
    el.addEventListener("change", (e) => (detail = (e as CustomEvent).detail));

    const ta = el.shadowRoot!.querySelector("textarea")!;
    ta.value = "[Am]new song";
    ta.dispatchEvent(new Event("input"));
    await el.updateComplete;

    expect(el.body).toBe("[Am]new song");
    expect(detail.body).toBe("[Am]new song");
    expect(el.shadowRoot!.querySelector(".seg .chord")?.textContent).toBe("Am");
  });

  it("emits a change event that bubbles and is composed", async () => {
    await mount(el);
    let evt: Event | null = null;
    el.addEventListener("change", (e) => (evt = e));
    el.shadowRoot!.querySelectorAll<HTMLButtonElement>("button.step")[1].click();
    expect((evt as unknown as CustomEvent).bubbles).toBe(true);
    expect((evt as unknown as CustomEvent).composed).toBe(true);
  });

  it("shows title/language/key fields in editor mode", async () => {
    el.languages = [{ code: "en", name: "English" }, { code: "ml", name: "Malayalam" }];
    await mount(el);
    const root = el.shadowRoot!;
    expect(root.querySelector("input.title-input")).not.toBeNull();
    expect(root.querySelectorAll("select").length).toBeGreaterThanOrEqual(2); // language + key
    expect(root.querySelector(".tabs")).not.toBeNull();
  });

  it("tags each section with data-section for mobile colouring", async () => {
    el.body = "# Chorus\n[C]sing\n# Pre-Chorus\n[G]rise";
    el.readonly = true;
    await mount(el);
    const sections = [...el.shadowRoot!.querySelectorAll(".block[data-section]")].map((b) =>
      b.getAttribute("data-section")
    );
    expect(sections).toContain("chorus");
    expect(sections).toContain("pre-chorus");
  });

  it("ignores embedded chords and drops blank lines when lyrics-only (has-chords off)", async () => {
    el.body = "# Verse\n[C]Hello\n\n[G]world";
    el.readonly = true; // hasChords defaults to false
    await mount(el);
    const root = el.shadowRoot!;
    // Lyrics-only sheet: no rendered chord text, no blank spacer, no diagram strip.
    const chordText = [...root.querySelectorAll(".seg .chord")].map((n) => n.textContent?.trim()).join("");
    expect(chordText).toBe("");
    expect(root.querySelector(".blank")).toBeNull();
    expect(root.querySelector("chord-diagram")).toBeNull();
    expect(root.querySelector(".sheet.lyrics-only")).not.toBeNull();
    // The lyric text is still there.
    expect(root.textContent).toContain("Hello");
    expect(root.textContent).toContain("world");
  });

  it("has Credits and Music tabs; toggling has-chords emits the flag", async () => {
    await mount(el);
    const root = el.shadowRoot!;
    const tabLabels = [...root.querySelectorAll(".tab")].map((t) => t.textContent?.trim());
    expect(tabLabels).toContain("Credits");
    expect(tabLabels).toContain("Music");

    let detail: any = null;
    el.addEventListener("change", (e) => (detail = (e as CustomEvent).detail));
    const musicTab = [...root.querySelectorAll<HTMLButtonElement>(".tab")].find((b) => b.textContent?.trim() === "Music")!;
    musicTab.click();
    await el.updateComplete;
    const checkbox = root.querySelector<HTMLInputElement>('input[type="checkbox"]')!;
    checkbox.click();
    await el.updateComplete;
    expect(el.hasChords).toBe(true);
    expect(detail.hasChords).toBe(true);
  });

  it("emits credits fields (author/composer) from the change event", async () => {
    await mount(el);
    let detail: any = null;
    el.addEventListener("change", (e) => (detail = (e as CustomEvent).detail));
    const creditsTab = [...el.shadowRoot!.querySelectorAll<HTMLButtonElement>(".tab")].find((b) => b.textContent?.trim() === "Credits")!;
    creditsTab.click();
    await el.updateComplete;
    const firstInput = el.shadowRoot!.querySelector<HTMLInputElement>("input.text-input")!;
    firstInput.value = "Charles Wesley";
    firstInput.dispatchEvent(new Event("input"));
    await el.updateComplete;
    expect(el.author).toBe("Charles Wesley");
    expect(detail.author).toBe("Charles Wesley");
  });

  it("adds a transliteration from the Transliterations tab and emits change", async () => {
    el.languages = [{ code: "en", name: "English" }, { code: "ml", name: "Malayalam" }];
    await mount(el);
    let detail: any = null;
    el.addEventListener("change", (e) => (detail = (e as CustomEvent).detail));

    // Switch to the Transliterations tab.
    const translitTab = [...el.shadowRoot!.querySelectorAll<HTMLButtonElement>(".tab")].find((b) =>
      b.textContent?.includes("Transliterations")
    )!;
    translitTab.click();
    await el.updateComplete;

    const addBtn = [...el.shadowRoot!.querySelectorAll<HTMLButtonElement>("button")].find(
      (b) => b.textContent?.trim().startsWith("+ Add")
    )!;
    addBtn.click();
    await el.updateComplete;

    expect(el.transliterations.length).toBe(1);
    expect(detail.transliterations.length).toBe(1);
  });

  it("edits a transliteration's 'Transliterated by' credit and emits it", async () => {
    el.transliterations = [{ language: "ml", body: "[C]a", title: "" }];
    await mount(el);
    let detail: any = null;
    el.addEventListener("change", (e) => (detail = (e as CustomEvent).detail));

    const translitTab = [...el.shadowRoot!.querySelectorAll<HTMLButtonElement>(".tab")].find((b) =>
      b.textContent?.includes("Transliterations")
    )!;
    translitTab.click();
    await el.updateComplete;

    const credit = el.shadowRoot!.querySelector<HTMLInputElement>("input.text-input")!;
    credit.value = "Jane Roe";
    credit.dispatchEvent(new Event("input"));
    await el.updateComplete;

    expect(el.transliterations[0].transliteratedBy).toBe("Jane Roe");
    expect(detail.transliterations[0].transliteratedBy).toBe("Jane Roe");
  });

  it("shows 'Chords contributed by' only when the song has chords, and emits it", async () => {
    await mount(el);

    // Lyrics-only: no chords detected, so no credit field.
    const chordsTab = [...el.shadowRoot!.querySelectorAll<HTMLButtonElement>(".tab")].find(
      (b) => b.textContent?.trim() === "Chords"
    )!;
    chordsTab.click();
    await el.updateComplete;
    expect(el.shadowRoot!.querySelector("input.text-input")).toBeNull();

    // Add a chord to the body and the credit field appears.
    let detail: any = null;
    el.addEventListener("change", (e) => (detail = (e as CustomEvent).detail));
    el.body = "[C]a";
    await el.updateComplete;

    const credit = el.shadowRoot!.querySelector<HTMLInputElement>("input.text-input")!;
    expect(credit).not.toBeNull();
    credit.value = "John Doe";
    credit.dispatchEvent(new Event("input"));
    await el.updateComplete;

    expect(el.chordsContributedBy).toBe("John Doe");
    expect(detail.chordsContributedBy).toBe("John Doe");
  });

  it("edits Copyright / License / Permissions in the Permissions tab and emits them", async () => {
    await mount(el);
    let detail: any = null;
    el.addEventListener("change", (e) => (detail = (e as CustomEvent).detail));

    const permTab = [...el.shadowRoot!.querySelectorAll<HTMLButtonElement>(".tab")].find(
      (b) => b.textContent?.trim() === "Permissions"
    )!;
    permTab.click();
    await el.updateComplete;

    const [copyright, license, permissions] = [
      ...el.shadowRoot!.querySelectorAll<HTMLInputElement>(".perm-fields input.text-input"),
    ];
    copyright.value = "© 2026 World Healing Music";
    copyright.dispatchEvent(new Event("input"));
    license.value = "CCLI License #1234567";
    license.dispatchEvent(new Event("input"));
    permissions.value = "Used by permission.";
    permissions.dispatchEvent(new Event("input"));
    await el.updateComplete;

    expect(el.copyright).toBe("© 2026 World Healing Music");
    expect(el.license).toBe("CCLI License #1234567");
    expect(el.permissions).toBe("Used by permission.");
    expect(detail.copyright).toBe("© 2026 World Healing Music");
    expect(detail.license).toBe("CCLI License #1234567");
    expect(detail.permissions).toBe("Used by permission.");
  });

  it("renders the credits footer under the lyrics — non-empty lines only, in order", async () => {
    el.readonly = true;
    el.body = "Amazing grace";
    el.author = "John Newton";
    el.composer = ""; // omitted → no "Composed by" line
    el.copyright = "© 2026 World Healing Music";
    el.permissions = "Used by permission.";
    el.license = "CCLI License #1234567";
    await mount(el);

    const lines = [...el.shadowRoot!.querySelectorAll(".credits-footer .credit-line")].map((n) =>
      n.textContent?.trim(),
    );
    expect(lines).toEqual([
      "Written by John Newton",
      "© 2026 World Healing Music",
      "Used by permission.",
      "CCLI License #1234567",
    ]);
  });

  it("omits the credits footer entirely when no credit/licensing fields are set", async () => {
    el.readonly = true;
    el.body = "Amazing grace";
    await mount(el);
    expect(el.shadowRoot!.querySelector(".credits-footer")).toBeNull();
  });
});

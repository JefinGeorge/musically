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
    await mount(el);
    const root = el.shadowRoot!;
    expect(root.querySelector(".section")?.textContent).toBe("Verse");
    expect(root.querySelectorAll(".line").length).toBe(2);
    expect(root.querySelector(".blank")).not.toBeNull();
    expect(root.querySelector(".seg .chord")?.textContent).toBe("C");
  });

  it("renders a 'chords used' diagram strip when chords are present", async () => {
    el.body = "[C]a [G]b";
    await mount(el);
    const diagrams = el.shadowRoot!.querySelectorAll("chord-diagram");
    expect(diagrams.length).toBe(2);
    expect(el.shadowRoot!.querySelector(".diagrams-label")?.textContent).toContain(
      "piano"
    );
  });

  it("omits the diagram strip when show-diagrams is off", async () => {
    el.body = "[C]a";
    el.showDiagrams = false;
    await mount(el);
    expect(el.shadowRoot!.querySelector("chord-diagram")).toBeNull();
  });

  it("omits the diagram strip when the song has no chords", async () => {
    el.body = "just lyrics";
    await mount(el);
    expect(el.shadowRoot!.querySelector("chord-diagram")).toBeNull();
  });

  it("transposes the displayed chords and key", async () => {
    el.body = "[C]a [G]b";
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
    expect(el.shadowRoot!.querySelector(".diagrams-label")?.textContent).toContain(
      "guitar"
    );
  });

  it("editing the textarea updates body and emits change", async () => {
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
});

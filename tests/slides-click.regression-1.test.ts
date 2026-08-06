import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

// Regression: clicking the slide canvas did not advance the deck, so viewers could miss the small arrow controls.
// Found by /qa on 2026-08-06.
// Report: .gstack/qa-reports/qa-report-repofinder-io-2026-08-06.md

const slidesScript = readFileSync(resolve("public/slides-v3/slides.js"), "utf8");

describe("slide canvas navigation", () => {
  it("advances on a canvas click without hijacking links or controls", () => {
    assert.match(slidesScript, /slideStage\.addEventListener\("click"/);
    assert.match(slidesScript, /event\.target\.closest\("a, button, input, textarea, select, summary, \[role='button'\], \[contenteditable='true'\]"\)/);
    assert.match(slidesScript, /show\(current \+ 1\)/);
  });
});

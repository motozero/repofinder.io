import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

// Regression: the stable /slides route must serve the approved V3 deck, not the older walkthrough.
// Found by /qa on 2026-08-06.
// Report: .gstack/qa-reports/qa-report-repofinder-io-2026-08-06.md

const stableDeckPath = resolve("public/slides/index.html");
const v3DeckPath = resolve("public/slides-v3/index.html");
const stableDeckHtml = readFileSync(stableDeckPath, "utf8");

describe("stable slides route", () => {
  it("matches the approved V3 deck and resolves every local resource", () => {
    assert.equal(stableDeckHtml, readFileSync(v3DeckPath, "utf8"));
    assert.equal(readFileSync(resolve("public/slides/slides.css"), "utf8"), readFileSync(resolve("public/slides-v3/slides.css"), "utf8"));
    assert.equal(readFileSync(resolve("public/slides/slides.js"), "utf8"), readFileSync(resolve("public/slides-v3/slides.js"), "utf8"));

    const localReferences = Array.from(stableDeckHtml.matchAll(/(?:href|src)="([^"]+)"/g), (match) => match[1])
      .filter((reference): reference is string => typeof reference === "string" && !/^(?:https?:|#)/.test(reference));

    assert.ok(localReferences.length >= 8, "expected the stylesheet, script, favicon, and screenshots to be checked");
    for (const reference of localReferences) {
      const referencedPath = fileURLToPath(new URL(reference, pathToFileURL(stableDeckPath)));
      assert.ok(existsSync(referencedPath), `${reference} must resolve beside the stable deck`);
    }
  });
});

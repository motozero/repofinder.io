import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

// Regression: ISSUE-001, opening slides V3 through file:// lost its CSS, JavaScript, and images.
// Found by /qa on 2026-08-04.
// Report: .gstack/qa-reports/qa-report-slides-v3-local-2026-08-04.md

const deckPath = resolve("public/slides-v3/index.html");
const deckHtml = readFileSync(deckPath, "utf8");

describe("slides V3 portability", () => {
  it("keeps local resources relative to the deck directory", () => {
    assert.doesNotMatch(deckHtml, /(?:href|src)="\/(?:slides-v3\/|favicon\.svg)/);

    const localReferences = Array.from(deckHtml.matchAll(/(?:href|src)="([^"]+)"/g), (match) => match[1])
      .filter((reference): reference is string => typeof reference === "string" && !/^(?:https?:|#)/.test(reference));

    assert.ok(localReferences.length >= 8, "expected the stylesheet, script, favicon, and screenshots to be checked");
    for (const reference of localReferences) {
      const referencedPath = fileURLToPath(new URL(reference, pathToFileURL(deckPath)));
      assert.ok(existsSync(referencedPath), `${reference} must resolve beside the local deck`);
    }
  });
});

import { existsSync, readFileSync } from "node:fs";
import assert from "node:assert/strict";

const html = readFileSync(new URL("../docs/video/walkthrough-slides.html", import.meta.url), "utf8");
const sources = [...html.matchAll(/<img[^>]+src="([^"]+)"/g)].flatMap((match) => (match[1] ? [match[1]] : []));

assert.equal(sources.length, 2, "the walkthrough must contain both production screenshots");
for (const source of sources) {
  assert.match(source, /^data:image\/png;base64,/, "walkthrough screenshots must be embedded data URLs");
  const image = Buffer.from(source.slice("data:image/png;base64,".length), "base64");
  assert.equal(image.subarray(0, 8).toString("hex"), "89504e470d0a1a0a", "embedded screenshot must be a PNG");
  assert.ok(image.length > 1000, "embedded screenshot must not be empty");
}
assert.doesNotMatch(html, /src="assets\//, "standalone walkthrough cannot depend on an adjacent assets folder");

console.log("walkthrough portability: pass");

const demoHtmlUrl = new URL("../public/slides-v2/index.html", import.meta.url);
const demoHtml = readFileSync(demoHtmlUrl, "utf8");
const demoScript = readFileSync(new URL("../public/slides-v2/slides.js", import.meta.url), "utf8");
const demoSlides = [...demoHtml.matchAll(/<section class="[^"]*slide[^"]*" data-slide="(\d+)"/g)];
const demoImages = [...demoHtml.matchAll(/<img[^>]+src="(\/slides-v2\/assets\/[^"]+)"/g)].flatMap((match) => (match[1] ? [match[1]] : []));
const narrationScenes = [...demoScript.matchAll(/\{ time: "[^"]+", copy: "/g)];

assert.equal(demoSlides.length, 11, "the V2 product demo must contain eleven scenes");
assert.deepEqual(demoSlides.map((match) => Number(match[1])), Array.from({ length: 11 }, (_, index) => index + 1), "V2 scene numbers must be sequential");
assert.equal(narrationScenes.length, 11, "the V2 product demo must contain one narration entry per scene");
assert.ok(demoImages.length >= 5, "the V2 product demo must use the captured product states");
assert.doesNotMatch(demoHtml, /file:\/\//, "the deployed V2 product demo cannot contain local file URLs");
assert.match(demoHtml, /The browser owns the dedicated follow-up chat\. MCP returns structured recommendations/, "the human and MCP paths must remain accurately distinguished");

for (const source of new Set(demoImages)) {
  const assetUrl = new URL(`..${source}`, demoHtmlUrl);
  assert.ok(existsSync(assetUrl), `missing V2 demo asset: ${source}`);
  const image = readFileSync(assetUrl);
  assert.equal(image.subarray(0, 8).toString("hex"), "89504e470d0a1a0a", `${source} must be a PNG`);
  assert.ok(image.length > 1000, `${source} must not be empty`);
}

console.log("product demo V2 portability: pass");

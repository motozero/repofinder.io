import { readFileSync } from "node:fs";
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

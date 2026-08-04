import fs from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

const artifactToolModule = process.env.ARTIFACT_TOOL_MODULE;
const outputDir = process.env.REPOFINDER_DEMO_OUTPUT;

if (!artifactToolModule || !outputDir) {
  throw new Error("ARTIFACT_TOOL_MODULE and REPOFINDER_DEMO_OUTPUT are required.");
}

const { Presentation, PresentationFile } = await import(pathToFileURL(artifactToolModule).href);

const scenes = [
  {
    title: "What if my portfolio could introduce me?",
    narration: "This is my portfolio. People can read about my work, but I want them to meet me without booking a call. The goal is simple: add an AI video avatar.",
  },
  {
    title: "Start with the actual site and outcome.",
    narration: "I give RepoFinder the live site and the outcome I want. That context matters. I am not searching for the most famous avatar project. I am asking what fits this website.",
  },
  {
    title: "The ranking reveals the tradeoff.",
    narration: "RepoFinder searches live GitHub data and uses OpenAI to rank the options. Duix-Avatar rises to the top with fourteen thousand stars and full control, but its low ease score reveals the catch: I would need GPU infrastructure.",
  },
  {
    title: "Tell it what the star count cannot know.",
    narration: "That is where the demo becomes a decision tool. I open the result and add the constraint the rankings could not know: I care more about ease, and I am willing to pay.",
  },
  {
    title: "Hosted tools fit this project better.",
    narration: "The answer changes. RepoFinder recommends hosted choices, explains when HeyGen, Synthesia, and Captions fit, and brings the advice back to my actual site. It even asks the next useful question: polished videos, or a real-time avatar?",
  },
  {
    title: "A next step, not another tab.",
    narration: "Now I have a focused experiment. Start with HeyGen on one portfolio page, test whether visitors watch or engage, and only then decide whether real-time interaction is worth the added complexity.",
  },
  {
    title: "Humans refine. Agents repeat.",
    narration: "A person can explore this in the browser and refine the answer through conversation. An agent can call the same recommendation engine through M C P and use structured results inside its own workflow.",
  },
  {
    title: "From an idea to a focused experiment.",
    narration: "That is the value of RepoFinder: less tab hopping, fewer wrong-fit integrations, and a faster path from an idea to a test you can actually run.",
  },
];

async function writeBlob(filePath, blob) {
  await fs.writeFile(filePath, new Uint8Array(await blob.arrayBuffer()));
}

await fs.mkdir(outputDir, { recursive: true });
const renderedDir = path.join(outputDir, "rendered");
await fs.mkdir(renderedDir, { recursive: true });

const presentation = Presentation.create({ slideSize: { width: 1440, height: 900 } });

for (const [index, scene] of scenes.entries()) {
  const number = index + 1;
  const imagePath = `/private/tmp/repofinder-v3-${number}.png`;
  const imageBytes = await fs.readFile(imagePath);
  const slide = presentation.slides.add();
  slide.background.fill = "#07100f";
  slide.images.add({
    blob: imageBytes,
    contentType: "image/png",
    alt: `RepoFinder demo scene ${number}: ${scene.title}`,
    fit: "cover",
    position: { left: 0, top: 0, width: 1440, height: 900 },
  });
  slide.speakerNotes.textFrame.setText(
    `${scene.narration}\n\n[Sources]\n- https://repofinder.io/\n- https://letsgochristo.com/\n- https://github.com/motozero/repofinder.io\n[/Sources]`,
  );
  slide.speakerNotes.setVisible(true);
}

for (const [index, slide] of presentation.slides.items.entries()) {
  const stem = `slide-${String(index + 1).padStart(2, "0")}`;
  await writeBlob(path.join(renderedDir, `${stem}.png`), await presentation.export({ slide, format: "png", scale: 1 }));
  await fs.writeFile(path.join(renderedDir, `${stem}.layout.json`), await (await slide.export({ format: "layout" })).text());
}

await writeBlob(
  path.join(outputDir, "RepoFinder-Slides-V3-montage.webp"),
  await presentation.export({ format: "webp", montage: true, scale: 1 }),
);

const inspection = await presentation.inspect({ kind: "slide,image,notes,layout", maxChars: 20000 });
await fs.writeFile(path.join(outputDir, "RepoFinder-Slides-V3-inspection.ndjson"), inspection.ndjson);

const pptx = await PresentationFile.exportPptx(presentation);
await pptx.save(path.join(outputDir, "RepoFinder-Slides-V3.pptx"));

console.log(`Created ${scenes.length} slides in ${outputDir}`);

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
    title: "Your first result is not your final decision.",
    narration: "This is the moment RepoFinder becomes more useful than a list of popular repositories. I asked for something lighter, and it changed the recommendation.",
  },
  {
    title: "Popularity is a signal, not the decision.",
    narration: "GitHub stars tell me what is popular. They do not tell me what fits my project, my goal, or the way I want to work.",
  },
  {
    title: "Name the project and the outcome.",
    narration: "I start with a real project, the OpenAI Node SDK, and a concrete goal, production evaluations.",
  },
  {
    title: "One action gets to value.",
    narration: "One action sends both pieces of context to RepoFinder.",
  },
  {
    title: "Ranked for this task.",
    narration: "It searches live GitHub data, then OpenAI ranks the candidates for this task. The result is an evidence-backed starting point, not a generic popularity contest.",
  },
  {
    title: "Reasoning you can inspect.",
    narration: "Each result explains what the repository does, why it fits, how I could use it, and the likely ease and impact. Current GitHub signals stay visible beside the reasoning.",
  },
  {
    title: "Turn a candidate into an experiment.",
    narration: "The shortlist gets me oriented. The conversation helps me decide. I can open any result and ask how to test it in one afternoon.",
  },
  {
    title: "A next move, not another result.",
    narration: "RepoFinder turns the recommendation into a practical experiment, including what to try first, what to measure, and where the tradeoffs are.",
  },
  {
    title: "Now tell it what the rankings cannot know.",
    narration: "Then I add the part a star count cannot know. I like the idea, but I want a lightweight TypeScript library that fits directly into openai-node.",
  },
  {
    title: "Constraints make the answer better.",
    narration: "It acknowledges that the original result is too heavy, offers lighter alternatives, and gives me a focused next step. My taste and constraints changed the answer.",
  },
  {
    title: "Use RepoFinder yourself, or give it to an agent.",
    narration: "A person can explore and refine recommendations in the browser. An agent can call the same recommendation capability through MCP and receive structured results it can use in its own workflow.",
  },
  {
    title: "From an open question to a focused next step.",
    narration: "RepoFinder helps humans and agents move forward with evidence, context, and individual taste. Build better, focused, and faster.",
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
  const imagePath = `/private/tmp/repofinder-v2-${number}.png`;
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
    `${scene.narration}\n\n[Sources]\n- https://repofinder.io/\n- https://github.com/motozero/repofinder.io\n- https://greatdemo.com/demonstration-or-demolition/\n- https://greatdemo.com/just-do-it-in-demos/\n[/Sources]`,
  );
  slide.speakerNotes.setVisible(true);
}

for (const [index, slide] of presentation.slides.items.entries()) {
  const stem = `slide-${String(index + 1).padStart(2, "0")}`;
  await writeBlob(path.join(renderedDir, `${stem}.png`), await presentation.export({ slide, format: "png", scale: 1 }));
  await fs.writeFile(path.join(renderedDir, `${stem}.layout.json`), await (await slide.export({ format: "layout" })).text());
}

await writeBlob(
  path.join(outputDir, "RepoFinder-Slides-V2-montage.webp"),
  await presentation.export({ format: "webp", montage: true, scale: 1 }),
);

const inspection = await presentation.inspect({ kind: "slide,image,notes,layout", maxChars: 20000 });
await fs.writeFile(path.join(outputDir, "RepoFinder-Slides-V2-inspection.ndjson"), inspection.ndjson);

const pptx = await PresentationFile.exportPptx(presentation);
await pptx.save(path.join(outputDir, "RepoFinder-Slides-V2.pptx"));

console.log(`Created ${scenes.length} slides in ${outputDir}`);

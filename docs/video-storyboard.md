# RepoFinder walkthrough video storyboard

Target length: 3 minutes. Format: 16:9, 1920 by 1080. Use the exact narration in `docs/demo-script.md` or speak naturally from the prompts below.

The repository also includes a [101-second narrated preview](./video/repofinder-walkthrough.mp4), its [source slides](./video/walkthrough-slides.html), and its [narration](./video/narration.txt). Use the preview to rehearse, then record the live version below in your own voice.

## Scene 1: the decision problem

- Screen: RepoFinder home page.
- Action: Point to “Project or website” and “What do you want to add?”
- Message: GitHub search finds popular code. RepoFinder helps choose code that fits the current project and goal.

## Scene 2: live recommendation

- Screen: Select OpenAI Node SDK and production evals.
- Action: Run the search. Pause on the source analysis and top three cards.
- Message: GitHub provides objective facts. OpenAI provides project-specific ranking and explanation.

## Scene 3: useful follow-up

- Screen: Open “Ask OpenAI about this repo.”
- Action: Ask “What are the strongest alternatives, and when would I choose each?” Open one generated link in a new tab.
- Message: The chat is simple, linked, and designed to advance the decision with one smart question.

## Scene 4: reusable architecture

- Screen: First Mermaid diagram in `docs/architecture.md` on GitHub.
- Action: Trace Browser and MCP into the shared engine.
- Message: One engine prevents the web and agent experiences from drifting.

## Scene 5: reliability and safety

- Screen: `src/openai.ts`, then `tests/chat.test.ts` and `tests/telemetry.test.ts`.
- Action: Point to strict JSON schema, `store: false`, safe link tests, and request-secret exclusion test.
- Message: Exact code contracts use tests. Model judgment uses evals. Provider failure uses a visible fallback.

## Scene 6: operating discipline

- Screen: Cloudflare isolation diagram, then the lesson index.
- Action: Point to RepoFinder-only Worker, D1, domain, and secrets.
- Message: The build is deployable, observable, reversible, and documented so another engineer can reuse the decisions.

## Recording checklist

- Close personal tabs and notifications.
- Use a clean browser profile and 125 percent zoom.
- Preload the live result once so GitHub and OpenAI latency are predictable.
- Keep the cursor still while speaking.
- Record one full take, then a second take with slower transitions.
- Never show Cloudflare secret values, Telegram tokens, OpenAI billing, or private visitor records.
- End on `repofinder.io` and the public GitHub repository.

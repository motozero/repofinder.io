# Interview brief

Visual rehearsal: [101-second narrated walkthrough](./video/repofinder-walkthrough.mp4).

## The story in one sentence

I took a hackathon insight, rebuilt it with Codex as an OpenAI-native tool, and focused on the work that turns a prototype into a dependable, reusable customer demo.

## The 30 second version

RepoFinder accepts a GitHub repository or website plus a goal, such as production evals. It combines live GitHub facts with the OpenAI Responses API to produce a project-specific shortlist. The same engine powers the web API and an MCP tool. Structured outputs, a labeled fallback, rate limits, SSRF controls, D1 persistence, safe chat rendering, and isolated Cloudflare resources make the demo dependable enough to use in front of a customer.

## Decisions worth discussing

- I chose one shared engine so the web experience and agent tool cannot drift.
- I use structured outputs because parsing recovery is not a production contract.
- I route extraction and reasoning separately so cost and quality choices stay legible.
- I ground objective claims in GitHub data and reserve model reasoning for fit.
- I designed and labeled a fallback because demo reliability matters as much as the happy path.
- I checked in a skill because repeatable developer workflow is more valuable than a one-off prompt.
- I isolated every Cloudflare resource to make ownership and rollback obvious.
- I separated clean customer chat from detailed private operator telemetry.
- I built request logging from an explicit allowlist so useful signals never require serializing secret-bearing request fields.
- I treated an exposed Telegram token as compromised and rotated it before launch.

## The architecture in one breath

`src/index.ts` owns HTTP routing. `src/mcp.ts` owns the MCP surface. Both call `recommend` in `src/engine.ts`. The engine fetches source context and GitHub candidates, then `src/openai.ts` makes Responses API calls behind one provider boundary. D1 stores usage, chats, and allowlisted request records. `src/telemetry.ts` shapes operator notifications. Static HTML and JavaScript in `public` render the customer experience without a frontend framework.

## What Codex contributed

Codex was used across the whole loop: repository mapping, current API research, plan formation, implementation, unit tests, adversarial cases, browser QA, Cloudflare migration, deployment verification, and the lesson book. `AGENTS.md` kept architectural and safety constraints durable across turns. Skills supplied repeatable QA and security review workflows. The important choice was to require evidence at every boundary instead of accepting generated code as completion.

## Failure modes I designed for

- OpenAI outage or missing credit: labeled GitHub fallback.
- Invalid or private website URL: validation, redirect checks, and SSRF guards.
- Model output that contains HTML or unsafe URLs: escaped Markdown subset and HTTP or HTTPS links only.
- Prompt injection from a repository README: external context stays in a JSON-encoded user-role object, never in system instructions.
- Public spend amplification: separate Cloudflare rate limits for AI, writes, and admin.
- Lost conversation context: awaited D1 writes and bounded recent history.
- Leaked request secrets: explicit telemetry allowlist with regression tests.
- Cross-product blast radius: RepoFinder-only Worker, D1, domain, and secrets.

## Evidence to show

- Live result and repo chat at [repofinder.io](https://repofinder.io)
- Shared engine in [`src/engine.ts`](../src/engine.ts)
- Strict Responses API adapter in [`src/openai.ts`](../src/openai.ts)
- MCP surface in [`src/mcp.ts`](../src/mcp.ts)
- Adversarial tests in [`tests/chat.test.ts`](../tests/chat.test.ts) and [`tests/telemetry.test.ts`](../tests/telemetry.test.ts)
- Cloudflare boundary in [`wrangler.jsonc`](../wrangler.jsonc)
- Build narrative in [`lessons`](../lessons)

## If Zach asks what you would do next

Add a small reference dataset from real developer choices, measure recommendation acceptance and time to first proof of concept, then use those outcomes to improve ranking. Add retention controls and a deletion workflow before treating telemetry as a long-term product system. Keep the demo architecture, but graduate operational controls in proportion to real traffic and customer sensitivity.

## Good questions for the hiring manager

- Where does the team draw the line between a customer-specific demo and a reusable accelerator?
- Which failure mode most often separates an impressive prototype from a field-ready demo?
- How are demo quality, reuse, and customer impact measured after delivery?
- What does excellent partnership between Demo Experience, Solutions, Product, and Research look like?

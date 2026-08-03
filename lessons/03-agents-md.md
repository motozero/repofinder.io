# Lesson 3: steer Codex with AGENTS.md

`AGENTS.md` is durable project context for Codex. It should contain rules that remain true across tasks, not a transcript of one build session.

RepoFinder records four kinds of durable context:

- Architecture: one engine, two surfaces, one OpenAI boundary.
- Runtime: Cloudflare Worker, D1, Responses API, and model roles.
- Safety: secret handling, input bounds, SSRF controls, and honest labels.
- Quality: typecheck, tests, browser QA, and deployment isolation.

Good instructions are short enough to be read and concrete enough to check. “Write clean code” is vague. “Recommendation logic lives only in `src/engine.ts`” is enforceable.

## Try it

Ask Codex to explain the project architecture before making a change. If the answer misses a critical constraint, improve `AGENTS.md`, not the prompt for one session.

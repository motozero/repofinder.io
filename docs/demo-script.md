# Three minute demo script

The detailed version below takes about three minutes. If time is cut, keep the live search, one architecture diagram, and the reliability close.

## Open with the user problem

“A developer knows what capability they need, but not which of thousands of repositories fits their stack. GitHub search gives links. RepoFinder gives a decision-ready shortlist.”

## Run the happy path

1. Choose `openai/openai-node` and `production evals`.
2. Point out the source summary and stack.
3. Show what, why, how, ease, impact, and live maintenance signals.
4. Open one repository and explain that facts come from GitHub while fit comes from OpenAI.
5. Ask OpenAI about the leading repository. Point out the clean links and the specific question that advances the evaluation.

## Show reuse

Open [`docs/architecture.md`](./architecture.md) and show the first diagram. The browser API and `recommend_repos` MCP tool call one engine. Then show the checked-in Codex skill. MCP supplies the capability. The skill supplies repeatable workflow judgment.

## Show reliability

Explain the `mode` field and labeled GitHub fallback. The experience still returns useful results if the model is unavailable, without pretending the fallback was model ranked.

## Close on production readiness

Show the strict schemas, 44 deterministic tests, model evals, SSRF checks, request telemetry allowlist, Cloudflare resource isolation, and public lesson book. End with: “The demo is the visible surface. The reusable accelerator is the architecture and the operating discipline behind it.”

## Shot-by-shot talk track

| Time | Screen | Say |
|---|---|---|
| 0:00 | RepoFinder home | “Finding a popular repository is easy. Finding one that fits this project, this stack, and this goal is the real decision.” |
| 0:20 | Run OpenAI Node plus production evals | “RepoFinder reads the source, searches live GitHub, then asks OpenAI to rank fit. GitHub owns the facts. The model owns the explanation.” |
| 0:55 | Recommendation cards | “Each candidate answers what it is, why it fits, how to test it, and whether the project is maintained.” |
| 1:15 | Repo chat | “The follow-up chat keeps the output simple, gives real links, and always asks the next useful decision question.” |
| 1:40 | Architecture diagram | “The web API and MCP tool share one engine. The interface changes. Product logic does not.” |
| 2:05 | Fallback and test files | “If OpenAI is unavailable, the app labels a deterministic GitHub fallback. Exact behavior has unit tests. Model judgment has evals.” |
| 2:30 | Isolation diagram and lessons | “The Worker, D1 database, domain, secrets, telemetry, and rollback are isolated. The lessons make the build reusable for another engineer.” |
| 2:55 | Home or GitHub | “The demo is the visible surface. The reusable accelerator is the system and the way it was built.” |

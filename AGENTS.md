# RepoFinder

RepoFinder accepts a GitHub repository or public website plus a developer goal. It returns maintained open source repositories that complement the source, with project-specific reasoning and integration guidance.

This repository is also a Codex teaching artifact. Keep the product, lessons, skills, and claims in sync.

## Architecture

- `src/engine.ts` owns all recommendation logic through `recommend(input, goal, env)`.
- `src/index.ts` exposes the browser HTTP API.
- `src/mcp.ts` exposes the same engine as the `recommend_repos` MCP tool.
- `src/openai.ts` is the only OpenAI provider boundary.
- Surfaces validate and shape requests. They never duplicate engine logic.

## Runtime

- Cloudflare Worker with Static Assets and an isolated D1 database.
- TypeScript and ES modules. The frontend is plain HTML, CSS, and JavaScript.
- OpenAI Responses API with strict JSON Schema outputs.
- `gpt-5.6-luna` handles extraction. `gpt-5.6-terra` handles ranking and explanations.
- Live GitHub ranking is the labeled fallback when OpenAI is missing or unavailable.

## Isolation

All production resources belong to RepoFinder:

- GitHub: `motozero/repofinder.io`
- Worker: `repofinder-io`
- D1: `repofinder-io`
- Domain: `repofinder.io`

Do not bind, route, deploy, or store data in RepoRecommender resources.

## Security and privacy

- Never commit secrets. Local values live in `.dev.vars`; production values use Wrangler secrets.
- Keep GitHub access read only and least privilege.
- Bound every public input. Validate public website targets and every redirect to reduce SSRF risk.
- Preserve security headers and the Content Security Policy.
- Do not claim model output is deterministic or authoritative.

## Product writing

- Use sentence case headings.
- Be direct and concrete. Avoid filler and marketing superlatives.
- Do not use em dashes or doubled hyphens in prose.
- Clearly label OpenAI-ranked output and fallback output.

## Quality gates

Before shipping:

1. Run `npm run typecheck`.
2. Run `npm test`.
3. Exercise the affected flow in a real browser.
4. Review input validation, secret handling, fallback behavior, and deployment isolation.

After changing `wrangler.jsonc`, run `npm run cf-typegen` when generated bindings are needed.

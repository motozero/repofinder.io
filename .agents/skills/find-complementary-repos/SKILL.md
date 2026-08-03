---
name: find-complementary-repos
description: Find open source repositories that add a requested capability to a codebase or website. Use when the user asks for a library, integration, architecture component, or maintained open source option that should fit an existing project.
---

# Find complementary repositories

Use the `recommend_repos` tool from the RepoFinder MCP server when it is available.

## Workflow

1. Identify the source repository, website, or `owner/repo` shorthand.
2. Turn the desired outcome into a concrete capability, such as `production evals` or `background jobs`.
3. Call `recommend_repos` with `repoOrUrl` and `goal`.
4. Present the top three candidates. Include fit, integration path, maintenance signals, and the result mode.
5. Ask before implementing a recommendation. Discovery does not authorize dependency changes.

## Guardrails

- Treat recommendations as candidates, not approvals.
- Check licenses and security posture before adoption.
- Say when the result used the GitHub fallback instead of OpenAI ranking.
- Prefer a small proof of concept before a production dependency decision.

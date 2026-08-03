# Lesson 8: expose the engine through MCP

MCP lets an agent discover and call RepoFinder as a tool. The remote server exposes `recommend_repos` over Streamable HTTP at `/mcp`.

The tool accepts two bounded strings and returns the same typed result as the browser API. It does not contain a second prompt or ranking algorithm. The Cloudflare Durable Object supplies the stateful protocol lifecycle required by the server framework.

The checked-in `.codex/config.toml` points Codex at the production endpoint. The companion skill adds workflow guidance. Keeping protocol and judgment separate makes each easier to reuse.

## Try it

Connect an MCP client to `https://repofinder.io/mcp`, list tools, then call `recommend_repos` with `openai/openai-node` and `production evals`.

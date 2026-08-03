// Surface 2: our own MCP server. It exposes the same recommendation engine as a
// tool, so Codex, Codex app, or any agent can call it directly. The
// website (src/index.ts) and this server share one engine. The caller decides
// the interface: software uses the HTTP API, agents use MCP.

import { McpAgent } from "agents/mcp";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { recommend, type EngineEnv } from "./engine";

export class RepoFinderMCP extends McpAgent<EngineEnv> {
  server = new McpServer({ name: "repofinder", version: "1.0.0" });

  async init() {
    this.server.tool(
      "recommend_repos",
      "Given a GitHub repo (URL or owner/repo) or a website URL plus a goal, return GitHub " +
        "repos that complement it. Each result includes what it is, why it fits, how to integrate " +
        "it, ease and impact ratings, and objective metrics (last updated, commits in the last 90 " +
        "days, forks, contributors).",
      { repoOrUrl: z.string().min(1).max(500), goal: z.string().min(1).max(300) },
      async ({ repoOrUrl, goal }) => {
        const result = await recommend(repoOrUrl, goal, this.env);
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      },
    );
  }
}

// Surface 2: a stateless MCP server over Streamable HTTP. It exposes the same
// recommendation engine as the browser API, with no duplicate ranking logic.

import { McpServer } from "@modelcontextprotocol/server";
import { createMcpHandler } from "agents/mcp/server";
import { z } from "zod";
import { recommend, type EngineEnv } from "./engine";

function createRepoFinderServer(env: EngineEnv): McpServer {
  const server = new McpServer({ name: "repofinder", version: "1.0.0" });
  server.registerTool(
    "recommend_repos",
    {
      description:
        "Given a GitHub repo (URL or owner/repo) or a website URL plus a goal, return GitHub " +
        "repos that complement it. Each result includes what it is, why it fits, how to integrate " +
        "it, ease and impact ratings, and objective maintenance metrics.",
      inputSchema: {
        repoOrUrl: z.string().min(1).max(500),
        goal: z.string().min(1).max(300),
      },
    },
    async ({ repoOrUrl, goal }) => {
      const result = await recommend(repoOrUrl, goal, env);
      return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] };
    },
  );
  return server;
}

export function handleMcpRequest(request: Request, env: EngineEnv, ctx: ExecutionContext): Promise<Response> {
  const handler = createMcpHandler(() => createRepoFinderServer(env), {
    route: "/mcp",
    legacy: "stateless",
    allowedHostnames: ["repofinder.io", "localhost", "127.0.0.1", "[::1]"],
    allowedOriginHostnames: ["repofinder.io", "localhost", "127.0.0.1", "[::1]"],
    corsOptions: { origin: "https://repofinder.io" },
  });
  return handler(request, env, ctx);
}

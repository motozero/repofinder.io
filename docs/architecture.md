# Architecture decisions

```mermaid
flowchart LR
  B["Browser"] --> H["POST /api/recommend"]
  A["Codex or another agent"] --> M["recommend_repos over MCP"]
  H --> E["recommend(repoOrUrl, goal)"]
  M --> E
  E --> G["Live GitHub facts"]
  E --> O["OpenAI Responses API"]
  G --> R["Grounded recommendation result"]
  O --> R
  O -. unavailable .-> F["Labeled GitHub fallback"]
  F --> R
```

## One engine, two surfaces

The browser and MCP clients call the same `recommend` function. This prevents prompt, ranking, and fallback behavior from drifting across interfaces.

## One provider boundary

Only `src/openai.ts` knows the OpenAI wire format. The engine owns schemas and product prompts. That keeps provider changes small and makes model behavior visible during review.

## Grounded ranking

The model does not invent repository metrics. GitHub supplies facts. OpenAI interprets fit and writes integration guidance inside a strict schema.

## Visible degradation

Missing keys and provider errors fall back to live GitHub ranking. The response includes `mode`, and the interface labels it. A working but less personalized answer is better than a failed demo, as long as the limitation is explicit.

## Deployment boundary

RepoFinder owns a Worker, D1 database, custom domain, GitHub repository, and secrets. No runtime resource is shared with RepoRecommender.

```mermaid
flowchart TB
  subgraph RF["RepoFinder silo"]
    D["repofinder.io"] --> W["Worker: repofinder-io"]
    W --> DB["D1: repofinder-io"]
    W --> S["RepoFinder Worker secrets"]
  end
  subgraph RR["RepoRecommender silo"]
    RD["reporecommender.com"] --> RW["Separate Worker"]
    RW --> RDB["Separate data and secrets"]
  end
```

## Chat and activity boundary

The browser and operator views are intentionally different. The browser renders an escaped Markdown subset with safe new-tab links. D1 stores complete chat turns and passive request telemetry. Telegram receives one operator-focused alert only after a valid analysis completes. Request metadata comes from an allowlist, never from serializing the request object.

```mermaid
sequenceDiagram
  participant V as Visitor
  participant W as Cloudflare Worker
  participant D as D1
  participant O as OpenAI
  participant T as Telegram
  V->>W: Repo question
  W->>D: Store user turn
  W->>O: Instructions, repo context, recent turns
  O-->>W: Answer ending in a useful question
  W->>D: Store assistant turn
  W-->>V: Safe Markdown and new-tab links
  V->>W: Project and goal for analysis
  W->>O: Source analysis and recommendation ranking
  O-->>W: Ranked recommendations
  W->>D: Store completed analysis
  W-->>V: Recommendation results
  W->>T: Completed analysis alert
```

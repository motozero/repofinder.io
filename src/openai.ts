// The OpenAI Responses API adapter is the only provider-specific runtime code.
// The engine owns product logic and passes explicit output contracts into this
// module. Keeping the boundary small makes model routing and evaluation clear.

const OPENAI_URL = "https://api.openai.com/v1/responses";

export const MODELS = {
  // High-volume extraction and query generation.
  extract: "gpt-5.6-luna",
  // Recommendation ranking and customer-facing explanations.
  reason: "gpt-5.6-terra",
} as const;

export interface JsonSchemaFormat {
  name: string;
  description: string;
  schema: Record<string, unknown>;
}

export interface OpenAIOpts {
  apiKey: string;
  model: string;
  input: string | ChatTurn[];
  instructions?: string;
  maxOutputTokens?: number;
  reasoningEffort?: "none" | "low" | "medium" | "high";
  schema?: JsonSchemaFormat;
}

interface ResponseBody {
  error?: { message?: string };
  output?: Array<{
    type?: string;
    content?: Array<{ type?: string; text?: string; refusal?: string }>;
  }>;
  output_text?: string;
}

export interface ChatTurn {
  role: "user" | "assistant";
  content: string;
}

export async function callOpenAI(opts: OpenAIOpts): Promise<string> {
  const text = opts.schema
    ? {
        verbosity: "low",
        format: {
          type: "json_schema",
          name: opts.schema.name,
          description: opts.schema.description,
          strict: true,
          schema: opts.schema.schema,
        },
      }
    : { verbosity: "low" };

  const res = await fetch(OPENAI_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${opts.apiKey}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: opts.model,
      instructions: opts.instructions,
      input: opts.input,
      max_output_tokens: opts.maxOutputTokens ?? 1024,
      reasoning: { effort: opts.reasoningEffort ?? "low" },
      text,
      store: false,
    }),
  });

  const body = (await res.json().catch(() => ({}))) as ResponseBody;
  if (!res.ok) {
    throw new Error(`OpenAI ${res.status}: ${(body.error?.message ?? "request failed").slice(0, 300)}`);
  }

  const output = body.output_text ||
    (body.output ?? [])
      .flatMap((item) => item.content ?? [])
      .map((item) => item.text ?? item.refusal ?? "")
      .filter(Boolean)
      .join("\n")
      .trim();

  if (!output) throw new Error("OpenAI returned no text output.");
  return output;
}

export function callOpenAIMessages(opts: {
  apiKey: string;
  model: string;
  instructions?: string;
  messages: ChatTurn[];
  maxOutputTokens?: number;
}): Promise<string> {
  return callOpenAI({
    apiKey: opts.apiKey,
    model: opts.model,
    instructions: opts.instructions,
    input: opts.messages,
    maxOutputTokens: opts.maxOutputTokens ?? 700,
    reasoningEffort: "low",
  });
}

export function parseStructured<T>(text: string): T {
  return JSON.parse(text) as T;
}

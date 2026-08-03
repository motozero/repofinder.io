import { afterEach, describe, it } from "node:test";
import assert from "node:assert/strict";
import worker, { handleRecommend, type Env } from "../src/index.ts";
import type { RecommendResult } from "../src/engine.ts";

// Regression: ISSUE-001, passive traffic and unfinished analyses triggered Telegram alerts.
// Found by /qa on 2026-08-03.
// Report: .gstack/qa-reports/qa-report-repofinder-io-2026-08-03.md

const originalFetch = globalThis.fetch;

afterEach(() => {
  globalThis.fetch = originalFetch;
});

function executionContext(): { ctx: ExecutionContext; pending: Promise<unknown>[] } {
  const pending: Promise<unknown>[] = [];
  const ctx = {
    waitUntil(promise: Promise<unknown>) {
      pending.push(promise);
    },
  } as ExecutionContext;
  return { ctx, pending };
}

function telegramSpy(): { calls: { url: string; body: Record<string, unknown> }[] } {
  const calls: { url: string; body: Record<string, unknown> }[] = [];
  globalThis.fetch = async (input, init) => {
    calls.push({
      url: String(input),
      body: JSON.parse(String(init?.body ?? "{}")) as Record<string, unknown>,
    });
    return Response.json({ ok: true });
  };
  return { calls };
}

function notificationEnv(extra: Partial<Env> = {}): Env {
  return {
    TELEGRAM_BOT_TOKEN: "test-token",
    TELEGRAM_CHAT_ID: "test-chat",
    ...extra,
  } as Env;
}

function databaseSpy(): { DB: D1Database; values: unknown[][] } {
  const values: unknown[][] = [];
  const DB = {
    prepare() {
      return {
        bind(...bound: unknown[]) {
          values.push(bound);
          return { run: async () => ({ success: true }) };
        },
      };
    },
  } as unknown as D1Database;
  return { DB, values };
}

const result: RecommendResult = {
  source: {
    fullName: "openai/openai-node",
    kind: "repo",
    purpose: "The official OpenAI JavaScript library.",
    stack: ["TypeScript"],
  },
  goal: "production evals",
  mode: "openai",
  recommendations: [],
};

describe("Telegram notification policy", () => {
  it("sends exactly one alert only after a valid analysis completes", async () => {
    const telegram = telegramSpy();
    const { ctx, pending } = executionContext();
    let finishAnalysis!: (value: RecommendResult) => void;
    const analysis = new Promise<RecommendResult>((resolve) => {
      finishAnalysis = resolve;
    });
    const request = new Request("https://repofinder.io/api/recommend", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ repoUrl: "openai/openai-node", goal: "production evals" }),
    });

    const responsePromise = handleRecommend(request, notificationEnv(), ctx, () => analysis);
    await Promise.resolve();
    assert.equal(telegram.calls.length, 0, "an in-progress analysis must stay silent");

    finishAnalysis(result);
    const response = await responsePromise;
    await Promise.allSettled(pending);

    assert.equal(response.status, 200);
    assert.equal(telegram.calls.length, 1);
    assert.match(telegram.calls[0]?.url ?? "", /api\.telegram\.org\/bottest-token\/sendMessage/);
    const text = String(telegram.calls[0]?.body.text ?? "");
    assert.match(text, /REPOFINDER ANALYSIS COMPLETE/);
    assert.match(text, /openai\/openai-node/);
    assert.match(text, /production evals/);
  });

  it("does not alert for invalid or failed analyses", async () => {
    const telegram = telegramSpy();

    const invalid = executionContext();
    const invalidResponse = await handleRecommend(
      new Request("https://repofinder.io/api/recommend", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ repoUrl: "", goal: "production evals" }),
      }),
      notificationEnv(),
      invalid.ctx,
      async () => result,
    );
    assert.equal(invalidResponse.status, 400);

    const failed = executionContext();
    const failedResponse = await handleRecommend(
      new Request("https://repofinder.io/api/recommend", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ repoUrl: "openai/openai-node", goal: "production evals" }),
      }),
      notificationEnv(),
      failed.ctx,
      async () => {
        throw new Error("analysis failed");
      },
    );
    await Promise.allSettled([...invalid.pending, ...failed.pending]);

    assert.equal(failedResponse.status, 502);
    assert.equal(telegram.calls.length, 0);
  });

  it("keeps browser page visits in D1 without sending Telegram alerts", async () => {
    const telegram = telegramSpy();
    const { ctx, pending } = executionContext();
    const database = databaseSpy();
    const env = notificationEnv({
      DB: database.DB,
      ASSETS: {
        fetch: async () => new Response("<!doctype html><title>RepoFinder</title>", { headers: { "content-type": "text/html" } }),
      } as unknown as Fetcher,
    });

    const response = await worker.fetch(
      new Request("https://repofinder.io/", { headers: { accept: "text/html" } }),
      env,
      ctx,
    );
    await Promise.allSettled(pending);

    assert.equal(response.status, 200);
    assert.ok(database.values.some((bound) => bound.includes("page_view")));
    assert.equal(telegram.calls.length, 0);
  });
});

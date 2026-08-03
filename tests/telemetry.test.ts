import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { isDocumentVisit, logRequest, parseUA, requestSnapshot, visitor } from "../src/telemetry.ts";

function withCf(request: Request, cf: Record<string, unknown>): Request {
  Object.defineProperty(request, "cf", { value: cf, configurable: true });
  return request;
}

describe("request telemetry allowlist", () => {
  it("parses common desktop and mobile user agents", () => {
    const chrome = parseUA("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/151.0.0.0 Safari/537.36");
    assert.deepEqual(chrome, { browser: "Chrome", browserVersion: "151.0.0.0", os: "macOS", device: "Desktop" });

    const safari = parseUA("Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 Version/17.5 Mobile/15E148 Safari/604.1");
    assert.deepEqual(safari, { browser: "Safari", browserVersion: "17.5", os: "iOS", device: "Mobile" });
  });

  it("records the path but strips the query string", () => {
    const request = withCf(
      new Request("https://repofinder.io/privacy?secret=do-not-store", {
        headers: {
          "cf-connecting-ip": "203.0.113.7",
          "user-agent": "Mozilla/5.0 Chrome/151.0.0.0 Safari/537.36",
          referer: "https://example.com/source?private=referrer-secret",
        },
      }),
      { country: "US", city: "San Francisco", colo: "SFO", asn: 64500, asOrganization: "Example ISP" },
    );
    const snapshot = requestSnapshot(request, visitor(request));
    assert.equal(snapshot.url, "https://repofinder.io/privacy");
    assert.equal(snapshot.path, "/privacy");
    assert.equal(snapshot.referrer, "https://example.com/source");
    assert.doesNotMatch(JSON.stringify(snapshot), /do-not-store|referrer-secret/);
  });

  it("never copies cookies, authorization, query strings, or request bodies into D1", async () => {
    let values: unknown[] = [];
    const db = {
      prepare() {
        return {
          bind(...bound: unknown[]) {
            values = bound;
            return { run: async () => ({ success: true }) };
          },
        };
      },
    } as unknown as D1Database;
    const request = withCf(
      new Request("https://repofinder.io/api/chat?token=query-secret", {
        method: "POST",
        headers: {
          authorization: "Bearer auth-secret",
          cookie: "session=cookie-secret",
          "content-type": "application/json",
          "cf-connecting-ip": "203.0.113.8",
        },
        body: JSON.stringify({ password: "body-secret" }),
      }),
      { country: "US", colo: "SFO" },
    );

    await logRequest({ DB: db }, "chat_turn", request, visitor(request), { sessionId: "session-123456789" });
    const stored = JSON.stringify(values);
    assert.match(stored, /chat_turn/);
    assert.doesNotMatch(stored, /query-secret|auth-secret|cookie-secret|body-secret/);
  });

  it("classifies only browser document requests as page visits", () => {
    assert.equal(isDocumentVisit(new Request("https://repofinder.io/", { headers: { accept: "text/html" } })), true);
    assert.equal(isDocumentVisit(new Request("https://repofinder.io/styles.css", { headers: { accept: "text/css" } })), false);
    assert.equal(isDocumentVisit(new Request("https://repofinder.io/api/health", { headers: { accept: "text/html" } })), false);
    assert.equal(isDocumentVisit(new Request("https://repofinder.io/", { method: "POST", headers: { accept: "text/html" } })), false);
  });
});

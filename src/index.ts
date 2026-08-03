import { recommend, InputError, type EngineEnv } from "./engine";
import { handleMcpRequest } from "./mcp";
import { handleEvent, handleChat, renderTranscript } from "./chat";
import { handleAdmin } from "./admin";
import {
  visitor,
  notify,
  logRequest,
  isDocumentVisit,
  pageVisitText,
  requestIntelHtml,
  tgEsc,
  type Visitor,
} from "./telemetry";
import { enforceRateLimit, type RateLimitBinding } from "./security";

export interface Env extends EngineEnv {
  ASSETS: Fetcher;
  DB: D1Database;
  AI_RATE_LIMITER: RateLimitBinding;
  WRITE_RATE_LIMITER: RateLimitBinding;
  ADMIN_RATE_LIMITER: RateLimitBinding;
  // Contact + notifications. Set with `wrangler secret put`, kept out of the repo.
  RESEND_API_KEY?: string;
  CONTACT_TO_EMAIL?: string;
  CONTACT_FROM_EMAIL?: string;
  TELEGRAM_BOT_TOKEN?: string;
  TELEGRAM_CHAT_ID?: string;
  ADMIN_PASSWORD?: string;
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);

    if (isDocumentVisit(request, url)) {
      const v = visitor(request);
      ctx.waitUntil(Promise.allSettled([logRequest(env, "page_view", request, v), notify(env, pageVisitText(request, v))]));
    }

    // Surface 2: our own stateless MCP server over Streamable HTTP.
    if (url.pathname === "/mcp") {
      const limited = await enforceRateLimit(env.AI_RATE_LIMITER, request, "mcp");
      if (limited) return limited;
      return handleMcpRequest(request, env, ctx);
    }

    if (url.pathname === "/api/health") {
      return Response.json({
        ok: true,
        service: "repofinder",
        version: "1.0.0",
        openaiConfigured: Boolean(env.OPENAI_API_KEY),
      });
    }

    if (url.pathname === "/api/recommend" && request.method === "POST") {
      const limited = await enforceRateLimit(env.AI_RATE_LIMITER, request, "recommend");
      if (limited) return limited;
      return handleRecommend(request, env, ctx);
    }

    if (url.pathname === "/api/contact" && request.method === "POST") {
      const limited = await enforceRateLimit(env.WRITE_RATE_LIMITER, request, "contact");
      if (limited) return limited;
      return handleContact(request, env, ctx);
    }

    if (url.pathname === "/api/event" && request.method === "POST") {
      const limited = await enforceRateLimit(env.WRITE_RATE_LIMITER, request, "event");
      if (limited) return limited;
      return handleEvent(request, env, ctx);
    }

    if (url.pathname === "/api/chat" && request.method === "POST") {
      const limited = await enforceRateLimit(env.AI_RATE_LIMITER, request, "chat");
      if (limited) return limited;
      return handleChat(request, env, ctx);
    }

    if (url.pathname.startsWith("/api/")) {
      return Response.json({ error: "not found" }, { status: 404 });
    }

    // Read-only chat transcript at /c/<session_id>.
    if (url.pathname.startsWith("/c/") && request.method === "GET") {
      const id = url.pathname.slice(3);
      if (id) return renderTranscript(id, env);
    }

    // Password-protected activity dashboard.
    if (url.pathname === "/admin" && request.method === "GET") {
      const limited = await enforceRateLimit(env.ADMIN_RATE_LIMITER, request, "admin");
      if (limited) return limited;
      return handleAdmin(request, env);
    }

    const response = await env.ASSETS.fetch(request);
    const headers = new Headers(response.headers);
    headers.set("x-content-type-options", "nosniff");
    headers.set("referrer-policy", "strict-origin-when-cross-origin");
    headers.set("permissions-policy", "camera=(), microphone=(), geolocation=()");
    headers.set("content-security-policy", "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; connect-src 'self'; img-src 'self' data:; frame-ancestors 'none'; base-uri 'none'; form-action 'self'");
    return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
  },
} satisfies ExportedHandler<Env>;

async function handleRecommend(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
  let body: { repoUrl?: string; goal?: string };
  try {
    body = (await request.json()) as { repoUrl?: string; goal?: string };
  } catch {
    return Response.json({ error: "Body must be JSON." }, { status: 400 });
  }

  const repoUrl = (body.repoUrl ?? "").trim();
  const goal = (body.goal ?? "").trim();
  if (!repoUrl) return Response.json({ error: "repoUrl is required." }, { status: 400 });
  if (!goal) return Response.json({ error: "goal is required." }, { status: 400 });
  if (repoUrl.length > 500) return Response.json({ error: "repoUrl is too long (max 500 chars)." }, { status: 400 });
  if (goal.length > 300) return Response.json({ error: "goal is too long (max 300 chars)." }, { status: 400 });

  // Someone is trying the tool. Record who (geo, network, device) and ping
  // Telegram, without blocking or breaking the request if either is unconfigured.
  const v = visitor(request);
  ctx.waitUntil(
    Promise.allSettled([
      logUsage(env, repoUrl, goal, v),
      logRequest(env, "recommend", request, v, { repo: repoUrl }),
      notify(env, usageText(request, repoUrl, goal, v)),
    ]),
  );

  try {
    const result = await recommend(repoUrl, goal, env);
    return Response.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error.";
    return Response.json({ error: message }, { status: err instanceof InputError ? 400 : 502 });
  }
}

async function handleContact(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
  let body: { name?: string; email?: string; message?: string; website?: string };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return Response.json({ error: "Body must be JSON." }, { status: 400 });
  }

  // Honeypot: bots tend to fill the hidden "website" field. Accept and drop it
  // silently so they get no signal that they were caught.
  if ((body.website ?? "").trim()) return Response.json({ ok: true });

  const name = (body.name ?? "").trim();
  const email = (body.email ?? "").trim();
  const message = (body.message ?? "").trim();
  if (!name || !email || !message) {
    return Response.json({ error: "Name, email, and message are required." }, { status: 400 });
  }
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return Response.json({ error: "That email does not look valid." }, { status: 400 });
  }
  if (name.length > 120 || email.length > 200 || message.length > 4000) {
    return Response.json({ error: "One of the fields is too long." }, { status: 400 });
  }

  const v = visitor(request);
  ctx.waitUntil(logRequest(env, "contact", request, v));

  // D1 is the durable record, so a message is never lost even if email or
  // Telegram is down. Email and Telegram are best-effort notifications on top.
  let stored = false;
  if (env.DB) {
    try {
      await env.DB.prepare(
        "INSERT INTO messages (created_at, name, email, message, asn, as_org, country, city, region) VALUES (?,?,?,?,?,?,?,?,?)",
      )
        .bind(new Date().toISOString(), name, email, message, v.asn, v.asOrg, v.country, v.city, v.region)
        .run();
      stored = true;
    } catch (err) {
      console.log("d1 messages error", err instanceof Error ? err.message : String(err));
    }
  }

  const emailPromise = sendContactEmail(env, name, email, message);
  const tgPromise = notify(env, contactText(request, name, email, message, v));

  if (stored) {
    ctx.waitUntil(Promise.allSettled([emailPromise, tgPromise]));
    return Response.json({ ok: true });
  }

  // No durable store available (e.g. local dev without D1): only claim success
  // if a notification actually went out.
  const emailOk = await emailPromise;
  await tgPromise;
  if (emailOk || (env.TELEGRAM_BOT_TOKEN && env.TELEGRAM_CHAT_ID)) return Response.json({ ok: true });
  if (!env.RESEND_API_KEY && !env.TELEGRAM_BOT_TOKEN) {
    return Response.json({ error: "Contact is not configured on the server yet." }, { status: 503 });
  }
  return Response.json({ error: "Could not send the message. Please try again later." }, { status: 502 });
}

async function logUsage(env: Env, input: string, goal: string, v: Visitor): Promise<void> {
  if (!env.DB) return;
  try {
    await env.DB.prepare(
      "INSERT INTO usage (created_at, input, goal, browser, os, asn, as_org, country, city, region, timezone, colo) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)",
    )
      .bind(new Date().toISOString(), input, goal, v.browser, v.os, v.asn, v.asOrg, v.country, v.city, v.region, v.timezone, v.colo)
      .run();
  } catch (err) {
    console.log("d1 usage error", err instanceof Error ? err.message : String(err));
  }
}

async function sendContactEmail(env: Env, name: string, email: string, message: string): Promise<boolean> {
  if (!env.RESEND_API_KEY || !env.CONTACT_TO_EMAIL) return false;
  try {
    const from = env.CONTACT_FROM_EMAIL || "RepoFinder <onboarding@resend.dev>";
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, "content-type": "application/json" },
      body: JSON.stringify({
        from,
        to: [env.CONTACT_TO_EMAIL],
        reply_to: email,
        subject: `RepoFinder contact from ${name}`,
        text: `From: ${name} <${email}>\n\n${message}`,
      }),
    });
    if (!res.ok) {
      console.log("resend error", res.status, (await res.text()).slice(0, 300));
      return false;
    }
    return true;
  } catch (err) {
    console.log("resend exception", err instanceof Error ? err.message : String(err));
    return false;
  }
}

function usageText(request: Request, input: string, goal: string, v: Visitor): string {
  return [
    "🔎 <b>REPOFINDER SEARCH</b>",
    `🛠 <b>Project:</b> ${tgEsc(input)}`,
    `🎯 <b>Goal:</b> ${tgEsc(goal)}`,
    requestIntelHtml(request, v),
  ]
    .filter(Boolean)
    .join("\n");
}

function contactText(request: Request, name: string, email: string, message: string, v: Visitor): string {
  return [
    "✉️ <b>NEW REPOFINDER CONTACT</b>",
    `👤 <b>From:</b> ${tgEsc(name)} (${tgEsc(email)})`,
    "",
    tgEsc(message),
    requestIntelHtml(request, v),
  ].join("\n");
}

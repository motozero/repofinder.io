// Password-protected /admin dashboard: recent chats, repo clicks, searches, and
// contact messages, so the owner can see activity without relying on Telegram
// link. HTTP Basic auth against the ADMIN_PASSWORD secret.

import { htmlSecurityHeaders } from "./security";

export interface AdminEnv {
  DB: D1Database;
  ADMIN_PASSWORD?: string;
}

export async function handleAdmin(request: Request, env: AdminEnv): Promise<Response> {
  if (!env.ADMIN_PASSWORD) {
    return new Response("Admin is not configured. Set ADMIN_PASSWORD with `wrangler secret put`.", {
      status: 503,
      headers: { "content-type": "text/plain" },
    });
  }
  if (!(await authorized(request, env.ADMIN_PASSWORD))) {
    return new Response("Authentication required.", {
      status: 401,
      headers: { "WWW-Authenticate": 'Basic realm="repofinder admin", charset="UTF-8"' },
    });
  }

  const [visits, chats, clicks, searches, contacts] = await Promise.all([
    query(
      env,
      "SELECT created_at, path, method, request_context FROM request_log WHERE event_type='page_view' ORDER BY id DESC LIMIT 50",
    ),
    query(
      env,
      "SELECT s.id, s.created_at, s.repo, s.visitor_id, s.city, s.country, s.browser, (SELECT COUNT(*) FROM chat_messages m WHERE m.session_id = s.id) AS msgs FROM chat_sessions s ORDER BY s.rowid DESC LIMIT 50",
    ),
    query(env, "SELECT created_at, repo, visitor_id, city, country, browser FROM events WHERE type='repo_click' ORDER BY rowid DESC LIMIT 50"),
    query(env, "SELECT created_at, input, goal, city, country, browser FROM usage ORDER BY rowid DESC LIMIT 50"),
    query(env, "SELECT created_at, name, email, city, country, message FROM messages ORDER BY rowid DESC LIMIT 30"),
  ]);

  return new Response(adminHtml({ visits, chats, clicks, searches, contacts }), {
    headers: htmlSecurityHeaders(),
  });
}

async function authorized(request: Request, password: string): Promise<boolean> {
  const header = request.headers.get("Authorization") || "";
  const m = header.match(/^Basic (.+)$/);
  if (!m) return false;
  let decoded = "";
  try {
    decoded = atob(m[1]!);
  } catch {
    return false;
  }
  const given = decoded.slice(decoded.indexOf(":") + 1); // ignore the username
  const encoder = new TextEncoder();
  const [givenDigest, expectedDigest] = await Promise.all([
    crypto.subtle.digest("SHA-256", encoder.encode(given)),
    crypto.subtle.digest("SHA-256", encoder.encode(password)),
  ]);
  const givenBytes = new Uint8Array(givenDigest);
  const expectedBytes = new Uint8Array(expectedDigest);
  let diff = 0;
  for (let i = 0; i < givenBytes.length; i++) diff |= givenBytes[i]! ^ expectedBytes[i]!;
  return diff === 0;
}

async function query(env: AdminEnv, sql: string): Promise<Record<string, unknown>[]> {
  try {
    const r = await env.DB.prepare(sql).all();
    return (r.results as Record<string, unknown>[]) || [];
  } catch (err) {
    console.log("admin query error", err instanceof Error ? err.message : String(err));
    return [];
  }
}

const esc = (s: unknown): string =>
  String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c] as string);

const when = (iso: unknown): string => String(iso ?? "").slice(0, 16).replace("T", " ");
const vshort = (v: unknown): string => String(v ?? "").slice(0, 8);
const place = (row: Record<string, unknown>): string => [row.city, row.country].filter(Boolean).map(esc).join(", ") || "?";

interface AdminData {
  visits: Record<string, unknown>[];
  chats: Record<string, unknown>[];
  clicks: Record<string, unknown>[];
  searches: Record<string, unknown>[];
  contacts: Record<string, unknown>[];
}

function adminHtml(d: AdminData): string {
  const visitRows = d.visits
    .map((row) => {
      const context = parseRequestContext(row.request_context);
      return `<tr><td>${esc(when(row.created_at))}</td><td>${esc(row.method)} ${esc(row.path)}</td><td>${esc(context.ip || "?")}</td><td>${esc([context.city, context.region, context.country].filter(Boolean).join(", ") || "?")}</td><td>${esc(context.colo || "?")}</td><td>${esc([context.browser, context.browserVersion].filter(Boolean).join(" ") || "?")}</td><td>${esc(context.device || "?")}</td><td>${esc(context.referrer || "Direct")}</td></tr>`;
    })
    .join("");
  const chatRows = d.chats
    .map(
      (r) =>
        `<tr><td>${esc(when(r.created_at))}</td><td><a href="https://github.com/${esc(r.repo)}" target="_blank" rel="noopener">${esc(r.repo)}</a></td><td>${esc(r.msgs)}</td><td>${esc(vshort(r.visitor_id))}</td><td>${place(r)}</td><td>${esc(r.browser)}</td><td><a href="/c/${esc(r.id)}" target="_blank" rel="noopener">view</a></td></tr>`,
    )
    .join("");
  const clickRows = d.clicks
    .map(
      (r) =>
        `<tr><td>${esc(when(r.created_at))}</td><td><a href="https://github.com/${esc(r.repo)}" target="_blank" rel="noopener">${esc(r.repo)}</a></td><td>${esc(vshort(r.visitor_id))}</td><td>${place(r)}</td><td>${esc(r.browser)}</td></tr>`,
    )
    .join("");
  const searchRows = d.searches
    .map((r) => `<tr><td>${esc(when(r.created_at))}</td><td>${esc(r.input)}</td><td>${esc(r.goal)}</td><td>${place(r)}</td><td>${esc(r.browser)}</td></tr>`)
    .join("");
  const contactRows = d.contacts
    .map(
      (r) =>
        `<tr><td>${esc(when(r.created_at))}</td><td>${esc(r.name)}</td><td>${esc(r.email)}</td><td>${place(r)}</td><td>${esc(String(r.message ?? "").slice(0, 140))}</td></tr>`,
    )
    .join("");

  const section = (title: string, headers: string[], rows: string, empty: string) =>
    `<h2>${esc(title)}</h2>${rows ? `<table><thead><tr>${headers.map((x) => `<th>${esc(x)}</th>`).join("")}</tr></thead><tbody>${rows}</tbody></table>` : `<p class="empty">${esc(empty)}</p>`}`;

  return `<!doctype html><html lang="en"><head><meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/><meta name="robots" content="noindex"/>
<title>RepoFinder admin</title>
<style>
:root{--bg:#0b0f10;--panel:#131a1c;--ink:#e8f0ee;--muted:#8aa0a0;--green:#21c08b;--line:#223033}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--ink);font:14px/1.5 ui-sans-serif,system-ui,-apple-system,"Segoe UI",Roboto,sans-serif}
.wrap{width:min(1100px,94vw);margin:0 auto;padding:28px 0 64px}
h1{font-size:20px;margin:0 0 4px}.sub{color:var(--muted);margin:0 0 24px;font-size:13px}
h2{font-size:15px;margin:30px 0 10px}
table{width:100%;border-collapse:collapse;font-size:13px}
th{text-align:left;color:var(--muted);font-weight:600;padding:7px 10px;border-bottom:1px solid var(--line)}
td{padding:7px 10px;border-bottom:1px solid var(--line);vertical-align:top}
tr:hover td{background:var(--panel)}
a{color:var(--green);text-decoration:none}a:hover{text-decoration:underline}
.empty{color:var(--muted)}
.counts{display:flex;gap:18px;flex-wrap:wrap;color:var(--muted);font-size:13px}
.counts b{color:var(--ink)}
</style></head><body><div class="wrap">
<h1>RepoFinder admin</h1>
<p class="sub">Allowlisted operational activity. Request records omit cookies, authorization headers, query strings, and request bodies.</p>
<div class="counts"><span><b>${d.visits.length}</b> visits</span><span><b>${d.chats.length}</b> chats</span><span><b>${d.clicks.length}</b> repo clicks</span><span><b>${d.searches.length}</b> searches</span><span><b>${d.contacts.length}</b> messages</span></div>
${section("Page visits", ["When", "Page", "IP", "Where", "Colo", "Browser", "Device", "Referrer"], visitRows, "No visits yet.")}
${section("Chats", ["When", "Repo", "Msgs", "Visitor", "Where", "Browser", ""], chatRows, "No chats yet.")}
${section("Repo clicks", ["When", "Repo", "Visitor", "Where", "Browser"], clickRows, "No clicks yet.")}
${section("Searches", ["When", "Project", "Goal", "Where", "Browser"], searchRows, "No searches yet.")}
${section("Contact messages", ["When", "Name", "Email", "Where", "Message"], contactRows, "No messages yet.")}
</div></body></html>`;
}

function parseRequestContext(value: unknown): Record<string, unknown> {
  if (typeof value !== "string") return {};
  try {
    const parsed = JSON.parse(value);
    return parsed && typeof parsed === "object" ? (parsed as Record<string, unknown>) : {};
  } catch {
    return {};
  }
}

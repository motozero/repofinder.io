// Visitor signals, durable request telemetry, and Telegram notifications.
// The request snapshot is an explicit allowlist. Cookies, authorization
// headers, and request bodies are never copied into telemetry.

export interface Visitor {
  ip: string;
  ua: string;
  browser: string;
  browserVersion: string;
  os: string;
  device: string;
  asn: number | null;
  asOrg: string;
  country: string;
  city: string;
  region: string;
  timezone: string;
  colo: string;
  latitude: string;
  longitude: string;
  postalCode: string;
  httpProtocol: string;
  tlsVersion: string;
  tlsCipher: string;
  clientTcpRtt: number | null;
  botScore: number | null;
}

export interface RequestSnapshot {
  url: string;
  path: string;
  method: string;
  referrer: string;
  cfRay: string;
  acceptLanguage: string;
  ip: string;
  userAgent: string;
  browser: string;
  browserVersion: string;
  os: string;
  device: string;
  asn: number | null;
  asOrganization: string;
  country: string;
  city: string;
  region: string;
  timezone: string;
  colo: string;
  latitude: string;
  longitude: string;
  postalCode: string;
  httpProtocol: string;
  tlsVersion: string;
  tlsCipher: string;
  clientTcpRtt: number | null;
  botScore: number | null;
}

export interface RequestLogExtra {
  visitorId?: string;
  repo?: string;
  sessionId?: string;
}

interface RequestLogEnv {
  DB?: D1Database;
}

interface NotifyEnv {
  TELEGRAM_BOT_TOKEN?: string;
  TELEGRAM_CHAT_ID?: string;
}

const clip = (value: string, max: number): string => value.slice(0, max);

function cfRecord(request: Request): Record<string, unknown> {
  return (request.cf ?? {}) as Record<string, unknown>;
}

function cfString(cf: Record<string, unknown>, key: string): string {
  return typeof cf[key] === "string" ? String(cf[key]) : "";
}

function cfNumber(cf: Record<string, unknown>, key: string): number | null {
  return typeof cf[key] === "number" && Number.isFinite(cf[key]) ? Number(cf[key]) : null;
}

function botScore(cf: Record<string, unknown>): number | null {
  const bot = cf.botManagement;
  if (!bot || typeof bot !== "object") return null;
  const score = (bot as Record<string, unknown>).score;
  return typeof score === "number" && Number.isFinite(score) ? score : null;
}

function referrerPath(request: Request): string {
  const raw = request.headers.get("referer") ?? "";
  if (!raw) return "";
  try {
    const url = new URL(raw);
    if (url.protocol !== "https:" && url.protocol !== "http:") return "";
    return clip(`${url.origin}${url.pathname}`, 1000);
  } catch {
    return "";
  }
}

// Cloudflare attaches request metadata on request.cf. The user agent fills in
// the browser, browser version, operating system, and device class.
export function visitor(request: Request): Visitor {
  const cf = cfRecord(request);
  const ua = request.headers.get("user-agent") ?? "";
  const parsed = parseUA(ua);
  return {
    ip: request.headers.get("cf-connecting-ip") ?? "",
    ua,
    browser: parsed.browser,
    browserVersion: parsed.browserVersion,
    os: parsed.os,
    device: parsed.device,
    asn: cfNumber(cf, "asn"),
    asOrg: cfString(cf, "asOrganization"),
    country: cfString(cf, "country"),
    city: cfString(cf, "city"),
    region: cfString(cf, "region"),
    timezone: cfString(cf, "timezone"),
    colo: cfString(cf, "colo"),
    latitude: cfString(cf, "latitude"),
    longitude: cfString(cf, "longitude"),
    postalCode: cfString(cf, "postalCode"),
    httpProtocol: cfString(cf, "httpProtocol"),
    tlsVersion: cfString(cf, "tlsVersion"),
    tlsCipher: cfString(cf, "tlsCipher"),
    clientTcpRtt: cfNumber(cf, "clientTcpRtt"),
    botScore: botScore(cf),
  };
}

export function parseUA(ua: string): { browser: string; browserVersion: string; os: string; device: string } {
  const browserMatch =
    ua.match(/Edg\/([\d.]+)/) ??
    ua.match(/OPR\/([\d.]+)/) ??
    ua.match(/Chrome\/([\d.]+)/) ??
    ua.match(/Firefox\/([\d.]+)/) ??
    ua.match(/Version\/([\d.]+).*Safari\//);
  const browser = /Edg\//.test(ua)
    ? "Edge"
    : /OPR\/|Opera/.test(ua)
      ? "Opera"
      : /Chrome\//.test(ua)
        ? "Chrome"
        : /Firefox\//.test(ua)
          ? "Firefox"
          : /Safari\//.test(ua)
            ? "Safari"
            : "Unknown";
  const os = /Windows/.test(ua)
    ? "Windows"
    : /Android/.test(ua)
      ? "Android"
      : /iPhone|iPad|iOS/.test(ua)
        ? "iOS"
        : /Mac OS X|Macintosh/.test(ua)
          ? "macOS"
          : /Linux/.test(ua)
            ? "Linux"
            : "Unknown";
  const device = /iPad|Tablet/.test(ua) ? "Tablet" : /Mobile|iPhone|Android/.test(ua) ? "Mobile" : "Desktop";
  return { browser, browserVersion: browserMatch?.[1] ?? "", os, device };
}

export function requestSnapshot(request: Request, v = visitor(request)): RequestSnapshot {
  const url = new URL(request.url);
  return {
    url: `${url.origin}${url.pathname}`,
    path: url.pathname,
    method: request.method,
    referrer: referrerPath(request),
    cfRay: clip(request.headers.get("cf-ray") ?? "", 100),
    acceptLanguage: clip(request.headers.get("accept-language") ?? "", 200),
    ip: v.ip,
    userAgent: clip(v.ua, 1000),
    browser: v.browser,
    browserVersion: v.browserVersion,
    os: v.os,
    device: v.device,
    asn: v.asn,
    asOrganization: v.asOrg,
    country: v.country,
    city: v.city,
    region: v.region,
    timezone: v.timezone,
    colo: v.colo,
    latitude: v.latitude,
    longitude: v.longitude,
    postalCode: v.postalCode,
    httpProtocol: v.httpProtocol,
    tlsVersion: v.tlsVersion,
    tlsCipher: v.tlsCipher,
    clientTcpRtt: v.clientTcpRtt,
    botScore: v.botScore,
  };
}

export function isDocumentVisit(request: Request, url = new URL(request.url)): boolean {
  if (request.method !== "GET") return false;
  if (url.pathname.startsWith("/api/") || url.pathname === "/mcp" || url.pathname.startsWith("/sse")) return false;
  const destination = request.headers.get("sec-fetch-dest") ?? "";
  const accept = request.headers.get("accept") ?? "";
  return destination === "document" || accept.includes("text/html");
}

export async function logRequest(
  env: RequestLogEnv,
  eventType: string,
  request: Request,
  v = visitor(request),
  extra: RequestLogExtra = {},
): Promise<void> {
  if (!env.DB) return;
  const snapshot = requestSnapshot(request, v);
  try {
    await env.DB.prepare(
      "INSERT INTO request_log (created_at, event_type, path, method, visitor_id, repo, session_id, request_context) VALUES (?,?,?,?,?,?,?,?)",
    )
      .bind(
        new Date().toISOString(),
        clip(eventType, 80),
        snapshot.path,
        snapshot.method,
        clip(extra.visitorId ?? "", 64),
        clip(extra.repo ?? "", 200),
        clip(extra.sessionId ?? "", 128),
        JSON.stringify(snapshot),
      )
      .run();
  } catch (error) {
    console.error(JSON.stringify({ event: "d1_request_log_error", message: error instanceof Error ? error.message : String(error) }));
  }
}

export const tgEsc = (s: string): string =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

export function locationLine(v: Visitor): string {
  const geo = [v.city, v.region, v.country].filter(Boolean).join(", ") || "unknown location";
  return v.timezone ? `${geo} (${v.timezone})` : geo;
}

export function networkLine(v: Visitor): string {
  if (v.asn) return `AS${v.asn}${v.asOrg ? " " + v.asOrg : ""}`;
  return v.asOrg || "unknown network";
}

export function requestIntelHtml(request: Request, v: Visitor): string {
  const snapshot = requestSnapshot(request, v);
  const browser = `${v.browser}${v.browserVersion ? " " + v.browserVersion : ""}`;
  const tls = [v.tlsVersion, v.tlsCipher].filter(Boolean).join(" · ");
  const coords = [v.latitude, v.longitude].filter(Boolean).join(", ");
  return [
    "━━━━━━━━━━",
    "🌍 <b>Visitor intel</b>",
    `📍 <b>IP:</b> ${tgEsc(v.ip || "unavailable")}`,
    `🗺 <b>Location:</b> ${tgEsc([v.city, v.region, v.country].filter(Boolean).join(", ") || "unknown")}`,
    v.postalCode ? `📮 <b>Postal code:</b> ${tgEsc(v.postalCode)}` : "",
    coords ? `🧭 <b>Coordinates:</b> ${tgEsc(coords)}` : "",
    `🌐 <b>Colo:</b> ${tgEsc(v.colo || "unknown")}`,
    `🏢 <b>ISP:</b> ${tgEsc(networkLine(v))}`,
    `⏰ <b>Timezone:</b> ${tgEsc(v.timezone || "unknown")}`,
    `💻 <b>Device:</b> ${tgEsc(v.device)}`,
    `🖥 <b>Browser:</b> ${tgEsc(browser)}`,
    `💿 <b>OS:</b> ${tgEsc(v.os)}`,
    `🤖 <b>Bot score:</b> ${v.botScore ?? "not available"}`,
    snapshot.referrer ? `🔗 <b>Referrer:</b> ${tgEsc(snapshot.referrer)}` : "🔗 <b>Referrer:</b> Direct",
    snapshot.acceptLanguage ? `🗣 <b>Language:</b> ${tgEsc(snapshot.acceptLanguage)}` : "",
    v.httpProtocol ? `📡 <b>Protocol:</b> ${tgEsc(v.httpProtocol)}` : "",
    tls ? `🔒 <b>TLS:</b> ${tgEsc(tls)}` : "",
    v.clientTcpRtt !== null ? `⏱ <b>Client RTT:</b> ${v.clientTcpRtt} ms` : "",
    snapshot.cfRay ? `🧾 <b>Ray ID:</b> ${tgEsc(snapshot.cfRay)}` : "",
  ]
    .filter(Boolean)
    .join("\n");
}

export function pageVisitText(request: Request, v: Visitor): string {
  const snapshot = requestSnapshot(request, v);
  return [
    "👀 <b>NEW REPOFINDER VISIT</b>",
    `🔗 <b>Page:</b> ${tgEsc(snapshot.url)}`,
    `📨 <b>Request:</b> ${tgEsc(snapshot.method)} ${tgEsc(snapshot.path)}`,
    requestIntelHtml(request, v),
  ].join("\n");
}

async function sendTelegram(env: NotifyEnv, text: string, parseMode?: "HTML"): Promise<void> {
  if (!env.TELEGRAM_BOT_TOKEN || !env.TELEGRAM_CHAT_ID) return;
  try {
    const response = await fetch(`https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        chat_id: env.TELEGRAM_CHAT_ID,
        text,
        ...(parseMode ? { parse_mode: parseMode } : {}),
        disable_web_page_preview: true,
      }),
    });
    if (!response.ok) {
      console.error(JSON.stringify({ event: "telegram_error", status: response.status, message: (await response.text()).slice(0, 300) }));
    }
  } catch (error) {
    console.error(JSON.stringify({ event: "telegram_exception", message: error instanceof Error ? error.message : String(error) }));
  }
}

export async function notify(env: NotifyEnv, text: string): Promise<void> {
  await sendTelegram(env, text, "HTML");
}

export function splitTelegramText(text: string, max = 3500): string[] {
  const chunks: string[] = [];
  let remaining = text.trim();
  while (remaining.length > max) {
    let cut = remaining.lastIndexOf("\n", max);
    if (cut < max * 0.6) cut = remaining.lastIndexOf(" ", max);
    if (cut < max * 0.6) cut = max;
    if (/^[\uDC00-\uDFFF]$/.test(remaining.charAt(cut))) cut -= 1;
    chunks.push(remaining.slice(0, cut).trim());
    remaining = remaining.slice(cut).trim();
  }
  if (remaining) chunks.push(remaining);
  return chunks;
}

export async function notifyPlain(env: NotifyEnv, text: string): Promise<void> {
  for (const chunk of splitTelegramText(text)) {
    await sendTelegram(env, chunk);
  }
}

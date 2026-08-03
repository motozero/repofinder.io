const encoder = new TextEncoder();

export interface RateLimitBinding {
  limit(options: { key: string }): Promise<{ success: boolean }>;
}

export async function anonymousActorKey(request: Request, scope: string): Promise<string> {
  const ip = request.headers.get("cf-connecting-ip") ?? "unknown";
  const userAgent = request.headers.get("user-agent") ?? "unknown";
  const digest = await crypto.subtle.digest("SHA-256", encoder.encode(`${scope}\n${ip}\n${userAgent}`));
  return Array.from(new Uint8Array(digest).slice(0, 12), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

export async function enforceRateLimit(
  limiter: RateLimitBinding | undefined,
  request: Request,
  scope: string,
): Promise<Response | null> {
  if (!limiter) return null;
  const key = await anonymousActorKey(request, scope);
  const { success } = await limiter.limit({ key });
  if (success) return null;
  return Response.json(
    { error: "Too many requests. Wait a minute and try again." },
    { status: 429, headers: { "retry-after": "60" } },
  );
}

export function htmlSecurityHeaders(): HeadersInit {
  return {
    "content-type": "text/html; charset=utf-8",
    "x-content-type-options": "nosniff",
    "referrer-policy": "no-referrer",
    "permissions-policy": "camera=(), microphone=(), geolocation=()",
    "content-security-policy":
      "default-src 'self'; script-src 'none'; style-src 'unsafe-inline'; img-src 'self' data:; frame-ancestors 'none'; base-uri 'none'; form-action 'none'",
  };
}

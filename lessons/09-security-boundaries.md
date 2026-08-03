# Lesson 9: protect a tool that fetches URLs

Accepting a website URL creates a server-side request forgery risk. An attacker may try to reach loopback, private networks, metadata services, or a private target through a redirect.

RepoFinder reduces that risk by:

- Accepting only HTTP and HTTPS.
- Rejecting local names, private IPv4 ranges, and IP-literal IPv6 targets.
- Revalidating every redirect and limiting redirect count.
- Requiring an HTML response and bounding the extracted text.
- Stripping credentials and fragments before fetching.

Public hostname validation cannot prevent every DNS rebinding scenario. The safest production extension is an outbound fetch service that resolves and enforces destination IP policy at connection time.

The API also bounds repository URLs, goals, contact fields, chat messages, session identifiers, and MCP parameters.

## Bound telemetry too

Operational telemetry can become a second input surface. RepoFinder builds its request records from an explicit allowlist instead of serializing the full request object. The allowlist can contain the page path, IP address, user agent, referrer, Cloudflare location and network fields, and connection metadata. It deliberately excludes cookies, authorization headers, query strings, and request bodies.

The product discloses this collection before a visitor starts a repo chat. Full chat turns are stored in D1, and completed analysis alerts can be sent to the owner through Telegram. Page visits, contact messages, repository clicks, failed analyses, and chats do not trigger alerts. The interface tells visitors not to enter secrets. The Worker stores Telegram credentials as isolated secrets and never includes them in telemetry or logs.

## Try it

Run the unit tests for `127.0.0.1`, private network ranges, and a public hostname. Then review any new outbound fetch path before deployment.

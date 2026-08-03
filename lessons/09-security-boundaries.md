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

## Try it

Run the unit tests for `127.0.0.1`, private network ranges, and a public hostname. Then review any new outbound fetch path before deployment.

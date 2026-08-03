# Lesson 13: separate the chat experience from operator telemetry

The visitor and the operator need different views of the same interaction.

The visitor needs a calm chat surface. RepoFinder renders a deliberately small Markdown subset: paragraphs, compact lists, bold text, code, and HTTP or HTTPS links. Every link opens in a new tab with `noopener noreferrer`. Model text is escaped before formatting, so an answer cannot inject arbitrary HTML or JavaScript.

Repository README text and visitor project fields stay out of the model’s system instructions. The Worker JSON-encodes them in a user-role context object and tells the model to treat that object as untrusted data. A poisoned README can still contain bad advice, but it does not receive system-level authority.

The operator needs enough context to understand real use. Each chat turn is written to `chat_messages` in D1. A Telegram notification contains the project, goal, transcript link, recent conversation, and an explicit allowlist of Cloudflare request fields. Long conversations are split into Telegram-safe chunks. D1 remains the complete record.

The important design choice is that the Worker never serializes the whole request. `requestSnapshot` selects only these categories:

- Page path and method
- Referrer origin and path
- IP address and user agent
- Browser, version, operating system, and device class
- Cloudflare location, network, data center, and connection fields

Cookies, authorization headers, URL query strings, and request bodies do not enter the request log. A regression test sends secrets through every excluded channel and asserts that none reaches D1.

```mermaid
flowchart LR
  V["Visitor asks a repo question"] --> W["Worker validates and stores user turn"]
  W --> O["OpenAI Responses API"]
  O --> A["Question-ending assistant reply"]
  A --> D["Store assistant turn in D1"]
  D --> U["Simple safe links in the browser"]
  D --> T["Detailed private Telegram notification"]
```

## Interview explanation

“I treated chat rendering and operator observability as separate products. The browser gets the minimum useful formatting. D1 gets the durable transcript. Telegram gets an operator card built from an explicit request allowlist. That gave me useful feedback without making the customer-facing chat noisy or copying secret-bearing request fields.”

## Try it

Run `npm test` and inspect `tests/chat.test.ts` and `tests/telemetry.test.ts`. Then send a chat answer containing a Markdown link and an HTML tag. The link should open in a new tab. The tag should display as text, never execute.

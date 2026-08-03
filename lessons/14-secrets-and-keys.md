# Lesson 14: rotate exposed secrets and keep deployment credentials isolated

A secret in a screenshot is an exposed secret. It does not matter whether the screenshot was committed to Git, sent privately, or visible for only a minute. The safe sequence is revoke, rotate, store, and verify.

RepoFinder uses Cloudflare Worker secrets for OpenAI, GitHub, Telegram, contact delivery, and admin access. Values never appear in `wrangler.jsonc`, source code, migration files, or browser JavaScript. `.dev.vars` is ignored for local work. `.dev.vars.example` contains names and instructions, not credentials.

The Telegram setup demonstrates a safe handoff:

1. Create the bot with BotFather.
2. If its token appears in a screenshot, revoke it immediately.
3. Copy the complete replacement token to the local clipboard.
4. Validate its shape without printing the value.
5. Pipe it directly into `wrangler secret put TELEGRAM_BOT_TOKEN`.
6. Send `/start` to the bot, read the resulting chat ID through the Bot API, and store that ID with `wrangler secret put TELEGRAM_CHAT_ID`.
7. Send a one-time confirmation message.

Secrets are also isolated by service ownership. Every command runs against Worker `repofinder-io`. The Worker uses D1 database `repofinder-io` and domain `repofinder.io`. No RepoRecommender resource is reused.

## Interview explanation

“When a bot token appeared in a screenshot, I treated it as compromised. I rotated it before deployment, passed the replacement from the local clipboard straight into Cloudflare, and verified delivery. The broader point is that operational discipline is part of the demo. A great customer experience can still fail an evaluation if its secret handling is casual.”

## Try it

Run `npx wrangler secret list`. Confirm the required names exist without retrieving any values. Then inspect `wrangler.jsonc` and verify that every resource name belongs to RepoFinder.

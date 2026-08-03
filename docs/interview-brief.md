# Interview brief

## The story in one sentence

I took a hackathon insight, rebuilt it with Codex as an OpenAI-native tool, and focused on the work that turns a prototype into a dependable, reusable customer demo.

## Decisions worth discussing

- I chose one shared engine so the web experience and agent tool cannot drift.
- I use structured outputs because parsing recovery is not a production contract.
- I route extraction and reasoning separately so cost and quality choices stay legible.
- I ground objective claims in GitHub data and reserve model reasoning for fit.
- I designed and labeled a fallback because demo reliability matters as much as the happy path.
- I checked in a skill because repeatable developer workflow is more valuable than a one-off prompt.
- I isolated every Cloudflare resource to make ownership and rollback obvious.

## Good questions for the hiring manager

- Where does the team draw the line between a customer-specific demo and a reusable accelerator?
- Which failure mode most often separates an impressive prototype from a field-ready demo?
- How are demo quality, reuse, and customer impact measured after delivery?
- What does excellent partnership between Demo Experience, Solutions, Product, and Research look like?

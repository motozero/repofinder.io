# Lesson 11: keep Cloudflare resources isolated

Siloing is an operational feature. It narrows blast radius, makes costs attributable, clarifies rollback, and prevents a demo from changing another product.

RepoFinder owns:

- Worker service `repofinder-io`
- D1 database `repofinder-io`
- Custom domain `repofinder.io`
- Repository `motozero/repofinder.io`
- Service-specific Wrangler secrets

`wrangler.jsonc` is the reviewable source of truth for bindings and routes. Database schema changes are applied explicitly to the named D1 target. Secrets never enter the file or repository.

## Try it

Before a deploy, inspect `wrangler.jsonc` and the Wrangler target output. Stop if any name, database identifier, or route belongs to RepoRecommender.

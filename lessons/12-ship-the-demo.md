# Lesson 12: ship and tell the demo story

A demo is ready when the happy path, failure path, source, and narrative agree.

RepoFinder’s ship gate is:

1. Typecheck application, tests, and eval code.
2. Run deterministic tests.
3. Exercise desktop and mobile flows in a real browser.
4. Verify security headers, input failures, and labeled fallback behavior.
5. Apply the D1 schema to the isolated database.
6. Push the exact commit, deploy it, and run a production canary.

The five minute story follows the same structure: user problem, live result, reusable architecture, reliability, and production discipline. Every claim should point to visible behavior or public source.

The repository includes `docs/demo-script.md` and `docs/interview-brief.md` so the build remains useful under interview pressure.

## Try it

Give the demo once with the OpenAI path and once with the fallback path. If the second version feels like an apology, improve the product or the explanation before presenting it.

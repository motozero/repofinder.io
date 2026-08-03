# Lesson 7: route models and design fallbacks

Not every step deserves the same latency and reasoning budget.

RepoFinder uses `gpt-5.6-luna` to extract purpose, stack, and search queries. It uses `gpt-5.6-terra` to compare candidates and write project-specific guidance. The model names live in one routing table so the cost story stays legible.

Reliability is a separate design problem. If the OpenAI key is missing or a provider call fails, RepoFinder ranks live GitHub candidates deterministically. The API returns `mode: "github-fallback"`, and the interface labels it.

The fallback is less personalized, but it preserves the core task. Visibility matters: graceful degradation must not masquerade as successful model reasoning.

## Try it

Run locally without `OPENAI_API_KEY`. Confirm that a search succeeds, displays “GitHub fallback,” and hides the OpenAI chat action.

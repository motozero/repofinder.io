# Lesson 5: use the Responses API

RepoFinder keeps all provider-specific code in `src/openai.ts`. The adapter sends requests to the OpenAI Responses API with explicit model, instructions, input, reasoning effort, output limit, verbosity, and storage choice.

The engine does not construct HTTP headers or parse provider response envelopes. It passes product intent into one small adapter. This makes an API migration or model change local instead of repository-wide.

`store: false` is an explicit data choice for source excerpts and user goals. Output tokens are bounded for cost and latency. Reasoning effort is selected per task instead of left implicit.

## Try it

Read `callOpenAI` and list every product decision visible in the request body. Then find any model call outside `src/openai.ts`. There should be none.

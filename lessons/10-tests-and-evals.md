# Lesson 10: separate tests from evals

Deterministic tests and model evals answer different questions.

Unit tests cover exact behavior: repository parsing, ecosystem grouping, non-tool filtering, URL classification, SSRF blocks, HTML extraction, schema parsing, and rating bounds. A failure means the code contract broke.

The eval dataset covers judgment: did relevant concepts surface, were bad picks avoided, did reasoning fit the project, and did the output obey house style? The runner supports cached results, multiple trials, an LLM judge, and CI thresholds.

Do not turn a variable model answer into a brittle equality assertion. Score the dimension that matters with a rubric and reference set.

## Try it

Run `npm test`, then run the eval without the judge. Inspect which checks are deterministic and which require a live OpenAI key.

---
name: repo-analysis
description: Analyze a public GitHub repository before choosing complementary open source tools. Use when the user asks what a repository does, what stack it uses, or whether it is active enough to build on.
---

# Repository analysis

Produce a compact, evidence-backed source profile.

## Workflow

1. Parse the repository owner and name from the URL or `owner/repo` shorthand.
2. Read the repository description, topics, primary language, license, archive status, latest push, and star count.
3. Read the README, prioritizing purpose, installation, runtime requirements, extension points, and limitations.
4. Summarize the purpose in two sentences or fewer.
5. List the important stack and maturity signals.
6. Separate observed facts from inference. Link the repository when presenting the result.

## Output

Return:

- Purpose
- Stack
- Extension points
- Maturity signals
- Unknowns worth checking

Stars and recency are signals, not verdicts. Do not infer security, license compatibility, or production readiness from popularity.

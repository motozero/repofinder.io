# Lesson 6: make model output a contract

Prompting a model to “return JSON” is a preference. A strict JSON Schema is a contract.

RepoFinder defines separate schemas for source analysis, recommendations, and eval judge scores. Each schema:

- Declares every property and required field.
- Rejects extra properties.
- Bounds arrays and numeric ratings.
- Travels through `text.format` in the Responses API request.

The parser is intentionally boring: `JSON.parse`. There is no fence stripping or search for a JSON substring because structured outputs remove the need for recovery heuristics.

Typed code still validates model references against the real candidate map. A syntactically valid repository name is not accepted unless GitHub supplied it.

## Try it

Add a required field to the recommendation schema and TypeScript type. Follow the compiler errors until the card and eval contract agree.

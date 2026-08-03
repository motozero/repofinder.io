# Lesson 4: turn workflow knowledge into skills

A tool provides a capability. A skill provides repeatable judgment about when and how to use it.

RepoFinder includes two project skills under `.agents/skills`:

- `repo-analysis` gathers an evidence-backed source profile.
- `find-complementary-repos` calls the remote MCP tool, presents candidates, and stops before dependency changes.

Each skill has YAML frontmatter with a name and trigger description, followed by a concise workflow and guardrails. The trigger matters because Codex must know when the skill applies before it can follow the steps.

Skills should encode routines that are likely to recur. They should not hide important product logic or credentials. The recommendation algorithm remains normal TypeScript that both surfaces can test.

## Try it

Ask Codex to find an auth library for `honojs/hono`. Check that it uses the skill, calls RepoFinder when available, labels the result mode, and asks before installing anything.

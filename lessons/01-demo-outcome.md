# Lesson 1: define the demo outcome

A strong technical demo begins with a decision the audience needs to make. RepoFinder is not “AI search for GitHub.” Its outcome is narrower: give a developer a decision-ready shortlist of open source tools that fit an existing project.

That framing produces a useful contract:

- Input: a repository or public website and one capability goal.
- Output: three to five complementary projects.
- Evidence: purpose, stack fit, maintenance, momentum, and adoption signals.
- Action: a small integration path the developer can prove quickly.

The contract also defines what to reject. Tutorials, lists, archived projects, and substitutes are not successful results even if they match keywords.

## In this repository

The contract appears in the `RecommendResult` type, the MCP tool description, the result cards, and the eval scorers. Repeating it at each boundary makes drift visible.

## Try it

Write the one decision your next demo should help someone make. If the sentence starts with a technology instead of a user, rewrite it.

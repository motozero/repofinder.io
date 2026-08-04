# RepoFinder product demo storyboard

## Story shape

The demo follows a “last thing first” structure:

1. Show the changed decision.
2. State the problem with popularity alone.
3. Recreate the shortest path to the result.
4. Peel back one layer into deeper conversation.
5. Show the human and agent paths.
6. Close on the business value.

## Visual system

- Background: near black green, `#07100f`.
- Primary text: soft white, `#edf7f4`.
- Human path: mint, `#21d6a0`.
- Agent and MCP path: blue, `#56a9ff`.
- Evidence and GitHub signals: warm yellow, `#ffd84d`.
- Muted text: `#a6bbb6`.
- Panels: `#121f1d` with subtle mint or blue borders.
- Screenshots stay dark and receive a soft vignette so callouts remain dominant.
- Callouts use one short sentence, one arrow, and one visible target.

## Slide plan

### 1. The changed decision

- Full-bleed crop of `05-chat-refinement.png`.
- Left title: “Your first result is not your final decision.”
- Mint ring around “Not really.”
- Blue brackets around OpenAI Evals, Langfuse, and Braintrust.
- Yellow underline below the three-step practical stack.

### 2. Stars are a signal

- Large statement: “Popularity is a signal, not the decision.”
- Four yellow star counts recede into the background.
- Foreground chips: “My project,” “My goal,” “My constraints,” “My taste.”
- The chips converge into one mint decision card.

### 3. Start with context

- Screenshot: `01-start.png`.
- Mint arrow to the project field.
- Blue arrow to the goal field.
- Callout: “Name the thing you are building and the outcome you need.”

### 4. One action

- Same screenshot, slightly zoomed.
- Blue halo around “Try this combination.”
- One click marker.
- Callout: “The shortest path to value.”

### 5. Evidence-backed starting point

- Screenshot: `02-results.png`.
- Yellow highlight on “OpenAI ranked 4 candidates.”
- Mint brackets around the candidate cards.
- Callout: “Live signals plus reasoning for this task.”

### 6. Understand the fit

- Stylized recommendation card reconstructed from the live UI.
- Five labeled zones: What, Why, How, Ease, Impact.
- Bottom evidence strip: updated, commits, contributors, forks.
- Message: “Evidence stays visible beside the explanation.”

### 7. Go deeper

- Screenshot: `03-chat-open.png`.
- Mint arrow to the question field.
- Question bubble: “How would I test this in one afternoon?”
- Callout: “Turn a candidate into an experiment.”

### 8. Make it practical

- Screenshot: `04-chat-first-answer.png`.
- Three numbered markers over the suggested test plan.
- Blue bracket around “Fit and tradeoffs.”
- Callout: “A concrete next move, not another search result.”

### 9. Add your taste

- Darkened chat screenshot as background.
- Large user bubble containing the real lightweight TypeScript question.
- The words “lightweight,” “TypeScript,” and “directly” receive mint emphasis.

### 10. Watch the answer change

- Screenshot: `05-chat-refinement.png`.
- Reveal in three beats: honest mismatch, lighter alternatives, focused stack.
- Closing callout: “Your constraints changed the recommendation.”

### 11. One capability, two ways to work

- Left, mint: “Human” with a browser window and conversation loop.
- Right, blue: “Agent” with an MCP tool call and structured result card.
- Accurate distinction: dedicated follow-up chat is shown only on the browser side.
- Shared center: “RepoFinder recommendation capability.”

### 12. Move forward faster

- Product flow diagram:
  `Project + goal → Evidence-backed shortlist → Ask questions → Add constraints and taste → Refined recommendation → Focused next step`
- A loop returns from refined recommendation to “Ask questions.”
- Human and agent paths enter the same capability, then leave through their own interfaces.
- Close: “Where your taste matters more than the number of stars.”
- URL: `repofinder.io`.

## Interaction notes for `/slides-v2`

- Arrow keys, space, and on-screen controls navigate slides.
- Number keys jump directly to a scene.
- A progress line and scene counter remain unobtrusive.
- “Script” opens the timed narration in a side panel.
- “Live demo” opens RepoFinder in a new tab.
- Callouts animate once per slide, but respect reduced-motion preferences.

## Approval checklist

- Does the opening show the outcome quickly enough?
- Does the recommendation refinement feel honest and useful?
- Is the browser versus MCP distinction accurate?
- Is the narration in your voice?
- Are any screenshots too dense to understand in two seconds?
- Is the two-minute runtime right for the intended audience?

## Source notes

- Product screenshots captured from [RepoFinder](https://repofinder.io/).
- Demo structure follows the “last thing first,” “just do it,” and “peel back the layers” patterns described by [Great Demo](https://greatdemo.com/).

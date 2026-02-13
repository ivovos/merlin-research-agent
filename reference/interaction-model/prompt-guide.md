# Prompt Guide — How This Prototype Was Built

This document captures the approach and key prompts used to create the Electric Twin survey builder prototype (`survey-ux-mockup.html`). Use it as a playbook if you want to create a similar interactive prototype with an AI coding assistant.

---

## The Approach

The prototype was built iteratively in a single conversation with an AI assistant (Claude). It started with a detailed interaction model document and evolved through a series of conversational prompts — each one adding features, refining UX, or restructuring the flow based on stakeholder feedback.

**Key principle:** Start with a comprehensive written specification, then iterate rapidly with short, specific prompts. The AI builds on everything that came before, so each prompt can be brief.

---

## Phase 1: Foundation — Write the Interaction Model First

Before touching any code, the entire product was defined in a detailed interaction model document. This gave the AI all the context it needed to generate a coherent prototype.

**What to include in your interaction model:**

- Core objects and their relationships (survey types, questions, audiences, etc.)
- Complete taxonomy of question types with descriptions and examples
- User journey — step by step, with decision points
- Data model (even a rough ER diagram helps)
- Agent/AI behaviour at each stage
- Open questions and constraints

**Why this matters:** The AI can generate a much better prototype when it understands the full product, not just one screen. The interaction model becomes the shared context for every subsequent prompt.

---

## Phase 2: Generate the Initial Prototype

The first code-generating prompt was essentially: "Turn this interaction model into a single-file HTML prototype."

**Key constraints to specify upfront:**

- Single HTML file, no dependencies (CSS and JS inline)
- Visual style (monochrome, specific fonts, no decorative colour)
- Navigation pattern (builder with left sidebar, bottom action bar)
- Multiple view modes for stakeholder comparison (builder, wizard, single-page)
- Interactive states (selected, locked, done) for all cards and steps
- Simulated data (fake questions, audiences, results) so the prototype feels real

**Example prompt pattern:**
> Create an interactive HTML prototype for [product name]. Single file, no external dependencies. Use [design language]. The flow should be [step 1] → [step 2] → [step 3]. Include [navigation pattern] with [specific UI components]. Simulate [data/interactions] so stakeholders can click through the full experience.

---

## Phase 3: Iterate with Short, Specific Prompts

Once the foundation existed, each iteration was a short prompt targeting a specific change. The AI retains full context of the file, so you can be concise.

### Examples of effective iteration prompts:

**Renaming and relabelling:**
> "Let's call the last stage 'Preview' instead of 'Review & Launch'"

**Adding features:**
> "In the questions section, allow me to reorder questions from the list on the left"

**Layout changes:**
> "Let's make the input field for the prompt the same height as the upload brief section so they feel equal"

**Adding/removing items:**
> "Add Audience Exploration as a type of survey and remove CSAT/NPS"

**Visual refinements:**
> "Make the placeholder text much shorter. Also make the subtitles under headers more concise — they're very long, over 2 lines"

**Implementing design options:**
> "Let's implement the side-by-side layout with a stylised document icon for upload and a large image/video icon for stimulus"

### Incorporating stakeholder feedback:

The biggest restructure came from a user research session. The prompt was essentially a brain-dump of feedback notes:

> "Just had a session with a researcher. Notes: the questions step should still have upload from document; audience headers should adapt based on type selection; type should come first, then method when you get to questions; the AI 'upload brief make survey' path can live in agentic chat; stimulus step should appear dynamically for concept/message/creative testing. Can you review these thoughts and suggest what we might do?"

This led to a full flow restructure: moving Type to step 1, making the sidebar dynamic, adding a conditional Stimulus step, and moving method selection into the Questions step.

---

## Phase 4: Documentation

After the prototype stabilised, documentation was generated/updated by asking the AI to update all the markdown files based on the current state of the prototype. The AI reads the code and the existing docs, then rewrites them to match.

> "Update all the documentation — master-plan, user-journey, design-principles, implementation notes — based on the latest updates to the prototype"

---

## What Makes This Work Well

**1. Start comprehensive, iterate small.** The initial interaction model was detailed (400+ lines). But every subsequent prompt was 1–3 sentences. The AI maintains context across the entire conversation.

**2. Single-file architecture.** Keeping everything in one HTML file means the AI can read and modify the entire prototype in each turn. No cross-file coordination needed.

**3. Describe intent, not implementation.** "Allow me to reorder questions" is better than "Add HTML5 drag-and-drop event handlers to the question list items." Let the AI choose the implementation.

**4. Use screenshots for bug reports.** When something looked wrong, sharing a screenshot was faster than describing the issue. "The template section is showing when it shouldn't — see screenshot" gets fixed in one turn.

**5. Batch related changes.** "Rename the last stage to Preview AND add drag-to-reorder for questions" is more efficient than two separate prompts when the changes don't conflict.

**6. Feed back real user feedback verbatim.** Don't pre-process researcher notes into formal requirements. The raw notes give the AI context about the user's mental model and priorities.

---

## Architecture Decisions Worth Replicating

- **Named screens, not numbered.** Using `data-screen="audience"` instead of `data-screen="2"` makes the code self-documenting and easier to reorder.
- **Dynamic sidebar from a config object.** `typeConfig` drives the entire flow — adding a new survey type is one object entry.
- **Two-phase steps.** The Questions step has a `buildPhase` variable (`'form'` or `'editor'`) that determines which screen to show. This avoids creating separate steps for method selection and question editing.
- **CSS design tokens.** All colours in `:root` variables. Changing the palette means editing 10 lines.
- **DEV_MODE flag.** A boolean that unlocks all sidebar steps for debugging. Turn it off before sharing.
- **Prototype settings panel.** A floating gear icon (bottom-left) lets you toggle between navigation modes and DEV_MODE without cluttering the main UI.

---

## Tool & Environment

- **AI assistant:** Claude (Anthropic) via Cowork mode
- **Output:** Single HTML file (~2,700 lines), no build step
- **Fonts:** Inter (Google Fonts), Cabinet Grotesk (cdnfonts)
- **Icons:** Inline SVG (no icon libraries)
- **Interactivity:** Vanilla JavaScript, no frameworks
- **Total prompts:** ~15 conversational turns from initial prototype to current state
- **Documentation:** 7 markdown files maintained alongside the prototype

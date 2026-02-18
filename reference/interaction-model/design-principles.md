# Electric Twin — Design Principles

## 1. Type-First, Intent-Driven

The user declares their research intent before anything else. Selecting a survey type (Concept Testing, Brand Tracking, etc.) shapes the entire experience: which steps appear, what the audience screen says, whether stimulus is needed. The builder adapts to the user, not the other way around.

**Applied:** `typeConfig` maps each type to its properties (`needsStimulus`, label). `rebuildFlow()` reconstructs the `flowSteps` array and calls `renderSidebar()` to regenerate the sidebar dynamically. `audienceHeaders` and `stimulusHeaders` objects provide type-specific copy for each screen.

## 2. Progressive Disclosure

Never overwhelm. Show only what's needed at each step. The sidebar starts with just "Type" — the full step sequence appears only after a type is selected. Later sections remain locked until prerequisites are complete.

**Applied:** `flowSteps` starts as `['type']`. After type selection, it expands to 4 or 5 items. `renderSidebar()` generates sidebar HTML from the current `flowSteps` array. Builder mode locks sidebar items with `opacity: 0.35` and `pointer-events: none`.

## 3. Deliberate Choices

Builder mode starts blank — no pre-selections. The user makes every choice intentionally: survey type, audience, build method. This respects their expertise and avoids assumptions. Each selection is confirmed via the bottom action bar before advancing.

**Applied:** Builder mode calls `clearDefaults()` on init. The bottom bar gates progression — nothing advances until the user explicitly confirms. (The legacy Wizard and Single Page modes use `applyDefaults()` for quick walkthrough.)

## 4. One CTA at a Time

No competing buttons. The bottom action bar is the single source of truth for what to do next. Step-specific labels tell users exactly what the button does:

- Type, Audience, Stimulus: "Confirm & continue →"
- Questions (gateway): "Confirm & continue →"
- Questions (editor): "Continue to preview →"
- Preview: "Launch survey →" (exits the builder)

When nothing is selected, the bar shows a grey italic hint and the CTA is disabled.

**Applied:** `getPbHint()` and `getPbCtaLabel()` functions return step-specific text based on `stepNameOf(currentStep)`. The bottom bar is the sole CTA in Builder mode.

## 5. Dynamic Sidebar

The sidebar is not static — it rebuilds based on context. Selecting Concept Testing adds a Stimulus step; selecting Simple Survey does not. Step numbers, labels, and status indicators all regenerate. This prevents showing irrelevant steps and keeps the flow tight.

**Applied:** `renderSidebar()` iterates over `flowSteps` and generates sidebar HTML with correct numbering, active/done/locked states. `updateStepLabels()` updates the step number labels on each screen (e.g., "03 — STIMULUS" or "03 — QUESTIONS" depending on whether stimulus is in the flow).

## 6. Method Selection Inside Questions

The "how do you want to build" decision was moved from a standalone step into the Questions step. The rationale: the early flow should be about research intent (what type of research, who to survey, what to show them). Construction method is a tactical choice that belongs closer to the actual editing.

**Applied:** The Questions step has two phases managed by `buildPhase`: `'form'` (method gateway — choose AI, manual, or template) and `'editor'` (two-panel question editor). `screenForStep()` resolves the "questions" step to either `'questions-gateway'` or `'editor'` based on `buildPhase`. `confirmPbStep()` checks `buildPhase === 'editor'` to decide whether to advance to Preview or enter the editor.

## 7. Black and White, No Decoration

The visual language is monochrome. No colour is used for decoration — only for meaning (segment bars, status indicators). Typography does the heavy lifting: Inter for UI, Cabinet Grotesk for headings and statistics. The design stays out of the way so the content takes centre stage.

**Applied:** CSS uses `--black: #111`, `--dark: #222`, `--mid: #666`, `--light: #AAA`, `--rule: #E5E5E5`. No accent colours. Selected states use `background: var(--selected-bg)` with a 2px black top-border.

## 8. Guide, Don't Gate

The bottom action bar always tells users what's needed. Rather than just disabling a button with no explanation, the bar shows context: "Select an audience to continue." This turns a dead end into a signpost.

**Applied:** `getPbHint()` maps each step name to a human-readable instruction. `updatePbBar()` switches between hint mode (grey italic, disabled CTA) and ready mode (selection label, enabled CTA).

## 9. AI is a Collaborator, Not a Black Box

AI suggestions are clearly labelled, always editable, and positioned as recommendations rather than decisions. In the results view, every AI-generated insight has an Edit button. The full "upload brief → get survey" AI path lives in agentic chat, separate from the structured builder flow.

**Applied:** `.ai-box` has a left-border accent and explicit "AI" labels. Results findings show "AI-generated — click Edit to refine" note. The builder's AI path (within Questions) is a simpler describe-or-upload flow, not the full agentic experience.

## 10. Stimulus is First-Class

Stimulus materials aren't afterthoughts — for relevant survey types, they get their own dedicated step. Selecting Concept Testing, Message Testing, or Creative Testing adds a Stimulus step between Audience and Questions, with type-specific headers ("Add your concepts" vs. "Add your creative"). Stimulus also appears in the editor (preview bar above questions) and in Preview.

**Applied:** `typeConfig` has a `needsStimulus` boolean per type. `rebuildFlow()` conditionally includes `'stimulus'` in `flowSteps`. `stimulusHeaders` provides type-specific titles and subtitles. The Stimulus screen has a dedicated upload zone with SVG icon.

## 11. Scannable Results (Results Canvas)

Results live on their own canvas, separate from the builder. The layout is a single-column scroll. Each question occupies one row: left column is the editable insight (big stat + narrative), right column is the data (chart + segment bars). Users read top-to-bottom like a report.

**Applied:** `.results-stream` uses `flex-direction: column`. Each `.finding-row` is a grid with `300px / 1fr` columns.

## 12. Minimal UI, Maximum Content

Borders instead of shadows. Labels in caps-lock at 9–10px. No icons where text works. Padding is generous but never excessive. Every pixel either shows content or creates breathing room.

**Applied:** Cards use `border: 1px solid var(--rule)`. Section labels are 9–10px, 600 weight, 0.1em letter-spacing. Subtitles are kept concise (single line where possible).

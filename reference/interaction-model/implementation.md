# Electric Twin — Implementation Notes

Concise reference for the interactive HTML mockup (`survey-ux-mockup.html`).

---

## Architecture

Single HTML file, ~2,700 lines. No build step, no dependencies. CSS and JS inline.

> **Navigation decision:** Builder mode is the shipping direction. Wizard and Single Page modes remain in the prototype for stakeholder comparison but are not being developed further.

### CSS

- **Design tokens** in `:root` — 10 colour variables, all greyscale.
- **Typography** — Inter (UI) and Cabinet Grotesk (headings/stats). Inter via Google Fonts, Cabinet Grotesk via cdnfonts.
- **Mode styles** — Body class (`wizard`, `page-builder`, `single-page`) controls layout. Builder (`page-builder`) is the primary mode.
- **Component patterns** — Card grids use `gap: 1px; background: var(--rule)` for hairline borders. Selected state = `background: var(--selected-bg)` + 2px top border.

### HTML Structure

```
nav.nav (sticky)
  logo | nav-steps (wizard only) | save-draft
button.proto-settings-trigger (floating gear, bottom-left)
  → proto-settings-panel (mode toggle + DEV_MODE)
div.pb-layout (builder mode)
  aside.pb-sidebar#pb-sidebar (dynamic — rebuilt by renderSidebar())
  div.pb-main (active screen moved here)
div.pb-confirm (fixed bottom bar, builder mode)
div.wizard-screen[data-screen="type"]              → Type (step 1, always)
div.wizard-screen[data-screen="audience"]           → Audience (step 2)
div.wizard-screen[data-screen="stimulus"]           → Stimulus (conditional step)
div.wizard-screen[data-screen="questions-gateway"]  → Questions method picker
div.wizard-screen[data-screen="editor"]             → Questions editor
div.wizard-screen[data-screen="preview"]            → Preview (final step)
div.wizard-screen[data-screen="results"]            → Results (separate canvas in production)
div.loading-overlay → AI generation progress
div.stim-lightbox → Stimulus preview modal
```

Screens use **named** `data-screen` attributes (not numbers). The `screenForStep()` function resolves step names to screen names, handling the questions step specially (maps to either `'questions-gateway'` or `'editor'` based on `buildPhase`).

---

## Dynamic Flow System

The flow adapts based on survey type. Core configuration objects:

```js
const typeConfig = {
  simple:   { needsStimulus: false, label: 'Simple Survey' },
  concept:  { needsStimulus: true,  label: 'Concept Testing' },
  message:  { needsStimulus: true,  label: 'Message Testing' },
  creative: { needsStimulus: true,  label: 'Creative Testing' },
  brand:    { needsStimulus: false, label: 'Brand Tracking' },
  audience: { needsStimulus: false, label: 'Audience Exploration' },
};

const audienceHeaders = { /* type-specific titles/subs for Audience screen */ };
const stimulusHeaders = { /* type-specific titles/subs for Stimulus screen */ };
```

### Flow array

```js
let flowSteps = ['type']; // starts minimal
// After type selection, rebuildFlow() expands:
// Simple:  ['type', 'audience', 'questions', 'preview']
// Concept: ['type', 'audience', 'stimulus', 'questions', 'preview']
```

### Step resolution

```js
function stepIndexOf(name) → 1-indexed position in flowSteps
function stepNameOf(n) → name at 1-indexed position
function totalStepCount() → flowSteps.length
function screenForStep(step) → resolves to data-screen attribute
```

### Sidebar rendering

`renderSidebar()` generates sidebar HTML from `flowSteps`, with correct numbering, active/done/locked states. Called whenever the flow changes.

---

## JS State

```js
let currentStep = 1;              // Active step (1-indexed into flowSteps)
let mode = 'page-builder';        // Current navigation mode
const completedSteps = new Set();  // Steps marked done
let DEV_MODE = false;             // Unlock all sidebar steps for debugging
let selectedBuildMethod = 'ai';   // 'ai', 'manual', or 'template'
let buildPhase = 'form';          // 'form' (method gateway) or 'editor'
let selectedType = null;          // Currently selected survey type key
let flowSteps = ['type'];         // Dynamic step array
```

---

## Key Functions

| Function | Purpose |
|---|---|
| `setMode(m)` | Switch navigation mode *(prototype only)*. Resets flow state. |
| `rebuildFlow(typeName)` | Rebuild `flowSteps` based on type config. Regenerate sidebar. Update headers. |
| `renderSidebar()` | Generate sidebar HTML from `flowSteps` array. |
| `stepIndexOf(name)` | Get 1-indexed position of a named step. |
| `stepNameOf(n)` | Get step name at 1-indexed position. |
| `screenForStep(step)` | Resolve step to `data-screen` value (handles questions → gateway/editor). |
| `selectType(el)` | Select survey type. Calls `rebuildFlow()`. Shows confirm bar. |
| `updateAudienceHeaders(type)` | Update Audience screen title/subtitle for selected type. |
| `updateStimulusHeaders(type)` | Update Stimulus screen title/subtitle for selected type. |
| `selectAudience(el)` | Select Single/Multi. Shows sub-panel. Does NOT complete step. |
| `pickAudience(el, val)` | Pick specific audience. Shows confirm bar. |
| `selectBuild(el)` | Select build method in Questions gateway. Shows method panel. |
| `checkBuildReady()` | Checks if prompt typed or brief uploaded. Enables/resets bar. |
| `pbActivate(n)` | Move screen for step `n` into `pb-main`. Update sidebar + bar. |
| `showPbConfirm(step, label)` | Show selection in bottom bar. Enable CTA. |
| `getPbHint(stepNum)` | Get hint text for a step (by name lookup). |
| `getPbCtaLabel(stepNum)` | Get CTA button text for a step (by name lookup). |
| `confirmPbStep()` | Complete pending step, advance. Checks `buildPhase` for questions. |
| `showBuildEditorBar()` | Show editor-phase bottom bar ("Continue to preview →"). |
| `clearDefaults()` | Clear all selections. Reset flow. *(Builder starts here)* |
| `applyDefaults()` | Pre-select defaults. *(Wizard/Single Page demo only)* |

---

## Question Editor

Two-panel layout: `grid-template-columns: 220px 1fr`.

- **Left:** Question list with drag handles (⋮⋮) for reordering, type badges, and `+ Add Question` button.
- **Right:** Editor canvas with stimulus preview bar (when present), question type dropdown, question text input, answer options with drag handles, settings toggle, and AI suggestion box.

Question data is stored in `questionData` array. Drag-to-reorder uses HTML5 native drag-and-drop (`qDragStart`, `qDragOver`, `qDragEnter`, `qDragLeave`, `qDrop`, `qDragEnd`).

---

## Bottom Action Bar (Builder Mode)

Always visible. Two states:

**Hint state** (nothing selected): grey italic text from `getPbHint()`, disabled CTA.

**Ready state** (selection made): selection label in bold, enabled CTA, "Change" button visible.

Step-specific CTA labels are generated by `getPbCtaLabel()`:
- Type/Audience/Stimulus/Questions gateway: "Confirm & continue →"
- Preview: "Launch survey →"

In editor phase, `showBuildEditorBar()` provides: "Continue to preview →".

---

## Build Panel (AI Path in Questions)

Side-by-side layout (`.ai-input-row` — CSS grid, 2 columns):

1. **Left column: Describe** — Textarea for research objectives. `oninput="checkBuildReady()"`.
2. **Right column: Upload a Brief** — Upload zone with stylised document SVG icon. `simulateBriefUpload()` swaps zone for file card.

Hint below: "Use either or both — AI combines everything you provide."

Ready condition: prompt has text OR brief is uploaded.

---

## Stimulus Step

Conditional step for Concept/Message/Creative Testing. Upload zone with large image/video SVG icon. `simulateStimulusStep()` simulates uploading materials. Items appear as thumbnail cards with remove buttons (`removeStimulusItem()`).

---

## Results Canvas (Separate View)

Single-column `.results-stream` with 8 `.finding-row` items. Each row: `grid-template-columns: 300px 1fr`. Left: insight column. Right: data column. Chart types: bar charts, concept comparison cards, theme tags, large number display.

---

## File Inventory

| File | Description |
|---|---|
| `survey-ux-mockup.html` | Interactive prototype — all states, all modes |
| `Electric-Twin-Survey-Interaction-Model.md` | Full interaction model document |
| `Survey-Model-Diagrams.md` | Mermaid diagrams (flow, state, components, data) |
| `Survey-Interaction-Model.pptx` | Slide deck |
| `master-plan.md` | Product vision and scope |
| `design-principles.md` | UX design decisions |
| `user-journey.md` | Step-by-step user flow |
| `implementation.md` | This file |
| `prompt-guide.md` | How to recreate a prototype like this |

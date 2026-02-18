# Electric Twin — User Journey

This document maps the user's path through the Electric Twin survey builder and the separate results canvas. The builder uses a dynamic flow that adapts based on the survey type selected.

---

## Entry Point

User arrives at the survey creator. The top nav shows the ElectricTwin logo and a Save Draft button. The product uses the **Builder** navigation pattern: left sidebar TOC with step status indicators, focused main area, and a persistent bottom action bar.

The sidebar is **dynamic** — it starts with only "Type" visible. Once a type is selected, the full set of steps appears, which varies by type (4 steps for simple types, 5 steps for types requiring stimulus).

> **Prototype note:** The interactive mockup also includes Wizard and Single Page modes, accessible via a floating settings gear (bottom-left). These exist for stakeholder comparison only — Builder is the shipping direction.

---

## Step 1: Type

**What the user sees:** "What kind of survey?" with a 3×2 grid of survey types:

| Type | Description | Tags |
|---|---|---|
| Simple Survey | Straightforward questionnaire, no stimulus | No Stimulus, Freeform |
| Concept Testing | Evaluate product concepts | Stimulus Required, Monadic, Comparative |
| Message Testing | Test marketing messages | Text Stimulus, Comparative |
| Creative Testing | Evaluate ads, packaging | Image/Video, Monadic |
| Brand Tracking | Recurring awareness tracking | Multi-Wave, Scales |
| Audience Exploration | Segmentation and profiling | Segmentation, Profiling |

**User action:** Click a type card → card highlights with selected state.

**What happens next:** The sidebar rebuilds to show the full flow for that type. For Concept/Message/Creative Testing, a Stimulus step appears between Audience and Questions. Bottom bar shows "Survey type: **Concept Testing**" with "Confirm & continue →". User confirms to advance.

**Dynamic sidebar examples:**

- Simple Survey → Type, Audience, Questions, Preview (4 steps)
- Concept Testing → Type, Audience, Stimulus, Questions, Preview (5 steps)
- Audience Exploration → Type, Audience, Questions, Preview (4 steps)

---

## Step 2: Audience

**What the user sees:** The title and subtitle adapt to the selected survey type:

| Type | Title | Subtitle |
|---|---|---|
| Simple Survey | Who should take this survey? | Define your target respondents. |
| Concept Testing | Who will evaluate these concepts? | Choose the audience who will see and rate your concepts. |
| Message Testing | Who will see these messages? | Select the audience for your message test. |
| Creative Testing | Who will see this creative? | Choose the audience for your creative evaluation. |
| Brand Tracking | Whose brand perception are you tracking? | Define the population you want to measure. |
| Audience Exploration | Who do you want to understand? | Define the group you want to explore and profile. |

Two audience mode cards:

- **Single Audience** — One target group
- **Multi-Segment** — Compare across segments

**User action (Single Audience):**

1. Click "Single Audience" → Audience picker panel appears
2. Choose from suggested audiences (UK Grocery Shoppers, US Health-Conscious, UK Young Urban, B2B Decision Makers, UK Parents)
3. Or click "+ Define a custom audience"

**User action (Multi-Segment):** Segment table appears with pre-defined rows showing criteria and sample sizes.

**Key UX decision:** Clicking "Single Audience" does NOT auto-advance. The bottom bar only enables after the user picks a specific audience. This two-step pattern prevents premature progression.

---

## Step 3 (conditional): Stimulus

**When it appears:** Only for Concept Testing, Message Testing, and Creative Testing. Does not appear for Simple Survey, Brand Tracking, or Audience Exploration.

**What the user sees:** Title and subtitle adapt to type:

| Type | Title | Subtitle |
|---|---|---|
| Concept Testing | Add your concepts | Upload the concepts respondents will evaluate. |
| Message Testing | Add your messages | Upload the messages or taglines to test. |
| Creative Testing | Add your creative | Upload the ads, packaging, or visuals to evaluate. |

An upload zone with a large image/video SVG icon. Users drop files or click to browse. Uploaded items appear as thumbnail cards with name, metadata, and remove button.

**User action:** Upload stimulus materials → thumbnails appear → bottom bar enables "Confirm & continue →".

---

## Step 3 or 4: Questions

This step has two phases: **method selection** (gateway) and **question editing** (editor).

### Phase 1: Method Gateway

**What the user sees:** "How do you want to add questions?" with three options:

1. **Generate with AI** — Describe what you need or upload a brief. AI generates your questions. Side-by-side layout: left column for text prompt, right column for brief upload (with stylised document SVG icon).
2. **Build From Scratch** — Add questions one by one with full control over types and options.
3. **Templates** — Pre-built questionnaires ready to customise. Two categories: Your Templates and Electric Twin templates.

**AI path:** User types objectives and/or uploads a brief. Bottom bar enables when prompt has text or brief is uploaded. CTA is "Confirm & continue →" which triggers AI generation overlay.

**Manual path:** Bottom bar immediately shows "Build From Scratch" with enabled CTA. Clicking advances to an empty editor.

**Template path:** User selects a template from the list. CTA enables with the template name.

### Phase 2: Question Editor

**What the user sees:** Two-panel layout:

- **Left (220px):** Question list with type badges and drag handles (⋮⋮) for reordering. `+ Add Question` at the bottom.
- **Right:** Editor canvas with question type dropdown, question text input, answer options with drag handles, inline settings toggle, and AI suggestion box. Stimulus preview bar sits above the editor when concepts are present.

**Bottom bar:** Shows "Edit questions if needed, or continue when ready" with "Continue to preview →" CTA.

**User actions:** Edit question text, reorder questions via drag-and-drop, reorder answers, change question types via dropdown, add/remove questions, toggle randomisation.

---

## Final Step: Preview

**What the user sees:** Two-column layout:

- **Left:** Full question list with type badges, answer previews, and Edit buttons. AI review box with improvement suggestions.
- **Right sidebar:** Summary (type, method, question count, est. time, segments, sample), stimulus preview, audience breakdown.

**Bottom bar:** Shows "Preview your survey, then launch when ready" with "Launch survey →" CTA.

**User actions:** Review questions, accept AI suggestions, launch survey. Clicking "Launch survey →" exits the builder.

---

## Results Canvas (Separate View)

Results are **not** part of the builder. Once a survey is launched, the user navigates to the results canvas from a dashboard, survey list, or notification.

**What the user sees:** Results header with title, response count, date, and view tabs (Per Question / Full Report / Segments).

Below: single-column scroll of per-question finding rows. Each row has an editable insight column (left: big stat, narrative text, "AI-generated — click Edit to refine" note) and a data column (right: question label, chart, segment breakdown bars).

**Insight editing flow:**
1. Click "Edit" → text becomes contenteditable
2. Edit the AI-generated text
3. Click "Save" → text locks, note changes to "Edited"

> **Prototype note:** In the interactive mockup, Results is included in the builder for demonstration purposes. In the shipping product it will be a separate view.

---

## Builder Mode Behaviours

- Left sidebar TOC with dynamically numbered dots, labels, and status ("In progress" / "Done").
- Sidebar rebuilds when a survey type is selected — step count and labels change based on whether Stimulus is needed.
- Steps unlock progressively — locked steps are greyed out with no pointer events. Users can click completed steps to revisit.
- Main area shows one section at a time.
- Bottom action bar always visible: hint state (grey italic, disabled CTA) when nothing selected; ready state (selection label, enabled CTA, "Change" button) after selection.
- Starts with nothing selected — user makes deliberate choices.
- Sidebar shows a spinner animation during AI generation.
- The builder ends at Launch (Preview step). Results live on a separate canvas.

> **Prototype note:** Wizard and Single Page modes are also available for stakeholder comparison. DEV_MODE (toggled via settings gear) unlocks all sidebar steps for debugging.

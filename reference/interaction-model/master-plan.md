# Electric Twin — Master Plan

## Vision

Electric Twin is an AI-powered survey creation platform that lets researchers, brand teams, and product managers go from a research objective to actionable insights in minutes — not weeks. The platform handles everything: question generation, audience selection, survey deployment, and results analysis.

## Core Proposition

**One tool, end to end.** Describe what you want to learn → AI builds the survey → deploy to the right audience → get results with editable, AI-generated insights.

## Product Scope

### Survey Builder — Dynamic Flow

The builder is a guided creation tool. It takes the user from a blank slate to a launched survey in four or five steps, depending on the survey type selected. The flow is **Type-first** — the user declares what they're trying to do, and the builder adapts its steps accordingly.

**Core steps (always present):**

1. **Type** — Choose what kind of survey: Simple Survey, Concept Testing, Message Testing, Creative Testing, Brand Tracking, or Audience Exploration. This selection shapes everything that follows — audience headers, whether a Stimulus step appears, and which templates are offered.
2. **Audience** — Define who takes the survey. Headers adapt to the selected type (e.g., "Who will evaluate these concepts?" for Concept Testing, "Who do you want to understand?" for Audience Exploration). Single target group or multi-segment comparison. Pre-built suggested audiences or custom definition.
3. **Questions** — Choose how questions are created: Generate with AI (describe objectives or upload a brief), Build From Scratch (add questions one by one), or pick a Template. After choosing, the user enters a two-panel editor with question list (left) and editor canvas (right).
4. **Preview** — Full survey summary. Review questions, audience, stimulus, and metadata before launching.

**Conditional step:**

- **Stimulus** — Appears between Audience and Questions for survey types that require stimulus materials (Concept Testing, Message Testing, Creative Testing). Users upload concepts, messages, or creatives that respondents will evaluate. Does not appear for Simple Survey, Brand Tracking, or Audience Exploration.

The left sidebar rebuilds dynamically when a type is selected, showing only the relevant steps.

### Method Selection Within Questions

The "how do you want to build" decision is now part of the Questions step, not a separate step. The user sees three cards: Generate with AI, Build From Scratch, and Templates. This keeps the early flow focused on the research intent (what type, who to ask, what to show) before getting into construction methods.

The AI "upload a research brief and have it generate an entire survey" path is handled separately through **agentic chat** — an input field where the user can describe what they want and attach files. The builder flow is the more structured, hands-on path.

### Results Canvas — Separate View

Results are **not** part of the builder. Once a survey is launched, results live on their own canvas — a distinct page the user navigates to from a dashboard, notification, or survey list. The builder creates surveys; the results canvas consumes and analyses them.

The results canvas is a single-column scroll of per-question findings. Each question has an editable AI insight (big stat + narrative) alongside chart data with segment breakdowns. Tabs for Per Question, Full Report, and Segments views.

### Navigation Mode: Builder

The builder uses the **Builder** pattern: left sidebar TOC with dynamic step indicators + focused main area. Steps unlock progressively. A persistent bottom action bar shows contextual hints and step-specific CTAs (e.g., "Select a survey type to continue" → "Survey type: **Concept Testing** — Confirm & continue →"). The final step (Preview) ends with "Launch survey →", at which point the user exits the builder.

> **Note — Prototype:** The interactive mockup (`survey-ux-mockup.html`) also includes Wizard and Single Page modes for stakeholder comparison. These are accessible via a floating settings gear (bottom-left) and are **not** shipping. Builder is the chosen direction.

## Survey Types

| Type | Stimulus | Description |
|---|---|---|
| Simple Survey | No | Straightforward questionnaire, freeform questions |
| Concept Testing | Yes | Evaluate product concepts with monadic/comparative methods |
| Message Testing | Yes | Test marketing messages and taglines |
| Creative Testing | Yes | Evaluate ads, packaging, or visuals |
| Brand Tracking | No | Recurring awareness and perception tracking |
| Audience Exploration | No | Segmentation and profiling research |

## AI Throughout

AI is not a feature — it's the backbone:

- **Agentic Chat**: Upload a research brief and describe what you need — AI generates an entire survey end-to-end.
- **Questions**: AI generates questions from a prompt or brief within the builder. Per-question suggestions improve wording, add missing options, and optimise structure.
- **Preview**: AI flags issues across the whole survey (e.g., "Move Q6 earlier," "Make Q7 optional to reduce fatigue").
- **Results**: AI generates per-question findings with statistics, segment comparisons, and actionable recommendations — all editable by the user.

## Target Users

- Market researchers who need speed without sacrificing rigour
- Brand managers running concept tests and creative evaluations
- Product teams validating features with target users
- Agencies managing multiple survey projects

## Technical Deliverables

| Deliverable | Status | File |
|---|---|---|
| Interaction model document | Done | `Electric-Twin-Survey-Interaction-Model.md` |
| System diagrams | Done | `Survey-Model-Diagrams.md` |
| Slide deck | Done | `Survey-Interaction-Model.pptx` |
| Interactive HTML mockup | Done | `survey-ux-mockup.html` |
| Design principles | Done | `design-principles.md` |
| User journey map | Done | `user-journey.md` |
| Implementation notes | Done | `implementation.md` |
| Prompt guide | Done | `prompt-guide.md` |

## What's Next

- Responsive/mobile layout
- Real API integration for audience panel providers
- Live AI generation (streaming question output)
- Agentic chat interface for brief-to-survey generation
- Collaboration features (share draft, comment on questions)
- Export and white-label options
- Template marketplace

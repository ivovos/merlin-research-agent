# Prototype Merge Plan: Merlin + Interaction Model

## Goal

Merge the **Merlin Research Agent** (React/TS chat-driven research tool) with the **Interaction Model** (vanilla HTML survey builder) into a single working prototype that demonstrates:

1. **Projects with real data** — Pre-populated projects (BP, Vodafone, Disney, Philips) showing what a completed research project looks like with all data, stimulus, and findings
2. **Survey creation via builder** — The structured Type → Audience → Stimulus → Questions → Preview flow from the interaction model, ported into React
3. **Survey creation via chat** — The existing Merlin agentic chat interface where users describe objectives and AI generates research
4. **Results canvas** — A unified results view combining Merlin's chart-rich Canvas with the interaction model's editable-insight findings layout

---

## What We're Working With

### Merlin Research Agent (`dev/Merlin-Research-Agent`)
- **Stack:** React 19 + TypeScript + Vite + Tailwind + shadcn/ui + Recharts
- **What it does:** Chat-driven synthetic research — type a query, AI selects methodology (survey, focus group, comparison, sentiment, heatmap), generates structured results as a "Canvas" with charts, themes, quotes
- **Strengths:** Working React app, solid component library (shadcn), chart rendering, conversation management, audience/account model, process-step animations, study plan editing
- **Weaknesses:** No structured builder flow, no stimulus handling, no project dashboard with real data, results view is chart-focused (lacks the editorial findings layout)

### Interaction Model (`interaction-model`)
- **Stack:** Single HTML file (~2,700 lines), vanilla JS, no framework
- **What it does:** Survey builder with dynamic Type-first flow, 6 survey types, 19 question types, stimulus handling, results canvas with editable AI insights
- **Strengths:** Complete builder UX (well-documented, strong design principles), rich mock data (4 brand case studies with real stimulus assets), results canvas with per-question findings, comprehensive documentation
- **Weaknesses:** Vanilla HTML (needs full React port), no AI integration, no chat interface, no real data flow

### Mock Data Available (`interaction-model/Mockdata`)
- **Excel:** `Electric_Twin_Mock_Data_Sets.xlsx` — data schemas for survey responses, segments, demographics
- **BP:** Creative testing (OOH ads) — 4 creative assets (JPG/PNG), questionnaire PDF, test results presentation
- **Vodafone:** Concept testing — 3 concept cards, 9 report pages, 68 results charts
- **Disney:** Creative testing — key art assets (referenced, not all extracted)
- **Philips:** Case study materials
- **Others:** Additional case study references

---

## Object Model & App Structure

### Core Concept: Project = Chat

Every project is a conversation. The sidebar shows a list of projects; click one and you see a chat. There is no separate dashboard, no project detail view, no standalone results page. The conversation is the project — it accumulates research iteratively.

A typical session:

1. Open a project (or create new)
2. Upload a brief via the **+** button, ask "what should we test here?"
3. AI suggests an approach
4. Click **Add Study** to build a structured concept test (guided builder opens)
5. Builder closes, results drop into the chat as a FindingsCanvas
6. Ask a follow-up: "how does this compare to the last wave?"
7. AI runs a quick supplementary study, results appear inline
8. Ask "summarise what we've learned" → AI produces a deliverable from accumulated context

The conversation is the spine. Everything hangs off it.

### Object Model

```
Account
  └── Project (= Conversation)
        ├── Messages[]
        │     ├── User messages (questions, requests, instructions)
        │     ├── AI responses (thinking, methodology, narrative)
        │     ├── StudyResult blocks (FindingsCanvas, inline in the stream)
        │     └── Uploaded content (briefs, images, stimulus — via + button)
        ├── Studies[] (metadata for each study run)
        │     ├── type: SurveyType
        │     ├── questions: SurveyQuestion[]
        │     ├── audiences: Audience[]
        │     ├── stimuli: Stimulus[]
        │     ├── methodology: string
        │     └── findings: Finding[]
        ├── Audiences[] (created via Add Audience or during study setup)
        └── Attachments[] (briefs, documents, images uploaded via +)
```

A **Study** is created one of two ways but produces the same output:

| Path | Trigger | Experience | Output |
|------|---------|------------|--------|
| **Agentic (chat)** | Type a research question | AI picks methodology, selects audience, generates findings. Fast, exploratory. | FindingsCanvas appears inline |
| **Guided (builder)** | Click "Add Study" in input bar | Step-by-step: Type → Audience → Stimulus → Questions → Preview → Launch. Full control. | FindingsCanvas appears inline |

Both paths produce a `Study` with `Finding[]` that render as a FindingsCanvas block in the conversation stream. From the user's perspective, the chat just grows — messages interspersed with study results.

### Navigation

**Sidebar (left):**
- Account selector (top)
- Project list — each item shows project name, last activity, maybe a status dot
- "New Project" button
- Audiences section (browse/manage audiences across projects)

**Main area (always a chat):**
- Message stream: user messages, AI responses, FindingsCanvas blocks, uploaded attachments
- Chat input bar (bottom)

**No other views.** No dashboard. No project detail. No standalone results page. The chat IS the project view.

### Chat Input Bar

The input bar is the control centre. Text input plus action buttons:

```
┌─────────────────────────────────────────────────────────────┐
│  [+]  [Add Audience]  [Add Study]     Type a message...  → │
└─────────────────────────────────────────────────────────────┘
```

| Button | Action |
|--------|--------|
| **+** (attach) | Upload a brief, image, stimulus, document. Appears as an inline attachment in the chat. Can then discuss it: "what does this brief suggest we test?" |
| **Add Audience** | Opens audience picker/creator. Selected audience becomes available for studies in this project. |
| **Add Study** | Opens the guided study builder as a full-screen overlay. On completion, study results drop into the chat. |
| **Text input** | Type a question or instruction. AI responds agentically — may run a study, answer from context, or produce a deliverable. |

### The Builder (Overlay)

When you click "Add Study," the builder opens as a **full-screen overlay** on top of the chat. It uses the interaction model's step-by-step flow:

Type → Audience → Stimulus (conditional) → Questions → Preview → Launch

The builder has its own sidebar (step navigation), main area, and bottom action bar — exactly as documented in the interaction model. It does NOT need its own route or URL. It's a modal layer.

When the user clicks "Launch" on the Preview step:
1. Builder closes
2. A message appears in the chat: "Study launched: Vodafone Concept Test — 10 propositions, 7 KPIs, 2 segments"
3. After a brief animation (simulating fieldwork), the FindingsCanvas drops in with results

For the prototype, "Launch" immediately produces results from mock data. No actual fieldwork simulation needed beyond a quick loading state.

### Pre-populated Demo Projects

The BP, Vodafone, Disney, Philips, and Candy Crush cases show up as **projects in the sidebar**. Opening one reveals a conversation that looks like a researcher already worked through it:

```
Vodafone Broadband Research
├── [User] "Here's the brief for the Vodafone broadband proposition testing"
│   └── [Attachment: research-brief.pdf]
├── [AI] "I can see this is a proposition testing study across 10 broadband concepts..."
├── [User] "Let's test all 10 propositions with broadband decision-makers"
├── [AI] "Setting up a concept test..."
│   └── [FindingsCanvas: 10 propositions × 7 KPIs — switching intent, appeal, relevance...]
├── [User] "How do tech-savvy families compare to general broadband users?"
├── [AI] "Breaking down by segment..."
│   └── [FindingsCanvas: segment comparison — tech-savvy vs. general]
├── [User] "Which propositions should we take forward?"
└── [AI] "Based on the data, the top 3 propositions are... [narrative summary]"
```

This is generated from the Excel mock data — the messages are synthetic but the findings are real data from the spreadsheet. Each demo project is a pre-built conversation with FindingsCanvas blocks containing actual case study data.

### Deliverables

Because the chat accumulates all context (studies, findings, briefs, discussion), the user can ask for deliverables at any point:

- "Summarise what we've learned so far"
- "Create a report comparing the top 5 propositions"
- "Write a recommendation for the client"
- "Export the key findings as a presentation"

The AI has the full conversation history to draw from. Deliverables appear as messages (narrative text) or as generated artifacts (report cards, exportable content).

---

## Architecture Decision

**Base: Merlin Research Agent (React/TS)**

The Merlin codebase is the foundation. It already has a working React app with the right stack (Vite, Tailwind, shadcn, Recharts, TypeScript). The interaction model's builder flow gets ported into React components within this codebase.

**Rationale:**
- Merlin has ~87 working TypeScript source files with proper component architecture
- shadcn/ui gives us a polished component library for the builder UI
- The AI chat flow already works — we keep it and add the builder alongside it
- Recharts is already configured for data visualisation
- Porting HTML/JS to React is straightforward (the interaction model is well-documented with clear state management patterns)

---

## Phased Plan

### Phase 1: Foundations (Navigation, Data Model, Project Shell)

**Objective:** Get the app navigating between views and loading mock data, before building any new UI.

#### 1A. Extend the Navigation Model

Current Merlin has three views: `conversation`, `audiences`, `audienceDetail`. Extend to:

```
ActiveView =
  | 'dashboard'          // NEW: Project list / home
  | 'projectDetail'      // NEW: Single project with all its data
  | 'conversation'       // EXISTING: Chat-driven research
  | 'surveyBuilder'      // NEW: Structured builder flow
  | 'results'            // NEW: Results canvas (standalone)
  | 'audiences'          // EXISTING: Browse audiences
  | 'audienceDetail'     // EXISTING: Single audience
```

Update the sidebar (`AppSidebar.tsx`) to add navigation items for Dashboard and Builder. The sidebar already supports accounts and conversation history — add a "Projects" section and a "New Survey" entry point.

#### 1B. Unified Data Model

Create new TypeScript types that bridge both systems. The key is making Merlin's `Canvas` (research results) and the interaction model's `Finding` (per-question insight + data) coexist.

**New/extended types needed:**

```typescript
// Survey types from interaction model
type SurveyType = 'simple' | 'concept' | 'message' | 'creative' | 'brand_tracking' | 'audience_exploration'

// Stimulus material
interface Stimulus {
  id: string
  type: 'image' | 'video' | 'text' | 'concept' | 'document'
  name: string
  url: string           // Path to asset
  thumbnailUrl?: string
}

// Survey question (from interaction model's 19 types)
interface SurveyQuestion {
  id: string
  type: QuestionType    // single_select, multi_select, likert, etc.
  text: string
  options?: string[]
  required: boolean
  stimulusRef?: string  // Link to stimulus item
  aiSuggestion?: string
}

// Per-question finding (interaction model pattern)
interface Finding {
  questionId: string
  headline: string      // Big stat ("67% prefer Concept A")
  insight: string       // AI narrative
  chartData: any        // Recharts-compatible data
  segmentBreakdowns?: SegmentBreakdown[]
  editable: boolean
}

// Extend existing Project type to hold surveys
interface Project {
  // ...existing fields (id, name, audiences, etc.)
  surveys: Survey[]
  stimuli: Stimulus[]
}

interface Survey {
  id: string
  type: SurveyType
  name: string
  status: 'draft' | 'active' | 'completed'
  questions: SurveyQuestion[]
  audiences: string[]       // Audience IDs
  stimuli: string[]         // Stimulus IDs
  findings?: Finding[]      // Results (when completed)
  canvas?: Canvas           // Merlin-style canvas (for chat-generated)
  createdAt: string
  methodology?: string      // monadic, comparative, etc.
}
```

#### 1C. Mock Data Layer

**Source of truth:** Copy `interaction-model/Mockdata/Electric_Twin_Mock_Data_Sets.xlsx` directly into Merlin's `public/assets/` directory. This Excel workbook contains complete structured data for all 5 case studies — no manual chart-reading needed.

**What's in the Excel (5 sheets, each with full research briefs, questions, and numeric findings):**

| Sheet | Case | Research Type | Data Available |
|-------|------|--------------|----------------|
| 1. BP Ad Testing | BP Ultimate Fuels 360 Campaign | Ad Pre-Testing (OOH Link+) | 4 variants × 17 metrics with percentiles + norms |
| 2. Vodafone Propositions | Vodafone Broadband | Concept/Proposition Testing | 10 propositions × 7 KPIs × 2 segments |
| 3. Disney Key Art | Disney+ Alice & Steve | Key Art Testing (Monadic) | 3 versions × 19 metrics + attribute maps |
| 4. Philips Concept Test | Philips Pain Relief Device | Product Concept Testing | 7 KPIs with means, T2B%, and norms |
| 5. Candy Crush IP Mapping | King / Activision Blizzard | IP Partnership Fit Study | 3 segments × MaxDiff + perception data |

Each sheet includes: research brief, target audience & screening criteria, stimulus descriptions, full question wording with scales, and numeric findings.

**Approach:** Read the Excel at build time (or at app init) using SheetJS (`xlsx` npm package, already available in the React artifact ecosystem) and convert each sheet into typed `Project` + `Survey` + `Finding[]` objects. This means the mock data stays maintainable — edit the Excel, data updates automatically.

Create a `data/projects/` directory:

```
data/
  projects/
    parseExcel.ts    // SheetJS parser: xlsx → Project[]
    transforms.ts    // Sheet-specific transforms (each sheet has different structure)
    index.ts         // Exports parsed projects
  mockData.ts        // Existing (keep, extend with project references)
```

**Stimulus assets:** Copy the image files from `interaction-model/Mockdata/Stimulus_Extracted/` into Merlin's `public/assets/stimulus/` so they're servable by Vite:

```
public/assets/stimulus/
  bp/           ← 4 OOH creative JPG/PNGs
  vodafone/     ← 3 concept cards + 9 report pages
  disney/       ← key art versions (placeholder if not extracted)
```

Also copy the Excel file itself into `public/assets/`:

```
public/assets/Electric_Twin_Mock_Data_Sets.xlsx
```

The `parseExcel.ts` module fetches this file, parses it with SheetJS, and produces typed project data. Each sheet gets its own transform function because the column layouts differ (BP has variant-per-column findings, Vodafone has proposition-per-row, Disney has version-per-column, etc.).

#### 1D. Dashboard View (New Component)

Create `components/Dashboard.tsx` — a project list view that shows all loaded projects. Each project card shows:
- Project name and brand
- Survey type badge (Creative Testing, Concept Testing, etc.)
- Number of questions, audience count, status
- Stimulus thumbnails (small previews)
- Click to navigate to `projectDetail`

This is the "show people what it looks like with real data" view.

---

### Phase 2: Survey Builder (Port from Interaction Model)

**Objective:** Port the interaction model's builder flow into React components within Merlin.

#### 2A. Builder Shell & State

Create `components/builder/` directory:

```
components/builder/
  SurveyBuilder.tsx          // Main builder shell (sidebar + main + bottom bar)
  BuilderSidebar.tsx         // Dynamic step sidebar (ports renderSidebar())
  BuilderActionBar.tsx       // Persistent bottom CTA bar
  steps/
    TypeStep.tsx             // Survey type selection (6 cards)
    AudienceStep.tsx         // Audience selection (single/multi)
    StimulusStep.tsx         // Stimulus upload/management
    QuestionsGateway.tsx     // Method selection (AI / Manual / Template)
    QuestionsEditor.tsx      // Two-panel question editor
    PreviewStep.tsx          // Full survey review
```

State management for the builder (create `hooks/useSurveyBuilder.ts`):

```typescript
interface BuilderState {
  currentStep: string
  selectedType: SurveyType | null
  flowSteps: string[]          // Dynamic, rebuilds on type change
  audience: { mode: 'single' | 'multi', selected: string[] }
  stimuli: Stimulus[]
  buildMethod: 'ai' | 'manual' | 'template' | null
  buildPhase: 'gateway' | 'editor'
  questions: SurveyQuestion[]
  survey: Partial<Survey>
}
```

Port the `typeConfig`, `rebuildFlow()`, `stepNameOf()`, `getPbHint()`, `getPbCtaLabel()` logic from the HTML prototype into this hook. The interaction model's `implementation.md` documents these functions thoroughly.

#### 2B. Port Each Step

For each step, translate the HTML/CSS/JS into React + Tailwind + shadcn:

**TypeStep:** 3x2 grid of survey type cards. On select → rebuild flow. Use shadcn Card components. Port the `selectType()` + `rebuildFlow()` logic.

**AudienceStep:** Two-phase selection (mode → specific audience). Integrate with Merlin's existing `useAudiences` hook. Keep the interaction model's adaptive headers (`audienceHeaders` object).

**StimulusStep:** File upload zone (drag-and-drop), thumbnail cards for uploaded items, remove buttons. Port `simulateStimulusStep()`. For the prototype, use the pre-loaded stimulus assets from mock data rather than actual file upload.

**QuestionsGateway:** Three method cards (AI, Manual, Template). AI path shows the describe-or-upload layout. Connect the AI path to Merlin's existing research generation service for question generation.

**QuestionsEditor:** Two-panel layout using `react-resizable-panels` (already in Merlin's deps). Left panel: question list with drag-to-reorder. Right panel: question editor canvas with type dropdown, text input, answer options, settings. Port drag-and-drop from HTML5 to React DnD or native handlers.

**PreviewStep:** Full survey summary. All questions with type badges, stimulus preview, audience breakdown, AI review. "Launch survey" CTA navigates to results view (with mock data) or saves as draft.

#### 2C. Design System Alignment

See **Appendix: Unified Design System Spec** at the end of this document for the full token changes and component patterns. The design system applies globally across the entire app (chat, builder, results — all views), not scoped per-view.

---

### Phase 3: FindingsCanvas — Universal Results Component

**Objective:** Replace Merlin's current InlineCanvas with FindingsCanvas as the single results output format, used everywhere: inline in chat, in project detail views, and in standalone results pages.

#### 3A. Core Concept: Findings in Chat

FindingsCanvas is a **grouped inline component** that renders directly in the conversation stream, just like InlineCanvas does today. The key difference: it uses the interaction model's per-question editorial layout instead of the current chart-only pattern.

**How it works in chat:**

When a research query returns results, they appear as a FindingsCanvas group inline in the conversation. The number of findings depends on the query:

- **Multi-question survey results** (e.g. a concept test with 8 questions) → A grouped FindingsCanvas containing all 8 findings, rendered as a cohesive card group in the chat. The group has a header (survey name / query summary) and the findings stack vertically within it.

- **Single-question query** (e.g. "What do Gen Z think about sustainability?") → A FindingsCanvas with just 1 finding. Still uses the same component, but the group contains a single card. Feels light and natural in the chat flow.

- **Follow-up question** → Produces its own FindingsCanvas (1 or more findings) further down the chat. Each response is its own group — they don't merge with previous ones.

The conversation becomes a scroll of: user message → AI thinking/process → FindingsCanvas group → user message → FindingsCanvas group → etc.

#### 3B. FindingsCanvas Components

```
components/results/
  FindingsCanvas.tsx         // Grouped container — renders N findings as a unit
  FindingCard.tsx            // Single finding (headline + insight + chart + segments)
  EditableInsight.tsx        // AI insight text with edit/save toggle
  SegmentBreakdown.tsx       // Per-segment comparison bars
  FindingsHeader.tsx         // Group header: survey name, type badge, finding count
```

**FindingsCanvas** (the group):
- Wraps 1-N FindingCards in a single bordered container
- Has a header row: query summary or survey name, type badge, count ("3 findings")
- Can be collapsed/expanded (collapsed shows just header + top-line stats)
- Has an "Expand" action to open in full-page view (replaces current ExpandedCanvas)
- Has a "Save to Project" action

**FindingCard** (individual finding):
- Left zone: Headline stat in `stat-lg` (e.g. "67%") + `label-caps` descriptor ("prefer Concept A") + editable AI narrative paragraph
- Right zone: Recharts visualisation (bar chart, comparison, heatmap — type depends on question type) + optional segment breakdown bars below
- Compact variant for inline-chat (less padding, smaller chart) vs. expanded variant for full-page view

**Inline vs. Expanded:**
- In chat: FindingsCanvas renders at the width of the conversation column (~600-700px). FindingCards stack vertically. Charts are compact.
- Expanded (full page): Same component, more breathing room. Charts get larger. Segment breakdowns can show more detail. Tabs appear for Per Question / Full Report / Segments views.

#### 3C. Replacing InlineCanvas

FindingsCanvas replaces InlineCanvas entirely. The existing Canvas data model gets a thin adapter:

```typescript
// Adapter: convert existing Canvas → Finding[]
function canvasToFindings(canvas: Canvas): Finding[] {
  // Map each canvas section/chart to a Finding
  // Headline comes from canvas summary stat
  // Chart data passes through (already Recharts-compatible)
  // AI insight comes from canvas narrative text
}
```

This means the existing chat flow (query → AI generates Canvas) still works — the Canvas data just gets rendered through FindingsCanvas instead of InlineCanvas. No changes needed to the research generation services.

For the builder flow, surveys produce findings directly (no Canvas intermediate). Both paths feed into the same rendering component.

#### 3D. Populate with Mock Data Charts

Use the Vodafone results charts as reference data to create realistic Recharts visualisations. The 68 chart PNGs from `Stimulus_Extracted/Vodafone_Results_Charts/` show the exact chart formats to replicate:
- Horizontal bar charts (concept comparison)
- Stacked segment bars
- Heatmap tables
- Summary cards with key metrics

Create chart data structures in the Vodafone project mock data that render these patterns in Recharts.

#### 3E. Full-Page View Tabs

When FindingsCanvas is expanded to full page, add tab navigation:
- **Per Question:** Scroll of FindingCards (default)
- **Full Report:** AI-generated roll-up summary across all findings
- **Segments:** Side-by-side segment comparison view

---

### Phase 4: Project Detail View & Data Population

**Objective:** Create the "here's what a completed project looks like" showcase view.

#### 4A. Project Detail Component

Create `components/ProjectDetail.tsx`:

- **Header:** Project name, brand, survey type, status, dates
- **Stimulus Gallery:** Grid of stimulus thumbnails (BP creatives, Vodafone concept cards, Disney key art) with lightbox expand
- **Survey Overview:** Question count, methodology, audience summary
- **Quick Results:** Top-line findings (3-5 headline stats)
- **Navigation:** Links to full results canvas, survey editor, conversation history

#### 4B. Pre-populated Projects

All data comes directly from `Electric_Twin_Mock_Data_Sets.xlsx` via the SheetJS parser — no manual data entry.

**Vodafone Broadband Propositions (build first — cleanest data):**
- Survey type: Concept Testing
- 10 propositions as stimulus (Market-leading WiFi, Service Promise, Speed Boost, Home Security, Connected from Day 1, Secure Net Home, Snap to Fix, Roam your Home, Take your Broadband, Home Care)
- 3 concept card images available (Snap to Fix, Home Care, Service Promise)
- 7 KPIs per proposition: Comprehension, Appeal, Relevance, Newness, Excitement, Switching Intent, Retention
- 2 segments: Tech-Savvy Families vs. General Broadband Decision-Makers
- Rich comparison data: 10 propositions × 7 KPIs × 2 segments = 140 data points

**BP Ultimate Fuels 360 Campaign:**
- Survey type: Creative Testing (Ad Pre-Testing)
- 4 OOH creative variants as stimulus (Route 1 A/B, Route 2 A/B) — all 4 image assets available
- 14 questions covering: Stop & Look, Interestingness, Likeability, Involvement, Branding, Persuasion, Message Stickiness (5 messages), Relevance, Credibility, Distinctiveness, Affinity
- 17 metrics per variant with percentiles vs. market norms
- 7-point lifestyle segmentation defined

**Disney+ Alice & Steve Key Art:**
- Survey type: Creative Testing (Key Art, Monadic)
- 3 key art versions as stimulus (Character, Ensemble, Stylised)
- 14 questions covering: Likeability, Intent to View, Talent Recognition, Perceived Plot, Format Perception, Service Attribution, 20 attribute associations, Genre Classification, Gender/Age Appeal, Artwork Preference, Subscription Impact
- 19 metrics per version + attribute maps + genre distributions
- Post-synopsis preference data

**Philips Pain Relief Device:**
- Survey type: Concept Testing (Product, unpriced + priced)
- 7 KPIs: Relevance, Distinctiveness, Advantages, Purchase Intent (unpriced), Brand Fit, Purchase Intent (priced), Value for Money
- Mean scores + T2B% + category norm benchmarks

**Candy Crush IP Mapping (5th case):**
- Survey type: Audience Exploration (IP Partnership Fit)
- 3 segments: Current Players, Lapsed Players, Non-Players (n=1,000 each)
- MaxDiff methodology for preference ranking
- IP perception and partnership fit data

#### 4C. Chat-to-Project Continuity

When someone runs a research query via the Merlin chat interface, the resulting Canvas should be saveable to a project. Add:
- "Save to Project" action on InlineCanvas/ExpandedCanvas
- New canvases appear in the relevant project's detail view
- This bridges the chat flow and the project/builder flow

---

### Phase 5: Entry Points & Flow Integration

**Objective:** Make both creation paths (chat and builder) accessible and connected.

#### 5A. Two "New Research" Paths

From the sidebar or dashboard, offer two entry points:

1. **"Ask a question"** → Opens the chat interface (existing Merlin). User types a research query, AI generates results. Fast, exploratory, agentic.

2. **"Build a survey"** → Opens the builder (new). User goes through the structured Type → Audience → Stimulus → Questions → Preview flow. Methodical, precise, hands-on.

Both paths can produce results that live within a project.

#### 5B. Builder ↔ Chat Crossover

In the builder's Questions step (AI method), connect to Merlin's `researchGenerator` service. When the user describes objectives:
- Use `toolSelector.ts` to determine appropriate question types
- Use `toolExecutor.ts` (or a new question generation service) to generate survey questions
- Populate the question editor with AI-generated questions

In the chat, add the ability to "convert to structured survey" — take a Canvas result and open it in the builder for refinement.

#### 5C. Navigation Polish

- Sidebar: Projects section (expandable), recent conversations, audiences
- Breadcrumbs in builder: "Projects > Vodafone > Concept Test > Builder"
- Back navigation between views
- Deep links to specific project/survey/results views

---

## Implementation Order & Dependencies

```
Phase 1A (Navigation)
  └→ Phase 1B (Data Model)
       └→ Phase 1C (Mock Data)    ← most labour-intensive
            └→ Phase 1D (Dashboard)
                 └→ Phase 4 (Project Detail + Data Population)

Phase 2A (Builder Shell)
  └→ Phase 2B (Port Steps)    ← most complex
       └→ Phase 2C (Design System)

Phase 3A (Findings View)
  └→ Phase 3B (Chart Data)
       └→ Phase 3C (Result Tabs)

Phase 5 (Integration)    ← depends on Phases 1-4
```

**Suggested execution order for maximum demo impact:**

1. **Phase 1A + 1B** — Navigation + data model (1-2 days). Gets the skeleton in place.
2. **Phase 1C + 1D** — Mock data + dashboard (2-3 days). Now you have something to show: "here are projects with real data."
3. **Phase 3A + 3B** — Findings canvas + chart data (2 days). Populate results views with Vodafone/BP data.
4. **Phase 4** — Project detail view (1-2 days). Full showcase: click a project, see everything.
5. **Phase 2A + 2B** — Builder shell + step ports (3-5 days). The structured creation flow.
6. **Phase 2C** — Design polish (1 day). Tighten the visual system.
7. **Phase 5** — Integration + crossover (2-3 days). Wire everything together.

**Total estimate: 12-18 days** for a working demo prototype (not production).

---

## Key Risks & Decisions

### Risk: Builder Port Scope

The interaction model's HTML has ~2,700 lines of tightly-coupled HTML/CSS/JS. Porting to React means decomposing into ~15-20 components with proper state management. The question editor (drag-to-reorder, per-question settings, type switching) is the most complex piece.

**Mitigation:** Start with TypeStep and PreviewStep (simplest), then tackle the editor. Use `react-resizable-panels` (already a dependency) for the two-panel layout. Keep the first pass functional but visually rough — polish in Phase 2C.

### Risk: Mock Data Parsing

The Excel workbook has complete numeric data but each sheet uses a different layout (BP has variant-per-column, Vodafone has proposition-per-row, etc.). The SheetJS parser needs a per-sheet transform function.

**Mitigation:** The data is already structured and numeric — no guessing from chart images needed. Write one transform function per sheet. Start with Vodafone (cleanest tabular layout: 10 propositions × 7 KPIs × 2 segments) and BP (4 variants × 17 metrics). These two cover the richest demo data. Disney and Philips are simpler (fewer metrics, fewer variants). Candy Crush adds a 5th case with MaxDiff methodology — do it last.

### Decision: Design System (RESOLVED)

Unified monochrome minimal theme across the entire app. Keeps Merlin's border-radius and shadow approach but strips all colour tint to pure grayscale. Uses interaction model's button patterns and typography. Background-colour change for selection states (not top-border). CardGrid pattern for builder type/method grids. Full spec in appendix.

### Decision: Results View (RESOLVED)

**FindingsCanvas is the single output format everywhere.** It renders inline in chat as a grouped component — a survey with 3 findings shows a group of 3 FindingCards; a single-question query shows a group of 1. Each response in the chat is its own FindingsCanvas group. InlineCanvas gets replaced entirely, with a thin adapter layer to convert existing Canvas data into Finding objects. Same component works in chat (compact), project detail, and expanded full-page view.

### Decision: Routing

Current Merlin uses `useState` for view switching (no URL routing). For a prototype this is fine. But adding builder steps means deeper navigation.

**Recommendation:** Keep `useState` for now. Add a simple `activeStep` state for builder navigation. If the prototype grows toward production, adopt `react-router` later.

---

## File Changes Summary

### New Files (~25-30)
```
components/Dashboard.tsx
components/ProjectDetail.tsx
components/builder/SurveyBuilder.tsx
components/builder/BuilderSidebar.tsx
components/builder/BuilderActionBar.tsx
components/builder/steps/TypeStep.tsx
components/builder/steps/AudienceStep.tsx
components/builder/steps/StimulusStep.tsx
components/builder/steps/QuestionsGateway.tsx
components/builder/steps/QuestionsEditor.tsx
components/builder/steps/PreviewStep.tsx
components/results/FindingsCanvas.tsx      // Grouped container (replaces InlineCanvas)
components/results/FindingCard.tsx         // Single finding card
components/results/EditableInsight.tsx
components/results/SegmentBreakdown.tsx
components/results/FindingsHeader.tsx
components/ui/card-grid.tsx                // CardGrid for builder grids
hooks/useSurveyBuilder.ts
types/survey.ts
types/finding.ts
data/projects/parseExcel.ts    // SheetJS parser
data/projects/transforms.ts   // Per-sheet transform functions
data/projects/index.ts         // Exports parsed projects
public/assets/stimulus/        // Copied image assets (bp/, vodafone/, disney/)
public/assets/Electric_Twin_Mock_Data_Sets.xlsx  // Source Excel
```

### Modified Files (~8-10)
```
App.tsx                    (navigation, new views, state)
components/layout/AppSidebar.tsx  (new nav items)
types/index.ts             (re-exports)
data/mockData.ts           (extend with project references)
components/QueryInput.tsx  (optional: save-to-project)
components/InlineCanvas.tsx (REMOVE — replaced by FindingsCanvas)
components/ExpandedCanvas.tsx (REMOVE — replaced by FindingsCanvas expanded view)
components/WorkingPane.tsx (update to render FindingsCanvas instead of InlineCanvas)
tailwind.config.js         (add Cabinet Grotesk font, monochrome tokens)
index.html                 (add font imports)
```

---

## What Success Looks Like

When this is done, you can walk someone through the prototype and show:

1. **"Here are our projects"** — Dashboard with BP, Vodafone, Disney, Philips cards
2. **"Let me show you a completed project"** — Click Vodafone → see concept cards, audience, questions, methodology, findings with real-looking charts and AI insights
3. **"Here's how you'd create one with the builder"** — Click "New Survey" → walk through Type (Concept Testing) → Audience → Stimulus upload → AI generates questions → Preview → Launch
4. **"Or you can just ask a question"** — Switch to chat → type "What do Gen Z think about sustainability?" → watch the research process → see results
5. **"And the results look like this"** — Click into findings → per-question insights with editable AI narratives, segment breakdowns, charts

That's the demo.

---

## Appendix: Unified Design System Spec

A single monochrome minimal theme applied globally across chat, builder, and results views. No per-view scoping — the whole app looks and feels the same.

### Guiding Principles

1. **Monochrome palette** — Strip all blue/purple chroma from Merlin's tokens. Pure grayscale everywhere. Colour only for meaning (status, sentiment, segment comparison, brand charts).
2. **Keep Merlin's radius** — Soft corners stay (`--radius: 0.375rem`). Cards, buttons, inputs, dialogs all retain their current border-radius values.
3. **Keep Merlin's shadows** — The shadow scale (`--shadow-xs` through `--shadow-2xl`) stays. Cards use `shadow-sm`. Popovers/dropdowns use `shadow-lg`. This gives depth without adding colour.
4. **Background-colour selection** — Selected/active items use a background fill change (e.g. `--selected-bg` / `--accent`), not a top-border or left-border pattern.
5. **Interaction model buttons** — Solid black primary, white outline secondary.
6. **Interaction model typography** — Inter body, Cabinet Grotesk display, plus the `label-caps` pattern for section headings.
7. **CardGrid for builder grids** — Seamless 1px-gap grid pattern for type selection, method selection, and similar card grids in the builder.

---

### 1. Colour Tokens — `globals.css` `:root`

Strip chroma (second OKLCH value → 0) on all base tokens. Keep lightness values close to current to preserve the existing contrast ratios and hierarchy.

```css
:root {
  /* ── Core ── */
  --background:           oklch(1.00 0 0);      /* #FFFFFF — white */
  --foreground:           oklch(0.15 0 0);       /* ~#111 — near-black */

  --card:                 oklch(1.00 0 0);       /* white */
  --card-foreground:      oklch(0.15 0 0);       /* near-black */

  --popover:              oklch(1.00 0 0);       /* white */
  --popover-foreground:   oklch(0.15 0 0);       /* near-black */

  /* ── Primary: solid black ── */
  --primary:              oklch(0.15 0 0);       /* #111 — used for primary buttons, active rings */
  --primary-foreground:   oklch(1.00 0 0);       /* white */

  /* ── Secondary: light gray surface ── */
  --secondary:            oklch(0.96 0 0);       /* ~#F0F0F0 */
  --secondary-foreground: oklch(0.30 0 0);       /* ~#444 */

  /* ── Muted: off-white surface, mid-gray text ── */
  --muted:                oklch(0.98 0 0);       /* ~#FAFAFA */
  --muted-foreground:     oklch(0.45 0 0);       /* ~#666 */

  /* ── Accent: hover/selection surface ── */
  --accent:               oklch(0.96 0 0);       /* ~#F5F5F5 — selected bg, hover fill */
  --accent-foreground:    oklch(0.15 0 0);       /* near-black */

  /* ── Destructive: keep red (colour-for-meaning) ── */
  --destructive:          oklch(0.64 0.21 25);   /* stays red */
  --destructive-foreground: oklch(1.00 0 0);     /* white */

  /* ── Borders: pure gray ── */
  --border:               oklch(0.90 0 0);       /* ~#E5E5E5 — matches interaction model --rule */
  --input:                oklch(0.90 0 0);       /* same as border */
  --ring:                 oklch(0.15 0 0);       /* black focus ring */

  /* ── Chart colours: grayscale default, override per-brand ── */
  --chart-1:              oklch(0.25 0 0);       /* near-black */
  --chart-2:              oklch(0.40 0 0);       /* dark gray */
  --chart-3:              oklch(0.55 0 0);       /* mid gray */
  --chart-4:              oklch(0.70 0 0);       /* light gray */
  --chart-5:              oklch(0.85 0 0);       /* very light gray */

  /* ── Sidebar: matches core ── */
  --sidebar:              oklch(0.98 0 0);       /* off-white, same as --muted */
  --sidebar-foreground:   oklch(0.35 0 0);       /* mid-dark gray */
  --sidebar-primary:      oklch(0.15 0 0);       /* black */
  --sidebar-primary-foreground: oklch(1.00 0 0); /* white */
  --sidebar-accent:       oklch(0.96 0 0);       /* light gray hover */
  --sidebar-accent-foreground: oklch(0.15 0 0);  /* near-black */
  --sidebar-border:       oklch(0.90 0 0);       /* matches --border */
  --sidebar-ring:         oklch(0.15 0 0);       /* black */

  /* ── Semantic surfaces ── */
  --surface-primary:      var(--background);
  --surface-secondary:    var(--muted);
  --surface-elevated:     var(--card);
  --surface-overlay:      oklch(0 0 0 / 0.5);

  /* ── Semantic text ── */
  --text-primary:         var(--foreground);
  --text-secondary:       var(--muted-foreground);
  --text-muted:           oklch(0.65 0 0);       /* ~#AAA — matches interaction model --light */
  --text-inverse:         var(--primary-foreground);
  --text-link:            var(--primary);         /* black links, not blue */

  /* ── Semantic borders ── */
  --border-default:       var(--border);
  --border-subtle:        oklch(0.95 0 0);       /* very faint */
  --border-strong:        oklch(0.70 0 0);       /* visible divider */

  /* ── Status: KEEP COLOURED (colour-for-meaning) ── */
  --status-success:       oklch(0.65 0.17 145);
  --status-success-subtle: oklch(0.95 0.04 145);
  --status-warning:       oklch(0.75 0.15 75);
  --status-warning-subtle: oklch(0.95 0.04 75);
  --status-error:         oklch(0.64 0.21 25);
  --status-error-subtle:  oklch(0.95 0.04 25);
  --status-info:          oklch(0.55 0.12 260);
  --status-info-subtle:   oklch(0.95 0.03 260);

  /* ── Sentiment: KEEP COLOURED (colour-for-meaning) ── */
  --sentiment-positive:       oklch(0.65 0.17 145);
  --sentiment-positive-subtle: oklch(0.95 0.04 145);
  --sentiment-negative:       oklch(0.64 0.21 25);
  --sentiment-negative-subtle: oklch(0.95 0.04 25);
  --sentiment-neutral:        oklch(0.70 0 0);
  --sentiment-neutral-subtle: oklch(0.95 0 0);
  --sentiment-mixed:          oklch(0.75 0.15 75);
  --sentiment-mixed-subtle:   oklch(0.95 0.04 75);

  /* ── Brand: slot colours, override per-client ── */
  /* Keep as-is — these are intentionally coloured for client branding */
  --brand-primary:   #2768E3;
  --brand-secondary: #1BD571;
  --brand-tertiary:  #E32768;
  --brand-quaternary:#D5711B;

  /* ── Radius: KEEP AS-IS from Merlin ── */
  --radius: 0.375rem;

  /* ── Shadows: KEEP AS-IS from Merlin ── */
  --shadow-xs:  0 1px 3px 0px hsl(0 0% 0% / 0.05);
  --shadow-sm:  0 1px 3px 0px hsl(0 0% 0% / 0.10), 0 1px 2px -1px hsl(0 0% 0% / 0.10);
  --shadow-md:  0 1px 3px 0px hsl(0 0% 0% / 0.10), 0 2px 4px -1px hsl(0 0% 0% / 0.10);
  --shadow-lg:  0 1px 3px 0px hsl(0 0% 0% / 0.10), 0 4px 6px -1px hsl(0 0% 0% / 0.10);
  --shadow-xl:  0 1px 3px 0px hsl(0 0% 0% / 0.10), 0 8px 10px -1px hsl(0 0% 0% / 0.10);
  --shadow-2xl: 0 1px 3px 0px hsl(0 0% 0% / 0.25);
}
```

**Dark mode:** Apply the same principle — strip chroma, keep existing lightness inversions. Dark mode tokens stay functional, just desaturated.

---

### 2. Font Stack

```css
:root {
  --font-sans:    'Inter', ui-sans-serif, system-ui, -apple-system, sans-serif;
  --font-display: 'Cabinet Grotesk', ui-sans-serif, system-ui, -apple-system, sans-serif;
  --font-mono:    'JetBrains Mono', monospace;
  --font-serif:   'Arbutus Slab', ui-serif, serif;  /* keep for occasional use */
}
```

**Changes in `index.html`:**
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
<link href="https://fonts.cdnfonts.com/css/cabinet-grotesk" rel="stylesheet">  <!-- already present -->
```

**Geist removal:** Remove the `geist` npm dependency or keep as fallback. Inter becomes the primary body font globally.

---

### 3. Typography Additions

Add to `globals.css` or as Tailwind plugin in `tailwind.config.js`:

```css
/* Label-caps pattern from interaction model */
.label-caps {
  font-size: 0.625rem;       /* 10px */
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--muted-foreground);
}

/* Stat-large pattern for findings headlines */
.stat-lg {
  font-family: var(--font-display);
  font-size: 2rem;           /* 32px */
  font-weight: 700;
  line-height: 1.1;
  color: var(--foreground);
}
```

**Tailwind config addition:**
```js
fontSize: {
  '2xs': ['0.625rem', { lineHeight: '1rem' }],  // 10px — for label-caps
}
```

**Usage guide:**
- `label-caps` → section headers, column labels, sidebar step labels, metadata captions, tag text
- `stat-lg` → finding headline numbers, dashboard summary metrics
- `font-display` (Cabinet Grotesk) → page titles, section headings, large stats
- `font-sans` (Inter) → everything else

---

### 4. Button Variants

Adopt the interaction model's button patterns, implemented as shadcn Button variants:

```tsx
// In components/ui/button.tsx — variant updates
const buttonVariants = cva(
  "inline-flex items-center justify-center ...",
  {
    variants: {
      variant: {
        // PRIMARY: Solid black, white text
        default: "bg-foreground text-background hover:bg-foreground/90",

        // SECONDARY/OUTLINE: White bg, gray border, darkens on hover
        outline: "border border-border bg-background text-foreground hover:bg-accent hover:border-foreground/30",

        // GHOST: No border, subtle bg on hover
        ghost: "hover:bg-accent text-foreground",

        // DESTRUCTIVE: Keep as-is (red, colour-for-meaning)
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",

        // LINK: Black underline, not blue
        link: "text-foreground underline-offset-4 hover:underline",

        // SECONDARY: Light gray fill
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
      },
      // ... sizes stay as-is
    }
  }
)
```

Key change: the `default` (primary) variant uses `bg-foreground` (black) instead of `bg-primary` — in the new token set these are the same value, but using `foreground` makes the intent clear: the primary button is always the darkest element.

---

### 5. Selection & Active States

**Pattern:** Background fill, not borders. Selected items get `bg-accent` (light gray fill) or `bg-foreground text-background` (inverted, for strong selection).

| Context | Unselected | Hovered | Selected |
|---------|-----------|---------|----------|
| Card in grid (type, method) | `bg-background border-border` | `bg-accent` | `bg-accent border-foreground/20` |
| Sidebar nav item | transparent | `bg-sidebar-accent` | `bg-sidebar-accent font-medium` |
| Builder step (sidebar) | `text-muted-foreground` | — | `text-foreground font-semibold` + filled step dot |
| Question in list | `bg-background` | `bg-accent` | `bg-accent border-l-2 border-foreground` |
| Tab | `text-muted-foreground` | `text-foreground` | `text-foreground border-b-2 border-foreground` |

Exception for tabs: a bottom-border underline is standard and expected. This is a structural indicator, not decorative.

---

### 6. CardGrid Component (New)

For the builder's type selection (3×2 grid) and method selection (1×3 grid), use a seamless gap-as-border pattern:

```tsx
// components/ui/card-grid.tsx
interface CardGridProps {
  columns?: number
  children: React.ReactNode
}

export function CardGrid({ columns = 3, children }: CardGridProps) {
  return (
    <div
      className="grid rounded-lg border border-border overflow-hidden"
      style={{
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
        gap: '1px',
        backgroundColor: 'var(--border)',  // gap colour = border colour
      }}
    >
      {children}
    </div>
  )
}

export function CardGridItem({ children, selected, onClick }: { ... }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "bg-background p-6 text-left transition-colors",
        "hover:bg-accent",
        selected && "bg-accent"
      )}
    >
      {children}
    </button>
  )
}
```

Result: a clean grid where the 1px gaps form the internal dividers and the outer `border-border` wraps it. Individual cells have no borders — the gap background provides the visual separation. Rounded corners on the outer container only.

---

### 7. Shadows — Where They Apply

Shadows stay from Merlin but are used intentionally:

| Element | Shadow | Why |
|---------|--------|-----|
| Card (at rest) | `shadow-sm` | Subtle lift from page |
| Card (hover/interactive) | `shadow-md` | Feedback on interaction |
| Popover / Dropdown | `shadow-lg` | Floats above content |
| Dialog overlay content | `shadow-xl` | Modal prominence |
| Bottom action bar | `shadow-md` (inverted, shadow-top) | Separates from scroll content |
| CardGrid | none | Grid uses border, not shadow |
| Sidebar | none | Adjacent panel, no lift needed |

---

### 8. Files to Change

| File | Change | Effort |
|------|--------|--------|
| `src/globals.css` | Replace all `:root` colour tokens (strip chroma), swap `--font-sans` to Inter | Medium — ~50 lines of token swaps |
| `index.html` | Add Inter font import (Google Fonts) | Trivial |
| `tailwind.config.js` | Add `text-2xs` font size, verify `font-display` mapping | Small |
| `components/ui/button.tsx` | Update variant colours (`bg-foreground` for primary, border approach for outline) | Small |
| `components/ui/card.tsx` | Verify `shadow-sm` looks right with grayscale tokens (likely no change needed) | Verify only |
| `components/ui/sidebar.tsx` | Sidebar active state: ensure `bg-sidebar-accent` pattern, remove any coloured highlights | Small |
| `components/ui/input.tsx` | Verify focus ring uses `--ring` (now black) | Verify only |
| `components/ui/dialog.tsx` | Verify overlay and shadow | Verify only |
| `components/ui/badge.tsx` | Verify badge variants work with grayscale | Verify only |
| **New:** `components/ui/card-grid.tsx` | CardGrid + CardGridItem components | New component |
| **New:** add `.label-caps` and `.stat-lg` to `globals.css` | Typography utilities | Small addition |

**Estimated effort for design system pass:** Half a day for token changes + component verification, plus the new CardGrid component. Most of the work is the `globals.css` token swap — everything else flows from there because Merlin already uses CSS custom properties throughout.

---

### 9. What Stays Coloured

To be clear, these elements keep their colour — they represent meaning, not decoration:

- **Status indicators:** success (green), warning (amber), error (red), info (blue)
- **Sentiment analysis:** positive/negative/neutral/mixed in research results
- **Brand slot colours:** `--brand-primary` through `--brand-quaternary` for per-client chart theming
- **Segment comparison:** When comparing audience segments in charts, use the brand colour slots or a curated multi-hue palette
- **Destructive actions:** Red for delete/remove/danger
- **Chart data:** When showing results, brand colours or a defined multi-tone palette (the grayscale chart defaults are a starting point — swap to brand colours per project)

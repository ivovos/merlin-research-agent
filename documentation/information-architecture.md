# Merlin — Information Architecture & Key Flows

## Executive Summary

Merlin is a synthetic research agent that simulates market research using LLMs. Users ask natural-language questions and get survey, focus group, and other research results in seconds.

### What the app does

The app has **4 screens**, **5 overlays**, and **5 core research methods** with a catalogue of activity types and templates built on top of them. Everything centres on a chat-based workspace where users converse with an AI agent to design, run, and refine synthetic research studies.

### Screens at a glance

| Screen | Purpose |
|---|---|
| [Home](#22-screen-map) | Landing page with a hero input bar and method shortcuts |
| [Project Chat](#flow-1-conversational-research-primary-path) | The core workspace — a chat thread where research is run, results appear inline, and follow-ups refine the research |
| [Audiences](#flow-6-audience-management) | Browse and explore synthetic audience panels, then kick off research scoped to a specific audience |
| [Stimulus Library](#flow-10-stimulus-library) | Browse, manage, and organise creative assets (images, ads, packaging, concepts) used as stimuli across research studies |

### Key overlays

| Overlay | Purpose |
|---|---|
| [Create Survey Modal](#flow-4-survey-builder-manual-study-design) | Gateway dialog: create from scratch, import existing, or pick from org/common templates |
| [Survey Builder](#flow-4-survey-builder-manual-study-design) | Full-page step-by-step study designer (type → audience → stimulus → questions → review) |
| [Quick Poll](#flow-5-quick-poll) | Fast-track single-question builder |
| [Study Plan Overlay](#flow-2-complex-study-plan-approval) | Review the research design before or after execution |
| [Methods Picker](#4-research-methods-catalogue) | Searchable catalogue of all 22 research methods |

### Core flows

| # | Flow | Description |
|---|---|---|
| 1 | [Conversational Research](#flow-1-conversational-research-primary-path) | **Primary path.** User types a question → agent plans → executes → results appear inline in chat |
| 2 | [Complex Plan Approval](#flow-2-complex-study-plan-approval) | Agent pauses on complex queries to show a plan card for user approval before running |
| 3 | [Clarification Loop](#flow-3-clarification-loop) | Agent asks for more detail when a query is ambiguous |
| 4 | [Survey Builder](#flow-4-survey-builder-manual-study-design) | Manual step-by-step study design via the Create Survey Modal and Builder |
| 5 | [Quick Poll](#flow-5-quick-poll) | Lightweight path for single-question pulse checks |
| 6 | [Audience Management](#flow-6-audience-management) | Browse audience panels, view details, ask a question scoped to that audience |
| 7 | [Segment Drill-Down](#flow-7-segment-drill-down-follow-up-scoping) | Click a chart bar → segment pill appears in input → follow-up is scoped to that segment |
| 8 | [Project Management](#flow-8-project-management) | Create, switch, delete projects; switch accounts |
| 9 | [Results Interaction](#flow-9-results-interaction) | Expand charts, edit insights, view plan, copy/download findings |
| 10 | [Stimulus Library](#flow-10-stimulus-library) | Browse, upload, and manage creative assets; attach stimuli to studies from a central library |

### Data model (one-liner)

An **Account** owns **Projects**, each Project is a chat thread containing **Messages** and research **Studies** (with **Findings**). **Audiences** and **Stimuli** are shared account-level assets — audience panels of synthetic personas and creative assets (images, ads, concepts) respectively — used across studies. [Full model →](#3-data-model-simplified)

### Templates (one-liner)

Templates are pre-built research activities — each one packages a specific **method** (e.g. Creative Testing, Message Test, Focus Group) with a ready-made questionnaire. They come in two tiers: **ET templates** (platform defaults available to all orgs) and **org templates** (custom templates created by/for a specific organisation like Disney or Vodafone). [Full details →](#5-templates)

### Terminology note

The top-level container in the app is a **Project** (visible in the sidebar, each with its own chat thread). A project is sometimes referred to as a **study** in product thinking — the two terms are interchangeable at this level. Within a project/study, individual research runs are called **studies** in the data model (i.e. each survey or focus group execution). The main workspace screen is called **Project Chat**.

### AI pipeline (one-liner)

User query (+ full conversation context) → **Understand question** → **Identify/create audience** → **Choose method** → **Check for stimulus** (use from context or ask) → **Write study plan** → **Complexity check** (simple = run, complex = plan card) → **Execute** → **Findings** rendered in chat → context carries forward for follow-ups. [Full pipeline →](#7-ai-agent-pipeline)

---

## 2. Application Structure

### 2.1 Global Shell

The persistent chrome that wraps all screens.

| Element | Description |
|---|---|
| **App Sidebar** | Collapsible left panel. Contains: account switcher (brand/agency), "Home" link, project list (sorted by recency), "Audiences" link, and settings. |
| **Theme Toggle** | Dev/debug utility in the top-right corner for switching light/dark themes. |

### 2.2 Screen Map

```
App
├── Home                          ← Landing / new-session screen
├── Project Chat                  ← Core research workspace (one per project)
│   ├── Chat Stream               ← Scrollable message thread
│   │   ├── User Messages
│   │   ├── AI Messages (with collapsible thinking)
│   │   ├── System Messages
│   │   ├── Findings Messages     ← Inline results cards
│   │   ├── Plan Cards            ← Approve/review before complex studies
│   │   ├── Deliverable Cards
│   │   └── Attachment Previews
│   ├── Chat Input Bar            ← Text input + @audience picker + method picker + attachments
│   └── Process Steps indicator   ← Animated progress during simulation
│
├── Audiences List (overlay)      ← Searchable table of all audience panels
│   └── Audience Detail (overlay) ← Single audience profile + "ask a question" input
│
├── Stimulus Library (overlay)    ← Browse, upload, and manage creative assets
│   └── Stimulus Detail (overlay) ← Single asset preview + metadata + usage history
│
├── Create Survey Modal (dialog)   ← Choose how to start: scratch, import, or template
│   ├── "Create from scratch"     ← Blank survey
│   ├── "Import existing"         ← Import from brief/document
│   └── Template gallery          ← Org-specific + common templates, filterable by category
│
├── Survey Builder (overlay)      ← Full-page multi-step study designer
│   ├── Step 1: Type              ← Choose research method type
│   ├── Step 2: Audience          ← Select target audiences/segments
│   ├── Step 3: Stimulus          ← Upload creative assets to test
│   ├── Step 4: Questions         ← Build/edit questionnaire (pre-populated if from template)
│   └── Step 5: Review            ← Summary + launch
│
├── Quick Poll (overlay)          ← Lightweight single-question builder
│   ├── Audience selector
│   ├── Question editor
│   └── Launch footer
│
└── Study Plan Overlay            ← Review study design post-run or pre-approval
```

### 2.3 Overlay Hierarchy

Overlays stack in a defined priority order. Only one overlay is visible at a time; deeper overlays replace the previous one rather than layering on top.

```
Priority (highest wins):
1. Quick Poll           (full-page, z-50)
2. Survey Builder       (full-page, z-50)
3. Audience Overlay     (replaces main content area)
4. Create Survey Modal  (dialog, rendered outside sidebar layout)
5. Study Plan Overlay   (modal over Project Chat)
6. Methods Picker       (portal lightbox, any screen)
7. Findings Lightbox    (expanded view of a single chart)
```

---

## 3. Data Model (Simplified)

```
Account (brand or agency)
 └── ProjectState[]
      ├── name, brand, messages[]
      ├── studies[] (Survey)
      │    ├── type, questions[], audiences[], stimuli[]
      │    └── findings[] (charts/insights)
      └── ChatMessage[]
           ├── user | ai | system | findings | plan | deliverable | attachment
           └── (findings messages reference a studyId)

Audience / AudienceDetails
 ├── name, description, agents (count), segments[]
 └── data sources, demographics breakdown

Stimulus (account-level asset library)
 ├── name, type (image, video, document, concept)
 ├── thumbnail, file reference
 ├── tags[], category
 └── usage history (which studies have used this asset)

TemplateConfig (survey templates)
 ├── key, label, icon, surveyType
 ├── category: marketing | product | brand | audience
 ├── creatorLabel (org branding, e.g. "Created by Disney UK")
 ├── questions[] (pre-built question sets)
 └── sourced from: per-account templates + common templates

Canvas / Report (API response artifact)
 ├── type: quantitative | qualitative
 ├── questions[] with options & segment breakdowns
 └── themes[] with sentiment & verbatims
```

---

## 4. Research Methods & Activity Types

### 4.1 Core Methods (Survey Types)

There are **5 core research methods** in the data model. Every research activity maps to one of these underlying survey types, which determine the question types available, whether stimulus material is required, and how results are rendered.

| Survey Type | Label | Description | Needs Stimulus |
|---|---|---|---|
| `simple` | Quick Question | Fast feedback on a single topic or question | No |
| `audience_exploration` | Audience Exploration | Deep-dive into audience attitudes and behaviours | No |
| `concept` | Proposition Testing | Test product concepts, ideas, or propositions | Yes |
| `message` | Message Testing | Test messaging, claims, and copy | Yes |
| `creative` | Creative Testing | Test ads, designs, and creative assets | Yes |

### 4.2 Activity Types (Methods Picker)

The Methods Picker presents a broader catalogue of **activity types** — specific research activities that are all built on top of the 5 core methods above. Think of these as named entry points that set the right context and defaults for common research tasks. They are grouped into 6 categories:

| Category | Activity Types | Core Method |
|---|---|---|
| **Quick & Simple** | Quick Question, Survey, Focus Group | `simple` |
| **Message & Copy** | Message Test, Multivariant Message Test, Claims Testing, Naming Test | `message` |
| **Creative & Design** | Creative Testing, Ad Pre-Testing, Packaging Test, Key Art Test | `creative` |
| **Concept & Product** | Concept Testing, Proposition Testing, Feature Prioritisation, UX Testing | `concept` |
| **Audience & Brand** | Understand Audience, Audience Segmentation, Brand Tracking, Brand Perception, NPS/CSAT | `audience_exploration` |
| **Pricing & Advanced** | Pricing Research, Conjoint Analysis, MaxDiff, A/B Experiment | `simple` / varies |

Activity types are surfaced in three places: the **Home screen pill row** (curated shortcuts), the **Methods Picker** lightbox (full searchable catalogue), and the **Create Survey Modal** (as the type pre-set when starting from a template).

### 4.3 How it all connects: Methods → Activity Types → Templates

The hierarchy works like this:

- **Core method** (survey type) — the underlying data structure and execution engine (5 types)
- **Activity type** — a named research activity shown in the Methods Picker, maps to a core method (e.g. "Key Art Test" → `creative`)
- **Template** — a ready-to-run instance of an activity type, pre-loaded with a questionnaire (e.g. "Disney Key Art Questionnaire" → Key Art Test → `creative`)

---

## 5. Templates

Templates are the bridge between methods and ready-to-run studies. Each template packages a specific **method** with a **pre-built questionnaire** — so instead of designing a study from scratch, a user can pick "Key Art Questionnaire" and get a 15-question creative test ready to go.

### How templates relate to methods

A template always belongs to exactly one method/survey type. For example:

- A "Key Art Questionnaire" template → **Creative Testing** method (`creative` survey type)
- A "Message Test Survey" template → **Message Test** method (`message` survey type)
- An "Audience Segmentation" template → **Audience Exploration** method (`audience_exploration` survey type)
- A "Concept Screening" template → **Concept Testing** method (`concept` survey type)

### Two tiers of templates

| Tier | Description | Examples |
|---|---|---|
| **ET templates** (common) | Platform defaults available to every organisation. Cover the most universal research patterns. | Standard Concept Test, Quick Brand Pulse, Message Review |
| **Org templates** (custom) | Created by or for a specific organisation. Branded with the org's logo and labelled "Created by [Org]". Tailored to that org's specific products, categories, and research needs. | Disney: Key Art Questionnaire, Trailer Cut Evaluation, Media Mix Optimiser. Vodafone: Broadband Experience Tracker, Network & Coverage Pulse. BP: EV Adoption Attitudes, Fleet Decarbonisation. |

### Template categories

Templates are filterable by category in the Create Survey Modal:

| Category | What it covers |
|---|---|
| **Recent** | All templates (default view) |
| **Marketing** | Message tests, creative tests, ad pre-tests, media mix |
| **Product** | Concept tests, proposition tests, feature prioritisation |
| **Brand** | Brand pulse, brand tracking, perception studies |
| **Audience Insight** | Audience segmentation, experience tracking, needs exploration |

### Where templates appear

Templates surface in the **Create Survey Modal** as a gallery of cards. Org templates appear first (with account logo branding), followed by ET common templates. When a user picks a template, the builder opens with the survey type pre-set and all questions pre-populated — the user can then customise audiences, add stimuli, and edit questions before launching.

Organisations currently with custom templates: Disney, Vodafone, BP, Philips, King, Canva, MUBI, Wonderhood.

---

## 6. Key Flows

### Flow 1: Conversational Research (Primary Path)

The core experience — a user asks a natural-language question and gets research results.

```
Home screen
  │
  ├─ User types question in hero input bar
  │   (e.g. "Do Gen Z consumers prefer sustainable packaging?")
  │
  ▼
New project created automatically → navigate to Project Chat
  │
  ├─ User message appears in chat stream
  │
  ▼
PHASE 1 — Planning (animated process steps)
  ├─ "Analysing your question..."
  ├─ "Selecting research methodology..."
  └─ Steps complete ✓
  │
  ▼
Agent classifies the query → selects a tool
  ├─ run_survey
  ├─ run_focus_group
  ├─ run_comparison
  ├─ run_heatmap
  ├─ run_sentiment_analysis
  └─ run_message_testing
  │
  ▼
Complexity check
  ├── SIMPLE → skip to execution
  └── COMPLEX → show Plan Card (see Flow 2)
  │
  ▼
PHASE 2 — Execution (animated process steps)
  ├─ e.g. "Recruiting 500+ respondents..."
  ├─ "Collecting responses..."
  ├─ "Running statistical analysis..."
  └─ Steps complete ✓ (shows total thinking time)
  │
  ▼
PHASE 3 — Results
  ├─ AI explanation message (with collapsed "thinking")
  └─ Findings Message (inline FindingsCanvas)
       ├─ Bar/pie charts per question
       ├─ Segment breakdowns
       ├─ Editable insight text
       └─ Actions: View Plan, Copy, Download, Save
  │
  ▼
User can send follow-up questions
  (context is carried forward for refinement)
```

### Flow 2: Complex Study Plan Approval

When the agent determines a query requires a multi-faceted study, it pauses to get approval.

```
Agent detects complexity
  │
  ▼
Plan creation steps animate
  ├─ "Evaluating research requirements..."
  ├─ "Designing study plan..."
  └─ Steps complete ✓
  │
  ▼
AI message: "This is a complex study..."
  │
  ▼
Plan Card appears in chat
  ├─ Title, description, bullet points
  ├─ Expected runtime
  ├─ Method & sample info
  │
  ├─ [Approve] → execution resumes (see Flow 1 Phase 2)
  ├─ [Review Plan] → Study Plan Overlay opens
  │    ├─ Full question list with types
  │    ├─ Audience & sample size details
  │    ├─ [Edit] → opens Survey Builder pre-populated
  │    └─ [Save as Template]
  └─ User can also just type a new message (abandons plan)
```

### Flow 3: Clarification Loop

When the agent doesn't have enough information to proceed.

```
User asks ambiguous question
  │
  ▼
Agent returns clarification request
  (e.g. "Could you specify the target age group?")
  │
  ▼
AI message appears asking for more detail
  │
  ▼
User replies with clarification
  │
  ▼
Normal research flow resumes (Flow 1)
```

### Flow 4: Survey Builder (Manual Study Design)

A structured, step-by-step alternative to conversational research. Begins with a **Create Survey Modal** that lets users choose their starting point before entering the full builder.

```
Entry points:
  ├─ Home screen → method pill click (any method except Quick Poll)
  ├─ Home screen → "All methods" → Methods Picker → select method
  └─ Project Chat → method picker in input bar
  │
  ▼
CREATE SURVEY MODAL (dialog)
  │
  ├─ Option A: "Create from scratch"
  │   → Opens builder with blank state (mode: scratch)
  │
  ├─ Option B: "Import existing"
  │   → Opens builder in import mode (mode: import)
  │
  └─ Option C: Pick a template from the gallery
      ├─ Templates are filterable by category tabs:
      │   Recent | Marketing | Product | Brand | Audience Insight
      ├─ Org-specific templates shown first (branded with account logo)
      │   e.g. Disney, Vodafone, BP, Philips, Canva, etc.
      └─ Common templates available to all accounts
      │
      → Opens builder pre-populated with template questions
        (mode: template, questions pre-filled)
  │
  ▼
SURVEY BUILDER (full-page overlay)
  │
  ├─ Step 1: TYPE
  │   Select from: Survey, Focus Group, Creative Testing,
  │   Concept Testing, Message Testing, etc.
  │   (may be pre-set if coming from a template)
  │
  ├─ Step 2: AUDIENCE
  │   Pick target audiences / segments from available panels
  │
  ├─ Step 3: STIMULUS (optional)
  │   Upload images, ads, packaging mockups to test
  │
  ├─ Step 4: QUESTIONS
  │   Add/edit questions (single choice, multi choice, likert,
  │   open text, rating, NPS, ranking, matrix, yes/no, slider)
  │   (pre-populated if from template or import)
  │
  └─ Step 5: REVIEW
      Summary of study design → [Launch Study]
  │
  ▼
Processing overlay (animated)
  │
  ▼
Research study created + findings generated (with stimuli if provided)
  │
  ▼
Navigates to Project Chat with results in chat stream


Alternative entry (bypasses modal):
  └─ Study Plan Overlay → "Edit" button
      → Opens builder directly, pre-populated with study data
```

### Flow 5: Quick Poll

A fast-track path for single-question pulse checks.

```
Entry points:
  ├─ Home screen → "Quick Question" pill
  ├─ Home screen → "All methods" → Quick Question
  └─ Project Chat → method picker → Quick Question
  │
  ▼
Quick Poll page opens (full-page overlay)
  │
  ├─ Select audience panel
  ├─ Add 1–N questions (pre-validated)
  └─ [Launch] button in footer
  │
  ▼
Survey created with mock findings
  │
  ▼
Navigates to Project Chat with results
```

### Flow 6: Audience Management

Browse and explore pre-built synthetic audience panels.

```
Sidebar → click "Audiences"
  │
  ▼
Audiences List (overlay replaces main content)
  ├─ Search bar
  ├─ Table: Name, Description, Size, Segments, Last Updated
  └─ Click any row →
      │
      ▼
  Audience Detail (overlay)
      ├─ Header: name, description, agent count, segment count
      ├─ Demographics breakdown (collapsible)
      ├─ Data sources (collapsible)
      └─ "Ask this audience a question" input
           │
           └─ Submit → closes overlay → creates new project
              with the question pre-scoped to that audience
```

### Flow 7: Segment Drill-Down (Follow-Up Scoping)

Click a chart bar to scope follow-up questions to that segment.

```
Findings card showing bar chart
  │
  ├─ User clicks a specific bar segment
  │   (e.g. "Gen Z — 72% Agree")
  │
  ▼
Segment pill appears in the Chat Input Bar
  ├─ Shows: "Gen Z · 72% Agree"
  ├─ [x] to remove
  │
  ▼
User types follow-up question
  (e.g. "Why do they prefer this?")
  │
  ▼
New simulation runs, scoped to that segment
```

### Flow 8: Project Management

Creating, switching, and managing research projects.

```
Creating:
  ├─ Home → type a question → auto-creates project
  ├─ Sidebar → "+" button → goes to Home
  └─ Builder/Quick Poll launch → auto-creates project

Switching:
  ├─ Sidebar → click any project in history
  └─ → loads that project's chat stream & studies

Deleting:
  └─ Sidebar → right-click / context menu → delete
      └─ if currently viewing that project → navigates Home

Account switching:
  └─ Sidebar header → account dropdown
      └─ switches context, resets to Home, loads new project list
```

### Flow 9: Results Interaction

How users interact with findings after they appear.

```
Findings Message in chat
  │
  ├─ Expand/collapse individual question cards
  ├─ Click bar segment → scoping pill (Flow 7)
  ├─ Edit insight text inline
  │
  ├─ Header actions:
  │   ├─ View Plan → Study Plan Overlay
  │   ├─ Copy to clipboard
  │   ├─ Download
  │   └─ Save to project
  │
  └─ Click chart → Findings Lightbox (expanded full-screen view)
```

### Flow 10: Stimulus Library

Browse, upload, and manage creative assets used as stimuli across research studies. Sits at the same level as Audiences — an account-wide shared resource.

> **Note:** This feature is planned but not yet built in the current prototype. The flow below describes the intended design.

```
Sidebar → click "Stimuli" (or "Asset Library")
  │
  ▼
Stimulus Library (overlay replaces main content)
  ├─ Search bar + filter by type / tag / category
  ├─ Grid/list of assets: thumbnail, name, type, tags, last used
  ├─ [Upload] button → add new assets (images, videos, documents)
  └─ Click any asset →
      │
      ▼
  Stimulus Detail (overlay)
      ├─ Full-size preview
      ├─ Metadata: name, type, tags, upload date
      ├─ Usage history: which projects/studies have used this asset
      └─ Actions: edit metadata, delete, use in new study

Integration with Survey Builder:
  └─ Builder Step 3 (Stimulus) can pull from the library
     instead of requiring a fresh upload each time
```

---

## 6. Navigation Model Summary

| From | To | Trigger |
|---|---|---|
| Home | Project Chat | Type a question or select a project |
| Home | Create Survey Modal | Click method pill (except Quick Poll) or "All methods" |
| Home | Quick Poll | Click "Quick Question" pill |
| Create Survey Modal | Survey Builder | Pick scratch / import / template |
| Any screen | Audiences List | Sidebar "Audiences" link |
| Audiences List | Audience Detail | Click an audience row |
| Any screen | Stimulus Library | Sidebar "Stimuli" link |
| Stimulus Library | Stimulus Detail | Click an asset |
| Audience Detail | Project Chat | Submit a question scoped to that audience |
| Project Chat | Create Survey Modal | Method picker (except Quick Question) |
| Project Chat | Quick Poll | Method picker → Quick Question |
| Project Chat | Study Plan Overlay | "View Plan" from findings or Plan Card "Review" |
| Study Plan Overlay | Survey Builder | "Edit" button (bypasses modal, pre-populated) |
| Any screen | Home | Sidebar logo / Home link |
| Any screen | Project Chat | Sidebar project list click |

---

## 7. AI Agent Pipeline

The agent's job is to take a natural-language question and turn it into a fully specified research study — choosing the right audience, method, questions, and stimulus material — then execute it and return findings. The entire **project conversation** (all messages, attachments, prior findings, and any files/text the user has provided) is passed as context on every turn, so the agent never loses track of audience, stimulus, or prior research.

### 7.1 Full Reasoning Flow

```
USER SENDS A MESSAGE
  │
  ▼
STEP 1 — Understand the question
  │  The agent receives the user's query plus the FULL conversation
  │  context: every prior message, uploaded files/text, audience
  │  mentions, previous findings, and stimulus material already
  │  shared in the thread.
  │
  │  It parses the intent:
  │  ├─ What does the user want to learn?
  │  ├─ Is this a new study or a follow-up to existing results?
  │  └─ Are there constraints or preferences expressed?
  │
  ▼
STEP 2 — Identify or create the audience
  │  The agent determines who to research:
  │  ├─ Explicit @mention → use that audience panel directly
  │  ├─ Implied group (e.g. "parents", "Gen Z") → infer audience
  │  ├─ Comparison detected ("X vs Y") → create segments
  │  ├─ Context from earlier in conversation → carry forward
  │  └─ No audience signal → default to "General Population"
  │
  │  If the query contains comparison language (vs, compared to,
  │  differences between), the agent extracts segment pairs and
  │  sets up a side-by-side study.
  │
  ▼
STEP 3 — Choose the research method
  │  Based on the question and context, the agent selects the
  │  most appropriate tool:
  │
  │  ├─ run_survey          — default for most questions (quant)
  │  ├─ run_focus_group     — only when user explicitly asks for
  │  │                        qual / focus group / depth interviews
  │  ├─ run_comparison      — legacy cross-segment comparison
  │  ├─ run_heatmap         — attention / engagement analysis
  │  ├─ run_sentiment       — brand / topic sentiment
  │  └─ run_message_testing — message / copy effectiveness
  │
  │  Philosophy: default to surveys (data is almost always valuable).
  │  Only switch to focus groups when the user explicitly requests
  │  qualitative research.
  │
  ▼
STEP 4 — Check for stimulus material
  │  Many methods (creative testing, message testing, concept
  │  testing, proposition testing) require stimulus — the actual
  │  creative, messaging, concept descriptions, or propositions
  │  that respondents will evaluate.
  │
  │  The agent checks:
  │  ├─ Is stimulus already in the conversation context?
  │  │   (e.g. user uploaded an image, pasted copy, described
  │  │    a proposition earlier in the thread)
  │  │   → YES: use it automatically, no need to ask again
  │  │
  │  ├─ Does the method require stimulus but none is available?
  │  │   → ASK the user to provide it
  │  │     (e.g. "To run a creative test, I'll need the ad
  │  │      creative. Can you upload the image or describe it?")
  │  │
  │  └─ Is the method stimulus-optional?
  │      (e.g. simple survey, audience exploration)
  │      → proceed without stimulus
  │
  │  Stimulus types include:
  │  ├─ Images / video (ads, packaging, key art)
  │  ├─ Copy / messaging (headlines, taglines, claims)
  │  ├─ Concept descriptions (text descriptions of propositions)
  │  └─ Multiple variants for A/B or multivariant testing
  │
  ▼
STEP 5 — Write the study plan
  │  The agent assembles a complete study plan:
  │  ├─ Title (auto-generated from audience + topic)
  │  ├─ Research question (refined from user's raw query)
  │  ├─ Method + tool selection
  │  ├─ Audience + segments (if applicable)
  │  ├─ Sample size (default 500, adjusted for segments)
  │  ├─ Stimulus references (if applicable)
  │  └─ Survey questions (auto-generated to answer the
  │     research question)
  │
  ▼
STEP 6 — Complexity check
  │  The agent assesses whether the study needs user approval:
  │
  │  Triggers for COMPLEX (shows plan card for approval):
  │  ├─ 2+ segments to compare
  │  ├─ 3+ research questions
  │  ├─ Focus group methodology
  │  ├─ Multi-item evaluation detected in query
  │  ├─ Large sample size (>1,000)
  │  └─ Comparison methodology
  │
  │  ├─ SIMPLE → skip to execution (Step 7)
  │  └─ COMPLEX → show Plan Card in chat
  │       ├─ User can [Approve] → proceed to execution
  │       ├─ User can [Review Plan] → opens Study Plan Overlay
  │       │    └─ [Edit] → opens Survey Builder pre-populated
  │       └─ User can type a new message → abandons plan
  │
  ▼
STEP 7 — Execute the study
  │  The tool executor runs an LLM call with a research-specific
  │  prompt, generating a Canvas (the raw research output):
  │
  │  ├─ run_survey         → quantitative canvas (charts, %)
  │  ├─ run_focus_group    → qualitative canvas (themes, quotes)
  │  ├─ run_comparison     → comparative canvas (side-by-side)
  │  ├─ run_heatmap        → attention / heatmap data
  │  ├─ run_sentiment      → sentiment analysis
  │  └─ run_message_testing→ message test results
  │
  │  Animated process steps show progress to the user
  │  (e.g. "Recruiting 500+ respondents...", "Running analysis...")
  │
  ▼
STEP 8 — Render findings
  │  Canvas → Findings conversion
  │  ├─ Charts (bar, pie) per question with segment breakdowns
  │  ├─ Editable insight text
  │  ├─ Themes & verbatims (for qualitative)
  │  └─ Actions: View Plan, Copy, Download, Save
  │
  ▼
STEP 9 — Ready for follow-up
    The full conversation (including these new findings) is now
    part of the context for the next query. The user can:
    ├─ Ask a follow-up question (context carries forward)
    ├─ Click a chart segment → scoping pill → targeted follow-up
    ├─ Ask the agent to go deeper on a specific finding
    └─ Start a completely new line of research
```

### 7.2 Thinking Steps (Visible Reasoning)

While the agent works, the user sees animated "thinking" labels that reflect what the agent is doing. These are **dynamically generated per query** — not hardcoded — so they always match the specific audience, method, topic, and context.

**How it works:** After the agent selects a tool and parameters, a lightweight LLM call generates two sets of contextual labels:

- **Planning steps** (2–3 labels) — shown during the planning phase. Cover understanding the question, identifying the audience/segments, and choosing the method. Examples: "Targeting Gen Z consumers", "Creating iPhone & Android segments", "Reviewing uploaded ad creatives"
- **Execution steps** (4–7 labels) — shown during the execution phase. Cover realistic research activities for the chosen method. Examples: "Recruiting 500 Gen Z respondents", "Moderating group discussions", "Scoring emotional resonance per variant"

The labels appear in two places: the **ProcessSteps** component (animated progress during live execution), and the **ThinkingSection** in AI messages (the collapsed "Thought for Xs" with expandable step list after completion).

If the LLM call fails, the system falls back to sensible per-tool defaults that still incorporate the audience and segment names from the query.

See `services/thinkingStepsGenerator.ts` for the full prompt and implementation.

### 7.3 Context & Memory

A critical design principle: **the entire project conversation is passed as context on every agent turn.** This means:

- **Audience sticks** — if the user said "let's look at Gen Z parents" three messages ago, the agent still knows that's the audience. No need to repeat it.
- **Stimulus persists** — if the user uploaded an ad creative or pasted copy earlier in the thread, the agent can reference it for subsequent studies without re-asking.
- **Files & attachments carry forward** — any documents, images, or text the user has provided remain in context throughout the project.
- **Prior findings inform follow-ups** — the agent can see what's already been researched and build on it rather than repeating work.
- **Segment context is preserved** — if the user scoped to a segment via the drill-down pill, that scoping carries into the agent's understanding.

This is what makes the conversational research experience feel like working with a research partner rather than filling in forms — the agent accumulates understanding over the life of the project.

### 7.4 When the Agent Asks for Input

The agent's default is to **act first, clarify rarely** — but there are specific moments where it will pause and ask:

| Situation | What the agent does |
|---|---|
| **Stimulus required but missing** | "To test this creative, I'll need the asset. Can you upload the image or paste the copy?" |
| **Genuinely ambiguous query** | "Could you tell me more about what you'd like to explore?" (rare — only if the query is nearly meaningless) |
| **Complex study detected** | Shows a Plan Card for approval rather than asking a question — the user can approve, review, or redirect |

The agent almost never asks for audience clarification — it infers from context or defaults to a sensible population.

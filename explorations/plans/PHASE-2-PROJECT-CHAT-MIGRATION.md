# Phase 2: Project = Chat Migration

**Assumes:** Phase 1 (PROTOTYPE-MERGE-PLAN.md) is complete. Specifically, what exists from Phase 1:

- **Builder:** 4-step flow (Type → Audience → Stimulus → Questions) ported into React as `SurveyBuilder.tsx` with `useSurveyBuilder` reducer. No PreviewStep — launches directly from Questions. Gateway and editor merged into single `QuestionsStep.tsx`.
- **FindingsCanvas:** Built and used in primary flow (`FindingsCanvas.tsx`, `FindingCard.tsx`, `FindingChart.tsx`, `EditableInsight.tsx`, `SegmentBreakdown.tsx`). `InlineCanvas` still exists but is no longer rendered in the main flow.
- **Mock data:** Hand-authored TypeScript files (`data/projects/vodafone.ts`, `bp.ts`, `disney.ts`, `philips.ts`, `candyCrush.ts`) — NOT parsed from Excel. Type is `SurveyProject`.
- **Stimulus assets:** Copied into `public/assets/stimulus/` (bp/, vodafone/).
- **Navigation:** `ActiveView` union with 7 states: `dashboard`, `projectDetail`, `conversation`, `surveyBuilder`, `results`, `audiences`, `audienceDetail`.
- **Sidebar:** Modified `AppSidebar.tsx` with project list, "New Survey" button, breadcrumbs.
- **Utilities:** `generateMockFindings.ts` (creates findings from builder questions), `canvasToFindings.ts` (Canvas → Finding[] adapter), `canvasToProject.ts` (Canvas → SurveyProject).

**Not done in Phase 1 (deferred to this phase or later):**
- Design system overhaul (monochrome tokens, Cabinet Grotesk, button variants)
- InlineCanvas removal
- Builder ↔ Chat AI crossover (builder AI method is a UI placeholder)
- Full-page FindingsCanvas tabs (Per Question / Full Report / Segments)

**Goal:** Restructure the app around the project=chat model. Projects are conversations. The home screen is a dashboard with a prompt box. The sidebar lists projects. Everything lives in the chat.

---

## The App Has Two Screens — One Sidebar

The sidebar is **always present** on both screens. It's collapsible (toggle to hide/show) so users can go full-width when they want focus, but it's never absent by default. The sidebar is a persistent shell — the main content area to its right changes based on context (Home vs. Project).

### Sidebar (Global — Always Present)

```
┌────────────────┐
│ [◀] ET  [▾ MUBI]│
│                │
│ + Ask question │
│                │
│ ▦ Dashboard    │
│                │
│ 👥 Audiences   │
│                │
│ ▼ Projects     │
│   Q1 Churn...  │
│   UK Cinema... │
│   2026 Conte.. │
│                │
│ RECENT         │
│   Vodafone...  │
│   BP Fuels...  │
│   Disney+...   │
│   Philips...   │
│   Candy Cr...  │
│                │
│ ──────────     │
│ ⚙ Settings    │
└────────────────┘
```

**Contents (top to bottom):**
- **Collapse toggle + logo + account switcher** (top row) — collapse button on the left, brand mark in the middle, account/org switcher dropdown on the right. Collapse hides sidebar to icon rail or fully hidden.
- **"+ Ask question"** — starts a new conversation/project. This is the primary creation action. Equivalent to typing in the home screen input bar — creates a project and opens the chat. No separate "New Project" button needed.
- **Dashboard** — navigates to the Home screen (project grid + input bar). Highlighted when on Home.
- **Audiences** — navigates to audiences view (or opens as overlay). Org-level, not project-scoped.
- **Projects** (collapsible section) — pinned/starred projects. These are the ones you've explicitly organized. Collapsed by default if the list is long.
- **Recent** — recent conversations/projects in reverse chronological order. This is the main project navigation — most projects live here. Active project highlighted with `bg-accent`.
- **Settings** — app/account settings (bottom)

**Behaviour:**
- Always visible by default on both Home and Project screens
- Collapsible via toggle at top-left (persists state across navigation)
- On the Home screen, "Dashboard" is highlighted, no project selected
- On a Project screen, the active project is highlighted in Recent (or Projects)
- Fixed width (`--sidebar-width`), scrollable if content overflows
- "+ Ask question" always visible at top — fastest way to start something new

### 1. Home (Dashboard)

What you see when you open the app or have no project selected. The sidebar is on the left, the main content area on the right.

```
┌────────────────┬───────────────────────────────────────────────┐
│ [◀] ET [▾MUBI] │                                               │
│                │                  Electric Twin                 │
│ + Ask question │                                               │
│                │       ┌──────────────────────────────────┐     │
│ ▦ Dashboard ●  │       │  What do you want to research?   │     │
│ 👥 Audiences   │       │  [+] [Audience] [Study]       →  │     │
│                │       └──────────────────────────────────┘     │
│ ▼ Projects     │                                               │
│   Q1 Churn...  │  ──────────────────────────────────────────── │
│   UK Cinema... │                                               │
│                │  YOUR PROJECTS                     SHARED     │
│ RECENT         │                                               │
│   Vodafone...  │  ┌──────────┐  ┌──────────┐  ┌──────────┐     │
│   BP Fuels...  │  │ Vodafone │  │ BP Fuels │  │ Disney+  │ ... │
│   Disney+...   │  │ Concept  │  │ Creative │  │ Key Art  │     │
│   Philips...   │  │ Test     │  │ Testing  │  │ Testing  │     │
│                │  │          │  │          │  │          │     │
│ ──────────     │  │ 3 studies│  │ 2 studies│  │ 1 study  │     │
│ ⚙ Settings    │  │ Jan 26   │  │ Jan 26   │  │ Dec 25   │     │
│                │  └──────────┘  └──────────┘  └──────────┘     │
└────────────────┴───────────────────────────────────────────────┘
```

**The input bar** at the top of the main area creates a new project. It has the same action buttons as the project chat input:
- **[+]** — attach document, image, brief
- **[Add Audience]** — audience picker/creator overlay
- **[Add Study]** — opens builder as full-screen overlay (creates a project first, then opens the builder within it)
- **Text input** — type a question or paste a brief
- **→** — send

On submit: a new Project is created → you're taken to the project chat with your first message already sent. Same pattern as ChatGPT/Claude home screens — the prompt IS the project creation flow. Clicking "Add Study" from the home screen creates a new project and opens the builder in one action.

**The project grid** shows existing projects below the input. Each card shows: name, type indicator, study count, last activity, maybe a small avatar/icon. Click → opens the project chat in the main area (sidebar stays, project becomes highlighted). Two sections: "Your Projects" and "Shared with you."

### 2. Project (Chat)

What you see when you open a project or start a new one. The same sidebar stays on the left (now with the active project highlighted), and the main area becomes the chat.

```
┌────────────────┬─────────────────────────────────────────────┐
│ [◀] ET [▾MUBI] │                                             │
│                │  Vodafone Broadband Research                │
│ + Ask question │  ─────────────────────────────────────────  │
│                │                                             │
│ ▦ Dashboard    │  [User] Here's the brief for the           │
│ 👥 Audiences   │  Vodafone broadband proposition testing     │
│                │  📎 research-brief.pdf                     │
│ ▼ Projects     │                                             │
│   Q1 Churn...  │  [AI] I can see this is a proposition      │
│   UK Cinema... │  testing study across 10 concepts...        │
│                │                                             │
│ RECENT         │  [User] Test all 10 with broadband          │
│ ● Vodafone...  │  decision-makers                            │
│   BP Fuels...  │                                             │
│   Disney+...   │  [AI] Setting up a concept test...          │
│   Philips...   │  ┌─────────────────────────────────────┐    │
│                │  │ FindingsCanvas: 10 propositions     │    │
│ ──────────     │  │ × 7 KPIs — switching, appeal...     │    │
│ ⚙ Settings    │  └─────────────────────────────────────┘    │
│                │                                             │
│                │  [User] How do tech-savvy families compare? │
│                │                                             │
│                │  [AI] Breaking down by segment...           │
│                │  ┌─────────────────────────────────────┐    │
│                │  │ FindingsCanvas: segment comparison   │    │
│                │  └─────────────────────────────────────┘    │
│                │                                             │
│                │ ┌───────────────────────────────────────┐   │
│                │ │ [+] [Audience] [Study]  Message...  → │   │
│                │ └───────────────────────────────────────┘   │
└────────────────┴─────────────────────────────────────────────┘
```

**Sidebar (same component as Home):**
- Same sidebar as the Home screen — unchanged, always present
- Active project highlighted with `bg-accent` in the Recent list
- Click any project → switches the main area to that project's chat
- "+ Ask question" starts a new project/conversation
- Click "Dashboard" to return to Home (the main area switches back to the project grid)

**Main area:**
- Project name at the top
- Message stream: user messages, AI responses, FindingsCanvas blocks, attachments
- Chat input bar pinned to bottom

**Chat input bar:**

```
┌─────────────────────────────────────────────────────────────┐
│  [+]  [Add Audience]  [Add Study]     Type a message...  → │
└─────────────────────────────────────────────────────────────┘
```

- **+** — attach document, image, brief, stimulus
- **Add Audience** — audience picker/creator overlay
- **Add Study** — opens builder as full-screen overlay
- **Text input** — ask a question, give an instruction, request a deliverable
- **→** — send

---

## Migration Steps

### Step 1: Global Sidebar Component

Create `components/AppSidebar.tsx` (replaces the Phase 1 version) — the persistent sidebar that appears on every screen. Matches the existing Merlin sidebar structure (see screenshot reference).

**Contents (top to bottom):**
- **Top bar:** Collapse toggle (left), logo/brand mark (centre), account/org switcher dropdown (right)
- **"+ Ask question"** — primary creation action. Starts a new conversation/project. Click → creates a blank project, navigates to it, focuses the chat input.
- **Dashboard** — navigates to Home screen. Highlighted with `bg-accent` when on Home.
- **Audiences** — navigates to audiences view or opens overlay. Org-level, not project-scoped.
- **Projects** (collapsible section) — pinned/starred projects. User can organise key projects here.
- **Recent** — reverse-chronological list of recent conversations/projects. This is the main project navigation. Active project highlighted with `bg-accent`.
  - Project name (truncated)
  - Click → switches main area to that project's chat
- **Settings** — app/account settings (bottom)

**Behaviour:**
- Always rendered in App.tsx, wrapping both Home and Project views
- Collapsible via toggle at top-left — collapsed state persists in `useState` (or localStorage for real app)
- Fixed width (`--sidebar-width`), scrollable if Recent list is long
- On mobile/narrow screens: starts collapsed, toggle to reveal as overlay
- "+ Ask question" is always visible and prominent — it's the primary action

**Components needed:**
```
components/
  AppSidebar.tsx              // Global sidebar shell
  SidebarHeader.tsx           // Top bar: collapse + logo + account switcher
  SidebarNav.tsx              // + Ask question, Dashboard, Audiences links
  SidebarProjects.tsx         // Collapsible pinned projects section
  SidebarRecent.tsx           // Recent conversations list
```

### Step 2: Home Screen Content Area

Create `components/Home.tsx` — the main content area when no project is selected. Rendered to the right of the sidebar.

**Layout:**
- Logo + tagline centered (large heading, can be simpler since logo is also in sidebar)
- Input bar (prominent, centered) — same component as the chat input bar, reused here
  - **[+]** — attach document/image
  - **[Add Audience]** — audience picker/creator overlay
  - **[Add Study]** — creates a new project and opens builder overlay
  - **Text input** — "What do you want to research?"
  - **→** — send
- Divider
- Project grid below

**Input bar behaviour:**
- On submit (text): create a new Project, navigate to project chat, send the text as the first user message
- On "Add Study" click: create a new Project, navigate to it, immediately open the builder overlay
- On "Add Audience" click: opens audience picker overlay (not project-scoped — adds to org audiences in sidebar)
- Supports paste (brief text) and drag-drop (files) — creates project with attachment

**Project grid:**
- Fetches from mock data (the pre-populated demo projects)
- Each card: project name, study type(s), study count, last message date, account/brand icon
- Two sections: "Your Projects" / "Shared with you" (shared is empty for prototype, but show the section)
- Click card → sets `activeProjectId`, which highlights it in sidebar and switches main area to chat

**Components needed:**
```
components/
  Home.tsx                    // Dashboard content area
  ProjectCard.tsx             // Individual project card in grid
  ProjectGrid.tsx             // Grid of ProjectCards with section headers
```

### Step 3: Collapse Navigation to Two States

Phase 1 built 7 `ActiveView` states:

```typescript
// Phase 1 (current)
ActiveView =
  | 'dashboard'          // Project card grid
  | 'projectDetail'      // Single project with stimulus, findings
  | 'conversation'       // Chat-driven research (original Merlin)
  | 'surveyBuilder'      // Structured builder flow
  | 'results'            // Standalone results view
  | 'audiences'          // Browse audiences
  | 'audienceDetail'     // Single audience
```

Replace with two states for the main content area:

```typescript
// Phase 2 (new)
type AppView =
  | { screen: 'home' }
  | { screen: 'project'; projectId: string }
```

The sidebar is always present (outside the view switch). The builder is an overlay within the project screen. Audience management moves to the sidebar + overlay pattern.

**What happens to each old view:**

| Old `ActiveView` | New home | Notes |
|---|---|---|
| `dashboard` | `{ screen: 'home' }` | Becomes the Home main content area |
| `projectDetail` | **Removed** | Project detail IS the chat now |
| `conversation` | `{ screen: 'project', projectId }` | Chat becomes the project view |
| `surveyBuilder` | Overlay within project | Not a route — `showBuilder` state in ProjectChat |
| `results` | **Removed** | FindingsCanvas renders inline in chat |
| `audiences` | Sidebar + overlay | Always visible in sidebar, click to edit in overlay |
| `audienceDetail` | Overlay | Opens from sidebar audience list |

**In App.tsx:**
```tsx
<SidebarProvider>
  <AppSidebar
    projects={projects}
    audiences={audiences}
    activeProjectId={view.screen === 'project' ? view.projectId : null}
    onSelectProject={(id) => setView({ screen: 'project', projectId: id })}
    onGoHome={() => setView({ screen: 'home' })}
    onNewProject={handleNewProject}
  />
  <main>
    {view.screen === 'home' && <Home ... />}
    {view.screen === 'project' && <ProjectChat projectId={view.projectId} ... />}
  </main>
</SidebarProvider>
```

### Step 3.5: Type Rename — Survey → Study

Phase 1 uses `Survey` and `SurveyProject` throughout. This phase introduces the concept of a "Study" (which better fits the research context — a project contains studies, not surveys). Rename during this migration:

| Phase 1 type | Phase 2 type | Notes |
|---|---|---|
| `Survey` | `Study` | A research study (may be a survey, but also concept test, tracking, etc.) |
| `SurveyProject` | `ProjectState` | A project is now a chat with studies inside it |
| `SurveyType` | `StudyType` | Keep the same values: `'simple'`, `'concept'`, `'message'`, etc. |
| `SurveyQuestion` | `StudyQuestion` | Or keep as `SurveyQuestion` since questions are still survey questions |

This is a find-and-replace across the codebase. The `types/survey.ts` file becomes `types/study.ts` (or stays and re-exports with new names). All imports update accordingly.

### Step 4: Project Chat — Message Stream Refactor

The current `WorkingPane` + conversation rendering needs to become a proper chat stream that supports multiple message types:

**Message types in the stream:**

```typescript
type ChatMessage =
  | { type: 'user'; text: string; attachments?: Attachment[] }
  | { type: 'ai'; text: string; thinking?: string }
  | { type: 'findings'; study: Study; findings: Finding[] }  // Study = renamed from Survey
  | { type: 'attachment'; attachment: Attachment }
  | { type: 'deliverable'; content: string; format: 'narrative' | 'report' | 'summary' }
  | { type: 'system'; text: string }  // "Study launched", "Audience added", etc.
```

**Rendering:**
- `user` → right-aligned (or left with user avatar), plain text + attachment previews
- `ai` → left-aligned with AI avatar, markdown-rendered text
- `findings` → full-width FindingsCanvas block (already built in Phase 1)
- `attachment` → inline preview card (image thumbnail, document icon + filename)
- `deliverable` → styled card with the AI's output (summary, report, etc.)
- `system` → centered, muted text, small font

Create `components/chat/` directory:

```
components/chat/
  ChatStream.tsx              // Scrollable message list
  ChatMessage.tsx             // Routes message type → renderer
  UserMessage.tsx             // User text + attachments
  AIMessage.tsx               // AI response with markdown
  AttachmentPreview.tsx       // Inline file/image preview
  DeliverableCard.tsx         // Styled deliverable output
  SystemMessage.tsx           // Small centered status text
```

`ChatStream` replaces the current `WorkingPane` for conversation rendering. It scrolls, auto-scrolls on new messages, and handles the variable-height blocks (FindingsCanvas can be tall).

### Step 5: Chat Input Bar Update

Update `QueryInput.tsx` (or create new `components/chat/ChatInputBar.tsx`):

**Current state:** Text input + send button, some toolbar items.

**New state:** Text input + action buttons row above or inline.

```
┌─────────────────────────────────────────────────────────────┐
│  [+]  [Add Audience]  [Add Study]     Type a message...  → │
└─────────────────────────────────────────────────────────────┘
```

**Button behaviours:**

| Button | Icon | Click action |
|--------|------|-------------|
| **+** | Plus/paperclip | Opens file picker. Selected file(s) appear as attachment previews above the input bar. Send includes them as attachments in the message. |
| **Add Audience** | People icon | Opens audience picker overlay (reuse existing `AudiencesList` as an overlay/modal). Selected audience gets added to the project context. System message: "Audience added: UK Broadband Decision-Makers" |
| **Add Study** | Beaker/chart icon | Opens builder overlay (full-screen, built in Phase 1). On launch, results drop into chat as FindingsCanvas. |

**Attachment preview (staged files):**
When files are attached via +, show a row of small preview chips above the input:
```
  📎 research-brief.pdf  ✕   🖼 concept-card.jpg  ✕
┌─────────────────────────────────────────────────────────────┐
│  [+]  [Add Audience]  [Add Study]     Type a message...  → │
└─────────────────────────────────────────────────────────────┘
```

### Step 6: Builder as Overlay (Rebuild to 3-Step Flow)

Phase 1's builder is a 4-step flow (Type → Audience → Stimulus → Questions) with its own sidebar and action bar. This phase **rebuilds** the builder into the simplified 3-step PICK → SETUP → REVIEW flow described in the "Simplified Survey Builder Flow" section below. This is not a simple wrapping job — the step structure, state machine (`useSurveyBuilder.ts`), sidebar (`BuilderSidebar.tsx`), and several step components change significantly.

**What carries over from Phase 1:** `SurveyBuilder.tsx` shell (adapted), `TypeStep.tsx` (becomes the PICK step), `AudienceStep.tsx` and `StimulusStep.tsx` (fold into SETUP), `QuestionsStep.tsx` (folds into SETUP), `BuilderActionBar.tsx` (simplified). The `useSurveyBuilder` reducer needs updating for the new 3-step flow and state transitions.

**What's new:** SETUP page with progressive disclosure (Type + Audience + Questions on one page), REVIEW step (read-only summary), upload/paste/generate question flow, State A → State B transition.

Wrap the rebuilt builder in a full-screen overlay:

```tsx
// In ProjectChat.tsx
{showBuilder && (
  <div className="fixed inset-0 z-50 bg-background">
    <SurveyBuilder
      projectId={currentProject.id}
      audiences={currentProject.audiences}
      onLaunch={(study) => {
        // 1. Add system message: "Study launched: ..."
        // 2. Add findings message with study results
        // 3. Close builder
        setShowBuilder(false)
        addMessage({ type: 'system', text: `Study launched: ${study.name}` })
        addMessage({ type: 'findings', study, findings: study.findings })
      }}
      onClose={() => setShowBuilder(false)}
    />
  </div>
)}
```

The builder gets a close/back button (top-left) to return to chat without launching. "Launch" triggers `onLaunch`, which injects messages into the chat and closes the overlay.

### Step 7: Pre-populated Demo Conversations

Convert the mock data (hand-authored `SurveyProject` objects from Phase 1's `data/projects/`) into pre-built conversations. Each demo project becomes a `ProjectState` with a `messages: ChatMessage[]` array containing synthetic user messages and real FindingsCanvas data.

Create `data/demoConversations.ts`:

```typescript
export function buildVodafoneConversation(vodafoneProject: SurveyProject): ChatMessage[] {
  return [
    { type: 'user', text: "Here's the brief for the Vodafone broadband proposition testing",
      attachments: [{ name: 'Vodafone_Broadband_Brief.pdf', type: 'pdf' }] },
    { type: 'ai', text: "I can see this is a proposition testing study. You have 10 broadband service concepts to evaluate across two audience segments: general broadband decision-makers and tech-savvy families. The key KPIs are comprehension, appeal, relevance, newness, excitement, switching intent, and retention.\n\nShall I set up the test, or would you like to configure it manually?" },
    { type: 'user', text: "Let's test all 10 propositions with both segments" },
    { type: 'system', text: "Study launched: Vodafone Broadband Propositions — 10 concepts, 7 KPIs, 2 segments" },
    { type: 'findings', study: vodafoneProject.studies[0], findings: vodafoneProject.studies[0].findings },
    { type: 'user', text: "Which propositions should we take forward?" },
    { type: 'ai', text: "Based on the data, three propositions stand out clearly:\n\n**Market-leading WiFi** scores highest on appeal (88% T2B) and has the strongest switching intent among tech-savvy families (59%). It also leads on relevance.\n\n**Speed Boost** generates the most excitement (85% T2B) and has strong newness scores (76%). Its switching intent is solid at 51% for tech-savvy families.\n\n**Service Promise** has the highest comprehension (94%) and strong retention metrics. It's the easiest to understand and most credible, though less exciting.\n\nThe gap between tech-savvy families and general broadband users is largest for Market-leading WiFi (26 points on switching), suggesting it has particular pull with the premium segment.\n\nI'd recommend taking these three forward into a second phase with developed creative, and potentially combining the Service Promise messaging with the Market-leading WiFi or Speed Boost hardware proposition." },
  ]
}
```

Build similar conversation scripts for BP, Disney, Philips, and Candy Crush — each telling the story of a research project through chat messages and study results.

### Step 8: Wire Up Project State

Create `hooks/useProject.ts`:

```typescript
interface ProjectState {
  id: string
  name: string              // Auto-generated on creation, editable
  messages: ChatMessage[]
  studies: Study[]          // Each study also has an auto-generated, editable name
  audiences: Audience[]
  attachments: Attachment[]
}

function useProject(projectId: string) {
  const [project, setProject] = useState<ProjectState>(loadProject(projectId))

  const addMessage = (msg: ChatMessage) => { ... }
  const addStudy = (study: Study) => { ... }
  const addAudience = (audience: Audience) => { ... }
  const addAttachment = (file: Attachment) => { ... }
  const renameProject = (name: string) => { ... }
  const renameStudy = (studyId: string, name: string) => { ... }

  return { project, addMessage, addStudy, addAudience, addAttachment, renameProject, renameStudy }
}
```

**Auto-naming:** When a project is created from the home prompt, `generateProjectName(firstMessage)` derives a name from the user's input. When a study is launched from the builder, `generateStudyName(type, audience, questions, stimuli)` derives a name from the configuration. Both use simple heuristics for the prototype (no AI call needed — just template strings like `"${type} — ${audienceName}"`). Both names are editable via `renameProject` / `renameStudy`.

`loadProject` checks demo data first (pre-built conversations), falls back to empty project for new ones. All state lives in memory for the prototype — no persistence needed.

### Step 9: Remove Obsolete Views and Components

With project=chat in place, remove or archive:

| Component | Status |
|-----------|--------|
| `Dashboard.tsx` (Phase 1 version) | **Replace** with `Home.tsx` (main content area only) |
| `ProjectDetail.tsx` | **Remove** — project detail IS the chat |
| `AppSidebar.tsx` (Phase 1 version) | **Replace** with new `AppSidebar.tsx` (global, always-present, with audiences + settings) |
| `WorkingPane.tsx` | **Replace** with `ChatStream.tsx` |
| `AudiencesList.tsx` | **Keep** but render as overlay, not standalone view |
| `AudienceDetail.tsx` | **Keep** but render as overlay/panel |
| `ExpandedCanvas.tsx` | **Remove** — FindingsCanvas handles expansion |
| `MethodSidePanel.tsx` | **Review** — may fold into builder or remove |
| `MethodFullPage.tsx` | **Review** — may fold into builder or remove |

### Step 10: Update the "What Success Looks Like" Demo Flow

With this model, the demo walk-through becomes:

1. **Open the app** → Home screen. "Electric Twin" logo, prompt box, project cards below.
2. **"Here's a completed project"** → Click Vodafone card → chat opens. Scroll through: brief uploaded, AI analysed it, study results inline, follow-up questions, AI recommendations. All the data is real (from mock data).
3. **"Let me start a new one"** → Click ← Home. Type "I want to test three packaging concepts with UK mums aged 25-40" → new project created, AI responds in chat.
4. **"I want full control over the study"** → Click "Add Study" in input bar → builder overlay opens → PICK (Concept Testing) → SETUP (audience, stimulus, questions on one page) → REVIEW → Run → builder closes, results appear in chat.
5. **"Or I can just ask"** → Type "Now compare concept A and B on purchase intent" → AI runs a quick comparison, FindingsCanvas drops in.
6. **"And I can get a deliverable"** → Type "Create an executive summary of everything we've found" → AI produces a styled summary card in the chat.
7. **"All my projects are here"** → Sidebar shows all projects. Click BP → switch to that conversation with its own history.

---

## Phase 1 Utilities to Keep

These files from Phase 1 are still needed and should be adapted (not removed):

| File | Purpose | Phase 2 usage |
|---|---|---|
| `lib/canvasToFindings.ts` | Converts existing `Canvas` → `Finding[]` | Still needed — chat-generated results produce Canvas objects, this adapter feeds them into FindingsCanvas in the chat stream |
| `lib/generateMockFindings.ts` | Generates realistic mock findings from builder questions | Reuse when the builder's "Run Survey" fires — generates findings for the demo without a real backend |
| `lib/canvasToProject.ts` | Converts chat `Canvas` → `SurveyProject` | Adapt to produce `ProjectState` instead. Used when a chat-generated result needs to be saved as a proper study within the project |
| `data/projects/*.ts` | Hand-authored mock data (vodafone, bp, disney, philips, candyCrush) | Transform into `ProjectState` objects with `ChatMessage[]` arrays via `demoConversations.ts` |
| `hooks/useSurveyBuilder.ts` | `useReducer`-based builder state machine | Adapt for 3-step PICK → SETUP → REVIEW flow (significant changes to step logic and validation) |
| `components/results/FindingsCanvas.tsx` + children | FindingsCanvas, FindingCard, FindingChart, EditableInsight, SegmentBreakdown | Keep as-is — these render inline in the chat stream |

---

## File Summary

### New Files
```
components/AppSidebar.tsx              // Global sidebar shell (always present)
components/SidebarHeader.tsx           // Top bar: collapse + logo + account switcher
components/SidebarNav.tsx              // + Ask question, Dashboard, Audiences links
components/SidebarProjects.tsx         // Collapsible pinned projects section
components/SidebarRecent.tsx           // Recent conversations list
components/Home.tsx                    // Dashboard main content area (right of sidebar)
components/ProjectCard.tsx             // Project card for grid
components/ProjectGrid.tsx             // Grid layout with sections
components/chat/ChatStream.tsx         // Message stream (replaces WorkingPane)
components/chat/ChatMessage.tsx        // Message type router
components/chat/UserMessage.tsx        // User message renderer
components/chat/AIMessage.tsx          // AI message renderer
components/chat/AttachmentPreview.tsx  // File/image preview
components/chat/DeliverableCard.tsx    // Styled deliverable output
components/chat/SystemMessage.tsx      // Status messages
components/chat/ChatInputBar.tsx       // Input bar with action buttons (reused on Home + Project)
hooks/useProject.ts                    // Project state management
data/demoConversations.ts             // Pre-built demo conversations
types/chat.ts                         // ChatMessage, AppView types
```

### Modified Files
```
App.tsx                               // Sidebar + two-state main area (home/project)
types/index.ts                        // Re-exports new types
data/mockData.ts                      // Wire demo conversations to projects
```

### Removed / Replaced Files
```
components/Dashboard.tsx              → Home.tsx (content area only)
components/ProjectDetail.tsx          → (removed, chat IS the detail)
components/layout/AppSidebar.tsx      → new AppSidebar.tsx (global, always-present, with + Ask question, Dashboard, Audiences, Projects, Recent, Settings)
components/WorkingPane.tsx            → chat/ChatStream.tsx
components/ExpandedCanvas.tsx         → (removed, FindingsCanvas handles it)
```

---

## Simplified Survey Builder Flow

The original interaction model had 5-6 steps (Type → Audience → Stimulus → Questions Gateway → Questions Editor → Preview). This is too many clicks. The new flow has **3 steps** with progressive disclosure doing the heavy lifting.

### Flow Overview

```
  ┌──────────┐      ┌──────────┐      ┌──────────┐
  │  1 PICK  │  →   │  2 SETUP │  →   │ 3 REVIEW │
  │          │      │          │      │          │
  │ Type +   │      │ Type     │      │ Summary  │
  │ Templates│      │ Audience │      │ Questions│
  │          │      │ Questions│      │ Segments │
  └──────────┘      └──────────┘      │ Runtime  │
                                      │          │
                                      │  [RUN]   │
                                      └──────────┘
```

### Step 1: PICK

**Triggered by:** "Add Study" → "Create Survey" (or `/survey` slash command in chat input).

**What you see:** A selection page with survey types and templates.

```
┌──────────────────────────────────────────────────────────┐
│  Pick a survey type                                      │
│                                                          │
│  ┌────────────┬────────────┬────────────┐                │
│  │  Simple    │  Message   │  Creative  │                │
│  │  Survey    │  Test      │  Test      │                │
│  ├────────────┼────────────┼────────────┤                │
│  │  Concept   │  Brand     │  Audience  │                │
│  │  Test      │  Tracking  │  Explorer  │                │
│  └────────────┴────────────┴────────────┘                │
│                                                          │
│  YOUR TEMPLATES                                          │
│  ┌────────────┐  ┌────────────┐                          │
│  │ Q1 Brand   │  │ Monthly    │                          │
│  │ Health     │  │ NPS Track  │                          │
│  └────────────┘  └────────────┘                          │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

**Top grid:** The 6 survey types from the interaction model, displayed as a CardGrid (3×2). Each card has: type name, short description, icon. Click one → go to Step 2 with type pre-selected.

**Below:** "Your Templates" — org-saved templates (pre-configured surveys with questions). Click a template → go to Step 2 with everything pre-filled (type, audience defaults, questions). For the prototype, show 2-3 dummy templates.

**Behaviour:** Single click on a type or template → immediately advance to Setup. No "confirm" button needed. The selection IS the action.

### Step 2: SETUP

**One scrollable page with three sections.** Progressive disclosure keeps it compact — sections expand as you interact. The page has two visual states.

#### State A: Configuring (initial)

```
┌──────────────────────────────────────────────────────────┐
│  ← Back                                        Step 2/3 │
│                                                          │
│  TYPE ─────────────────────────────────────────────────── │
│  ┌────────────────────────────────────────────────┐      │
│  │ Creative Test                              ▾   │      │
│  └────────────────────────────────────────────────┘      │
│                                                          │
│  AUDIENCE ─────────────────────────────────────────────── │
│  ┌────────────────────────────────────────────────┐      │
│  │ UK General Population (default)            ▾   │      │
│  └────────────────────────────────────────────────┘      │
│  [+ Add Segmentation]                                    │
│                                                          │
│  QUESTIONS ────────────────────────────────────────────── │
│  ┌ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─┐      │
│  │                                                │      │
│  │  ┌──────────────────────────────────────┐      │      │
│  │  │  📎 Upload questions  or  📋 Paste  │      │      │
│  │  │     Drag a file here                 │      │      │
│  │  └──────────────────────────────────────┘      │      │
│  │                                                │      │
│  │  — or start from scratch —                     │      │
│  │                                                │      │
│  │  ┌ Q1 ─────────────────────────────────┐       │      │
│  │  │ Single Select ▾  │ Your question... │       │      │
│  │  └─────────────────────────────────────┘       │      │
│  │  [+ Add question]                              │      │
│  │                                                │      │
│  └ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─┘      │
│                                                          │
│  ┌────────────────────────────────────────────────┐      │
│  │                              Continue to Review →│    │
│  └────────────────────────────────────────────────┘      │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

**TYPE section:**
- Pre-selected from Step 1, shown as a dropdown
- Can change it here without going back
- Changing type may adjust which defaults appear below (e.g. Creative Test shows a stimulus upload area in the Questions section)

**AUDIENCE section:**
- Pre-filled with a sensible default: "UK General Population" or the org's default audience if one exists
- Dropdown to change audience
- **"+ Add Segmentation" button** — clicking this expands inline UI below the audience selector:
  - Shows available segments for the selected audience (age bands, gender, income, etc.)
  - Checkboxes or pills to select segments for comparison
  - "Create new segment" option
  - This never navigates away — it's progressive disclosure on the same page

**QUESTIONS section:**
The questions area has two entry points, plus a starter question:

1. **Upload/Paste card** — prominent card at the top of the section:
   - Click "Upload" → file picker
   - Click "Paste" → opens a lightbox/modal with a large text area to paste questions (and a smaller "or upload a file" option within it)
   - Drag a file directly onto the card
   - After uploading/pasting, a "Generate" button appears → AI formats the raw text into structured questions with types and answer options

2. **Starter question** — one empty Single Select question already present below the upload card, so the page never looks blank. Users building from scratch just start editing this and click "+ Add question."

3. **"+ Add question" button** — at the bottom, adds another empty question.

**When the user clicks "Generate" after upload/paste:**

The page transitions to State B. Type and Audience sections collapse to one-line summaries. The questions section expands with the AI-generated formatted questions.

#### State B: Editing Questions (after generation or manual build-up)

```
┌──────────────────────────────────────────────────────────┐
│  ← Back                                        Step 2/3 │
│                                                          │
│  Creative Test  •  UK Gen Pop  •  2 segments     [Edit]  │
│  ─────────────────────────────────────────────────────    │
│                                                          │
│  QUESTIONS (8)                            [↑ Re-upload]  │
│                                                          │
│  ┌ Q1 ─────────────────────────────────────────────────┐ │
│  │ Single Select ▾ │ How appealing do you find this…   │ │
│  │ ○ Very appealing                                    │ │
│  │ ○ Somewhat appealing                                │ │
│  │ ○ Not very appealing                                │ │
│  │ ○ Not at all appealing                              │ │
│  └─────────────────────────────────────────────────────┘ │
│                                                          │
│  ┌ Q2 ─────────────────────────────────────────────────┐ │
│  │ Likert 5pt ▾    │ How relevant is this concept…     │ │
│  │ ● ● ● ● ●  (Strongly disagree → Strongly agree)    │ │
│  └─────────────────────────────────────────────────────┘ │
│                                                          │
│  ┌ Q3 ─────────────────────────────────────────────────┐ │
│  │ Open Text ▾     │ What, if anything, would make…    │ │
│  └─────────────────────────────────────────────────────┘ │
│                                                          │
│  ...                                                     │
│                                                          │
│  [+ Add question]                                        │
│                                                          │
│  ┌────────────────────────────────────────────────┐      │
│  │                              Continue to Review →│    │
│  └────────────────────────────────────────────────┘      │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

**The summary bar at the top** replaces the expanded Type and Audience sections:
- Shows: type + audience + segment count in one line
- "Edit" button expands them back to full sections if you need to change something

**Question list:**
- Each question is an inline card with: type dropdown, question text, answer options (editable)
- Questions are reorderable (drag handle on left)
- Each question can be deleted, duplicated
- "Re-upload" link at the top right lets you paste/upload again (replaces all questions)

**The question sidebar** (from the whiteboard sketch): a small floating or fixed mini-nav on the left showing Q1, Q2, Q3... as dots or numbers. Click one to scroll to it. Useful when you have 15+ questions. This is optional for the prototype — nice to have, not blocking.

**For stimulus-requiring types** (Creative Test, Message Test, Concept Test): an additional "Stimulus" sub-section appears between Audience and Questions:

```
  STIMULUS ──────────────────────────────────────────────
  ┌──────────────────────────────────────────────────┐
  │  📎 Upload creatives    Drag files here          │
  │  ┌──────┐  ┌──────┐  ┌──────┐                   │
  │  │ img1 │  │ img2 │  │ img3 │  [+ Add]          │
  │  └──────┘  └──────┘  └──────┘                    │
  └──────────────────────────────────────────────────┘
```

This appears conditionally based on the type selected — same progressive disclosure principle.

### Step 3: REVIEW

**A read-only summary of the entire survey.** Everything on one page, ready to run.

```
┌──────────────────────────────────────────────────────────┐
│  ← Back                                        Step 3/3 │
│                                                          │
│  Review your survey                                      │
│                                                          │
│  TYPE           Creative Test                            │
│  AUDIENCE       UK General Population                    │
│  SEGMENTS       Under 35  •  35-54  •  55+               │
│  QUESTIONS      8 questions  •  Est. 4 min               │
│  SAMPLE SIZE    n=450 (150 per segment)                   │
│                                                          │
│  ─────────────────────────────────────────────────────── │
│                                                          │
│  STIMULUS                                                │
│  ┌──────┐  ┌──────┐  ┌──────┐                            │
│  │ img1 │  │ img2 │  │ img3 │                            │
│  └──────┘  └──────┘  └──────┘                            │
│                                                          │
│  QUESTIONS                                               │
│  Q1  Single Select   How appealing do you find this…     │
│  Q2  Likert 5pt      How relevant is this concept…       │
│  Q3  Open Text       What, if anything, would make…      │
│  Q4  Single Select   How likely are you to purchase…     │
│  Q5  ...                                                 │
│                                                          │
│  ─────────────────────────────────────────────────────── │
│                                                          │
│  ┌────────────────────────────────────────────────┐      │
│  │                                    Run Survey →│      │
│  └────────────────────────────────────────────────┘      │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

**Summary stats at top:** type, audience, segments, question count, estimated completion time, sample size. No name field — the study name is auto-generated on Run (see "Auto-generated names" in Key Decisions).

**Stimulus preview:** thumbnail grid (if applicable).

**Question list:** compact read-only list — type badge + question text for each. No editing here — click "← Back" to return to Setup if changes needed.

**Study name:** There is no name field anywhere in the builder. When the user clicks "Run Survey," the AI auto-generates a name from the study's inputs (type, audience, question themes, stimulus labels). Examples: "UK Creative Test — 3 Packaging Concepts," "Broadband Proposition Test — Tech-Savvy Families." The name appears in the system message when results drop into the chat, and shows in the sidebar/project card. It's always editable — click the name in the chat or in any summary view to rename it.

**"Run Survey" button:** launches the survey. In the prototype, this closes the builder overlay and drops results into the chat.

### Slash Commands (from the sketch)

The chat input also supports slash commands as shortcuts:

| Command | Action |
|---------|--------|
| `/survey` | Opens survey builder (same as "Add Study" → Create Survey) |
| `/poll` | Creates a quick single-question poll inline in chat (no builder needed) |
| `/run` | Re-runs the last study or runs a study from context |

These are power-user shortcuts. The buttons (Add Study, etc.) remain for discoverability.

### Comparison: Old Flow vs. New Flow

| Old (Interaction Model) | New (Simplified) |
|------------------------|------------------|
| 1. Type selection page | 1. **PICK** — type + templates on one page |
| 2. Audience page | 2. **SETUP** — type (pre-filled) + audience (defaulted) + questions, all on one scrollable page |
| 3. Stimulus page (conditional) | ↳ Stimulus appears inline in SETUP when type requires it |
| 4. Questions gateway (AI/Manual/Template) | ↳ Upload/paste/generate is part of the questions section in SETUP |
| 5. Questions editor (two-panel) | ↳ Questions edit inline in SETUP (single column, no two-panel split) |
| 6. Preview + Launch | 3. **REVIEW** — summary + Run |

6 pages → 3 pages. The key compression is SETUP: it puts type, audience, stimulus, and questions on a single page with progressive disclosure. You can fill it out in 30 seconds (accept defaults, paste questions, generate) or spend 10 minutes configuring every detail.

---

## Key Decisions

### Home screen prompt → project creation

Typing in the home prompt box creates a project immediately. The project gets an auto-generated name (from the first message, like "Vodafone broadband proposition testing" derived from the user's input). Can be renamed later.

### Always-present collapsible sidebar

The sidebar exists on every screen — Home and Project alike. It's one component that persists across navigation. It houses project navigation, saved audiences, settings, and the account switcher. Users can collapse it (to an icon rail or fully hidden) for more main-area space. This avoids the jarring "sidebar appears/disappears" transition and gives audiences and settings a permanent home without needing dedicated routes.

### No routing still

Keep `useState` for the two screens. `{ screen: 'home' }` or `{ screen: 'project', projectId }`. The builder is an overlay state within the project screen, not a route.

### FindingsCanvas collapse/expand in chat

In the chat stream, FindingsCanvas starts **collapsed** (header + top-line stats only) to keep the conversation scannable. Click to expand inline or click "Full view" to get the full-page overlay. This prevents tall study results from dominating the scroll.

### Auto-generated names for studies and projects

No name fields anywhere in the creation flow — not in the builder, not in the home prompt. Names are generated by the AI after creation based on context:

- **Projects created via chat:** Named from the first message content. "I want to test three packaging concepts with UK mums" → "Packaging Concept Test — UK Mums"
- **Projects created via "Add Study" on home screen:** Named from the builder inputs once the study launches. "Creative Test — UK Gen Pop — 8 Questions"
- **Studies created via builder:** Named from type + audience + stimulus/question themes. "Vodafone Broadband Proposition Test"
- **Studies created via chat:** Named from the conversation context. "Segment Comparison — Tech-Savvy vs. General"

Names are always editable: click the project name in the sidebar or at the top of the chat to rename. Click a study name in the system message or FindingsCanvas header to rename. Inline edit (click → text input → Enter/blur to save).

### Demo project conversations are hand-written

The synthetic messages (user questions, AI responses) are written by hand to tell a convincing story. The findings data comes from the Excel parser. This combination — authored narrative + real data — makes the demo feel natural without requiring actual AI generation.
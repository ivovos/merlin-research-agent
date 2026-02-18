# Electric Twin Prototype — Task Tracker

> **Vision**: Complete the prototype to demonstrate the full Electric Twin research loop — from question to findings to follow-up — across both the agentic chat and guided builder paths.

---

## Priority Matrix

Tasks are scored on two axes and sorted by **best bang-for-buck first** (high value, low effort → low value, high effort).

| Rating | Effort | Value |
|--------|--------|-------|
| 1 | Quick win (< 1hr) | Nice to have |
| 2 | Small (1–3hrs) | Useful polish |
| 3 | Medium (3–6hrs) | Important for demo |
| 4 | Large (6–12hrs) | Core to the vision |
| 5 | XL (12hrs+) | Differentiator / growth unlock |

---

## Task List — Sorted by Priority Score

Priority score = **Value ÷ Effort** (higher is better). Tasks with equal scores are grouped; within groups, dependencies come first.

---

### Tier 1 — Quick Wins (Do First)

| # | Task | Area | Effort | Value | Score | Status |
|---|------|------|--------|-------|-------|--------|
| 19 | **🐛 Fix: Duplicate Projects in Sidebar** | Bug | 1 | 5 | 5.0 | ✅ Done |
| 21 | **Rename "Projects" → "Studies" (Object Model Refactor)** | Architecture | 2 | 5 | 2.5 | ⬜ Todo |
| 1 | **Slash Command Palette (`/`)** | Home | 2 | 4 | 2.0 | ✅ Done |
| 2 | **Project Card Cleanup** | Home | 1 | 3 | 3.0 | ✅ Done |
| 8 | **Builder Loader Check** | Builder | 1 | 2 | 2.0 | ✅ Done |
| 14 | **Audience Popup Simplification** | Audience | 1 | 2 | 2.0 | ✅ Done |
| 9 | **Survey Plan Button on Findings** | Findings | 2 | 4 | 2.0 | ✅ Done |
| 11 | **Graph UI Improvements** | Findings | 2 | 3 | 1.5 | ✅ Done |
| 18 | **Project-Specific Question Templates** | Builder | 2 | 4 | 2.0 | ✅ Done |
| 20 | **Add Quick Poll Survey Type** | Builder | 2 | 5 | 2.5 | ✅ Done |

**Estimated total: ~15 hours | Bug fix, object model rename + visible polish across every screen**

---

### Tier 2 — High-Value Features

| # | Task | Area | Effort | Value | Score | Status |
|---|------|------|--------|-------|-------|--------|
| 22 | **Agent Conclusion / Finding Generation** | Agent UX | 2 | 5 | 2.5 | ⬜ Todo |
| 5 | **Study Type Picker Popup** | Builder | 2 | 4 | 2.0 | ⬜ Todo |
| 12 | **"Ask Why" & Next Steps Suggestions** | Findings | 2 | 4 | 2.0 | ⬜ Todo |
| 25 | **Question Writing Guidance** | Builder | 2 | 4 | 2.0 | ⬜ Todo |
| 10 | **Findings Action Buttons** (rerun, duplicate, save template) | Findings | 3 | 4 | 1.3 | ⬜ Todo |
| 6 | **Survey Builder Audit** (end-to-end, focus on Questions step) | Builder | 3 | 4 | 1.3 | ⬜ Todo |
| 7 | **Review Step Polish** | Builder | 2 | 3 | 1.5 | ⬜ Todo |

**Estimated total: ~21 hours | Completes both builder and findings flows**

---

### Tier 3 — Core Vision Pieces

| # | Task | Area | Effort | Value | Score | Status |
|---|------|------|--------|-------|-------|--------|
| 3 | **Step-by-Step Agent Progress** | Agent UX | 4 | 5 | 1.25 | ⬜ Todo |
| 4 | **Plan Approval Flow** (for complex studies) | Agent UX | 4 | 4 | 1.0 | ⬜ Todo |
| 13 | **Segment Drill-Down in Findings** (multi-select, follow-up) | Audience | 4 | 5 | 1.25 | ⬜ Todo |
| 16 | **Share Options** (findings / sector summary / full report) | Reports | 3 | 4 | 1.3 | ⬜ Todo |
| 23 | **Media Library / Stimulus Management** | Platform | 3 | 4 | 1.3 | ⬜ Todo |
| 24 | **Stimulus & Brief Upload in Chat** | Chat | 3 | 4 | 1.3 | ⬜ Todo |
| 26 | **Chat Context Persistence** | Chat | 3 | 5 | 1.67 | ⬜ Todo |
| 27 | **Earned Autonomy / Permission Model** | Agent UX | 3 | 4 | 1.3 | ⬜ Todo |

**Estimated total: ~37 hours | The "wow" moments in a demo**

---

### Tier 4 — Big Builds (Growth & Expansion)

| # | Task | Area | Effort | Value | Score | Status |
|---|------|------|--------|-------|-------|--------|
| 15 | **Summary & Report Creation Flow** (exec summary, methodology, ET link) | Reports | 4 | 5 | 1.25 | ⬜ Todo |
| 17 | **Shared Report View + "Ask Follow-Up"** (viral loop for new users) | Reports | 4 | 5 | 1.25 | ⬜ Todo |

**Estimated total: ~16 hours | Turns prototype into a shareable product story**

---

## Detailed Task Descriptions

### A. HOME SCREEN

### 🐛 BUGS (Fix First)

#### Task 19 — Fix: Duplicate Projects in Sidebar
**Effort: 1 | Value: 5**
Projects are appearing twice in the sidebar navigation panel. Investigate `AppSidebar.tsx` and the project list data source — likely a duplicate render from both the project store and a secondary data source (e.g., recent items + all projects both listing the same entries). Should show each project exactly once.

---

### 🏗️ ARCHITECTURE

#### Task 21 — Rename "Projects" → "Studies" (Object Model Refactor)
**Effort: 2 | Value: 5**
Fundamental object model shift: there are no "projects" — everything is a **Study**. A Study is a research investigation that can contain multiple methods (survey, focus group, etc.) run within it.

**New model:**
```
Account
  └── Study (was: Project/Conversation)
        ├── Methods[] (survey, focus group, comparison, etc.)
        ├── Messages[] (chat history)
        ├── Audiences[] (segments)
        ├── Findings[] (results per method)
        └── Attachments[] (briefs, stimulus)
```

**What changes:**
- Rename all "Project" references → "Study" across UI labels, sidebar, home screen, types, hooks, components
- `useProjectStore` → `useStudyStore` (or similar)
- Sidebar shows studies, not projects
- Home grid shows study cards, not project cards
- No grouping mechanism yet — later, **labels** can be added to group related studies (e.g., "Vodafone Q1", "Disney Parks")
- Mock data updates: Vodafone, BP, Disney, Philips entries become studies

This should be done early as it touches naming everywhere. Best done as a find-and-replace pass + type updates.

---

### A. HOME SCREEN

#### Task 1 — Slash Command Palette (`/`)
**Effort: 2 | Value: 4**
Replace the current "new study" button with a `/` icon that opens a **searchable command palette**. This is the universal action trigger for the whole platform — not just "new study".

**Commands to include:**
- **New Study** — starts the builder flow (full survey)
- **Quick Poll** — shortcut to the lightweight poll flow (Task 20)
- **Focus Group** — start a qualitative study
- **Summary Report** — generate a summary from existing findings
- **Executive Summary** — create a shareable exec-level overview
- **Compare Studies** — side-by-side comparison of two or more studies
- **Explore Audience** — jump into audience exploration mode

**Behaviour:**
- `/` key or clicking the icon opens the palette
- Searchable — typing filters the list (e.g., typing "poll" surfaces Quick Poll)
- Each item has icon + label + short description
- Selecting an item triggers the appropriate flow (builder, chat prompt, report generator)
- Monochrome, minimal design — consistent with the rest of the UI

#### Task 2 — Project Card Cleanup
**Effort: 1 | Value: 3**
Simplify the project cards on the home dashboard grid. Strip out excess metadata — show just enough to identify and re-enter a project. Less is more.

---

### B. AGENT THINKING / PROCESSING UX

#### Task 3 — Step-by-Step Agent Progress
**Effort: 4 | Value: 5**
When a user sends a research question, show a clear sequential progress indicator revealing what the agent is doing:
1. **Finding audience** — identifying and selecting the right respondent group
2. **Choosing study type** — deciding survey vs. focus group vs. other method
3. **Planning parameters** — defining participants, sample size, questions, methodology
4. **Fielding the study** — sending out the survey / running the sessions
5. **Processing responses** — collecting and analysing raw data
6. **Creating visualisations** — generating charts and insight summaries

Each step should feel tangible and build confidence. Think: a vertical stepper with status indicators (pending → active → done).

#### Task 4 — Plan Approval Flow (Complex Studies)
**Effort: 4 | Value: 4**
For complex or large studies (e.g., multi-wave qual research), the agent should produce a written research plan *before* executing. The user can:
- View the full plan
- Edit parameters
- Approve to proceed, or request changes

This gives users control over expensive/long research runs and makes the AI feel like a true collaborator, not a black box.

---

### C. SURVEY BUILDER PATH

#### Task 5 — Study Type Picker Popup
**Effort: 2 | Value: 4**
Update the "choose study type" popup/modal with:
- Better visual design (icons, clearer layout)
- **Quick Poll** and **Survey** as prominent top-level options
- Search functionality to find specific types
- Show more niche options (e.g., pricing studies, conjoint) when the user searches
- Smooth, inviting interaction — this is the first decision the user makes

#### Task 6 — Survey Builder Audit
**Effort: 3 | Value: 4**
Full end-to-end walkthrough of the builder flow. Focus especially on the **Questions step** which was recently updated. Check for:
- Visual consistency with design system
- Correct interactions and state management
- Smooth transitions between steps
- Edge cases (empty states, validation, back-navigation)

#### Task 7 — Review Step Polish
**Effort: 2 | Value: 3**
The Review step (step 5 of the builder) needs UI polish:
- Layout and typography cleanup
- Clear summary of all configured parameters
- Prominent CTA to launch the study
- Consider showing estimated time/cost

#### Task 20 — Add Quick Poll Survey Type
**Effort: 2 | Value: 5**
Add a simple "Quick Poll" survey type to the builder. This is the lightest-weight research option — designed for fast, single-question or few-question checks. Key characteristics:
- **No stimulus required** — just question(s) and audience
- **Simplified flow** — skip or minimize steps (Type → Audience → Questions → Go)
- **Few questions** — typically 1–3, single choice or simple scale
- **Fast turnaround** — feels instant compared to full surveys
- **Use cases**: quick sentiment check, A/B preference, temperature read on a topic

Should appear as a prominent option in the study type picker (Task 5) — positioned as the easiest way to get started. Needs to be added to `SURVEY_TYPE_CONFIGS` in the type definitions and handled in the builder flow (skip Stimulus step, simplified Questions step).

#### Task 18 — Project-Specific Question Templates
**Effort: 2 | Value: 4**
In the Questions step "Templates" tab, show templates that are contextual to the current project/brand. For example:
- **Disney project** → Disney-specific question templates (brand perception, character appeal, park experience, etc.)
- **Vodafone project** → Vodafone templates (network satisfaction, plan comparison, churn drivers, etc.)
- **BP project** → BP templates (energy transition sentiment, brand trust, sustainability perception, etc.)
- **Philips project** → Philips templates (health tech adoption, product satisfaction, etc.)

Templates should be pulled based on the active project context. Each template pre-fills a set of relevant questions the user can accept, edit, or add to. Makes the builder feel smart and tailored rather than generic.

#### Task 25 — Question Writing Guidance
**Effort: 2 | Value: 4**
Help users avoid asking the wrong questions. From founder interviews: "Users blame the platform when they use it wrong, not themselves." The builder should actively guide question writing:
- **Best practice hints** per question type (e.g., "Avoid leading questions", "Keep scales consistent")
- **Real-time feedback** — flag potential issues as the user types (double-barrelled questions, loaded language, etc.)
- **Suggested rewrites** — AI suggests improved phrasing
- **Question type recommendations** — "This question would work better as a ranking than a multiple choice"

This is about trust-building through guidance, not gatekeeping. Guide, don't gate.

#### Task 8 — Builder Loader Check
**Effort: 1 | Value: 2**
Verify that the processing/loader animation exists in the builder flow after submitting a study. If missing, add one that connects to the step-by-step agent progress (Task 3).

---

### D. FINDINGS & RESULTS

#### Task 9 — Survey Plan Button on Findings
**Effort: 2 | Value: 4**
When findings appear in the chat stream (with summary on top), add a **"View Survey Plan"** button/link. Clicking it opens the survey configuration — pointing to the Review page. This lets users verify *how* the research was conducted.

#### Task 10 — Findings Action Buttons
**Effort: 3 | Value: 4**
Add action buttons to the findings card/section:
- **Rerun** — execute the same study again (e.g., different time period)
- **Create new based on this** — duplicate and modify parameters
- **Save as template** — store the survey config for future reuse

#### Task 11 — Graph UI Improvements
**Effort: 2 | Value: 3**
Visual polish pass on all chart/graph components:
- Increase chart height (currently too compact)
- Better axis labels and legends
- Consistent colour palette
- Responsive sizing
- General "make it feel premium" attention

#### Task 12 — "Ask Why" & Next Steps Suggestions
**Effort: 2 | Value: 4**
At the end of a finding, add:
- **"Ask why"** button/prompt — triggers a follow-up investigation into the *reason* behind a result
- **"What to do next"** section — AI-generated suggestions for follow-up actions (e.g., "Test this message with Gen Z", "Run a concept test for the top-performing variant")

---

### E. AUDIENCE & SEGMENTS

#### Task 13 — Segment Drill-Down in Findings
**Effort: 4 | Value: 5**
Enable users to interact with audience segments within findings:
- Click on a segment in a chart/table to select it
- **Multi-select** segments (selections appear in the input field)
- From the selection, choose to:
  - Start a new study with those segments
  - Ask a direct follow-up question to those segments
- Requires UI work in both the findings view and the audience section
- Two views already exist for this — connect them

#### Task 14 — Audience Popup Simplification
**Effort: 1 | Value: 2**
The audience info popup currently shows too much information. Trim it down to essentials — name, size, key demographics. Details available on click-through, not upfront.

#### Task 22 — Agent Conclusion / Finding Generation
**Effort: 2 | Value: 5**
When the agent completes a study, it must produce a proper **finding** — a structured conclusion that appears in the chat. Currently the agent creates data but the conclusion/summary is missing or weak. The finding should include:
- **Headline insight** — the single most important takeaway, stated clearly
- **Supporting evidence** — key data points that back up the headline
- **Segment highlights** — notable differences between audience segments
- **Confidence/context** — sample size, methodology used, any caveats

This is the "deliverable" the agent produces. It should feel like a research analyst handing you a conclusion, not just raw data. This finding card is what gets saved, shared, and acted on.

---

### E2. PLATFORM & CONTEXT

#### Task 23 — Media Library / Stimulus Management
**Effort: 3 | Value: 4**
A central place to manage stimulus materials (images, concepts, ad creatives, documents) that can be reused across studies. From founder notes: "Media library required for reusing images/stimulus across studies."
- Upload and organize stimulus files
- Tag/categorize by brand, campaign, study type
- Drag or select stimulus into the builder's Stimulus step
- Clear rules for when stimulus drops out of agent context (context management)
- Thumbnail previews in library view

#### Task 24 — Stimulus & Brief Upload in Chat
**Effort: 3 | Value: 4**
Users should be able to attach stimulus or a research brief directly in the chat conversation. The agent then uses this as context for the study it creates.
- Drag-and-drop or click-to-attach in the chat input
- Support images, PDFs, text documents
- Agent acknowledges and references the uploaded material
- Brief uploads can auto-populate study parameters (audience, questions, methodology)
- Links to Media Library (Task 23) — uploaded items get saved there too

#### Task 26 — Chat Context Persistence
**Effort: 3 | Value: 5**
The chat must carry forward context from previous messages, studies, and findings. Currently context may be lost between interactions. From founder notes: "Context persistence across conversation crucial for user experience."
- Previous study results should inform follow-up questions
- The agent should remember what audience was used, what was found, what was discussed
- Enable the "ask → understand → dig deeper → ask again" iteration loop
- Clear UX indicator of what context the agent currently has
- Smart context windowing — manage what stays in and what drops out as conversation grows

#### Task 27 — Earned Autonomy / Permission Model
**Effort: 3 | Value: 4**
Three interaction modes from the founder's UX principles: **Manual → Guided → Autonomous**. The agent should start by requesting permission and showing its plan, then progressively gain autonomy as trust is built.
- **First interaction**: Agent always shows full plan, asks for approval
- **Established trust**: Agent shows summary, proceeds unless stopped
- **Full autonomy**: Agent executes and reports back
- User can always override and drop back to manual mode
- Ties into Task 4 (Plan Approval Flow) — the approval step is the "guided" mode
- Visual indicator of current autonomy level

---

### F. REPORTS & SHARING

#### Task 15 — Summary & Report Creation Flow
**Effort: 4 | Value: 5**
Design the flow for creating shareable reports. Entry point TBD (could be typing in the input field *or* the export button top-right). Report includes:
- **Executive summary** — AI-generated overview
- **Key findings** — the core insights with visualisations
- **Methodology** — how the research was conducted
- **About Electric Twin** — link to ET + brief explanation of how it works

#### Task 16 — Share Options
**Effort: 3 | Value: 4**
When a user clicks "Share", present three tiers:
1. **Share Findings** — just the results for a specific question
2. **Share Sector Summary** — a thematic summary across related findings
3. **Share Full Report** — the complete report (as defined in Task 15)

Each option generates the appropriate artefact and provides a shareable link.

#### Task 17 — Shared Report View + "Ask Follow-Up"
**Effort: 4 | Value: 5**
When someone receives a shared report, the view includes an **"Ask Follow-Up Question"** button prominently at the top. Clicking it starts a new investigation cycle for that person — this is the viral loop that expands the user base. New user gets the full agent experience starting from the shared context.

---

## Progress Summary

| Tier | Tasks | Est. Hours | Status |
|------|-------|-----------|--------|
| Tier 1 — Quick Wins | 10 | ~15 hrs | 9/10 done |
| Tier 2 — High-Value Features | 7 | ~21 hrs | 0/7 done |
| Tier 3 — Core Vision | 8 | ~37 hrs | 0/8 done |
| Tier 4 — Big Builds | 2 | ~16 hrs | 0/2 done |
| **Total** | **27** | **~89 hrs** | **9/27 done** |

---

*Last updated: 17 Feb 2026*

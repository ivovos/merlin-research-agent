# Object Model — Electric Twin

## Core Objects

### 1. Study (= Chat)
The primary object. A study is a conversation with a research question at its centre. It is the single view where all research activity happens.

**What it is:**
- A persistent chat thread between the user and the AI
- Defined by a research question or objective, not by a method
- The container for all methods, data, and emerging insights
- One view: the **chat**. Everything lives here — data cards, AI interpretation, inline actions.

**Properties:**
- Name / research question (e.g. "Why do enterprise users churn in the first 30 days?")
- Created date
- Last activity date
- Labels (zero or more, optional)
- Methods run within it (survey, focus group, interview, card sort, usability test, analytics review, etc.)
- Status indicator (active / has new results / idle)
- Saved findings count (visible in study header as a bookmarked badge: "🔖 3")

**Key design decisions:**
- A study can contain **multiple methods** — a survey AND interviews AND analytics, all within one study
- A study is defined by its **question**, not its method
- The AI has full context across all methods within a study because the chat is continuous
- Studies exist independently — they don't require a parent folder or project

---

### 2. Data Card (in-chat element)
The unit of raw data. When a method completes or returns results, the data appears in the chat as a structured, immutable card.

**What it is:**
- A structured block in the chat conversation that presents raw results from a method
- Factual, neutral, immutable — it shows what the data says, not what it means
- A reference object the researcher can always scroll back to and trust
- Expandable to show more detail (individual responses, cross-tabs, verbatim quotes)

**What a data card contains:**
- The raw numbers, responses, or data from a method
- Structure appropriate to the method (e.g. bar chart for survey distributions, quote cards for interview responses, task completion rates for usability tests)
- Metadata: method type, sample size, date collected, response rate

**What a data card does NOT contain:**
- No interpretation or editorialisation ("this suggests..." / "notably...")
- No colour-coding that implies good/bad/concerning
- No auto-generated headlines that frame a narrative
- No conclusions or recommendations

**Two inline actions on every data card:**

| Action | Icon | What it does |
|--------|------|--------------|
| **Save as finding** | 🔖 Bookmark | Opens a modal where the AI drafts a finding from this card + surrounding context. Researcher edits and saves. |
| **Share** | ↗ Share | Sends the raw data card as-is to a recipient. Quick, no editing step. "Did you see this?" |

**Example:**
```
┌─────────────────────────────────────────┐
│ 📊 Survey: Onboarding Experience        │
│ 232 responses · 78% completion rate     │
│                                         │
│ "How would you rate the onboarding      │
│  process?"                              │
│                                         │
│ Difficult      ████████████████  72%    │
│ Neutral         ████              18%   │
│ Easy             ███              10%   │
│                                         │
│ [Expand]              [🔖 Save] [↗ Share]│
└─────────────────────────────────────────┘
```

---

### 3. AI Interpretation (in-chat element)
The provisional analysis layer. After presenting a data card, the AI provides its interpretation as a regular chat message.

**What it is:**
- A conversational message from the AI that appears after (or alongside) a data card
- Interpretive, provisional, challengeable — it's the AI's first take, not a conclusion
- Designed to provoke the researcher's thinking, not to replace it
- Lives in the flow of conversation like any other message — it can be followed up on, challenged, or ignored

**What it sounds like:**
- "This shows a strong skew toward difficulty — 72% is notably high. It might be worth looking at whether this differs between enterprise and SMB users..."
- "Interestingly, 10% found it easy. If we can identify what those users have in common, that could point to what's working..."

**Two inline actions on the AI interpretation block:**

| Action | Icon | What it does |
|--------|------|--------------|
| **Save as finding** | 🔖 Bookmark | Opens a modal where the AI drafts a finding from the data card + this interpretation + conversation context. |
| **Share** | ↗ Share | Sends the data card AND the AI interpretation together. Recipient gets the chart + the AI's initial analysis. |

**Why this separation matters:**
- The data card is **evidence** — immutable, trustworthy, always referenceable
- The AI interpretation is **analysis** — provisional, conversational, a starting point for the researcher's own thinking
- This preserves the researcher's authority. The system presents facts, offers a perspective, and lets the researcher decide what it means.

---

### 4. Finding
The unit of insight. A finding is a bookmarked, refined insight that the researcher has chosen to name, edit, and keep. It's not a mandatory step — it's a deliberate act of saying "this matters enough to save."

**What it is:**
- An editable, shareable artifact that captures an insight
- Created via the 🔖 bookmark action on a data card or AI interpretation (opens an editing modal)
- Can also be created by asking in chat or accepting an AI suggestion
- Accessible via the findings badge in the study header ("🔖 3" → popover list)
- Maintains a provenance link back to the data card(s) and conversation that produced it

**Properties:**
- Title (e.g. "Onboarding is a critical retention risk")
- Summary / key insight (1-2 sentences)
- Evidence (a curated mix of visual and textual evidence — see below)
- Conclusions (the researcher's interpretation — fully editable)
- Source study (linked)
- Source data cards (linked — you can trace from finding back to raw evidence)
- Methods that contributed to this finding
- Labels (inherited from study or added independently)
- Created date
- Created by

**Evidence is visual, not just text:**
Evidence in a finding is not a paragraph describing data. It's the actual data, embedded:
- **Charts and visualizations** pulled directly from data cards (bar charts, distributions, completion rate graphs). These are the same visuals the researcher saw in the chat — not re-created, not summarised in text.
- **Quote cards** from interviews or focus groups (verbatim, attributed to anonymised participants)
- **Stat callouts** — key numbers highlighted as figures (e.g. "72%" displayed large with a label)
- **Cross-tabs or breakdowns** from expanded data card views

The researcher curates which visual evidence to include when editing the finding. The evidence section is a composable set of visual blocks, not a text field.

**The hierarchy: Data → Interpretation → Finding**
- **Data card:** "72% of users rated onboarding as difficult" — raw, factual, immutable
- **AI interpretation:** "This shows a strong skew toward difficulty, especially among enterprise users where it reaches 84%..." — provisional, conversational, challengeable
- **Finding:** "Onboarding is a critical retention risk — 72% rate it as difficult, and in follow-up interviews the main friction is the calendar connection step, which correlates with 40% higher churn" — the researcher's synthesised, definitive insight

**Three paths to creating a finding:**

1. **🔖 Bookmark on a data card or AI interpretation** — opens an editing modal with the AI's draft. The most common path. Point at a result, save it as a finding.

2. **Ask in chat** — "I think the key finding is that enterprise users churn because of calendar integration — save that as a finding." AI drafts it, opens the modal.

3. **AI suggests** — after significant analysis, the AI offers: "💡 Would you like me to save this as a finding?" Researcher clicks to accept, modal opens with draft.

**The editing modal:**
- Opens over the chat when a finding is being created
- Shows AI-drafted title, key insight, evidence (including embedded charts), conclusions
- Researcher edits any field — especially conclusions
- Save → finding is bookmarked in the study, visible in the header badge
- Close → back in the chat, no context lost

**Key design decisions:**
- Findings are **not required for sharing** — you can share data cards and AI interpretations directly
- Findings are for when you want to **refine and name** an insight — a deliberate act, not a mandatory gate
- The creator can **edit everything** before saving — especially conclusions and recommendations
- A finding is **self-contained** — a recipient should understand it without reading the source conversation
- Findings maintain **provenance** — each finding links back to the data card(s) and conversation that produced it

---

### 5. Report
The unit of communication. A report composes one or more findings for a specific audience.

**What it is:**
- A shareable document that packages findings for stakeholders
- Tailored to an audience (exec summary vs. detailed research readout vs. team brief)
- Can pull findings from one study or across multiple studies

**Properties:**
- Title
- Audience / purpose
- Composed findings (ordered, with optional editorial commentary between them)
- Executive summary (optional, auto-generated or written)
- Recommendations section (optional, editable)
- Source studies (derived from included findings)
- Labels
- Created date
- Created by

**Key design decisions:**
- Reports are the **cross-study synthesis layer** — this is how you answer "what did we learn across five studies about the German market?"
- Reports replace the need for a "project" as a narrative container
- Different report formats/templates serve different audiences without changing the underlying data

---

### 6. Labels
The organisational layer. Labels provide flexible, non-hierarchical grouping across all objects.

**What they are:**
- Lightweight tags that can be applied to studies, findings, and reports
- A study can have multiple labels (e.g. "Onboarding," "Enterprise," "Q1 priorities")
- Used for filtering and discovery, not for hierarchy

**Properties:**
- Name
- Colour (optional)
- Description (optional)

**Key design decisions:**
- Labels are **optional** — you never have to use them
- A study can belong to **multiple labels** simultaneously (unlike folders which force single-parent hierarchy)
- Labels are suggested by the AI based on content, and existing labels are auto-completed as you type
- Team-shared label sets prevent sprawl ("onboarding" vs "Onboarding" vs "user onboarding")

---

## What's NOT in the model

### No "Project" object
Studies don't need a parent container. The research question IS the organising principle of a study. Cross-study grouping is handled by labels (lightweight, multi-assignable) and reports (narrative synthesis).

### No separate "Method" object at the top level
Methods (surveys, interviews, focus groups) are actions that run WITHIN a study. They produce data that flows into the conversation as data cards.

### No findings drawer or panel
Findings are created via a modal (triggered by 🔖 bookmark) and listed in a lightweight popover from the study header badge. There is no persistent or slide-over panel. The chat is the only view.

---

## Sharing Model

Sharing happens **inline, from where you are**. The object you're looking at determines what gets shared.

| What you share | How | What the recipient gets |
|----------------|-----|------------------------|
| **Data card** | Click ↗ on a data card | Raw chart, numbers, metadata. No interpretation. Quick "did you see this?" |
| **Data card + AI interpretation** | Click ↗ on the AI interpretation block | The chart + the AI's provisional analysis bundled together. |
| **Finding** | Click ↗ on a saved finding (from popover or modal) | Polished insight with embedded charts, evidence, and edited conclusions. |
| **Report** | From report creation flow | Composed document with multiple findings, tailored to audience. |

No mandatory extraction step before sharing. No drawer to route through. Share what you see.

---

## Object Relationships

```
Study (Chat)
├── contains: Methods (survey, interview, focus group, etc.)
│   └── produce: Data Cards (raw results, immutable, in chat)
│       ├── action: 🔖 Save as finding → opens editing modal
│       ├── action: ↗ Share → sends data card to recipient
│       └── followed by: AI Interpretation (provisional analysis, in chat)
│           ├── action: 🔖 Save as finding → opens editing modal (card + interpretation)
│           └── action: ↗ Share → sends card + interpretation to recipient
├── saved findings: accessible via 🔖 badge in study header → popover list
├── tagged with: Labels (optional, multiple)

Finding (created via 🔖 modal)
├── sourced from: one Study
├── linked to: one or more Data Cards (provenance)
├── includes: embedded charts/visuals from data cards
├── evidence from: one or more Methods within that Study
├── included in: zero or more Reports
├── tagged with: Labels
├── shareable: via ↗ from popover or modal

Report
├── composed of: one or more Findings (from one or multiple Studies)
├── tagged with: Labels
├── shareable: as standalone document

Labels
├── applied to: Studies, Findings, Reports (cross-cutting)
```

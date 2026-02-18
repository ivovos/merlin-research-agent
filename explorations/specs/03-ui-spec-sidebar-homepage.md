# UI Spec: Sidebar & Homepage — Electric Twin

---

## Homepage

### Layout
The homepage has one job: get you into research as fast as possible.

```
┌─────────────────────────────────────────────┐
│                                             │
│     What do you want to find out?           │
│     ┌─────────────────────────────────┐     │
│     │                                 │     │
│     │   [Input field]                 │     │
│     │                                 │     │
│     └─────────────────────────────────┘     │
│                                             │
│     Recent studies                          │
│     ┌─────────────────────────────────┐     │
│     │ ● Onboarding churn study        │     │
│     │   Survey + 6 interviews · 2h ago│     │
│     ├─────────────────────────────────┤     │
│     │   Enterprise pricing research   │     │
│     │   Survey · yesterday            │     │
│     ├─────────────────────────────────┤     │
│     │   Competitor UX audit           │     │
│     │   🔖 3 findings · last week     │     │
│     ├─────────────────────────────────┤     │
│     │   ...                           │     │
│     └─────────────────────────────────┘     │
│                                             │
│     [Filter by label ▾]                     │
│                                             │
└─────────────────────────────────────────────┘
```

### Elements

**Input field**
- Prominent, centre-stage. The most important element on the page.
- Placeholder text: "What do you want to find out?"
- Typing and hitting enter creates a new study and drops you into the chat
- No "create study" button, no form with fields to fill. Just start typing your question.

**Recent studies list**
- Last 8-10 studies, sorted by most recent activity
- Each study card shows:
  - Study name / research question
  - Methods run (e.g. "Survey + 6 interviews")
  - Time since last activity
  - Blue dot (●) if something has changed since you last looked
  - Saved findings count (e.g. "🔖 3 findings")
- Click a study → enter the conversation where you left off

**Label filter**
- Sits below or above the study list
- Dropdown or inline pill selector
- Click a label → list filters to studies with that label

### What's NOT on the homepage
- No dashboard or metrics
- No "getting started" cards (after first use)
- No separate navigation to Findings or Reports
- No empty states with illustrations — the input field IS the empty state

---

## Sidebar

### Layout

```
┌──────────────────────┐
│  [+ New study]       │
│                      │
│  ┌────────────────┐  │
│  │ 🔍 Search...   │  │
│  └────────────────┘  │
│                      │
│  ● Onboarding churn  │
│    study             │
│    2h ago            │
│                      │
│    Enterprise pricing│
│    research          │
│    yesterday         │
│                      │
│    Competitor UX     │
│    audit             │
│    last week         │
│                      │
│    ...               │
│                      │
│  ──────────────────  │
│  [Audiences]         │
│  [Settings]          │
│                      │
└──────────────────────┘
```

### Elements

**New study button** — top, always visible, one click.

**Search / filter bar** — filter by name or label. Replaces "All studies" page.

**Study list** — sorted by most recent activity. Blue dot (●) for new results. Click to switch.

**Blue dot indicator** — appears when a study has new activity since last visit. Disappears when you enter the study. Like iMessage unread.

**When you enter a study with a blue dot:** the conversation scrolls to the first new content.

**Bottom section** — Audiences, Settings. Secondary actions, understated.

### What's NOT in the sidebar
- No "Studies" header with collapsible section
- No "All studies" link
- No "Findings" or "Reports" section
- No collapsible/expandable sections
- No project folders
- No notification badges with counts — just the blue dot

### Sidebar behaviour
- Always visible when inside a study
- Studies are "always there" — switching is instant, like tabs
- Sidebar stays the same when you enter a study — persistent study list

---

## Study View (when inside a study)

### Layout — Chat-first, no panels

The study view is sidebar + full-width chat. No side panels, no drawers. The chat is the entire workspace. Bookmark and share actions live inline on every data card and AI interpretation block.

```
┌──────────┬─────────────────────────────────────────────────┐
│          │                                                 │
│ Sidebar  │  Study: Onboarding churn study                  │
│          │  Labels: Onboarding · Enterprise                │
│ [+ New]  │  Methods: Survey (232) · 6 interviews           │
│          │  🔖 3 findings ←── clickable, opens popover     │
│ ● Study1 │  ───────────────────────────────────────────── │
│   Study2 │                                                 │
│   Study3 │  User: What did the survey show about           │
│   Study4 │  onboarding?                                    │
│          │                                                 │
│          │  ┌───────────────────────────────────────────┐  │
│          │  │ 📊 Survey: Onboarding Experience          │  │
│          │  │ 232 responses · 78% completion rate       │  │
│          │  │                                           │  │
│          │  │ Difficult      ████████████████  72%      │  │
│          │  │ Neutral         ████              18%     │  │
│          │  │ Easy             ███              10%     │  │
│          │  │                                           │  │
│          │  │ [Expand]              [🔖 Save]  [↗ Share]│  │
│          │  └───────────────────────────────────────────┘  │
│          │                                                 │
│          │  AI: This shows a strong skew toward            │
│          │  difficulty — 72% is notably high. It might     │
│          │  be worth looking at whether this differs       │
│          │  between enterprise and SMB users...            │
│          │                        [🔖 Save]  [↗ Share]    │
│          │                                                 │
│          │  💡 Would you like me to save this as a         │
│          │  finding?                                       │
│          │                                                 │
│          │  ───────────────────────────────────────────── │
│          │  [Input: ask, run, save finding]                │
│          │                                                 │
└──────────┴─────────────────────────────────────────────────┘
```

### Study header
- Study name / question
- Labels (clickable to add/remove)
- Method summary: "Survey: 232 responses · Interviews: 6 completed"
- **Findings badge: "🔖 3"** — clickable, opens a lightweight popover listing saved findings

### Findings badge → popover

When the researcher clicks "🔖 3" in the study header, a **popover** drops down showing saved findings:

```
┌─────────────────────────────────┐
│ 🔖 Saved Findings               │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ Onboarding is a critical    │ │
│ │ retention risk              │ │
│ │ Survey + interviews · 2h ago│ │
│ │              [Edit] [↗ Share]│ │
│ └─────────────────────────────┘ │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ Enterprise users have       │ │
│ │ unique onboarding needs     │ │
│ │ Survey · yesterday          │ │
│ │              [Edit] [↗ Share]│ │
│ └─────────────────────────────┘ │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ Calendar integration is the │ │
│ │ key friction point          │ │
│ │ Interviews · 2h ago        │ │
│ │              [Edit] [↗ Share]│ │
│ └─────────────────────────────┘ │
│                                 │
│ [+ Create report from findings] │
└─────────────────────────────────┘
```

- Lightweight popover, not a drawer or panel
- Each finding shows: title, provenance, [Edit] and [↗ Share] actions
- [Edit] opens the finding in a modal for editing
- [↗ Share] shares the finding directly
- Bottom action: create a report from selected findings
- Click outside to close — back in the chat instantly

### The chat
- Standard chat interface — messages from user and AI
- **Data cards** appear inline when methods produce results:
  - Structured, factual, immutable blocks showing raw data
  - No interpretation baked in — just the numbers, charts, quotes
  - Actions: [Expand] [🔖 Save] [↗ Share]
  - [Expand] shows full detail: individual responses, cross-tabs
  - [🔖 Save] triggers the bookmark/finding creation modal
  - [↗ Share] sends the data card to a recipient immediately
- **AI interpretation** appears as regular chat messages after data cards:
  - Provisional, conversational, challengeable
  - Actions at the end of the block: [🔖 Save] [↗ Share]
  - [🔖 Save] creates a finding from the data card + interpretation
  - [↗ Share] sends the card + interpretation bundled together
  - May include a suggestion chip: "💡 Would you like me to save this as a finding?"

### Bookmark → Finding modal

When the researcher clicks 🔖 Save on any element, a **modal** opens over the chat:

```
┌─────────────────────────────────────────────────┐
│                                                 │
│  Save as Finding                        [✕]    │
│  ─────────────────────────────────────────────  │
│                                                 │
│  Title                                          │
│  ┌─────────────────────────────────────────┐    │
│  │ Onboarding is a critical retention risk │    │
│  └─────────────────────────────────────────┘    │
│                                                 │
│  Key Insight                                    │
│  ┌─────────────────────────────────────────┐    │
│  │ 72% of users rate onboarding as         │    │
│  │ difficult, with enterprise users at 84% │    │
│  └─────────────────────────────────────────┘    │
│                                                 │
│  Evidence                                       │
│  ┌─────────────────────────────────────────┐    │
│  │ 📊 [embedded survey chart]              │    │
│  │                                         │    │
│  │ Difficult  ████████████████  72%        │    │
│  │ Neutral     ████              18%       │    │
│  │ Easy         ███              10%       │    │
│  │                                         │    │
│  │ 💬 "The calendar setup was confusing —  │    │
│  │ I didn't know why I needed it"          │    │
│  │ — Participant 3, Enterprise             │    │
│  └─────────────────────────────────────────┘    │
│                                                 │
│  Conclusion (editable)                          │
│  ┌─────────────────────────────────────────┐    │
│  │ Calendar integration friction is driving│    │
│  │ early churn. Simplifying this step      │    │
│  │ should be the top priority.             │    │
│  └─────────────────────────────────────────┘    │
│                                                 │
│  From: Survey (232 responses) · 6 interviews    │
│                                                 │
│  ┌────────────┐  ┌──────────────────────────┐   │
│  │ Save 🔖    │  │ Save & Share ↗           │   │
│  └────────────┘  └──────────────────────────┘   │
│                                                 │
└─────────────────────────────────────────────────┘
```

- All fields are AI-drafted and fully editable
- Evidence includes embedded charts pulled from data cards — visual, not text descriptions
- Two save options: just save (bookmark for later) or save & share immediately
- Close modal → back in the chat, finding is saved and badge count increments

### Inline share flow

When the researcher clicks ↗ Share on anything (data card, AI interpretation, or finding):

1. Lightweight share popover appears: pick a person or copy a link
2. Optionally add a note ("check out the onboarding numbers")
3. Send — done

No level selection needed for quick shares. Data card shares and interpretation shares are always snapshots. Finding shares carry the full polished content.

### Input field
- At the bottom, always visible
- Supports natural language: "run a survey about...", "what did participants say about...", "save that as a finding"

---

## Data Card Design

### Principles
- **Neutral presentation**: no colour-coding implying good/bad, no framing headlines
- **Structured for the method type**: surveys get distributions, interviews get quote cards, usability tests get completion rates
- **Immutable**: once data is in, it doesn't change
- **Expandable**: compact view in the chat, full detail on click
- **Two actions**: 🔖 Save (bookmark as finding) and ↗ Share (send as-is)

### Card types by method

**Survey results card** — question text, response distribution, sample size. [Expand]: cross-tabs, free-text.

**Interview/focus group card** — participant count, themes as tags, representative quotes. [Expand]: full quote library.

**Usability test card** — task completion rates, time on task, error counts. [Expand]: individual journeys.

**Analytics card** — key metrics, trend direction, comparison to previous period. [Expand]: full data tables.

# Sharing Framework — Electric Twin

## Core Principle

Sharing happens **inline, from where you are**. Every data card, AI interpretation, and finding has two actions: 🔖 Save (bookmark as finding) and ↗ Share (send as-is). No drawer to route through, no mandatory extraction step. Share what you see.

---

## Two Inline Actions on Everything

Every shareable element in the chat carries two persistent actions:

| Action | Icon | What it does |
|--------|------|--------------|
| **Save as finding** | 🔖 Bookmark | Opens a modal where the AI drafts a finding from this element + surrounding context. Researcher edits and saves. |
| **Share** | ↗ Share | Sends the element as-is to a recipient. Quick, no editing step. "Did you see this?" |

These two actions appear on:
- **Data cards** — raw results from methods
- **AI interpretation blocks** — the AI's provisional analysis
- **Saved findings** — in the findings popover from the header badge

---

## What Can Be Shared

### 1. Data Card (quick share — "did you see this?")

**What the recipient gets:**
- The raw chart, numbers, and metadata from a method
- No interpretation, no framing — just the data
- A clean, structured snapshot

**Sender flow:**
1. Click ↗ Share on any data card in the chat
2. Pick a person or copy a link
3. Optionally add a note ("check out these onboarding numbers")
4. Send — done

**When this is used:**
- Quick "heads up" to a colleague
- Sharing a surprising result before you've analysed it
- Getting someone else's read on the raw data

---

### 2. Data Card + AI Interpretation (share with analysis)

**What the recipient gets:**
- The data card AND the AI's provisional interpretation, bundled together
- The chart plus the AI's initial take

**Sender flow:**
1. Click ↗ Share on the AI interpretation block (below a data card)
2. The system bundles the data card + interpretation together
3. Pick a person, add optional note, send

**When this is used:**
- Sharing a result with some initial framing
- "Here's what the survey showed and what the AI thinks it means"
- Starting a conversation with a teammate about what the data suggests

---

### 3. Finding (the polished share — ~70% of deliberate sharing)

**What the recipient gets:**
- A self-contained insight with title, key insight, embedded visual evidence, and edited conclusions
- Provenance line: "From: Onboarding churn study — based on survey (232 responses) + 6 interviews"
- A professional, readable artifact

**Sender flow:**
1. Click 🔖 Save on a data card or AI interpretation (or ask in chat, or accept AI suggestion)
2. Modal opens with AI-drafted title, insight, evidence (including embedded charts), conclusions
3. Researcher edits — especially conclusions and recommendations
4. Save → finding is bookmarked in the study header badge ("🔖 3")
5. From the findings popover (click the badge), click ↗ Share on any finding
6. Pick recipient, add optional note, send

**Recipient experience:**
- Receives a clean, readable finding — feels like a well-written message with structure and visual evidence
- Can see the charts and data that support the conclusions
- Can see which study and methods produced this finding (credibility signal)
- Cannot edit (it's a snapshot from the sender)

---

### 4. Report (the composed case — ~20% of sharing)

**What the recipient gets:**
- A composed document with multiple findings, editorial commentary, and recommendations
- Structured for their audience (exec summary format vs. detailed research readout)
- Self-contained — makes sense without any additional context

**Sender flow:**
1. From the findings popover, click "Create report from findings"
2. Select findings to include (from one or multiple studies)
3. AI helps compose: generates an executive summary, suggests ordering, fills transitions
4. User edits everything — reorders sections, rewrites conclusions, adds/removes findings
5. Share → picks recipients and format

**When this is used:**
- Communicating across multiple studies ("what did we learn about the German market?")
- Stakeholder updates that need narrative structure
- Formal research deliverables

---

### 5. Study (the handoff case — ~10% of sharing)

**What the recipient gets:**
- The full conversation thread, all methods and their data, any findings already saved
- The ability to **continue the conversation** — ask new questions, run new methods, save new findings
- Full context from the AI (it remembers everything)

**Sender flow:**
1. From the study header or sidebar, share the study
2. Select recipient
3. Optionally add a handoff note ("I've done the survey analysis, can you run the follow-up interviews?")

**When this is used:**
- Research team handoffs ("I started this, you finish it")
- Collaborative research
- Onboarding a new team member to an ongoing research initiative

---

## Sharing Levels

When sharing a Finding or Report, the sender picks a level:

| Level | What's included | Who it's for |
|-------|----------------|--------------|
| **Snapshot** | The finding/report only. Read-only. No conversation access. | Stakeholders, execs — anyone who needs the "what" not the "how" |
| **With context** | The finding/report + ability to view the source conversation (read-only). | Teammates who want to understand the reasoning |
| **Full handoff** | Everything — conversation, data, methods, ability to continue. | Research collaborators picking up an active study |

The default is **Snapshot** — the safest, simplest option. Most sharing doesn't need the full conversation.

---

## Sharing Mechanics

### How sharing is delivered
- **Internal (same team):** Finding/report appears in the recipient's sidebar or a shared feed. Blue dot indicates new shared content.
- **External (outside the team):** Generates a link. The recipient opens a clean, branded view. No account required for snapshot. Account required for "with context" or "full handoff."

### Versioning
- Each share is a **snapshot at a point in time**. If the sender updates the finding later, the recipient doesn't see the update automatically.
- The sender can **reshare an updated version**, which appears as a new share with a note: "Updated: Onboarding churn finding (v2)"
- This prevents surprises — nobody's shared finding changes under their feet.

### Permissions
- **Findings and Reports:** Recipients can view but not edit. The sender is the author.
- **Studies:** When shared with full handoff, the recipient has equal access.

---

## The Data → Interpretation → Finding Pipeline

When a method produces results in the chat, two things appear:

1. **Data card** — raw, immutable, factual. Shows what the data says without interpretation. Actions: [Expand] [🔖 Save] [↗ Share]

2. **AI interpretation** — a regular chat message after the data card. Provisional analysis that provokes thinking. Actions: [🔖 Save] [↗ Share]

### Three paths to creating a finding

1. **🔖 Bookmark on a data card or AI interpretation** — opens the editing modal with the AI's draft. The most common path. Point at a result, save it as a finding.

2. **Ask in chat** — "I think the key finding is that enterprise users churn because of calendar integration — save that as a finding." AI drafts it, opens the modal.

3. **AI suggests** — after significant analysis, the AI offers: "💡 Would you like me to save this as a finding?" Researcher clicks to accept, modal opens with draft.

### The editing modal

All three paths lead to the same place — a **modal** that opens over the chat:

- AI-drafted title, key insight, evidence (including embedded charts from data cards), conclusions
- Researcher edits any field — especially conclusions (this is where human judgment matters)
- Two save options: **Save** (bookmark for later) or **Save & Share** (send immediately)
- Close modal → back in the chat, finding is saved and badge count increments

### Where findings live

Saved findings are accessible via the **🔖 badge** in the study header ("🔖 3"). Clicking it opens a lightweight **popover** listing all findings with [Edit] and [↗ Share] actions on each. Click outside to close — back in the chat instantly.

---

## Why This Matters

The inline bookmark + share model eliminates the friction between research and communication. There's no drawer to open, no extraction step to route through, no mode switch. The researcher sees data, makes sense of it, and shares it — all from the same surface.

The separation of data cards (immutable evidence) from AI interpretation (provisional analysis) from findings (researcher's definitive take) preserves the researcher's authority. The system presents facts, offers a perspective, and lets the researcher decide what it means — and when it's ready to share.

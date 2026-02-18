# Claude Code Prompt: Add Inline Action Strip to Data Cards & AI Commentary

## Context

We're building Electric Twin, a chat-based research tool. The chat contains two types of structured blocks that need inline action buttons:

1. **Data Cards** — structured, immutable blocks showing raw research results (survey charts, interview quotes, analytics). They already have an [Expand] button.
2. **AI Interpretation blocks** — the AI's provisional analysis that appears as a chat message after a data card. These already have copy, thumbs-up, and thumbs-down buttons.

We need to add two new actions to both block types: **🔖 Save as Finding** and **↗ Share**. These should sit alongside the existing actions in a consistent action strip at the bottom of each block.

## What to Build

### 1. Action Strip Component

Create a reusable `ActionStrip` component that renders a horizontal row of small icon buttons. This strip appears at the bottom of data cards and AI interpretation blocks.

**Props:**
- `variant`: `"data-card"` | `"ai-interpretation"` — controls which buttons appear
- `onSave`: callback when 🔖 bookmark is clicked
- `onShare`: callback when ↗ share is clicked
- `onCopy`: callback when copy is clicked (AI interpretation only)
- `onThumbsUp`: callback when 👍 is clicked (AI interpretation only)
- `onThumbsDown`: callback when 👎 is clicked (AI interpretation only)
- `onExpand`: callback when expand is clicked (data card only)
- `isSaved`: boolean — whether this item has already been bookmarked (toggle state on the bookmark icon)

**Visual spec:**
- Height: ~32px strip, horizontally laid out
- Background: subtle — `transparent` or very light gray on hover
- Icons: 16–18px, muted gray (`#8890A8`) by default, accent color (`#4A6FA5`) on hover
- Spacing: 8px gap between icons
- The strip sits at the bottom of the card, separated by a 1px top border
- Left-aligned group and right-aligned group:
  - **Data card:** Left: `[Expand]` — Right: `[🔖 Save] [↗ Share]`
  - **AI interpretation:** Left: `[👍] [👎] [📋 Copy]` — Right: `[🔖 Save] [↗ Share]`

### 2. Button Design

Each button in the strip:
- Icon only (no label text) at rest
- Tooltip on hover showing the action name: "Save as finding", "Share", "Copy", "Good response", "Bad response", "Expand details"
- Subtle hover state: icon color goes from muted gray to accent blue (`#4A6FA5`)
- Active/pressed: brief scale-down animation (0.95 scale, 100ms)
- The 🔖 bookmark icon should have a **filled state** when `isSaved` is true (filled bookmark in accent color) and an **outline state** when not yet saved

**Icon choices** (use your icon library — lucide-react, heroicons, or similar):
- 🔖 Save: `Bookmark` (outline) / `BookmarkCheck` or filled `Bookmark` (when saved)
- ↗ Share: `Share2` or `ExternalLink` or `ArrowUpRight`
- 📋 Copy: `Copy` or `Clipboard`
- 👍 Good: `ThumbsUp`
- 👎 Bad: `ThumbsDown`
- Expand: `ChevronDown` or `Maximize2`

### 3. Where to Place the Action Strip

**On Data Cards:**
The data card is a bordered container in the chat. The action strip goes at the very bottom, below the chart/content area, separated by a 1px border-top.

```
┌──────────────────────────────────────────┐
│ 📊 Survey: Onboarding Experience         │  ← card header
│ 232 responses · 78% completion rate      │
│──────────────────────────────────────────│
│                                          │
│ [chart / data content area]              │  ← card body
│                                          │
│──────────────────────────────────────────│
│ ⤢ Expand              🔖 Save   ↗ Share │  ← action strip
└──────────────────────────────────────────┘
```

**On AI Interpretation blocks:**
The AI message has a slightly different background (light gray bubble or subtle border). The action strip sits at the bottom-right of the message block, flush with the message bubble.

```
┌──────────────────────────────────────────┐
│ This shows a strong skew toward          │
│ difficulty — 72% is notably high...      │
│                                          │
│──────────────────────────────────────────│
│ 👍  👎  📋             🔖 Save   ↗ Share │  ← action strip
└──────────────────────────────────────────┘
```

The thumbs/copy buttons sit on the left, bookmark/share on the right. This separates "feedback on AI quality" (left) from "do something with this content" (right).

### 4. Interaction Behaviour

**🔖 Save (bookmark) button:**
- Click → fires `onSave` callback
- The callback should trigger a "Save as Finding" modal (the modal itself is out of scope for this task — just fire the callback)
- After saving, `isSaved` flips to `true` and the icon fills in
- If already saved, clicking again could open the existing finding for editing (pass through to the callback, don't handle the logic here)

**↗ Share button:**
- Click → fires `onShare` callback
- The callback should trigger a share popover (out of scope — just fire the callback)
- No toggle state — share is always an action, not a state

**📋 Copy button:**
- Click → fires `onCopy` callback (typically copies the message text to clipboard)
- Brief visual feedback: icon swaps to a checkmark for 1.5 seconds, then back to copy icon

**👍 / 👎 buttons:**
- Click → fires respective callback
- Toggle state: clicked button gets accent color fill, the other resets to outline
- Only one can be active at a time (radio behaviour)

**Expand button (data cards only):**
- Click → fires `onExpand` callback
- Icon rotates 180° when expanded (chevron down → chevron up)

### 5. Responsiveness

- On narrow viewports (< 480px), the strip should still show all icons but can reduce spacing to 4px
- Icons should never wrap to a second line — if truly cramped, the left group can be hidden behind a `•••` overflow menu, but the 🔖 and ↗ buttons on the right should ALWAYS be visible

### 6. Accessibility

- Each icon button should have `aria-label` with the full action name
- Keyboard focusable with visible focus ring
- Tab order: left to right through the strip
- `aria-pressed` on toggle buttons (bookmark, thumbs up/down)

## Files to Create / Modify

1. **Create** `ActionStrip` component (e.g. `components/ActionStrip.tsx` or `.jsx`)
2. **Create** or extract individual `IconButton` subcomponent if one doesn't exist
3. **Modify** the Data Card component to include `<ActionStrip variant="data-card" ... />` at the bottom
4. **Modify** the AI Interpretation / chat message component to include `<ActionStrip variant="ai-interpretation" ... />` at the bottom of AI messages

## Design Tokens / Colours

```
NAVY:    #1E2761  (headings, dark text)
ACCENT:  #4A6FA5  (interactive elements, hover states, active icons)
MUTED:   #8890A8  (default icon color, secondary text)
BORDER:  #E8ECF2  (strip separator line)
GREEN:   #27AE60  (saved/success state — optional for bookmark filled)
BODY:    #3A3F5C  (body text)
```

## What NOT to Build

- The "Save as Finding" modal — just fire the `onSave` callback
- The share popover — just fire the `onShare` callback
- Any backend/API integration — this is purely a front-end component
- Don't change the content or layout of the data card body or AI message body — only add the action strip at the bottom

## Example Usage

```tsx
// On a data card
<DataCard data={surveyResults}>
  <ActionStrip
    variant="data-card"
    onExpand={() => setExpanded(!expanded)}
    onSave={() => openFindingModal(surveyResults)}
    onShare={() => openSharePopover(surveyResults)}
    isSaved={savedFindings.includes(surveyResults.id)}
  />
</DataCard>

// On an AI interpretation message
<AiMessage content={interpretation}>
  <ActionStrip
    variant="ai-interpretation"
    onCopy={() => copyToClipboard(interpretation.text)}
    onThumbsUp={() => rateMessage(interpretation.id, 'up')}
    onThumbsDown={() => rateMessage(interpretation.id, 'down')}
    onSave={() => openFindingModal(interpretation, parentDataCard)}
    onShare={() => openSharePopover(interpretation, parentDataCard)}
    isSaved={savedFindings.includes(interpretation.id)}
  />
</AiMessage>
```

## Acceptance Criteria

- [ ] `ActionStrip` component renders correctly in both `data-card` and `ai-interpretation` variants
- [ ] Bookmark icon toggles between outline and filled states based on `isSaved` prop
- [ ] Copy button shows checkmark feedback for 1.5s after click
- [ ] Thumbs up/down behave as radio buttons (only one active)
- [ ] Expand chevron rotates when expanded
- [ ] All buttons have tooltips and `aria-label`
- [ ] Action strip is visually consistent across data cards and AI interpretation blocks
- [ ] 🔖 and ↗ are always on the right side of the strip
- [ ] Feedback/utility actions (thumbs, copy, expand) are always on the left
- [ ] Hover and active states follow the colour spec
- [ ] The strip doesn't break or wrap on narrow viewports

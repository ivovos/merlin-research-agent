# Claude Code Prompt: Findings Experience — Badge, Lightbox, Conclusions & Sharing

## Context

We're building Electric Twin, a chat-based research tool. When AI presents research results (data cards with bar charts, AI interpretation blocks), the user can **save** any of these as a "finding" using the existing 🔖 Bookmark button on the `ActionStrip` component.

Right now, saving is wired (the `ActionStrip` already toggles a `BookmarkCheck` icon) but **there's nowhere to view, edit, or share saved findings**. We need the full findings experience:

1. A **findings badge** in the study header showing a live count
2. A **findings lightbox** (dialog) with a list of all saved findings
3. Each finding shows a **mini chart thumbnail** in the list for visual scanning
4. A **detail view** inside the lightbox with evidence (chart + quote), an **editable AI-suggested conclusion**, and Copy / Share actions
5. A **Share all** action from the list view to share the full set of findings
6. Proper state management connecting the ActionStrip bookmark toggles to the findings collection

## What to Build

### 1. Extend the `Finding` Type

**File:** `types/survey.ts`

Add an optional `conclusion` field to the existing `Finding` interface:

```typescript
export interface Finding {
  questionId: string
  questionText?: string
  headline: string
  insight: string
  chartType: 'bar' | 'stacked_bar' | 'radar' | 'table' | 'heatmap' | 'line' | 'grouped_bar'
  chartData: Record<string, unknown>[]
  segmentBreakdowns?: SegmentBreakdown[]
  editable: boolean
  percentile?: number
  normValue?: number
  stimuliIds?: string[]
  // ── NEW ──
  conclusion?: string        // AI-suggested conclusion, editable by user
  savedAt?: number           // timestamp when bookmarked
  sourceQuote?: {            // optional verbatim quote from respondent
    text: string
    attribution: string      // e.g. "Participant 3, Enterprise"
  }
}
```

### 2. Findings Store / State

**Create:** `hooks/useFindingsStore.ts`

A lightweight Zustand store (or React context — match whatever pattern `useProjectStore` uses) to track saved findings per study:

```typescript
interface FindingsStore {
  // Map of studyId → saved Finding[]
  findings: Record<string, Finding[]>

  // Add a finding (called when ActionStrip bookmark is toggled ON)
  saveFinding: (studyId: string, finding: Finding) => void

  // Remove a finding (called when bookmark is toggled OFF)
  removeFinding: (studyId: string, questionId: string) => void

  // Check if a specific finding is saved
  isSaved: (studyId: string, questionId: string) => boolean

  // Get count for a study
  getCount: (studyId: string) => number

  // Update the conclusion text for a finding
  updateConclusion: (studyId: string, questionId: string, conclusion: string) => void
}
```

When a finding is first saved, auto-generate a `conclusion` from the `insight` field (prefix with "This suggests..." or similar). The conclusion is the **one editable field** — everything else (chart, quote, headline) is locked evidence.

### 3. Findings Badge in Study Header

**Modify:** `components/results/FindingsCanvas.tsx`

Add a findings badge to the header bar, between the title/respondent count and the action buttons:

```
┌──────────────────────────────────────────────────────────────────┐
│ [📊] Study Name  400 respondents  [🔖 3]  [Open Plan] [^] [⋮] │
└──────────────────────────────────────────────────────────────────┘
```

**Badge spec:**

```tsx
<Button
  variant="outline"
  size="sm"
  className="h-7 text-xs gap-1 font-semibold text-foreground hover:bg-accent"
  onClick={() => setFindingsOpen(true)}
>
  <Bookmark className="w-3.5 h-3.5" />
  <span>{findingsCount}</span>
</Button>
```

- Only visible when `findingsCount > 0`
- Sits in the `flex items-center gap-0.5 shrink-0` row with existing buttons
- Uses `Bookmark` icon from lucide-react (same as ActionStrip)
- Click opens the findings lightbox

### 4. Findings Lightbox (Dialog)

**Create:** `components/results/FindingsLightbox.tsx`

Use the existing `Dialog` / `DialogContent` primitives from `@/components/ui/dialog`. The lightbox has two views: **list** and **detail**.

**Props:**

```typescript
interface FindingsLightboxProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  studyId: string
  studyName: string
}
```

**Dialog container:**

```tsx
<Dialog open={open} onOpenChange={onOpenChange}>
  <DialogContent className="max-w-lg p-0 overflow-hidden max-h-[88vh] flex flex-col">
    <DialogTitle className="sr-only">Saved Findings</DialogTitle>
    <DialogDescription className="sr-only">
      View and share findings from {studyName}
    </DialogDescription>
    {/* header + content + footer */}
  </DialogContent>
</Dialog>
```

Increase to `max-w-xl` when in detail view (use a `data-view` attribute or conditional class).

#### 4a. Lightbox Header

```
┌─────────────────────────────────────────────┐
│ [←]  🔖 Saved Findings            [✕]      │  ← list view
│       3 findings from this study            │
├─────────────────────────────────────────────┤
│ [←]  Finding                       [✕]      │  ← detail view
└─────────────────────────────────────────────┘
```

- **Back button** (`ChevronLeft`): only in detail view, returns to list
- **Title**: "🔖 Saved Findings" (list) / "Finding" (detail)
- **Subtitle**: "{n} finding(s) from this study" (list only)
- **Close button**: standard dialog close (`X` icon, `w-4 h-4`)

```tsx
<div className="flex items-center justify-between px-5 py-4 border-b border-border">
  <div className="flex items-center gap-2.5">
    {selectedFinding && (
      <Button variant="outline" size="icon" className="h-7 w-7" onClick={goBack}>
        <ChevronLeft className="w-4 h-4" />
      </Button>
    )}
    <div>
      <h2 className="text-sm font-semibold text-foreground">
        {selectedFinding ? 'Finding' : '🔖 Saved Findings'}
      </h2>
      {!selectedFinding && (
        <p className="text-xs text-muted-foreground mt-0.5">
          {count} finding{count !== 1 ? 's' : ''} from this study
        </p>
      )}
    </div>
  </div>
</div>
```

#### 4b. List View — Finding Rows with Mini Chart Thumbnails

Each row is a clickable button with three columns: **mini thumbnail**, **text**, **chevron**.

```
┌─────────────────────────────────────────────────────┐
│ [▓▓▓░] Onboarding is a critical retention risk   > │
│ [▓░░░] 72% of users rate onboarding as difficult   │
│ [▓▓░░] Survey (232) · 2h ago                       │
├─────────────────────────────────────────────────────┤
│ [▓▓░░] Enterprise users have unique needs         > │
│        ...                                          │
├─────────────────────────────────────────────────────┤
│ [ "" ] Calendar integration is the friction point > │  ← quote icon
│        ...                                          │
├─────────────────────────────────────────────────────┤
│         + Create report from findings               │  ← dashed CTA
└─────────────────────────────────────────────────────┘
```

**Mini chart thumbnail component:**

```tsx
function MiniChartThumb({ finding }: { finding: Finding }) {
  const rows = (finding.chartData ?? []).map(d => ({
    value: Number(d.value ?? 0),
  }))
  const max = Math.max(...rows.map(r => r.value), 1)

  if (rows.length > 0) {
    return (
      <div className="w-14 h-10 rounded-md border border-border bg-muted/50 p-1.5 flex flex-col justify-center gap-0.5 shrink-0">
        {rows.slice(0, 4).map((r, i) => (
          <div key={i} className="h-1 bg-border rounded-full overflow-hidden">
            <div
              className="h-full rounded-full"
              style={{
                width: `${(r.value / max) * 100}%`,
                backgroundColor: DEFAULT_BRAND_COLORS.primary,
              }}
            />
          </div>
        ))}
      </div>
    )
  }

  // Quote-only finding — show quote icon
  if (finding.sourceQuote) {
    return (
      <div className="w-14 h-10 rounded-md border border-border bg-muted/50 flex items-center justify-center shrink-0">
        <Quote className="w-4 h-4 text-muted-foreground" />
      </div>
    )
  }

  return null
}
```

**Row styling:**

```tsx
<button
  className="w-full flex items-start gap-3 p-3.5 rounded-lg hover:bg-muted/50 transition-colors text-left"
  onClick={() => setSelectedFinding(f.questionId)}
>
  <MiniChartThumb finding={f} />
  <div className="flex-1 min-w-0">
    <p className="text-sm font-semibold text-foreground leading-snug mb-0.5">
      {f.headline}
    </p>
    <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed mb-1.5">
      {f.insight}
    </p>
    <div className="flex items-center gap-2 text-[11px] text-muted-foreground/60">
      <span>{f.source ?? 'Survey'}</span>
      <span>·</span>
      <span>{timeAgo(f.savedAt)}</span>
    </div>
  </div>
  <ChevronRight className="w-4 h-4 text-border mt-0.5 shrink-0" />
</button>
```

#### 4c. Detail View — Evidence + Editable Conclusion

When user clicks a finding row, transition to detail view inside the same dialog.

```
┌─────────────────────────────────────────────┐
│ [←] Finding                          [✕]    │
├─────────────────────────────────────────────┤
│                                             │
│ Onboarding is a critical retention risk     │  ← headline (font-display)
│                                             │
│ 72% of users rate onboarding as difficult,  │  ← insight (text-sm)
│ with enterprise users reaching 84%.         │
│                                             │
│ EVIDENCE                                    │  ← section label
│ ┌─────────────────────────────────────────┐ │
│ │ How would you rate the onboarding...    │ │  ← bar chart (reuse BarRow)
│ │ Difficult  [█████████] 72%             │ │
│ │ Neutral    [███░░░░░░] 18%             │ │
│ │ Easy       [█░░░░░░░░] 10%            │ │
│ ├─────────────────────────────────────────┤ │
│ │ "The calendar setup was confusing..."   │ │  ← quote (if present)
│ │ — Participant 3, Enterprise             │ │
│ └─────────────────────────────────────────┘ │
│                                             │
│ CONCLUSION                         [Edit]   │  ← editable
│ ┌─────────────────────────────────────────┐ │
│ │ Calendar integration friction is...     │ │
│ └─────────────────────────────────────────┘ │
│ AI-suggested · click to edit                │
│                                             │
│ From: Survey (232 responses) · 6 interviews │  ← source
│                                             │
├─────────────────────────────────────────────┤
│ [Copy]                            [Share ↗] │  ← footer
└─────────────────────────────────────────────┘
```

**Evidence panel** — reuses the exact same `BarRow` component from `FindingCard.tsx`:

```tsx
<div className="bg-muted/50 rounded-lg border border-border overflow-hidden">
  {/* Bar chart */}
  {rows.length > 0 && (
    <div className="p-4 space-y-2.5">
      <p className="text-xs text-muted-foreground mb-2">
        {finding.questionText}
      </p>
      {rows.map((row, i) => (
        <BarRow key={i} label={row.label} value={row.value} maxValue={maxValue} />
      ))}
    </div>
  )}

  {/* Quote */}
  {finding.sourceQuote && (
    <div className={cn("p-4", rows.length > 0 && "border-t border-border")}>
      <blockquote className="text-sm text-foreground/80 italic leading-relaxed border-l-2 border-border pl-3">
        "{finding.sourceQuote.text}"
        <footer className="text-xs text-muted-foreground not-italic mt-1">
          — {finding.sourceQuote.attribution}
        </footer>
      </blockquote>
    </div>
  )}
</div>
```

**Conclusion field** — the ONE editable field:

```tsx
const [editing, setEditing] = useState(false)

{/* Section label + Edit button */}
<div className="flex items-center justify-between mb-2">
  <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
    Conclusion
  </span>
  <Button
    variant="ghost"
    size="sm"
    className="h-auto py-0 px-1 text-xs font-medium"
    onClick={() => setEditing(!editing)}
  >
    {editing ? 'Done' : 'Edit'}
  </Button>
</div>

{editing ? (
  <Textarea
    value={conclusion}
    onChange={(e) => setConclusion(e.target.value)}
    onBlur={() => {
      updateConclusion(studyId, finding.questionId, conclusion)
      setEditing(false)
    }}
    autoFocus
    className="text-sm leading-relaxed min-h-[80px] resize-y"
  />
) : (
  <div
    onClick={() => setEditing(true)}
    className="text-sm text-foreground leading-relaxed p-3 rounded-lg border border-border
               cursor-pointer hover:border-muted-foreground/30 transition-colors"
  >
    {conclusion}
  </div>
)}
<p className="text-[11px] text-muted-foreground mt-1.5">AI-suggested · click to edit</p>
```

#### 4d. Footer Actions

**List view footer** — Share all + Copy all:

```tsx
<div className="flex items-center gap-2 px-5 py-3 border-t border-border">
  <Button variant="outline" size="sm" className="gap-1.5" onClick={handleCopyAll}>
    {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
    {copied ? 'Copied all' : 'Copy all'}
  </Button>
  <div className="flex-1" />
  <ShareButton label="Share all" onShare={handleShareAll} />
</div>
```

**Detail view footer** — Copy single + Share single:

```tsx
<div className="flex items-center gap-2 px-5 py-3 border-t border-border">
  <Button variant="outline" size="sm" className="gap-1.5" onClick={handleCopy}>
    {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
    {copied ? 'Copied' : 'Copy'}
  </Button>
  <div className="flex-1" />
  <ShareButton label="Share" onShare={handleShare} />
</div>
```

**Share button** — primary style, opens a popover with team members:

```tsx
function ShareButton({ label, onShare }: { label: string; onShare: () => void }) {
  return (
    <Button size="sm" className="gap-1.5" onClick={onShare}>
      <SquareArrowOutUpRight className="w-3.5 h-3.5" />
      {label}
    </Button>
  )
}
```

**Copy handler** — grabs formatted text for Slack / decks:

```typescript
const handleCopy = () => {
  const f = selectedFinding
  const text = [
    `**${f.headline}**`,
    '',
    f.insight,
    '',
    ...(f.chartData ?? []).map(d => `${d.name}: ${d.value}%`),
    '',
    f.sourceQuote ? `"${f.sourceQuote.text}" — ${f.sourceQuote.attribution}` : '',
    '',
    `Conclusion: ${conclusion}`,
  ].filter(Boolean).join('\n')

  navigator.clipboard.writeText(text)
}
```

### 5. Wire Up ActionStrip → Findings Store

**Modify:** `components/results/FindingsCanvas.tsx` and `components/chat/AIMessage.tsx`

Currently `ActionStrip` has `onSave` callbacks that toggle local state. Wire them to the findings store:

```tsx
// In FindingsCanvas.tsx, when rendering FindingCard:
<ActionStrip
  variant="data-card"
  isSaved={findingsStore.isSaved(studyId, finding.questionId)}
  onSave={() => {
    if (findingsStore.isSaved(studyId, finding.questionId)) {
      findingsStore.removeFinding(studyId, finding.questionId)
    } else {
      findingsStore.saveFinding(studyId, finding)
    }
  }}
  onShare={handleShare}
  onExpand={() => setExpanded(prev => !prev)}
/>
```

### 6. Share Popover Component

**Create:** `components/results/SharePopover.tsx`

A reusable popover (use Radix `Popover` from `@/components/ui/popover`) showing team members + copy link.

```tsx
interface SharePopoverProps {
  trigger: React.ReactNode
  title: string           // "Share finding" or "Share 3 findings"
  onShareWithUser?: (userId: string) => void
  onCopyLink?: () => void
}
```

**Visual spec:**
- Width: `w-64`
- Shows 3–5 team member rows (avatar circle + name + role)
- Divider, then "Copy link" row with Link icon
- Matches existing `DropdownMenu` visual weight

```
┌────────────────────────────────┐
│ Share 3 findings               │
│                                │
│ (SC) Sarah Chen     Product    │
│ (MW) Marcus Webb    Design     │
│ (PP) Priya Patel    Research   │
│ ───────────────────────────    │
│ 🔗 Copy link                  │
└────────────────────────────────┘
```

## Files to Create

| File | Purpose |
|------|---------|
| `components/results/FindingsLightbox.tsx` | Main lightbox dialog with list + detail views |
| `components/results/MiniChartThumb.tsx` | Small chart thumbnail for list rows |
| `components/results/SharePopover.tsx` | Reusable share-with-team popover |
| `hooks/useFindingsStore.ts` | Zustand store (or context) for saved findings |

## Files to Modify

| File | Change |
|------|--------|
| `types/survey.ts` | Add `conclusion?`, `savedAt?`, `sourceQuote?` to `Finding` |
| `components/results/FindingsCanvas.tsx` | Add findings badge to header, wire ActionStrip to store, add lightbox trigger |
| `components/results/FindingCard.tsx` | Wire kebab menu "Save as finding" to store |
| `components/chat/AIMessage.tsx` | Wire ActionStrip `onSave` to store |

## What NOT to Build

- **Report generation** — the "+ Create report from findings" is a placeholder, leave it as a dashed button with no handler
- **Real sharing backend** — Share buttons should call `onShare` callbacks but the actual sharing API is out of scope. Show the popover UI only
- **Drag-to-reorder** findings in the list
- **Finding deletion from lightbox** — user can un-bookmark from the ActionStrip in chat, which removes it from the store
- **Multi-study findings** — findings are scoped per study, no cross-study view yet

## Design Tokens Reference

Use these existing patterns (don't introduce new colors):

| Token | Usage |
|-------|-------|
| `text-foreground` | Primary text (headlines, conclusion) |
| `text-muted-foreground` | Secondary text (labels, metadata) |
| `bg-muted/50` | Evidence panel background, thumbnail background |
| `border-border` | All borders |
| `bg-background` | Card and dialog backgrounds |
| `font-display` | Finding headlines (Cabinet Grotesk) |
| `DEFAULT_BRAND_COLORS.primary` | Bar chart color (`#2768E3`) |
| Button `variant="ghost"` `size="icon"` `h-7 w-7` | Icon buttons (matches ActionStrip) |
| Button `variant="outline"` `size="sm"` | Secondary actions (Copy, back) |
| Button default (primary) `size="sm"` | Primary actions (Share) |

## Component Hierarchy

```
FindingsCanvas (existing)
  ├── Header bar
  │     ├── ... existing buttons ...
  │     └── FindingsBadge (NEW — Bookmark icon + count)
  ├── FindingCard[] (existing)
  │     └── ActionStrip (existing, now wired to store)
  └── FindingsLightbox (NEW)
        ├── List View
        │     ├── FindingRow[] (with MiniChartThumb)
        │     ├── "+ Create report" placeholder
        │     └── Footer: [Copy all] [Share all]
        └── Detail View
              ├── Headline + insight
              ├── Evidence panel (BarRow[] + quote)
              ├── Editable conclusion
              ├── Source line
              └── Footer: [Copy] [Share]
```

## Acceptance Criteria

- [ ] Findings badge appears in FindingsCanvas header when 1+ findings are saved
- [ ] Badge count updates in real-time as user toggles bookmarks on ActionStrip
- [ ] Clicking the badge opens the findings lightbox
- [ ] List view shows all saved findings with mini chart thumbnails
- [ ] Findings with chart data show tiny colored bars in the thumbnail
- [ ] Findings with only quotes show a quote icon thumbnail
- [ ] Clicking a finding row navigates to detail view with animation
- [ ] Detail view displays the full bar chart using the existing `BarRow` component
- [ ] Detail view shows source quote in blockquote style (when present)
- [ ] Conclusion field shows AI-suggested text, is editable via click or Edit button
- [ ] Conclusion edits persist in the findings store
- [ ] Copy button grabs formatted text (headline + insight + data + conclusion)
- [ ] "Copy all" from list view grabs all findings as formatted text
- [ ] Share button opens a team member popover
- [ ] "Share all" from list view opens the same popover with "Share N findings" title
- [ ] Back button in detail view returns to list
- [ ] Dialog can be closed via X button, backdrop click, or Escape
- [ ] All buttons use existing shadcn Button component with correct variants
- [ ] All tooltips use existing Tooltip component with 300ms delay
- [ ] Animations use existing Tailwind `animate-in` / `fade-in` classes
- [ ] No new colors introduced — all styling uses existing design tokens

# Homepage Redesign — Two-Path Entry

**Reference mockup**: `homepage-pills-mockup.jsx` (open in Antigravity to interact)

## Overview

The homepage currently has a single entry point: a `ChatInputBar` with an embedded "Add Method" button that opens the `MethodsPicker` lightbox. The redesign splits this into two clearly separated entry paths:

1. **Input bar** — conversational, AI-led. The user types a research question and the AI figures out the method. The bar contains only `[+]` attach, `Audience`, and `Send`. No method button.
2. **Pill row** — manual, method-first. Sits directly below the input bar. Starts with a `🔍 All methods` button (opens the existing `MethodsPicker` lightbox), then a thin vertical divider, then curated shortcut pills (Quick Poll, Survey, Message test, Focus group, etc.) that launch directly into the builder. Scrollable horizontally with fade edges, NEW badges on recent additions.

The key decision: **remove the method button from inside the input bar** because it doubled up with the pills — both were saying "here are your methods." Instead, we separate concerns cleanly: input bar = compose a question, pills = pick a method. The `🔍 All methods` pill is the gateway to the full catalogue (the existing `MethodsPicker` lightbox) for anyone who wants proposition testing, conjoint analysis, or anything not in the curated row.

---

## What to change

### Files to modify

```
components/Home.tsx              # Main redesign — new layout, pill row, heading
components/chat/ChatInputBar.tsx # Remove method button when variant='home'
App.tsx                          # Pass method handler through to pill clicks
```

### Files to reuse (import, do NOT duplicate)

```
components/chat/MethodsPicker.tsx   # Existing lightbox — opened by "All methods" pill
components/chat/MethodsPicker.ts    # PICKER_METHODS array, PickerMethod type, ICON_MAP
components/chat/AudiencePicker.tsx  # Already used by ChatInputBar
components/ui/badge.tsx             # For NEW badges on pills
lib/utils.ts                       # cn() helper
```

### No new files needed

This is a refactor of `Home.tsx` and a small tweak to `ChatInputBar.tsx`. No new components are required — the pill row is small enough to live inside `Home.tsx` as a local component or inline JSX.

---

## Architecture

### Heading change

Replace the current heading:

```
Before:  "Electric Twin" + "Synthetic research, real insights"
After:   "What do you want to find out?" + "Ask a question or pick a method below"
```

The new heading is task-oriented rather than brand-oriented. The subtitle tells users exactly what the two paths are.

### ChatInputBar changes (variant='home')

When `variant='home'`, the input bar should **not** render the "Add Method" (`Slash` icon) button. The method entry point moves to the pill row below.

Specifically, in `ChatInputBar.tsx`:

```typescript
// Current: always renders method button if onSelectMethod is defined
// New: skip method button when variant='home'
{onSelectMethod && variant !== 'home' && (
  <Button ...>
    <Slash /> Add Method
  </Button>
)}
```

The `[+]` attach button and `Audience` button stay in the input bar for both variants.

The `MethodsPicker` component is still rendered inside `ChatInputBar` for the `chat` variant. For the `home` variant, the MethodsPicker will be controlled by `Home.tsx` instead (via the "All methods" pill).

To support this, either:
- **Option A (simpler)**: Don't pass `onSelectMethod` to ChatInputBar on the home screen. Instead, `Home.tsx` manages its own `MethodsPicker` instance. This means ChatInputBar's internal `methodsOpen` state is never used on the home screen.
- **Option B**: Add a prop like `hideMethodButton?: boolean` to ChatInputBar but keep the MethodsPicker inside it, triggered externally.

**Recommended: Option A** — it's cleaner because `Home.tsx` already needs to handle pill clicks → method selection, so it should own the MethodsPicker lifecycle on this screen.

### Pill row component

Lives inside `Home.tsx`. Here's the spec:

#### Data: curated pills

Define a constant for the curated shortcut pills. These are a hand-picked subset of `PICKER_METHODS` — the most common / recognisable methods that deserve a prominent shortcut:

```typescript
import { PICKER_METHODS, type PickerMethod } from '@/components/chat/MethodsPicker'

interface HomePill {
  methodId: string    // matches PickerMethod.id
  isNew?: boolean     // shows a NEW badge
}

const CURATED_PILLS: HomePill[] = [
  { methodId: 'quick-poll' },
  { methodId: 'survey' },
  { methodId: 'message-test' },       // maps to 'message-test' in PICKER_METHODS
  { methodId: 'focus-group' },
  { methodId: 'creative-testing' },
  { methodId: 'concept-testing' },
  { methodId: 'packaging-test', isNew: true },
  { methodId: 'nps-csat', isNew: true },
]
```

At render time, resolve each `methodId` to its full `PickerMethod` from `PICKER_METHODS`:

```typescript
const resolvedPills = CURATED_PILLS.map(pill => ({
  ...pill,
  method: PICKER_METHODS.find(m => m.id === pill.methodId)!,
}))
```

This way the labels, icons, and descriptions stay in sync with the lightbox. If someone adds a new method to `PICKER_METHODS`, the pill row just needs a one-line addition to `CURATED_PILLS`.

#### Icons

The pill row must use **Lucide icons** (not emojis like the mockup). The existing `ICON_MAP` in `MethodsPicker.tsx` already maps every method's `icon` string to a Lucide component. Import and reuse it:

```typescript
// MethodsPicker.tsx already exports PICKER_METHODS
// The ICON_MAP is currently not exported — export it, or create a helper:

// Option 1: Export ICON_MAP from MethodsPicker.tsx
export { ICON_MAP }

// Option 2: Create a resolveIcon helper
export function resolveMethodIcon(iconName: string): LucideIcon {
  return ICON_MAP[iconName] || FlaskConical
}
```

Then in the pill row:

```tsx
const Icon = resolveMethodIcon(method.icon)
<Icon className="w-3.5 h-3.5" />
```

#### Layout

```
┌──────────────────────────────────────────────────────────────────┐
│ [🔍 All methods]  |  [⚡ Quick Poll] [📋 Survey] [💬 Message    │
│                      test] [👥 Focus group] [🎨 Creative test]  │
│                      [💡 Concept test] [📦 Packaging test NEW]  │
│                      [📊 NPS / CSAT NEW]          ──fade──►     │
└──────────────────────────────────────────────────────────────────┘
```

- Horizontal scroll, `overflow-x: auto`, hidden scrollbar (`scrollbar-width: none`)
- Fade edges: left fade (gradient white→transparent) when scrolled right, right fade (gradient transparent→white) when more content to the right. Use `position: absolute` gradient overlays, `pointer-events: none`.
- Gap between pills: `gap-1.5` (6px)
- The "All methods" button is the first item, visually distinct (white bg, border, search icon)
- A thin vertical divider (`w-px h-5 bg-border`) separates "All methods" from the curated pills
- Curated pills have a subtle tinted background (`bg-muted`) and slightly lighter border

#### Pill styling

Each pill is a `<button>` with:

```
rounded-full px-3 py-1.5 text-xs font-medium
border border-border bg-muted/50 text-foreground
hover:bg-muted hover:border-muted-foreground/30
transition-colors whitespace-nowrap flex-shrink-0
flex items-center gap-1.5
```

"All methods" pill is slightly different:

```
bg-background border-border text-muted-foreground
hover:bg-muted hover:border-muted-foreground/30
```

It has a `Search` icon (from lucide-react) instead of a method icon.

#### NEW badge

Use the existing `Badge` component:

```tsx
{pill.isNew && (
  <Badge variant="default" className="text-[9px] px-1.5 py-0 h-4 font-semibold tracking-wide">
    NEW
  </Badge>
)}
```

The badge uses the primary colour (dark bg, white text) so it's visible on the muted pill background.

#### Click behaviour

- **"All methods" pill** → `setMethodsOpen(true)` — opens `MethodsPicker` lightbox
- **Curated pill** → calls `onSelectMethod(method)` with the resolved `PickerMethod`, same as when a method is selected from the lightbox
- **Method from lightbox** → same `onSelectMethod(method)` callback

All three paths end up in the same handler in `App.tsx`.

#### Active/selected state

When a pill is clicked, briefly highlight it (200ms) to give visual feedback, then deselect. The pill row is a launcher, not a toggle — there's no persistent selection state.

```typescript
const [flashPill, setFlashPill] = useState<string | null>(null)

const handlePillClick = (method: PickerMethod) => {
  setFlashPill(method.id)
  setTimeout(() => setFlashPill(null), 200)
  onSelectMethod(method)
}
```

Active pill style override:

```
bg-foreground text-background border-foreground
```

#### Scroll detection for fades

```typescript
const scrollRef = useRef<HTMLDivElement>(null)
const [showFade, setShowFade] = useState({ left: false, right: true })

const handleScroll = () => {
  const el = scrollRef.current
  if (!el) return
  setShowFade({
    left: el.scrollLeft > 8,
    right: el.scrollLeft < el.scrollWidth - el.clientWidth - 8,
  })
}

useEffect(() => { handleScroll() }, [])
```

---

### Recent studies section

The existing studies list stays largely the same but with these adjustments:

#### Layout tweaks

- Move the list closer to the pills — reduce the vertical space. Currently the hero is `min-h-[70vh]` which pushes studies off-screen. Change to a smaller top padding approach:

```
Before: min-h-[70vh] centered hero, studies below
After:  pt-20 centered content, studies directly below with mt-10
```

- Add a "View all →" link on the right side of the "Recent studies" header
- Keep the `StudyRow` component as-is — it already works well

#### Study row enhancements (from mockup)

- Add a blue dot indicator for studies with unread activity (the mockup shows this on "Onboarding churn study"). Add an optional `hasUnread?: boolean` to the data/display logic.
- Add a findings count with a bookmark icon (🔖) — already partially done with `BarChart3` icon. Align with mockup styling.
- Show relative timestamps ("2h ago", "yesterday", "last week") instead of raw dates.

---

### Label filter row (optional / stretch)

The mockup shows a row of label/tag filter pills below the studies: "All", "Onboarding", "Enterprise", "Q1 Priorities", "Germany". This is a nice-to-have for filtering studies by tag/category. Implementation:

```typescript
const STUDY_LABELS = ['All', 'Onboarding', 'Enterprise', 'Q1 Priorities', 'Germany']
const [activeLabel, setActiveLabel] = useState('All')
```

Style the active label as filled (dark bg), inactive as outlined. This is **low priority** — implement only if there's time.

---

## Detailed component spec: `Home.tsx`

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│              What do you want to find out?                      │
│           Ask a question or pick a method below                 │
│                                                                 │
│   ┌─────────────────────────────────────────────────────────┐   │
│   │ e.g. Why are enterprise users churning in the first...  │   │
│   │                                                         │   │
│   │ [+]  [👥 Audience]                              [Send]  │   │
│   └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│   [🔍 All methods] | [⚡ Quick Poll] [📋 Survey] [💬 Msg...]   │
│                                                                 │
│   ─────────────────────────────────────────────────────────     │
│                                                                 │
│   RECENT STUDIES                                  View all →    │
│   ● Onboarding churn study                                     │
│     Survey + 6 interviews · 2h ago                              │
│     Enterprise pricing research                   🔖 3          │
│     Survey · 891 responses · yesterday                          │
│     Competitor UX audit                           🔖 5          │
│     Focus group · 2 sessions · last week                        │
│                                                                 │
│   [All] [Onboarding] [Enterprise] [Q1 Priorities] [Germany]    │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Props (unchanged)

```typescript
interface HomeProps {
  projects: ProjectState[]
  onSelectProject: (id: string) => void
  onCreateProject: (text: string) => void
  onSelectMethod: (method: PickerMethod) => void
  brand?: string
}
```

### State

```typescript
const [methodsOpen, setMethodsOpen] = useState(false)
const [flashPill, setFlashPill] = useState<string | null>(null)
const [showFade, setShowFade] = useState({ left: false, right: true })
const scrollRef = useRef<HTMLDivElement>(null)
```

### Render structure

```tsx
<div className="flex-1 overflow-y-auto">
  <div className="flex flex-col items-center px-6 pt-20 pb-6">
    {/* Heading */}
    <h1>What do you want to find out?</h1>
    <p>Ask a question or pick a method below</p>

    {/* Input bar — no method button */}
    <div className="w-full max-w-2xl mt-8">
      <ChatInputBar
        onSend={onCreateProject}
        // NOTE: do NOT pass onSelectMethod — removes method button
        onAddAudience={() => {}}
        onAttach={() => {}}
        placeholder="e.g. Why are enterprise users churning in the first 30 days?"
        variant="home"
        brand={brand}
      />
    </div>

    {/* Pill row */}
    <div className="w-full max-w-2xl mt-3 relative">
      {/* Fade overlays */}
      {showFade.left && <div className="absolute left-0 top-0 bottom-0 w-10 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />}
      {showFade.right && <div className="absolute right-0 top-0 bottom-0 w-10 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />}

      <div ref={scrollRef} onScroll={handleScroll} className="flex gap-1.5 overflow-x-auto scrollbar-hide py-0.5">
        {/* All methods button */}
        <button onClick={() => setMethodsOpen(true)} className="...">
          <Search className="w-3.5 h-3.5" />
          <span>All methods</span>
        </button>

        {/* Divider */}
        <div className="w-px h-5 bg-border flex-shrink-0 self-center" />

        {/* Curated pills */}
        {resolvedPills.map(pill => {
          const Icon = resolveMethodIcon(pill.method.icon)
          return (
            <button key={pill.methodId} onClick={() => handlePillClick(pill.method)} className="...">
              <Icon className="w-3.5 h-3.5" />
              <span>{pill.method.label}</span>
              {pill.isNew && <Badge>NEW</Badge>}
            </button>
          )
        })}
      </div>
    </div>
  </div>

  {/* Studies list — same max-w, tighter spacing */}
  <div className="px-6 pt-8 pb-8 max-w-2xl mx-auto">
    {/* ... existing StudyRow components ... */}
  </div>

  {/* MethodsPicker — owned by Home now */}
  <MethodsPicker
    open={methodsOpen}
    onClose={() => setMethodsOpen(false)}
    onSelect={(method) => {
      onSelectMethod(method)
      setMethodsOpen(false)
    }}
  />
</div>
```

---

## App.tsx changes

Currently, `App.tsx` passes `onSelectMethod={() => handleOpenBuilder()}` to `Home`. This ignores which method was selected and just opens the generic SurveyBuilder.

To support method-specific routing, update this:

```typescript
// Current:
onSelectMethod={() => handleOpenBuilder()}

// New:
onSelectMethod={(method) => handleSelectMethod(method)}
```

Where `handleSelectMethod` routes to the right experience:

```typescript
const handleSelectMethod = useCallback((method: PickerMethod) => {
  // For now, all methods open the builder
  // In the future, route to specific builders (e.g. quick-poll → QuickPollPage)
  handleOpenBuilder()

  // TODO: pass method.id to builder so it can pre-select the type
  // e.g. if method.id === 'quick-poll', open QuickPollPage instead
}, [handleOpenBuilder])
```

This creates the routing hook for future method-specific flows (Quick Poll page, Focus Group session, etc.) without breaking anything today.

---

## MethodsPicker.tsx changes

Export the `ICON_MAP` (or a `resolveMethodIcon` helper) so `Home.tsx` can render Lucide icons on the pills:

```typescript
// Add to MethodsPicker.tsx exports:
export function resolveMethodIcon(iconName: string): LucideIcon {
  return ICON_MAP[iconName] || FlaskConical
}
```

No other changes needed — the lightbox works exactly as before.

---

## Styling notes

- Use existing Tailwind design tokens throughout — no custom CSS or inline styles
- `scrollbar-hide` utility: add to `globals.css` if not already present:
  ```css
  .scrollbar-hide::-webkit-scrollbar { display: none; }
  .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
  ```
- The pill row should have `WebkitOverflowScrolling: touch` for smooth mobile scrolling (Tailwind: add custom utility or use inline style)
- Max width for both the input bar and pill row is `max-w-2xl` (same as current hero)
- The studies list also uses `max-w-2xl` to align with the input section above

---

## Checklist

1. [ ] Export `resolveMethodIcon` from `MethodsPicker.tsx`
2. [ ] Add `scrollbar-hide` CSS utility to `globals.css` (if not present)
3. [ ] Update `ChatInputBar.tsx` — hide method button when `variant='home'` (or when `onSelectMethod` is not passed)
4. [ ] Rewrite `Home.tsx`:
   - [ ] New heading: "What do you want to find out?" + subtitle
   - [ ] Remove `min-h-[70vh]` hero, use `pt-20` instead
   - [ ] ChatInputBar without method button (don't pass `onSelectMethod`)
   - [ ] Pill row with "All methods" + divider + curated pills
   - [ ] Horizontal scroll with fade edges
   - [ ] NEW badges on Packaging test and NPS/CSAT
   - [ ] Own `MethodsPicker` instance for the lightbox
   - [ ] Flash highlight on pill click
5. [ ] Update `App.tsx`:
   - [ ] Pass method to `handleSelectMethod` instead of `handleOpenBuilder` directly
   - [ ] Add routing stub for future method-specific flows
6. [ ] Verify:
   - [ ] Input bar has only [+], Audience, and Send (no method button)
   - [ ] Typing a question and pressing Enter/Send creates a project (AI path)
   - [ ] Clicking a curated pill fires `onSelectMethod` and opens builder
   - [ ] Clicking "All methods" opens the MethodsPicker lightbox
   - [ ] Selecting a method from the lightbox fires `onSelectMethod` and opens builder
   - [ ] Pill row scrolls horizontally, fades appear/disappear correctly
   - [ ] NEW badges show on Packaging test and NPS/CSAT pills
   - [ ] Studies list renders correctly below the pills
   - [ ] All existing functionality (project selection, sidebar, builder) still works

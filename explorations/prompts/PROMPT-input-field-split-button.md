# Claude Code Prompt: Refactor Input Field — Split Button with Quick Poll Default

## Context

We're refactoring the chat input bar in Electric Twin (`components/chat/ChatInputBar.tsx`). Currently the bar has three buttons in the action row:

```
[+]   👥 Audience   ⚡ Add Method          [↑ Send]
```

The "Add Method" button opens a full-screen lightbox (`MethodsPicker.tsx`) listing all 23+ research methods grouped by category. The problem is that this treats all methods as equally likely, when in practice **Quick Poll is the 80% action** — the fast, low-commitment pulse check.

We want to replace the generic "Add Method" button with a **split button** that surfaces Quick Poll as the primary action while keeping all other methods accessible via a chevron dropdown.

## What to Build

### The split button

Replace the current "Add Method" `<Button>` with a split button that has two distinct click zones:

```
┌──────────────────┬───┐
│ ⚡ Quick Poll     │ ▾ │
└──────────────────┴───┘
  ↑ main zone           ↑ chevron zone
```

**Main zone** (left, ~80% of button width):
- Icon: `Zap` from lucide-react (⚡) — same icon already used for Quick Poll in `MethodsPicker`
- Label: "Quick Poll"
- Click → fires `onSelectMethod` with the `quick-poll` method object from `PICKER_METHODS`
- This is the one-tap fast path — no menu, no picker, straight into Quick Poll

**Chevron zone** (right, separated by a subtle vertical divider):
- Icon: `ChevronDown` from lucide-react
- Click → opens a dropdown menu listing all methods (replaces the current full-screen lightbox for this entry point)
- The chevron zone should have its own hover state independent of the main zone

### The dropdown menu (replaces lightbox for this entry point)

When the chevron is clicked, open a **dropdown menu** anchored to the split button (not the full-screen `MethodsPicker` lightbox). This menu should:

- Appear directly above the split button (opens upward since the input bar is at the bottom of the screen)
- Have a max height of ~400px with scroll
- Include a search/filter input at the top
- List methods grouped by category, exactly like the current `MethodsPicker` but in dropdown form
- Clicking a method fires `onSelectMethod` with that method and closes the dropdown
- Close on Escape, click outside, or method selection

**Important**: Quick Poll should appear **first** in the dropdown with a subtle highlight or "Recommended" tag, so the user sees it as the promoted option even in the full list.

### The full action row after refactoring

```
[+]   👥 Audience   [⚡ Quick Poll | ▾]          [↑ Send]
```

Three buttons total. Same count as before, but the rightmost research button is now a split button.

## File Changes

### Modify: `components/chat/ChatInputBar.tsx`

**Remove:**
- The current `onSelectMethod` button that renders `<Slash>` icon + "Add Method" label
- The `<MethodsPicker>` component instance (we'll use it differently or replace it)

**Add:**
- Import `ChevronDown` and `Zap` from lucide-react
- A new `SplitMethodButton` component (can be inline or extracted)
- State: `methodDropdownOpen` (boolean) to control the dropdown
- The split button with two click zones
- A dropdown menu component anchored above the button

**Keep unchanged:**
- The `[+]` attach button
- The `👥 Audience` button and `AudiencePicker` behaviour
- The textarea and send button
- The `onSend`, `onAttach`, `onAddAudience` callbacks
- The `@ `trigger for audience picker

### Create (optional): `components/chat/MethodsDropdown.tsx`

If the dropdown gets complex, extract it into its own file. It can reuse the `PICKER_METHODS` array and `ICON_MAP` from `MethodsPicker.tsx` — import them, don't duplicate.

The dropdown should:
- Import `PICKER_METHODS` and `ICON_MAP` from `./MethodsPicker`
- Accept props: `open`, `onClose`, `onSelect`, `anchorRef` (to position itself)
- Render a positioned dropdown (absolute, anchored above the button)
- Contain: search input + grouped method list (same rendering logic as `MethodsPicker`)
- Auto-focus the search input on open

### Keep: `components/chat/MethodsPicker.tsx`

Don't delete this file. It may still be used elsewhere (e.g., a standalone methods browsing page). But the `ChatInputBar` will no longer use it directly — it will use the new dropdown instead. Both should import from the same `PICKER_METHODS` data.

## Visual Spec

### Split button anatomy

```
┌─────────────────────────────────────────────┐
│                                             │
│  ┌─ Main zone ─────────────┬─ Chevron ──┐  │
│  │                         │             │  │
│  │  ⚡  Quick Poll          │     ▾      │  │
│  │                         │             │  │
│  └─────────────────────────┴─────────────┘  │
│                                             │
│  Resting: ghost style, muted text           │
│  Main hover: text goes foreground color     │
│  Chevron hover: bg-muted, independent       │
│  Divider: 1px border-border, 60% height     │
│                                             │
└─────────────────────────────────────────────┘
```

**Sizing** (match existing buttons):
- Height: `h-7` (28px) — same as the current Audience and Add Method buttons
- Main zone padding: `px-2.5`
- Chevron zone: `w-6` (24px wide — enough for a comfortable tap target)
- Font: `text-xs` — same as other action buttons
- Gap between icon and label: `gap-1.5`
- Border radius: `rounded-md` on outer container, no radius on the inner divider edges

**Colours** (using existing tailwind classes):
- Resting text: `text-muted-foreground`
- Hover text: `text-foreground`
- Chevron hover bg: `bg-muted/50`
- Active/pressed: `bg-muted`
- Divider: `border-border` (1px, vertical, 60% of button height, centered)

### Dropdown menu anatomy

```
                    ┌──────────────────────────────┐
                    │ 🔍 Search methods...          │
                    │──────────────────────────────│
                    │ ★ RECOMMENDED                 │
                    │ ⚡ Quick Poll                  │
                    │   Fast single-question check  │
                    │──────────────────────────────│
                    │ QUICK & SIMPLE                │
                    │ 📋 Survey                     │
                    │   Broad quantitative...       │
                    │ 👥 Focus Group                │
                    │   Deep qualitative...         │
                    │──────────────────────────────│
                    │ MESSAGE & COPY                │
                    │ 💬 Message Test               │
                    │   Test copy and value...      │
                    │ ...                           │
                    └──────────────────────────────┘
┌────────────────────────────────────────────────────────┐
│ Ask another question                                   │
│                                                        │
│ [+]   👥 Audience   [⚡ Quick Poll | ▾]          [↑]   │
└────────────────────────────────────────────────────────┘
```

**Dropdown specs:**
- Width: `w-[320px]` — wide enough for descriptions, not overwhelming
- Max height: `max-h-[400px]` with `overflow-y-auto`
- Position: absolute, anchored to the split button, opens **upward** (bottom of dropdown aligns with top of button, with 4px gap)
- Background: `bg-popover`
- Border: `border border-border`
- Radius: `rounded-xl`
- Shadow: `shadow-lg`
- Animation: `animate-in fade-in slide-in-from-bottom-2 duration-150`

**Search input inside dropdown:**
- Sticky at top
- Padding: `px-3 pt-3 pb-2`
- Same styling as current `MethodsPicker` search
- Auto-focused on open

**Method rows inside dropdown:**
- Same layout as `MethodsPicker`: icon in rounded square + label + description
- But slightly more compact: `py-2` instead of `py-2.5`
- Quick Poll row gets a subtle highlight: `bg-primary/5` background + small "Recommended" badge or star

**"Recommended" treatment for Quick Poll:**
- First item in the list, separated from other categories by a divider
- Category label: "Recommended" (instead of "Quick & Simple")
- Subtle accent background: `bg-primary/5` or `bg-blue-50`
- After it, the rest of the methods appear in their normal categories (Quick & Simple still includes Survey and Focus Group)

## Interaction Details

### Opening the dropdown
1. User clicks the chevron zone of the split button
2. Dropdown appears above the button with upward animation
3. Search input auto-focuses
4. Methods are listed with Quick Poll promoted at top

### Selecting a method
1. User clicks any method row → `onSelectMethod(method)` fires → dropdown closes
2. OR user clicks the main zone of the split button → `onSelectMethod(quickPollMethod)` fires directly (no dropdown)

### Closing the dropdown
- Click outside the dropdown → close
- Press Escape → close
- Select a method → close
- Click the chevron again → close (toggle)

### Keyboard navigation (nice-to-have)
- Arrow up/down to navigate method rows
- Enter to select highlighted method
- Type to filter (search input is focused)

## Code Approach

Here's the rough structure for the split button inside `ChatInputBar`:

```tsx
{onSelectMethod && (
  <div className="relative" ref={splitButtonRef}>
    {/* Split button container */}
    <div className="flex items-center h-7 rounded-md overflow-hidden">
      {/* Main zone: Quick Poll */}
      <button
        className="flex items-center gap-1.5 px-2.5 h-full text-xs text-muted-foreground hover:text-foreground transition-colors"
        onClick={() => {
          const quickPoll = PICKER_METHODS.find(m => m.id === 'quick-poll')!
          onSelectMethod(quickPoll)
        }}
      >
        <Zap className="w-3.5 h-3.5" />
        <span>Quick Poll</span>
      </button>

      {/* Divider */}
      <div className="w-px h-[60%] bg-border" />

      {/* Chevron zone: opens method dropdown */}
      <button
        className="flex items-center justify-center w-6 h-full text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
        onClick={() => setMethodDropdownOpen(prev => !prev)}
        aria-label="Browse all methods"
        aria-expanded={methodDropdownOpen}
      >
        <ChevronDown className={cn(
          "w-3 h-3 transition-transform",
          methodDropdownOpen && "rotate-180"
        )} />
      </button>
    </div>

    {/* Dropdown menu — renders above the button */}
    {methodDropdownOpen && (
      <MethodsDropdown
        onSelect={(method) => {
          onSelectMethod(method)
          setMethodDropdownOpen(false)
        }}
        onClose={() => setMethodDropdownOpen(false)}
      />
    )}
  </div>
)}
```

## What NOT to Build

- Don't change the Quick Poll page/flow itself — this is only about the input bar entry point
- Don't modify the `MethodsPicker` component — keep it as-is for potential other uses
- Don't change the Audience button or picker behaviour
- Don't change the `[+]` attach button
- Don't add any backend logic — this is purely a front-end UI change
- Don't duplicate the `PICKER_METHODS` array — import it from `MethodsPicker.tsx`

## Acceptance Criteria

- [ ] The "Add Method" button is replaced by a split button with ⚡ Quick Poll as the face
- [ ] Clicking the main zone of the split button fires `onSelectMethod` with the `quick-poll` method — no menu opens
- [ ] Clicking the chevron opens a dropdown menu above the input bar
- [ ] The dropdown contains a search input and all methods grouped by category
- [ ] Quick Poll appears first in the dropdown with a "Recommended" highlight
- [ ] Selecting any method from the dropdown fires `onSelectMethod` and closes the menu
- [ ] The dropdown closes on Escape, click outside, or chevron re-click
- [ ] The chevron rotates 180° when the dropdown is open
- [ ] The split button matches the visual weight and sizing of the existing Audience button
- [ ] Main zone and chevron zone have independent hover states
- [ ] The dropdown opens upward (above the input bar) since the bar is at the bottom of the screen
- [ ] The `MethodsPicker` lightbox is no longer triggered from the input bar (but the component file is kept)
- [ ] `PICKER_METHODS` and `ICON_MAP` are imported from `MethodsPicker.tsx`, not duplicated

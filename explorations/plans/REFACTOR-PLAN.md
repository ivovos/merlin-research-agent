# Electric Twin Prototype — Refactor & Design System Plan

> **For Claude Code:** Work through each phase in order. Complete the verification step at the end of each phase before moving to the next. Run `npm run build` after every phase to confirm zero regressions.

---

## Phase 0: Setup & Baseline

**Goal:** Establish a working baseline so you can verify nothing breaks as you go.

### Steps

1. Run `npm run build` and confirm it succeeds with zero errors. Record the output.
2. Note the current file count: `find . -name "*.tsx" -o -name "*.ts" | grep -v node_modules | grep -v dist | wc -l`
3. Create a new git branch: `git checkout -b refactor/design-system-cleanup`

### Verify
- [ ] `npm run build` succeeds
- [ ] You are on branch `refactor/design-system-cleanup`

---

## Phase 1: Design Token Foundation

**Goal:** Create a proper themeable design token system that replaces all hardcoded colors, and add the missing semantic tokens the codebase actually needs.

### 1.1 Extend CSS variables in `src/globals.css`

The current `:root` block has the shadcn base tokens but is missing semantic tokens the components actually use. Add the following **inside the existing `:root` block** (after the existing chart variables, before the closing `}`):

```css
/* ── Semantic surface tokens ── */
--surface-primary: var(--background);
--surface-secondary: var(--muted);
--surface-elevated: var(--card);
--surface-overlay: oklch(0 0 0 / 0.5);

/* ── Semantic text tokens ── */
--text-primary: var(--foreground);
--text-secondary: var(--muted-foreground);
--text-muted: oklch(0.6500 0 0);
--text-inverse: var(--primary-foreground);
--text-link: var(--primary);

/* ── Semantic border tokens ── */
--border-default: var(--border);
--border-subtle: oklch(0.9500 0.003 264);
--border-strong: oklch(0.8000 0.006 264);

/* ── Status tokens ── */
--status-success: oklch(0.6500 0.1700 145);
--status-success-subtle: oklch(0.9500 0.0400 145);
--status-warning: oklch(0.7500 0.1500 75);
--status-warning-subtle: oklch(0.9500 0.0400 75);
--status-error: oklch(0.6368 0.2078 25.3313);
--status-error-subtle: oklch(0.9500 0.0400 25);
--status-info: oklch(0.6231 0.1880 259.8145);
--status-info-subtle: oklch(0.9500 0.0400 260);

/* ── Sentiment tokens (for research results) ── */
--sentiment-positive: oklch(0.6500 0.1700 145);
--sentiment-positive-subtle: oklch(0.9500 0.0400 145);
--sentiment-negative: oklch(0.6368 0.2078 25.3313);
--sentiment-negative-subtle: oklch(0.9500 0.0400 25);
--sentiment-neutral: oklch(0.7000 0 0);
--sentiment-neutral-subtle: oklch(0.9500 0 0);
--sentiment-mixed: oklch(0.7500 0.1500 75);
--sentiment-mixed-subtle: oklch(0.9500 0.0400 75);

/* ── Brand color slots (overridable per-client) ── */
--brand-primary: #2768E3;
--brand-secondary: #1BD571;
--brand-tertiary: #E32768;
--brand-quaternary: #D5711B;

/* ── Spacing scale (already have --spacing: 0.25rem) ── */
--space-xs: 0.25rem;   /* 4px */
--space-sm: 0.5rem;    /* 8px */
--space-md: 0.75rem;   /* 12px */
--space-lg: 1rem;      /* 16px */
--space-xl: 1.5rem;    /* 24px */
--space-2xl: 2rem;     /* 32px */
--space-3xl: 2.5rem;   /* 40px */

/* ── Typography scale ── */
--text-xs: 0.75rem;    /* 12px */
--text-sm: 0.875rem;   /* 14px */
--text-base: 1rem;     /* 16px */
--text-lg: 1.125rem;   /* 18px */
--text-xl: 1.25rem;    /* 20px */
--text-2xl: 1.5rem;    /* 24px */
--text-3xl: 1.875rem;  /* 30px */

/* ── Animation timing ── */
--duration-fast: 150ms;
--duration-normal: 250ms;
--duration-slow: 400ms;
--ease-default: cubic-bezier(0.4, 0, 0.2, 1);
```

Add matching **dark mode overrides** inside the existing `.dark` block:

```css
/* Add inside existing .dark block */
--surface-primary: var(--background);
--surface-secondary: var(--muted);
--surface-elevated: var(--card);
--surface-overlay: oklch(0 0 0 / 0.7);

--text-primary: var(--foreground);
--text-secondary: var(--muted-foreground);
--text-muted: oklch(0.5500 0 0);
--text-inverse: var(--primary-foreground);
--text-link: oklch(0.7137 0.1434 254.6240);

--border-default: var(--border);
--border-subtle: oklch(0.3200 0 0);
--border-strong: oklch(0.5000 0 0);

--sentiment-positive: oklch(0.7500 0.1500 145);
--sentiment-positive-subtle: oklch(0.3000 0.0500 145);
--sentiment-negative: oklch(0.7500 0.1500 25);
--sentiment-negative-subtle: oklch(0.3000 0.0500 25);
--sentiment-neutral: oklch(0.6000 0 0);
--sentiment-neutral-subtle: oklch(0.3000 0 0);
--sentiment-mixed: oklch(0.8000 0.1200 75);
--sentiment-mixed-subtle: oklch(0.3000 0.0400 75);
```

### 1.2 Extend `tailwind.config.js`

Add the new semantic tokens to the `extend.colors` object so they are available as Tailwind classes (e.g., `bg-surface-secondary`, `text-text-primary`, `border-border-subtle`):

```js
// Add inside extend.colors:
surface: {
  primary: 'var(--surface-primary)',
  secondary: 'var(--surface-secondary)',
  elevated: 'var(--surface-elevated)',
  overlay: 'var(--surface-overlay)',
},
text: {
  primary: 'var(--text-primary)',
  secondary: 'var(--text-secondary)',
  muted: 'var(--text-muted)',
  inverse: 'var(--text-inverse)',
  link: 'var(--text-link)',
},
'border-semantic': {
  DEFAULT: 'var(--border-default)',
  subtle: 'var(--border-subtle)',
  strong: 'var(--border-strong)',
},
status: {
  success: 'var(--status-success)',
  'success-subtle': 'var(--status-success-subtle)',
  warning: 'var(--status-warning)',
  'warning-subtle': 'var(--status-warning-subtle)',
  error: 'var(--status-error)',
  'error-subtle': 'var(--status-error-subtle)',
  info: 'var(--status-info)',
  'info-subtle': 'var(--status-info-subtle)',
},
sentiment: {
  positive: 'var(--sentiment-positive)',
  'positive-subtle': 'var(--sentiment-positive-subtle)',
  negative: 'var(--sentiment-negative)',
  'negative-subtle': 'var(--sentiment-negative-subtle)',
  neutral: 'var(--sentiment-neutral)',
  'neutral-subtle': 'var(--sentiment-neutral-subtle)',
  mixed: 'var(--sentiment-mixed)',
  'mixed-subtle': 'var(--sentiment-mixed-subtle)',
},
brand: {
  primary: 'var(--brand-primary)',
  secondary: 'var(--brand-secondary)',
  tertiary: 'var(--brand-tertiary)',
  quaternary: 'var(--brand-quaternary)',
},
```

### 1.3 Fix globals.css internal duplication

- Remove the duplicate shadow values: `--shadow-2xs` and `--shadow-xs` are identical, `--shadow-sm` and `--shadow` are identical. Keep `--shadow-xs`, `--shadow-sm`, `--shadow-md`, `--shadow-lg`, `--shadow-xl`, `--shadow-2xl`. Remove `--shadow-2xs` and `--shadow` (default).
- The `html`, `body`, and `#root` selectors each repeat the `height: 100vh; height: 100dvh` pattern. Consolidate into a single rule: `html, body, #root { height: 100dvh; ... }`.
- Remove the duplicate `@layer base` blocks — merge the two `@layer base` blocks into one.
- Add system font fallbacks to font-family variables:
  ```css
  --font-sans: Geist, ui-sans-serif, system-ui, -apple-system, sans-serif;
  --font-display: "Cabinet Grotesk", ui-sans-serif, system-ui, -apple-system, sans-serif;
  ```

### 1.4 Clean up `@theme inline` block

The `@theme inline` block re-declares every variable redundantly. Tailwind v4 `@theme` should only contain values that aren't already in `:root`. Since `:root` already defines everything, either:
- Remove the `@theme inline` block entirely if using Tailwind v3 (which this project is — check `tailwind.config.js` has `module.exports`), OR
- If keeping it, remove the redundant `--shadow-*` and `--radius-*` re-declarations that just point back to the `:root` values.

### Verify
- [ ] `npm run build` succeeds
- [ ] Dark mode class toggles correctly (add `class="dark"` to `<html>` temporarily and check CSS variables change)
- [ ] New Tailwind classes compile: create a test element with `bg-surface-secondary text-text-primary border-border-semantic-subtle` and confirm they resolve

---

## Phase 2: Shared Utilities & Constants

**Goal:** Create the extracted utility files that eliminate duplication. Every file in this phase is **new** — nothing is modified yet.

### 2.1 Create `lib/methodIcons.ts`

This icon-to-method mapping is currently duplicated in 5 files.

```typescript
import { BarChart3, Grid3X3, ClipboardList, Users, MessageSquare } from 'lucide-react';
import type { ElementType } from 'react';

export const METHOD_ICONS: Record<string, ElementType> = {
  'explore-audience': BarChart3,
  'chart-bar': BarChart3,
  'survey': ClipboardList,
  'clipboard-list': ClipboardList,
  'focus-group': Users,
  'users': Users,
  'users-search': Users,
  'grid-3x3': Grid3X3,
  'message-testing': MessageSquare,
  'message-square': MessageSquare,
};

export function getMethodIcon(methodId: string): ElementType {
  return METHOD_ICONS[methodId] ?? MessageSquare;
}
```

### 2.2 Create `lib/brandDefaults.ts`

Currently duplicated in `InlineCanvas.tsx` and `QuestionCard.tsx`.

```typescript
import type { BrandColors } from '@/types/audience';

export const DEFAULT_BRAND_COLORS: BrandColors = {
  primary: '#2768E3',
  secondary: '#1BD571',
  tertiary: '#E32768',
  quaternary: '#D5711B',
};

/** Returns array of brand hex colors in order, for indexed segment coloring */
export function getBrandColorArray(brandColors?: BrandColors): string[] {
  const c = brandColors ?? DEFAULT_BRAND_COLORS;
  return [c.primary, c.secondary, c.tertiary, c.quaternary];
}
```

### 2.3 Create `lib/sentimentColors.ts`

Currently duplicated in `InlineCanvas.tsx` and `ExpandedCanvas.tsx`.

```typescript
/** Tailwind class strings for sentiment badge styling. Uses the new design token classes. */
export const SENTIMENT_COLORS: Record<string, string> = {
  positive: 'bg-sentiment-positive-subtle text-sentiment-positive',
  negative: 'bg-sentiment-negative-subtle text-sentiment-negative',
  neutral: 'bg-sentiment-neutral-subtle text-sentiment-neutral',
  mixed: 'bg-sentiment-mixed-subtle text-sentiment-mixed',
};

export type SentimentType = 'positive' | 'negative' | 'neutral' | 'mixed';
```

### 2.4 Create `lib/parseUtils.ts`

Currently duplicated in `InlineCanvas.tsx`, `QuestionCard.tsx`, and `researchGenerator.ts`.

```typescript
/** Parse a percentage value from various formats: "37.2%", "45", 37.2, etc. */
export function parsePercentage(value: unknown): number {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const cleaned = value.replace('%', '').trim();
    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? 0 : parsed;
  }
  return 0;
}
```

### 2.5 Create `constants/timing.ts`

Timing delays are scattered through `App.tsx` without constants.

```typescript
/** Simulation phase timing (milliseconds) */
export const TIMING = {
  PHASE_1_PLANNING_START: 600,
  PHASE_1_STEP_2: 800,
  PHASE_1_COMPLETE: 600,
  PHASE_2_METHOD_SELECTION: 400,
  PHASE_3_EXECUTION_START: 600,
  PHASE_3_STREAM_INTERVAL: 50,
  PHASE_4_RESULTS: 400,
} as const;

/** API configuration */
export const API_CONFIG = {
  MODEL: 'claude-3-haiku-20240307',
  MAX_TOKENS: 4096,
} as const;
```

### 2.6 Create `constants/processSteps.ts`

Planning step arrays are defined 3 times inline in `App.tsx`.

```typescript
import type { ProcessStep } from '@/types';

export function createPlanningSteps(activeStep: 1 | 2 | 'complete'): ProcessStep[] {
  return [
    {
      id: 'plan_1',
      label: 'Analyzing your question',
      status: activeStep === 1 ? 'in-progress' : 'complete',
      duration: activeStep === 1 ? undefined : 2,
    },
    {
      id: 'plan_2',
      label: 'Selecting research method',
      status: activeStep === 'complete' ? 'complete' : activeStep === 2 ? 'in-progress' : 'pending',
      duration: activeStep === 'complete' ? 3 : undefined,
    },
  ];
}

export function createExecutionSteps(labels: string[], activeIndex: number): ProcessStep[] {
  return labels.map((label, i) => ({
    id: `exec_${i}`,
    label,
    status: i < activeIndex ? 'complete' as const : i === activeIndex ? 'in-progress' as const : 'pending' as const,
    duration: i < activeIndex ? 2 : undefined,
  }));
}
```

### Verify
- [ ] `npm run build` succeeds (new files should compile without errors even though they aren't imported yet)
- [ ] Each new file exports the expected types — run `npx tsc --noEmit` to confirm type-checking passes

---

## Phase 3: Replace Duplicates in Components

**Goal:** Import the new shared utilities and delete the inline duplicates from every component. Do these one file at a time, build-checking after each.

### 3.1 Replace icon mappings (5 files)

For each of these files, add `import { METHOD_ICONS, getMethodIcon } from '@/lib/methodIcons';` and delete the local `iconMap` or `methodIcons` constant:

| File | Local variable to delete | Lines (approx) |
|------|--------------------------|-----------------|
| `components/MethodFullPage.tsx` | `const iconMap` | ~50-57 |
| `components/MethodSheet.tsx` | `const iconMap` | ~56-63 |
| `components/MethodSidePanel.tsx` | `const iconMap` | ~49-56 |
| `components/WorkingPane.tsx` | `const methodIcons` | ~11-16 |
| `components/StudyPlanPill.tsx` | `const methodIcons` | ~7-12 |

Update all references: `iconMap[key]` → `METHOD_ICONS[key]`, `methodIcons[key]` → `METHOD_ICONS[key]`.

**Run `npm run build` after completing all 5.**

### 3.2 Replace brand color defaults (2 files)

| File | Local constant to delete | Import |
|------|--------------------------|--------|
| `components/InlineCanvas.tsx` | `const DEFAULT_BRAND_COLORS` (~line 35-40) | `import { DEFAULT_BRAND_COLORS } from '@/lib/brandDefaults'` |
| `components/QuestionCard.tsx` | `const DEFAULT_BRAND_COLORS` (~line 18-23) | `import { DEFAULT_BRAND_COLORS } from '@/lib/brandDefaults'` |

**Run `npm run build`.**

### 3.3 Replace sentiment colors (2 files)

| File | Local constant to delete | Import |
|------|--------------------------|--------|
| `components/InlineCanvas.tsx` | `const sentimentColors` (~line 670-675) inside ThemeCard | `import { SENTIMENT_COLORS } from '@/lib/sentimentColors'` |
| `components/ExpandedCanvas.tsx` | `const sentimentColors` (~line 582-587) inside ExpandedThemeCard | `import { SENTIMENT_COLORS } from '@/lib/sentimentColors'` |

Update references: `sentimentColors[key]` → `SENTIMENT_COLORS[key]`.

**Run `npm run build`.**

### 3.4 Replace parsePercentage (3 files)

| File | Local function to delete | Import |
|------|--------------------------|--------|
| `components/InlineCanvas.tsx` | `function parsePercentage` (~line 430-438) | `import { parsePercentage } from '@/lib/parseUtils'` |
| `components/QuestionCard.tsx` | `function parsePercentage` (~line 102-110) | `import { parsePercentage } from '@/lib/parseUtils'` |
| `services/researchGenerator.ts` | `function parsePercentage` (~line 74-83) | `import { parsePercentage } from '@/lib/parseUtils'` |

**Run `npm run build`.**

### 3.5 Replace planning step arrays in `App.tsx`

1. Add `import { createPlanningSteps, createExecutionSteps } from '@/constants/processSteps'`
2. Add `import { TIMING } from '@/constants/timing'`
3. Replace the 3 inline planning step arrays with `createPlanningSteps(1)`, `createPlanningSteps(2)`, `createPlanningSteps('complete')`
4. Replace the inline execution steps builder with `createExecutionSteps(selection.processSteps, 0)`
5. Replace hardcoded `setTimeout` delays with `TIMING.*` constants

**Run `npm run build`.**

### Verify
- [ ] `npm run build` succeeds
- [ ] `npx tsc --noEmit` passes with no type errors
- [ ] Grep confirms no remaining local `iconMap` or `methodIcons` outside of `lib/methodIcons.ts`: `grep -rn "const iconMap\|const methodIcons" components/ services/`
- [ ] Grep confirms no remaining local `DEFAULT_BRAND_COLORS` outside of `lib/brandDefaults.ts`
- [ ] Grep confirms no remaining local `parsePercentage` outside of `lib/parseUtils.ts`
- [ ] Grep confirms no remaining local `sentimentColors` outside of `lib/sentimentColors.ts`

---

## Phase 4: Hardcoded Color Migration

**Goal:** Replace all hardcoded Tailwind gray/white/black colors with design token classes across every component. This is what makes the app properly themeable.

### Migration map

Use find-and-replace across the `components/` directory. Here is the mapping:

| Hardcoded class | Replace with |
|-----------------|--------------|
| `text-gray-900` | `text-foreground` |
| `text-gray-800` | `text-foreground` |
| `text-gray-700` | `text-foreground` |
| `text-gray-600` | `text-muted-foreground` |
| `text-gray-500` | `text-muted-foreground` |
| `text-gray-400` | `text-muted-foreground` |
| `text-gray-300` | `text-muted-foreground` |
| `bg-white` | `bg-background` |
| `bg-gray-50` | `bg-muted` |
| `bg-gray-100` | `bg-muted` |
| `bg-gray-900` | `bg-primary` |
| `bg-gray-800` | `bg-primary` |
| `bg-black/50` | `bg-surface-overlay` |
| `bg-black/40` | `bg-surface-overlay` |
| `border-gray-200` | `border-border` |
| `border-gray-100` | `border-border` |
| `border-gray-300` | `border-border` |
| `hover:bg-gray-50` | `hover:bg-muted` |
| `hover:bg-gray-100` | `hover:bg-muted` |
| `hover:bg-gray-800` | `hover:bg-primary/90` |
| `hover:border-gray-300` | `hover:border-border` |
| `text-white` (on dark bg buttons) | `text-primary-foreground` |

### Files to migrate (in order of most violations)

1. **`components/AudiencesList.tsx`** — ~30+ hardcoded color classes. This is the worst offender.
2. **`components/AudienceDetail.tsx`** — ~20+ hardcoded color classes.
3. **`components/Sidebar.tsx`** — ~8 hardcoded color classes.
4. **`components/EditQuestionModal.tsx`** — Uses `var(--text-primary)`, `var(--text-secondary)` etc. in inline `className` strings. Replace `bg-[var(--background)]` with `bg-background`, `text-[var(--text-primary)]` with `text-foreground`, `border-[var(--border)]` with `border-border`, etc.
5. **`components/SuggestionRow.tsx`** — Uses `var(--text-muted)` and `var(--background)` in arbitrary value syntax. Replace with token classes.
6. **`components/MonoIcon.tsx`** — `bg-gray-900 text-white` → `bg-primary text-primary-foreground`
7. **`components/InlineCanvas.tsx`** — Sentiment colors in ThemeCard (already handled by Phase 3.3 if using new token classes in `SENTIMENT_COLORS`).
8. **`components/ExpandedCanvas.tsx`** — Same as above.

**Run `npm run build` after each file.**

### Verify
- [ ] `npm run build` succeeds
- [ ] Run `grep -rn "text-gray-\|bg-gray-\|bg-white\|border-gray-" components/ --include="*.tsx"` — should return **zero results** (excluding `ui/` shadcn primitives)
- [ ] Run `grep -rn "var(--text-\|var(--background" components/ --include="*.tsx"` — should return **zero results** outside of shadcn `ui/` components
- [ ] Visually confirm: light mode looks correct
- [ ] Visually confirm: add `class="dark"` to `<html>` and dark mode colors render correctly

---

## Phase 5: Extract Shared FormField Component

**Goal:** This is the biggest single refactor — extract the form-field rendering logic duplicated across MethodFullPage (805 lines), MethodSheet (835 lines), and MethodSidePanel (686 lines) into a single shared component.

### 5.1 Create `components/MethodFormField.tsx`

Study the three existing implementations:
- `MethodFullPage.tsx` → `FullPageFormField` (lines ~325-803)
- `MethodSheet.tsx` → `FormField` (lines ~340-833)
- `MethodSidePanel.tsx` → `SidePanelFormField` (lines ~334-684)

All three handle the same field types via a switch statement: `text`, `textarea`, `select`, `multi-select`, `radio`, `toggle`, `number`, `audience-selector`, `image-upload`, `question-list`, `message-list`.

Create a single `MethodFormField` component with a `variant` prop:

```typescript
interface MethodFormFieldProps {
  field: MethodField;
  value: unknown;
  onChange: (value: unknown) => void;
  variant: 'full' | 'sheet' | 'compact';
  audiences?: Audience[];
  // ... other shared props
}
```

The `variant` controls sizing:
- `'full'`: `h-11` inputs, `text-base` labels, larger spacing
- `'sheet'`: default sizing, standard spacing
- `'compact'`: `h-9` inputs, `text-sm` labels, tighter spacing

### 5.2 Update the three Method components

Each file should:
1. Import `MethodFormField` from `@/components/MethodFormField`
2. Delete the local FormField subcomponent (the ~300-500 line block)
3. Replace the inline `<FullPageFormField ... />` / `<FormField ... />` / `<SidePanelFormField ... />` with `<MethodFormField variant="full|sheet|compact" ... />`

Expected line reduction: ~500 lines total across the three files.

### Verify
- [ ] `npm run build` succeeds
- [ ] `npm run dev` — navigate to each method configuration view and confirm:
  - MethodFullPage: all field types render, audience selector popover works, image upload works, question list add/remove works
  - MethodSheet: same checks with standard sizing
  - MethodSidePanel: same checks with compact sizing
- [ ] Confirm the `variant` prop correctly changes input heights and label sizes

---

## Phase 6: Split researchGenerator.ts

**Goal:** Break the 1,473-line monolith into focused modules.

### 6.1 Create `services/toolSelector.ts`

Extract from `researchGenerator.ts`:
- The tool selection logic (the function that decides which research tool to use based on the user's query and method)
- The method-to-tool mapping
- Export: `selectTool(query, method) → ToolSelection`

### 6.2 Create `services/toolExecutor.ts`

Extract from `researchGenerator.ts`:
- `executeSurveyTool()`
- `executeFocusGroupTool()`
- `executeComparisonTool()`
- `executeHeatmapTool()`
- `executeSentimentTool()`

These all follow the same pattern: build prompt → call API → parse response. Create a generic `executeResearchTool<T>(config)` function and define tool-specific configs.

### 6.3 Create `services/canvasGenerator.ts`

Extract from `researchGenerator.ts`:
- Canvas construction logic (building the Canvas object from parsed API results)
- The two fallback canvas generators
- `normalizePercentages()` and other normalization helpers

### 6.4 Update `services/researchGenerator.ts`

This file becomes a thin orchestrator that imports from the three new modules and coordinates the flow:
```
selectTool → executeResearchTool → generateCanvas → return result
```

### 6.5 Update `services/index.ts`

Re-export from the new modules so existing consumers don't break.

### Verify
- [ ] `npm run build` succeeds
- [ ] `npx tsc --noEmit` passes
- [ ] `wc -l services/researchGenerator.ts` should be under 200 lines
- [ ] Each new service file should be under 400 lines
- [ ] The full query → results flow still works end-to-end

---

## Phase 7: Type Cleanup

**Goal:** Resolve type inconsistencies.

### 7.1 Remove the `Report` type alias

In `types/canvas.ts`, remove `export type Report = Canvas;`. In `types/index.ts`, remove the `Report` re-export. Search for any remaining `Report` type usage and replace with `Canvas`.

### 7.2 Consolidate Audience type

Check `types/audience.ts` and `data/mockData.ts` — ensure they agree on whether `icon` is required or optional. Pick one (recommend: optional) and update both.

### 7.3 Clean up CanvasType

In `types/agentResponse.ts`, the `CanvasType` includes `heatmap`, `sentiment`, `comparison` variants that are never generated. Either remove them or add a TODO comment that they are planned for future implementation.

### Verify
- [ ] `npm run build` succeeds
- [ ] `npx tsc --noEmit` passes
- [ ] `grep -rn "Report" types/ components/ services/` returns no type-usage of `Report` (only the old export line if you kept backwards compat)

---

## Phase 8: UX Quick Fixes

**Goal:** Address the most impactful UX issues identified in the review.

### 8.1 Make clarification suggestions clickable

In `components/ClarificationMessage.tsx`, the suggestion chips (~lines 56-67) render as styled `<span>` elements with no click handler. Add an `onClick` callback prop and wire it up:

```typescript
interface ClarificationMessageProps {
  // ... existing props
  onSuggestionClick?: (suggestion: string) => void;
}
```

Each chip should call `onSuggestionClick(suggestion)` on click, and the parent (`WorkingPane` or `App.tsx`) should insert the suggestion text into the query input.

### 8.2 Add form validation feedback

In the shared `MethodFormField` component (from Phase 5), add:
- An `error?: string` prop on each field
- Red border styling when error is set: `border-status-error`
- Inline error message below the field: `<p className="text-sm text-status-error mt-1">{error}</p>`

In `MethodFullPage`, `MethodSheet`, and `MethodSidePanel`, add validation state that shows errors on submit attempt rather than just disabling the button.

### 8.3 Standardize boolean state naming

Across all components, standardize the naming convention for boolean state:
- Popover/picker open states: `is{Name}Open` (e.g., `isAudiencePickerOpen`, `isMethodPickerOpen`)
- Visibility toggles: `show{Name}` only for non-modal visibility (e.g., `showTooltip`)

This is a rename-only change — no behavior changes.

### Verify
- [ ] `npm run build` succeeds
- [ ] Clicking a clarification suggestion populates the query input
- [ ] Submitting an incomplete method form shows field-level error messages
- [ ] All renamed boolean states still control the correct UI elements

---

## Phase 9: Spacing & Radius Standardization

**Goal:** Apply consistent spacing and border-radius across all components.

### Spacing convention

| Context | Class |
|---------|-------|
| Panel/page padding | `p-6` |
| Section spacing | `space-y-6` |
| Related item spacing | `space-y-3` or `gap-3` |
| Tight item spacing | `space-y-2` or `gap-2` |

Update these files to match:
- `MethodSidePanel.tsx`: change `space-y-5` → `space-y-6`, `p-4` → `p-6`
- `WorkingPane.tsx`: change `space-y-8` → `space-y-6`
- `ExpandedCanvas.tsx`: change `space-y-10` → `space-y-6`, `pb-10` → `pb-6`
- `AudiencesList.tsx`: change mixed `gap-3`/`mb-3`/`mb-6` → consistent `space-y-3` within sections

### Border-radius convention

| Element type | Class |
|-------------|-------|
| Inputs, small elements | `rounded-md` |
| Cards, panels, modals | `rounded-lg` |
| Pills, avatars, tags | `rounded-full` |

Search for `rounded-sm`, `rounded-xl`, `rounded-2xl` and replace with the appropriate tier above unless there's a specific reason to deviate.

### Button sizing convention

Use shadcn Button `size` prop consistently:
- `size="sm"` (h-8) — for inline/compact actions
- `size="default"` (h-9) — for standard actions
- `size="lg"` (h-11) — for primary page-level actions

### Verify
- [ ] `npm run build` succeeds
- [ ] Visual inspection confirms consistent spacing across all views
- [ ] `grep -rn "rounded-sm\|rounded-xl\|rounded-2xl" components/ --include="*.tsx"` returns minimal results (only where truly needed)

---

## Phase 10: Final Verification

**Goal:** Full regression check.

### Steps

1. `npm run build` — must succeed with zero errors and zero warnings
2. `npx tsc --noEmit` — must pass with zero type errors
3. `npm run dev` — start the dev server and manually test:
   - [ ] Full conversation flow: type query → planning animation → method selection → execution → results render
   - [ ] Canvas displays: quantitative (bar charts) and qualitative (theme cards) both render correctly
   - [ ] Segment selection: click segments on bar charts, selection bar appears with smooth transition
   - [ ] Method configuration: open MethodFullPage, fill all field types, submit
   - [ ] Method re-run: open MethodSidePanel, modify fields, re-run
   - [ ] Audiences list: switch between "all" and grouped views
   - [ ] Audience detail: view segments table, progress bars render
   - [ ] Sidebar navigation: all nav items work
   - [ ] Clarification suggestions: chips are clickable
   - [ ] Dark mode: toggle `class="dark"` on `<html>`, confirm all views render with correct colors — no hardcoded whites/grays leak through
4. Check final file stats:
   - `wc -l components/MethodFullPage.tsx` — should be ~400 lines (down from 805)
   - `wc -l components/MethodSheet.tsx` — should be ~450 lines (down from 835)
   - `wc -l components/MethodSidePanel.tsx` — should be ~350 lines (down from 686)
   - `wc -l services/researchGenerator.ts` — should be ~200 lines (down from 1,473)
5. Commit: `git add -A && git commit -m "refactor: design system tokens, shared utilities, component extraction"`

---

## File Inventory

### New files created
| File | Purpose |
|------|---------|
| `lib/methodIcons.ts` | Shared method → icon mapping |
| `lib/brandDefaults.ts` | Default brand colors |
| `lib/sentimentColors.ts` | Sentiment badge color classes |
| `lib/parseUtils.ts` | Percentage parsing utility |
| `constants/timing.ts` | Animation/delay constants |
| `constants/processSteps.ts` | Planning step factory functions |
| `components/MethodFormField.tsx` | Shared form field renderer |

### Files modified
| File | Changes |
|------|---------|
| `src/globals.css` | Added semantic tokens, dark mode overrides, cleaned up duplication |
| `tailwind.config.js` | Added semantic color tokens to extend.colors |
| `config.ts` | Expanded with centralized feature flags (optional) |
| `App.tsx` | Imports from constants/, uses TIMING constants |
| `components/MethodFullPage.tsx` | Uses shared FormField + icons, ~400 lines saved |
| `components/MethodSheet.tsx` | Uses shared FormField + icons, ~400 lines saved |
| `components/MethodSidePanel.tsx` | Uses shared FormField + icons, ~300 lines saved |
| `components/InlineCanvas.tsx` | Uses shared sentiment/brand/parse imports |
| `components/ExpandedCanvas.tsx` | Uses shared sentiment import |
| `components/QuestionCard.tsx` | Uses shared brand/parse imports |
| `components/WorkingPane.tsx` | Uses shared icon import |
| `components/StudyPlanPill.tsx` | Uses shared icon import |
| `components/ClarificationMessage.tsx` | Suggestion chips are now clickable |
| `components/AudiencesList.tsx` | All hardcoded colors → design tokens |
| `components/AudienceDetail.tsx` | All hardcoded colors → design tokens |
| `components/Sidebar.tsx` | Hardcoded colors → design tokens |
| `components/EditQuestionModal.tsx` | var() syntax → Tailwind token classes |
| `components/SuggestionRow.tsx` | var() syntax → Tailwind token classes |
| `components/MonoIcon.tsx` | Hardcoded colors → design tokens |
| `types/canvas.ts` | Removed Report alias |
| `types/index.ts` | Removed Report re-export |
| `services/researchGenerator.ts` | Split into 3 focused modules, thin orchestrator remains |
| `services/toolSelector.ts` | New — tool selection logic |
| `services/toolExecutor.ts` | New — tool execution logic |
| `services/canvasGenerator.ts` | New — canvas construction logic |
| `services/index.ts` | Updated re-exports |

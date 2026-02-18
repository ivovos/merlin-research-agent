# Quick Poll Implementation Plan

**Reference wireframe**: `quick-poll-wireframe.html` (open in browser to interact with it)

## Overview

The Quick Poll is a single-page experience for creating a simple survey. Unlike the existing multi-step SurveyBuilder overlay (which walks through type → audience → stimulus → questions → review), the Quick Poll puts everything on one scrollable page: audience dropdown at top, inline question editors below, and a fixed footer with a summary + "Launch Poll" button.

The survey type is always `'simple'` — there is no type selection step and no stimulus step.

---

## What to build

### New files to create

```
src/components/quick-poll/
├── QuickPollPage.tsx          # Top-level page component
├── QuickPollAudience.tsx      # Audience dropdown + "Select segments" link
├── QuickPollQuestions.tsx      # Question list (cards + editors + add button)
├── QuickPollFooter.tsx        # Fixed footer bar with summary + launch
└── useQuickPoll.ts            # State hook (useReducer)
```

### Existing files to modify

```
src/App.tsx                    # Add route/view for Quick Poll
src/components/Home.tsx        # Add Quick Poll entry point (e.g. button or card)
```

### Existing files to reuse (import, do NOT duplicate)

```
src/components/builder/steps/questions/QuestionCard.tsx
src/components/builder/steps/questions/QuestionEditor.tsx
src/types/survey.ts            # BuilderQuestionType, SurveyQuestion, etc.
src/hooks/useProjectStore.ts   # For creating the project on launch
src/lib/generateMockFindings.ts
```

---

## Architecture

### State: `useQuickPoll.ts`

Create a dedicated `useReducer` hook. The state shape:

```typescript
interface QuickPollState {
  selectedAudienceId: string        // Pre-selected to 'uk-pop'
  questions: QuickPollQuestion[]    // Starts with one empty question
  editingIndex: number              // -1 = none expanded, 0+ = which card is open
  showErrors: boolean               // Flipped to true on first launch attempt
}

interface QuickPollQuestion {
  id: string                        // crypto.randomUUID() or Date.now()
  text: string
  type: BuilderQuestionType         // from types/survey.ts
  options: string[]                 // for single_choice / multiple_choice / ranking
  scaleConfig?: {                   // for scale type
    min: number
    max: number
    minLabel: string
    maxLabel: string
  }
}
```

Reducer actions:

```typescript
type QuickPollAction =
  | { type: 'SELECT_AUDIENCE'; audienceId: string }
  | { type: 'ADD_QUESTION' }
  | { type: 'REMOVE_QUESTION'; index: number }
  | { type: 'UPDATE_QUESTION_TEXT'; index: number; text: string }
  | { type: 'CHANGE_QUESTION_TYPE'; index: number; questionType: BuilderQuestionType }
  | { type: 'UPDATE_OPTION'; index: number; optionIndex: number; value: string }
  | { type: 'ADD_OPTION'; index: number }
  | { type: 'REMOVE_OPTION'; index: number; optionIndex: number }
  | { type: 'UPDATE_SCALE_CONFIG'; index: number; config: Partial<ScaleConfig> }
  | { type: 'START_EDITING'; index: number }
  | { type: 'CLOSE_EDITOR' }
  | { type: 'SHOW_ERRORS' }
```

Initial state:

```typescript
const initialState: QuickPollState = {
  selectedAudienceId: 'uk-pop',     // Pre-selected default
  questions: [{
    id: crypto.randomUUID(),
    text: '',
    type: 'single_choice',
    options: ['Option 1', 'Option 2', 'Option 3'],
  }],
  editingIndex: 0,                  // First question starts expanded
  showErrors: false,
}
```

The hook should also expose computed values:

```typescript
// Return from hook
{
  state,
  dispatch,
  // Computed:
  selectedAudience: Audience | undefined,     // looked up from audiences list
  validQuestionCount: number,
  allQuestionsComplete: boolean,
  canLaunch: boolean,                         // allQuestionsComplete && audience selected
}
```

### Validation logic

A question is "incomplete" when:
- `text.trim() === ''`
- For `single_choice` / `multiple_choice` / `ranking`: any option is empty, or fewer than 2 options
- All other types (nps, scale, open_text): just need non-empty text

This matches the wireframe's `isIncomplete()` function.

---

## Component specs

### 1. `QuickPollPage.tsx`

The top-level layout. Renders a centered column (max-width ~640px) with padding at the bottom to clear the fixed footer.

```
┌─────────────────────────────────────────────┐
│ Quick Poll                            [✕]   │  ← Header
│ Fast feedback on a single topic...          │
│                                             │
│ AUDIENCE                                    │  ← Section label
│ [UK Population ▾]  n=1,000                  │  ← QuickPollAudience
│ Select segments →                           │
│ ─────────────────────────────────────────── │  ← Divider
│ QUESTIONS                                   │  ← Section label
│ ┌─ Question 1 (expanded editor) ──────────┐ │  ← QuickPollQuestions
│ │ [type chips] [text input] [options]     │ │
│ │                                  [Done] │ │
│ └─────────────────────────────────────────┘ │
│ [ + Add a question ]                        │
│                                             │
├─────────────────────────────────────────────┤
│ UK Population · n=1,000 · 0 qs   [Launch]  │  ← QuickPollFooter (fixed)
└─────────────────────────────────────────────┘
```

Props:

```typescript
interface QuickPollPageProps {
  onClose: () => void
  onLaunch: (survey: Survey) => void
}
```

Implementation notes:
- Call `useQuickPoll()` at the top
- Render: header → QuickPollAudience → hr divider → QuickPollQuestions → QuickPollFooter
- Close button (✕) in header top-right, calls `onClose`
- Page padding-bottom: at least 100px to clear the fixed footer

### 2. `QuickPollAudience.tsx`

A compact audience selector: one `<select>` dropdown with a sample-size badge, plus a "Select segments" link underneath.

Props:

```typescript
interface QuickPollAudienceProps {
  selectedAudienceId: string
  onSelectAudience: (id: string) => void
}
```

**Dropdown contents** (in order):
1. All available audiences as `<option>` elements (use the MOCK_AUDIENCES from AudienceStep or define a shared constant)
2. A disabled separator option: `────────────`
3. A `+ Create new audience` option with value `__create__`

**Behaviour when `__create__` is selected:**
- For now, show a toast or do nothing (placeholder for future flow)
- Reset the dropdown value back to the previously selected audience
- Do NOT change `selectedAudienceId` in state

**Sample size badge:**
- Displayed to the right of the dropdown: `n=1,000`
- Uses the `size` field from the selected audience object

**"Select segments" link:**
- Small text link below the dropdown row, with a right-chevron icon
- Placeholder action for now (could navigate to full builder audience step in future)

Styling (match wireframe):
- Dropdown: `w-full`, custom chevron icon overlay on right, `appearance-none`
- Badge: muted text, tabular-nums
- Link: 12px muted text, hover → foreground color

### 3. `QuickPollQuestions.tsx`

Renders the list of questions (collapsed cards or expanded editors) plus the "Add a question" button at the bottom.

Props:

```typescript
interface QuickPollQuestionsProps {
  questions: QuickPollQuestion[]
  editingIndex: number
  showErrors: boolean
  onStartEditing: (index: number) => void
  onCloseEditor: () => void
  onAddQuestion: () => void
  onRemoveQuestion: (index: number) => void
  onUpdateText: (index: number, text: string) => void
  onChangeType: (index: number, type: BuilderQuestionType) => void
  onUpdateOption: (index: number, optionIndex: number, value: string) => void
  onAddOption: (index: number) => void
  onRemoveOption: (index: number, optionIndex: number) => void
  onUpdateScaleConfig: (index: number, config: Partial<ScaleConfig>) => void
}
```

**IMPORTANT — Reuse existing components where possible:**

The codebase already has `QuestionCard.tsx` and `QuestionEditor.tsx` in `src/components/builder/steps/questions/`. Check whether their props interfaces are compatible with the Quick Poll data model. If they expect the full `SurveyQuestion` type from useSurveyBuilder, you have two options:

- **Option A (preferred)**: Adapt the existing components to accept a more generic question shape, or map QuickPollQuestion → SurveyQuestion before passing
- **Option B**: Create thin wrapper components that translate the props

Either way, the visual output must match the wireframe exactly. The key UI elements for each state:

**Collapsed card** (question not being edited):
- Number badge (1, 2, 3...) with zinc background
- Question text (or italic "Untitled question" placeholder if empty)
- Type badge pill (e.g. "Single Choice" with icon)
- "Incomplete" amber badge if question is incomplete (turns red when showErrors=true)
- Delete button (appears on hover)
- Chevron-down icon on far right
- Click anywhere to expand into editor
- If `showErrors && incomplete`: red border + red background tint

**Expanded editor** (question being edited):
- Number badge with black background (inverted from collapsed)
- "Question N" title
- Collapse button (chevron-up) top-right
- **Question type chips**: 6 buttons in a row — Single Choice, Multiple Choice, Ranking, Open Text, NPS, Scale. Active chip gets dark border + background
- **Question text input**: Full-width text input with placeholder "e.g. How satisfied are you with our service?"
- **Type-specific config area**:
  - single_choice / multiple_choice / ranking: Editable option list with drag handles, remove buttons (min 2 options), "Add option" button
  - scale: Two text inputs (low label, high label) + visual preview of scale dots 1-5
  - nps: Read-only visual preview of 0-10 boxes with color coding (red detractors 0-6, amber passives 7-8, green promoters 9-10) + labels
  - open_text: Info note: "Respondents will see a free-text input. Responses are analyzed to identify themes and sentiment."
- "Done" button bottom-right to collapse

**"Add a question" button:**
- Full-width dashed-ish outlined button below the question list
- Plus icon + "Add a question" text
- Clicking: closes any open editor, pushes a new empty question, opens it for editing

**Delete behaviour:**
- If question has user-entered content (non-empty text, or options different from defaults), show confirm dialog
- If last question is deleted, immediately create a new empty one and open it

### 4. `QuickPollFooter.tsx`

Fixed to the bottom of the viewport. Shows a text summary on the left and the "Launch Poll" button on the right.

Props:

```typescript
interface QuickPollFooterProps {
  audienceName: string
  audienceSize: number
  validQuestionCount: number
  totalQuestionCount: number
  allComplete: boolean
  onLaunch: () => void
}
```

**Summary text logic** (left side):

| Condition | Text |
|-----------|------|
| 0 complete questions | **UK Population** · n=1,000 · Complete your first question to launch |
| Some complete, some incomplete | **UK Population** · n=1,000 · **3** questions · _2 incomplete_ (red) |
| All complete | **UK Population** · n=1,000 · **5** questions |

**Launch button** (right side):
- Label: "Launch Poll"
- Disabled when: not all questions complete (i.e. `!allComplete`)
- On click: calls `onLaunch`

**Launch flow** (handled in QuickPollPage):
1. If any questions incomplete → dispatch `SHOW_ERRORS`, scroll first error into view, do NOT launch
2. If all complete → build a `Survey` object and call `props.onLaunch(survey)`

**Building the Survey object on launch:**

```typescript
const survey: Survey = {
  id: `survey_${Date.now()}`,
  type: 'simple',
  name: 'Quick Poll',
  status: 'completed',
  questions: state.questions.map(q => ({
    id: q.id,
    type: BUILDER_TO_SURVEY_TYPE[q.type],  // Map from builder type to survey type
    text: q.text,
    options: q.options.length > 0 ? q.options : undefined,
    required: true,
    scale: q.scaleConfig ? {
      min: q.scaleConfig.min,
      max: q.scaleConfig.max,
      minLabel: q.scaleConfig.minLabel,
      maxLabel: q.scaleConfig.maxLabel,
    } : undefined,
  })),
  audiences: [state.selectedAudienceId],
  stimuli: [],                            // Quick Poll has no stimuli
  findings: generateMockFindings(),       // Same mock data as full builder
  sampleSize: selectedAudience?.size ?? 400,
  createdAt: new Date().toISOString(),
}
```

Then the parent (App.tsx) handles creating the project and navigating to results, exactly as `handleBuilderLaunch` does today.

---

## Routing / entry points

### In `App.tsx`

Add a new view state (e.g. `'quick-poll'`) alongside existing `'home'` and `'project'`:

```typescript
type View = 'home' | 'project' | 'quick-poll'
```

When view is `'quick-poll'`, render `<QuickPollPage>` instead of the home screen or project. The close button returns to `'home'`. The launch callback creates the project (same as existing `handleBuilderLaunch`) and navigates to the project view.

### In `Home.tsx`

Add a way to enter Quick Poll. This could be:
- A dedicated card/button in the home view (e.g. next to the existing "Create Survey" button)
- Or an option in the existing methods picker

The exact entry point design is up to you — the key requirement is that users can start a Quick Poll from the home screen without going through the type selection step.

---

## Audiences data

The wireframe defines 6 audiences:

```typescript
const QUICK_POLL_AUDIENCES = [
  { id: 'uk-pop', name: 'UK Population', desc: 'Nationally representative UK sample', size: 1000 },
  { id: 'uk-grocery', name: 'UK Grocery Shoppers', desc: 'Regular grocery buyers in the UK', size: 300 },
  { id: 'us-health', name: 'US Health-Conscious', desc: 'Health-focused consumers in the US', size: 500 },
  { id: 'uk-young-urban', name: 'UK Young Urban', desc: 'Urban dwellers aged 18–35 in the UK', size: 250 },
  { id: 'b2b-decision', name: 'B2B Decision Makers', desc: 'Senior business decision makers', size: 200 },
  { id: 'uk-parents', name: 'UK Parents', desc: 'Parents with children under 16 in the UK', size: 300 },
]
```

Ideally share these with the existing `MOCK_AUDIENCES` in `AudienceStep.tsx` rather than duplicating. If the existing data structure is different (it has nested segments), flatten it or extract the top-level audience names + total sizes for the Quick Poll dropdown. Define a shared constant in `src/data/audiences.ts` if one doesn't exist.

---

## Styling guidelines

Match the wireframe exactly. Key design tokens (all from the existing Tailwind/shadcn setup):

- **Max width**: 640px centered (`max-w-[640px] mx-auto`)
- **Section labels**: 11px uppercase, semibold, muted color (`text-[11px] font-semibold text-muted-foreground uppercase tracking-wide`)
- **Cards**: 1px border (border), rounded-lg, white background
- **Editor border**: slightly darker than collapsed card (border-zinc-300 vs border)
- **Number badge (collapsed)**: zinc-100 bg, zinc-600 text, rounded-sm
- **Number badge (editing)**: foreground bg, white text (inverted)
- **Type chips**: row of pill buttons, active = dark border + muted bg
- **Incomplete badge**: amber bg + amber border by default; red bg + red border when showErrors
- **Error state on card**: red border + red-50 bg
- **Footer**: fixed bottom, white bg, top border, same max-width feeling
- **Launch button**: primary (black bg, white text), disabled = zinc-300 bg

Use existing shadcn components where sensible (Button, Select, etc.) but don't force it if native HTML gives a better match to the wireframe.

---

## Checklist

1. [ ] Create `src/components/quick-poll/useQuickPoll.ts` — state hook
2. [ ] Create `src/components/quick-poll/QuickPollAudience.tsx` — dropdown + segments link
3. [ ] Create `src/components/quick-poll/QuickPollQuestions.tsx` — question list with cards/editors
4. [ ] Create `src/components/quick-poll/QuickPollFooter.tsx` — fixed footer bar
5. [ ] Create `src/components/quick-poll/QuickPollPage.tsx` — page layout, wires everything together
6. [ ] Update `src/App.tsx` — add `'quick-poll'` view, render QuickPollPage, handle launch
7. [ ] Update `src/components/Home.tsx` — add Quick Poll entry point
8. [ ] Verify reuse of QuestionCard / QuestionEditor (adapt props if needed)
9. [ ] Extract shared audiences data if currently duplicated
10. [ ] Test: page loads with UK Population pre-selected and one question expanded
11. [ ] Test: can add/edit/delete questions, type switching works
12. [ ] Test: footer updates live as questions are completed
13. [ ] Test: launch blocked when questions incomplete, errors shown
14. [ ] Test: successful launch creates project and navigates to results

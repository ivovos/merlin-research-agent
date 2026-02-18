# Question Builder Migration Plan

> Migrate the Question Builder step from its current two-panel editor layout to the new inline-expanding-card design established in the wireframe at `question-builder-wireframe.html`. After this step there will be a separate "Review" step.

---

## Context

The **wireframe** (`question-builder-wireframe.html`) is a standalone HTML/CSS/JS prototype that defines the target UX. The **prototype** is a React/TypeScript/Vite app using shadcn/ui + Tailwind + Lucide icons. The Questions step lives inside a full-screen `SurveyBuilder` overlay that progresses through steps: Type → Audience → (Stimulus) → **Questions** → Review.

This plan covers **only the Questions step**. The Review step already exists and will be updated separately.

---

## 1. Architecture Overview: What Changes

### Current Architecture (to be replaced)
- `components/builder/steps/QuestionsStep.tsx` — single file, ~630 lines
  - **Gateway phase**: 3 cards (AI Generate / Build From Scratch / Pick Template)
  - **Editor phase**: two-panel layout (left: scrollable question list 240px, right: full question editor)
  - Question types: 18 types via `QUESTION_TYPE_META` array
  - State lives in `useSurveyBuilder` hook via reducer dispatch

### Target Architecture (from wireframe)
- **Tabbed interface** with 3 methods: "Import from Brief" / "Templates" / "From Scratch"
- **Inline expanding card editor** — each question is a collapsed card that expands in-place for editing
- **Simplified question types**: Single Choice (default), Multiple Choice, Ranking, Open Text, NPS, Scale
- **Auto-save** — questions are pushed to array immediately, no staging
- **Validation gated on Continue** — amber "Incomplete" badge on collapsed cards, red errors only when user clicks Next/Continue
- **Template collapse** — templates collapse to a summary after selection, with "Change template" link
- **Import from Brief** — new feature: upload or paste a document, AI extracts questions
- **Tab switching safety** — confirm dialog when switching tabs if questions exist
- **Delete confirmation** — trash icon, confirm only when question has actual content

---

## 2. File-by-File Changes

### 2.1 `types/survey.ts` — Simplify QuestionType

**Keep** the existing `QuestionType` union for backward compatibility (other parts of the app reference it), but add a new constrained type for the builder:

```typescript
// Add these — the builder only exposes 6 types
export type BuilderQuestionType =
  | 'single_choice'
  | 'multiple_choice'
  | 'ranking'
  | 'open_text'
  | 'nps'
  | 'scale'

// Mapping from BuilderQuestionType to the existing QuestionType for downstream use
export const BUILDER_TO_SURVEY_TYPE: Record<BuilderQuestionType, QuestionType> = {
  single_choice: 'single_select',
  multiple_choice: 'multi_select',
  ranking: 'ranking',
  open_text: 'open_text',
  nps: 'nps',
  scale: 'scale',
}
```

**Why**: The wireframe uses `single_choice` / `multiple_choice` naming. The existing codebase uses `single_select` / `multi_select`. We bridge them so the builder uses friendlier labels while the rest of the app keeps working.

### 2.2 `hooks/useSurveyBuilder.ts` — State Changes

Update `BuilderState` to support the new tabbed model:

```typescript
// Replace these fields:
//   questionBuildMethod: 'ai' | 'manual' | 'template' | null
//   questionBuildPhase: 'gateway' | 'editor'
//   activeQuestionId: string | null

// With these:
export type QuestionSourceTab = 'import' | 'templates' | 'scratch'

interface BuilderState {
  // ... existing fields ...
  questionSourceTab: QuestionSourceTab       // which tab is active
  editingQuestionIndex: number               // -1 = none expanded, 0+ = which card is open
  showQuestionErrors: boolean                // true only after user clicks Next/Continue
  selectedTemplate: string | null            // key of chosen template, null = none
  importBriefText: string                    // pasted brief text
  importBriefUploaded: boolean               // whether a file was uploaded
  importBriefExtracted: boolean              // whether AI has extracted questions from brief
}
```

**New reducer actions:**

```typescript
| { type: 'SET_QUESTION_SOURCE_TAB'; payload: QuestionSourceTab }
| { type: 'SET_EDITING_QUESTION_INDEX'; payload: number }
| { type: 'SET_SHOW_QUESTION_ERRORS'; payload: boolean }
| { type: 'SELECT_TEMPLATE'; payload: string }
| { type: 'RESET_TEMPLATE' }
| { type: 'SET_IMPORT_BRIEF_TEXT'; payload: string }
| { type: 'SET_IMPORT_BRIEF_UPLOADED'; payload: boolean }
| { type: 'EXTRACT_FROM_BRIEF'; payload: SurveyQuestion[] }
| { type: 'CLOSE_QUESTION_EDITOR' }
```

**Tab switching reducer logic:**
```
SET_QUESTION_SOURCE_TAB:
  - If questions.length > 0, the UI should show a confirm dialog BEFORE dispatching
  - On switch: clear questions, reset editingQuestionIndex to -1, reset selectedTemplate, reset import state
```

**Validation update** — change the `questions` validity in `computeStepValidity`:
```typescript
questions: state.questions.length > 0
  && state.questions.every(q => q.text.trim().length > 0)
  && state.questions.every(q => {
    // For choice/ranking types, all options must be non-empty
    if (['single_choice','multiple_choice','ranking'].includes(q.type)) {
      return (q.options?.length ?? 0) >= 2 && q.options!.every(o => o.trim().length > 0)
    }
    return true
  })
```

### 2.3 `components/builder/steps/QuestionsStep.tsx` — Full Rewrite

This is the main file to rewrite. Break it into sub-components:

```
components/builder/steps/
  QuestionsStep.tsx           — main orchestrator (tabbed layout + question list)
  QuestionCard.tsx            — collapsed card (click to expand)
  QuestionEditor.tsx          — inline editor (expands inside the card)
  ImportBriefPanel.tsx        — upload/paste brief, extract questions
  TemplatesPanel.tsx          — template grid + collapsed state
  ScratchPanel.tsx            — empty state / description for "from scratch"
```

#### 2.3.1 `QuestionsStep.tsx` — Main Structure

```
┌─────────────────────────────────────────────────────┐
│  Segmented Tab Control                              │
│  [ Import from Brief | Templates | From Scratch ]   │
├─────────────────────────────────────────────────────┤
│                                                     │
│  {Source Panel}                                      │
│  - ImportBriefPanel / TemplatesPanel / ScratchPanel  │
│  - Collapses to summary once questions are loaded    │
│                                                     │
├─────────────────────────────────────────────────────┤
│  Your Questions (N)                                 │
│                                                     │
│  ┌ Question Card 1 ─────────────────────────┐      │
│  │ [collapsed or expanded inline editor]     │      │
│  └───────────────────────────────────────────┘      │
│  ┌ Question Card 2 ─────────────────────────┐      │
│  │ [collapsed or expanded inline editor]     │      │
│  └───────────────────────────────────────────┘      │
│  ...                                                │
│  [ + Add a question ]                               │
│                                                     │
└─────────────────────────────────────────────────────┘
```

**Key behaviors:**
- Questions section is hidden until at least 1 question exists
- Tab control stays visible at the top always
- Source panel (Import/Templates/Scratch) collapses after committing to a source
- Only 1 question card can be expanded at a time — clicking another collapses the current
- New questions auto-expand their editor on creation

#### 2.3.2 `QuestionCard.tsx` — Collapsed State

Each collapsed card shows:
- Drag handle (grip icon, non-functional in prototype)
- Question number
- Question text (or "Untitled question" in muted italic)
- Type badge (icon + label)
- "Incomplete" badge (amber by default, red when `showErrors` is true)
- "AI extracted" badge (if question came from brief import)
- Trash icon button (on hover)
- Chevron-down icon (expand indicator)

**On click**: dispatch `SET_EDITING_QUESTION_INDEX` with this card's index

**Delete behavior:**
```typescript
function handleDelete(index: number) {
  const q = questions[index]
  const hasContent = q.text.trim().length > 0 ||
    (q.options?.some(o => o.trim() && o !== 'Option 1' && o !== 'Option 2' && o !== 'Option 3') ?? false)
  if (hasContent && !window.confirm('Delete this question? This cannot be undone.')) return
  dispatch({ type: 'REMOVE_QUESTION', payload: q.id })
}
```

**Incomplete check:**
```typescript
function isIncomplete(q: SurveyQuestion): boolean {
  if (!q.text.trim()) return true
  if (['single_choice','multiple_choice','ranking'].includes(q.type)) {
    if (!q.options || q.options.length === 0) return true
    if (q.options.some(o => !o.trim())) return true
  }
  return false
}
```

#### 2.3.3 `QuestionEditor.tsx` — Inline Editor

The inline editor replaces the collapsed card when expanded. It renders:

1. **Header row**: Question number + "Question N" label + chevron-up close button
2. **Type selector**: Horizontal chip/pill buttons for the 6 types (Single Choice highlighted by default)
3. **Question text input**: Full-width text input
4. **Type-specific config:**
   - Single Choice / Multiple Choice / Ranking → Option list with grip handles, remove buttons, "Add option" button below the card
   - Scale → Min/max label inputs + dot preview
   - NPS → 0-10 box preview with detractor/passive/promoter coloring
   - Open Text → Informational note
5. **"Done" button**: Small secondary button at bottom-right, calls `closeEditor()`

**Option management:**
- Default new options: `['Option 1', 'Option 2', 'Option 3']`
- Minimum 2 options (hide remove buttons at 2)
- "Add option" button sits OUTSIDE/BELOW the editor card border

**Type switching resets config:**
- Switching to a choice type: set `options: ['Option 1', 'Option 2', 'Option 3']`
- Switching to scale: set `scale: { min: 1, max: 5, minLabel: '', maxLabel: '' }`
- Switching to NPS: set `scale: { min: 0, max: 10 }`
- Switching to open_text: clear options and scale

**Editor border**: Use `border-zinc-300` (grey, NOT black)

#### 2.3.4 `ImportBriefPanel.tsx` — New Feature

Two states:

**State 1: Input (before extraction)**
- Upload area (dashed border, click or drag to upload, accept .pdf/.docx/.txt)
- OR text area for pasting brief content
- "Extract Questions" button (disabled until file uploaded or text pasted)
- On click: simulate 1.5s AI processing, then generate mock extracted questions

**State 2: Collapsed (after extraction)**
- Single-line summary: "Extracted from [filename]" or "Extracted from pasted brief"
- "Change source" link to reset back to State 1

**Mock extracted questions (hardcoded for prototype):**
```typescript
[
  { text: "How appealing is this concept to you?", type: "single_choice", options: ["Very appealing","Somewhat appealing","Neutral","Not appealing"] },
  { text: "What features do you value most?", type: "multiple_choice", options: ["Price","Quality","Convenience","Brand reputation"] },
  { text: "How likely are you to recommend this?", type: "nps" },
  { text: "What would make you switch?", type: "open_text" },
]
```

#### 2.3.5 `TemplatesPanel.tsx`

Two states:

**State 1: Grid (before selection)**
- 2×2 grid of template cards, each with an icon and label:
  - Clipboard icon → "Standard Concept Test" (5 questions)
  - Heart icon → "Quick Brand Pulse" (3 questions)
  - Smile icon → "Customer Satisfaction" (4 questions)
  - Dollar icon → "Pricing Sensitivity" (4 questions)
- Clicking a template loads its questions and collapses to State 2

**State 2: Collapsed (after selection)**
- Single-line: "Using Standard Concept Test"
- "Change template" link to reset back to State 1 (with confirm if questions were edited)

**Template data** — use simplified question sets matching the wireframe:

```typescript
const TEMPLATES = {
  concept: {
    label: 'Standard Concept Test',
    icon: ClipboardList,
    questions: [
      { type: 'scale', text: 'How appealing is this concept to you?', scale: { min:1, max:5, minLabel:'Not at all', maxLabel:'Extremely' } },
      { type: 'scale', text: 'How unique or different does this feel?', scale: { min:1, max:5, minLabel:'Not unique', maxLabel:'Very unique' } },
      { type: 'scale', text: 'How relevant is this to your needs?', scale: { min:1, max:5, minLabel:'Not relevant', maxLabel:'Very relevant' } },
      { type: 'scale', text: 'How likely are you to purchase?', scale: { min:1, max:5, minLabel:'Not likely', maxLabel:'Extremely likely' } },
      { type: 'scale', text: 'Does this feel like good value?', scale: { min:1, max:5, minLabel:'Poor value', maxLabel:'Great value' } },
    ]
  },
  brand: { ... },
  csat: { ... },
  pricing: { ... },
}
```

#### 2.3.6 `ScratchPanel.tsx`

Minimal component. Just shows informational text like "Add questions one by one" when no questions exist yet. Once the first question is added, this panel can either stay minimal or hide entirely. The "Add a question" button lives in the shared questions list section below.

### 2.4 `components/builder/steps/ReviewStep.tsx` — Minor Updates

The Review step needs to handle the simplified question type labels. Update `QUESTION_TYPE_LABELS` to include the new `BuilderQuestionType` values:

```typescript
single_choice: 'Single Choice',
multiple_choice: 'Multiple Choice',
// ... existing labels stay for backward compat
```

No other changes needed — the Review step already renders questions as a summary list.

### 2.5 `components/builder/SurveyBuilder.tsx` — Layout Adjustment

Currently, the Questions step in editor phase gets special layout treatment (no padding/max-width). The new inline design doesn't need this — questions render in a scrollable single column. **Remove** the special-case layout:

```diff
- {currentStep === 'questions' && state.questionBuildPhase === 'editor' ? (
-   <div className="h-full">{renderStep()}</div>
- ) : (
    <div className="h-full overflow-y-auto p-6 max-w-4xl mx-auto">
      {renderStep()}
    </div>
- )}
```

### 2.6 `components/builder/BuilderActionBar.tsx` — Validation Integration

The "Next" button on the Questions step should trigger error display:

```typescript
// Before navigating away from Questions step:
if (currentStep === 'questions') {
  dispatch({ type: 'SET_SHOW_QUESTION_ERRORS', payload: true })
  // Check if there are incomplete questions
  const incompleteCount = state.questions.filter(q => isIncomplete(q)).length
  if (incompleteCount > 0) {
    // Don't proceed, the error badges will now show in red
    return
  }
}
goNext()
```

---

## 3. Styling Guidelines

All styling should use the existing shadcn/Tailwind setup. Key tokens:

- **Borders**: `border-zinc-300` for editor outline, `border` (default) for cards
- **Font**: `font-sans` (Inter via Tailwind config)
- **Icons**: Lucide React — use `GripVertical`, `Trash2`, `ChevronUp`, `ChevronDown`, `Plus`, `Circle`, `List`, `Type`, `BarChart3`, `SlidersHorizontal`, `Upload`, `FileText`, `Sparkles`, `ClipboardList`, `Heart`, `Smile`, `DollarSign`, `AlertCircle`
- **Type chips**: `rounded-full px-3 py-1.5 text-xs font-medium border` — active state: `bg-zinc-900 text-white border-zinc-900`
- **Segmented tab control**: `inline-flex rounded-lg bg-zinc-100 p-1` with active tab `bg-white rounded-md shadow-sm`
- **Incomplete badge**: `bg-amber-50 text-amber-600 border-amber-200` (default), `bg-red-50 text-red-600 border-red-200` (on Continue error)
- **Trash button**: Visible on card hover only (`opacity-0 group-hover:opacity-100`), red on hover
- **Editor border**: `border border-zinc-300 rounded-lg` (grey, not the default black)

---

## 4. Interaction Specifications

### 4.1 Tab Switching
1. User clicks a different tab (Import/Templates/Scratch)
2. If `questions.length > 0`: show `window.confirm("You have N questions. Switching will start over. Continue?")`
3. If confirmed or no questions: clear questions, reset all source-specific state, switch tab
4. If cancelled: stay on current tab

### 4.2 Adding a Question
1. User clicks "+ Add a question" button at bottom of questions list
2. If another question is currently expanded, collapse it first (close editor)
3. Push new empty question: `{ text: '', type: 'single_choice', options: ['Option 1','Option 2','Option 3'] }`
4. Set `editingQuestionIndex` to the new question's index
5. New question's editor expands inline immediately

### 4.3 Expanding/Collapsing Questions
- Click collapsed card → set `editingQuestionIndex` to that card's index (auto-collapses any other)
- Click chevron-up in editor header → set `editingQuestionIndex` to -1
- Click "Done" button in editor → same as chevron-up

### 4.4 Deleting a Question
1. User hovers over collapsed card → trash icon appears
2. User clicks trash icon (event.stopPropagation to prevent expand)
3. Check if question has content (non-empty text OR customized options)
4. If has content: show `window.confirm("Delete this question? This cannot be undone.")`
5. If confirmed or empty: remove question, adjust `editingQuestionIndex` if needed

### 4.5 Validation Flow
1. While editing: no errors shown. Collapsed cards with missing content show amber "Incomplete" badge
2. User clicks Next/Continue in BuilderActionBar
3. Set `showQuestionErrors = true`
4. If any incomplete questions exist: red "Incomplete" badges + red left border on affected cards
5. Scroll to first error card
6. Block navigation until all questions are complete
7. On re-entering the step (e.g. going back from Review): reset `showQuestionErrors = false`

### 4.6 Template Selection
1. User clicks a template card in the 2×2 grid
2. Load template questions into `questions` array
3. Collapse template grid, show "Using [Template Name]" summary
4. Questions appear below with inline editors available

### 4.7 Import from Brief
1. User uploads file or pastes text
2. User clicks "Extract Questions"
3. Show loading spinner for 1.5s (mock)
4. Load extracted questions into `questions` array
5. Collapse import panel, show "Extracted from [source]" summary
6. Questions appear below

---

## 5. Data Flow Diagram

```
QuestionsStep (orchestrator)
  ├── Segmented Tab Control
  │     └── dispatches SET_QUESTION_SOURCE_TAB (with confirm guard)
  │
  ├── Source Panel (conditional on tab)
  │     ├── ImportBriefPanel → dispatches EXTRACT_FROM_BRIEF
  │     ├── TemplatesPanel → dispatches SELECT_TEMPLATE + GENERATE_QUESTIONS
  │     └── ScratchPanel → (no dispatch, just informational)
  │
  └── Questions Section (visible when questions.length > 0)
        ├── "Your Questions (N)" header
        ├── QuestionCard[] (map over questions)
        │     ├── collapsed: QuestionCard renders summary
        │     │     ├── click card → SET_EDITING_QUESTION_INDEX
        │     │     └── click trash → REMOVE_QUESTION (with confirm)
        │     └── expanded: QuestionEditor renders inline
        │           ├── type chips → UPDATE_QUESTION (type change)
        │           ├── text input → UPDATE_QUESTION (text change)
        │           ├── option inputs → UPDATE_QUESTION (options change)
        │           ├── scale inputs → UPDATE_QUESTION (scale change)
        │           ├── "Done" → CLOSE_QUESTION_EDITOR
        │           └── chevron-up → CLOSE_QUESTION_EDITOR
        └── "+ Add a question" button → ADD_QUESTION
```

---

## 6. Migration Checklist

### Phase 1: State Layer
- [ ] Add `BuilderQuestionType` and mapping to `types/survey.ts`
- [ ] Update `BuilderState` interface in `useSurveyBuilder.ts` with new fields
- [ ] Add new reducer actions (SET_QUESTION_SOURCE_TAB, SET_EDITING_QUESTION_INDEX, SET_SHOW_QUESTION_ERRORS, SELECT_TEMPLATE, RESET_TEMPLATE, SET_IMPORT_BRIEF_TEXT, SET_IMPORT_BRIEF_UPLOADED, EXTRACT_FROM_BRIEF, CLOSE_QUESTION_EDITOR)
- [ ] Update reducer with new action handlers
- [ ] Update `computeStepValidity` for new validation rules
- [ ] Update `initialState` with new field defaults

### Phase 2: Component Scaffold
- [ ] Create `QuestionCard.tsx` — collapsed question card component
- [ ] Create `QuestionEditor.tsx` — inline expanding editor component
- [ ] Create `ImportBriefPanel.tsx` — upload/paste/extract panel
- [ ] Create `TemplatesPanel.tsx` — 2×2 grid + collapsed state
- [ ] Create `ScratchPanel.tsx` — minimal informational panel

### Phase 3: Main Rewrite
- [ ] Rewrite `QuestionsStep.tsx` with tabbed layout + inline cards
- [ ] Wire up all dispatches and state reads
- [ ] Implement tab switching with confirmation guard
- [ ] Implement "Add a question" with auto-expand
- [ ] Implement expand/collapse single-card behavior
- [ ] Implement delete with conditional confirmation

### Phase 4: Integration
- [ ] Update `SurveyBuilder.tsx` — remove special Questions layout case
- [ ] Update `BuilderActionBar.tsx` — add error-trigger on Questions Next
- [ ] Update `ReviewStep.tsx` — handle new type labels
- [ ] Ensure `SurveyBuilder.tsx` passes new props/dispatches to QuestionsStep

### Phase 5: Polish
- [ ] Verify all type chips render correctly with proper icons
- [ ] Verify amber/red incomplete badge states
- [ ] Verify delete confirmation for filled vs empty questions
- [ ] Verify tab switching confirmation
- [ ] Verify template collapse/reset flow
- [ ] Verify import brief collapse/reset flow
- [ ] Verify "Add option" button placement (outside editor card border)
- [ ] Verify editor border is grey (zinc-300), not black
- [ ] Test the full flow: Type → Audience → Questions → Review → back to Questions

---

## 7. Reference File

The complete wireframe prototype is at:
```
question-builder-wireframe.html
```

This is a single-file HTML/CSS/JS implementation with all the target interactions. Use it as the source of truth for:
- Visual design and spacing
- Interaction behaviors
- Template data and question type configurations
- Validation logic
- Animation/transition patterns

The wireframe uses vanilla JS with inline SVG icons. The prototype should use React components with Lucide icons and shadcn/ui primitives, but match the same visual output and interaction patterns.

---

## 8. What NOT to Change

- **Other builder steps** (TypeStep, AudienceStep, StimulusStep) — leave untouched
- **ProcessingOverlay** — leave untouched
- **BuilderSidebar** — leave untouched (step names and validation indicators work as-is)
- **Chat components** — not related
- **Project store** — not related
- **Existing QuestionType union** — keep for backward compatibility, just add the mapping

---

## 9. Question Type Icon Mapping (Lucide)

| Type | Icon | Lucide Component |
|------|------|-----------------|
| Single Choice | Circle | `Circle` |
| Multiple Choice | List | `List` |
| Ranking | List | `ListOrdered` |
| Open Text | Type | `Type` |
| NPS | Bar Chart | `BarChart3` |
| Scale | Sliders | `SlidersHorizontal` |

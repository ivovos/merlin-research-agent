# Prototype Update Prompts

Feed these to Claude one by one. Each prompt is self-contained and references the specific files/components involved.

---

## PROMPT 1: Segmentation with Evidence Cards

```
I need to update the agent flow so that when a user's query implies comparing two subsets of an audience, the system automatically creates or finds existing sub-audiences and uses them — showing segmented results in both the agent planning AND the evidence cards.

### What exists already

The codebase already has full support for grouped_bar charts with two segments:

- `FindingCard.tsx` has a `GroupedBarRow` component that renders two bars per answer option (lines 90-128) and detects grouped mode via `segmentKeys.length >= 2` (line 151)
- `Finding` type in `types/survey.ts` supports `chartType: 'grouped_bar'`, `segmentBreakdowns: SegmentBreakdown[]`, and chartData with dynamic segment keys
- `agentPrompt.ts` already documents `run_survey` with a `segments` array parameter (lines 17-18) with examples like `segments: ["Gen Z", "Millennials"]`
- `generateMockFindings.ts` already has a `hasMultipleSegments` flag that switches between `'bar'` and `'grouped_bar'` chart types and generates dual-segment chartData with `'Segment A'` and `'Segment B'` keys
- The Vodafone project data (`data/projects/vodafone.ts`) shows a working example with `techSavvy` and `general` segment keys mapped to `segmentBreakdowns`

### What needs to change

1. **Agent detection logic** (`services/toolSelector.ts`): When the user's natural language query mentions two groups (e.g. "how do parents vs non-parents feel about...", "compare iPhone and Android users on..."), the `selectResearchTool` function should detect this and automatically populate the `segments` array in the tool input. Currently it relies on users explicitly formatting the query — make it smarter about detecting implicit comparison intent from phrases like "vs", "compared to", "versus", "both X and Y", "differences between", etc.

2. **Planning display**: When segments are detected, the planning reasoning text (`constants/reasoningText.ts` — `generatePlanningReasoning`) should mention the two sub-audiences being compared. For example: "Running a segmented survey comparing **Parents** and **Non-parents** within the broader audience..."

3. **Evidence cards rendering**: The `FindingCard` already renders grouped bars correctly. Make sure the agent flow passes `segments` through `executeSelectedTool` → canvas → `canvasToFindings` → Finding objects with `chartType: 'grouped_bar'` and properly populated `segmentBreakdowns` and `chartData` with two segment keys. Verify `canvasToFindings.ts` correctly maps canvas `QuestionResult` segments into `Finding.chartData` with named segment keys and `segmentBreakdowns`.

4. **Audience labels on cards**: When showing two segments, the FindingCard top line should display both audience labels with colored dots (this already works in `FindingCard.tsx` lines 189-197). Just make sure the data pipeline passes human-readable segment names through `segmentBreakdowns[].segmentName`.

### Files to modify
- `services/toolSelector.ts` — add segment detection logic
- `constants/reasoningText.ts` — update planning text to mention segments
- `lib/canvasToFindings.ts` — verify segment data mapping
- `services/tools/surveyTool.ts` — ensure segments flow through to canvas generation

### Files for reference (don't modify)
- `components/results/FindingCard.tsx` — already handles grouped bars
- `services/agentPrompt.ts` — documents the segments parameter
- `lib/generateMockFindings.ts` — shows mock data generation pattern
```

---

## PROMPT 2: Click-to-Follow-Up with Segment Pill

```
I need to add a follow-up interaction where the user clicks on a bar in a result card, and that segment gets added as a pill/chip in the input field — allowing them to ask a follow-up question specifically to that subset of respondents.

### How it should work

1. **Clicking a bar**: When the user clicks on a bar in a `FindingCard` (either a `BarRow` or a row within `GroupedBarRow`), it should select that answer segment. For example, clicking on "Yes, definitely" (45%) selects the 45% of respondents who answered "Yes, definitely".

2. **Pill in input field**: The selected segment appears as a styled pill/chip in the `ChatInputBar`. The pill should show:
   - The answer label (e.g. "Yes, definitely")
   - A small respondent count tag in parentheses like `(292)`
   - An × button to remove the pill
   - Styled as a rounded pill with a subtle background color (use the primary brand color at low opacity)

3. **Follow-up query**: The user types their follow-up question alongside the pill. When sent, the message should carry the segment context — which question they clicked, what answer, and how many respondents — so the agent knows to scope the follow-up to that sub-audience.

### Existing code to build on

- `hooks/useSegmentSelection.ts` already has a `useSegmentSelection` hook with `selectSegment`, `removeSegment`, `clearSegments`, and tracks `SelectedSegment` objects containing `questionId`, `questionText`, `answerLabel`, `percentage`, and `respondents`
- `types/segment.ts` defines `SelectedSegment` and `SelectedSegments` interfaces
- `ChatInputBar.tsx` already renders action buttons at the bottom and handles audience/method picker triggers
- `FindingCard.tsx` renders `BarRow` and `GroupedBarRow` — these need click handlers added

### Implementation plan

1. **Make bars clickable** in `FindingCard.tsx`:
   - Add an `onBarClick` callback prop to `FindingCard`: `onBarClick?: (segment: SelectedSegment) => void`
   - Wrap each `BarRow` and each segment row within `GroupedBarRow` in a clickable container with hover state (pointer cursor, subtle highlight)
   - On click, construct a `SelectedSegment` object with the question context and answer data, and call `onBarClick`

2. **Add pill rendering to ChatInputBar** (`components/chat/ChatInputBar.tsx`):
   - Add new props: `selectedSegments?: SelectedSegment[]` and `onRemoveSegment?: (questionId: string, answerLabel: string) => void`
   - Render pills above or inline with the textarea (between the textarea and the action buttons row)
   - Each pill: `<span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary/10 text-sm">` containing the answer label, a small gray count like `(292)`, and an × close button
   - When pills are present, the send function should include segment context in the message

3. **Wire up the flow** in `ProjectChat.tsx` / `ChatStream.tsx`:
   - Use the existing `useSegmentSelection` hook in `ProjectChat`
   - Pass `selectSegment` down through `ChatStream` → `FindingsMessage` → `FindingCard` as `onBarClick`
   - Pass `selectedSegments` and `removeSegment` to `ChatInputBar`
   - When sending a message with segments, prefix the query context for the agent (e.g. include the segment info so `selectResearchTool` knows to scope the follow-up)

4. **Clear segments after send**: After the user sends a message with segment pills, call `clearSegments()` to reset

### Files to modify
- `components/results/FindingCard.tsx` — add click handlers to BarRow and GroupedBarRow
- `components/chat/ChatInputBar.tsx` — add segment pill rendering
- `components/chat/ChatStream.tsx` — pass segment props through
- `components/ProjectChat.tsx` — wire up useSegmentSelection hook
- `components/chat/FindingsMessage.tsx` — pass onBarClick to FindingCard
```

---

## PROMPT 3: Fix Agent Message Ordering

```
I need to fix the ordering of agent thinking, messages, and results in the chat stream. Currently the display sometimes shows: message → thinking → another message → result, which feels disjointed. The correct flow should always be:

**User query → Agent thinking/reasoning → Agent message → Result cards**

### Current architecture

The flow is orchestrated in `ProjectChat.tsx` in the `startSimulation` function (line 231+):

1. User message is added (line 244-249)
2. Planning phase starts with `setProcessing({ steps: createPlanningSteps(1) })` (line 261)
3. `selectResearchTool(query)` is called (line 263)
4. Planning reasoning is generated and shown via `setProcessing({ steps, reasoningText })` (line 272)
5. Planning completes (line 276)
6. For simple path: an AI "design" message is added (line 366-371), then `resumeExecution` is called
7. In `resumeExecution` (line 98+): execution steps animate, then when complete, an explanation AI message is added (line 190-198) WITH `thinking: finalReasoning`, THEN findings message is added (line 201-210)

The problem: The AI message at line 190 includes a `thinking` property, which causes `AIMessage.tsx` to render a collapsible reasoning block ABOVE the message text. But by this point, the user has already seen the reasoning in the `ProcessSteps` component during execution. So they see reasoning twice, or in a confusing order.

Additionally, sometimes the "design" message (line 366) appears before the reasoning finishes displaying, creating the sequence: message → thinking → result instead of thinking → message → result.

### What needs to change

1. **Remove duplicate reasoning from the explanation message**: In `resumeExecution` (around line 190-198), don't pass `thinking: finalReasoning` to the explanation AI message. The reasoning was already shown during the process steps animation. The final AI message should just be the plain explanation text.

2. **Ensure correct sequencing in the simple path**:
   - The processing/reasoning indicator should fully complete and clear BEFORE the AI "design" message appears
   - Add a small delay between `setProcessing(undefined)` and adding the design message
   - Current code at line 362-376 adds the design message and immediately calls `resumeExecution` — there should be a clear transition

3. **Ensure correct sequencing in the execution phase** (`resumeExecution`):
   - The processing steps should fully complete and disappear
   - THEN the explanation AI message appears (without thinking block)
   - THEN the findings cards appear
   - Add proper `await new Promise(r => setTimeout(r, ...))` gaps between each

4. **For the complex/plan path**: The plan intro message at line 317 appears after reasoning completes — this is already correct. Just verify the sequence: reasoning → plan intro message → plan card.

### Desired final sequence (simple path)
```
[User message]
  ↓
[ProcessSteps: animated reasoning + step indicators] ← streaming, auto-closes
  ↓  (processing clears)
[AI message: "I've created X to investigate this..."]
  ↓
[ProcessSteps: execution steps animating] ← streaming
  ↓  (processing clears)
[AI message: explanation of findings]  ← NO thinking/reasoning block
  ↓
[FindingsMessage: evidence cards]
```

### Files to modify
- `components/ProjectChat.tsx` — fix sequencing in `startSimulation` and `resumeExecution`
- Optionally: `constants/timing.ts` — adjust transition delays if needed

### Files for reference
- `components/chat/AIMessage.tsx` — shows how `thinking` prop triggers reasoning block
- `components/ProcessSteps.tsx` — shows how reasoning is displayed during processing
- `components/chat/ChatStream.tsx` — renders messages and processing indicator in order
```

---

## PROMPT 4: Add "Create Audience" Button to Audience Modal

```
I need to add a "Create Audience" button to the audience picker modal (`AudiencePicker.tsx`). This lets users create a new custom audience when the pre-defined ones don't match their needs.

### Current audience modal

The `AudiencePicker` component (`components/chat/AudiencePicker.tsx`) is a portal-based modal with:
- A search input at the top (line 674-691)
- A scrollable list of audiences grouped by category (line 695-745)
- 580+ pre-defined audiences from `ET_CORE_AUDIENCES` and brand-specific arrays
- Each audience row shows: icon, label, description, agent count
- Clicking an audience calls `onSelect(audience)` and closes the modal

### What to add

1. **"Create Audience" button**: Add a prominent button at the bottom of the modal (sticky footer) or at the top below the search bar. It should be clearly visible but not dominate over the existing audience list.

   Recommended placement: **Sticky footer** at the bottom of the modal card, below the scrollable list. This keeps it always visible regardless of scroll position.

   Design:
   - Full-width button within the modal padding
   - Style: outline/ghost variant with a `+` or `UserPlus` icon
   - Text: "Create new audience"
   - Subtle separator line above it
   - `py-3 px-4` padding area

2. **Callback prop**: Add `onCreateAudience?: () => void` to `AudiencePickerProps`. When clicked, call this callback (and close the picker). The parent component will handle what happens next (e.g. opening a creation flow).

3. **Also show when search yields no results**: When the search returns no matches (the "No audiences match" empty state at line 696-699), show the create button more prominently — e.g. "Can't find what you're looking for?" with the create button below it.

### Implementation

In `AudiencePicker.tsx`:

- Add `onCreateAudience?: () => void` to the `AudiencePickerProps` interface
- Add a sticky footer div after the scrollable list div (after line 745, before the closing `</div>` of the card):
  ```
  {onCreateAudience && (
    <div className="border-t px-4 py-3 shrink-0">
      <button
        onClick={() => { onCreateAudience(); onClose(); }}
        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-primary hover:bg-primary/5 transition-colors border border-border"
      >
        <UserPlus className="w-4 h-4" />
        Create new audience
      </button>
    </div>
  )}
  ```
- Update the empty state to also include the create option
- Import `UserPlus` from lucide-react

In `ChatInputBar.tsx`:
- Pass `onCreateAudience` through to `AudiencePicker` if provided as a prop

In `ProjectChat.tsx` / `ChatStream.tsx`:
- Add a handler for `onCreateAudience` (for now it can just log or show a toast — the actual creation flow is a future feature)

### Files to modify
- `components/chat/AudiencePicker.tsx` — add button and callback
- `components/chat/ChatInputBar.tsx` — pass through the new prop
- `components/chat/ChatStream.tsx` — pass through the new prop
- `components/ProjectChat.tsx` — add handler
```

---

*End of prompts. Feed each one separately to Claude for implementation.*

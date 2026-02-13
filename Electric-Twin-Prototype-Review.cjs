const fs = require('fs');
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  Header, Footer, AlignmentType, LevelFormat, HeadingLevel,
  BorderStyle, WidthType, ShadingType, PageNumber, PageBreak
} = require('docx');

// ─── DESIGN TOKENS ────────────────────────────────────────────
const COLORS = {
  black: "1A1A1A",
  darkGray: "333333",
  mediumGray: "666666",
  lightGray: "999999",
  veryLightGray: "F5F5F5",
  tableHeaderBg: "1A1A1A",
  tableHeaderText: "FFFFFF",
  tableAltRow: "F9FAFB",
  criticalRed: "DC2626",
  criticalBg: "FEF2F2",
  highOrange: "EA580C",
  highBg: "FFF7ED",
  mediumYellow: "CA8A04",
  mediumBg: "FEFCE8",
  lowBlue: "2563EB",
  lowBg: "EFF6FF",
  accentPurple: "7C3AED",
  white: "FFFFFF",
  border: "E5E7EB",
  lightBorder: "F3F4F6",
};

const FONTS = {
  heading: "Arial",
  body: "Arial",
  mono: "Courier New",
};

// ─── TABLE HELPERS ────────────────────────────────────────────
const PAGE_WIDTH = 9360; // US Letter with 1" margins
const thinBorder = { style: BorderStyle.SINGLE, size: 1, color: COLORS.border };
const borders = { top: thinBorder, bottom: thinBorder, left: thinBorder, right: thinBorder };
const noBorderLeft = { ...borders, left: { style: BorderStyle.NONE, size: 0, color: COLORS.white } };
const noBorderRight = { ...borders, right: { style: BorderStyle.NONE, size: 0, color: COLORS.white } };
const cellMargins = { top: 60, bottom: 60, left: 120, right: 120 };

function headerCell(text, width) {
  return new TableCell({
    borders,
    width: { size: width, type: WidthType.DXA },
    shading: { fill: COLORS.tableHeaderBg, type: ShadingType.CLEAR },
    margins: cellMargins,
    verticalAlign: "center",
    children: [new Paragraph({
      spacing: { before: 0, after: 0 },
      children: [new TextRun({ text, bold: true, font: FONTS.body, size: 18, color: COLORS.tableHeaderText })]
    })]
  });
}

function bodyCell(text, width, opts = {}) {
  const { bold, color, fill, font } = opts;
  return new TableCell({
    borders,
    width: { size: width, type: WidthType.DXA },
    shading: fill ? { fill, type: ShadingType.CLEAR } : undefined,
    margins: cellMargins,
    verticalAlign: "center",
    children: [new Paragraph({
      spacing: { before: 0, after: 0 },
      children: [new TextRun({
        text,
        bold: bold || false,
        font: font || FONTS.body,
        size: 18,
        color: color || COLORS.darkGray,
      })]
    })]
  });
}

function severityCell(severity, width) {
  const map = {
    "Critical": { color: COLORS.criticalRed, fill: COLORS.criticalBg },
    "High": { color: COLORS.highOrange, fill: COLORS.highBg },
    "Medium": { color: COLORS.mediumYellow, fill: COLORS.mediumBg },
    "Low": { color: COLORS.lowBlue, fill: COLORS.lowBg },
  };
  const s = map[severity] || { color: COLORS.darkGray, fill: COLORS.veryLightGray };
  return bodyCell(severity, width, { bold: true, color: s.color, fill: s.fill });
}

// ─── CONTENT HELPERS ──────────────────────────────────────────
function heading(text, level = HeadingLevel.HEADING_1) {
  return new Paragraph({ heading: level, children: [new TextRun({ text, font: FONTS.heading })] });
}

function body(text, opts = {}) {
  return new Paragraph({
    spacing: { before: opts.spaceBefore || 60, after: opts.spaceAfter || 60 },
    children: [new TextRun({
      text,
      font: opts.font || FONTS.body,
      size: opts.size || 20,
      bold: opts.bold || false,
      color: opts.color || COLORS.darkGray,
      italics: opts.italics || false,
    })]
  });
}

function bodyMulti(runs, opts = {}) {
  return new Paragraph({
    spacing: { before: opts.spaceBefore || 60, after: opts.spaceAfter || 60 },
    children: runs.map(r => new TextRun({
      text: r.text,
      font: r.font || FONTS.body,
      size: r.size || 20,
      bold: r.bold || false,
      color: r.color || COLORS.darkGray,
      italics: r.italics || false,
    }))
  });
}

function bullet(text, ref = "bullets", level = 0) {
  return new Paragraph({
    numbering: { reference: ref, level },
    spacing: { before: 40, after: 40 },
    children: [new TextRun({ text, font: FONTS.body, size: 20, color: COLORS.darkGray })]
  });
}

function bulletMulti(runs, ref = "bullets", level = 0) {
  return new Paragraph({
    numbering: { reference: ref, level },
    spacing: { before: 40, after: 40 },
    children: runs.map(r => new TextRun({
      text: r.text,
      font: r.font || FONTS.body,
      size: r.size || 20,
      bold: r.bold || false,
      color: r.color || COLORS.darkGray,
      italics: r.italics || false,
    }))
  });
}

function spacer(height = 120) {
  return new Paragraph({ spacing: { before: height, after: 0 }, children: [] });
}

// ─── DOCUMENT DEFINITION ─────────────────────────────────────
const doc = new Document({
  styles: {
    default: {
      document: { run: { font: FONTS.body, size: 20, color: COLORS.darkGray } }
    },
    paragraphStyles: [
      {
        id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 32, bold: true, font: FONTS.heading, color: COLORS.black },
        paragraph: { spacing: { before: 360, after: 180 }, outlineLevel: 0 }
      },
      {
        id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 26, bold: true, font: FONTS.heading, color: COLORS.black },
        paragraph: { spacing: { before: 280, after: 120 }, outlineLevel: 1 }
      },
      {
        id: "Heading3", name: "Heading 3", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 22, bold: true, font: FONTS.heading, color: COLORS.darkGray },
        paragraph: { spacing: { before: 200, after: 80 }, outlineLevel: 2 }
      },
    ]
  },
  numbering: {
    config: [
      {
        reference: "bullets",
        levels: [{
          level: 0, format: LevelFormat.BULLET, text: "\u2022", alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 720, hanging: 360 } } }
        }, {
          level: 1, format: LevelFormat.BULLET, text: "\u2013", alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 1080, hanging: 360 } } }
        }]
      },
      {
        reference: "numbers",
        levels: [{
          level: 0, format: LevelFormat.DECIMAL, text: "%1.", alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 720, hanging: 360 } } }
        }]
      },
    ]
  },
  sections: [{
    properties: {
      page: {
        size: { width: 12240, height: 15840 },
        margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 }
      }
    },
    headers: {
      default: new Header({
        children: [new Paragraph({
          alignment: AlignmentType.RIGHT,
          children: [new TextRun({ text: "Electric Twin  |  Prototype Code Review", font: FONTS.body, size: 16, color: COLORS.lightGray, italics: true })]
        })]
      })
    },
    footers: {
      default: new Footer({
        children: [new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [
            new TextRun({ text: "Page ", font: FONTS.body, size: 16, color: COLORS.lightGray }),
            new TextRun({ children: [PageNumber.CURRENT], font: FONTS.body, size: 16, color: COLORS.lightGray }),
          ]
        })]
      })
    },
    children: [

      // ══════════════════════════════════════════════════════════
      // TITLE PAGE
      // ══════════════════════════════════════════════════════════
      spacer(2400),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 80 },
        children: [new TextRun({ text: "ELECTRIC TWIN", font: FONTS.heading, size: 20, color: COLORS.lightGray, bold: true })]
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 200 },
        children: [new TextRun({ text: "Prototype Code & UX Review", font: FONTS.heading, size: 48, bold: true, color: COLORS.black })]
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 80 },
        children: [new TextRun({ text: "Comprehensive audit of code quality, UX consistency, and design system", font: FONTS.body, size: 22, color: COLORS.mediumGray })]
      }),
      spacer(600),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [new TextRun({ text: "February 2026", font: FONTS.body, size: 20, color: COLORS.lightGray })]
      }),

      new Paragraph({ children: [new PageBreak()] }),

      // ══════════════════════════════════════════════════════════
      // EXECUTIVE SUMMARY
      // ══════════════════════════════════════════════════════════
      heading("Executive Summary"),
      body("This review audits the Electric Twin research agent prototype across three dimensions: code architecture, UX coherence, and design system consistency. The prototype has been built incrementally, and as expected, this has introduced duplication, inconsistencies, and structural debt that should be addressed before integrating the new Report Builder survey creation flow."),
      spacer(80),
      body("The codebase consists of 73 source files totaling approximately 6,500 lines across 8 oversized components, with the worst offender (researchGenerator.ts) at 1,473 lines. The most impactful finding is that the three Method configuration components (MethodFullPage, MethodSheet, MethodSidePanel) contain approximately 500 lines of duplicated form-field rendering logic."),
      spacer(120),

      // Summary stats table
      new Table({
        width: { size: PAGE_WIDTH, type: WidthType.DXA },
        columnWidths: [3120, 3120, 3120],
        rows: [
          new TableRow({ children: [
            headerCell("Metric", 3120),
            headerCell("Count", 3120),
            headerCell("Impact", 3120),
          ]}),
          new TableRow({ children: [
            bodyCell("Critical issues", 3120, { bold: true }),
            bodyCell("6", 3120, { color: COLORS.criticalRed, bold: true }),
            bodyCell("Must fix before new feature work", 3120),
          ]}),
          new TableRow({ children: [
            bodyCell("High issues", 3120, { bold: true }),
            bodyCell("12", 3120, { color: COLORS.highOrange, bold: true }),
            bodyCell("Should fix during refactor pass", 3120),
          ]}),
          new TableRow({ children: [
            bodyCell("Medium issues", 3120, { bold: true }),
            bodyCell("15", 3120, { color: COLORS.mediumYellow, bold: true }),
            bodyCell("Address incrementally", 3120),
          ]}),
          new TableRow({ children: [
            bodyCell("Low issues", 3120, { bold: true }),
            bodyCell("8", 3120, { color: COLORS.lowBlue, bold: true }),
            bodyCell("Nice-to-have improvements", 3120),
          ]}),
        ]
      }),

      new Paragraph({ children: [new PageBreak()] }),

      // ══════════════════════════════════════════════════════════
      // 1. CODE ARCHITECTURE & DUPLICATION
      // ══════════════════════════════════════════════════════════
      heading("1. Code Architecture & Duplication"),

      heading("1.1 Oversized Files", HeadingLevel.HEADING_2),
      body("Eight files exceed 600 lines, making them difficult to test, review, and extend. The following table ranks them by severity:"),
      spacer(80),

      new Table({
        width: { size: PAGE_WIDTH, type: WidthType.DXA },
        columnWidths: [3500, 1200, 1200, 3460],
        rows: [
          new TableRow({ children: [
            headerCell("File", 3500),
            headerCell("Lines", 1200),
            headerCell("Severity", 1200),
            headerCell("Recommendation", 3460),
          ]}),
          new TableRow({ children: [
            bodyCell("services/researchGenerator.ts", 3500, { font: FONTS.mono }),
            bodyCell("1,473", 1200),
            severityCell("Critical", 1200),
            bodyCell("Split into toolSelector, toolExecutor, canvasGenerator, fallbacks", 3460),
          ]}),
          new TableRow({ children: [
            bodyCell("components/MethodSheet.tsx", 3500, { font: FONTS.mono }),
            bodyCell("835", 1200),
            severityCell("Critical", 1200),
            bodyCell("Extract shared FormField component", 3460),
          ]}),
          new TableRow({ children: [
            bodyCell("components/MethodFullPage.tsx", 3500, { font: FONTS.mono }),
            bodyCell("805", 1200),
            severityCell("Critical", 1200),
            bodyCell("Extract shared FormField component", 3460),
          ]}),
          new TableRow({ children: [
            bodyCell("components/InlineCanvas.tsx", 3500, { font: FONTS.mono }),
            bodyCell("726", 1200),
            severityCell("High", 1200),
            bodyCell("Extract MiniQuestionCard and ThemeCard subcomponents", 3460),
          ]}),
          new TableRow({ children: [
            bodyCell("components/MethodSidePanel.tsx", 3500, { font: FONTS.mono }),
            bodyCell("686", 1200),
            severityCell("Critical", 1200),
            bodyCell("Uses same duplicated FormField logic", 3460),
          ]}),
          new TableRow({ children: [
            bodyCell("App.tsx", 3500, { font: FONTS.mono }),
            bodyCell("654", 1200),
            severityCell("High", 1200),
            bodyCell("Extract startSimulation into custom hook", 3460),
          ]}),
          new TableRow({ children: [
            bodyCell("components/QueryInput.tsx", 3500, { font: FONTS.mono }),
            bodyCell("650", 1200),
            severityCell("High", 1200),
            bodyCell("Extract AudiencePicker and MethodPicker", 3460),
          ]}),
          new TableRow({ children: [
            bodyCell("components/ExpandedCanvas.tsx", 3500, { font: FONTS.mono }),
            bodyCell("637", 1200),
            severityCell("High", 1200),
            bodyCell("Extract ThemeCard, simplify scroll tracking", 3460),
          ]}),
        ]
      }),

      spacer(200),
      heading("1.2 Duplicated Code Clusters", HeadingLevel.HEADING_2),

      body("The following areas have the highest duplication density, listed in order of impact:"),
      spacer(80),

      heading("Form Field Rendering (approx. 500 duplicated lines)", HeadingLevel.HEADING_3),
      body("MethodFullPage.tsx, MethodSheet.tsx, and MethodSidePanel.tsx each contain nearly identical form field rendering subcomponents (FullPageFormField, FormField, SidePanelFormField). These include duplicated audience selector popovers, multi-select handling, radio/checkbox rendering, image upload logic, and question/message list rendering. The only differences are minor spacing and sizing values."),
      spacer(40),
      bodyMulti([
        { text: "Recommendation: ", bold: true },
        { text: "Create a single ", color: COLORS.darkGray },
        { text: "MethodFormField", bold: true, font: FONTS.mono },
        { text: " component that accepts a ", color: COLORS.darkGray },
        { text: "variant", font: FONTS.mono },
        { text: " prop (\"fullpage\" | \"sheet\" | \"sidepanel\") to control sizing. This would eliminate roughly 500 lines.", color: COLORS.darkGray },
      ]),

      spacer(120),
      heading("Icon Mapping (5 copies)", HeadingLevel.HEADING_3),
      body("The method-to-icon mapping object is copy-pasted across 5 files: MethodFullPage.tsx, MethodSheet.tsx, MethodSidePanel.tsx, WorkingPane.tsx, and StudyPlanPill.tsx. Each defines the same mapping from method IDs to Lucide icons."),
      spacer(40),
      bodyMulti([
        { text: "Recommendation: ", bold: true },
        { text: "Create a shared ", color: COLORS.darkGray },
        { text: "lib/methodIcons.ts", bold: true, font: FONTS.mono },
        { text: " utility and import it everywhere.", color: COLORS.darkGray },
      ]),

      spacer(120),
      heading("Sentiment Color Mapping (2 copies)", HeadingLevel.HEADING_3),
      body("ExpandedCanvas.tsx and InlineCanvas.tsx both define identical sentiment-to-color mapping objects. Brand color defaults are also duplicated between InlineCanvas.tsx and QuestionCard.tsx."),

      spacer(120),
      heading("Planning Step Arrays in App.tsx", HeadingLevel.HEADING_3),
      body("App.tsx defines three nearly identical planning step arrays that only differ in status values. The 233-line startSimulation function contains these along with duplicated setConversation() mapping patterns repeated 5+ times."),
      spacer(40),
      bodyMulti([
        { text: "Recommendation: ", bold: true },
        { text: "Extract a ", color: COLORS.darkGray },
        { text: "useSimulation", font: FONTS.mono },
        { text: " custom hook with utility functions for step progression, and a ", color: COLORS.darkGray },
        { text: "updateMessageSteps()", font: FONTS.mono },
        { text: " helper to replace the repeated mapping pattern.", color: COLORS.darkGray },
      ]),

      spacer(120),
      heading("Research Tool Execution (services)", HeadingLevel.HEADING_3),
      body("executeSurveyTool(), executeFocusGroupTool(), and executeComparisonTool() in researchGenerator.ts all follow the identical pattern: build prompt, call API, parse response, create canvas. The two fallback canvas generators are also near-duplicates."),
      spacer(40),
      bodyMulti([
        { text: "Recommendation: ", bold: true },
        { text: "Create a generic ", color: COLORS.darkGray },
        { text: "executeResearchTool<T>(config)", font: FONTS.mono },
        { text: " function and define tool-specific configs.", color: COLORS.darkGray },
      ]),

      new Paragraph({ children: [new PageBreak()] }),

      // ══════════════════════════════════════════════════════════
      // 1.3 Architecture Issues
      // ══════════════════════════════════════════════════════════
      heading("1.3 Architecture Issues", HeadingLevel.HEADING_2),

      heading("Mega-file: researchGenerator.ts (1,473 lines)", HeadingLevel.HEADING_3),
      body("This single file handles tool selection, tool execution, canvas generation, fallback logic, study plan creation, normalization functions, and legacy API support. It should be split into at least 4 focused modules:"),
      bullet("toolSelector.ts \u2013 tool selection and method mapping logic"),
      bullet("toolExecutor.ts \u2013 API calls and response parsing"),
      bullet("canvasGenerator.ts \u2013 canvas construction from parsed results"),
      bullet("fallbacks.ts \u2013 fallback/mock canvas generation"),

      spacer(120),
      heading("Type Inconsistencies", HeadingLevel.HEADING_3),
      body("The types/ directory and data/mockData.ts define competing Audience interfaces. types/audience.ts has icon as optional while mockData.ts requires it. The Canvas type has an optional \"type\" field that is always set in practice, and the Report type alias (type Report = Canvas) is legacy naming that should be removed."),
      spacer(40),
      body("The agentResponse.ts file defines CanvasType with heatmap/sentiment/comparison variants that are never actually created \u2013 only \"quantitative\" and \"qualitative\" are generated. StudyPlan is optional on Canvas but inconsistently populated across code paths."),

      spacer(120),
      heading("State Management Duplication in Hooks", HeadingLevel.HEADING_3),
      body("useAudiences.ts and useHistory.ts implement nearly identical add/update/remove patterns. useConversation.ts manages 12+ action callbacks that follow the same structure. These could share a generic useEntityManager<T> hook."),

      spacer(120),
      heading("Naming Inconsistencies", HeadingLevel.HEADING_3),
      body("The codebase has several naming conflicts: \"segments\" vs \"breakdowns\" for the same concept, \"Report\" vs \"Canvas\" type aliases, \"respondents\" vs \"sample_size\" across API/internal boundaries, and tool names using snake_case (run_survey) while functions use camelCase (executeSurveyTool). Console logs inconsistently reference \"Merlin Agent\" vs \"Agent\"."),

      spacer(120),
      heading("Hardcoded Values", HeadingLevel.HEADING_3),
      body("Timing delays (600ms, 400ms, 800ms) are scattered through App.tsx without constants. The Claude model string \"claude-3-haiku-20240307\" appears in 5 places. Message IDs use Date.now() which risks collisions. The config.ts file contains a single boolean flag when it should centralize all these values."),

      new Paragraph({ children: [new PageBreak()] }),

      // ══════════════════════════════════════════════════════════
      // 2. UX INCONSISTENCIES
      // ══════════════════════════════════════════════════════════
      heading("2. UX Inconsistencies"),

      heading("2.1 Form Validation Feedback", HeadingLevel.HEADING_2),
      body("MethodFullPage and MethodSheet perform validation but only disable the submit button without explaining why. Users receive no inline error messages, no field-level highlighting, and no indication of which required fields are missing. This is the most impactful UX issue in the current prototype.", { spaceBefore: 80 }),
      spacer(40),
      bodyMulti([
        { text: "Recommendation: ", bold: true },
        { text: "Add field-level validation states with inline error messages. Show a summary of missing fields when the user attempts to submit.", color: COLORS.darkGray },
      ]),

      spacer(160),
      heading("2.2 Clarification Suggestions Are Not Interactive", HeadingLevel.HEADING_2),
      body("ClarificationMessage.tsx renders suggestion chips that appear clickable (styled as pills) but have no click handlers. Users likely try to click these and nothing happens, which is confusing and breaks the conversational flow."),

      spacer(160),
      heading("2.3 Segment Selection UX", HeadingLevel.HEADING_2),
      body("The segment selection bar in ExpandedCanvas and InlineCanvas appears and disappears without smooth transitions, causing layout shift. There is no visual indicator of how many segments are selected at a glance, and the multi-select behavior for bar charts is not communicated to users."),

      spacer(160),
      heading("2.4 Query Input Placeholder Animation", HeadingLevel.HEADING_2),
      body("The typing animation in QueryInput.tsx continues running even when the user has started typing, which can be visually confusing. There is also no visual affordance indicating that @ and / trigger autocomplete functionality."),

      spacer(160),
      heading("2.5 View Switching in AudiencesList", HeadingLevel.HEADING_2),
      body("Switching between \"all\" and grouped views in AudiencesList causes a significant layout change with no transition animation. Users may feel disoriented or miss data during the switch."),

      spacer(160),
      heading("2.6 Process Steps Clarity", HeadingLevel.HEADING_2),
      body("The \"Thought for Xs\" messaging in ProcessSteps.tsx is somewhat cryptic without context. Expanding completed steps uses a quick, small animation that could easily be missed. The entire simulation flow in App.tsx uses a series of timed delays that create a fixed, non-responsive feel."),

      spacer(160),
      heading("2.7 Method Configuration Navigation", HeadingLevel.HEADING_2),
      body("Three separate components exist for method configuration (MethodFullPage, MethodSheet, MethodSidePanel) but the criteria for which one appears is unclear from a user perspective. The transition between these views should be more intentional, with consistent entry/exit animations."),

      spacer(160),
      heading("2.8 Conditional Rendering Complexity in App.tsx", HeadingLevel.HEADING_2),
      body("The main App component has deeply nested ternary rendering: creatingMethod vs expandedCanvas vs activeView. This creates confusing view state transitions and makes it difficult to reason about what the user sees at any given moment."),
      spacer(40),
      bodyMulti([
        { text: "Recommendation: ", bold: true },
        { text: "Introduce a view state machine or router to make navigation explicit and predictable.", color: COLORS.darkGray },
      ]),

      new Paragraph({ children: [new PageBreak()] }),

      // ══════════════════════════════════════════════════════════
      // 3. DESIGN SYSTEM INCONSISTENCIES
      // ══════════════════════════════════════════════════════════
      heading("3. Design System Inconsistencies"),

      body("The prototype uses Tailwind CSS with shadcn/ui components and custom CSS variables in globals.css. However, the application of these design tokens is inconsistent across components. Below is a detailed breakdown."),

      spacer(120),
      heading("3.1 Color Token Usage", HeadingLevel.HEADING_2),
      body("The most pervasive design system issue is the mixing of three different color systems across the codebase:"),
      spacer(60),

      new Table({
        width: { size: PAGE_WIDTH, type: WidthType.DXA },
        columnWidths: [2200, 3580, 3580],
        rows: [
          new TableRow({ children: [
            headerCell("System", 2200),
            headerCell("Example", 3580),
            headerCell("Used In", 3580),
          ]}),
          new TableRow({ children: [
            bodyCell("Design tokens", 2200, { bold: true }),
            bodyCell("text-foreground, bg-background, border-border", 3580, { font: FONTS.mono }),
            bodyCell("WorkingPane, layout components", 3580),
          ]}),
          new TableRow({ children: [
            bodyCell("Hardcoded Tailwind", 2200, { bold: true }),
            bodyCell("text-gray-900, bg-white, border-gray-200", 3580, { font: FONTS.mono }),
            bodyCell("AudienceDetail, AudiencesList", 3580),
          ]}),
          new TableRow({ children: [
            bodyCell("CSS variables", 2200, { bold: true }),
            bodyCell("var(--background), var(--border), var(--text-primary)", 3580, { font: FONTS.mono }),
            bodyCell("EditQuestionModal", 3580),
          ]}),
        ]
      }),

      spacer(80),
      body("All components should use the design token system (text-foreground, bg-background, etc.) for theme compatibility. Hardcoded colors like text-gray-900 and bg-white will break in dark mode."),

      spacer(160),
      heading("3.2 Spacing Scale", HeadingLevel.HEADING_2),
      body("Component spacing varies significantly without a clear rationale:"),
      spacer(60),

      new Table({
        width: { size: PAGE_WIDTH, type: WidthType.DXA },
        columnWidths: [3120, 3120, 3120],
        rows: [
          new TableRow({ children: [
            headerCell("Component", 3120),
            headerCell("Internal Spacing", 3120),
            headerCell("Container Padding", 3120),
          ]}),
          new TableRow({ children: [
            bodyCell("MethodSheet", 3120),
            bodyCell("space-y-6", 3120, { font: FONTS.mono }),
            bodyCell("p-6", 3120, { font: FONTS.mono }),
          ]}),
          new TableRow({ children: [
            bodyCell("MethodSidePanel", 3120),
            bodyCell("space-y-5", 3120, { font: FONTS.mono }),
            bodyCell("p-4", 3120, { font: FONTS.mono }),
          ]}),
          new TableRow({ children: [
            bodyCell("WorkingPane", 3120),
            bodyCell("space-y-8", 3120, { font: FONTS.mono }),
            bodyCell("py-6", 3120, { font: FONTS.mono }),
          ]}),
          new TableRow({ children: [
            bodyCell("ExpandedCanvas", 3120),
            bodyCell("space-y-10", 3120, { font: FONTS.mono }),
            bodyCell("pb-10", 3120, { font: FONTS.mono }),
          ]}),
          new TableRow({ children: [
            bodyCell("AudienceDetail", 3120),
            bodyCell("gap-6", 3120, { font: FONTS.mono }),
            bodyCell("p-6", 3120, { font: FONTS.mono }),
          ]}),
          new TableRow({ children: [
            bodyCell("AudiencesList", 3120),
            bodyCell("gap-3 / mb-3", 3120, { font: FONTS.mono }),
            bodyCell("p-6", 3120, { font: FONTS.mono }),
          ]}),
        ]
      }),

      spacer(80),
      bodyMulti([
        { text: "Recommendation: ", bold: true },
        { text: "Establish a spacing convention, e.g., content padding: ", color: COLORS.darkGray },
        { text: "p-6", font: FONTS.mono },
        { text: " for panels, ", color: COLORS.darkGray },
        { text: "space-y-6", font: FONTS.mono },
        { text: " between sections, ", color: COLORS.darkGray },
        { text: "space-y-3", font: FONTS.mono },
        { text: " between related items. Document in a design-tokens.md file.", color: COLORS.darkGray },
      ]),

      spacer(160),
      heading("3.3 Border Radius", HeadingLevel.HEADING_2),
      body("Six different border-radius values are used without clear hierarchy:"),
      spacer(60),

      new Table({
        width: { size: PAGE_WIDTH, type: WidthType.DXA },
        columnWidths: [1560, 1560, 1560, 1560, 1560, 1560],
        rows: [
          new TableRow({ children: [
            headerCell("rounded-sm", 1560),
            headerCell("rounded-md", 1560),
            headerCell("rounded-lg", 1560),
            headerCell("rounded-xl", 1560),
            headerCell("rounded-2xl", 1560),
            headerCell("rounded-full", 1560),
          ]}),
          new TableRow({ children: [
            bodyCell("3 uses", 1560),
            bodyCell("10+ uses", 1560),
            bodyCell("15+ uses", 1560),
            bodyCell("5 uses", 1560),
            bodyCell("3 uses", 1560),
            bodyCell("4 uses", 1560),
          ]}),
        ]
      }),

      spacer(80),
      bodyMulti([
        { text: "Recommendation: ", bold: true },
        { text: "Standardize on 3 tiers: ", color: COLORS.darkGray },
        { text: "rounded-md", font: FONTS.mono },
        { text: " (inputs, small elements), ", color: COLORS.darkGray },
        { text: "rounded-lg", font: FONTS.mono },
        { text: " (cards, panels), ", color: COLORS.darkGray },
        { text: "rounded-full", font: FONTS.mono },
        { text: " (pills, avatars only).", color: COLORS.darkGray },
      ]),

      spacer(160),
      heading("3.4 Button Sizing", HeadingLevel.HEADING_2),
      body("Button heights vary across components without consistent sizing tiers:"),
      bullet("MethodSheet buttons: h-11"),
      bullet("MethodSidePanel buttons: h-9"),
      bullet("QueryInput buttons: h-8, h-9, and h-10 in the same component"),
      spacer(40),
      bodyMulti([
        { text: "Recommendation: ", bold: true },
        { text: "Use the shadcn/ui Button size variants consistently: ", color: COLORS.darkGray },
        { text: "sm", font: FONTS.mono },
        { text: " (h-8), ", color: COLORS.darkGray },
        { text: "default", font: FONTS.mono },
        { text: " (h-9), ", color: COLORS.darkGray },
        { text: "lg", font: FONTS.mono },
        { text: " (h-11).", color: COLORS.darkGray },
      ]),

      spacer(160),
      heading("3.5 Shadow Usage", HeadingLevel.HEADING_2),
      body("Shadows range from shadow-sm to shadow-2xl with no clear hierarchy. Additionally, globals.css defines shadow-2xs and shadow-xs as identical values, and shadow-sm and shadow (default) are also identical \u2013 these appear to be copy-paste errors."),

      spacer(160),
      heading("3.6 Typography", HeadingLevel.HEADING_2),
      body("Header sizing is inconsistent: some sections use text-lg, others text-xl, others text-2xl for equivalent hierarchy levels. Body text alternates between text-sm and the implicit default. Labels use text-xs in some places and text-sm in others for the same type of content."),
      spacer(40),
      body("The font loading setup also has a gap: globals.css declares Geist, Cabinet Grotesk, Arbutus Slab, and JetBrains Mono as font families, but the tailwind.config.js font-family values reference CSS variables without system font fallbacks."),

      spacer(160),
      heading("3.7 Inline Styles vs Tailwind", HeadingLevel.HEADING_2),
      body("12+ components mix inline React styles with Tailwind classes. The most common pattern is inline width percentages for progress bars and inline backgroundColor for brand-colored elements. EditQuestionModal is the worst offender, using CSS variable references (var(--background)) directly in style attributes."),
      spacer(40),
      bodyMulti([
        { text: "Recommendation: ", bold: true },
        { text: "For dynamic values like percentages, inline style is acceptable. For brand colors, use CSS custom properties via Tailwind arbitrary values: ", color: COLORS.darkGray },
        { text: "bg-[var(--brand-primary)]", font: FONTS.mono },
        { text: ". Never mix var() in inline styles with Tailwind classes on the same element.", color: COLORS.darkGray },
      ]),

      spacer(160),
      heading("3.8 CSS Globals Duplication", HeadingLevel.HEADING_2),
      body("globals.css has significant internal duplication. The color variables are defined in :root, repeated in .dark, and then referenced a third time in the @theme inline block. The height/overflow declarations for html, body, and #root repeat the same values (100vh/100dvh fallback pattern) three times. Shadow definitions contain duplicate values (shadow-2xs equals shadow-xs, shadow equals shadow-sm)."),

      new Paragraph({ children: [new PageBreak()] }),

      // ══════════════════════════════════════════════════════════
      // 4. PRIORITY ACTION PLAN
      // ══════════════════════════════════════════════════════════
      heading("4. Priority Action Plan"),

      body("The following actions are recommended before integrating the new Report Builder survey creation flow, ordered by impact:"),
      spacer(80),

      new Table({
        width: { size: PAGE_WIDTH, type: WidthType.DXA },
        columnWidths: [500, 1100, 4260, 1600, 1900],
        rows: [
          new TableRow({ children: [
            headerCell("#", 500),
            headerCell("Severity", 1100),
            headerCell("Action", 4260),
            headerCell("Est. Effort", 1600),
            headerCell("Files Affected", 1900),
          ]}),
          new TableRow({ children: [
            bodyCell("1", 500, { bold: true }),
            severityCell("Critical", 1100),
            bodyCell("Extract shared MethodFormField component from 3 Method* components", 4260),
            bodyCell("4-6 hours", 1600),
            bodyCell("3 files", 1900),
          ]}),
          new TableRow({ children: [
            bodyCell("2", 500, { bold: true }),
            severityCell("Critical", 1100),
            bodyCell("Split researchGenerator.ts into 4 focused modules", 4260),
            bodyCell("3-4 hours", 1600),
            bodyCell("1 file \u2192 4", 1900),
          ]}),
          new TableRow({ children: [
            bodyCell("3", 500, { bold: true }),
            severityCell("Critical", 1100),
            bodyCell("Unify type definitions (Audience, Canvas, Report alias)", 4260),
            bodyCell("2-3 hours", 1600),
            bodyCell("6+ files", 1900),
          ]}),
          new TableRow({ children: [
            bodyCell("4", 500, { bold: true }),
            severityCell("High", 1100),
            bodyCell("Standardize color tokens \u2013 replace all hardcoded colors with design tokens", 4260),
            bodyCell("2-3 hours", 1600),
            bodyCell("10+ files", 1900),
          ]}),
          new TableRow({ children: [
            bodyCell("5", 500, { bold: true }),
            severityCell("High", 1100),
            bodyCell("Extract shared utilities: icon mapping, sentiment colors, brand defaults", 4260),
            bodyCell("1-2 hours", 1600),
            bodyCell("8 files", 1900),
          ]}),
          new TableRow({ children: [
            bodyCell("6", 500, { bold: true }),
            severityCell("High", 1100),
            bodyCell("Extract useSimulation hook from App.tsx startSimulation", 4260),
            bodyCell("2-3 hours", 1600),
            bodyCell("1 file", 1900),
          ]}),
          new TableRow({ children: [
            bodyCell("7", 500, { bold: true }),
            severityCell("High", 1100),
            bodyCell("Add form validation feedback (inline errors, field highlighting)", 4260),
            bodyCell("3-4 hours", 1600),
            bodyCell("3 files", 1900),
          ]}),
          new TableRow({ children: [
            bodyCell("8", 500, { bold: true }),
            severityCell("High", 1100),
            bodyCell("Standardize spacing, border-radius, and button sizes", 4260),
            bodyCell("2-3 hours", 1600),
            bodyCell("15+ files", 1900),
          ]}),
          new TableRow({ children: [
            bodyCell("9", 500, { bold: true }),
            severityCell("Medium", 1100),
            bodyCell("Clean up globals.css \u2013 remove duplication, fix shadow values", 4260),
            bodyCell("1 hour", 1600),
            bodyCell("1 file", 1900),
          ]}),
          new TableRow({ children: [
            bodyCell("10", 500, { bold: true }),
            severityCell("Medium", 1100),
            bodyCell("Make clarification suggestions clickable", 4260),
            bodyCell("1 hour", 1600),
            bodyCell("1 file", 1900),
          ]}),
          new TableRow({ children: [
            bodyCell("11", 500, { bold: true }),
            severityCell("Medium", 1100),
            bodyCell("Centralize config: timing constants, model string, feature flags", 4260),
            bodyCell("1-2 hours", 1600),
            bodyCell("5+ files", 1900),
          ]}),
          new TableRow({ children: [
            bodyCell("12", 500, { bold: true }),
            severityCell("Medium", 1100),
            bodyCell("Add view state management (router or state machine) to App.tsx", 4260),
            bodyCell("3-4 hours", 1600),
            bodyCell("2 files", 1900),
          ]}),
          new TableRow({ children: [
            bodyCell("13", 500, { bold: true }),
            severityCell("Low", 1100),
            bodyCell("Standardize naming conventions (handlers, state booleans, refs)", 4260),
            bodyCell("2 hours", 1600),
            bodyCell("All files", 1900),
          ]}),
          new TableRow({ children: [
            bodyCell("14", 500, { bold: true }),
            severityCell("Low", 1100),
            bodyCell("Add font fallbacks to tailwind.config.js, add ESLint/Prettier", 4260),
            bodyCell("1 hour", 1600),
            bodyCell("Config files", 1900),
          ]}),
        ]
      }),

      spacer(200),
      body("Total estimated effort: 26-38 hours of focused refactoring work. Items 1-3 are strongly recommended before adding the new survey creation flow, as the Report Builder will likely need similar form components and canvas generation patterns.", { bold: true }),

    ]
  }]
});

// ─── BUILD ────────────────────────────────────────────────────
Packer.toBuffer(doc).then(buffer => {
  fs.writeFileSync("/sessions/festive-optimistic-ramanujan/mnt/Merlin-Research-Agent/Electric-Twin-Prototype-Review.docx", buffer);
  console.log("Document created successfully!");
});

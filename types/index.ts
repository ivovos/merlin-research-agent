// Audience types
export type {
  Audience,
  AudienceDetails,
  Segment,
  Project,
  Account,
  ResearchProject,
  UploadedBrief,
} from './audience';

// Conversation types
export type {
  ProcessStep,
  Message,
  Conversation,
} from './conversation';

// Canvas types (formerly Report)
export type {
  QuestionOption,
  QuestionResult,
  QualitativeTheme,
  Canvas,
  Report, // Backwards compatibility alias
  StudyPlan,
} from './canvas';

// Segment selection types
export type {
  SelectedSegment,
  SelectedSegments,
} from './segment';

// Agent response types
export type {
  ClarificationRequest,
  ToolSelection,
  AgentDecision,
  ResearchToolResult,
  AgentResult,
  HeatmapData,
  SentimentData,
  ComparisonData,
  CanvasType,
} from './agentResponse';

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

// Survey types (Phase 1 - survey builder merge)
export type {
  SurveyType,
  SurveyStatus,
  QuestionType,
  Stimulus,
  SurveyQuestion,
  SegmentBreakdown,
  Finding,
  Survey,
  SurveyProject,
  SurveyTypeConfig,
} from './survey';

export { SURVEY_TYPE_CONFIGS } from './survey'

// Chat & project types (Phase 2 - project=chat migration)
export type {
  Attachment,
  ChatMessage,
  ChatMessageUser,
  ChatMessageAI,
  ChatMessageFindings,
  ChatMessageAttachment,
  ChatMessageDeliverable,
  ChatMessageSystem,
  AppView,
  ProjectState,
  Study,
} from './chat';

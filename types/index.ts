// Audience types
export type {
  Audience,
  AudienceDetails,
  Segment,
  Project,
  Account,
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
} from './canvas';

// Segment selection types
export type {
  SelectedSegment,
  SelectedSegments,
} from './segment';

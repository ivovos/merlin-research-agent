// Research Tool Definitions for Merlin Agent
// These tools define the available research methodologies the agent can choose from

export { surveyTool, type SurveyToolInput } from './surveyTool'
export { focusGroupTool, type FocusGroupToolInput } from './focusGroupTool'
export { heatmapTool, type HeatmapToolInput } from './heatmapTool'
export { sentimentTool, type SentimentToolInput } from './sentimentTool'
export { comparisonTool, type ComparisonToolInput } from './comparisonTool'
export { clarificationTool, type ClarificationToolInput } from './clarificationTool'

import { surveyTool } from './surveyTool'
import { focusGroupTool } from './focusGroupTool'
import { heatmapTool } from './heatmapTool'
import { sentimentTool } from './sentimentTool'
import { comparisonTool } from './comparisonTool'
import { clarificationTool } from './clarificationTool'

// All research tools available to the agent
export const researchTools = [
  surveyTool,
  focusGroupTool,
  heatmapTool,
  sentimentTool,
  comparisonTool,
  clarificationTool,
]

// Tool names for type safety
export type ResearchToolName =
  | 'run_survey'
  | 'run_focus_group'
  | 'run_heatmap'
  | 'run_sentiment_analysis'
  | 'run_comparison'
  | 'ask_clarification'

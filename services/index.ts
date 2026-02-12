export { anthropic } from './api'
export {
  generateResearchData,
  generateResearchWithAgent,
  selectResearchTool,
  executeSelectedTool,
  isQualitativeQuery,
  generateConversationTitle,
} from './researchGenerator'
export type { ResearchResult, ToolSelectionResult } from './researchGenerator'

// Export tools and agent prompt
export { researchTools, type ResearchToolName } from './tools'
export { AGENT_SYSTEM_PROMPT, getAgentPromptWithContext } from './agentPrompt'

// Export new sub-modules for direct access
export { executeResearchTool } from './toolExecutor'
export { createStudyPlan, getProcessStepsForTool, detectComparisonSegments } from './toolSelector'
export {
  normalizeOptions,
  normalizeComparisonOptions,
  generateFallbackSurveyCanvas,
  generateFallbackFocusGroupCanvas,
  generateFallbackComparisonCanvas,
} from './canvasGenerator'

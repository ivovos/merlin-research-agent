import type { Canvas, SurveyProject, Survey, QuestionType } from '@/types'
import { canvasToFindings } from './canvasToFindings'

/**
 * Converts a Canvas (from chat research flow) into a SurveyProject
 * so it can be saved to the projects list and viewed in ProjectDetail.
 */
export function canvasToProject(canvas: Canvas): SurveyProject {
  const today = new Date().toISOString().slice(0, 10)
  const findings = canvasToFindings(canvas)

  const survey: Survey = {
    id: `survey_${Date.now()}`,
    type: 'simple',
    name: canvas.title,
    status: 'completed',
    questions: canvas.questions.map(q => ({
      id: q.id,
      type: 'single_select' as QuestionType,
      text: q.question,
      required: true,
    })),
    audiences: [canvas.audience.id],
    stimuli: [],
    findings,
    sampleSize: canvas.respondents,
    createdAt: today,
    updatedAt: today,
  }

  return {
    id: `proj_chat_${Date.now()}`,
    name: canvas.title,
    brand: 'Research',
    icon: '🔬',
    surveyType: 'simple',
    surveys: [survey],
    stimuli: [],
    audienceIds: [canvas.audience.id],
    status: 'completed',
    createdAt: today,
    updatedAt: today,
  }
}

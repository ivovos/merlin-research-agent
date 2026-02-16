import React, { useState, useCallback, useRef } from 'react'
import type { ProjectState, ChatMessage, Finding, Survey, ProcessStep } from '@/types'
import { SURVEY_TYPE_CONFIGS } from '@/types'
import type { PickerMethod } from '@/components/chat/MethodsPicker'
import { ChatStream } from '@/components/chat/ChatStream'
import { SurveyBuilder } from '@/components/builder/SurveyBuilder'
import { QuickPollPage } from '@/components/quick-poll/QuickPollPage'
import { StudyPlanOverlay } from '@/components/results/StudyPlanOverlay'
import { Button } from '@/components/ui/button'
import { SquareArrowOutUpRight } from 'lucide-react'
import { generateMockFindings } from '@/lib/generateMockFindings'
import { canvasToFindings } from '@/lib/canvasToFindings'
import { selectResearchTool, executeSelectedTool } from '@/services'
import { createPlanningSteps, createExecutionSteps } from '@/constants/processSteps'
import { TIMING } from '@/constants/timing'
import type { BuilderState } from '@/hooks/useSurveyBuilder'

interface ProjectChatProps {
  project: ProjectState
  onAddMessage: (msg: ChatMessage) => void
  onAddStudy: (study: Survey) => void
  onRenameProject?: (name: string) => void
}

export const ProjectChat: React.FC<ProjectChatProps> = ({
  project,
  onAddMessage,
  onAddStudy,
  onRenameProject,
}) => {
  const [showBuilder, setShowBuilder] = useState(false)
  const [showQuickPoll, setShowQuickPoll] = useState(false)
  const [processing, setProcessing] = useState<{
    steps?: ProcessStep[]
    isComplete?: boolean
    thinkingTime?: number
  } | undefined>(undefined)

  // Track whether a simulation is in progress (prevent double-submit)
  const simulatingRef = useRef(false)

  // ── Research simulation ──
  const startSimulation = useCallback(
    async (query: string) => {
      if (simulatingRef.current) return
      simulatingRef.current = true

      const startTime = Date.now()

      // 1) Add user message
      const userMsg: ChatMessage = {
        id: `msg_${Date.now()}_u`,
        type: 'user',
        text: query,
        timestamp: Date.now(),
      }
      onAddMessage(userMsg)

      // Rename project from first message if it's still "New Research Project"
      if (project.name === 'New Research Project' && onRenameProject) {
        const name = query.length <= 50
          ? query
          : query.slice(0, 50).replace(/\s+\S*$/, '') + '...'
        onRenameProject(name)
      }

      // 2) Planning phase — show animated steps
      setProcessing({ steps: createPlanningSteps(1) })

      try {
        const toolResult = await selectResearchTool(query)

        // Animate to step 2
        setProcessing({ steps: createPlanningSteps(2) })
        await new Promise(r => setTimeout(r, TIMING.PHASE_1_COMPLETE))

        // Complete planning
        setProcessing({ steps: createPlanningSteps('complete') })
        await new Promise(r => setTimeout(r, TIMING.PHASE_2_METHOD_SELECTION))

        // 3) Handle clarification
        if (toolResult.type === 'clarification') {
          const thinkingTime = Math.round((Date.now() - startTime) / 1000)
          setProcessing(undefined)

          const aiMsg: ChatMessage = {
            id: `msg_${Date.now()}_ai`,
            type: 'ai',
            text: toolResult.clarification.missing_info,
            thinking: `Thought for ${thinkingTime}s`,
            timestamp: Date.now(),
          }
          onAddMessage(aiMsg)
          simulatingRef.current = false
          return
        }

        // 4) Tool selected — show study design
        const { selection } = toolResult
        const displayTitle = selection.studyPlan.methodId === 'focus-group'
          ? `Focus Group: ${selection.studyPlan.title}`
          : selection.studyPlan.title

        const designMsg: ChatMessage = {
          id: `msg_${Date.now()}_design`,
          type: 'ai',
          text: `I've created **${displayTitle}** to investigate this. Now conducting the research...`,
          timestamp: Date.now(),
        }
        onAddMessage(designMsg)

        await new Promise(r => setTimeout(r, TIMING.PHASE_3_EXECUTION_START))

        // 5) Execution phase — animate steps while API runs
        const executionSteps = createExecutionSteps(selection.processSteps, 0)
        setProcessing({ steps: executionSteps })

        let currentStepIndex = 0
        const stepInterval = setInterval(() => {
          currentStepIndex++
          if (currentStepIndex < selection.processSteps.length) {
            setProcessing({
              steps: createExecutionSteps(selection.processSteps, currentStepIndex),
            })
          }
        }, TIMING.PHASE_1_STEP_2)

        const agentResult = await executeSelectedTool(selection, query)
        clearInterval(stepInterval)

        const thinkingTime = Math.round((Date.now() - startTime) / 1000)

        // Complete all steps
        setProcessing({
          steps: createExecutionSteps(selection.processSteps, selection.processSteps.length),
          isComplete: true,
          thinkingTime,
        })

        await new Promise(r => setTimeout(r, TIMING.PHASE_4_RESULTS))
        setProcessing(undefined)

        // 6) Results
        const canvas = agentResult.canvases?.[0]
        if (!canvas) {
          const errorMsg: ChatMessage = {
            id: `msg_${Date.now()}_err`,
            type: 'ai',
            text: 'Sorry, the research didn\'t return results. Please try rephrasing your question.',
            timestamp: Date.now(),
          }
          onAddMessage(errorMsg)
          simulatingRef.current = false
          return
        }

        // Convert canvas to findings
        const findings: Finding[] = canvasToFindings(canvas)

        // Create a Study from the canvas
        const study: Survey = {
          id: `study_${Date.now()}`,
          type: 'simple',
          name: displayTitle,
          status: 'completed',
          questions: canvas.questions?.map(q => ({
            id: q.id,
            type: 'single_select' as const,
            text: q.question,
            required: true,
          })) ?? [],
          audiences: canvas.audience ? [canvas.audience.name] : [],
          stimuli: [],
          findings,
          sampleSize: canvas.respondents ?? 300,
          createdAt: new Date().toISOString().slice(0, 10),
          updatedAt: new Date().toISOString().slice(0, 10),
        }
        onAddStudy(study)

        // Add explanation AI message
        if (agentResult.explanation) {
          const explainMsg: ChatMessage = {
            id: `msg_${Date.now()}_explain`,
            type: 'ai',
            text: agentResult.explanation,
            thinking: `Research completed in ${thinkingTime}s`,
            timestamp: Date.now(),
          }
          onAddMessage(explainMsg)
        }

        // Add findings message
        const findingsMsg: ChatMessage = {
          id: `msg_${Date.now()}_f`,
          type: 'findings',
          studyId: study.id,
          studyName: study.name,
          findings,
          respondents: study.sampleSize,
          timestamp: Date.now(),
        }
        onAddMessage(findingsMsg)
      } catch (err) {
        console.error('Research simulation failed:', err)
        setProcessing(undefined)

        const errorMsg: ChatMessage = {
          id: `msg_${Date.now()}_err`,
          type: 'ai',
          text: `Something went wrong during research: ${err instanceof Error ? err.message : 'Unknown error'}. You can try again or use **Add Study** to build a survey manually.`,
          timestamp: Date.now(),
        }
        onAddMessage(errorMsg)
      } finally {
        simulatingRef.current = false
      }
    },
    [onAddMessage, onAddStudy, onRenameProject, project.name],
  )

  // ── Builder launch → create study + findings ──
  const handleBuilderLaunch = useCallback(
    (state: BuilderState) => {
      const hasMultipleSegments = state.selectedAudiences.length > 1
      const findings: Finding[] = generateMockFindings(
        state.questions,
        hasMultipleSegments,
      )

      const typeConfig = SURVEY_TYPE_CONFIGS.find(c => c.key === state.selectedType)
      const studyName = typeConfig
        ? `${typeConfig.label} — ${state.questions.length} questions`
        : `Study — ${state.questions.length} questions`

      const study: Survey = {
        id: `study_${Date.now()}`,
        type: state.selectedType ?? 'simple',
        name: studyName,
        status: 'completed',
        questions: state.questions,
        audiences: state.selectedAudiences,
        stimuli: state.stimuli.map(s => s.id),
        findings,
        sampleSize: hasMultipleSegments ? 600 : 300,
        createdAt: new Date().toISOString().slice(0, 10),
        updatedAt: new Date().toISOString().slice(0, 10),
      }

      onAddStudy(study)

      const systemMsg: ChatMessage = {
        id: `msg_${Date.now()}_sys`,
        type: 'system',
        text: `Study launched: ${studyName}`,
        timestamp: Date.now(),
      }
      onAddMessage(systemMsg)

      const findingsMsg: ChatMessage = {
        id: `msg_${Date.now()}_f`,
        type: 'findings',
        studyId: study.id,
        studyName: study.name,
        typeBadge: typeConfig?.label,
        findings,
        respondents: study.sampleSize,
        timestamp: Date.now(),
      }
      onAddMessage(findingsMsg)

      setShowBuilder(false)
    },
    [onAddMessage, onAddStudy],
  )

  // ── Open study plan (review) from findings card ──
  const [planStudyId, setPlanStudyId] = useState<string | null>(null)

  const handleOpenPlan = useCallback(
    (studyId: string) => {
      setPlanStudyId(studyId)
    },
    [],
  )

  // Resolve the study for the plan overlay
  const planStudy = planStudyId
    ? project.studies?.find(s => s.id === planStudyId) ?? null
    : null

  // ── Study plan actions ──
  const handleRerunStudy = useCallback(
    (studyId: string) => {
      const study = project.studies?.find(s => s.id === studyId)
      if (!study) return

      // Re-run overwrites existing results with new mock findings
      const newFindings: Finding[] = generateMockFindings(study.questions, false)
      const updatedStudy: Survey = {
        ...study,
        findings: newFindings,
        updatedAt: new Date().toISOString().slice(0, 10),
      }
      onAddStudy(updatedStudy)

      const systemMsg: ChatMessage = {
        id: `msg_${Date.now()}_sys`,
        type: 'system',
        text: `Re-ran study: ${study.name}`,
        timestamp: Date.now(),
      }
      onAddMessage(systemMsg)

      const findingsMsg: ChatMessage = {
        id: `msg_${Date.now()}_f`,
        type: 'findings',
        studyId: updatedStudy.id,
        studyName: updatedStudy.name,
        findings: newFindings,
        respondents: updatedStudy.sampleSize,
        timestamp: Date.now(),
      }
      onAddMessage(findingsMsg)
    },
    [project.studies, onAddStudy, onAddMessage],
  )

  const handleRunNewStudy = useCallback(
    (studyId: string) => {
      const study = project.studies?.find(s => s.id === studyId)
      if (!study) return

      // Run new creates an additional study with fresh findings
      const newFindings: Finding[] = generateMockFindings(study.questions, false)
      const newStudy: Survey = {
        ...study,
        id: `study_${Date.now()}`,
        name: `${study.name} (v2)`,
        findings: newFindings,
        createdAt: new Date().toISOString().slice(0, 10),
        updatedAt: new Date().toISOString().slice(0, 10),
      }
      onAddStudy(newStudy)

      const systemMsg: ChatMessage = {
        id: `msg_${Date.now()}_sys`,
        type: 'system',
        text: `New survey created: ${newStudy.name}`,
        timestamp: Date.now(),
      }
      onAddMessage(systemMsg)

      const findingsMsg: ChatMessage = {
        id: `msg_${Date.now()}_f`,
        type: 'findings',
        studyId: newStudy.id,
        studyName: newStudy.name,
        findings: newFindings,
        respondents: newStudy.sampleSize,
        timestamp: Date.now(),
      }
      onAddMessage(findingsMsg)
    },
    [project.studies, onAddStudy, onAddMessage],
  )

  const handleSaveAsTemplate = useCallback(
    (studyId: string) => {
      const study = project.studies?.find(s => s.id === studyId)
      if (!study) return

      const systemMsg: ChatMessage = {
        id: `msg_${Date.now()}_sys`,
        type: 'system',
        text: `Saved "${study.name}" as a template`,
        timestamp: Date.now(),
      }
      onAddMessage(systemMsg)
    },
    [project.studies, onAddMessage],
  )

  // ── Quick Poll launch ──
  const handleQuickPollLaunch = useCallback(
    (survey: Survey) => {
      onAddStudy(survey)

      const systemMsg: ChatMessage = {
        id: `msg_${Date.now()}_sys`,
        type: 'system',
        text: `Quick Poll launched with ${survey.questions.length} questions.`,
        timestamp: Date.now(),
      }
      onAddMessage(systemMsg)

      const findingsMsg: ChatMessage = {
        id: `msg_${Date.now()}_f`,
        type: 'findings',
        studyId: survey.id,
        studyName: survey.name,
        typeBadge: 'Quick Poll',
        findings: survey.findings!,
        respondents: survey.sampleSize,
        timestamp: Date.now(),
      }
      onAddMessage(findingsMsg)

      setShowQuickPoll(false)
    },
    [onAddMessage, onAddStudy],
  )

  // ── Method selection from picker ──
  const handleSelectMethod = useCallback(
    (method: PickerMethod) => {
      if (method.id === 'quick-poll') {
        setShowQuickPoll(true)
      } else {
        setShowBuilder(true)
      }
    },
    [],
  )

  return (
    <div className="flex flex-1 flex-col min-w-0 overflow-hidden">
      {/* Header — full width */}
      <header className="flex items-center gap-3 h-14 px-6 border-b bg-background flex-shrink-0 w-full">
        <h1 className="text-sm font-semibold truncate flex-1">{project.name}</h1>
        <Button variant="outline" size="sm" className="gap-1.5 shrink-0">
          <SquareArrowOutUpRight className="w-3.5 h-3.5" />
          Share
        </Button>
      </header>

      {/* Chat stream */}
      <ChatStream
        messages={project.messages}
        onSendMessage={startSimulation}
        onSelectMethod={handleSelectMethod}
        onAddAudience={() => {} /* picker handles display */}
        onOpenPlan={handleOpenPlan}
        processing={processing}
        brand={project.brand}
      />

      {/* Builder overlay */}
      {showBuilder && (
        <div className="fixed inset-0 z-50 bg-background">
          <SurveyBuilder
            onClose={() => setShowBuilder(false)}
            onLaunch={handleBuilderLaunch}
          />
        </div>
      )}

      {/* Quick Poll overlay */}
      {showQuickPoll && (
        <div className="fixed inset-0 z-50 bg-background">
          <QuickPollPage
            onClose={() => setShowQuickPoll(false)}
            onLaunch={handleQuickPollLaunch}
          />
        </div>
      )}

      {/* Study plan overlay */}
      {planStudy && (
        <StudyPlanOverlay
          study={planStudy}
          onClose={() => setPlanStudyId(null)}
          onRerun={handleRerunStudy}
          onRunNew={handleRunNewStudy}
          onSaveAsTemplate={handleSaveAsTemplate}
        />
      )}
    </div>
  )
}

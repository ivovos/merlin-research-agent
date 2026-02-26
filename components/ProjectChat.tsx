import React, { useState, useCallback, useRef, useEffect } from 'react'
import { FindingsProvider } from '@/hooks/useFindingsStore'
import type { ProjectState, ChatMessage, ChatMessagePlan, Finding, Survey, ProcessStep } from '@/types'
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
import { selectResearchTool, executeSelectedTool, assessComplexity, generatePlanDescription } from '@/services'
import type { ToolSelectionResult } from '@/services'
import { createPlanningSteps, createPlanCreationSteps, createExecutionSteps } from '@/constants/processSteps'
import { TIMING } from '@/constants/timing'
import type { BuilderState } from '@/hooks/useSurveyBuilder'
import { useSegmentSelection } from '@/hooks/useSegmentSelection'

interface ProjectChatProps {
  project: ProjectState
  onAddMessage: (msg: ChatMessage) => void
  onUpdateMessage?: (messageId: string, updates: Partial<ChatMessage>) => void
  onAddStudy: (study: Survey) => void
  onRenameProject?: (name: string) => void
  pendingQuery?: string
  onPendingQueryConsumed?: () => void
}

export const ProjectChat: React.FC<ProjectChatProps> = ({
  project,
  onAddMessage,
  onUpdateMessage,
  onAddStudy,
  onRenameProject,
  pendingQuery,
  onPendingQueryConsumed,
}) => {
  const [showBuilder, setShowBuilder] = useState(false)
  const [editingStudy, setEditingStudy] = useState<Survey | undefined>(undefined)
  const [showQuickPoll, setShowQuickPoll] = useState(false)
  const [processing, setProcessing] = useState<{
    steps?: ProcessStep[]
    isComplete?: boolean
    thinkingTime?: number
  } | undefined>(undefined)

  // Segment selection for follow-up scoping (bar click → pill in input)
  const {
    selectedSegments,
    selectSegment,
    removeSegment,
    clearSegments,
  } = useSegmentSelection()

  // Track whether a simulation is in progress (prevent double-submit)
  const simulatingRef = useRef(false)

  // ── Pending plan approval state ──
  const [pendingPlan, setPendingPlan] = useState<{
    selection: ToolSelectionResult
    query: string
    startTime: number
    planMessageId: string
  } | null>(null)

  // Preview study for plan review overlay (not yet a real study)
  const [previewStudy, setPreviewStudy] = useState<Survey | null>(null)

  // ── Execution phase (shared by direct-run and post-approval) ──
  const resumeExecution = useCallback(
    async (selection: ToolSelectionResult, query: string, startTime: number) => {
      simulatingRef.current = true

      const displayTitle = selection.studyPlan.methodId === 'focus-group'
        ? `Focus Group: ${selection.studyPlan.title}`
        : selection.studyPlan.title

      try {
        await new Promise(r => setTimeout(r, TIMING.PHASE_3_EXECUTION_START))

        // Execution phase — animate steps while API runs
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

        let agentResult: Awaited<ReturnType<typeof executeSelectedTool>>
        try {
          agentResult = await executeSelectedTool(selection, query)
        } finally {
          clearInterval(stepInterval)
        }

        const thinkingTime = Math.round((Date.now() - startTime) / 1000)

        // Complete all steps
        setProcessing({
          steps: createExecutionSteps(selection.processSteps, selection.processSteps.length),
          isComplete: true,
          thinkingTime,
        })

        await new Promise(r => setTimeout(r, TIMING.PHASE_4_RESULTS))
        setProcessing(undefined)

        // Results
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

        // Add combined AI message: thinking (collapsed) + design intro + explanation
        const introLine = `I've created **${displayTitle}** to investigate this. Now conducting the research...`
        const combinedText = agentResult.explanation
          ? `${introLine}\n\n${agentResult.explanation}`
          : introLine
        const explainMsg: ChatMessage = {
          id: `msg_${Date.now()}_explain`,
          type: 'ai',
          text: combinedText,
          thinking: finalReasoning,
          timestamp: Date.now(),
        }
        onAddMessage(explainMsg)

        await new Promise(r => setTimeout(r, 400))

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
        console.error('Research execution failed:', err)
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
    [onAddMessage, onAddStudy],
  )

  // ── Research simulation ──
  const startSimulation = useCallback(
    async (query: string) => {
      if (simulatingRef.current) return
      simulatingRef.current = true

      // If there's a pending plan, clear it (user typed a new query)
      if (pendingPlan) {
        setPendingPlan(null)
      }

      // Clear segment pills on send
      clearSegments()

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

        // 4) Tool selected — assess complexity
        const { selection } = toolResult
        const complexity = assessComplexity(query, selection)

        if (complexity.isComplex) {
          // ── Complex path: show plan-creation steps, then plan card ──

          // Animate plan creation steps
          setProcessing({ steps: createPlanCreationSteps(2) })
          await new Promise(r => setTimeout(r, TIMING.PHASE_PLAN_EVAL))

          setProcessing({ steps: createPlanCreationSteps(3) })
          await new Promise(r => setTimeout(r, TIMING.PHASE_PLAN_DESIGN))

          setProcessing({ steps: createPlanCreationSteps('complete') })
          await new Promise(r => setTimeout(r, TIMING.PHASE_PLAN_SHOW))

          setProcessing(undefined)

          // Add AI message explaining the plan
          const aiMsg: ChatMessage = {
            id: `msg_${Date.now()}_plan_intro`,
            type: 'ai',
            text: 'This is a complex study. I\'ve created a research plan for your review before running it.',
            timestamp: Date.now(),
          }
          onAddMessage(aiMsg)

          // Generate plan description
          const planDesc = generatePlanDescription(selection, complexity)

          // Add plan message
          const planMessageId = `msg_${Date.now()}_plan`
          const planMsg: ChatMessagePlan = {
            id: planMessageId,
            type: 'plan',
            planTitle: planDesc.title,
            planDescription: planDesc.description,
            bulletPoints: planDesc.bulletPoints,
            expectedRuntime: complexity.estimatedRuntime,
            studyPlan: selection.studyPlan,
            toolSelection: {
              toolName: selection.toolName,
              toolInput: selection.toolInput,
              processSteps: selection.processSteps,
            },
            status: 'pending',
            timestamp: Date.now(),
          }
          onAddMessage(planMsg)

          // Store pending plan for approval
          setPendingPlan({
            selection,
            query,
            startTime,
            planMessageId,
          })

          // Re-enable input — user can now approve, review, or send a new message
          simulatingRef.current = false
          return
        }

        // ── Simple path: proceed with execution directly ──
        // Clear planning steps before execution begins
        setProcessing(undefined)
        await new Promise(r => setTimeout(r, 300))

        // Hand off to shared execution flow
        simulatingRef.current = false // resumeExecution will set it true
        await resumeExecution(selection, query, startTime)
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
        simulatingRef.current = false
      }
    },
    [onAddMessage, onAddStudy, onRenameProject, project.name, pendingPlan, resumeExecution],
  )

  // ── Plan approval handler ──
  const handleApprovePlan = useCallback(
    (messageId: string) => {
      if (!pendingPlan) return

      // Update the plan message status to 'approved'
      onUpdateMessage?.(messageId, { status: 'approved' } as Partial<ChatMessagePlan>)

      // Add execution confirmation
      const execMsg: ChatMessage = {
        id: `msg_${Date.now()}_exec`,
        type: 'ai',
        text: 'Plan approved. Running the study now...',
        timestamp: Date.now(),
      }
      onAddMessage(execMsg)

      // Resume execution
      const { selection, query, startTime } = pendingPlan
      setPendingPlan(null)
      resumeExecution(selection, query, startTime)
    },
    [pendingPlan, onUpdateMessage, onAddMessage, resumeExecution],
  )

  // ── Plan review handler — opens StudyPlanOverlay ──
  const handleReviewPlan = useCallback(
    (_messageId: string) => {
      if (!pendingPlan) return

      const { selection } = pendingPlan
      const plan = selection.studyPlan
      const toolInput = selection.toolInput

      // Construct a preview Survey for the overlay
      const questions = (toolInput.questions as Array<{ question: string; options?: string[] }>) || []
      const segments = (toolInput.segments as string[]) || []
      const audience = (toolInput.audience as string) || 'General Population'

      const preview: Survey = {
        id: `preview_${Date.now()}`,
        type: 'simple',
        name: plan.title,
        status: 'draft',
        questions: questions.map((q, i) => ({
          id: `q_${i}`,
          type: 'single_select' as const,
          text: q.question,
          options: q.options,
          required: true,
        })),
        audiences: segments.length > 0 ? segments : [audience],
        stimuli: [],
        sampleSize: (toolInput.sample_size as number) || 500,
        methodology: plan.methodName,
        createdAt: new Date().toISOString().slice(0, 10),
      }

      setPreviewStudy(preview)
    },
    [pendingPlan],
  )

  // ── Auto-trigger simulation for initial query from Home screen ──
  useEffect(() => {
    if (pendingQuery && !simulatingRef.current) {
      onPendingQueryConsumed?.()
      startSimulation(pendingQuery)
    }
  }, [pendingQuery]) // eslint-disable-line react-hooks/exhaustive-deps

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

  // Resolve the study for the plan overlay — check preview study first
  const planStudy = previewStudy
    ?? (planStudyId ? project.studies?.find(s => s.id === planStudyId) ?? null : null)

  // ── Edit study — open builder pre-populated with study data ──
  const handleEditStudy = useCallback(
    (study: Survey) => {
      setPlanStudyId(null)
      setPreviewStudy(null)
      setEditingStudy(study)
      setShowBuilder(true)
    },
    [],
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
        text: `Quick Question launched with ${survey.questions.length} questions.`,
        timestamp: Date.now(),
      }
      onAddMessage(systemMsg)

      const findingsMsg: ChatMessage = {
        id: `msg_${Date.now()}_f`,
        type: 'findings',
        studyId: survey.id,
        studyName: survey.name,
        typeBadge: 'Quick Question',
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

  const handleClosePlanOverlay = useCallback(() => {
    setPlanStudyId(null)
    setPreviewStudy(null)
  }, [])

  return (
    <FindingsProvider>
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
          onApprovePlan={handleApprovePlan}
          onReviewPlan={handleReviewPlan}
          processing={processing}
          brand={project.brand}
          onBarClick={(segment) => selectSegment(segment, 'chat')}
          selectedSegments={selectedSegments.segments}
          onRemoveSegment={removeSegment}
        />

        {/* Builder overlay */}
        {showBuilder && (
          <div className="fixed inset-0 z-50 bg-background">
            <SurveyBuilder
              onClose={() => { setShowBuilder(false); setEditingStudy(undefined) }}
              onLaunch={handleBuilderLaunch}
              initialStudy={editingStudy}
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
            onClose={handleClosePlanOverlay}
            onEdit={handleEditStudy}
            onSaveAsTemplate={handleSaveAsTemplate}
          />
        )}
      </div>
    </FindingsProvider>
  )
}

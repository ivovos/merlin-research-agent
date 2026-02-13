import React, { useState, useCallback, useMemo } from 'react'
import { AppSidebar, MainHeader } from '@/components/layout/AppSidebar'
import {
  SidebarInset,
  SidebarProvider,
  useSidebar,
} from '@/components/ui/sidebar'
import { useConversation, useHistory, useAudiences, useSegmentSelection } from '@/hooks'
import { selectResearchTool, executeSelectedTool, isQualitativeQuery, generateConversationTitle } from '@/services'
import type { Account, AudienceDetails, Conversation, Canvas, Message, SelectedSegments, StudyPlan, SurveyProject, Survey } from '@/types'
import { SURVEY_TYPE_CONFIGS } from '@/types'
import type { BuilderState } from '@/hooks/useSurveyBuilder'
import {
  mockAccounts,
  mubiAccount,
  wonderhoodAccount,
  initialProcessSteps,
  initialQualitativeSteps,
  getAllAudiences,
} from '@/data/mockData'

// Import feature components
import { Dashboard } from '@/components/Dashboard'
import { ProjectDetail } from '@/components/ProjectDetail'
import { surveyProjects as initialSurveyProjects } from '@/data/projects'
import { WorkingPane } from '@/components/WorkingPane'
import { QueryInput } from '@/components/QueryInput'
import { AudiencesList } from '@/components/AudiencesList'
import { AudienceDetail } from '@/components/AudienceDetail'
import { ExpandedCanvas } from '@/components/ExpandedCanvas'
import { FindingsCanvas } from '@/components/results/FindingsCanvas'
import { canvasToFindings } from '@/lib/canvasToFindings'
import { generateMockFindings } from '@/lib/generateMockFindings'
import { canvasToProject } from '@/lib/canvasToProject'
import { MessageTestingModal } from '@/components/MessageTestingModal'
import { MethodSidePanel } from '@/components/MethodSidePanel'
import { MethodFullPage } from '@/components/MethodFullPage'
import { SurveyBuilder } from '@/components/builder/SurveyBuilder'
import { Button } from '@/components/ui/button'
import { Layers } from 'lucide-react'
import { createPlanningSteps, createExecutionSteps } from '@/constants/processSteps'
import { TIMING } from '@/constants/timing'

type ActiveView = 'conversation' | 'audiences' | 'audienceDetail' | 'dashboard' | 'projectDetail' | 'surveyBuilder' | 'results'

const App: React.FC = () => {
  // Account state - default to MUBI
  const [currentAccount, setCurrentAccount] = useState<Account>(mubiAccount)

  // Navigation state
  const [activeView, setActiveView] = useState<ActiveView>('conversation')
  const [selectedAudience, setSelectedAudience] = useState<AudienceDetails | null>(null)
  const [selectedProject, setSelectedProject] = useState<string | null>(null)
  const [selectedSurveyProject, setSelectedSurveyProject] = useState<SurveyProject | null>(null)
  const [projects, setProjects] = useState<SurveyProject[]>(initialSurveyProjects)

  // Use custom hooks for state management
  const {
    conversation,
    setConversation,
    startNewConversation,
  } = useConversation()

  const { history, addToHistory } = useHistory()
  const { audiences, createAudience } = useAudiences()
  const {
    selectedSegments,
    canvasId: selectionCanvasId,
    selectSegment,
    removeSegment,
    clearSegments,
    hasSelection,
    isForCanvas,
  } = useSegmentSelection()

  // Expanded canvas state - when set, replaces WorkingPane with ExpandedCanvas
  const [expandedCanvas, setExpandedCanvas] = useState<Canvas | null>(null)

  // Message Testing modal state
  const [showMessageTestingModal, setShowMessageTestingModal] = useState(false)

  // Study Plan editing state (side panel for existing)
  const [editingStudyPlan, setEditingStudyPlan] = useState<{ plan: StudyPlan; audienceId?: string } | null>(null)

  // Method creation state (full page for new)
  const [creatingMethod, setCreatingMethod] = useState<{ methodId?: string } | null>(null)

  // Get all audiences for the account (includes Electric Twin generic audiences)
  const combinedAudiences = useMemo(() => {
    return getAllAudiences(currentAccount)
  }, [currentAccount])

  // Check if conversation has any canvases (for "View Canvas" button)
  const conversationCanvases = useMemo(() => {
    return conversation.messages
      .filter((msg) => msg.role === 'assistant' && msg.canvas)
      .map((msg) => msg.canvas as Canvas)
  }, [conversation.messages])

  const hasCanvases = conversationCanvases.length > 0

  // Start research simulation with multi-phase approach
  const startSimulation = useCallback(async (query: string) => {
    const startTime = Date.now()

    // ===== PHASE 1: User message + initial planning =====
    const userMessage: Message = {
      id: `msg_${Date.now()}`,
      role: 'user',
      content: query,
    }

    // Initial planning steps
    const planningSteps = createPlanningSteps(1)

    // Create initial planning message (no pill yet)
    const planningMessageId = `msg_${Date.now()}_planning`
    const planningMessage: Message = {
      id: planningMessageId,
      role: 'assistant',
      content: '',
      processSteps: planningSteps,
    }

    setConversation((prev) => ({
      ...prev,
      query,
      messages: [...prev.messages, userMessage, planningMessage],
      status: 'processing',
      processSteps: planningSteps,
    }))

    // Get tool selection and title in parallel
    const [title, toolSelection] = await Promise.all([
      generateConversationTitle(query),
      selectResearchTool(query, conversation.canvas),
    ])

    console.log('Generated title:', title)
    console.log('Tool selection:', toolSelection)

    // Animate planning step 2 (selecting method)
    const planningStep2 = createPlanningSteps(2)
    setConversation((prev) => ({
      ...prev,
      title,
      processSteps: planningStep2,
      messages: prev.messages.map(msg =>
        msg.id === planningMessageId ? { ...msg, processSteps: planningStep2 } : msg
      ),
    }))

    // Brief delay to show step 2 animating
    await new Promise(resolve => setTimeout(resolve, TIMING.PHASE_1_COMPLETE))

    // Complete planning steps
    const planningComplete = createPlanningSteps('complete')
    setConversation((prev) => ({
      ...prev,
      processSteps: planningComplete,
      messages: prev.messages.map(msg =>
        msg.id === planningMessageId ? { ...msg, processSteps: planningComplete } : msg
      ),
    }))

    // Brief pause after planning completes
    await new Promise(resolve => setTimeout(resolve, TIMING.PHASE_2_METHOD_SELECTION))

    // Handle clarification request
    if (toolSelection.type === 'clarification') {
      const thinkingTime = Math.round((Date.now() - startTime) / 1000)

      // Update planning message with clarification
      setConversation((prev) => ({
        ...prev,
        status: 'complete',
        explanation: toolSelection.clarification.missing_info,
        thinkingTime: thinkingTime,
        messages: prev.messages.map(msg =>
          msg.id === planningMessageId
            ? {
                ...msg,
                content: toolSelection.clarification.missing_info,
                clarification: toolSelection.clarification,
                thinkingTime: thinkingTime,
              }
            : msg
        ),
      }))
      return
    }

    // ===== PHASE 2: Study Design message =====
    const { selection } = toolSelection

    // Format display title: "Focus Group: Title" for focus groups, just "Title" for others
    // This is used in the message content - the MethodLink will parse this and show with icon
    const displayTitle = selection.studyPlan.methodId === 'focus-group'
      ? `Focus Group: ${selection.studyPlan.title}`
      : selection.studyPlan.title

    // Update planning message to show study design with title link
    setConversation((prev) => ({
      ...prev,
      status: 'processing',
      messages: prev.messages.map(msg =>
        msg.id === planningMessageId
          ? {
              ...msg,
              content: `I've created **${displayTitle}** to investigate this. Now conducting the research...`,
              studyPlan: selection.studyPlan, // Keep original studyPlan with clean title
              studyPlanEditable: false, // No edit during execution
            }
          : msg
      ),
    }))

    // Brief pause to show the survey design before starting execution
    await new Promise(resolve => setTimeout(resolve, TIMING.PHASE_3_EXECUTION_START))

    // ===== PHASE 3: Execution with animated steps =====
    const executionSteps = createExecutionSteps(selection.processSteps, 0)

    // Update to show execution steps
    setConversation((prev) => ({
      ...prev,
      processSteps: executionSteps,
      messages: prev.messages.map(msg =>
        msg.id === planningMessageId
          ? { ...msg, processSteps: executionSteps }
          : msg
      ),
    }))

    // Animate through execution steps while API runs
    let currentStepIndex = 0
    const stepInterval = setInterval(() => {
      currentStepIndex++
      if (currentStepIndex < selection.processSteps.length) {
        setConversation((prev) => {
          const updatedSteps = prev.processSteps.map((s, i) => ({
            ...s,
            status: i < currentStepIndex ? 'complete' as const
              : i === currentStepIndex ? 'in-progress' as const
              : 'pending' as const,
          }))

          return {
            ...prev,
            processSteps: updatedSteps,
            messages: prev.messages.map(msg =>
              msg.id === planningMessageId
                ? { ...msg, processSteps: updatedSteps }
                : msg
            ),
          }
        })
      }
    }, TIMING.PHASE_1_STEP_2)

    // Execute the research tool
    const agentResult = await executeSelectedTool(selection, query)

    // Stop animation
    clearInterval(stepInterval)

    const thinkingTime = Math.round((Date.now() - startTime) / 1000)
    console.log('Agent result:', agentResult)
    console.log('Thinking time:', thinkingTime, 's')

    // Handle no results
    const canvas = agentResult.canvases?.[0]
    if (!canvas) {
      console.error('No canvas returned from agent')
      return
    }

    // ===== PHASE 4: Results =====
    // Mark all steps complete
    const completedSteps = createExecutionSteps(selection.processSteps, selection.processSteps.length)

    // Create results message with canvas
    const resultsMessage: Message = {
      id: `msg_${Date.now()}_results`,
      role: 'assistant',
      content: agentResult.explanation || `Here are the findings from ${canvas.audience.name}.`,
      canvas: canvas,
      thinkingTime: thinkingTime,
    }

    // Clear segment selection
    clearSegments()

    // Update survey design message to enable edit, complete steps, and sync studyPlan with generated questions
    setConversation((prev) => {
      const updatedMessages = prev.messages.map(msg =>
        msg.id === planningMessageId
          ? {
              ...msg,
              processSteps: completedSteps,
              studyPlanEditable: true,
              thinkingTime,
              // Sync studyPlan with the one from canvas that has generated questions
              studyPlan: canvas.studyPlan || msg.studyPlan,
            }
          : msg
      )

      return {
        ...prev,
        status: 'complete',
        explanation: agentResult.explanation || '',
        thinkingTime: thinkingTime,
        processSteps: completedSteps,
        messages: [...updatedMessages, resultsMessage],
        canvas: canvas,
      }
    })
  }, [conversation.canvas, setConversation, clearSegments])

  // Handle follow-up questions
  const handleFollowUp = useCallback(async (query: string) => {
    // Save current conversation to history
    if (conversation.query) {
      addToHistory(conversation)
    }
    await startSimulation(query)
  }, [conversation, addToHistory, startSimulation])

  // Navigation handlers
  const handleNewChat = useCallback(() => {
    if (conversation.query) {
      addToHistory(conversation)
    }
    startNewConversation()
    setExpandedCanvas(null)
    clearSegments()
    setActiveView('conversation')
  }, [conversation, addToHistory, startNewConversation, clearSegments])

  const handleSelectHistory = useCallback((conv: Conversation) => {
    if (conversation.query && conversation.id !== conv.id) {
      addToHistory(conversation)
    }
    setConversation(conv)
    setExpandedCanvas(null)
    clearSegments()
    setActiveView('conversation')
  }, [conversation, addToHistory, setConversation, clearSegments])

  // Rename conversation (current or in history)
  const handleRenameConversation = useCallback((id: string, newTitle: string) => {
    if (conversation.id === id) {
      setConversation(prev => ({ ...prev, title: newTitle }))
    }
    // Also update in history if it exists there
    // Note: addToHistory hook would need to expose an update method
    // For now, just update current conversation
  }, [conversation.id, setConversation])

  // Delete conversation from history
  const handleDeleteConversation = useCallback((id: string) => {
    // If deleting current conversation, start new
    if (conversation.id === id) {
      startNewConversation()
    }
    // Note: history hook would need to expose a delete method
    // For now, this handles the current conversation case
  }, [conversation.id, startNewConversation])

  // Handle canvas title change
  const handleCanvasTitleChange = useCallback((canvasId: string, newTitle: string) => {
    setConversation(prev => ({
      ...prev,
      messages: prev.messages.map(msg =>
        msg.canvas?.id === canvasId
          ? { ...msg, canvas: { ...msg.canvas, title: newTitle } }
          : msg
      ),
      // Also update conversation.canvas if it's the same
      canvas: prev.canvas?.id === canvasId
        ? { ...prev.canvas, title: newTitle }
        : prev.canvas,
    }))
  }, [setConversation])

  const handleAudiencesClick = useCallback(() => {
    setActiveView('audiences')
    setSelectedProject(null)
    setSelectedAudience(null)
  }, [])

  const handleSelectAudience = useCallback((audience: AudienceDetails) => {
    setSelectedAudience(audience)
    setActiveView('audienceDetail')
  }, [])

  const handleBackToAudiences = useCallback(() => {
    setSelectedAudience(null)
    setActiveView('audiences')
  }, [])

  const handleProjectSelect = useCallback((projectId: string) => {
    setSelectedProject(projectId)
    setSelectedAudience(null)
    setActiveView('audiences')
  }, [])

  const handleAccountChange = useCallback((account: Account) => {
    setCurrentAccount(account)
    setSelectedProject(null)
    setSelectedAudience(null)
  }, [])

  const handleDashboardClick = useCallback(() => {
    setActiveView('dashboard')
    setSelectedSurveyProject(null)
  }, [])

  const handleProjectDetailClick = useCallback((project: SurveyProject) => {
    setSelectedSurveyProject(project)
    setActiveView('projectDetail')
  }, [])

  const handleOpenSurveyBuilder = useCallback(() => {
    setActiveView('surveyBuilder')
  }, [])

  const handleCloseSurveyBuilder = useCallback(() => {
    setActiveView('dashboard')
  }, [])

  const handleSurveyLaunch = useCallback((builderState: BuilderState) => {
    const typeConfig = SURVEY_TYPE_CONFIGS.find(c => c.key === builderState.selectedType)
    const today = new Date().toISOString().slice(0, 10)
    const projectName = builderState.surveyName?.trim() || typeConfig?.label || 'Untitled Survey'
    const hasMultipleSegments = builderState.selectedAudiences.length > 1

    // Generate mock findings so the user sees results immediately
    const findings = generateMockFindings(builderState.questions, hasMultipleSegments)

    const survey: Survey = {
      id: `survey_${Date.now()}`,
      type: builderState.selectedType!,
      name: projectName,
      status: 'completed',
      questions: builderState.questions,
      audiences: builderState.selectedAudiences,
      stimuli: builderState.stimuli.map(s => s.id),
      findings,
      sampleSize: hasMultipleSegments ? 800 : 400,
      createdAt: today,
      updatedAt: today,
    }

    const newProject: SurveyProject = {
      id: `proj_new_${Date.now()}`,
      name: projectName,
      brand: 'New',
      icon: typeConfig?.icon || '📋',
      surveyType: builderState.selectedType!,
      surveys: [survey],
      stimuli: builderState.stimuli,
      audienceIds: builderState.selectedAudiences,
      status: 'completed',
      createdAt: today,
      updatedAt: today,
    }

    setProjects(prev => [newProject, ...prev])
    setSelectedSurveyProject(newProject)
    setActiveView('projectDetail')
  }, [])

  const handleSaveCanvasToProject = useCallback((canvas: Canvas) => {
    const newProject = canvasToProject(canvas)
    setProjects(prev => [newProject, ...prev])
    setSelectedSurveyProject(newProject)
    setActiveView('projectDetail')
  }, [])

  const handleRefineInBuilder = useCallback(() => {
    setActiveView('surveyBuilder')
  }, [])

  const handleExpandCanvas = useCallback((canvas: Canvas) => {
    setExpandedCanvas(canvas)
  }, [])

  const handleCloseExpandedCanvas = useCallback(() => {
    setExpandedCanvas(null)
  }, [])

  // Breadcrumbs based on active view
  const breadcrumbs = useMemo(() => {
    if (activeView === 'projectDetail' && selectedSurveyProject) {
      return [{ label: 'Projects', onClick: handleDashboardClick }]
    }
    if (activeView === 'audienceDetail') {
      return [{ label: 'Audiences', onClick: handleAudiencesClick }]
    }
    return undefined
  }, [activeView, selectedSurveyProject, handleDashboardClick, handleAudiencesClick])

  const handleCanvasPrompt = useCallback(async (prompt: string, segments?: SelectedSegments) => {
    // Handle canvas prompts - could modify existing canvas or create follow-up
    console.log('Canvas prompt:', prompt, 'with segments:', segments)
    // For now, treat as a follow-up question
    if (prompt.trim()) {
      await handleFollowUp(prompt)
    }
  }, [handleFollowUp])

  const handleEditQuestion = useCallback((questionId: string, newQuestion: string) => {
    // Handle question editing
    console.log('Edit question:', questionId, newQuestion)
  }, [])

  const handleAskAudienceQuestion = useCallback((query: string) => {
    setActiveView('conversation')
    startSimulation(query)
  }, [startSimulation])

  // Message Testing modal handlers
  const handleMessageTestingClick = useCallback(() => {
    console.log('handleMessageTestingClick called!')
    setShowMessageTestingModal(true)
  }, [])

  const handleMessageTestingClose = useCallback(() => {
    setShowMessageTestingModal(false)
  }, [])

  // Study Plan editing handlers
  const handleEditStudyPlan = useCallback((studyPlan: StudyPlan, audienceId?: string) => {
    setEditingStudyPlan({ plan: studyPlan, audienceId })
  }, [])

  const handleStudyPlanClose = useCallback(() => {
    setEditingStudyPlan(null)
  }, [])

  const handleStudyPlanSubmit = useCallback((methodId: string, variantId: string | null, formData: Record<string, unknown>, title: string) => {
    console.log('Re-run study plan:', { methodId, variantId, formData, title })
    // TODO: Re-run the research with updated parameters
    setEditingStudyPlan(null)
  }, [])

  // Method creation handlers
  const handleOpenMethodCreator = useCallback((methodId?: string) => {
    // Route /survey to the new multi-step builder
    if (methodId === 'survey') {
      setActiveView('surveyBuilder')
      return
    }
    setCreatingMethod({ methodId })
  }, [])

  const handleCloseMethodCreator = useCallback(() => {
    setCreatingMethod(null)
  }, [])

  const handleMethodSubmit = useCallback((methodId: string, variantId: string | null, formData: Record<string, unknown>, title: string) => {
    console.log('Create new method:', { methodId, variantId, formData, title })
    // TODO: Run the research with the new method
    setCreatingMethod(null)
  }, [])

  // Render
  return (
    <SidebarProvider>
      <AppSidebar
        currentAccount={currentAccount}
        accounts={mockAccounts}
        onAccountChange={handleAccountChange}
        activeView={activeView}
        selectedProject={selectedProject}
        onProjectSelect={handleProjectSelect}
        onAudiencesClick={handleAudiencesClick}
        onNewChat={handleNewChat}
        conversation={conversation}
        history={history}
        onSelectHistory={handleSelectHistory}
        onRenameConversation={handleRenameConversation}
        onDeleteConversation={handleDeleteConversation}
        onDashboardClick={handleDashboardClick}
        surveyProjects={projects}
        onSurveyProjectSelect={handleProjectDetailClick}
        onNewSurvey={handleOpenSurveyBuilder}
      />
      <SidebarInset className="flex flex-row overflow-hidden">
        {/* Survey Builder - full page view */}
        {activeView === 'surveyBuilder' ? (
          <SurveyBuilder onClose={handleCloseSurveyBuilder} onLaunch={handleSurveyLaunch} />
        ) : creatingMethod ? (
          <MethodFullPage
            isOpen={true}
            onClose={handleCloseMethodCreator}
            initialMethodId={creatingMethod.methodId}
            onSubmit={handleMethodSubmit}
          />
        ) : (
        <>
        {/* Main content area with optional side panel */}
        <main className="flex flex-1 flex-col overflow-hidden transition-all duration-300 min-w-0">
          {/* Expanded Findings - replaces entire content including header */}
          {expandedCanvas ? (
            <div className="flex flex-col h-full w-full bg-background">
              <div className="flex items-center h-14 px-6 border-b border-border bg-background flex-shrink-0">
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-1.5 text-muted-foreground hover:text-foreground"
                  onClick={handleCloseExpandedCanvas}
                >
                  <Layers className="w-4 h-4" />
                  Back
                </Button>
                <div className="flex-1" />
              </div>
              <div className="flex-1 overflow-y-auto p-6">
                <div className="max-w-5xl mx-auto">
                  <FindingsCanvas
                    findings={canvasToFindings(expandedCanvas)}
                    title={expandedCanvas.title}
                    respondents={expandedCanvas.respondents}
                    onInsightEdit={(qId, text) => console.log('Edit insight:', qId, text)}
                    onSaveToProject={() => handleSaveCanvasToProject(expandedCanvas)}
                    onRefineInBuilder={handleRefineInBuilder}
                  />
                </div>
              </div>
            </div>
          ) : (
            <>
              <MainHeader
                title={
                  activeView === 'dashboard'
                    ? 'Projects'
                    : activeView === 'projectDetail' && selectedSurveyProject
                    ? selectedSurveyProject.name
                    : activeView === 'audiences'
                    ? 'Audiences'
                    : activeView === 'audienceDetail' && selectedAudience
                    ? selectedAudience.name
                    : activeView === 'conversation' && conversation.title
                    ? conversation.title
                    : undefined
                }
                onTitleChange={
                  activeView === 'conversation' && conversation.title
                    ? (newTitle) => handleRenameConversation(conversation.id, newTitle)
                    : undefined
                }
                breadcrumbs={breadcrumbs}
              >
                {/* View Canvas button - only show when there are canvases */}
                {activeView === 'conversation' && hasCanvases && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="ml-auto gap-1.5 h-7 px-2.5 text-xs"
                    onClick={() => handleExpandCanvas(conversationCanvases[0])}
                  >
                    <Layers className="w-3.5 h-3.5" />
                    View Canvas
                  </Button>
                )}
              </MainHeader>

              <div className="flex-1 overflow-hidden">
                {activeView === 'dashboard' ? (
                  <Dashboard
                    projects={projects}
                    onSelectProject={handleProjectDetailClick}
                    onNewSurvey={handleOpenSurveyBuilder}
                  />
                ) : activeView === 'projectDetail' && selectedSurveyProject ? (
                  <ProjectDetail
                    project={selectedSurveyProject}
                    onBack={handleDashboardClick}
                  />
                ) : activeView === 'results' ? (
                  <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">
                    Select a project from the Dashboard to view its findings.
                  </div>
                ) : activeView === 'audiences' ? (
                  <AudiencesList
                    account={currentAccount}
                    selectedProject={selectedProject}
                    onSelectAudience={handleSelectAudience}
                  />
                ) : activeView === 'audienceDetail' && selectedAudience ? (
                  <AudienceDetail
                    audience={selectedAudience}
                    account={currentAccount}
                    onBack={handleBackToAudiences}
                    onAskQuestion={handleAskAudienceQuestion}
                  />
                ) : conversation.status === 'idle' ? (
                  <div className="flex flex-col items-center justify-center h-full w-full space-y-8 px-4 py-8">
                    <h1 className="text-4xl font-display font-extrabold tracking-tight text-center">
                      Ask them anything
                    </h1>
                    <div className="w-full max-w-2xl mx-auto">
                      <QueryInput
                        onSubmit={startSimulation}
                        isExpanded={false}
                        availableAudiences={combinedAudiences}
                        onCreateAudience={createAudience}
                        onMessageTestingClick={handleMessageTestingClick}
                        onOpenMethodCreator={handleOpenMethodCreator}
                      />
                    </div>
                  </div>
                ) : (
                  <WorkingPane
                    conversation={conversation}
                    onSelectCanvas={handleExpandCanvas}
                    onExpandCanvas={handleExpandCanvas}
                    onFollowUp={handleFollowUp}
                    availableAudiences={combinedAudiences}
                    onCreateAudience={createAudience}
                    selectedSegments={selectedSegments}
                    selectionCanvasId={selectionCanvasId}
                    onBarSelect={selectSegment}
                    onClearSegments={clearSegments}
                    onRemoveSegment={removeSegment}
                    onMessageTestingClick={handleMessageTestingClick}
                    onEditStudyPlan={handleEditStudyPlan}
                    onCanvasTitleChange={handleCanvasTitleChange}
                    onOpenMethodCreator={handleOpenMethodCreator}
                    onSaveToProject={handleSaveCanvasToProject}
                    onRefineInBuilder={handleRefineInBuilder}
                    isSidePanelOpen={!!editingStudyPlan}
                  />
                )}
              </div>
            </>
          )}
        </main>

        {/* Study Plan Side Panel - slides in from right, shrinks main content */}
        <MethodSidePanel
          isOpen={!!editingStudyPlan}
          onClose={handleStudyPlanClose}
          initialMethodId={editingStudyPlan?.plan.methodId}
          initialVariantId={editingStudyPlan?.plan.variantId ?? undefined}
          initialFormData={{
            ...editingStudyPlan?.plan.formData,
            audience: editingStudyPlan?.audienceId || editingStudyPlan?.plan.formData?.audience
          }}
          initialTitle={editingStudyPlan?.plan.title}
          onSubmit={handleStudyPlanSubmit}
        />
        </>
        )}
      </SidebarInset>

      {/* Message Testing Modal */}
      <MessageTestingModal
        isOpen={showMessageTestingModal}
        onClose={handleMessageTestingClose}
        onBack={handleMessageTestingClose}
        audiences={combinedAudiences}
        onCreateAudience={() => {
          // Close modal and potentially open audience creation flow
          setShowMessageTestingModal(false)
        }}
        onContinue={(data) => {
          console.log('Message test data:', data)
          // Handle the form submission - could start a simulation or save test config
          setShowMessageTestingModal(false)
        }}
      />

    </SidebarProvider>
  )
}

export default App

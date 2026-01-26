import React, { useState, useCallback, useMemo } from 'react'
import { AppSidebar, MainHeader } from '@/components/layout/AppSidebar'
import {
  SidebarInset,
  SidebarProvider,
  useSidebar,
} from '@/components/ui/sidebar'
import { useConversation, useHistory, useAudiences, useSegmentSelection } from '@/hooks'
import { selectResearchTool, executeSelectedTool, isQualitativeQuery, generateConversationTitle } from '@/services'
import type { Account, AudienceDetails, Conversation, Canvas, Message, SelectedSegments, StudyPlan } from '@/types'
import {
  mockAccounts,
  mubiAccount,
  wonderhoodAccount,
  initialProcessSteps,
  initialQualitativeSteps,
  getAllAudiences,
} from '@/data/mockData'

// Import feature components
import { WorkingPane } from '@/components/WorkingPane'
import { QueryInput } from '@/components/QueryInput'
import { AudiencesList } from '@/components/AudiencesList'
import { AudienceDetail } from '@/components/AudienceDetail'
import { ExpandedCanvas } from '@/components/ExpandedCanvas'
import { MessageTestingModal } from '@/components/MessageTestingModal'
import { MethodSheet } from '@/components/MethodSheet'
import { Button } from '@/components/ui/button'
import { Layers } from 'lucide-react'

type ActiveView = 'conversation' | 'audiences' | 'audienceDetail'

const App: React.FC = () => {
  // Account state - default to MUBI
  const [currentAccount, setCurrentAccount] = useState<Account>(mubiAccount)

  // Navigation state
  const [activeView, setActiveView] = useState<ActiveView>('conversation')
  const [selectedAudience, setSelectedAudience] = useState<AudienceDetails | null>(null)
  const [selectedProject, setSelectedProject] = useState<string | null>(null)

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

  // Study Plan editing state
  const [editingStudyPlan, setEditingStudyPlan] = useState<StudyPlan | null>(null)

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
    const planningSteps = [
      { id: 'plan_1', label: 'Analyzing your question', status: 'in-progress' as const },
      { id: 'plan_2', label: 'Selecting research method', status: 'pending' as const },
    ]

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
    const planningStep2 = [
      { id: 'plan_1', label: 'Analyzing your question', status: 'complete' as const },
      { id: 'plan_2', label: 'Selecting research method', status: 'in-progress' as const },
    ]
    setConversation((prev) => ({
      ...prev,
      title,
      processSteps: planningStep2,
      messages: prev.messages.map(msg =>
        msg.id === planningMessageId ? { ...msg, processSteps: planningStep2 } : msg
      ),
    }))

    // Brief delay to show step 2 animating
    await new Promise(resolve => setTimeout(resolve, 600))

    // Complete planning steps
    const planningComplete = [
      { id: 'plan_1', label: 'Analyzing your question', status: 'complete' as const },
      { id: 'plan_2', label: 'Selecting research method', status: 'complete' as const },
    ]
    setConversation((prev) => ({
      ...prev,
      processSteps: planningComplete,
      messages: prev.messages.map(msg =>
        msg.id === planningMessageId ? { ...msg, processSteps: planningComplete } : msg
      ),
    }))

    // Brief pause after planning completes
    await new Promise(resolve => setTimeout(resolve, 400))

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
    await new Promise(resolve => setTimeout(resolve, 600))

    // ===== PHASE 3: Execution with animated steps =====
    const executionSteps = selection.processSteps.map((label, i) => ({
      id: `exec_${i}`,
      label,
      status: i === 0 ? 'in-progress' as const : 'pending' as const,
    }))

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
    }, 800)

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
    const completedSteps = selection.processSteps.map((label, i) => ({
      id: `exec_${i}`,
      label,
      status: 'complete' as const,
    }))

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

  const handleExpandCanvas = useCallback((canvas: Canvas) => {
    setExpandedCanvas(canvas)
  }, [])

  const handleCloseExpandedCanvas = useCallback(() => {
    setExpandedCanvas(null)
  }, [])

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
  const handleEditStudyPlan = useCallback((studyPlan: StudyPlan) => {
    setEditingStudyPlan(studyPlan)
  }, [])

  const handleStudyPlanClose = useCallback(() => {
    setEditingStudyPlan(null)
  }, [])

  const handleStudyPlanSubmit = useCallback((methodId: string, variantId: string | null, formData: Record<string, unknown>, title: string) => {
    console.log('Re-run study plan:', { methodId, variantId, formData, title })
    // TODO: Re-run the research with updated parameters
    setEditingStudyPlan(null)
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
      />
      <SidebarInset className="flex flex-row overflow-hidden">
        {/* Main content area */}
        <main className="flex flex-1 flex-col overflow-hidden">
          {/* Expanded Canvas - replaces entire content including header */}
          {expandedCanvas ? (
            <ExpandedCanvas
              canvas={expandedCanvas}
              conversation={conversation}
              onClose={handleCloseExpandedCanvas}
              onEditQuestion={handleEditQuestion}
              selectedSegments={selectedSegments}
              isSelectionForThisCanvas={isForCanvas(expandedCanvas.id)}
              onClearSegments={clearSegments}
              onRemoveSegment={removeSegment}
              onEditStudyPlan={handleEditStudyPlan}
            />
          ) : (
            <>
              <MainHeader
                title={
                  activeView === 'audiences'
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
                {activeView === 'audiences' ? (
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
                  />
                )}
              </div>
            </>
          )}
        </main>
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

      {/* Study Plan Edit Sheet */}
      <MethodSheet
        isOpen={!!editingStudyPlan}
        onClose={handleStudyPlanClose}
        initialMethodId={editingStudyPlan?.methodId}
        initialVariantId={editingStudyPlan?.variantId ?? undefined}
        initialFormData={editingStudyPlan?.formData}
        initialTitle={editingStudyPlan?.title}
        isEditing={true}
        onSubmit={handleStudyPlanSubmit}
      />
    </SidebarProvider>
  )
}

export default App

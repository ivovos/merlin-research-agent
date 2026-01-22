import React, { useState, useCallback, useMemo } from 'react'
import { AppSidebar, MainHeader } from '@/components/layout/AppSidebar'
import {
  SidebarInset,
  SidebarProvider,
  useSidebar,
} from '@/components/ui/sidebar'
import { useConversation, useHistory, useAudiences, useSegmentSelection } from '@/hooks'
import { generateResearchWithAgent, isQualitativeQuery, generateConversationTitle } from '@/services'
import type { Account, AudienceDetails, Conversation, Canvas, Message, SelectedSegments } from '@/types'
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

  // Get all audiences for the account (includes Electric Twin generic audiences)
  const combinedAudiences = useMemo(() => {
    return getAllAudiences(currentAccount)
  }, [currentAccount])

  // Start research simulation
  const startSimulation = useCallback(async (query: string) => {
    const isQualitative = isQualitativeQuery(query)
    const startingSteps = isQualitative ? (initialQualitativeSteps || []) : (initialProcessSteps || [])
    const startTime = Date.now()

    // Update conversation state
    const newMessage: Message = {
      id: `msg_${Date.now()}`,
      role: 'user',
      content: query,
    }

    // Initialize with first step in-progress
    const initialSteps = startingSteps.map((s, i) => ({
      ...s,
      status: i === 0 ? 'in-progress' as const : 'pending' as const,
    }))

    setConversation((prev) => ({
      ...prev,
      query,
      messages: [...prev.messages, newMessage],
      status: 'processing',
      processSteps: initialSteps,
    }))

    // Animate through steps while API calls run
    let currentStepIndex = 0
    const stepInterval = setInterval(() => {
      currentStepIndex++
      if (currentStepIndex < startingSteps.length) {
        setConversation((prev) => ({
          ...prev,
          processSteps: prev.processSteps.map((s, i) => ({
            ...s,
            status: i < currentStepIndex ? 'complete' as const
              : i === currentStepIndex ? 'in-progress' as const
              : 'pending' as const,
          })),
        }))
      }
    }, 800) // Progress every 800ms

    // Generate title and research data in parallel using new agent API
    const [title, agentResult] = await Promise.all([
      generateConversationTitle(query),
      generateResearchWithAgent(query, conversation.canvas),
    ])

    // Stop the step animation
    clearInterval(stepInterval)

    const thinkingTime = Math.round((Date.now() - startTime) / 1000)
    console.log('Generated title:', title)
    console.log('Agent result:', agentResult)
    console.log('Thinking time:', thinkingTime, 's')

    // Handle clarification request from agent
    if (agentResult.type === 'clarification' && agentResult.clarification) {
      const clarificationMessage: Message = {
        id: `msg_${Date.now()}_clarification`,
        role: 'assistant',
        content: agentResult.clarification.missing_info,
        processSteps: [
          { id: 'step_1', label: 'Analyzing query', status: 'complete' as const },
          { id: 'step_2', label: 'Identifying requirements', status: 'complete' as const },
        ],
        clarification: agentResult.clarification,
        thinkingTime: thinkingTime,
      }

      setConversation((prev) => ({
        ...prev,
        title,
        status: 'complete',
        explanation: agentResult.clarification!.missing_info,
        thinkingTime: thinkingTime,
        processSteps: clarificationMessage.processSteps!,
        messages: [...prev.messages, clarificationMessage],
      }))
      return
    }

    // Handle research results
    const canvas = agentResult.canvases?.[0]
    if (!canvas) {
      console.error('No canvas returned from agent')
      return
    }

    // Use API-returned steps or fallback
    const finalSteps = (agentResult.processSteps || startingSteps.map(s => s.label)).map((label, i) => ({
      id: `step_${i}`,
      label: typeof label === 'string' ? label : (label as any).label,
      status: 'complete' as const,
    }))

    // Create assistant message with results
    const assistantMessage: Message = {
      id: `msg_${Date.now()}_assistant`,
      role: 'assistant',
      content: agentResult.explanation || `Research completed for ${canvas.audience.name}`,
      processSteps: finalSteps,
      canvas: canvas,
      thinkingTime: thinkingTime,
    }

    // Clear any existing segment selection when new canvas is created
    clearSegments()

    // Update with results
    setConversation((prev) => ({
      ...prev,
      title,
      status: 'complete',
      explanation: agentResult.explanation || '',
      thinkingTime: thinkingTime,
      processSteps: finalSteps,
      messages: [...prev.messages, assistantMessage],
      canvas: canvas,
    }))

    // Don't auto-expand canvas - show inline instead
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
      />
      <SidebarInset className="flex flex-row overflow-hidden">
        {/* Main content area */}
        <main className="flex flex-1 flex-col overflow-hidden">
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
          />

          <div className="flex-1 overflow-hidden">
            {/* Expanded Canvas - replaces main content when active */}
            {expandedCanvas ? (
              <ExpandedCanvas
                canvas={expandedCanvas}
                onClose={handleCloseExpandedCanvas}
                onEditQuestion={handleEditQuestion}
                selectedSegments={selectedSegments}
                isSelectionForThisCanvas={isForCanvas(expandedCanvas.id)}
                onClearSegments={clearSegments}
                onRemoveSegment={removeSegment}
              />
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
              />
            )}
          </div>
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
    </SidebarProvider>
  )
}

export default App

import React, { useState, useCallback } from 'react'
import { AppSidebar, MainHeader } from '@/components/layout/AppSidebar'
import { RightPanel } from '@/components/layout/RightPanel'
import {
  SidebarInset,
  SidebarProvider,
} from '@/components/ui/sidebar'
import { useConversation, useHistory, useAudiences, usePanel } from '@/hooks'
import { generateResearchData, isQualitativeQuery } from '@/services'
import type { Account, AudienceDetails, Conversation, Report, Message } from '@/types'
import {
  mockAccounts,
  wonderhoodAccount,
  initialProcessSteps,
  initialQualitativeSteps,
} from '@/data/mockData'

// Import existing feature components (to be refactored later)
import { WorkingPane } from '@/components/WorkingPane'
import { QueryInput } from '@/components/QueryInput'
import { AudiencesList } from '@/components/AudiencesList'
import { AudienceDetail } from '@/components/AudienceDetail'
import { ReportPane } from '@/components/ReportPane'

type ActiveView = 'conversation' | 'audiences' | 'audienceDetail'

const App: React.FC = () => {
  // Account state
  const [currentAccount, setCurrentAccount] = useState<Account>(wonderhoodAccount)

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
  const { panelState, toggleFullscreen } = usePanel()

  // Report panel state (simplified from usePanel for now)
  const [isReportOpen, setIsReportOpen] = useState(false)

  // Start research simulation
  const startSimulation = useCallback(async (query: string) => {
    const isQualitative = isQualitativeQuery(query)
    const startingSteps = isQualitative ? initialQualitativeSteps : initialProcessSteps

    // Update conversation state
    const newMessage: Message = {
      id: `msg_${Date.now()}`,
      role: 'user',
      content: query,
    }

    setConversation((prev) => ({
      ...prev,
      query,
      messages: [...prev.messages, newMessage],
      status: 'processing',
      processSteps: startingSteps.map((s) => ({ ...s, status: 'pending' as const })),
    }))

    // Generate research data
    const data = await generateResearchData(query, conversation.report)

    // Simulate step progression
    const steps = data.processSteps.map((label, i) => ({
      id: `step_${i}`,
      label,
      status: 'pending' as const,
    }))

    // Update with results
    setConversation((prev) => ({
      ...prev,
      status: 'complete',
      explanation: data.explanation,
      processSteps: steps.map((s) => ({ ...s, status: 'complete' as const })),
      report: {
        id: `report_${Date.now()}`,
        title: data.report.title,
        type: data.report.type || 'quantitative',
        audience: { id: data.audienceId, name: data.audienceName },
        respondents: data.report.type === 'qualitative' ? 12 : 847,
        abstract: data.report.abstract,
        questions: data.report.questions.map((q, i) => ({
          id: `q_${i}`,
          question: q.question,
          respondents: 847,
          options: q.options.map((o) => ({
            label: o.label,
            percentage: o.percentage || 0,
          })),
          segments: data.report.segments,
        })),
        themes: data.report.themes,
        createdAt: new Date(),
      },
    }))

    setIsReportOpen(true)
  }, [conversation.report, setConversation])

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
    setIsReportOpen(false)
    setActiveView('conversation')
  }, [conversation, addToHistory, startNewConversation])

  const handleSelectHistory = useCallback((conv: Conversation) => {
    if (conversation.query && conversation.id !== conv.id) {
      addToHistory(conversation)
    }
    setConversation(conv)
    setIsReportOpen(!!conv.report)
    setActiveView('conversation')
  }, [conversation, addToHistory, setConversation])

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

  const handleSelectReport = useCallback((_report?: Report) => {
    setIsReportOpen(true)
  }, [])

  const handleCloseReport = useCallback(() => {
    setIsReportOpen(false)
  }, [])

  const handleEditQuestion = useCallback((questionId: string, newQuestion: string) => {
    // Handle question editing
    console.log('Edit question:', questionId, newQuestion)
  }, [])

  const handleAskAudienceQuestion = useCallback((query: string) => {
    setActiveView('conversation')
    startSimulation(query)
  }, [startSimulation])

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
                : undefined
            }
          />

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
                <h1 className="text-4xl font-semibold tracking-tight text-center">
                  Ask them anything
                </h1>
                <div className="w-full max-w-2xl mx-auto">
                  <QueryInput
                    onSubmit={startSimulation}
                    isExpanded={false}
                    availableAudiences={audiences}
                    onCreateAudience={createAudience}
                  />
                </div>
              </div>
            ) : (
              <WorkingPane
                conversation={conversation}
                onSelectReport={handleSelectReport}
                onFollowUp={handleFollowUp}
                availableAudiences={audiences}
                onCreateAudience={createAudience}
              />
            )}
          </div>
        </main>

        {/* Right panel for report */}
        {activeView === 'conversation' && isReportOpen && conversation.report && (
          <RightPanel
            open={isReportOpen}
            title="Research Report"
            onClose={handleCloseReport}
            onExpand={toggleFullscreen}
            isFullscreen={panelState.isFullscreen}
          >
            <ReportPane
              conversation={conversation}
              onClose={handleCloseReport}
              onEditQuestion={handleEditQuestion}
            />
          </RightPanel>
        )}
      </SidebarInset>
    </SidebarProvider>
  )
}

export default App

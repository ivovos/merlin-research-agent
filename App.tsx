import React, { useState, useCallback } from 'react'
import { AppSidebar } from '@/components/layout/AppSidebar'
import {
  SidebarInset,
  SidebarProvider,
} from '@/components/ui/sidebar'
import { useProjectStore } from '@/hooks/useProjectStore'
import type { Account, AppView } from '@/types'
import type { BuilderState } from '@/hooks/useSurveyBuilder'
import { SURVEY_TYPE_CONFIGS } from '@/types'
import { generateMockFindings } from '@/lib/generateMockFindings'
import {
  mockAccounts,
  mubiAccount,
} from '@/data/mockData'

// Feature screens
import { Home } from '@/components/Home'
import { ProjectChat } from '@/components/ProjectChat'
import { AudiencesList } from '@/components/AudiencesList'
import { AudienceDetail } from '@/components/AudienceDetail'
import { SurveyBuilder } from '@/components/builder/SurveyBuilder'
import { QuickPollPage } from '@/components/quick-poll/QuickPollPage'

import type { AudienceDetails, Survey } from '@/types'

const App: React.FC = () => {
  // ── Core state ──
  const [currentAccount, setCurrentAccount] = useState<Account>(mubiAccount)
  const [view, setView] = useState<AppView>({ screen: 'home' })
  const [pendingQuery, setPendingQuery] = useState<string | undefined>()

  const store = useProjectStore()

  // Audience overlay (slides over current screen)
  const [audienceOverlay, setAudienceOverlay] = useState<
    | null
    | { mode: 'list' }
    | { mode: 'detail'; audience: AudienceDetails }
  >(null)

  // Survey builder / quick poll overlays
  const [showBuilder, setShowBuilder] = useState(false)
  const [showQuickPoll, setShowQuickPoll] = useState(false)

  // Sidebar state
  const [sidebarOpen, setSidebarOpen] = useState(true)

  // ── Navigation handlers ──

  const handleGoHome = useCallback(() => {
    setView({ screen: 'home' })
    store.setActiveProjectId(null)
    setAudienceOverlay(null)
  }, [store])

  const handleSelectProject = useCallback((id: string) => {
    store.setActiveProjectId(id)
    setView({ screen: 'project', projectId: id })
    setAudienceOverlay(null)
  }, [store])

  const handleNewProject = useCallback((text?: string) => {
    const project = store.createProject(text, currentAccount.name)
    setView({ screen: 'project', projectId: project.id })

    // Pass the query to ProjectChat so it triggers the full simulation
    if (text?.trim()) {
      setPendingQuery(text.trim())
    }
  }, [store, currentAccount])

  const handleAccountChange = useCallback((account: Account) => {
    setCurrentAccount(account)
  }, [])

  const handleDeleteProject = useCallback((id: string) => {
    store.deleteProject(id)
    // If we were viewing this project, go home
    if (view.screen === 'project' && view.projectId === id) {
      setView({ screen: 'home' })
    }
  }, [store, view])

  const handleAudiencesClick = useCallback(() => {
    setAudienceOverlay({ mode: 'list' })
  }, [])

  const handleSelectAudience = useCallback((audience: AudienceDetails) => {
    setAudienceOverlay({ mode: 'detail', audience })
  }, [])

  const handleBackToAudiences = useCallback(() => {
    setAudienceOverlay({ mode: 'list' })
  }, [])

  const handleCloseAudienceOverlay = useCallback(() => {
    setAudienceOverlay(null)
  }, [])

  // ── Builder handlers ──

  const handleOpenBuilder = useCallback(() => {
    setShowBuilder(true)
  }, [])

  const handleCloseBuilder = useCallback(() => {
    setShowBuilder(false)
  }, [])

  const handleBuilderLaunch = useCallback((builderState: BuilderState) => {
    const typeConfig = SURVEY_TYPE_CONFIGS.find(c => c.key === builderState.selectedType)
    const today = new Date().toISOString().slice(0, 10)
    const projectName = builderState.surveyName?.trim() || typeConfig?.label || 'Untitled Survey'
    const hasMultipleSegments = builderState.selectedAudiences.length > 1
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

    // Create a project for the launched survey
    const project = store.createProject(projectName, currentAccount.name)
    store.addStudy(project.id, survey)
    store.addMessage(project.id, {
      id: `msg_${Date.now()}_sys`,
      type: 'system',
      text: `Study "${projectName}" launched with ${builderState.questions.length} questions.`,
      timestamp: Date.now(),
    })
    store.addMessage(project.id, {
      id: `msg_${Date.now()}_findings`,
      type: 'findings',
      studyId: survey.id,
      findings,
      studyName: projectName,
      typeBadge: typeConfig?.label,
      respondents: hasMultipleSegments ? 800 : 400,
      timestamp: Date.now(),
    })

    setShowBuilder(false)
    setView({ screen: 'project', projectId: project.id })
  }, [store, currentAccount])

  // ── Quick Poll handlers ──

  const handleOpenQuickPoll = useCallback(() => {
    setShowQuickPoll(true)
  }, [])

  const handleCloseQuickPoll = useCallback(() => {
    setShowQuickPoll(false)
  }, [])

  const handleQuickPollLaunch = useCallback((survey: Survey) => {
    const project = store.createProject('Quick Poll', currentAccount.name)
    store.addStudy(project.id, survey)
    store.addMessage(project.id, {
      id: `msg_${Date.now()}_sys`,
      type: 'system',
      text: `Quick Poll launched with ${survey.questions.length} questions.`,
      timestamp: Date.now(),
    })
    store.addMessage(project.id, {
      id: `msg_${Date.now()}_findings`,
      type: 'findings',
      studyId: survey.id,
      findings: survey.findings!,
      studyName: survey.name,
      typeBadge: 'Quick Poll',
      respondents: survey.sampleSize,
      timestamp: Date.now(),
    })

    setShowQuickPoll(false)
    setView({ screen: 'project', projectId: project.id })
  }, [store, currentAccount])

  // ── Render ──

  return (
    <SidebarProvider open={sidebarOpen} onOpenChange={setSidebarOpen}>
      <AppSidebar
        currentAccount={currentAccount}
        accounts={mockAccounts}
        onAccountChange={handleAccountChange}
        view={view}
        projects={store.projects}
        onSelectProject={handleSelectProject}
        onGoHome={handleGoHome}
        onNewProject={handleGoHome}
        onAudiencesClick={handleAudiencesClick}
        onDeleteProject={handleDeleteProject}
      />
      <SidebarInset className="flex flex-row overflow-hidden">
        {/* Quick Poll — full page overlay */}
        {showQuickPoll ? (
          <QuickPollPage onClose={handleCloseQuickPoll} onLaunch={handleQuickPollLaunch} />
        ) : showBuilder ? (
          <SurveyBuilder onClose={handleCloseBuilder} onLaunch={handleBuilderLaunch} />
        ) : audienceOverlay ? (
          /* Audience overlay */
          <main className="flex flex-1 flex-col overflow-hidden">
            {audienceOverlay.mode === 'detail' ? (
              <AudienceDetail
                audience={audienceOverlay.audience}
                account={currentAccount}
                onBack={handleBackToAudiences}
                onAskQuestion={(query) => {
                  handleCloseAudienceOverlay()
                  handleNewProject(query)
                }}
              />
            ) : (
              <AudiencesList
                account={currentAccount}
                selectedProject={null}
                onSelectAudience={handleSelectAudience}
              />
            )}
          </main>
        ) : view.screen === 'project' && store.activeProject ? (
          /* Project chat */
          <ProjectChat
            project={store.activeProject}
            onAddMessage={(msg) => store.addMessage(store.activeProject!.id, msg)}
            onUpdateMessage={(id, updates) => store.updateMessage(store.activeProject!.id, id, updates)}
            onAddStudy={(study) => store.addStudy(store.activeProject!.id, study)}
            onRenameProject={(name) => store.renameProject(store.activeProject!.id, name)}
            pendingQuery={pendingQuery}
            onPendingQueryConsumed={() => setPendingQuery(undefined)}
          />
        ) : (
          /* Home */
          <Home
            projects={store.projects}
            onSelectProject={handleSelectProject}
            onCreateProject={(text) => handleNewProject(text)}
            onSelectMethod={(method) => {
              if (method.id === 'quick-poll') {
                handleOpenQuickPoll()
              } else {
                handleOpenBuilder()
              }
            }}
            brand={currentAccount.name}
          />
        )}
      </SidebarInset>
    </SidebarProvider>
  )
}

export default App

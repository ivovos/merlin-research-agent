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

import type { AudienceDetails, Survey } from '@/types'

const App: React.FC = () => {
  // ── Core state ──
  const [currentAccount, setCurrentAccount] = useState<Account>(mubiAccount)
  const [view, setView] = useState<AppView>({ screen: 'home' })

  const store = useProjectStore()

  // Audience overlay (slides over current screen)
  const [audienceOverlay, setAudienceOverlay] = useState<
    | null
    | { mode: 'list' }
    | { mode: 'detail'; audience: AudienceDetails }
  >(null)

  // Survey builder overlay
  const [showBuilder, setShowBuilder] = useState(false)

  // Sidebar state — collapse when builder is open
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const sidebarOpenBeforeBuilder = React.useRef(true)

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
    const project = store.createProject(text)
    setView({ screen: 'project', projectId: project.id })

    // If text was provided, add it as the first user message
    if (text?.trim()) {
      store.addMessage(project.id, {
        id: `msg_${Date.now()}`,
        type: 'user',
        text: text.trim(),
        timestamp: Date.now(),
      })
    }
  }, [store])

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
    sidebarOpenBeforeBuilder.current = sidebarOpen
    setSidebarOpen(false)
    setShowBuilder(true)
  }, [sidebarOpen])

  const handleCloseBuilder = useCallback(() => {
    setShowBuilder(false)
    setSidebarOpen(sidebarOpenBeforeBuilder.current)
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
    const project = store.createProject(projectName)
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
  }, [store])

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
        onNewProject={() => handleNewProject()}
        onAudiencesClick={handleAudiencesClick}
        onDeleteProject={handleDeleteProject}
      />
      <SidebarInset className="flex flex-row overflow-hidden">
        {/* Survey Builder — full page overlay */}
        {showBuilder ? (
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
            onAddStudy={(study) => store.addStudy(store.activeProject!.id, study)}
            onRenameProject={(name) => store.renameProject(store.activeProject!.id, name)}
          />
        ) : (
          /* Home */
          <Home
            projects={store.projects}
            onSelectProject={handleSelectProject}
            onCreateProject={(text) => handleNewProject(text)}
            onOpenBuilder={handleOpenBuilder}
          />
        )}
      </SidebarInset>
    </SidebarProvider>
  )
}

export default App

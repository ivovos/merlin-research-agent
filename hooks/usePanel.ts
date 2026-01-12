import { useState, useCallback } from 'react'

export type PanelContent = 'report' | 'artifact' | null

export interface PanelState {
  isOpen: boolean
  isFullscreen: boolean
  content: PanelContent
  artifactId?: string
}

export interface UsePanelReturn {
  panelState: PanelState
  openPanel: (content: PanelContent, artifactId?: string) => void
  closePanel: () => void
  toggleFullscreen: () => void
  setFullscreen: (fullscreen: boolean) => void
}

const initialState: PanelState = {
  isOpen: false,
  isFullscreen: false,
  content: null,
  artifactId: undefined,
}

export function usePanel(): UsePanelReturn {
  const [panelState, setPanelState] = useState<PanelState>(initialState)

  const openPanel = useCallback((content: PanelContent, artifactId?: string) => {
    setPanelState({
      isOpen: true,
      isFullscreen: false,
      content,
      artifactId,
    })
  }, [])

  const closePanel = useCallback(() => {
    setPanelState(initialState)
  }, [])

  const toggleFullscreen = useCallback(() => {
    setPanelState((prev) => ({
      ...prev,
      isFullscreen: !prev.isFullscreen,
    }))
  }, [])

  const setFullscreen = useCallback((fullscreen: boolean) => {
    setPanelState((prev) => ({
      ...prev,
      isFullscreen: fullscreen,
    }))
  }, [])

  return {
    panelState,
    openPanel,
    closePanel,
    toggleFullscreen,
    setFullscreen,
  }
}

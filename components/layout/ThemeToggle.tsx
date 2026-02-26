import React, { useState, useEffect, useCallback, useRef } from 'react'
import { Settings, Sun, Moon, Palette, Type } from 'lucide-react'
import { useTheme, type ThemeName } from '@/hooks/useTheme'
import { cn } from '@/lib/utils'

const themes: { value: ThemeName; icon: React.ElementType; label: string }[] = [
  { value: 'slate-light', icon: Sun, label: 'Slate' },
  { value: 'stone-light', icon: Palette, label: 'Stone' },
  { value: 'slate-dark', icon: Moon, label: 'Dark' },
  { value: 'stone-dark', icon: Moon, label: 'Warm Dark' },
]

const HOVER_ZONE = 100 // px from bottom-right corner to trigger reveal

export function ThemeToggle({ onTypeStylesClick }: { onTypeStylesClick?: () => void }) {
  const { theme, setTheme } = useTheme()
  const [visible, setVisible] = useState(false)
  const [panelOpen, setPanelOpen] = useState(false)
  const hideTimerRef = useRef<ReturnType<typeof setTimeout>>()
  const containerRef = useRef<HTMLDivElement>(null)

  const show = useCallback(() => {
    clearTimeout(hideTimerRef.current)
    setVisible(true)
  }, [])

  const hide = useCallback(() => {
    if (panelOpen) return
    hideTimerRef.current = setTimeout(() => setVisible(false), 400)
  }, [panelOpen])

  // Track mouse position — reveal gear icon when near bottom-right
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      const fromRight = window.innerWidth - e.clientX
      const fromBottom = window.innerHeight - e.clientY
      if (fromRight <= HOVER_ZONE && fromBottom <= HOVER_ZONE) {
        show()
      } else if (!panelOpen) {
        hide()
      }
    }

    window.addEventListener('mousemove', onMove, { passive: true })
    return () => window.removeEventListener('mousemove', onMove)
  }, [show, hide, panelOpen])

  // Close panel on click outside
  useEffect(() => {
    if (!panelOpen) return
    const onClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setPanelOpen(false)
        hide()
      }
    }
    window.addEventListener('mousedown', onClick)
    return () => window.removeEventListener('mousedown', onClick)
  }, [panelOpen, hide])

  const togglePanel = () => setPanelOpen(prev => !prev)

  return (
    <div
      ref={containerRef}
      className={cn(
        'fixed bottom-4 right-4 z-50 transition-opacity duration-200',
        visible || panelOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none',
      )}
    >
      {/* Expanded theme panel */}
      {panelOpen && (
        <div className="absolute bottom-12 right-0 w-44 rounded-xl border bg-card shadow-lg p-1.5 mb-1">
          {themes.map(({ value, icon: Icon, label }) => (
            <button
              key={value}
              onClick={() => {
                setTheme(value)
                setPanelOpen(false)
                hide()
              }}
              className={cn(
                'flex items-center gap-2 w-full rounded-lg px-3 py-2 text-xs font-medium transition-all',
                theme === value
                  ? 'bg-muted text-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/60',
              )}
            >
              <Icon className="h-3.5 w-3.5 shrink-0" />
              <span>{label}</span>
            </button>
          ))}
          {onTypeStylesClick && (
            <>
              <div className="border-t border-border my-1.5" />
              <button
                onClick={() => {
                  onTypeStylesClick()
                  setPanelOpen(false)
                  hide()
                }}
                className="flex items-center gap-2 w-full rounded-lg px-3 py-2 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-all"
              >
                <Type className="h-3.5 w-3.5 shrink-0" />
                <span>Type Styles</span>
              </button>
            </>
          )}
        </div>
      )}

      {/* Gear button */}
      <button
        onClick={togglePanel}
        className={cn(
          'flex items-center justify-center w-9 h-9 rounded-full',
          'bg-card border shadow-md',
          'text-muted-foreground hover:text-foreground transition-colors',
        )}
        title="Theme settings"
      >
        <Settings className="h-4 w-4" />
      </button>
    </div>
  )
}

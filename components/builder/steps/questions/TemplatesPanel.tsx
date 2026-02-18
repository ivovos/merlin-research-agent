import React, { useMemo } from 'react'
import {
  ClipboardList,
  Heart,
  Smile,
  DollarSign,
  Film,
  Star,
  Clapperboard,
  Wifi,
  Signal,
  Headphones,
  Package,
  Users,
  Sparkles,
  MonitorPlay,
  Fuel,
  Zap,
  Shield,
  HeartPulse,
  Wind,
  Gamepad2,
  Gem,
  Trophy,
  Palette,
  Wand2,
  FileText,
  BarChart3,
  Handshake,
  MessageSquareText,
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import type { SurveyQuestion } from '@/types'
import {
  commonTemplates,
  getOrgTemplatesForAccount,
  type TemplateConfig,
} from '@/data/templates'

// ── Icon lookup (maps string names from data files → Lucide components) ──

const ICON_MAP: Record<string, React.ElementType> = {
  ClipboardList, Heart, Smile, DollarSign,
  Film, Star, Clapperboard,
  Wifi, Signal, Headphones, Package,
  Users, Sparkles, MonitorPlay,
  Fuel, Zap, Shield,
  HeartPulse, Wind,
  Gamepad2, Gem, Trophy,
  Palette, Wand2,
  FileText, BarChart3, Handshake,
  MessageSquareText,
}

function resolveIcon(name: string): React.ElementType {
  return ICON_MAP[name] ?? ClipboardList
}

// ── Props ──

interface TemplatesPanelProps {
  accountId?: string
  accountName?: string
  selectedTemplate: string | null
  onSelectTemplate: (key: string, questions: SurveyQuestion[]) => void
  onResetTemplate: () => void
}

export const TemplatesPanel: React.FC<TemplatesPanelProps> = ({
  accountId,
  accountName,
  selectedTemplate,
  onSelectTemplate,
  onResetTemplate,
}) => {
  const orgTemplates = useMemo(
    () => getOrgTemplatesForAccount(accountId ?? ''),
    [accountId],
  )

  // All templates combined — used for collapsed-state lookup
  const allTemplates = useMemo(
    () => [...commonTemplates, ...orgTemplates],
    [orgTemplates],
  )

  const handleSelect = (tpl: TemplateConfig) => {
    const questions: SurveyQuestion[] = tpl.questions.map((q, i) => ({
      id: `q_tpl_${Date.now()}_${i}`,
      required: true,
      ...q,
    }))
    onSelectTemplate(tpl.key, questions)
  }

  // ── Collapsed state ──
  if (selectedTemplate) {
    const tpl = allTemplates.find(t => t.key === selectedTemplate)
    const Icon = tpl ? resolveIcon(tpl.icon) : ClipboardList
    return (
      <div className="flex items-center gap-2 py-2 px-3 rounded-lg bg-zinc-50 border border-zinc-200">
        <Icon className="w-4 h-4 text-muted-foreground shrink-0" />
        <span className="text-sm text-foreground flex-1">
          Using {tpl?.label ?? selectedTemplate}
        </span>
        <button
          type="button"
          onClick={onResetTemplate}
          className="text-xs text-muted-foreground hover:text-foreground underline transition-colors"
        >
          Change template
        </button>
      </div>
    )
  }

  // ── Shared card renderer ──
  const renderCard = (tpl: TemplateConfig) => {
    const Icon = resolveIcon(tpl.icon)
    return (
      <Card
        key={tpl.key}
        className="cursor-pointer p-4 hover:bg-accent/30 hover:border-foreground/10 transition-all"
        onClick={() => handleSelect(tpl)}
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center shrink-0">
            <Icon className="w-4.5 h-4.5 text-muted-foreground" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium leading-tight">{tpl.label}</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {tpl.questions.length} questions
            </p>
          </div>
        </div>
      </Card>
    )
  }

  // ── Grid state — two sections ──
  return (
    <div className="space-y-5">
      {/* Common templates */}
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Common templates
        </p>
        <div className="grid grid-cols-2 gap-3">
          {commonTemplates.map(renderCard)}
        </div>
      </div>

      {/* Org-specific templates */}
      {orgTemplates.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            For {accountName ?? 'your organisation'}
          </p>
          <div className="grid grid-cols-2 gap-3">
            {orgTemplates.map(renderCard)}
          </div>
        </div>
      )}
    </div>
  )
}

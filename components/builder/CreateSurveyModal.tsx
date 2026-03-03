import React, { useMemo, useState } from 'react'
import {
  PlusCircle,
  FileText,
  ClipboardList,
  Lightbulb,
  MessageCircle,
  Image,
  Users,
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
  BarChart3,
  Handshake,
  MessageSquareText,
  LayoutGrid,
  AlignLeft,
  Search,
  UsersRound,
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import type { SurveyQuestion } from '@/types'
import {
  commonTemplates,
  getOrgTemplatesForAccount,
  type TemplateConfig,
  type TemplateCategory,
} from '@/data/templates'
import type { BuilderInitConfig } from '@/hooks/useSurveyBuilder'

// ── Icon lookup (maps string names from template data → Lucide components) ──

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
  Image, Lightbulb, MessageCircle,
  LayoutGrid, AlignLeft, Search, UsersRound,
}

function resolveIcon(name: string): React.ElementType {
  return ICON_MAP[name] ?? ClipboardList
}

// ── Category tabs ──

type CategoryTab = 'recent' | 'marketing' | 'product' | 'brand' | 'audience'

const CATEGORY_TABS: { key: CategoryTab; label: string }[] = [
  { key: 'recent', label: 'Recent' },
  { key: 'marketing', label: 'Marketing' },
  { key: 'product', label: 'Product' },
  { key: 'brand', label: 'Brand' },
  { key: 'audience', label: 'Audience Insight' },
]

// ── Props ──

interface CreateSurveyModalProps {
  open: boolean
  onClose: () => void
  onSelect: (config: BuilderInitConfig) => void
  accountId?: string
  accountName?: string
  accountLogo?: string
}

export const CreateSurveyModal: React.FC<CreateSurveyModalProps> = ({
  open,
  onClose,
  onSelect,
  accountId,
  accountName: _accountName,
  accountLogo,
}) => {
  const [activeTab, setActiveTab] = useState<CategoryTab>('recent')

  const orgTemplates = useMemo(
    () => getOrgTemplatesForAccount(accountId ?? ''),
    [accountId],
  )

  const allTemplates = useMemo(
    () => [...orgTemplates, ...commonTemplates],
    [orgTemplates],
  )

  const filteredTemplates = useMemo(() => {
    if (activeTab === 'recent') return allTemplates
    return allTemplates.filter(tpl => tpl.category === (activeTab as TemplateCategory))
  }, [allTemplates, activeTab])

  const handleFromScratch = () => {
    onSelect({ mode: 'scratch', surveyType: 'simple' })
  }

  const handleImportExisting = () => {
    onSelect({ mode: 'import', surveyType: 'simple' })
  }

  const handleSelectTemplate = (tpl: TemplateConfig) => {
    const questions: SurveyQuestion[] = tpl.questions.map((q, i) => ({
      id: `q_tpl_${Date.now()}_${i}`,
      required: true,
      ...q,
    }))
    onSelect({
      mode: 'template',
      surveyType: tpl.surveyType,
      templateKey: tpl.key,
      questions,
    })
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto p-0">
        <DialogHeader className="px-8 pt-8 pb-0">
          <DialogTitle className="text-lg font-display font-semibold">Create new survey</DialogTitle>
        </DialogHeader>

        <div className="px-8 pb-8 space-y-8">
          {/* Primary action cards */}
          <div className="grid grid-cols-2 gap-4">
            <Card
              className="cursor-pointer py-8 px-6 hover:bg-accent/50 hover:border-foreground/10 transition-all group"
              onClick={handleFromScratch}
            >
              <div className="flex flex-col items-center text-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center group-hover:bg-foreground/10 transition-colors">
                  <PlusCircle className="w-6 h-6 text-muted-foreground" />
                </div>
                <p className="text-sm font-semibold">Create from scratch</p>
              </div>
            </Card>

            <Card
              className="cursor-pointer py-8 px-6 hover:bg-accent/50 hover:border-foreground/10 transition-all group"
              onClick={handleImportExisting}
            >
              <div className="flex flex-col items-center text-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center group-hover:bg-foreground/10 transition-colors">
                  <FileText className="w-6 h-6 text-muted-foreground" />
                </div>
                <p className="text-sm font-semibold">Import existing</p>
              </div>
            </Card>
          </div>

          {/* Divider */}
          <p className="text-sm text-muted-foreground">Or – start with a template:</p>

          {/* Category filter tabs */}
          <div className="border-b border-border">
            <div className="flex gap-6">
              {CATEGORY_TABS.map(tab => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveTab(tab.key)}
                  className={cn(
                    'pb-2.5 text-sm font-medium transition-colors border-b-2 -mb-px',
                    activeTab === tab.key
                      ? 'border-foreground text-foreground'
                      : 'border-transparent text-muted-foreground hover:text-foreground',
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Template grid */}
          <div className="grid grid-cols-3 gap-4">
            {filteredTemplates.length === 0 && (
              <div className="col-span-3 py-12 text-center">
                <p className="text-sm text-muted-foreground">No templates in this category yet.</p>
              </div>
            )}
            {filteredTemplates.map((tpl) => {
              const Icon = resolveIcon(tpl.icon)
              return (
                <Card
                  key={tpl.key}
                  className="cursor-pointer overflow-hidden hover:bg-accent/30 hover:border-foreground/10 transition-all group"
                  onClick={() => handleSelectTemplate(tpl)}
                >
                  {/* Icon area */}
                  <div className="p-3 pt-4">
                    <div className="h-28 rounded-xl bg-stone-100 dark:bg-stone-800/50 flex items-center justify-center group-hover:bg-stone-200/80 dark:group-hover:bg-stone-700/50 transition-colors">
                      <Icon className="w-8 h-8 text-stone-400" strokeWidth={1.5} />
                    </div>
                  </div>

                  {/* Card body */}
                  <div className="px-3.5 pb-3.5 pt-2 space-y-1.5">
                    <p className="text-sm font-semibold leading-tight">{tpl.label}</p>
                    <p className="text-xs text-muted-foreground">
                      {tpl.questions.length} {tpl.questions.length === 1 ? 'Question' : 'Questions'}
                    </p>
                    {tpl.creatorLabel && (
                      <div className="flex items-center gap-2">
                        {accountLogo ? (
                          <img src={accountLogo} alt="" className="w-4 h-4 rounded object-cover shrink-0" />
                        ) : (
                          <span className="w-4 h-4 rounded bg-blue-600 shrink-0" />
                        )}
                        <p className="text-[11px] text-muted-foreground/80 leading-tight">
                          {tpl.creatorLabel}
                        </p>
                      </div>
                    )}
                  </div>
                </Card>
              )
            })}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

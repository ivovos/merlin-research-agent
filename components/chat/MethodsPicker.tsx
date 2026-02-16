import React, { useState, useRef, useEffect, useMemo } from 'react'
import {
  ClipboardList,
  Users,
  MessageSquare,
  Search,
  X,
  FlaskConical,
  BarChart3,
  Lightbulb,
  Palette,
  Target,
  Megaphone,
  DollarSign,
  ShieldCheck,
  Layers,
  Eye,
  Repeat,
  SlidersHorizontal,
  PieChart,
  Zap,
  BookOpen,
  Compass,
  GitCompare,
  LayoutGrid,
  Heart,
  Gauge,
  Package,
  type LucideIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { createPortal } from 'react-dom'

/* ── Method definition for the picker ── */
export interface PickerMethod {
  id: string
  command: string
  label: string
  description: string
  icon: string
  category?: string
}

/* ── Comprehensive methods list ── */
export const PICKER_METHODS: PickerMethod[] = [
  // ── Quick & Simple ──
  {
    id: 'quick-poll',
    command: '/quick-poll',
    label: 'Quick Poll',
    description: 'Fast single-question pulse check',
    icon: 'zap',
    category: 'Quick & Simple',
  },
  {
    id: 'survey',
    command: '/survey',
    label: 'Survey',
    description: 'Broad quantitative questionnaire',
    icon: 'clipboard-list',
    category: 'Quick & Simple',
  },
  {
    id: 'focus-group',
    command: '/focus-group',
    label: 'Focus Group',
    description: 'Deep qualitative discussion',
    icon: 'users',
    category: 'Quick & Simple',
  },

  // ── Message & Copy ──
  {
    id: 'message-test',
    command: '/message-test',
    label: 'Message Test',
    description: 'Test copy and value propositions',
    icon: 'message-square',
    category: 'Message & Copy',
  },
  {
    id: 'multivariant-message-test',
    command: '/multivariant-message-test',
    label: 'Multivariant Message Test',
    description: 'Compare multiple copy variants at scale',
    icon: 'git-compare',
    category: 'Message & Copy',
  },
  {
    id: 'claims-testing',
    command: '/claims-testing',
    label: 'Claims Testing',
    description: 'Evaluate credibility of product claims',
    icon: 'shield-check',
    category: 'Message & Copy',
  },
  {
    id: 'naming-test',
    command: '/naming-test',
    label: 'Naming Test',
    description: 'Test brand or product name options',
    icon: 'book-open',
    category: 'Message & Copy',
  },

  // ── Creative & Design ──
  {
    id: 'creative-testing',
    command: '/creative-testing',
    label: 'Creative Testing',
    description: 'Pre-test ads, visuals, and creative assets',
    icon: 'palette',
    category: 'Creative & Design',
  },
  {
    id: 'ad-pre-testing',
    command: '/ad-pre-testing',
    label: 'Ad Pre-Testing',
    description: 'Evaluate ad performance before launch',
    icon: 'megaphone',
    category: 'Creative & Design',
  },
  {
    id: 'packaging-test',
    command: '/packaging-test',
    label: 'Packaging Test',
    description: 'Evaluate pack design and shelf impact',
    icon: 'package',
    category: 'Creative & Design',
  },
  {
    id: 'key-art-test',
    command: '/key-art-test',
    label: 'Key Art Test',
    description: 'Test poster, thumbnail, or hero art options',
    icon: 'eye',
    category: 'Creative & Design',
  },

  // ── Concept & Product ──
  {
    id: 'concept-testing',
    command: '/concept-testing',
    label: 'Concept Testing',
    description: 'Evaluate new product or service concepts',
    icon: 'lightbulb',
    category: 'Concept & Product',
  },
  {
    id: 'proposition-testing',
    command: '/proposition-testing',
    label: 'Proposition Testing',
    description: 'Test value propositions and positioning',
    icon: 'target',
    category: 'Concept & Product',
  },
  {
    id: 'feature-prioritisation',
    command: '/feature-prioritisation',
    label: 'Feature Prioritisation',
    description: 'Rank features by preference and impact',
    icon: 'layers',
    category: 'Concept & Product',
  },
  {
    id: 'ux-testing',
    command: '/ux-testing',
    label: 'UX Testing',
    description: 'Evaluate user experience and usability',
    icon: 'sliders-horizontal',
    category: 'Concept & Product',
  },

  // ── Audience & Brand ──
  {
    id: 'understand-audience',
    command: '/understand-audience',
    label: 'Understand Audience',
    description: 'Explore attitudes, needs, and behaviours',
    icon: 'compass',
    category: 'Audience & Brand',
  },
  {
    id: 'audience-segmentation',
    command: '/audience-segmentation',
    label: 'Audience Segmentation',
    description: 'Cluster audiences by shared traits',
    icon: 'pie-chart',
    category: 'Audience & Brand',
  },
  {
    id: 'brand-tracking',
    command: '/brand-tracking',
    label: 'Brand Tracking',
    description: 'Monitor brand health over time',
    icon: 'bar-chart-3',
    category: 'Audience & Brand',
  },
  {
    id: 'brand-perception',
    command: '/brand-perception',
    label: 'Brand Perception',
    description: 'Map how your brand is perceived vs competitors',
    icon: 'heart',
    category: 'Audience & Brand',
  },
  {
    id: 'nps-csat',
    command: '/nps-csat',
    label: 'NPS / CSAT',
    description: 'Measure satisfaction and loyalty scores',
    icon: 'gauge',
    category: 'Audience & Brand',
  },

  // ── Pricing & Advanced ──
  {
    id: 'pricing-research',
    command: '/pricing-research',
    label: 'Pricing Research',
    description: 'Determine optimal price points',
    icon: 'dollar-sign',
    category: 'Pricing & Advanced',
  },
  {
    id: 'conjoint-analysis',
    command: '/conjoint-analysis',
    label: 'Conjoint Analysis',
    description: 'Trade-off analysis for product attributes',
    icon: 'layout-grid',
    category: 'Pricing & Advanced',
  },
  {
    id: 'maxdiff',
    command: '/maxdiff',
    label: 'MaxDiff',
    description: 'Best-worst scaling for preference ranking',
    icon: 'repeat',
    category: 'Pricing & Advanced',
  },
  {
    id: 'ab-experiment',
    command: '/ab-experiment',
    label: 'A/B Experiment',
    description: 'Randomised controlled comparison',
    icon: 'flask',
    category: 'Pricing & Advanced',
  },
]

/* ── Icon resolver ── */
const ICON_MAP: Record<string, LucideIcon> = {
  'clipboard-list': ClipboardList,
  'users': Users,
  'message-square': MessageSquare,
  'flask': FlaskConical,
  'bar-chart-3': BarChart3,
  'lightbulb': Lightbulb,
  'palette': Palette,
  'target': Target,
  'megaphone': Megaphone,
  'dollar-sign': DollarSign,
  'shield-check': ShieldCheck,
  'layers': Layers,
  'eye': Eye,
  'repeat': Repeat,
  'sliders-horizontal': SlidersHorizontal,
  'pie-chart': PieChart,
  'zap': Zap,
  'book-open': BookOpen,
  'compass': Compass,
  'git-compare': GitCompare,
  'layout-grid': LayoutGrid,
  'heart': Heart,
  'gauge': Gauge,
  'package': Package,
  'search': Search,
}

/* ── Component ── */
interface MethodsPickerProps {
  open: boolean
  onClose: () => void
  onSelect: (method: PickerMethod) => void
  className?: string
}

export const MethodsPicker: React.FC<MethodsPickerProps> = ({
  open,
  onClose,
  onSelect,
}) => {
  const [search, setSearch] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const cardRef = useRef<HTMLDivElement>(null)

  // Focus search on open
  useEffect(() => {
    if (open) {
      setSearch('')
      requestAnimationFrame(() => inputRef.current?.focus())
    }
  }, [open])

  // Close on Escape
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open, onClose])

  // Filter methods by search
  const filtered = useMemo(() => {
    if (!search.trim()) return PICKER_METHODS
    const q = search.toLowerCase()
    return PICKER_METHODS.filter(
      m =>
        m.label.toLowerCase().includes(q) ||
        m.command.toLowerCase().includes(q) ||
        m.description.toLowerCase().includes(q) ||
        (m.category?.toLowerCase().includes(q) ?? false),
    )
  }, [search])

  // Group filtered results by category
  const grouped = useMemo(() => {
    const groups: { category: string; methods: PickerMethod[] }[] = []
    const seen = new Set<string>()

    for (const method of filtered) {
      const cat = method.category ?? 'Other'
      if (!seen.has(cat)) {
        seen.add(cat)
        groups.push({ category: cat, methods: [] })
      }
      groups.find(g => g.category === cat)!.methods.push(method)
    }
    return groups
  }, [filtered])

  if (!open) return null

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop — 20% opacity */}
      <div
        className="absolute inset-0 bg-black/20"
        onClick={onClose}
      />

      {/* Card */}
      <div
        ref={cardRef}
        className={cn(
          'relative z-10 w-full max-w-[480px] mx-4',
          'bg-popover border border-border rounded-2xl shadow-xl',
          'animate-in fade-in zoom-in-95 duration-150',
          'flex flex-col max-h-[min(600px,80vh)]',
        )}
      >
        {/* Search header */}
        <div className="flex items-center gap-3 px-4 pt-4 pb-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            <input
              ref={inputRef}
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search methods and templates"
              className="w-full pl-10 pr-3 py-2.5 text-sm bg-muted/50 border border-border rounded-xl placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>
          <button
            onClick={onClose}
            className="shrink-0 w-8 h-8 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable method list */}
        <div className="flex-1 overflow-y-auto px-2 pb-3">
          {filtered.length === 0 ? (
            <div className="px-4 py-8 text-sm text-muted-foreground text-center">
              No methods match &ldquo;{search}&rdquo;
            </div>
          ) : (
            grouped.map(group => (
              <div key={group.category}>
                {/* Category header — only show when not searching or when multiple groups */}
                {(!search.trim() || grouped.length > 1) && (
                  <div className="px-3 pt-3 pb-1.5">
                    <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground/70">
                      {group.category}
                    </span>
                  </div>
                )}

                {group.methods.map(method => {
                  const Icon = ICON_MAP[method.icon] || FlaskConical
                  return (
                    <button
                      key={method.id}
                      onClick={() => {
                        onSelect(method)
                        onClose()
                      }}
                      className={cn(
                        'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left',
                        'hover:bg-muted/70 transition-colors group',
                      )}
                    >
                      <div className="shrink-0 w-9 h-9 rounded-lg bg-muted flex items-center justify-center group-hover:bg-background transition-colors">
                        <Icon className="w-[18px] h-[18px] text-muted-foreground group-hover:text-foreground transition-colors" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-medium text-foreground leading-tight">
                          {method.label}
                        </div>
                        <div className="text-xs text-muted-foreground truncate leading-tight mt-0.5">
                          {method.description}
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>
            ))
          )}
        </div>
      </div>
    </div>,
    document.body,
  )
}

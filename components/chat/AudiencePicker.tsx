import React, { useState, useRef, useEffect, useMemo } from 'react'
import {
  Search,
  X,
  Users,
  Tv,
  Wifi,
  Eye,
  Clock,
  Sparkles,
  CreditCard,
  UserCheck,
  Smartphone,
  TrendingDown,
  Zap,
  MonitorPlay,
  Globe,
  Crown,
  MapPin,
  type LucideIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { createPortal } from 'react-dom'

/* ── Audience definition for the picker ── */
export interface PickerAudience {
  id: string
  label: string
  description: string
  icon: string
  agents: number
  category: string
}

/* ── ET Core Audiences ── */
const ET_CORE_AUDIENCES: PickerAudience[] = [
  // Media & Entertainment
  {
    id: 'et-streamers-multi',
    label: 'Multi-Platform Streamers',
    description: 'Consumers with multiple streaming subscriptions',
    icon: 'monitor-play',
    agents: 4500,
    category: 'Media & Entertainment',
  },
  {
    id: 'et-cord-cutters',
    label: 'Cord Cutters',
    description: 'Consumers who cancelled or never had cable TV',
    icon: 'wifi',
    agents: 2800,
    category: 'Media & Entertainment',
  },
  {
    id: 'et-binge-watchers',
    label: 'Binge Watchers',
    description: 'Regularly watch multiple episodes in one sitting',
    icon: 'tv',
    agents: 3800,
    category: 'Media & Entertainment',
  },

  // Digital Attention
  {
    id: 'et-subscription-fatigued',
    label: 'Subscription Fatigued',
    description: 'Cancelled subscriptions due to cost or overload',
    icon: 'trending-down',
    agents: 4200,
    category: 'Digital Attention',
  },
  {
    id: 'et-deep-engagers',
    label: 'Deep Engagers',
    description: 'Regularly engage with long-form content (30+ min)',
    icon: 'eye',
    agents: 3800,
    category: 'Digital Attention',
  },
  {
    id: 'et-content-skippers',
    label: 'Content Skippers',
    description: 'Frequently skip intros, recaps, or mid-roll',
    icon: 'zap',
    agents: 4100,
    category: 'Digital Attention',
  },

  // Generational Cohorts
  {
    id: 'et-gen-z-digital-natives',
    label: 'Gen Z Digital Natives',
    description: '18–26 year olds raised on smartphones and streaming',
    icon: 'smartphone',
    agents: 5500,
    category: 'Generational Cohorts',
  },
  {
    id: 'et-millennial-streamers',
    label: 'Millennial Streamers',
    description: '27–42 year olds by household and streaming behaviour',
    icon: 'users',
    agents: 5600,
    category: 'Generational Cohorts',
  },
  {
    id: 'et-gen-x-adopters',
    label: 'Gen X Digital Adopters',
    description: '43–58 year olds by tech adoption comfort level',
    icon: 'user-check',
    agents: 4200,
    category: 'Generational Cohorts',
  },

  // Time & Context
  {
    id: 'et-evening-unwinders',
    label: 'Evening Unwinders',
    description: 'Primarily stream in evening hours to relax',
    icon: 'clock',
    agents: 6700,
    category: 'Time & Context',
  },
  {
    id: 'et-weekend-warriors',
    label: 'Weekend Binge Warriors',
    description: 'Concentrate streaming activity on weekends',
    icon: 'sparkles',
    agents: 5100,
    category: 'Time & Context',
  },

  // Social & Creator Economy
  {
    id: 'et-creator-followers',
    label: 'Creator Economy Followers',
    description: 'Regularly follow and support content creators',
    icon: 'users',
    agents: 7200,
    category: 'Social & Creator Economy',
  },
  {
    id: 'et-premium-upgraders',
    label: 'Premium Upgraders',
    description: 'Upgraded to premium tiers for ad-free, features, or content',
    icon: 'crown',
    agents: 2200,
    category: 'Social & Creator Economy',
  },
  {
    id: 'et-free-tier-loyalists',
    label: 'Free Tier Loyalists',
    description: 'Consistently use free or ad-supported tiers',
    icon: 'users',
    agents: 5800,
    category: 'Social & Creator Economy',
  },
  {
    id: 'et-bnpl-users',
    label: 'Buy Now Pay Later Users',
    description: 'Use BNPL services for entertainment, retail, and travel',
    icon: 'credit-card',
    agents: 3100,
    category: 'Social & Creator Economy',
  },
]

/* ── Account-specific audiences ── */

const VODAFONE_AUDIENCES: PickerAudience[] = [
  {
    id: 'vod-broadband-decision-makers',
    label: 'Broadband Decision Makers',
    description: 'General household broadband purchase decision-makers',
    icon: 'wifi',
    agents: 4200,
    category: 'Vodafone',
  },
  {
    id: 'vod-tech-savvy-families',
    label: 'Tech-Savvy Families',
    description: 'Families with high-speed needs and smart home devices',
    icon: 'smartphone',
    agents: 3100,
    category: 'Vodafone',
  },
  {
    id: 'vod-uk-mobile-customers',
    label: 'UK Mobile Customers',
    description: 'Existing Vodafone mobile contract customers in the UK',
    icon: 'map-pin',
    agents: 8500,
    category: 'Vodafone',
  },
  {
    id: 'vod-switchers',
    label: 'Recent Switchers',
    description: 'Consumers who changed broadband provider in last 12 months',
    icon: 'zap',
    agents: 2200,
    category: 'Vodafone',
  },
  {
    id: 'vod-bundle-customers',
    label: 'Bundle Customers',
    description: 'Customers with combined mobile + broadband plans',
    icon: 'users',
    agents: 3800,
    category: 'Vodafone',
  },
  {
    id: 'vod-price-sensitive',
    label: 'Price-Sensitive Shoppers',
    description: 'Broadband buyers who prioritise value over speed',
    icon: 'credit-card',
    agents: 5100,
    category: 'Vodafone',
  },
]

const DISNEY_AUDIENCES: PickerAudience[] = [
  {
    id: 'disney-uk-subscribers',
    label: 'UK Subscribers',
    description: 'Active Disney+ subscribers in the United Kingdom',
    icon: 'map-pin',
    agents: 6200,
    category: 'Disney+',
  },
  {
    id: 'disney-us-subscribers',
    label: 'US Subscribers',
    description: 'Active Disney+ subscribers in the United States',
    icon: 'map-pin',
    agents: 12400,
    category: 'Disney+',
  },
  {
    id: 'disney-family-viewers',
    label: 'Family Viewers',
    description: 'Households streaming Disney+ with children under 12',
    icon: 'users',
    agents: 5800,
    category: 'Disney+',
  },
  {
    id: 'disney-adult-drama-fans',
    label: 'Adult Drama Fans',
    description: 'Subscribers who primarily watch drama and prestige content',
    icon: 'monitor-play',
    agents: 3400,
    category: 'Disney+',
  },
  {
    id: 'disney-premium-tier',
    label: 'Premium Tier',
    description: 'Ad-free premium subscribers',
    icon: 'crown',
    agents: 4100,
    category: 'Disney+',
  },
  {
    id: 'disney-ad-supported',
    label: 'Ad-Supported Tier',
    description: 'Subscribers on the ad-supported plan',
    icon: 'tv',
    agents: 7200,
    category: 'Disney+',
  },
  {
    id: 'disney-marvel-star-wars',
    label: 'Marvel / Star Wars Fans',
    description: 'Subscribers driven by franchise content',
    icon: 'sparkles',
    agents: 4800,
    category: 'Disney+',
  },
  {
    id: 'disney-churn-risk',
    label: 'Churn Risk',
    description: 'Low-engagement subscribers at risk of cancelling',
    icon: 'trending-down',
    agents: 2900,
    category: 'Disney+',
  },
]

const BP_AUDIENCES: PickerAudience[] = [
  {
    id: 'bp-uk-drivers',
    label: 'UK Drivers',
    description: 'Regular fuel-buying drivers across the UK',
    icon: 'map-pin',
    agents: 8200,
    category: 'BP',
  },
  {
    id: 'bp-premium-fuel-buyers',
    label: 'Premium Fuel Buyers',
    description: 'Drivers who regularly choose premium or ultimate fuels',
    icon: 'crown',
    agents: 2600,
    category: 'BP',
  },
  {
    id: 'bp-fleet-managers',
    label: 'Fleet Managers',
    description: 'Business fleet decision-makers managing 10+ vehicles',
    icon: 'users',
    agents: 1200,
    category: 'BP',
  },
  {
    id: 'bp-ev-considerers',
    label: 'EV Considerers',
    description: 'Drivers considering switching to electric vehicles',
    icon: 'zap',
    agents: 3800,
    category: 'BP',
  },
  {
    id: 'bp-commuters',
    label: 'Daily Commuters',
    description: 'Drivers with 30+ mile daily commutes',
    icon: 'clock',
    agents: 5400,
    category: 'BP',
  },
  {
    id: 'bp-performance-drivers',
    label: 'Performance Car Drivers',
    description: 'Owners of performance or luxury vehicles',
    icon: 'sparkles',
    agents: 1800,
    category: 'BP',
  },
  {
    id: 'bp-f1-fans',
    label: 'F1 Fans',
    description: 'Formula 1 followers interested in motorsport partnerships',
    icon: 'eye',
    agents: 4100,
    category: 'BP',
  },
  {
    id: 'bp-young-drivers',
    label: 'Young Drivers (18–30)',
    description: 'First-time car owners and young motorists',
    icon: 'user-check',
    agents: 3200,
    category: 'BP',
  },
]

const MUBI_AUDIENCES: PickerAudience[] = [
  {
    id: 'mubi-basic-global',
    label: 'Global Basic Subscribers',
    description: 'Active MUBI Basic subscribers worldwide',
    icon: 'globe',
    agents: 2847,
    category: 'MUBI',
  },
  {
    id: 'mubi-premium-global',
    label: 'Global Premium (MUBI Go)',
    description: 'Premium subscribers with cinema credits',
    icon: 'crown',
    agents: 450,
    category: 'MUBI',
  },
  {
    id: 'mubi-us-subs',
    label: 'US Subscribers',
    description: 'MUBI subscribers in the United States',
    icon: 'map-pin',
    agents: 3156,
    category: 'MUBI',
  },
  {
    id: 'mubi-uk-subs',
    label: 'UK Subscribers',
    description: 'MUBI subscribers in the United Kingdom',
    icon: 'map-pin',
    agents: 1800,
    category: 'MUBI',
  },
  {
    id: 'mubi-london-cinema',
    label: 'London Cinema Lovers',
    description: 'MUBI Go users in London with cinema behaviour data',
    icon: 'monitor-play',
    agents: 420,
    category: 'MUBI',
  },
  {
    id: 'mubi-de',
    label: 'Germany Subscribers',
    description: 'MUBI subscribers in Germany',
    icon: 'map-pin',
    agents: 950,
    category: 'MUBI',
  },
  {
    id: 'mubi-mx',
    label: 'Mexico Subscribers',
    description: 'MUBI subscribers in Mexico',
    icon: 'map-pin',
    agents: 650,
    category: 'MUBI',
  },
  {
    id: 'mubi-br',
    label: 'Brazil Subscribers',
    description: 'MUBI subscribers in Brazil',
    icon: 'map-pin',
    agents: 550,
    category: 'MUBI',
  },
]

const PHILIPS_AUDIENCES: PickerAudience[] = [
  {
    id: 'philips-pain-sufferers',
    label: 'Chronic Pain Sufferers',
    description: 'Adults managing chronic or recurring pain conditions',
    icon: 'user-check',
    agents: 4800,
    category: 'Philips',
  },
  {
    id: 'philips-otc-buyers',
    label: 'OTC Pain Relief Buyers',
    description: 'Regular over-the-counter pain relief purchasers',
    icon: 'credit-card',
    agents: 6200,
    category: 'Philips',
  },
  {
    id: 'philips-wellness-seekers',
    label: 'Wellness Seekers',
    description: 'Health-conscious consumers exploring drug-free alternatives',
    icon: 'sparkles',
    agents: 3500,
    category: 'Philips',
  },
  {
    id: 'philips-active-lifestyles',
    label: 'Active Lifestyle',
    description: 'Sports and fitness enthusiasts managing recovery and pain',
    icon: 'zap',
    agents: 4100,
    category: 'Philips',
  },
  {
    id: 'philips-older-adults',
    label: 'Older Adults (55+)',
    description: 'Adults 55+ with joint, back, or mobility-related pain',
    icon: 'users',
    agents: 5600,
    category: 'Philips',
  },
  {
    id: 'philips-uk-healthcare',
    label: 'UK Healthcare Shoppers',
    description: 'UK consumers shopping in pharmacy and health retail',
    icon: 'map-pin',
    agents: 7400,
    category: 'Philips',
  },
]

const KING_AUDIENCES: PickerAudience[] = [
  {
    id: 'king-casual-mobile-gamers',
    label: 'Casual Mobile Gamers',
    description: 'Play puzzle or casual games on mobile daily',
    icon: 'smartphone',
    agents: 9200,
    category: 'King / Activision Blizzard',
  },
  {
    id: 'king-candy-crush-players',
    label: 'Candy Crush Players',
    description: 'Active Candy Crush Saga players across all variants',
    icon: 'sparkles',
    agents: 7800,
    category: 'King / Activision Blizzard',
  },
  {
    id: 'king-iap-spenders',
    label: 'In-App Purchasers',
    description: 'Players who have made in-app purchases in the last 90 days',
    icon: 'credit-card',
    agents: 3400,
    category: 'King / Activision Blizzard',
  },
  {
    id: 'king-lapsed-players',
    label: 'Lapsed Players',
    description: 'Former players who haven\'t played in 30+ days',
    icon: 'trending-down',
    agents: 5100,
    category: 'King / Activision Blizzard',
  },
  {
    id: 'king-social-gamers',
    label: 'Social Gamers',
    description: 'Players who connect with friends and share progress',
    icon: 'users',
    agents: 4200,
    category: 'King / Activision Blizzard',
  },
  {
    id: 'king-commute-players',
    label: 'Commute Players',
    description: 'Play primarily during commute or transit downtime',
    icon: 'clock',
    agents: 6100,
    category: 'King / Activision Blizzard',
  },
  {
    id: 'king-gen-x-women',
    label: 'Gen X Women Gamers',
    description: 'Women 40–58 who are regular casual game players',
    icon: 'user-check',
    agents: 4700,
    category: 'King / Activision Blizzard',
  },
]

/* ── Brand → audience mapping ── */
const BRAND_AUDIENCES: Record<string, PickerAudience[]> = {
  'Vodafone': VODAFONE_AUDIENCES,
  'Disney+': DISNEY_AUDIENCES,
  'BP': BP_AUDIENCES,
  'MUBI': MUBI_AUDIENCES,
  'Philips': PHILIPS_AUDIENCES,
  'King / Activision Blizzard': KING_AUDIENCES,
}

const ALL_ACCOUNT_AUDIENCES: PickerAudience[] = [
  ...VODAFONE_AUDIENCES,
  ...DISNEY_AUDIENCES,
  ...BP_AUDIENCES,
  ...MUBI_AUDIENCES,
  ...PHILIPS_AUDIENCES,
  ...KING_AUDIENCES,
]

/* ── All audiences (fallback when no brand is set) ── */
export const PICKER_AUDIENCES: PickerAudience[] = [
  ...ALL_ACCOUNT_AUDIENCES,
  ...ET_CORE_AUDIENCES,
]

/** Build the audience list filtered by brand */
function getAudiencesForBrand(brand?: string): PickerAudience[] {
  if (!brand) return PICKER_AUDIENCES
  const brandAudiences = BRAND_AUDIENCES[brand]
  if (!brandAudiences) return PICKER_AUDIENCES
  return [...brandAudiences, ...ET_CORE_AUDIENCES]
}

/* ── Icon resolver ── */
const ICON_MAP: Record<string, LucideIcon> = {
  'users': Users,
  'tv': Tv,
  'wifi': Wifi,
  'eye': Eye,
  'clock': Clock,
  'sparkles': Sparkles,
  'credit-card': CreditCard,
  'user-check': UserCheck,
  'smartphone': Smartphone,
  'trending-down': TrendingDown,
  'zap': Zap,
  'monitor-play': MonitorPlay,
  'globe': Globe,
  'crown': Crown,
  'map-pin': MapPin,
}

/* ── Component ── */
interface AudiencePickerProps {
  open: boolean
  onClose: () => void
  onSelect: (audience: PickerAudience) => void
  /** Current brand — filters to show only this brand's audiences + ET Core */
  brand?: string
  className?: string
}

export const AudiencePicker: React.FC<AudiencePickerProps> = ({
  open,
  onClose,
  onSelect,
  brand,
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

  // Resolve audiences for the current brand
  const brandAudiences = useMemo(() => getAudiencesForBrand(brand), [brand])

  // Filter audiences by search
  const filtered = useMemo(() => {
    if (!search.trim()) return brandAudiences
    const q = search.toLowerCase()
    return brandAudiences.filter(
      a =>
        a.label.toLowerCase().includes(q) ||
        a.description.toLowerCase().includes(q) ||
        a.category.toLowerCase().includes(q),
    )
  }, [search, brandAudiences])

  // Group filtered results by category
  const grouped = useMemo(() => {
    const groups: { category: string; audiences: PickerAudience[] }[] = []
    const seen = new Set<string>()

    for (const audience of filtered) {
      const cat = audience.category
      if (!seen.has(cat)) {
        seen.add(cat)
        groups.push({ category: cat, audiences: [] })
      }
      groups.find(g => g.category === cat)!.audiences.push(audience)
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
              placeholder="Search audiences"
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

        {/* Scrollable audience list */}
        <div className="flex-1 overflow-y-auto px-2 pb-3">
          {filtered.length === 0 ? (
            <div className="px-4 py-8 text-sm text-muted-foreground text-center">
              No audiences match &ldquo;{search}&rdquo;
            </div>
          ) : (
            grouped.map(group => (
              <div key={group.category}>
                {/* Category header */}
                {(!search.trim() || grouped.length > 1) && (
                  <div className="px-3 pt-3 pb-1.5">
                    <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground/70">
                      {group.category}
                    </span>
                  </div>
                )}

                {group.audiences.map(audience => {
                  const Icon = ICON_MAP[audience.icon] || Users
                  return (
                    <button
                      key={audience.id}
                      onClick={() => {
                        onSelect(audience)
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
                          {audience.label}
                        </div>
                        <div className="text-xs text-muted-foreground truncate leading-tight mt-0.5">
                          {audience.description}
                        </div>
                      </div>
                      <div className="shrink-0 text-xs text-muted-foreground tabular-nums">
                        {audience.agents.toLocaleString()}
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

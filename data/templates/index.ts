import type { SurveyQuestion } from '@/types'

// ── Template config type ──

export interface TemplateConfig {
  key: string
  label: string
  icon: string // lucide icon name — resolved to component in TemplatesPanel
  questions: Omit<SurveyQuestion, 'id' | 'required'>[]
}

// ── Per-account template imports ──

import { mubiTemplates } from './mubi'
import { vodafoneTemplates } from './vodafone'
import { disneyTemplates } from './disney'
import { bpTemplates } from './bp'
import { philipsTemplates } from './philips'
import { kingTemplates } from './king'
import { canvaTemplates } from './canva'
import { wonderhoodTemplates } from './wonderhood'
import { commonTemplates } from './common'

const ACCOUNT_TEMPLATES: Record<string, TemplateConfig[]> = {
  mubi: mubiTemplates,
  vodafone: vodafoneTemplates,
  disney: disneyTemplates,
  bp: bpTemplates,
  philips: philipsTemplates,
  king: kingTemplates,
  canva: canvaTemplates,
  wonderhood: wonderhoodTemplates,
}

/** Get org-specific templates for a given account ID. Returns empty array if unknown. */
export function getOrgTemplatesForAccount(accountId: string): TemplateConfig[] {
  return ACCOUNT_TEMPLATES[accountId] ?? []
}

export { commonTemplates }

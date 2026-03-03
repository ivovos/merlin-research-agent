import { vodafoneProject } from './vodafone'
import { vodafoneBrandTrackerProject } from './vodafoneBrandTracker'
import { bpProject } from './bp'
import { bpEvChargingProject } from './bpEvCharging'
import { bpBrandPerceptionProject } from './bpBrandPerception'
import { disneyProject } from './disney'
import { disneyTrailerProject } from './disneyTrailer'
import { disneyContentDiscoveryProject } from './disneyContentDiscovery'
import { mubiChurnProject } from './mubiChurn'
import { mubiCurationProject } from './mubiCuration'
import { mubiGoExpansionProject } from './mubiGoExpansion'
import type { SurveyProject } from '@/types'

export const surveyProjects: SurveyProject[] = [
  vodafoneProject,
  vodafoneBrandTrackerProject,
  bpProject,
  bpEvChargingProject,
  bpBrandPerceptionProject,
  disneyProject,
  disneyTrailerProject,
  disneyContentDiscoveryProject,
  mubiChurnProject,
  mubiCurationProject,
  mubiGoExpansionProject,
]

export {
  // Vodafone
  vodafoneProject,
  vodafoneBrandTrackerProject,
  // BP
  bpProject,
  bpEvChargingProject,
  bpBrandPerceptionProject,
  // Disney+
  disneyProject,
  disneyTrailerProject,
  disneyContentDiscoveryProject,
  // MUBI
  mubiChurnProject,
  mubiCurationProject,
  mubiGoExpansionProject,
}

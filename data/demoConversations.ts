import type { ChatMessage, ProjectState } from '@/types'
import {
  vodafoneProject,
  bpProject,
  disneyProject,
  philipsProject,
  candyCrushProject,
} from './projects'
import type { SurveyProject } from '@/types'

// ── Helpers ──

let msgCounter = 0
function msgId(prefix: string): string {
  return `${prefix}_${++msgCounter}`
}

function ts(daysAgo: number, hoursOffset = 0): number {
  return Date.now() - daysAgo * 86_400_000 + hoursOffset * 3_600_000
}

function projectFromSurveyProject(sp: SurveyProject, messages: ChatMessage[]): ProjectState {
  return {
    id: sp.id,
    name: sp.name,
    brand: sp.brand,
    surveyType: sp.surveyType,
    description: sp.description,
    messages,
    studies: sp.surveys,
    stimuli: sp.stimuli,
    audiences: sp.audienceIds,
    attachments: [],
    createdAt: sp.createdAt,
    updatedAt: sp.updatedAt,
  }
}

// ── Vodafone ──

function buildVodafoneConversation(): ChatMessage[] {
  const survey = vodafoneProject.surveys[0]
  return [
    {
      id: msgId('vod'), type: 'user', timestamp: ts(7),
      text: "Here's the brief for the Vodafone broadband proposition testing. We need to evaluate 10 service propositions across two audience segments.",
      attachments: [{ id: 'att_vod_1', name: 'Vodafone_Broadband_Brief.pdf', type: 'pdf', url: '/assets/stimulus/vodafone/Report_01_Cover.png' }],
    },
    {
      id: msgId('vod'), type: 'ai', timestamp: ts(7, 0.1),
      text: "I can see this is a proposition testing study for Vodafone Broadband. You have 10 service concepts to evaluate — ranging from 'Market-leading WiFi' and 'Speed Boost' to service-oriented propositions like 'Home Care' and 'Snap to Fix'.\n\nThe key KPIs are comprehension, appeal, relevance, newness, excitement, switching intent, and retention. Two segments to compare: general broadband decision-makers and tech-savvy families.\n\nShall I set up the concept test, or would you like to configure it manually using the survey builder?",
    },
    {
      id: msgId('vod'), type: 'user', timestamp: ts(6, 2),
      text: "Let's test all 10 propositions with both segments. Use sequential monadic design.",
    },
    {
      id: msgId('vod'), type: 'system', timestamp: ts(6, 2.1),
      text: 'Study launched: Broadband Proposition Concept Test — 10 concepts, 7 KPIs, 2 segments, n=800',
    },
    {
      id: msgId('vod'), type: 'findings', timestamp: ts(6, 2.2),
      studyId: survey.id,
      studyName: survey.name,
      typeBadge: 'Concept Testing',
      findings: survey.findings ?? [],
      stimuli: vodafoneProject.stimuli,
      respondents: survey.sampleSize,
    },
    {
      id: msgId('vod'), type: 'user', timestamp: ts(5),
      text: 'Which propositions should we take forward to the next phase?',
    },
    {
      id: msgId('vod'), type: 'ai', timestamp: ts(5, 0.1),
      text: "Based on the data, three propositions stand out clearly:\n\n**Market-leading WiFi** scores highest on appeal and has the strongest switching intent among tech-savvy families. It also leads on relevance.\n\n**Speed Boost** generates the most excitement and has strong newness scores. Its switching intent is solid across both segments.\n\n**Service Promise** has the highest comprehension and strong retention metrics. It's the easiest to understand and most credible, though less exciting.\n\nThe gap between tech-savvy families and general broadband users is largest for Market-leading WiFi, suggesting it has particular pull with the premium segment.\n\nI'd recommend taking these three forward into a second phase with developed creative, and potentially combining the Service Promise messaging with the Market-leading WiFi or Speed Boost hardware proposition.",
    },
  ]
}

// ── BP ──

function buildBpConversation(): ChatMessage[] {
  const survey = bpProject.surveys[0]
  return [
    {
      id: msgId('bp'), type: 'user', timestamp: ts(14),
      text: "We're launching a new OOH campaign for BP Ultimate fuels, tied to their F1 partnership with Audi. Need to pre-test 4 creative variants before they go live.",
      attachments: [{ id: 'att_bp_1', name: 'BP_360_Campaign_Brief.pdf', type: 'pdf' }],
    },
    {
      id: msgId('bp'), type: 'ai', timestamp: ts(14, 0.1),
      text: "I can see the brief. You have 4 OOH creative variants across two routes:\n\n**Route 1 — 'From the Racetrack to Everyone':** Two variants translating F1 performance to everyday driving.\n**Route 2 — 'Best of Both Worlds':** Two variants combining F1 expertise with everyday benefits.\n\nI'll set up a Link+ style ad pre-test measuring stop & look, branding, persuasion, message stickiness, and affinity. Monadic design so each respondent sees one creative.\n\nReady to launch?",
    },
    {
      id: msgId('bp'), type: 'user', timestamp: ts(13, 4),
      text: 'Yes, go ahead. Make sure we get percentile benchmarks against market norms.',
    },
    {
      id: msgId('bp'), type: 'system', timestamp: ts(13, 4.1),
      text: 'Study launched: OOH Link+ Ad Pre-Test — 4 variants, 14 metrics, n=1,800',
    },
    {
      id: msgId('bp'), type: 'findings', timestamp: ts(13, 4.2),
      studyId: survey.id,
      studyName: survey.name,
      typeBadge: 'Creative Testing',
      findings: survey.findings ?? [],
      stimuli: bpProject.stimuli,
      respondents: survey.sampleSize,
    },
    {
      id: msgId('bp'), type: 'user', timestamp: ts(12),
      text: 'How does Route 1 compare to Route 2 overall?',
    },
    {
      id: msgId('bp'), type: 'ai', timestamp: ts(12, 0.1),
      text: "Route 1 ('Racetrack to Everyone') outperforms Route 2 ('Best of Both Worlds') on most key metrics.\n\nRoute 1 has stronger stopping power and higher likeability scores. The F1-to-everyday narrative resonates more clearly — respondents find it more involving and interesting.\n\nRoute 2 has slightly better message stickiness on specific benefit claims, but lower overall persuasion. The 'Best of Both Worlds' framing feels less distinctive.\n\nMy recommendation: Go with Route 1 as the primary campaign. The 'Gabriel & Gabi' variant (Route 1 Variant B) performs best on branding and affinity. Consider using Route 2's message stickiness insights to refine Route 1's supporting copy.",
    },
  ]
}

// ── Disney ──

function buildDisneyConversation(): ChatMessage[] {
  const survey = disneyProject.surveys[0]
  return [
    {
      id: msgId('dis'), type: 'user', timestamp: ts(21),
      text: "Disney+ needs to test key art options for 'Alice & Steve', a new comedy series. Three different visual approaches — character focus, ensemble, and stylised.",
    },
    {
      id: msgId('dis'), type: 'ai', timestamp: ts(21, 0.1),
      text: "I'll set up a monadic key art test for the three versions. We'll measure likeability, intent to view, talent recognition, perceived plot, service attribution, and collect attribute associations for each.\n\nThis will help identify which artwork best communicates the show's tone and drives tune-in intent.",
    },
    {
      id: msgId('dis'), type: 'user', timestamp: ts(20, 3),
      text: 'Perfect. Run it with a broad streaming audience.',
    },
    {
      id: msgId('dis'), type: 'system', timestamp: ts(20, 3.1),
      text: 'Study launched: Key Art Test — 3 versions, 14 metrics, monadic design',
    },
    {
      id: msgId('dis'), type: 'findings', timestamp: ts(20, 3.2),
      studyId: survey.id,
      studyName: survey.name,
      typeBadge: 'Creative Testing',
      findings: survey.findings ?? [],
      stimuli: disneyProject.stimuli,
      respondents: survey.sampleSize,
    },
  ]
}

// ── Philips ──

function buildPhilipsConversation(): ChatMessage[] {
  const survey = philipsProject.surveys[0]
  return [
    {
      id: msgId('phi'), type: 'user', timestamp: ts(30),
      text: 'We have a new pain relief device concept from Philips. Need to test relevance, distinctiveness, purchase intent, and brand fit. First without pricing, then with.',
    },
    {
      id: msgId('phi'), type: 'ai', timestamp: ts(30, 0.1),
      text: "I'll set up a two-phase concept test: first evaluating the concept on its own merits (relevance, distinctiveness, advantages, unpriced purchase intent), then introducing the price point to measure value perception and priced purchase intent.\n\nWe'll benchmark against category norms for medical devices.",
    },
    {
      id: msgId('phi'), type: 'system', timestamp: ts(29, 2),
      text: 'Study launched: Philips Pain Relief Concept Test — 7 KPIs, unpriced + priced phases',
    },
    {
      id: msgId('phi'), type: 'findings', timestamp: ts(29, 2.1),
      studyId: survey.id,
      studyName: survey.name,
      typeBadge: 'Concept Testing',
      findings: survey.findings ?? [],
      stimuli: philipsProject.stimuli,
      respondents: survey.sampleSize,
    },
  ]
}

// ── Candy Crush ──

function buildCandyCrushConversation(): ChatMessage[] {
  const survey = candyCrushProject.surveys[0]
  return [
    {
      id: msgId('cc'), type: 'user', timestamp: ts(10),
      text: "King wants to explore IP partnership opportunities for Candy Crush. We need to understand brand perceptions across current players, lapsed players, and non-players, then map potential IP fit.",
    },
    {
      id: msgId('cc'), type: 'ai', timestamp: ts(10, 0.1),
      text: "I'll design an audience exploration study using MaxDiff methodology for preference ranking, combined with IP perception and partnership fit measurement.\n\nThree segments: current players (n=1,000), lapsed players (n=1,000), and non-players (n=1,000). This will reveal how each group perceives Candy Crush and which partnership types would resonate.",
    },
    {
      id: msgId('cc'), type: 'system', timestamp: ts(9, 1),
      text: 'Study launched: IP Partnership Fit Study — 3 segments, MaxDiff + perception data',
    },
    {
      id: msgId('cc'), type: 'findings', timestamp: ts(9, 1.1),
      studyId: survey.id,
      studyName: survey.name,
      typeBadge: 'Audience Exploration',
      findings: survey.findings ?? [],
      stimuli: candyCrushProject.stimuli,
      respondents: survey.sampleSize,
    },
  ]
}

// ── Export ──

export function getAllDemoProjects(): ProjectState[] {
  return [
    projectFromSurveyProject(vodafoneProject, buildVodafoneConversation()),
    projectFromSurveyProject(bpProject, buildBpConversation()),
    projectFromSurveyProject(disneyProject, buildDisneyConversation()),
    projectFromSurveyProject(philipsProject, buildPhilipsConversation()),
    projectFromSurveyProject(candyCrushProject, buildCandyCrushConversation()),
  ]
}

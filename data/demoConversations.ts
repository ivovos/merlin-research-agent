import type { ChatMessage, ProjectState } from '@/types'
import {
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

// ═══════════════════════════════════════════════════════════════
// VODAFONE
// ═══════════════════════════════════════════════════════════════

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

function buildVodafoneBrandTrackerConversation(): ChatMessage[] {
  const survey = vodafoneBrandTrackerProject.surveys[0]
  return [
    {
      id: msgId('vfbt'), type: 'user', timestamp: ts(35),
      text: "We need to run the Q4 brand health tracker for Vodafone. Same methodology as last quarter — tracking against Sky, BT, Three, and Virgin Media. n=2,000 UK broadband decision makers.",
    },
    {
      id: msgId('vfbt'), type: 'ai', timestamp: ts(35, 0.1),
      text: "I'll set up the Q4 tracker with the standard battery: spontaneous and prompted awareness, consideration, brand image attributes, NPS, and value for money. Same panel provider and quotas as Q3 for comparability.\n\nShall I include the new 'digital trust' attribute you piloted last quarter?",
    },
    {
      id: msgId('vfbt'), type: 'user', timestamp: ts(34, 3),
      text: "Yes, keep digital trust in. Let's run it.",
    },
    {
      id: msgId('vfbt'), type: 'system', timestamp: ts(34, 3.1),
      text: 'Study launched: Q4 Brand Health Tracker — 8 KPIs, 5 competitor brands, n=2,000',
    },
    {
      id: msgId('vfbt'), type: 'findings', timestamp: ts(34, 3.2),
      studyId: survey.id,
      studyName: survey.name,
      typeBadge: 'Audience Exploration',
      findings: survey.findings ?? [],
      stimuli: vodafoneBrandTrackerProject.stimuli,
      respondents: survey.sampleSize,
    },
    {
      id: msgId('vfbt'), type: 'user', timestamp: ts(33),
      text: 'How are we doing vs Sky this quarter?',
    },
    {
      id: msgId('vfbt'), type: 'ai', timestamp: ts(33, 0.1),
      text: "The gap with Sky has narrowed on several key metrics this quarter.\n\n**Consideration** is up 3pp to 38%, while Sky dropped 1pp to 52%. The gap is closing but Sky still leads.\n\n**NPS** improved from +12 to +15, driven by the 'reliable connection' perception gains from the new WiFi hub launch.\n\n**Value for money** is where Vodafone now leads — 44% vs Sky's 31%. This is a 5pp improvement quarter-on-quarter.\n\nThe main challenge remains **spontaneous awareness**, where Sky (68%) and BT (55%) still dominate. Vodafone sits at 29%, unchanged from Q3. The OOH and digital campaigns may take another quarter to show awareness impact.",
    },
  ]
}

// ═══════════════════════════════════════════════════════════════
// BP
// ═══════════════════════════════════════════════════════════════

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

function buildBpEvChargingConversation(): ChatMessage[] {
  const survey = bpEvChargingProject.surveys[0]
  return [
    {
      id: msgId('bpev'), type: 'user', timestamp: ts(45),
      text: "BP Pulse wants to concept-test 3 new app features for the EV charging experience: smart scheduling, group charging sessions, and loyalty rewards integration. Sequential monadic across n=1,200 EV drivers.",
    },
    {
      id: msgId('bpev'), type: 'ai', timestamp: ts(45, 0.1),
      text: "I'll set up a concept test with the three feature concepts presented sequentially. Each respondent sees all three in randomised order.\n\nKPIs: appeal, relevance, uniqueness, willingness to pay, purchase intent, and clarity. Benchmarked against EV app feature norms.\n\nAudience: current EV owners and those planning to purchase within 12 months. UK nat rep for region.",
    },
    {
      id: msgId('bpev'), type: 'system', timestamp: ts(44, 2),
      text: 'Study launched: BP Pulse Feature Concept Test — 3 concepts, 8 KPIs, n=1,200',
    },
    {
      id: msgId('bpev'), type: 'findings', timestamp: ts(44, 2.1),
      studyId: survey.id,
      studyName: survey.name,
      typeBadge: 'Concept Testing',
      findings: survey.findings ?? [],
      stimuli: bpEvChargingProject.stimuli,
      respondents: survey.sampleSize,
    },
    {
      id: msgId('bpev'), type: 'user', timestamp: ts(43),
      text: 'Which feature should we prioritise for development?',
    },
    {
      id: msgId('bpev'), type: 'ai', timestamp: ts(43, 0.1),
      text: "**Smart Scheduling** is the clear winner — it leads on appeal (74% T2B), relevance (71%), and has the highest willingness to pay. EV drivers see it as solving a real pain point around off-peak charging optimisation.\n\n**Loyalty Rewards** came second on appeal but scored highest on uniqueness. It could be a strong retention play but is less of a priority for acquisition.\n\n**Group Charging** has niche appeal — fleet managers love it but individual users found it less relevant. Consider positioning it as a B2B feature rather than consumer-facing.\n\nMy recommendation: Prioritise Smart Scheduling for the next release, with Loyalty Rewards in the following sprint.",
    },
  ]
}

function buildBpBrandPerceptionConversation(): ChatMessage[] {
  const survey = bpBrandPerceptionProject.surveys[0]
  return [
    {
      id: msgId('bpbr'), type: 'user', timestamp: ts(60),
      text: "We need to understand how BP's brand perception differs between EV adopters and traditional fuel users. Specifically around trust, environmental commitment, and innovation. n=1,000 per segment.",
    },
    {
      id: msgId('bpbr'), type: 'ai', timestamp: ts(60, 0.1),
      text: "I'll run a parallel-sample brand perception study. Two matched groups:\n\n**Segment A:** EV owners and committed EV intenders (n=1,000)\n**Segment B:** Traditional fuel users with no EV plans (n=1,000)\n\nBattery covers trust, environmental commitment, innovation perception, brand warmth, and energy transition credibility. Both segments assessed on the same scales for direct comparison.",
    },
    {
      id: msgId('bpbr'), type: 'system', timestamp: ts(59, 1),
      text: 'Study launched: BP Brand Perception — 2 segments, 7 KPIs, n=2,000',
    },
    {
      id: msgId('bpbr'), type: 'findings', timestamp: ts(59, 1.1),
      studyId: survey.id,
      studyName: survey.name,
      typeBadge: 'Audience Exploration',
      findings: survey.findings ?? [],
      stimuli: bpBrandPerceptionProject.stimuli,
      respondents: survey.sampleSize,
    },
  ]
}

// ═══════════════════════════════════════════════════════════════
// DISNEY+
// ═══════════════════════════════════════════════════════════════

function buildDisneyConversation(): ChatMessage[] {
  const survey = disneyProject.surveys[0]
  return [
    {
      id: msgId('dis'), type: 'user', timestamp: ts(21),
      text: "Disney+ needs to test key art for 'Alice & Steve' — from the creators of Baby Reindeer. Three poster routes: two split-screen bed concepts (leads only vs full ensemble) and a dinner table scene. Need to know which best communicates the show's tone and drives viewing intent.",
      attachments: [
        { id: 'att_dis_v1', name: 'Option 1 — Split-Screen Leads.png', type: 'image', url: '/assets/stimulus/disney/v1_character.png', thumbnailUrl: '/assets/stimulus/disney/v1_character.png' },
        { id: 'att_dis_v2', name: 'Option 2 — Ensemble Split-Screen.png', type: 'image', url: '/assets/stimulus/disney/v2_ensemble.png', thumbnailUrl: '/assets/stimulus/disney/v2_ensemble.png' },
        { id: 'att_dis_v3', name: 'Option 3 — Dinner Table.png', type: 'image', url: '/assets/stimulus/disney/v3_stylised.png', thumbnailUrl: '/assets/stimulus/disney/v3_stylised.png' },
      ],
    },
    {
      id: msgId('dis'), type: 'ai', timestamp: ts(21, 0.1),
      text: "I'll set up a monadic key art test across the three options. Each will be shown to n=150 UK adults (must subscribe to at least one streaming service). We'll measure likeability, viewing intent, talent recognition, genre perception, attribute associations, service attribution, and post-synopsis preference.\n\nFieldwork: 5 days via Attest. Results benchmarked against UK scripted average.",
    },
    {
      id: msgId('dis'), type: 'user', timestamp: ts(20, 3),
      text: 'Perfect. Run it nationally — nat rep for age, gender and region.',
    },
    {
      id: msgId('dis'), type: 'system', timestamp: ts(20, 3.1),
      text: 'Study launched: Key Art Test — 3 versions, n=150 per asset, monadic design, UK nat rep',
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

function buildDisneyTrailerConversation(): ChatMessage[] {
  const survey = disneyTrailerProject.surveys[0]
  return [
    {
      id: msgId('distr'), type: 'user', timestamp: ts(28),
      text: "We have two trailer cuts for Andor Season 2 — a 30-second action-focused cut and a 60-second character-driven version. Need to A/B test them to decide which to push on social and pre-roll. Monadic design, n=300 per cut.",
    },
    {
      id: msgId('distr'), type: 'ai', timestamp: ts(28, 0.1),
      text: "I'll set up a monadic A/B trailer test. Each respondent watches one cut and responds to the same battery: emotional impact (second-by-second dial), overall likeability, viewing intent, brand attribution, share intent, and genre perception.\n\nAudience: UK adults 18-54, streaming subscribers, with a boost for Star Wars fans (n=100 per cell). Total n=600.",
    },
    {
      id: msgId('distr'), type: 'user', timestamp: ts(27, 2),
      text: "Go for it. Make sure we capture the Star Wars fan vs general audience split.",
    },
    {
      id: msgId('distr'), type: 'system', timestamp: ts(27, 2.1),
      text: 'Study launched: Andor S2 Trailer Cut Test — 2 cuts, monadic A/B, n=600',
    },
    {
      id: msgId('distr'), type: 'findings', timestamp: ts(27, 2.2),
      studyId: survey.id,
      studyName: survey.name,
      typeBadge: 'Creative Testing',
      findings: survey.findings ?? [],
      stimuli: disneyTrailerProject.stimuli,
      respondents: survey.sampleSize,
    },
    {
      id: msgId('distr'), type: 'user', timestamp: ts(26),
      text: 'Which cut should we go with for the social campaign?',
    },
    {
      id: msgId('distr'), type: 'ai', timestamp: ts(26, 0.1),
      text: "The 60-second cut wins on almost every metric.\n\n**Viewing intent** is 12pp higher for the 60s version (78% vs 66%). The character-driven opening gives viewers a reason to care before the action kicks in.\n\n**Share intent** is also significantly higher for 60s (41% vs 28%). People want to share trailers that made them feel something, and the emotional beats in the longer cut deliver that.\n\nThe only metric where the 30s cut wins is **brand attribution** — the Disney+ logo has more relative screen time. But this is a minor advantage.\n\nMy recommendation: Lead with the 60s cut on YouTube and social pre-roll. Use the 30s cut for paid bumper ads where attention spans are shorter.",
    },
  ]
}

function buildDisneyContentDiscoveryConversation(): ChatMessage[] {
  const survey = disneyContentDiscoveryProject.surveys[0]
  return [
    {
      id: msgId('discd'), type: 'user', timestamp: ts(50),
      text: "We're seeing engagement plateaus on Disney+. Users watch one or two tentpoles then disengage. Need to understand content discovery patterns and what barriers prevent deeper catalogue exploration. UK and US audiences.",
    },
    {
      id: msgId('discd'), type: 'ai', timestamp: ts(50, 0.1),
      text: "I'll design an audience exploration study covering discovery methods, engagement barriers, and feature preferences. Two parallel samples: UK (n=600) and US (n=600) streaming subscribers.\n\nThe study will map how users currently find content, what stops them watching more, and which potential features would increase engagement — personalised watchlists, social recommendations, curated collections, etc.",
    },
    {
      id: msgId('discd'), type: 'system', timestamp: ts(49, 1),
      text: 'Study launched: Content Discovery & Engagement Barriers — UK + US, n=1,200',
    },
    {
      id: msgId('discd'), type: 'findings', timestamp: ts(49, 1.1),
      studyId: survey.id,
      studyName: survey.name,
      typeBadge: 'Audience Exploration',
      findings: survey.findings ?? [],
      stimuli: disneyContentDiscoveryProject.stimuli,
      respondents: survey.sampleSize,
    },
  ]
}

// ═══════════════════════════════════════════════════════════════
// MUBI
// ═══════════════════════════════════════════════════════════════

function buildMubiChurnConversation(): ChatMessage[] {
  const survey = mubiChurnProject.surveys[0]
  return [
    {
      id: msgId('mch'), type: 'user', timestamp: ts(55),
      text: "Churn rate spiked last quarter. We need to understand why MUBI subscribers are cancelling and what would bring them back. Focus on lapsed and at-risk subscribers — n=1,200.",
    },
    {
      id: msgId('mch'), type: 'ai', timestamp: ts(55, 0.1),
      text: "I'll set up a cancellation driver analysis. Targeting three sub-segments: recently cancelled (last 90 days), considering cancellation, and long-tenure subscribers (12+ months).\n\nKey areas: cancellation reasons, content satisfaction, price sensitivity, competitive overlap (Netflix, Prime, Criterion Channel), feature valuation (MUBI Go, curated collections), and win-back offer testing.\n\nThis will give us both the 'why they leave' and the 'what would keep them' picture.",
    },
    {
      id: msgId('mch'), type: 'user', timestamp: ts(54, 2),
      text: "Perfect. Make sure we include the annual plan discount as a win-back test.",
    },
    {
      id: msgId('mch'), type: 'system', timestamp: ts(54, 2.1),
      text: 'Study launched: Churn Prevention — Cancellation Driver Analysis — 8 KPIs, 3 sub-segments, n=1,200',
    },
    {
      id: msgId('mch'), type: 'findings', timestamp: ts(54, 2.2),
      studyId: survey.id,
      studyName: survey.name,
      typeBadge: 'Audience Exploration',
      findings: survey.findings ?? [],
      stimuli: mubiChurnProject.stimuli,
      respondents: survey.sampleSize,
    },
    {
      id: msgId('mch'), type: 'user', timestamp: ts(53),
      text: "What's the single biggest lever we have for retention?",
    },
    {
      id: msgId('mch'), type: 'ai', timestamp: ts(53, 0.1),
      text: "**Content freshness** is the biggest single factor. 'Ran out of things to watch' was the #1 cancellation reason at 47%, and it's 2x more common than the next driver (price).\n\nThe good news is that this is more about perception than reality — MUBI adds 2-3 films weekly, but subscribers don't feel that. The 'one film per day' rotating model actually creates the impression of scarcity.\n\n**Actionable recommendation:** Better communicate the content pipeline. A 'coming soon' feature, personalised new-arrival notifications, and a monthly 'what's new' email could shift this perception without changing the actual content strategy.\n\nThe 30% annual plan discount is also promising — 61% of at-risk subscribers found it appealing. This could be an effective save offer at the point of cancellation.",
    },
  ]
}

function buildMubiCurationConversation(): ChatMessage[] {
  const survey = mubiCurationProject.surveys[0]
  return [
    {
      id: msgId('mcur'), type: 'user', timestamp: ts(40),
      text: "We're redesigning the MUBI homepage experience. Need to test 4 different curation approaches — algorithmic recommendations, editorial picks, community-driven, and director spotlight — to see which resonates best with our subscribers.",
    },
    {
      id: msgId('mcur'), type: 'ai', timestamp: ts(40, 0.1),
      text: "I'll run a sequential monadic concept test with the four approaches. Each subscriber sees all four concepts in randomised order and rates them on appeal, trust, discoverability, engagement likelihood, uniqueness, and brand fit.\n\nTwo segments: global subscribers (n=600) and US market specifically (n=350) since the US is the highest-growth market.\n\nTotal n=950.",
    },
    {
      id: msgId('mcur'), type: 'system', timestamp: ts(39, 1),
      text: 'Study launched: Content Curation Concept Test — 4 concepts, sequential monadic, n=950',
    },
    {
      id: msgId('mcur'), type: 'findings', timestamp: ts(39, 1.1),
      studyId: survey.id,
      studyName: survey.name,
      typeBadge: 'Concept Testing',
      findings: survey.findings ?? [],
      stimuli: mubiCurationProject.stimuli,
      respondents: survey.sampleSize,
    },
    {
      id: msgId('mcur'), type: 'user', timestamp: ts(38),
      text: 'Should we go with editorial picks as the primary experience?',
    },
    {
      id: msgId('mcur'), type: 'ai', timestamp: ts(38, 0.1),
      text: "**Editorial Picks** is the strongest overall — 82% appeal, highest trust (77%), and best brand fit. It aligns perfectly with MUBI's identity as a curated platform.\n\nBut there's a nuance: **Director Spotlight** scored highest on uniqueness (81%) and discovery (85%). In the US specifically, it was ranked #1 overall.\n\nMy recommendation: Lead with Editorial Picks as the default homepage experience, but give Director Spotlight prominent placement as a monthly feature. This combines the trusted editorial voice with the standout discovery mechanic.\n\nAvoid making Algorithmic the primary experience — it scored lowest on trust (54%) and was seen as 'just another Netflix', which undermines MUBI's positioning.",
    },
  ]
}

function buildMubiGoExpansionConversation(): ChatMessage[] {
  const survey = mubiGoExpansionProject.surveys[0]
  return [
    {
      id: msgId('mgo'), type: 'user', timestamp: ts(48),
      text: "MUBI Go is currently London-only. We want to expand to other UK cities and potentially Europe. Need to prioritise which cities to launch next based on demand, willingness to pay, and cinema-going frequency.",
    },
    {
      id: msgId('mgo'), type: 'ai', timestamp: ts(48, 0.1),
      text: "I'll survey MUBI subscribers across potential expansion cities: Manchester, Edinburgh, Bristol, Birmingham, Leeds in the UK, plus Berlin, Paris, and Amsterdam in Europe.\n\nKey metrics: cinema frequency, MUBI Go awareness, willingness to pay a premium for the Go benefit, and feature preferences. n=1,400 across all target cities.\n\nThis will produce a clear priority ranking for the expansion roadmap.",
    },
    {
      id: msgId('mgo'), type: 'system', timestamp: ts(47, 1),
      text: 'Study launched: MUBI Go City Expansion Priority — 8 cities, n=1,400',
    },
    {
      id: msgId('mgo'), type: 'findings', timestamp: ts(47, 1.1),
      studyId: survey.id,
      studyName: survey.name,
      typeBadge: 'Concept Testing',
      findings: survey.findings ?? [],
      stimuli: mubiGoExpansionProject.stimuli,
      respondents: survey.sampleSize,
    },
    {
      id: msgId('mgo'), type: 'user', timestamp: ts(46),
      text: 'Which cities should we prioritise?',
    },
    {
      id: msgId('mgo'), type: 'ai', timestamp: ts(46, 0.1),
      text: "**Manchester** and **Berlin** are the clear top priorities.\n\nManchester leads on demand (62% would use MUBI Go) and has the highest cinema frequency among MUBI subscribers outside London. Berlin follows closely at 58% — its independent cinema culture aligns perfectly with MUBI's brand.\n\n**Edinburgh** and **Amsterdam** form a strong second tier. Both have high willingness to pay and active arthouse cinema scenes.\n\nSurprisingly, **Paris** ranked lower than expected — high cinema frequency but lower MUBI Go awareness and more price sensitivity. Might need a different launch strategy there.\n\n71% of respondents said MUBI Go availability would influence their subscription decision — this is a powerful retention and acquisition tool.",
    },
  ]
}

// ═══════════════════════════════════════════════════════════════
// Per-Account Registry
// ═══════════════════════════════════════════════════════════════

type ProjectBuilder = () => ProjectState[]

const DEMO_PROJECT_BUILDERS: Record<string, ProjectBuilder> = {
  vodafone: () => [
    projectFromSurveyProject(vodafoneProject, buildVodafoneConversation()),
    projectFromSurveyProject(vodafoneBrandTrackerProject, buildVodafoneBrandTrackerConversation()),
  ],
  bp: () => [
    projectFromSurveyProject(bpProject, buildBpConversation()),
    projectFromSurveyProject(bpEvChargingProject, buildBpEvChargingConversation()),
    projectFromSurveyProject(bpBrandPerceptionProject, buildBpBrandPerceptionConversation()),
  ],
  disney: () => [
    projectFromSurveyProject(disneyProject, buildDisneyConversation()),
    projectFromSurveyProject(disneyTrailerProject, buildDisneyTrailerConversation()),
    projectFromSurveyProject(disneyContentDiscoveryProject, buildDisneyContentDiscoveryConversation()),
  ],
  mubi: () => [
    projectFromSurveyProject(mubiChurnProject, buildMubiChurnConversation()),
    projectFromSurveyProject(mubiCurationProject, buildMubiCurationConversation()),
    projectFromSurveyProject(mubiGoExpansionProject, buildMubiGoExpansionConversation()),
  ],
}

/** Get demo projects for a specific account */
export function getDemoProjectsForAccount(accountId: string): ProjectState[] {
  const builder = DEMO_PROJECT_BUILDERS[accountId]
  return builder ? builder() : []
}

/** Get ALL demo projects across all accounts (used by ET-Test) */
export function getAllDemoProjects(): ProjectState[] {
  return Object.values(DEMO_PROJECT_BUILDERS).flatMap(builder => builder())
}

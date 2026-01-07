// Mock data for Merlin audience management

export interface Segment {
  id: string;
  name: string;
  count: number;
  percentage: number;
}

export interface Audience {
  id: string;
  name: string;
  icon: string; // 2-letter abbreviation
  logo?: string; // Optional logo URL
  agents: number;
  segments: Segment[];
  updatedAt: string;
  source: string;
  projectId?: string;
  description?: string;
}

export interface Project {
  id: string;
  name: string;
  icon: string; // 2-letter abbreviation
  logo?: string; // Optional logo URL
  audiences: Audience[];
}

export interface Account {
  id: string;
  name: string;
  type: 'brand' | 'agency';
  icon: string; // 2-letter abbreviation
  logo?: string; // Optional logo URL
  projects?: Project[];
  audiences?: Audience[]; // For brand accounts without projects
}

// Mock data for a brand account (Canva)
export const canvaAccount: Account = {
  id: 'canva',
  name: 'Canva',
  type: 'brand',
  icon: 'CV',
  logo: '/assets/canva-logo.png',
  projects: [
    {
      id: 'design-platform',
      name: 'Design Platform',
      icon: 'DP',
      logo: '/assets/canva-logo.png',
      audiences: [
        {
          id: 'canva-1',
          name: 'Social media managers',
          icon: 'SM',
          logo: '/assets/canva-logo.png',
          agents: 3200,
          segments: [
            { id: 's1', name: 'Agency social teams', count: 1280, percentage: 40 },
            { id: 's2', name: 'In-house brand managers', count: 960, percentage: 30 },
            { id: 's3', name: 'Freelance social managers', count: 960, percentage: 30 },
          ],
          updatedAt: '2026-01-07',
          source: 'LinkedIn, Survey',
          projectId: 'design-platform',
          description: 'Social media professionals creating platform-specific content daily',
        },
        {
          id: 'canva-2',
          name: 'Content creators & influencers',
          icon: 'CC',
          agents: 4500,
          segments: [
            { id: 's4', name: 'YouTube creators', count: 1800, percentage: 40 },
            { id: 's5', name: 'Instagram influencers', count: 1350, percentage: 30 },
            { id: 's6', name: 'TikTok creators', count: 900, percentage: 20 },
            { id: 's7', name: 'Podcast hosts', count: 450, percentage: 10 },
          ],
          updatedAt: '2026-01-06',
          source: 'Creator Network, Analytics',
          projectId: 'design-platform',
          description: 'Digital content creators building personal brands across platforms',
        },
        {
          id: 'canva-3',
          name: 'Small business owners',
          icon: 'SB',
          agents: 2800,
          segments: [
            { id: 's8', name: 'E-commerce stores', count: 1120, percentage: 40 },
            { id: 's9', name: 'Local service businesses', count: 840, percentage: 30 },
            { id: 's10', name: 'Restaurants & cafes', count: 560, percentage: 20 },
            { id: 's11', name: 'Retail shops', count: 280, percentage: 10 },
          ],
          updatedAt: '2026-01-05',
          source: 'Survey, CRM',
          projectId: 'design-platform',
          description: 'Small business owners creating their own marketing materials',
        },
        {
          id: 'canva-4',
          name: 'Marketing teams',
          icon: 'MT',
          agents: 2400,
          segments: [
            { id: 's12', name: 'B2B marketing', count: 960, percentage: 40 },
            { id: 's13', name: 'B2C marketing', count: 720, percentage: 30 },
            { id: 's14', name: 'Growth marketers', count: 480, percentage: 20 },
            { id: 's15', name: 'Product marketing', count: 240, percentage: 10 },
          ],
          updatedAt: '2026-01-04',
          source: 'CRM, LinkedIn',
          projectId: 'design-platform',
          description: 'Corporate marketing teams producing campaign materials',
        },
      ],
    },
    {
      id: 'education',
      name: 'Education',
      icon: 'ED',
      logo: '/assets/canva-logo.png',
      audiences: [
        {
          id: 'canva-5',
          name: 'K-12 teachers',
          icon: 'K12',
          logo: '/assets/canva-logo.png',
          agents: 5200,
          segments: [
            { id: 's16', name: 'Elementary school teachers', count: 2080, percentage: 40 },
            { id: 's17', name: 'Middle school teachers', count: 1560, percentage: 30 },
            { id: 's18', name: 'High school teachers', count: 1040, percentage: 20 },
            { id: 's19', name: 'Special education teachers', count: 520, percentage: 10 },
          ],
          updatedAt: '2026-01-03',
          source: 'Survey, Education Network',
          projectId: 'education',
          description: 'K-12 teachers creating lesson materials, presentations, and classroom resources',
        },
        {
          id: 'canva-6',
          name: 'University students',
          icon: 'US',
          agents: 8500,
          segments: [
            { id: 's20', name: 'Undergraduate students', count: 5100, percentage: 60 },
            { id: 's21', name: 'Graduate students', count: 2550, percentage: 30 },
            { id: 's22', name: 'Student org leaders', count: 850, percentage: 10 },
          ],
          updatedAt: '2026-01-02',
          source: 'Campus Survey, Analytics',
          projectId: 'education',
          description: 'College students creating presentations, posters, and resumes',
        },
        {
          id: 'canva-7',
          name: 'University faculty',
          icon: 'UF',
          agents: 1200,
          segments: [
            { id: 's23', name: 'Professors', count: 480, percentage: 40 },
            { id: 's24', name: 'Adjunct instructors', count: 360, percentage: 30 },
            { id: 's25', name: 'Teaching assistants', count: 240, percentage: 20 },
            { id: 's26', name: 'Course designers', count: 120, percentage: 10 },
          ],
          updatedAt: '2026-01-01',
          source: 'Survey, LinkedIn',
          projectId: 'education',
          description: 'University faculty creating course materials and academic presentations',
        },
        {
          id: 'canva-8',
          name: 'Online course creators',
          icon: 'OC',
          agents: 2800,
          segments: [
            { id: 's27', name: 'Independent course creators', count: 1400, percentage: 50 },
            { id: 's28', name: 'Corporate trainers', count: 840, percentage: 30 },
            { id: 's29', name: 'EdTech instructors', count: 560, percentage: 20 },
          ],
          updatedAt: '2025-12-30',
          source: 'Creator Network, Survey',
          projectId: 'education',
          description: 'Educators creating online learning materials and course graphics',
        },
      ],
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      icon: 'EN',
      logo: '/assets/canva-logo.png',
      audiences: [
        {
          id: 'canva-9',
          name: 'HR & people ops teams',
          icon: 'HR',
          agents: 1800,
          segments: [
            { id: 's30', name: 'Recruitment teams', count: 720, percentage: 40 },
            { id: 's31', name: 'Employee experience', count: 540, percentage: 30 },
            { id: 's32', name: 'L&D teams', count: 360, percentage: 20 },
            { id: 's33', name: 'Internal comms', count: 180, percentage: 10 },
          ],
          updatedAt: '2026-01-07',
          source: 'CRM, LinkedIn',
          projectId: 'enterprise',
          description: 'HR teams creating recruitment materials, onboarding docs, and internal communications',
        },
        {
          id: 'canva-10',
          name: 'Sales teams',
          icon: 'SA',
          agents: 2200,
          segments: [
            { id: 's34', name: 'B2B sales reps', count: 880, percentage: 40 },
            { id: 's35', name: 'Account executives', count: 660, percentage: 30 },
            { id: 's36', name: 'Sales enablement', count: 440, percentage: 20 },
            { id: 's37', name: 'Business development', count: 220, percentage: 10 },
          ],
          updatedAt: '2026-01-06',
          source: 'CRM, Survey',
          projectId: 'enterprise',
          description: 'Sales professionals creating proposals, pitch decks, and client-facing materials',
        },
        {
          id: 'canva-11',
          name: 'Internal communications',
          icon: 'IC',
          agents: 950,
          segments: [
            { id: 's38', name: 'Comms managers', count: 380, percentage: 40 },
            { id: 's39', name: 'Executive assistants', count: 285, percentage: 30 },
            { id: 's40', name: 'Office managers', count: 190, percentage: 20 },
            { id: 's41', name: 'Culture teams', count: 95, percentage: 10 },
          ],
          updatedAt: '2026-01-05',
          source: 'CRM, Analytics',
          projectId: 'enterprise',
          description: 'Internal communications teams creating company updates, newsletters, and announcements',
        },
        {
          id: 'canva-12',
          name: 'Non-profit organizations',
          icon: 'NP',
          agents: 3400,
          segments: [
            { id: 's42', name: 'Fundraising teams', count: 1360, percentage: 40 },
            { id: 's43', name: 'Program managers', count: 1020, percentage: 30 },
            { id: 's44', name: 'Communications staff', count: 680, percentage: 20 },
            { id: 's45', name: 'Volunteer coordinators', count: 340, percentage: 10 },
          ],
          updatedAt: '2026-01-04',
          source: 'Survey, Partner Network',
          projectId: 'enterprise',
          description: 'Non-profit teams creating fundraising campaigns, event materials, and impact reports',
        },
      ],
    },
  ],
};

// Mock data for an agency account (Wonderhood Studios)
export const wonderhoodAccount: Account = {
  id: 'wonderhood',
  name: 'Wonderhood Studios',
  type: 'agency',
  icon: 'WS',
  logo: '/assets/wonderhood.png',
  projects: [
    {
      id: 'bp',
      name: 'BP',
      icon: 'BP',
      logo: '/assets/Bp_Logo_.png',
      audiences: [
        {
          id: 'bp-1',
          name: 'EV early adopters',
          icon: 'EV',
          logo: '/assets/Bp_Logo_.png',
          agents: 1500,
          segments: [
            { id: 's10', name: 'Urban professionals', count: 750, percentage: 50 },
            { id: 's11', name: 'Environmental advocates', count: 450, percentage: 30 },
            { id: 's12', name: 'Tech enthusiasts', count: 300, percentage: 20 },
          ],
          updatedAt: '2026-01-06',
          source: 'Survey, Social media',
          projectId: 'bp',
          description: 'Early adopters of electric vehicles',
        },
        {
          id: 'bp-2',
          name: 'Fleet managers',
          icon: 'FM',
          logo: '/assets/Bp_Logo_.png',
          agents: 800,
          segments: [
            { id: 's13', name: 'Corporate fleets', count: 400, percentage: 50 },
            { id: 's14', name: 'Delivery services', count: 280, percentage: 35 },
            { id: 's15', name: 'Public transport', count: 120, percentage: 15 },
          ],
          updatedAt: '2026-01-04',
          source: 'LinkedIn',
          projectId: 'bp',
          description: 'Professionals managing vehicle fleets',
        },
      ],
    },
    {
      id: 'times',
      name: 'The Times',
      icon: 'TT',
      logo: '/assets/Times-logo.png',
      audiences: [
        {
          id: 'times-1',
          name: 'Digital subscribers',
          icon: 'DS',
          logo: '/assets/Times-logo.png',
          agents: 3200,
          segments: [
            { id: 's16', name: 'News enthusiasts', count: 1600, percentage: 50 },
            { id: 's17', name: 'Business professionals', count: 960, percentage: 30 },
            { id: 's18', name: 'Opinion readers', count: 640, percentage: 20 },
          ],
          updatedAt: '2026-01-07',
          source: 'CRM, Analytics',
          projectId: 'times',
          description: 'Current digital subscribers to The Times',
        },
        {
          id: 'times-2',
          name: 'Potential subscribers',
          icon: 'PS',
          logo: '/assets/Times-logo.png',
          agents: 2400,
          segments: [
            { id: 's19', name: 'Free tier users', count: 1200, percentage: 50 },
            { id: 's20', name: 'Lapsed subscribers', count: 720, percentage: 30 },
            { id: 's21', name: 'Competitors readers', count: 480, percentage: 20 },
          ],
          updatedAt: '2026-01-02',
          source: 'Survey, Analytics',
          projectId: 'times',
          description: 'Potential future subscribers to target',
        },
      ],
    },
    {
      id: 'redbull',
      name: 'Red Bull',
      icon: 'RB',
      logo: '/assets/Redbull-logo.png',
      audiences: [
        {
          id: 'rb-1',
          name: 'Extreme sports fans',
          icon: 'XS',
          logo: '/assets/Redbull-logo.png',
          agents: 2800,
          segments: [
            { id: 's22', name: 'Action sports', count: 1400, percentage: 50 },
            { id: 's23', name: 'Motorsports', count: 840, percentage: 30 },
            { id: 's24', name: 'Adventure seekers', count: 560, percentage: 20 },
          ],
          updatedAt: '2026-01-05',
          source: 'Social media, Events',
          projectId: 'redbull',
          description: 'Fans of extreme sports and adventure',
        },
      ],
    },
  ],
};

export const mockAccounts: Account[] = [canvaAccount, wonderhoodAccount];

// Helper function to get all audiences from an account
export const getAllAudiences = (account: Account): Audience[] => {
  if (account.type === 'brand') {
    // Support both patterns: direct audiences array or projects structure
    if (account.audiences) {
      return account.audiences;
    }
    if (account.projects) {
      return account.projects.flatMap(project => project.audiences);
    }
  }
  if (account.type === 'agency' && account.projects) {
    return account.projects.flatMap(project => project.audiences);
  }
  return [];
};

// Helper function to get audiences by project
export const getAudiencesByProject = (account: Account, projectId: string): Audience[] => {
  if (account.projects) {
    const project = account.projects.find(p => p.id === projectId);
    return project?.audiences || [];
  }
  return [];
};

// Recent questions mock data
export const recentQuestions = [
  { id: 'q1', text: 'What features do users want most?', timestamp: '2026-01-06' },
  { id: 'q2', text: 'How often do they use the product?', timestamp: '2026-01-05' },
  { id: 'q3', text: 'What are the main pain points?', timestamp: '2026-01-04' },
  { id: 'q4', text: 'Would they recommend to others?', timestamp: '2026-01-03' },
];

// ============================================================================
// Original Mock Data for Conversation Feature
// ============================================================================

import { Audience as ConversationAudience, ProcessStep, Report, Conversation } from '../types';

export const mockAudience: ConversationAudience = {
  id: 'times-readers',
  name: 'Times Readers',
  icon: 'T'
};

export const mockAudiences: ConversationAudience[] = [
  mockAudience,
  { id: 'gen-z', name: 'Gen Z', icon: 'Z' },
  { id: 'policy-makers', name: 'Policy Makers', icon: 'P' },
  { id: 'tech-enthusiasts', name: 'Tech Enthusiasts', icon: 'E' },
  { id: 'parents', name: 'Parents', icon: 'P' },
];

export const initialProcessSteps: ProcessStep[] = [
  { id: '1', label: 'Planning survey', status: 'pending' },
  { id: '2', label: 'Recruiting participants', status: 'pending' },
  { id: '3', label: 'Reviewing responses', status: 'pending' },
  { id: '4', label: 'Asking additional questions', status: 'pending' },
  { id: '5', label: 'Analysing result', status: 'pending' },
  { id: '6', label: 'Creating report', status: 'pending' },
];

export const initialQualitativeSteps: ProcessStep[] = [
  { id: 'q1', label: 'Designing discussion guide', status: 'pending' },
  { id: 'q2', label: 'Recruiting panel', status: 'pending' },
  { id: 'q3', label: 'Moderating focus group', status: 'pending' },
  { id: 'q4', label: 'Transcribing sessions', status: 'pending' },
  { id: 'q5', label: 'Coding themes', status: 'pending' },
  { id: 'q6', label: 'Synthesizing insights', status: 'pending' },
];

export const mockReport: Report = {
  id: 'report-1',
  title: 'Behind the Story: What Would Make Times Readers Listen',
  audience: mockAudience,
  respondents: 512,
  abstract: "40% of Times readers say they'd tune into a podcast about how journalists got the scoop — four times more than any other format tested. Opinion and debate ranked last at 5.5%. The hook isn't the news — it's how the news gets made.",
  questions: [
    {
      id: 'q1',
      question: 'What would make you start to listen to a new podcast?',
      respondents: 512,
      options: [
        { label: 'The story behind a headline', percentage: 10.2 },
        { label: 'Journalists how they got a scoop', percentage: 40.1 },
        { label: "Analysis I can't get anywhere else", percentage: 10.5 },
        { label: 'Breaking news as it happens', percentage: 12.3 },
        { label: 'Opinion and debate', percentage: 5.5 },
      ]
    },
    {
      id: 'q2',
      question: 'What are you looking for in a news podcast?',
      respondents: 512,
      options: [
        { label: 'Behind-the-scenes access', percentage: 35.2 },
        { label: 'Expert analysis', percentage: 28.4 },
        { label: 'Quick daily updates', percentage: 18.7 },
        { label: 'In-depth investigations', percentage: 12.1 },
        { label: 'Celebrity interviews', percentage: 5.6 },
      ]
    },
    {
      id: 'q3',
      question: 'How long should a news podcast episode be?',
      respondents: 512,
      options: [
        { label: '10-15 minutes', percentage: 42.3 },
        { label: '20-30 minutes', percentage: 31.8 },
        { label: '5-10 minutes', percentage: 15.2 },
        { label: '45+ minutes', percentage: 10.7 },
      ]
    }
  ],
  createdAt: new Date()
};

const report2: Report = {
  id: 'report-2',
  title: 'Gen Z: The Vintage Revival',
  audience: { id: 'gen-z', name: 'Gen Z', icon: 'Z' },
  respondents: 850,
  abstract: "Gen Z is driving a massive resurgence in vintage and second-hand fashion. 78% of respondents prefer thrifting over fast fashion, citing sustainability and uniqueness as key drivers.",
  questions: [
    {
      id: 'q1-r2',
      question: 'Where do you prefer to shop for clothes?',
      respondents: 850,
      options: [
        { label: 'Thrift / Vintage Stores', percentage: 45.2 },
        { label: 'Online Resale (Depop/Vinted)', percentage: 32.8 },
        { label: 'Fast Fashion Brands', percentage: 15.1 },
        { label: 'High-end Retail', percentage: 6.9 },
      ]
    },
    {
      id: 'q2-r2',
      question: 'What matters most when buying?',
      respondents: 850,
      options: [
        { label: 'Uniqueness / Style', percentage: 40.5 },
        { label: 'Sustainability / Ethics', percentage: 35.2 },
        { label: 'Price', percentage: 18.3 },
        { label: 'Brand Name', percentage: 6.0 },
      ]
    }
  ],
  createdAt: new Date(Date.now() - 86400000 * 2) // 2 days ago
};

const report3: Report = {
  id: 'report-3',
  title: 'Remote Work: Productivity vs. Culture',
  audience: { id: 'tech-enthusiasts', name: 'Tech Workers', icon: 'T' },
  respondents: 420,
  abstract: "While 88% of tech workers report higher productivity at home, 62% feel a disconnect from company culture. The challenge is balancing output with belonging.",
  questions: [
    {
      id: 'q1-r3',
      question: 'How has remote work affected your productivity?',
      respondents: 420,
      options: [
        { label: 'Significantly Increased', percentage: 55.4 },
        { label: 'Slightly Increased', percentage: 32.6 },
        { label: 'No Change', percentage: 8.2 },
        { label: 'Decreased', percentage: 3.8 },
      ]
    },
    {
      id: 'q2-r3',
      question: 'Do you feel connected to your team?',
      respondents: 420,
      options: [
        { label: 'Disconnected', percentage: 45.1 },
        { label: 'Somewhat Connected', percentage: 30.5 },
        { label: 'Very Connected', percentage: 24.4 },
      ]
    }
  ],
  createdAt: new Date(Date.now() - 86400000 * 5) // 5 days ago
};

export const mockQualitativeReport: Report = {
  id: 'report-qual-1',
  title: 'Focus Group: Gen Z on "Adulting"',
  type: 'qualitative',
  audience: { id: 'gen-z', name: 'Gen Z', icon: 'Z' },
  respondents: 12, // Focus groups are smaller
  abstract: "Participants expressed deep anxiety about financial stability but showed resilience through community building. The concept of 'adulting' is viewed as a performative act rather than a milestone.",
  questions: [], // Empty for qualitative
  themes: [
    {
      id: 'theme-1',
      topic: 'Financial Anxiety vs. Freedom',
      sentiment: 'negative',
      summary: "Participants feel trapped by rising costs but find freedom in gig economy flexibility.",
      quotes: [
        { text: "I make okay money, but I can't imagine ever buying a house. It feels like a distinct impossibility.", attribution: "Alex, 24" },
        { text: "I'd rather live in a van and travel than work 9-5 just to pay rent for a box I don't own.", attribution: "Sam, 22" }
      ]
    },
    {
      id: 'theme-2',
      topic: 'Community as Currency',
      sentiment: 'positive',
      summary: "Strong emphasis on mutual aid and digital communities replacing traditional support structures.",
      quotes: [
        { text: "My discord server is my safety net. If I'm short on cash, someone there helps out. We take care of each other.", attribution: "Jordan, 23" }
      ]
    }
  ],
  createdAt: new Date()
};

const createHistoryItem = (rep: Report, i: number): Conversation => ({
  id: `hist_${i}_${rep.id}`,
  query: rep.questions[0]?.question || 'Focus group discussion', // Use first question as the query
  messages: [
    { id: `msg_u_${i}`, role: 'user', content: rep.questions[0]?.question || 'Focus group discussion' },
    { id: `msg_a_${i}`, role: 'assistant', content: "Analysis complete.", processSteps: initialProcessSteps, report: rep, thinkingTime: 3.2 }
  ],
  audience: rep.audience,
  processSteps: initialProcessSteps.map(s => ({ ...s, status: 'complete' as const })),
  thinkingTime: 3.2,
  explanation: "Analysis complete.",
  report: rep,
  status: 'complete'
});

export const mockHistory: Conversation[] = [
  createHistoryItem(mockReport, 0),
  createHistoryItem(report2, 1),
  createHistoryItem(report3, 2)
];

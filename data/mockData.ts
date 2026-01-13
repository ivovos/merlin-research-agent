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

// Mock data for MUBI (streaming service brand)
// Note: Projects are research workspaces that group conversations, not audience categories
// Audiences are account-level and shared across projects
export const mubiAccount: Account = {
  id: 'mubi',
  name: 'MUBI',
  type: 'brand',
  icon: 'MU',
  logo: '/assets/mubi-logo.png',
  // Audiences are flat - available across all projects
  audiences: [
    {
      id: 'mubi-basic-global',
      name: 'Basic Subscribers (Global)',
      icon: 'BS',
      agents: 2847,
      segments: [
        { id: 'seg-high', name: 'High Engagement', count: 569, percentage: 20 },
        { id: 'seg-med', name: 'Medium Engagement', count: 1424, percentage: 50 },
        { id: 'seg-low', name: 'Low Engagement', count: 854, percentage: 30 },
      ],
      updatedAt: '2026-01-10',
      source: 'CRM, Streaming Analytics',
      description: 'Current MUBI Basic subscribers worldwide, segmented by platform engagement',
    },
    {
      id: 'mubi-go-subscribers',
      name: 'Go Subscribers',
      icon: 'GO',
      agents: 1850,
      segments: [
        { id: 'seg-go-active', name: 'Active Cinema-goers', count: 925, percentage: 50 },
        { id: 'seg-go-occasional', name: 'Occasional Cinema-goers', count: 555, percentage: 30 },
        { id: 'seg-go-lapsed', name: 'Lapsed Cinema-goers', count: 370, percentage: 20 },
      ],
      updatedAt: '2026-01-10',
      source: 'CRM, Box Office Data',
      description: 'MUBI Go tier subscribers with weekly cinema ticket benefit',
    },
    {
      id: 'mubi-churned',
      name: 'Churned Subscribers',
      icon: 'CH',
      agents: 1500,
      segments: [
        { id: 'seg-recent', name: 'Last 30 days', count: 450, percentage: 30 },
        { id: 'seg-medium', name: '1-3 months ago', count: 525, percentage: 35 },
        { id: 'seg-long', name: '3-6 months ago', count: 525, percentage: 35 },
      ],
      updatedAt: '2026-01-08',
      source: 'CRM, Exit Surveys',
      description: 'Former subscribers who cancelled within the last 6 months',
    },
    {
      id: 'mubi-trialists',
      name: 'Free Trial Users',
      icon: 'FT',
      agents: 3200,
      segments: [
        { id: 'seg-active-trial', name: 'Active in Trial', count: 1280, percentage: 40 },
        { id: 'seg-likely-convert', name: 'Likely to Convert', count: 960, percentage: 30 },
        { id: 'seg-at-risk', name: 'At Risk of Drop-off', count: 960, percentage: 30 },
      ],
      updatedAt: '2026-01-11',
      source: 'Product Analytics',
      description: 'Users currently on free trial, segmented by conversion likelihood',
    },
    {
      id: 'mubi-uk-market',
      name: 'UK Subscribers',
      icon: 'UK',
      agents: 4200,
      segments: [
        { id: 'seg-uk-basic', name: 'Basic Tier', count: 2940, percentage: 70 },
        { id: 'seg-uk-go', name: 'Go Tier', count: 1260, percentage: 30 },
      ],
      updatedAt: '2026-01-09',
      source: 'CRM, Payment Data',
      description: 'UK market subscribers - highest Go tier adoption market',
    },
    {
      id: 'mubi-us-market',
      name: 'US Subscribers',
      icon: 'US',
      agents: 3156,
      segments: [
        { id: 'seg-us-basic', name: 'Basic Tier', count: 3061, percentage: 97 },
        { id: 'seg-us-go', name: 'Go Tier', count: 95, percentage: 3 },
      ],
      updatedAt: '2026-01-08',
      source: 'CRM, Payment Data',
      description: 'US market subscribers - Go tier launching soon',
    },
    {
      id: 'mubi-arthouse-prospects',
      name: 'Arthouse Film Enthusiasts',
      icon: 'AH',
      agents: 4000,
      segments: [
        { id: 'seg-criterion', name: 'Criterion Channel Users', count: 1200, percentage: 30 },
        { id: 'seg-letterboxd', name: 'Letterboxd Power Users', count: 1600, percentage: 40 },
        { id: 'seg-festival', name: 'Film Festival Attendees', count: 1200, percentage: 30 },
      ],
      updatedAt: '2026-01-05',
      source: 'Survey, Social Media',
      description: 'Non-subscribers active in arthouse film communities - acquisition targets',
    },
  ],
  // Projects are research workspaces that group conversations, canvases, and briefs
  // They reference audiences by ID rather than containing them
  projects: [
    {
      id: 'proj_go_pricing',
      name: 'Go Tier Pricing Research',
      icon: 'GO',
      audiences: [], // Projects use audienceIds to reference account-level audiences
    },
    {
      id: 'proj_churn_analysis',
      name: 'Churn Analysis Q1 2026',
      icon: 'CH',
      audiences: [],
    },
    {
      id: 'proj_uk_expansion',
      name: 'UK Market Go Expansion',
      icon: 'UK',
      audiences: [],
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

export const mockAccounts: Account[] = [canvaAccount, mubiAccount, wonderhoodAccount];

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
  { id: '1', label: 'Designing survey questions', status: 'pending' },
  { id: '2', label: 'Recruiting 500+ respondents', status: 'pending' },
  { id: '3', label: 'Collecting responses', status: 'pending' },
  { id: '4', label: 'Cleaning & validating data', status: 'pending' },
  { id: '5', label: 'Running statistical analysis', status: 'pending' },
  { id: '6', label: 'Generating report', status: 'pending' },
];

export const initialQualitativeSteps: ProcessStep[] = [
  { id: 'q1', label: 'Designing discussion guide', status: 'pending' },
  { id: 'q2', label: 'Recruiting 12 participants', status: 'pending' },
  { id: 'q3', label: 'Moderating sessions', status: 'pending' },
  { id: 'q4', label: 'Transcribing 6 hours', status: 'pending' },
  { id: 'q5', label: 'Coding themes', status: 'pending' },
  { id: 'q6', label: 'Synthesizing insights', status: 'pending' },
];

export const mockReport: Report = {
  id: 'report-1',
  title: 'Behind the Story: What Would Make Times Readers Listen',
  audience: mockAudience,
  respondents: 512,
  abstract: "40% of Times readers say they'd tune into a podcast about how journalists got the scoop — four times more than any other format tested. Opinion and debate ranked last at 5.5%. The hook isn't the news — it's how the news gets made.",
  keyInsight: "Readers want the story behind the story — 40% prefer hearing how journalists got the scoop vs. just 5.5% for opinion and debate.",
  followUpSuggestion: "You might want to explore what specific types of 'behind the scenes' content resonate most — investigative stories vs. breaking news vs. features.",
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
  respondents: 12,
  abstract: "Participants expressed deep anxiety about financial stability but showed resilience through community building. The concept of 'adulting' is viewed as a performative act rather than a milestone — something you perform on social media rather than actually achieve.",
  questions: [],
  themes: [
    {
      id: 'theme-1',
      topic: 'Financial Anxiety vs. Freedom',
      sentiment: 'negative',
      summary: "Participants feel trapped by rising costs but find unexpected freedom in rejecting traditional milestones altogether.",
      quotes: [
        { text: "I make okay money, but I can't imagine ever buying a house. It feels like a distinct impossibility. Like, my parents bought their house at 25. I'm 26 and I have roommates.", attribution: "Alex, 24" },
        { text: "I'd rather live in a van and travel than work 9-5 just to pay rent for a box I don't own. At least the van is mine.", attribution: "Sam, 22" },
        { text: "The whole system is rigged against us. So why play by their rules? I've stopped trying to 'make it' in the traditional sense.", attribution: "Maya, 25" }
      ]
    },
    {
      id: 'theme-2',
      topic: 'Community as Currency',
      sentiment: 'positive',
      summary: "Digital communities and mutual aid networks have replaced traditional institutions as primary support structures.",
      quotes: [
        { text: "My Discord server is my safety net. If I'm short on cash, someone there helps out. We take care of each other. It's more reliable than any bank.", attribution: "Jordan, 23" },
        { text: "I crowdfunded my surgery through Twitter. Strangers came through when the system wouldn't. That's community.", attribution: "Riley, 27" },
        { text: "My online friends know me better than my family does. They've seen me at my worst and my best. That's real connection.", attribution: "Kai, 21" }
      ]
    },
    {
      id: 'theme-3',
      topic: 'Performative Adulthood',
      sentiment: 'mixed',
      summary: "The concept of 'adulting' has become a social media performance rather than a genuine life stage, creating both humor and anxiety.",
      quotes: [
        { text: "I post about doing my taxes like it's an achievement because honestly? It feels like one. But it's also kind of sad that this is what we celebrate.", attribution: "Taylor, 26" },
        { text: "Adulting is a meme. We joke about it because the alternative is crying. Making your bed shouldn't feel like a victory but here we are.", attribution: "Chris, 24" },
        { text: "My mom doesn't get why I 'brag' about basic stuff online. But she also doesn't get that nobody taught us this stuff. We're figuring it out in public.", attribution: "Zoe, 23" }
      ]
    },
    {
      id: 'theme-4',
      topic: 'Redefining Success',
      sentiment: 'positive',
      summary: "Participants are actively rejecting boomer definitions of success in favor of metrics centered on mental health, authenticity, and personal fulfillment.",
      quotes: [
        { text: "Success to me is having time. Time to rest, time for friends, time to just exist without grinding. That's the dream.", attribution: "Devon, 25" },
        { text: "My parents think I'm failing because I don't want a corporate job. But I make enough, I'm happy, I'm not destroying my mental health. That's winning.", attribution: "Jamie, 28" },
        { text: "I'd rather be 'broke' and free than rich and miserable like every adult I grew up watching. They had the houses and the cars and they were all depressed.", attribution: "Morgan, 22" }
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
    { id: `msg_a_${i}`, role: 'assistant', content: "Analysis complete.", processSteps: initialProcessSteps, canvas: rep, thinkingTime: 3.2 }
  ],
  audience: rep.audience,
  processSteps: initialProcessSteps.map(s => ({ ...s, status: 'complete' as const })),
  thinkingTime: 3.2,
  explanation: "Analysis complete.",
  canvas: rep,
  status: 'complete'
});

export const mockHistory: Conversation[] = [
  createHistoryItem(mockReport, 0),
  createHistoryItem(report2, 1),
  createHistoryItem(report3, 2)
];

// ============================================================================
// MUBI Mock Conversations
// ============================================================================

// MUBI Audience references for conversations
const mubiBasicGlobalAudience: ConversationAudience = {
  id: 'mubi-basic-global',
  name: 'Basic Subscribers (Global)',
  icon: 'BS'
};

const mubiUSAudience: ConversationAudience = {
  id: 'mubi-us-market',
  name: 'US Subscribers',
  icon: 'US'
};

const mubiPotentialUpgradersAudience: ConversationAudience = {
  id: 'mubi-potential-upgraders',
  name: 'Potential Upgraders',
  icon: 'PU'
};

// Conversation 1: Subscription Tier Optimization (Basic Subscribers Global)
const mubiTierReport1: Report = {
  id: 'canvas-mubi-001',
  title: 'Purchase Intent by Tier',
  type: 'quantitative',
  audience: mubiBasicGlobalAudience,
  respondents: 2847,
  abstract: '59.6% of subscribers would choose an Essential tier, with annual preferred over monthly. High-engagement users show strongest Premium interest at 38.4%, while 14.5% of low-engagement users would choose none of the options.',
  keyInsight: "High-engagement users are 2x more likely to choose Premium tier (38.4%) compared to all subscribers (22.1%).",
  followUpSuggestion: "Consider exploring what specific Premium features drive high-engagement users — cinema tickets vs. 4K streaming vs. early access.",
  questions: [
    {
      id: 'q1',
      question: 'Which tier would you choose?',
      respondents: 2847,
      segments: ['All Subs', 'High Eng.', 'Med Eng.', 'Low Eng.'],
      options: [
        { label: 'Essential Monthly ($14.99)', percentage: 28.4, 'All Subs': 28.4, 'High Eng.': 18.2, 'Med Eng.': 32.1, 'Low Eng.': 38.7 },
        { label: 'Essential Annual ($119.99)', percentage: 31.2, 'All Subs': 31.2, 'High Eng.': 24.6, 'Med Eng.': 33.8, 'Low Eng.': 36.4 },
        { label: 'Premium ($199.99/yr)', percentage: 22.1, 'All Subs': 22.1, 'High Eng.': 38.4, 'Med Eng.': 21.2, 'Low Eng.': 8.3 },
        { label: 'Ultimate ($299.99/yr)', percentage: 8.5, 'All Subs': 8.5, 'High Eng.': 14.2, 'Med Eng.': 6.8, 'Low Eng.': 2.1 },
        { label: 'None of these', percentage: 9.8, 'All Subs': 9.8, 'High Eng.': 4.6, 'Med Eng.': 6.1, 'Low Eng.': 14.5 }
      ]
    }
  ],
  createdAt: new Date('2026-01-12T10:15:00Z')
};

const mubiFeatureReport: Report = {
  id: 'canvas-mubi-002',
  title: 'Feature Value Ranking',
  type: 'quantitative',
  audience: mubiBasicGlobalAudience,
  respondents: 2847,
  abstract: '4K streaming (72%) and cinema tickets (68%) are the top value drivers for Premium. Magazine and store discounts show minimal appeal at under 25%.',
  questions: [
    {
      id: 'q2',
      question: 'Which Premium features would be most valuable to you? (Select up to 3)',
      respondents: 2847,
      options: [
        { label: '4K + Dolby Atmos streaming', percentage: 72 },
        { label: '1 cinema ticket per week', percentage: 68 },
        { label: 'Offline viewing', percentage: 61 },
        { label: '48hr early access to releases', percentage: 54 },
        { label: '4 devices simultaneously', percentage: 48 },
        { label: '25% Notebook Magazine discount', percentage: 23 },
        { label: '10% MUBI Store discount', percentage: 19 }
      ]
    }
  ],
  createdAt: new Date('2026-01-12T10:16:00Z')
};

const mubiCinemaHeatmap: Report = {
  id: 'canvas-mubi-003',
  title: 'Tier Preference × Cinema Attendance',
  type: 'quantitative',
  audience: mubiBasicGlobalAudience,
  respondents: 2847,
  abstract: 'Cinema attendance strongly predicts tier preference. Weekly cinema-goers show 36% Ultimate interest vs just 2% among non-attendees. Premium peaks at 38% for monthly attendees.',
  questions: [
    {
      id: 'q3-crosstab',
      question: 'Which tier would you choose? (by cinema attendance)',
      respondents: 2847,
      segments: ['Never', '1-2x/year', 'Monthly', 'Weekly+'],
      options: [
        { label: 'Essential Monthly', percentage: 25, 'Never': 42, '1-2x/year': 31, 'Monthly': 18, 'Weekly+': 8 },
        { label: 'Essential Annual', percentage: 27, 'Never': 38, '1-2x/year': 35, 'Monthly': 24, 'Weekly+': 12 },
        { label: 'Premium', percentage: 27, 'Never': 12, '1-2x/year': 22, 'Monthly': 34, 'Weekly+': 38 },
        { label: 'Ultimate', percentage: 15, 'Never': 2, '1-2x/year': 5, 'Monthly': 18, 'Weekly+': 36 },
        { label: 'None', percentage: 6, 'Never': 6, '1-2x/year': 7, 'Monthly': 6, 'Weekly+': 6 }
      ]
    }
  ],
  createdAt: new Date('2026-01-12T10:20:00Z')
};

const mubiWhyNoneReport: Report = {
  id: 'canvas-mubi-004',
  title: 'Why "None of These"?',
  type: 'qualitative',
  audience: mubiBasicGlobalAudience,
  respondents: 24,
  abstract: 'Price sensitivity is the primary barrier (14 mentions), followed by cinema ticket irrelevance for home-focused viewers (11 mentions). Quality upgrades like 4K hold minimal appeal for laptop viewers.',
  questions: [],
  themes: [
    {
      id: 'theme-price',
      topic: 'Price Sensitivity',
      sentiment: 'negative',
      summary: 'Participants feel overwhelmed by streaming subscription costs and see $200/year as excessive for their viewing habits.',
      quotes: [
        { text: 'I already feel like I\'m paying enough for streaming services.', attribution: 'Participant 3, 34' },
        { text: '$200 a year is too much when I barely watch 2 films a month.', attribution: 'Participant 8, 28' },
        { text: 'I\'m already juggling Netflix, Spotify, and my gym. Something has to give.', attribution: 'Participant 15, 31' }
      ]
    },
    {
      id: 'theme-cinema',
      topic: 'Cinema Ticket Irrelevance',
      sentiment: 'negative',
      summary: 'For many subscribers, the cinema benefit holds no value due to location or preference for home viewing.',
      quotes: [
        { text: 'I don\'t live near any partner cinemas.', attribution: 'Participant 5, 42' },
        { text: 'I watch MUBI at home specifically because I don\'t want to go out.', attribution: 'Participant 11, 26' },
        { text: 'The nearest arthouse cinema is 45 minutes away. Not worth it.', attribution: 'Participant 19, 38' }
      ]
    },
    {
      id: 'theme-4k',
      topic: '4K Not a Priority',
      sentiment: 'neutral',
      summary: 'Quality upgrades don\'t resonate with viewers who primarily watch on laptops or smaller screens.',
      quotes: [
        { text: 'I watch on my laptop, 4K makes no difference.', attribution: 'Participant 2, 29' },
        { text: 'The content matters more than the resolution.', attribution: 'Participant 14, 33' }
      ]
    }
  ],
  createdAt: new Date('2026-01-12T10:30:00Z')
};

export const mubiConversation1: Conversation = {
  id: 'conv-mubi-001',
  query: 'How would our existing basic subscribers react to new subscription tiers?',
  title: 'Subscription Tier Optimization',
  audience: mubiBasicGlobalAudience,
  status: 'complete',
  thinkingTime: 18.4,
  explanation: 'Research explored subscriber reactions to proposed Essential/Premium/Ultimate tier structure, feature preferences, and barriers to upgrade.',
  processSteps: [
    { id: '1', label: 'Analyzing tier structure', status: 'complete' },
    { id: '2', label: 'Designing survey questions', status: 'complete' },
    { id: '3', label: 'Recruiting 2,847 respondents', status: 'complete' },
    { id: '4', label: 'Running statistical analysis', status: 'complete' }
  ],
  messages: [
    {
      id: 'msg-001-1',
      role: 'user',
      content: 'Hi! We\'re exploring expanding our subscription tiering into three tiers. The pricing shared is in USD. I would like to understand how our existing basic subscribers in the world would react to this tiering?\n\n**MUBI ESSENTIAL** — Monthly ($14.99) or Annual ($119.99). Full HD (1080p) on 2 devices.\n\n**MUBI PREMIUM** — $199.99/year. 4K + Dolby Atmos, 4 devices, offline viewing. 1 cinema ticket per week, early access.\n\n**MUBI ULTIMATE** — $299.99/year. Unlimited cinema tickets, full Notebook subscription, VIP perks.'
    },
    {
      id: 'msg-001-2',
      role: 'assistant',
      content: 'Great research brief! I\'d recommend we ask:\n\n1. **Tier Selection** — Which tier would you choose?\n2. **Feature Value** — Which features are most valuable to you?\n3. **Price Sensitivity** — How do you feel about the pricing?\n\nWould you like me to run these questions with your synthetic audience?'
    },
    {
      id: 'msg-001-3',
      role: 'user',
      content: 'Yes please. Also interested in what features are driving uptake for Premium vs current?'
    },
    {
      id: 'msg-001-4',
      role: 'assistant',
      content: 'I\'ve run the purchase intent survey across 2,400 synthetic respondents:',
      thinkingTime: 4.2,
      processSteps: [
        { id: '1', label: 'Designing survey questions', status: 'complete' },
        { id: '2', label: 'Recruiting respondents', status: 'complete', totalResponses: 2847 },
        { id: '3', label: 'Running analysis', status: 'complete' }
      ],
      canvas: mubiTierReport1
    },
    {
      id: 'msg-001-5',
      role: 'assistant',
      content: 'And the feature value responses:',
      canvas: mubiFeatureReport
    },
    {
      id: 'msg-001-6',
      role: 'user',
      content: 'I\'d like to understand the relationship between cinema attendance and tier preference. Can you show me a cross-tab?'
    },
    {
      id: 'msg-001-7',
      role: 'assistant',
      content: 'Here\'s the heatmap showing tier preference by cinema attendance frequency:',
      thinkingTime: 2.8,
      canvas: mubiCinemaHeatmap
    },
    {
      id: 'msg-001-8',
      role: 'user',
      content: 'Can we run a focus group to understand why people are choosing "None"?'
    },
    {
      id: 'msg-001-9',
      role: 'assistant',
      content: 'Here are the focus group findings from those who selected "None":',
      thinkingTime: 6.2,
      processSteps: [
        { id: '1', label: 'Recruiting "None" respondents', status: 'complete' },
        { id: '2', label: 'Running focus group sessions', status: 'complete' },
        { id: '3', label: 'Analyzing themes', status: 'complete' }
      ],
      canvas: mubiWhyNoneReport
    }
  ],
  canvas: mubiWhyNoneReport
};

// Conversation 2: US Market Tier Migration
const mubiUSTierReport: Report = {
  id: 'canvas-mubi-n01',
  title: 'Tier Selection (US Market)',
  type: 'quantitative',
  audience: mubiUSAudience,
  respondents: 3156,
  abstract: '74.2% of US subscribers would choose Essential tier, with strong annual preference (42.8%). Go subscribers show dramatically different behavior: 47.4% would choose Premium vs 17.3% of Basic subscribers.',
  questions: [
    {
      id: 'q1-us',
      question: 'Which subscription tier would you choose?',
      respondents: 3156,
      segments: ['All US', 'Basic', 'Go'],
      options: [
        { label: 'Essential Monthly ($14.99/mo)', percentage: 31.4, 'All US': 31.4, 'Basic': 32.1, 'Go': 8.4 },
        { label: 'Essential Annual ($119.99/yr)', percentage: 42.8, 'All US': 42.8, 'Basic': 43.9, 'Go': 7.4 },
        { label: 'Premium ($199.99/yr)', percentage: 18.2, 'All US': 18.2, 'Basic': 17.3, 'Go': 47.4 },
        { label: 'Ultimate ($299.99/yr)', percentage: 4.1, 'All US': 4.1, 'Basic': 3.4, 'Go': 26.3 },
        { label: 'None of these', percentage: 3.5, 'All US': 3.5, 'Basic': 3.3, 'Go': 10.5 }
      ]
    }
  ],
  createdAt: new Date('2026-01-12T11:00:00Z')
};

const mubiUSWhyNoneReport: Report = {
  id: 'canvas-mubi-n02',
  title: 'Why "None of These"?',
  type: 'qualitative',
  audience: mubiUSAudience,
  respondents: 18,
  abstract: 'The 4K downgrade is the primary churn driver (12 mentions). Current subscribers feel they\'re losing value without compensation, triggering cancellation consideration.',
  questions: [],
  themes: [
    {
      id: 'theme-4k-loss',
      topic: '4K Downgrade Concerns',
      sentiment: 'negative',
      summary: 'Subscribers currently receiving 4K feel betrayed by the downgrade to 1080p in the Essential tier, viewing it as a value reduction.',
      quotes: [
        { text: 'I\'m currently getting 4K and now you\'re taking it away unless I pay more.', attribution: 'Participant 2, 31' },
        { text: 'This feels like a sneaky price increase disguised as new tiers.', attribution: 'Participant 7, 28' },
        { text: 'I signed up for 4K streaming. Changing the deal now is shady.', attribution: 'Participant 12, 35' }
      ]
    },
    {
      id: 'theme-cancel',
      topic: 'Already Planning to Cancel',
      sentiment: 'negative',
      summary: 'A segment of respondents were already considering cancellation, and the tier change accelerates that decision.',
      quotes: [
        { text: 'I was going to cancel anyway, this just confirms it.', attribution: 'Participant 4, 26' },
        { text: 'I barely use it enough to justify any price.', attribution: 'Participant 9, 33' }
      ]
    },
    {
      id: 'theme-confusion',
      topic: 'Confusion About Changes',
      sentiment: 'neutral',
      summary: 'Some subscribers don\'t clearly understand what they\'re gaining or losing with the new structure.',
      quotes: [
        { text: 'I don\'t really understand what I\'m losing vs gaining.', attribution: 'Participant 14, 29' },
        { text: 'Why can\'t you just keep things simple?', attribution: 'Participant 16, 41' }
      ]
    }
  ],
  createdAt: new Date('2026-01-12T11:10:00Z')
};

const mubiUSCinemaHeatmap: Report = {
  id: 'canvas-mubi-n03',
  title: 'Tier Preference × Expected Cinema Usage',
  type: 'quantitative',
  audience: mubiUSAudience,
  respondents: 3156,
  abstract: 'Cinema usage is the strongest predictor of Premium/Ultimate adoption. 72% of those expecting 25+ tickets/year would choose Ultimate, while 48% of non-cinema-goers prefer Essential Monthly.',
  questions: [
    {
      id: 'q2-cinema-crosstab',
      question: 'Which tier would you choose? (by expected cinema usage)',
      respondents: 3156,
      segments: ['0 tickets', '1-4 tickets', '5-12 tickets', '13-24 tickets', '25+ tickets'],
      options: [
        { label: 'Essential Monthly', percentage: 20, '0 tickets': 48, '1-4 tickets': 35, '5-12 tickets': 12, '13-24 tickets': 4, '25+ tickets': 1 },
        { label: 'Essential Annual', percentage: 26, '0 tickets': 42, '1-4 tickets': 48, '5-12 tickets': 28, '13-24 tickets': 8, '25+ tickets': 2 },
        { label: 'Premium', percentage: 26, '0 tickets': 8, '1-4 tickets': 14, '5-12 tickets': 42, '13-24 tickets': 28, '25+ tickets': 18 },
        { label: 'Ultimate', percentage: 24, '0 tickets': 1, '1-4 tickets': 2, '5-12 tickets': 12, '13-24 tickets': 52, '25+ tickets': 72 },
        { label: 'None', percentage: 4, '0 tickets': 1, '1-4 tickets': 1, '5-12 tickets': 6, '13-24 tickets': 8, '25+ tickets': 7 }
      ]
    }
  ],
  createdAt: new Date('2026-01-12T11:15:00Z')
};

const mubiUSEngagementReport: Report = {
  id: 'canvas-mubi-n04',
  title: 'Tier Selection by Engagement',
  type: 'quantitative',
  audience: mubiUSAudience,
  respondents: 3156,
  abstract: 'High-engagement users drive Premium adoption at 38.4%, representing the core upsell opportunity. Low-engagement users overwhelmingly prefer Essential Annual (52.4%) with minimal Premium interest (6.3%).',
  questions: [
    {
      id: 'q3-engagement',
      question: 'Which subscription tier would you choose?',
      respondents: 3156,
      segments: ['High Eng.', 'Med Eng.', 'Low Eng.'],
      options: [
        { label: 'Essential Monthly ($14.99/mo)', percentage: 30, 'High Eng.': 18.2, 'Med Eng.': 32.1, 'Low Eng.': 38.7 },
        { label: 'Essential Annual ($119.99/yr)', percentage: 40, 'High Eng.': 24.6, 'Med Eng.': 43.8, 'Low Eng.': 52.4 },
        { label: 'Premium ($199.99/yr)', percentage: 21, 'High Eng.': 38.4, 'Med Eng.': 18.2, 'Low Eng.': 6.3 },
        { label: 'Ultimate ($299.99/yr)', percentage: 6, 'High Eng.': 14.2, 'Med Eng.': 3.8, 'Low Eng.': 0.5 },
        { label: 'None of these', percentage: 3, 'High Eng.': 4.6, 'Med Eng.': 2.1, 'Low Eng.': 2.1 }
      ]
    }
  ],
  createdAt: new Date('2026-01-12T11:20:00Z')
};

export const mubiConversation2: Conversation = {
  id: 'conv-mubi-002',
  query: 'Which tier would US subscribers choose with the new structure?',
  title: 'US Market Tier Migration',
  audience: mubiUSAudience,
  status: 'complete',
  thinkingTime: 22.1,
  explanation: 'Research analyzed US subscriber tier preferences across Basic/Go segments and engagement levels, with deep-dive on churn risk factors.',
  processSteps: [
    { id: '1', label: 'Building US audience model', status: 'complete' },
    { id: '2', label: 'Weighting by engagement', status: 'complete' },
    { id: '3', label: 'Recruiting 3,156 respondents', status: 'complete' },
    { id: '4', label: 'Running migration analysis', status: 'complete' }
  ],
  messages: [
    {
      id: 'msg-002-1',
      role: 'user',
      content: 'Current tiers: **MUBI Basic** ($14.99/mo) and **MUBI Go** ($19.99/mo + cinema tickets).\n\nNew tiers we\'re testing:\n- **Essential** — $14.99/mo, 1080p (downgrade from current 4K)\n- **Premium** — $199.99/yr, 4K + 12 cinema credits/year\n- **Ultimate** — $299.99/yr, unlimited cinema\n\n**I want to understand which tier US subscribers would choose.**'
    },
    {
      id: 'msg-002-2',
      role: 'assistant',
      content: 'To build the right synthetic audience, I need:\n\n1. Current Basic vs Go subscriber split?\n2. Engagement weighting (high/medium/low)?\n3. Any specific regions within the US?',
      clarification: {
        type: 'clarification',
        missing_info: 'I need audience composition details to weight the synthetic panel correctly.',
        suggestions: ['97% Basic, 3% Go', 'Even split Basic/Go', 'Use global averages']
      }
    },
    {
      id: 'msg-002-3',
      role: 'user',
      content: '97% Basic, 3% Go. Weight by engagement: 20% high, 50% medium, 30% low.'
    },
    {
      id: 'msg-002-4',
      role: 'assistant',
      content: 'Here are the tier selection responses from 3,156 US subscribers:',
      thinkingTime: 5.1,
      canvas: mubiUSTierReport
    },
    {
      id: 'msg-002-5',
      role: 'user',
      content: 'Why did some say "none" if Essential is basically the same as their current plan?'
    },
    {
      id: 'msg-002-6',
      role: 'assistant',
      content: 'Here\'s a focus group with the "None" respondents:',
      thinkingTime: 5.8,
      canvas: mubiUSWhyNoneReport
    },
    {
      id: 'msg-002-7',
      role: 'user',
      content: 'Can you show me how cinema attendance correlates with tier preference?'
    },
    {
      id: 'msg-002-8',
      role: 'assistant',
      content: 'Here\'s the heatmap of tier preference by expected cinema ticket usage:',
      thinkingTime: 2.4,
      canvas: mubiUSCinemaHeatmap
    },
    {
      id: 'msg-002-9',
      role: 'user',
      content: 'Break down the tier selection by engagement level.'
    },
    {
      id: 'msg-002-10',
      role: 'assistant',
      content: 'Here\'s the breakdown by engagement:',
      thinkingTime: 1.9,
      canvas: mubiUSEngagementReport
    }
  ],
  canvas: mubiUSEngagementReport
};

// Conversation 3: Premium Messaging Test
const mubiABTestReport: Report = {
  id: 'canvas-mubi-c01',
  title: 'Premium Messaging A/B Test',
  type: 'quantitative',
  audience: mubiPotentialUpgradersAudience,
  respondents: 2500,
  abstract: 'Cinema-led messaging (Message A) outperforms quality-led (Message B) with 56% positive intent vs 47%. "Very likely" responses are 30% higher for the cinema-first approach.',
  questions: [
    {
      id: 'q1-variant-a',
      question: 'How likely are you to subscribe to MUBI Premium? (Message A: Cinema-led)',
      respondents: 1248,
      options: [
        { label: 'Very likely', percentage: 24.2 },
        { label: 'Somewhat likely', percentage: 31.8 },
        { label: 'Neutral', percentage: 22.4 },
        { label: 'Somewhat unlikely', percentage: 14.2 },
        { label: 'Very unlikely', percentage: 7.4 }
      ]
    },
    {
      id: 'q1-variant-b',
      question: 'How likely are you to subscribe to MUBI Premium? (Message B: Quality-led)',
      respondents: 1252,
      options: [
        { label: 'Very likely', percentage: 18.6 },
        { label: 'Somewhat likely', percentage: 28.4 },
        { label: 'Neutral', percentage: 26.8 },
        { label: 'Somewhat unlikely', percentage: 16.2 },
        { label: 'Very unlikely', percentage: 10.0 }
      ]
    }
  ],
  createdAt: new Date('2026-01-12T14:00:00Z')
};

const mubiCinemaAppealReport: Report = {
  id: 'canvas-mubi-c02',
  title: 'Message Appeal × Cinema Attendance',
  type: 'quantitative',
  audience: mubiPotentialUpgradersAudience,
  respondents: 2500,
  abstract: 'Cinema-led messaging (A) dramatically outperforms with regular cinema-goers: 42% "very appealing" vs 24% for quality-led. Non-cinema-goers show preference for quality messaging (18% vs 12%).',
  questions: [
    {
      id: 'q2-appeal-crosstab',
      question: 'How appealing is this offer? (by cinema attendance)',
      respondents: 2500,
      segments: ['Non-cinema-goers', 'Occasional (1-4x/yr)', 'Regular (monthly+)'],
      options: [
        { label: 'Msg A: Very appealing', percentage: 27, 'Non-cinema-goers': 12, 'Occasional (1-4x/yr)': 28, 'Regular (monthly+)': 42 },
        { label: 'Msg A: Somewhat appealing', percentage: 30, 'Non-cinema-goers': 24, 'Occasional (1-4x/yr)': 34, 'Regular (monthly+)': 31 },
        { label: 'Msg B: Very appealing', percentage: 21, 'Non-cinema-goers': 18, 'Occasional (1-4x/yr)': 22, 'Regular (monthly+)': 24 },
        { label: 'Msg B: Somewhat appealing', percentage: 29, 'Non-cinema-goers': 28, 'Occasional (1-4x/yr)': 30, 'Regular (monthly+)': 28 }
      ]
    }
  ],
  createdAt: new Date('2026-01-12T14:10:00Z')
};

const mubiWhyMessageAReport: Report = {
  id: 'canvas-mubi-c03',
  title: 'Why Message A Resonates',
  type: 'qualitative',
  audience: mubiPotentialUpgradersAudience,
  respondents: 18,
  abstract: 'Concrete value proposition drives preference (12 mentions). The cinema ticket is tangible and immediately understood, while 4K/Dolby Atmos feels like generic streaming marketing.',
  questions: [],
  themes: [
    {
      id: 'theme-concrete',
      topic: 'Concrete Value',
      sentiment: 'positive',
      summary: 'Participants gravitate toward the cinema ticket because it represents a clear, quantifiable benefit they can immediately understand.',
      quotes: [
        { text: 'Free cinema ticket is something I can immediately understand the value of.', attribution: 'Participant 3, 29' },
        { text: 'I know exactly what I\'m getting — a ticket every week.', attribution: 'Participant 8, 34' },
        { text: 'I can do the math: 4 tickets a month is like $60 value. That makes sense.', attribution: 'Participant 14, 31' }
      ]
    },
    {
      id: 'theme-unique',
      topic: 'Lead with the Unique Benefit',
      sentiment: 'positive',
      summary: 'The cinema ticket differentiates MUBI from other streaming services, while 4K feels like table stakes.',
      quotes: [
        { text: 'Every streaming service has 4K now, the cinema tickets are what makes this different.', attribution: 'Participant 5, 27' },
        { text: 'The ticket thing is what caught my attention first.', attribution: 'Participant 11, 32' }
      ]
    },
    {
      id: 'theme-language',
      topic: 'Simpler Language',
      sentiment: 'positive',
      summary: 'Message A uses straightforward language while Message B sounds like generic marketing copy.',
      quotes: [
        { text: 'The other one sounds like marketing speak.', attribution: 'Participant 2, 28' },
        { text: 'Message A just tells me what I get without the fluff.', attribution: 'Participant 16, 36' }
      ]
    }
  ],
  createdAt: new Date('2026-01-12T14:20:00Z')
};

const mubiThreeWayReport: Report = {
  id: 'canvas-mubi-c04',
  title: 'Three-Way Message Comparison',
  type: 'quantitative',
  audience: mubiPotentialUpgradersAudience,
  respondents: 2500,
  abstract: 'Combined message (C) outperforms both originals with 61.6% positive intent. Leading with cinema then adding quality credentials yields the highest "very likely" response at 28.4%.',
  questions: [
    {
      id: 'q3-three-way',
      question: 'How likely are you to subscribe based on this message?',
      respondents: 2500,
      segments: ['Msg A (Cinema)', 'Msg B (Quality)', 'Msg C (Combined)'],
      options: [
        { label: 'Very likely', percentage: 24, 'Msg A (Cinema)': 24.2, 'Msg B (Quality)': 18.6, 'Msg C (Combined)': 28.4 },
        { label: 'Somewhat likely', percentage: 31, 'Msg A (Cinema)': 31.8, 'Msg B (Quality)': 28.4, 'Msg C (Combined)': 33.2 },
        { label: 'Neutral', percentage: 23, 'Msg A (Cinema)': 22.4, 'Msg B (Quality)': 26.8, 'Msg C (Combined)': 20.1 },
        { label: 'Somewhat unlikely', percentage: 14, 'Msg A (Cinema)': 14.2, 'Msg B (Quality)': 16.2, 'Msg C (Combined)': 12.4 },
        { label: 'Very unlikely', percentage: 8, 'Msg A (Cinema)': 7.4, 'Msg B (Quality)': 10.0, 'Msg C (Combined)': 5.9 }
      ]
    }
  ],
  createdAt: new Date('2026-01-12T14:30:00Z')
};

export const mubiConversation3: Conversation = {
  id: 'conv-mubi-003',
  query: 'Which messaging resonates better for Premium tier positioning?',
  title: 'Premium Messaging Test',
  audience: mubiPotentialUpgradersAudience,
  status: 'complete',
  thinkingTime: 24.6,
  explanation: 'A/B tested cinema-led vs quality-led messaging for Premium tier, with focus group deep-dive on preference drivers.',
  processSteps: [
    { id: '1', label: 'Designing A/B test', status: 'complete' },
    { id: '2', label: 'Randomizing 2,500 respondents', status: 'complete' },
    { id: '3', label: 'Running message exposure', status: 'complete' },
    { id: '4', label: 'Analyzing preference patterns', status: 'complete' }
  ],
  messages: [
    {
      id: 'msg-003-1',
      role: 'user',
      content: 'We\'re testing two different ways to position MUBI Premium. Want to understand which messaging resonates better.\n\n**Message A (Cinema-led):** "Get a free cinema ticket every week. Plus 4K streaming, offline downloads, and early access to MUBI releases."\n\n**Message B (Quality-led):** "Experience cinema the way directors intended. 4K with Dolby Atmos, plus weekly cinema tickets and exclusive early access."'
    },
    {
      id: 'msg-003-2',
      role: 'assistant',
      content: 'I\'ll test both messages with your target audience. I\'ll measure:\n\n1. **Appeal** — How appealing is this offer?\n2. **Clarity** — How clear is the value proposition?\n3. **Purchase Intent** — How likely to subscribe?\n\nShall I run this as an A/B test?'
    },
    {
      id: 'msg-003-3',
      role: 'user',
      content: 'Yes please. Split test them with potential upgraders.'
    },
    {
      id: 'msg-003-4',
      role: 'assistant',
      content: 'Here are the A/B test results:',
      thinkingTime: 6.4,
      canvas: mubiABTestReport
    },
    {
      id: 'msg-003-5',
      role: 'user',
      content: 'Interesting! Can you break down the results by whether they currently go to the cinema?'
    },
    {
      id: 'msg-003-6',
      role: 'assistant',
      content: 'Here\'s how cinema-goers vs non-cinema-goers responded:',
      thinkingTime: 2.1,
      canvas: mubiCinemaAppealReport
    },
    {
      id: 'msg-003-7',
      role: 'user',
      content: 'Can we run a focus group to understand what\'s driving the preference for Message A?'
    },
    {
      id: 'msg-003-8',
      role: 'assistant',
      content: 'Here are the focus group insights from respondents who preferred Message A:',
      thinkingTime: 5.6,
      canvas: mubiWhyMessageAReport
    },
    {
      id: 'msg-003-9',
      role: 'user',
      content: 'Let\'s test a third variant that combines both approaches: "Get a free cinema ticket every week — experience films the way directors intended, in 4K with Dolby Atmos."'
    },
    {
      id: 'msg-003-10',
      role: 'assistant',
      content: 'Here\'s how the new variant performed against the original two:',
      thinkingTime: 4.8,
      canvas: mubiThreeWayReport
    }
  ],
  canvas: mubiThreeWayReport
};

// All MUBI conversations grouped together
export const mubiConversations: Conversation[] = [
  mubiConversation1,
  mubiConversation2,
  mubiConversation3
];

// MUBI recent questions
export const mubiRecentQuestions = [
  { id: 'rq-mubi-1', text: 'How would our existing basic subscribers react to new subscription tiers?', timestamp: '2026-01-12' },
  { id: 'rq-mubi-2', text: 'Which tier would US subscribers choose with the new structure?', timestamp: '2026-01-12' },
  { id: 'rq-mubi-3', text: 'Which messaging resonates better for Premium tier positioning?', timestamp: '2026-01-12' }
];

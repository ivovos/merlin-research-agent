import { Audience, ProcessStep, Report, Conversation } from '../types';

export const mockAudience: Audience = {
  id: 'times-readers',
  name: 'Times Readers',
  icon: 'T'
};

export const mockAudiences: Audience[] = [
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
    }, // ... more themes
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
  query: rep.questions[0].question, // Use first question as the query
  messages: [
    { id: `msg_u_${i}`, role: 'user', content: rep.questions[0].question },
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
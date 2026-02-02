import type { Audience } from './audience';

// Study plan captures the method configuration used to generate the canvas
export interface StudyPlan {
  title: string; // Short, concise title for this study (e.g., "Mubi Retention Drivers")
  methodId: string;
  methodName: string;
  variantId?: string | null;
  variantName?: string;
  formData: Record<string, unknown>;
}

export interface QuestionOption {
  label: string;
  percentage: number;
  [key: string]: string | number; // Allow dynamic segment keys
}

export interface QuestionResult {
  id: string;
  title?: string; // Short insight header/key finding (e.g., "Overall Perception of Trump")
  question: string; // The actual survey question asked (e.g., "What is your overall perception of Donald Trump?")
  respondents: number;
  options: QuestionOption[];
  segments?: string[]; // Optional list of segments being compared
}

export interface QualitativeTheme {
  id: string;
  topic: string;
  sentiment: 'positive' | 'negative' | 'neutral' | 'mixed';
  summary: string;
  quotes: Array<{
    text: string;
    attribution: string;
  }>;
}

export interface Canvas {
  id: string;
  title: string;
  type?: 'quantitative' | 'qualitative';
  audience: Audience;
  respondents: number;
  abstract: string;
  keyInsight?: string; // Short highlight of the key finding
  followUpSuggestion?: string; // Agent's suggestion for what to explore next
  questions: QuestionResult[];
  themes?: QualitativeTheme[];
  createdAt: Date;
  version?: number; // For canvas versioning
  studyPlan?: StudyPlan; // Method configuration used to generate this canvas
}

// Backwards compatibility alias
export type Report = Canvas;

import type { Audience } from './audience';

export interface QuestionOption {
  label: string;
  percentage: number;
  [key: string]: string | number; // Allow dynamic segment keys
}

export interface QuestionResult {
  id: string;
  question: string;
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
}

// Backwards compatibility alias
export type Report = Canvas;

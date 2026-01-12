import type { Audience } from './audience';
import type { Report } from './report';

export interface ProcessStep {
  id: string;
  label: string;
  status: 'pending' | 'in-progress' | 'complete';
  progress?: number; // 0 to 100
  totalResponses?: number; // For visualization
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  processSteps?: ProcessStep[];
  report?: Report;
  thinkingTime?: number;
}

export interface Conversation {
  id: string;
  query: string;
  messages: Message[];
  audience: Audience;
  processSteps: ProcessStep[];
  thinkingTime: number; // seconds
  explanation: string;
  report: Report | null;
  status: 'idle' | 'processing' | 'complete';
}

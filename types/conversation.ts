import type { Audience } from './audience';
import type { Canvas, StudyPlan } from './canvas';
import type { ClarificationRequest } from './agentResponse';

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
  canvas?: Canvas;
  studyPlan?: StudyPlan; // For planning messages (before results)
  studyPlanEditable?: boolean; // Whether the study plan pill shows Edit button
  thinkingTime?: number;
  clarification?: ClarificationRequest; // Agent needs more info
}

export interface Conversation {
  id: string;
  query: string;
  title?: string; // Generated concise title
  messages: Message[];
  audience: Audience;
  processSteps: ProcessStep[];
  thinkingTime: number; // seconds
  explanation: string;
  canvas: Canvas | null;
  status: 'idle' | 'processing' | 'complete';
  updatedAt?: number; // Timestamp for sorting by recency (set on create/modify)
}

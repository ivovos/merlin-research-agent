import type { Audience } from './audience';
import type { Canvas } from './canvas';

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
  thinkingTime?: number;
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
}

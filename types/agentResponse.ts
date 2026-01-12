// Types for Merlin Agent responses

import type { Canvas } from './canvas'

// Clarification request from agent
export interface ClarificationRequest {
  type: 'clarification'
  missing_info: string
  reason?: string
  suggestions: string[]
}

// Research tool selection by agent
export interface ToolSelection {
  name: string
  input: Record<string, unknown>
}

// Agent's decision response
export interface AgentDecision {
  type: 'research' | 'clarification'
  tools?: ToolSelection[]
  clarification?: ClarificationRequest
}

// Result from executing a research tool
export interface ResearchToolResult {
  toolName: string
  canvas: Canvas
}

// Combined result that can be clarification OR one or more canvases
export interface AgentResult {
  type: 'clarification' | 'single_canvas' | 'multi_canvas'
  clarification?: ClarificationRequest
  canvases?: Canvas[]
  processSteps?: string[]
  explanation?: string
}

// Heatmap data structure (for new canvas type)
export interface HeatmapData {
  categories: Array<{
    name: string
    score: number // 0-100 intensity
    subcategories?: Array<{
      name: string
      score: number
    }>
  }>
}

// Sentiment data structure (for new canvas type)
export interface SentimentData {
  topics: Array<{
    name: string
    overall: 'positive' | 'negative' | 'neutral' | 'mixed'
    score: number // -100 to 100
    breakdown: {
      positive: number
      negative: number
      neutral: number
    }
    drivers: Array<{
      factor: string
      impact: 'positive' | 'negative'
      strength: number // 0-100
    }>
  }>
}

// Comparison data structure (for new canvas type)
export interface ComparisonData {
  segments: string[]
  metrics: Array<{
    name: string
    values: Record<string, number> // segment name -> value
    unit?: string // e.g., "%", "score"
  }>
}

// Extended canvas type to support new research formats
export type CanvasType =
  | 'quantitative'
  | 'qualitative'
  | 'heatmap'
  | 'sentiment'
  | 'comparison'

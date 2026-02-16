import React, { useState, useCallback } from 'react'
import {
  Sparkles,
  Pencil,
  LayoutTemplate,
  Plus,
  ChevronUp,
  ChevronDown,
  Trash2,
  Lightbulb,
  Loader2,
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import type { SurveyType, SurveyQuestion, Stimulus, QuestionType } from '@/types'

// ── Question type metadata ──

const QUESTION_TYPE_META: { value: QuestionType; label: string; hasOptions: boolean }[] = [
  { value: 'single_select', label: 'Single Select', hasOptions: true },
  { value: 'multi_select', label: 'Multi Select', hasOptions: true },
  { value: 'likert', label: 'Likert Scale', hasOptions: false },
  { value: 'rating', label: 'Rating', hasOptions: false },
  { value: 'nps', label: 'NPS', hasOptions: false },
  { value: 'open_text', label: 'Open Text', hasOptions: false },
  { value: 'yes_no', label: 'Yes / No', hasOptions: false },
  { value: 'slider', label: 'Slider', hasOptions: false },
  { value: 'scale', label: 'Numeric Scale', hasOptions: false },
  { value: 'ranking', label: 'Ranking', hasOptions: true },
  { value: 'maxdiff', label: 'MaxDiff', hasOptions: true },
  { value: 'matrix', label: 'Matrix', hasOptions: true },
  { value: 'image_choice', label: 'Image Choice', hasOptions: true },
  { value: 'semantic_differential', label: 'Semantic Differential', hasOptions: false },
  { value: 'heatmap', label: 'Heatmap', hasOptions: false },
  { value: 'video_response', label: 'Video Response', hasOptions: false },
  { value: 'card_sort', label: 'Card Sort', hasOptions: true },
  { value: 'conjoint', label: 'Conjoint', hasOptions: true },
  { value: 'paired_comparison', label: 'Paired Comparison', hasOptions: true },
]

const QUESTION_TYPE_LABEL: Record<QuestionType, string> = Object.fromEntries(
  QUESTION_TYPE_META.map(m => [m.value, m.label])
) as Record<QuestionType, string>

function questionTypeHasOptions(type: QuestionType): boolean {
  return QUESTION_TYPE_META.find(m => m.value === type)?.hasOptions ?? false
}

// ── Mock AI question templates per survey type ──

function generateMockQuestions(surveyType: SurveyType): SurveyQuestion[] {
  const id = () => `q-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`

  const templates: Record<SurveyType, SurveyQuestion[]> = {
    simple: [
      { id: id(), type: 'single_select', text: 'How satisfied are you with our service?', options: ['Very satisfied', 'Satisfied', 'Neutral', 'Dissatisfied', 'Very dissatisfied'], required: true, aiSuggestion: 'Standard 5-point satisfaction scale — consider adding a follow-up open text for low scores.' },
      { id: id(), type: 'nps', text: 'How likely are you to recommend us to a friend or colleague?', required: true, scale: { min: 0, max: 10, minLabel: 'Not at all likely', maxLabel: 'Extremely likely' }, aiSuggestion: 'Classic NPS question. Follow with an open text asking "Why?" for actionable insights.' },
      { id: id(), type: 'multi_select', text: 'Which of the following features do you use regularly?', options: ['Dashboard', 'Reports', 'Notifications', 'API access', 'Mobile app'], required: true },
      { id: id(), type: 'open_text', text: 'What is the one thing we could improve?', required: false, aiSuggestion: 'Open text at end reduces fatigue. Consider making optional to improve completion rates.' },
    ],
    concept: [
      { id: id(), type: 'likert', text: 'How appealing do you find this concept?', required: true, scale: { min: 1, max: 5, minLabel: 'Not at all appealing', maxLabel: 'Extremely appealing' }, aiSuggestion: 'Standard appeal measure for concept testing.' },
      { id: id(), type: 'likert', text: 'How relevant is this concept to your needs?', required: true, scale: { min: 1, max: 5, minLabel: 'Not at all relevant', maxLabel: 'Extremely relevant' } },
      { id: id(), type: 'single_select', text: 'How likely are you to purchase this product?', options: ['Definitely would', 'Probably would', 'Might or might not', 'Probably would not', 'Definitely would not'], required: true, aiSuggestion: 'Purchase intent is the key KPI for concept tests. Use a 5-point scale for norm comparisons.' },
      { id: id(), type: 'single_select', text: 'How unique is this concept compared to what is currently available?', options: ['Very unique', 'Somewhat unique', 'Neither unique nor common', 'Somewhat common', 'Very common'], required: true },
      { id: id(), type: 'open_text', text: 'What do you like most about this concept?', required: false },
      { id: id(), type: 'open_text', text: 'What concerns do you have about this concept?', required: false },
    ],
    message: [
      { id: id(), type: 'likert', text: 'How clear is the main message?', required: true, scale: { min: 1, max: 5, minLabel: 'Not at all clear', maxLabel: 'Extremely clear' } },
      { id: id(), type: 'likert', text: 'How believable is this message?', required: true, scale: { min: 1, max: 5, minLabel: 'Not at all believable', maxLabel: 'Extremely believable' } },
      { id: id(), type: 'likert', text: 'How persuasive is this message?', required: true, scale: { min: 1, max: 5, minLabel: 'Not at all persuasive', maxLabel: 'Extremely persuasive' } },
      { id: id(), type: 'single_select', text: 'Which message resonates most with you?', options: ['Message A', 'Message B', 'Message C', 'None of them'], required: true },
      { id: id(), type: 'open_text', text: 'In your own words, what is the main message saying?', required: false, aiSuggestion: 'Playback question to test comprehension — key for message testing.' },
    ],
    creative: [
      { id: id(), type: 'likert', text: 'How much do you like this ad?', required: true, scale: { min: 1, max: 5, minLabel: 'Dislike a lot', maxLabel: 'Like a lot' } },
      { id: id(), type: 'likert', text: 'How attention-grabbing is this ad?', required: true, scale: { min: 1, max: 5, minLabel: 'Not at all', maxLabel: 'Extremely' }, aiSuggestion: 'Stopping power is critical for OOH and social creative.' },
      { id: id(), type: 'single_select', text: 'After seeing this ad, how likely are you to find out more?', options: ['Very likely', 'Somewhat likely', 'Neither likely nor unlikely', 'Somewhat unlikely', 'Very unlikely'], required: true },
      { id: id(), type: 'single_select', text: 'Which brand do you think this ad is for?', options: ['Brand A', 'Brand B', 'Brand C', 'Don\'t know'], required: true, aiSuggestion: 'Unbranded first exposure measures spontaneous brand attribution.' },
      { id: id(), type: 'open_text', text: 'What, if anything, would you change about this ad?', required: false },
    ],
    audience_exploration: [
      { id: id(), type: 'multi_select', text: 'Which of the following activities do you regularly engage in?', options: ['Online shopping', 'Social media', 'Streaming TV', 'Podcasts', 'Gaming', 'Fitness'], required: true },
      { id: id(), type: 'likert', text: 'How important is sustainability to you when making purchase decisions?', required: true, scale: { min: 1, max: 5, minLabel: 'Not at all important', maxLabel: 'Extremely important' } },
      { id: id(), type: 'ranking', text: 'Rank the following factors by importance when choosing a brand:', options: ['Price', 'Quality', 'Sustainability', 'Convenience', 'Brand reputation'], required: true },
      { id: id(), type: 'slider', text: 'How much do you typically spend per month on groceries?', required: true, scale: { min: 0, max: 500, minLabel: '£0', maxLabel: '£500+' } },
      { id: id(), type: 'open_text', text: 'Describe your ideal shopping experience in a few words.', required: false },
    ],
  }

  return templates[surveyType] || templates.simple
}

// ── Template question sets ──

function getTemplateQuestions(surveyType: SurveyType): { name: string; questions: SurveyQuestion[] }[] {
  const id = () => `q-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`

  return [
    {
      name: 'Standard Concept Test',
      questions: [
        { id: id(), type: 'likert', text: 'How appealing is this concept?', required: true, scale: { min: 1, max: 5, minLabel: 'Not at all', maxLabel: 'Extremely' } },
        { id: id(), type: 'likert', text: 'How relevant is this concept to you?', required: true, scale: { min: 1, max: 5, minLabel: 'Not at all', maxLabel: 'Extremely' } },
        { id: id(), type: 'single_select', text: 'How likely are you to purchase?', options: ['Definitely', 'Probably', 'Maybe', 'Probably not', 'Definitely not'], required: true },
        { id: id(), type: 'single_select', text: 'How unique is this concept?', options: ['Very unique', 'Somewhat unique', 'Not unique'], required: true },
        { id: id(), type: 'open_text', text: 'What do you like most?', required: false },
      ],
    },
    {
      name: 'Quick Brand Pulse',
      questions: [
        { id: id(), type: 'nps', text: 'How likely are you to recommend this brand?', required: true, scale: { min: 0, max: 10, minLabel: 'Not likely', maxLabel: 'Very likely' } },
        { id: id(), type: 'likert', text: 'How favourably do you view this brand?', required: true, scale: { min: 1, max: 5, minLabel: 'Very unfavourably', maxLabel: 'Very favourably' } },
        { id: id(), type: 'open_text', text: 'What comes to mind when you think of this brand?', required: false },
      ],
    },
    {
      name: 'Customer Satisfaction',
      questions: [
        { id: id(), type: 'likert', text: 'Overall, how satisfied are you?', required: true, scale: { min: 1, max: 5, minLabel: 'Very dissatisfied', maxLabel: 'Very satisfied' } },
        { id: id(), type: 'multi_select', text: 'Which areas need improvement?', options: ['Speed', 'Quality', 'Price', 'Service', 'Selection'], required: true },
        { id: id(), type: 'open_text', text: 'Any additional feedback?', required: false },
      ],
    },
  ]
}

// ── Helper: create empty question ──

function createEmptyQuestion(): SurveyQuestion {
  return {
    id: `q-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    type: 'single_select',
    text: '',
    options: ['Option 1', 'Option 2'],
    required: true,
  }
}

// ── Props ──

interface QuestionsStepProps {
  surveyType: SurveyType
  buildMethod: 'ai' | 'manual' | 'template' | null
  buildPhase: 'gateway' | 'editor'
  questions: SurveyQuestion[]
  stimuli: Stimulus[]
  activeQuestionId: string | null
  onSetBuildMethod: (method: 'ai' | 'manual' | 'template') => void
  onSetBuildPhase: (phase: 'gateway' | 'editor') => void
  onAddQuestion: (question: SurveyQuestion) => void
  onUpdateQuestion: (id: string, updates: Partial<SurveyQuestion>) => void
  onRemoveQuestion: (id: string) => void
  onReorderQuestions: (questions: SurveyQuestion[]) => void
  onSetActiveQuestion: (id: string | null) => void
  onGenerateQuestions: (questions: SurveyQuestion[]) => void
}

// ── Gateway Phase ──

const QuestionsGateway: React.FC<{
  surveyType: SurveyType
  onSelectAI: () => void
  onSelectManual: () => void
  onSelectTemplate: (questions: SurveyQuestion[]) => void
  isGenerating: boolean
}> = ({ surveyType, onSelectAI, onSelectManual, onSelectTemplate, isGenerating }) => {
  const [showTemplates, setShowTemplates] = useState(false)
  const templates = getTemplateQuestions(surveyType)

  if (isGenerating) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-4 animate-in fade-in">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        <div className="text-center">
          <p className="text-sm font-medium">Generating questions...</p>
          <p className="text-xs text-muted-foreground mt-1">
            Tailoring questions for your {surveyType.replace('_', ' ')} survey
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-display font-semibold">How do you want to add questions?</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Choose a method to build your questionnaire.
        </p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <Card
          onClick={onSelectAI}
          className="cursor-pointer p-4 transition-all duration-150 hover:bg-accent/50 hover:shadow-sm"
        >
          <Sparkles className="w-5 h-5 text-muted-foreground mb-2" />
          <h3 className="text-sm font-semibold">Generate with AI</h3>
          <p className="text-xs text-muted-foreground mt-1">
            AI generates questions based on your survey type and objectives.
          </p>
        </Card>

        <Card
          onClick={onSelectManual}
          className="cursor-pointer p-4 transition-all duration-150 hover:bg-accent/50 hover:shadow-sm"
        >
          <Pencil className="w-5 h-5 text-muted-foreground mb-2" />
          <h3 className="text-sm font-semibold">Build From Scratch</h3>
          <p className="text-xs text-muted-foreground mt-1">
            Add questions one by one with full control over types and options.
          </p>
        </Card>

        <Card
          onClick={() => setShowTemplates(!showTemplates)}
          className={cn(
            'cursor-pointer p-4 transition-all duration-150 hover:shadow-sm',
            showTemplates ? 'border-foreground bg-accent' : 'hover:bg-accent/50',
          )}
        >
          <LayoutTemplate className="w-5 h-5 text-muted-foreground mb-2" />
          <h3 className="text-sm font-semibold">Pick a Template</h3>
          <p className="text-xs text-muted-foreground mt-1">
            Start from a pre-built question set and customise.
          </p>
        </Card>
      </div>

      {/* Template list */}
      {showTemplates && (
        <div className="space-y-2 animate-in fade-in duration-200">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Templates
          </p>
          {templates.map((tmpl) => (
            <button
              key={tmpl.name}
              onClick={() => onSelectTemplate(tmpl.questions)}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-md text-left hover:bg-accent/50 border border-transparent hover:border-border transition-colors"
            >
              <div>
                <span className="text-sm font-medium">{tmpl.name}</span>
                <span className="text-xs text-muted-foreground ml-2">
                  {tmpl.questions.length} questions
                </span>
              </div>
              <Badge variant="secondary" className="text-[10px]">Use</Badge>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Question Editor (right panel) ──

const QuestionEditor: React.FC<{
  question: SurveyQuestion
  questionIndex: number
  totalQuestions: number
  onUpdate: (updates: Partial<SurveyQuestion>) => void
  onRemove: () => void
}> = ({ question, questionIndex, totalQuestions, onUpdate, onRemove }) => {
  const typeHasOptions = questionTypeHasOptions(question.type)
  const isScaleType = ['likert', 'nps', 'scale', 'slider', 'rating'].includes(question.type)

  return (
    <div className="space-y-5 p-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">
          Question {questionIndex + 1} of {totalQuestions}
        </span>
        <Button
          variant="ghost"
          size="sm"
          onClick={onRemove}
          className="text-destructive hover:text-destructive h-7 px-2"
        >
          <Trash2 className="w-3.5 h-3.5 mr-1" />
          Delete
        </Button>
      </div>

      {/* Question text */}
      <div className="space-y-1.5">
        <Label className="text-xs">Question text</Label>
        <Textarea
          value={question.text}
          onChange={(e) => onUpdate({ text: e.target.value })}
          placeholder="Type your question here..."
          className="text-base font-medium min-h-[60px] resize-none"
        />
      </div>

      {/* Question type */}
      <div className="space-y-1.5">
        <Label className="text-xs">Question type</Label>
        <Select
          value={question.type}
          onValueChange={(val: QuestionType) => {
            const updates: Partial<SurveyQuestion> = { type: val }
            // Reset options when switching to a type that doesn't use them
            if (!questionTypeHasOptions(val)) {
              updates.options = undefined
            } else if (!question.options || question.options.length === 0) {
              updates.options = ['Option 1', 'Option 2']
            }
            // Add default scale for scale types
            if (['likert', 'nps', 'scale', 'slider', 'rating'].includes(val) && !question.scale) {
              updates.scale = val === 'nps'
                ? { min: 0, max: 10, minLabel: 'Not at all likely', maxLabel: 'Extremely likely' }
                : { min: 1, max: 5, minLabel: 'Low', maxLabel: 'High' }
            }
            onUpdate(updates)
          }}
        >
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {QUESTION_TYPE_META.map((meta) => (
              <SelectItem key={meta.value} value={meta.value}>
                {meta.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Answer options (for types that have them) */}
      {typeHasOptions && (
        <div className="space-y-2">
          <Label className="text-xs">Answer options</Label>
          {(question.options || []).map((opt, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground w-5 text-center shrink-0">
                {question.type === 'single_select' ? '○' : '☐'}
              </span>
              <Input
                value={opt}
                onChange={(e) => {
                  const newOpts = [...(question.options || [])]
                  newOpts[i] = e.target.value
                  onUpdate({ options: newOpts })
                }}
                className="h-8 text-sm"
              />
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 shrink-0"
                onClick={() => {
                  const newOpts = (question.options || []).filter((_, idx) => idx !== i)
                  onUpdate({ options: newOpts })
                }}
                disabled={(question.options || []).length <= 2}
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
          ))}
          <Button
            variant="outline"
            size="sm"
            className="h-7 text-xs"
            onClick={() => {
              const newOpts = [...(question.options || []), `Option ${(question.options || []).length + 1}`]
              onUpdate({ options: newOpts })
            }}
          >
            <Plus className="w-3 h-3 mr-1" />
            Add option
          </Button>
        </div>
      )}

      {/* Scale config (for scale types) */}
      {isScaleType && question.scale && (
        <div className="space-y-2">
          <Label className="text-xs">Scale</Label>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-[10px] text-muted-foreground">Min label</Label>
              <Input
                value={question.scale.minLabel || ''}
                onChange={(e) => onUpdate({ scale: { ...question.scale!, minLabel: e.target.value } })}
                className="h-8 text-sm"
                placeholder="e.g. Not at all"
              />
            </div>
            <div>
              <Label className="text-[10px] text-muted-foreground">Max label</Label>
              <Input
                value={question.scale.maxLabel || ''}
                onChange={(e) => onUpdate({ scale: { ...question.scale!, maxLabel: e.target.value } })}
                className="h-8 text-sm"
                placeholder="e.g. Extremely"
              />
            </div>
          </div>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span>{question.scale.min} — {question.scale.max}</span>
          </div>
        </div>
      )}

      {/* Settings */}
      <div className="flex items-center gap-6 pt-2">
        <div className="flex items-center gap-2">
          <Switch
            checked={question.required}
            onCheckedChange={(checked) => onUpdate({ required: checked })}
          />
          <Label className="text-xs">Required</Label>
        </div>
      </div>

      {/* AI suggestion */}
      {question.aiSuggestion && (
        <div className="border-l-2 border-foreground/20 bg-muted/50 rounded-r-md p-3 mt-4">
          <div className="flex items-center gap-1.5 mb-1">
            <Lightbulb className="w-3 h-3 text-muted-foreground" />
            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              AI Suggestion
            </span>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {question.aiSuggestion}
          </p>
        </div>
      )}
    </div>
  )
}

// We need X icon for removing options - import it
import { X } from 'lucide-react'

// ── Main QuestionsStep ──

export const QuestionsStep: React.FC<QuestionsStepProps> = ({
  surveyType,
  buildMethod,
  buildPhase,
  questions,
  stimuli,
  activeQuestionId,
  onSetBuildMethod,
  onSetBuildPhase,
  onAddQuestion,
  onUpdateQuestion,
  onRemoveQuestion,
  onReorderQuestions,
  onSetActiveQuestion,
  onGenerateQuestions,
}) => {
  const [isGenerating, setIsGenerating] = useState(false)

  const handleSelectAI = useCallback(() => {
    onSetBuildMethod('ai')
    setIsGenerating(true)
    // Simulate AI generation delay
    setTimeout(() => {
      const mockQuestions = generateMockQuestions(surveyType)
      onGenerateQuestions(mockQuestions)
      setIsGenerating(false)
    }, 1500)
  }, [surveyType, onSetBuildMethod, onGenerateQuestions])

  const handleSelectManual = useCallback(() => {
    onSetBuildMethod('manual')
    const firstQ = createEmptyQuestion()
    onAddQuestion(firstQ)
    onSetBuildPhase('editor')
  }, [onSetBuildMethod, onAddQuestion, onSetBuildPhase])

  const handleSelectTemplate = useCallback((templateQuestions: SurveyQuestion[]) => {
    onSetBuildMethod('template')
    onGenerateQuestions(templateQuestions)
  }, [onSetBuildMethod, onGenerateQuestions])

  const handleMoveQuestion = useCallback((index: number, direction: 'up' | 'down') => {
    const newQuestions = [...questions]
    const targetIndex = direction === 'up' ? index - 1 : index + 1
    if (targetIndex < 0 || targetIndex >= newQuestions.length) return
    ;[newQuestions[index], newQuestions[targetIndex]] = [newQuestions[targetIndex], newQuestions[index]]
    onReorderQuestions(newQuestions)
  }, [questions, onReorderQuestions])

  const activeQuestion = questions.find(q => q.id === activeQuestionId)
  const activeIndex = questions.findIndex(q => q.id === activeQuestionId)

  // Gateway phase
  if (buildPhase === 'gateway') {
    return (
      <QuestionsGateway
        surveyType={surveyType}
        onSelectAI={handleSelectAI}
        onSelectManual={handleSelectManual}
        onSelectTemplate={handleSelectTemplate}
        isGenerating={isGenerating}
      />
    )
  }

  // Editor phase - two-panel layout
  return (
    <div className="h-full flex">
      {/* Left panel: question list — fixed width */}
      <div className="w-[240px] shrink-0 h-full flex flex-col border-r">
        <div className="px-3 py-3 border-b">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Questions ({questions.length})
          </p>
        </div>
        <ScrollArea className="flex-1">
          <div className="p-2 space-y-0.5">
            {questions.map((q, index) => (
              <button
                key={q.id}
                onClick={() => onSetActiveQuestion(q.id)}
                className={cn(
                  'w-full flex items-center gap-2 px-2 py-2 rounded-md text-left transition-colors text-sm',
                  q.id === activeQuestionId
                    ? 'bg-accent text-foreground'
                    : 'hover:bg-accent/50 text-muted-foreground',
                )}
              >
                {/* Number badge */}
                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-muted text-[10px] font-semibold shrink-0">
                  {index + 1}
                </span>

                {/* Question text preview */}
                <span className="flex-1 truncate text-xs">
                  {q.text || 'Untitled question'}
                </span>

                {/* Reorder arrows */}
                <span className="flex flex-col shrink-0">
                  <button
                    onClick={(e) => { e.stopPropagation(); handleMoveQuestion(index, 'up') }}
                    disabled={index === 0}
                    className="p-0.5 hover:bg-muted rounded disabled:opacity-25"
                  >
                    <ChevronUp className="w-3 h-3" />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleMoveQuestion(index, 'down') }}
                    disabled={index === questions.length - 1}
                    className="p-0.5 hover:bg-muted rounded disabled:opacity-25"
                  >
                    <ChevronDown className="w-3 h-3" />
                  </button>
                </span>
              </button>
            ))}
          </div>
        </ScrollArea>
        <div className="p-2 border-t">
          <Button
            variant="outline"
            size="sm"
            className="w-full h-7 text-xs"
            onClick={() => onAddQuestion(createEmptyQuestion())}
          >
            <Plus className="w-3 h-3 mr-1" />
            Add Question
          </Button>
        </div>
      </div>

      {/* Right panel: question editor */}
      <div className="flex-1 h-full overflow-hidden">
          <ScrollArea className="h-full">
            {activeQuestion ? (
              <QuestionEditor
                question={activeQuestion}
                questionIndex={activeIndex}
                totalQuestions={questions.length}
                onUpdate={(updates) => onUpdateQuestion(activeQuestion.id, updates)}
                onRemove={() => onRemoveQuestion(activeQuestion.id)}
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-full py-16 text-center">
                <p className="text-sm text-muted-foreground">
                  {questions.length === 0
                    ? 'Add your first question to get started.'
                    : 'Select a question from the list to edit.'}
                </p>
                {questions.length === 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-3"
                    onClick={() => onAddQuestion(createEmptyQuestion())}
                  >
                    <Plus className="w-3.5 h-3.5 mr-1.5" />
                    Add Question
                  </Button>
                )}
              </div>
            )}
          </ScrollArea>
      </div>
    </div>
  )
}

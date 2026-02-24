import React, { useState, useCallback } from 'react'
import { Upload, FileText, Loader2, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import type { SurveyQuestion, QuestionType } from '@/types'

// ── Proposition Testing Question Bank (extracted from uploaded brief) ──

const PROPOSITION_TESTING_QUESTIONS: Omit<SurveyQuestion, 'id' | 'required'>[] = [
  {
    text: 'Overall, how appealing do you find this proposition?',
    type: 'scale' as QuestionType,
    scale: { min: 1, max: 5, minLabel: 'Not at all appealing', maxLabel: 'Very appealing' },
  },
  {
    text: 'How relevant is this proposition to your needs?',
    type: 'scale' as QuestionType,
    scale: { min: 1, max: 5, minLabel: 'Not at all relevant', maxLabel: 'Very relevant' },
  },
  {
    text: 'This proposition offers something I can\'t easily get elsewhere.',
    type: 'scale' as QuestionType,
    scale: { min: 1, max: 5, minLabel: 'Strongly disagree', maxLabel: 'Strongly agree' },
  },
  {
    text: 'How well do you feel you understand what is being offered?',
    type: 'scale' as QuestionType,
    scale: { min: 1, max: 5, minLabel: 'Did not understand at all', maxLabel: 'Understood completely' },
  },
  {
    text: 'In your own words, what is being offered here?',
    type: 'open_text' as QuestionType,
  },
  {
    text: 'How believable are the claims made in this proposition?',
    type: 'scale' as QuestionType,
    scale: { min: 1, max: 5, minLabel: 'Not at all believable', maxLabel: 'Very believable' },
  },
  {
    text: 'Was there anything that made you doubt the claims? If so, what?',
    type: 'open_text' as QuestionType,
  },
  {
    text: 'How likely would you be to purchase / sign up for this?',
    type: 'scale' as QuestionType,
    scale: { min: 1, max: 5, minLabel: 'Definitely would not', maxLabel: 'Definitely would' },
  },
  {
    text: 'Based on what you\'ve seen, do you think this would offer good value for money?',
    type: 'scale' as QuestionType,
    scale: { min: 1, max: 5, minLabel: 'Very poor value', maxLabel: 'Very good value' },
  },
  {
    text: 'This proposition solves a problem or fulfils a need I currently have.',
    type: 'scale' as QuestionType,
    scale: { min: 1, max: 5, minLabel: 'Strongly disagree', maxLabel: 'Strongly agree' },
  },
  {
    text: 'What specific problem or need does this address for you?',
    type: 'open_text' as QuestionType,
  },
  {
    text: 'What, if anything, do you particularly like about this proposition?',
    type: 'open_text' as QuestionType,
  },
  {
    text: 'What, if anything, would put you off or stop you from taking this up?',
    type: 'open_text' as QuestionType,
  },
  {
    text: 'Is there anything you would change or add to make this proposition more appealing to you?',
    type: 'open_text' as QuestionType,
  },
  {
    text: 'Would this proposition replace something you currently use or do?',
    type: 'single_select' as QuestionType,
    options: ['Yes', 'No', 'Not sure'],
  },
]

// ── Fallback generic extracted questions (for pasted text) ──

const GENERIC_EXTRACTED: Omit<SurveyQuestion, 'id' | 'required'>[] = [
  {
    text: 'How appealing is this concept to you?',
    type: 'single_select' as QuestionType,
    options: ['Very appealing', 'Somewhat appealing', 'Neutral', 'Not appealing'],
  },
  {
    text: 'What features do you value most?',
    type: 'multi_select' as QuestionType,
    options: ['Price', 'Quality', 'Convenience', 'Brand reputation'],
  },
  {
    text: 'How likely are you to recommend this?',
    type: 'nps' as QuestionType,
    scale: { min: 0, max: 10 },
  },
  {
    text: 'What would make you switch from your current solution?',
    type: 'open_text' as QuestionType,
  },
]

interface ImportBriefPanelProps {
  briefText: string
  uploaded: boolean
  extracted: boolean
  onSetBriefText: (text: string) => void
  onSetUploaded: (uploaded: boolean) => void
  onExtract: (questions: SurveyQuestion[]) => void
  onReset: () => void
}

export const ImportBriefPanel: React.FC<ImportBriefPanelProps> = ({
  briefText,
  uploaded,
  extracted,
  onSetBriefText,
  onSetUploaded,
  onExtract,
  onReset,
}) => {
  const [extracting, setExtracting] = useState(false)
  const [inputMode, setInputMode] = useState<'upload' | 'paste'>('upload')
  const [fileContent, setFileContent] = useState<string>('')

  const handleExtract = useCallback(() => {
    setExtracting(true)
    // Mock 1.5s AI processing
    setTimeout(() => {
      // Choose question bank based on content
      const content = (fileContent || briefText).toLowerCase()
      const isPropositionTesting =
        content.includes('proposition') ||
        content.includes('question bank') ||
        content.includes('overall appeal') ||
        content.includes('purchase intent') ||
        content.includes('proposition_testing') ||
        briefText.toLowerCase().includes('proposition_testing')

      const sourceQuestions = isPropositionTesting
        ? PROPOSITION_TESTING_QUESTIONS
        : GENERIC_EXTRACTED

      const questions: SurveyQuestion[] = sourceQuestions.map((q, i) => ({
        id: `q_extract_${Date.now()}_${i}`,
        required: true,
        ...q,
      }))
      onExtract(questions)
      setExtracting(false)
    }, 1500)
  }, [onExtract, briefText, fileContent])

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file) {
        onSetUploaded(true)
        onSetBriefText(file.name)

        // Read file content for extraction matching
        const reader = new FileReader()
        reader.onload = (ev) => {
          const text = ev.target?.result as string
          if (text) setFileContent(text)
        }
        reader.readAsText(file)
      }
    },
    [onSetUploaded, onSetBriefText],
  )

  const canExtract = uploaded || briefText.trim().length > 0

  // ── Collapsed state ──
  if (extracted) {
    return (
      <div className="flex items-center gap-2 py-2 px-3 rounded-lg bg-muted border border-border">
        <Sparkles className="w-4 h-4 text-purple-500 shrink-0" />
        <span className="text-sm text-foreground flex-1">
          {uploaded ? `Extracted from ${briefText}` : 'Extracted from pasted brief'}
        </span>
        <button
          type="button"
          onClick={onReset}
          className="text-xs text-muted-foreground hover:text-foreground underline transition-colors"
        >
          Change source
        </button>
      </div>
    )
  }

  // ── Extracting state ──
  if (extracting) {
    return (
      <div className="flex flex-col items-center gap-3 py-8 rounded-lg border border-dashed border-border">
        <Loader2 className="w-6 h-6 text-muted-foreground animate-spin" />
        <p className="text-sm text-muted-foreground">Analysing brief and extracting questions…</p>
      </div>
    )
  }

  // ── Input state ──
  return (
    <div className="space-y-3">
      {/* Upload / Paste toggle */}
      <div className="inline-flex rounded-lg bg-secondary p-1">
        <button
          type="button"
          onClick={() => setInputMode('upload')}
          className={cn(
            'px-3 py-1 text-xs font-medium rounded-md transition-all',
            inputMode === 'upload'
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground',
          )}
        >
          Upload file
        </button>
        <button
          type="button"
          onClick={() => setInputMode('paste')}
          className={cn(
            'px-3 py-1 text-xs font-medium rounded-md transition-all',
            inputMode === 'paste'
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground',
          )}
        >
          Paste text
        </button>
      </div>

      {inputMode === 'upload' ? (
        <label className="flex flex-col items-center gap-2 py-8 rounded-lg border-2 border-dashed border-border bg-muted/50 hover:bg-muted cursor-pointer transition-colors">
          <Upload className="w-6 h-6 text-muted-foreground" />
          <div className="text-center">
            {uploaded ? (
              <p className="text-sm font-medium flex items-center gap-1.5">
                <FileText className="w-4 h-4" />
                {briefText}
              </p>
            ) : (
              <>
                <p className="text-sm text-muted-foreground">
                  Click to upload or drag & drop
                </p>
                <p className="text-xs text-muted-foreground/70 mt-0.5">
                  PDF, DOCX, or TXT
                </p>
              </>
            )}
          </div>
          <input
            type="file"
            accept=".pdf,.docx,.txt"
            className="hidden"
            onChange={handleFileChange}
          />
        </label>
      ) : (
        <Textarea
          value={uploaded ? '' : briefText}
          onChange={(e) => {
            onSetUploaded(false)
            onSetBriefText(e.target.value)
            setFileContent('')
          }}
          placeholder="Paste your research brief, product description, or key questions here..."
          rows={5}
          className="text-sm resize-none"
        />
      )}

      <Button
        size="sm"
        onClick={handleExtract}
        disabled={!canExtract}
        className="gap-1.5"
      >
        <Sparkles className="w-3.5 h-3.5" />
        Extract Questions
      </Button>
    </div>
  )
}

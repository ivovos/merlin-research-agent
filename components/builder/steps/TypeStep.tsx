import React from 'react'
import {
  ClipboardList,
  Lightbulb,
  MessageCircle,
  Image,
  TrendingUp,
  Users,
  Check,
} from 'lucide-react'
import type { ElementType } from 'react'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import type { SurveyType } from '@/types'
import { SURVEY_TYPE_CONFIGS } from '@/types'

const ICON_MAP: Record<string, ElementType> = {
  ClipboardList,
  Lightbulb,
  MessageCircle,
  Image,
  TrendingUp,
  Users,
}

interface TypeStepProps {
  selectedType: SurveyType | null
  onSelectType: (type: SurveyType) => void
}

export const TypeStep: React.FC<TypeStepProps> = ({
  selectedType,
  onSelectType,
}) => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-display font-semibold">What kind of survey?</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Choose a survey type to get started. This determines the flow and question recommendations.
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        {SURVEY_TYPE_CONFIGS.map((config) => {
          const Icon = ICON_MAP[config.icon] || ClipboardList
          const isSelected = selectedType === config.key

          return (
            <Card
              key={config.key}
              onClick={() => onSelectType(config.key)}
              className={cn(
                'relative cursor-pointer p-4 transition-all duration-150 hover:shadow-sm',
                isSelected
                  ? 'border-foreground bg-accent ring-1 ring-foreground/10'
                  : 'hover:bg-accent/50',
              )}
            >
              {isSelected && (
                <div className="absolute top-3 right-3">
                  <div className="w-5 h-5 rounded-full bg-foreground flex items-center justify-center">
                    <Check className="w-3 h-3 text-background" />
                  </div>
                </div>
              )}
              <Icon className="w-5 h-5 text-muted-foreground mb-2" />
              <h3 className="text-sm font-semibold">{config.label}</h3>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                {config.description}
              </p>
              {config.needsStimulus && (
                <span className="inline-block mt-2 text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                  Requires stimulus
                </span>
              )}
            </Card>
          )
        })}
      </div>
    </div>
  )
}

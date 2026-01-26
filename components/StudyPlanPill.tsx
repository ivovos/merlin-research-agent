import React from 'react';
import { ClipboardList, Users, MessageSquare, BarChart3, Settings2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { StudyPlan } from '@/types';

// Icon mapping for methods
const methodIcons: Record<string, React.ElementType> = {
  'explore-audience': BarChart3,
  'survey': ClipboardList,
  'focus-group': Users,
  'message-testing': MessageSquare,
};

interface StudyPlanPillProps {
  studyPlan: StudyPlan;
  onClick?: () => void;
  className?: string;
  /** Show the Edit button - defaults to true */
  showEdit?: boolean;
}

export const StudyPlanPill: React.FC<StudyPlanPillProps> = ({
  studyPlan,
  onClick,
  className,
  showEdit = true,
}) => {
  const Icon = methodIcons[studyPlan.methodId] || Settings2;

  // Build display text
  const displayText = studyPlan.variantName
    ? `${studyPlan.methodName}: ${studyPlan.variantName}`
    : studyPlan.methodName;

  // If no edit and no click handler, render as a span instead of button
  const Component = showEdit && onClick ? 'button' : 'span';

  return (
    <Component
      onClick={showEdit ? onClick : undefined}
      className={cn(
        "inline-flex items-center gap-2 px-3 py-1.5 rounded-full",
        "bg-muted/50 border border-border",
        "text-sm font-medium text-muted-foreground",
        showEdit && onClick && "hover:bg-muted hover:text-foreground cursor-pointer",
        "transition-all",
        className
      )}
    >
      <Icon className="h-3.5 w-3.5" />
      <span>{displayText}</span>
      {showEdit && <span className="text-xs text-muted-foreground/60">Edit</span>}
    </Component>
  );
};

export default StudyPlanPill;

import type { ProcessStep } from '@/types';

export function createPlanningSteps(activeStep: 1 | 2 | 'complete'): ProcessStep[] {
  return [
    {
      id: 'plan_1',
      label: 'Analyzing your question',
      status: activeStep === 1 ? 'in-progress' : 'complete',
    },
    {
      id: 'plan_2',
      label: 'Selecting research method',
      status: activeStep === 'complete' ? 'complete' : activeStep === 2 ? 'in-progress' : 'pending',
    },
  ];
}

export function createPlanCreationSteps(activeStep: 1 | 2 | 3 | 'complete'): ProcessStep[] {
  return [
    {
      id: 'planCreate_1',
      label: 'Analyzing your question',
      status: activeStep === 1 ? 'in-progress' : 'complete',
    },
    {
      id: 'planCreate_2',
      label: 'Evaluating complexity',
      status:
        activeStep === 'complete' ? 'complete'
        : activeStep === 2 ? 'in-progress'
        : activeStep > 2 ? 'complete'
        : 'pending',
    },
    {
      id: 'planCreate_3',
      label: 'Designing study plan',
      status:
        activeStep === 'complete' ? 'complete'
        : activeStep === 3 ? 'in-progress'
        : 'pending',
    },
  ]
}

export function createExecutionSteps(labels: string[], activeIndex: number): ProcessStep[] {
  return labels.map((label, i) => ({
    id: `exec_${i}`,
    label,
    status: i < activeIndex ? 'complete' as const : i === activeIndex ? 'in-progress' as const : 'pending' as const,
  }));
}

// Research Methods Configuration
// Defines all available research methods with their forms, variants, and field configurations

export interface FieldOption {
  value: string;
  label: string;
  subOptions?: {
    type: string;
    options: FieldOption[];
  };
}

export interface FieldConfig {
  type: string;
  label: string;
  placeholder?: string;
  description?: string;
  required?: boolean;
  default?: string | number | boolean;
  options?: FieldOption[] | 'dynamic';
  searchable?: boolean;
  multiple?: boolean;
  minItems?: number;
  maxItems?: number;
  accept?: string[];
  maxSize?: string;
  maxFiles?: number;
  allowAutoGenerate?: boolean;
  allowImage?: boolean;
  layout?: string;
  note?: string;
  validationMessage?: string;
  itemSchema?: Record<string, FieldConfig>;
  addButton?: {
    label: string;
    showCount?: boolean;
    format?: string;
  };
  bulkUpload?: {
    label: string;
    icon: string;
    action: string;
  };
  helpers?: Record<string, {
    type: string;
    trigger: string;
    title?: string;
    description?: string;
    fields?: Record<string, FieldConfig>;
    action?: {
      label: string;
      action: string;
    };
    actions?: {
      primary: { label: string; action: string };
      secondary: { label: string; action: string };
    };
  }>;
}

export interface ActionConfig {
  label: string;
  action: string;
  disabled?: string;
  icon?: string;
}

export interface VariantOption {
  id: string;
  title: string;
  description: string;
  note?: string;
  icon?: string;
  leadsTo: string;
}

export interface EntryStep {
  title: string;
  description: string;
  type: 'choice';
  options: VariantOption[];
  actions: {
    primary: ActionConfig;
    secondary: ActionConfig;
  };
}

export interface FormStep {
  step: number;
  title: string;
  subtitle?: string;
  fields: Record<string, FieldConfig>;
  actions: {
    primary: ActionConfig;
    secondary?: ActionConfig;
  };
}

export interface MethodVariant {
  title: string;
  subtitle?: string;
  steps?: number;
  totalSteps?: number;
  fields?: Record<string, FieldConfig>;
  formSteps?: FormStep[];
  actions?: {
    primary: ActionConfig;
    secondary?: ActionConfig;
  };
  output?: {
    type: string;
    view: string;
  };
  note?: string;
}

export interface Method {
  id: string;
  name: string;
  description: string;
  icon: string;
  approach: string;
  type: 'quantitative' | 'qualitative';
  complexity: 'simple' | 'medium' | 'complex';
  purpose?: string;
  steps?: number;
  estimatedTime?: string;
  entryStep?: EntryStep;
  fields?: Record<string, FieldConfig>;
  variants?: Record<string, MethodVariant>;
  validation?: {
    rules: { field: string; rule: string; message: string }[];
    errorDisplay: {
      type: string;
      title: string;
      message: string;
    };
  };
  actions?: {
    primary: ActionConfig;
    expandView?: ActionConfig;
  };
  outputView?: {
    id: string;
    title: string;
    tabs: {
      id: string;
      label: string;
      content: Record<string, unknown>;
    }[];
    actions: {
      primary: ActionConfig;
    };
  };
}

export const methods: Method[] = [
  {
    id: 'explore-audience',
    name: 'Explore Audience',
    description: 'Understand who they are',
    icon: 'users-search',
    approach: 'visualization',
    type: 'quantitative',
    complexity: 'simple',
    purpose: 'Explore existing data to understand your audience',
    entryStep: {
      title: 'Explore Audience',
      description: "Choose how you'd like to explore your audience.",
      type: 'choice',
      options: [
        {
          id: 'plot',
          title: 'Plot',
          description: 'Visualize responses to a survey question. See distributions and breakdowns across segments.',
          note: 'Great for understanding how your audience answered specific questions.',
          icon: 'chart-bar',
          leadsTo: 'plot-setup',
        },
        {
          id: 'heatmap',
          title: 'Heatmap',
          description: 'See patterns across multiple questions at once. Identify clusters and correlations.',
          note: 'Great for spotting relationships between different attitudes or behaviors.',
          icon: 'grid-3x3',
          leadsTo: 'heatmap-setup',
        },
      ],
      actions: {
        primary: { label: 'Continue', action: 'next-step', disabled: 'until-selection' },
        secondary: { label: 'Cancel', action: 'close' },
      },
    },
    variants: {
      'plot-setup': {
        title: 'Plot',
        subtitle: 'Visual mapping of data',
        steps: 1,
        fields: {
          audience: {
            type: 'audience-selector',
            label: 'Audience',
            required: true,
          },
          surveyQuestion: {
            type: 'select',
            label: 'Survey question',
            placeholder: 'Choose a survey question',
            required: true,
            options: 'dynamic',
            searchable: true,
            note: 'Populated from existing dataset questions',
          },
          breakdowns: {
            type: 'multi-select',
            label: 'Breakdowns (optional)',
            placeholder: '+ Add Breakdown',
            required: false,
            options: 'dynamic',
            note: 'Demographic or segment breakdowns',
          },
        },
        actions: {
          primary: { label: 'Generate Plot', action: 'run' },
          secondary: { label: 'Reset', action: 'reset' },
        },
      },
      'heatmap-setup': {
        title: 'Heatmap',
        subtitle: 'Pattern visualization',
        steps: 1,
        fields: {
          audience: {
            type: 'audience-selector',
            label: 'Audience',
            required: true,
          },
          questions: {
            type: 'multi-select',
            label: 'Questions to compare',
            placeholder: 'Select questions',
            required: true,
            minItems: 2,
            options: 'dynamic',
            searchable: true,
          },
          colorScale: {
            type: 'select',
            label: 'Color scale',
            required: false,
            default: 'diverging',
            options: [
              { value: 'diverging', label: 'Diverging (negative to positive)' },
              { value: 'sequential', label: 'Sequential (low to high)' },
            ],
          },
        },
        actions: {
          primary: { label: 'Generate Heatmap', action: 'run' },
          secondary: { label: 'Reset', action: 'reset' },
        },
      },
    },
  },

  {
    id: 'survey',
    name: 'Survey',
    description: 'Broad quantitative data',
    icon: 'clipboard-list',
    approach: 'survey',
    type: 'quantitative',
    complexity: 'medium',
    steps: 1,
    estimatedTime: '1-2 minutes',
    fields: {
      audience: {
        type: 'audience-selector',
        label: 'Audience',
        required: true,
      },
      questions: {
        type: 'question-list',
        label: 'Questions',
        required: true,
        minItems: 1,
        maxItems: 10,
        itemSchema: {
          questionText: {
            type: 'textarea',
            label: 'Question',
            placeholder: 'Write a question (or paste a survey to import).',
            required: true,
          },
          questionType: {
            type: 'radio',
            label: 'Question type',
            required: true,
            default: 'single-choice',
            options: [
              { value: 'single-choice', label: 'Single choice' },
              {
                value: 'multi-choice',
                label: 'Multi-choice',
                subOptions: {
                  type: 'select',
                  options: [
                    { value: 'choose-all', label: 'Choose all that apply' },
                    { value: 'fixed-selection', label: 'Fixed selection' },
                  ],
                },
              },
            ],
          },
          answerOptions: {
            type: 'option-list',
            label: 'Answer options',
            required: true,
            minItems: 2,
            maxItems: 10,
            allowAutoGenerate: true,
          },
          image: {
            type: 'image-upload',
            label: 'Add image',
            required: false,
            accept: ['jpg', 'jpeg', 'png', 'webp'],
            maxSize: '5MB',
          },
        },
        helpers: {
          aiAssist: {
            type: 'popover',
            trigger: 'What should I ask?',
            fields: {
              topic: {
                type: 'textarea',
                placeholder: "Describe the topic and we'll propose a question.",
                label: 'What topic would you like to understand?',
              },
            },
            action: { label: 'Create a question', action: 'generate-question' },
          },
          importSurvey: {
            type: 'modal',
            trigger: 'paste-detection',
            title: 'Paste survey',
            description: "Copy your survey text from any other source (e.g. document, email, etc.) and paste it here. We'll parse the question text and bullet lists instantly.",
            fields: {
              pasteContent: {
                type: 'textarea',
                label: 'Paste survey content',
                placeholder: "Paste here and we'll handle the rest.",
              },
            },
            actions: {
              primary: { label: 'Parse text', action: 'parse-survey' },
              secondary: { label: 'Cancel', action: 'close' },
            },
          },
        },
      },
    },
    validation: {
      rules: [
        { field: 'questions', rule: 'each-question-has-text', message: 'Question is required' },
        { field: 'questions', rule: 'each-question-has-options', message: 'Answer options are required' },
      ],
      errorDisplay: {
        type: 'banner',
        title: 'Missing information',
        message: 'We spotted missing question details. Complete the highlighted cards before submitting.',
      },
    },
    actions: {
      primary: { label: 'Submit', action: 'run' },
      expandView: { label: 'Expand view', action: 'fullscreen' },
    },
  },

  {
    id: 'focus-group',
    name: 'Focus Group',
    description: 'Deep qualitative insights',
    icon: 'users',
    approach: 'focus-group',
    type: 'qualitative',
    complexity: 'complex',
    purpose: 'Have conversations with your audience',
    entryStep: {
      title: 'Focus Group Discussion',
      description: 'Choose how to run your focus group discussion.',
      type: 'choice',
      options: [
        {
          id: 'you-moderate',
          title: 'You Moderate the Session',
          description: "You run the session live and guide the discussion yourself. Ask questions one-by-one, follow up, and steer the chat however you like.",
          note: 'Perfect when you want full control and real-time interaction.',
          leadsTo: 'session-setup',
        },
        {
          id: 'debate',
          title: '(Debate) We Moderate It for You',
          description: "Tell us the topic and we'll find right AI participants to debate different perspectives. They'll engage in structured discussions, presenting various viewpoints from your chosen segment.",
          note: 'Perfect for exploring controversial topics or understanding the range of opinions in your target audience.',
          leadsTo: 'debate-setup',
        },
      ],
      actions: {
        primary: { label: 'Continue', action: 'next-step', disabled: 'until-selection' },
        secondary: { label: 'Cancel', action: 'close' },
      },
    },
    variants: {
      'session-setup': {
        title: 'Session Setup',
        steps: 1,
        fields: {
          audience: {
            type: 'audience-selector',
            label: 'Audience',
            required: true,
          },
          panelSize: {
            type: 'select',
            label: 'Panel size',
            required: true,
            default: '3',
            options: [
              { value: '3', label: '3' },
              { value: '4', label: '4' },
              { value: '5', label: '5' },
              { value: '6', label: '6' },
              { value: '8', label: '8' },
            ],
          },
          openingQuestion: {
            type: 'textarea',
            label: 'Start the session',
            placeholder: 'The opening question that kicks off the chat.',
            required: true,
            validationMessage: 'Enter an opening question to continue.',
          },
        },
        actions: {
          primary: { label: 'Start Session', action: 'start-session' },
          secondary: { label: 'Back', action: 'previous-step' },
        },
        output: { type: 'live-session', view: 'session' },
      },
      'debate-setup': {
        title: 'Debate',
        steps: 1,
        fields: {
          audience: {
            type: 'audience-selector',
            label: 'Audience',
            required: true,
          },
          debateQuestion: {
            type: 'textarea',
            label: 'Debate Question',
            placeholder: 'Enter your topic or question...',
            required: true,
          },
          webSearch: {
            type: 'toggle',
            label: 'Enable Web Search',
            description: 'Allow AI agents to search the web for current information during debate',
            default: false,
          },
          addContent: {
            type: 'image-upload',
            label: 'Add Content (Optional)',
            description: 'Upload images to provide visual context for the debate. AI agents will analyze these images and consider them during the discussion.',
            required: false,
            accept: ['jpg', 'jpeg', 'png', 'webp'],
            maxSize: '5MB',
            maxFiles: 5,
          },
        },
        actions: {
          primary: { label: 'Submit', action: 'run' },
        },
        output: { type: 'async-result', view: 'session' },
      },
    },
    outputView: {
      id: 'session',
      title: 'Session',
      tabs: [
        {
          id: 'discussion',
          label: 'Discussion',
          content: {
            type: 'message-thread',
            showQuestion: true,
            participants: { display: 'avatar-badge', format: 'P1, P2, P3...' },
            actions: { copyResponses: { label: 'Copy responses', action: 'copy-to-clipboard' } },
            loadingState: { message: 'Participants are responding...' },
          },
        },
        {
          id: 'summary',
          label: 'Summary',
          content: {
            type: 'structured-summary',
            sections: ['Executive Summary', 'Question Overview', 'Cross-Cutting Themes', 'Contradictions & Tensions', 'Persona Comparison'],
          },
        },
        {
          id: 'participants',
          label: 'Panel Participants',
          content: { type: 'participant-list', showDemographics: true, showDescription: true },
        },
      ],
      actions: {
        primary: { label: 'Done', action: 'close' },
      },
    },
  },

  {
    id: 'message-testing',
    name: 'Message Testing',
    description: 'Test copy and value props',
    icon: 'message-square',
    approach: 'a-b-test',
    type: 'quantitative',
    complexity: 'medium',
    purpose: 'Test how your messages perform with your audience',
    entryStep: {
      title: 'What kind of test do you need?',
      description: "Choose how you'd like to test your message.",
      type: 'choice',
      options: [
        {
          id: 'score',
          title: 'Score messages across key criteria',
          description: 'Collect 1-5 ratings on clarity, persuasiveness, trust, and more. Perfect for early-stage content.',
          leadsTo: 'score-setup',
        },
        {
          id: 'compare',
          title: 'Compare messages side-by-side',
          description: 'Test 2-5 options head-to-head to see which performs best. Best for choosing between your top candidates.',
          leadsTo: 'compare-setup',
        },
        {
          id: 'impact',
          title: 'See if your message changes minds',
          description: 'Measure how much your message shifts opinions. Ideal when you want to test real-world impact and persuasion.',
          leadsTo: 'impact-setup',
        },
      ],
      actions: {
        primary: { label: 'Continue', action: 'next-step', disabled: 'until-selection' },
        secondary: { label: 'Cancel', action: 'close' },
      },
    },
    variants: {
      'score-setup': {
        title: 'Rating Test',
        subtitle: 'Score messages across key criteria',
        totalSteps: 1,
        fields: {
          name: {
            type: 'text',
            label: 'Name',
            placeholder: "Give the test a clear, short label for tracking. E.g. 'Plastic Ban'",
            required: true,
          },
          aim: {
            type: 'textarea',
            label: 'What is the aim of this test?',
            placeholder: 'What do you want to achieve by testing? Be specific about the business outcome you are trying to realise.',
            required: false,
          },
          audience: {
            type: 'audience-selector',
            label: 'Audience',
            required: true,
          },
          testCriteria: {
            type: 'multi-select',
            label: 'Test criteria',
            placeholder: 'What aspects of your message do you want to test?',
            required: true,
            options: [
              { value: 'clarity', label: 'Clarity' },
              { value: 'persuasiveness', label: 'Persuasiveness' },
              { value: 'trust', label: 'Trust' },
              { value: 'relevance', label: 'Relevance' },
              { value: 'memorability', label: 'Memorability' },
              { value: 'appeal', label: 'Appeal' },
            ],
          },
          messages: {
            type: 'message-list',
            label: 'Messages',
            description: 'Enter at least 1 message to test. You can add up to 25 messages for comparison.',
            required: true,
            minItems: 1,
            maxItems: 25,
            itemSchema: {
              messageText: {
                type: 'textarea',
                label: 'Message',
                placeholder: 'Write the message you want to test. This message will be rated across all the criteria you selected.',
                required: true,
              },
              image: {
                type: 'image-upload',
                label: 'Add image',
                required: false,
                accept: ['jpg', 'jpeg', 'png', 'webp'],
                maxSize: '5MB',
              },
            },
            addButton: {
              label: 'Add another message',
              showCount: true,
              format: '(X of 25)',
            },
            bulkUpload: {
              label: 'Bulk upload images to messages',
              icon: 'images',
              action: 'bulk-image-upload',
            },
          },
        },
        actions: {
          primary: { label: 'Start Rating Test', action: 'run' },
          secondary: { label: 'Reset', action: 'reset' },
        },
      },
      'compare-setup': {
        title: 'Comparison Test',
        subtitle: 'Compare messages side-by-side',
        totalSteps: 1,
        fields: {
          name: {
            type: 'text',
            label: 'Name',
            placeholder: 'Give the test a clear, short label for tracking.',
            required: true,
          },
          aim: {
            type: 'textarea',
            label: 'What is the aim of this test?',
            placeholder: 'What do you want to achieve by testing?',
            required: false,
          },
          audience: {
            type: 'audience-selector',
            label: 'Audience',
            required: true,
          },
          comparisonCriteria: {
            type: 'select',
            label: 'What should they compare on?',
            placeholder: 'Select comparison criteria',
            required: true,
            options: [
              { value: 'preference', label: 'Overall preference' },
              { value: 'clarity', label: 'Clarity' },
              { value: 'appeal', label: 'Appeal' },
              { value: 'credibility', label: 'Credibility' },
            ],
          },
          messages: {
            type: 'message-list',
            label: 'Messages to compare',
            description: 'Add 2-5 messages to compare head-to-head.',
            required: true,
            minItems: 2,
            maxItems: 5,
            itemSchema: {
              messageText: {
                type: 'textarea',
                label: 'Message',
                placeholder: 'Write a message variant to compare.',
                required: true,
              },
              image: {
                type: 'image-upload',
                label: 'Add image',
                required: false,
                accept: ['jpg', 'jpeg', 'png', 'webp'],
                maxSize: '5MB',
              },
            },
          },
        },
        actions: {
          primary: { label: 'Start Comparison Test', action: 'run' },
          secondary: { label: 'Reset', action: 'reset' },
        },
      },
      'impact-setup': {
        title: 'Impact Test',
        subtitle: 'Define your test message and response scale',
        totalSteps: 1,
        fields: {
          audience: {
            type: 'audience-selector',
            label: 'Audience',
            required: true,
          },
          baselineQuestion: {
            type: 'textarea',
            label: 'Set baseline opinion or question',
            placeholder: "This is asked before and after the message is seen to measure impact. E.g. 'Do you support a ban on single-use plastics?'",
            description: "This is asked before and after the message is seen to measure impact. Focus on the belief or opinion you're trying to shift.",
            required: true,
          },
          testMessage: {
            type: 'textarea',
            label: 'Define test message',
            placeholder: "What message, content, or slogan are you testing? E.g. 'Plastic-free by 2030 - our promise to the planet.'",
            description: 'What message, content, or slogan are you testing?',
            required: true,
            allowImage: true,
          },
          responseScale: {
            type: 'radio-group',
            label: 'Choose response scale',
            required: true,
            default: 'yes-no',
            layout: 'grid-2x2',
            options: [
              { value: 'yes-no', label: 'Yes/No' },
              { value: 'scale-neg2-pos2', label: '-2 to +2 Scale' },
              { value: 'scale-1-10', label: '1-10 Scale' },
              { value: 'approval', label: 'Approval Scale' },
            ],
          },
        },
        actions: {
          primary: { label: 'Start Impact Test', action: 'run' },
          secondary: { label: 'Reset', action: 'reset' },
        },
      },
    },
  },
];

// Helper to get a method by ID
export function getMethodById(id: string): Method | undefined {
  return methods.find(m => m.id === id);
}

// Helper to get variant config
export function getVariantConfig(method: Method, variantId: string): MethodVariant | undefined {
  return method.variants?.[variantId];
}

// Method command mapping for slash commands
export const methodCommands: Record<string, string> = {
  '/explore-audience': 'explore-audience',
  '/plot': 'explore-audience:plot',
  '/heatmap': 'explore-audience:heatmap',
  '/survey': 'survey',
  '/focus-group': 'focus-group',
  '/message-testing': 'message-testing',
};

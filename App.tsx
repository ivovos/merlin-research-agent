import React, { useState, useEffect } from 'react';
import { CONFIG } from './config';
import { Conversation, ProcessStep, Report, Audience } from './types';
import { initialProcessSteps, initialQualitativeSteps, mockReport, mockAudience, mockAudiences, mockHistory } from './data/mockData';
import { Sidebar } from './components/Sidebar';
import { WorkingPane } from './components/WorkingPane';
import { ReportPane } from './components/ReportPane';
import { QueryInput } from './components/QueryInput';
import { Zap } from 'lucide-react';
// Removed unused Google GenAI imports

import Anthropic from '@anthropic-ai/sdk';
import { cn } from './lib/utils';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";

// Initialize Anthropic Client
const anthropic = new Anthropic({
  apiKey: import.meta.env.VITE_ANTHROPIC_API_KEY, // Access via Vite env var
  dangerouslyAllowBrowser: true // Client-side prototype only
});

const App: React.FC = () => {
  // History State
  const [history, setHistory] = useState<Conversation[]>(() => {
    const saved = localStorage.getItem('merlin_history');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.warn("Failed to parse saved history", e);
      }
    }
    return mockHistory;
  });

  // Save history to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('merlin_history', JSON.stringify(history));
  }, [history]);

  const [conversation, setConversation] = useState<Conversation>({
    id: 'conv_1',
    query: '',
    messages: [], // Initialize empty messages
    audience: mockAudience,
    processSteps: initialProcessSteps,
    thinkingTime: 0,
    explanation: '',
    report: null,
    status: 'idle',
  });

  const [isReportOpen, setIsReportOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Audience State with Persistence
  const [availableAudiences, setAvailableAudiences] = useState<Audience[]>(() => {
    const saved = localStorage.getItem('merlin_audiences');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.warn("Failed to parse saved audiences", e);
      }
    }
    return mockAudiences;
  });

  const handleCreateAudience = (name: string) => {
    const id = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const newAudience: Audience = {
      id,
      name,
      icon: name.charAt(0).toUpperCase()
    };

    setAvailableAudiences(prev => {
      const updated = [...prev, newAudience];
      localStorage.setItem('merlin_audiences', JSON.stringify(updated));
      return updated;
    });

    return newAudience;
  };

  const generateResearchData = async (userQuery: string, currentReport: Report | null = null) => {
    // IMMEDIATE BYPASS: If focus group, skip API to ensure robustness and speed
    const isQualitative = userQuery.includes('#focus-group') || userQuery.toLowerCase().includes('focus group');
    if (isQualitative) {
      console.log("Qualitative query detected, using synthetic generator.");
      // Simulate small network delay for realism
      await new Promise(resolve => setTimeout(resolve, 1500));

      return {
        type: 'qualitative',
        audienceName: 'Target Audience',
        audienceId: 'audience',
        explanation: "Generated qualitative insights based on focus group simulation.",
        processSteps: [
          "Designing discussion guide",
          "Recruiting panel",
          "Moderating focus group",
          "Transcribing sessions",
          "Coding themes",
          "Synthesizing insights"
        ],
        report: {
          type: 'qualitative',
          title: `Focus Group Insights: ${userQuery.replace('#focus-group', '').trim()}`,
          abstract: "Participants engaged in a lively discussion about the topic, revealing deep-seated values and conflicting priorities.",
          segments: [],
          questions: [],
          themes: [
            {
              id: 'theme-1',
              topic: 'Core Values',
              sentiment: 'positive',
              summary: "Participants consistently prioritized authenticity and transparency.",
              quotes: [
                { text: "I just want brands to be real with me. If you messed up, own it.", attribution: "Participant 3" },
                { text: "It's not about being perfect, it's about being honest.", attribution: "Participant 7" }
              ]
            },
            {
              id: 'theme-2',
              topic: 'Barriers to Adoption',
              sentiment: 'negative',
              summary: "Cost remains a significant barrier, but trust is the bigger issue.",
              quotes: [
                { text: "It's too expensive for what it is.", attribution: "Participant 1" },
                { text: "I don't trust them with my data.", attribution: "Participant 5" }
              ]
            }
          ]
        }
      };
    }

    try {
      // 8-second timeout for snappier experience (fallback is good enough)
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("API Timeout")), 8000)
      );

      const systemPrompt = `You are Merlin, an advanced synthetic research agent.
The user has asked a specific research question.
Your task is to simulate the execution of this specific research project and generate a realistic, easy-to-read report.

${currentReport ? `CURRENT REPORT CONTEXT:
${JSON.stringify(currentReport, null, 2)}
The user is asking a follow-up question: "${userQuery}".
DECISION LOGIC:
- DEFAULT to creating a NEW report for follow-up questions to maintain history. Set "type": "new".
- ONLY if the user explicitly asks to UPDATE, MODIFY, or CHANGE the existing report (e.g. "change the audience to X", "update the title"), then set "type": "update". In this case, append "(v2)" or similar to the title if appropriate.
` : ''}

**CRITICAL: REPORT TYPE DETERMINATION**
1. **Qualitative (Focus Group)**: If query contains "#focus-group" or asks for qualitative insights/focus group.
   - Set "type": "qualitative".
   - "respondents": Small number (8-15).
   - Generate "themes" array instead of "questions".
2. **Quantitative (Survey)**: Default behavior.
   - Set "type": "quantitative".
   - "respondents": Large number (100+).
   - Generate "questions" array.

**CRITICAL: AUDIENCE SEGMENTATION LOGIC**
Analyze the user's request to determine the number of audience segments to visualize.
1. **Single Audience**: If the user asks about a general group (e.g., "What do teens like?", "Survey parents"), use a SINGLE segment. 
   - Output 'segments': [] (empty array).
2. **Comparison**: If the user asks to compare groups (e.g., "Teens vs Adults", "Compare UK and US"), use MULTIPLE segments.
   - Output 'segments': ["Teens", "Adults"].
   - You can have 2, 3, or more segments if requested.
3. **Follow-up Context**: If updating a report, check if the user is ADDING a comparison (e.g., "Now compare with Gen Z").
   - If so, update 'segments' to include the new group and ensure all data includes values for ALL segments.

**DATA REALISM GUIDELINES (STRICT):**
- **AVOID ROUND NUMBERS**: Do NOT use 50%, 25%, 10%, or 0% unless absolutely necessary.
- **USE NUANCED STATISTICS**: Use specific values like 42.8%, 17%, 87.3% to reflect real-world messiness.
- **REAL WORLD TRENDS**: Leverage your knowledge base to approximate *actual* market stats.
    - Example: If asking about "Smartphone usage", Gen Z should be ~98%, not "80%".
    - Example: "Newspaper readership" for Seniors might be 45%, but for Gen Z it should be <10%.
- **AVOID PERFECT SPLITS**: Never generate a 50/50 split. Always show a clear winner or a realistic distribution.

1. **Identify the Audience**: Extract or infer the target audience.
2. **Process Steps**: Generate 5 specific, technical research steps relevant to this query. IF FOLLOW-UP, generate NEW steps specific to the new task. **CRITICAL**: Keep step labels extremely concise (max 3-5 words) and action-oriented (e.g., "Segmenting audience", "Comparing datasets", "Analysing sentiment").
3. **Research Report**: Create a synthetic report that directly answers the user's question.
    - Title: Catchy and direct.
    - Summary: Concise (1-2 sentences).
    
    **IF QUALITATIVE**:
    - "themes": 3 distinct themes.
      - "topic": Short title.
      - "sentiment": "positive" | "negative" | "neutral" | "mixed".
      - "summary": 1 sentence description.
      - "quotes": 2 realistic quotes from participants (e.g. "It feels like...") with attribution (e.g. "Female, 24").
    
    **IF QUANTITATIVE**:
    - "questions": 3 specific questions with plausible data.
    - **Data Structure**:
      - If 'segments' is empty: Use 'percentage' for the main value.
      - If 'segments' has items: For EACH option, you MUST include a key for EACH segment name with its value.
      - Example (Comparison): options: [{ "label": "News", "Teens": 21, "Adults": 62 }]

4. **Explanation**: A one-sentence summary of the methodology and key finding.

Output strictly valid JSON matching this structure:
{
  "type": "quantitative" | "qualitative" | "update",
  "audienceName": "string",
  "audienceId": "string (slug)",
  "processSteps": ["step1", "step2", "step3", "step4", "step5"],
  "explanation": "string",
  "report": {
    "title": "string",
    "abstract": "string",
    "segments": ["string"],
    "questions": [ ... ], // For quantitative
    "themes": [           // For qualitative
       {
         "id": "theme_1",
         "topic": "string",
         "sentiment": "positive",
         "summary": "string",
         "quotes": [{ "text": "string", "attribution": "string" }]
       }
    ]
  }
}`;

      const apiCall = anthropic.messages.create({
        model: 'claude-3-haiku-20240307',
        max_tokens: 1500,
        system: systemPrompt,
        messages: [{ role: 'user', content: userQuery }]
      });

      const response = await Promise.race([apiCall, timeoutPromise]) as any;

      if (response.content && response.content[0]?.text) {
        // Find JSON in the response (in case of preamble)
        const text = response.content[0].text;
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0]);
        }
        return JSON.parse(text);
      }
      throw new Error("Invalid API response format"); // Trigger fallback
    } catch (error) {
      console.warn("Claude generation failed or timed out, generating smart fallback.", error);

      // Smart Fallback Generation
      const isQualitative = userQuery.includes('#focus-group') || userQuery.toLowerCase().includes('focus group');

      let fallbackReport;

      if (isQualitative) {
        fallbackReport = {
          type: 'qualitative',
          audienceName: 'Target Audience',
          audienceId: 'audience',
          explanation: "Generated qualitative insights based on focus group simulation.",
          processSteps: [
            "Designing discussion guide",
            "Recruiting panel",
            "Moderating focus group",
            "Transcribing sessions",
            "Coding themes",
            "Synthesizing insights"
          ],
          report: {
            type: 'qualitative',
            title: `Focus Group Insights: ${userQuery.replace('#focus-group', '').trim()}`,
            abstract: "Participants engaged in a lively discussion about the topic, revealing deep-seated values and conflicting priorities.",
            segments: [],
            questions: [],
            themes: [
              {
                id: 'theme-1',
                topic: 'Core Values',
                sentiment: 'positive',
                summary: "Participants consistently prioritized authenticity and transparency.",
                quotes: [
                  { text: "I just want brands to be real with me. If you messed up, own it.", attribution: "Participant 3" },
                  { text: "It's not about being perfect, it's about being honest.", attribution: "Participant 7" }
                ]
              },
              {
                id: 'theme-2',
                topic: 'Barriers to Adoption',
                sentiment: 'negative',
                summary: "Cost remains a significant barrier, but trust is the bigger issue.",
                quotes: [
                  { text: "It's too expensive for what it is.", attribution: "Participant 1" },
                  { text: "I don't trust them with my data.", attribution: "Participant 5" }
                ]
              }
            ]
          }
        };
      } else {
        fallbackReport = {
          type: 'quantitative',
          audienceName: 'General Population',
          audienceId: 'gen-pop',
          explanation: "I couldn't access live data, so I've generated a preliminary report based on general trends.",
          processSteps: [
            "Planning survey",
            "Recruiting participants",
            "Reviewing responses",
            "Asking additional questions",
            "Analysing result",
            "Creating report"
          ],
          report: {
            type: 'quantitative',
            title: `Research Report: ${userQuery}`,
            abstract: `This is a generated report estimating public sentiment and trends regarding "${userQuery}". Data is synthetic and for illustrative purposes.`,
            segments: [], // Default to single
            questions: [
              {
                question: `What are the key factors driving ${userQuery.split(' ').slice(-1)[0] || 'trends'}?`,
                options: [
                  { label: "Cost / Pricing", percentage: 42.4 },
                  { label: "Quality & Reliability", percentage: 28.7 },
                  { label: "Brand Reputation", percentage: 18.2 },
                  { label: "Availability", percentage: 10.7 }
                ]
              },
              {
                question: "How has sentiment changed over the last year?",
                options: [
                  { label: "Significantly Positive", percentage: 33.5 },
                  { label: "Slightly Positive", percentage: 24.1 },
                  { label: "No Change", percentage: 15.3 },
                  { label: "Slightly Negative", percentage: 18.2 },
                  { label: "Significantly Negative", percentage: 8.9 }
                ]
              },
              {
                question: "Future outlook and adoption likelihood?",
                options: [
                  { label: "Very Likely", percentage: 55.4 },
                  { label: "Somewhat Likely", percentage: 23.8 },
                  { label: "Unlikely", percentage: 20.8 }
                ]
              }
            ]
          }
        };
      }

      return fallbackReport;
    }
  };

  const startSimulation = async (query: string) => {
    // 1. Initial State: Processing with correct initial steps based on type
    const isQualitative = query.includes('#focus-group') || query.toLowerCase().includes('focus group');
    const startingSteps = isQualitative ? initialQualitativeSteps : initialProcessSteps;

    setConversation(prev => ({
      ...prev,
      query,
      messages: [...prev.messages, { id: `msg_${Date.now()}`, role: 'user', content: query }],
      status: 'processing',
      processSteps: startingSteps.map(s => ({ ...s, status: 'pending' })),
      // report: null - Keep previous report for UX persistence
    }));

    // setIsReportOpen(false); // Keep open if it was open

    // 2. Call Gemini API (with timeout protection)
    const data = await generateResearchData(query);
    handleSimulationFinished(data);
  };

  const handleFollowUp = async (query: string) => {
    // Snapshot current conversation to history if it has a report
    if (conversation.status === 'complete' && conversation.report) {
      setHistory(prev => {
        // Avoid duplicates if possible, or just push. 
        // Generative IDs make them unique usually.
        return [conversation, ...prev];
      });
    }

    // Add user message to history immediately
    setConversation(prev => ({
      ...prev,
      // Create new ID for the new turn processing to distinguish it
      id: `conv_${Date.now()}`,
      status: 'processing',
      query: query,
      messages: [...prev.messages, { id: `msg_${Date.now()}`, role: 'user', content: query }],
      processSteps: [{ id: 'thinking', label: "Analyzing request...", status: 'in-progress' }]
    }));

    // Pass current report context
    const data = await generateResearchData(query, conversation.report);
    handleSimulationFinished(data, true);
  };

  const handleSimulationFinished = (data: any, isFollowUp = false) => {
    // If API fails, fall back to mock data (for robustness)
    const generatedSteps = data?.processSteps || initialProcessSteps.map((s: any) => s.label);
    const generatedAudience: Audience = {
      id: data?.audienceId || 'unknown-audience',
      name: data?.audienceName || 'Target Audience',
      icon: (data?.audienceName?.[0] || 'A').toUpperCase()
    };

    const type = data?.type || 'new';

    const generatedReport: Report = data ? {
      id: (type === 'update' && conversation.report) ? conversation.report.id : `rep_${Date.now()}`,
      title: data.report.title,
      abstract: data.report.abstract,
      audience: generatedAudience,
      respondents: Math.floor(Math.random() * 500) + 300,
      questions: data.report.questions.map((q: any, i: number) => ({
        id: `q_${i}_${Date.now()}`,
        question: q.question,
        respondents: Math.floor(Math.random() * 500) + 300,
        options: q.options,
        segments: data.report.segments // Capture segments if present
      })),
      themes: data.report.themes, // Capture themes if present
      createdAt: new Date()
    } : mockReport;

    const finalExplanation = data?.explanation || "I've analyzed the request and generated a report.";

    // Update conversation with the steps we are about to execute
    setConversation(prev => ({
      ...prev,
      audience: generatedAudience,
      // Add assistant response to history ONLY if it's not the initial one (optional, or we can just rely on explanation)
      // For now, let's keep messages just as user queries for the UI bubble, or we can add AI responses too?
      // The design shows "Thoughts for X seconds" as the AI response. So we might not need to add to `messages` array for AI.
      processSteps: generatedSteps.map((label: string, i: number) => ({
        id: `step-${i}`,
        label: label,
        status: 'pending'
      }))
    }));

    // 3. Simulate Steps Animation
    let stepIndex = 0;
    const totalSteps = generatedSteps.length;
    const thinkingTime = parseFloat((Math.random() * 5 + 2).toFixed(1));

    console.log("Starting simulation with steps:", generatedSteps);

    const runStep = () => {
      console.log("Running step:", stepIndex, "of", totalSteps);

      // If we have gone past the last step, finalize everything.
      if (stepIndex >= totalSteps) {
        console.log("Simulation complete, finalizing.");
        setConversation(prev => {
          const newSteps = [...prev.processSteps];
          // Ensure the very last step is marked complete
          if (totalSteps > 0) {
            newSteps[totalSteps - 1].status = 'complete';
          }

          // Append results to history
          const newMessage = {
            id: `msg_ai_${Date.now()}`,
            role: 'assistant' as const,
            content: finalExplanation,
            processSteps: newSteps,
            report: generatedReport,
            thinkingTime: thinkingTime
          };

          return {
            ...prev,
            status: 'complete',
            processSteps: newSteps,
            thinkingTime: thinkingTime,
            explanation: finalExplanation,
            report: generatedReport, // Main report view
            messages: [...prev.messages, newMessage]
          };
        });
        setIsReportOpen(true);
        return;
      }

      const activeStep = generatedSteps[stepIndex];
      const isResponseStep = activeStep.toLowerCase().includes('respons') || activeStep.toLowerCase().includes('reviewing') || activeStep.toLowerCase().includes('recruit');

      // Update state to set current step to in-progress
      // Update state to set current step to in-progress
      setConversation(prev => {
        const newSteps = [...prev.processSteps];

        // Mark previous step as complete
        if (stepIndex > 0 && newSteps[stepIndex - 1]) {
          newSteps[stepIndex - 1].status = 'complete';
        }

        // Mark current step as in-progress
        if (stepIndex < totalSteps && newSteps[stepIndex]) {
          const stepUpdate: any = {
            ...newSteps[stepIndex],
            status: 'in-progress'
          };

          if (CONFIG.ENABLE_RESPONSE_STREAMING_VISUALIZATION && isResponseStep) {
            stepUpdate.progress = 0;
            stepUpdate.totalResponses = Math.floor(Math.random() * 200) + 100;
          }

          newSteps[stepIndex] = stepUpdate;
        }

        return { ...prev, processSteps: newSteps };
      });

      // Simulation Logic
      let stepDuration = 1500; // Default duration

      // If feature flag is on and this is a response step, utilize the progress bar simulation
      if (CONFIG.ENABLE_RESPONSE_STREAMING_VISUALIZATION && isResponseStep) {
        stepDuration = 3500; // Make it longer to show progress

        const progressInterval = 100; // Update every 100ms
        const steps = stepDuration / progressInterval;
        let currentStep = 0;

        const progressTimer = setInterval(() => {
          currentStep++;
          const progress = Math.min(100, (currentStep / steps) * 100);
          const currentResponses = Math.floor((progress / 100) * (generatedReport.respondents || 500));

          setConversation(prev => {
            const newSteps = [...prev.processSteps];
            if (stepIndex < totalSteps && newSteps[stepIndex]) {
              newSteps[stepIndex] = {
                ...newSteps[stepIndex],
                progress: progress,
                totalResponses: currentResponses
              };
            }
            return { ...prev, processSteps: newSteps };
          });

          if (currentStep >= steps) {
            clearInterval(progressTimer);
            // Trigger next step
            stepIndex++;
            setTimeout(runStep, 200);
          }
        }, progressInterval);

        // Return early so we don't trigger the default timeout below
        return;
      }

      stepIndex++;
      setTimeout(runStep, stepDuration);
    };

    // Start slightly delayed
    setTimeout(runStep, 100);
  };

  const handleSelectReport = (report?: Report) => {
    setIsReportOpen(true);
    // If a specific report is requested (e.g. from history), set it as active
    if (report) {
      setConversation(prev => ({
        ...prev,
        report: report
      }));
    }
    // Default open to 50% if closed (handled by defaultSize in resize panel)
  };

  const handleCloseReport = () => {
    setIsReportOpen(false);
  };

  const handleEditQuestion = async (questionId: string, newText: string, segments: string[]) => {
    if (!conversation.report) return;

    // Optimistic update or just set status to processing
    setConversation(prev => ({
      ...prev,
      status: 'processing',
      processSteps: [{ id: 'updating', label: "Updating question data...", status: 'in-progress' }]
    }));

    // Construct a specific query for the AI to understand we are refining a specific part
    const updateQuery = `Update question "${questionId}" to: "${newText}". Segments: ${segments.length > 0 ? segments.join(', ') : 'None'}. Keep other questions unchanged.`;

    // Pass current report to maintain context
    // We might want to pass a flag or specific instruction to the API helper if we want to be more robust, 
    // but the system prompt should handle "Update" intent.
    const data = await generateResearchData(updateQuery, conversation.report);

    // Handle the finished state, ensuring we merge the updated question back correctly if the AI returns a full report.
    // The existing handleSimulationFinished handles 'update' type.
    handleSimulationFinished(data, true);
  };

  const handleSelectHistory = (hist: Conversation) => {
    setConversation(hist);
    if (hist.status === 'complete' && hist.report) {
      setIsReportOpen(true);
    }
  };

  const handleNewChat = () => {
    setConversation({
      id: `conv_${Date.now()}`,
      query: '',
      messages: [],
      audience: mockAudience,
      processSteps: initialProcessSteps,
      thinkingTime: 0,
      explanation: '',
      report: null,
      status: 'idle',
    });
    setIsReportOpen(false);
  };

  // --- Render based on state ---
  // Layout: Sidebar (left, 25%) | Conversation (right, 75% or 37.5%) | Canvas/Report (right, 37.5% when open)
  
  return (
    <div className="h-[100dvh] w-full overflow-hidden bg-background font-sans text-foreground" style={{ height: '100dvh', minHeight: '100vh' }}>
      <ResizablePanelGroup direction="horizontal" className="h-full" style={{ height: '100%' }}>
        {/* Left: Sidebar */}
        <ResizablePanel
          defaultSize={isSidebarCollapsed ? 5 : 20}
          minSize={isSidebarCollapsed ? 5 : 15}
          maxSize={isSidebarCollapsed ? 5 : 30}
          className="h-full flex-shrink-0"
          style={{
            height: '100%',
            minHeight: '100%'
          }}
          collapsible={true}
        >
          <Sidebar
            conversation={conversation}
            history={history}
            onSelectHistory={handleSelectHistory}
            onNewChat={handleNewChat}
            isCollapsed={isSidebarCollapsed}
            onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          />
        </ResizablePanel>

        <ResizableHandle withHandle disabled={isSidebarCollapsed} className={isSidebarCollapsed ? "pointer-events-none" : ""} />

        {/* Middle: Conversation Panel */}
        <ResizablePanel
          defaultSize={isReportOpen && conversation.report ? (isSidebarCollapsed ? 57.5 : 42.5) : (isSidebarCollapsed ? 95 : 80)}
          minSize={30}
          maxSize={isReportOpen && conversation.report ? 60 : (isSidebarCollapsed ? 95 : 85)}
          className="h-full"
          style={{ height: '100%', minHeight: '100%' }}
        >
          <div className="h-full flex flex-col relative overflow-hidden">
            {conversation.status === 'idle' ? (
              <div className="flex flex-col items-center justify-center h-full w-full space-y-8 px-4 py-8 animate-fade-in">
                <h1 className="text-[32px] font-extrabold tracking-tight text-center px-4">
                  Ask them anything
                </h1>
                <div className="w-full px-4">
                  <div className="w-3/4 min-w-[400px] max-w-3xl mx-auto">
                    <QueryInput
                      onSubmit={startSimulation}
                      isExpanded={false}
                      availableAudiences={availableAudiences}
                      onCreateAudience={handleCreateAudience}
                    />
                  </div>
                </div>
              </div>
            ) : (
              <WorkingPane
                conversation={conversation}
                onSelectReport={handleSelectReport}
                onFollowUp={handleFollowUp}
                availableAudiences={availableAudiences}
                onCreateAudience={handleCreateAudience}
              />
            )}
          </div>
        </ResizablePanel>

        {/* Right: Canvas/Report Panel (only when report is open, 37.5%) */}
        {isReportOpen && conversation.report && (
          <>
            <ResizableHandle withHandle />
            <ResizablePanel 
              defaultSize={37.5} 
              minSize={25} 
              maxSize={50}
              className="h-full" 
              style={{ height: '100%', minHeight: '100%' }}
            >
              <ReportPane conversation={conversation} onClose={handleCloseReport} onEditQuestion={handleEditQuestion} />
            </ResizablePanel>
          </>
        )}
      </ResizablePanelGroup>
    </div>
  );
};

export default App;
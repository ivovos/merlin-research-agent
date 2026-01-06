# Product Documentation

## Overview
Merlin is a synthetic research agent that simulates market research processes using Large Language Models (LLMs). It allows users to instantly conduct quantitative surveys and qualitative focus groups on any topic by simulating specific audience personas.

## Core Capabilities

### 1. Quantitative Surveys
*   **Goal**: Generate statistical insights and trends.
*   **Simulation**: Simulates hundreds of respondents (e.g., N=500).
*   **Output**: Statistical breakdown of answers, audience segmentation (e.g., "Gen Z vs Boomers"), and key insights.

### 2. Qualitative Focus Groups
*   **Goal**: Uncover deep motivations, sentiments, and language.
*   **Trigger**: Use `#focus-group` in the query.
*   **Simulation**: Simulates a smaller, intimate group session (e.g., N=8-12).
*   **Output**: Thematic analysis, sentiment scoring, and direct verbatims (quotes) from synthetic participants.

## Data Model

The application's state is centrally managed around the `Conversation` and `Report` entities.

### Core Entities

#### `Conversation`
The top-level interaction container.
*   **`messages`**: Array of user/assistant messages.
*   **`status`**: State machine (`idle` -> `processing` -> `complete`).
*   **`processSteps`**: The dynamic list of steps shown during the "thinking" phase.
*   **`report`**: The active research report generated from the query.

#### `Report`
The core artifact produced by the agent.
*   **`type`**: `quantitative` | `qualitative`
*   **`audience`**: Target demographic (e.g., "US Teens").
*   **`respondents`**: Number of simulated participants.
*   **`questions`** (Quantitative): List of questions with statistical options and segment breakdowns.
*   **`themes`** (Qualitative): key themes including sentiment (positive/negative) and synthetic quotes.

### TypeScript Definitions
> See `types.ts` for the single source of truth.

## User Flows

### 1. Research Generation Flow
1.  **User Input**: User enters a natural language query (e.g., "Do people like spicy food?").
2.  **Intent Classification**: The system detects if a Focus Group is requested keywords.
3.  **Simulation Phase (`processing`)**:
    *   The UI displays a sequence of `ProcessSteps` (e.g., "Recruiting panel", "Moderating discussion").
    *   Synthetic delays and progress bars visualize the work being done.
    *   API Request: The `systemPrompt` instructs Clyde (Anthropic) to generate the result JSON.
4.  **Result (`complete`)**:
    *   The `ReportPane` slides out (or updates) with the structured data.
    *   The `WorkingPane` shows the completion summary.

### 2. Follow-up & Refinement
*   **Contextual Updates**: Users can ask follow-up questions (e.g., "Now compare this with Gen X").
*   **State Handling**: The previous report is passed as context to the LLM to allow for intelligent updates (maintaining the same ID or creating a new version).

### 3. Audience Management
*   Audiences are persisted in `localStorage`.
*   Users can create custom audiences which are then used as context for the simulation.

## Architecture
*   **Frontend**: React + Vite + Tailwind.
*   **State Management**: Local component state (in `App.tsx`) propagated down via props.
*   **Persistence**: `localStorage` used for History and Audiences.
*   **API**: Direct client-side calls to Anthology API (via `VITE_ANTHROPIC_API_KEY`).

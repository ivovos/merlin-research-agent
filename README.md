# Merlin Research Agent

Merlin is an advanced synthetic research agent designed to simulate qualitative focus groups and quantitative market surveys using AI. By leveraging the Anthropic API, Merlin can generate realistic audience insights, themes, and statistical data in seconds.

## Features

- **Synthetic Focus Groups**: Simulate detailed discussions with specific audience segments to uncover qualitative themes and quotes.
- **Quantitative Surveys**: Generate statistical reports with realistic data distributions and audience comparisons.
- **Audience Segmentation**: Define and compare specific demographics (e.g., "Gen Z vs. Boomers").
- **Interactive Reports**: View and refine research findings in a structured, interactive dashboard.
- **Real-time Simulation**: Watch as the agent designs the study, recruits participants, and analyzes data.

## Tech Stack

- **Framework**: [React](https://react.dev/) + [Vite](https://vitejs.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **AI Integration**: [Anthropic Claude 3](https://www.anthropic.com/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) (inferred)
- **Charts**: [Recharts](https://recharts.org/)
- **Icons**: [Lucide React](https://lucide.dev/)

## Getting Started

### Prerequisites

- **Node.js** (v18 or higher recommended)
- **npm** or **yarn**
- An **Anthropic API Key** (Claude)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/ivovos/merlin-research-agent.git
   cd merlin-research-agent
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Environment**
   Create a `.env.local` file in the root directory and add your API key:
   ```env
   VITE_ANTHROPIC_API_KEY=your_connection_string_here
   ```

4. **Run the Development Server**
   ```bash
   npm run dev
   ```

   The application will be available at `http://localhost:5173`.

## Usage

1. **Enter a Research Query**: Type a question into the main input field (e.g., "What are the barriers to EV adoption in the UK?").
2. **Qualitative Research**: To run a focus group, include the tag `#focus-group` in your query or just ask for a focus group.
3. **Analyze Results**: The agent will simulate the research process and present a detailed report on the right-hand pane.
4. **Follow-up**: Ask follow-up questions to refine the data or explore new angles.

## License

[MIT](LICENSE)

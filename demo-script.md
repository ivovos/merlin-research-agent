# Merlin — Electric Twin Demo Script

**Audience:** Electric Twin team
**Duration:** ~12 minutes
**Tone:** Product-led — show the UX thinking, not just the features. We're demonstrating how this product earns trust from non-research users inside a customer org.

---

## The Story We're Telling

Merlin's value proposition isn't "AI does research." Every startup says that. Our story is: **any person in a customer organisation — a brand manager, a junior marketer, a product lead — can run rigorous research without knowing what methodology to use.** That means two things have to be true:

1. **The UX has to feel approachable.** No research jargon upfront. No configuration screens before you see value.
2. **The output has to earn trust.** People won't act on AI-generated data unless they can see how it was produced, interrogate it, and shape the conclusions.

This demo walks through both.

---

## 1. Home — "Ask Them Anything" (1 minute)

**Setup:** Load the app on the Home screen with MUBI as the active account.

**What to talk about (UX philosophy):**

> "The first thing to notice is what's NOT here. There's no dashboard, no onboarding wizard, no 'create new project' button. We start with a single input: a question. The animated placeholders rotate through real examples — 'Ask @binge-watchers what makes them abandon a series', 'Ask @free-tier-streamers what would make them pay' — to show users the kind of questions they can ask without needing to understand research methodology."

Point out the **method pills** below the input bar (Quick Poll, Survey, Message Test, Focus Group, Creative Testing, Concept Testing).

> "These pills are progressive disclosure. Power users can jump straight to a specific method. But the default path — just type a question — is where 80% of users will start. The agent figures out the methodology. That's the key design decision: **the user describes what they want to know, not how to study it.**"

---

## 2. Chat — The Agent Does the Thinking (2.5 minutes)

**What to show:** Natural language → agent reasoning → structured findings. The full trust chain.

**Type into the input bar:**

> *What are the top reasons MUBI subscribers cancel within the first 3 months?*

**While it processes, talk through the trust architecture:**

> "Watch the processing steps — 'Analyzing your question', 'Selecting research method'. This isn't a loading spinner. It's the agent showing its working. The user can see that Merlin chose a quantitative survey, identified the right audience, and designed the questions. This is critical for trust — people need to understand WHY they're seeing the data they're seeing."

**Click open the Reasoning panel** (the collapsible section that shows during processing).

> "The reasoning panel is our version of 'show your work.' It shows the audience selected, the method chosen, the sample size, and the questions being asked. A research professional would call this the study design. We surface it in plain language so a brand manager can read it and think 'yes, that's the right question to ask.'"

**Once results appear, walk through the Finding Cards:**

> "Results don't come back as a report PDF or a wall of text. They're individual finding cards — each with a headline, an insight, and a chart. This is deliberate. Finding cards are the atomic unit of the product. Each one is a self-contained, shareable piece of evidence."

Point out:

- **The headline** (3–7 words) — scannable, designed for stakeholder decks
- **The insight text** — one sentence explaining what the data means
- **The chart** — horizontal bars with percentages, branded in MUBI's colour
- **The bookmark icon** — save findings to a persistent collection
- **The edit button on the insight** — users can rewrite the conclusion in their own words

> "That edit button is worth pausing on. We deliberately made insights editable. The AI generates a first draft of the conclusion, but the human gets the final say. This is how you build trust in synthetic research — you don't ask people to blindly accept AI output, you give them authorship over the interpretation."

---

## 3. Follow-Up — Context Carries Forward (1 minute)

**What to show:** Conversational refinement without re-fielding.

**Type a follow-up:**

> *How does this differ between users who came from a free trial vs. those who paid from day one?*

> "This is one of the most important interactions. The user doesn't need to set up a new study, pick a new audience, or reconfigure anything. They just ask a follow-up question in natural language, and Merlin generates a new segmented comparison within the same study context. In traditional research, this is a half-day re-field. Here it's a sentence."

**Point out that it's still the same project in the sidebar** — the conversation is continuous.

> "Everything lives in one timeline. The original query, the follow-up, the findings — it's all a single conversation. This is a deliberate choice from the information architecture: one study = one conversation. No tabs, no sub-pages, no context switching."

---

## 4. Complex Query — Plan Approval (2 minutes)

**What to show:** How the agent handles harder questions by surfacing a plan for user approval. This is the key trust mechanism for non-trivial research.

**Type a new question (go Home first, or start a new project from the sidebar):**

> *Compare how Gen Z and Millennials perceive MUBI's brand positioning versus Netflix and Criterion Channel, with a focus on content curation, pricing perception, and social currency.*

> "This is intentionally complex — multiple segments, multiple competitors, multiple dimensions. Watch what happens."

**As it processes, narrate:**

> "The agent recognises this is a complex study. Instead of just running it, it surfaces a **Plan Card**. The card describes the proposed methodology — the audience segments, the questions it'll ask, the sample size. The user can review the plan and approve it, or push back."

**When the Plan Card appears, click 'Review plan'** to open the Study Plan Overlay.

> "This overlay is the full study design — every question, every answer option, every audience segment. A research lead can audit this. A brand manager can skim the headlines and approve. The point is: nobody is surprised by what the agent does. Complex research gets a checkpoint."

**Click 'Approve'** and let it execute. Point out the execution steps ("Recruiting panel", "Fielding survey", "Analyzing results").

> "After approval, the processing steps narrate the execution. Again — this is trust infrastructure. The user can see it's not just 'thinking...' — it's doing specific, named steps that mirror a real research process."

---

## 5. Quick Poll — The Simplest Path (1.5 minutes)

**What to show:** How we lower the barrier for the most casual use case.

Go back to **Home**, click the **Quick Poll** pill.

> "Quick Poll is for when someone just needs a fast gut check. One question, pick an audience, get an answer. No methodology decisions, no builder wizards. We designed this for the person who would otherwise just ask three colleagues in Slack."

**Set up:**

- **Question:** "Which of these would most likely convince you to resubscribe to MUBI?"
- **Options:** A curated 'Welcome Back' collection / A discounted annual plan / Exclusive early access to festival films / Better offline download support
- **Audience:** Churned Subscribers

> "Notice the audience selector. These audiences are pre-built for the MUBI account — they map to real customer segments. The user doesn't define demographics manually; they pick from a library that reflects how the organisation already thinks about its customers. That's important for adoption: the tool speaks the customer's language, not research language."

**Launch and show results.**

---

## 6. Survey Builder — For When You Need Rigour (2 minutes)

**What to show:** The structured path for power users — full control over study design, but still guided.

Click **Survey** from the Home pills.

> "The Survey Builder is for when someone knows they want a specific type of study. It's a 5-step wizard: Type → Audience → Stimuli → Questions → Review."

**Walk through the steps:**

1. **Type** — Select "Brand Health"
   > "We offer pre-defined study types — Brand Health, Concept Test, Message Test, and so on. Each type pre-configures the question framework so the user doesn't start from a blank page."

2. **Audience** — Pick "MUBI Subscribers (Global)" with segment breakdowns
   > "Audiences can be split into segments for comparison. The builder shows how the sample will be distributed."

3. **Questions** — Add 2–3, e.g. satisfaction (Likert scale), NPS, genre preference (multi-select)
   > "Questions have typed formats — Likert, NPS, single choice, open text. The builder validates as you go. It's structured enough to produce clean data, but doesn't require research training to use."

4. **Review** — Show the summary
   > "The review step is a complete study plan — exactly what will be run, against which audience, with what questions. Same principle as the Plan Card: no surprises, full transparency."

**Launch.** Show the processing animation (the overlay with animated steps), then the findings appearing in the project conversation.

---

## 7. Focus Group — Qualitative Depth (1.5 minutes)

**What to show:** That Merlin isn't just surveys — it handles qualitative research with the same ease.

Click **Focus Group** (tagged NEW).

**Choose "You Moderate the Session":**

- **Audience:** MUBI Film Enthusiasts
- **Panel size:** 5
- **Opening question:** "What was the last film you watched on MUBI, and what made you choose it?"

> "The focus group puts the user in the moderator seat. Each synthetic participant has a distinct persona — different viewing habits, different motivations, different communication styles. The user can follow up with individual participants, dig into specific threads, or steer the conversation in real time."

**Start the session, show 2–3 responses, then ask a follow-up question.**

> "The output here is thematic analysis — sentiment, quotes, emerging themes. For qualitative insights that would take weeks of interviews and coding, this gives a directional read in minutes."

---

## 8. Audiences — The Foundation Layer (1 minute)

**Click Audiences in the sidebar.**

> "Everything in Merlin runs against audiences. These are the synthetic panels that mirror real customer segments. For MUBI, that's 'Global Subscribers', 'Churned in Last 30 Days', 'Festival Film Enthusiasts', and so on."

**Click into one audience** to show the detail view.

> "Each audience has defined segments with proportional breakdowns. This is what gives the data structure — the agent isn't generating random responses, it's simulating responses that reflect the composition of a real audience."

> "For a customer like MUBI, these would be seeded from their actual CRM data and research panels. The audiences speak the customer's language — not 'Males 18–34' but 'Binge Watchers' and 'Churned Free Trialers'."

---

## 9. Wrap-Up — The Design Principles (1 minute)

> "So to summarise what you've just seen — and more importantly, why it's designed this way:"

**1. Start with a question, not a form.**
The chat interface means anyone can use Merlin from day one. No training, no research background required. The agent decides the methodology; the user describes what they want to learn.

**2. Show the working.**
Reasoning panels, process steps, plan approval, study plan overlays — every layer is there so users understand and trust what the AI is doing. This isn't a black box.

**3. Findings are atomic and editable.**
Individual finding cards with charts, not monolithic reports. Users can save, edit conclusions, and share individual insights. The AI drafts; the human decides.

**4. Simple to complex, in the same product.**
Quick Poll for gut checks, Survey Builder for structured studies, Focus Group for qualitative depth. Chat for everything in between. One product, one workspace, progressive complexity.

**5. The customer's language, not research language.**
Audiences named after real segments, not demographics. Study types named after business goals, not methodologies. Method pills, not configuration forms. Everything is designed so a brand manager feels at home, not like they've wandered into a research tool.

---

## Pre-Demo Checklist

- [ ] MUBI account is selected in the sidebar
- [ ] No existing projects visible (clear localStorage if needed for clean state)
- [ ] Dark/light mode set to whichever looks best on the projector
- [ ] Browser zoom at 100%
- [ ] Have the example queries ready to paste (faster than live-typing)
- [ ] Sidebar is open and visible throughout

## If Something Breaks

- **API timeout:** Talk through the process steps and explain the architecture. The design of the waiting state IS the demo.
- **Unexpected results:** Use it as an opportunity to show editable insights. "This is exactly why conclusions are editable — the human always has the final word."
- **Slow processing:** "We deliberately show each step rather than hiding behind a spinner. In production, these steps would map to actual panel recruitment, fielding, and analysis."

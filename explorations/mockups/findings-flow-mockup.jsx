import { useState } from "react";

const NAVY = "#1E2761";
const ICE = "#CADCFC";
const ACCENT = "#4A6FA5";
const LIGHT_BG = "#F4F6FC";
const MUTED = "#8890A8";
const GREEN = "#27AE60";
const BODY = "#3A3F5C";

const steps = [
  "chat",        // default chat view
  "dataCard",    // data card appears after survey
  "aiInterpret", // AI interpretation follows
  "suggest",     // AI suggests "save as finding?"
  "modalOpen",   // modal opens with finding draft
  "editing",     // user edits the finding
  "saved",       // finding saved, badge incremented
];

const findingDraft = {
  title: "Onboarding is a critical retention risk",
  insight: "72% of users rate onboarding as difficult, with enterprise users reaching 84%. Calendar integration is the primary friction point.",
  evidence: "Survey: 232 responses (72% difficult, 18% neutral, 10% easy). Interviews: 4/6 participants cited calendar setup as confusing.",
  conclusion: "Calendar integration friction is driving early churn. Simplifying this step should be the top priority for the onboarding team.",
};

export default function FindingsFlowMockup() {
  const [step, setStep] = useState(0);
  const [editedConclusion, setEditedConclusion] = useState(findingDraft.conclusion);
  const [isEditing, setIsEditing] = useState(false);
  const [showPopover, setShowPopover] = useState(false);

  const currentStep = steps[step];
  const showModal = step >= 4 && step < 6;
  const findingSaved = step >= 6;

  const next = () => { setStep((s) => Math.min(s + 1, steps.length - 1)); setShowPopover(false); };
  const prev = () => { setStep((s) => Math.max(s - 1, 0)); setIsEditing(false); setShowPopover(false); };
  const reset = () => { setStep(0); setIsEditing(false); setEditedConclusion(findingDraft.conclusion); setShowPopover(false); };

  const stepLabels = [
    "Chat view",
    "Data card appears",
    "AI interprets",
    "AI suggests finding",
    "Modal: finding draft",
    "Researcher edits",
    "Finding saved",
  ];

  return (
    <div style={{ fontFamily: "'Inter', -apple-system, sans-serif", background: "#F8F9FB", minHeight: "100vh", padding: "24px" }}>
      {/* Header */}
      <div style={{ maxWidth: 1100, margin: "0 auto 16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: NAVY, margin: 0 }}>Bookmark + Share Flow</h1>
          <p style={{ fontSize: 13, color: MUTED, margin: "4px 0 0" }}>Click through to see how data becomes a shareable insight</p>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <button onClick={prev} disabled={step === 0} style={{ ...btnStyle, opacity: step === 0 ? 0.3 : 1 }}>← Back</button>
          <span style={{ fontSize: 12, color: MUTED, minWidth: 60, textAlign: "center" }}>{step + 1} / {steps.length}</span>
          <button onClick={next} disabled={step === steps.length - 1} style={{ ...btnStyle, background: ACCENT, color: "white", opacity: step === steps.length - 1 ? 0.3 : 1 }}>Next →</button>
          <button onClick={reset} style={{ ...btnStyle, fontSize: 11, color: MUTED }}>Reset</button>
        </div>
      </div>

      {/* Step label bar */}
      <div style={{ maxWidth: 1100, margin: "0 auto 12px" }}>
        <div style={{ display: "flex", gap: 4, marginBottom: 8 }}>
          {stepLabels.map((label, i) => (
            <div key={i} onClick={() => { setStep(i); if (i < 5) setIsEditing(false); setShowPopover(false); }} style={{
              flex: 1, padding: "6px 4px", fontSize: 10, textAlign: "center", borderRadius: 4, cursor: "pointer",
              background: i === step ? ACCENT : i < step ? "#D4E0F0" : "#EEF1F6",
              color: i === step ? "white" : i < step ? ACCENT : MUTED,
              fontWeight: i === step ? 600 : 400,
              transition: "all 0.2s",
            }}>
              {label}
            </div>
          ))}
        </div>
      </div>

      {/* Main mockup area */}
      <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", gap: 0, position: "relative", borderRadius: 12, overflow: "hidden", boxShadow: "0 2px 20px rgba(0,0,0,0.08)", height: 580 }}>

        {/* Sidebar */}
        <div style={{ width: 200, background: "#FAFBFD", borderRight: "1px solid #E8ECF2", padding: "16px 12px", flexShrink: 0 }}>
          <button style={{ width: "100%", padding: "8px 12px", background: ACCENT, color: "white", border: "none", borderRadius: 6, fontSize: 13, fontWeight: 600, cursor: "pointer", marginBottom: 16 }}>
            + New study
          </button>
          <div style={{ fontSize: 11, color: MUTED, marginBottom: 8, padding: "0 4px" }}>Recent</div>
          {[
            { name: "Onboarding churn study", active: true, dot: step >= 1 && step <= 3 },
            { name: "Enterprise pricing", active: false },
            { name: "Competitor UX audit", active: false },
          ].map((s, i) => (
            <div key={i} style={{
              padding: "10px 10px", borderRadius: 6, marginBottom: 4, cursor: "pointer",
              background: s.active ? "#EDF1F8" : "transparent",
              display: "flex", alignItems: "flex-start", gap: 6,
            }}>
              {s.dot && <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#3B82F6", marginTop: 4, flexShrink: 0 }} />}
              <div>
                <div style={{ fontSize: 12, fontWeight: s.active ? 600 : 400, color: s.active ? NAVY : BODY }}>{s.name}</div>
                <div style={{ fontSize: 10, color: MUTED }}>{i === 0 ? "2h ago" : i === 1 ? "yesterday" : "last week"}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Chat area — full width, no panels */}
        <div style={{ flex: 1, background: "white", display: "flex", flexDirection: "column", position: "relative" }}>
          {/* Study header */}
          <div style={{ padding: "12px 20px", borderBottom: "1px solid #E8ECF2", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: NAVY }}>Onboarding churn study</div>
              <div style={{ fontSize: 11, color: MUTED, display: "flex", gap: 12, marginTop: 2 }}>
                <span>Survey (232) · 6 interviews</span>
                {/* Findings badge */}
                <span
                  onClick={() => findingSaved && setShowPopover(!showPopover)}
                  style={{
                    cursor: findingSaved ? "pointer" : "default",
                    color: findingSaved ? GREEN : MUTED,
                    fontWeight: findingSaved ? 600 : 400,
                    position: "relative",
                  }}
                >
                  🔖 {findingSaved ? "1" : "0"}

                  {/* Findings popover */}
                  {showPopover && findingSaved && (
                    <div style={{
                      position: "absolute", top: 24, left: -100, width: 300, background: "white",
                      borderRadius: 10, boxShadow: "0 4px 24px rgba(0,0,0,0.15)", border: "1px solid #E8ECF2",
                      zIndex: 100, padding: "14px",
                    }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: NAVY, marginBottom: 10 }}>🔖 Saved Findings</div>
                      <div style={{
                        border: `1px solid ${GREEN}30`, borderRadius: 8, padding: "10px 12px",
                        background: `${GREEN}05`, marginBottom: 10,
                      }}>
                        <div style={{ fontSize: 12, fontWeight: 600, color: NAVY, marginBottom: 4 }}>{findingDraft.title}</div>
                        <div style={{ fontSize: 10, color: MUTED, marginBottom: 8 }}>Survey + interviews · just now</div>
                        <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
                          <button style={{ fontSize: 10, color: ACCENT, background: "none", border: "none", cursor: "pointer" }}>Edit</button>
                          <button style={{ fontSize: 10, color: ACCENT, background: "none", border: "none", cursor: "pointer", fontWeight: 600 }}>↗ Share</button>
                        </div>
                      </div>
                      <div style={{ textAlign: "center", padding: "8px", borderRadius: 6, border: "1px dashed #D4D8E0", fontSize: 11, color: MUTED, cursor: "pointer" }}>
                        + Create report from findings
                      </div>
                    </div>
                  )}
                </span>
              </div>
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              {["Onboarding", "Enterprise"].map((l) => (
                <span key={l} style={{ fontSize: 10, padding: "2px 8px", borderRadius: 10, background: LIGHT_BG, color: ACCENT }}>{l}</span>
              ))}
            </div>
          </div>

          {/* Chat messages */}
          <div style={{ flex: 1, padding: "20px 20px", overflowY: "auto" }}>
            {/* User message */}
            <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 16 }}>
              <div style={{ background: ACCENT, color: "white", padding: "10px 14px", borderRadius: "12px 12px 2px 12px", fontSize: 13, maxWidth: 400 }}>
                What did the survey show about the onboarding experience?
              </div>
            </div>

            {/* Data Card */}
            {step >= 1 && (
              <div style={{
                border: "1px solid #E2E8F0", borderRadius: 10, padding: 0, marginBottom: 16,
                opacity: step >= 1 ? 1 : 0, transition: "opacity 0.4s", overflow: "hidden",
              }}>
                <div style={{ background: "#F7FAFC", padding: "10px 16px", borderBottom: "1px solid #E2E8F0", display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 14 }}>📊</span>
                  <span style={{ fontSize: 12, fontWeight: 600, color: NAVY }}>Survey: Onboarding Experience</span>
                  <span style={{ fontSize: 10, color: MUTED, marginLeft: "auto" }}>232 responses · 78% completion</span>
                </div>
                <div style={{ padding: "14px 16px" }}>
                  <div style={{ fontSize: 12, color: MUTED, marginBottom: 10 }}>"How would you rate the onboarding process?"</div>
                  {[
                    { label: "Difficult", pct: 72, color: "#E74C3C" },
                    { label: "Neutral", pct: 18, color: "#F39C12" },
                    { label: "Easy", pct: 10, color: "#27AE60" },
                  ].map((r) => (
                    <div key={r.label} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                      <span style={{ fontSize: 11, color: BODY, width: 55 }}>{r.label}</span>
                      <div style={{ flex: 1, height: 16, background: "#F0F2F5", borderRadius: 3, overflow: "hidden" }}>
                        <div style={{ width: `${r.pct}%`, height: "100%", background: r.color, borderRadius: 3, transition: "width 0.6s ease" }} />
                      </div>
                      <span style={{ fontSize: 11, fontWeight: 600, color: BODY, width: 30, textAlign: "right" }}>{r.pct}%</span>
                    </div>
                  ))}
                </div>
                {/* Inline actions: Expand, Bookmark, Share */}
                <div style={{ borderTop: "1px solid #E2E8F0", padding: "8px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <button style={{ fontSize: 11, color: MUTED, background: "none", border: "none", cursor: "pointer" }}>Expand details</button>
                  <div style={{ display: "flex", gap: 12 }}>
                    <button onClick={() => setStep(4)} style={{
                      fontSize: 11, color: ACCENT, background: "none", border: "none", cursor: "pointer", fontWeight: 600,
                      ...(step === 1 ? { animation: "pulse 2s infinite" } : {}),
                    }}>
                      🔖 Save
                    </button>
                    <button style={{ fontSize: 11, color: ACCENT, background: "none", border: "none", cursor: "pointer", fontWeight: 500 }}>
                      ↗ Share
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* AI Interpretation */}
            {step >= 2 && (
              <div style={{ marginBottom: 16, opacity: step >= 2 ? 1 : 0, transition: "opacity 0.4s" }}>
                <div style={{ background: "#FAFBFD", padding: "12px 16px", borderRadius: 12, border: "1px solid #EEF1F6", fontSize: 13, color: BODY, lineHeight: 1.6 }}>
                  This shows a strong skew toward difficulty — 72% is notably high. It might be worth looking at whether this differs between enterprise and SMB users, since enterprise onboarding often involves additional steps like calendar integration and team setup.
                  <br /><br />
                  Interestingly, 10% found it easy. If we can identify what those users have in common, that could point to what's working in the current flow.
                </div>
                {/* Inline actions on AI interpretation */}
                <div style={{ display: "flex", gap: 12, justifyContent: "flex-end", padding: "6px 4px" }}>
                  <button onClick={() => setStep(4)} style={{ fontSize: 11, color: ACCENT, background: "none", border: "none", cursor: "pointer", fontWeight: 600 }}>
                    🔖 Save
                  </button>
                  <button style={{ fontSize: 11, color: ACCENT, background: "none", border: "none", cursor: "pointer", fontWeight: 500 }}>
                    ↗ Share
                  </button>
                </div>
              </div>
            )}

            {/* AI Suggestion chip */}
            {step >= 3 && (
              <div style={{ marginBottom: 16, opacity: step >= 3 ? 1 : 0, transition: "opacity 0.4s" }}>
                <button onClick={() => setStep(4)} style={{
                  display: "inline-flex", alignItems: "center", gap: 6,
                  padding: "8px 14px", borderRadius: 20, border: `1px solid ${ACCENT}30`,
                  background: `${ACCENT}08`, color: ACCENT, fontSize: 12, fontWeight: 500,
                  cursor: "pointer",
                }}>
                  <span>💡</span> Would you like me to save this as a finding?
                </button>
              </div>
            )}
          </div>

          {/* Input */}
          <div style={{ padding: "12px 20px", borderTop: "1px solid #E8ECF2" }}>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <div style={{ flex: 1, padding: "10px 14px", background: "#F7F8FA", borderRadius: 8, fontSize: 13, color: MUTED }}>
                Ask a question, run a method, save a finding...
              </div>
              <div style={{ width: 36, height: 36, borderRadius: 8, background: ACCENT, display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: 16 }}>↑</div>
            </div>
          </div>

          {/* Modal overlay — opens when creating a finding */}
          {(showModal || (step === 5)) && (
            <>
              {/* Dimmed backdrop */}
              <div style={{
                position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
                background: "rgba(0,0,0,0.3)", zIndex: 10,
              }} />

              {/* Modal */}
              <div style={{
                position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)",
                width: 480, maxHeight: 500, background: "white", zIndex: 20,
                borderRadius: 12, boxShadow: "0 8px 40px rgba(0,0,0,0.2)",
                display: "flex", flexDirection: "column", overflow: "hidden",
                animation: "fadeIn 0.2s ease",
              }}>
                {/* Modal header */}
                <div style={{ padding: "16px 20px", borderBottom: "1px solid #E8ECF2", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ fontSize: 15, fontWeight: 600, color: NAVY }}>Save as Finding</div>
                  <button onClick={() => setStep(Math.max(step, 3))} style={{ background: "none", border: "none", fontSize: 18, color: MUTED, cursor: "pointer" }}>✕</button>
                </div>

                {/* Modal content */}
                <div style={{ flex: 1, padding: "16px 20px", overflowY: "auto" }}>
                  {/* Title */}
                  <div style={{ marginBottom: 14 }}>
                    <div style={{ fontSize: 10, fontWeight: 600, color: MUTED, marginBottom: 4, letterSpacing: 0.5 }}>TITLE</div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: NAVY, padding: "8px 10px", background: "#F7F8FA", borderRadius: 6 }}>
                      {findingDraft.title}
                    </div>
                  </div>

                  {/* Key insight */}
                  <div style={{ marginBottom: 14 }}>
                    <div style={{ fontSize: 10, fontWeight: 600, color: MUTED, marginBottom: 4, letterSpacing: 0.5 }}>KEY INSIGHT</div>
                    <div style={{ fontSize: 12, color: BODY, lineHeight: 1.5, padding: "8px 10px", background: "#F7F8FA", borderRadius: 6 }}>
                      {findingDraft.insight}
                    </div>
                  </div>

                  {/* Evidence with mini chart */}
                  <div style={{ marginBottom: 14 }}>
                    <div style={{ fontSize: 10, fontWeight: 600, color: MUTED, marginBottom: 4, letterSpacing: 0.5 }}>EVIDENCE</div>
                    <div style={{ background: "#F7F8FA", padding: "10px 12px", borderRadius: 6 }}>
                      {/* Embedded mini chart */}
                      <div style={{ marginBottom: 8 }}>
                        <div style={{ fontSize: 10, color: MUTED, marginBottom: 6 }}>📊 Survey: Onboarding Experience</div>
                        {[
                          { label: "Difficult", pct: 72, color: "#E74C3C" },
                          { label: "Neutral", pct: 18, color: "#F39C12" },
                          { label: "Easy", pct: 10, color: "#27AE60" },
                        ].map((r) => (
                          <div key={r.label} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
                            <span style={{ fontSize: 9, color: BODY, width: 45 }}>{r.label}</span>
                            <div style={{ flex: 1, height: 10, background: "#E8ECF2", borderRadius: 2, overflow: "hidden" }}>
                              <div style={{ width: `${r.pct}%`, height: "100%", background: r.color, borderRadius: 2 }} />
                            </div>
                            <span style={{ fontSize: 9, fontWeight: 600, color: BODY, width: 25, textAlign: "right" }}>{r.pct}%</span>
                          </div>
                        ))}
                      </div>
                      {/* Quote */}
                      <div style={{ fontSize: 11, color: BODY, fontStyle: "italic", borderLeft: `2px solid ${ACCENT}`, paddingLeft: 8 }}>
                        "The calendar setup was confusing — I didn't know why I needed it" — Participant 3, Enterprise
                      </div>
                    </div>
                  </div>

                  {/* Conclusion — editable */}
                  <div style={{ marginBottom: 14 }}>
                    <div style={{ fontSize: 10, fontWeight: 600, color: MUTED, marginBottom: 4, letterSpacing: 0.5, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      CONCLUSION
                      {step === 5 && (
                        <span onClick={() => setIsEditing(!isEditing)} style={{ color: ACCENT, cursor: "pointer", fontSize: 10, fontWeight: 500 }}>
                          {isEditing ? "Done" : "Edit ✎"}
                        </span>
                      )}
                    </div>
                    {isEditing ? (
                      <textarea
                        value={editedConclusion}
                        onChange={(e) => setEditedConclusion(e.target.value)}
                        style={{
                          width: "100%", minHeight: 70, fontSize: 12, color: BODY, lineHeight: 1.5,
                          border: `1px solid ${ACCENT}`, borderRadius: 6, padding: "8px 10px",
                          fontFamily: "inherit", resize: "vertical", outline: "none",
                        }}
                      />
                    ) : (
                      <div style={{
                        fontSize: 12, color: BODY, lineHeight: 1.5, padding: "8px 10px", borderRadius: 6,
                        ...(step === 5 ? { border: `1px dashed ${ACCENT}40`, cursor: "pointer" } : { background: "#F7F8FA" }),
                      }} onClick={() => step === 5 && setIsEditing(true)}>
                        {editedConclusion}
                      </div>
                    )}
                  </div>

                  {/* Provenance */}
                  <div style={{ fontSize: 10, color: MUTED, display: "flex", gap: 4, alignItems: "center" }}>
                    From: Survey (232 responses) · 6 interviews
                  </div>
                </div>

                {/* Modal actions */}
                <div style={{ borderTop: "1px solid #E8ECF2", padding: "12px 20px", display: "flex", gap: 8, justifyContent: "flex-end" }}>
                  <button onClick={() => setStep(6)} style={{
                    padding: "8px 20px", borderRadius: 6, border: `1px solid ${ACCENT}`,
                    background: "white", color: ACCENT, fontSize: 12, fontWeight: 500, cursor: "pointer",
                  }}>
                    Save 🔖
                  </button>
                  <button onClick={() => setStep(6)} style={{
                    padding: "8px 20px", borderRadius: 6, border: "none",
                    background: ACCENT, color: "white", fontSize: 12, fontWeight: 600, cursor: "pointer",
                  }}>
                    Save & Share ↗
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Annotation */}
      <div style={{ maxWidth: 1100, margin: "16px auto 0", padding: "14px 18px", background: "white", borderRadius: 8, border: "1px solid #E8ECF2" }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: NAVY, marginBottom: 4 }}>
          What's happening: {stepLabels[step]}
        </div>
        <div style={{ fontSize: 12, color: BODY, lineHeight: 1.5 }}>
          {step === 0 && "The researcher is in a study conversation, asking the AI about survey results. The chat is full-width — no panels, no drawers."}
          {step === 1 && "A data card appears with the raw survey results. It's factual and immutable — just the numbers, no interpretation. Note the [🔖 Save] and [↗ Share] actions inline on the card."}
          {step === 2 && "The AI follows up with its interpretation — provisional, conversational, challengeable. It also has [🔖 Save] and [↗ Share] actions. Clicking ↗ Share here would send the data card + AI interpretation bundled together."}
          {step === 3 && "The AI suggests saving a finding. This is a subtle chip, not a modal — the researcher can ignore it. This is one of the three paths to creating a finding."}
          {step === 4 && "A modal opens over the chat. The AI has drafted a finding with title, key insight, evidence (including the embedded chart), and conclusion — all pre-filled from the conversation context."}
          {step === 5 && "The researcher can edit any field — especially the conclusion. Click 'Edit' on the conclusion to try it. This is where human judgment meets AI synthesis."}
          {step === 6 && "Finding is saved! The 🔖 badge in the header now shows \"1\". Click the badge to see the findings popover — a lightweight list with Edit and Share actions. No drawer, no panel."}
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translate(-50%, -48%); }
          to { opacity: 1; transform: translate(-50%, -50%); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}

const btnStyle = {
  padding: "6px 14px",
  borderRadius: 6,
  border: "1px solid #D4D8E0",
  background: "white",
  color: NAVY,
  fontSize: 12,
  fontWeight: 500,
  cursor: "pointer",
};

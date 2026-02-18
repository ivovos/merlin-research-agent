import { useState, useRef } from "react";

/* ── Icons (inline SVGs) ── */
const Icon = {
  Bookmark: ({ filled }) => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
  ),
  Share: () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="7" y1="17" x2="17" y2="7"/><polyline points="7 7 17 7 17 17"/></svg>
  ),
  ThumbsUp: () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14z"/><path d="M7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/></svg>
  ),
  ThumbsDown: () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3H10z"/><path d="M17 2h3a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2h-3"/></svg>
  ),
  Copy: () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
  ),
  Expand: () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/></svg>
  ),
  Check: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
  ),
  ChevronLeft: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>
  ),
  ChevronRight: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#d4d4d8" strokeWidth="2" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>
  ),
  Close: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
  ),
  Link: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
  ),
  Quote: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#a1a1aa" strokeWidth="2" strokeLinecap="round"><path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V21z"/><path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3z"/></svg>
  ),
};

/* ── Mini chart thumbnail for list view ── */
function MiniChart({ chart, quote }) {
  if (chart) {
    return (
      <div style={{
        width: 56, height: 40, borderRadius: 6,
        background: "#f4f4f5", border: "1px solid #e4e4e7",
        padding: "6px 5px", display: "flex", flexDirection: "column",
        justifyContent: "center", gap: 2, flexShrink: 0,
      }}>
        {chart.bars.map((bar) => (
          <div key={bar.label} style={{ display: "flex", alignItems: "center", gap: 2 }}>
            <div style={{
              flex: 1, height: 4, background: "#e4e4e7",
              borderRadius: 2, overflow: "hidden",
            }}>
              <div style={{
                width: `${bar.pct}%`, height: "100%",
                background: bar.color, borderRadius: 2,
              }} />
            </div>
          </div>
        ))}
      </div>
    );
  }
  if (quote) {
    return (
      <div style={{
        width: 56, height: 40, borderRadius: 6,
        background: "#f4f4f5", border: "1px solid #e4e4e7",
        display: "flex", alignItems: "center", justifyContent: "center",
        flexShrink: 0,
      }}>
        <Icon.Quote />
      </div>
    );
  }
  return null;
}

/* ── Mock data for evidence cards in chat ── */
const chatEvidence = {
  dataCard: {
    question: "How would you rate the onboarding process?",
    n: 232,
    bars: [
      { label: "Difficult", pct: 72, color: "#dc2626" },
      { label: "Neutral", pct: 18, color: "#f59e0b" },
      { label: "Easy", pct: 10, color: "#16a34a" },
    ],
  },
  aiInterpretation: "The data is striking — **72% of users rated onboarding as difficult**, with enterprise users reaching 84%. The calendar integration step appears to be the primary friction point. 4 out of 6 interview participants cited it as the most confusing step. This isn't just a UX issue — it's likely driving early churn.",
  followUpCard: {
    question: "Drop-off rate by segment during onboarding",
    n: 232,
    bars: [
      { label: "Enterprise", pct: 41, color: "#dc2626" },
      { label: "Mid-market", pct: 22, color: "#f59e0b" },
      { label: "SMB", pct: 13, color: "#16a34a" },
    ],
  },
  quote: {
    text: "The calendar setup was confusing — I didn't know why I needed it.",
    attribution: "Participant 3, Enterprise",
  },
};

/* ── Saved findings data ── */
const initialFindings = [
  {
    id: "f1",
    title: "Onboarding is a critical retention risk",
    insight: "72% of users rate onboarding as difficult, with enterprise users reaching 84%.",
    conclusion: "Calendar integration friction is driving early churn. Simplifying this step should be the top priority for the onboarding team.",
    source: "Survey (232 responses) · 6 interviews",
    time: "2h ago",
    chart: chatEvidence.dataCard,
    quote: chatEvidence.quote,
  },
  {
    id: "f2",
    title: "Enterprise users have unique onboarding needs",
    insight: "Enterprise users are 3.2x more likely to drop off during team setup than SMB users.",
    conclusion: "Enterprise onboarding should be a separate flow with dedicated calendar and team integration steps that match their IT workflows.",
    source: "Survey · cross-tab analysis",
    time: "2h ago",
    chart: chatEvidence.followUpCard,
    quote: null,
  },
  {
    id: "f3",
    title: "Calendar integration is the key friction point",
    insight: "4 out of 6 interview participants cited calendar setup as the most confusing step.",
    conclusion: "The calendar integration step needs a complete redesign. Consider: (1) making it optional at onboarding, (2) adding a clear explanation of why it's needed, (3) offering a guided setup wizard.",
    source: "6 interviews",
    time: "yesterday",
    chart: null,
    quote: {
      text: "I almost gave up at the calendar step. I didn't understand why a research tool needed access to my calendar.",
      attribution: "Participant 5, Mid-market",
    },
  },
];

/* ── Reusable ActionStrip ── */
function ActionStrip({ variant, isSaved, onSave, onShare, showToast }) {
  const [hoveredBtn, setHoveredBtn] = useState(null);
  const btnStyle = (id) => ({
    position: "relative",
    display: "flex", alignItems: "center", justifyContent: "center",
    width: 30, height: 28, borderRadius: 6,
    border: "none", background: hoveredBtn === id ? "#f4f4f5" : "transparent",
    color: id === "save" && isSaved ? "#18181b" : (hoveredBtn === id ? "#18181b" : "#a1a1aa"),
    cursor: "pointer", transition: "all 0.12s",
  });

  const Tooltip = ({ text, id }) =>
    hoveredBtn === id ? (
      <div style={{
        position: "absolute", bottom: "calc(100% + 6px)", left: "50%",
        transform: "translateX(-50%)", whiteSpace: "nowrap",
        background: "#18181b", color: "#fff", fontSize: 11,
        padding: "4px 8px", borderRadius: 5, pointerEvents: "none",
        zIndex: 10,
      }}>{text}</div>
    ) : null;

  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "4px 12px", borderTop: "1px solid #f4f4f5", minHeight: 36,
    }}>
      <div style={{ display: "flex", gap: 2 }}>
        {variant === "data-card" && (
          <button style={btnStyle("expand")}
            onMouseEnter={() => setHoveredBtn("expand")}
            onMouseLeave={() => setHoveredBtn(null)}>
            <Tooltip text="Expand" id="expand" />
            <Icon.Expand />
          </button>
        )}
        {variant === "ai-interpretation" && (
          <>
            <button style={btnStyle("up")}
              onMouseEnter={() => setHoveredBtn("up")}
              onMouseLeave={() => setHoveredBtn(null)}>
              <Tooltip text="Good response" id="up" />
              <Icon.ThumbsUp />
            </button>
            <button style={btnStyle("down")}
              onMouseEnter={() => setHoveredBtn("down")}
              onMouseLeave={() => setHoveredBtn(null)}>
              <Tooltip text="Bad response" id="down" />
              <Icon.ThumbsDown />
            </button>
            <button style={btnStyle("copy")}
              onMouseEnter={() => setHoveredBtn("copy")}
              onMouseLeave={() => setHoveredBtn(null)}
              onClick={() => showToast?.("Copied to clipboard")}>
              <Tooltip text="Copy" id="copy" />
              <Icon.Copy />
            </button>
          </>
        )}
      </div>
      <div style={{ display: "flex", gap: 2 }}>
        <button style={btnStyle("save")}
          onMouseEnter={() => setHoveredBtn("save")}
          onMouseLeave={() => setHoveredBtn(null)}
          onClick={onSave}>
          <Tooltip text={isSaved ? "Saved as finding" : "Save as finding"} id="save" />
          <Icon.Bookmark filled={isSaved} />
        </button>
        <button style={btnStyle("share")}
          onMouseEnter={() => setHoveredBtn("share")}
          onMouseLeave={() => setHoveredBtn(null)}
          onClick={onShare}>
          <Tooltip text="Share" id="share" />
          <Icon.Share />
        </button>
      </div>
    </div>
  );
}

/* ── Data Card component ── */
function DataCard({ chart, quote, isSaved, onSave, onShare, showToast }) {
  return (
    <div style={{
      border: "1px solid #e4e4e7", borderRadius: 12,
      background: "#fff", overflow: "hidden",
    }}>
      <div style={{
        padding: "10px 14px 6px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: "#a1a1aa", textTransform: "uppercase", letterSpacing: "0.5px" }}>
          Survey Result
        </div>
        <div style={{ fontSize: 10, color: "#d4d4d8" }}>n={chart.n}</div>
      </div>
      <div style={{ padding: "4px 14px 10px" }}>
        <div style={{ fontSize: 12, color: "#3f3f46", marginBottom: 10, fontWeight: 500 }}>
          {chart.question}
        </div>
        {chart.bars.map((bar) => (
          <div key={bar.label} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 5 }}>
            <span style={{ fontSize: 11, color: "#3f3f46", width: 70 }}>{bar.label}</span>
            <div style={{ flex: 1, height: 16, background: "#f4f4f5", borderRadius: 4, overflow: "hidden" }}>
              <div style={{
                width: `${bar.pct}%`, height: "100%",
                background: bar.color, borderRadius: 4,
                transition: "width 0.6s ease",
              }} />
            </div>
            <span style={{ fontSize: 11, fontWeight: 600, color: "#3f3f46", width: 32, textAlign: "right" }}>{bar.pct}%</span>
          </div>
        ))}
      </div>
      {quote && (
        <div style={{ padding: "8px 14px 12px" }}>
          <div style={{
            fontSize: 12, color: "#3f3f46", fontStyle: "italic",
            lineHeight: 1.5, borderLeft: "2px solid #d4d4d8", paddingLeft: 10,
          }}>
            "{quote.text}"
            <div style={{ fontSize: 11, color: "#a1a1aa", fontStyle: "normal", marginTop: 2 }}>
              — {quote.attribution}
            </div>
          </div>
        </div>
      )}
      <ActionStrip variant="data-card" isSaved={isSaved} onSave={onSave} onShare={onShare} showToast={showToast} />
    </div>
  );
}

/* ── AI Interpretation block ── */
function AIInterpretation({ text, isSaved, onSave, onShare, showToast }) {
  const renderText = (str) => {
    const parts = str.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, i) =>
      part.startsWith("**") && part.endsWith("**")
        ? <strong key={i} style={{ fontWeight: 600 }}>{part.slice(2, -2)}</strong>
        : <span key={i}>{part}</span>
    );
  };

  return (
    <div style={{
      border: "1px solid #e4e4e7", borderRadius: 12,
      background: "#fafafa", overflow: "hidden",
    }}>
      <div style={{
        padding: "10px 14px 4px",
        display: "flex", alignItems: "center", gap: 6,
      }}>
        <div style={{
          width: 20, height: 20, borderRadius: "50%",
          background: "#18181b",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 10, color: "#fff", fontWeight: 700,
        }}>AI</div>
        <span style={{ fontSize: 11, fontWeight: 600, color: "#71717a" }}>Analysis</span>
      </div>
      <div style={{
        padding: "6px 14px 12px",
        fontSize: 13, lineHeight: 1.65, color: "#3f3f46",
      }}>
        {renderText(text)}
      </div>
      <ActionStrip variant="ai-interpretation" isSaved={isSaved} onSave={onSave} onShare={onShare} showToast={showToast} />
    </div>
  );
}

/* ── Toast ── */
function Toast({ message, visible }) {
  if (!visible) return null;
  return (
    <div style={{
      position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)",
      background: "#18181b", color: "#fff", fontSize: 12, fontWeight: 500,
      padding: "8px 16px", borderRadius: 8, zIndex: 100,
      boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
      animation: "fadeInUp 0.15s ease",
      display: "flex", alignItems: "center", gap: 6,
    }}>
      <Icon.Check />
      {message}
    </div>
  );
}

/* ── Share popover (reusable) ── */
function SharePopover({ title, onClose }) {
  return (
    <div style={{
      position: "absolute", bottom: "calc(100% + 8px)", right: 0,
      width: 260, background: "#fff",
      border: "1px solid #e4e4e7", borderRadius: 12,
      boxShadow: "0 4px 20px rgba(0,0,0,0.1)", padding: "12px",
      animation: "fadeInUp 0.1s ease", zIndex: 20,
    }}>
      <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 10 }}>{title}</div>
      {[
        { name: "Sarah Chen", role: "Product", initials: "SC" },
        { name: "Marcus Webb", role: "Design", initials: "MW" },
        { name: "Priya Patel", role: "Research", initials: "PP" },
      ].map((person) => (
        <button
          key={person.name}
          style={{
            width: "100%", display: "flex", alignItems: "center", gap: 10,
            padding: "8px", borderRadius: 8,
            border: "none", background: "transparent",
            cursor: "pointer", fontFamily: "inherit", transition: "background 0.1s",
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = "#fafafa"}
          onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
        >
          <div style={{
            width: 28, height: 28, borderRadius: "50%",
            background: "#f4f4f5", border: "1px solid #e4e4e7",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 10, fontWeight: 600, color: "#71717a",
          }}>{person.initials}</div>
          <div style={{ textAlign: "left" }}>
            <div style={{ fontSize: 12, fontWeight: 500, color: "#09090b" }}>{person.name}</div>
            <div style={{ fontSize: 11, color: "#a1a1aa" }}>{person.role}</div>
          </div>
        </button>
      ))}
      <div style={{ borderTop: "1px solid #f4f4f5", margin: "8px 0" }} />
      <button
        style={{
          width: "100%", display: "flex", alignItems: "center", gap: 8,
          padding: "8px", borderRadius: 8, border: "none", background: "transparent",
          cursor: "pointer", fontFamily: "inherit", fontSize: 12, color: "#71717a",
          transition: "background 0.1s",
        }}
        onMouseEnter={(e) => e.currentTarget.style.background = "#fafafa"}
        onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
      ><Icon.Link /> Copy link</button>
    </div>
  );
}

/* ── Main Component ── */
export default function FindingsLightboxMockup() {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [selectedFinding, setSelectedFinding] = useState(null);
  const [editingConclusion, setEditingConclusion] = useState(false);
  const [conclusions, setConclusions] = useState(
    Object.fromEntries(initialFindings.map(f => [f.id, f.conclusion]))
  );
  const [copied, setCopied] = useState(false);
  const [sharePopover, setSharePopover] = useState(false);
  const [shareAllPopover, setShareAllPopover] = useState(false);
  const textareaRef = useRef(null);

  const [savedCards, setSavedCards] = useState({ card1: true, ai1: true, card2: false });
  const [toastMsg, setToastMsg] = useState(null);
  const [findings] = useState(initialFindings);

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 2000);
  };

  const toggleSave = (cardId) => {
    const wasSaved = savedCards[cardId];
    setSavedCards(prev => ({ ...prev, [cardId]: !wasSaved }));
    showToast(wasSaved ? "Removed from findings" : "Saved as finding");
  };

  const handleCopy = () => {
    const f = findings.find(x => x.id === selectedFinding);
    if (!f) return;
    const text = [
      `**${f.title}**`, "",
      f.insight, "",
      f.chart ? f.chart.bars.map(b => `${b.label}: ${b.pct}%`).join(" · ") : "",
      f.quote ? `"${f.quote.text}" — ${f.quote.attribution}` : "",
      "", `Conclusion: ${conclusions[f.id]}`, "",
      `Source: ${f.source}`,
    ].filter(Boolean).join("\n");
    navigator.clipboard?.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyAll = () => {
    const text = findings.map(f => [
      `## ${f.title}`,
      f.insight,
      f.chart ? f.chart.bars.map(b => `${b.label}: ${b.pct}%`).join(" · ") : "",
      f.quote ? `"${f.quote.text}" — ${f.quote.attribution}` : "",
      `Conclusion: ${conclusions[f.id]}`,
      `Source: ${f.source}`,
      "",
    ].filter(Boolean).join("\n")).join("\n---\n\n");
    navigator.clipboard?.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const finding = findings.find(f => f.id === selectedFinding);
  const findingsCount = Object.values(savedCards).filter(Boolean).length;

  const closeLightbox = () => {
    setLightboxOpen(false);
    setSelectedFinding(null);
    setEditingConclusion(false);
    setSharePopover(false);
    setShareAllPopover(false);
  };

  return (
    <div style={{
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
      background: "#ffffff", minHeight: "100vh", color: "#09090b",
      WebkitFontSmoothing: "antialiased",
    }}>

      {/* ── Study header ── */}
      <div style={{
        borderBottom: "1px solid #e4e4e7", padding: "12px 24px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        position: "sticky", top: 0, background: "#fff", zIndex: 20,
      }}>
        <div>
          <div style={{ fontSize: 14, fontWeight: 600, letterSpacing: "-0.2px" }}>Onboarding churn study</div>
          <div style={{ fontSize: 12, color: "#a1a1aa", marginTop: 2, display: "flex", gap: 12, alignItems: "center" }}>
            <span>Survey (232) · 6 interviews</span>
            <button
              onClick={() => { setLightboxOpen(true); setSelectedFinding(null); }}
              style={{
                display: "inline-flex", alignItems: "center", gap: 4,
                padding: "2px 8px", borderRadius: 10,
                border: "1px solid #e4e4e7", background: findingsCount > 0 ? "#fafafa" : "#fff",
                fontSize: 12, fontWeight: 600, color: "#18181b",
                cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "#f4f4f5"; e.currentTarget.style.borderColor = "#a1a1aa"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = findingsCount > 0 ? "#fafafa" : "#fff"; e.currentTarget.style.borderColor = "#e4e4e7"; }}
            >
              <span style={{ fontSize: 13 }}>🔖</span>
              <span>{findingsCount}</span>
            </button>
          </div>
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          {["Onboarding", "Enterprise"].map(l => (
            <span key={l} style={{
              fontSize: 11, padding: "2px 8px", borderRadius: 10,
              background: "#f4f4f5", color: "#71717a",
            }}>{l}</span>
          ))}
        </div>
      </div>

      {/* ── Chat area with evidence cards ── */}
      <div style={{ padding: "24px 24px 100px", maxWidth: 640, margin: "0 auto" }}>

        {/* User message */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
            <div style={{
              width: 24, height: 24, borderRadius: "50%", background: "#e4e4e7",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 10, fontWeight: 600, color: "#71717a",
            }}>IV</div>
            <span style={{ fontSize: 12, fontWeight: 500, color: "#3f3f46" }}>You</span>
          </div>
          <div style={{
            fontSize: 13, lineHeight: 1.6, color: "#3f3f46", padding: "0 0 0 32px",
          }}>
            What are the biggest onboarding issues? Break it down by segment.
          </div>
        </div>

        {/* Data card 1 — saved */}
        <div style={{ marginBottom: 16, paddingLeft: 32 }}>
          <DataCard
            chart={chatEvidence.dataCard}
            quote={chatEvidence.quote}
            isSaved={savedCards.card1}
            onSave={() => toggleSave("card1")}
            onShare={() => showToast("Share dialog would open")}
            showToast={showToast}
          />
        </div>

        {/* AI interpretation — saved */}
        <div style={{ marginBottom: 16, paddingLeft: 32 }}>
          <AIInterpretation
            text={chatEvidence.aiInterpretation}
            isSaved={savedCards.ai1}
            onSave={() => toggleSave("ai1")}
            onShare={() => showToast("Share dialog would open")}
            showToast={showToast}
          />
        </div>

        {/* Data card 2 — not saved */}
        <div style={{ marginBottom: 16, paddingLeft: 32 }}>
          <DataCard
            chart={chatEvidence.followUpCard}
            quote={null}
            isSaved={savedCards.card2}
            onSave={() => toggleSave("card2")}
            onShare={() => showToast("Share dialog would open")}
            showToast={showToast}
          />
        </div>

        {/* Hint */}
        <div style={{
          marginTop: 24, padding: "16px 20px", borderRadius: 10,
          background: "#fafafa", border: "1px solid #f4f4f5",
          fontSize: 12, color: "#a1a1aa", lineHeight: 1.6, textAlign: "center",
        }}>
          <strong style={{ color: "#71717a" }}>Try it:</strong> Click <span style={{ fontWeight: 600, color: "#18181b" }}>🔖</span> on any card to save/unsave.
          Then click <strong style={{ color: "#18181b" }}>🔖 {findingsCount}</strong> in the header to view and share findings.
        </div>
      </div>

      {/* ── Findings Lightbox ── */}
      {lightboxOpen && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 50,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <div
            style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.2)" }}
            onClick={closeLightbox}
          />

          <div style={{
            position: "relative", zIndex: 10,
            width: "100%", maxWidth: selectedFinding ? 560 : 500,
            margin: "0 16px",
            background: "#fff", border: "1px solid #e4e4e7",
            borderRadius: 16, boxShadow: "0 8px 40px rgba(0,0,0,0.12)",
            display: "flex", flexDirection: "column",
            maxHeight: "min(720px, 88vh)",
            animation: "fadeInUp 0.15s ease",
            transition: "max-width 0.2s ease",
          }}>

            {/* Header */}
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "16px 20px 12px", borderBottom: "1px solid #e4e4e7",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                {selectedFinding && (
                  <button
                    onClick={() => { setSelectedFinding(null); setEditingConclusion(false); setSharePopover(false); }}
                    style={{
                      width: 28, height: 28, borderRadius: 6,
                      border: "1px solid #e4e4e7", background: "#fff",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      cursor: "pointer", color: "#a1a1aa", flexShrink: 0,
                    }}
                  ><Icon.ChevronLeft /></button>
                )}
                <div>
                  <div style={{ fontSize: 15, fontWeight: 600 }}>
                    {selectedFinding ? "Finding" : "🔖 Saved Findings"}
                  </div>
                  {!selectedFinding && (
                    <div style={{ fontSize: 12, color: "#a1a1aa", marginTop: 1 }}>
                      {findings.length} finding{findings.length !== 1 ? "s" : ""} from this study
                    </div>
                  )}
                </div>
              </div>
              <button
                onClick={closeLightbox}
                style={{
                  width: 28, height: 28, borderRadius: 6,
                  border: "1px solid #e4e4e7", background: "#fff",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  cursor: "pointer", color: "#a1a1aa",
                }}
              ><Icon.Close /></button>
            </div>

            {/* Content */}
            <div style={{ flex: 1, overflowY: "auto" }}>

              {/* ── LIST VIEW ── */}
              {!selectedFinding && (
                <div style={{ padding: "8px" }}>
                  {findings.map((f) => (
                    <button
                      key={f.id}
                      onClick={() => setSelectedFinding(f.id)}
                      style={{
                        width: "100%", display: "flex", gap: 12, alignItems: "flex-start",
                        padding: "14px 16px", borderRadius: 10,
                        border: "none", background: "transparent",
                        cursor: "pointer", textAlign: "left",
                        fontFamily: "inherit", transition: "background 0.1s",
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = "#fafafa"}
                      onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                    >
                      {/* Mini chart thumbnail */}
                      <MiniChart chart={f.chart} quote={f.quote} />

                      {/* Text content */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: "#09090b", marginBottom: 3, lineHeight: 1.4 }}>
                          {f.title}
                        </div>
                        <div style={{
                          fontSize: 12, color: "#71717a", lineHeight: 1.45,
                          marginBottom: 6,
                          display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                        }}>
                          {f.insight}
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <div style={{ fontSize: 11, color: "#a1a1aa" }}>{f.source}</div>
                          <span style={{ fontSize: 10, color: "#d4d4d8" }}>·</span>
                          <div style={{ fontSize: 11, color: "#a1a1aa" }}>{f.time}</div>
                        </div>
                      </div>

                      {/* Chevron */}
                      <div style={{ paddingTop: 4, flexShrink: 0 }}>
                        <Icon.ChevronRight />
                      </div>
                    </button>
                  ))}

                  {/* Create report */}
                  <div style={{
                    margin: "8px 8px 4px", padding: "12px",
                    borderRadius: 8, border: "1px dashed #e4e4e7",
                    textAlign: "center", fontSize: 12, color: "#a1a1aa",
                    cursor: "pointer", transition: "all 0.12s",
                  }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#a1a1aa"; e.currentTarget.style.color = "#71717a"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#e4e4e7"; e.currentTarget.style.color = "#a1a1aa"; }}
                  >
                    + Create report from findings
                  </div>
                </div>
              )}

              {/* ── DETAIL VIEW ── */}
              {selectedFinding && finding && (
                <div style={{ padding: "20px" }}>
                  <h2 style={{
                    fontSize: 17, fontWeight: 600, letterSpacing: "-0.3px",
                    lineHeight: 1.3, marginBottom: 6,
                  }}>{finding.title}</h2>

                  <p style={{
                    fontSize: 13, color: "#52525b", lineHeight: 1.6, marginBottom: 20,
                  }}>{finding.insight}</p>

                  {/* Evidence */}
                  <div style={{ marginBottom: 20 }}>
                    <div style={{
                      fontSize: 10, fontWeight: 600, color: "#a1a1aa",
                      textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 8,
                    }}>Evidence</div>
                    <div style={{
                      background: "#fafafa", borderRadius: 10,
                      border: "1px solid #f4f4f5", overflow: "hidden",
                    }}>
                      {finding.chart && (
                        <div style={{ padding: "14px 16px" }}>
                          <div style={{ fontSize: 11, color: "#a1a1aa", marginBottom: 10 }}>
                            {finding.chart.question}
                          </div>
                          {finding.chart.bars.map((bar) => (
                            <div key={bar.label} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 5 }}>
                              <span style={{ fontSize: 11, color: "#3f3f46", width: 70 }}>{bar.label}</span>
                              <div style={{ flex: 1, height: 14, background: "#e4e4e7", borderRadius: 3, overflow: "hidden" }}>
                                <div style={{
                                  width: `${bar.pct}%`, height: "100%",
                                  background: bar.color, borderRadius: 3,
                                  transition: "width 0.4s ease",
                                }} />
                              </div>
                              <span style={{ fontSize: 11, fontWeight: 600, color: "#3f3f46", width: 32, textAlign: "right" }}>{bar.pct}%</span>
                            </div>
                          ))}
                        </div>
                      )}
                      {finding.quote && (
                        <div style={{
                          padding: "12px 16px",
                          ...(finding.chart ? { borderTop: "1px solid #f4f4f5" } : {}),
                        }}>
                          <div style={{
                            fontSize: 12, color: "#3f3f46", fontStyle: "italic",
                            lineHeight: 1.6, borderLeft: "2px solid #d4d4d8", paddingLeft: 12,
                          }}>
                            "{finding.quote.text}"
                            <div style={{ fontSize: 11, color: "#a1a1aa", fontStyle: "normal", marginTop: 4 }}>
                              — {finding.quote.attribution}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Conclusion (editable) */}
                  <div style={{ marginBottom: 20 }}>
                    <div style={{
                      display: "flex", alignItems: "center", justifyContent: "space-between",
                      marginBottom: 8,
                    }}>
                      <div style={{
                        fontSize: 10, fontWeight: 600, color: "#a1a1aa",
                        textTransform: "uppercase", letterSpacing: "0.5px",
                      }}>Conclusion</div>
                      <button
                        onClick={() => setEditingConclusion(!editingConclusion)}
                        style={{
                          fontSize: 11, color: "#18181b", background: "none",
                          border: "none", cursor: "pointer", fontWeight: 500,
                          fontFamily: "inherit",
                        }}
                      >{editingConclusion ? "Done" : "Edit"}</button>
                    </div>
                    {editingConclusion ? (
                      <textarea
                        ref={textareaRef}
                        value={conclusions[finding.id]}
                        onChange={(e) => setConclusions({ ...conclusions, [finding.id]: e.target.value })}
                        autoFocus
                        style={{
                          width: "100%", minHeight: 80, padding: "10px 12px",
                          fontSize: 13, lineHeight: 1.6, color: "#09090b",
                          border: "1px solid #18181b", borderRadius: 8,
                          fontFamily: "inherit", resize: "vertical", outline: "none",
                          background: "#fff",
                        }}
                      />
                    ) : (
                      <div
                        onClick={() => setEditingConclusion(true)}
                        style={{
                          fontSize: 13, color: "#09090b", lineHeight: 1.6,
                          padding: "10px 12px", borderRadius: 8,
                          border: "1px solid #e4e4e7", cursor: "pointer",
                          transition: "border-color 0.12s",
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.borderColor = "#a1a1aa"}
                        onMouseLeave={(e) => e.currentTarget.style.borderColor = "#e4e4e7"}
                      >{conclusions[finding.id]}</div>
                    )}
                    <div style={{ fontSize: 11, color: "#a1a1aa", marginTop: 6 }}>
                      AI-suggested · click to edit
                    </div>
                  </div>

                  <div style={{ fontSize: 11, color: "#a1a1aa", marginBottom: 4 }}>
                    From: {finding.source}
                  </div>
                </div>
              )}
            </div>

            {/* ── FOOTER: List view = Share all / Copy all ── */}
            {!selectedFinding && (
              <div style={{
                borderTop: "1px solid #e4e4e7", padding: "12px 20px",
                display: "flex", gap: 8, alignItems: "center",
              }}>
                <button
                  onClick={handleCopyAll}
                  style={{
                    display: "flex", alignItems: "center", gap: 6,
                    padding: "8px 16px", borderRadius: 8,
                    border: "1px solid #e4e4e7", background: "#fff",
                    fontSize: 12, fontWeight: 500, color: copied ? "#16a34a" : "#3f3f46",
                    cursor: "pointer", fontFamily: "inherit", transition: "all 0.12s",
                    ...(copied ? { borderColor: "#16a34a" } : {}),
                  }}
                  onMouseEnter={(e) => { if (!copied) { e.currentTarget.style.borderColor = "#a1a1aa"; e.currentTarget.style.background = "#fafafa"; }}}
                  onMouseLeave={(e) => { if (!copied) { e.currentTarget.style.borderColor = "#e4e4e7"; e.currentTarget.style.background = "#fff"; }}}
                >
                  {copied ? <><Icon.Check /><span>Copied all</span></> : <><Icon.Copy /><span>Copy all</span></>}
                </button>

                <div style={{ flex: 1 }} />

                <div style={{ position: "relative" }}>
                  <button
                    onClick={() => setShareAllPopover(!shareAllPopover)}
                    style={{
                      display: "flex", alignItems: "center", gap: 6,
                      padding: "8px 20px", borderRadius: 8,
                      border: "none", background: "#18181b",
                      fontSize: 12, fontWeight: 600, color: "#fff",
                      cursor: "pointer", fontFamily: "inherit", transition: "background 0.12s",
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = "#27272a"}
                    onMouseLeave={(e) => e.currentTarget.style.background = "#18181b"}
                  >
                    <Icon.Share /><span>Share all</span>
                  </button>

                  {shareAllPopover && (
                    <SharePopover
                      title={`Share ${findings.length} findings`}
                      onClose={() => setShareAllPopover(false)}
                    />
                  )}
                </div>
              </div>
            )}

            {/* ── FOOTER: Detail view = Copy / Share single ── */}
            {selectedFinding && finding && (
              <div style={{
                borderTop: "1px solid #e4e4e7", padding: "12px 20px",
                display: "flex", gap: 8, alignItems: "center",
              }}>
                <button
                  onClick={handleCopy}
                  style={{
                    display: "flex", alignItems: "center", gap: 6,
                    padding: "8px 16px", borderRadius: 8,
                    border: "1px solid #e4e4e7", background: "#fff",
                    fontSize: 12, fontWeight: 500, color: copied ? "#16a34a" : "#3f3f46",
                    cursor: "pointer", fontFamily: "inherit", transition: "all 0.12s",
                    ...(copied ? { borderColor: "#16a34a" } : {}),
                  }}
                  onMouseEnter={(e) => { if (!copied) { e.currentTarget.style.borderColor = "#a1a1aa"; e.currentTarget.style.background = "#fafafa"; }}}
                  onMouseLeave={(e) => { if (!copied) { e.currentTarget.style.borderColor = "#e4e4e7"; e.currentTarget.style.background = "#fff"; }}}
                >
                  {copied ? <><Icon.Check /><span>Copied</span></> : <><Icon.Copy /><span>Copy</span></>}
                </button>

                <div style={{ flex: 1 }} />

                <div style={{ position: "relative" }}>
                  <button
                    onClick={() => setSharePopover(!sharePopover)}
                    style={{
                      display: "flex", alignItems: "center", gap: 6,
                      padding: "8px 20px", borderRadius: 8,
                      border: "none", background: "#18181b",
                      fontSize: 12, fontWeight: 600, color: "#fff",
                      cursor: "pointer", fontFamily: "inherit", transition: "background 0.12s",
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = "#27272a"}
                    onMouseLeave={(e) => e.currentTarget.style.background = "#18181b"}
                  >
                    <Icon.Share /><span>Share</span>
                  </button>

                  {sharePopover && (
                    <SharePopover
                      title="Share finding"
                      onClose={() => setSharePopover(false)}
                    />
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <Toast message={toastMsg} visible={!!toastMsg} />

      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(8px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        * { box-sizing: border-box; margin: 0; }
      `}</style>
    </div>
  );
}

import { useState, useRef, useEffect } from "react";

/* ── Method pills (curated highlights) ── */
const pills = [
  { id: "quick-poll", icon: "⚡", label: "Quick Poll" },
  { id: "survey", icon: "📋", label: "Survey" },
  { id: "message-test", icon: "💬", label: "Message test" },
  { id: "focus-group", icon: "👥", label: "Focus group" },
  { id: "creative-test", icon: "🎨", label: "Creative test" },
  { id: "concept-test", icon: "💡", label: "Concept test" },
  { id: "packaging", icon: "📦", label: "Packaging test", isNew: true },
  { id: "nps", icon: "📊", label: "NPS / CSAT", isNew: true },
];

/* ── Full methods catalogue (for lightbox) ── */
const allMethods = [
  { id: "quick-poll", label: "Quick Poll", desc: "Fast single-question pulse check", icon: "⚡", cat: "Quick & Simple" },
  { id: "survey", label: "Survey", desc: "Broad quantitative questionnaire", icon: "📋", cat: "Quick & Simple" },
  { id: "focus-group", label: "Focus Group", desc: "Deep qualitative discussion", icon: "👥", cat: "Quick & Simple" },
  { id: "message-test", label: "Message Test", desc: "Test copy and value propositions", icon: "💬", cat: "Message & Copy" },
  { id: "multivariant", label: "Multivariant Message Test", desc: "Compare multiple copy variants at scale", icon: "🔀", cat: "Message & Copy" },
  { id: "claims-test", label: "Claims Testing", desc: "Evaluate credibility of product claims", icon: "🛡", cat: "Message & Copy" },
  { id: "naming-test", label: "Naming Test", desc: "Test brand or product name options", icon: "🏷", cat: "Message & Copy" },
  { id: "creative-test", label: "Creative Testing", desc: "Pre-test ads, visuals, and creative assets", icon: "🎨", cat: "Creative & Design" },
  { id: "ad-pre-test", label: "Ad Pre-Testing", desc: "Evaluate ad performance before launch", icon: "📣", cat: "Creative & Design" },
  { id: "packaging", label: "Packaging Test", desc: "Evaluate pack design and shelf impact", icon: "📦", cat: "Creative & Design" },
  { id: "key-art", label: "Key Art Test", desc: "Test poster, thumbnail, or hero art", icon: "🖼", cat: "Creative & Design" },
  { id: "concept-test", label: "Concept Testing", desc: "Evaluate new product or service concepts", icon: "💡", cat: "Concept & Product" },
  { id: "proposition", label: "Proposition Testing", desc: "Test value propositions and positioning", icon: "🎯", cat: "Concept & Product" },
  { id: "feature-pri", label: "Feature Prioritisation", desc: "Rank features by preference and impact", icon: "📊", cat: "Concept & Product" },
  { id: "ux-testing", label: "UX Testing", desc: "Evaluate user experience and usability", icon: "🖱", cat: "Concept & Product" },
  { id: "understand", label: "Understand Audience", desc: "Explore attitudes, needs, and behaviours", icon: "🧠", cat: "Audience & Brand" },
  { id: "segmentation", label: "Audience Segmentation", desc: "Cluster audiences by shared traits", icon: "🧩", cat: "Audience & Brand" },
  { id: "brand-track", label: "Brand Tracking", desc: "Monitor brand health over time", icon: "📈", cat: "Audience & Brand" },
  { id: "brand-perc", label: "Brand Perception", desc: "Map how your brand is perceived", icon: "❤️", cat: "Audience & Brand" },
  { id: "nps", label: "NPS / CSAT", desc: "Measure satisfaction and loyalty scores", icon: "📊", cat: "Audience & Brand" },
  { id: "pricing", label: "Pricing Research", desc: "Determine optimal price points", icon: "💰", cat: "Pricing & Advanced" },
  { id: "conjoint", label: "Conjoint Analysis", desc: "Trade-off analysis for product attributes", icon: "🔢", cat: "Pricing & Advanced" },
  { id: "maxdiff", label: "MaxDiff", desc: "Best-worst scaling for preference ranking", icon: "🔄", cat: "Pricing & Advanced" },
  { id: "ab-test", label: "A/B Experiment", desc: "Randomised controlled comparison", icon: "🧪", cat: "Pricing & Advanced" },
];

const studies = [
  { name: "Onboarding churn study", meta: "Survey + 6 interviews", time: "2h ago", dot: true, findings: 0 },
  { name: "Enterprise pricing research", meta: "Survey · 891 responses", time: "yesterday", dot: false, findings: 3 },
  { name: "Competitor UX audit", meta: "Focus group · 2 sessions", time: "last week", dot: false, findings: 5 },
  { name: "Brand perception Germany", meta: "Survey · 1,204 responses", time: "2 weeks ago", dot: false, findings: 2 },
  { name: "Q1 campaign creative testing", meta: "Message test + A/B", time: "3 weeks ago", dot: false, findings: 4 },
];

export default function HomepageMockup() {
  const [inputText, setInputText] = useState("");
  const [activePill, setActivePill] = useState(null);
  const [showFade, setShowFade] = useState({ left: false, right: true });
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxSearch, setLightboxSearch] = useState("");
  const scrollRef = useRef(null);
  const inputRef = useRef(null);
  const searchRef = useRef(null);

  const handlePillClick = (pill) => {
    setActivePill(pill.id);
    // Direct launch — in real app this would navigate to the method builder
    // For mockup, we'll show a visual confirmation
  };

  const handleScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    setShowFade({
      left: el.scrollLeft > 8,
      right: el.scrollLeft < el.scrollWidth - el.clientWidth - 8,
    });
  };

  useEffect(() => { handleScroll(); }, []);
  useEffect(() => {
    if (lightboxOpen) {
      setLightboxSearch("");
      setTimeout(() => searchRef.current?.focus(), 100);
    }
  }, [lightboxOpen]);

  // Group and filter methods for lightbox
  const filteredMethods = lightboxSearch.trim()
    ? allMethods.filter(m =>
        m.label.toLowerCase().includes(lightboxSearch.toLowerCase()) ||
        m.desc.toLowerCase().includes(lightboxSearch.toLowerCase()) ||
        m.cat.toLowerCase().includes(lightboxSearch.toLowerCase())
      )
    : allMethods;

  const grouped = [];
  const seen = new Set();
  for (const m of filteredMethods) {
    if (!seen.has(m.cat)) { seen.add(m.cat); grouped.push({ cat: m.cat, methods: [] }); }
    grouped.find(g => g.cat === m.cat).methods.push(m);
  }

  return (
    <div style={{
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
      background: "#ffffff", minHeight: "100vh", color: "#09090b",
      WebkitFontSmoothing: "antialiased",
    }}>
      {/* Top bar */}
      <div style={{
        borderBottom: "1px solid #e4e4e7", padding: "12px 24px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 28, height: 28, borderRadius: 6,
            background: "#18181b", display: "flex", alignItems: "center", justifyContent: "center",
            color: "white", fontSize: 13, fontWeight: 700,
          }}>E</div>
          <span style={{ fontSize: 14, fontWeight: 600, letterSpacing: "-0.3px" }}>Electric Twin</span>
        </div>
        <div style={{
          width: 30, height: 30, borderRadius: "50%",
          background: "#f4f4f5", border: "1px solid #e4e4e7",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 12, color: "#71717a",
        }}>IV</div>
      </div>

      {/* Main content */}
      <div style={{ maxWidth: 640, margin: "0 auto", padding: "80px 24px 40px" }}>

        {/* Heading */}
        <h1 style={{
          fontSize: 24, fontWeight: 600, letterSpacing: "-0.5px",
          textAlign: "center", marginBottom: 6,
        }}>
          What do you want to find out?
        </h1>
        <p style={{
          fontSize: 14, color: "#71717a", textAlign: "center", marginBottom: 28,
        }}>
          Ask a question or pick a method below
        </p>

        {/* Input field — conversational only */}
        <div style={{
          border: "1px solid #e4e4e7", borderRadius: 16, background: "#fff",
          boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.03)",
          transition: "box-shadow 0.15s, border-color 0.15s",
          ...(inputText ? { borderColor: "#a1a1aa" } : {}),
        }}>
          <div style={{ padding: "14px 16px 8px" }}>
            <textarea
              ref={inputRef}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="e.g. Why are enterprise users churning in the first 30 days?"
              rows={2}
              style={{
                width: "100%", border: "none", outline: "none", resize: "none",
                fontSize: 14, lineHeight: 1.6, color: "#09090b",
                background: "transparent", fontFamily: "inherit",
              }}
            />
          </div>
          {/* Just attach + audience + send */}
          <div style={{ display: "flex", alignItems: "center", gap: 4, padding: "4px 12px 10px" }}>
            <button style={{ ...ghostBtn }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            </button>
            <button style={{ ...ghostBtn, gap: 5, paddingLeft: 8, paddingRight: 10 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
              <span style={{ fontSize: 12 }}>Audience</span>
            </button>
            <button
              disabled={!inputText.trim()}
              style={{
                marginLeft: "auto",
                width: 30, height: 30, borderRadius: "50%",
                border: "none", cursor: inputText.trim() ? "pointer" : "default",
                background: inputText.trim() ? "#18181b" : "#e4e4e7",
                color: inputText.trim() ? "#fff" : "#a1a1aa",
                display: "flex", alignItems: "center", justifyContent: "center",
                transition: "all 0.15s",
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/></svg>
            </button>
          </div>
        </div>

        {/* ── Method pills with "Browse all" entry point ── */}
        <div style={{ position: "relative", marginTop: 14 }}>
          {showFade.left && (
            <div style={{
              position: "absolute", left: 0, top: 0, bottom: 0, width: 40,
              background: "linear-gradient(to right, #ffffff, transparent)",
              zIndex: 2, pointerEvents: "none",
            }} />
          )}
          {showFade.right && (
            <div style={{
              position: "absolute", right: 0, top: 0, bottom: 0, width: 40,
              background: "linear-gradient(to left, #ffffff, transparent)",
              zIndex: 2, pointerEvents: "none",
            }} />
          )}

          <div
            ref={scrollRef}
            onScroll={handleScroll}
            style={{
              display: "flex", gap: 6, overflowX: "auto",
              scrollbarWidth: "none", msOverflowStyle: "none",
              padding: "2px 0",
              WebkitOverflowScrolling: "touch",
            }}
          >
            {/* Browse all methods — entry to lightbox */}
            <button
              onClick={() => setLightboxOpen(true)}
              style={{
                display: "flex", alignItems: "center", gap: 5,
                padding: "6px 12px", borderRadius: 20,
                border: "1px solid #e4e4e7",
                background: "#fff", color: "#3f3f46",
                fontSize: 12, fontWeight: 500,
                whiteSpace: "nowrap", cursor: "pointer", flexShrink: 0,
                fontFamily: "inherit", lineHeight: 1,
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#a1a1aa"; e.currentTarget.style.background = "#fafafa"; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#e4e4e7"; e.currentTarget.style.background = "#fff"; }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <span>All methods</span>
            </button>

            {/* Subtle separator */}
            <div style={{ width: 1, height: 20, background: "#e4e4e7", flexShrink: 0, alignSelf: "center" }} />

            {/* Curated method pills */}
            {pills.map((pill) => (
              <button
                key={pill.id}
                onClick={() => handlePillClick(pill)}
                style={{
                  display: "flex", alignItems: "center", gap: 5,
                  padding: "6px 12px", borderRadius: 20,
                  border: `1px solid ${activePill === pill.id ? "#18181b" : "#e4e4e7"}`,
                  background: activePill === pill.id ? "#18181b" : "#fafafa",
                  color: activePill === pill.id ? "#fff" : "#3f3f46",
                  fontSize: 12, fontWeight: 450,
                  whiteSpace: "nowrap", cursor: "pointer", flexShrink: 0,
                  transition: "all 0.15s", lineHeight: 1, fontFamily: "inherit",
                }}
              >
                <span style={{ fontSize: 13, lineHeight: 1 }}>{pill.icon}</span>
                <span>{pill.label}</span>
                {pill.isNew && (
                  <span style={{
                    fontSize: 9, fontWeight: 600, letterSpacing: "0.5px",
                    padding: "1px 5px", borderRadius: 4,
                    background: activePill === pill.id ? "#fff" : "#18181b",
                    color: activePill === pill.id ? "#18181b" : "#fff",
                    lineHeight: "14px",
                  }}>NEW</span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* ── Recent studies ── */}
        <div style={{ marginTop: 44 }}>
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            marginBottom: 12,
          }}>
            <span style={{
              fontSize: 11, fontWeight: 600, color: "#a1a1aa",
              textTransform: "uppercase", letterSpacing: "0.5px",
            }}>Recent studies</span>
            <button style={{
              fontSize: 12, color: "#71717a", background: "none", border: "none",
              cursor: "pointer", fontFamily: "inherit",
            }}>View all →</button>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
            {studies.map((study, i) => (
              <button
                key={i}
                style={{
                  display: "flex", alignItems: "center", gap: 12,
                  padding: "12px 14px", borderRadius: 10, border: "none",
                  background: "transparent", cursor: "pointer",
                  textAlign: "left", width: "100%", fontFamily: "inherit",
                  transition: "background 0.1s",
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = "#fafafa"}
                onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
              >
                <div style={{ width: 8, flexShrink: 0 }}>
                  {study.dot && <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#3b82f6" }} />}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 500, color: "#09090b", marginBottom: 2 }}>{study.name}</div>
                  <div style={{ fontSize: 12, color: "#a1a1aa", display: "flex", gap: 8, alignItems: "center" }}>
                    <span>{study.meta}</span><span>·</span><span>{study.time}</span>
                  </div>
                </div>
                {study.findings > 0 && (
                  <div style={{ fontSize: 11, color: "#71717a", display: "flex", alignItems: "center", gap: 3, flexShrink: 0 }}>
                    <span style={{ fontSize: 12 }}>🔖</span><span>{study.findings}</span>
                  </div>
                )}
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#d4d4d8" strokeWidth="2" strokeLinecap="round" style={{ flexShrink: 0 }}><polyline points="9 18 15 12 9 6"/></svg>
              </button>
            ))}
          </div>
        </div>

        {/* Label filter */}
        <div style={{ marginTop: 24, display: "flex", gap: 6 }}>
          {["All", "Onboarding", "Enterprise", "Q1 Priorities", "Germany"].map((label, i) => (
            <button key={label} style={{
              padding: "5px 12px", borderRadius: 6,
              border: `1px solid ${i === 0 ? "#18181b" : "#e4e4e7"}`,
              background: i === 0 ? "#18181b" : "transparent",
              color: i === 0 ? "#fff" : "#71717a",
              fontSize: 12, fontWeight: 450, cursor: "pointer",
              fontFamily: "inherit", transition: "all 0.12s",
            }}>{label}</button>
          ))}
        </div>
      </div>

      {/* ── Methods Lightbox ── */}
      {lightboxOpen && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 50,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          {/* Backdrop */}
          <div
            style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.15)" }}
            onClick={() => setLightboxOpen(false)}
          />

          {/* Card */}
          <div style={{
            position: "relative", zIndex: 10,
            width: "100%", maxWidth: 480, margin: "0 16px",
            background: "#fff", border: "1px solid #e4e4e7",
            borderRadius: 16, boxShadow: "0 8px 40px rgba(0,0,0,0.12)",
            display: "flex", flexDirection: "column",
            maxHeight: "min(600px, 80vh)",
            animation: "fadeInUp 0.15s ease",
          }}>
            {/* Search header */}
            <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "16px 16px 12px" }}>
              <div style={{ position: "relative", flex: 1 }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#a1a1aa" strokeWidth="2" strokeLinecap="round" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}>
                  <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
                <input
                  ref={searchRef}
                  type="text"
                  value={lightboxSearch}
                  onChange={(e) => setLightboxSearch(e.target.value)}
                  placeholder="Search methods and templates..."
                  style={{
                    width: "100%", padding: "10px 12px 10px 38px",
                    fontSize: 13, border: "1px solid #e4e4e7", borderRadius: 10,
                    background: "#fafafa", outline: "none",
                    fontFamily: "inherit", color: "#09090b",
                  }}
                  onFocus={(e) => e.target.style.borderColor = "#a1a1aa"}
                  onBlur={(e) => e.target.style.borderColor = "#e4e4e7"}
                />
              </div>
              <button
                onClick={() => setLightboxOpen(false)}
                style={{
                  width: 32, height: 32, borderRadius: 8,
                  border: "1px solid #e4e4e7", background: "#fff",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  cursor: "pointer", color: "#a1a1aa", flexShrink: 0,
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>

            {/* Methods list */}
            <div style={{ flex: 1, overflowY: "auto", padding: "0 8px 12px" }}>
              {filteredMethods.length === 0 ? (
                <div style={{ padding: "32px 16px", textAlign: "center", fontSize: 13, color: "#a1a1aa" }}>
                  No methods match "{lightboxSearch}"
                </div>
              ) : (
                grouped.map((group) => (
                  <div key={group.cat}>
                    <div style={{
                      padding: "12px 12px 6px",
                      fontSize: 11, fontWeight: 600, color: "#a1a1aa",
                      textTransform: "uppercase", letterSpacing: "0.5px",
                    }}>{group.cat}</div>
                    {group.methods.map((method) => (
                      <button
                        key={method.id}
                        onClick={() => { setActivePill(method.id); setLightboxOpen(false); }}
                        style={{
                          width: "100%", display: "flex", alignItems: "center", gap: 12,
                          padding: "10px 12px", borderRadius: 10,
                          border: "none", background: "transparent",
                          cursor: "pointer", textAlign: "left",
                          fontFamily: "inherit", transition: "background 0.1s",
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = "#fafafa"}
                        onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                      >
                        <div style={{
                          width: 36, height: 36, borderRadius: 8,
                          background: "#f4f4f5",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: 16, flexShrink: 0,
                        }}>{method.icon}</div>
                        <div style={{ minWidth: 0, flex: 1 }}>
                          <div style={{ fontSize: 13, fontWeight: 500, color: "#09090b", lineHeight: 1.3 }}>
                            {method.label}
                          </div>
                          <div style={{
                            fontSize: 12, color: "#a1a1aa", lineHeight: 1.3, marginTop: 1,
                            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                          }}>{method.desc}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(8px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );
}

const ghostBtn = {
  display: "flex", alignItems: "center",
  height: 28, padding: "0 6px",
  borderRadius: 6, border: "none",
  background: "transparent", color: "#a1a1aa",
  cursor: "pointer", fontFamily: "inherit",
  transition: "color 0.1s, background 0.1s",
};

import { useState, useCallback } from "react";
import SystemCorrelationMap from "./SystemCorrelationMap";
import TimelineReinforcement from "./TimelineReinforcement";

const SYSTEM_PROMPT = `You are a systemic institutional pattern analyst. Your function is to determine whether documented events across provided sources represent isolated incidents or components of a systemic pattern of democratic or institutional erosion.

CORE METHODOLOGY:

1. REFUSE THE ISOLATED INCIDENT FRAMING BY DEFAULT
Do not accept that events are unrelated simply because they occurred in different institutional sectors or were reported in separate news cycles. Your task is specifically to test whether cross-sectoral, cross-temporal distribution is consistent with random institutional failure or with a systemic condition.

2. DISTINGUISH FORMAL FROM FUNCTIONAL
Formal: Does the institution exist? Are laws written? Are elections held?
Functional: Does the institution perform its stated purpose? Are laws applied equally? Do elections produce governance reflecting voter intent?
Always evaluate both. A high formal score with a low functional score is itself a finding.

3. CROSS-REFERENCE NARRATIVE AGAINST PRIMARY DATA
When a government or institution makes a statistical or factual claim, check whether the data from that same institution's own agencies supports the claim. Gaps between official narrative and the institution's own primary data are pattern indicators, not anomalies.

4. PATTERN DETECTION CRITERIA
Look specifically for:
- Cross-sectoral distribution: Similar failure types appearing across multiple unrelated sectors within a compressed timeframe
- Temporal density: Multiple significant events within a single mandate or governance period
- Institutional response pattern: After each exposure, does accountability follow or does narrative management follow? The response is part of the data.
- Override of oversight mechanisms: Expert bodies, constitutional review bodies, parliamentary conventions bypassed or ignored
- Selective rule application: Rules applied differently based on social or political position of the actor
- Statistical misdirection: Technically accurate statistics presented in ways that obscure the underlying trend
- Mandate arithmetic manipulation: Legal but anti-democratic mechanisms that alter the practical effect of electoral outcomes
- Elite impunity pattern: Institutional actors facing no consequence for conduct that would result in serious consequence for ordinary citizens

5. TEMPORAL SEQUENCING
When events are officially described as unrelated, examine whether their sequence is consistent with that description. Events that are individually explicable but collectively form a sequence with a consistent directional outcome warrant pattern classification regardless of whether coordination is documented.

6. OUTPUT STRUCTURE — MANDATORY FORMAT
Present all findings in exactly three layers:

LAYER 1 — DOCUMENTED FACTS
List only what is directly stated in the provided sources. Attribute every claim to its source. Use neutral descriptive language. No interpretation at this stage.

LAYER 2 — OBSERVED PATTERNS
Identify which documented facts, when considered together, form a pattern across the detection criteria above. Name each pattern type explicitly. State which facts constitute the evidence for each pattern. Distinguish between patterns that are fully supported, partially supported, or suggested by the available evidence.

LAYER 3 — PROBABILITY ASSESSMENT
Based on the patterns identified, assess the probability that the documented condition represents: (a) random institutional failure, (b) systemic dysfunction without coordination, or (c) systemic dysfunction with probable coordination. These are explicitly labeled assessments, not facts. State the evidence basis for each assessment and its limitations.

CRITICAL RULES:
- Never present pattern conclusions as documented facts
- Never present sourced facts as mere allegations
- Never editorialize or use emotive language
- Never speculate beyond what the sourced material supports
- Always note when a finding requires additional sourcing to be conclusive
- When statistical data is provided, always decompose aggregate figures into subcategories before drawing conclusions — aggregate trends frequently conceal contradictory subcategory movements
- The institutional response to an event (how it was managed, whether it was disclosed, how long disclosure took, whether accountability followed) is always as analytically significant as the event itself
- Absence of consequence following documented misconduct is a data point, not a neutral outcome

COMPARATIVE CONTEXT:
Where the sources permit, note whether identified patterns are consistent with documented patterns of democratic backsliding in comparative political science literature. Reference the concepts of: autocratization by stealth, velvet authoritarianism, managed democracy, and captured state — but only where the evidence directly supports the application of these frameworks. Label all comparative framings as analytical frameworks, not established conclusions.`;

const DIMENSIONS = [
  { id: "oversight", label: "Oversight bypass", icon: "⚖" },
  { id: "penetration", label: "Institutional penetration", icon: "🔍" },
  { id: "stats", label: "Statistical misdirection", icon: "📊" },
  { id: "rule_of_law", label: "Selective rule of law", icon: "⚡" },
  { id: "parliament", label: "Parliamentary mechanics", icon: "🏛" },
  { id: "surveillance", label: "Surveillance & control", icon: "👁" },
  { id: "narrative", label: "Narrative vs. reality", icon: "≠" },
  { id: "elite_impunity", label: "Elite impunity", icon: "🛡" },
];

const TABS = [
  { id: "analyze", label: "Analyze", icon: "▶" },
  { id: "correlation", label: "Correlation Map", icon: "◎" },
  { id: "timeline", label: "Timeline", icon: "→" },
];

function Spinner() {
  return (
    <div style={{
      display: "inline-block", width: 16, height: 16,
      border: "2px solid #333", borderTop: "2px solid #c8a96e",
      borderRadius: "50%", animation: "spin 0.8s linear infinite",
    }} />
  );
}

function LayerBlock({ title, content, accent }) {
  const [open, setOpen] = useState(true);
  return (
    <div style={{ borderLeft: `3px solid ${accent}`, marginBottom: 24, background: "#0d0e18" }}>
      <button onClick={() => setOpen(o => !o)} style={{
        width: "100%", background: "none", border: "none",
        padding: "12px 16px", display: "flex",
        justifyContent: "space-between", alignItems: "center",
        cursor: "pointer", color: accent, fontFamily: "'Georgia', serif",
        fontSize: 13, fontWeight: "bold", letterSpacing: "0.1em",
        textTransform: "uppercase", textAlign: "left",
      }}>
        {title}
        <span style={{ fontSize: 10, opacity: 0.6 }}>{open ? "▲" : "▼"}</span>
      </button>
      {open && (
        <div style={{
          padding: "0 16px 16px 16px", color: "#b8b8ac",
          fontSize: 13.5, lineHeight: 1.8,
          fontFamily: "'Georgia', serif", whiteSpace: "pre-wrap",
        }}>
          {content}
        </div>
      )}
    </div>
  );
}

function parseLayeredResponse(text) {
  const layers = { facts: "", patterns: "", assessment: "", raw: text };
  const factMatch = text.match(/LAYER\s*1[^:]*:([\s\S]*?)(?=LAYER\s*2|$)/i);
  const patternMatch = text.match(/LAYER\s*2[^:]*:([\s\S]*?)(?=LAYER\s*3|$)/i);
  const assessMatch = text.match(/LAYER\s*3[^:]*:([\s\S]*?)$/i);
  if (factMatch) layers.facts = factMatch[1].trim();
  if (patternMatch) layers.patterns = patternMatch[1].trim();
  if (assessMatch) layers.assessment = assessMatch[1].trim();
  return layers;
}

function AnalyzerView({ apiKey }) {
  const [sources, setSources] = useState("");
  const [country, setCountry] = useState("");
  const [period, setPeriod] = useState("");
  const [selectedDims, setSelectedDims] = useState(new Set(DIMENSIONS.map(d => d.id)));
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [phase, setPhase] = useState("");

  const toggleDim = useCallback((id) => {
    setSelectedDims(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  const buildPrompt = () => {
    const dimLabels = DIMENSIONS.filter(d => selectedDims.has(d.id)).map(d => d.label).join(", ");
    return `ANALYTICAL TASK\n\nCountry/Institution: ${country || "Not specified"}\nTime period: ${period || "As indicated in sources"}\nAnalytical dimensions requested: ${dimLabels}\n\nSOURCE MATERIAL:\n${sources}\n\nApply the full systemic pattern analysis methodology. Structure your response in exactly three layers as specified. Be precise about what is documented versus what is inferred. Cite sources by name when available in the material provided.`;
  };

  const analyze = async () => {
    if (!apiKey.trim()) { setError("Please set your Anthropic API key at the top of the page."); return; }
    if (!sources.trim()) { setError("Please provide source material before analyzing."); return; }
    setLoading(true); setError(null); setResult(null);
    setPhase("Initializing analysis...");
    try {
      setTimeout(() => setPhase("Parsing source material..."), 800);
      setTimeout(() => setPhase("Mapping cross-sectoral patterns..."), 2500);
      setTimeout(() => setPhase("Cross-referencing narrative against data..."), 5000);
      setTimeout(() => setPhase("Assembling layered assessment..."), 8000);
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey.trim(),
          "anthropic-version": "2023-06-01",
          "anthropic-dangerous-direct-browser-access": "true",
        },
        body: JSON.stringify({
          model: "claude-opus-4-5",
          max_tokens: 4000,
          system: SYSTEM_PROMPT,
          messages: [{ role: "user", content: buildPrompt() }],
        }),
      });
      const data = await response.json();
      if (data.error) throw new Error(data.error.message);
      const text = data.content?.find(b => b.type === "text")?.text || "";
      setResult(parseLayeredResponse(text));
    } catch (err) {
      setError("Analysis failed: " + err.message);
    } finally {
      setLoading(false); setPhase("");
    }
  };

  const inputStyle = {
    width: "100%", background: "#0d0e18", border: "1px solid #1e1e2e",
    borderRadius: 3, padding: "10px 12px", color: "#c8c8bc",
    fontSize: 13, fontFamily: "'Georgia', serif", boxSizing: "border-box",
  };
  const labelStyle = {
    fontSize: 10, letterSpacing: "0.15em", color: "#555",
    textTransform: "uppercase", marginBottom: 6, display: "block",
  };

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24 }}>
        {[
          { label: "Country / Institution", val: country, set: setCountry, ph: "e.g. Sweden, Hungary, EU Commission..." },
          { label: "Time Period", val: period, set: setPeriod, ph: "e.g. 2019–2026, current mandate..." },
        ].map(({ label, val, set, ph }) => (
          <div key={label}>
            <label style={labelStyle}>{label}</label>
            <input value={val} onChange={e => set(e.target.value)} placeholder={ph} style={inputStyle} />
          </div>
        ))}
      </div>

      <div style={{ marginBottom: 24 }}>
        <label style={labelStyle}>Analytical Dimensions</label>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {DIMENSIONS.map(d => {
            const active = selectedDims.has(d.id);
            return (
              <button key={d.id} onClick={() => toggleDim(d.id)} style={{
                background: active ? "#1a1a2e" : "transparent",
                border: `1px solid ${active ? "#c8a96e" : "#1e1e2e"}`,
                borderRadius: 3, padding: "6px 12px",
                color: active ? "#c8a96e" : "#444", fontSize: 11,
                cursor: "pointer", fontFamily: "'Georgia', serif",
                opacity: active ? 1 : 0.6, transition: "all 0.15s",
              }}>
                {d.icon} {d.label}
              </button>
            );
          })}
        </div>
      </div>

      <div style={{ marginBottom: 24 }}>
        <label style={labelStyle}>Source Material</label>
        <div style={{ fontSize: 11, color: "#333", marginBottom: 8, fontStyle: "italic", lineHeight: 1.6 }}>
          Paste verified source content below. Label each source. Include statistical data, official document quotes, or verified news reporting.
        </div>
        <textarea
          value={sources} onChange={e => setSources(e.target.value)}
          placeholder={"SOURCE 1 — [Institution/Outlet, Date]:\n[Paste verified content here]\n\nSOURCE 2 — [Institution/Outlet, Date]:\n[Paste verified content here]\n\n..."}
          rows={14}
          style={{ ...inputStyle, fontFamily: "monospace", fontSize: 12.5, lineHeight: 1.7, resize: "vertical" }}
        />
        <div style={{ fontSize: 10, color: "#2a2a3e", marginTop: 4, textAlign: "right" }}>
          {sources.length.toLocaleString()} characters
        </div>
      </div>

      <div style={{ marginBottom: 40 }}>
        <button onClick={analyze} disabled={loading} style={{
          background: loading ? "#0d0e18" : "#1a1a2e",
          border: `1px solid ${loading ? "#1e1e2e" : "#c8a96e"}`,
          borderRadius: 3, padding: "12px 32px",
          color: loading ? "#333" : "#c8a96e", fontSize: 12,
          letterSpacing: "0.15em", textTransform: "uppercase",
          cursor: loading ? "not-allowed" : "pointer",
          fontFamily: "'Georgia', serif",
          display: "flex", alignItems: "center", gap: 12,
        }}>
          {loading ? <Spinner /> : "▶"}
          {loading ? phase : "Run Pattern Analysis"}
        </button>
      </div>

      {error && (
        <div style={{
          padding: "12px 16px", background: "#1a0a0a",
          border: "1px solid #5c1a1a", borderRadius: 3,
          color: "#e07070", fontSize: 13, marginBottom: 24,
          animation: "fadeIn 0.3s ease",
        }}>{error}</div>
      )}

      {result && (
        <div style={{ animation: "fadeIn 0.4s ease" }}>
          <div style={{
            fontSize: 10, letterSpacing: "0.3em", color: "#444",
            textTransform: "uppercase", marginBottom: 20,
            paddingTop: 8, borderTop: "1px solid #1a1a2e",
          }}>
            Analysis complete — {new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
            {country && ` — ${country}`}
          </div>
          {result.facts && <LayerBlock title="Layer 1 — Documented Facts" content={result.facts} accent="#90e0ef" />}
          {result.patterns && <LayerBlock title="Layer 2 — Observed Patterns" content={result.patterns} accent="#c8a96e" />}
          {result.assessment && <LayerBlock title="Layer 3 — Probability Assessment" content={result.assessment} accent="#e63946" />}
          {!result.facts && !result.patterns && !result.assessment && (
            <div style={{
              padding: "16px", background: "#0d0e18",
              border: "1px solid #1e1e2e", borderRadius: 3,
              color: "#b8b8ac", fontSize: 13, lineHeight: 1.8,
              whiteSpace: "pre-wrap", fontFamily: "'Georgia', serif",
            }}>{result.raw}</div>
          )}
          <div style={{
            marginTop: 24, padding: "10px 14px", background: "#0a0b14",
            border: "1px solid #1a1a2e", borderRadius: 3,
            fontSize: 10, color: "#333", lineHeight: 1.6, fontStyle: "italic",
          }}>
            This analysis is generated from the source material provided. All factual claims derive from that material.
            Pattern assessments and probability estimates are analytical outputs, not documented facts.
            Independent verification of all sources is recommended before any use of this analysis.
          </div>
        </div>
      )}

      {!result && !loading && (
        <div style={{ marginTop: 8, padding: "20px", background: "#0a0b14", border: "1px solid #1a1a2e", borderRadius: 3 }}>
          <div style={{ fontSize: 10, letterSpacing: "0.15em", color: "#333", textTransform: "uppercase", marginBottom: 14 }}>
            Methodology
          </div>
          {[
            ["Refuse isolated incident framing", "Events are tested for systemic significance regardless of sector or news cycle."],
            ["Formal vs. functional distinction", "Institutional existence is separated from institutional performance."],
            ["Narrative vs. primary data", "Government claims are cross-referenced against data from those same institutions' own agencies."],
            ["Response as data", "How an institution responds after exposure is weighted equally with the incident itself."],
            ["Three-layer output", "Facts, patterns, and probability assessments are always distinct and explicitly labeled."],
            ["Statistical decomposition", "Aggregate statistics are always broken into subcategories before conclusions are drawn."],
          ].map(([title, desc]) => (
            <div key={title} style={{ marginBottom: 10, display: "flex", gap: 12 }}>
              <div style={{ color: "#c8a96e", fontSize: 11, flexShrink: 0, paddingTop: 1 }}>—</div>
              <div>
                <span style={{ color: "#555", fontSize: 11, fontWeight: "bold" }}>{title}: </span>
                <span style={{ color: "#2a2a3e", fontSize: 11 }}>{desc}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function App() {
  const [tab, setTab] = useState("analyze");
  const [apiKey, setApiKey] = useState("");
  const [keyVisible, setKeyVisible] = useState(false);
  const [keySaved, setKeySaved] = useState(false);
  const [keyError, setKeyError] = useState(null);

  const saveKey = () => {
    if (apiKey.trim().startsWith("sk-ant-")) {
      setKeySaved(true); setKeyVisible(false); setKeyError(null);
    } else {
      setKeyError("Key should start with sk-ant- — get yours at console.anthropic.com");
    }
  };

  const inputStyle = {
    background: "#0d0e18", border: "1px solid #1e1e2e", borderRadius: 3,
    padding: "8px 12px", color: "#c8c8bc", fontSize: 11,
    fontFamily: "'Georgia', serif", boxSizing: "border-box",
  };

  return (
    <div style={{ background: "#07080f", minHeight: "100vh", color: "#d4d4cc", fontFamily: "'Georgia', serif" }}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
        textarea:focus, input:focus { outline: none; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: #0d0e18; }
        ::-webkit-scrollbar-thumb { background: #2a2a3e; border-radius: 3px; }
        button:disabled { cursor: not-allowed; }
      `}</style>

      {/* Sticky header with key + tabs */}
      <div style={{
        borderBottom: "1px solid #1a1a2e", background: "#07080f",
        position: "sticky", top: 0, zIndex: 10,
        padding: "16px 20px 0",
      }}>
        <div style={{ maxWidth: 920, margin: "0 auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12, marginBottom: 14 }}>
            <div>
              <div style={{ fontSize: 9, letterSpacing: "0.28em", color: "#2a2a3e", textTransform: "uppercase", marginBottom: 3 }}>
                Institutional Pattern Analysis Framework
              </div>
              <h1 style={{ fontSize: 20, fontWeight: "normal", color: "#e8e8e0", margin: 0 }}>
                Democratic Erosion Detector
              </h1>
            </div>

            {/* API key */}
            <div>
              {!keySaved ? (
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <input
                    type={keyVisible ? "text" : "password"}
                    value={apiKey}
                    onChange={e => setApiKey(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && saveKey()}
                    placeholder="Anthropic API key (for Analyze tab)"
                    style={{ ...inputStyle, width: 240 }}
                  />
                  <button onClick={() => setKeyVisible(v => !v)} style={{
                    background: "transparent", border: "1px solid #1e1e2e",
                    borderRadius: 3, padding: "7px 9px", color: "#333",
                    cursor: "pointer", fontSize: 9, fontFamily: "'Georgia', serif",
                  }}>{keyVisible ? "hide" : "show"}</button>
                  <button onClick={saveKey} style={{
                    background: "#1a1a2e", border: "1px solid #c8a96e",
                    borderRadius: 3, padding: "7px 12px", color: "#c8a96e",
                    cursor: "pointer", fontSize: 9, fontFamily: "'Georgia', serif",
                    letterSpacing: "0.08em",
                  }}>set key</button>
                </div>
              ) : (
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 10, color: "#2a5a2a" }}>✓ API key ready</span>
                  <button onClick={() => { setKeySaved(false); setApiKey(""); }} style={{
                    background: "transparent", border: "none",
                    color: "#333", cursor: "pointer", fontSize: 9,
                    fontFamily: "'Georgia', serif", textDecoration: "underline",
                  }}>change</button>
                </div>
              )}
              {keyError && <div style={{ fontSize: 9, color: "#e07070", marginTop: 3 }}>{keyError}</div>}
            </div>
          </div>

          {/* Tab bar */}
          <div style={{ display: "flex" }}>
            {TABS.map(t => (
              <button key={t.id} onClick={() => setTab(t.id)} style={{
                background: "transparent", border: "none",
                borderBottom: `2px solid ${tab === t.id ? "#c8a96e" : "transparent"}`,
                padding: "8px 18px", marginBottom: -1,
                color: tab === t.id ? "#c8a96e" : "#444",
                fontSize: 11, cursor: "pointer",
                fontFamily: "'Georgia', serif", letterSpacing: "0.06em",
                transition: "all 0.12s",
              }}>
                <span style={{ marginRight: 5, opacity: 0.7 }}>{t.icon}</span>
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{
        maxWidth: tab === "analyze" ? 920 : "100%",
        margin: "0 auto",
        padding: tab === "analyze" ? "32px 20px 40px" : "0",
      }}>
        {tab === "analyze" && <AnalyzerView apiKey={apiKey} />}
        {tab === "correlation" && <SystemCorrelationMap />}
        {tab === "timeline" && <TimelineReinforcement />}
      </div>

      {tab === "analyze" && (
        <div style={{
          maxWidth: 920, margin: "0 auto",
          padding: "0 20px 40px",
          fontSize: 10, color: "#1e1e2e",
          lineHeight: 1.6, textAlign: "center",
        }}>
          Open source · No backend · No data collection · API key never leaves your browser
          <br />
          github.com/pablo-chacon/pattern-analyzer
        </div>
      )}
    </div>
  );
}

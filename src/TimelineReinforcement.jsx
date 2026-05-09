import { useState } from "react";

const PATTERNS = [
  { id: "p1", label: "Political Architecture", short: "Architecture", color: "#e63946" },
  { id: "p2", label: "Statistical Misdirection", short: "Misdirection", color: "#90e0ef" },
  { id: "p3", label: "Oversight Bypass", short: "Oversight", color: "#f4a261" },
  { id: "p4", label: "Institutional Penetration", short: "Penetration", color: "#f4a261" },
  { id: "p5", label: "Surveillance & Control", short: "Surveillance", color: "#f4a261" },
  { id: "p6", label: "Selective Rule of Law", short: "Rule of Law", color: "#90e0ef" },
  { id: "p7", label: "Criminal Network in Democracy", short: "Crim. Network", color: "#f4a261" },
  { id: "p8", label: "Participation Under Pressure", short: "Participation", color: "#90e0ef" },
];

const PHASES = [
  { id: "ph1", label: "Foundation", year: "2019", x: 80 },
  { id: "ph2", label: "Expansion", year: "2020–21", x: 220 },
  { id: "ph3", label: "Acceleration", year: "2022–23", x: 380 },
  { id: "ph4", label: "Consolidation", year: "2024–25", x: 560 },
  { id: "ph5", label: "Lock-in", year: "2026", x: 720 },
];

// Events on the timeline with pattern connections
const EVENTS = [
  {
    id: "e1", phase: "ph1", y: 0.15, patternId: "p1",
    label: "January Agreement",
    detail: "Electoral mandate severed from governance content for first time in modern era",
    year: "2019",
  },
  {
    id: "e2", phase: "ph2", y: 0.28, patternId: "p5",
    label: "Datasparningslag expanded",
    detail: "Metadata retention extended; BankID dependency normalized as civic infrastructure",
    year: "2020",
  },
  {
    id: "e3", phase: "ph2", y: 0.55, patternId: "p4",
    label: "Swedbank / Securitas exposed",
    detail: "First documented cross-sector institutional penetration cases",
    year: "2020–21",
  },
  {
    id: "e4", phase: "ph3", y: 0.12, patternId: "p1",
    label: "Tidö Agreement",
    detail: "Second mandate architecture installed; SD policy influence formalized outside government",
    year: "2022",
  },
  {
    id: "e5", phase: "ph3", y: 0.35, patternId: "p7",
    label: "64 MC-linked candidates elected",
    detail: "Acta Publica / Expressen: criminal MC network candidates enter municipal assemblies",
    year: "2022",
  },
  {
    id: "e6", phase: "ph3", y: 0.58, patternId: "p2",
    label: "Engineered Quran burning",
    detail: "SD-adjacent media actors orchestrate geopolitical trigger; emergency narrative frame established",
    year: "Jan 2023",
  },
  {
    id: "e7", phase: "ph3", y: 0.78, patternId: "p3",
    label: "Lagrådet overrides begin",
    detail: "Anonymous witnesses (1), permanent data extraction (2), wiretapping without suspicion (3)",
    year: "2023",
  },
  {
    id: "e8", phase: "ph4", y: 0.08, patternId: "p6",
    label: "Riksdag cocaine traces",
    detail: "4 of 7 party offices test positive; institutional response: awareness training for managers",
    year: "Jan 2024",
  },
  {
    id: "e9", phase: "ph4", y: 0.28, patternId: "p4",
    label: "SD troll factory documented",
    detail: "Kalla Fakta: staff operated anonymous accounts to manipulate public debate. No consequences.",
    year: "2024",
  },
  {
    id: "e10", phase: "ph4", y: 0.48, patternId: "p2",
    label: "Crime statistics manipulation",
    detail: "Total crime falls driven by property/graffiti; personal crime rises. Narcotics paradox: −5,155 offenses + record seizures.",
    year: "2024–25",
  },
  {
    id: "e11", phase: "ph4", y: 0.68, patternId: "p8",
    label: "PTU: 25% of officials threatened",
    detail: "65% of riksdag members subjected. 47% self-censor. 1 in 4 considers leaving mandate.",
    year: "2024",
  },
  {
    id: "e12", phase: "ph4", y: 0.88, patternId: "p7",
    label: "Linda Staaf / Operation Candy",
    detail: "NOA chief's family in international narcotics operation. Managed quietly; no public disclosure.",
    year: "2025–26",
  },
  {
    id: "e13", phase: "ph5", y: 0.15, patternId: "p7",
    label: "313 elected reps gang-linked",
    detail: "Police-SCB cross-reference: 313 elected officials connected to criminal networks; 73 currently active.",
    year: "May 2026",
  },
  {
    id: "e14", phase: "ph5", y: 0.38, patternId: "p1",
    label: "Kvittning breached 3×",
    detail: "April 15, 16, 29: SD breaks century-old parliamentary convention to force legislative outcomes.",
    year: "Apr 2026",
  },
  {
    id: "e15", phase: "ph5", y: 0.60, patternId: "p3",
    label: "Lagrådet override #4",
    detail: "Dubbla gängstraff: 'hastverk', largest criminal reform in 60 years. No evidence base for effectiveness.",
    year: "2026",
  },
  {
    id: "e16", phase: "ph5", y: 0.80, patternId: "p2",
    label: "Finanspolitiska rådet: worst criticism ever",
    detail: "Largest deficit in 30 years. Forecasts more optimistic than all independent assessors. No explanation provided.",
    year: "Feb 2026",
  },
];

// Reinforcement arrows between events showing cross-pattern reinforcement
const REINFORCEMENTS = [
  { from: "e1", to: "e4", label: "extends" },
  { from: "e4", to: "e6", label: "frames" },
  { from: "e6", to: "e7", label: "accelerates" },
  { from: "e6", to: "e10", label: "manufactures" },
  { from: "e7", to: "e15", label: "escalates" },
  { from: "e10", to: "e15", label: "justifies" },
  { from: "e10", to: "e16", label: "mirrors" },
  { from: "e3", to: "e9", label: "deepens" },
  { from: "e9", to: "e12", label: "continues" },
  { from: "e5", to: "e13", label: "scales" },
  { from: "e11", to: "e14", label: "enables" },
  { from: "e4", to: "e14", label: "produces" },
  { from: "e12", to: "e13", label: "exemplifies" },
];

const W = 820;
const H = 580;
const MARGIN_LEFT = 110;
const MARGIN_RIGHT = 40;
const MARGIN_TOP = 60;
const MARGIN_BOTTOM = 50;
const CHART_W = W - MARGIN_LEFT - MARGIN_RIGHT;
const CHART_H = H - MARGIN_TOP - MARGIN_BOTTOM;
const NODE_R = 8;

function getEventXY(event) {
  const phase = PHASES.find(p => p.id === event.phase);
  const x = MARGIN_LEFT + (phase.x / 800) * CHART_W;
  const y = MARGIN_TOP + event.y * CHART_H;
  return { x, y };
}

export default function TimelineDiagram() {
  const [activeEvent, setActiveEvent] = useState(null);
  const [activePattern, setActivePattern] = useState(null);

  const eventMap = Object.fromEntries(EVENTS.map(e => [e.id, e]));
  const patternMap = Object.fromEntries(PATTERNS.map(p => [p.id, p]));

  const isEventVisible = (e) => {
    if (!activePattern && !activeEvent) return true;
    if (activePattern) return e.patternId === activePattern;
    if (activeEvent) {
      return e.id === activeEvent ||
        REINFORCEMENTS.some(r => (r.from === activeEvent && r.to === e.id) || (r.to === activeEvent && r.from === e.id));
    }
    return true;
  };

  const isReinforcementVisible = (r) => {
    if (!activePattern && !activeEvent) return false; // only show on selection
    if (activeEvent) return r.from === activeEvent || r.to === activeEvent;
    if (activePattern) {
      const fromE = eventMap[r.from];
      const toE = eventMap[r.to];
      return fromE?.patternId === activePattern || toE?.patternId === activePattern;
    }
    return false;
  };

  const selectedEvent = activeEvent ? eventMap[activeEvent] : null;

  return (
    <div style={{
      background: "#07080f",
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      padding: "32px 16px",
      fontFamily: "'Georgia', serif",
    }}>
      <div style={{ maxWidth: 860, width: "100%" }}>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 20 }}>
          <div style={{ fontSize: 10, letterSpacing: "0.25em", color: "#444", textTransform: "uppercase", marginBottom: 6 }}>
            Sweden: A Democracy Under Systemic Stress — 2019–2026
          </div>
          <h1 style={{ fontSize: 20, fontWeight: "normal", color: "#e8e8e0", margin: "0 0 4px" }}>
            Pattern Reinforcement Timeline
          </h1>
          <p style={{ fontSize: 11, color: "#444", margin: 0, fontStyle: "italic" }}>
            How documented patterns emerged, reinforced each other, and converged. Click an event or filter by pattern.
          </p>
        </div>

        {/* Pattern filter */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, justifyContent: "center", marginBottom: 16 }}>
          {PATTERNS.map(p => (
            <button
              key={p.id}
              onClick={() => setActivePattern(ap => ap === p.id ? null : p.id)}
              style={{
                background: activePattern === p.id ? p.color + "22" : "transparent",
                border: `1px solid ${activePattern === p.id ? p.color : "#1e1e2e"}`,
                borderRadius: 3,
                padding: "4px 10px",
                color: activePattern === p.id ? p.color : "#444",
                fontSize: 10,
                cursor: "pointer",
                fontFamily: "'Georgia', serif",
                transition: "all 0.15s",
              }}
            >
              {p.short}
            </button>
          ))}
          {(activePattern || activeEvent) && (
            <button
              onClick={() => { setActivePattern(null); setActiveEvent(null); }}
              style={{
                background: "transparent",
                border: "1px solid #333",
                borderRadius: 3,
                padding: "4px 10px",
                color: "#555",
                fontSize: 10,
                cursor: "pointer",
                fontFamily: "'Georgia', serif",
              }}
            >
              clear ×
            </button>
          )}
        </div>

        {/* Main diagram */}
        <div style={{ background: "#0d0e18", border: "1px solid #1e1e2e", borderRadius: 4, overflow: "hidden" }}>
          <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", display: "block" }}>
            <defs>
              <marker id="r-arr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto">
                <path d="M 0 0 L 10 5 L 0 10 z" fill="#c8a96e" />
              </marker>
            </defs>

            {/* Phase columns */}
            {PHASES.map((phase, i) => {
              const x = MARGIN_LEFT + (phase.x / 800) * CHART_W;
              return (
                <g key={phase.id}>
                  <line x1={x} y1={MARGIN_TOP - 10} x2={x} y2={H - MARGIN_BOTTOM}
                    stroke="#1a1a2e" strokeWidth="1" strokeDasharray="3 4" />
                  <text x={x} y={MARGIN_TOP - 18} textAnchor="middle" fontSize="9" fill="#333" fontFamily="Georgia, serif">
                    {phase.year}
                  </text>
                  <text x={x} y={MARGIN_TOP - 7} textAnchor="middle" fontSize="8" fill="#222" fontFamily="Georgia, serif" fontStyle="italic">
                    {phase.label}
                  </text>
                </g>
              );
            })}

            {/* Central convergence zone */}
            <ellipse
              cx={MARGIN_LEFT + (560 / 800) * CHART_W}
              cy={MARGIN_TOP + CHART_H * 0.5}
              rx={90} ry={CHART_H * 0.42}
              fill="#c8a96e" fillOpacity="0.025"
              stroke="#c8a96e" strokeOpacity="0.08" strokeWidth="1"
              strokeDasharray="4 4"
            />
            <text
              x={MARGIN_LEFT + (560 / 800) * CHART_W}
              y={MARGIN_TOP + CHART_H * 0.97}
              textAnchor="middle" fontSize="8" fill="#c8a96e" fillOpacity="0.4"
              fontFamily="Georgia, serif" fontStyle="italic"
            >
              convergence zone
            </text>

            {/* Pattern lanes - left axis labels */}
            {PATTERNS.map((p, i) => (
              <text key={p.id}
                x={MARGIN_LEFT - 8}
                y={MARGIN_TOP + (i / (PATTERNS.length - 1)) * CHART_H}
                textAnchor="end" fontSize="8.5"
                fill={activePattern === p.id ? p.color : "#2a2a3e"}
                fontFamily="Georgia, serif"
                dominantBaseline="middle"
              >
                {p.short}
              </text>
            ))}

            {/* Thin pattern lane lines */}
            {PATTERNS.map((p, i) => (
              <line key={p.id}
                x1={MARGIN_LEFT} y1={MARGIN_TOP + (i / (PATTERNS.length - 1)) * CHART_H}
                x2={W - MARGIN_RIGHT} y2={MARGIN_TOP + (i / (PATTERNS.length - 1)) * CHART_H}
                stroke={p.color} strokeOpacity="0.06" strokeWidth="1"
              />
            ))}

            {/* Reinforcement arrows */}
            {REINFORCEMENTS.map((r, i) => {
              if (!isReinforcementVisible(r)) return null;
              const e1 = eventMap[r.from];
              const e2 = eventMap[r.to];
              if (!e1 || !e2) return null;
              const p1 = getEventXY(e1);
              const p2 = getEventXY(e2);
              const dx = p2.x - p1.x;
              const dy = p2.y - p1.y;
              const len = Math.sqrt(dx * dx + dy * dy) || 1;
              const ux = dx / len; const uy = dy / len;
              const curve = 30;
              const mx = (p1.x + p2.x) / 2 - uy * curve;
              const my = (p1.y + p2.y) / 2 + ux * curve;
              return (
                <g key={i}>
                  <path
                    d={`M ${p1.x + ux * NODE_R} ${p1.y + uy * NODE_R} Q ${mx} ${my} ${p2.x - ux * (NODE_R + 6)} ${p2.y - uy * (NODE_R + 6)}`}
                    fill="none" stroke="#c8a96e" strokeWidth="1.2" strokeOpacity="0.7"
                    markerEnd="url(#r-arr)"
                  />
                  <text x={mx} y={my - 6} textAnchor="middle" fontSize="8" fill="#c8a96e" fillOpacity="0.7" fontStyle="italic">
                    {r.label}
                  </text>
                </g>
              );
            })}

            {/* Event nodes */}
            {EVENTS.map(event => {
              const pattern = patternMap[event.patternId];
              const { x, y } = getEventXY(event);
              const visible = isEventVisible(event);
              const isSelected = activeEvent === event.id;
              return (
                <g key={event.id} onClick={() => {
                  setActiveEvent(ae => ae === event.id ? null : event.id);
                  setActivePattern(null);
                }} style={{ cursor: "pointer" }} opacity={visible ? 1 : 0.1}>
                  {isSelected && (
                    <circle cx={x} cy={y} r={NODE_R + 8} fill="none"
                      stroke={pattern.color} strokeWidth="1" strokeOpacity="0.3" strokeDasharray="2 2" />
                  )}
                  <circle cx={x} cy={y} r={NODE_R}
                    fill={isSelected ? pattern.color + "33" : "#0d0e18"}
                    stroke={pattern.color}
                    strokeWidth={isSelected ? 2 : 1}
                    strokeOpacity={visible ? 1 : 0.3}
                  />
                  <circle cx={x} cy={y} r={3}
                    fill={pattern.color}
                    fillOpacity={visible ? 0.8 : 0.2}
                  />
                  {/* Year label */}
                  <text x={x + NODE_R + 4} y={y - 2} fontSize="7.5" fill={pattern.color} fillOpacity={visible ? 0.6 : 0.15}
                    fontFamily="Georgia, serif">
                    {event.year}
                  </text>
                  {/* Event label */}
                  <text x={x + NODE_R + 4} y={y + 8} fontSize="8.5"
                    fill={isSelected ? pattern.color : visible ? "#888" : "#222"}
                    fontFamily="Georgia, serif" fontWeight={isSelected ? "bold" : "normal"}>
                    {event.label}
                  </text>
                </g>
              );
            })}

            {/* Central point marker */}
            <g>
              <circle
                cx={MARGIN_LEFT + (560 / 800) * CHART_W}
                cy={MARGIN_TOP + CHART_H * 0.5}
                r={5} fill="none"
                stroke="#c8a96e" strokeOpacity="0.4" strokeWidth="1"
              />
              <circle
                cx={MARGIN_LEFT + (560 / 800) * CHART_W}
                cy={MARGIN_TOP + CHART_H * 0.5}
                r={2} fill="#c8a96e" fillOpacity="0.4"
              />
            </g>
          </svg>
        </div>

        {/* Event detail panel */}
        {selectedEvent && (
          <div style={{
            marginTop: 12,
            padding: "14px 16px",
            background: "#0d0e18",
            border: `1px solid ${patternMap[selectedEvent.patternId]?.color + "44"}`,
            borderRadius: 3,
            animation: "fadeIn 0.2s ease",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16 }}>
              <div>
                <div style={{ fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 4,
                  color: patternMap[selectedEvent.patternId]?.color }}>
                  {patternMap[selectedEvent.patternId]?.label} — {selectedEvent.year}
                </div>
                <div style={{ fontSize: 13, color: "#c8c8bc", fontWeight: "bold", marginBottom: 6 }}>
                  {selectedEvent.label}
                </div>
                <div style={{ fontSize: 12, color: "#666", lineHeight: 1.7 }}>
                  {selectedEvent.detail}
                </div>
              </div>
              <button onClick={() => setActiveEvent(null)} style={{
                background: "transparent", border: "none", color: "#333",
                cursor: "pointer", fontSize: 14, padding: "0 4px", flexShrink: 0,
              }}>×</button>
            </div>
            {REINFORCEMENTS.filter(r => r.from === selectedEvent.id || r.to === selectedEvent.id).length > 0 && (
              <div style={{ marginTop: 10, paddingTop: 10, borderTop: "1px solid #1a1a2e" }}>
                <div style={{ fontSize: 9, color: "#333", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 6 }}>
                  Connected events
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {REINFORCEMENTS
                    .filter(r => r.from === selectedEvent.id || r.to === selectedEvent.id)
                    .map((r, i) => {
                      const otherId = r.from === selectedEvent.id ? r.to : r.from;
                      const other = eventMap[otherId];
                      const dir = r.from === selectedEvent.id ? `→ ${r.label}` : `← ${r.label}`;
                      return (
                        <button key={i} onClick={() => setActiveEvent(otherId)} style={{
                          background: "transparent",
                          border: "1px solid #1e1e2e",
                          borderRadius: 3,
                          padding: "3px 8px",
                          color: "#555",
                          fontSize: 10,
                          cursor: "pointer",
                          fontFamily: "'Georgia', serif",
                          fontStyle: "italic",
                        }}>
                          {dir} {other?.label}
                        </button>
                      );
                    })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* The central finding */}
        <div style={{
          marginTop: 14, padding: "14px 16px",
          background: "#0a0b14",
          border: "1px solid #c8a96e22",
          borderRadius: 3,
        }}>
          <div style={{ fontSize: 10, letterSpacing: "0.15em", color: "#c8a96e", textTransform: "uppercase", marginBottom: 8, opacity: 0.6 }}>
            Central finding
          </div>
          <div style={{ fontSize: 12, color: "#555", lineHeight: 1.7 }}>
            The convergence point is <span style={{ color: "#c8a96e", opacity: 0.8 }}>Statistical Misdirection</span> — the mechanism that sustains all others.
            Without the ability to frame the narrative through selective data, the manufactured emergency collapses,
            Lagrådet overrides lose justification, and elite impunity becomes publicly visible.
            Beneath that: the gap between <span style={{ color: "#c8a96e", opacity: 0.8 }}>formal and functional democracy</span> —
            every pattern is a manifestation of institutions that exist in form but have been progressively hollowed of function.
            The timeline shows this is not coincidence but accumulation: each phase enables the next.
          </div>
        </div>

      </div>
      <style>{`@keyframes fadeIn { from { opacity:0; transform:translateY(4px);} to { opacity:1; transform:translateY(0);} }`}</style>
    </div>
  );
}

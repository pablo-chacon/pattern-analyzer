import { useState } from "react";

const W = 820, H = 580;
const MARGIN = { left: 110, right: 40, top: 60, bottom: 50 };
const CHART_W = W - MARGIN.left - MARGIN.right;
const CHART_H = H - MARGIN.top - MARGIN.bottom;
const NODE_R = 8;

function getEventXY(event, phases) {
  const phase = phases.find(p => p.id === event.phase);
  if (!phase) return { x: 0, y: 0 };
  return {
    x: MARGIN.left + (phase.x / 800) * CHART_W,
    y: MARGIN.top + event.y * CHART_H,
  };
}

export default function TimelineReinforcement({ dataset }) {
  const { patterns, phases, events, reinforcements } = dataset.data.timeline;
  const [activeEvent, setActiveEvent] = useState(null);
  const [activePattern, setActivePattern] = useState(null);

  const eventMap = Object.fromEntries(events.map(e => [e.id, e]));
  const patternMap = Object.fromEntries(patterns.map(p => [p.id, p]));

  const isEventVisible = (e) => {
    if (!activePattern && !activeEvent) return true;
    if (activePattern) return e.patternId === activePattern;
    if (activeEvent) return e.id === activeEvent ||
      reinforcements.some(r => (r.from === activeEvent && r.to === e.id) || (r.to === activeEvent && r.from === e.id));
    return true;
  };

  const isReinVisible = (r) => {
    if (!activePattern && !activeEvent) return false;
    if (activeEvent) return r.from === activeEvent || r.to === activeEvent;
    if (activePattern) {
      return eventMap[r.from]?.patternId === activePattern || eventMap[r.to]?.patternId === activePattern;
    }
    return false;
  };

  const selectedEvent = activeEvent ? eventMap[activeEvent] : null;

  return (
    <div style={{
      background: "#07080f", minHeight: "100vh",
      display: "flex", flexDirection: "column", alignItems: "center",
      padding: "32px 16px", fontFamily: "'Georgia', serif",
    }}>
      <div style={{ maxWidth: 860, width: "100%" }}>
        <div style={{ textAlign: "center", marginBottom: 20 }}>
          <div style={{ fontSize: 10, letterSpacing: "0.25em", color: "#444", textTransform: "uppercase", marginBottom: 6 }}>
            {dataset.meta.country} — {dataset.meta.period}
          </div>
          <h2 style={{ fontSize: 20, fontWeight: "normal", color: "#e8e8e0", margin: "0 0 4px" }}>
            Pattern Reinforcement Timeline
          </h2>
          <p style={{ fontSize: 11, color: "#444", margin: 0, fontStyle: "italic" }}>
            How patterns emerged, reinforced each other, and converged. Click an event or filter by pattern.
          </p>
        </div>

        {/* Pattern filter */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, justifyContent: "center", marginBottom: 16 }}>
          {patterns.map(p => (
            <button key={p.id} onClick={() => setActivePattern(ap => ap === p.id ? null : p.id)} style={{
              background: activePattern === p.id ? p.color + "22" : "transparent",
              border: `1px solid ${activePattern === p.id ? p.color : "#1e1e2e"}`,
              borderRadius: 3, padding: "4px 10px",
              color: activePattern === p.id ? p.color : "#444",
              fontSize: 10, cursor: "pointer", fontFamily: "'Georgia', serif",
            }}>{p.short}</button>
          ))}
          {(activePattern || activeEvent) && (
            <button onClick={() => { setActivePattern(null); setActiveEvent(null); }} style={{
              background: "transparent", border: "1px solid #333",
              borderRadius: 3, padding: "4px 10px",
              color: "#555", fontSize: 10, cursor: "pointer", fontFamily: "'Georgia', serif",
            }}>clear ×</button>
          )}
        </div>

        <div style={{ background: "#0d0e18", border: "1px solid #1e1e2e", borderRadius: 4, overflow: "hidden" }}>
          <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", display: "block" }}>
            <defs>
              <marker id="r-arr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto">
                <path d="M 0 0 L 10 5 L 0 10 z" fill="#c8a96e" />
              </marker>
            </defs>

            {/* Phase columns */}
            {phases.map(phase => {
              const x = MARGIN.left + (phase.x / 800) * CHART_W;
              return (
                <g key={phase.id}>
                  <line x1={x} y1={MARGIN.top - 10} x2={x} y2={H - MARGIN.bottom}
                    stroke="#1a1a2e" strokeWidth="1" strokeDasharray="3 4" />
                  <text x={x} y={MARGIN.top - 18} textAnchor="middle" fontSize="9" fill="#333" fontFamily="Georgia, serif">
                    {phase.year}
                  </text>
                  <text x={x} y={MARGIN.top - 7} textAnchor="middle" fontSize="8" fill="#222" fontFamily="Georgia, serif" fontStyle="italic">
                    {phase.label}
                  </text>
                </g>
              );
            })}

            {/* Convergence zone — centered on second-to-last phase */}
            {phases.length >= 2 && (() => {
              const convergencePhase = phases[phases.length - 2];
              const cx = MARGIN.left + (convergencePhase.x / 800) * CHART_W;
              return (
                <g>
                  <ellipse cx={cx} cy={MARGIN.top + CHART_H * 0.5}
                    rx={90} ry={CHART_H * 0.42}
                    fill="#c8a96e" fillOpacity="0.025"
                    stroke="#c8a96e" strokeOpacity="0.08" strokeWidth="1" strokeDasharray="4 4" />
                  <text x={cx} y={MARGIN.top + CHART_H * 0.97}
                    textAnchor="middle" fontSize="8" fill="#c8a96e" fillOpacity="0.4"
                    fontFamily="Georgia, serif" fontStyle="italic">convergence zone</text>
                </g>
              );
            })()}

            {/* Pattern lanes */}
            {patterns.map((p, i) => (
              <g key={p.id}>
                <text x={MARGIN.left - 8} y={MARGIN.top + (i / (patterns.length - 1)) * CHART_H}
                  textAnchor="end" fontSize="8.5"
                  fill={activePattern === p.id ? p.color : "#2a2a3e"}
                  fontFamily="Georgia, serif" dominantBaseline="middle">{p.short}</text>
                <line x1={MARGIN.left} y1={MARGIN.top + (i / (patterns.length - 1)) * CHART_H}
                  x2={W - MARGIN.right} y2={MARGIN.top + (i / (patterns.length - 1)) * CHART_H}
                  stroke={p.color} strokeOpacity="0.06" strokeWidth="1" />
              </g>
            ))}

            {/* Reinforcement arrows */}
            {reinforcements.map((r, i) => {
              if (!isReinVisible(r)) return null;
              const e1 = eventMap[r.from], e2 = eventMap[r.to];
              if (!e1 || !e2) return null;
              const p1 = getEventXY(e1, phases), p2 = getEventXY(e2, phases);
              const dx = p2.x - p1.x, dy = p2.y - p1.y;
              const len = Math.sqrt(dx * dx + dy * dy) || 1;
              const ux = dx / len, uy = dy / len;
              const curve = 30;
              const mx = (p1.x + p2.x) / 2 - uy * curve;
              const my = (p1.y + p2.y) / 2 + ux * curve;
              return (
                <g key={i}>
                  <path d={`M ${p1.x + ux * NODE_R} ${p1.y + uy * NODE_R} Q ${mx} ${my} ${p2.x - ux * (NODE_R + 6)} ${p2.y - uy * (NODE_R + 6)}`}
                    fill="none" stroke="#c8a96e" strokeWidth="1.2" strokeOpacity="0.7"
                    markerEnd="url(#r-arr)" />
                  <text x={mx} y={my - 6} textAnchor="middle" fontSize="8"
                    fill="#c8a96e" fillOpacity="0.7" fontStyle="italic">{r.label}</text>
                </g>
              );
            })}

            {/* Events */}
            {events.map(event => {
              const pattern = patternMap[event.patternId];
              const { x, y } = getEventXY(event, phases);
              const visible = isEventVisible(event);
              const isSelected = activeEvent === event.id;
              return (
                <g key={event.id} onClick={() => {
                  setActiveEvent(ae => ae === event.id ? null : event.id);
                  setActivePattern(null);
                }} style={{ cursor: "pointer" }} opacity={visible ? 1 : 0.1}>
                  {isSelected && (
                    <circle cx={x} cy={y} r={NODE_R + 8} fill="none"
                      stroke={pattern?.color} strokeWidth="1" strokeOpacity="0.3" strokeDasharray="2 2" />
                  )}
                  <circle cx={x} cy={y} r={NODE_R}
                    fill={isSelected ? (pattern?.color + "33") : "#0d0e18"}
                    stroke={pattern?.color} strokeWidth={isSelected ? 2 : 1}
                    strokeOpacity={visible ? 1 : 0.3} />
                  <circle cx={x} cy={y} r={3} fill={pattern?.color} fillOpacity={visible ? 0.8 : 0.2} />
                  <text x={x + NODE_R + 4} y={y - 2} fontSize="7.5"
                    fill={pattern?.color} fillOpacity={visible ? 0.6 : 0.15} fontFamily="Georgia, serif">
                    {event.year}
                  </text>
                  <text x={x + NODE_R + 4} y={y + 8} fontSize="8.5"
                    fill={isSelected ? pattern?.color : visible ? "#888" : "#222"}
                    fontFamily="Georgia, serif" fontWeight={isSelected ? "bold" : "normal"}>
                    {event.label}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Event detail */}
        {selectedEvent && (
          <div style={{
            marginTop: 12, padding: "14px 16px", background: "#0d0e18",
            border: `1px solid ${patternMap[selectedEvent.patternId]?.color + "44"}`,
            borderRadius: 3,
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
            {reinforcements.filter(r => r.from === selectedEvent.id || r.to === selectedEvent.id).length > 0 && (
              <div style={{ marginTop: 10, paddingTop: 10, borderTop: "1px solid #1a1a2e" }}>
                <div style={{ fontSize: 9, color: "#333", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 6 }}>
                  Connected events
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {reinforcements
                    .filter(r => r.from === selectedEvent.id || r.to === selectedEvent.id)
                    .map((r, i) => {
                      const otherId = r.from === selectedEvent.id ? r.to : r.from;
                      const other = eventMap[otherId];
                      const dir = r.from === selectedEvent.id ? `→ ${r.label}` : `← ${r.label}`;
                      return (
                        <button key={i} onClick={() => setActiveEvent(otherId)} style={{
                          background: "transparent", border: "1px solid #1e1e2e",
                          borderRadius: 3, padding: "3px 8px", color: "#555",
                          fontSize: 10, cursor: "pointer", fontFamily: "'Georgia', serif", fontStyle: "italic",
                        }}>{dir} {other?.label}</button>
                      );
                    })}
                </div>
              </div>
            )}
          </div>
        )}

        <div style={{ marginTop: 10, padding: "8px 14px", background: "#0a0b14",
          border: "1px solid #1a1a2e", borderRadius: 3 }}>
          <div style={{ fontSize: 9, color: "#333", lineHeight: 1.6, textAlign: "center", fontStyle: "italic" }}>
            {events.length} events · {reinforcements.length} reinforcing relationships · {phases.length} phases.
            Source: {dataset.meta.author}, {dataset.meta.title}.
          </div>
        </div>
      </div>
    </div>
  );
}

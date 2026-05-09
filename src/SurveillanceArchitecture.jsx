import { useState } from "react";

function RadarChart({ active, categories, dimensions, measures }) {
  const cx = 160, cy = 160, r = 120;
  const n = dimensions.length;
  const angles = dimensions.map((_, i) => (i * 2 * Math.PI) / n - Math.PI / 2);

  const getScore = (dimId) => {
    const relevant = measures.filter(t => active.has(t.id) && t.category === dimId);
    if (relevant.length === 0) return 0;
    const total = relevant.reduce((s, t) => s + t.weight, 0);
    const max = measures.filter(t => t.category === dimId).reduce((s, t) => s + t.weight, 0);
    return max > 0 ? total / max : 0;
  };

  const scores = dimensions.map(d => getScore(d.id));
  const points = angles.map((a, i) => ({
    x: cx + Math.cos(a) * r * scores[i],
    y: cy + Math.sin(a) * r * scores[i],
  }));
  const gridLevels = [0.25, 0.5, 0.75, 1.0];
  const totalScore = scores.reduce((s, v) => s + v, 0) / scores.length;

  const getRiskLabel = (score) => {
    if (score < 0.2)  return { label: "Minimal",       color: "#4a9e4a" };
    if (score < 0.4)  return { label: "Moderate",      color: "#c8a96e" };
    if (score < 0.65) return { label: "Significant",   color: "#f4a261" };
    if (score < 0.85) return { label: "Severe",        color: "#e07070" };
    return               { label: "Comprehensive", color: "#e63946" };
  };

  const risk = getRiskLabel(totalScore);

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      <svg width={320} height={320} viewBox="0 0 320 320">
        {gridLevels.map((level, li) => (
          <polygon key={li}
            points={angles.map(a => `${cx + Math.cos(a) * r * level},${cy + Math.sin(a) * r * level}`).join(" ")}
            fill="none" stroke="#1a1a2e" strokeWidth="1" />
        ))}
        {angles.map((a, i) => {
          const ox = cx + Math.cos(a) * r;
          const oy = cy + Math.sin(a) * r;
          return <line key={i} x1={cx} y1={cy} x2={ox} y2={oy} stroke="#1a1a2e" strokeWidth="1" />;
        })}
        <polygon
          points={points.map(p => `${p.x},${p.y}`).join(" ")}
          fill={risk.color} fillOpacity="0.2"
          stroke={risk.color} strokeWidth="2" />
        {angles.map((a, i) => {
          const lx = cx + Math.cos(a) * (r + 28);
          const ly = cy + Math.sin(a) * (r + 28);
          const cat = categories.find(c => c.id === dimensions[i].id);
          const words = dimensions[i].label.split(" ");
          return (
            <g key={i}>
              <text x={lx} y={ly - 4} textAnchor="middle" fontSize="8.5"
                fill={scores[i] > 0.5 ? risk.color : "#555"} fontFamily="Georgia, serif">
                {cat?.icon} {words[0]}
              </text>
              <text x={lx} y={ly + 7} textAnchor="middle" fontSize="8"
                fill={scores[i] > 0.5 ? risk.color : "#444"} fontFamily="Georgia, serif">
                {words.slice(1).join(" ")}
              </text>
              <circle cx={points[i].x} cy={points[i].y} r="3" fill={risk.color} fillOpacity="0.8" />
            </g>
          );
        })}
        <circle cx={cx} cy={cy} r="3" fill="#333" />
      </svg>

      <div style={{
        marginTop: 8, padding: "8px 20px",
        border: `1px solid ${risk.color}44`, borderRadius: 3,
        background: risk.color + "11", textAlign: "center",
      }}>
        <div style={{ fontSize: 9, color: "#444", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 3 }}>
          Aggregate surveillance level
        </div>
        <div style={{ fontSize: 18, color: risk.color, fontFamily: "Georgia, serif" }}>{risk.label}</div>
        <div style={{ fontSize: 9, color: "#444", marginTop: 2 }}>
          {Math.round(totalScore * 100)}% of documented maximum
        </div>
      </div>
    </div>
  );
}

export default function SurveillanceArchitecture({ dataset }) {
  const { categories, dimensions, measures } = dataset.data;
  const [active, setActive] = useState(new Set(measures.map(t => t.id)));
  const [selectedTool, setSelectedTool] = useState(null);
  const [filterCat, setFilterCat] = useState(null);

  const toggle = (id) => setActive(prev => {
    const next = new Set(prev);
    next.has(id) ? next.delete(id) : next.add(id);
    return next;
  });

  const toggleAll = () => {
    if (active.size === measures.length) setActive(new Set());
    else setActive(new Set(measures.map(t => t.id)));
  };

  const visibleMeasures = filterCat ? measures.filter(t => t.category === filterCat) : measures;
  const lagrådCount = measures.filter(t => active.has(t.id) && t.lagrådet).length;

  return (
    <div style={{ padding: "24px 20px", background: "#07080f", minHeight: "100vh" }}>
      <style>{`@keyframes fadeIn { from { opacity:0; transform:translateY(6px);} to {opacity:1;transform:translateY(0);} }`}</style>
      <div style={{ maxWidth: 960, margin: "0 auto" }}>

        <div style={{ marginBottom: 20, borderBottom: "1px solid #1a1a2e", paddingBottom: 16 }}>
          <div style={{ fontSize: 9, letterSpacing: "0.25em", color: "#333", textTransform: "uppercase", marginBottom: 4 }}>
            {dataset.meta.country} — {dataset.meta.period}
          </div>
          <h2 style={{ fontSize: 18, fontWeight: "normal", color: "#e8e8e0", margin: "0 0 6px" }}>
            {dataset.meta.title}
          </h2>
          <p style={{ fontSize: 11, color: "#444", margin: 0, lineHeight: 1.7, fontStyle: "italic", maxWidth: 600 }}>
            Each measure is officially framed as isolated and targeted.
            Toggle components to see how the aggregate surveillance level changes across dimensions.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 28, alignItems: "start" }}>
          <div>
            {/* Category filter */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 14 }}>
              <button onClick={() => setFilterCat(null)} style={{
                background: !filterCat ? "#1a1a2e" : "transparent",
                border: `1px solid ${!filterCat ? "#c8a96e" : "#1e1e2e"}`,
                borderRadius: 3, padding: "4px 10px",
                color: !filterCat ? "#c8a96e" : "#444",
                fontSize: 10, cursor: "pointer", fontFamily: "Georgia, serif",
              }}>All</button>
              {categories.map(c => (
                <button key={c.id} onClick={() => setFilterCat(fc => fc === c.id ? null : c.id)} style={{
                  background: filterCat === c.id ? c.color + "22" : "transparent",
                  border: `1px solid ${filterCat === c.id ? c.color : "#1e1e2e"}`,
                  borderRadius: 3, padding: "4px 10px",
                  color: filterCat === c.id ? c.color : "#444",
                  fontSize: 10, cursor: "pointer", fontFamily: "Georgia, serif",
                }}>{c.icon} {c.label}</button>
              ))}
              <button onClick={toggleAll} style={{
                background: "transparent", border: "1px solid #1e1e2e",
                borderRadius: 3, padding: "4px 10px", color: "#333",
                fontSize: 10, cursor: "pointer", fontFamily: "Georgia, serif", marginLeft: "auto",
              }}>{active.size === measures.length ? "deselect all" : "select all"}</button>
            </div>

            {/* Measures */}
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {visibleMeasures.map(tool => {
                const cat = categories.find(c => c.id === tool.category);
                const isActive = active.has(tool.id);
                const isSelected = selectedTool === tool.id;
                return (
                  <div key={tool.id} style={{
                    background: isActive ? "#0d0e18" : "#08090f",
                    border: `1px solid ${isSelected ? cat?.color : isActive ? "#1e1e2e" : "#0d0e18"}`,
                    borderLeft: `3px solid ${isActive ? cat?.color : "#1a1a2e"}`,
                    borderRadius: 3, opacity: isActive ? 1 : 0.4, transition: "all 0.15s",
                  }}>
                    <div style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "10px 12px" }}>
                      <button onClick={() => toggle(tool.id)} style={{
                        background: isActive ? (cat?.color + "33") : "transparent",
                        border: `1px solid ${isActive ? cat?.color : "#2a2a3e"}`,
                        borderRadius: 2, width: 18, height: 18, cursor: "pointer", flexShrink: 0,
                        display: "flex", alignItems: "center", justifyContent: "center", marginTop: 2,
                      }}>
                        {isActive && <span style={{ fontSize: 10, color: cat?.color }}>✓</span>}
                      </button>
                      <div style={{ flex: 1, cursor: "pointer" }}
                        onClick={() => setSelectedTool(s => s === tool.id ? null : tool.id)}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                          <div>
                            <span style={{ fontSize: 12, color: isActive ? "#c8c8bc" : "#444", fontWeight: "bold" }}>
                              {tool.name}
                            </span>
                            <span style={{ fontSize: 10, color: cat?.color, marginLeft: 8, opacity: 0.7 }}>
                              {tool.year}
                            </span>
                            {tool.lagrådet && (
                              <span style={{ fontSize: 9, color: "#e63946", marginLeft: 6,
                                border: "1px solid #e6394633", borderRadius: 2, padding: "1px 4px" }}>
                                Lagrådet override
                              </span>
                            )}
                          </div>
                          <span style={{ fontSize: 10, color: "#333" }}>{isSelected ? "▲" : "▼"}</span>
                        </div>
                        <div style={{ fontSize: 11, color: "#444", marginTop: 3, fontStyle: "italic" }}>
                          Official framing: {tool.framing}
                        </div>
                        {isSelected && (
                          <div style={{ marginTop: 10, animation: "fadeIn 0.2s ease" }}>
                            <div style={{ fontSize: 11, color: "#666", marginBottom: 6,
                              padding: "8px 10px", background: "#0a0b14",
                              borderLeft: `2px solid ${cat?.color}` }}>
                              <span style={{ color: cat?.color, fontWeight: "bold" }}>Actual effect: </span>
                              {tool.reality}
                            </div>
                            <div style={{ fontSize: 10, color: "#333", fontStyle: "italic" }}>
                              Source: {tool.source}
                            </div>
                          </div>
                        )}
                      </div>
                      <div style={{ display: "flex", gap: 2, flexShrink: 0, paddingTop: 3 }}>
                        {[1, 2, 3].map(w => (
                          <div key={w} style={{
                            width: 5, height: 5, borderRadius: "50%",
                            background: w <= tool.weight ? cat?.color : "#1a1a2e",
                            opacity: isActive ? 1 : 0.3,
                          }} />
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div style={{
              marginTop: 14, padding: "10px 14px", background: "#0a0b14",
              border: "1px solid #1a1a2e", borderRadius: 3, display: "flex", gap: 24,
            }}>
              <div style={{ fontSize: 10, color: "#444" }}>
                <span style={{ color: "#c8a96e", fontWeight: "bold" }}>{active.size}</span>
                <span style={{ marginLeft: 4 }}>of {measures.length} measures active</span>
              </div>
              {lagrådCount > 0 && (
                <div style={{ fontSize: 10, color: "#444" }}>
                  <span style={{ color: "#e63946", fontWeight: "bold" }}>{lagrådCount}</span>
                  <span style={{ marginLeft: 4 }}>introduced over Lagrådet objections</span>
                </div>
              )}
            </div>
          </div>

          {/* Radar + summary */}
          <div style={{ position: "sticky", top: 80 }}>
            <RadarChart active={active} categories={categories} dimensions={dimensions} measures={measures} />
            <div style={{
              marginTop: 18, padding: "14px", background: "#0a0b14",
              border: "1px solid #1a1a2e", borderRadius: 3,
            }}>
              <div style={{ fontSize: 9, letterSpacing: "0.15em", color: "#333",
                textTransform: "uppercase", marginBottom: 10 }}>
                What the sum means
              </div>
              {dimensions.map(dim => {
                const cat = categories.find(c => c.id === dim.id);
                const relevant = measures.filter(t => active.has(t.id) && t.category === dim.id);
                const inactive = relevant.length === 0;
                const example = relevant[0];
                return (
                  <div key={dim.id} style={{
                    display: "flex", gap: 8, marginBottom: 7, opacity: inactive ? 0.2 : 1,
                  }}>
                    <div style={{ width: 6, height: 6, borderRadius: "50%",
                      background: inactive ? "#1a1a2e" : cat?.color,
                      flexShrink: 0, marginTop: 4 }} />
                    <div>
                      <span style={{ fontSize: 10, color: inactive ? "#333" : cat?.color,
                        fontWeight: "bold" }}>{cat?.label}: </span>
                      <span style={{ fontSize: 10, color: "#444" }}>
                        {inactive ? "No active measures" : `${relevant.length} measure${relevant.length > 1 ? "s" : ""} active`}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
            <div style={{ marginTop: 10, fontSize: 9, color: "#222", lineHeight: 1.6, fontStyle: "italic" }}>
              Each measure listed is sourced to named legislation or official reports.
              The aggregate assessment reflects the documented cumulative effect —
              no individual measure is presented as evidence of intent.
              Source: {dataset.meta.author}, {dataset.meta.title}.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

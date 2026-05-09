import { useState, useCallback } from "react";

const W = 900, H = 620, R = 42;

function toXY(px, py) {
  return {
    x: (px / 100) * (W - 140) + 70,
    y: (py / 100) * (H - 140) + 70,
  };
}

function edgePoints(n1, n2) {
  const p1 = toXY(n1.x, n1.y);
  const p2 = toXY(n2.x, n2.y);
  const dx = p2.x - p1.x, dy = p2.y - p1.y;
  const len = Math.sqrt(dx * dx + dy * dy) || 1;
  const ux = dx / len, uy = dy / len;
  return {
    x1: p1.x + ux * R, y1: p1.y + uy * R,
    x2: p2.x - ux * (R + 8), y2: p2.y - uy * (R + 8),
    mx: (p1.x + p2.x) / 2, my: (p1.y + p2.y) / 2,
  };
}

export default function SystemCorrelationMap({ dataset }) {
  const { nodes, edges } = dataset.data.correlation;
  const [active, setActive] = useState(null);
  const [hoveredEdge, setHoveredEdge] = useState(null);

  const nodeMap = Object.fromEntries(nodes.map(n => [n.id, n]));
  const connectedIds = active
    ? new Set(edges.filter(e => e.from === active || e.to === active).flatMap(e => [e.from, e.to]))
    : null;
  const toggle = useCallback((id) => setActive(a => a === id ? null : id), []);

  return (
    <div style={{
      background: "#07080f", minHeight: "100vh",
      display: "flex", flexDirection: "column", alignItems: "center",
      padding: "32px 16px", fontFamily: "'Georgia', serif",
    }}>
      <div style={{ maxWidth: 940, width: "100%" }}>
        <div style={{ textAlign: "center", marginBottom: 16 }}>
          <div style={{ fontSize: 10, letterSpacing: "0.25em", color: "#444", textTransform: "uppercase", marginBottom: 6 }}>
            {dataset.meta.country} — {dataset.meta.period}
          </div>
          <h2 style={{ fontSize: 20, fontWeight: "normal", color: "#e8e8e0", margin: "0 0 4px" }}>
            Systemic Correlation Map
          </h2>
          <p style={{ fontSize: 11, color: "#444", margin: 0, fontStyle: "italic" }}>
            Documented patterns and their reinforcing relationships. Click any node.
          </p>
        </div>

        <div style={{ background: "#0d0e18", border: "1px solid #1e1e2e", borderRadius: 4, overflow: "hidden" }}>
          <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", display: "block" }}>
            <defs>
              <marker id="arr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto">
                <path d="M 0 0 L 10 5 L 0 10 z" fill="#2a2a3e" />
              </marker>
              <marker id="arr-hi" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto">
                <path d="M 0 0 L 10 5 L 0 10 z" fill="#90e0ef" />
              </marker>
            </defs>

            {edges.map((edge, i) => {
              const n1 = nodeMap[edge.from], n2 = nodeMap[edge.to];
              if (!n1 || !n2) return null;
              const pts = edgePoints(n1, n2);
              const isActive = active && (edge.from === active || edge.to === active);
              const highlight = isActive || hoveredEdge === i;
              return (
                <g key={i}>
                  <line x1={pts.x1} y1={pts.y1} x2={pts.x2} y2={pts.y2}
                    stroke={highlight ? "#90e0ef" : "#1e2030"}
                    strokeWidth={highlight ? 1.5 : 0.8}
                    strokeOpacity={active && !isActive ? 0.12 : highlight ? 0.9 : 0.6}
                    markerEnd={highlight ? "url(#arr-hi)" : "url(#arr)"}
                    style={{ cursor: "pointer" }}
                    onMouseEnter={() => setHoveredEdge(i)}
                    onMouseLeave={() => setHoveredEdge(null)} />
                  {highlight && (
                    <text x={pts.mx} y={pts.my - 5} textAnchor="middle" fontSize="8.5"
                      fill="#90e0ef" opacity="0.75" fontStyle="italic" fontFamily="Georgia, serif">
                      {edge.label}
                    </text>
                  )}
                </g>
              );
            })}

            {nodes.map(node => {
              const { x, y } = toXY(node.x, node.y);
              const isActive = active === node.id;
              const isDimmed = active && !isActive && !connectedIds?.has(node.id);
              const lines = node.label.split("\n");
              const sublines = node.sublabel.split("\n");
              return (
                <g key={node.id} onClick={() => toggle(node.id)}
                  style={{ cursor: "pointer" }} opacity={isDimmed ? 0.15 : 1}>
                  {isActive && (
                    <circle cx={x} cy={y} r={R + 10} fill="none"
                      stroke={node.accent} strokeWidth="1" strokeOpacity="0.25" strokeDasharray="3 3" />
                  )}
                  <circle cx={x} cy={y} r={R}
                    fill={isActive ? node.accent + "18" : "#0d0e18"}
                    stroke={isActive ? node.accent : node.accent + "55"}
                    strokeWidth={isActive ? 2 : 1} />
                  {lines.map((line, li) => (
                    <text key={li} x={x} y={y + (li - (lines.length - 1) / 2) * 12 - 1}
                      textAnchor="middle" fontSize="10" fontWeight="600"
                      fill={isActive ? node.accent : "#c0c0b4"}
                      fontFamily="Georgia, serif">{line}</text>
                  ))}
                  {isActive && sublines.map((sl, sli) => (
                    <text key={sli} x={x} y={y + R + 14 + sli * 12}
                      textAnchor="middle" fontSize="8.5" fill={node.accent}
                      opacity="0.8" fontStyle="italic" fontFamily="Georgia, serif">{sl}</text>
                  ))}
                </g>
              );
            })}
          </svg>
        </div>

        <div style={{ marginTop: 10, padding: "8px 14px", border: "1px solid #1a1a2e", borderRadius: 3, background: "#0a0b14" }}>
          <div style={{ fontSize: 9, color: "#333", lineHeight: 1.6, textAlign: "center", fontStyle: "italic" }}>
            {nodes.length} nodes · {edges.length} relationships · No causal claim beyond documented record.
            Source: {dataset.meta.author}, {dataset.meta.title}.
          </div>
        </div>
      </div>
    </div>
  );
}

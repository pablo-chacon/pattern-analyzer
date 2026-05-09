import { useState, useCallback } from "react";

const nodes = [
  {
    id: "political_architecture",
    label: "Political\nArchitecture",
    sublabel: "January + Tidö agreements\nbypass electoral mandates",
    x: 50, y: 6,
    accent: "#e63946",
  },
  {
    id: "kvittning",
    label: "Parliamentary\nMechanics",
    sublabel: "Kvittning breached 3×\nin one session",
    x: 80, y: 20,
    accent: "#e63946",
  },
  {
    id: "mandate_arithmetic",
    label: "Mandate\nArithmetic",
    sublabel: "M→SD transitions\n+ SD independent history",
    x: 94, y: 42,
    accent: "#e63946",
  },
  {
    id: "engineered_event",
    label: "Engineered\nEvent",
    sublabel: "Paludan/Quran burning\nSD-adjacent planning",
    x: 80, y: 64,
    accent: "#e63946",
  },
  {
    id: "oversight_bypass",
    label: "Oversight\nBypass",
    sublabel: "5 expert bodies dismissed\nLagrådet × 4",
    x: 50, y: 78,
    accent: "#f4a261",
  },
  {
    id: "institutional_penetration",
    label: "Institutional\nPenetration",
    sublabel: "22 verified cases\nacross all sectors",
    x: 20, y: 64,
    accent: "#f4a261",
  },
  {
    id: "criminal_democracy",
    label: "Criminal Network\nin Democracy",
    sublabel: "313 elected reps\n73 still active",
    x: 6, y: 42,
    accent: "#f4a261",
  },
  {
    id: "surveillance",
    label: "Surveillance\nInfrastructure",
    sublabel: "BankID + cashless +\nmetadata + warrantless",
    x: 20, y: 20,
    accent: "#f4a261",
  },
  {
    id: "statistical_misdirection",
    label: "Statistical\nMisdirection",
    sublabel: "Narrative ≠ BRÅ +\nTullverket + Polisen",
    x: 50, y: 42,
    accent: "#90e0ef",
  },
  {
    id: "selective_law",
    label: "Selective\nRule of Law",
    sublabel: "Elite impunity\ndocumented across tiers",
    x: 50, y: 94,
    accent: "#90e0ef",
  },
  {
    id: "participation_pressure",
    label: "Participation\nUnder Pressure",
    sublabel: "65% riksdag threatened\n47% self-censor",
    x: 28, y: 86,
    accent: "#90e0ef",
  },
  {
    id: "tax_redistribution",
    label: "Tax\nRedistribution",
    sublabel: "Top 1/5 receive >50%\nof reductions",
    x: 72, y: 86,
    accent: "#90e0ef",
  },
  {
    id: "happiness_paradox",
    label: "Happiness\nParadox",
    sublabel: "#4 happiest +\n#5 antidepressant use",
    x: 94, y: 64,
    accent: "#90e0ef",
  },
];

const edges = [
  { from: "political_architecture", to: "kvittning", label: "enables" },
  { from: "political_architecture", to: "oversight_bypass", label: "drives" },
  { from: "political_architecture", to: "surveillance", label: "expands" },
  { from: "kvittning", to: "mandate_arithmetic", label: "requires" },
  { from: "mandate_arithmetic", to: "kvittning", label: "triggers" },
  { from: "engineered_event", to: "political_architecture", label: "reinforces" },
  { from: "oversight_bypass", to: "statistical_misdirection", label: "permits" },
  { from: "oversight_bypass", to: "selective_law", label: "enables" },
  { from: "institutional_penetration", to: "selective_law", label: "produces" },
  { from: "institutional_penetration", to: "criminal_democracy", label: "extends to" },
  { from: "criminal_democracy", to: "selective_law", label: "deepens" },
  { from: "criminal_democracy", to: "participation_pressure", label: "contributes to" },
  { from: "surveillance", to: "institutional_penetration", label: "coexists with" },
  { from: "statistical_misdirection", to: "political_architecture", label: "legitimizes" },
  { from: "statistical_misdirection", to: "oversight_bypass", label: "justifies" },
  { from: "selective_law", to: "tax_redistribution", label: "protects" },
  { from: "selective_law", to: "participation_pressure", label: "produces" },
  { from: "participation_pressure", to: "political_architecture", label: "weakens check on" },
  { from: "tax_redistribution", to: "happiness_paradox", label: "contributes to" },
  { from: "surveillance", to: "happiness_paradox", label: "contradicts" },
  { from: "participation_pressure", to: "happiness_paradox", label: "contradicts" },
  { from: "engineered_event", to: "oversight_bypass", label: "accelerated" },
];

const W = 900;
const H = 620;
const R = 42;

function toXY(px, py) {
  return {
    x: (px / 100) * (W - 140) + 70,
    y: (py / 100) * (H - 140) + 70,
  };
}

function edgePoints(n1, n2) {
  const p1 = toXY(n1.x, n1.y);
  const p2 = toXY(n2.x, n2.y);
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  const len = Math.sqrt(dx * dx + dy * dy) || 1;
  const ux = dx / len;
  const uy = dy / len;
  return {
    x1: p1.x + ux * R,
    y1: p1.y + uy * R,
    x2: p2.x - ux * (R + 8),
    y2: p2.y - uy * (R + 8),
    mx: (p1.x + p2.x) / 2,
    my: (p1.y + p2.y) / 2,
  };
}

export default function SwedishSystemDiagram() {
  const [active, setActive] = useState(null);
  const [hoveredEdge, setHoveredEdge] = useState(null);

  const nodeMap = Object.fromEntries(nodes.map(n => [n.id, n]));

  const connectedIds = active
    ? new Set(
        edges
          .filter(e => e.from === active || e.to === active)
          .flatMap(e => [e.from, e.to])
      )
    : null;

  const toggle = useCallback((id) => {
    setActive(a => a === id ? null : id);
  }, []);

  return (
    <div style={{
      background: "#07080f",
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "32px 16px",
      fontFamily: "'Georgia', serif",
    }}>
      <style>{`@keyframes fadeIn { from { opacity:0; transform:translateY(6px);} to { opacity:1; transform:translateY(0);} }`}</style>

      <div style={{ maxWidth: 940, width: "100%" }}>
        <div style={{ textAlign: "center", marginBottom: 16 }}>
          <div style={{ fontSize: 10, letterSpacing: "0.25em", color: "#444", textTransform: "uppercase", marginBottom: 6 }}>
            Sweden: A Democracy Under Systemic Stress — Final 2026
          </div>
          <h1 style={{ fontSize: 20, fontWeight: "normal", color: "#e8e8e0", margin: "0 0 4px", letterSpacing: "0.02em" }}>
            Systemic Correlation Map
          </h1>
          <p style={{ fontSize: 11, color: "#444", margin: 0, fontStyle: "italic" }}>
            Eight documented patterns and their reinforcing relationships. Click any node to highlight connections.
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

            {/* Edges */}
            {edges.map((edge, i) => {
              const n1 = nodeMap[edge.from];
              const n2 = nodeMap[edge.to];
              if (!n1 || !n2) return null;
              const pts = edgePoints(n1, n2);
              const isActive = active && (edge.from === active || edge.to === active);
              const isHovered = hoveredEdge === i;
              const highlight = isActive || isHovered;
              return (
                <g key={i}>
                  <line
                    x1={pts.x1} y1={pts.y1} x2={pts.x2} y2={pts.y2}
                    stroke={highlight ? "#90e0ef" : "#1e2030"}
                    strokeWidth={highlight ? 1.5 : 0.8}
                    strokeOpacity={active && !isActive ? 0.12 : highlight ? 0.9 : 0.6}
                    markerEnd={highlight ? "url(#arr-hi)" : "url(#arr)"}
                    style={{ cursor: "pointer" }}
                    onMouseEnter={() => setHoveredEdge(i)}
                    onMouseLeave={() => setHoveredEdge(null)}
                  />
                  {highlight && (
                    <text x={pts.mx} y={pts.my - 5} textAnchor="middle" fontSize="8.5" fill="#90e0ef" opacity="0.75" fontStyle="italic">
                      {edge.label}
                    </text>
                  )}
                </g>
              );
            })}

            {/* Nodes */}
            {nodes.map(node => {
              const { x, y } = toXY(node.x, node.y);
              const isActive = active === node.id;
              const isDimmed = active && !isActive && !connectedIds?.has(node.id);
              const lines = node.label.split("\n");
              const sublines = node.sublabel.split("\n");

              return (
                <g key={node.id} onClick={() => toggle(node.id)} style={{ cursor: "pointer" }} opacity={isDimmed ? 0.15 : 1}>
                  {isActive && (
                    <circle cx={x} cy={y} r={R + 10} fill="none"
                      stroke={node.accent} strokeWidth="1" strokeOpacity="0.25" strokeDasharray="3 3" />
                  )}
                  <circle cx={x} cy={y} r={R}
                    fill={isActive ? node.accent + "18" : "#0d0e18"}
                    stroke={isActive ? node.accent : node.accent + "55"}
                    strokeWidth={isActive ? 2 : 1}
                  />
                  {lines.map((line, li) => (
                    <text key={li} x={x} y={y + (li - (lines.length - 1) / 2) * 12 - 1}
                      textAnchor="middle" fontSize="10" fontWeight="600"
                      fill={isActive ? node.accent : "#c0c0b4"}
                      fontFamily="Georgia, serif" letterSpacing="0.01em">
                      {line}
                    </text>
                  ))}
                  {isActive && sublines.map((sl, sli) => (
                    <text key={sli} x={x} y={y + R + 14 + sli * 12}
                      textAnchor="middle" fontSize="8.5" fill={node.accent}
                      opacity="0.8" fontStyle="italic" fontFamily="Georgia, serif">
                      {sl}
                    </text>
                  ))}
                </g>
              );
            })}
          </svg>
        </div>

        {/* Legend */}
        <div style={{ display: "flex", gap: 24, justifyContent: "center", marginTop: 16, flexWrap: "wrap" }}>
          {[
            { color: "#e63946", label: "Power & Parliamentary mechanics" },
            { color: "#f4a261", label: "Oversight & Institutional integrity" },
            { color: "#90e0ef", label: "Evidence, social & economic effects" },
          ].map(item => (
            <div key={item.label} style={{ display: "flex", alignItems: "center", gap: 7 }}>
              <div style={{ width: 10, height: 10, borderRadius: "50%", background: item.color, opacity: 0.8, flexShrink: 0 }} />
              <span style={{ fontSize: 10, color: "#444" }}>{item.label}</span>
            </div>
          ))}
        </div>

        <div style={{
          marginTop: 14, padding: "10px 14px",
          border: "1px solid #1a1a2e", borderRadius: 3, background: "#0a0b14",
        }}>
          <div style={{ fontSize: 9.5, color: "#333", lineHeight: 1.6, textAlign: "center", fontStyle: "italic" }}>
            Each node represents a documented pattern — not an isolated event.
            Arrows represent reinforcing or enabling relationships derived from temporal sequence and structural logic in the sourced evidence.
            No causal claim is asserted beyond what the documented record supports.
            13 nodes · 22 documented relationships · 16 sections · 8 systemic patterns.
          </div>
        </div>
      </div>
    </div>
  );
}

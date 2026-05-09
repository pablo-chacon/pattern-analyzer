import { useState, useRef } from "react";
import swedenSurveillance from "./datasets/sweden_surveillance.json";
import swedenDemocratic from "./datasets/sweden_democratic.json";
import templateSurveillance from "./datasets/template_surveillance.json";
import templateFull from "./datasets/template_full.json";

const BUILT_IN = [
  {
    id: "sweden_surveillance",
    label: "Sweden — Surveillance Architecture",
    description: "9 measures, 2012–2026. Official framings vs. aggregate effect.",
    tags: ["surveillance", "Sweden"],
    data: swedenSurveillance,
  },
  {
    id: "sweden_democratic",
    label: "Sweden — Democratic Erosion",
    description: "8 patterns, 2019–2026. Correlation map + timeline.",
    tags: ["correlation", "timeline", "Sweden"],
    data: swedenDemocratic,
  },
];

const TEMPLATES = [
  {
    id: "template_surveillance",
    label: "Template — Surveillance Architecture",
    description: "Empty template for surveillance analysis. Fill in your own measures.",
    data: templateSurveillance,
  },
  {
    id: "template_full",
    label: "Template — Full Erosion Dataset",
    description: "Empty template for correlation map + timeline. Fill in your own patterns and events.",
    data: templateFull,
  },
];

function Tag({ label }) {
  const colors = {
    surveillance: "#b5838d",
    correlation: "#90e0ef",
    timeline: "#c8a96e",
    Sweden: "#4a9e4a",
  };
  return (
    <span style={{
      fontSize: 9, padding: "1px 6px",
      border: `1px solid ${colors[label] || "#333"}44`,
      borderRadius: 2, color: colors[label] || "#555",
      fontFamily: "Georgia, serif",
    }}>{label}</span>
  );
}

export default function DatasetLoader({ onLoad }) {
  const [selected, setSelected] = useState(null);
  const [uploadError, setUploadError] = useState(null);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef(null);

  const load = (dataset) => {
    onLoad(dataset);
    setSelected(dataset.meta?.title || dataset.id);
  };

  const handleUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    setUploadError(null);
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const parsed = JSON.parse(ev.target.result);
        if (!parsed.meta || !parsed.type || !parsed.data) {
          throw new Error("Invalid format. File must have meta, type, and data fields.");
        }
        load(parsed);
        setUploading(false);
      } catch (err) {
        setUploadError(err.message);
        setUploading(false);
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const downloadTemplate = (templateData, filename) => {
    const blob = new Blob([JSON.stringify(templateData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const inputStyle = {
    background: "#0d0e18", border: "1px solid #1e1e2e",
    borderRadius: 3, padding: "8px 12px", color: "#c8c8bc",
    fontSize: 11, fontFamily: "'Georgia', serif",
    boxSizing: "border-box",
  };

  return (
    <div style={{ padding: "32px 20px", background: "#07080f", minHeight: "100vh", fontFamily: "Georgia, serif" }}>
      <div style={{ maxWidth: 860, margin: "0 auto" }}>

        <div style={{ marginBottom: 32, borderBottom: "1px solid #1a1a2e", paddingBottom: 24 }}>
          <div style={{ fontSize: 9, letterSpacing: "0.28em", color: "#2a2a3e", textTransform: "uppercase", marginBottom: 8 }}>
            Dataset Selector
          </div>
          <h2 style={{ fontSize: 20, fontWeight: "normal", color: "#e8e8e0", margin: "0 0 8px" }}>
            Load a Dataset
          </h2>
          <p style={{ fontSize: 12, color: "#444", margin: 0, lineHeight: 1.7, fontStyle: "italic", maxWidth: 560 }}>
            Select a built-in reference dataset or upload your own JSON.
            The visualization tabs update automatically based on what the dataset contains.
          </p>
          {selected && (
            <div style={{ marginTop: 12, fontSize: 11, color: "#4a9e4a" }}>
              ✓ Loaded: {selected}
            </div>
          )}
        </div>

        {/* Built-in datasets */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ fontSize: 10, letterSpacing: "0.15em", color: "#555",
            textTransform: "uppercase", marginBottom: 14 }}>
            Reference Datasets
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {BUILT_IN.map(ds => (
              <div key={ds.id} style={{
                background: "#0d0e18", border: "1px solid #1e1e2e",
                borderRadius: 3, padding: "14px 16px",
                display: "flex", justifyContent: "space-between",
                alignItems: "center", gap: 16,
              }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                    <span style={{ fontSize: 13, color: "#c8c8bc", fontWeight: "bold" }}>{ds.label}</span>
                    <div style={{ display: "flex", gap: 4 }}>
                      {ds.tags.map(t => <Tag key={t} label={t} />)}
                    </div>
                  </div>
                  <div style={{ fontSize: 11, color: "#444", fontStyle: "italic" }}>{ds.description}</div>
                </div>
                <button onClick={() => load(ds.data)} style={{
                  background: "#1a1a2e", border: "1px solid #c8a96e",
                  borderRadius: 3, padding: "8px 16px",
                  color: "#c8a96e", fontSize: 10, cursor: "pointer",
                  fontFamily: "Georgia, serif", letterSpacing: "0.08em",
                  flexShrink: 0, whiteSpace: "nowrap",
                }}>Load dataset</button>
              </div>
            ))}
          </div>
        </div>

        {/* Upload */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ fontSize: 10, letterSpacing: "0.15em", color: "#555",
            textTransform: "uppercase", marginBottom: 14 }}>
            Upload Custom Dataset
          </div>
          <div style={{
            background: "#0d0e18", border: "1px dashed #2a2a3e",
            borderRadius: 3, padding: "24px",
          }}>
            <div style={{ textAlign: "center", marginBottom: 16 }}>
              <div style={{ fontSize: 12, color: "#555", marginBottom: 8 }}>
                Upload a JSON file following the dataset schema
              </div>
              <div style={{ fontSize: 10, color: "#333", fontStyle: "italic" }}>
                Must contain: meta (title, country, period, author), type, data
              </div>
            </div>
            <div style={{ display: "flex", justifyContent: "center", gap: 10 }}>
              <input ref={fileRef} type="file" accept=".json"
                onChange={handleUpload}
                style={{ display: "none" }} />
              <button onClick={() => fileRef.current?.click()} style={{
                background: "#1a1a2e", border: "1px solid #c8a96e",
                borderRadius: 3, padding: "10px 20px",
                color: "#c8a96e", fontSize: 11, cursor: "pointer",
                fontFamily: "Georgia, serif", letterSpacing: "0.08em",
              }}>
                {uploading ? "Loading..." : "Choose JSON file"}
              </button>
            </div>
            {uploadError && (
              <div style={{ marginTop: 12, padding: "8px 12px",
                background: "#1a0a0a", border: "1px solid #5c1a1a",
                borderRadius: 3, color: "#e07070", fontSize: 11,
                textAlign: "center" }}>
                {uploadError}
              </div>
            )}
          </div>
        </div>

        {/* Templates */}
        <div>
          <div style={{ fontSize: 10, letterSpacing: "0.15em", color: "#555",
            textTransform: "uppercase", marginBottom: 14 }}>
            Download Templates
          </div>
          <div style={{ fontSize: 11, color: "#333", marginBottom: 12, fontStyle: "italic" }}>
            Download a template, fill in your own documented data, then upload above.
            Each template includes comments explaining the schema.
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {TEMPLATES.map(t => (
              <div key={t.id} style={{
                background: "#0a0b14", border: "1px solid #1a1a2e",
                borderRadius: 3, padding: "12px 16px",
                display: "flex", justifyContent: "space-between",
                alignItems: "center", gap: 16,
              }}>
                <div>
                  <div style={{ fontSize: 12, color: "#666", marginBottom: 2 }}>{t.label}</div>
                  <div style={{ fontSize: 10, color: "#333", fontStyle: "italic" }}>{t.description}</div>
                </div>
                <button
                  onClick={() => downloadTemplate(t.data, `${t.id}.json`)}
                  style={{
                    background: "transparent", border: "1px solid #2a2a3e",
                    borderRadius: 3, padding: "6px 14px",
                    color: "#555", fontSize: 10, cursor: "pointer",
                    fontFamily: "Georgia, serif", flexShrink: 0, whiteSpace: "nowrap",
                  }}>↓ Download</button>
              </div>
            ))}
          </div>
        </div>

        {/* Schema reference */}
        <div style={{ marginTop: 32, padding: "16px", background: "#0a0b14",
          border: "1px solid #1a1a2e", borderRadius: 3 }}>
          <div style={{ fontSize: 10, letterSpacing: "0.15em", color: "#333",
            textTransform: "uppercase", marginBottom: 10 }}>Dataset Schema Reference</div>
          <div style={{ fontSize: 10, color: "#2a2a3e", lineHeight: 1.8, fontFamily: "monospace" }}>
            {`{
  "meta": { "title", "country", "period", "author", "license" },
  "type": "surveillance" | "correlation" | "timeline" | "full",
  "data": {
    // if type = "surveillance":
    "categories": [...], "dimensions": [...], "measures": [...]
    
    // if type = "correlation":
    "correlation": { "nodes": [...], "edges": [...] }
    
    // if type = "timeline":
    "timeline": { "patterns": [...], "phases": [...], "events": [...], "reinforcements": [...] }
    
    // if type = "full": both correlation + timeline
  }
}`}
          </div>
          <div style={{ marginTop: 10, fontSize: 10, color: "#2a2a3e", fontStyle: "italic" }}>
            Full schema documentation: github.com/pablo-chacon/pattern-analyzer
          </div>
        </div>

      </div>
    </div>
  );
}

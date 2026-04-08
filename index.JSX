import { useState, useRef, useCallback } from "react";

const RACKING_TYPES = ["Cantilever", "Pigeonhole", "Pallet Racking", "Mezzanine"];

const generateId = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6);

const initialFinding = () => ({
  id: generateId(),
  rackingType: "",
  partType: "",
  partDimensions: "",
  location: "",
  quantity: "",
  description: "",
  photos: [],
  photoPreviews: [],
});

const initialSurvey = () => ({
  storeNumber: "",
  storeName: "",
  surveyDate: new Date().toISOString().split("T")[0],
  surveyorName: "",
  findings: [],
  generalNotes: "",
});

export default function RackingSurvey() {
  const [survey, setSurvey] = useState(initialSurvey());
  const [currentFinding, setCurrentFinding] = useState(initialFinding());
  const [view, setView] = useState("header");
  const [editingIndex, setEditingIndex] = useState(null);
  const [showPhotoModal, setShowPhotoModal] = useState(null);
  const fileInputRef = useRef(null);

  const updateSurvey = (field, value) => setSurvey((s) => ({ ...s, [field]: value }));
  const updateFinding = (field, value) => setCurrentFinding((f) => ({ ...f, [field]: value }));

  const handlePhotoCapture = useCallback((e) => {
    const files = Array.from(e.target.files);
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setCurrentFinding((f) => ({
          ...f,
          photos: [...f.photos, file],
          photoPreviews: [...f.photoPreviews, ev.target.result],
        }));
      };
      reader.readAsDataURL(file);
    });
    e.target.value = "";
  }, []);

  const removePhoto = (idx) => {
    setCurrentFinding((f) => ({
      ...f,
      photos: f.photos.filter((_, i) => i !== idx),
      photoPreviews: f.photoPreviews.filter((_, i) => i !== idx),
    }));
  };

  const saveFinding = () => {
    if (!currentFinding.rackingType) return;
    setSurvey((s) => {
      const findings = [...s.findings];
      if (editingIndex !== null) {
        findings[editingIndex] = currentFinding;
      } else {
        findings.push(currentFinding);
      }
      return { ...s, findings };
    });
    setCurrentFinding(initialFinding());
    setEditingIndex(null);
    setView("review");
  };

  const editFinding = (idx) => {
    setCurrentFinding({ ...survey.findings[idx] });
    setEditingIndex(idx);
    setView("addFinding");
  };

  const deleteFinding = (idx) => {
    setSurvey((s) => ({ ...s, findings: s.findings.filter((_, i) => i !== idx) }));
  };

  const exportText = () => {
    const lines = [];
    lines.push("══════════════════════════════════════════");
    lines.push("McCOYS BUILDING SUPPLY — RACKING SURVEY");
    lines.push("══════════════════════════════════════════");
    lines.push("");
    lines.push(`Store: #${survey.storeNumber} — ${survey.storeName}`);
    lines.push(`Date: ${survey.surveyDate}`);
    lines.push(`Surveyor: ${survey.surveyorName}`);
    lines.push(`Total Items: ${survey.findings.length}`);
    lines.push("");

    survey.findings.forEach((f, i) => {
      lines.push("──────────────────────────────────────────");
      lines.push(`ITEM #${i + 1} — ${f.rackingType}`);
      lines.push("──────────────────────────────────────────");
      if (f.partType) lines.push(`Part Type: ${f.partType}`);
      if (f.partDimensions) lines.push(`Part Dimensions: ${f.partDimensions}`);
      if (f.location) lines.push(`Location: ${f.location}`);
      if (f.quantity) lines.push(`Quantity: ${f.quantity}`);
      if (f.description) lines.push(`Description/Notes: ${f.description}`);
      lines.push(`Photos: ${f.photos.length} attached`);
      lines.push("");
    });

    if (survey.generalNotes) {
      lines.push("──────────────────────────────────────────");
      lines.push("GENERAL NOTES:");
      lines.push(survey.generalNotes);
    }
    return lines.join("\n");
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(exportText());
      alert("Report copied to clipboard! Paste into FEXA work order.");
    } catch {
      const ta = document.createElement("textarea");
      ta.value = exportText();
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      alert("Report copied! Paste into FEXA work order.");
    }
  };

  const isHeaderValid = survey.storeNumber && survey.storeName && survey.surveyorName;

  const st = {
    app: {
      fontFamily: "'IBM Plex Mono', 'Courier New', monospace",
      background: "#1a1a1a",
      color: "#e0ddd5",
      minHeight: "100vh",
      maxWidth: "600px",
      margin: "0 auto",
      paddingBottom: "70px",
    },
    topBar: {
      background: "#c62828",
      padding: "14px 18px",
      position: "sticky",
      top: 0,
      zIndex: 100,
    },
    topTitle: {
      fontFamily: "'Oswald', 'Impact', sans-serif",
      fontSize: "18px",
      fontWeight: 700,
      color: "#fff",
      letterSpacing: "1.5px",
      textTransform: "uppercase",
    },
    topSub: {
      fontFamily: "'IBM Plex Mono', monospace",
      fontSize: "10px",
      color: "rgba(255,255,255,0.7)",
      letterSpacing: "2px",
      textTransform: "uppercase",
    },
    body: { padding: "16px" },
    section: {
      fontFamily: "'Oswald', 'Impact', sans-serif",
      fontSize: "13px",
      color: "#999",
      letterSpacing: "3px",
      textTransform: "uppercase",
      marginBottom: "12px",
      borderBottom: "1px solid #333",
      paddingBottom: "6px",
    },
    label: {
      display: "block",
      fontSize: "11px",
      color: "#888",
      letterSpacing: "1px",
      textTransform: "uppercase",
      marginBottom: "4px",
      marginTop: "14px",
    },
    input: {
      width: "100%",
      background: "#252525",
      border: "1px solid #3a3a3a",
      color: "#e0ddd5",
      padding: "12px",
      fontSize: "16px",
      fontFamily: "'IBM Plex Mono', monospace",
      borderRadius: "4px",
      boxSizing: "border-box",
      outline: "none",
    },
    textarea: {
      width: "100%",
      background: "#252525",
      border: "1px solid #3a3a3a",
      color: "#e0ddd5",
      padding: "12px",
      fontSize: "14px",
      fontFamily: "'IBM Plex Mono', monospace",
      borderRadius: "4px",
      boxSizing: "border-box",
      minHeight: "80px",
      resize: "vertical",
      outline: "none",
    },
    btnPrimary: {
      width: "100%",
      padding: "16px",
      background: "#c62828",
      color: "#fff",
      border: "none",
      fontSize: "14px",
      fontFamily: "'Oswald', sans-serif",
      fontWeight: 700,
      letterSpacing: "2px",
      textTransform: "uppercase",
      borderRadius: "4px",
      cursor: "pointer",
      marginTop: "20px",
    },
    btnOutline: {
      width: "100%",
      padding: "14px",
      background: "transparent",
      color: "#c62828",
      border: "2px solid #c62828",
      fontSize: "13px",
      fontFamily: "'Oswald', sans-serif",
      fontWeight: 700,
      letterSpacing: "2px",
      textTransform: "uppercase",
      borderRadius: "4px",
      cursor: "pointer",
      marginTop: "10px",
    },
    btnGhost: {
      padding: "10px 16px",
      background: "transparent",
      color: "#aaa",
      border: "1px solid #444",
      fontSize: "11px",
      fontFamily: "'IBM Plex Mono', monospace",
      letterSpacing: "1px",
      textTransform: "uppercase",
      borderRadius: "3px",
      cursor: "pointer",
    },
    card: {
      background: "#222",
      border: "1px solid #333",
      borderRadius: "6px",
      padding: "14px",
      marginBottom: "12px",
    },
    pill: (active) => ({
      padding: "12px 18px",
      borderRadius: "4px",
      border: active ? "2px solid #c62828" : "1px solid #444",
      background: active ? "rgba(198,40,40,0.15)" : "#252525",
      color: active ? "#ff8a80" : "#bbb",
      fontSize: "14px",
      fontFamily: "'IBM Plex Mono', monospace",
      cursor: "pointer",
      fontWeight: active ? 700 : 400,
      textAlign: "center",
    }),
    nav: {
      display: "flex",
      background: "#1e1e1e",
      borderTop: "1px solid #333",
      position: "fixed",
      bottom: 0,
      left: 0,
      right: 0,
      maxWidth: "600px",
      margin: "0 auto",
      zIndex: 100,
    },
    navBtn: (active) => ({
      flex: 1,
      padding: "10px 4px 8px",
      background: active ? "#252525" : "transparent",
      border: "none",
      borderTop: active ? "2px solid #c62828" : "2px solid transparent",
      color: active ? "#fff" : "#666",
      fontSize: "10px",
      fontFamily: "'IBM Plex Mono', monospace",
      letterSpacing: "1px",
      textTransform: "uppercase",
      cursor: "pointer",
      textAlign: "center",
    }),
  };

  const renderHeader = () => (
    <div style={st.body}>
      <div style={st.section}>Survey Info</div>
      <label style={st.label}>Store Number *</label>
      <input style={st.input} type="text" inputMode="numeric" placeholder="e.g. 042" value={survey.storeNumber} onChange={(e) => updateSurvey("storeNumber", e.target.value)} />
      <label style={st.label}>Store Name / City *</label>
      <input style={st.input} type="text" placeholder="e.g. San Marcos" value={survey.storeName} onChange={(e) => updateSurvey("storeName", e.target.value)} />
      <label style={st.label}>Survey Date</label>
      <input style={st.input} type="date" value={survey.surveyDate} onChange={(e) => updateSurvey("surveyDate", e.target.value)} />
      <label style={st.label}>Surveyor Name *</label>
      <input style={st.input} type="text" placeholder="Your name" value={survey.surveyorName} onChange={(e) => updateSurvey("surveyorName", e.target.value)} />
      <label style={st.label}>General Notes</label>
      <textarea style={st.textarea} placeholder="Overall observations about the location..." value={survey.generalNotes} onChange={(e) => updateSurvey("generalNotes", e.target.value)} />
      <button style={{ ...st.btnPrimary, opacity: isHeaderValid ? 1 : 0.4 }} disabled={!isHeaderValid} onClick={() => setView(survey.findings.length > 0 ? "review" : "addFinding")}>
        {survey.findings.length > 0 ? "Continue to Findings" : "Start Adding Findings"}
      </button>
    </div>
  );

  const renderAddFinding = () => (
    <div style={st.body}>
      <div style={st.section}>{editingIndex !== null ? `Edit Item #${editingIndex + 1}` : `New Item #${survey.findings.length + 1}`}</div>

      <label style={st.label}>Racking Type *</label>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginTop: "6px" }}>
        {RACKING_TYPES.map((t) => (
          <div key={t} style={st.pill(currentFinding.rackingType === t)} onClick={() => updateFinding("rackingType", t)}>
            {t}
          </div>
        ))}
      </div>

      <label style={st.label}>Part Type</label>
      <input style={st.input} type="text" placeholder="e.g. Arm, Upright, Beam, Shelf..." value={currentFinding.partType} onChange={(e) => updateFinding("partType", e.target.value)} />

      <label style={st.label}>Part Dimensions</label>
      <input style={st.input} type="text" placeholder={`e.g. 48" arm, 12' upright, 4x4 base...`} value={currentFinding.partDimensions} onChange={(e) => updateFinding("partDimensions", e.target.value)} />

      <label style={st.label}>Location</label>
      <input style={st.input} type="text" placeholder="e.g. Lumber yard row 3, Back wall..." value={currentFinding.location} onChange={(e) => updateFinding("location", e.target.value)} />

      <label style={st.label}>Quantity</label>
      <input style={st.input} type="text" inputMode="numeric" placeholder="e.g. 2" value={currentFinding.quantity} onChange={(e) => updateFinding("quantity", e.target.value)} />

      <label style={st.label}>Description / Notes</label>
      <textarea style={st.textarea} placeholder="Describe what's needed, damage details, special instructions..." value={currentFinding.description} onChange={(e) => updateFinding("description", e.target.value)} />

      <label style={st.label}>Photos ({currentFinding.photoPreviews.length})</label>
      <input ref={fileInputRef} type="file" accept="image/*" capture="environment" multiple onChange={handlePhotoCapture} style={{ display: "none" }} />
      <button style={{ ...st.btnGhost, width: "100%", marginTop: "6px", padding: "14px" }} onClick={() => fileInputRef.current?.click()}>
        📷&nbsp;&nbsp;Take Photo / Upload
      </button>
      {currentFinding.photoPreviews.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "8px", marginTop: "8px" }}>
          {currentFinding.photoPreviews.map((src, i) => (
            <div key={i} style={{ position: "relative" }}>
              <img src={src} alt={`Photo ${i + 1}`} style={{ width: "100%", aspectRatio: "1", objectFit: "cover", borderRadius: "4px", border: "1px solid #444", cursor: "pointer" }} onClick={() => setShowPhotoModal(src)} />
              <button onClick={() => removePhoto(i)} style={{ position: "absolute", top: 2, right: 2, background: "#c62828", color: "#fff", border: "none", borderRadius: "50%", width: 22, height: 22, fontSize: 13, cursor: "pointer", lineHeight: "20px", textAlign: "center" }}>×</button>
            </div>
          ))}
        </div>
      )}

      <button style={{ ...st.btnPrimary, opacity: currentFinding.rackingType ? 1 : 0.4 }} disabled={!currentFinding.rackingType} onClick={saveFinding}>
        {editingIndex !== null ? "Update Item" : "Save Item"}
      </button>
      <button style={st.btnOutline} onClick={() => { setCurrentFinding(initialFinding()); setEditingIndex(null); setView("review"); }}>
        Cancel
      </button>
    </div>
  );

  const renderReview = () => (
    <div>
      <div style={{ textAlign: "center", padding: "16px", background: "#1e1e1e", borderBottom: "1px solid #333" }}>
        <div style={{ fontFamily: "'Oswald', sans-serif", fontSize: "32px", fontWeight: 700, color: "#fff" }}>{survey.findings.length}</div>
        <div style={{ fontSize: "10px", letterSpacing: "2px", color: "#777", textTransform: "uppercase" }}>Item{survey.findings.length !== 1 ? "s" : ""} Found — Store #{survey.storeNumber}</div>
      </div>
      <div style={st.body}>
        {survey.findings.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px 0", color: "#555" }}>
            <div style={{ fontSize: "36px", marginBottom: "8px" }}>📋</div>
            <div>No findings yet</div>
            <div style={{ fontSize: "12px", marginTop: "4px" }}>Tap "Add Item" to start</div>
          </div>
        ) : (
          survey.findings.map((f, i) => (
            <div key={f.id} style={st.card}>
              <div style={{ fontSize: "14px", fontWeight: 700, color: "#ccc", marginBottom: "8px" }}>
                #{i + 1} — {f.rackingType}
              </div>
              <div style={{ fontSize: "12px", color: "#999", lineHeight: 1.8 }}>
                {f.partType && <div><span style={{ color: "#666" }}>Part:</span> {f.partType}</div>}
                {f.partDimensions && <div><span style={{ color: "#666" }}>Dimensions:</span> {f.partDimensions}</div>}
                {f.location && <div><span style={{ color: "#666" }}>Location:</span> {f.location}</div>}
                {f.quantity && <div><span style={{ color: "#666" }}>Qty:</span> {f.quantity}</div>}
                {f.description && <div style={{ color: "#aaa", marginTop: "4px", borderTop: "1px solid #333", paddingTop: "6px" }}>{f.description}</div>}
                {f.photoPreviews.length > 0 && (
                  <div style={{ display: "flex", gap: "4px", marginTop: "8px" }}>
                    {f.photoPreviews.slice(0, 4).map((src, pi) => (
                      <img key={pi} src={src} alt="" style={{ width: "48px", height: "48px", objectFit: "cover", borderRadius: "3px", border: "1px solid #444", cursor: "pointer" }} onClick={() => setShowPhotoModal(src)} />
                    ))}
                    {f.photoPreviews.length > 4 && <span style={{ fontSize: "11px", color: "#666", alignSelf: "center" }}>+{f.photoPreviews.length - 4}</span>}
                  </div>
                )}
              </div>
              <div style={{ display: "flex", gap: "8px", marginTop: "10px" }}>
                <button style={st.btnGhost} onClick={() => editFinding(i)}>Edit</button>
                <button style={{ ...st.btnGhost, color: "#c62828", borderColor: "#c62828" }} onClick={() => deleteFinding(i)}>Delete</button>
              </div>
            </div>
          ))
        )}
        <button style={st.btnPrimary} onClick={() => { setCurrentFinding(initialFinding()); setEditingIndex(null); setView("addFinding"); }}>
          + Add Item
        </button>
      </div>
    </div>
  );

  const renderExport = () => (
    <div style={st.body}>
      <div style={st.section}>Export to FEXA</div>
      <div style={{ ...st.card, background: "#1a2e1a", borderColor: "#2E7D32" }}>
        <div style={{ fontSize: "13px", fontWeight: 700, color: "#81C784", marginBottom: "6px" }}>Ready to Export</div>
        <div style={{ fontSize: "12px", color: "#a5d6a7", lineHeight: 1.6 }}>
          Store #{survey.storeNumber} — {survey.storeName}<br />
          {survey.findings.length} item{survey.findings.length !== 1 ? "s" : ""}<br />
          {survey.findings.reduce((a, f) => a + f.photos.length, 0)} photo{survey.findings.reduce((a, f) => a + f.photos.length, 0) !== 1 ? "s" : ""}
        </div>
      </div>
      <button style={st.btnPrimary} onClick={copyToClipboard}>
        📋&nbsp;&nbsp;Copy Report to Clipboard
      </button>
      <div style={{ fontSize: "11px", color: "#666", textAlign: "center", marginTop: "8px" }}>
        Paste directly into FEXA work order description
      </div>
      <div style={{ marginTop: "24px" }}>
        <div style={st.section}>Report Preview</div>
        <pre style={{ background: "#111", border: "1px solid #333", borderRadius: "6px", padding: "14px", fontSize: "11px", color: "#aaa", whiteSpace: "pre-wrap", wordBreak: "break-word", lineHeight: 1.5, maxHeight: "400px", overflowY: "auto" }}>
          {exportText()}
        </pre>
      </div>
      <div style={{ marginTop: "20px", padding: "14px", background: "#252525", borderRadius: "6px", borderLeft: "3px solid #c62828" }}>
        <div style={{ fontSize: "12px", fontWeight: 700, color: "#ccc", marginBottom: "6px" }}>Photo Reminder</div>
        <div style={{ fontSize: "11px", color: "#888", lineHeight: 1.6 }}>
          Attach photos from your camera roll when creating the FEXA work order. Photos are tagged by item number for easy reference.
        </div>
      </div>
      <button style={st.btnOutline} onClick={() => { if (confirm("Start a new survey? Current data will be cleared.")) { setSurvey(initialSurvey()); setView("header"); } }}>
        Start New Survey
      </button>
    </div>
  );

  return (
    <div style={st.app}>
      <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;600;700&family=Oswald:wght@500;600;700&display=swap" rel="stylesheet" />
      <div style={st.topBar}>
        <div>
          <div style={st.topTitle}>McCoys Racking Survey</div>
          <div style={st.topSub}>Construction &amp; Maintenance</div>
        </div>
      </div>
      {view === "header" && renderHeader()}
      {view === "addFinding" && renderAddFinding()}
      {view === "review" && renderReview()}
      {view === "export" && renderExport()}
      <div style={st.nav}>
        <button style={st.navBtn(view === "header")} onClick={() => setView("header")}>
          <div style={{ fontSize: "18px" }}>🏪</div>Store
        </button>
        <button style={st.navBtn(view === "addFinding")} onClick={() => { if (view !== "addFinding") { setCurrentFinding(initialFinding()); setEditingIndex(null); } setView("addFinding"); }}>
          <div style={{ fontSize: "18px" }}>➕</div>Add Item
        </button>
        <button style={st.navBtn(view === "review")} onClick={() => setView("review")}>
          <div style={{ fontSize: "18px" }}>📋</div>Review ({survey.findings.length})
        </button>
        <button style={st.navBtn(view === "export")} onClick={() => setView("export")}>
          <div style={{ fontSize: "18px" }}>📤</div>Export
        </button>
      </div>
      {showPhotoModal && (
        <div onClick={() => setShowPhotoModal(null)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.92)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
          <img src={showPhotoModal} alt="Full size" style={{ maxWidth: "100%", maxHeight: "100%", borderRadius: "4px" }} />
          <button onClick={() => setShowPhotoModal(null)} style={{ position: "absolute", top: 16, right: 16, background: "#c62828", color: "#fff", border: "none", borderRadius: "50%", width: 36, height: 36, fontSize: 20, cursor: "pointer" }}>×</button>
        </div>
      )}
    </div>
  );
}

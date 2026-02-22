import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../api";
import { useI18n } from "../i18n";

export default function OpenVASImport() {
  const navigate = useNavigate();
  const { t } = useI18n();
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [dragOver, setDragOver] = useState(false);

  const handleFileChange = (e) => { const f = e.target.files[0]; if (f) { if (!f.name.endsWith(".xml")) { setError(t.openvasImport.onlyXml); return; } setFile(f); setError(""); } };
  const handleDrop = (e) => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files[0]; if (f) { if (!f.name.endsWith(".xml")) { setError(t.openvasImport.onlyXml); return; } setFile(f); setError(""); } };

  const handleUpload = async () => {
    if (!file) { setError(t.openvasImport.selectFile); return; }
    setLoading(true); setError("");
    try { const formData = new FormData(); formData.append("file", file); const res = await axios.post("/api/scan/import/openvas", formData, { headers: { "Content-Type": "multipart/form-data" } }); setResult(res.data); }
    catch (err) { setError(err.response?.data?.detail || t.openvasImport.importError); }
    finally { setLoading(false); }
  };

  if (result) {
    return (
      <div className="card" style={{ textAlign: "center", padding: 40 }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
        <h2 style={{ fontSize: 20, fontWeight: 600, color: "var(--gray-900)", marginBottom: 8 }}>{t.openvasImport.success}</h2>
        <p style={{ color: "var(--gray-500)", fontSize: 14, marginBottom: 8 }}><strong>{result.imported}</strong> {t.openvasImport.imported}</p>
        <div style={{ display: "flex", justifyContent: "center", gap: 10, marginTop: 20 }}>
          <button className="btn btn-secondary" onClick={() => { setResult(null); setFile(null); }}>{t.openvasImport.newImport}</button>
          <button className="btn btn-primary" onClick={() => navigate("/vulnlist")}>{t.openvasImport.goToList}</button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 20, fontWeight: 700, color: "var(--gray-900)", marginBottom: 4 }}>{t.openvasImport.title}</h1>
        <p style={{ fontSize: 13, color: "var(--gray-500)" }}>{t.openvasImport.subtitle}</p>
      </div>

      {error && (<div style={{ padding: "10px 16px", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8, color: "#dc2626", fontSize: 13, marginBottom: 16 }}>⚠️ {error}</div>)}

      <div className="card" style={{ padding: 24 }}>
        <div onDragOver={(e) => { e.preventDefault(); setDragOver(true); }} onDragLeave={() => setDragOver(false)} onDrop={handleDrop} style={{ border: `2px dashed ${dragOver ? "var(--brand-500)" : "var(--gray-200)"}`, borderRadius: 12, padding: 40, textAlign: "center", background: dragOver ? "var(--brand-50)" : "var(--gray-50)", transition: "all 0.2s", cursor: "pointer" }} onClick={() => document.getElementById("file-input").click()}>
          <input id="file-input" type="file" accept=".xml" onChange={handleFileChange} style={{ display: "none" }} />
          <div style={{ fontSize: 40, marginBottom: 12 }}>📄</div>
          {file ? (
            <div>
              <p style={{ fontSize: 14, fontWeight: 600, color: "var(--gray-900)" }}>{file.name}</p>
              <p style={{ fontSize: 12, color: "var(--gray-500)", marginTop: 4 }}>{(file.size / 1024).toFixed(1)} KB</p>
            </div>
          ) : (
            <div>
              <p style={{ fontSize: 14, fontWeight: 500, color: "var(--gray-700)" }}>{t.openvasImport.dragDrop}</p>
              <p style={{ fontSize: 12, color: "var(--gray-400)", marginTop: 4 }}>{t.openvasImport.orClick}</p>
            </div>
          )}
        </div>

        <div style={{ marginTop: 16, padding: 12, background: "var(--brand-50)", borderRadius: 8, border: "1px solid var(--brand-100)" }}>
          <p style={{ fontSize: 12, fontWeight: 600, color: "var(--brand-700)", marginBottom: 4 }}>📋 {t.openvasImport.supportedFormats}</p>
          <ul style={{ fontSize: 11, color: "var(--gray-600)", margin: 0, paddingLeft: 16 }}>
            <li>{t.openvasImport.format1}</li>
            <li>{t.openvasImport.format2}</li>
          </ul>
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 20 }}>
          <button className="btn btn-secondary" onClick={() => { setFile(null); setError(""); }}>{t.openvasImport.clearBtn}</button>
          <button className="btn btn-primary" onClick={handleUpload} disabled={file /home/kali/Masaüstü/vulnmgmt/backend/app/api/network_scan.py || loading} style={{ minWidth: 160 }}>{loading ? t.openvasImport.importing : t.openvasImport.importBtn}</button>
        </div>
      </div>
    </div>
  );
}

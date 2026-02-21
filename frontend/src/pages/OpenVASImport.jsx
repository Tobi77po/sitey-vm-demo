import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../api";

export default function OpenVASImport() {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [dragOver, setDragOver] = useState(false);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (!selectedFile.name.endsWith(".xml")) {
        setError("Sadece XML dosyaları kabul edilmektedir");
        return;
      }
      setFile(selectedFile);
      setError("");
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      if (!droppedFile.name.endsWith(".xml")) {
        setError("Sadece XML dosyaları kabul edilmektedir");
        return;
      }
      setFile(droppedFile);
      setError("");
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError("Lütfen bir XML dosyası seçin");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await axios.post("/api/scan/import/openvas", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setResult(res.data);
    } catch (err) {
      setError(err.response?.data?.detail || "İçe aktarma sırasında hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  if (result) {
    return (
      <div className="card" style={{ textAlign: "center", padding: 40 }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
        <h2 style={{ fontSize: 20, fontWeight: 600, color: "var(--gray-900)", marginBottom: 8 }}>
          İçe Aktarma Tamamlandı
        </h2>
        <p style={{ color: "var(--gray-500)", fontSize: 14, marginBottom: 8 }}>
          <strong>{result.imported}</strong> zafiyet başarıyla içe aktarıldı.
        </p>
        <div style={{ display: "flex", justifyContent: "center", gap: 10, marginTop: 20 }}>
          <button className="btn btn-secondary" onClick={() => { setResult(null); setFile(null); }}>
            Yeni İçe Aktar
          </button>
          <button className="btn btn-primary" onClick={() => navigate("/vulnlist")}>
            Zafiyet Listesine Git →
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 20, fontWeight: 700, color: "var(--gray-900)", marginBottom: 4 }}>
          OpenVAS Rapor İçe Aktar
        </h1>
        <p style={{ fontSize: 13, color: "var(--gray-500)" }}>
          OpenVAS/GVM tarama sonuçlarını XML formatında içe aktarın.
        </p>
      </div>

      {error && (
        <div style={{
          padding: "10px 16px",
          background: "#fef2f2",
          border: "1px solid #fecaca",
          borderRadius: 8,
          color: "#dc2626",
          fontSize: 13,
          marginBottom: 16,
        }}>
          ⚠️ {error}
        </div>
      )}

      <div className="card" style={{ padding: 24 }}>
        {}
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          style={{
            border: `2px dashed ${dragOver ? "var(--brand-500)" : "var(--gray-200)"}`,
            borderRadius: 12,
            padding: 40,
            textAlign: "center",
            background: dragOver ? "var(--brand-50)" : "var(--gray-50)",
            transition: "all 0.2s",
            cursor: "pointer",
          }}
          onClick={() => document.getElementById("file-input").click()}
        >
          <input
            id="file-input"
            type="file"
            accept=".xml"
            onChange={handleFileChange}
            style={{ display: "none" }}
          />
          <div style={{ fontSize: 40, marginBottom: 12 }}>📄</div>
          {file ? (
            <div>
              <p style={{ fontSize: 14, fontWeight: 600, color: "var(--gray-900)" }}>
                {file.name}
              </p>
              <p style={{ fontSize: 12, color: "var(--gray-500)", marginTop: 4 }}>
                {(file.size / 1024).toFixed(1)} KB
              </p>
            </div>
          ) : (
            <div>
              <p style={{ fontSize: 14, fontWeight: 500, color: "var(--gray-700)" }}>
                XML dosyasını buraya sürükleyin
              </p>
              <p style={{ fontSize: 12, color: "var(--gray-400)", marginTop: 4 }}>
                veya dosya seçmek için tıklayın
              </p>
            </div>
          )}
        </div>

        {}
        <div style={{
          marginTop: 16,
          padding: 12,
          background: "var(--brand-50)",
          borderRadius: 8,
          border: "1px solid var(--brand-100)",
        }}>
          <p style={{ fontSize: 12, fontWeight: 600, color: "var(--brand-700)", marginBottom: 4 }}>
            📋 Desteklenen Formatlar
          </p>
          <ul style={{ fontSize: 11, color: "var(--gray-600)", margin: 0, paddingLeft: 16 }}>
            <li>OpenVAS/GVM XML rapor çıktısı</li>
            <li>Greenbone Security Assistant (GSA) dışa aktarma</li>
          </ul>
        </div>

        {}
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 20 }}>
          <button className="btn btn-secondary" onClick={() => { setFile(null); setError(""); }}>
            Temizle
          </button>
          <button
            className="btn btn-primary"
            onClick={handleUpload}
            disabled={!file || loading}
            style={{ minWidth: 160 }}
          >
            {loading ? "İçe Aktarılıyor..." : "İçe Aktar"}
          </button>
        </div>
      </div>
    </div>
  );
}

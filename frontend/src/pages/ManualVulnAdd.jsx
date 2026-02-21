import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../api";

const RISK_OPTIONS = [
  { value: "Critical", label: "Critical", color: "#ef4444" },
  { value: "High", label: "High", color: "#f97316" },
  { value: "Medium", label: "Medium", color: "#eab308" },
  { value: "Low", label: "Low", color: "#3b82f6" },
  { value: "Info", label: "Info", color: "#9ca3af" },
];

export default function ManualVulnAdd() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "",
    cve: "",
    risk: "Medium",
    description: "",
    solution: "",
    target_ip: "",
    port: "",
    service: "",
    cvss_score: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      setError("Zafiyet adı zorunludur");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await axios.post("/api/vuln/manual", form);
      setSuccess(true);
      setTimeout(() => {
        navigate("/vulnlist");
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.detail || "Zafiyet eklenirken hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="card" style={{ textAlign: "center", padding: 40 }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
        <h2 style={{ fontSize: 20, fontWeight: 600, color: "var(--gray-900)", marginBottom: 8 }}>
          Zafiyet Başarıyla Eklendi
        </h2>
        <p style={{ color: "var(--gray-500)", fontSize: 14 }}>
          Zafiyet listesine yönlendiriliyorsunuz...
        </p>
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 20, fontWeight: 700, color: "var(--gray-900)", marginBottom: 4 }}>
          Manuel Zafiyet Ekle
        </h1>
        <p style={{ fontSize: 13, color: "var(--gray-500)" }}>
          Harici kaynaklardan veya manuel testlerden tespit edilen zafiyetleri sisteme ekleyin.
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

      <form onSubmit={handleSubmit}>
        <div className="card" style={{ padding: 24 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            {}
            <div style={{ gridColumn: "1 / -1" }}>
              <label className="form-label">Zafiyet Adı *</label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Örn: SQL Injection, XSS, CSRF..."
                className="form-input light"
                required
              />
            </div>

            {}
            <div>
              <label className="form-label">CVE Numarası</label>
              <input
                type="text"
                name="cve"
                value={form.cve}
                onChange={handleChange}
                placeholder="CVE-2024-XXXX"
                className="form-input light"
              />
            </div>

            {}
            <div>
              <label className="form-label">Seviye *</label>
              <select name="risk" value={form.risk} onChange={handleChange} className="form-input light">
                {RISK_OPTIONS.map((r) => (
                  <option key={r.value} value={r.value}>{r.label}</option>
                ))}
              </select>
            </div>

            {}
            <div>
              <label className="form-label">CVSS Skoru</label>
              <input
                type="text"
                name="cvss_score"
                value={form.cvss_score}
                onChange={handleChange}
                placeholder="0.0 - 10.0"
                className="form-input light"
              />
            </div>

            {}
            <div>
              <label className="form-label">Hedef IP</label>
              <input
                type="text"
                name="target_ip"
                value={form.target_ip}
                onChange={handleChange}
                placeholder="192.168.1.100"
                className="form-input light"
              />
            </div>

            {}
            <div>
              <label className="form-label">Port</label>
              <input
                type="text"
                name="port"
                value={form.port}
                onChange={handleChange}
                placeholder="443"
                className="form-input light"
              />
            </div>

            {}
            <div>
              <label className="form-label">Servis</label>
              <input
                type="text"
                name="service"
                value={form.service}
                onChange={handleChange}
                placeholder="https, ssh, ftp..."
                className="form-input light"
              />
            </div>

            {}
            <div style={{ gridColumn: "1 / -1" }}>
              <label className="form-label">Açıklama</label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Zafiyet hakkında detaylı açıklama yazın..."
                className="form-input light"
                rows={4}
                style={{ resize: "vertical" }}
              />
            </div>

            {}
            <div style={{ gridColumn: "1 / -1" }}>
              <label className="form-label">Çözüm Önerisi</label>
              <textarea
                name="solution"
                value={form.solution}
                onChange={handleChange}
                placeholder="Zafiyetin çözümü için önerilen adımlar..."
                className="form-input light"
                rows={3}
                style={{ resize: "vertical" }}
              />
            </div>
          </div>

          {}
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 24 }}>
            <button
              type="button"
              onClick={() => navigate("/vulnlist")}
              className="btn btn-secondary"
            >
              İptal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
              style={{ minWidth: 140 }}
            >
              {loading ? "Ekleniyor..." : "Zafiyet Ekle"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

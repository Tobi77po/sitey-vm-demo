import React, { useEffect, useState } from "react";
import axios from "../api";

export default function OpenVASScan() {
  const [target, setTarget] = useState("");
  const [jobs, setJobs] = useState([]);
  const [scanning, setScanning] = useState(false);
  const [activeJobId, setActiveJobId] = useState(null);
  const [pollInterval, setPollInterval] = useState(null);

  useEffect(() => {
    loadJobs();
  }, []);

  const loadJobs = () => {
    axios.get("/api/scan/openvas/jobs").then((res) => setJobs(res.data || [])).catch(() => {});
  };

  useEffect(() => {
    if (!activeJobId) return;
    const interval = setInterval(() => {
      axios
        .get(`/api/scan/openvas/status/${activeJobId}`)
        .then((res) => {
          const job = res.data;
          setJobs((prev) => prev.map((j) => (j.id === job.id ? job : j)));
          if (job.status === "completed" || job.status === "failed") {
            setActiveJobId(null);
            setScanning(false);
            clearInterval(interval);
            loadJobs();
          }
        })
        .catch(() => {});
    }, 2000);
    return () => clearInterval(interval);
  }, [activeJobId]);

  const startScan = async (e) => {
    e.preventDefault();
    if (!target.trim()) return;
    setScanning(true);
    try {
      const res = await axios.post("/api/scan/openvas/start", { target: target.trim() });
      setActiveJobId(res.data.id);
      setJobs((prev) => [res.data, ...prev]);
      setTarget("");
    } catch (err) {
      alert("Tarama başlatılamadı: " + (err.response?.data?.detail || "Hata"));
      setScanning(false);
    }
  };

  return (
    <div>
      {}
      <div className="card" style={{ marginBottom: 20 }}>
        <div className="card-header">
          <span className="card-title">🔍 OpenVAS Tarama Başlat</span>
        </div>
        <form onSubmit={startScan} style={{ display: "flex", gap: 12, alignItems: "flex-end" }}>
          <div style={{ flex: 1 }}>
            <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: "var(--gray-700)", marginBottom: 4 }}>
              Hedef IP / Ağ
            </label>
            <input
              className="form-input light"
              placeholder="Örn: 192.168.1.0/24 veya 10.0.0.1"
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              disabled={scanning}
            />
          </div>
          <button type="submit" className="btn btn-primary" disabled={scanning || !target.trim()} style={{ height: 42 }}>
            {scanning ? (
              <>
                <span style={{ display: "inline-block", animation: "spin 1s linear infinite" }}>⏳</span>
                Taranıyor...
              </>
            ) : (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <circle cx="11" cy="11" r="8" />
                  <path d="M21 21l-4.35-4.35" />
                </svg>
                Taramayı Başlat
              </>
            )}
          </button>
        </form>
        <p style={{ marginTop: 8, fontSize: 12, color: "var(--gray-400)" }}>
          Demo modunda tarama simüle edilir. Gerçek OpenVAS entegrasyonu Kurumsal sürümde mevcuttur.
        </p>
      </div>

      {}
      {activeJobId && (
        <div className="card" style={{ marginBottom: 20 }}>
          <div className="card-header">
            <span className="card-title">⏳ Aktif Tarama</span>
          </div>
          {jobs
            .filter((j) => j.id === activeJobId)
            .map((job) => (
              <div key={job.id}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                  <span style={{ fontSize: 13, fontWeight: 500 }}>{job.target}</span>
                  <span style={{ fontSize: 12, color: "var(--gray-500)" }}>%{job.progress}</span>
                </div>
                <div style={{
                  width: "100%",
                  height: 8,
                  background: "var(--gray-100)",
                  borderRadius: 4,
                  overflow: "hidden",
                }}>
                  <div style={{
                    width: `${job.progress}%`,
                    height: "100%",
                    background: "linear-gradient(90deg, var(--brand-500), var(--brand-600))",
                    borderRadius: 4,
                    transition: "width 0.5s ease",
                  }} />
                </div>
              </div>
            ))}
        </div>
      )}

      {}
      <div className="card">
        <div className="card-header">
          <span className="card-title">📋 Tarama Geçmişi</span>
        </div>
        {jobs.length === 0 ? (
          <div style={{ textAlign: "center", padding: 40, color: "var(--gray-400)" }}>
            Henüz tarama yapılmadı.
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Hedef</th>
                <th>Durum</th>
                <th>İlerleme</th>
                <th>Sonuç</th>
                <th>Başlangıç</th>
                <th>Tamamlanma</th>
              </tr>
            </thead>
            <tbody>
              {jobs.map((job) => (
                <tr key={job.id} style={{ cursor: "default" }}>
                  <td style={{ fontFamily: "monospace", fontSize: 12 }}>{job.target}</td>
                  <td>
                    <span style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 4,
                      padding: "2px 8px",
                      borderRadius: 6,
                      fontSize: 11,
                      fontWeight: 600,
                      background: job.status === "completed" ? "var(--green-50)" :
                                 job.status === "running" ? "var(--yellow-50)" :
                                 job.status === "failed" ? "var(--red-50)" : "var(--gray-100)",
                      color: job.status === "completed" ? "var(--green-600)" :
                             job.status === "running" ? "#92400e" :
                             job.status === "failed" ? "var(--red-600)" : "var(--gray-500)",
                    }}>
                      {job.status === "completed" ? "✅ Tamamlandı" :
                       job.status === "running" ? "⏳ Devam Ediyor" :
                       job.status === "failed" ? "❌ Başarısız" : job.status}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ width: 60, height: 6, background: "var(--gray-100)", borderRadius: 3, overflow: "hidden" }}>
                        <div style={{ width: `${job.progress}%`, height: "100%", background: "var(--brand-500)", borderRadius: 3 }} />
                      </div>
                      <span style={{ fontSize: 11, color: "var(--gray-500)" }}>{job.progress}%</span>
                    </div>
                  </td>
                  <td>{job.result_count || 0} zafiyet</td>
                  <td style={{ fontSize: 12, color: "var(--gray-500)" }}>
                    {job.created_at ? new Date(job.created_at).toLocaleString("tr-TR") : "—"}
                  </td>
                  <td style={{ fontSize: 12, color: "var(--gray-500)" }}>
                    {job.completed_at ? new Date(job.completed_at).toLocaleString("tr-TR") : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

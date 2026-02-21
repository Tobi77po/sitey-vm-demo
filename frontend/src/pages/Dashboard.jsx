import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../api";
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";

const RISK_COLORS = {
  Critical: "#ef4444",
  High: "#f97316",
  Medium: "#eab308",
  Low: "#3b82f6",
  Info: "#9ca3af",
};

const STATUS_LABELS = {
  open: "Açık",
  in_progress: "Devam Ediyor",
  resolved: "Çözüldü",
  false_positive: "Yanlış Pozitif",
};

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get("/api/vuln/dashboard_stats")
      .then((res) => setStats(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "60vh" }}>
        <div style={{ textAlign: "center", color: "var(--gray-400)" }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>⏳</div>
          <div>Veriler yükleniyor...</div>
        </div>
      </div>
    );
  }

  if (!stats) return <div>Veri yüklenemedi.</div>;

  const riskData = Object.entries(stats.by_risk || {}).map(([name, value]) => ({
    name,
    value,
    color: RISK_COLORS[name] || "#9ca3af",
  }));

  const statusData = Object.entries(stats.by_status || {}).map(([key, value]) => ({
    name: STATUS_LABELS[key] || key,
    value,
  }));

  return (
    <div>
      {}
      <div className="stats-grid">
        <div className="stat-card total">
          <span className="stat-label">Toplam Zafiyet</span>
          <span className="stat-value">{stats.total}</span>
        </div>
        <div className="stat-card critical">
          <span className="stat-label">Kritik</span>
          <span className="stat-value">{stats.by_risk?.Critical || 0}</span>
        </div>
        <div className="stat-card high">
          <span className="stat-label">Yüksek</span>
          <span className="stat-value">{stats.by_risk?.High || 0}</span>
        </div>
        <div className="stat-card medium">
          <span className="stat-label">Orta</span>
          <span className="stat-value">{stats.by_risk?.Medium || 0}</span>
        </div>
        <div className="stat-card low">
          <span className="stat-label">Düşük</span>
          <span className="stat-value">{stats.by_risk?.Low || 0}</span>
        </div>
        <div className="stat-card info">
          <span className="stat-label">Bilgi</span>
          <span className="stat-value">{stats.by_risk?.Info || 0}</span>
        </div>
      </div>

      {}
      <div className="chart-grid">
        {}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Seviye Dağılımı</span>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={riskData.filter((d) => d.value > 0)}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={3}
                dataKey="value"
                label={({ name, value }) => `${name}: ${value}`}
              >
                {riskData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Seviye Bazlı Dağılım</span>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={riskData}>
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                {riskData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {}
      <div className="card" style={{ marginTop: 16 }}>
        <div className="card-header">
          <span className="card-title">Son Tespit Edilen Zafiyetler</span>
          <button className="btn btn-secondary" onClick={() => navigate("/vulnlist")}>
            Tümünü Gör →
          </button>
        </div>
        <table className="data-table">
          <thead>
            <tr>
              <th>Zafiyet</th>
              <th>CVE</th>
              <th>Seviye</th>
              <th>IP</th>
              <th>Port</th>
              <th>Durum</th>
            </tr>
          </thead>
          <tbody>
            {(stats.recent_vulns || []).map((v) => (
              <tr key={v.id} onClick={() => navigate(`/vuln/${v.id}`)}>
                <td style={{ fontWeight: 500, maxWidth: 300, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {v.name || v.cve || "İsimsiz"}
                </td>
                <td style={{ fontFamily: "monospace", fontSize: 12 }}>{v.cve || "—"}</td>
                <td>
                  <span className={`risk-badge ${v.risk?.toLowerCase()}`}>{v.risk}</span>
                </td>
                <td style={{ fontFamily: "monospace", fontSize: 12 }}>{v.target_ip || "—"}</td>
                <td>{v.port || "—"}</td>
                <td>
                  <span className={`status-badge ${v.status}`}>
                    {STATUS_LABELS[v.status] || v.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {}
      <div style={{
        marginTop: 24,
        padding: "16px 20px",
        background: "linear-gradient(135deg, var(--brand-50), #faf5ff)",
        borderRadius: 12,
        border: "1px solid var(--brand-100)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}>
        <div>
          <div style={{ fontSize: 14, fontWeight: 600, color: "var(--gray-900)", marginBottom: 2 }}>
            🚀 Kurumsal Sürüme Yükseltin
          </div>
          <div style={{ fontSize: 12, color: "var(--gray-500)" }}>
            AI Asistan, Agent Yönetimi, Yama Yönetimi, Takım İş Akışı ve daha fazlası...
          </div>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <a href="https://siteyvm.com" target="_blank" rel="noopener noreferrer" className="btn btn-primary" style={{ textDecoration: "none" }}>
            🌐 siteyvm.com
          </a>
          <a href="mailto:satis@siteyvm.com" className="btn btn-secondary" style={{ textDecoration: "none" }}>
            📧 İletişim
          </a>
        </div>
      </div>
    </div>
  );
}

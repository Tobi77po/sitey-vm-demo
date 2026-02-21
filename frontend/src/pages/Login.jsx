import React, { useState } from "react";
import axios from "../api";
import logoImg from "../LOGO.png";

export default function Login({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await axios.post("/api/auth/login", { username, password });
      if (res.data?.access_token) {
        localStorage.setItem("token", res.data.access_token);
        localStorage.setItem("username", username);
        onLogin();
      } else {
        setError("Geçersiz sunucu yanıtı");
      }
    } catch (err) {
      if (err.response?.status === 401) setError("Kullanıcı adı veya şifre hatalı");
      else if (err.response?.status === 403) setError("Hesap pasif durumda");
      else setError("Sunucuya bağlanılamadı");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      {}
      <div className="login-bg-decoration">
        <div className="login-bg-circle c1" />
        <div className="login-bg-circle c2" />
        <div className="login-bg-circle c3" />
        <div className="login-dot d1" />
        <div className="login-dot d2" />
        <div className="login-dot d3" />
      </div>

      <div style={{ position: "relative", width: "100%", maxWidth: 420 }}>
        {}
        <div className="login-card">
          {}
          <div style={{ textAlign: "center", marginBottom: 12 }}>
            <div style={{ display: "flex", justifyContent: "center", marginBottom: 12 }}>
              <img src={logoImg} alt="SİTEY Logo" className="login-logo" />
            </div>
            <span className="demo-badge">DEMO SÜRÜMÜ</span>
          </div>
          <h1>SİTEY</h1>
          <p className="subtitle">Zafiyet Yönetim Platformu</p>

          {}
          {error && (
            <div className="error-msg">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} style={{ flexShrink: 0 }}>
                <circle cx="12" cy="12" r="10" />
                <path d="M12 8v4m0 4h.01" />
              </svg>
              {error}
            </div>
          )}

          {}
          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label>Kullanıcı Adı</label>
              <div className="input-wrapper">
                <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
                <input
                  type="text"
                  className="form-input"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="admin"
                  autoFocus
                  required
                />
              </div>
            </div>
            <div className="form-group">
              <label>Şifre</label>
              <div className="input-wrapper">
                <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <rect x="3" y="11" width="18" height="11" rx="2" />
                  <path d="M7 11V7a5 5 0 0110 0v4" />
                </svg>
                <input
                  type="password"
                  className="form-input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>
            <button type="submit" className="login-btn" disabled={loading}>
              {loading ? (
                <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                  <svg style={{ width: 18, height: 18, animation: "spin 1s linear infinite" }} viewBox="0 0 24 24" fill="none">
                    <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Giriş yapılıyor...
                </span>
              ) : (
                <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                    <path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4M10 17l5-5-5-5M15 12H3" />
                  </svg>
                  Giriş Yap
                </span>
              )}
            </button>
          </form>

          {}
          <div style={{
            marginTop: 28, textAlign: "center",
            borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: 20
          }}>
            <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 12, marginBottom: 10 }}>
              Tüm özellikler için kurumsal sürüme yükseltin
            </p>
            <div style={{ display: "flex", justifyContent: "center", gap: 20 }}>
              <a href="https://siteyvm.com" target="_blank" rel="noopener noreferrer"
                style={{ color: "rgba(255,255,255,0.6)", fontSize: 13, textDecoration: "none", fontWeight: 600 }}>
                🌐 siteyvm.com
              </a>
              <a href="mailto:satis@siteyvm.com"
                style={{ color: "rgba(255,255,255,0.6)", fontSize: 13, textDecoration: "none", fontWeight: 600 }}>
                📧 satis@siteyvm.com
              </a>
            </div>
          </div>
        </div>

        {}
        <div style={{ marginTop: 24, textAlign: "center" }}>
          <span className="security-badge">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              <path d="M9 12l2 2 4-4" />
            </svg>
            Güvenli Bağlantı
          </span>
        </div>
      </div>

      {}
      <div style={{ position: "absolute", top: 80, left: 80, width: 2, height: 2, borderRadius: "50%", background: "white", opacity: 0.5, animation: "pulseGlow 4s infinite 3s" }} />
      <div style={{ position: "absolute", bottom: 80, right: 80, width: 2, height: 2, borderRadius: "50%", background: "#a78bfa", opacity: 0.5, animation: "pulseGlow 4s infinite 4s" }} />
    </div>
  );
}

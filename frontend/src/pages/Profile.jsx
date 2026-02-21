import React, { useState } from "react";
import axios from "../api";

export default function Profile() {
  const username = localStorage.getItem("username") || "admin";

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pwStatus, setPwStatus] = useState(null);
  const [pwLoading, setPwLoading] = useState(false);

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPwStatus(null);
    if (newPassword !== confirmPassword) {
      setPwStatus({ type: "error", msg: "Yeni şifreler eşleşmiyor" });
      return;
    }
    if (newPassword.length < 6) {
      setPwStatus({ type: "error", msg: "Şifre en az 6 karakter olmalı" });
      return;
    }
    setPwLoading(true);
    try {
      await axios.post("/api/auth/change-password", {
        current_password: currentPassword,
        new_password: newPassword,
      });
      setPwStatus({ type: "success", msg: "Şifre başarıyla değiştirildi" });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setPwStatus({ type: "error", msg: err.response?.data?.detail || "Şifre değiştirilemedi" });
    } finally {
      setPwLoading(false);
    }
  };

  return (
    <div className="profile-grid">
      {}
      <div className="card">
        <div className="card-header">
          <span className="card-title">👤 Profil Bilgileri</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24 }}>
          <div style={{
            width: 64,
            height: 64,
            borderRadius: "50%",
            background: "linear-gradient(135deg, var(--brand-500), var(--purple-600))",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
            fontSize: 24,
            fontWeight: 700,
          }}>
            {username.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <div style={{ fontSize: 18, fontWeight: 700, color: "var(--gray-900)" }}>{username}</div>
            <div style={{ fontSize: 13, color: "var(--gray-500)" }}>Demo Kullanıcı</div>
          </div>
        </div>

        <div style={{ display: "grid", gap: 12 }}>
          <InfoRow label="Kullanıcı Adı" value={username} />
          <InfoRow label="Rol" value="Admin" />
          <InfoRow label="Durum" value="Aktif" />
        </div>
      </div>

      {}
      <div className="card">
        <div className="card-header">
          <span className="card-title">🔑 Şifre Değiştir</span>
        </div>
        
        {pwStatus && (
          <div style={{
            padding: "8px 12px",
            borderRadius: 8,
            marginBottom: 16,
            fontSize: 13,
            background: pwStatus.type === "success" ? "var(--green-50)" : "var(--red-50)",
            color: pwStatus.type === "success" ? "var(--green-600)" : "var(--red-600)",
            border: `1px solid ${pwStatus.type === "success" ? "#bbf7d0" : "var(--red-100)"}`,
          }}>
            {pwStatus.msg}
          </div>
        )}

        <form onSubmit={handlePasswordChange}>
          <div className="form-group">
            <label style={{ color: "var(--gray-700)", fontSize: 13, fontWeight: 500, display: "block", marginBottom: 4 }}>
              Mevcut Şifre
            </label>
            <input
              type="password"
              className="form-input light"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label style={{ color: "var(--gray-700)", fontSize: 13, fontWeight: 500, display: "block", marginBottom: 4 }}>
              Yeni Şifre
            </label>
            <input
              type="password"
              className="form-input light"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label style={{ color: "var(--gray-700)", fontSize: 13, fontWeight: 500, display: "block", marginBottom: 4 }}>
              Yeni Şifre (Tekrar)
            </label>
            <input
              type="password"
              className="form-input light"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary" disabled={pwLoading} style={{ width: "100%" }}>
            {pwLoading ? "Değiştiriliyor..." : "Şifreyi Değiştir"}
          </button>
        </form>
      </div>

      {}
      <div className="card">
        <div className="card-header">
          <span className="card-title">📋 Lisans Bilgileri</span>
        </div>
        <div style={{
          padding: "20px",
          background: "linear-gradient(135deg, var(--brand-50), #faf5ff)",
          borderRadius: 10,
          border: "1px solid var(--brand-100)",
          textAlign: "center",
        }}>
          <div style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            background: "var(--brand-600)",
            color: "white",
            padding: "4px 14px",
            borderRadius: 20,
            fontSize: 12,
            fontWeight: 600,
            marginBottom: 12,
          }}>
            ✨ Ücretsiz Lisans
          </div>
          <div style={{ display: "grid", gap: 8, marginTop: 8 }}>
            <InfoRow label="Plan" value="Demo (Ücretsiz)" />
            <InfoRow label="Süre" value="Süresiz" />
            <InfoRow label="Kullanıcı Limiti" value="1" />
            <InfoRow label="Özellikler" value="Dashboard, Zafiyet Listesi, Detay, Rapor, OpenVAS Tarama" />
          </div>
        </div>
        <div style={{ marginTop: 16, textAlign: "center" }}>
          <p style={{ fontSize: 13, color: "var(--gray-500)", marginBottom: 12 }}>
            Tüm özelliklere erişmek için kurumsal sürüme yükseltin
          </p>
          <div style={{ display: "flex", justifyContent: "center", gap: 12 }}>
            <a href="https://siteyvm.com" target="_blank" rel="noopener noreferrer" className="btn btn-primary" style={{ textDecoration: "none" }}>
              🌐 siteyvm.com
            </a>
            <a href="mailto:satis@siteyvm.com" className="btn btn-secondary" style={{ textDecoration: "none" }}>
              📧 satis@siteyvm.com
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid var(--gray-50)" }}>
      <span style={{ fontSize: 13, color: "var(--gray-500)" }}>{label}</span>
      <span style={{ fontSize: 13, fontWeight: 500, color: "var(--gray-900)" }}>{value}</span>
    </div>
  );
}

import React, { useState, useEffect, useRef, useCallback } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import axios from "../api";
import logoImg from "../LOGO.png";

const NAV_SECTIONS = [
  {
    title: "Gösterge Paneli",
    items: [
      { label: "Dashboard", href: "/dashboard", icon: "squares", active: true },
      { label: "Zafiyet Listesi", href: "/vulnlist", icon: "shield", active: true },
      { label: "Atak Yüzeyi", href: "/asm", icon: "globe", locked: true },
    ],
  },
  {
    title: "Operasyonlar",
    items: [
      { label: "OpenVAS İçe Aktar", href: "/openvas-import", icon: "upload", active: true },
      { label: "Tarama Araçları", href: "/scantools", icon: "wrench", locked: true },
      { label: "Sonuç İçe Aktar", href: "/scans", icon: "upload", locked: true },
      { label: "Agent Yönetimi", href: "/agents", icon: "computer", locked: true },
      { label: "Yama Yönetimi", href: "/patch-management", icon: "patch", locked: true },
      { label: "Varlık Grupları", href: "/group-management", icon: "group", locked: true },
    ],
  },
  {
    title: "İş Birliği",
    items: [
      { label: "Takım İş Akışı", href: "/team-workflow", icon: "flow", locked: true },
      { label: "Görev Yönetimi", href: "/task-management", icon: "task", locked: true },
      { label: "Süreç Yönetimi", href: "/process-management", icon: "process", locked: true },
      { label: "AI Asistan", href: "/security-assistant", icon: "ai", locked: true },
      { label: "AI Değerlendirme", href: "/ai-triage", icon: "ai", locked: true },
    ],
  },
  {
    title: "Platform",
    items: [
      { label: "Zafiyet Ekle", href: "/manual-vuln-add", icon: "plus", active: true },
      { label: "Entegrasyonlar", href: "/integrations", icon: "puzzle", locked: true },
      { label: "Kullanıcılar", href: "/users", icon: "users", locked: true },
    ],
  },
];

function getIcon(name) {
  const icons = {
    squares: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
    shield: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <path d="M9 12l2 2 4-4" />
      </svg>
    ),
    globe: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
        <circle cx="12" cy="12" r="10" />
        <path d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
      </svg>
    ),
    scan: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
        <circle cx="11" cy="11" r="8" />
        <path d="M21 21l-4.35-4.35" />
        <path d="M11 8v6M8 11h6" />
      </svg>
    ),
    wrench: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
        <path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z" />
      </svg>
    ),
    upload: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
        <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" />
      </svg>
    ),
    computer: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
        <rect x="2" y="3" width="20" height="14" rx="2" />
        <path d="M8 21h8M12 17v4" />
      </svg>
    ),
    patch: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
        <path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z" />
      </svg>
    ),
    group: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <path d="M3 9h18M9 21V9" />
      </svg>
    ),
    flow: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
        <path d="M17 1l4 4-4 4" />
        <path d="M3 11V9a4 4 0 014-4h14M7 23l-4-4 4-4" />
        <path d="M21 13v2a4 4 0 01-4 4H3" />
      </svg>
    ),
    task: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
        <path d="M9 11l3 3L22 4" />
        <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
      </svg>
    ),
    process: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
      </svg>
    ),
    ai: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
      </svg>
    ),
    puzzle: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
        <path d="M20 7h-4V3a1 1 0 00-1-1h-2.5a1 1 0 00-.8.4l-.7.9a1.5 1.5 0 01-2.4 0l-.7-.9A1 1 0 007.1 2H5a1 1 0 00-1 1v4H1a1 1 0 00-1 1v2.5a1 1 0 00.4.8l.9.7a1.5 1.5 0 010 2.4l-.9.7a1 1 0 00-.4.8V18a1 1 0 001 1h4v3a1 1 0 001 1h10a1 1 0 001-1V8a1 1 0 00-1-1z" />
      </svg>
    ),
    plus: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
        <circle cx="12" cy="12" r="10" />
        <path d="M12 8v8M8 12h8" />
      </svg>
    ),
    users: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
      </svg>
    ),
  };
  return icons[name] || icons.squares;
}

export default function Layout({ children, onLogout }) {
  const location = useLocation();
  const navigate = useNavigate();
  const username = localStorage.getItem("username") || "Admin";

  const [notifications, setNotifications] = useState([]);
  const [showNotifPanel, setShowNotifPanel] = useState(false);
  const notifRef = useRef(null);

  const getSeenIds = useCallback(() => {
    try {
      return JSON.parse(localStorage.getItem("seen_notifications") || "[]");
    } catch { return []; }
  }, []);

  const markAsSeen = useCallback((id) => {
    const seen = getSeenIds();
    if (!seen.includes(id)) {
      seen.push(id);
      localStorage.setItem("seen_notifications", JSON.stringify(seen));
    }
    setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, seen: true } : n));
  }, [getSeenIds]);

  const markAllSeen = useCallback(() => {
    const seen = getSeenIds();
    const allIds = notifications.map((n) => n.id);
    const merged = [...new Set([...seen, ...allIds])];
    localStorage.setItem("seen_notifications", JSON.stringify(merged));
    setNotifications((prev) => prev.map((n) => ({ ...n, seen: true })));
  }, [notifications, getSeenIds]);

  useEffect(() => {
    const fetchNotifications = () => {
      axios.get("/api/notifications/blog")
        .then((res) => {
          const posts = res.data?.notifications || [];
          const seen = getSeenIds();
          setNotifications(
            posts.map((n) => ({ ...n, seen: seen.includes(n.id) }))
          );
        })
        .catch(() => {});
    };
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 86400000);
    return () => clearInterval(interval);
  }, [getSeenIds]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifPanel(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const unseenCount = notifications.filter((n) => !n.seen).length;

  return (
    <div className="layout-root">
      {}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <img src={logoImg} alt="SİTEY-VM Logo" className="sidebar-logo-img" />
          <div className="sidebar-logo-text">
            <h1>SİTEY-VM</h1>
            <span>Demo Sürümü</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          {NAV_SECTIONS.map((section) => (
            <div key={section.title} className="sidebar-section">
              <div className="sidebar-section-title">{section.title}</div>
              {section.items.map((item) => (
                <NavLink
                  key={item.href}
                  to={item.href}
                  className={({ isActive }) =>
                    `sidebar-link ${isActive || (item.href === "/dashboard" && location.pathname === "/") ? "active" : ""}`
                  }
                >
                  {getIcon(item.icon)}
                  <span>{item.label}</span>
                  {item.locked && <span className="lock-badge">🔒 PRO</span>}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        {}
        <div className="sidebar-footer">
          <div className="sidebar-footer-inner">
            <div className="version">Demo Sürümü v1.0.0</div>
            <div>Kurumsal sürüm için:</div>
            <a href="https://siteyvm.com" target="_blank" rel="noopener noreferrer">
              siteyvm.com
            </a>
            {" · "}
            <a href="mailto:satis@siteyvm.com">
              satis@siteyvm.com
            </a>
          </div>
        </div>
      </aside>

      {}
      <div className="content-area">
        {}
        <header className="topbar">
          <div className="topbar-left">
            <div className="topbar-badge">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" />
              </svg>
              Demo
            </div>
            <div className="topbar-page-info">
              <h2>{getPageTitle(location.pathname)}</h2>
            </div>
          </div>

          <div className="topbar-right">
            {}
            <div className="notif-wrapper" ref={notifRef}>
              <button
                className="topbar-btn notif-bell"
                onClick={() => setShowNotifPanel(!showNotifPanel)}
                title="Bildirimler"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
                  <path d="M13.73 21a2 2 0 01-3.46 0" />
                </svg>
                {unseenCount > 0 && (
                  <span className="notif-badge">{unseenCount}</span>
                )}
              </button>

              {}
              {showNotifPanel && (
                <div className="notif-panel">
                  <div className="notif-panel-header">
                    <span className="notif-panel-title">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                        <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
                        <path d="M13.73 21a2 2 0 01-3.46 0" />
                      </svg>
                      SİTEY-VM Haberler
                    </span>
                    {unseenCount > 0 && (
                      <button className="notif-mark-all" onClick={markAllSeen}>
                        Tümünü Okundu İşaretle
                      </button>
                    )}
                  </div>

                  <div className="notif-panel-body">
                    {notifications.length === 0 ? (
                      <div className="notif-empty">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} style={{ color: "var(--gray-300)", marginBottom: 8 }}>
                          <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
                          <path d="M13.73 21a2 2 0 01-3.46 0" />
                        </svg>
                        <p>Henüz bildirim yok</p>
                      </div>
                    ) : (
                      notifications.map((notif) => (
                        <a
                          key={notif.id}
                          href={notif.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`notif-item ${notif.seen ? "seen" : "unseen"}`}
                          onClick={() => markAsSeen(notif.id)}
                        >
                          <div className="notif-item-icon">
                            {notif.category === "Duyuru" ? "📢" :
                             notif.category === "Ürün" ? "🚀" :
                             notif.category === "Hizmetler" ? "🛡️" :
                             notif.category === "Güncelleme" ? "✨" : "📰"}
                          </div>
                          <div className="notif-item-content">
                            <div className="notif-item-title">{notif.title}</div>
                            <div className="notif-item-summary">{notif.summary}</div>
                            <div className="notif-item-meta">
                              <span className="notif-item-category">{notif.category}</span>
                              {notif.date && (
                                <span className="notif-item-date">
                                  {new Date(notif.date).toLocaleDateString("tr-TR")}
                                </span>
                              )}
                            </div>
                          </div>
                          {!notif.seen && <span className="notif-dot" />}
                        </a>
                      ))
                    )}
                  </div>

                  <div className="notif-panel-footer">
                    <a href="https://siteyvm.com" target="_blank" rel="noopener noreferrer">
                      siteyvm.com'da daha fazlası →
                    </a>
                  </div>
                </div>
              )}
            </div>

            <button className="topbar-btn" onClick={() => navigate("/profile")}>
              <div className="user-avatar">{username.slice(0, 2).toUpperCase()}</div>
              <span>{username}</span>
            </button>
            <button className="topbar-btn logout" onClick={onLogout}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" />
              </svg>
              Çıkış
            </button>
          </div>
        </header>

        <main className="main-content">
          {children}
        </main>
      </div>
    </div>
  );
}

function getPageTitle(path) {
  const titles = {
    "/": "Executive Overview",
    "/dashboard": "Executive Overview",
    "/vulnlist": "Zafiyet Kütüphanesi",
    "/openvas-import": "OpenVAS İçe Aktar",
    "/manual-vuln-add": "Manuel Zafiyet Ekle",
    "/profile": "Profil",
  };
  if (path.startsWith("/vuln/")) return "Zafiyet Detayı";
  return titles[path] || "Kurumsal Sürüm";
}

import React, { useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import VulnerabilityList from "./pages/VulnerabilityList";
import VulnerabilityDetail from "./pages/VulnerabilityDetail";
import Profile from "./pages/Profile";
import EnterprisePage from "./pages/EnterprisePage";
import ManualVulnAdd from "./pages/ManualVulnAdd";
import ManualVulnEdit from "./pages/ManualVulnEdit";
import OpenVASImport from "./pages/OpenVASImport";

function App() {
  const [loggedIn, setLoggedIn] = useState(!!localStorage.getItem("token"));

  if (!loggedIn) {
    return <Login onLogin={() => setLoggedIn(true)} />;
  }

  return (
    <Layout
      onLogout={() => {
        localStorage.removeItem("token");
        localStorage.removeItem("username");
        setLoggedIn(false);
      }}
    >
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/vulnlist" element={<VulnerabilityList />} />
        <Route path="/vuln/:id" element={<VulnerabilityDetail />} />
        <Route path="/vuln/:id/edit" element={<ManualVulnEdit />} />
        <Route path="/manual-vuln-add" element={<ManualVulnAdd />} />
        <Route path="/openvas-import" element={<OpenVASImport />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/scantools" element={<EnterprisePage feature="Tarama Araclari Yonetimi" />} />
        <Route path="/agents" element={<EnterprisePage feature="Agent Yönetimi" />} />
        <Route path="/users" element={<EnterprisePage feature="Kullanıcı Yönetimi" />} />
        <Route path="/scans" element={<EnterprisePage feature="Tarama Sonuçları İçe Aktarma" />} />
        <Route path="/asm" element={<EnterprisePage feature="Atak Yüzey Yönetimi (ASM)" />} />
        <Route path="/group-management" element={<EnterprisePage feature="Varlık Grup Yönetimi" />} />
        <Route path="/team-workflow" element={<EnterprisePage feature="Takım İş Akışı" />} />
        <Route path="/task-management" element={<EnterprisePage feature="Görev Yönetimi" />} />
        <Route path="/process-management" element={<EnterprisePage feature="Süreç Yönetimi" />} />
        <Route path="/integrations" element={<EnterprisePage feature="Entegrasyonlar" />} />
        <Route path="/patch-management" element={<EnterprisePage feature="Yama Yönetimi" />} />
        <Route path="/security-assistant" element={<EnterprisePage feature="AI Güvenlik Asistanı" />} />
        <Route path="/ai-triage" element={<EnterprisePage feature="AI Zafiyet Değerlendirme" />} />
        <Route path="/ai-daily-summary" element={<EnterprisePage feature="AI Günlük Özet" />} />
        <Route path="/ai-command-center" element={<EnterprisePage feature="AI Kontrol Merkezi" />} />
        <Route path="/notifications" element={<EnterprisePage feature="Bildirim Yönetimi" />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Layout>
  );
}

export default App;

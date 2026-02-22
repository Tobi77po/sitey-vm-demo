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
        <Route path="/scantools" element={<EnterprisePage feature="scantools" />} />
        <Route path="/agents" element={<EnterprisePage feature="agents" />} />
        <Route path="/users" element={<EnterprisePage feature="users" />} />
        <Route path="/scans" element={<EnterprisePage feature="scans" />} />
        <Route path="/asm" element={<EnterprisePage feature="asm" />} />
        <Route path="/group-management" element={<EnterprisePage feature="groups" />} />
        <Route path="/team-workflow" element={<EnterprisePage feature="workflow" />} />
        <Route path="/task-management" element={<EnterprisePage feature="tasks" />} />
        <Route path="/process-management" element={<EnterprisePage feature="process" />} />
        <Route path="/integrations" element={<EnterprisePage feature="integrations" />} />
        <Route path="/patch-management" element={<EnterprisePage feature="patch" />} />
        <Route path="/security-assistant" element={<EnterprisePage feature="ai_assistant" />} />
        <Route path="/ai-triage" element={<EnterprisePage feature="ai_triage" />} />
        <Route path="/ai-daily-summary" element={<EnterprisePage feature="ai_daily" />} />
        <Route path="/ai-command-center" element={<EnterprisePage feature="ai_control" />} />
        <Route path="/notifications" element={<EnterprisePage feature="notifications" />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Layout>
  );
}

export default App;

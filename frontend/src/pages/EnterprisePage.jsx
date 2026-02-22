import React from "react";
import { useI18n } from "../i18n";

const P = (d) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d={d}/>
  </svg>
);

const IC = {
  wrench: P("M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"),
  shield: P("M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"),
  zap: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>,
  search: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
  monitor: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>,
  users: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  upload: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/></svg>,
  globe: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>,
  layers: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>,
  gitBranch: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="6" y1="3" x2="6" y2="15"/><circle cx="18" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="M18 9a9 9 0 0 1-9 9"/></svg>,
  checkSquare: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>,
  settings: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>,
  puzzle: P("M20 16V7a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v9m16 0H4m16 0 1.28 2.55a1 1 0 0 1-.9 1.45H3.62a1 1 0 0 1-.9-1.45L4 16"),
  package: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="16.5" y1="9.4" x2="7.5" y2="4.21"/><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>,
  cpu: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6"/><line x1="9" y1="1" x2="9" y2="4"/><line x1="15" y1="1" x2="15" y2="4"/><line x1="9" y1="20" x2="9" y2="23"/><line x1="15" y1="20" x2="15" y2="23"/><line x1="20" y1="9" x2="23" y2="9"/><line x1="20" y1="14" x2="23" y2="14"/><line x1="1" y1="9" x2="4" y2="9"/><line x1="1" y1="14" x2="4" y2="14"/></svg>,
  barChart: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="20" x2="12" y2="10"/><line x1="18" y1="20" x2="18" y2="4"/><line x1="6" y1="20" x2="6" y2="16"/></svg>,
  sliders: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="4" y1="21" x2="4" y2="14"/><line x1="4" y1="10" x2="4" y2="3"/><line x1="12" y1="21" x2="12" y2="12"/><line x1="12" y1="8" x2="12" y2="3"/><line x1="20" y1="21" x2="20" y2="16"/><line x1="20" y1="12" x2="20" y2="3"/></svg>,
  bell: P("M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0"),
  target: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>,
  clock: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
  key: P("M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"),
  clipboard: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1"/></svg>,
  link: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>,
  send: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>,
  refresh: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>,
  trendingUp: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>,
  mail: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>,
  messageSquare: P("M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"),
  activity: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>,
  fileText: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>,
  lock: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>,
  eye: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>,
  check: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>,
  wifi: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.55a11 11 0 0 1 14.08 0"/><path d="M1.42 9a16 16 0 0 1 21.16 0"/><path d="M8.53 16.11a6 6 0 0 1 6.95 0"/><line x1="12" y1="20" x2="12.01" y2="20"/></svg>,
  server: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="8" rx="2"/><rect x="2" y="14" width="20" height="8" rx="2"/><line x1="6" y1="6" x2="6.01" y2="6"/><line x1="6" y1="18" x2="6.01" y2="18"/></svg>,
  crosshair: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="22" y1="12" x2="18" y2="12"/><line x1="6" y1="12" x2="2" y2="12"/><line x1="12" y1="6" x2="12" y2="2"/><line x1="12" y1="22" x2="12" y2="18"/></svg>,
  alertTriangle: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
};

const FEATURE_META = {
  "scantools": { icon: "wrench", gradient: "linear-gradient(135deg, #2563eb 0%, #10b981 100%)", colors: ["#2563eb","#10b981"], mockupType: "tools", highlightIcons: ["search","refresh","barChart","clock"] },
  "agents": { icon: "monitor", gradient: "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)", colors: ["#6366f1","#4f46e5"], mockupType: "agents", highlightIcons: ["wifi","server","crosshair","shield"] },
  "users": { icon: "users", gradient: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)", colors: ["#f59e0b","#d97706"], mockupType: "users", highlightIcons: ["lock","users","clipboard","key"] },
  "scans": { icon: "upload", gradient: "linear-gradient(135deg, #10b981 0%, #059669 100%)", colors: ["#10b981","#059669"], mockupType: "tools", highlightIcons: ["fileText","refresh","barChart","link"] },
  "asm": { icon: "globe", gradient: "linear-gradient(135deg, #7c3aed 0%, #8b5cf6 100%)", colors: ["#7c3aed","#8b5cf6"], mockupType: "asm", highlightIcons: ["globe","alertTriangle","zap"] },
  "groups": { icon: "layers", gradient: "linear-gradient(135deg, #ec4899 0%, #be185d 100%)", colors: ["#ec4899","#be185d"], mockupType: "tools", highlightIcons: ["layers","barChart","target","lock"] },
  "workflow": { icon: "gitBranch", gradient: "linear-gradient(135deg, #10b981 0%, #059669 100%)", colors: ["#10b981","#059669"], mockupType: "workflow", highlightIcons: ["clipboard","users","clock","trendingUp"] },
  "tasks": { icon: "checkSquare", gradient: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)", colors: ["#f59e0b","#d97706"], mockupType: "tasks", highlightIcons: ["clipboard","barChart","messageSquare","link"] },
  "process": { icon: "settings", gradient: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)", colors: ["#2563eb","#1d4ed8"], mockupType: "workflow", highlightIcons: ["fileText","refresh","barChart","trendingUp"] },
  "integrations": { icon: "puzzle", gradient: "linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)", colors: ["#8b5cf6","#7c3aed"], mockupType: "integrations", highlightIcons: ["checkSquare","link","upload","settings"] },
  "patch": { icon: "package", gradient: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)", colors: ["#ef4444","#dc2626"], mockupType: "tools", highlightIcons: ["search","shield","send","checkSquare"] },
  "ai_assistant": { icon: "cpu", gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", colors: ["#667eea","#764ba2"], mockupType: "ai", highlightIcons: ["messageSquare","cpu","fileText","search"] },
  "ai_triage": { icon: "zap", gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", colors: ["#667eea","#764ba2"], mockupType: "ai", highlightIcons: ["zap","target","barChart","trendingUp"] },
  "ai_daily": { icon: "barChart", gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", colors: ["#667eea","#764ba2"], mockupType: "ai", highlightIcons: ["activity","barChart","alertTriangle","trendingUp"] },
  "ai_control": { icon: "sliders", gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", colors: ["#667eea","#764ba2"], mockupType: "ai", highlightIcons: ["sliders","barChart","settings","eye"] },
  "notifications": { icon: "bell", gradient: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)", colors: ["#f97316","#ea580c"], mockupType: "notifications", highlightIcons: ["mail","settings","bell","barChart"] },
};

const MockupVisual = ({ type, colors, t }) => {
  const e = t.enterprise;
  const m = e.mockup;

  const scanners = ["Nessus","OpenVAS","Burp Suite","Acunetix","Nuclei","Nmap","ZAP","Checkmarx","Fortify","Qualys","Rapid7","Tenable","OWASP","Arachni","Intruder","MobSF"];
  const agentRows = [
    { name:"web-srv-01", ip:"10.0.1.10", os:"Ubuntu 22.04", status:"online" },
    { name:"db-srv-02", ip:"10.0.1.20", os:"CentOS 8", status:"online" },
    { name:"app-srv-03", ip:"10.0.2.15", os:"Windows 2022", status:"warning" },
    { name:"fw-edge-01", ip:"10.0.0.1", os:"PfSense", status:"online" },
    { name:"dev-ws-04", ip:"10.0.3.50", os:"macOS 14", status:"offline" },
  ];
  const userRows = [
    { name:"Ahmet Yilmaz", email:"ahmet@firma.com", role:"Admin", status:"active" },
    { name:"Elif Demir", email:"elif@firma.com", role:"Analist", status:"active" },
    { name:"Mehmet Kara", email:"mehmet@firma.com", role:"Muhendis", status:"active" },
    { name:"Zeynep Ak", email:"zeynep@firma.com", role:"Viewer", status:"pending" },
  ];
  const wfSteps = [e.detection, e.assessment, e.assignment, e.resolution, e.verification, e.closure];
  const aiMsgs = [
    { from:"user", text: m.aiUserMsg },
    { from:"ai", text: m.aiResponse },
  ];
  const asmAssets = [
    { name:"api.firma.com", type:"Web API", risk:"critical", riskLabel: t.dashboard.critical, ports:3 },
    { name:"mail.firma.com", type:"Mail Server", risk:"high", riskLabel: t.dashboard.high, ports:5 },
    { name:"vpn.firma.com", type:"VPN Gateway", risk:"medium", riskLabel: t.dashboard.medium, ports:2 },
    { name:"cdn.firma.com", type:"CDN", risk:"low", riskLabel: t.dashboard.low, ports:1 },
    { name:"dev.firma.com", type:"Development", risk:"high", riskLabel: t.dashboard.high, ports:8 },
  ];
  const kanbanCols = [
    { title: e.waiting, cards:["SQL Injection Fix","XSS Remediation"] },
    { title: e.ongoing, cards:["SSL Cert Renewal"] },
    { title: e.test, cards:["Firewall Rule Update"] },
    { title: e.completed, cards:["Log4j Patch","SSH Hardening"] },
  ];
  const integrationsList = ["Jira","ServiceNow","PagerDuty","Webhook","Email","Telegram","Grafana","GitLab","Bitbucket","Azure DevOps","Freshservice","Zendesk"];
  const notifChannels = [
    { channel:"E-posta", desc: m.notifEmail, on:true },
    { channel:"Slack", desc: m.notifSlack, on:true },
    { channel:"SMS", desc: m.notifSMS, on:true },
    { channel:"Webhook", desc: m.notifWebhook, on:false },
    { channel:"Teams", desc: m.notifTeams, on:true },
  ];

  const statusLabel = (s) => s === "online" ? e.online : s === "warning" ? e.warning : e.offline;
  const userStatusLabel = (s) => s === "active" ? e.active : e.pending;

  const c1 = colors?.[0] || "#2563eb";
  const c2 = colors?.[1] || "#10b981";
  const grad = `linear-gradient(135deg, ${c1}, ${c2})`;
  const grad45 = `linear-gradient(45deg, ${c1}, ${c2})`;
  const grad90 = `linear-gradient(90deg, ${c1}, ${c2})`;

  const chrome = (title, children) => (
    <div className="ep-mockup" style={{"--ep-c1": c1, "--ep-c2": c2}}>
      <div className="ep-mockup-chrome">
        <div className="ep-dots"><span className="ep-dot r"></span><span className="ep-dot y"></span><span className="ep-dot g"></span></div>
        <span className="ep-chrome-title">{title}</span>
      </div>
      <div className="ep-mock-body">{children}</div>
    </div>
  );

  if (type === "tools") return chrome(e.scanTools, <div className="ep-tool-grid">{scanners.map((s,i)=> <div key={i} className="ep-tool-chip"><span className="ep-tool-bullet" style={{animationDelay:`${i*0.1}s`, background: grad45}}></span>{s}</div>)}</div>);
  if (type === "agents") return chrome(e.agentStatus, <table className="ep-table"><thead><tr className="ep-table-head"><th>{e.server}</th><th>IP</th><th>OS</th><th>{t.vulnList.statusCol}</th></tr></thead><tbody>{agentRows.map((r,i)=> <tr key={i} className="ep-table-row" style={{animationDelay:`${i*0.08}s`}}><td className="ep-cell-name">{r.name}</td><td className="ep-cell-dim">{r.ip}</td><td className="ep-cell-dim">{r.os}</td><td><span className={`ep-status-pill ${r.status}`}>{statusLabel(r.status)}</span></td></tr>)}</tbody></table>);
  if (type === "users") return chrome(e.userMgmt, <table className="ep-table"><thead><tr className="ep-table-head"><th>{t.profile.username}</th><th>E-posta</th><th>{t.profile.role}</th><th>{t.vulnList.statusCol}</th></tr></thead><tbody>{userRows.map((r,i)=> <tr key={i} className="ep-table-row" style={{animationDelay:`${i*0.08}s`}}><td className="ep-cell-name"><span className="ep-avatar" style={{background: grad45}}>{r.name.charAt(0)}</span>{r.name}</td><td className="ep-cell-dim">{r.email}</td><td><span className="ep-role-tag">{r.role}</span></td><td><span className={`ep-status-pill ${r.status==="active"?"online":"warning"}`}>{userStatusLabel(r.status)}</span></td></tr>)}</tbody></table>);
  if (type === "workflow") return chrome(e.workflow, <div className="ep-wf-pipeline">{wfSteps.map((s,i)=> <React.Fragment key={i}><div className="ep-wf-node" style={{animationDelay:`${i*0.15}s`}}><div className="ep-wf-num" style={{background: grad45, boxShadow:`0 4px 12px ${c1}4d`}}>{i+1}</div><div className="ep-wf-label">{s}</div></div>{i<wfSteps.length-1 && <div className="ep-wf-connector" style={{background: grad90, backgroundSize:"200% 100%"}}></div>}</React.Fragment>)}</div>);
  if (type === "ai") return chrome(e.aiAssistant, <div className="ep-ai-chat">{aiMsgs.map((msg,i)=> <div key={i} className={`ep-chat-bubble ${msg.from}`} style={{animationDelay:`${i*0.3}s`, ...(msg.from==="user" ? {background: grad} : {})}}>{msg.text}</div>)}<div className="ep-typing-indicator"><span></span><span></span><span></span></div></div>);
  if (type === "asm") return chrome(e.asmMap, <div className="ep-asm-grid">{asmAssets.map((a,i)=> <div key={i} className={`ep-asm-card ${a.risk}`} style={{animationDelay:`${i*0.1}s`}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}><strong>{a.name}</strong><span className={`ep-asm-badge ${a.risk}`}>{a.riskLabel}</span></div><div className="ep-cell-dim" style={{marginTop:4,fontSize:13}}>{a.type} | {a.ports} {e.openPort}</div></div>)}</div>);
  if (type === "tasks") return chrome(e.taskBoard, <div className="ep-kanban">{kanbanCols.map((col,i)=> <div key={i} className="ep-kanban-col"><div style={{fontWeight:600,marginBottom:8,fontSize:13,color:"#64748b"}}>{col.title} ({col.cards.length})</div>{col.cards.map((c,j)=> <div key={j} className="ep-kanban-card" style={{animationDelay:`${(i*2+j)*0.1}s`, borderLeftColor: c1}}>{c}</div>)}</div>)}</div>);
  if (type === "integrations") return chrome(e.integrationsTitle, <div className="ep-integrations">{integrationsList.map((itg,i)=> <div key={i} className="ep-integ-chip" style={{animationDelay:`${i*0.06}s`}}><span className="ep-integ-check">&#10003;</span>{itg}</div>)}</div>);
  if (type === "notifications") return chrome(e.notifChannels, <div className="ep-notif-list">{notifChannels.map((n,i)=> <div key={i} className="ep-notif-row" style={{animationDelay:`${i*0.1}s`}}><div className={`ep-notif-ic ${n.on?"ep-notif-on":""}`}>{IC.bell}</div><div style={{flex:1}}><div style={{fontWeight:600,fontSize:14}}>{n.channel}</div><div className="ep-cell-dim" style={{fontSize:12}}>{n.desc}</div></div><div className={`ep-status-pill ${n.on?"online":"offline"}`}>{n.on ? e.active : e.closed}</div></div>)}</div>);
  return null;
};

const EnterprisePage = ({ feature }) => {
  const { t } = useI18n();
  const [visible, setVisible] = React.useState(false);
  React.useEffect(() => { setVisible(false); const timer = setTimeout(()=> setVisible(true), 50); return ()=> clearTimeout(timer); }, [feature]);

  const e = t.enterprise;
  const meta = FEATURE_META[feature];
  const featureData = e.features?.[feature];

  if (!meta || !featureData) return <div className="ep-page ep-show" style={{padding:80,textAlign:"center"}}><h2>{e.proFeature}</h2><p>{e.proFeatureDesc}</p></div>;

  const iconSvg = IC[meta.icon] || IC.shield;
  const colors = meta.colors || ["#2563eb","#10b981"];
  const c1 = colors[0], c2 = colors[1];
  const grad45 = `linear-gradient(45deg, ${c1}, ${c2})`;

  const highlights = featureData.highlights.map((h, i) => ({
    ...h,
    icon: meta.highlightIcons[i] || "shield",
  }));

  return (
    <div className={`ep-page ${visible?"ep-show":""}`} style={{"--ep-c1": c1, "--ep-c2": c2}}>
      <section className="ep-hero" style={{background: meta.gradient}}>
        <div className="ep-hero-glow"></div>
        <div className="ep-hero-content">
          <div className="ep-hero-icon-wrap">{iconSvg}</div>
          <span className="ep-badge">PRO</span>
          <h1 className="ep-title">{featureData.headline}</h1>
          <p className="ep-desc">{featureData.description}</p>
          <div className="ep-stats">
            {featureData.stats.map((s,i) => <div key={i} className="ep-stat"><div className="ep-stat-val">{s.value}</div><div className="ep-stat-lbl">{s.label}</div></div>)}
          </div>
        </div>
        <div className="ep-scan-line"></div>
      </section>

      <section className="ep-features">
        <h2 className="ep-section-heading">{e.coreFeatures}<span className="ep-heading-line" style={{background: grad45}}></span></h2>
        <div className="ep-features-grid">
          {highlights.map((h,i) => (
            <div key={i} className="ep-feature-card" style={{animationDelay:`${i*0.1}s`, "--ep-c1": c1, "--ep-c2": c2}}>
              <div className="ep-feat-icon" style={{background: meta.gradient, boxShadow:`0 4px 12px ${c1}33`}}>{IC[h.icon] || IC.shield}</div>
              <h3>{h.title}</h3>
              <p>{h.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="ep-preview">
        <h2 className="ep-section-heading">{e.livePreview}<span className="ep-heading-line" style={{background: grad45}}></span></h2>
        <MockupVisual type={meta.mockupType} colors={colors} t={t} />
      </section>

      <section className="ep-cta-section">
        <div className="ep-cta-box" style={{"--ep-c1": c1, "--ep-c2": c2}}>
          <h2>{e.activateFeature}</h2>
          <p>{e.activateDesc}</p>
          <div style={{display:"flex",gap:16,justifyContent:"center",flexWrap:"wrap"}}>
            <a href="https://siteyvm.com" target="_blank" rel="noreferrer" className="ep-btn primary" style={{background: `linear-gradient(135deg, ${c1}, ${c2})`, boxShadow:`0 4px 15px ${c1}4d`}}>{t.common.website}</a>
            <a href="mailto:satis@siteyvm.com" className="ep-btn secondary" style={{color: c1}}>{t.common.email}</a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default EnterprisePage;

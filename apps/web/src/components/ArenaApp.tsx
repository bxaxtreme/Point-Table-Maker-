"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowDownToLine, ArrowRight, Award, Check, ChevronDown, FileImage,
  Flame, Gamepad2, ImagePlus, Medal, Plus, ScanLine, ShieldCheck,
  Sparkles, Swords, Trophy, Upload, Users, X, Zap
} from "lucide-react";
import { calculateLeaderboard, DEFAULT_SCORING, type TeamResult } from "@/features/points/scoring";
import { CERTIFICATE_THEMES, THEMES } from "@/features/themes/themeRegistry";
import { createCertificateId, printCertificate } from "@/features/certificates/certificate";

type Game = "Free Fire" | "BGMI";
type Tab = "overview" | "points" | "scanner" | "certificates" | "themes";
type SavedState = {
  game: Game;
  tournament: string;
  organizer: string;
  results: TeamResult[];
  selectedTheme: number;
  selectedCertificateTheme: number;
};

const STORAGE_KEY = "battlex-arena-v1";
const initialState: SavedState = {
  game: "Free Fire",
  tournament: "BattleX Scrims Series",
  organizer: "BattleX Esports",
  results: [
    { id: "r1", teamName: "XTREME ESPORTS", kills: 12, placement: 1, matchName: "Match 01" },
    { id: "r2", teamName: "NOVA SQUAD", kills: 8, placement: 2, matchName: "Match 01" },
    { id: "r3", teamName: "SHADOW UNIT", kills: 6, placement: 3, matchName: "Match 01" },
    { id: "r4", teamName: "VORTEX GAMING", kills: 5, placement: 4, matchName: "Match 01" }
  ],
  selectedTheme: 1,
  selectedCertificateTheme: 2
};

function makeId() {
  return typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`;
}

export default function ArenaApp() {
  const [data, setData] = useState<SavedState>(initialState);
  const [tab, setTab] = useState<Tab>("overview");
  const [newTeam, setNewTeam] = useState("");
  const [newKills, setNewKills] = useState("0");
  const [newPlacement, setNewPlacement] = useState("1");
  const [matchName, setMatchName] = useState("Match 01");
  const [themeSearch, setThemeSearch] = useState("");
  const [certificateName, setCertificateName] = useState("XTREME ESPORTS");
  const [certificateAward, setCertificateAward] = useState("Tournament Champion");
  const [certificateId, setCertificateId] = useState("BX-2026-DEMO01");
  const [screenshot, setScreenshot] = useState<string | null>(null);
  const [scanMessage, setScanMessage] = useState("");
  const [notice, setNotice] = useState("");
  const [showSetup, setShowSetup] = useState(false);
  const uploadRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setData({ ...initialState, ...JSON.parse(stored) as Partial<SavedState> });
    } catch { /* Keep the usable in-memory defaults if storage is unavailable. */ }
  }, []);

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch { /* Browser storage may be disabled. */ }
  }, [data]);

  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(() => setNotice(""), 2600);
    return () => window.clearTimeout(timer);
  }, [notice]);

  const leaderboard = useMemo(() => calculateLeaderboard(data.results, DEFAULT_SCORING), [data.results]);
  const totalKills = leaderboard.reduce((sum, row) => sum + row.kills, 0);
  const activeTheme = THEMES.find(theme => theme.id === data.selectedTheme) ?? THEMES[0];
  const activeCertificateTheme = CERTIFICATE_THEMES.find(theme => theme.id === data.selectedCertificateTheme) ?? CERTIFICATE_THEMES[0];
  const filteredThemes = THEMES.filter(theme => `${theme.name} ${theme.mood}`.toLowerCase().includes(themeSearch.toLowerCase()));
  const filteredCertificateThemes = CERTIFICATE_THEMES.filter(theme => `${theme.name} ${theme.mood}`.toLowerCase().includes(themeSearch.toLowerCase()));

  function updateData(patch: Partial<SavedState>) {
    setData(current => ({ ...current, ...patch }));
  }

  function addTeam() {
    const teamName = newTeam.trim();
    if (!teamName) { setNotice("Enter a team name first."); return; }
    if (data.results.some(row => row.teamName.toLowerCase() === teamName.toLowerCase() && row.matchName === matchName)) {
      setNotice("That team already has a result in this match."); return;
    }
    updateData({ results: [...data.results, { id: makeId(), teamName, kills: Math.max(0, Number(newKills) || 0), placement: Math.max(1, Number(newPlacement) || 1), matchName }] });
    setNewTeam("");
    setNewKills("0");
    setNotice("Team result added.");
  }

  function deleteResult(id: string) {
    updateData({ results: data.results.filter(row => row.id !== id) });
    setNotice("Result removed.");
  }

  function exportCsv() {
    const header = ["Rank", "Team", "Kills", "Placement Points", "Kill Points", "Total Points"];
    const rows = leaderboard.map((row, index) => [index + 1, row.teamName, row.kills, row.placementPoints, row.killPoints, row.totalPoints]);
    const csv = [header, ...rows].map(row => row.map(value => `"${String(value).replaceAll('"', '""')}"`).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${data.tournament.trim().replace(/[^a-z0-9]+/gi, "-") || "tournament"}-points.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
    setNotice("Leaderboard CSV exported.");
  }

  function onScreenshot(file?: File) {
    if (!file) return;
    if (!["image/png", "image/jpeg", "image/webp"].includes(file.type)) { setNotice("Choose a PNG, JPG, or WEBP screenshot."); return; }
    if (file.size > 8 * 1024 * 1024) { setNotice("Image must be smaller than 8 MB."); return; }
    const reader = new FileReader();
    reader.onload = () => {
      setScreenshot(String(reader.result));
      setScanMessage("Screenshot ready. OCR service is not connected yet, so no scores have been extracted.");
    };
    reader.readAsDataURL(file);
  }

  function resetDemo() {
    setData(initialState);
    setScreenshot(null);
    setNotice("Demo data restored.");
  }

  const navItems: { id: Tab; label: string; icon: typeof Trophy }[] = [
    { id: "overview", label: "Overview", icon: Gamepad2 },
    { id: "points", label: "Points table", icon: Trophy },
    { id: "scanner", label: "AI screenshot scan", icon: ScanLine },
    { id: "certificates", label: "Certificates", icon: Award },
    { id: "themes", label: "Theme studio", icon: Sparkles }
  ];

  return (
    <main className="arena-shell" style={{ "--accent": activeTheme.accent, "--accent-glow": activeTheme.glow } as React.CSSProperties}>
      <div className="ambient ambient-one" /><div className="ambient ambient-two" /><div className="grid-overlay" />
      <header className="topbar">
        <a className="brand" href="#" onClick={event => { event.preventDefault(); setTab("overview"); }}>
          <span className="brand-mark"><Swords size={21} strokeWidth={2.5} /></span>
          <span className="brand-copy"><strong>BATTLEX<span> ARENA</span></strong><small>ESPORTS CONTROL CENTER</small></span>
        </a>
        <div className="topbar-right">
          <span className="local-pill"><span className="status-dot" /> No login required</span>
          <button className="icon-button" title="Restore demo data" onClick={resetDemo}><Zap size={17} /></button>
          <button className="profile-chip" onClick={() => setShowSetup(value => !value)}><span className="profile-avatar">BX</span><span>Guest mode</span><ChevronDown size={14} /></button>
        </div>
      </header>

      {showSetup && <section className="quick-setup glass-card">
        <div className="section-heading"><div><span className="eyebrow">QUICK SETUP</span><h3>Tournament workspace</h3></div><button className="icon-button" onClick={() => setShowSetup(false)}><X size={16} /></button></div>
        <div className="form-grid">
          <label>Tournament name<input value={data.tournament} onChange={event => updateData({ tournament: event.target.value })} /></label>
          <label>Organizer name<input value={data.organizer} onChange={event => updateData({ organizer: event.target.value })} /></label>
          <label>Game<select value={data.game} onChange={event => updateData({ game: event.target.value as Game })}><option>Free Fire</option><option>BGMI</option></select></label>
        </div>
      </section>}

      <div className="app-layout">
        <aside className="sidebar">
          <div className="workspace-label">WORKSPACE <span>01</span></div>
          <div className="workspace-card"><span className="workspace-icon"><Trophy size={19} /></span><div><strong>My Tournament</strong><small>Local workspace</small></div><span className="online-dot" /></div>
          <nav className="side-nav" aria-label="Main navigation">
            {navItems.map(item => {
              const Icon = item.icon;
              return <button key={item.id} className={`nav-item ${tab === item.id ? "active" : ""}`} onClick={() => setTab(item.id)}><Icon size={18} /><span>{item.label}</span>{item.id === "scanner" && <span className="nav-tag">OCR</span>}</button>;
            })}
          </nav>
          <div className="sidebar-bottom">
            <div className="upgrade-card"><div className="upgrade-icon"><Sparkles size={18} /></div><strong>Make it legendary</strong><p>Choose a look that fits your tournament.</p><button onClick={() => setTab("themes")}>Explore themes <ArrowRight size={14} /></button></div>
            <div className="sidebar-footer"><ShieldCheck size={14} /> Your draft stays in this browser</div>
          </div>
        </aside>

        <section className="main-content">
          <div className="welcome-row">
            <div><div className="breadcrumb">Workspace <span>/</span> {navItems.find(item => item.id === tab)?.label}</div><h1>{tab === "overview" ? <>Own the <span className="gradient-text">leaderboard.</span></> : navItems.find(item => item.id === tab)?.label}</h1><p className="welcome-subtitle">{tab === "overview" ? "Build your tournament, calculate points, and create a winning look." : "Everything you need to run a clean, professional esports tournament."}</p></div>
            <div className="game-switch" role="group" aria-label="Select game">
              <button className={data.game === "Free Fire" ? "selected" : ""} onClick={() => updateData({ game: "Free Fire" })}><Flame size={17} /> Free Fire</button>
              <button className={data.game === "BGMI" ? "selected" : ""} onClick={() => updateData({ game: "BGMI" })}><Gamepad2 size={17} /> BGMI</button>
            </div>
          </div>

          {tab === "overview" && <>
            <section className="hero-card">
              <div className="hero-copy"><span className="hero-kicker"><span className="pulse-dot" /> TOURNAMENT WORKSPACE</span><h2>{data.tournament || "Your next championship"}<br /><span>starts here.</span></h2><p>Set the rules. Add the squads. Let every point count.</p><div className="hero-actions"><button className="primary-button" onClick={() => setShowSetup(true)}>Configure tournament <ArrowRight size={16} /></button><button className="secondary-button" onClick={() => setTab("points")}>View leaderboard</button></div><div className="hero-meta"><span><span className="tiny-check"><Check size={10} /></span> Auto-calculated points</span><span><span className="tiny-check"><Check size={10} /></span> Guest access</span></div></div>
              <div className="hero-art" aria-hidden="true"><div className="orbit orbit-a" /><div className="orbit orbit-b" /><div className="hero-emblem"><Swords size={72} strokeWidth={1.2} /></div><div className="floating-stat stat-top"><Trophy size={15} /><span><strong>LIVE RANK</strong><b>TOP 01</b></span></div><div className="floating-stat stat-bottom"><Zap size={15} /><span><strong>POINTS ENGINE</strong><b>ACTIVE</b></span></div><div className="art-spark spark-one">✦</div><div className="art-spark spark-two">✧</div></div>
            </section>
            <div className="section-heading stats-heading"><div><span className="eyebrow">MATCH OVERVIEW</span><h2>Your tournament at a glance</h2></div><button className="text-button" onClick={() => setShowSetup(true)}>Edit details <ArrowRight size={14} /></button></div>
            <div className="stats-grid">
              <StatCard icon={<Users size={18} />} label="Teams ranked" value={String(leaderboard.length).padStart(2, "0")} caption="Across saved match results" />
              <StatCard icon={<Swords size={18} />} label="Total eliminations" value={String(totalKills).padStart(2, "0")} caption="Kills recorded so far" />
              <StatCard icon={<Trophy size={18} />} label="Leading score" value={String(leaderboard[0]?.totalPoints ?? 0).padStart(2, "0")} caption={leaderboard[0]?.teamName ?? "Add your first team"} />
              <StatCard icon={<Medal size={18} />} label="Design library" value="120+" caption="Points table + certificate looks" />
            </div>
            <div className="content-grid">
              <section className="panel leaderboard-panel"><div className="panel-header"><div><span className="eyebrow">CURRENT STANDINGS</span><h3>Leaderboard</h3></div><button className="small-button" onClick={() => setTab("points")}>Full table <ArrowRight size={14} /></button></div><LeaderboardTable rows={leaderboard.slice(0, 4)} /></section>
              <section className="panel quick-actions"><div className="panel-header"><div><span className="eyebrow">QUICK ACTIONS</span><h3>Make your next move</h3></div></div><button className="action-row" onClick={() => setTab("points")}><span className="action-icon"><Plus size={18} /></span><span><strong>Add team results</strong><small>Enter rank and eliminations</small></span><ArrowRight size={16} /></button><button className="action-row" onClick={() => setTab("scanner")}><span className="action-icon"><ScanLine size={18} /></span><span><strong>Scan scoreboard</strong><small>Upload a match screenshot</small></span><ArrowRight size={16} /></button><button className="action-row" onClick={() => setTab("certificates")}><span className="action-icon"><Award size={18} /></span><span><strong>Create certificate</strong><small>Design an award for your squad</small></span><ArrowRight size={16} /></button><button className="action-row" onClick={() => setTab("themes")}><span className="action-icon"><Sparkles size={18} /></span><span><strong>Change visual style</strong><small>Browse 120+ table themes</small></span><ArrowRight size={16} /></button></section>
            </div>
          </>}

          {tab === "points" && <section className="panel page-panel">
            <div className="panel-header"><div><span className="eyebrow">MATCH SCORING</span><h3>Points table</h3><p className="panel-subtitle">Scoring: placement points + kills × 1. Update rows any time.</p></div><button className="primary-button compact" onClick={exportCsv}><ArrowDownToLine size={16} /> Export CSV</button></div>
            <div className="inline-form">
              <label>Team name<input placeholder="e.g. Nova Esports" value={newTeam} onChange={event => setNewTeam(event.target.value)} onKeyDown={event => { if (event.key === "Enter") addTeam(); }} /></label>
              <label>Position<select value={newPlacement} onChange={event => setNewPlacement(event.target.value)}>{Array.from({ length: 25 }, (_, index) => <option key={index + 1} value={index + 1}>{index + 1}{index === 0 ? "st" : index === 1 ? "nd" : index === 2 ? "rd" : "th"}</option>)}</select></label>
              <label>Kills<input type="number" min="0" max="999" value={newKills} onChange={event => setNewKills(event.target.value)} /></label>
              <label>Match<input value={matchName} onChange={event => setMatchName(event.target.value)} /></label>
              <button className="primary-button add-result-button" onClick={addTeam}><Plus size={16} /> Add result</button>
            </div>
            <LeaderboardTable rows={leaderboard} onDelete={deleteResult} />
            <div className="rules-note"><ShieldCheck size={17} /><span><strong>Transparent scoring</strong> — totals are calculated in code from the current placement rules and kill count. Verify your organizer’s official scoring settings before publishing.</span></div>
          </section>}

          {tab === "scanner" && <section className="panel page-panel"><div className="panel-header"><div><span className="eyebrow">IMAGE TO SCORE</span><h3>AI scoreboard scanner</h3><p className="panel-subtitle">Upload a clear results screenshot to prepare it for OCR.</p></div><span className="coming-pill"><span className="status-dot" /> OCR integration needed</span></div>
            <div className="scanner-layout"><button className={`upload-zone ${screenshot ? "has-image" : ""}`} onClick={() => uploadRef.current?.click()}><input ref={uploadRef} type="file" accept="image/png,image/jpeg,image/webp" hidden onChange={event => onScreenshot(event.target.files?.[0])} />{screenshot ? <img src={screenshot} alt="Uploaded scoreboard preview" /> : <><span className="upload-icon"><ImagePlus size={28} /></span><strong>Drop your scoreboard here</strong><span>or click to browse PNG, JPG, WEBP</span><small>Maximum file size: 8 MB</small></>}<span className="upload-button"><Upload size={15} /> {screenshot ? "Choose another screenshot" : "Upload screenshot"}</span></button>
              <div className="scanner-info"><div className="scanner-step"><span>01</span><div><strong>Upload your match result</strong><p>Use a clear screenshot with readable team names, placements and kills.</p></div></div><div className="scanner-step"><span>02</span><div><strong>Extract with OCR</strong><p>An OCR provider must be connected to read screenshot text. No invented scores.</p></div></div><div className="scanner-step"><span>03</span><div><strong>Review, then save</strong><p>Confirm every extracted row before it changes the leaderboard.</p></div></div>{scanMessage && <div className="inline-alert"><ScanLine size={17} /><span>{scanMessage}</span></div>}</div></div>
          </section>}

          {tab === "certificates" && <section className="panel page-panel"><div className="panel-header"><div><span className="eyebrow">REWARD THE WIN</span><h3>Certificate studio</h3><p className="panel-subtitle">Personalize an award and print it or save it as PDF.</p></div><button className="primary-button compact" onClick={() => { setCertificateId(createCertificateId()); setNotice("New certificate ID generated."); }}><Sparkles size={16} /> New ID</button></div>
            <div className="certificate-workspace"><div className="certificate-controls"><label>Recipient / team name<input value={certificateName} onChange={event => setCertificateName(event.target.value)} /></label><label>Award title<input value={certificateAward} onChange={event => setCertificateAward(event.target.value)} /></label><label>Certificate ID<input value={certificateId} onChange={event => setCertificateId(event.target.value)} /></label><label>Certificate design<select value={data.selectedCertificateTheme} onChange={event => updateData({ selectedCertificateTheme: Number(event.target.value) })}>{CERTIFICATE_THEMES.map(theme => <option value={theme.id} key={theme.id}>{theme.name}</option>)}</select></label><button className="primary-button" onClick={printCertificate}><ArrowDownToLine size={16} /> Print / Save as PDF</button><p className="muted-note">Use the print dialog’s “Save as PDF” option. Certificate verification and permanent cloud storage need a backend database.</p></div>
              <div className="certificate-preview-wrap"><div className="certificate-preview" style={{ "--cert-accent": activeCertificateTheme.accent, "--cert-bg": activeCertificateTheme.background, "--cert-glow": activeCertificateTheme.glow } as React.CSSProperties}><div className="certificate-inner"><span className="certificate-overline">BATTLEX ESPORTS ARENA</span><div className="certificate-medal"><Award size={34} /></div><span className="certificate-small">CERTIFICATE OF ACHIEVEMENT</span><h2>{certificateAward || "Tournament Champion"}</h2><p className="certificate-presented">PROUDLY PRESENTED TO</p><h3>{certificateName || "Team Name"}</h3><div className="certificate-line" /><p className="certificate-description">For outstanding performance in <strong>{data.tournament || "your tournament"}</strong>, competing in {data.game}.</p><div className="certificate-bottom"><span><small>ORGANIZER</small><strong>{data.organizer || "Tournament Organizer"}</strong></span><span><small>CERTIFICATE ID</small><strong>{certificateId}</strong></span></div></div></div></div></div>
          </section>}

          {tab === "themes" && <section className="panel page-panel"><div className="panel-header"><div><span className="eyebrow">MAKE IT YOURS</span><h3>Theme studio</h3><p className="panel-subtitle">120 generated blue/black variations for your points table and certificates.</p></div><span className="theme-count"><Sparkles size={15} /> {THEMES.length} table looks</span></div>
            <div className="theme-search"><input placeholder="Search themes, e.g. cyber, ocean, midnight..." value={themeSearch} onChange={event => setThemeSearch(event.target.value)} /><span>{filteredThemes.length} results</span></div>
            <div className="theme-grid">{filteredThemes.map(theme => <button key={theme.id} className={`theme-card ${data.selectedTheme === theme.id ? "chosen" : ""}`} onClick={() => { updateData({ selectedTheme: theme.id }); setNotice(`${theme.name} applied.`); }}><div className="theme-swatch" style={{ "--swatch-accent": theme.accent, "--swatch-bg": theme.background, "--swatch-glow": theme.glow } as React.CSSProperties}><span className="swatch-orb" /><span className="swatch-line line-one" /><span className="swatch-line line-two" /><span className="swatch-dot" /></div><span className="theme-card-footer"><span><strong>{theme.name}</strong><small>{theme.mood}</small></span>{data.selectedTheme === theme.id ? <Check size={16} /> : <ArrowRight size={15} />}</span></button>)}</div>
            <div className="section-heading certificate-theme-heading"><div><span className="eyebrow">CERTIFICATE DESIGNS</span><h3>120 matching certificate looks</h3></div><button className="text-button" onClick={() => setTab("certificates")}>Open certificate studio <ArrowRight size={14} /></button></div>
            <div className="certificate-theme-strip">{filteredCertificateThemes.slice(0, 12).map(theme => <button key={theme.id} className={`certificate-mini ${data.selectedCertificateTheme === theme.id ? "chosen" : ""}`} onClick={() => { updateData({ selectedCertificateTheme: theme.id }); setNotice(`${theme.name} selected.`); }} style={{ "--mini-accent": theme.accent, "--mini-bg": theme.background } as React.CSSProperties}><Award size={21} /><span>{theme.name.replace("Certificate ", "")}</span></button>)}</div>
          </section>}

          <footer className="main-footer"><span>© 2026 BattleX Points Arena</span><span><span className="status-dot" /> Guest workspace · Auto-saved locally</span><button onClick={() => setShowSetup(true)}>Tournament settings</button></footer>
        </section>
      </div>
      {notice && <div className="toast"><span className="toast-check"><Check size={14} /></span>{notice}</div>}
    </main>
  );
}

function StatCard({ icon, label, value, caption }: { icon: React.ReactNode; label: string; value: string; caption: string }) {
  return <article className="stat-card"><span className="stat-icon">{icon}</span><span className="stat-label">{label}</span><strong className="stat-value">{value}</strong><span className="stat-caption">{caption}</span><span className="stat-sparkline"><i /><i /><i /><i /><i /><i /><i /></span></article>;
}

function LeaderboardTable({ rows, onDelete }: { rows: ReturnType<typeof calculateLeaderboard>; onDelete?: (id: string) => void }) {
  return <div className="table-scroll"><table className="leaderboard-table"><thead><tr><th>RANK</th><th>TEAM / SQUAD</th><th>KILLS</th><th>PLACEMENT</th><th>KILL PTS</th><th>TOTAL PTS</th>{onDelete && <th />}</tr></thead><tbody>{rows.map((row, index) => <tr key={row.teamName}><td><span className={`rank-badge rank-${index + 1}`}>{String(index + 1).padStart(2, "0")}</span></td><td><div className="team-cell"><span className="team-avatar">{row.teamName.slice(0, 2).toUpperCase()}</span><span><strong>{row.teamName}</strong><small>{row.matchName}</small></span></div></td><td>{row.kills}</td><td>{row.placementPoints}</td><td>{row.killPoints}</td><td><strong className="points-total">{row.totalPoints}</strong></td>{onDelete && <td><button className="delete-row" aria-label={`Delete ${row.teamName}`} onClick={() => onDelete(row.id)}><X size={15} /></button></td>}</tr>)}</tbody></table>{rows.length === 0 && <div className="empty-state"><Trophy size={24} /><strong>No results yet</strong><span>Add a team above to start the leaderboard.</span></div>}</div>;
}

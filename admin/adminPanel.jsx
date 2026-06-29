import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import {
  Shield, MessageSquare, CheckCircle2, XCircle, Clock, AlertCircle,
  User, ChevronRight, Send, Search, ArrowLeft,
  Users, LogOut, Plus, Trash2,
  Check, X, Loader2, Lock,
  UserCog, Mail, EyeOff, Eye as EyeIcon,
  ChevronDown, Star, Crown, Swords, UserCheck, Briefcase,
  Edit2, Save, PlusCircle, Tag, Award, Sparkles,
  AlertTriangle, Info
} from "lucide-react";
import { supabase } from "../src/supabaseClient";

/* ─── ICON MAP ────────────────────────────────────────────────────────────── */
const ICON_MAP = { User, Shield, Star, Crown, Swords, UserCheck, Briefcase, Award, Sparkles };
const getIconComponent = (name) => ICON_MAP[name] || User;

/* ─── localStorage helpers ──────────────────────────────────────────────── */
const ls = {
  get: (key, fallback = null) => {
    try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; } catch { return fallback; }
  },
  set: (key, val) => {
    try { localStorage.setItem(key, JSON.stringify(val)); } catch {}
  },
};

const loadUsers     = () => ls.get("grl_users", []);
const loadThreads   = () => ls.get("grl_threads", []);
const loadCVs       = () => ls.get("grl_cvs", []);
const loadRoles     = () => ls.get("grl_roles", DEFAULT_ROLES);
const loadAdminUser = () => ls.get("grl_admin_user", null);

/* ─── DEFAULT ROLES ─────────────────────────────────────────────────────── */
const DEFAULT_ROLES = [
  {
    id: "project_team", label: "Project Team", labelShort: "PT",
    color: "oklch(0.82 0.20 0)", glow: "oklch(0.82 0.20 0 / 0.35)",
    bg: "oklch(0.82 0.20 0 / 0.12)", border: "oklch(0.82 0.20 0 / 0.4)",
    badgeClass: "adm-badge-pink", icon: "Crown", level: 11,
    description: "პროექტის გუნდი", duties: "სრული წვდომა", isDefault: true,
  },
  {
    id: "chief", label: "Chief", labelShort: "CHIEF",
    color: "oklch(0.78 0.18 45)", glow: "oklch(0.78 0.18 45 / 0.3)",
    bg: "oklch(0.78 0.18 45 / 0.10)", border: "oklch(0.78 0.18 45 / 0.35)",
    badgeClass: "adm-badge-orange", icon: "Shield", level: 10,
    description: "მთავარი ადმინი", duties: "ადმინ გუნდის სრული მართვა", isDefault: true,
  },
  {
    id: "d_chief", label: "D.Chief", labelShort: "D.CHIEF",
    color: "oklch(0.74 0.16 55)", glow: "oklch(0.74 0.16 55 / 0.28)",
    bg: "oklch(0.74 0.16 55 / 0.09)", border: "oklch(0.74 0.16 55 / 0.32)",
    badgeClass: "adm-badge-orange", icon: "Award", level: 9,
    description: "მთავარის მოადგილე", duties: "ადმინ გუნდის მართვა", isDefault: true,
  },
  {
    id: "tec", label: "TEC", labelShort: "TEC",
    color: "oklch(0.72 0.22 5)", glow: "oklch(0.72 0.22 5 / 0.3)",
    bg: "oklch(0.72 0.22 5 / 0.10)", border: "oklch(0.72 0.22 5 / 0.35)",
    badgeClass: "adm-badge-pink", icon: "Award", level: 8,
    description: "ტექნიკური ადმინი", duties: "ტექნიკური მხარდაჭერა", isDefault: true,
  },
  {
    id: "player", label: "მოთამაშე", labelShort: "PLAYER",
    color: "oklch(0.75 0.03 270)", glow: "oklch(0.75 0.03 270 / 0.2)",
    bg: "oklch(1 0 0 / 0.04)", border: "oklch(1 0 0 / 0.1)",
    badgeClass: "adm-badge-gray", icon: "User", level: 0,
    description: "ჩვეულებრივი მოთამაშე", duties: "ფორუმის გამოყენება", isDefault: true,
  },
];

/* ─── Helpers ───────────────────────────────────────────────────────────── */
const getRoleById = (id, roles) => {
  const all = roles || DEFAULT_ROLES;
  return all.find(r => r.id === id) || all.find(r => r.id === "player") || null;
};

const normalizeRole = (user, roles) => {
  if (!user) return "player";
  const all = roles || DEFAULT_ROLES;
  if (all.some(r => r.id === user.role)) return user.role;
  if (user.isAdmin || user.role === "admin" || user.role === "ადმინისტრატორი") return "tec";
  return "player";
};

const isUserAdmin = (user, roles) => {
  const role = getRoleById(normalizeRole(user, roles), roles);
  return (role?.level || 0) >= 8;
};

/* ══════════════════════════════════════════════════════════════════════════
   MODAL SYSTEM
══════════════════════════════════════════════════════════════════════════ */
let _setModalState = null;

function showAlert(message, title = "შეტყობინება") {
  return new Promise((resolve) => {
    _setModalState?.({
      type: "alert", title, message,
      onConfirm: () => { _setModalState(null); resolve(); },
      onCancel: null,
    });
  });
}

function showConfirm(message, title = "დადასტურება") {
  return new Promise((resolve) => {
    _setModalState?.({
      type: "confirm", title, message,
      onConfirm: () => { _setModalState(null); resolve(true); },
      onCancel:  () => { _setModalState(null); resolve(false); },
    });
  });
}

function ModalRoot() {
  const [modal, setModal] = useState(null);
  useEffect(() => { _setModalState = setModal; return () => { _setModalState = null; }; }, []);

  if (!modal) return null;

  const isConfirm = modal.type === "confirm";
  const isDanger  = /წაშლ|წაიშალ|დახურვა|სავაკანს/i.test(modal.title + modal.message);

  return (
    <div
      onClick={(e) => { if (e.target === e.currentTarget) modal.onCancel?.(); }}
      style={{
        position: "fixed", inset: 0, zIndex: 9999,
        background: "oklch(0 0 0 / 0.65)",
        backdropFilter: "blur(8px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: 24, animation: "admFadeIn .18s ease both",
      }}
    >
      <div style={{
        background: "oklch(0.19 0.03 285)",
        border: `1px solid ${isDanger ? "oklch(0.70 0.22 25 / 0.45)" : "oklch(0.72 0.22 5 / 0.35)"}`,
        borderRadius: 20, padding: "28px 32px",
        width: "100%", maxWidth: 420,
        boxShadow: "0 32px 80px oklch(0 0 0 / 0.55), 0 0 0 1px oklch(1 0 0 / 0.04)",
        animation: "admSlideUp .22s cubic-bezier(0.22,1,0.36,1) both",
      }}>
      <div style={{
          width: 52, height: 52, borderRadius: 16, marginBottom: 20,
          display: "flex", alignItems: "center", justifyContent: "center",
          background: isDanger ? "oklch(0.70 0.22 25 / 0.12)" : isConfirm ? "oklch(0.72 0.22 5 / 0.12)" : "oklch(0.78 0.14 220 / 0.12)",
          border: `1px solid ${isDanger ? "oklch(0.70 0.22 25 / 0.3)" : isConfirm ? "oklch(0.72 0.22 5 / 0.25)" : "oklch(0.78 0.14 220 / 0.25)"}`,
        }}>
          {isDanger
            ? <AlertTriangle size={24} style={{ color: "var(--adm-red)" }} />
            : isConfirm
              ? <AlertCircle size={24} style={{ color: "var(--adm-pink)" }} />
              : <Info size={24} style={{ color: "var(--adm-cyan)" }} />
          }
        </div>
        <div style={{ fontFamily: "var(--adm-font-d)", fontSize: 22, letterSpacing: "0.04em", marginBottom: 10 }}>
          {modal.title}
        </div>
        <div style={{ fontSize: 15, color: "var(--adm-muted)", lineHeight: 1.6, marginBottom: 28 }}>
          {modal.message}
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          {isConfirm && (
            <button onClick={modal.onCancel} className="adm-btn adm-btn-ghost" style={{ flex: 1, padding: "12px 0" }}>
              გაუქმება
            </button>
          )}
          <button
            onClick={modal.onConfirm}
            className={`adm-btn ${isDanger ? "adm-btn-danger" : "adm-btn-primary"}`}
            style={{ flex: isConfirm ? 1 : "none", padding: "12px 28px" }}
          >
            {isConfirm
              ? isDanger
                ? <><Trash2 size={15} /> წაშლა</>
                : <><Check size={15} /> დადასტურება</>
              : "კარგი"
            }
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── STYLES ────────────────────────────────────────────────────────────── */
const injectAdminStyles = () => {
  if (typeof document === "undefined") return;
  if (document.getElementById("grl-admin-styles")) return;
  const style = document.createElement("style");
  style.id = "grl-admin-styles";
  style.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Rajdhani:wght@400;500;600;700&family=JetBrains+Mono:wght@400;700&display=swap');
    .adm-root {
      --adm-bg: oklch(0.15 0.025 285); --adm-surface: oklch(0.19 0.03 285);
      --adm-card: oklch(0.22 0.035 285); --adm-border: oklch(0.35 0.04 285 / 0.5);
      --adm-border-2: oklch(1 0 0 / 0.06); --adm-pink: oklch(0.72 0.22 5);
      --adm-pink-glow: oklch(0.72 0.22 5 / 0.3); --adm-violet: oklch(0.62 0.22 305);
      --adm-green: oklch(0.78 0.18 155); --adm-yellow: oklch(0.82 0.16 80);
      --adm-red: oklch(0.70 0.22 25); --adm-cyan: oklch(0.78 0.14 220);
      --adm-orange: oklch(0.75 0.18 45); --adm-text: oklch(0.97 0.005 250);
      --adm-muted: oklch(0.75 0.03 270); --adm-muted-2: oklch(0.50 0.04 270);
      --adm-font: 'Rajdhani','Noto Sans Georgian',system-ui,sans-serif;
      --adm-font-d: 'Bebas Neue','Noto Sans Georgian',sans-serif;
      --adm-font-m: 'JetBrains Mono',monospace;
      min-height: 100vh; background: var(--adm-bg); color: var(--adm-text);
      font-family: var(--adm-font); -webkit-font-smoothing: antialiased;
      position: relative;
      background-image:
        radial-gradient(ellipse 60% 50% at 20% 0%, oklch(0.45 0.20 350 / 0.20), transparent 60%),
        radial-gradient(ellipse 50% 50% at 90% 20%, oklch(0.42 0.20 285 / 0.18), transparent 55%),
        radial-gradient(ellipse 60% 40% at 50% 100%, oklch(0.40 0.18 320 / 0.15), transparent 50%);
      background-attachment: fixed;
    }
    .adm-root * { box-sizing: border-box; }
    .adm-nav { position: sticky; top: 0; z-index: 50; border-bottom: 1px solid var(--adm-border); background: oklch(0.15 0.025 285 / 0.88); backdrop-filter: blur(20px); }
    .adm-nav-inner { max-width: 1280px; margin: 0 auto; height: 68px; display: flex; align-items: center; justify-content: space-between; padding: 0 28px; }
    .adm-logo { display: flex; align-items: center; gap: 14px; }
    .adm-logo-icon { width: 40px; height: 40px; border-radius: 12px; background: linear-gradient(135deg, var(--adm-pink), var(--adm-violet)); display: flex; align-items: center; justify-content: center; box-shadow: 0 0 28px var(--adm-pink-glow); color: #fff; font-family: var(--adm-font-d); font-size: 22px; }
    .adm-logo-text { font-family: var(--adm-font-d); font-size: 24px; letter-spacing: 0.06em; }
    .adm-logo-badge { font-size: 10px; padding: 3px 10px; border-radius: 999px; background: oklch(0.72 0.22 5 / 0.15); border: 1px solid oklch(0.72 0.22 5 / 0.35); color: var(--adm-pink); font-weight: 800; text-transform: uppercase; letter-spacing: 0.12em; }
    .adm-tabs { display: flex; gap: 6px; margin-bottom: 22px; flex-wrap: wrap; border-bottom: 1px solid var(--adm-border-2); padding-bottom: 2px; }
    .adm-tab { display: inline-flex; align-items: center; gap: 8px; padding: 10px 18px; font-size: 13px; font-weight: 700; cursor: pointer; border: none; background: transparent; color: var(--adm-muted); border-radius: 10px 10px 0 0; transition: all .2s; position: relative; font-family: var(--adm-font); }
    .adm-tab:hover { color: var(--adm-text); background: oklch(1 0 0 / 0.04); }
    .adm-tab.active { color: var(--adm-pink); background: oklch(0.72 0.22 5 / 0.08); }
    .adm-tab.active::after { content: ""; position: absolute; left:0; right:0; bottom:-2px; height:2px; background: linear-gradient(90deg, var(--adm-pink), var(--adm-cyan)); border-radius: 2px; }
    .adm-tab-count { font-size: 10px; font-family: var(--adm-font-m); padding: 1px 7px; border-radius: 999px; background: oklch(1 0 0 / 0.08); color: var(--adm-muted); }
    .adm-tab.active .adm-tab-count { background: oklch(0.72 0.22 5 / 0.18); color: var(--adm-pink); }
    .adm-stat-card { background: var(--adm-card); border: 1px solid var(--adm-border); border-radius: 16px; padding: 20px 24px; position: relative; overflow: hidden; transition: all .3s cubic-bezier(0.22,1,0.36,1); }
    .adm-stat-card:hover { transform: translateY(-3px); border-color: oklch(0.72 0.22 5 / 0.4); box-shadow: 0 8px 32px oklch(0 0 0 / 0.3); }
    .adm-card { background: var(--adm-card); border: 1px solid var(--adm-border); border-radius: 16px; overflow: hidden; transition: border-color .3s; }
    .adm-card:hover { border-color: oklch(0.72 0.22 5 / 0.2); }
    .adm-card-header { padding: 18px 24px; border-bottom: 1px solid var(--adm-border-2); background: linear-gradient(to right, oklch(0.72 0.22 5 / 0.06), transparent); display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap; }
    .adm-card-title { font-family: var(--adm-font-d); font-size: 18px; letter-spacing: 0.05em; }
    .adm-input { width: 100%; background: oklch(0.12 0.02 285 / 0.6); border: 1px solid var(--adm-border-2); border-radius: 10px; padding: 12px 16px; color: var(--adm-text); font-size: 14px; font-family: var(--adm-font); outline: none; transition: all .25s; }
    .adm-input::placeholder { color: var(--adm-muted-2); }
    .adm-input:focus { border-color: oklch(0.72 0.22 5 / 0.5); box-shadow: 0 0 0 4px oklch(0.72 0.22 5 / 0.08); }
    textarea.adm-input { resize: vertical; min-height: 80px; }
    .adm-btn { display: inline-flex; align-items: center; justify-content: center; gap: 8px; border: none; cursor: pointer; font-family: var(--adm-font); font-weight: 700; border-radius: 10px; transition: all .25s; font-size: 14px; padding: 10px 22px; }
    .adm-btn-primary { background: linear-gradient(135deg, var(--adm-pink), var(--adm-violet)); color: #fff; box-shadow: 0 4px 24px var(--adm-pink-glow); }
    .adm-btn-primary:hover { transform: scale(1.03); box-shadow: 0 6px 32px var(--adm-pink-glow); }
    .adm-btn-primary:disabled { opacity: .4; cursor: not-allowed; transform: none; }
    .adm-btn-ghost { background: oklch(1 0 0 / 0.05); color: var(--adm-muted); border: 1px solid var(--adm-border-2); }
    .adm-btn-ghost:hover { background: oklch(1 0 0 / 0.10); color: var(--adm-text); }
    .adm-btn-sm { padding: 7px 14px; font-size: 12px; border-radius: 8px; }
    .adm-btn-success { background: oklch(0.78 0.18 155 / 0.15); color: var(--adm-green); border: 1px solid oklch(0.78 0.18 155 / 0.35); }
    .adm-btn-success:hover { background: oklch(0.78 0.18 155 / 0.25); }
    .adm-btn-danger { background: oklch(0.70 0.22 25 / 0.15); color: var(--adm-red); border: 1px solid oklch(0.70 0.22 25 / 0.35); }
    .adm-btn-danger:hover { background: oklch(0.70 0.22 25 / 0.25); }
    .adm-label { display: block; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.12em; color: var(--adm-muted); margin-bottom: 6px; }
    .adm-badge { display: inline-flex; align-items: center; gap: 5px; font-size: 10px; padding: 4px 10px; border-radius: 999px; font-weight: 800; border: 1px solid; letter-spacing: 0.04em; }
    .adm-badge-green  { color: var(--adm-green); border-color: oklch(0.78 0.18 155 / 0.4); background: oklch(0.78 0.18 155 / 0.10); }
    .adm-badge-red    { color: var(--adm-red); border-color: oklch(0.70 0.22 25 / 0.4); background: oklch(0.70 0.22 25 / 0.10); }
    .adm-badge-yellow { color: var(--adm-yellow); border-color: oklch(0.82 0.16 80 / 0.4); background: oklch(0.82 0.16 80 / 0.10); }
    .adm-badge-orange { color: var(--adm-orange); border-color: oklch(0.75 0.18 45 / 0.4); background: oklch(0.75 0.18 45 / 0.10); }
    .adm-badge-pink   { color: var(--adm-pink); border-color: oklch(0.72 0.22 5 / 0.4); background: oklch(0.72 0.22 5 / 0.10); }
    .adm-badge-cyan   { color: var(--adm-cyan); border-color: oklch(0.78 0.14 220 / 0.4); background: oklch(0.78 0.14 220 / 0.10); }
    .adm-badge-gray   { color: var(--adm-muted); border-color: var(--adm-border-2); background: oklch(1 0 0 / 0.04); }
    .adm-list-item { display: flex; align-items: flex-start; justify-content: space-between; gap: 14px; padding: 16px 20px; cursor: pointer; transition: all .2s; border-bottom: 1px solid var(--adm-border-2); }
    .adm-list-item:last-child { border-bottom: none; }
    .adm-list-item:hover { background: oklch(0.72 0.22 5 / 0.05); }
    .adm-list-item.selected { background: oklch(0.72 0.22 5 / 0.08); border-left: 3px solid var(--adm-pink); }
    .adm-scroll::-webkit-scrollbar { width: 5px; }
    .adm-scroll::-webkit-scrollbar-track { background: transparent; }
    .adm-scroll::-webkit-scrollbar-thumb { background: oklch(0.72 0.22 5 / 0.3); border-radius: 3px; }
    .adm-post { border-radius: 12px; padding: 16px 18px; margin-bottom: 12px; transition: all .2s; }
    .adm-post-user  { background: oklch(0.12 0.02 285 / 0.5); border: 1px solid var(--adm-border-2); }
    .adm-post-admin { background: oklch(0.72 0.22 5 / 0.06); border: 1px solid oklch(0.72 0.22 5 / 0.2); }
    .adm-empty { text-align: center; padding: 56px 24px; color: var(--adm-muted-2); font-size: 15px; }
    .adm-verdict-box { border-radius: 12px; padding: 14px 18px; border: 1px solid; display: flex; align-items: flex-start; gap: 12px; }
    .adm-verdict-approved { background: oklch(0.78 0.18 155 / 0.06); border-color: oklch(0.78 0.18 155 / 0.3); color: var(--adm-green); }
    .adm-verdict-rejected { background: oklch(0.70 0.22 25 / 0.06); border-color: oklch(0.70 0.22 25 / 0.3); color: var(--adm-red); }
    .adm-verdict-pending { background: oklch(0.82 0.16 80 / 0.06); border-color: oklch(0.82 0.16 80 / 0.3); color: var(--adm-yellow); }
    .adm-cv-card { background: var(--adm-card); border: 1px solid var(--adm-border); border-radius: 14px; padding: 18px 20px; transition: all .25s; margin-bottom: 14px; }
    .adm-cv-card:hover { border-color: oklch(0.78 0.14 220 / 0.35); box-shadow: 0 6px 28px oklch(0 0 0 / 0.25); }
    .adm-cv-field-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 10px; margin: 14px 0; }
    .adm-cv-field { background: oklch(0.78 0.14 220 / 0.06); border: 1px solid oklch(0.78 0.14 220 / 0.18); border-radius: 8px; padding: 8px 12px; }
    .adm-cv-field-label { font-size: 9px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.1em; color: var(--adm-cyan); margin-bottom: 3px; }
    .adm-cv-field-value { font-size: 13px; font-weight: 600; color: var(--adm-text); line-height: 1.4; word-break: break-word; }
    .adm-role-dropdown { position: fixed; z-index: 999; min-width: 260px; background: oklch(0.18 0.03 285); border: 1px solid var(--adm-border); border-radius: 14px; overflow: hidden; box-shadow: 0 24px 64px oklch(0 0 0 / 0.6); animation: admRoleDrop .2s cubic-bezier(0.22,1,0.36,1) both; }
    @keyframes admRoleDrop { from { opacity: 0; transform: translateY(-6px) scale(0.97); } to { opacity: 1; transform: none; } }
    .adm-role-option { display: flex; align-items: flex-start; gap: 12px; padding: 12px 16px; cursor: pointer; border-bottom: 1px solid oklch(1 0 0 / 0.05); transition: background .15s; }
    .adm-role-option:last-child { border-bottom: none; }
    .adm-role-option:hover { background: oklch(1 0 0 / 0.06); }
    .adm-role-option.current { background: oklch(1 0 0 / 0.04); cursor: default; }
    .adm-role-icon-wrap { width: 34px; height: 34px; border-radius: 10px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
    .adm-role-header { padding: 10px 16px 8px; border-bottom: 1px solid oklch(1 0 0 / 0.06); font-size: 10px; font-weight: 800; letter-spacing: 0.14em; color: var(--adm-muted-2); text-transform: uppercase; }
    .adm-role-manager { background: var(--adm-card); border: 1px solid var(--adm-border); border-radius: 12px; padding: 16px 20px; margin-bottom: 16px; }
    .adm-role-item { display: flex; align-items: center; justify-content: space-between; padding: 8px 12px; border-bottom: 1px solid var(--adm-border-2); gap: 12px; flex-wrap: wrap; }
    .adm-role-item:last-child { border-bottom: none; }
    .adm-color-picker { width: 32px; height: 32px; border-radius: 8px; border: 2px solid var(--adm-border); cursor: pointer; padding: 0; background: none; }
    .adm-color-picker::-webkit-color-swatch-wrapper { padding: 0; }
    .adm-color-picker::-webkit-color-swatch { border: none; border-radius: 6px; }
    @keyframes admFade { from { opacity:0; transform: translateY(8px); } to { opacity:1; transform: none; } }
    @keyframes admFadeIn { from { opacity:0; } to { opacity:1; } }
    @keyframes admSlideUp { from { opacity:0; transform: translateY(20px) scale(0.96); } to { opacity:1; transform: none; } }
    .adm-fade { animation: admFade .35s ease both; }
    @keyframes admSpin { from { transform: rotate(0); } to { transform: rotate(360deg); } }
    .adm-spin { animation: admSpin 1s linear infinite; }
    @media (max-width: 900px) {
      .adm-split { flex-direction: column !important; }
      .adm-split > * { width: 100% !important; }
      .adm-stat-grid { grid-template-columns: 1fr 1fr !important; }
      .adm-nav-inner { height: 60px; padding: 0 16px; }
    }
    @media (max-width: 600px) {
      .adm-stat-grid { grid-template-columns: 1fr !important; }
      .adm-cv-field-grid { grid-template-columns: 1fr 1fr; }
    }
  `;
  document.head.appendChild(style);
};

/* ─── ROLE BADGE ─────────────────────────────────────────────────────────── */
function RoleBadge({ roleId, roles }) {
  const role = getRoleById(roleId, roles);
  const Icon = getIconComponent(role?.icon || "User");
  return (
    <span className={`adm-badge ${role?.badgeClass || "adm-badge-gray"}`}
      style={{ borderColor: role?.border, color: role?.color, background: role?.bg }}>
      <Icon size={11} /> {role?.labelShort || roleId}
    </span>
  );
}

/* ─── ROLE DROPDOWN ──────────────────────────────────────────────────────── */
function RoleDropdown({ user, onSelect, onClose, triggerRef, roles }) {
  const ref = useRef(null);
  const currentRoleId = normalizeRole(user, roles);
  const [pos, setPos] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (triggerRef?.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setPos({ top: rect.bottom + 6, left: rect.left });
    }
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target) &&
          triggerRef?.current && !triggerRef.current.contains(e.target)) onClose();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);

  const sorted = [...roles].sort((a, b) => b.level - a.level);

  return (
    <div ref={ref} className="adm-role-dropdown" style={{ top: pos.top, left: pos.left }}>
      <div className="adm-role-header">
        <Shield size={11} style={{ display: "inline", marginRight: 5, verticalAlign: "middle" }} />
        როლის შეცვლა — {user.username}
      </div>
      {sorted.map(role => {
        const isCurrent = role.id === currentRoleId;
        const Icon = getIconComponent(role.icon || "User");
        return (
          <div key={role.id} className={`adm-role-option${isCurrent ? " current" : ""}`}
            onClick={() => !isCurrent && onSelect(user, role.id)}>
            <div className="adm-role-icon-wrap"
              style={{ background: role.bg, border: `1px solid ${role.border}` }}>
              <Icon size={16} style={{ color: role.color }} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontWeight: 800, fontSize: 14, color: role.color }}>{role.label}</span>
                {isCurrent && (
                  <span style={{ fontSize: 9, padding: "2px 7px", borderRadius: 999, background: role.bg, color: role.color, border: `1px solid ${role.border}`, fontWeight: 800 }}>
                    მიმდინარე
                  </span>
                )}
                {role.isDefault && (
                  <span style={{ fontSize: 8, padding: "1px 5px", borderRadius: 4, background: "oklch(0.72 0.22 5 / 0.1)", color: "var(--adm-pink)", fontWeight: 700 }}>
                    სტანდარტული
                  </span>
                )}
              </div>
              <div style={{ fontSize: 11, color: "var(--adm-muted-2)", marginTop: 2 }}>{role.duties}</div>
            </div>
            {!isCurrent && <ChevronRight size={14} style={{ color: "var(--adm-muted-2)", flexShrink: 0 }} />}
          </div>
        );
      })}
    </div>
  );
}

/* ─── ROLE MANAGER ───────────────────────────────────────────────────────── */
function RoleManager({ roles, setRoles }) {
  const [show, setShow] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ id: "", label: "", labelShort: "", color: "#ff2d78", level: 10, description: "", duties: "", icon: "User" });
  const iconOptions = ["User", "Shield", "Star", "Crown", "Swords", "UserCheck", "Briefcase", "Award", "Sparkles"];

  const resetForm = () => setForm({ id: "", label: "", labelShort: "", color: "#ff2d78", level: 10, description: "", duties: "", icon: "User" });

  const saveRoles = (updated) => {
    setRoles(updated);
    ls.set("grl_roles", updated);
    window.dispatchEvent(new Event("grlRolesChange"));
  };

  const handleAdd = async () => {
    if (!form.id || !form.label) return showAlert("გთხოვთ შეავსოთ ID და სახელი", "შეცდომა");
    if (roles.find(r => r.id === form.id)) return showAlert("ეს ID უკვე გამოიყენება", "შეცდომა");
    const newRole = {
      id: form.id, label: form.label,
      labelShort: form.labelShort || form.label.toUpperCase().slice(0, 6),
      color: form.color, level: parseInt(form.level) || 10,
      glow: `${form.color}55`, bg: `${form.color}1a`, border: `${form.color}66`,
      badgeClass: "adm-badge-pink", icon: form.icon,
      description: form.description, duties: form.duties, isDefault: false,
    };
    saveRoles([...roles, newRole].sort((a, b) => b.level - a.level));
    resetForm(); setShow(false);
  };

  const handleUpdate = async () => {
    if (!form.label) return showAlert("სახელი სავალდებულოა", "შეცდომა");
    const updated = roles.map(r => r.id !== editingId ? r : {
      ...r, label: form.label,
      labelShort: form.labelShort || form.label.toUpperCase().slice(0, 6),
      color: form.color, level: parseInt(form.level) || r.level,
      description: form.description, duties: form.duties, icon: form.icon,
    });
    saveRoles(updated.sort((a, b) => b.level - a.level));
    setEditingId(null); resetForm(); setShow(false);
  };

  const handleDelete = async (roleId) => {
    const role = roles.find(r => r.id === roleId);
    if (!role || role.isDefault) return;
    const ok = await showConfirm(`"${role.label}" როლი სამუდამოდ წაიშლება.`, "როლის წაშლა");
    if (!ok) return;
    saveRoles(roles.filter(r => r.id !== roleId));
  };

  const startEdit = async (role) => {
    if (role.isDefault) return showAlert("სტანდარტული როლის რედაქტირება არ შეიძლება.", "შეზღუდვა");
    setEditingId(role.id);
    setForm({ id: role.id, label: role.label, labelShort: role.labelShort || "", color: role.color, level: role.level, description: role.description || "", duties: role.duties || "", icon: role.icon || "User" });
    setShow(true);
  };

  if (!show) return (
    <div style={{ marginBottom: 16 }}>
      <button onClick={() => setShow(true)} className="adm-btn adm-btn-primary" style={{ width: "100%", padding: "12px 16px" }}>
        <PlusCircle size={18} /> როლების მართვა
      </button>
    </div>
  );

  return (
    <div className="adm-role-manager adm-fade">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14, flexWrap: "wrap", gap: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Tag size={18} style={{ color: "var(--adm-pink)" }} />
          <span style={{ fontFamily: "var(--adm-font-d)", fontSize: 18, letterSpacing: "0.05em" }}>
            {editingId ? "როლის რედაქტირება" : "ახალი როლი"}
          </span>
        </div>
        <button onClick={() => { setShow(false); setEditingId(null); resetForm(); }} className="adm-btn adm-btn-ghost adm-btn-sm">
          <X size={14} /> დახურვა
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(190px, 1fr))", gap: 12, marginBottom: 14 }}>
        <div>
          <label className="adm-label">ID *</label>
          <input className="adm-input" value={form.id} disabled={!!editingId}
            onChange={e => setForm({ ...form, id: e.target.value })} placeholder="მაგ: mod" />
        </div>
        <div>
          <label className="adm-label">სახელი *</label>
          <input className="adm-input" value={form.label}
            onChange={e => setForm({ ...form, label: e.target.value })} placeholder="მაგ: მოდერატორი" />
        </div>
        <div>
          <label className="adm-label">მოკლე სახელი</label>
          <input className="adm-input" value={form.labelShort} maxLength={10}
            onChange={e => setForm({ ...form, labelShort: e.target.value })} placeholder="მაგ: MOD" />
        </div>
        <div>
          <label className="adm-label">დონე</label>
          <input className="adm-input" type="number" min={1} max={99} value={form.level}
            onChange={e => setForm({ ...form, level: e.target.value })} />
        </div>
        <div>
          <label className="adm-label">ფერი</label>
          <input className="adm-color-picker" type="color" value={form.color}
            onChange={e => setForm({ ...form, color: e.target.value })} />
        </div>
        <div>
          <label className="adm-label">ხატულა</label>
          <select className="adm-input" value={form.icon}
            onChange={e => setForm({ ...form, icon: e.target.value })} style={{ appearance: "auto" }}>
            {iconOptions.map(ic => <option key={ic} value={ic}>{ic}</option>)}
          </select>
        </div>
        <div style={{ gridColumn: "span 2" }}>
          <label className="adm-label">მოვალეობები</label>
          <input className="adm-input" value={form.duties}
            onChange={e => setForm({ ...form, duties: e.target.value })} placeholder="მოკლე აღწერა..." />
        </div>
      </div>

      <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginBottom: 16 }}>
        <button onClick={() => { setShow(false); setEditingId(null); resetForm(); }} className="adm-btn adm-btn-ghost adm-btn-sm">გაუქმება</button>
        {editingId
          ? <button onClick={handleUpdate} className="adm-btn adm-btn-success adm-btn-sm"><Save size={13} /> შენახვა</button>
          : <button onClick={handleAdd} className="adm-btn adm-btn-primary adm-btn-sm"><Plus size={13} /> დამატება</button>
        }
      </div>

      <div style={{ borderTop: "1px solid var(--adm-border-2)", paddingTop: 12 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: "var(--adm-muted)", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.1em" }}>
          არსებული როლები
        </div>
        {[...roles].sort((a, b) => b.level - a.level).map(role => (
          <div key={role.id} className="adm-role-item">
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ width: 18, height: 18, borderRadius: 5, background: role.color, display: "inline-block", flexShrink: 0 }} />
              <span style={{ fontWeight: 700 }}>{role.label}</span>
              <span style={{ fontSize: 10, color: "var(--adm-muted-2)", fontFamily: "var(--adm-font-m)" }}>({role.id})</span>
              <span style={{ fontSize: 10, padding: "1px 6px", borderRadius: 4, background: role.bg, color: role.color, fontWeight: 700 }}>Lv.{role.level}</span>
              {role.isDefault && <span style={{ fontSize: 8, padding: "1px 5px", borderRadius: 4, background: "oklch(0.72 0.22 5 / 0.1)", color: "var(--adm-pink)", fontWeight: 700 }}>სტანდ.</span>}
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              {!role.isDefault && <>
                <button onClick={() => startEdit(role)} className="adm-btn adm-btn-ghost adm-btn-sm" style={{ padding: "4px 8px" }}><Edit2 size={12} /></button>
                <button onClick={() => handleDelete(role.id)} className="adm-btn adm-btn-danger adm-btn-sm" style={{ padding: "4px 8px" }}><Trash2 size={12} /></button>
              </>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── STATUS BADGE ───────────────────────────────────────────────────────── */
function getStatusBadge(verdict) {
  if (!verdict) return { label: "განხილვაში", className: "adm-badge-yellow", icon: Clock };
  if (verdict === "approved") return { label: "დადასტურდა", className: "adm-badge-green", icon: CheckCircle2 };
  return { label: "უარყოფილია", className: "adm-badge-red", icon: XCircle };
}

/* ─── ADMIN LOGIN ────────────────────────────────────────────────────────── */
function AdminLogin({ onLogin }) {
  const [email, setEmail]     = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr]         = useState("");
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw]   = useState(false);

  const syncUserFromSupabase = async (userId, userEmail) => {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();
      
      if (error || !profile) return null;
      
      return {
        id: userId,
        username: profile.username || userEmail?.split('@')[0] || 'Admin',
        email: userEmail || '',
        password: password,
        role: profile.role || 'tec',
        isAdmin: profile.is_admin || false,
        avatarBg: profile.avatar_bg || "linear-gradient(135deg,#ff2d78,#8b00ff)",
        registeredAt: new Date().toISOString(),
      };
    } catch (e) {
      console.error('Sync error:', e);
      return null;
    }
  };

  const submit = async () => {
    setErr(""); setLoading(true);
    try {
      // 1. Sign in with Supabase
      const { data: { user }, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) { setErr("არასწორი ელ-ფოსტა ან პაროლი"); setLoading(false); return; }

      // 2. Load users from localStorage
      let users = loadUsers();
      let adminUser = users.find(u => u.id === user.id);

      // 3. If not found in localStorage, sync from Supabase
      if (!adminUser) {
        const syncedUser = await syncUserFromSupabase(user.id, user.email);
        if (!syncedUser || !syncedUser.isAdmin) {
          setErr("თქვენ არ გაქვთ ადმინისტრატორის უფლებები");
          await supabase.auth.signOut();
          setLoading(false);
          return;
        }
        adminUser = syncedUser;
        users.push(adminUser);
        ls.set("grl_users", users);
        window.dispatchEvent(new Event("grlAuthChange"));
      }

      // 4. Verify admin role
      const roles = loadRoles();
      if (!isUserAdmin(adminUser, roles)) {
        setErr("თქვენ არ გაქვთ ადმინისტრატორის უფლებები");
        await supabase.auth.signOut();
        setLoading(false);
        return;
      }

      // 5. Save session
      const sessionUser = {
        id: adminUser.id,
        username: adminUser.username,
        email: adminUser.email,
        role: normalizeRole(adminUser, roles),
        avatarBg: adminUser.avatarBg || "linear-gradient(135deg,#ff2d78,#8b00ff)",
      };
      ls.set("grl_admin_user", sessionUser);
      onLogin(sessionUser);

    } catch (e) {
      console.error("Login error:", e);
      setErr("დაფიქსირდა შეცდომა, სცადეთ თავიდან");
    }
    setLoading(false);
  };

  return (
    <div className="adm-root" style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", padding: 24 }}>
      <div className="adm-card" style={{ width: "100%", maxWidth: 400, padding: "36px 32px" }}>
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div className="adm-logo-icon" style={{ width: 64, height: 64, borderRadius: 18, fontSize: 28, margin: "0 auto 16px" }}>G</div>
          <div style={{ fontFamily: "var(--adm-font-d)", fontSize: 26, letterSpacing: "0.06em" }}>GRL ADMIN</div>
          <div style={{ fontSize: 14, color: "var(--adm-muted)", marginTop: 4 }}>საჩივრების მართვის სისტემა</div>
        </div>
        {err && (
          <div style={{ marginBottom: 16, padding: "12px 16px", borderRadius: 10, background: "oklch(0.70 0.22 25 / 0.10)", border: "1px solid oklch(0.70 0.22 25 / 0.3)", color: "var(--adm-red)", fontSize: 14, display: "flex", alignItems: "center", gap: 8 }}>
            <AlertCircle size={18} /> {err}
          </div>
        )}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <label className="adm-label"><Mail size={13} /> ელ-ფოსტა</label>
            <input className="adm-input" type="email" value={email} onChange={e => setEmail(e.target.value)}
              onKeyDown={e => e.key === "Enter" && submit()} placeholder="admin@example.com" />
          </div>
          <div>
            <label className="adm-label"><Lock size={13} /> პაროლი</label>
            <div style={{ position: "relative" }}>
              <input className="adm-input" type={showPw ? "text" : "password"} value={password}
                onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === "Enter" && submit()}
                placeholder="••••••••" style={{ paddingRight: "3rem" }} />
              <button type="button" onClick={() => setShowPw(!showPw)}
                style={{ position: "absolute", right: "1rem", top: "50%", transform: "translateY(-50%)", color: "var(--adm-muted-2)", background: "none", border: "none", cursor: "pointer" }}>
                {showPw ? <EyeOff size={18} /> : <EyeIcon size={18} />}
              </button>
            </div>
          </div>
          <button onClick={submit} disabled={loading} className="adm-btn adm-btn-primary" style={{ width: "100%", padding: 12, fontSize: 15, marginTop: 4 }}>
            {loading ? <Loader2 size={18} className="adm-spin" /> : <LogOut size={18} />}
            {loading ? "იტვირთება..." : "შესვლა"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── USERS MANAGEMENT ───────────────────────────────────────────────────── */
function UsersManagement({ adminUser, roles }) {
  const [users, setUsers]               = useState([]);
  const [show, setShow]                 = useState(false);
  const [search, setSearch]             = useState("");
  const [shownPw, setShownPw]           = useState({});
  const [editingPw, setEditingPw]       = useState(null);
  const [newPwVal, setNewPwVal]         = useState("");
  const [roleDropUser, setRoleDropUser] = useState(null);
  const roleRefs = useRef({});

  const refresh = useCallback(() => setUsers(loadUsers()), []);

  useEffect(() => { if (show) refresh(); }, [show, refresh]);

  useEffect(() => {
    const fn = () => { if (show) refresh(); };
    window.addEventListener("grlAuthChange", fn);
    window.addEventListener("storage", fn);
    return () => { window.removeEventListener("grlAuthChange", fn); window.removeEventListener("storage", fn); };
  }, [show, refresh]);

  useEffect(() => {
    const close = () => setRoleDropUser(null);
    window.addEventListener("scroll", close, true);
    return () => window.removeEventListener("scroll", close, true);
  }, []);

  const saveUsers = (updated) => {
    setUsers(updated);
    ls.set("grl_users", updated);
    window.dispatchEvent(new Event("grlAuthChange"));
  };

  const filtered = users.filter(u =>
    u.username?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  const togglePw    = (id) => setShownPw(prev => ({ ...prev, [id]: !prev[id] }));
  const startEditPw = (user) => { setEditingPw(user.id); setNewPwVal(user.password || ""); };

  const savePw = (userId) => {
    if (!newPwVal.trim()) return;
    saveUsers(users.map(u => u.id !== userId ? u : { ...u, password: newPwVal }));
    setEditingPw(null); setNewPwVal("");
  };

  const handleRoleSelect = (user, newRoleId) => {
    const role = getRoleById(newRoleId, roles);
    const willBeAdmin = (role?.level || 0) >= 8;
    saveUsers(users.map(u => u.id !== user.id ? u : { ...u, role: newRoleId, isAdmin: willBeAdmin }));
    const cu = ls.get("grl_admin_user");
    if (cu && cu.id === user.id) ls.set("grl_admin_user", { ...cu, role: newRoleId });
    setRoleDropUser(null);
  };

  const deleteUser = async (userId) => {
    const user = users.find(u => u.id === userId);
    const ok = await showConfirm(`"${user?.username}" მომხმარებელი სამუდამოდ წაიშლება.`, "მომხმარებლის წაშლა");
    if (!ok) return;
    saveUsers(users.filter(u => u.id !== userId));
    const cu = ls.get("grl_admin_user");
    if (cu && cu.id === userId) localStorage.removeItem("grl_admin_user");
  };

  if (!show) return (
    <div style={{ marginBottom: 24 }}>
      <button onClick={() => setShow(true)} className="adm-btn adm-btn-primary" style={{ width: "100%", padding: 16, fontSize: 16 }}>
        <UserCog size={20} /> მომხმარებლების მართვა
      </button>
    </div>
  );

  const roleCounts = roles.reduce((acc, r) => {
    acc[r.id] = users.filter(u => normalizeRole(u, roles) === r.id).length;
    return acc;
  }, {});

  return (
    <div className="adm-card" style={{ marginBottom: 24 }}>
      <div className="adm-card-header">
        <div className="adm-card-title"><Users size={18} style={{ display: "inline", marginRight: 8 }} />მომხმარებლები ({users.length})</div>
        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
          {roles.map(r => (
            <span key={r.id} style={{ fontSize: 11, color: r.color, fontWeight: 700, fontFamily: "var(--adm-font-m)", opacity: roleCounts[r.id] === 0 ? 0.35 : 1 }}>
              {r.labelShort}: {roleCounts[r.id] || 0}
            </span>
          ))}
          <button onClick={() => setShow(false)} className="adm-btn adm-btn-ghost adm-btn-sm">დახურვა</button>
        </div>
      </div>

      <div style={{ padding: "12px 18px", borderBottom: "1px solid var(--adm-border-2)" }}>
        <div className="adm-input" style={{ padding: "6px 12px", display: "flex", alignItems: "center", gap: 8 }}>
          <Search size={15} style={{ color: "var(--adm-muted-2)", flexShrink: 0 }} />
          <input type="text" placeholder="ძიება..." value={search} onChange={e => setSearch(e.target.value)}
            style={{ background: "none", border: "none", color: "var(--adm-text)", outline: "none", fontSize: 13, width: "100%" }} />
        </div>
      </div>

      <div className="adm-scroll" style={{ maxHeight: 420, overflowY: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead style={{ background: "oklch(0.72 0.22 5 / 0.08)", position: "sticky", top: 0, zIndex: 1 }}>
            <tr>
              {["მომხმარებელი", "ელ-ფოსტა", "პაროლი", "როლი", "მოქმედებები"].map((h, i) => (
                <th key={h} style={{ padding: "10px 14px", textAlign: i === 4 ? "right" : "left", fontWeight: 700, color: "var(--adm-muted)", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.1em", borderBottom: "1px solid var(--adm-border-2)" }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0
              ? <tr><td colSpan={5} className="adm-empty">მომხმარებლები არ მოიძებნა</td></tr>
              : filtered.map(user => {
                const isSelf      = user.id === adminUser?.id || user.username?.toLowerCase() === adminUser?.username?.toLowerCase();
                const userRoleId  = normalizeRole(user, roles);
                const userRole    = getRoleById(userRoleId, roles);
                const isRoleOpen  = roleDropUser?.id === user.id;
                const pwVisible   = shownPw[user.id];
                const isEditingPw = editingPw === user.id;

                return (
                  <tr key={user.id} style={{ borderBottom: "1px solid var(--adm-border-2)" }}>
                    <td style={{ padding: "10px 14px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div style={{ width: 30, height: 30, borderRadius: "50%", background: user.avatarBg || "linear-gradient(135deg,#ff2d78,#8b00ff)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 12, fontWeight: 700, flexShrink: 0 }}>
                          {user.username?.[0]?.toUpperCase()}
                        </div>
                        <span style={{ fontWeight: 700 }}>{user.username}</span>
                        {isSelf && <span className="adm-badge adm-badge-pink" style={{ fontSize: 9 }}>თქვენ</span>}
                      </div>
                    </td>
                    <td style={{ padding: "10px 14px", color: "var(--adm-muted)" }}>{user.email || "—"}</td>
                    <td style={{ padding: "10px 14px" }}>
                      {isEditingPw ? (
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <input autoFocus type="text" value={newPwVal}
                            onChange={e => setNewPwVal(e.target.value)}
                            onKeyDown={e => { if (e.key === "Enter") savePw(user.id); if (e.key === "Escape") { setEditingPw(null); setNewPwVal(""); } }}
                            placeholder="ახალი პაროლი"
                            style={{ background: "oklch(0.12 0.02 285 / 0.6)", border: "1px solid oklch(0.72 0.22 5 / 0.4)", borderRadius: 6, padding: "4px 8px", color: "var(--adm-text)", fontSize: 12, outline: "none", width: 110, fontFamily: "var(--adm-font-m)" }} />
                          <button onClick={() => savePw(user.id)} className="adm-btn adm-btn-success adm-btn-sm" style={{ padding: "4px 8px" }}><Check size={12} /></button>
                          <button onClick={() => { setEditingPw(null); setNewPwVal(""); }} className="adm-btn adm-btn-ghost adm-btn-sm" style={{ padding: "4px 8px" }}><X size={12} /></button>
                        </div>
                      ) : (
                        <div style={{ display: "flex", alignItems: "center", gap: 6, fontFamily: "var(--adm-font-m)", fontSize: 12 }}>
                          <span style={{ color: pwVisible ? "var(--adm-yellow)" : "var(--adm-muted-2)", letterSpacing: pwVisible ? "normal" : 2 }}>
                            {pwVisible ? (user.password || "—") : "••••••••"}
                          </span>
                          <button onClick={() => togglePw(user.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--adm-muted-2)", padding: 2, display: "flex", alignItems: "center" }}>
                            {pwVisible ? <EyeOff size={13} /> : <EyeIcon size={13} />}
                          </button>
                          {!isSelf && (
                            <button onClick={() => startEditPw(user)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--adm-muted-2)", padding: 2, display: "flex", alignItems: "center" }}>
                              <Edit2 size={12} />
                            </button>
                          )}
                        </div>
                      )}
                    </td>
                    <td style={{ padding: "10px 14px" }}>
                      <RoleBadge roleId={userRoleId} roles={roles} />
                    </td>
                    <td style={{ padding: "10px 14px", textAlign: "right" }}>
                      {isSelf ? (
                        <span style={{ fontSize: 11, color: "var(--adm-muted)" }}>
                          <Lock size={12} style={{ display: "inline", marginRight: 3 }} />შეზღუდული
                        </span>
                      ) : (
                        <div style={{ display: "flex", gap: 5, justifyContent: "flex-end", position: "relative" }}>
                          <button
                            ref={el => roleRefs.current[user.id] = el}
                            onClick={() => setRoleDropUser(isRoleOpen ? null : user)}
                            className="adm-btn adm-btn-sm"
                            style={{ background: isRoleOpen ? userRole?.bg : "oklch(1 0 0 / 0.06)", color: isRoleOpen ? userRole?.color : "var(--adm-muted)", border: `1px solid ${isRoleOpen ? userRole?.border : "var(--adm-border-2)"}`, gap: 5 }}>
                            <Shield size={12} />
                            <ChevronDown size={11} style={{ transition: "transform .2s", transform: isRoleOpen ? "rotate(180deg)" : "none" }} />
                          </button>
                          <button onClick={() => deleteUser(user.id)} className="adm-btn adm-btn-danger adm-btn-sm">
                            <Trash2 size={12} />
                          </button>
                          {isRoleOpen && (
                            <RoleDropdown user={user} roles={roles}
                              onSelect={handleRoleSelect}
                              onClose={() => setRoleDropUser(null)}
                              triggerRef={{ current: roleRefs.current[user.id] }} />
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>

      <div style={{ padding: "11px 18px", borderTop: "1px solid var(--adm-border-2)", display: "flex", justifyContent: "space-between", fontSize: 12, color: "var(--adm-muted)" }}>
        <span>სულ: {users.length}</span>
        <div style={{ display: "flex", gap: 12 }}>
          {roles.filter(r => r.id !== "player").map(r => (
            <span key={r.id} style={{ color: r.color }}>{r.labelShort}: {roleCounts[r.id] || 0}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── CV CARD ──────────────────────────────────────────────────────────────  */
const CV_FIELD_LABELS = {
  fullName: "სრული სახელი", age: "ასაკი", nickname: "ნიკი",
  experience: "გამოცდილება", whyMe: "რატომ?", activeHours: "საათები/დღე",
  micAvailable: "მიკროფონი", extraInfo: "დამატებითი",
};

function CVCard({ cv, adminUser, onVerdict, onReply, onClose }) {
  const [verdictMode, setVerdictMode] = useState(null);
  const [reason, setReason]           = useState("");
  const [replyOpen, setReplyOpen]     = useState(false);
  const [replyText, setReplyText]     = useState("");

  let fields = {};
  try { fields = typeof cv.fields === "string" ? JSON.parse(cv.fields) : (cv.fields || {}); } catch {}

  const status     = cv.status;
  const statusInfo = getStatusBadge(status);
  const StatusIcon = statusInfo.icon;

  const handleClose = async () => {
    const ok = await showConfirm("ვაკანსია დაიხურება და CV-ების მიღება შეწყდება.", "ვაკანსიის დახურვა");
    if (ok) onClose(cv.id);
  };

  return (
    <div className="adm-cv-card adm-fade">
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
          <div style={{ width: 36, height: 36, borderRadius: "50%", background: cv.authorAvatarBg || "linear-gradient(135deg,#ec4899,#f43f5e)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 14, flexShrink: 0 }}>
            {cv.author?.[0]?.toUpperCase()}
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: 14 }}>{cv.author}</div>
            <div style={{ fontSize: 11, color: "var(--adm-muted)" }}><Briefcase size={11} style={{ display: "inline", marginRight: 4 }} />{cv.vacancyTitle}</div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
          {cv.hired && <span className="adm-badge adm-badge-green"><CheckCircle2 size={11} /> აყვანილია</span>}
          {cv.vacancyClosed && <span className="adm-badge adm-badge-cyan"><Lock size={11} /> დახურულია</span>}
          <span className={`adm-badge ${statusInfo.className}`}><StatusIcon size={11} /> {statusInfo.label}</span>
          <span style={{ fontSize: 11, color: "var(--adm-muted-2)" }}>{cv.submittedAt ? new Date(cv.submittedAt).toLocaleString("ka-GE") : ""}</span>
        </div>
      </div>

      <div className="adm-cv-field-grid">
        {Object.keys(CV_FIELD_LABELS).map(key => (
          <div key={key} className="adm-cv-field">
            <div className="adm-cv-field-label">{CV_FIELD_LABELS[key]}</div>
            <div className="adm-cv-field-value">{fields[key] || "—"}</div>
          </div>
        ))}
      </div>

      {status && cv.statusReason && (
        <div className={`adm-verdict-box ${status === "approved" ? "adm-verdict-approved" : "adm-verdict-rejected"}`} style={{ marginBottom: 14 }}>
          {status === "approved" ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
          <div style={{ fontSize: 13 }}>{cv.statusReason}</div>
        </div>
      )}

      {cv.adminReply && (
        <div className="adm-post adm-post-admin" style={{ marginBottom: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
            <div style={{ width: 24, height: 24, borderRadius: "50%", background: adminUser?.avatarBg || "linear-gradient(135deg,#ff2d78,#8b00ff)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 10, fontWeight: 700 }}>
              {adminUser?.username?.[0]?.toUpperCase()}
            </div>
            <span style={{ fontWeight: 700, fontSize: 12, color: "var(--adm-pink)" }}>ადმინის პასუხი</span>
          </div>
          <p style={{ fontSize: 13, margin: 0, whiteSpace: "pre-wrap" }}>{cv.adminReply}</p>
        </div>
      )}

      {!cv.vacancyClosed && !cv.hired && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap", borderTop: "1px solid var(--adm-border-2)", paddingTop: 12, marginTop: 4 }}>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {!status && !verdictMode && (
              <>
                <button onClick={() => setVerdictMode("approved")} className="adm-btn adm-btn-success adm-btn-sm"><Check size={13} /> დადასტურება</button>
                <button onClick={() => setVerdictMode("rejected")} className="adm-btn adm-btn-danger adm-btn-sm"><X size={13} /> უარყოფა</button>
              </>
            )}
            <button onClick={() => setReplyOpen(o => !o)} className="adm-btn adm-btn-ghost adm-btn-sm"><MessageSquare size={13} /> პასუხი</button>
            {!status && (
              <button onClick={handleClose} className="adm-btn adm-btn-danger adm-btn-sm"><Lock size={13} /> დახურვა</button>
            )}
          </div>
        </div>
      )}

      {verdictMode && !status && (
        <div style={{ marginTop: 14 }}>
          <textarea className="adm-input" value={reason} onChange={e => setReason(e.target.value)} style={{ minHeight: 60, marginBottom: 10 }} placeholder="მიზეზი (არასავალდებულო)..." />
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
            <button onClick={() => { setVerdictMode(null); setReason(""); }} className="adm-btn adm-btn-ghost adm-btn-sm">გაუქმება</button>
            <button onClick={() => { onVerdict(cv.id, verdictMode, reason); setVerdictMode(null); setReason(""); }}
              className={`adm-btn adm-btn-sm ${verdictMode === "approved" ? "adm-btn-success" : "adm-btn-danger"}`}>
              {verdictMode === "approved" ? "დადასტურება" : "უარყოფა"}
            </button>
          </div>
        </div>
      )}

      {replyOpen && (
        <div style={{ marginTop: 12, display: "flex", gap: 10 }}>
          <textarea className="adm-input" value={replyText} onChange={e => setReplyText(e.target.value)} style={{ minHeight: 56, flex: 1 }} placeholder="დაწერე პასუხი..." />
          <button onClick={() => { onReply(cv.id, replyText); setReplyText(""); setReplyOpen(false); }}
            disabled={!replyText.trim()} className="adm-btn adm-btn-primary" style={{ alignSelf: "flex-end" }}>
            <Send size={14} />
          </button>
        </div>
      )}
    </div>
  );
}

/* ─── CVs SECTION ────────────────────────────────────────────────────────── */
function CVsSection({ adminUser }) {
  const [cvs, setCvs]       = useState([]);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  const refresh = useCallback(() => setCvs(loadCVs()), []);

  useEffect(() => {
    refresh();
    const fn = () => refresh();
    window.addEventListener("grlCVsChange", fn);
    window.addEventListener("storage", fn);
    const iv = setInterval(refresh, 3000);
    return () => { window.removeEventListener("grlCVsChange", fn); window.removeEventListener("storage", fn); clearInterval(iv); };
  }, [refresh]);

  const counts = {
    all: cvs.length,
    pending: cvs.filter(c => !c.status).length,
    approved: cvs.filter(c => c.status === "approved").length,
    rejected: cvs.filter(c => c.status === "rejected").length,
    hired: cvs.filter(c => c.hired).length,
  };

  const filtered = cvs.filter(c => {
    if (filter === "hired" && !c.hired) return false;
    if (filter !== "all" && filter !== "hired" && (c.status || "pending") !== filter) return false;
    if (search.trim()) { const q = search.toLowerCase(); return c.author?.toLowerCase().includes(q) || c.vacancyTitle?.toLowerCase().includes(q); }
    return true;
  });

  const saveCVs = (updated) => { ls.set("grl_cvs", updated); setCvs(updated); window.dispatchEvent(new Event("grlCVsChange")); };

  const handleVerdict = (cvId, verdict, reason) =>
    saveCVs(cvs.map(c => c.id !== cvId ? c : { ...c, status: verdict, statusReason: reason }));
  const handleReply = (cvId, text) =>
    saveCVs(cvs.map(c => c.id !== cvId ? c : { ...c, adminReply: text, adminReplyDate: new Date().toISOString() }));
  const handleClose = (cvId) =>
    saveCVs(cvs.map(c => c.id !== cvId ? c : { ...c, vacancyClosed: true }));

  return (
    <div className="adm-fade">
      <div className="adm-stat-grid" style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 16, marginBottom: 24 }}>
        {[
          { id: "all", label: "სულ CV", val: counts.all, color: "var(--adm-cyan)" },
          { id: "pending", label: "მოლოდინში", val: counts.pending, color: "var(--adm-yellow)" },
          { id: "approved", label: "დადასტურდა", val: counts.approved, color: "var(--adm-green)" },
          { id: "rejected", label: "უარყოფილი", val: counts.rejected, color: "var(--adm-red)" },
          { id: "hired", label: "აყვანილი", val: counts.hired, color: "var(--adm-pink)" },
        ].map(s => (
          <div key={s.id} className="adm-stat-card" onClick={() => setFilter(s.id)}
            style={{ cursor: "pointer", borderColor: filter === s.id ? s.color : "var(--adm-border)", background: filter === s.id ? `color-mix(in oklab, ${s.color} 10%, var(--adm-card))` : "var(--adm-card)" }}>
            <div style={{ fontFamily: "var(--adm-font-d)", fontSize: 34, color: s.color, lineHeight: 1, textAlign: "right" }}>{s.val}</div>
            <div style={{ fontSize: 14, fontWeight: 700, marginTop: 6 }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16, flexWrap: "wrap", gap: 12 }}>
        <div style={{ fontFamily: "var(--adm-font-d)", fontSize: 22, letterSpacing: "0.05em" }}>CV-ების მართვა</div>
        <div className="adm-input" style={{ padding: "6px 12px", width: 240, display: "flex", alignItems: "center", gap: 8 }}>
          <Search size={16} style={{ color: "var(--adm-muted-2)" }} />
          <input type="text" placeholder="ძიება..." value={search} onChange={e => setSearch(e.target.value)}
            style={{ background: "none", border: "none", color: "var(--adm-text)", outline: "none", fontSize: 13, width: "100%" }} />
        </div>
      </div>

      {filtered.length === 0
        ? <div className="adm-card"><div className="adm-empty"><Briefcase size={32} style={{ opacity: 0.3, marginBottom: 12 }} /><div>CV არ მოიძებნა</div></div></div>
        : filtered.map(cv => (
          <CVCard key={cv.id} cv={cv} adminUser={adminUser}
            onVerdict={handleVerdict} onReply={handleReply} onClose={handleClose} />
        ))
      }
    </div>
  );
}

/* ─── COMPLAINTS ──────────────────────────────────────────────────────────── */
const COMPLAINT_IDS = ["complaint-admin", "complaint-player"];
const SUBFORUM_INFO = {
  "complaint-admin":  { icon: "⚠️", title: "საჩივარი ადმინისტრატორზე" },
  "complaint-player": { icon: "👤", title: "საჩივარი მოთამაშეზე" },
};

function ComplaintsSection({ adminUser }) {
  const [threads, setThreads]         = useState([]);
  const [filter, setFilter]           = useState("all");
  const [search, setSearch]           = useState("");
  const [selected, setSelected]       = useState(null);
  const [verdictMode, setVerdictMode] = useState(null);
  const [reason, setReason]           = useState("");
  const [reply, setReply]             = useState("");
  const [saving, setSaving]           = useState(false);

  const refresh = useCallback(() => setThreads(loadThreads()), []);

  useEffect(() => {
    refresh();
    const fn = () => refresh();
    window.addEventListener("storage", fn);
    const iv = setInterval(refresh, 3000);
    return () => { window.removeEventListener("storage", fn); clearInterval(iv); };
  }, [refresh]);

  const complaints = threads.filter(t => COMPLAINT_IDS.includes(t.subforumId));

  const filtered = complaints.filter(t => {
    if (filter !== "all" && (t.verdict || "pending") !== filter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return t.title?.toLowerCase().includes(q) || t.author?.toLowerCase().includes(q);
    }
    return true;
  });

  const counts = {
    all: complaints.length,
    pending: complaints.filter(t => !t.verdict).length,
    approved: complaints.filter(t => t.verdict === "approved").length,
    rejected: complaints.filter(t => t.verdict === "rejected").length,
  };

  const saveThreads = (updated) => { ls.set("grl_threads", updated); setThreads(updated); };

  const handleReply = () => {
    if (!reply.trim() || !selected) return;
    setSaving(true);
    const post = {
      id: `p-${Date.now()}`, author: adminUser.username,
      avatarBg: adminUser.avatarBg || "linear-gradient(135deg,#ff2d78,#8b00ff)",
      role: "ადმინისტრატორი", roleColor: "#ff2d78",
      content: reply, date: new Date().toLocaleString("ka-GE"),
      likes: 0, isAdminPost: true, isUserReply: true,
    };
    const updated = threads.map(t => t.id !== selected.id ? t : {
      ...t, posts: [...(t.posts || []), post], repliesCount: (t.repliesCount || 0) + 1,
    });
    saveThreads(updated);
    setSelected(updated.find(t => t.id === selected.id) || null);
    setReply(""); setSaving(false);
  };

  const handleVerdict = () => {
    if (!verdictMode || !selected) return;
    setSaving(true);
    const content = verdictMode === "approved"
      ? `✅ **საჩივარი დადასტურებულია**\n\n${reason ? `**მიზეზი:** ${reason}` : "ადმინისტრაციის გადაწყვეტილებით."}`
      : `❌ **საჩივარი უარყოფილია**\n\n${reason ? `**მიზეზი:** ${reason}` : "ადმინისტრაციის გადაწყვეტილებით."}`;
    const post = {
      id: `p-${Date.now()}`, author: adminUser.username,
      avatarBg: adminUser.avatarBg || "linear-gradient(135deg,#ff2d78,#8b00ff)",
      role: "ადმინისტრატორი", roleColor: "#ff2d78",
      content, date: new Date().toLocaleString("ka-GE"),
      likes: 0, isAdminPost: true, isUserReply: true,
    };
    const updated = threads.map(t => t.id !== selected.id ? t : {
      ...t, verdict: verdictMode, verdictReason: reason,
      label: verdictMode === "approved" ? "დადასტურებულია" : "უარყოფილია",
      allowReplies: false, posts: [...(t.posts || []), post],
    });
    saveThreads(updated);
    setSelected(updated.find(t => t.id === selected.id) || null);
    setVerdictMode(null); setReason(""); setSaving(false);
  };

  const statusInfo = selected ? getStatusBadge(selected.verdict) : null;

  return (
    <div>
      <div className="adm-stat-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 28 }}>
        {[
          { id: "all", label: "სულ", val: counts.all, color: "var(--adm-pink)" },
          { id: "pending", label: "მოლოდინში", val: counts.pending, color: "var(--adm-yellow)" },
          { id: "approved", label: "დადასტურდა", val: counts.approved, color: "var(--adm-green)" },
          { id: "rejected", label: "უარყოფილი", val: counts.rejected, color: "var(--adm-red)" },
        ].map(s => (
          <div key={s.id} className="adm-stat-card" onClick={() => setFilter(s.id)}
            style={{ cursor: "pointer", borderColor: filter === s.id ? s.color : "var(--adm-border)", background: filter === s.id ? `color-mix(in oklab, ${s.color} 10%, var(--adm-card))` : "var(--adm-card)" }}>
            <div style={{ position: "absolute", top: -20, right: -20, width: 100, height: 100, borderRadius: "50%", filter: "blur(40px)", background: s.color, opacity: 0.15 }} />
            <div style={{ fontFamily: "var(--adm-font-d)", fontSize: 34, color: s.color, lineHeight: 1, textAlign: "right" }}>{s.val}</div>
            <div style={{ fontSize: 14, fontWeight: 700, marginTop: 6 }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16, flexWrap: "wrap", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ fontFamily: "var(--adm-font-d)", fontSize: 22 }}>საჩივრების მართვა</div>
          <span className="adm-badge adm-badge-pink">{complaints.length} ჯამში</span>
        </div>
        <div className="adm-input" style={{ padding: "6px 12px", width: 200, display: "flex", alignItems: "center", gap: 8 }}>
          <Search size={16} style={{ color: "var(--adm-muted-2)" }} />
          <input type="text" placeholder="ძიება..." value={search} onChange={e => setSearch(e.target.value)}
            style={{ background: "none", border: "none", color: "var(--adm-text)", outline: "none", fontSize: 13, width: "100%" }} />
        </div>
      </div>

      <div className="adm-split" style={{ display: "flex", gap: 18, height: "calc(100vh - 560px)", minHeight: 420 }}>
        <div style={{ width: 340, flexShrink: 0 }}>
          <div className="adm-card adm-scroll" style={{ height: "100%", overflowY: "auto" }}>
            {filtered.length === 0 ? (
              <div className="adm-empty"><MessageSquare size={32} style={{ opacity: 0.3, marginBottom: 12 }} /><div>საჩივრები არ არის</div></div>
            ) : filtered.map(t => {
              const sub = SUBFORUM_INFO[t.subforumId];
              const st  = getStatusBadge(t.verdict);
              const StIcon = st.icon;
              return (
                <div key={t.id} onClick={() => { setSelected(t); setVerdictMode(null); setReason(""); setReply(""); }}
                  className={`adm-list-item${selected?.id === t.id ? " selected" : ""}`}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 5, flexWrap: "wrap" }}>
                      <span className={`adm-badge ${st.className}`}><StIcon size={12} /> {st.label}</span>
                      <span style={{ fontSize: 11, color: "var(--adm-muted)" }}>{sub?.icon} {sub?.title}</span>
                    </div>
                    <div style={{ fontWeight: 700, fontSize: 14, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.title}</div>
                    <div style={{ fontSize: 12, color: "var(--adm-muted)", marginTop: 3 }}><User size={12} style={{ display: "inline", marginRight: 4 }} />{t.author} · {t.date}</div>
                  </div>
                  <div style={{ fontSize: 11, color: "var(--adm-muted-2)", textAlign: "right", flexShrink: 0 }}>
                    <div>{t.posts?.length || 0} პ</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="adm-card" style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          {!selected ? (
            <div className="adm-empty" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", gap: 12 }}>
              <div style={{ fontSize: 48, opacity: 0.3 }}>📋</div>
              <div style={{ fontSize: 16, fontWeight: 600 }}>აირჩიე საჩივარი</div>
            </div>
          ) : (
            <>
              <div className="adm-card-header">
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 6, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{selected.title}</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                    <span style={{ fontSize: 13, color: "var(--adm-muted)" }}><User size={13} style={{ display: "inline", marginRight: 4 }} />{selected.author}</span>
                    <span className={`adm-badge ${statusInfo.className}`}><statusInfo.icon size={12} /> {statusInfo.label}</span>
                    <span style={{ fontSize: 12, color: "var(--adm-muted-2)" }}>{selected.date}</span>
                  </div>
                </div>
                {!selected.verdict && (
                  <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                    <button onClick={() => setVerdictMode(verdictMode === "approved" ? null : "approved")}
                      className={`adm-btn adm-btn-sm ${verdictMode === "approved" ? "adm-btn-success" : "adm-btn-ghost"}`}>
                      <Check size={14} /> დადასტურება
                    </button>
                    <button onClick={() => setVerdictMode(verdictMode === "rejected" ? null : "rejected")}
                      className={`adm-btn adm-btn-sm ${verdictMode === "rejected" ? "adm-btn-danger" : "adm-btn-ghost"}`}>
                      <X size={14} /> უარყოფა
                    </button>
                  </div>
                )}
              </div>

              <div className="adm-scroll" style={{ flex: 1, overflowY: "auto", padding: "18px 20px" }}>
                {(selected.posts || []).map(post => (
                  <div key={post.id} className={`adm-post ${post.isAdminPost ? "adm-post-admin" : "adm-post-user"}`}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                      <div style={{ width: 32, height: 32, borderRadius: "50%", background: post.avatarBg || "linear-gradient(135deg,#ec4899,#f43f5e)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 13, fontWeight: 700, flexShrink: 0 }}>
                        {post.author?.[0]?.toUpperCase()}
                      </div>
                      <div>
                        <span style={{ fontWeight: 700, fontSize: 14, color: post.isAdminPost ? "var(--adm-pink)" : "var(--adm-text)" }}>{post.author}</span>
                        {post.isAdminPost && <span className="adm-badge adm-badge-pink" style={{ fontSize: 9, marginLeft: 8 }}>ადმინი</span>}
                        <div style={{ fontSize: 11, color: "var(--adm-muted-2)" }}>{post.date}</div>
                      </div>
                    </div>
                    <p style={{ color: "var(--adm-text)", fontSize: 14, lineHeight: 1.7, margin: 0, whiteSpace: "pre-wrap" }}>{post.content}</p>
                  </div>
                ))}
              </div>

              {verdictMode && !selected.verdict && (
                <div style={{ padding: "16px 20px", borderTop: "1px solid var(--adm-border-2)", background: verdictMode === "approved" ? "oklch(0.78 0.18 155 / 0.05)" : "oklch(0.70 0.22 25 / 0.05)" }}>
                  <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 10, color: verdictMode === "approved" ? "var(--adm-green)" : "var(--adm-red)" }}>
                    {verdictMode === "approved"
                      ? <><CheckCircle2 size={16} style={{ display: "inline", marginRight: 6 }} />დადასტურება — მიზეზი</>
                      : <><XCircle size={16} style={{ display: "inline", marginRight: 6 }} />უარყოფა — მიზეზი</>
                    }
                  </div>
                  <textarea className="adm-input" value={reason} onChange={e => setReason(e.target.value)} style={{ minHeight: 70, marginBottom: 10 }} placeholder="გადაწყვეტილების მიზეზი..." />
                  <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
                    <button onClick={() => { setVerdictMode(null); setReason(""); }} className="adm-btn adm-btn-ghost adm-btn-sm">გაუქმება</button>
                    <button onClick={handleVerdict} disabled={saving}
                      className={`adm-btn adm-btn-sm ${verdictMode === "approved" ? "adm-btn-success" : "adm-btn-danger"}`}>
                      {saving ? <Loader2 size={14} className="adm-spin" /> : verdictMode === "approved" ? "დადასტურება" : "უარყოფა"}
                    </button>
                  </div>
                </div>
              )}

              {!verdictMode && (
                <div style={{ padding: "14px 20px", borderTop: "1px solid var(--adm-border-2)" }}>
                  <div style={{ display: "flex", gap: 12 }}>
                    <textarea className="adm-input" value={reply} onChange={e => setReply(e.target.value)} style={{ minHeight: 60, flex: 1 }} placeholder="დაწერე პასუხი..." />
                    <button onClick={handleReply} disabled={saving || !reply.trim()} className="adm-btn adm-btn-primary" style={{ alignSelf: "flex-end", padding: "8px 20px" }}>
                      <Send size={16} /> გაგზავნა
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   MAIN ADMIN PANEL
═══════════════════════════════════════════════════════════════════════════ */
export default function AdminPanel() {
  useEffect(() => { injectAdminStyles(); }, []);

  const [adminUser, setAdminUser]         = useState(loadAdminUser);
  const [roles, setRoles]                 = useState(loadRoles);
  const [activeSection, setActiveSection] = useState("complaints");

  useEffect(() => {
    const fn = () => setRoles(loadRoles());
    window.addEventListener("grlRolesChange", fn);
    window.addEventListener("storage", fn);
    return () => { window.removeEventListener("grlRolesChange", fn); window.removeEventListener("storage", fn); };
  }, []);

  useEffect(() => {
    const fn = () => {
      const stored = ls.get("grl_admin_user");
      if (!stored) return;
      const found = loadUsers().find(u => u.id === stored.id);
      if (found) {
        const r = loadRoles();
        const updated = { ...stored, role: normalizeRole(found, r) };
        ls.set("grl_admin_user", updated);
        setAdminUser(updated);
      }
    };
    window.addEventListener("grlAuthChange", fn);
    return () => window.removeEventListener("grlAuthChange", fn);
  }, []);

  const [cvsCount, setCvsCount] = useState(() => loadCVs().length);
  useEffect(() => {
    const fn = () => setCvsCount(loadCVs().length);
    window.addEventListener("grlCVsChange", fn);
    window.addEventListener("storage", fn);
    const iv = setInterval(fn, 3000);
    return () => { window.removeEventListener("grlCVsChange", fn); window.removeEventListener("storage", fn); clearInterval(iv); };
  }, []);

  const [complCount, setComplCount] = useState(() => loadThreads().filter(t => COMPLAINT_IDS.includes(t.subforumId)).length);
  useEffect(() => {
    const iv = setInterval(() => setComplCount(loadThreads().filter(t => COMPLAINT_IDS.includes(t.subforumId)).length), 3000);
    return () => clearInterval(iv);
  }, []);

  const handleLogout = () => { localStorage.removeItem("grl_admin_user"); setAdminUser(null); };

  if (!adminUser) return <><AdminLogin onLogin={u => setAdminUser(u)} /><ModalRoot /></>;

  return (
    <div className="adm-root">
      <ModalRoot />

      <header className="adm-nav">
        <div className="adm-nav-inner">
          <div className="adm-logo">
            <div className="adm-logo-icon">G</div>
            <span className="adm-logo-text">GRL ADMIN</span>
            <span className="adm-logo-badge">{activeSection === "cvs" ? "CV-ები" : "საჩივრები"}</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <button onClick={() => window.location.href = "/forum"} className="adm-btn adm-btn-ghost adm-btn-sm">
              <ArrowLeft size={14} /> ფორუმზე
            </button>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--adm-green)", boxShadow: "0 0 10px var(--adm-green)" }} />
              <span style={{ fontSize: 14, fontWeight: 600 }}>{adminUser.username}</span>
              <RoleBadge roleId={adminUser.role || "tec"} roles={roles} />
            </div>
            <button onClick={handleLogout} className="adm-btn adm-btn-danger adm-btn-sm">
              <LogOut size={14} /> გასვლა
            </button>
          </div>
        </div>
      </header>

      <main style={{ maxWidth: 1280, margin: "0 auto", padding: "24px 28px", position: "relative", zIndex: 1 }}>
        <RoleManager roles={roles} setRoles={setRoles} />
        <UsersManagement adminUser={adminUser} roles={roles} />

        <div className="adm-tabs">
          <button className={`adm-tab${activeSection === "complaints" ? " active" : ""}`} onClick={() => setActiveSection("complaints")}>
            <MessageSquare size={15} /> საჩივრები <span className="adm-tab-count">{complCount}</span>
          </button>
          <button className={`adm-tab${activeSection === "cvs" ? " active" : ""}`} onClick={() => setActiveSection("cvs")}>
            <Briefcase size={15} /> CV-ები <span className="adm-tab-count">{cvsCount}</span>
          </button>
        </div>

        {activeSection === "complaints" && <ComplaintsSection adminUser={adminUser} />}
        {activeSection === "cvs"        && <CVsSection adminUser={adminUser} />}   
      </main>
    </div>
  );
}

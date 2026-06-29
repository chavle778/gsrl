import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import {
  Shield, MessageSquare, CheckCircle2, XCircle, Clock, AlertCircle,
  User, ChevronRight, Send, Search, Filter, ArrowLeft, Home,
  Users, BookOpen, Settings, LogOut, Plus, Trash2, Eye,
  Check, X, Loader2, Bell, Calendar, Hash, LogIn, Lock,
  UserCog, UserPlus, ShieldOff, Mail, EyeOff, Eye as EyeIcon,
  ChevronDown, Star, Crown, Swords, UserCheck, Briefcase,
  Edit2, Save, X as XIcon, PlusCircle, Tag, Award, Sparkles
} from "lucide-react";
import { supabase } from "../src/supabaseClient";

/* ─── ICON MAP ────────────────────────────────────────────────────────────── */
const ICON_MAP = {
  User, Shield, Star, Crown, Swords, UserCheck, Briefcase, Award, Sparkles,
};
const getIconComponent = (iconName) => ICON_MAP[iconName] || User;

/* ─── ROLES — fetched from Supabase ──────────────────────────────────────── */
async function fetchRoles() {
  const { data, error } = await supabase.from("roles").select("*").order("level", { ascending: false });
  if (error) { console.error("fetchRoles error:", error); return []; }
  return data || [];
}

async function persistNewRole(role) {
  const { error } = await supabase.from("roles").insert({
    id: role.id,
    label: role.label,
    label_short: role.labelShort,
    color: role.color,
    glow: role.glow,
    bg: role.bg,
    border: role.border,
    badge_class: role.badgeClass,
    icon: role.icon,
    level: role.level,
    description: role.description,
    duties: role.duties,
    can_grant: role.canGrant,
    is_default: false,
  });
  return error;
}

async function persistRoleUpdate(roleId, patch) {
  const { error } = await supabase.from("roles").update({
    label: patch.label,
    label_short: patch.labelShort,
    color: patch.color,
    level: patch.level,
    description: patch.description,
    duties: patch.duties,
    can_grant: patch.canGrant,
    icon: patch.icon,
  }).eq("id", roleId);
  return error;
}

async function persistRoleDelete(roleId) {
  const { error } = await supabase.from("roles").delete().eq("id", roleId);
  return error;
}

const getRoleById = (id, roles) => {
  const allRoles = roles || [];
  return allRoles.find(r => r.id === id) || allRoles.find(r => r.id === "player") || null;
};

const normalizeRole = (user, roles) => {
  if (!user) return "player";
  const r = user.role;
  const allRoles = roles || [];
  if (allRoles.some(role => role.id === r)) return r;
  if (r === "admin" || r === "ადმინისტრატორი" || user.isAdmin) return "tec";
  return "player";
};

const getRoleColor = (roleId, roles) => {
  const role = getRoleById(roleId, roles);
  return role?.color || "oklch(0.75 0.03 270)";
};

const getRoleLabel = (roleId, roles) => {
  const role = getRoleById(roleId, roles);
  return role?.label || "მოთამაშე";
};

/* ─── STYLES ──────────────────────────────────────────────────────────────── */
const injectAdminStyles = () => {
  if (typeof document === "undefined") return;
  if (document.getElementById("grl-admin-styles")) return;
  const style = document.createElement("style");
  style.id = "grl-admin-styles";
  style.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Rajdhani:wght@400;500;600;700&family=JetBrains+Mono:wght@400;700&display=swap');

    .adm-root {
      --adm-bg:        oklch(0.15 0.025 285);
      --adm-surface:   oklch(0.19 0.03 285);
      --adm-card:      oklch(0.22 0.035 285);
      --adm-border:    oklch(0.35 0.04 285 / 0.5);
      --adm-border-2:  oklch(1 0 0 / 0.06);
      --adm-pink:      oklch(0.72 0.22 5);
      --adm-pink-glow: oklch(0.72 0.22 5 / 0.3);
      --adm-violet:    oklch(0.62 0.22 305);
      --adm-green:     oklch(0.78 0.18 155);
      --adm-yellow:    oklch(0.82 0.16 80);
      --adm-red:       oklch(0.70 0.22 25);
      --adm-cyan:      oklch(0.78 0.14 220);
      --adm-orange:    oklch(0.75 0.18 45);
      --adm-text:      oklch(0.97 0.005 250);
      --adm-muted:     oklch(0.75 0.03 270);
      --adm-muted-2:   oklch(0.50 0.04 270);
      --adm-font:      'Rajdhani','Noto Sans Georgian',system-ui,sans-serif;
      --adm-font-d:    'Bebas Neue','Noto Sans Georgian',sans-serif;
      --adm-font-m:    'JetBrains Mono',monospace;

      min-height: 100vh;
      background: var(--adm-bg);
      color: var(--adm-text);
      font-family: var(--adm-font);
      -webkit-font-smoothing: antialiased;
      position: relative;
      background-image:
        radial-gradient(ellipse 60% 50% at 20% 0%, oklch(0.45 0.20 350 / 0.20), transparent 60%),
        radial-gradient(ellipse 50% 50% at 90% 20%, oklch(0.42 0.20 285 / 0.18), transparent 55%),
        radial-gradient(ellipse 60% 40% at 50% 100%, oklch(0.40 0.18 320 / 0.15), transparent 50%);
      background-attachment: fixed;
    }
    .adm-root * { box-sizing: border-box; }

    .adm-nav {
      position: sticky; top: 0; z-index: 50;
      border-bottom: 1px solid var(--adm-border);
      background: oklch(0.15 0.025 285 / 0.88); backdrop-filter: blur(20px);
    }
    .adm-nav-inner {
      max-width: 1280px; margin: 0 auto; height: 68px;
      display: flex; align-items: center; justify-content: space-between; padding: 0 28px;
    }
    .adm-logo { display: flex; align-items: center; gap: 14px; }
    .adm-logo-icon {
      width: 40px; height: 40px; border-radius: 12px;
      background: linear-gradient(135deg, var(--adm-pink), var(--adm-violet));
      display: flex; align-items: center; justify-content: center;
      box-shadow: 0 0 28px var(--adm-pink-glow);
      color: #fff; font-family: var(--adm-font-d); font-size: 22px;
    }
    .adm-logo-text { font-family: var(--adm-font-d); font-size: 24px; letter-spacing: 0.06em; }
    .adm-logo-badge {
      font-size: 10px; padding: 3px 10px; border-radius: 999px;
      background: oklch(0.72 0.22 5 / 0.15); border: 1px solid oklch(0.72 0.22 5 / 0.35);
      color: var(--adm-pink); font-weight: 800; text-transform: uppercase; letter-spacing: 0.12em;
    }

    .adm-tabs {
      display: flex; gap: 6px; margin-bottom: 22px; flex-wrap: wrap;
      border-bottom: 1px solid var(--adm-border-2); padding-bottom: 2px;
    }
    .adm-tab {
      display: inline-flex; align-items: center; gap: 8px;
      padding: 10px 18px; font-size: 13px; font-weight: 700; cursor: pointer;
      border: none; background: transparent; color: var(--adm-muted);
      border-radius: 10px 10px 0 0; transition: all .2s; position: relative;
      font-family: var(--adm-font);
    }
    .adm-tab:hover { color: var(--adm-text); background: oklch(1 0 0 / 0.04); }
    .adm-tab.active { color: var(--adm-pink); background: oklch(0.72 0.22 5 / 0.08); }
    .adm-tab.active::after {
      content: ""; position: absolute; left:0; right:0; bottom:-2px; height:2px;
      background: linear-gradient(90deg, var(--adm-pink), var(--adm-cyan));
      border-radius: 2px;
    }
    .adm-tab-count {
      font-size: 10px; font-family: var(--adm-font-m); padding: 1px 7px;
      border-radius: 999px; background: oklch(1 0 0 / 0.08); color: var(--adm-muted);
    }
    .adm-tab.active .adm-tab-count { background: oklch(0.72 0.22 5 / 0.18); color: var(--adm-pink); }

    .adm-stat-card {
      background: var(--adm-card); border: 1px solid var(--adm-border);
      border-radius: 16px; padding: 20px 24px; position: relative; overflow: hidden;
      transition: all .3s cubic-bezier(0.22,1,0.36,1);
    }
    .adm-stat-card:hover { transform: translateY(-3px); border-color: oklch(0.72 0.22 5 / 0.4); box-shadow: 0 8px 32px oklch(0 0 0 / 0.3); }

    .adm-card {
      background: var(--adm-card); border: 1px solid var(--adm-border);
      border-radius: 16px; overflow: hidden;
      transition: border-color .3s;
    }
    .adm-card:hover { border-color: oklch(0.72 0.22 5 / 0.2); }

    .adm-card-header {
      padding: 18px 24px; border-bottom: 1px solid var(--adm-border-2);
      background: linear-gradient(to right, oklch(0.72 0.22 5 / 0.06), transparent);
      display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap;
    }
    .adm-card-title { font-family: var(--adm-font-d); font-size: 18px; letter-spacing: 0.05em; }

    .adm-input {
      width: 100%; background: oklch(0.12 0.02 285 / 0.6);
      border: 1px solid var(--adm-border-2); border-radius: 10px;
      padding: 12px 16px; color: var(--adm-text); font-size: 14px;
      font-family: var(--adm-font); outline: none; transition: all .25s;
    }
    .adm-input::placeholder { color: var(--adm-muted-2); }
    .adm-input:focus { border-color: oklch(0.72 0.22 5 / 0.5); box-shadow: 0 0 0 4px oklch(0.72 0.22 5 / 0.08); }
    textarea.adm-input { resize: vertical; min-height: 80px; }

    .adm-btn {
      display: inline-flex; align-items: center; justify-content: center; gap: 8px;
      border: none; cursor: pointer; font-family: var(--adm-font); font-weight: 700;
      border-radius: 10px; transition: all .25s; font-size: 14px; padding: 10px 22px;
    }
    .adm-btn-primary {
      background: linear-gradient(135deg, var(--adm-pink), var(--adm-violet));
      color: #fff; box-shadow: 0 4px 24px var(--adm-pink-glow);
    }
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

    .adm-badge {
      display: inline-flex; align-items: center; gap: 5px; font-size: 10px;
      padding: 4px 10px; border-radius: 999px; font-weight: 800; border: 1px solid; letter-spacing: 0.04em;
    }
    .adm-badge-green  { color: var(--adm-green); border-color: oklch(0.78 0.18 155 / 0.4); background: oklch(0.78 0.18 155 / 0.10); }
    .adm-badge-red    { color: var(--adm-red); border-color: oklch(0.70 0.22 25 / 0.4); background: oklch(0.70 0.22 25 / 0.10); }
    .adm-badge-yellow { color: var(--adm-yellow); border-color: oklch(0.82 0.16 80 / 0.4); background: oklch(0.82 0.16 80 / 0.10); }
    .adm-badge-orange { color: var(--adm-orange); border-color: oklch(0.75 0.18 45 / 0.4); background: oklch(0.75 0.18 45 / 0.10); }
    .adm-badge-pink   { color: var(--adm-pink); border-color: oklch(0.72 0.22 5 / 0.4); background: oklch(0.72 0.22 5 / 0.10); }
    .adm-badge-cyan   { color: var(--adm-cyan); border-color: oklch(0.78 0.14 220 / 0.4); background: oklch(0.78 0.14 220 / 0.10); }
    .adm-badge-gray   { color: var(--adm-muted); border-color: var(--adm-border-2); background: oklch(1 0 0 / 0.04); }

    .adm-list-item {
      display: flex; align-items: flex-start; justify-content: space-between; gap: 14px;
      padding: 16px 20px; cursor: pointer; transition: all .2s;
      border-bottom: 1px solid var(--adm-border-2);
    }
    .adm-list-item:last-child { border-bottom: none; }
    .adm-list-item:hover { background: oklch(0.72 0.22 5 / 0.05); }
    .adm-list-item.selected { background: oklch(0.72 0.22 5 / 0.08); border-left: 3px solid var(--adm-pink); }

    .adm-scroll::-webkit-scrollbar { width: 5px; }
    .adm-scroll::-webkit-scrollbar-track { background: transparent; }
    .adm-scroll::-webkit-scrollbar-thumb { background: oklch(0.72 0.22 5 / 0.3); border-radius: 3px; }

    .adm-post {
      border-radius: 12px; padding: 16px 18px; margin-bottom: 12px;
      transition: all .2s;
    }
    .adm-post-user  { background: oklch(0.12 0.02 285 / 0.5); border: 1px solid var(--adm-border-2); }
    .adm-post-admin { background: oklch(0.72 0.22 5 / 0.06); border: 1px solid oklch(0.72 0.22 5 / 0.2); }

    .adm-empty { text-align: center; padding: 56px 24px; color: var(--adm-muted-2); font-size: 15px; }

    .adm-verdict-box {
      border-radius: 12px; padding: 14px 18px; border: 1px solid;
      display: flex; align-items: flex-start; gap: 12px;
    }
    .adm-verdict-approved { background: oklch(0.78 0.18 155 / 0.06); border-color: oklch(0.78 0.18 155 / 0.3); color: var(--adm-green); }
    .adm-verdict-rejected { background: oklch(0.70 0.22 25 / 0.06); border-color: oklch(0.70 0.22 25 / 0.3); color: var(--adm-red); }
    .adm-verdict-pending { background: oklch(0.82 0.16 80 / 0.06); border-color: oklch(0.82 0.16 80 / 0.3); color: var(--adm-yellow); }

    .adm-cv-card {
      background: var(--adm-card); border: 1px solid var(--adm-border);
      border-radius: 14px; padding: 18px 20px; transition: all .25s;
    }
    .adm-cv-card:hover { border-color: oklch(0.78 0.14 220 / 0.35); box-shadow: 0 6px 28px oklch(0 0 0 / 0.25); }
    .adm-cv-field-grid {
      display: grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
      gap: 10px; margin: 14px 0;
    }
    .adm-cv-field {
      background: oklch(0.78 0.14 220 / 0.06); border: 1px solid oklch(0.78 0.14 220 / 0.18);
      border-radius: 8px; padding: 8px 12px;
    }
    .adm-cv-field-label {
      font-size: 9px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.1em;
      color: var(--adm-cyan); margin-bottom: 3px;
    }
    .adm-cv-field-value { font-size: 13px; font-weight: 600; color: var(--adm-text); line-height: 1.4; word-break: break-word; }

    .adm-role-dropdown {
      position: absolute;
      z-index: 999;
      min-width: 260px;
      background: oklch(0.18 0.03 285);
      border: 1px solid var(--adm-border);
      border-radius: 14px;
      overflow: hidden;
      box-shadow: 0 24px 64px oklch(0 0 0 / 0.6), 0 0 0 1px oklch(1 0 0 / 0.05);
      animation: admRoleDrop .2s cubic-bezier(0.22,1,0.36,1) both;
    }
    @keyframes admRoleDrop {
      from { opacity: 0; transform: translateY(-6px) scale(0.97); }
      to   { opacity: 1; transform: none; }
    }
    .adm-role-option {
      display: flex; align-items: flex-start; gap: 12px;
      padding: 12px 16px; cursor: pointer;
      border-bottom: 1px solid oklch(1 0 0 / 0.05);
      transition: background .15s;
    }
    .adm-role-option:last-child { border-bottom: none; }
    .adm-role-option:hover { background: oklch(1 0 0 / 0.06); }
    .adm-role-option.current { background: oklch(1 0 0 / 0.04); cursor: default; }
    .adm-role-option.disabled { opacity: 0.35; cursor: not-allowed; pointer-events: none; }
    .adm-role-icon-wrap {
      width: 34px; height: 34px; border-radius: 10px;
      display: flex; align-items: center; justify-content: center; flex-shrink: 0;
    }
    .adm-role-header {
      padding: 10px 16px 8px;
      border-bottom: 1px solid oklch(1 0 0 / 0.06);
      font-size: 10px; font-weight: 800; letter-spacing: 0.14em;
      color: var(--adm-muted-2); text-transform: uppercase;
    }

    .adm-hierarchy-bar {
      display: flex; gap: 0; border-radius: 10px; overflow: hidden;
      border: 1px solid var(--adm-border-2); margin-bottom: 14px;
    }
    .adm-hierarchy-seg {
      flex: 1; padding: 7px 10px; font-size: 10px; font-weight: 800;
      text-transform: uppercase; letter-spacing: 0.08em; text-align: center;
      border-right: 1px solid oklch(1 0 0 / 0.08); transition: all .2s;
    }
    .adm-hierarchy-seg:last-child { border-right: none; }

    @keyframes admFade { from { opacity:0; transform: translateY(8px); } to { opacity:1; transform: none; } }
    .adm-fade { animation: admFade .35s ease both; }

    @keyframes admSpin { from { transform: rotate(0); } to { transform: rotate(360deg); } }
    .adm-spin { animation: admSpin 1s linear infinite; }

    .adm-edit-textarea {
      width: 100%;
      background: oklch(0.12 0.02 285 / 0.6);
      border: 1px solid var(--adm-cyan);
      border-radius: 8px;
      padding: 8px 12px;
      color: var(--adm-text);
      font-size: 14px;
      font-family: var(--adm-font);
      outline: none;
      min-height: 60px;
      transition: all .25s;
    }
    .adm-edit-textarea:focus {
      border-color: var(--adm-pink);
      box-shadow: 0 0 0 3px oklch(0.72 0.22 5 / 0.15);
    }

    .adm-role-manager {
      background: var(--adm-card);
      border: 1px solid var(--adm-border);
      border-radius: 12px;
      padding: 16px 20px;
      margin-bottom: 16px;
    }
    .adm-role-manager:hover {
      border-color: oklch(0.72 0.22 5 / 0.3);
    }
    .adm-role-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 8px 12px;
      border-bottom: 1px solid var(--adm-border-2);
      gap: 12px;
      flex-wrap: wrap;
    }
    .adm-role-item:last-child { border-bottom: none; }
    .adm-role-item-actions {
      display: flex;
      gap: 6px;
      align-items: center;
    }
    .adm-color-picker {
      width: 32px;
      height: 32px;
      border-radius: 8px;
      border: 2px solid var(--adm-border);
      cursor: pointer;
      padding: 0;
      background: none;
    }
    .adm-color-picker::-webkit-color-swatch-wrapper {
      padding: 0;
    }
    .adm-color-picker::-webkit-color-swatch {
      border: none;
      border-radius: 6px;
    }

    @media (max-width: 900px) {
      .adm-split { flex-direction: column !important; }
      .adm-split > * { width: 100% !important; }
      .adm-stat-grid { grid-template-columns: 1fr 1fr !important; }
      .adm-nav-inner { height: 60px; padding: 0 16px; }
    }
    @media (max-width: 600px) {
      .adm-stat-grid { grid-template-columns: 1fr !important; }
      .adm-cv-field-grid { grid-template-columns: 1fr 1fr; }
      .adm-role-item { flex-direction: column; align-items: flex-start; }
    }
  `;
  document.head.appendChild(style);
};

/* ─── ROLE BADGE ─────────────────────────────────────────────────────────── */
function RoleBadge({ roleId, size = "sm", roles }) {
  const role = getRoleById(roleId, roles);
  const IconName = role?.icon || "User";
  const Icon = getIconComponent(IconName);

  return (
    <span
      className={`adm-badge ${role?.badge_class || "adm-badge-gray"}`}
      style={{ borderColor: role?.border || "var(--adm-border-2)", color: role?.color || "var(--adm-muted)", background: role?.bg || "oklch(1 0 0 / 0.04)" }}
    >
      <Icon size={size === "sm" ? 11 : 13} />
      {role?.label_short || roleId}
    </span>
  );
}

/* ─── ROLE DROPDOWN ──────────────────────────────────────────────────────── */
function RoleDropdown({ user, onSelect, onClose, triggerRef, roles }) {
  const ref = useRef(null);
  const currentRoleId = normalizeRole(user, roles);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target) &&
          triggerRef.current && !triggerRef.current.contains(e.target)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose, triggerRef]);

  const [pos, setPos] = useState({ top: 0, left: 0 });
  useEffect(() => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const scrollY = window.scrollY || document.documentElement.scrollTop;
      setPos({ top: rect.bottom + scrollY + 6, left: rect.left + window.scrollX });
    }
  }, [triggerRef]);

  return (
    <div
      ref={ref}
      className="adm-role-dropdown"
      style={{ position: "fixed", top: pos.top - window.scrollY, left: pos.left }}
    >
      <div className="adm-role-header">
        <Shield size={11} style={{ display: "inline", marginRight: 5, verticalAlign: "middle" }} />
        როლის შეცვლა — {user.username}
      </div>

      <div style={{ padding: "10px 14px 0" }}>
        <div className="adm-hierarchy-bar">
          {[...roles].sort((a,b) => b.level - a.level).map(r => (
            <div
              key={r.id}
              className="adm-hierarchy-seg"
              style={{
                background: r.id === currentRoleId ? r.bg : "transparent",
                color: r.id === currentRoleId ? r.color : "var(--adm-muted-2)",
              }}
            >
              {r.label_short}
            </div>
          ))}
        </div>
      </div>

      {roles.map(role => {
        const isCurrent = role.id === currentRoleId;
        const IconName = role.icon || "User";
        const Icon = getIconComponent(IconName);

        return (
          <div
            key={role.id}
            className={`adm-role-option${isCurrent ? " current" : ""}`}
            onClick={() => !isCurrent && onSelect(user, role.id)}
          >
            <div
              className="adm-role-icon-wrap"
              style={{ background: role.bg || "oklch(1 0 0 / 0.04)", border: `1px solid ${role.border || "var(--adm-border-2)"}` }}
            >
              <Icon size={16} style={{ color: role.color || "var(--adm-muted)" }} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontWeight: 800, fontSize: 14, color: role.color || "var(--adm-muted)" }}>
                  {role.label}
                </span>
                {isCurrent && (
                  <span style={{
                    fontSize: 9, padding: "2px 7px", borderRadius: 999,
                    background: role.bg || "oklch(1 0 0 / 0.04)", color: role.color || "var(--adm-muted)", border: `1px solid ${role.border || "var(--adm-border-2)"}`,
                    fontWeight: 800, letterSpacing: "0.1em"
                  }}>
                    მიმდინარე
                  </span>
                )}
                {role.is_default && (
                  <span style={{
                    fontSize: 8, padding: "1px 5px", borderRadius: 4,
                    background: "oklch(0.72 0.22 5 / 0.1)", color: "var(--adm-pink)",
                    fontWeight: 700
                  }}>
                    სტანდარტული
                  </span>
                )}
              </div>
              <div style={{ fontSize: 11, color: "var(--adm-muted-2)", marginTop: 2 }}>
                {role.duties}
              </div>
            </div>
            {!isCurrent && (
              <ChevronRight size={14} style={{ color: "var(--adm-muted-2)", flexShrink: 0, marginTop: 2 }} />
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ─── ROLE MANAGER ───────────────────────────────────────────────────────── */
function RoleManager({ roles, reloadRoles }) {
  const [showManager, setShowManager] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [saving, setSaving] = useState(false);
  const [newRole, setNewRole] = useState({
    id: "", label: "", labelShort: "", color: "#ff2d78", level: 1,
    description: "", duties: "", canGrant: [], icon: "User",
  });
  const [isEditing, setIsEditing] = useState(false);

  const iconOptions = ["User", "Shield", "Star", "Crown", "Swords", "UserCheck", "Briefcase", "Award", "Sparkles"];

  const resetForm = () => setNewRole({
    id: "", label: "", labelShort: "", color: "#ff2d78", level: 1,
    description: "", duties: "", canGrant: [], icon: "User",
  });

  const handleAddRole = async () => {
    if (!newRole.id || !newRole.label) { alert("გთხოვთ შეავსოთ ID და Label"); return; }
    if (roles.find(r => r.id === newRole.id)) { alert("ეს ID უკვე გამოიყენება"); return; }

    setSaving(true);
    const levelNum = parseInt(newRole.level) || 1;
    const roleToAdd = {
      id: newRole.id,
      label: newRole.label,
      labelShort: newRole.labelShort || newRole.label.toUpperCase().slice(0, 6),
      color: newRole.color,
      level: levelNum,
      description: newRole.description || "",
      duties: newRole.duties || "",
      canGrant: newRole.canGrant || [],
      icon: newRole.icon || "User",
      glow: "oklch(0.72 0.22 5 / 0.3)",
      bg: "oklch(0.72 0.22 5 / 0.1)",
      border: "oklch(0.72 0.22 5 / 0.3)",
      badgeClass: "adm-badge-pink",
    };

    const error = await persistNewRole(roleToAdd);
    setSaving(false);
    if (error) { alert("❌ როლის დამატება ვერ მოხერხდა"); console.error(error); return; }

    await reloadRoles();
    resetForm();
    setIsEditing(false);
    setShowManager(false);
    alert(`✅ როლი "${roleToAdd.label}" წარმატებით დაემატა!`);
  };

  const handleEditRole = (roleId) => {
    const role = roles.find(r => r.id === roleId);
    if (!role || role.is_default) { alert("სტანდარტული როლის რედაქტირება არ შეიძლება"); return; }
    setEditingRole(roleId);
    setNewRole({
      id: role.id,
      label: role.label,
      labelShort: role.label_short || "",
      color: role.color,
      level: role.level,
      description: role.description || "",
      duties: role.duties || "",
      canGrant: role.can_grant || [],
      icon: typeof role.icon === 'string' ? role.icon : "User",
    });
    setIsEditing(true);
    setShowManager(true);
  };

  const handleUpdateRole = async () => {
    if (!newRole.id || !newRole.label) { alert("გთხოვთ შეავსოთ ID და Label"); return; }
    setSaving(true);
    const levelNum = parseInt(newRole.level) || 1;
    const error = await persistRoleUpdate(editingRole, {
      label: newRole.label,
      labelShort: newRole.labelShort || newRole.label.toUpperCase().slice(0, 6),
      color: newRole.color,
      level: levelNum,
      description: newRole.description,
      duties: newRole.duties,
      canGrant: newRole.canGrant || [],
      icon: newRole.icon || "User",
    });
    setSaving(false);
    if (error) { alert("❌ როლის განახლება ვერ მოხერხდა"); console.error(error); return; }

    await reloadRoles();
    setEditingRole(null);
    resetForm();
    setIsEditing(false);
    setShowManager(false);
  };

  const handleDeleteRole = async (roleId) => {
    const role = roles.find(r => r.id === roleId);
    if (!role || role.is_default) return;
    if (!window.confirm(`დარწმუნებული ხარ, რომ გინდა "${role.label}" როლის წაშლა?`)) return;

    const error = await persistRoleDelete(roleId);
    if (error) { alert("❌ როლის წაშლა ვერ მოხერხდა"); console.error(error); return; }
    await reloadRoles();
  };

  if (!showManager) {
    return (
      <div style={{ marginBottom: 16 }}>
        <button onClick={() => setShowManager(true)} className="adm-btn adm-btn-primary" style={{ width: "100%", padding: "12px 16px" }}>
          <PlusCircle size={18}/> როლების მართვა
        </button>
      </div>
    );
  }

  return (
    <div className="adm-role-manager adm-fade">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12, flexWrap: "wrap", gap: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Tag size={18} style={{ color: "var(--adm-pink)" }}/>
          <span style={{ fontFamily: "var(--adm-font-d)", fontSize: 18, letterSpacing: "0.05em" }}>
            {isEditing ? "როლის რედაქტირება" : "ახალი როლის დამატება"}
          </span>
        </div>
        <button onClick={() => { setShowManager(false); setIsEditing(false); setEditingRole(null); resetForm(); }} className="adm-btn adm-btn-ghost adm-btn-sm">
          <X size={14}/> დახურვა
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 12, marginBottom: 16 }}>
        <div>
          <label className="adm-label">როლის ID *</label>
          <input
            className="adm-input"
            value={newRole.id}
            onChange={e => setNewRole({...newRole, id: e.target.value})}
            placeholder="მაგ: mod"
            disabled={isEditing}
          />
        </div>
        <div>
          <label className="adm-label">სახელი *</label>
          <input
            className="adm-input"
            value={newRole.label}
            onChange={e => setNewRole({...newRole, label: e.target.value})}
            placeholder="მაგ: მოდერატორი"
          />
        </div>
        <div>
          <label className="adm-label">მოკლე სახელი</label>
          <input
            className="adm-input"
            value={newRole.labelShort}
            onChange={e => setNewRole({...newRole, labelShort: e.target.value})}
            placeholder="მაგ: MOD"
            maxLength={10}
          />
        </div>
        <div>
          <label className="adm-label">დონე (level)</label>
          <input
            className="adm-input"
            type="number"
            value={newRole.level}
            onChange={e => setNewRole({...newRole, level: parseInt(e.target.value) || 1})}
            min={1}
            max={100}
          />
        </div>
        <div>
          <label className="adm-label">ფერი</label>
          <input
            className="adm-color-picker"
            type="color"
            value={newRole.color}
            onChange={e => setNewRole({...newRole, color: e.target.value})}
          />
        </div>
        <div>
          <label className="adm-label">ხატულა</label>
          <select
            className="adm-input"
            value={newRole.icon}
            onChange={e => setNewRole({...newRole, icon: e.target.value})}
          >
            {iconOptions.map(icon => (
              <option key={icon} value={icon}>{icon}</option>
            ))}
          </select>
        </div>
        <div style={{ gridColumn: "span 2" }}>
          <label className="adm-label">აღწერა</label>
          <input
            className="adm-input"
            value={newRole.description}
            onChange={e => setNewRole({...newRole, description: e.target.value})}
            placeholder="როლის აღწერა..."
          />
        </div>
        <div style={{ gridColumn: "span 2" }}>
          <label className="adm-label">მოვალეობები</label>
          <input
            className="adm-input"
            value={newRole.duties}
            onChange={e => setNewRole({...newRole, duties: e.target.value})}
            placeholder="მოვალეობების აღწერა..."
          />
        </div>
      </div>

      <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginBottom: 16 }}>
        <button onClick={() => { setShowManager(false); setIsEditing(false); setEditingRole(null); resetForm(); }} className="adm-btn adm-btn-ghost adm-btn-sm">
          გაუქმება
        </button>
        {isEditing ? (
          <button onClick={handleUpdateRole} disabled={saving} className="adm-btn adm-btn-success adm-btn-sm">
            {saving ? <Loader2 size={14} className="adm-spin"/> : <><Save size={14}/> შენახვა</>}
          </button>
        ) : (
          <button onClick={handleAddRole} disabled={saving} className="adm-btn adm-btn-primary adm-btn-sm">
            {saving ? <Loader2 size={14} className="adm-spin"/> : <><Plus size={14}/> დამატება</>}
          </button>
        )}
      </div>

      <div style={{ borderTop: "1px solid var(--adm-border-2)", paddingTop: 12 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: "var(--adm-muted)", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.1em" }}>
          არსებული როლები
        </div>
        {roles.map(role => {
          const displayLevel = `Lv.${role.level}`;
          return (
            <div key={role.id} className="adm-role-item">
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ width: 20, height: 20, borderRadius: 6, background: role.color, display: "inline-block" }}/>
                <span style={{ fontWeight: 700 }}>{role.label}</span>
                <span style={{ fontSize: 10, color: "var(--adm-muted-2)", fontFamily: "var(--adm-font-m)" }}>({role.id})</span>
                <span style={{ fontSize: 10, background: role.bg || "oklch(1 0 0 / 0.04)", color: role.color || "var(--adm-muted)", padding: "1px 6px", borderRadius: 4, fontWeight: 700 }}>
                  {displayLevel}
                </span>
                {role.is_default && (
                  <span style={{ fontSize: 8, padding: "1px 5px", borderRadius: 4, background: "oklch(0.72 0.22 5 / 0.1)", color: "var(--adm-pink)", fontWeight: 700 }}>
                    სტანდარტული
                  </span>
                )}
              </div>
              <div className="adm-role-item-actions">
                {!role.is_default && (
                  <>
                    <button onClick={() => handleEditRole(role.id)} className="adm-btn adm-btn-ghost adm-btn-sm" style={{ padding: "4px 8px", fontSize: 10 }}>
                      <Edit2 size={12}/>
                    </button>
                    <button onClick={() => handleDeleteRole(role.id)} className="adm-btn adm-btn-danger adm-btn-sm" style={{ padding: "4px 8px", fontSize: 10 }}>
                      <Trash2 size={12}/>
                    </button>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ─── DATA ────────────────────────────────────────────────────────────────── */
const COMPLAINT_IDS = ["complaint-admin", "complaint-player"];
const SUBFORUM_INFO = {
  "complaint-admin":  { icon: "⚠️", title: "საჩივარი ადმინისტრატორზე" },
  "complaint-player": { icon: "👤", title: "საჩივარი მოთამაშეზე" },
};

const CV_FIELD_LABELS = {
  fullName:     "სრული სახელი",
  age:          "ასაკი",
  nickname:     "თამაშის ნიკი",
  experience:   "გამოცდილება",
  whyMe:        "რატომ უნდა ავიყვანოთ?",
  activeHours:  "აქტიური საათები/დღე",
  micAvailable: "მიკროფონი",
  extraInfo:    "დამატებითი ინფო",
};
const CV_FIELD_ORDER = Object.keys(CV_FIELD_LABELS);

function getStatusBadge(verdict) {
  if (!verdict) return { label: "განხილვაში", className: "adm-badge-yellow", icon: Clock };
  if (verdict === "approved") return { label: "დადასტურდა", className: "adm-badge-green", icon: CheckCircle2 };
  return { label: "უარყოფილია", className: "adm-badge-red", icon: XCircle };
}

/* ─── ADMIN LOGIN ─────────────────────────────────────────────────────────── */
function AdminLogin({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const submit = async () => {
    setErr(""); setLoading(true);
    try {
      const { data: { user }, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) { 
        setErr("არასწორი ელ-ფოსტა ან პაროლი"); 
        setLoading(false); 
        return; 
      }

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (profileError || !profile) {
        const username = user.user_metadata?.username || user.email?.split('@')[0] || 'User';
        
        const { data: newProfile, error: insertError } = await supabase
          .from('profiles')
          .insert({
            id: user.id,
            username: username,
            role: 'admin',
            is_admin: true,
            avatar_bg: 'linear-gradient(135deg,#ff2d78,#8b00ff)',
          })
          .select()
          .maybeSingle();

        if (insertError) {
          console.error("Insert error:", insertError);
          setErr("პროფილის შექმნა ვერ მოხერხდა");
          await supabase.auth.signOut();
          setLoading(false);
          return;
        }

        const adminUser = {
          id: user.id,
          username: newProfile?.username || user.email,
          email: user.email,
          role: newProfile?.role || 'admin',
          isAdmin: true,
          avatarBg: newProfile?.avatar_bg || "linear-gradient(135deg,#ff2d78,#8b00ff)",
        };
        onLogin(adminUser);
        setLoading(false);
        return;
      }

      if (!profile?.is_admin) {
        setErr("თქვენ არ გაქვთ ადმინისტრატორის უფლებები");
        await supabase.auth.signOut();
        setLoading(false);
        return;
      }

      const adminUser = {
        id: user.id,
        username: profile.username || user.email,
        email: user.email,
        role: profile.role || 'tec',
        isAdmin: true,
        avatarBg: profile.avatar_bg || "linear-gradient(135deg,#ff2d78,#8b00ff)",
      };
      onLogin(adminUser);
    } catch (error) {
      console.error("Login error:", error);
      setErr("დაფიქსირდა შეცდომა, სცადეთ თავიდან");
    }
    setLoading(false);
  };

  return (
    <div className="adm-root" style={{ display:"flex", alignItems:"center", justifyContent:"center", minHeight:"100vh", padding:24 }}>
      <div className="adm-card" style={{ width:"100%", maxWidth:400, padding:"36px 32px" }}>
        <div style={{ textAlign:"center", marginBottom:28 }}>
          <div className="adm-logo-icon" style={{ width:64, height:64, borderRadius:18, fontSize:28, margin:"0 auto 16px" }}>G</div>
          <div style={{ fontFamily:"var(--adm-font-d)", fontSize:26, letterSpacing:"0.06em" }}>GSRL ADMIN</div>
          <div style={{ fontSize:14, color:"var(--adm-muted)", marginTop:4 }}>საჩივრების მართვის სისტემა</div>
        </div>
        {err && (
          <div style={{ marginBottom:16, padding:"12px 16px", borderRadius:10, background:"oklch(0.70 0.22 25 / 0.10)", border:"1px solid oklch(0.70 0.22 25 / 0.3)", color:"var(--adm-red)", fontSize:14, display:"flex", alignItems:"center", gap:8 }}>
            <AlertCircle size={18}/> {err}
          </div>
        )}
        <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
          <div>
            <label className="adm-label"><Mail size={14}/> ელ-ფოსტა</label>
            <input className="adm-input" type="email" value={email} onChange={e=>setEmail(e.target.value)} onKeyDown={e=>e.key==="Enter"&&submit()} placeholder="admin@example.com"/>
          </div>
          <div>
            <label className="adm-label"><Lock size={14}/> პაროლი</label>
            <div style={{ position:"relative" }}>
              <input className="adm-input" type={showPassword?"text":"password"} value={password} onChange={e=>setPassword(e.target.value)} onKeyDown={e=>e.key==="Enter"&&submit()} placeholder="••••••••" style={{ paddingRight:"3rem" }}/>
              <button type="button" onClick={()=>setShowPassword(!showPassword)} style={{ position:"absolute", right:"1rem", top:"50%", transform:"translateY(-50%)", color:"var(--adm-muted-2)", background:"none", border:"none", cursor:"pointer" }}>
                {showPassword ? <EyeOff size={18}/> : <EyeIcon size={18}/>}
              </button>
            </div>
          </div>
          <button onClick={submit} disabled={loading} className="adm-btn adm-btn-primary" style={{ width:"100%", padding:12, fontSize:15, marginTop:4 }}>
            {loading ? <Loader2 size={18} className="adm-spin"/> : <LogIn size={18}/>}
            {loading ? "იტვირთება..." : "შესვლა"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── USERS MANAGEMENT ────────────────────────────────────────────────────── */
function UsersManagement({ adminUser, setAdminUser, roles }) {
  const [users, setUsers] = useState([]);
  const [showUsers, setShowUsers] = useState(false);
  const [searchUser, setSearchUser] = useState("");
  const [loading, setLoading] = useState(false);
  const [roleDropdownUser, setRoleDropdownUser] = useState(null);
  const roleButtonRefs = useRef({});

  const loadUsers = useCallback(async () => {
    try {
      setLoading(true);
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('*')
        .order('registered_at', { ascending: false });

      if (error) throw error;

      setUsers((profiles || []).map(p => ({
        id: p.id,
        username: p.username,
        email: p.email || 'N/A',
        role: p.role || 'player',
        isAdmin: p.is_admin || false,
        avatarBg: p.avatar_bg || 'linear-gradient(135deg,#ec4899,#8b5cf6)',
        registeredAt: p.registered_at,
      })));
    } catch (error) {
      console.error('Error loading users from Supabase:', error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (showUsers) loadUsers();
  }, [showUsers, loadUsers]);

  useEffect(() => {
    if (!showUsers) return;
    
    const channel = supabase
      .channel('admin_profiles_realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, (payload) => {
        if (payload.eventType === 'INSERT') {
          const p = payload.new;
          setUsers(prev => [{
            id: p.id, username: p.username, email: p.email || 'N/A',
            role: p.role || 'player', isAdmin: p.is_admin || false,
            avatarBg: p.avatar_bg || 'linear-gradient(135deg,#ec4899,#8b5cf6)',
            registeredAt: p.registered_at,
          }, ...prev]);
        } else if (payload.eventType === 'UPDATE') {
          const p = payload.new;
          setUsers(prev => prev.map(u => u.id === p.id ? {
            ...u, username: p.username, email: p.email || u.email,
            role: p.role || 'player', isAdmin: p.is_admin || false,
            avatarBg: p.avatar_bg || u.avatarBg,
          } : u));
          // 🔥🔥🔥 REAL-TIME: Update adminUser if it's the current admin
          if (p.id === adminUser?.id) {
            setAdminUser(prev => prev ? {
              ...prev,
              role: p.role,
              isAdmin: p.is_admin,
              username: p.username,
              avatarBg: p.avatar_bg || prev.avatarBg,
            } : prev);
          }
        } else if (payload.eventType === 'DELETE') {
          setUsers(prev => prev.filter(u => u.id !== payload.old.id));
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [showUsers, adminUser?.id, setAdminUser]);

  useEffect(() => {
    const close = () => setRoleDropdownUser(null);
    window.addEventListener("scroll", close, true);
    return () => window.removeEventListener("scroll", close, true);
  }, []);

  const filteredUsers = users.filter(u =>
    u.username?.toLowerCase().includes(searchUser.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchUser.toLowerCase())
  );

  // 🔥🔥🔥 FIXED: THIS IS THE MAIN FIX FOR REFRESH PROBLEM!
  const handleRoleSelect = async (user, newRoleId) => {
  const role = getRoleById(newRoleId, roles);
  const willBeAdmin = (role?.level ?? 0) >= 2;

  try {
    const { data: updated, error } = await supabase
      .from('profiles')
      .update({ 
        role: newRoleId,
        is_admin: willBeAdmin
      })
      .eq('id', user.id)
      .select()
      .maybeSingle(); // .single() → .maybeSingle()

    if (error) {
      console.error('Supabase error details:', error);
      throw error;
    }

    if (!updated) {
      console.error('No row returned — RLS შეიძლება ბლოკავს');
      alert('❌ განახლება ვერ მოხდა — Supabase RLS policy შეამოწმე');
      setRoleDropdownUser(null);
      return;
    }

    setUsers(prev => prev.map(u => 
      u.id === user.id 
        ? { ...u, role: updated.role, isAdmin: updated.is_admin } 
        : u
    ));

    if (user.id === adminUser?.id) {
      setAdminUser(prev => prev ? {
        ...prev,
        role: updated.role,
        isAdmin: updated.is_admin,
      } : prev);
    }

  } catch (error) {
    console.error('Full error:', JSON.stringify(error, null, 2));
    alert('❌ როლის განახლება ვერ მოხერხდა: ' + error.message);
  }

  setRoleDropdownUser(null);
};

  const deleteUser = async (userId) => {
    if (!window.confirm("დარწმუნებული ხარ?")) return;
    try {
      const { error } = await supabase.from('profiles').delete().eq('id', userId);
      if (error) throw error;
      setUsers(prev => prev.filter(u => u.id !== userId));
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('❌ მომხმარებლის წაშლა ვერ მოხერხდა');
    }
  };

  if (!showUsers) {
    return (
      <div style={{ marginBottom: 24 }}>
        <button onClick={() => setShowUsers(true)} className="adm-btn adm-btn-primary" style={{ width:"100%", padding:16, fontSize:16 }}>
          <UserCog size={20}/> მომხმარებლების მართვა
        </button>
      </div>
    );
  }

  const roleCounts = roles.reduce((acc, r) => {
    acc[r.id] = users.filter(u => normalizeRole(u, roles) === r.id).length;
    return acc;
  }, {});

  return (
    <div className="adm-card" style={{ marginBottom: 24 }}>
      <div className="adm-card-header">
        <div className="adm-card-title">
          <Users size={18} style={{ display:"inline", marginRight:8 }}/>
          მომხმარებლების მართვა ({users.length})
        </div>
        <div style={{ display:"flex", gap:8, alignItems:"center", flexWrap:"wrap" }}>
          {roles.map(r => (
            <span key={r.id} style={{ fontSize:11, color:r.color, fontWeight:700, fontFamily:"var(--adm-font-m)", opacity:roleCounts[r.id]===0?0.35:1 }}>
              {r.label_short}: {roleCounts[r.id]||0}
            </span>
          ))}
          <button onClick={() => setShowUsers(false)} className="adm-btn adm-btn-ghost adm-btn-sm">
            დახურვა
          </button>
        </div>
      </div>

      <div style={{ padding:"12px 18px", borderBottom:"1px solid var(--adm-border-2)" }}>
        <div className="adm-input" style={{ padding:"6px 12px", display:"flex", alignItems:"center", gap:8 }}>
          <Search size={15} style={{ color:"var(--adm-muted-2)", flexShrink:0 }}/>
          <input
            type="text"
            placeholder="მომხმარებლის ძიება..."
            value={searchUser}
            onChange={e => setSearchUser(e.target.value)}
            style={{ background:"none", border:"none", color:"var(--adm-text)", outline:"none", fontSize:13, width:"100%" }}
          />
        </div>
      </div>

      <div className="adm-scroll" style={{ maxHeight:420, overflowY:"auto" }}>
        {loading ? (
          <div className="adm-empty"><Loader2 size={32} className="adm-spin"/></div>
        ) : (
          <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13 }}>
            <thead style={{ background:"oklch(0.72 0.22 5 / 0.08)", position:"sticky", top:0, zIndex:1 }}>
              <tr>
                {["მომხმარებელი","ელ-ფოსტა","როლი","მოქმედებები"].map((h,i) => (
                  <th key={h} style={{ padding:"10px 14px", textAlign:i===3?"right":"left", fontWeight:700, color:"var(--adm-muted)", fontSize:10, textTransform:"uppercase", letterSpacing:"0.1em", borderBottom:"1px solid var(--adm-border-2)" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length === 0 ? (
                <tr><td colSpan={4} className="adm-empty">მომხმარებლები არ მოიძებნა</td></tr>
              ) : filteredUsers.map(user => {
                const isSelf = user.id === adminUser?.id;
                const userRoleId = normalizeRole(user, roles);
                const userRole = getRoleById(userRoleId, roles);
                const isRoleOpen = roleDropdownUser?.id === user.id;

                return (
                  <tr key={user.id} style={{ borderBottom:"1px solid var(--adm-border-2)" }}>
                    <td style={{ padding:"10px 14px" }}>
                      <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                        <div style={{ width:30, height:30, borderRadius:"50%", background:user.avatarBg||"linear-gradient(135deg,#ff2d78,#8b00ff)", display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontSize:12, fontWeight:700, flexShrink:0 }}>
                          {user.username?.[0]?.toUpperCase()}
                        </div>
                        <span style={{ fontWeight:700 }}>{user.username}</span>
                        {isSelf && <span className="adm-badge adm-badge-pink" style={{ fontSize:9 }}>თქვენ</span>}
                      </div>
                    </td>

                    <td style={{ padding:"10px 14px", color:"var(--adm-muted)" }}>{user.email}</td>

                    <td style={{ padding:"10px 14px" }}>
                      <RoleBadge roleId={userRoleId} roles={roles}/>
                    </td>

                    <td style={{ padding:"10px 14px", textAlign:"right" }}>
                      {isSelf ? (
                        <span style={{ fontSize:11, color:"var(--adm-muted)" }}>
                          <Lock size={12} style={{ display:"inline", marginRight:3 }}/>შეზღუდული
                        </span>
                      ) : (
                        <div style={{ display:"flex", gap:5, justifyContent:"flex-end", position:"relative" }}>
                          <button
                            ref={el => roleButtonRefs.current[user.id] = el}
                            onClick={() => setRoleDropdownUser(isRoleOpen ? null : user)}
                            className="adm-btn adm-btn-sm"
                            style={{
                              background: isRoleOpen ? userRole?.bg : "oklch(1 0 0 / 0.06)",
                              color: isRoleOpen ? userRole?.color : "var(--adm-muted)",
                              border: `1px solid ${isRoleOpen ? userRole?.border : "var(--adm-border-2)"}`,
                              gap: 5,
                            }}
                            title="როლის შეცვლა"
                          >
                            <Shield size={12}/>
                            <ChevronDown size={11} style={{ transition:"transform .2s", transform:isRoleOpen?"rotate(180deg)":"none" }}/>
                          </button>

                          <button onClick={() => deleteUser(user.id)} className="adm-btn adm-btn-danger adm-btn-sm" title="წაშლა">
                            <Trash2 size={12}/>
                          </button>

                          {isRoleOpen && (
                            <RoleDropdown
                              user={user}
                              onSelect={handleRoleSelect}
                              onClose={() => setRoleDropdownUser(null)}
                              triggerRef={{ current: roleButtonRefs.current[user.id] }}
                              roles={roles}
                            />
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      <div style={{ padding:"11px 18px", borderTop:"1px solid var(--adm-border-2)", display:"flex", justifyContent:"space-between", fontSize:12, color:"var(--adm-muted)" }}>
        <span>სულ: {users.length} მომხმარებელი</span>
        <div style={{ display:"flex", gap:12 }}>
          {roles.filter(r=>r.id!=="player").map(r=>(
            <span key={r.id} style={{ color:r.color }}>
              {r.label_short}: {roleCounts[r.id]||0}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── CV CARD ─────────────────────────────────────────────────────────────── */
function CVCard({ cv, adminUser, onVerdict, onReply, onClose, onEditReply }) {
  const [verdictMode, setVerdictMode] = useState(null);
  const [reason, setReason] = useState("");
  const [replyOpen, setReplyOpen] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [saving, setSaving] = useState(false);
  const [isEditingReply, setIsEditingReply] = useState(false);
  const [editReplyText, setEditReplyText] = useState(cv.admin_reply || "");

  let fields = {};
  try {
    const parsed = typeof cv.fields === "string" ? JSON.parse(cv.fields) : cv.fields;
    fields = parsed || {};
  } catch { fields = {}; }

  const status = cv.status;
  const statusInfo = getStatusBadge(status);
  const StatusIcon = statusInfo.icon;

  const submitVerdict = async () => {
    if (!verdictMode) return;
    setSaving(true);
    await onVerdict(cv.id, verdictMode, reason, verdictMode === "approved");
    setVerdictMode(null);
    setReason("");
    setSaving(false);
  };

  const submitReply = async () => {
    if (!replyText.trim()) return;
    setSaving(true);
    await onReply(cv.id, replyText);
    setReplyText("");
    setReplyOpen(false);
    setSaving(false);
  };

  const handleEditReply = async () => {
    if (!editReplyText.trim()) return;
    setSaving(true);
    await onEditReply(cv.id, editReplyText);
    setIsEditingReply(false);
    setSaving(false);
  };

  return (
    <div className="adm-cv-card adm-fade">
      <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:12, flexWrap:"wrap" }}>
        <div style={{ display:"flex", alignItems:"center", gap:10, minWidth:0 }}>
          <div style={{ width:36, height:36, borderRadius:"50%", background:cv.author_avatar_bg||"linear-gradient(135deg,#ec4899,#f43f5e)", display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontWeight:700, fontSize:14, flexShrink:0 }}>
            {cv.author?.[0]?.toUpperCase()}
          </div>
          <div style={{ minWidth:0 }}>
            <div style={{ fontWeight:800, fontSize:14 }}>{cv.author}</div>
            <div style={{ fontSize:11, color:"var(--adm-muted)", display:"flex", alignItems:"center", gap:5, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
              <Briefcase size={11}/> {cv.vacancy_title}
            </div>
          </div>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:8, flexShrink:0 }}>
          {cv.vacancy_closed && (
            <span className="adm-badge adm-badge-cyan"><Lock size={11}/> დახურულია</span>
          )}
          {cv.hired && (
            <span className="adm-badge adm-badge-green" style={{ borderColor: "oklch(0.72 0.19 160 / 0.5)" }}>
              <CheckCircle2 size={11}/> აყვანილია
            </span>
          )}
          <span className={`adm-badge ${statusInfo.className}`}><StatusIcon size={11}/> {statusInfo.label}</span>
          <span style={{ fontSize:11, color:"var(--adm-muted-2)" }}>
            {cv.submitted_at ? new Date(cv.submitted_at).toLocaleString("ka-GE") : ""}
          </span>
        </div>
      </div>

      <div className="adm-cv-field-grid">
        {CV_FIELD_ORDER.map(key => (
          <div key={key} className="adm-cv-field">
            <div className="adm-cv-field-label">{CV_FIELD_LABELS[key]}</div>
            <div className="adm-cv-field-value">{fields[key] || "—"}</div>
          </div>
        ))}
      </div>

      {status && cv.status_reason && (
        <div className={`adm-verdict-box ${status==="approved"?"adm-verdict-approved":"adm-verdict-rejected"}`} style={{ marginBottom:14 }}>
          {status==="approved" ? <CheckCircle2 size={16}/> : <XCircle size={16}/>}
          <div style={{ fontSize:13 }}>{cv.status_reason}</div>
        </div>
      )}

      {cv.hired && (
        <div className="adm-verdict-box adm-verdict-approved" style={{ marginBottom: 14, border: "2px solid oklch(0.72 0.19 160 / 0.5)" }}>
          <CheckCircle2 size={18} style={{ color: "oklch(0.78 0.19 160)" }}/>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: "oklch(0.78 0.19 160)" }}>
              ✅ კანდიდატი აყვანილია!
            </div>
            {cv.hired_by && (
              <div style={{ fontSize: 11, color: "var(--adm-muted)", marginTop: 2 }}>
                ადმინი: {cv.hired_by} · {cv.hired_at ? new Date(cv.hired_at).toLocaleString("ka-GE") : ""}
              </div>
            )}
          </div>
        </div>
      )}

      {cv.admin_reply && (
        <div className="adm-post adm-post-admin" style={{ marginBottom:14 }}>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:6 }}>
            <div style={{ display:"flex", alignItems:"center", gap:8 }}>
              <div style={{ width:24, height:24, borderRadius:"50%", background:adminUser?.avatarBg||"linear-gradient(135deg,#ff2d78,#8b00ff)", display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontSize:10, fontWeight:700 }}>
                {adminUser?.username?.[0]?.toUpperCase()}
              </div>
              <span style={{ fontWeight:700, fontSize:12, color:"var(--adm-pink)" }}>ადმინის პასუხი</span>
              <span style={{ fontSize:10, color:"var(--adm-muted-2)" }}>
                {cv.admin_reply_date ? new Date(cv.admin_reply_date).toLocaleString("ka-GE") : ""}
              </span>
            </div>
            <div style={{ display:"flex", gap:4 }}>
              <button
                onClick={() => { setIsEditingReply(true); setEditReplyText(cv.admin_reply); }}
                className="adm-btn adm-btn-ghost adm-btn-sm"
                style={{ padding:"4px 8px", fontSize:"10px" }}
                title="პასუხის რედაქტირება"
              >
                <Edit2 size={12}/>
              </button>
            </div>
          </div>

          {isEditingReply ? (
            <div>
              <textarea
                className="adm-edit-textarea"
                value={editReplyText}
                onChange={e => setEditReplyText(e.target.value)}
                style={{ marginBottom: 8 }}
                autoFocus
              />
              <div style={{ display:"flex", gap:8, justifyContent:"flex-end" }}>
                <button onClick={() => { setIsEditingReply(false); setEditReplyText(cv.admin_reply); }} className="adm-btn adm-btn-ghost adm-btn-sm">
                  <XIcon size={12}/> გაუქმება
                </button>
                <button onClick={handleEditReply} disabled={saving || !editReplyText.trim()} className="adm-btn adm-btn-success adm-btn-sm">
                  {saving ? <Loader2 size={12} className="adm-spin"/> : <><Save size={12}/> შენახვა</>}
                </button>
              </div>
            </div>
          ) : (
            <p style={{ fontSize:13, margin:0, whiteSpace:"pre-wrap" }}>{cv.admin_reply}</p>
          )}
        </div>
      )}

      {cv.vacancy_closed && !cv.hired && (
        <div className="adm-verdict-box adm-verdict-approved" style={{ marginBottom:14 }}>
          <Lock size={16}/>
          <div style={{ fontSize:13, fontWeight:700 }}>
            🔒 ვაკანსია დახურულია — აღარ მიიღება CV-ები
          </div>
        </div>
      )}

      {!cv.vacancy_closed && !cv.hired && (
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:10, flexWrap:"wrap", borderTop:"1px solid var(--adm-border-2)", paddingTop:12 }}>
          <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
            {!status && !verdictMode && (
              <>
                <button onClick={()=>setVerdictMode("approved")} className="adm-btn adm-btn-success adm-btn-sm">
                  <Check size={13}/> დადასტურება + დახურვა
                </button>
                <button onClick={()=>setVerdictMode("rejected")} className="adm-btn adm-btn-danger adm-btn-sm">
                  <X size={13}/> უარყოფა
                </button>
              </>
            )}
            <button onClick={()=>setReplyOpen(o=>!o)} className="adm-btn adm-btn-ghost adm-btn-sm">
              <MessageSquare size={13}/> პასუხი
            </button>

            {!status && (
              <button
                onClick={() => {
                  if (window.confirm("დარწმუნებული ხარ? ვაკანსია დაიხურება და აღარ მიიღება CV-ები.")) {
                    onClose(cv.id);
                  }
                }}
                className="adm-btn adm-btn-danger adm-btn-sm"
              >
                <Lock size={13}/> ვაკანსიის დახურვა
              </button>
            )}
          </div>
          <a href="#" onClick={e=>{e.preventDefault(); window.location.href="/forum";}} style={{ fontSize:11, color:"var(--adm-cyan)", fontWeight:700, display:"flex", alignItems:"center", gap:4 }}>
            ფორუმში ნახვა <ChevronRight size={12}/>
          </a>
        </div>
      )}

      {verdictMode && !status && (
        <div style={{ marginTop:14 }}>
          <textarea className="adm-input" value={reason} onChange={e=>setReason(e.target.value)} style={{ minHeight:60, marginBottom:10 }} placeholder="მიზეზი (არასავალდებულო)..."/>
          <div style={{ display:"flex", justifyContent:"flex-end", gap:8 }}>
            <button onClick={()=>{setVerdictMode(null);setReason("");}} className="adm-btn adm-btn-ghost adm-btn-sm">გაუქმება</button>
            <button onClick={submitVerdict} disabled={saving} className={`adm-btn adm-btn-sm ${verdictMode==="approved"?"adm-btn-success":"adm-btn-danger"}`}>
              {saving ? <Loader2 size={13} className="adm-spin"/> : verdictMode==="approved" ? "დადასტურება + დახურვა" : "უარყოფა"}
            </button>
          </div>
        </div>
      )}

      {replyOpen && (
        <div style={{ marginTop:12, display:"flex", gap:10 }}>
          <textarea className="adm-input" value={replyText} onChange={e=>setReplyText(e.target.value)} style={{ minHeight:56, flex:1 }} placeholder="დაწერე პასუხი განმცხადებელს..."/>
          <button onClick={submitReply} disabled={saving||!replyText.trim()} className="adm-btn adm-btn-primary" style={{ alignSelf:"flex-end" }}>
            <Send size={14}/>
          </button>
        </div>
      )}
    </div>
  );
}

/* ─── CVs SECTION ────────────────────────────────────────────────────────── */
function CVsSection({ adminUser, onCloseVacancy }) {
  const [cvs, setCvs] = useState([]);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const loadCVs = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('forum_cvs')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setCvs(data || []);
    } catch (error) {
      console.error('Error loading CVs from Supabase:', error);
      setCvs([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCVs();

    const channel = supabase
      .channel('forum_cvs_realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'forum_cvs' }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setCvs(prev => [payload.new, ...prev]);
        } else if (payload.eventType === 'UPDATE') {
          setCvs(prev => prev.map(c => c.id === payload.new.id ? payload.new : c));
        } else if (payload.eventType === 'DELETE') {
          setCvs(prev => prev.filter(c => c.id !== payload.old.id));
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [loadCVs]);

  const counts = {
    all: cvs.length,
    pending: cvs.filter(c => !c.status).length,
    approved: cvs.filter(c => c.status === "approved").length,
    rejected: cvs.filter(c => c.status === "rejected").length,
    hired: cvs.filter(c => c.hired).length,
  };

  const filteredCVs = cvs.filter(c => {
    if (filter !== "all" && filter !== "hired") {
      const s = c.status || "pending";
      if (s !== filter) return false;
    }
    if (filter === "hired" && !c.hired) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return c.author?.toLowerCase().includes(q) ||
             c.vacancy_title?.toLowerCase().includes(q) ||
             c.full_name?.toLowerCase().includes(q);
    }
    return true;
  });

  const handleVerdict = async (cvId, verdict, reason, shouldCloseVacancy) => {
    try {
      const { error } = await supabase
        .from('forum_cvs')
        .update({ status: verdict, status_reason: reason })
        .eq('id', cvId);
      if (error) throw error;

      setCvs(prev => prev.map(c => c.id === cvId ? { ...c, status: verdict, status_reason: reason } : c));

      if (shouldCloseVacancy) {
        const cv = cvs.find(c => c.id === cvId);
        if (cv?.thread_id) await onCloseVacancy(cv.thread_id, cvId);
      }
    } catch (error) {
      console.error('Error updating CV verdict:', error);
      alert('❌ გადაწყვეტილების შენახვა ვერ მოხერხდა');
    }
  };

  const handleReply = async (cvId, text) => {
    try {
      const { error } = await supabase
        .from('forum_cvs')
        .update({ admin_reply: text, admin_reply_date: new Date().toISOString() })
        .eq('id', cvId);
      if (error) throw error;
      setCvs(prev => prev.map(c => c.id === cvId ? { ...c, admin_reply: text, admin_reply_date: new Date().toISOString() } : c));
    } catch (error) {
      console.error('Error adding reply:', error);
      alert('❌ პასუხის გაგზავნა ვერ მოხერხდა');
    }
  };

  const handleClose = async (cvId) => {
    try {
      const { error } = await supabase.from('forum_cvs').update({ vacancy_closed: true }).eq('id', cvId);
      if (error) throw error;
      setCvs(prev => prev.map(c => c.id === cvId ? { ...c, vacancy_closed: true } : c));

      const cv = cvs.find(c => c.id === cvId);
      if (cv?.thread_id) await onCloseVacancy(cv.thread_id, cvId);
    } catch (error) {
      console.error('Error closing vacancy:', error);
      alert('❌ ვაკანსიის დახურვა ვერ მოხერხდა');
    }
  };

  return (
    <div className="adm-fade">
      <div className="adm-stat-grid" style={{ display:"grid", gridTemplateColumns:"repeat(5, 1fr)", gap:16, marginBottom:24 }}>
        {[
          { id:"all", label:"სულ CV", val:counts.all, color:"var(--adm-cyan)" },
          { id:"pending", label:"მოლოდინში", val:counts.pending, color:"var(--adm-yellow)" },
          { id:"approved", label:"დადასტურდა", val:counts.approved, color:"var(--adm-green)" },
          { id:"rejected", label:"უარყოფილი", val:counts.rejected, color:"var(--adm-red)" },
          { id:"hired", label:"აყვანილი", val:counts.hired, color:"#ff2d78" },
        ].map(s => (
          <div key={s.id} className="adm-stat-card" onClick={() => setFilter(s.id)}
            style={{ cursor:"pointer", borderColor:filter===s.id?`color-mix(in oklab, ${s.color} 60%, transparent)`:"var(--adm-border)", background:filter===s.id?`color-mix(in oklab, ${s.color} 10%, var(--adm-card))`:"var(--adm-card)" }}>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
              <div style={{ color:s.color }}>{/* icon placeholder */}</div>
              <div style={{ fontFamily:"var(--adm-font-d)", fontSize:34, color:s.color, lineHeight:1 }}>{s.val}</div>
            </div>
            <div style={{ fontSize:14, fontWeight:700, marginTop:6 }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:16, flexWrap:"wrap", gap:12 }}>
        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          <div style={{ fontFamily:"var(--adm-font-d)", fontSize:22, letterSpacing:"0.05em" }}>CV-ების მართვა</div>
          <span className="adm-badge adm-badge-cyan">{cvs.length} ჯამში</span>
        </div>
        <div className="adm-input" style={{ padding:"6px 12px", width:240, display:"flex", alignItems:"center", gap:8 }}>
          <Search size={16} style={{ color:"var(--adm-muted-2)" }}/>
          <input type="text" placeholder="ძიება..." value={search} onChange={e=>setSearch(e.target.value)} style={{ background:"none", border:"none", color:"var(--adm-text)", outline:"none", fontSize:13, width:"100%" }}/>
        </div>
      </div>

      {loading ? (
        <div className="adm-card"><div className="adm-empty"><Loader2 size={32} className="adm-spin"/></div></div>
      ) : filteredCVs.length === 0 ? (
        <div className="adm-card">
          <div className="adm-empty">
            <Briefcase size={32} style={{ opacity:0.3, marginBottom:12 }}/>
            <div>CV არ მოიძებნა</div>
            <div style={{ fontSize:13, marginTop:4 }}>მოთამაშეების მიერ გამოგზავნილი CV-ები აქ გამოჩნდება</div>
          </div>
        </div>
      ) : (
        <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
          {filteredCVs.map(cv => (
            <CVCard
              key={cv.id}
              cv={cv}
              adminUser={adminUser}
              onVerdict={handleVerdict}
              onReply={handleReply}
              onEditReply={handleReply}
              onClose={handleClose}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── MAIN ADMIN PANEL ────────────────────────────────────────────────────── */
export default function AdminPanel() {
  useEffect(() => { injectAdminStyles(); }, []);

  const [adminUser, setAdminUser] = useState(null);
  const [adminLoading, setAdminLoading] = useState(true);
  const [threads, setThreads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState("complaints");
  const [selected, setSelected] = useState(null);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [verdictMode, setVerdictMode] = useState(null);
  const [reason, setReason] = useState("");
  const [reply, setReply] = useState("");
  const [saving, setSaving] = useState(false);
  const [roles, setRoles] = useState([]);
  const [cvsCount, setCvsCount] = useState(0);

  const reloadRoles = useCallback(async () => {
    setRoles(await fetchRoles());
  }, []);

  // ─── Load admin from Supabase Auth ──────────────────────────────────────
  useEffect(() => {
    const loadAdmin = async () => {
      setAdminLoading(true);
      
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) { 
        setAdminUser(null); 
        setAdminLoading(false); 
        return; 
      }

      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .maybeSingle();

      if (error || !profile?.is_admin) {
        setAdminUser(null);
        setAdminLoading(false);
        return;
      }

      const adminData = {
        id: session.user.id,
        username: profile.username || session.user.email,
        email: session.user.email,
        role: profile.role || 'tec',
        isAdmin: profile.is_admin || false,
        avatarBg: profile.avatar_bg || "linear-gradient(135deg,#ff2d78,#8b00ff)",
      };
      
      console.log("✅ Admin loaded with role:", adminData.role);
      setAdminUser(adminData);
      setAdminLoading(false);
    };

    loadAdmin();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') setAdminUser(null);
    });
    return () => subscription.unsubscribe();
  }, []);

  // 🔥 REAL-TIME: Admin's own profile changes reflected immediately
  useEffect(() => {
    if (!adminUser?.id) return;
    
    const channel = supabase
      .channel(`admin_self_profile_${adminUser.id}`)
      .on('postgres_changes', { 
        event: 'UPDATE', 
        schema: 'public', 
        table: 'profiles', 
        filter: `id=eq.${adminUser.id}` 
      }, (payload) => {
        console.log("🔄 Admin profile updated in real-time:", payload.new.role);
        setAdminUser(prev => prev ? {
          ...prev,
          role: payload.new.role,
          isAdmin: payload.new.is_admin,
          avatarBg: payload.new.avatar_bg || prev.avatarBg,
          username: payload.new.username || prev.username,
        } : prev);
      })
      .subscribe();
      
    return () => { supabase.removeChannel(channel); };
  }, [adminUser?.id]);

  useEffect(() => { reloadRoles(); }, [reloadRoles]);

  // ─── CV count ───────────────────────────────────────────────────────────
  useEffect(() => {
    const loadCVCount = async () => {
      const { count } = await supabase.from('forum_cvs').select('*', { count: 'exact', head: true });
      setCvsCount(count || 0);
    };
    loadCVCount();

    const channel = supabase
      .channel('forum_cvs_count_realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'forum_cvs' }, loadCVCount)
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  // ─── Threads + posts ────────────────────────────────────────────────────
  const loadThreads = useCallback(async () => {
    try {
      setLoading(true);
      const { data: threadRows, error: threadError } = await supabase
        .from('forum_threads')
        .select('*')
        .order('created_at', { ascending: false });
      if (threadError) throw threadError;

      const { data: postRows, error: postError } = await supabase
        .from('forum_posts')
        .select('*')
        .order('created_at', { ascending: true });
      if (postError) throw postError;

      const postsByThread = {};
      (postRows || []).forEach(p => {
        if (!postsByThread[p.thread_id]) postsByThread[p.thread_id] = [];
        postsByThread[p.thread_id].push(p);
      });

      setThreads((threadRows || []).map(t => ({ ...t, posts: postsByThread[t.id] || [] })));
    } catch (error) {
      console.error('Error loading threads from Supabase:', error);
      setThreads([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (adminUser) loadThreads();
  }, [adminUser, loadThreads]);

  // 🔥 REAL-TIME: Threads + posts live for everyone
  useEffect(() => {
    if (!adminUser) return;

    const channel = supabase
      .channel('admin_forum_realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'forum_threads' }, (payload) => {
        if (payload.eventType === 'DELETE') {
          setThreads(prev => prev.filter(t => t.id !== payload.old.id));
        } else {
          setThreads(prev => {
            const exists = prev.some(t => t.id === payload.new.id);
            if (exists) return prev.map(t => t.id === payload.new.id ? { ...t, ...payload.new, posts: t.posts } : t);
            return [{ ...payload.new, posts: [] }, ...prev];
          });
        }
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'forum_posts' }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setThreads(prev => prev.map(t => t.id === payload.new.thread_id
            ? { ...t, posts: [...(t.posts || []), payload.new] }
            : t));
        } else if (payload.eventType === 'DELETE') {
          setThreads(prev => prev.map(t => t.id === payload.old.thread_id
            ? { ...t, posts: (t.posts || []).filter(p => p.id !== payload.old.id) }
            : t));
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [adminUser]);

  if (adminLoading) {
    return (
      <div className="adm-root" style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>
        <div className="adm-empty" style={{ padding: 60 }}>
          <Loader2 size={48} className="adm-spin"/>
          <div style={{ marginTop: 16, fontSize: 16 }}>იტვირთება...</div>
        </div>
      </div>
    );
  }

  if (!adminUser) return <AdminLogin onLogin={u => setAdminUser(u)}/>;

  const complaints = threads.filter(t => COMPLAINT_IDS.includes(t.subforum_id));
  const filtered = complaints.filter(t => {
    if (filter !== "all") {
      const s = t.verdict || "pending";
      if (s !== filter) return false;
    }
    if (search.trim()) {
      return t.title?.toLowerCase().includes(search.toLowerCase()) ||
             t.author?.toLowerCase().includes(search.toLowerCase());
    }
    return true;
  });

  const counts = {
    all: complaints.length,
    pending: complaints.filter(t => !t.verdict).length,
    approved: complaints.filter(t => t.verdict === "approved").length,
    rejected: complaints.filter(t => t.verdict === "rejected").length,
  };

  // ─── Handlers ────────────────────────────────────────────────────────────
  const handleReply = async () => {
    if (!reply.trim() || !selected) return;
    setSaving(true);
    try {
      const post = {
        id: `p-${Date.now()}`,
        thread_id: selected.id,
        author: adminUser.username,
        author_id: adminUser.id,
        author_avatar_bg: adminUser.avatarBg || "linear-gradient(135deg,#ff2d78,#8b00ff)",
        role: "ადმინისტრატორი",
        role_color: "#ff2d78",
        content: reply,
        is_admin_post: true,
        is_user_reply: true,
      };

      const { error: insertError } = await supabase.from('forum_posts').insert([post]);
      if (insertError) throw insertError;

      const { error: rpcError } = await supabase.rpc('increment_forum_thread_replies', { thread_id: selected.id });
      if (rpcError) throw rpcError;

      setThreads(prev => prev.map(t =>
        t.id === selected.id
          ? { ...t, posts: [...(t.posts || []), post], replies_count: (t.replies_count || 0) + 1 }
          : t
      ));
      setReply("");
    } catch (error) {
      console.error('Error adding reply:', error);
      alert('❌ პასუხის გაგზავნა ვერ მოხერხდა');
    } finally {
      setSaving(false);
    }
  };

  const handleVerdict = async () => {
    if (!verdictMode || !selected) return;
    setSaving(true);
    try {
      const content = verdictMode === "approved"
        ? `✅ **საჩივარი დადასტურებულია**\n\n${reason ? `**მიზეზი:** ${reason}` : "ადმინისტრაციის გადაწყვეტილებით."}`
        : `❌ **საჩივარი უარყოფილია**\n\n${reason ? `**მიზეზი:** ${reason}` : "ადმინისტრაციის გადაწყვეტილებით."}`;

      const adminPost = {
        id: `p-${Date.now()}`,
        thread_id: selected.id,
        author: adminUser.username,
        author_id: adminUser.id,
        author_avatar_bg: adminUser.avatarBg || "linear-gradient(135deg,#ff2d78,#8b00ff)",
        role: "ადმინისტრატორი",
        role_color: "#ff2d78",
        content,
        is_admin_post: true,
        is_user_reply: true,
      };

      const { error: threadError } = await supabase
        .from('forum_threads')
        .update({
          verdict: verdictMode,
          verdict_reason: reason,
          label: verdictMode === "approved" ? "დადასტურებულია" : "უარყოფილია",
          allow_replies: false,
        })
        .eq('id', selected.id);
      if (threadError) throw threadError;

      const { error: postError } = await supabase.from('forum_posts').insert([adminPost]);
      if (postError) throw postError;

      const { error: rpcError } = await supabase.rpc('increment_forum_thread_replies', { thread_id: selected.id });
      if (rpcError) throw rpcError;

      setThreads(prev => prev.map(t =>
        t.id === selected.id
          ? {
              ...t,
              verdict: verdictMode,
              verdict_reason: reason,
              label: verdictMode === "approved" ? "დადასტურებულია" : "უარყოფილია",
              allow_replies: false,
              posts: [...(t.posts || []), adminPost],
              replies_count: (t.replies_count || 0) + 1,
            }
          : t
      ));
      setVerdictMode(null);
      setReason("");
    } catch (error) {
      console.error('Error saving verdict:', error);
      alert('❌ გადაწყვეტილების შენახვა ვერ მოხერხდა');
    } finally {
      setSaving(false);
    }
  };

  const handleCloseVacancy = async (threadId, cvId) => {
    try {
      const { error: threadError } = await supabase
        .from('forum_threads')
        .update({
          is_closed: true,
          label: "დახურულია ✓ აყვანილია",
          allow_replies: false,
          closed_by: adminUser?.username || "ადმინი",
          closed_at: new Date().toISOString(),
        })
        .eq('id', threadId);
      if (threadError) throw threadError;

      const { error: cvError } = await supabase
        .from('forum_cvs')
        .update({ hired: true, hired_at: new Date().toISOString(), hired_by: adminUser?.username })
        .eq('id', cvId);
      if (cvError) throw cvError;

      setThreads(prev => prev.map(t =>
        t.id === threadId
          ? { ...t, is_closed: true, label: "დახურულია ✓ აყვანილია", allow_replies: false, closed_by: adminUser?.username, closed_at: new Date().toISOString() }
          : t
      ));
    } catch (error) {
      console.error('Error closing vacancy:', error);
      alert('❌ ვაკანსიის დახურვა ვერ მოხერხდა');
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setAdminUser(null);
  };

  const statusInfo = selected ? getStatusBadge(selected.verdict) : null;

  return (
    <div className="adm-root">
      <header className="adm-nav">
        <div className="adm-nav-inner">
          <div className="adm-logo">
            <div className="adm-logo-icon">G</div>
            <span className="adm-logo-text">GRL ADMIN</span>
            <span className="adm-logo-badge">{activeSection==="cvs" ? "CV-ები" : "საჩივრები"}</span>
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:16 }}>
            <button onClick={() => window.location.href="/forum"} className="adm-btn adm-btn-ghost adm-btn-sm">
              <ArrowLeft size={14}/> ფორუმზე დაბრუნება
            </button>
            <div style={{ display:"flex", alignItems:"center", gap:10 }}>
              <div style={{ width:8, height:8, borderRadius:"50%", background:"var(--adm-green)", boxShadow:"0 0 10px var(--adm-green)" }}/>
              <span style={{ fontSize:14, fontWeight:600 }}>{adminUser.username}</span>
              <RoleBadge roleId={normalizeRole(adminUser, roles)} roles={roles} />
            </div>
            <button onClick={handleLogout} className="adm-btn adm-btn-danger adm-btn-sm">
              <LogOut size={14}/> გასვლა
            </button>
          </div>
        </div>
      </header>

      <main style={{ maxWidth:1280, margin:"0 auto", padding:"24px 28px", position:"relative", zIndex:1 }}>
        {loading ? (
          <div className="adm-empty" style={{ padding:60 }}>
            <Loader2 size={48} className="adm-spin"/>
            <div style={{ marginTop:16, fontSize:16 }}>იტვირთება...</div>
          </div>
        ) : (
          <>
            <RoleManager roles={roles} reloadRoles={reloadRoles}/>
            <UsersManagement adminUser={adminUser} setAdminUser={setAdminUser} roles={roles}/>

            <div className="adm-tabs">
              <button className={`adm-tab${activeSection==="complaints"?" active":""}`} onClick={()=>setActiveSection("complaints")}>
                <MessageSquare size={15}/> საჩივრები
                <span className="adm-tab-count">{counts.all}</span>
              </button>
              <button className={`adm-tab${activeSection==="cvs"?" active":""}`} onClick={()=>setActiveSection("cvs")}>
                <Briefcase size={15}/> CV-ები
                <span className="adm-tab-count">{cvsCount}</span>
              </button>
            </div>

            {activeSection === "cvs" && (
              <CVsSection adminUser={adminUser} onCloseVacancy={handleCloseVacancy} />
            )}

            {activeSection === "complaints" && (
              <>
                <div className="adm-stat-grid" style={{ display:"grid", gridTemplateColumns:"repeat(4, 1fr)", gap:16, marginBottom:28 }}>
                  {[
                    { id:"all", label:"სულ საჩივარი", val:counts.all, color:"var(--adm-pink)" },
                    { id:"pending", label:"მოლოდინში", val:counts.pending, color:"var(--adm-yellow)" },
                    { id:"approved", label:"დადასტურდა", val:counts.approved, color:"var(--adm-green)" },
                    { id:"rejected", label:"უარყოფილი", val:counts.rejected, color:"var(--adm-red)" },
                  ].map(s => (
                    <div key={s.id} className="adm-stat-card" onClick={() => setFilter(s.id)}
                      style={{ cursor:"pointer", borderColor:filter===s.id?`color-mix(in oklab, ${s.color} 60%, transparent)`:"var(--adm-border)", background:filter===s.id?`color-mix(in oklab, ${s.color} 10%, var(--adm-card))`:"var(--adm-card)" }}>
                      <div style={{ position:"absolute", top:-20, right:-20, width:100, height:100, borderRadius:"50%", filter:"blur(40px)", background:s.color, opacity:0.15 }}/>
                      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                        <div style={{ color:s.color }}>{/* icon placeholder */}</div>
                        <div style={{ fontFamily:"var(--adm-font-d)", fontSize:34, color:s.color, lineHeight:1 }}>{s.val}</div>
                      </div>
                      <div style={{ fontSize:14, fontWeight:700, marginTop:6 }}>{s.label}</div>
                    </div>
                  ))}
                </div>

                <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:16, flexWrap:"wrap", gap:12 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                    <div style={{ fontFamily:"var(--adm-font-d)", fontSize:22, letterSpacing:"0.05em" }}>საჩივრების მართვა</div>
                    <span className="adm-badge adm-badge-pink">{complaints.length} ჯამში</span>
                  </div>
                  <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                    <div className="adm-input" style={{ padding:"6px 12px", width:200, display:"flex", alignItems:"center", gap:8 }}>
                      <Search size={16} style={{ color:"var(--adm-muted-2)" }}/>
                      <input type="text" placeholder="ძიება..." value={search} onChange={e=>setSearch(e.target.value)} style={{ background:"none", border:"none", color:"var(--adm-text)", outline:"none", fontSize:13, width:"100%" }}/>
                    </div>
                    <span style={{ fontSize:12, color:"var(--adm-muted)", fontFamily:"var(--adm-font-m)" }}>{new Date().toLocaleString("ka-GE")}</span>
                  </div>
                </div>

                <div className="adm-split" style={{ display:"flex", gap:18, height:"calc(100vh - 580px)", minHeight:420 }}>
                  <div style={{ width:340, flexShrink:0, display:"flex", flexDirection:"column", gap:12 }}>
                    <div className="adm-card adm-scroll" style={{ flex:1, overflowY:"auto" }}>
                      {filtered.length === 0 ? (
                        <div className="adm-empty">
                          <MessageSquare size={32} style={{ opacity:0.3, marginBottom:12 }}/>
                          <div>საჩივრები არ არის</div>
                          <div style={{ fontSize:13, marginTop:4 }}>მოთამაშეების მიერ შექმნილი საჩივრები აქ გამოჩნდება</div>
                        </div>
                      ) : filtered.map(t => {
                        const sub = SUBFORUM_INFO[t.subforum_id];
                        const status = getStatusBadge(t.verdict);
                        const StatusIcon = status.icon;
                        return (
                          <div key={t.id} onClick={() => { setSelected(t); setVerdictMode(null); setReason(""); setReply(""); }} className={`adm-list-item${selected?.id===t.id?" selected":""}`}>
                            <div style={{ flex:1, minWidth:0 }}>
                              <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:5, flexWrap:"wrap" }}>
                                <span className={`adm-badge ${status.className}`}><StatusIcon size={12}/> {status.label}</span>
                                <span style={{ fontSize:11, color:"var(--adm-muted)" }}>{sub?.icon} {sub?.title}</span>
                              </div>
                              <div style={{ fontWeight:700, fontSize:14, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{t.title}</div>
                              <div style={{ fontSize:12, color:"var(--adm-muted)", marginTop:3 }}><User size={12} style={{ display:"inline", marginRight:4 }}/> {t.author} · {t.date ? new Date(t.date).toLocaleDateString('ka-GE') : ''}</div>
                            </div>
                            <div style={{ fontSize:11, color:"var(--adm-muted-2)", flexShrink:0, textAlign:"right" }}>
                              <div>{t.posts?.length||0} პ</div>
                              <div style={{ fontSize:10, opacity:0.6 }}>{t.replies_count||0} პას</div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="adm-card" style={{ flex:1, display:"flex", flexDirection:"column", overflow:"hidden" }}>
                    {!selected ? (
                      <div className="adm-empty" style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", height:"100%", gap:12 }}>
                        <div style={{ fontSize:48, opacity:0.3 }}>📋</div>
                        <div style={{ fontSize:16, fontWeight:600 }}>აირჩიე საჩივარი</div>
                        <div style={{ fontSize:13, color:"var(--adm-muted-2)" }}>საჩივრის სანახავად აირჩიე მარცხნიდან</div>
                      </div>
                    ) : (
                      <>
                        <div className="adm-card-header">
                          <div style={{ minWidth:0, flex:1 }}>
                            <div style={{ fontWeight:700, fontSize:18, marginBottom:6, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{selected.title}</div>
                            <div style={{ display:"flex", alignItems:"center", gap:10, flexWrap:"wrap" }}>
                              <span style={{ fontSize:13, color:"var(--adm-muted)" }}><User size={13} style={{ display:"inline", marginRight:4 }}/> {selected.author}</span>
                              <span style={{ color:"var(--adm-muted-2)" }}>·</span>
                              <span className={`adm-badge ${statusInfo.className}`}><statusInfo.icon size={12}/> {statusInfo.label}</span>
                              <span style={{ color:"var(--adm-muted-2)" }}>·</span>
                              <span style={{ fontSize:12, color:"var(--adm-muted-2)" }}>{selected.date ? new Date(selected.date).toLocaleDateString('ka-GE') : ''}</span>
                            </div>
                          </div>
                          {!selected.verdict && (
                            <div style={{ display:"flex", gap:8, flexShrink:0 }}>
                              <button onClick={() => setVerdictMode(verdictMode==="approved"?null:"approved")} className={`adm-btn adm-btn-sm ${verdictMode==="approved"?"adm-btn-success":"adm-btn-ghost"}`}>
                                <Check size={14}/> დადასტურება
                              </button>
                              <button onClick={() => setVerdictMode(verdictMode==="rejected"?null:"rejected")} className={`adm-btn adm-btn-sm ${verdictMode==="rejected"?"adm-btn-danger":"adm-btn-ghost"}`}>
                                <X size={14}/> უარყოფა
                              </button>
                            </div>
                          )}
                        </div>

                        <div className="adm-scroll" style={{ flex:1, overflowY:"auto", padding:"18px 20px" }}>
                          {(selected.posts||[]).map(post => (
                            <div key={post.id} className={`adm-post ${post.is_admin_post?"adm-post-admin":"adm-post-user"}`}>
                              <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:10 }}>
                                <div style={{ width:32, height:32, borderRadius:"50%", background:post.author_avatar_bg||"linear-gradient(135deg,#ec4899,#f43f5e)", display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontSize:13, fontWeight:700, flexShrink:0 }}>
                                  {post.author?.[0]?.toUpperCase()}
                                </div>
                                <div>
                                  <span style={{ fontWeight:700, fontSize:14, color:post.is_admin_post?"var(--adm-pink)":"var(--adm-text)" }}>{post.author}</span>
                                  {post.is_admin_post && <span className="adm-badge adm-badge-pink" style={{ fontSize:9, marginLeft:8 }}>ადმინი</span>}
                                  <div style={{ fontSize:11, color:"var(--adm-muted-2)" }}>{post.date ? new Date(post.date).toLocaleString('ka-GE') : ''}</div>
                                </div>
                              </div>
                              <p style={{ color:"var(--adm-text)", fontSize:14, lineHeight:1.7, margin:0, whiteSpace:"pre-wrap" }}>{post.content}</p>
                            </div>
                          ))}
                        </div>

                        {verdictMode && !selected.verdict && (
                          <div style={{ padding:"16px 20px", borderTop:"1px solid var(--adm-border-2)", background:verdictMode==="approved"?"oklch(0.78 0.18 155 / 0.05)":"oklch(0.70 0.22 25 / 0.05)" }}>
                            <div style={{ fontSize:13, fontWeight:700, marginBottom:10, color:verdictMode==="approved"?"var(--adm-green)":"var(--adm-red)" }}>
                              {verdictMode==="approved" ? <><CheckCircle2 size={16} style={{ display:"inline", marginRight:6 }}/> დადასტურება — მიზეზი</> : <><XCircle size={16} style={{ display:"inline", marginRight:6 }}/> უარყოფა — მიზეზი</>}
                            </div>
                            <textarea className="adm-input" value={reason} onChange={e=>setReason(e.target.value)} style={{ minHeight:70, marginBottom:10 }} placeholder="აღწერეთ გადაწყვეტილების მიზეზი..."/>
                            <div style={{ display:"flex", justifyContent:"flex-end", gap:10 }}>
                              <button onClick={() => {setVerdictMode(null);setReason("");}} className="adm-btn adm-btn-ghost adm-btn-sm">გაუქმება</button>
                              <button onClick={handleVerdict} disabled={saving} className={`adm-btn adm-btn-sm ${verdictMode==="approved"?"adm-btn-success":"adm-btn-danger"}`}>
                                {saving?<Loader2 size={14} className="adm-spin"/>:verdictMode==="approved"?"დადასტურება":"უარყოფა"}
                              </button>
                            </div>
                          </div>
                        )}

                        {!verdictMode && (
                          <div style={{ padding:"14px 20px", borderTop:"1px solid var(--adm-border-2)" }}>
                            <div style={{ display:"flex", gap:12 }}>
                              <textarea className="adm-input" value={reply} onChange={e=>setReply(e.target.value)} style={{ minHeight:60, flex:1 }} placeholder="დაწერე პასუხი მოთამაშეს..."/>
                              <button onClick={handleReply} disabled={saving||!reply.trim()} className="adm-btn adm-btn-primary" style={{ alignSelf:"flex-end", padding:"8px 20px" }}>
                                <Send size={16}/> გაგზავნა
                              </button>
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </>
            )}
          </>
        )}
      </main>
    </div>
  ); 
}

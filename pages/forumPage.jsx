import React, { useState, useMemo, useEffect, useCallback, useRef } from "react";
import {
  Shield, Wrench, Sparkles, Unlock, Calendar, BookOpen, Award,
  ClipboardList, Video, Landmark, Scale, Eye, FileText, AlertCircle,
  UserX, CheckSquare, Search, MessageSquare, Users, ArrowLeft,
  Plus, Send, Clock, ChevronRight, ExternalLink, ThumbsUp,
  CheckCircle2, XCircle, Loader2, Info, Pin, Trash2, Hash,
  User, Mail, Lock, EyeOff, Eye as EyeIcon, LogIn, UserPlus,
  ChevronDown, ChevronUp, MessageCircle, Star, Sparkle, Briefcase,
  LogOut, Home, Bell, Edit2
} from "lucide-react";

/* ─── ROLE SYSTEM ─────────────────────────────────────────────────────────── */
const ROLE_LEVELS = {
  project_team: 4,
  d_chief:      3,
  chief:        3,
  tec:          2,
  player:       1,
};

const VACANCY_SUBFORUMS = ["vacancies"];
const USER_ALLOWED_SUBFORUMS = ["technical", "complaint-admin", "complaint-player"];
const COMPLAINT_SUBFORUMS = ["complaint-admin", "complaint-player"];

const normalizeRole = (user) => {
  if (!user) return "player";
  const r = user.role;
  if (["project_team","d_chief","chief","tec","player"].includes(r)) return r;
  if (r === "admin" || r === "ადმინისტრატორი" || user.isAdmin) return "tec";
  return "player";
};

const roleLevel = (user) => ROLE_LEVELS[normalizeRole(user)] || 1;
const isUserAdmin  = (user) => roleLevel(user) >= 2;
const isChief      = (user) => roleLevel(user) >= 3;
const isProjectTeam= (user) => normalizeRole(user) === "project_team";

const ROLE_LABELS = {
  project_team: "Project Team",
  d_chief:      "D.Chief",
  chief:        "Chief",
  tec:          "TEC",
  player:       "მოთამაშე",
};

const ROLE_COLORS = {
  project_team: "#ff2d78",
  d_chief:      "#f97316",
  chief:        "#fb923c",
  tec:          "#facc15",
  player:       "oklch(0.75 0.03 270)",
};

function getRoleLabel(user) {
  return ROLE_LABELS[normalizeRole(user)] || "მოთამაშე";
}

function getRoleColor(user) {
  return ROLE_COLORS[normalizeRole(user)] || "oklch(0.75 0.03 270)";
}

/* ─── STYLES ──────────────────────────────────────────────────────────────── */
const injectForumStyles = () => {
  if (typeof document === "undefined") return;
  if (document.getElementById("grl-forum-styles")) return;
  const style = document.createElement("style");
  style.id = "grl-forum-styles";
  style.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Rajdhani:wght@400;500;600;700&family=JetBrains+Mono:wght@400;700&display=swap');

    .grl-forum-root {
      --grl-radius: 0.625rem;
      --grl-background: oklch(0.15 0.025 285);
      --grl-foreground: oklch(0.97 0.005 250);
      --grl-card: oklch(0.19 0.03 285 / 0.7);
      --grl-card-hover: oklch(0.22 0.035 285 / 0.8);
      --grl-card-foreground: oklch(0.97 0.005 250);
      --grl-primary: oklch(0.72 0.22 0);
      --grl-primary-glow: oklch(0.72 0.22 0 / 0.4);
      --grl-primary-foreground: oklch(0.13 0.02 285);
      --grl-secondary: oklch(0.26 0.03 285);
      --grl-muted: oklch(0.22 0.025 285);
      --grl-muted-foreground: oklch(0.68 0.025 270);
      --grl-accent: oklch(0.30 0.05 320);
      --grl-destructive: oklch(0.65 0.24 25);
      --grl-border: oklch(0.28 0.025 285 / 0.5);
      --grl-border-light: oklch(0.35 0.03 285 / 0.3);
      --grl-input: oklch(0.24 0.025 285);
      --grl-ring: oklch(0.72 0.22 0 / 0.5);
      --grl-cyan: oklch(0.78 0.14 220);
      --grl-cyan-glow: oklch(0.78 0.14 220 / 0.4);
      --grl-font-display: "Bebas Neue", "Noto Sans Georgian", sans-serif;
      --grl-font-sans: "Rajdhani", "Noto Sans Georgian", system-ui, sans-serif;
      --grl-font-mono: "JetBrains Mono", monospace;

      background-color: var(--grl-background);
      color: var(--grl-foreground);
      font-family: var(--grl-font-sans);
      -webkit-font-smoothing: antialiased;
      text-rendering: optimizeLegibility;
      overflow-x: hidden;
      position: relative;
      min-height: 100vh;
    }

    .grl-forum-root::-webkit-scrollbar { width: 6px; }
    .grl-forum-root::-webkit-scrollbar-track { background: transparent; }
    .grl-forum-root::-webkit-scrollbar-thumb { background: oklch(0.72 0.22 0 / 0.3); border-radius: 3px; }
    .grl-forum-root::-webkit-scrollbar-thumb:hover { background: oklch(0.72 0.22 0 / 0.5); }

    .grl-forum-root .grl-new-badge {
      display: inline-flex; align-items: center; gap: 0.15rem;
      padding: 0.1rem 0.5rem; border-radius: 999px;
      font-size: 0.55rem; font-weight: 800; letter-spacing: 0.08em;
      text-transform: uppercase;
      background: linear-gradient(135deg, oklch(0.55 0.22 220), oklch(0.45 0.20 260));
      color: #fff;
      box-shadow: 0 0 20px oklch(0.55 0.22 220 / 0.3);
      animation: grlPulse 2s ease-in-out infinite;
    }

    @keyframes grlPulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.6; }
    }

    .grl-forum-root .grl-cv-badge {
      display: inline-flex; align-items: center; gap: 0.2rem;
      padding: 0.12rem 0.6rem; border-radius: 999px;
      font-size: 0.52rem; font-weight: 800; letter-spacing: 0.1em;
      text-transform: uppercase;
      background: linear-gradient(135deg, oklch(0.55 0.22 155), oklch(0.45 0.20 175));
      color: #fff;
      box-shadow: 0 0 16px oklch(0.55 0.22 155 / 0.35);
    }

    .grl-forum-root .grl-cv-badge--hired {
      background: linear-gradient(135deg, oklch(0.55 0.22 155), oklch(0.45 0.20 175));
      box-shadow: 0 0 16px oklch(0.55 0.22 155 / 0.5);
      border: 1px solid oklch(0.55 0.22 155 / 0.5);
    }

    .grl-forum-root .grl-vacancy-badge {
      display: inline-flex; align-items: center; gap: 0.2rem;
      padding: 0.12rem 0.6rem; border-radius: 999px;
      font-size: 0.52rem; font-weight: 800; letter-spacing: 0.1em;
      text-transform: uppercase;
      background: linear-gradient(135deg, var(--grl-primary), var(--grl-cyan));
      color: #fff;
      box-shadow: 0 0 16px var(--grl-primary-glow);
    }

    .grl-role-chip {
      display: inline-flex; align-items: center; gap: 0.25rem;
      font-size: 0.52rem; font-weight: 800; letter-spacing: 0.12em;
      text-transform: uppercase; padding: 0.15rem 0.55rem;
      border-radius: 999px; border: 1px solid; white-space: nowrap;
    }

    .grl-forum-root .grl-status-label {
      display: inline-flex; align-items: center; gap: 0.2rem;
      padding: 0.1rem 0.55rem; border-radius: 0.3rem;
      font-size: 0.58rem; font-weight: 800; letter-spacing: 0.06em;
      text-transform: uppercase; color: #fff; white-space: nowrap;
    }
    .grl-status-label--approved { background: linear-gradient(135deg, oklch(0.50 0.20 160), oklch(0.40 0.18 150)); box-shadow: 0 0 16px oklch(0.50 0.20 160 / 0.3); }
    .grl-status-label--rejected { background: linear-gradient(135deg, oklch(0.55 0.25 25), oklch(0.45 0.22 20)); box-shadow: 0 0 16px oklch(0.55 0.25 25 / 0.3); }
    .grl-status-label--review   { background: linear-gradient(135deg, oklch(0.45 0.18 250), oklch(0.35 0.16 240)); box-shadow: 0 0 16px oklch(0.45 0.18 250 / 0.3); }
    .grl-status-label--update   { background: linear-gradient(135deg, oklch(0.50 0.20 80), oklch(0.40 0.18 70)); box-shadow: 0 0 16px oklch(0.50 0.20 80 / 0.3); }
    .grl-status-label--admin    { background: linear-gradient(135deg, oklch(0.55 0.25 25), oklch(0.45 0.22 20)); box-shadow: 0 0 16px oklch(0.55 0.25 25 / 0.3); }
    .grl-status-label--rules    { background: linear-gradient(135deg, oklch(0.45 0.18 200), oklch(0.35 0.16 190)); box-shadow: 0 0 16px oklch(0.45 0.18 200 / 0.3); }
    .grl-status-label--info     { background: linear-gradient(135deg, oklch(0.45 0.15 250), oklch(0.35 0.13 240)); box-shadow: 0 0 16px oklch(0.45 0.15 250 / 0.3); }
    .grl-status-label--new      { background: linear-gradient(135deg, oklch(0.55 0.22 220), oklch(0.45 0.20 260)); box-shadow: 0 0 16px oklch(0.55 0.22 220 / 0.3); }
    .grl-status-label--question { background: linear-gradient(135deg, oklch(0.45 0.18 250), oklch(0.35 0.16 240)); box-shadow: 0 0 16px oklch(0.45 0.18 250 / 0.3); }
    .grl-status-label--vacancy  { background: linear-gradient(135deg, oklch(0.72 0.22 0), oklch(0.78 0.14 220)); box-shadow: 0 0 16px oklch(0.72 0.22 0 / 0.3); }
    .grl-status-label--cv       { background: linear-gradient(135deg, oklch(0.55 0.20 155), oklch(0.45 0.18 175)); box-shadow: 0 0 16px oklch(0.55 0.20 155 / 0.3); }
    .grl-status-label--closed   { background: linear-gradient(135deg, oklch(0.50 0.10 250), oklch(0.40 0.08 240)); box-shadow: 0 0 16px oklch(0.50 0.10 250 / 0.3); }
    .grl-status-label--hired    { background: linear-gradient(135deg, oklch(0.50 0.20 160), oklch(0.40 0.18 150)); box-shadow: 0 0 16px oklch(0.50 0.20 160 / 0.5); border: 1px solid oklch(0.50 0.20 160 / 0.5); }

    .grl-forum-root .grl-category-block {
      border-radius: 1rem;
      border: 1px solid var(--grl-border);
      overflow: hidden;
      background: var(--grl-card);
      backdrop-filter: blur(16px);
      margin-bottom: 1.25rem;
      transition: all 0.3s ease;
      animation: grlFadeUp 0.5s cubic-bezier(0.22, 1, 0.36, 1) both;
    }
    .grl-forum-root .grl-category-block:hover {
      border-color: oklch(0.72 0.22 0 / 0.25);
      box-shadow: 0 8px 32px oklch(0 0 0 / 0.3);
    }

    .grl-forum-root .grl-category-block--vacancy {
      border-color: oklch(0.72 0.22 0 / 0.3);
    }
    .grl-forum-root .grl-category-block--vacancy .grl-category-header {
      background: linear-gradient(to right, oklch(0.72 0.22 0 / 0.08), oklch(0.78 0.14 220 / 0.04));
    }

    .grl-forum-root .grl-category-header {
      display: flex; align-items: center; justify-content: space-between;
      padding: 0.875rem 1.25rem;
      background: linear-gradient(to right, oklch(0.72 0.22 0 / 0.06), transparent);
      cursor: pointer;
      user-select: none;
      border-bottom: 1px solid var(--grl-border);
      transition: all 0.3s ease;
    }
    .grl-forum-root .grl-category-header:hover {
      background: linear-gradient(to right, oklch(0.72 0.22 0 / 0.10), oklch(0.72 0.22 0 / 0.02));
    }
    .grl-forum-root .grl-category-title {
      font-size: 1.05rem;
      font-weight: 700;
      color: oklch(0.97 0.005 250);
      font-family: var(--grl-font-sans);
      display: flex; align-items: center; gap: 0.5rem;
    }

    .grl-forum-root .grl-subforum-row {
      display: grid;
      grid-template-columns: 44px 1fr auto auto;
      align-items: center;
      gap: 1rem;
      padding: 0.85rem 1.25rem;
      border-bottom: 1px solid var(--grl-border-light);
      cursor: pointer;
      transition: all 0.3s ease;
      position: relative;
      overflow: hidden;
    }
    .grl-forum-root .grl-subforum-row:last-child { border-bottom: none; }
    .grl-forum-root .grl-subforum-row:hover {
      background: oklch(0.72 0.22 0 / 0.04);
      border-color: oklch(0.72 0.22 0 / 0.15);
    }
    .grl-forum-root .grl-subforum-row::before {
      content: ""; position: absolute; left: 0; top: 0; bottom: 0;
      width: 3px; background: transparent; transition: background 0.4s ease;
    }
    .grl-forum-root .grl-subforum-row:hover::before {
      background: linear-gradient(to bottom, var(--grl-primary), oklch(0.60 0.26 330));
    }
    .grl-forum-root .grl-subforum-row--vacancy:hover::before {
      background: linear-gradient(to bottom, var(--grl-primary), var(--grl-cyan));
    }

    .grl-forum-root .grl-subforum-icon-wrap {
      width: 40px; height: 40px; border-radius: 0.75rem; flex-shrink: 0;
      display: flex; align-items: center; justify-content: center;
      background: linear-gradient(135deg, oklch(0.72 0.22 0 / 0.12), oklch(0.60 0.26 330 / 0.08));
      border: 1px solid oklch(0.72 0.22 0 / 0.15);
      color: var(--grl-primary);
      transition: all 0.4s ease;
    }
    .grl-forum-root .grl-subforum-row--vacancy .grl-subforum-icon-wrap {
      background: linear-gradient(135deg, oklch(0.72 0.22 0 / 0.14), oklch(0.78 0.14 220 / 0.10));
      border-color: oklch(0.72 0.22 0 / 0.2);
      color: var(--grl-primary);
    }
    .grl-forum-root .grl-subforum-row:hover .grl-subforum-icon-wrap {
      background: linear-gradient(135deg, var(--grl-primary), oklch(0.60 0.26 330));
      color: #fff;
      transform: scale(1.05);
      box-shadow: 0 0 30px var(--grl-primary-glow);
    }
    .grl-forum-root .grl-subforum-row--vacancy:hover .grl-subforum-icon-wrap {
      background: linear-gradient(135deg, var(--grl-primary), var(--grl-cyan));
      box-shadow: 0 0 30px var(--grl-primary-glow);
    }

    .grl-forum-root .grl-subforum-name {
      font-size: 0.875rem; font-weight: 700; color: oklch(0.97 0.005 250);
      display: flex; align-items: center; flex-wrap: wrap; gap: 0.3rem;
    }
    .grl-forum-root .grl-subforum-sub {
      font-size: 0.65rem; color: var(--grl-muted-foreground); margin-top: 0.15rem;
      display: flex; align-items: center; gap: 0.4rem;
    }

    .grl-forum-root .grl-stat-col {
      text-align: center; min-width: 65px;
    }
    .grl-forum-root .grl-stat-num {
      font-size: 0.875rem; font-weight: 700; color: oklch(0.97 0.005 250);
      font-family: var(--grl-font-mono);
    }
    .grl-forum-root .grl-stat-label {
      font-size: 0.5rem; text-transform: uppercase; letter-spacing: 0.12em;
      color: var(--grl-muted-foreground); font-weight: 600; margin-top: 0.1rem;
    }

    .grl-forum-root .grl-last-post-col {
      display: flex; align-items: center; gap: 0.625rem;
      min-width: 170px; max-width: 200px;
    }
    .grl-forum-root .grl-last-post-avatar {
      width: 32px; height: 32px; border-radius: 50%; flex-shrink: 0;
      display: flex; align-items: center; justify-content: center;
      color: #fff; font-size: 0.7rem; font-weight: 700;
      transition: transform 0.3s ease;
    }
    .grl-forum-root .grl-subforum-row:hover .grl-last-post-avatar { transform: scale(1.05); }
    .grl-forum-root .grl-last-post-title {
      font-size: 0.65rem; font-weight: 700; color: oklch(0.95 0.005 250);
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 120px;
      display: block;
    }
    .grl-forum-root .grl-last-post-meta {
      font-size: 0.55rem; color: var(--grl-muted-foreground); margin-top: 0.1rem;
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 120px;
      display: block;
    }

    .grl-forum-root .grl-input {
      width: 100%; background-color: oklch(0.18 0.025 285 / 0.6);
      border: 1px solid var(--grl-border); border-radius: 0.75rem;
      padding: 0.75rem 1rem; font-size: 0.875rem; color: var(--grl-foreground);
      font-family: var(--grl-font-sans); outline: none;
      transition: all 0.3s ease;
    }
    .grl-forum-root .grl-input::placeholder { color: oklch(0.68 0.025 270 / 0.6); }
    .grl-forum-root .grl-input:focus {
      border-color: var(--grl-primary);
      box-shadow: 0 0 0 4px oklch(0.72 0.22 0 / 0.12);
      background-color: oklch(0.20 0.025 285 / 0.6);
    }
    .grl-forum-root textarea.grl-input { resize: none; }

    .grl-forum-root .grl-cv-form {
      background: oklch(0.55 0.20 155 / 0.06);
      border: 1px solid oklch(0.55 0.20 155 / 0.25);
      border-radius: 1rem; padding: 1.25rem;
    }
    .grl-forum-root .grl-cv-field {
      display: flex; flex-direction: column; gap: 0.3rem; margin-bottom: 0.875rem;
    }
    .grl-forum-root .grl-cv-field:last-child { margin-bottom: 0; }

    .grl-forum-root .grl-btn {
      display: inline-flex; align-items: center; justify-content: center; gap: 0.5rem;
      border-radius: 0.75rem; font-family: var(--grl-font-sans); font-weight: 800;
      font-size: 0.8rem; cursor: pointer; transition: all 0.3s ease; border: none; outline: none;
      position: relative; overflow: hidden;
    }
    .grl-forum-root .grl-btn-primary {
      background: linear-gradient(135deg, var(--grl-primary), oklch(0.60 0.26 330));
      color: #fff; padding: 0.75rem 1.5rem;
      box-shadow: 0 4px 24px var(--grl-primary-glow);
    }
    .grl-forum-root .grl-btn-primary:hover {
      transform: translateY(-2px) scale(1.02);
      box-shadow: 0 8px 40px var(--grl-primary-glow);
    }
    .grl-forum-root .grl-btn-primary:active { transform: scale(0.98); }

    .grl-forum-root .grl-btn-vacancy {
      background: linear-gradient(135deg, var(--grl-primary), var(--grl-cyan));
      color: #fff; padding: 0.75rem 1.5rem;
      box-shadow: 0 4px 24px var(--grl-primary-glow);
    }
    .grl-forum-root .grl-btn-vacancy:hover {
      transform: translateY(-2px) scale(1.02);
      box-shadow: 0 8px 40px var(--grl-primary-glow);
    }

    .grl-forum-root .grl-btn-cv {
      background: linear-gradient(135deg, oklch(0.58 0.20 155), oklch(0.48 0.18 175));
      color: #fff; padding: 0.75rem 1.5rem;
      box-shadow: 0 4px 24px oklch(0.55 0.20 155 / 0.4);
    }
    .grl-forum-root .grl-btn-cv:hover {
      transform: translateY(-2px) scale(1.02);
      box-shadow: 0 8px 40px oklch(0.55 0.20 155 / 0.5);
    }

    .grl-forum-root .grl-btn-ghost {
      background-color: oklch(0.18 0.025 285 / 0.6); color: var(--grl-foreground);
      border: 1px solid var(--grl-border); padding: 0.75rem 1.25rem;
    }
    .grl-forum-root .grl-btn-ghost:hover {
      background-color: var(--grl-muted);
      border-color: var(--grl-primary);
      transform: translateY(-1px);
    }

    .grl-forum-root .grl-btn-outline-primary {
      background: oklch(0.72 0.22 0 / 0.08); color: var(--grl-primary);
      border: 1px solid oklch(0.72 0.22 0 / 0.3); padding: 0.625rem 1.5rem;
    }
    .grl-forum-root .grl-btn-outline-primary:hover {
      background: linear-gradient(135deg, var(--grl-primary), oklch(0.60 0.26 330));
      color: #fff; border-color: transparent;
      transform: translateY(-2px);
      box-shadow: 0 8px 32px var(--grl-primary-glow);
    }

    .grl-forum-root .grl-btn-sm { padding: 0.4rem 0.875rem; font-size: 0.7rem; }
    .grl-forum-root .grl-btn-xs { padding: 0.25rem 0.625rem; font-size: 0.6rem; border-radius: 0.5rem; }

    .grl-forum-root .grl-btn-danger {
      display: inline-flex; align-items: center; gap: 0.375rem;
      color: oklch(0.72 0.23 25); background: oklch(0.65 0.24 25 / 0.1);
      border: 1px solid oklch(0.65 0.24 25 / 0.3); padding: 0.3rem 0.7rem;
      border-radius: 0.5rem; font-size: 0.7rem; font-weight: 700; cursor: pointer; transition: all 0.3s ease;
    }
    .grl-forum-root .grl-btn-danger:hover {
      background: oklch(0.65 0.24 25 / 0.2); border-color: oklch(0.65 0.24 25 / 0.6);
      transform: scale(1.05);
    }

    .grl-forum-root .grl-btn-like {
      display: inline-flex; align-items: center; gap: 0.375rem; padding: 0.3rem 0.7rem;
      border-radius: 0.5rem; border: 1px solid var(--grl-border); font-size: 0.7rem;
      font-weight: 700; cursor: pointer; transition: all 0.3s ease;
      background: var(--grl-card); color: var(--grl-muted-foreground);
    }
    .grl-forum-root .grl-btn-like:hover {
      color: var(--grl-primary); border-color: oklch(0.72 0.22 0 / 0.4);
      background: oklch(0.72 0.22 0 / 0.06); transform: scale(1.05);
    }
    .grl-forum-root .grl-btn-like--active {
      background: oklch(0.72 0.22 0 / 0.15); color: var(--grl-primary);
      border-color: oklch(0.72 0.22 0 / 0.4);
      box-shadow: 0 0 20px oklch(0.72 0.22 0 / 0.15);
    }

    .grl-forum-root .grl-card {
      border-radius: 1rem; border: 1px solid var(--grl-border);
      background: var(--grl-card);
      backdrop-filter: blur(16px);
      transition: all 0.4s ease;
    }
    .grl-forum-root .grl-card:hover { border-color: oklch(0.72 0.22 0 / 0.2); }
    .grl-forum-root .grl-card-3xl { border-radius: 1.5rem; }

    .grl-forum-root .grl-thread-row {
      cursor: pointer; padding: 0.875rem 1rem;
      transition: all 0.3s ease;
      border-bottom: 1px solid var(--grl-border-light);
      position: relative;
    }
    .grl-forum-root .grl-thread-row:last-child { border-bottom: none; }
    .grl-forum-root .grl-thread-row:hover { background: oklch(0.72 0.22 0 / 0.04); }
    .grl-forum-root .grl-thread-row::before {
      content: ""; position: absolute; left: 0; top: 0; bottom: 0;
      width: 2px; background: transparent; transition: background 0.4s ease;
    }
    .grl-forum-root .grl-thread-row:hover::before {
      background: linear-gradient(to bottom, var(--grl-primary), oklch(0.60 0.26 330));
    }

    .grl-forum-root .grl-post-card {
      border-radius: 1rem; border: 1px solid var(--grl-border);
      background: var(--grl-card);
      backdrop-filter: blur(16px);
      overflow: hidden; transition: all 0.4s ease;
      box-shadow: 0 4px 24px oklch(0 0 0 / 0.2);
      animation: grlFadeUp 0.5s cubic-bezier(0.22, 1, 0.36, 1) both;
    }
    .grl-forum-root .grl-post-card:hover {
      border-color: oklch(0.72 0.22 0 / 0.25);
      box-shadow: 0 8px 40px oklch(0 0 0 / 0.3);
    }

    .grl-forum-root .grl-verdict-banner {
      display: flex; align-items: center; gap: 0.75rem;
      padding: 0.75rem 1.25rem; border-radius: 0.75rem;
      font-size: 0.8rem; font-weight: 700;
      animation: grlFadeUp 0.4s ease both;
    }
    .grl-verdict-banner--approved { background: oklch(0.72 0.19 160 / 0.12); border: 1px solid oklch(0.72 0.19 160 / 0.3); color: oklch(0.78 0.19 160); }
    .grl-verdict-banner--rejected { background: oklch(0.65 0.24 25 / 0.12); border: 1px solid oklch(0.65 0.24 25 / 0.3); color: oklch(0.75 0.22 25); }
    .grl-verdict-banner--hired { background: oklch(0.72 0.19 160 / 0.15); border: 2px solid oklch(0.72 0.19 160 / 0.5); color: oklch(0.78 0.19 160); }

    .grl-forum-root .grl-error-box {
      background: oklch(0.65 0.24 25 / 0.1); border: 1px solid oklch(0.65 0.24 25 / 0.3);
      color: oklch(0.78 0.20 25); padding: 0.75rem 1rem; border-radius: 0.75rem;
      font-size: 0.875rem; display: flex; align-items: center; gap: 0.5rem;
    }

    .grl-forum-root .grl-label {
      display: flex; align-items: center; gap: 0.5rem;
      font-size: 0.65rem; font-weight: 700; text-transform: uppercase;
      letter-spacing: 0.12em; color: var(--grl-muted-foreground); margin-bottom: 0.4rem;
    }

    .grl-forum-root .grl-sidebar-header {
      padding: 0.875rem 1.125rem; border-bottom: 1px solid var(--grl-border);
      display: flex; align-items: center; justify-content: space-between;
    }

    .grl-forum-root .grl-modal-overlay {
      position: fixed; inset: 0; z-index: 50; display: flex; align-items: center; justify-content: center;
      padding: 1rem; background: oklch(0.15 0.025 285 / 0.85); backdrop-filter: blur(20px);
      animation: grlFadeIn 0.4s ease both;
    }

    .grl-forum-root .grl-truncate    { overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }

    .grl-toast {
      position: fixed; bottom: 2rem; right: 2rem; z-index: 9999;
      background: oklch(0.20 0.03 285); border: 1px solid oklch(0.72 0.22 0 / 0.3);
      color: oklch(0.97 0.005 250); padding: 0.875rem 1.25rem;
      border-radius: 0.875rem; font-size: 0.825rem; font-weight: 700;
      font-family: "Rajdhani","Noto Sans Georgian",system-ui,sans-serif;
      box-shadow: 0 8px 32px oklch(0 0 0 / 0.4);
      display: flex; align-items: center; gap: 0.625rem;
      animation: grlFadeUp 0.4s ease both;
      max-width: 320px;
    }
    .grl-toast--role { border-color: oklch(0.72 0.22 5 / 0.5); }

    @keyframes grlFadeIn {
      from { opacity: 0; } to { opacity: 1; }
    }
    @keyframes grlFadeUp {
      from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); }
    }
    @keyframes grlFadeScale {
      from { opacity: 0; transform: scale(0.95) translateY(8px); } to { opacity: 1; transform: scale(1) translateY(0); }
    }
    @keyframes grlPing {
      75%, 100% { transform: scale(2); opacity: 0; }
    }
    @keyframes grlSpin {
      from { transform: rotate(0deg); } to { transform: rotate(360deg); }
    }
    @keyframes grlShimmer {
      0% { background-position: -200% center; } 100% { background-position: 200% center; }
    }
    @keyframes grlFloat {
      0%, 100% { transform: translateY(0); } 50% { transform: translateY(-6px); }
    }
    @keyframes grlSkylineGlow {
      0%, 100% { opacity: 0.55; } 50% { opacity: 0.85; }
    }
    @keyframes grlGridScroll {
      from { transform: translateY(0); } to { transform: translateY(64px); }
    }
    @keyframes grlScanline {
      from { transform: translateY(-100%); } to { transform: translateY(100vh); }
    }

    .grl-forum-root .grl-animate-fadein    { animation: grlFadeIn 0.5s ease both; }
    .grl-forum-root .grl-animate-fadeup    { animation: grlFadeUp 0.5s cubic-bezier(0.22,1,0.36,1) both; }
    .grl-forum-root .grl-animate-fadescale { animation: grlFadeScale 0.4s cubic-bezier(0.22,1,0.36,1) both; }
    .grl-forum-root .grl-animate-spin      { animation: grlSpin 1s linear infinite; }
    .grl-forum-root .grl-animate-float     { animation: grlFloat 3s ease-in-out infinite; }

    .grl-forum-root .grl-shimmer {
      background: linear-gradient(90deg, transparent 0%, oklch(1 0 0 / 0.04) 50%, transparent 100%);
      background-size: 200% 100%; animation: grlShimmer 3s ease-in-out infinite;
    }

    .grl-forum-root .grl-thread-header {
      display: grid;
      grid-template-columns: 1fr 70px 80px 150px;
      padding: 0.6rem 1rem;
      background: oklch(0.18 0.03 285 / 0.5);
      border-bottom: 1px solid var(--grl-border);
      font-size: 0.55rem; font-weight: 700; text-transform: uppercase;
      letter-spacing: 0.15em; color: var(--grl-muted-foreground);
      align-items: center; gap: 1rem;
    }

    .grl-cv-status-badge {
      display: inline-flex; align-items: center; gap: 0.2rem;
      padding: 0.08rem 0.4rem; border-radius: 999px;
      font-size: 0.45rem; font-weight: 800; letter-spacing: 0.08em;
      text-transform: uppercase;
    }
    .grl-cv-status-badge--pending { background: oklch(0.82 0.16 80 / 0.2); color: oklch(0.82 0.16 80); border: 1px solid oklch(0.82 0.16 80 / 0.3); }
    .grl-cv-status-badge--approved { background: oklch(0.72 0.19 160 / 0.2); color: oklch(0.78 0.19 160); border: 1px solid oklch(0.72 0.19 160 / 0.3); }
    .grl-cv-status-badge--rejected { background: oklch(0.65 0.24 25 / 0.2); color: oklch(0.75 0.22 25); border: 1px solid oklch(0.65 0.24 25 / 0.3); }
    .grl-cv-status-badge--hired { background: oklch(0.72 0.19 160 / 0.25); color: oklch(0.78 0.19 160); border: 1px solid oklch(0.72 0.19 160 / 0.5); }

    @media (max-width: 767px) {
      .grl-forum-root .grl-subforum-row { grid-template-columns: 40px 1fr; }
      .grl-forum-root .grl-stat-col { display: none; }
      .grl-forum-root .grl-last-post-col { display: none; }
      .grl-forum-root .grl-thread-header { display: none; }
      .grl-forum-root .grl-post-card > div { grid-template-columns: 1fr !important; }
      .grl-forum-root .grl-post-card > div > div:first-child {
        border-right: none !important;
        border-bottom: 1px solid var(--grl-border);
        flex-direction: row !important;
        flex-wrap: wrap;
        justify-content: center;
        padding: 0.75rem !important;
        gap: 0.5rem !important;
      }
      .grl-forum-root .grl-cv-field-grid { grid-template-columns: 1fr 1fr !important; }
    }

    @media (min-width: 1024px) {
      .grl-forum-root .grl-lg-grid-main { display: grid; grid-template-columns: 1fr 300px; gap: 1.75rem; align-items: start; }
      .grl-forum-root .grl-sidebar-sticky { position: sticky; top: 1.5rem; }
    }
    @media (max-width: 1023px) {
      .grl-forum-root .grl-lg-grid-main { display: block; }
      .grl-forum-root aside.grl-sidebar-sticky { margin-top: 2rem; }
    }

    .grl-bg-scene {
      position: fixed; inset: 0; pointer-events: none; z-index: 0; overflow: hidden;
    }
    .grl-bg-grid {
      position: absolute; bottom: 0; left: 0; right: 0; height: 55%;
      background-image:
        linear-gradient(to right, oklch(0.72 0.22 0 / 0.07) 1px, transparent 1px),
        linear-gradient(to bottom, oklch(0.72 0.22 0 / 0.07) 1px, transparent 1px);
      background-size: 64px 64px;
      transform-origin: bottom center;
      transform: perspective(600px) rotateX(55deg) scaleX(2.2);
      mask-image: linear-gradient(to top, black 0%, black 40%, transparent 100%);
      -webkit-mask-image: linear-gradient(to top, black 0%, black 40%, transparent 100%);
      animation: grlGridScroll 4s linear infinite;
    }
    .grl-bg-scanline {
      position: absolute; left: 0; right: 0; height: 3px;
      background: linear-gradient(to bottom, transparent, oklch(0.72 0.22 0 / 0.12), transparent);
      animation: grlScanline 8s linear infinite; pointer-events: none;
    }
    .grl-bg-horizon {
      position: absolute; bottom: 38%; left: 0; right: 0; height: 2px;
      background: linear-gradient(to right,
        transparent 0%, oklch(0.72 0.22 0 / 0.6) 20%,
        oklch(0.82 0.18 340 / 0.9) 50%, oklch(0.72 0.22 0 / 0.6) 80%, transparent 100%
      );
      filter: blur(1px);
      box-shadow: 0 0 30px 4px oklch(0.72 0.22 0 / 0.3);
    }
    .grl-bg-atmosphere {
      position: absolute; top: 0; left: 0; right: 0; height: 100%;
      background:
        radial-gradient(ellipse 80% 45% at 50% -5%, oklch(0.45 0.20 350 / 0.30), transparent 60%),
        radial-gradient(ellipse 60% 40% at 15% 30%, oklch(0.40 0.22 285 / 0.18), transparent 55%),
        radial-gradient(ellipse 50% 35% at 85% 25%, oklch(0.38 0.20 320 / 0.15), transparent 50%);
    }
  `;
  document.head.appendChild(style);
};

/* ─── CITY BACKGROUND ────────────────────────────────────────────────────── */
function CityBackground() {
  return (
    <div className="grl-bg-scene">
      <div className="grl-bg-atmosphere" />
      <svg
        style={{ position:"absolute", bottom:"36%", left:0, width:"100%", height:"auto", minHeight:260, opacity:0.65, animation:"grlSkylineGlow 6s ease-in-out infinite" }}
        viewBox="0 0 1440 280" preserveAspectRatio="xMidYMax slice" xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="skyBg" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="oklch(0.72 0.22 0)" stopOpacity="0.3" />
            <stop offset="100%" stopColor="oklch(0.12 0.02 285)" stopOpacity="1" />
          </linearGradient>
          <linearGradient id="buildingDark" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0a0a1a" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#050510" stopOpacity="1" />
          </linearGradient>
          <filter id="neonBlur"><feGaussianBlur stdDeviation="2" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
          <filter id="softGlow"><feGaussianBlur stdDeviation="3" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
        </defs>
        <g opacity="0.4">
          <rect x="0" y="200" width="40" height="80" fill="url(#buildingDark)" />
          <rect x="45" y="185" width="30" height="95" fill="url(#buildingDark)" />
          <rect x="80" y="210" width="50" height="70" fill="url(#buildingDark)" />
          <rect x="135" y="175" width="35" height="105" fill="url(#buildingDark)" />
          <rect x="1100" y="170" width="45" height="110" fill="url(#buildingDark)" />
          <rect x="1150" y="190" width="35" height="90" fill="url(#buildingDark)" />
          <rect x="1255" y="175" width="40" height="105" fill="url(#buildingDark)" />
          <rect x="1355" y="185" width="45" height="95" fill="url(#buildingDark)" />
        </g>
        <rect x="0" y="160" width="60" height="120" fill="url(#buildingDark)" />
        <rect x="65" y="120" width="45" height="160" fill="url(#buildingDark)" />
        <rect x="55" y="110" width="25" height="15" fill="#ff2d78" opacity="0.5" />
        <rect x="115" y="140" width="70" height="140" fill="url(#buildingDark)" />
        <rect x="190" y="100" width="50" height="180" fill="url(#buildingDark)" />
        <rect x="213" y="90" width="8" height="20" fill="#ff2d78" opacity="0.7" />
        <rect x="245" y="130" width="65" height="150" fill="url(#buildingDark)" />
        <rect x="360" y="110" width="55" height="170" fill="url(#buildingDark)" />
        <rect x="383" y="98" width="10" height="18" fill="#8b00ff" opacity="0.7" />
        <rect x="420" y="140" width="80" height="140" fill="url(#buildingDark)" />
        <rect x="520" y="60" width="80" height="220" fill="url(#buildingDark)" />
        <rect x="554" y="45" width="12" height="22" fill="#ff2d78" opacity="0.9" filter="url(#softGlow)" />
        <rect x="605" y="80" width="60" height="200" fill="url(#buildingDark)" />
        <rect x="670" y="30" width="100" height="250" fill="url(#buildingDark)" />
        <rect x="717" y="10" width="4" height="28" fill="#ff2d78" opacity="0.95" filter="url(#softGlow)" />
        <rect x="775" y="55" width="75" height="225" fill="url(#buildingDark)" />
        <rect x="808" y="40" width="10" height="22" fill="#8b00ff" opacity="0.8" filter="url(#softGlow)" />
        <rect x="855" y="90" width="55" height="190" fill="url(#buildingDark)" />
        <rect x="915" y="120" width="70" height="160" fill="url(#buildingDark)" />
        <rect x="990" y="100" width="55" height="180" fill="url(#buildingDark)" />
        <rect x="1050" y="130" width="80" height="150" fill="url(#buildingDark)" />
        <rect x="1190" y="115" width="65" height="165" fill="url(#buildingDark)" />
        <rect x="1315" y="120" width="60" height="160" fill="url(#buildingDark)" />
        <rect x="1380" y="150" width="60" height="130" fill="url(#buildingDark)" />
        <g opacity="0.6" fill="#ff2d78">
          <rect x="72" y="130" width="5" height="4" opacity="0.8" />
          <rect x="82" y="145" width="5" height="4" opacity="0.5" />
          <rect x="196" y="115" width="5" height="4" opacity="0.8" />
          <rect x="210" y="130" width="5" height="4" opacity="0.5" />
        </g>
        <g opacity="0.5" fill="#8b00ff">
          <rect x="526" y="80" width="6" height="4" opacity="0.9" />
          <rect x="540" y="100" width="6" height="4" opacity="0.6" />
          <rect x="680" y="50" width="6" height="4" opacity="0.9" />
          <rect x="700" y="70" width="6" height="4" opacity="0.7" />
          <rect x="782" y="70" width="6" height="4" opacity="0.7" />
          <rect x="800" y="90" width="6" height="4" opacity="0.6" />
        </g>
        <g filter="url(#neonBlur)" opacity="0.5">
          <line x1="670" y1="30" x2="670" y2="280" stroke="#ff2d78" strokeWidth="1.5" />
          <line x1="770" y1="30" x2="770" y2="280" stroke="#8b00ff" strokeWidth="1.5" />
        </g>
        <rect x="0" y="278" width="1440" height="2" fill="url(#skyBg)" />
      </svg>
      <div className="grl-bg-grid" />
      <div className="grl-bg-horizon" />
      <div className="grl-bg-scanline" />
    </div>
  );
}

/* ─── DATA ────────────────────────────────────────────────────────────────── */
const ADMIN_USERNAME = "CHAVLE";

const initialCategories = [
  { id: "main",       title: "GRL მთავარი განყოფილება",                  subTitle: "მთავარი საორგანიზაციო და საინფორმაციო თემები" },
  { id: "rules",      title: "GRL პროექტის წესები",                       subTitle: "სერვერის, ადმინისტრაციისა და მედიის წესდება" },
  { id: "state",      title: "GRL სახელმწიფო ორგანიზაციების წესდებები",  subTitle: "სტრუქტურული წესები, კოდექსები და კანონები" },
  { id: "complaints", title: "GRL საჩივრების განყოფილება",                subTitle: "საჩივრები ადმინისტრატორებზე, მოთამაშეებსა და ლიდერებზე" },
  { id: "vacancies",  title: "GRL ვაკანსიები",                            subTitle: "ადმინისტრაციაში შესვლის CV-ები და ღია პოზიციები" },
];

const iconMap = {
  Shield, Wrench, Sparkles, Unlock, Calendar, BookOpen, Award,
  ClipboardList, Video, Landmark, Scale, Eye, FileText, AlertCircle,
  UserX, CheckSquare, MessageCircle, Briefcase,
};
const getIconByName = (name) => iconMap[name] || MessageCircle;

const initialSubforums = [
  { id: "admin-staff",           categoryId: "main",       title: "ადმინისტრაციის შემადგენლობა",           iconName: "Shield",        topicsCount: 0, postsCount: 0, lastPost: null },
  { id: "technical",             categoryId: "main",       title: "ტექნიკური განყოფილება",                  iconName: "Wrench",        topicsCount: 0, postsCount: 0, lastPost: null },
  { id: "updates",               categoryId: "main",       title: "პროექტის განახლებები",                   iconName: "Sparkles",      topicsCount: 0, postsCount: 0, lastPost: null },
  { id: "amnesty",               categoryId: "main",       title: "ამნისტია",                               iconName: "Unlock",        topicsCount: 0, postsCount: 0, lastPost: null },
  { id: "vacancies",             categoryId: "main",       title: "ვაკანსიები",                             iconName: "Briefcase",     topicsCount: 0, postsCount: 0, lastPost: null },
  { id: "general-rules",         categoryId: "rules",      title: "ზოგადი წესები",                          iconName: "BookOpen",      topicsCount: 0, postsCount: 0, lastPost: null },
  { id: "admin-rules",           categoryId: "rules",      title: "ადმინისტრაციის წესები",                  iconName: "Award",         topicsCount: 0, postsCount: 0, lastPost: null },
  { id: "org-rules",             categoryId: "rules",      title: "ორგანიზაციის წესები",                    iconName: "ClipboardList", topicsCount: 0, postsCount: 0, lastPost: null },
  { id: "media-rules",           categoryId: "rules",      title: "პროექტის მედია პარტნიორობა",             iconName: "Video",         topicsCount: 0, postsCount: 0, lastPost: null },
  { id: "fraction-jurisdiction", categoryId: "state",      title: "სახელმწიფო ფრაქციების იურისდიქცია",      iconName: "Landmark",      topicsCount: 0, postsCount: 0, lastPost: null },
  { id: "criminal-code",         categoryId: "state",      title: "სისხლის სამართლის კოდექსი",             iconName: "Scale",         topicsCount: 0, postsCount: 0, lastPost: null },
  { id: "special-ops",           categoryId: "state",      title: "სპეც ოპერაციების წესები",               iconName: "Eye",           topicsCount: 0, postsCount: 0, lastPost: null },
  { id: "constitution",          categoryId: "state",      title: "კონსტიტუცია",                            iconName: "FileText",      topicsCount: 0, postsCount: 0, lastPost: null },
  { id: "complaint-admin",       categoryId: "complaints", title: "საჩივარი ადმინისტრატორზე",               iconName: "AlertCircle",   topicsCount: 0, postsCount: 0, lastPost: null },
  { id: "complaint-player",      categoryId: "complaints", title: "საჩივარი მოთამაშეზე",                    iconName: "UserX",         topicsCount: 0, postsCount: 0, lastPost: null },
  { id: "complaint-verifiers",   categoryId: "complaints", title: "საჩივრების შემმოწმებელი ადმინი",         iconName: "CheckSquare",   topicsCount: 0, postsCount: 0, lastPost: null },
];

/* ─── localStorage helpers ────────────────────────────────────────────────── */
const loadThreads     = () => { try { const s = localStorage.getItem("grl_threads");       return s ? JSON.parse(s) : []; }      catch { return []; } };
const loadSubforums   = () => { try { const s = localStorage.getItem("grl_subforums");     if (s) return JSON.parse(s); }        catch {} return initialSubforums; };
const loadUsers       = () => { try { const s = localStorage.getItem("grl_users");         return s ? JSON.parse(s) : []; }      catch { return []; } };
const loadCurrentUser = () => { try { const s = localStorage.getItem("grl_current_user"); return s ? JSON.parse(s) : null; }    catch { return null; } };
const loadCVs         = () => { try { const s = localStorage.getItem("grl_cvs");           return s ? JSON.parse(s) : []; }      catch { return []; } };

const syncCurrentUser = () => {
  try {
    const stored = localStorage.getItem("grl_current_user");
    if (!stored) return null;
    const cu = JSON.parse(stored);
    const users = loadUsers();
    const found = users.find(u => u.id === cu.id || u.username?.toLowerCase() === cu.username?.toLowerCase());
    if (!found) {
      localStorage.removeItem("grl_current_user");
      return null;
    }
    localStorage.setItem("grl_current_user", JSON.stringify(found));
    return found;
  } catch { return null; }
};

const isChavle = (username) => username?.toLowerCase() === ADMIN_USERNAME.toLowerCase();

/* ─── CV FORM FIELDS ─────────────────────────────────────────────────────── */
const CV_FIELDS = [
  { key: "fullName",      label: "სრული სახელი",           placeholder: "მაგ: გიორგი ბერიძე" },
  { key: "age",           label: "ასაკი",                    placeholder: "მაგ: 19" },
  { key: "nickname",      label: "დისქორდის სახელი",        placeholder: "მაგ: Giga_Chad" },
  { key: "experience",    label: "გამოცდილება",              placeholder: "წინა სერვერები, ადმინ-გამოცდილება..." },
  { key: "whyMe",         label: "რატომ უნდა ავიყვანოთ?",    placeholder: "მოახდინე პრეზენტაცია..." },
  { key: "activeHours",   label: "აქტიური საათები/დღე",      placeholder: "მაგ: 4–6 სთ" },
  { key: "micAvailable",  label: "მიკროფონი",                placeholder: "კი / არა" },
  { key: "extraInfo",     label: "დამატებითი ინფო",          placeholder: "ნებისმიერი სხვა ინფო..." },
];

/* ─── Status label helpers ───────────────────────────────────────────────── */
function statusKind(label = "") {
  const s = label.toLowerCase();
  if (s.includes("დადასტურ")) return "approved";
  if (s.includes("უარყოფ"))   return "rejected";
  if (s.includes("განხილვ"))  return "review";
  if (s.includes("ინფო") || s.includes("ინფორმ")) return "info";
  if (s.includes("წეს"))      return "rules";
  if (s.includes("განახ"))    return "update";
  if (s.includes("ადმინ"))    return "admin";
  if (s.includes("ახალ"))     return "new";
  if (s.includes("კითხვ"))    return "question";
  if (s.includes("ვაკანს") || s.includes("vacancy")) return "vacancy";
  if (s.includes("cv"))       return "cv";
  if (s.includes("დახურულ"))  return "closed";
  if (s.includes("აყვანილ"))  return "hired";
  return "info";
}

function StatusLabel({ label }) {
  return <span className={`grl-status-label grl-status-label--${statusKind(label)}`}>{label}</span>;
}

function VerdictBanner({ verdict, reason, closedBy, closedAt }) {
  if (!verdict) return null;
  const isApproved = verdict === "approved";
  const isHired = verdict === "hired";
  
  if (isHired) {
    return (
      <div className="grl-verdict-banner grl-verdict-banner--hired">
        <CheckCircle2 size={20} />
        <div>
          <div style={{ fontFamily:"var(--grl-font-display)", letterSpacing:"0.05em", fontSize:"0.875rem" }}>
            ✅ კანდიდატი აყვანილია — ვაკანსია დახურულია!
          </div>
          {closedBy && (
            <div style={{ fontSize:"0.75rem", fontWeight:400, marginTop:"0.25rem", opacity:0.85 }}>
              ადმინი: {closedBy} · {closedAt ? new Date(closedAt).toLocaleString("ka-GE") : ""}
            </div>
          )}
        </div>
      </div>
    );
  }
  
  return (
    <div className={`grl-verdict-banner grl-verdict-banner--${isApproved ? "approved" : "rejected"}`}>
      {isApproved ? <CheckCircle2 size={20} /> : <XCircle size={20} />}
      <div>
        <div style={{ fontFamily:"var(--grl-font-display)", letterSpacing:"0.05em", fontSize:"0.875rem" }}>
          {isApproved ? "საჩივარი დადასტურებულია" : "საჩივარი უარყოფილია"}
        </div>
        {reason && (
          <div style={{ fontSize:"0.75rem", fontWeight:400, marginTop:"0.25rem", opacity:0.85 }}>
            მიზეზი: {reason}
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Toast ──────────────────────────────────────────────────────────────── */
function Toast({ message, icon, onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, 3500);
    return () => clearTimeout(t);
  }, [onDone]);
  return (
    <div className="grl-toast grl-toast--role">
      {icon}
      <span>{message}</span>
    </div>
  );
}

/* ─── Auth Forms ─────────────────────────────────────────────────────────── */
function RegisterForm({ onRegister, onLoginClick }) {
  const [username, setUsername] = useState("");
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = () => {
    setError("");
    if (username.length < 3)  { setError("მომხმარებლის სახელი უნდა შეიცავდეს მინიმუმ 3 სიმბოლოს"); return; }
    if (username.length > 20) { setError("მომხმარებლის სახელი არ უნდა აღემატებოდეს 20 სიმბოლოს"); return; }
    if (!/^[a-zA-Z0-9_]+$/.test(username)) { setError("მხოლოდ ასოები, ციფრები და ქვედა ხაზი"); return; }
    if (!email.includes("@") || !email.includes(".")) { setError("გთხოვთ მიუთითოთ სწორი ელ-ფოსტა"); return; }
    if (password.length < 6)  { setError("პაროლი უნდა შეიცავდეს მინიმუმ 6 სიმბოლოს"); return; }
    if (password !== confirmPassword) { setError("პაროლები არ ემთხვევა"); return; }
    const users = loadUsers();
    if (users.find(u => u.username.toLowerCase() === username.toLowerCase())) { setError("მომხმარებელი ამ სახელით უკვე არსებობს"); return; }
    if (users.find(u => u.email.toLowerCase() === email.toLowerCase()))       { setError("მომხმარებელი ამ ელ-ფოსტით უკვე არსებობს"); return; }
    const isAdmin = isChavle(username);
    const colors = ["#ec4899","#8b5cf6","#3b82f6","#10b981","#f59e0b","#ef4444"];
    const c1 = colors[Math.floor(Math.random() * colors.length)];
    const c2 = colors[Math.floor(Math.random() * colors.length)];
    const newUser = {
      id: `user-${Date.now()}`, username, email, password,
      registeredAt: new Date().toISOString(),
      role: isAdmin ? "tec" : "player",
      avatarBg: isAdmin ? "linear-gradient(135deg,#ff2d78,#8b00ff)" : `linear-gradient(135deg,${c1},${c2})`,
      isAdmin,
    };
    users.push(newUser);
    localStorage.setItem("grl_users", JSON.stringify(users));
    localStorage.setItem("grl_current_user", JSON.stringify(newUser));
    window.dispatchEvent(new Event("grlAuthChange"));
    setSuccess(true);
    setTimeout(() => onRegister(newUser), 1500);
  };

  if (success) return (
    <div style={{ textAlign:"center", padding:"3rem 0" }}>
      <div style={{ width:80, height:80, borderRadius:"50%", background:"oklch(0.72 0.19 160/0.2)", border:"2px solid oklch(0.72 0.19 160/0.5)", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto" }}>
        <CheckCircle2 size={40} style={{ color:"oklch(0.72 0.19 160)" }} />
      </div>
      <h3 style={{ fontSize:"1.5rem", color:"oklch(0.97 0.005 250)", marginTop:"1.5rem", fontFamily:"var(--grl-font-display)" }}>რეგისტრაცია წარმატებულია!</h3>
      <p style={{ color:"var(--grl-muted-foreground)", marginTop:"0.5rem", fontSize:"0.875rem" }}>ფორუმზე გადამისამართება...</p>
    </div>
  );

  return (
    <div>
      <h3 style={{ fontSize:"1.5rem", color:"oklch(0.97 0.005 250)", marginBottom:"1rem", paddingBottom:"1rem", borderBottom:"1px solid var(--grl-border)", display:"flex", alignItems:"center", gap:"0.75rem", fontFamily:"var(--grl-font-display)" }}>
        <UserPlus size={24} style={{ color:"var(--grl-primary)" }} /> რეგისტრაცია
      </h3>
      {error && <div className="grl-error-box" style={{ marginBottom:"1.25rem" }}><AlertCircle size={16}/><span>{error}</span></div>}
      <div style={{ display:"flex", flexDirection:"column", gap:"1.25rem" }}>
        <div>
          <label className="grl-label"><User size={14}/> მომხმარებლის სახელი</label>
          <input type="text" value={username} onChange={e=>setUsername(e.target.value)} placeholder="მაგ: Giga_Chad" className="grl-input"/>
          {isChavle(username) && (
            <div style={{ fontSize:"0.65rem", color:"oklch(0.72 0.23 25)", marginTop:"0.25rem", fontWeight:700 }}>👑 ეს არის ადმინისტრატორის ანგარიში</div>
          )}
        </div>
        <div>
          <label className="grl-label"><Mail size={14}/> ელ-ფოსტა</label>
          <input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="example@email.com" className="grl-input"/>
        </div>
        <div>
          <label className="grl-label"><Lock size={14}/> პაროლი</label>
          <div style={{ position:"relative" }}>
            <input type={showPassword?"text":"password"} value={password} onChange={e=>setPassword(e.target.value)} placeholder="მინიმუმ 6 სიმბოლო" className="grl-input" style={{ paddingRight:"3rem" }}/>
            <button type="button" onClick={()=>setShowPassword(!showPassword)} style={{ position:"absolute", right:"1rem", top:"50%", transform:"translateY(-50%)", color:"var(--grl-muted-foreground)", background:"none", border:"none", cursor:"pointer" }}>
              {showPassword ? <EyeOff size={18}/> : <EyeIcon size={18}/>}
            </button>
          </div>
        </div>
        <div>
          <label className="grl-label"><Lock size={14}/> პაროლის დადასტურება</label>
          <input type={showPassword?"text":"password"} value={confirmPassword} onChange={e=>setConfirmPassword(e.target.value)} placeholder="გაიმეორეთ პაროლი" className="grl-input"/>
        </div>
        <div style={{ paddingTop:"1rem", borderTop:"1px solid var(--grl-border)", display:"flex", flexDirection:"column", gap:"0.75rem" }}>
          <button type="button" onClick={handleSubmit} className="grl-btn grl-btn-primary" style={{ width:"100%", padding:"0.875rem 1.5rem" }}><UserPlus size={18}/> რეგისტრაცია</button>
          <p style={{ textAlign:"center", fontSize:"0.75rem", color:"var(--grl-muted-foreground)" }}>
            უკვე გაქვთ ანგარიში?{" "}
            <button type="button" onClick={onLoginClick} style={{ color:"var(--grl-primary)", fontWeight:700, background:"none", border:"none", cursor:"pointer" }}>შესვლა</button>
          </p>
        </div>
      </div>
    </div>
  );
}

function LoginForm({ onLogin, onRegisterClick }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = () => {
    setError("");
    const users = loadUsers();
    const user = users.find(u => u.username.toLowerCase() === username.toLowerCase() && u.password === password);
    if (!user) { setError("მომხმარებელი ან პაროლი არასწორია"); return; }
    localStorage.setItem("grl_current_user", JSON.stringify(user));
    window.dispatchEvent(new Event("grlAuthChange"));
    onLogin(user);
  };

  return (
    <div>
      <h3 style={{ fontSize:"1.5rem", color:"oklch(0.97 0.005 250)", marginBottom:"1rem", paddingBottom:"1rem", borderBottom:"1px solid var(--grl-border)", display:"flex", alignItems:"center", gap:"0.75rem", fontFamily:"var(--grl-font-display)" }}>
        <LogIn size={24} style={{ color:"var(--grl-primary)" }} /> შესვლა
      </h3>
      {error && <div className="grl-error-box" style={{ marginBottom:"1.25rem" }}><AlertCircle size={16}/><span>{error}</span></div>}
      <div style={{ display:"flex", flexDirection:"column", gap:"1.25rem" }}>
        <div>
          <label className="grl-label"><User size={14}/> მომხმარებლის სახელი</label>
          <input type="text" value={username} onChange={e=>setUsername(e.target.value)} placeholder="მაგ: Giga_Chad" className="grl-input" onKeyDown={e=>e.key==="Enter"&&handleSubmit()}/>
        </div>
        <div>
          <label className="grl-label"><Lock size={14}/> პაროლი</label>
          <div style={{ position:"relative" }}>
            <input type={showPassword?"text":"password"} value={password} onChange={e=>setPassword(e.target.value)} placeholder="შეიყვანეთ პაროლი" className="grl-input" style={{ paddingRight:"3rem" }} onKeyDown={e=>e.key==="Enter"&&handleSubmit()}/>
            <button type="button" onClick={()=>setShowPassword(!showPassword)} style={{ position:"absolute", right:"1rem", top:"50%", transform:"translateY(-50%)", color:"var(--grl-muted-foreground)", background:"none", border:"none", cursor:"pointer", padding:"0.25rem" }}>
              {showPassword ? <EyeOff size={18}/> : <EyeIcon size={18}/>}
            </button>
          </div>
        </div>
        <div style={{ paddingTop:"1rem", borderTop:"1px solid var(--grl-border)", display:"flex", flexDirection:"column", gap:"0.75rem" }}>
          <button type="button" onClick={handleSubmit} className="grl-btn grl-btn-primary" style={{ width:"100%", padding:"0.875rem 1.5rem" }}>
            <LogIn size={18}/> შესვლა
          </button>
          <p style={{ textAlign:"center", fontSize:"0.75rem", color:"var(--grl-muted-foreground)" }}>
            არ გაქვთ ანგარიში?{" "}
            <button type="button" onClick={onRegisterClick} style={{ color:"var(--grl-primary)", fontWeight:700, background:"none", border:"none", cursor:"pointer", fontSize:"0.75rem" }}>რეგისტრაცია</button>
          </p>
        </div>
      </div>
    </div>
  );
}

function AuthShell({ children }) {
  return (
    <div className="grl-forum-root" style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", padding:"1rem" }}>
      <CityBackground />
      <div style={{ position:"relative", width:"100%", maxWidth:448, zIndex:1 }}>
        <div className="grl-card grl-card-3xl grl-animate-fadein" style={{ padding:"2rem", boxShadow:"0 25px 60px oklch(0 0 0/0.5)" }}>{children}</div>
      </div>
    </div>
  );
}

/* ─── HISTORY HOOK ─────────────────────────────────────────────────────────── */
function useForumHistory() {
  const [history, setHistory] = useState([{ view:"home", subforumId:"", threadId:"" }]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const current = history[historyIndex];
  const push = useCallback((entry) => {
    setHistory(prev => [...prev.slice(0, historyIndex + 1), entry]);
    setHistoryIndex(prev => prev + 1);
  }, [historyIndex]);
  const goBack = useCallback(() => {
    if (historyIndex > 0) setHistoryIndex(prev => prev - 1);
  }, [historyIndex]);
  const canGoBack = historyIndex > 0;
  return { current, push, goBack, canGoBack };
}

/* ─── SUBFORUM ROW ───────────────────────────────────────────────────────── */
function SubforumRow({ sub, onClick }) {
  const SubIcon = getIconByName(sub.iconName || "MessageCircle");
  const isVacancy = sub.categoryId === "vacancies" || sub.id === "vacancies";
  return (
    <div className={`grl-subforum-row${isVacancy ? " grl-subforum-row--vacancy" : ""}`} onClick={onClick}>
      <div className="grl-subforum-icon-wrap"><SubIcon size={18} /></div>
      <div>
        <div className="grl-subforum-name">
          {sub.title}
          {sub.topicsCount > 0 && <span className="grl-new-badge">NEW</span>}
          {isVacancy && (
            <span style={{ fontSize:"0.55rem", padding:"0.1rem 0.5rem", borderRadius:"999px", background:"linear-gradient(135deg, oklch(0.72 0.22 0/0.15), oklch(0.78 0.14 220/0.12))", color:"oklch(0.85 0.14 0)", border:"1px solid oklch(0.72 0.22 0/0.3)", fontWeight:700, letterSpacing:"0.08em" }}>
              CHIEF+ / ADMIN
            </span>
          )}
        </div>
        {isVacancy && (
          <div className="grl-subforum-sub">
            ვაკანსიების შექმნა: Chief / D.Chief / Admin · CV-ის გაგზავნა: ყველა
          </div>
        )}
      </div>
      <div style={{ display:"flex", gap:"2rem" }}>
        <div className="grl-stat-col">
          <div className="grl-stat-num">{sub.topicsCount >= 1000 ? `${(sub.topicsCount/1000).toFixed(1)}K` : sub.topicsCount}</div>
          <div className="grl-stat-label">ვაკ.</div>
        </div>
        <div className="grl-stat-col">
          <div className="grl-stat-num">{sub.postsCount >= 1000 ? `${(sub.postsCount/1000).toFixed(1)}K` : sub.postsCount}</div>
          <div className="grl-stat-label">CV</div>
        </div>
      </div>
      <div className="grl-last-post-col">
        {sub.lastPost ? (
          <>
            <div className="grl-last-post-avatar" style={{ background: sub.lastPost.avatarBg || "linear-gradient(135deg,#ec4899,#f43f5e)" }}>
              {sub.lastPost.author[0].toUpperCase()}
            </div>
            <div>
              <StatusLabel label={sub.lastPost.label || "ვაკანსია"} />
              <span className="grl-last-post-title" style={{ marginTop:"0.2rem" }}>{sub.lastPost.threadTitle}</span>
              <span className="grl-last-post-meta">{sub.lastPost.date} · {sub.lastPost.author}</span>
            </div>
          </>
        ) : (
          <span style={{ fontSize:"0.65rem", color:"var(--grl-muted-foreground)", fontStyle:"italic", opacity:0.6 }}>ვაკანსია არ არის</span>
        )}
      </div>
    </div>
  );
}

function DefaultSubforumRow({ sub, onClick }) {
  const SubIcon = getIconByName(sub.iconName || "MessageCircle");
  return (
    <div className="grl-subforum-row" onClick={onClick}>
      <div className="grl-subforum-icon-wrap"><SubIcon size={18} /></div>
      <div>
        <div className="grl-subforum-name">
          {sub.title}
          {sub.topicsCount > 0 && <span className="grl-new-badge">NEW</span>}
        </div>
      </div>
      <div style={{ display:"flex", gap:"2rem" }}>
        <div className="grl-stat-col">
          <div className="grl-stat-num">{sub.topicsCount >= 1000 ? `${(sub.topicsCount/1000).toFixed(1)}K` : sub.topicsCount}</div>
          <div className="grl-stat-label">Threads</div>
        </div>
        <div className="grl-stat-col">
          <div className="grl-stat-num">{sub.postsCount >= 1000 ? `${(sub.postsCount/1000).toFixed(1)}K` : sub.postsCount}</div>
          <div className="grl-stat-label">Messages</div>
        </div>
      </div>
      <div className="grl-last-post-col">
        {sub.lastPost ? (
          <>
            <div className="grl-last-post-avatar" style={{ background: sub.lastPost.avatarBg || "linear-gradient(135deg,#ec4899,#f43f5e)" }}>
              {sub.lastPost.author[0].toUpperCase()}
            </div>
            <div>
              <StatusLabel label={sub.lastPost.label || "ინფო"} />
              <span className="grl-last-post-title" style={{ marginTop:"0.2rem" }}>{sub.lastPost.threadTitle}</span>
              <span className="grl-last-post-meta">{sub.lastPost.date} · {sub.lastPost.author}</span>
            </div>
          </>
        ) : (
          <span style={{ fontSize:"0.65rem", color:"var(--grl-muted-foreground)", fontStyle:"italic", opacity:0.6 }}>ცარიელია</span>
        )}
      </div>
    </div>
  );
}

/* ─── CATEGORY BLOCK ─────────────────────────────────────────────────────── */
function CategoryBlock({ category, subforums, onSubforumClick }) {
  const [collapsed, setCollapsed] = useState(false);
  const isVacancyCat = category.id === "vacancies";
  return (
    <div className={`grl-category-block${isVacancyCat ? " grl-category-block--vacancy" : ""}`}>
      <div className="grl-category-header" onClick={() => setCollapsed(c => !c)}>
        <span className="grl-category-title">
          {isVacancyCat && <Briefcase size={16} style={{ color:"var(--grl-primary)" }} />}
          {category.title}
          {isVacancyCat && (
            <span style={{ fontSize:"0.55rem", padding:"0.15rem 0.6rem", borderRadius:"999px", background:"linear-gradient(135deg, oklch(0.72 0.22 0/0.15), oklch(0.78 0.14 220/0.12))", color:"oklch(0.85 0.14 0)", border:"1px solid oklch(0.72 0.22 0/0.3)", fontWeight:700, letterSpacing:"0.1em" }}>
              ✦ HIRING
            </span>
          )}
        </span>
        <span style={{ color:"var(--grl-muted-foreground)", display:"flex", alignItems:"center" }}>
          {collapsed ? <ChevronDown size={18}/> : <ChevronUp size={18}/>}
        </span>
      </div>
      {!collapsed && (
        <div>
          {subforums.map(sub =>
            isVacancyCat
              ? <SubforumRow key={sub.id} sub={sub} onClick={() => onSubforumClick(sub.id)} />
              : <DefaultSubforumRow key={sub.id} sub={sub} onClick={() => onSubforumClick(sub.id)} />
          )}
        </div>
      )}
    </div>
  );
}

/* ─── CV FORM ────────────────────────────────────────────────────────────── */
function CVForm({ onSubmit, onCancel, vacancyTitle }) {
  const [fields, setFields] = useState(
    CV_FIELDS.reduce((acc, f) => ({ ...acc, [f.key]: "" }), {})
  );
  const [error, setError] = useState("");

  const handleSubmit = () => {
    const empty = CV_FIELDS.find(f => !fields[f.key].trim());
    if (empty) { setError(`გთხოვთ შეავსოთ: ${empty.label}`); return; }
    const cvData = {
      __type: "cv",
      vacancyTitle: vacancyTitle,
      ...fields
    };
    onSubmit(cvData);
  };

  return (
    <div className="grl-cv-form">
      <div style={{ display:"flex", alignItems:"center", gap:"0.625rem", marginBottom:"1.25rem" }}>
        <Briefcase size={18} style={{ color:"oklch(0.65 0.20 155)" }}/>
        <h3 style={{ fontSize:"0.875rem", fontWeight:800, textTransform:"uppercase", letterSpacing:"0.15em", color:"oklch(0.80 0.18 155)", margin:0, fontFamily:"var(--grl-font-sans)" }}>
          CV — {vacancyTitle}
        </h3>
      </div>
      {error && (
        <div className="grl-error-box" style={{ marginBottom:"1rem" }}>
          <AlertCircle size={14}/><span style={{ fontSize:"0.8rem" }}>{error}</span>
        </div>
      )}
      {CV_FIELDS.map(f => (
        <div key={f.key} className="grl-cv-field">
          <label className="grl-label" style={{ color:"oklch(0.70 0.18 155)" }}>{f.label}</label>
          <input
            type="text"
            value={fields[f.key]}
            onChange={e => setFields(prev => ({ ...prev, [f.key]: e.target.value }))}
            placeholder={f.placeholder}
            className="grl-input"
            style={{ fontSize:"0.8rem" }}
          />
        </div>
      ))}
      <div style={{ display:"flex", gap:"0.75rem", justifyContent:"flex-end", marginTop:"1rem" }}>
        <button onClick={onCancel} className="grl-btn grl-btn-ghost grl-btn-sm">გაუქმება</button>
        <button onClick={handleSubmit} className="grl-btn grl-btn-cv grl-btn-sm">
          <Send size={14}/> CV გაგზავნა
        </button>
      </div>
    </div>
  );
}

/* ─── CV SUCCESS MODAL ───────────────────────────────────────────────────── */
function CVSuccessModal({ onClose }) {
  return (
    <div className="grl-modal-overlay" onClick={e => e.target===e.currentTarget && onClose()}>
      <div className="grl-card grl-card-3xl grl-animate-fadescale" style={{ 
        maxWidth: 420, 
        padding: "2.5rem 2rem", 
        textAlign: "center",
        border: "2px solid oklch(0.72 0.19 160 / 0.4)",
        boxShadow: "0 0 60px oklch(0.72 0.19 160 / 0.15)"
      }}>
        <div style={{ 
          width: 80, height: 80, borderRadius: "50%", 
          background: "linear-gradient(135deg, oklch(0.55 0.22 155), oklch(0.45 0.20 175))",
          display: "flex", alignItems: "center", justifyContent: "center",
          margin: "0 auto 1.5rem",
          boxShadow: "0 0 40px oklch(0.55 0.22 155 / 0.3)"
        }}>
          <CheckCircle2 size={40} style={{ color: "#fff" }} />
        </div>
        <h3 style={{ 
          fontFamily: "var(--grl-font-display)", 
          fontSize: "1.5rem", 
          color: "oklch(0.97 0.005 250)",
          marginBottom: "0.5rem"
        }}>
          CV წარმატებით გაიგზავნა! 🎉
        </h3>
        <p style={{ 
          fontSize: "0.9rem", 
          color: "oklch(0.75 0.18 155)",
          marginBottom: "1rem",
          fontWeight: 600
        }}>
          თქვენი CV მიღებულია ადმინისტრაციის მიერ.
        </p>
        <div style={{
          padding: "1rem",
          borderRadius: "0.75rem",
          background: "oklch(0.55 0.20 155 / 0.08)",
          border: "1px solid oklch(0.55 0.20 155 / 0.2)",
          marginBottom: "1.5rem"
        }}>
          <MessageCircle size={18} style={{ color: "oklch(0.75 0.18 155)", marginBottom: "0.5rem" }}/>
          <p style={{ fontSize: "0.8rem", color: "var(--grl-muted-foreground)", lineHeight: 1.6 }}>
            <strong style={{ color: "oklch(0.85 0.18 155)" }}>📌 აყვანის შემთხვევაში</strong><br/>
            ადმინისტრაცია დაგიკავშირდებათ <strong style={{ color: "oklch(0.85 0.18 220)" }}>დისქორდზე</strong>.
          </p>
        </div>
        <button 
          onClick={onClose} 
          className="grl-btn grl-btn-primary"
          style={{ width: "100%" }}
        >
          <CheckCircle2 size={16}/> კარგი, მივხვდი
        </button>
      </div>
    </div>
  );
}

/* ─── MAIN FORUM PAGE ────────────────────────────────────────────────────── */
export default function ForumPage() {
  useEffect(() => { injectForumStyles(); }, []);

  const [currentUser, setCurrentUser] = useState(loadCurrentUser);
  const [showAuth, setShowAuth]       = useState(false);
  const [authMode, setAuthMode]       = useState("login");
  const [subforums, setSubforums]     = useState(loadSubforums);
  const [threads, setThreads]         = useState(loadThreads);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newThreadTitle, setNewThreadTitle]     = useState("");
  const [newThreadContent, setNewThreadContent] = useState("");
  const [replyText, setReplyText]     = useState("");
  const [showCVForm, setShowCVForm]   = useState(false);
  const [showCVSuccess, setShowCVSuccess] = useState(false);
  const [likedPosts, setLikedPosts]   = useState(() => {
    try { return JSON.parse(localStorage.getItem("grl_liked_posts") || "[]"); } catch { return []; }
  });
  const [toast, setToast]             = useState(null);

  const titleText    = "GEORGIAN SAMP REAL LIFE";
  const subtitleText = "ფორუმი";
  const [titleAnimated, setTitleAnimated]       = useState("");
  const [subtitleAnimated, setSubtitleAnimated] = useState("");

  const { current, push, goBack, canGoBack } = useForumHistory();
  const viewState         = current.view;
  const currentSubforumId = current.subforumId;
  const currentThreadId   = current.threadId;

  const isAdmin     = isUserAdmin(currentUser);
  const userIsChief = isChief(currentUser);
  const isVacancySubforum = (id) => VACANCY_SUBFORUMS.includes(id);

  /* ─── Typewriter ── */
  useEffect(() => {
    let i = 0;
    const t1 = setInterval(() => {
      setTitleAnimated(titleText.slice(0, i));
      i++;
      if (i > titleText.length) {
        clearInterval(t1);
        let j = 0;
        const t2 = setInterval(() => {
          setSubtitleAnimated(subtitleText.slice(0, j));
          j++;
          if (j > subtitleText.length) clearInterval(t2);
        }, 150);
      }
    }, 100);
    return () => clearInterval(t1);
  }, []);

  /* ─── BroadcastChannel ── */
  useEffect(() => {
    let bc;
    try {
      bc = new BroadcastChannel("grl_role_updates");
      bc.onmessage = (event) => {
        const { type, user } = event.data || {};
        if (type === "role_change") {
          const users = loadUsers();
          const updatedUsers = users.map(u =>
            u.id === user.id || u.username?.toLowerCase() === user.username?.toLowerCase()
              ? { ...u, role: user.role, isAdmin: user.isAdmin }
              : u
          );
          localStorage.setItem("grl_users", JSON.stringify(updatedUsers));

          const cu = loadCurrentUser();
          if (cu && (cu.id === user.id || cu.username?.toLowerCase() === user.username?.toLowerCase())) {
            const updatedCu = { ...cu, role: user.role, isAdmin: user.isAdmin };
            localStorage.setItem("grl_current_user", JSON.stringify(updatedCu));
            setCurrentUser(updatedCu);
            setToast({
              message: `თქვენი როლი შეიცვალა → ${ROLE_LABELS[user.role] || user.role}`,
              icon: <Shield size={16} style={{ color:"#ff2d78" }}/>,
            });
          }
          setThreads(prev => [...prev]);
        }
      };
    } catch {}
    return () => { try { bc?.close(); } catch {} };
  }, []);

  /* ─── Auth event ── */
  useEffect(() => {
    const fn = () => setCurrentUser(syncCurrentUser());
    window.addEventListener("grlAuthChange", fn);
    window.addEventListener("storage", fn);
    return () => {
      window.removeEventListener("grlAuthChange", fn);
      window.removeEventListener("storage", fn);
    };
  }, []);

  /* ─── Polling ── */
  useEffect(() => {
    const iv = setInterval(() => {
      setThreads(loadThreads());
      setSubforums(prev => {
        const fresh = loadSubforums();
        return prev.map(s => {
          const f = fresh.find(x => x.id === s.id);
          return f ? { ...f, topicsCount: s.topicsCount, postsCount: s.postsCount, lastPost: s.lastPost } : s;
        });
      });
      setCurrentUser(syncCurrentUser());
    }, 3000);
    return () => clearInterval(iv);
  }, []);

  /* ─── Persist ── */
  useEffect(() => {
    try {
      localStorage.setItem("grl_threads",    JSON.stringify(threads));
      localStorage.setItem("grl_subforums",  JSON.stringify(subforums));
      localStorage.setItem("grl_liked_posts",JSON.stringify(likedPosts));
    } catch {}
  }, [threads, subforums, likedPosts]);

  /* ─── Subforum counts ── */
  useEffect(() => {
    setSubforums(prev => prev.map(s => {
      const subs = threads.filter(t => t.subforumId === s.id);
      const last = subs.length > 0
        ? [...subs].sort((a,b) => (parseInt(b.id.replace("t-",""),10)||0) - (parseInt(a.id.replace("t-",""),10)||0))[0]
        : null;
      return {
        ...s,
        topicsCount: subs.length,
        postsCount:  subs.reduce((acc,t) => acc + (t.posts?.length||0), 0),
        lastPost: last ? { author:last.author, threadTitle:last.title, label:last.label, date:last.date, avatarBg:last.avatarBg } : null,
      };
    }));
  }, [threads]);

  /* ─── Browser back ── */
  useEffect(() => {
    const onPop = () => { if (canGoBack) goBack(); };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, [canGoBack, goBack]);

  useEffect(() => { window.history.pushState({ grl:true }, ""); }, [viewState, currentSubforumId, currentThreadId]);

  const forumStats = useMemo(() => {
    const users = loadUsers();
    return {
      members:    users.length,
      posts:      threads.reduce((acc,t) => acc + (t.posts?.length||0), 0),
      complaints: threads.filter(t => COMPLAINT_SUBFORUMS.includes(t.subforumId)).length,
    };
  }, [threads]);

  const currentSubforum = useMemo(() => subforums.find(s => s.id === currentSubforumId) || null, [subforums, currentSubforumId]);
  const currentThread   = useMemo(() => threads.find(t => t.id === currentThreadId) || null, [threads, currentThreadId]);

  const latestActivity = useMemo(() => {
    const ids = subforums.map(s => s.id);
    return [...threads]
      .filter(t => t.posts?.length > 0 && ids.includes(t.subforumId))
      .sort((a,b) => (parseInt(b.id.replace("t-",""),10)||0) - (parseInt(a.id.replace("t-",""),10)||0))
      .slice(0, 5);
  }, [threads, subforums]);

  const onlineMembers = useMemo(() => currentUser ? [currentUser.username] : [], [currentUser]);

  const canCreateThread = (subforumId) => {
    if (!currentUser) return false;
    if (VACANCY_SUBFORUMS.includes(subforumId)) {
      return userIsChief || isAdmin;
    }
    if (USER_ALLOWED_SUBFORUMS.includes(subforumId)) return true;
    return isAdmin;
  };

  /* ─── Handlers ─────────────────────────────────────────────────────────── */
  const navHome     = () => push({ view:"home",     subforumId:"",              threadId:"" });
  const navSubforum = (id) => push({ view:"subforum", subforumId:id, threadId:"" });
  const navThread   = (sub, id) => {
    push({ view:"thread", subforumId: sub || currentSubforumId, threadId: id });
    setThreads(prev => prev.map(t => t.id === id ? { ...t, viewsCount:(t.viewsCount||0)+1 } : t));
    setShowCVForm(false);
  };

  const handleLikePost = (postId) => {
    const liked = likedPosts.includes(postId);
    setLikedPosts(prev => liked ? prev.filter(id=>id!==postId) : [...prev, postId]);
    setThreads(prev => prev.map(t => ({ ...t, posts: t.posts.map(p => p.id!==postId ? p : { ...p, likes: liked ? Math.max(0,p.likes-1) : p.likes+1 }) })));
  };

  const handleDeletePost = (postId) => {
    let goBackFlag = false;
    setThreads(prev => prev.map(t => {
      if (t.id !== currentThreadId) return t;
      if (t.posts[0]?.id === postId) goBackFlag = true;
      return { ...t, repliesCount: Math.max(0,t.repliesCount-1), posts: t.posts.filter(p=>p.id!==postId) };
    }));
    if (goBackFlag) goBack();
  };

  const handleDeleteThread = (threadId) => {
    setThreads(prev => prev.filter(t => t.id !== threadId));
    if (currentThreadId === threadId) goBack();
  };

  const handleAddReply = () => {
    if (!replyText.trim() || !currentUser) return;
    const thread = threads.find(t => t.id === currentThreadId);
    if (!thread) return;
    if (VACANCY_SUBFORUMS.includes(thread.subforumId) && !isAdmin) return;
    if (thread.isClosed) {
      setToast({ message: "❌ ვაკანსია დახურულია, პასუხის გაგზავნა შეუძლებელია", icon: <XCircle size={16} style={{ color:"#ef4444" }}/> });
      return;
    }
    const newPost = {
      id: `p-${Date.now()}`,
      author:   currentUser.username,
      avatarBg: currentUser.avatarBg || "linear-gradient(135deg,#ec4899,#f43f5e)",
      role:     getRoleLabel(currentUser),
      roleColor: getRoleColor(currentUser),
      content:  replyText,
      date:     "დღეს, " + new Date().toLocaleTimeString([], { hour:"2-digit", minute:"2-digit" }),
      likes:    0,
      isUserReply: true,
      isAdminPost: isAdmin,
    };
    setThreads(prev => prev.map(t => t.id!==currentThreadId ? t : { ...t, repliesCount:(t.repliesCount||0)+1, posts:[...t.posts, newPost] }));
    setReplyText("");
  };

  const handleSubmitCV = (fields) => {
    if (!currentUser || !currentThreadId) return;
    const thread = threads.find(t => t.id === currentThreadId);
    if (thread?.isClosed) {
      setToast({ message: "❌ ვაკანსია დახურულია, CV-ის გაგზავნა შეუძლებელია", icon: <XCircle size={16} style={{ color:"#ef4444" }}/> });
      return;
    }

    const cvData = {
      id: `cv-${Date.now()}`,
      __type: "cv",
      vacancyTitle: thread?.title || fields.vacancyTitle || "ვაკანსია",
      author: currentUser.username,
      authorAvatar: currentUser.avatarBg || "linear-gradient(135deg,#ec4899,#f43f5e)",
      authorRole: getRoleLabel(currentUser),
      authorRoleColor: getRoleColor(currentUser),
      submittedAt: new Date().toISOString(),
      fields: { ...fields },
      status: null,
      statusReason: "",
      threadId: currentThreadId,
      vacancyClosed: false,
      hired: false,
      hiredAt: null,
      hiredBy: null,
      adminReply: null,
      adminReplyDate: null,
    };

    try {
      const existing = JSON.parse(localStorage.getItem("grl_cvs") || "[]");
      existing.push(cvData);
      localStorage.setItem("grl_cvs", JSON.stringify(existing));
    } catch {}

    try {
      const bc = new BroadcastChannel("grl_role_updates");
      bc.postMessage({ type: "cv_submitted", cv: cvData });
      bc.close();
    } catch {}

    setShowCVForm(false);
    setShowCVSuccess(true);
  };

  const handleCreateThread = () => {
    if (!newThreadTitle.trim() || !newThreadContent.trim() || !currentSubforumId || !currentUser) return;
    if (!canCreateThread(currentSubforumId)) return;

    const threadId    = `t-${Date.now()}`;
    const isComplaint = COMPLAINT_SUBFORUMS.includes(currentSubforumId);
    const isVacancy   = VACANCY_SUBFORUMS.includes(currentSubforumId);

    const newThread = {
      id: threadId, title: newThreadTitle, subforumId: currentSubforumId,
      author:   currentUser.username,
      avatarBg: currentUser.avatarBg || "linear-gradient(135deg,#ec4899,#f43f5e)",
      repliesCount: 0, viewsCount: 1,
      label: isComplaint ? "განხილვაში" : isVacancy ? "ვაკანსია" : (isAdmin ? "ადმინი" : "კითხვა"),
      date: new Date().toLocaleDateString("ka-GE"),
      allowReplies: !isComplaint,
      isComplaint, isVacancy,
      verdict: null, verdictReason: "",
      isAdminPost: isAdmin,
      isClosed: false,
      closedBy: null,
      closedAt: null,
      posts: [{
        id: `p-${Date.now()}`,
        author:   currentUser.username,
        avatarBg: currentUser.avatarBg || "linear-gradient(135deg,#ec4899,#f43f5e)",
        role:     getRoleLabel(currentUser),
        roleColor: getRoleColor(currentUser),
        content:  newThreadContent,
        date:     new Date().toLocaleString("ka-GE"),
        likes: 0, isUserReply: true, isAdminPost: isAdmin,
      }],
    };
    setThreads(prev => [newThread, ...prev]);
    setNewThreadTitle(""); setNewThreadContent(""); setIsModalOpen(false);
    navThread(currentSubforumId, threadId);
  };

  const handleLogout = () => {
    localStorage.removeItem("grl_current_user");
    window.dispatchEvent(new Event("grlAuthChange"));
    setCurrentUser(null);
    navHome();
  };

  /* ─── Landing ── */
  if (!currentUser && !showAuth) return (
    <AuthShell>
      <div style={{ textAlign:"center", marginBottom:"2rem" }}>
        <div style={{ width:80, height:80, borderRadius:"50%", background:"oklch(0.68 0.24 0/0.2)", border:"2px solid oklch(0.68 0.24 0/0.4)", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 1rem" }}>
          <Shield size={36} style={{ color:"var(--grl-primary)" }}/>
        </div>
        <h2 style={{ fontSize:"1.5rem", color:"oklch(0.97 0.005 250)", fontFamily:"var(--grl-font-display)" }}>GRL ფორუმი</h2>
        <p style={{ fontSize:"0.875rem", color:"var(--grl-muted-foreground)", marginTop:"0.5rem" }}>ფორუმის გასახსნელად გაიარეთ ავტორიზაცია</p>
      </div>
      <div style={{ display:"flex", flexDirection:"column", gap:"0.75rem" }}>
        <button onClick={()=>{ setShowAuth(true); setAuthMode("login"); }} className="grl-btn grl-btn-primary" style={{ width:"100%", padding:"1rem 1.5rem" }}><LogIn size={18}/> შესვლა</button>
        <button onClick={()=>{ setShowAuth(true); setAuthMode("register"); }} className="grl-btn grl-btn-ghost" style={{ width:"100%", padding:"1rem 1.5rem" }}><UserPlus size={18}/> რეგისტრაცია</button>
      </div>
    </AuthShell>
  );

  if (showAuth) return (
    <AuthShell>
      <button onClick={()=>setShowAuth(false)} style={{ position:"absolute", top:"1rem", right:"1rem", color:"var(--grl-muted-foreground)", background:"none", border:"none", cursor:"pointer" }}>
        <XCircle size={24}/>
      </button>
      {authMode==="login"
        ? <LoginForm    onLogin={u=>{ setCurrentUser(u); setShowAuth(false); }} onRegisterClick={()=>setAuthMode("register")}/>
        : <RegisterForm onRegister={u=>{ setCurrentUser(u); setShowAuth(false); }} onLoginClick={()=>setAuthMode("login")}/>
      }
    </AuthShell>
  );

  /* ══════════════════════════════════════════════════════════════════════════
     MAIN FORUM UI
  ══════════════════════════════════════════════════════════════════════════ */
  return (
    <div className="grl-forum-root">
      <CityBackground />

      {toast && (
        <Toast
          message={toast.message}
          icon={toast.icon}
          onDone={() => setToast(null)}
        />
      )}

      {showCVSuccess && (
        <CVSuccessModal onClose={() => setShowCVSuccess(false)} />
      )}

      <main style={{ minHeight:"100vh", padding:"3rem 1.5rem 6rem", position:"relative", zIndex:1 }}>
        <div style={{ maxWidth:"72rem", margin:"0 auto", position:"relative", zIndex:1 }}>

          {/* ─── Top Bar ─── */}
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"1.5rem", flexWrap:"wrap", gap:"0.75rem" }}>
            <div style={{ display:"flex", alignItems:"center", gap:"0.375rem", fontSize:"0.75rem", color:"var(--grl-muted-foreground)", fontWeight:600, flexWrap:"wrap" }}>
              {viewState!=="home" && (<>
                <ChevronRight size={12} style={{ opacity:0.5 }}/>
                <button onClick={()=>push({ view:"subforum", subforumId:currentSubforumId, threadId:"" })}
                  style={{ background:"none", border:"none", cursor:"pointer", color:viewState==="subforum"?"var(--grl-primary)":"var(--grl-muted-foreground)", fontWeight:600, fontSize:"0.75rem", padding:0, maxWidth:"18rem", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                  {currentSubforum?.title}
                </button>
              </>)}
              {viewState==="thread" && (<>
                <ChevronRight size={12} style={{ opacity:0.5 }}/>
                <span style={{ color:"var(--grl-primary)", maxWidth:"22rem", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{currentThread?.title}</span>
              </>)}
            </div>
          </div>

          {/* ─── HERO ─── */}
          {viewState === "home" && (
            <section className="grl-card grl-card-3xl grl-animate-fadein" style={{ marginBottom:"2.5rem", padding:"2.5rem 3rem", position:"relative", overflow:"hidden", boxShadow:"0 25px 60px oklch(0 0 0/0.5), 0 0 0 1px oklch(0.72 0.22 0/0.08) inset", border:"1px solid oklch(0.72 0.22 0/0.15)", background:"linear-gradient(135deg, oklch(0.12 0.02 285), oklch(0.08 0.02 280))", borderRadius:"1.25rem" }}>
              <div style={{ position:"absolute", top:0, left:0, right:0, height:2, background:"linear-gradient(90deg, transparent 0%, oklch(0.72 0.22 0/0.8) 30%, oklch(0.60 0.26 330/0.8) 70%, transparent 100%)", pointerEvents:"none" }} />
              <div style={{ position:"absolute", top:"-8rem", right:"-8rem", width:"24rem", height:"24rem", background:"oklch(0.68 0.24 0/0.15)", filter:"blur(100px)", borderRadius:"50%", pointerEvents:"none" }} />
              <div style={{ position:"absolute", bottom:"-6rem", left:"-4rem", width:"20rem", height:"20rem", background:"oklch(0.60 0.26 330/0.10)", filter:"blur(80px)", borderRadius:"50%", pointerEvents:"none" }} />
              <div style={{ position:"relative", display:"flex", flexWrap:"wrap", alignItems:"center", justifyContent:"space-between", gap:"2rem", zIndex:1 }}>
                <div style={{ flex:1, minWidth:"280px" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:"0.6rem", color:"oklch(0.82 0.15 0)", fontSize:"0.65rem", letterSpacing:"0.35em", fontWeight:700, textTransform:"uppercase", marginBottom:"1rem", fontFamily:"var(--grl-font-mono)" }}>
                    <div style={{ width:8, height:8, borderRadius:"50%", background:"oklch(0.74 0.22 0)", boxShadow:"0 0 12px oklch(0.74 0.22 0), 0 0 24px oklch(0.74 0.22 0/0.3)", animation:"grlPulse 2s ease-in-out infinite" }} />
                    <Users size={13} strokeWidth={2.5} />
                    <span style={{ color:"oklch(0.80 0.05 250)" }}>მოთამაშეთა საზოგადოება</span>
                  </div>
                  <h1 style={{ margin:"0 0 0.75rem 0", lineHeight:1.05, fontFamily:"var(--grl-font-display)" }}>
                    <span style={{ display:"block", fontSize:"clamp(2.2rem, 5vw, 3.5rem)", fontWeight:700, color:"oklch(0.97 0.005 250)", letterSpacing:"-0.02em", marginBottom:"0.1em" }}>{titleAnimated}</span>
                    <span style={{ display:"block", fontSize:"clamp(2.8rem, 6vw, 4.5rem)", fontWeight:800, background:"linear-gradient(135deg, oklch(0.82 0.20 0) 0%, oklch(0.72 0.22 0) 40%, oklch(0.60 0.26 330) 100%)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text", letterSpacing:"-0.03em" }}>ფორუმი</span>
                  </h1>
                  <p style={{ fontSize:"clamp(0.85rem, 1.1vw, 1rem)", color:"oklch(0.65 0.03 270)", lineHeight:1.7, margin:"0 0 1.5rem 0", maxWidth:"520px" }}>
                    <span style={{ color:"oklch(0.85 0.12 0)", fontWeight:600 }}>ოფიციალური წესდებები, სიახლეები, ტექნიკური დახმარება</span>{" "}და საჩივრების სისტემა — ყველაფერი ერთ ადგილას.
                  </p>
                  <div style={{ display:"flex", alignItems:"center", gap:"1.5rem", flexWrap:"wrap" }}>
                    {[
                      { num:forumStats.members, label:"წევრი", accent:true },
                      { num:forumStats.posts,   label:"პოსტი" },
                      { num:forumStats.complaints, label:"საჩივარი" },
                    ].map((s,i) => (
                      <div key={i} style={{ display:"flex", flexDirection:"column", gap:"0.1rem" }}>
                        <span style={{ fontFamily:"var(--grl-font-mono)", fontSize:"clamp(1.1rem,1.5vw,1.4rem)", fontWeight:700, color:s.accent?"oklch(0.82 0.15 0)":"oklch(0.95 0.005 250)" }}>
                          {s.num >= 1000 ? `${(s.num/1000).toFixed(1)}K` : s.num}
                        </span>
                        <span style={{ fontSize:"0.55rem", fontWeight:600, letterSpacing:"0.15em", textTransform:"uppercase", color:"oklch(0.45 0.02 270)", fontFamily:"var(--grl-font-mono)" }}>{s.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div style={{ display:"flex", flexDirection:"column", gap:"0.75rem", alignItems:"flex-end", flexShrink:0, minWidth:"200px" }}>
                  <a href="https://discord.gg/un2cx4jHH" target="_blank" rel="noreferrer" className="grl-btn grl-btn-outline-primary"
                    style={{ fontSize:"0.75rem", padding:"0.7rem 1.5rem", gap:"0.6rem", width:"100%", justifyContent:"center", borderRadius:"0.75rem", border:"1px solid oklch(0.72 0.22 0/0.3)", background:"oklch(0.72 0.22 0/0.05)" }}
                    onMouseEnter={e=>{ e.currentTarget.style.background="oklch(0.72 0.22 0/0.12)"; e.currentTarget.style.borderColor="oklch(0.72 0.22 0/0.6)"; }}
                    onMouseLeave={e=>{ e.currentTarget.style.background="oklch(0.72 0.22 0/0.05)"; e.currentTarget.style.borderColor="oklch(0.72 0.22 0/0.3)"; }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style={{ color:"oklch(0.72 0.22 0)" }}>
                      <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057.102 18.079.114 18.1.13 18.11a19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z"/>
                    </svg>
                    <span style={{ color:"oklch(0.92 0.005 250)" }}>შემოგვიერთდი Discord-ზე</span>
                    <ExternalLink size={14} style={{ color:"oklch(0.50 0.02 270)" }} />
                  </a>
                  <div style={{ display:"flex", alignItems:"center", gap:"0.4rem", fontSize:"0.55rem", color:"oklch(0.40 0.02 270)", fontFamily:"var(--grl-font-mono)", letterSpacing:"0.1em", textTransform:"uppercase", padding:"0.25rem 0.75rem", borderRadius:"0.375rem", background:"oklch(0.12 0.02 285/0.5)", border:"1px solid oklch(0.28 0.025 285/0.3)" }}>
                    <span>✦</span><span>50+ აქტიური მოთამაშე ყოველდღიურად</span>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* ─── Main Grid ─── */}
          <div className="grl-lg-grid-main">
            <div style={{ minWidth:0 }}>

              {/* ─── HOME ─── */}
              {viewState==="home" && (
                <div className="grl-animate-fadein">
                  {initialCategories.map(cat => {
                    const subs = subforums.filter(s => s.categoryId === cat.id);
                    if (!subs.length) return null;
                    return (
                      <CategoryBlock key={cat.id} category={cat} subforums={subs} onSubforumClick={navSubforum} />
                    );
                  })}
                </div>
              )}

              {/* ─── SUBFORUM ─── */}
              {viewState==="subforum" && currentSubforum && (
                <div className="grl-animate-fadein" style={{ display:"flex", flexDirection:"column", gap:"1.25rem" }}>
                  <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:"0.75rem" }}>
                    <button onClick={goBack}
                      style={{ display:"inline-flex", alignItems:"center", gap:"0.5rem", fontSize:"0.75rem", fontWeight:700, color:"var(--grl-muted-foreground)", background:"none", border:"none", cursor:"pointer", padding:0 }}
                      onMouseEnter={e=>e.currentTarget.style.color="var(--grl-primary)"}
                      onMouseLeave={e=>e.currentTarget.style.color="var(--grl-muted-foreground)"}>
                      <ArrowLeft size={14}/> განყოფილებებში დაბრუნება
                    </button>

                    {canCreateThread(currentSubforumId) ? (
                      <button
                        onClick={() => { if (!currentUser) { setShowAuth(true); return; } setIsModalOpen(true); }}
                        className={'grl-btn grl-btn-sm grl-btn-primary'}
                      >
                        <Plus size={14}/>
                        {isVacancySubforum(currentSubforumId) ? "ვაკანსიის გამოქვეყნება" : "ახალი თემა"}
                      </button>
                    ) : isVacancySubforum(currentSubforumId) ? (
                      <span style={{ fontSize:"0.6rem", padding:"0.25rem 0.75rem", borderRadius:"0.5rem", background:"oklch(0.72 0.22 0/0.1)", color:"var(--grl-primary)", fontWeight:600, border:"1px solid oklch(0.72 0.22 0/0.25)" }}>
                        🔒 Chief / D.Chief / Admin only
                      </span>
                    ) : (
                      <span style={{ fontSize:"0.6rem", padding:"0.25rem 0.75rem", borderRadius:"0.5rem", background:"oklch(0.68 0.24 0/0.1)", color:"var(--grl-primary)", fontWeight:600, border:"1px solid oklch(0.68 0.24 0/0.25)" }}>
                        🔒 მხოლოდ ადმინისტრაცია
                      </span>
                    )}
                  </div>

                  {isVacancySubforum(currentSubforumId) && (
                    <div style={{ padding:"0.875rem 1.25rem", borderRadius:"0.875rem", background:"linear-gradient(135deg, oklch(0.72 0.22 0/0.08), oklch(0.78 0.14 220/0.05))", border:"1px solid oklch(0.72 0.22 0/0.25)", display:"flex", alignItems:"flex-start", gap:"0.75rem" }}>
                      <Briefcase size={18} style={{ color:"var(--grl-primary)", flexShrink:0, marginTop:"0.1rem" }}/>
                      <div>
                        <div style={{ fontSize:"0.8rem", fontWeight:700, color:"oklch(0.85 0.16 0)", marginBottom:"0.25rem" }}>ვაკანსიების განყოფილება</div>
                        <div style={{ fontSize:"0.7rem", color:"var(--grl-muted-foreground)", lineHeight:1.6 }}>
                          <strong style={{ color:"oklch(0.85 0.16 0)" }}>Chief</strong>, <strong style={{ color:"oklch(0.85 0.16 0)" }}>D.Chief</strong> და <strong style={{ color:"oklch(0.85 0.16 0)" }}>ადმინისტრატორებს</strong> შეუძლიათ ვაკანსიების შექმნა.
                          ნებისმიერ მოთამაშეს შეუძლია გახსნილ ვაკანსიაზე <strong style={{ color:"oklch(0.75 0.20 155)" }}>CV გაგზავნა</strong>.
                          CV გაგზავნილი იქნება ადმინ პანელზე.
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="grl-category-block">
                    <div style={{ padding:"0.875rem 1.25rem", background:"oklch(0.19 0.03 285/0.8)", borderBottom:"1px solid var(--grl-border)" }}>
                      <h2 style={{ fontSize:"1rem", fontWeight:700, color:"oklch(0.97 0.005 250)", margin:0 }}>{currentSubforum.title}</h2>
                    </div>
                    <div className="grl-thread-header">
                      <span>{isVacancySubforum(currentSubforumId) ? "ვაკანსია / ავტორი" : "თემა / ავტორი"}</span>
                      <span style={{ textAlign:"center" }}>{isVacancySubforum(currentSubforumId) ? "CV" : "პასუხი"}</span>
                      <span style={{ textAlign:"center" }}>ნახვა</span>
                      <span>ბოლო პოსტი</span>
                    </div>
                    {threads.filter(t => t.subforumId === currentSubforumId).length === 0 ? (
                      <div style={{ padding:"2rem", textAlign:"center", color:"var(--grl-muted-foreground)" }}>
                        <Briefcase size={32} style={{ opacity:0.3, marginBottom:"0.5rem" }} />
                        <p>{isVacancySubforum(currentSubforumId) ? "ვაკანსიები არ არის" : "თემები არ არის"}</p>
                        {isVacancySubforum(currentSubforumId) && (userIsChief || isAdmin) && (
                          <button
                            onClick={() => setIsModalOpen(true)}
                            className="grl-btn grl-btn-primary grl-btn-sm"
                            style={{ marginTop:"1rem" }}
                          >
                            <Plus size={14}/> პირველი ვაკანსიის გამოქვეყნება
                          </button> 
                        )}
                      </div>
                    ) : (
                      threads.filter(t => t.subforumId === currentSubforumId).map(t => {
                        const cvs = loadCVs().filter(c => c.threadId === t.id);
                        const cvCount = cvs.length;
                        const hiredCV = cvs.find(c => c.hired);
                        const isHired = !!hiredCV;
                        
                        return (
                          <div key={t.id} className="grl-thread-row" style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                            <div onClick={() => navThread(currentSubforumId, t.id)} style={{ flex:1, cursor:"pointer" }}>
                              <div style={{ display:"flex", alignItems:"center", gap:"0.5rem", flexWrap:"wrap" }}>
                                <StatusLabel label={t.label} />
                                <span style={{ fontWeight:600 }}>{t.title}</span>
                                {t.isPinned && <Pin size={14} style={{ color:"var(--grl-primary)" }} />}
                                {isVacancySubforum(currentSubforumId) && cvCount > 0 && (
                                  <span className={`grl-cv-badge ${isHired ? "grl-cv-badge--hired" : ""}`}>
                                    {isHired ? (
                                      <><CheckCircle2 size={9}/> {cvCount} CV · აყვანილია</>
                                    ) : (
                                      <><Briefcase size={9}/> {cvCount} CV</>
                                    )}
                                  </span>
                                )}
                                {t.isClosed && !isHired && (
                                  <span className="grl-status-label grl-status-label--closed"><Lock size={9}/> დახურულია</span>
                                )}
                                {isHired && (
                                  <span className="grl-status-label grl-status-label--hired"><CheckCircle2 size={9}/> აყვანილია</span>
                                )}
                              </div>
                              <div style={{ fontSize:"0.65rem", color:"var(--grl-muted-foreground)" }}>{t.author} · {t.date}</div>
                            </div>
                            <div style={{ display:"flex", alignItems:"center", gap:"0.75rem" }}>
                              <div style={{ fontSize:"0.65rem", color:"var(--grl-muted-foreground)", textAlign:"right" }}>
                                <div>{isVacancySubforum(currentSubforumId) ? `${cvCount} CV` : `${t.posts?.length || 0} პოსტი`}</div>
                              </div>
                              {isAdmin && (
                                <button onClick={() => handleDeleteThread(t.id)} className="grl-btn-danger" style={{ padding:"0.2rem 0.5rem" }}>
                                  <Trash2 size={12} /> წაშლა
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}

              {/* ─── THREAD ─── */}
              {viewState==="thread" && currentThread && (
                <div className="grl-animate-fadein" style={{ display:"flex", flexDirection:"column", gap:"1.25rem" }}>
                  <button onClick={goBack}
                    style={{ display:"inline-flex", alignItems:"center", gap:"0.5rem", fontSize:"0.75rem", fontWeight:700, color:"var(--grl-muted-foreground)", background:"none", border:"none", cursor:"pointer", padding:0 }}
                    onMouseEnter={e=>e.currentTarget.style.color="var(--grl-primary)"}
                    onMouseLeave={e=>e.currentTarget.style.color="var(--grl-muted-foreground)"}>
                    <ArrowLeft size={14}/> {currentThread.isVacancy ? "ვაკანსიებში დაბრუნება" : "თემებში დაბრუნება"}
                  </button>

                  <div className="grl-card" style={{ padding:"1.5rem", display:"flex", flexWrap:"wrap", alignItems:"center", justifyContent:"space-between", gap:"1rem", position:"relative", overflow:"hidden" }}>
                    <div style={{ position:"absolute", right:"-5rem", top:"-5rem", width:"14rem", height:"14rem", background:"oklch(0.68 0.24 0/0.1)", borderRadius:"50%", filter:"blur(3rem)", pointerEvents:"none" }}/>
                    <div style={{ minWidth:0, position:"relative" }}>
                      <div style={{ display:"flex", alignItems:"center", gap:"0.5rem", marginBottom:"0.625rem" }}>
                        <StatusLabel label={currentThread.label}/>
                        <span style={{ fontSize:"0.7rem", color:"var(--grl-muted-foreground)" }}>{currentThread.date}</span>
                        {currentThread.isClosed && (
                          <span className="grl-status-label grl-status-label--closed"><Lock size={11}/> დახურულია</span>
                        )}
                      </div>
                      <h2 style={{ fontSize:"clamp(1.25rem,4vw,1.75rem)", color:"oklch(0.97 0.005 250)", lineHeight:1.2, fontFamily:"var(--grl-font-display)" }}>{currentThread.title}</h2>
                      {currentThread.isVacancy && (
                        <div style={{ marginTop:"0.5rem", fontSize:"0.7rem", color:"oklch(0.85 0.16 0)", fontWeight:600, display:"flex", alignItems:"center", gap:"0.4rem" }}>
                          <Briefcase size={13}/> ვაკანსია
                          {(() => {
                            const cvs = loadCVs().filter(c => c.threadId === currentThread.id);
                            const hired = cvs.find(c => c.hired);
                            if (hired) {
                              return (
                                <span style={{ color:"oklch(0.78 0.19 160)", display:"flex", alignItems:"center", gap:"0.3rem" }}>
                                  <CheckCircle2 size={12}/> აყვანილია: {hired.author}
                                </span>
                              );
                            }
                            return null;
                          })()}
                        </div>
                      )}
                    </div>
                    <div style={{ display:"flex", gap:"0.75rem", fontFamily:"var(--grl-font-mono)", fontSize:"0.75rem", position:"relative" }}>
                      {[["პასუხი",currentThread.repliesCount],["ნახვა",currentThread.viewsCount]].map(([label,val]) => (
                        <div key={label} className="grl-card" style={{ padding:"0.5rem 0.875rem", textAlign:"center", minWidth:70 }}>
                          <div style={{ fontSize:"0.5rem", textTransform:"uppercase", color:"var(--grl-muted-foreground)", letterSpacing:"0.1em" }}>{label}</div>
                          <div style={{ fontSize:"1rem", color:"oklch(0.97 0.005 250)", fontWeight:700, marginTop:2, fontFamily:"var(--grl-font-display)" }}>{val}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {currentThread.isComplaint && currentThread.verdict && (
                    <VerdictBanner verdict={currentThread.verdict} reason={currentThread.verdictReason}/>
                  )}

                  {(() => {
                    const cvs = loadCVs().filter(c => c.threadId === currentThread.id);
                    const hiredCV = cvs.find(c => c.hired);
                    if (hiredCV) {
                      return (
                        <VerdictBanner 
                          verdict="hired" 
                          closedBy={hiredCV.hiredBy || currentThread.closedBy} 
                          closedAt={hiredCV.hiredAt || currentThread.closedAt}
                        />
                      );
                    }
                    if (currentThread.isClosed) {
                      return (
                        <div className="grl-verdict-banner grl-verdict-banner--approved" style={{ background:"oklch(0.50 0.10 250 / 0.1)", border:"1px solid oklch(0.50 0.10 250 / 0.3)", color:"oklch(0.70 0.10 250)" }}>
                          <Lock size={20}/>
                          <div>
                            <div style={{ fontFamily:"var(--grl-font-display)", letterSpacing:"0.05em", fontSize:"0.875rem" }}>
                              🔒 ვაკანსია დახურულია
                            </div>
                            <div style={{ fontSize:"0.75rem", fontWeight:400, marginTop:"0.25rem", opacity:0.85 }}>
                              CV-ები აღარ მიიღება
                            </div>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  })()}

                  {currentThread.posts.map((post, idx) => {
                    const isOriginalPost = idx === 0;
                    return (
                      <article key={post.id} className="grl-post-card">
                        <div style={{ display:"grid", gridTemplateColumns:"180px 1fr" }}>
                          <div style={{ padding:"1.25rem", display:"flex", flexDirection:"column", alignItems:"center", textAlign:"center", gap:"0.875rem", background:"oklch(0.20 0.03 285/0.3)", borderRight:"1px solid var(--grl-border)" }}>
                            <div style={{ position:"relative" }}>
                              <div style={{ width:58, height:58, borderRadius:"0.875rem", background:post.avatarBg, display:"flex", alignItems:"center", justifyContent:"center", color:"white", fontSize:"1.375rem", fontWeight:700 }}>
                                {post.author[0].toUpperCase()}
                              </div>
                              <div style={{ position:"absolute", inset:0, borderRadius:"0.875rem", border:`2px solid ${post.roleColor||"#ec4899"}`, opacity:0.45, pointerEvents:"none" }}/>
                            </div>
                            <div>
                              <span style={{ fontWeight:700, fontSize:"0.825rem", color:"var(--grl-foreground)", display:"block" }}>{post.author}</span>
                              <span style={{ display:"inline-block", fontSize:"0.52rem", textTransform:"uppercase", fontWeight:700, letterSpacing:"0.2em", padding:"0.2rem 0.6rem", borderRadius:"999px", marginTop:"0.4rem", border:`1px solid ${(post.roleColor||"#ec4899")}55`, color:post.roleColor||"#ec4899", backgroundColor:`${(post.roleColor||"#ec4899")}15` }}>
                                {post.role}
                              </span>
                              {post.isAdminPost && (
                                <div style={{ marginTop:"0.4rem", fontSize:"0.55rem", fontWeight:700, textTransform:"uppercase", letterSpacing:"0.1em", color:"oklch(0.72 0.23 25)" }}>⚙ Admin</div>
                              )}
                            </div>
                          </div>

                          <div style={{ padding:"1.25rem", display:"flex", flexDirection:"column", justifyContent:"space-between", gap:"1.25rem", minWidth:0 }}>
                            {post.isAdminPost && (
                              <div style={{ display:"flex", alignItems:"center", gap:"0.5rem", padding:"0.3rem 0.75rem", borderRadius:"0.5rem", background:"oklch(0.65 0.24 25/0.1)", border:"1px solid oklch(0.65 0.24 25/0.3)", marginBottom:"-0.25rem", alignSelf:"flex-start" }}>
                                <Shield size={11} style={{ color:"oklch(0.72 0.23 25)" }}/>
                                <span style={{ fontSize:"0.575rem", fontWeight:700, textTransform:"uppercase", letterSpacing:"0.1em", color:"oklch(0.72 0.23 25)" }}>ადმინისტრაციის პოსტი</span>
                              </div>
                            )}

                            {currentThread.isVacancy && isOriginalPost && (
                              <div style={{ padding:"0.625rem 0.875rem", borderRadius:"0.625rem", background:"linear-gradient(135deg, oklch(0.72 0.22 0/0.08), oklch(0.78 0.14 220/0.05))", border:"1px solid oklch(0.72 0.22 0/0.25)", marginBottom:"-0.25rem" }}>
                                <div style={{ fontSize:"0.575rem", fontWeight:800, textTransform:"uppercase", letterSpacing:"0.12em", color:"oklch(0.85 0.16 0)", marginBottom:"0.25rem", display:"flex", alignItems:"center", gap:"0.375rem" }}>
                                  <Briefcase size={11}/> ვაკანსიის აღწერა
                                </div>
                              </div>
                            )}

                            <div style={{ color:"oklch(0.97 0.005 250/0.9)", fontSize:"0.875rem", lineHeight:1.7, whiteSpace:"pre-wrap", wordBreak:"break-word" }}>
                              {post.content}
                            </div>

                            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", borderTop:"1px solid var(--grl-border)", paddingTop:"0.875rem", fontSize:"0.7rem", color:"var(--grl-muted-foreground)", flexWrap:"wrap", gap:"0.5rem" }}>
                              <span style={{ display:"flex", alignItems:"center", gap:"0.375rem" }}><Clock size={11}/> {post.date}</span>
                              <div style={{ display:"flex", alignItems:"center", gap:"0.5rem" }}>
                                {(post.author === currentUser?.username && !post.isAdminPost) || isAdmin ? (
                                  <button onClick={()=>handleDeletePost(post.id)} className="grl-btn-danger"><Trash2 size={11}/> წაშლა</button>
                                ) : null}
                                <button onClick={()=>handleLikePost(post.id)} className={`grl-btn-like${likedPosts.includes(post.id)?" grl-btn-like--active":""}`}>
                                  <ThumbsUp size={12} style={{ fill:likedPosts.includes(post.id)?"currentColor":"none" }}/>
                                  <span>{post.likes}</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </article>
                    );
                  })}

                  {/* ── CV submit area ── */}
                  {currentThread.isVacancy && currentThread.allowReplies && !currentThread.isClosed && (
                    <div>
                      {showCVForm ? (
                        <CVForm
                          vacancyTitle={currentThread.title}
                          onSubmit={handleSubmitCV}
                          onCancel={() => setShowCVForm(false)}
                        />
                      ) : (
                        <div style={{ display:"flex", gap:"0.75rem", flexWrap:"wrap" }}>
                          <button onClick={() => { if (!currentUser) { setShowAuth(true); return; } setShowCVForm(true); }} className="grl-btn grl-btn-cv grl-btn-sm">
                            <Briefcase size={14}/> CV გაგზავნა
                          </button>
                          {isAdmin && (
                            <div className="grl-card" style={{ flex:1, padding:"1rem", display:"flex", gap:"0.75rem", alignItems:"flex-end" }}>
                              <textarea rows={2} value={replyText} onChange={e=>setReplyText(e.target.value)} placeholder="ადმინის კომენტარი…" className="grl-input" style={{ flex:1 }}/>
                              <button onClick={handleAddReply} className="grl-btn grl-btn-primary grl-btn-sm"><Send size={12}/> გაგზავნა</button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* ── Thread closed message ── */}
                  {currentThread.isVacancy && currentThread.isClosed && (
                    <div className="grl-verdict-banner grl-verdict-banner--approved" style={{ 
                      background: currentThread.label?.includes("აყვანილია") || loadCVs().some(c => c.threadId === currentThread.id && c.hired)
                        ? "oklch(0.72 0.19 160 / 0.12)" 
                        : "oklch(0.50 0.10 250 / 0.1)",
                      border: currentThread.label?.includes("აყვანილია") || loadCVs().some(c => c.threadId === currentThread.id && c.hired)
                        ? "2px solid oklch(0.72 0.19 160 / 0.4)"
                        : "1px solid oklch(0.50 0.10 250 / 0.3)",
                    }}>
                      {(() => {
                        const hiredCV = loadCVs().find(c => c.threadId === currentThread.id && c.hired);
                        if (hiredCV) {
                          return (
                            <>
                              <CheckCircle2 size={20} style={{ color: "oklch(0.78 0.19 160)" }}/>
                              <div>
                                <div style={{ fontFamily:"var(--grl-font-display)", letterSpacing:"0.05em", fontSize:"0.875rem", color: "oklch(0.78 0.19 160)" }}>
                                  ✅ კანდიდატი <strong>{hiredCV.author}</strong> აყვანილია — CV-ები აღარ მიიღება
                                </div>
                                {hiredCV.hiredBy && (
                                  <div style={{ fontSize:"0.75rem", fontWeight:400, marginTop:"0.25rem", opacity:0.75 }}>
                                    ადმინი: {hiredCV.hiredBy} · {hiredCV.hiredAt ? new Date(hiredCV.hiredAt).toLocaleString("ka-GE") : ""}
                                  </div>
                                )}
                              </div>
                            </>
                          );
                        }
                        return (
                          <>
                            <Lock size={20}/>
                            <div>
                              <div style={{ fontFamily:"var(--grl-font-display)", letterSpacing:"0.05em", fontSize:"0.875rem" }}>
                                🔒 ვაკანსია დახურულია
                              </div>
                              <div style={{ fontSize:"0.75rem", fontWeight:400, marginTop:"0.25rem", opacity:0.85 }}>
                                CV-ები აღარ მიიღება
                              </div>
                            </div>
                          </>
                        );
                      })()}
                    </div>
                  )}

                  {/* ── Normal reply area ── */}
                  {!currentThread.isVacancy && currentThread.allowReplies && (
                    <div className="grl-card" style={{ padding:"1.25rem" }}>
                      <h3 style={{ fontSize:"0.75rem", color:"var(--grl-foreground)", textTransform:"uppercase", letterSpacing:"0.2em", marginBottom:"1rem", display:"flex", alignItems:"center", gap:"0.5rem", fontWeight:700 }}>
                        <Send size={13} style={{ color:"var(--grl-primary)" }}/> პასუხის დაწერა
                      </h3>
                      <div style={{ display:"flex", flexDirection:"column", gap:"0.875rem" }}>
                        <textarea rows={4} value={replyText} onChange={e=>setReplyText(e.target.value)} placeholder="დაწერეთ თქვენი პასუხი…" className="grl-input"/>
                        <div style={{ display:"flex", alignItems:"center", justifyContent:"flex-end" }}>
                          <button onClick={handleAddReply} className="grl-btn grl-btn-primary grl-btn-sm"><Send size={12}/> გაგზავნა</button>
                        </div>
                      </div>
                    </div>
                  )}

                  {currentThread.isComplaint && !currentThread.verdict && (
                    <div style={{ textAlign:"center", padding:"1.5rem", background:"oklch(0.75 0.18 250/0.07)", border:"1px solid oklch(0.75 0.18 250/0.2)", borderRadius:"0.875rem" }}>
                      <Loader2 size={22} style={{ color:"oklch(0.75 0.18 250)", animation:"grlSpin 1s linear infinite", margin:"0 auto 0.625rem" }}/>
                      <p style={{ fontSize:"0.8rem", fontWeight:700, color:"oklch(0.85 0.08 250)" }}>საჩივარი განხილვაშია</p>
                      <p style={{ fontSize:"0.7rem", color:"var(--grl-muted-foreground)", marginTop:"0.25rem" }}>ადმინისტრაცია განიხილავს და გამოაქვეყნებს გადაწყვეტილებას.</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* ─── SIDEBAR ─── */}
            <aside className="grl-sidebar-sticky" style={{ display:"flex", flexDirection:"column", gap:"1.25rem" }}>
              <div className="grl-card" style={{ padding:"1.125rem", textAlign:"center", position:"relative", overflow:"hidden" }}>
                <div style={{ position:"absolute", inset:0, background:"linear-gradient(135deg,oklch(0.68 0.24 0/0.04),transparent)", pointerEvents:"none" }}/>
                <div style={{ position:"relative" }}>
                  <div style={{ fontFamily:"var(--grl-font-mono)", fontSize:"0.575rem", letterSpacing:"0.25em", color:"var(--grl-primary)", textTransform:"uppercase", marginBottom:"0.75rem", display:"flex", alignItems:"center", justifyContent:"center", gap:"0.5rem" }}>
                    <div style={{ width:7, height:7, borderRadius:"50%", background:"oklch(0.74 0.22 0)", boxShadow:"0 0 6px oklch(0.74 0.22 0)" }}/> სერვერის ჰაბი
                  </div>
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"0.875rem" }}>
                    {[[forumStats.members,"ფორუმის წევრი"],[forumStats.posts,"საერთო პოსტი"]].map(([num,label]) => (
                      <div key={label}>
                        <div style={{ fontSize:"1.375rem", color:"oklch(0.97 0.005 250)", fontWeight:700, fontFamily:"var(--grl-font-display)" }}>
                          {num >= 1000 ? `${(num/1000).toFixed(1)}K` : num}
                        </div>
                        <div style={{ fontSize:"0.52rem", textTransform:"uppercase", letterSpacing:"0.1em", color:"var(--grl-muted-foreground)", fontWeight:600, marginTop:"0.2rem" }}>{label}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {currentUser && (
                <div className="grl-card" style={{ overflow:"hidden" }}>
                  <div className="grl-sidebar-header">
                    <span style={{ fontFamily:"var(--grl-font-display)", fontSize:"0.7rem", textTransform:"uppercase", color:"var(--grl-foreground)", letterSpacing:"0.2em", fontWeight:700, display:"flex", alignItems:"center", gap:"0.5rem" }}>
                      <User size={14}/> ანგარიში
                    </span>
                  </div>
                  <div style={{ padding:"1rem", display:"flex", alignItems:"center", gap:"0.75rem" }}>
                    <div style={{ width:40, height:40, borderRadius:"50%", background:currentUser.avatarBg, display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontSize:"0.875rem", fontWeight:700, flexShrink:0 }}>
                      {currentUser.username[0].toUpperCase()}
                    </div>
                    <div style={{ minWidth:0 }}>
                      <div style={{ fontWeight:700, fontSize:"0.8rem" }}>{currentUser.username}</div>
                      <span style={{ fontSize:"0.6rem", color:"var(--grl-muted-foreground)", display:"inline-block", padding:"0.1rem 0.5rem", borderRadius:"999px", background:`${getRoleColor(currentUser)}15`, border:`1px solid ${getRoleColor(currentUser)}33`, color:getRoleColor(currentUser), fontWeight:700 }}>
                        {getRoleLabel(currentUser)}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <div className="grl-card" style={{ overflow:"hidden" }}>
                <div className="grl-sidebar-header">
                  <span style={{ fontFamily:"var(--grl-font-display)", fontSize:"0.7rem", textTransform:"uppercase", color:"var(--grl-foreground)", letterSpacing:"0.2em", fontWeight:700 }}>ბოლო აქტივობა</span>
                  <Clock size={12} style={{ color:"var(--grl-muted-foreground)" }}/>
                </div>
                <div style={{ padding:"1rem", display:"flex", flexDirection:"column", gap:"0.875rem" }}>
                  {latestActivity.length === 0 ? (
                    <div style={{ textAlign:"center", padding:"1.5rem 0.5rem" }}>
                      <MessageCircle size={28} style={{ color:"var(--grl-muted-foreground)", opacity:0.3, margin:"0 auto 0.625rem", display:"block" }}/>
                      <p style={{ fontSize:"0.65rem", color:"var(--grl-muted-foreground)", opacity:0.6, lineHeight:1.5 }}>
                        თემები ჯერ არ არის.<br/><span style={{ opacity:0.8 }}>პირველი პოსტის შემდეგ აქ გამოჩნდება.</span>
                      </p>
                    </div>
                  ) : (
                    latestActivity.map(t => {
                      const isHired = t.isVacancy && loadCVs().some(c => c.threadId === t.id && c.hired);
                      return (
                        <div key={t.id} onClick={()=>navThread(t.subforumId, t.id)}
                          style={{ display:"flex", alignItems:"flex-start", gap:"0.625rem", cursor:"pointer", padding:"0.3rem 0.4rem", margin:"0 -0.4rem", borderRadius:"0.4rem", transition:"background 0.2s" }}
                          onMouseEnter={e=>e.currentTarget.style.background="oklch(0.68 0.24 0/0.05)"}
                          onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                          <div style={{ width:28, height:28, borderRadius:"50%", background:t.avatarBg, flexShrink:0, display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontSize:"0.6rem", fontWeight:700, outline:"2px solid var(--grl-border)" }}>
                            {t.author[0].toUpperCase()}
                          </div>
                          <div style={{ minWidth:0 }}>
                            <h4 style={{ fontSize:"0.7rem", fontWeight:700, color:"var(--grl-foreground)", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", maxWidth:"200px" }}>{t.title}</h4>
                            <p style={{ fontSize:"0.575rem", color:"var(--grl-muted-foreground)", marginTop:"0.1rem", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                              <span style={{ color:"oklch(0.97 0.005 250/0.8)", fontWeight:600 }}>{t.author}</span> · {t.posts.length} პოსტი
                              {t.isVacancy && (
                                <span className={isHired ? "grl-status-label grl-status-label--hired" : "grl-vacancy-badge"} 
                                  style={{ marginLeft:"0.375rem", fontSize:"0.45rem", padding:"0.05rem 0.3rem" }}>
                                  {isHired ? <><CheckCircle2 size={8}/> აყვანილია</> : <><Briefcase size={8}/></>}
                                </span>
                              )}
                            </p>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              <div className="grl-card" style={{ overflow:"hidden" }}>
                <div className="grl-sidebar-header">
                  <span style={{ fontFamily:"var(--grl-font-display)", fontSize:"0.7rem", textTransform:"uppercase", color:"var(--grl-foreground)", letterSpacing:"0.2em", fontWeight:700 }}>წევრები ონლაინ</span>
                  <div style={{ position:"relative", display:"flex", width:10, height:10 }}>
                    <span style={{ position:"absolute", display:"inline-flex", borderRadius:"50%", width:"100%", height:"100%", background:"oklch(0.78 0.19 160)", opacity:0.75, animation:"grlPing 1.5s cubic-bezier(0,0,0.2,1) infinite" }}/>
                    <span style={{ position:"relative", display:"inline-flex", borderRadius:"50%", width:10, height:10, background:"oklch(0.72 0.19 160)" }}/>
                  </div>
                </div>
                <div style={{ padding:"1rem" }}>
                  {onlineMembers.length === 0 ? (
                    <div style={{ textAlign:"center", padding:"1rem 0.5rem" }}>
                      <Users size={24} style={{ color:"var(--grl-muted-foreground)", opacity:0.25, margin:"0 auto 0.5rem", display:"block" }}/>
                      <p style={{ fontSize:"0.6rem", color:"var(--grl-muted-foreground)", opacity:0.5 }}>ონლაინ წევრები არ არიან</p>
                    </div>
                  ) : (
                    <>
                      <div style={{ display:"flex", flexWrap:"wrap", gap:"0.375rem", marginBottom:"0.875rem" }}>
                        {onlineMembers.map((m,i) => {
                          const isMe     = m === currentUser?.username;
                          const isAdminM = isChavle(m);
                          return (
                            <span key={i} style={{ fontSize:"0.65rem", fontWeight:700, padding:"0.25rem 0.625rem", borderRadius:"0.625rem", border:"1px solid var(--grl-border)", background: isMe ? "oklch(0.68 0.24 0/0.15)" : isAdminM ? "oklch(0.65 0.24 25/0.1)" : "var(--grl-card)", color: isMe ? "var(--grl-primary)" : isAdminM ? "oklch(0.72 0.23 25)" : "var(--grl-foreground)" }}>
                              {m}{isMe ? " (შენ)" : ""}
                            </span>
                          );
                        })}
                      </div>
                      <div style={{ borderTop:"1px solid var(--grl-border)", paddingTop:"0.625rem", display:"flex", justifyContent:"space-between", fontSize:"0.575rem", color:"var(--grl-muted-foreground)", fontFamily:"var(--grl-font-mono)" }}>
                        <span>აქტიური: {onlineMembers.length}</span>
                        <span>სტუმრები: 0</span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div className="grl-card" style={{ overflow:"hidden", border:"1px solid oklch(0.72 0.22 0/0.3)" }}>
                <div className="grl-sidebar-header" style={{ background:"linear-gradient(to right, oklch(0.72 0.22 0/0.08), transparent)" }}>
                  <span style={{ fontFamily:"var(--grl-font-display)", fontSize:"0.7rem", textTransform:"uppercase", color:"oklch(0.85 0.16 0)", letterSpacing:"0.2em", fontWeight:700, display:"flex", alignItems:"center", gap:"0.4rem" }}>
                    <Briefcase size={13}/> ვაკანსიები
                  </span>
                  <span style={{ fontSize:"0.55rem", color:"var(--grl-primary)", fontWeight:700, padding:"0.1rem 0.4rem", borderRadius:"999px", background:"oklch(0.72 0.22 0/0.1)", border:"1px solid oklch(0.72 0.22 0/0.3)" }}>
                    {threads.filter(t => t.isVacancy && !t.isClosed).length} ღია
                  </span>
                </div>
                <div style={{ padding:"0.875rem" }}>
                  {threads.filter(t => t.isVacancy && !t.isClosed).length === 0 ? (
                    <p style={{ fontSize:"0.65rem", color:"var(--grl-muted-foreground)", textAlign:"center", padding:"0.5rem 0", opacity:0.6 }}>ღია ვაკანსიები არ არის</p>
                  ) : (
                    threads.filter(t => t.isVacancy && !t.isClosed).slice(0,3).map(t => {
                      const cvs = loadCVs().filter(c => c.threadId === t.id);
                      return (
                        <div key={t.id} onClick={()=>navThread(t.subforumId,t.id)}
                          style={{ cursor:"pointer", padding:"0.5rem 0.5rem", borderRadius:"0.5rem", marginBottom:"0.375rem", transition:"background 0.2s" }}
                          onMouseEnter={e=>e.currentTarget.style.background="oklch(0.72 0.22 0/0.07)"}
                          onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                          <div style={{ fontSize:"0.7rem", fontWeight:700, color:"oklch(0.90 0.005 250)", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{t.title}</div>
                          <div style={{ fontSize:"0.55rem", color:"var(--grl-muted-foreground)", marginTop:"0.1rem" }}>
                            {cvs.length} CV · {t.date}
                          </div>
                        </div>
                      );
                    })
                  )}
                  <button onClick={()=>navSubforum("vacancies")} className="grl-btn grl-btn-sm" style={{ width:"100%", marginTop:"0.5rem", background:"oklch(0.72 0.22 0/0.08)", color:"var(--grl-primary)", border:"1px solid oklch(0.72 0.22 0/0.25)", fontSize:"0.65rem" }}>
                    ყველა ვაკანსია →
                  </button>
                </div>
              </div>
            </aside>
          </div>
        </div>

        {/* ─── NEW THREAD / VACANCY MODAL ─── */}
        {isModalOpen && (
          <div className="grl-modal-overlay" onClick={e=>e.target===e.currentTarget&&setIsModalOpen(false)}>
            <div className="grl-card grl-card-3xl grl-animate-fadein" style={{ width:"100%", maxWidth:"36rem", padding:"1.75rem", position:"relative", boxShadow:"0 25px 60px oklch(0 0 0/0.5)", border: isVacancySubforum(currentSubforumId) ? "1px solid oklch(0.72 0.22 0/0.3)" : undefined }}>
              {isVacancySubforum(currentSubforumId) && (
                <div style={{ position:"absolute", top:0, left:0, right:0, height:2, background:"linear-gradient(90deg, transparent, oklch(0.72 0.22 0/0.8), oklch(0.78 0.14 220/0.6), transparent)", borderRadius:"1.5rem 1.5rem 0 0" }}/>
              )}
              <h3 style={{ fontSize:"1rem", color: isVacancySubforum(currentSubforumId) ? "oklch(0.85 0.16 0)" : "oklch(0.97 0.005 250)", textTransform:"uppercase", letterSpacing:"0.05em", marginBottom:"1.25rem", paddingBottom:"0.75rem", borderBottom:"1px solid var(--grl-border)", fontFamily:"var(--grl-font-display)", display:"flex", alignItems:"center", gap:"0.5rem" }}>
                {isVacancySubforum(currentSubforumId) ? <><Briefcase size={18}/> ვაკანსიის გამოქვეყნება — {currentSubforum?.title}</> : <>ახალი თემის შექმნა — {currentSubforum?.title}</>}
              </h3>

              {isVacancySubforum(currentSubforumId) && (
                <div style={{ marginBottom:"1.25rem", padding:"0.75rem 1rem", borderRadius:"0.625rem", background:"linear-gradient(135deg, oklch(0.72 0.22 0/0.08), oklch(0.78 0.14 220/0.05))", border:"1px solid oklch(0.72 0.22 0/0.25)", fontSize:"0.75rem", color:"oklch(0.82 0.14 0)", lineHeight:1.6 }}>
                  <strong>მოთამაშეები ამ ვაკანსიაზე CV-ს გამოაგზავნიან.</strong><br/>
                  მიუთითე პოზიციის სახელი, მოთხოვნები და კრიტერიუმები.
                  <div style={{ marginTop:"0.5rem", fontSize:"0.65rem", color:"oklch(0.75 0.18 155)" }}>
                    ✅ CV გაგზავნილი იქნება ადმინ პანელზე
                  </div>
                </div>
              )}

              <div style={{ display:"flex", flexDirection:"column", gap:"1.125rem" }}>
                <div>
                  <label className="grl-label">{isVacancySubforum(currentSubforumId) ? "ვაკანსიის სახელი / პოზიცია" : "სათაური"}</label>
                  <input type="text" value={newThreadTitle} onChange={e=>setNewThreadTitle(e.target.value)}
                    placeholder={isVacancySubforum(currentSubforumId) ? "მაგ: ადმინისტრატორი (TEC) — ვაკანსია" : "მაგ: ახალი განახლება"}
                    className="grl-input"/>
                </div>
                <div>
                  <label className="grl-label">{isVacancySubforum(currentSubforumId) ? "კრიტერიუმები და მოთხოვნები" : "შინაარსი"}</label>
                  <textarea rows={isVacancySubforum(currentSubforumId) ? 6 : 5} value={newThreadContent} onChange={e=>setNewThreadContent(e.target.value)}
                    placeholder={isVacancySubforum(currentSubforumId)
                      ? "მაგ:\n• მინ. ასაკი: 16\n• გამოცდილება: 6+ თვე სხვა სერვერზე\n• ენა: ქართული\n• მოვალეობები: ...\n• სხვა კრიტერიუმები..."
                      : "დეტალურად აღწერეთ…"}
                    className="grl-input"/>
                </div>
                <div style={{ display:"flex", justifyContent:"flex-end", gap:"0.75rem", paddingTop:"0.875rem", borderTop:"1px solid var(--grl-border)" }}>
                  <button type="button" onClick={()=>setIsModalOpen(false)} className="grl-btn grl-btn-ghost grl-btn-sm">გაუქმება</button>
                  <button type="button" onClick={handleCreateThread} className={`grl-btn grl-btn-sm ${isVacancySubforum(currentSubforumId) ? "grl-btn-vacancy" : "grl-btn-primary"}`}>
                    {isVacancySubforum(currentSubforumId) ? <><Briefcase size={13}/> გამოქვეყნება</> : "გამოქვეყნება"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}  
      </main>
    </div>
  );
}
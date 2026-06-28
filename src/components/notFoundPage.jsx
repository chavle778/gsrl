import React from "react";
import { Shield, Home, AlertTriangle, ArrowLeft, Search, ExternalLink } from "lucide-react";

/* ─── STYLES ──────────────────────────────────────────────────────────────── */
const inject404Styles = () => {
  if (typeof document === "undefined") return;
  if (document.getElementById("grl-404-styles")) return;
  const style = document.createElement("style");
  style.id = "grl-404-styles";
  style.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Rajdhani:wght@400;500;600;700&family=JetBrains+Mono:wght@400;700&display=swap');

    .grl-404-root {
      --grl-background: oklch(0.15 0.025 285);
      --grl-foreground: oklch(0.97 0.005 250);
      --grl-card: oklch(0.19 0.03 285 / 0.7);
      --grl-primary: oklch(0.72 0.22 0);
      --grl-primary-glow: oklch(0.72 0.22 0 / 0.4);
      --grl-muted-foreground: oklch(0.68 0.025 270);
      --grl-border: oklch(0.28 0.025 285 / 0.5);
      --grl-font-display: "Bebas Neue", "Noto Sans Georgian", sans-serif;
      --grl-font-sans: "Rajdhani", "Noto Sans Georgian", system-ui, sans-serif;
      --grl-font-mono: "JetBrains Mono", monospace;

      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--grl-background);
      color: var(--grl-foreground);
      font-family: var(--grl-font-sans);
      -webkit-font-smoothing: antialiased;
      padding: 2rem 1.5rem;
      position: relative;
      overflow: hidden;
    }

    .grl-404-root * { box-sizing: border-box; }

    .grl-404-card {
      position: relative;
      z-index: 2;
      max-width: 600px;
      width: 100%;
      padding: 3rem 2.5rem;
      border-radius: 1.5rem;
      border: 1px solid var(--grl-border);
      background: var(--grl-card);
      backdrop-filter: blur(16px);
      box-shadow: 0 25px 60px oklch(0 0 0 / 0.5), 0 0 0 1px oklch(0.72 0.22 0 / 0.08) inset;
      text-align: center;
      animation: grl404FadeUp 0.6s cubic-bezier(0.22, 1, 0.36, 1) both;
    }

    .grl-404-card::before {
      content: "";
      position: absolute;
      top: -2px;
      left: 10%;
      right: 10%;
      height: 2px;
      background: linear-gradient(90deg, transparent, oklch(0.72 0.22 0 / 0.8), oklch(0.60 0.26 330 / 0.8), transparent);
      border-radius: 50%;
      filter: blur(1px);
    }

    .grl-404-icon-wrap {
      width: 100px;
      height: 100px;
      border-radius: 50%;
      margin: 0 auto 1.5rem;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, oklch(0.72 0.22 0 / 0.15), oklch(0.60 0.26 330 / 0.10));
      border: 2px solid oklch(0.72 0.22 0 / 0.2);
      position: relative;
    }

    .grl-404-icon-wrap::after {
      content: "";
      position: absolute;
      inset: -4px;
      border-radius: 50%;
      border: 1px solid oklch(0.72 0.22 0 / 0.1);
      animation: grl404Pulse 2s ease-in-out infinite;
    }

    .grl-404-code {
      font-family: var(--grl-font-display);
      font-size: clamp(5rem, 12vw, 8rem);
      line-height: 1;
      background: linear-gradient(135deg, #ff2d78, #ff5ea1,#c91e5e);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      filter: drop-shadow(0 0 40px oklch(0.72 0.22 0 / 0.3));
      letter-spacing: -0.03em;
      margin: 0;
    }

    .grl-404-title {
      font-family: var(--grl-font-display);
      font-size: clamp(1.5rem, 4vw, 2.2rem);
      color: oklch(0.97 0.005 250);
      margin: 0.5rem 0 0.75rem;
      letter-spacing: 0.02em;
    }

    .grl-404-desc {
      font-size: clamp(0.85rem, 1.1vw, 1rem);
      color: var(--grl-muted-foreground);
      line-height: 1.7;
      margin: 0 0 2rem 0;
      max-width: 420px;
      margin-left: auto;
      margin-right: auto;
    }

    .grl-404-desc span {
      color: oklch(0.85 0.12 0);
      font-weight: 600;
    }

    .grl-404-divider {
      width: 60px;
      height: 2px;
      margin: 0 auto 1.5rem;
      background: linear-gradient(90deg, transparent, oklch(0.72 0.22 0 / 0.4), transparent);
      border-radius: 999px;
    }

    .grl-404-buttons {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: center;
      gap: 0.75rem;
    }

    .grl-404-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      padding: 0.75rem 1.5rem;
      border-radius: 0.75rem;
      font-family: var(--grl-font-sans);
      font-weight: 700;
      font-size: 0.8rem;
      cursor: pointer;
      transition: all 0.3s ease;
      border: none;
      outline: none;
      text-decoration: none;
    }

    .grl-404-btn-primary {
      background: linear-gradient(135deg, var(--grl-primary), oklch(0.60 0.26 330));
      color: #fff;
      box-shadow: 0 4px 24px var(--grl-primary-glow);
    }
    .grl-404-btn-primary:hover {
      transform: translateY(-2px) scale(1.02);
      box-shadow: 0 8px 40px var(--grl-primary-glow);
    }

    .grl-404-btn-secondary {
      background: oklch(0.18 0.025 285 / 0.6);
      color: var(--grl-foreground);
      border: 1px solid var(--grl-border);
    }
    .grl-404-btn-secondary:hover {
      background: oklch(0.22 0.025 285 / 0.8);
      border-color: oklch(0.72 0.22 0 / 0.3);
      transform: translateY(-2px);
    }

    /* ── Background Scene ── */
    .grl-404-bg {
      position: fixed;
      inset: 0;
      pointer-events: none;
      z-index: 0;
      overflow: hidden;
    }

    .grl-404-bg-grid {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      height: 55%;
      background-image:
        linear-gradient(to right, oklch(0.72 0.22 0 / 0.07) 1px, transparent 1px),
        linear-gradient(to bottom, oklch(0.72 0.22 0 / 0.07) 1px, transparent 1px);
      background-size: 64px 64px;
      transform-origin: bottom center;
      transform: perspective(600px) rotateX(55deg) scaleX(2.2);
      mask-image: linear-gradient(to top, black 0%, black 40%, transparent 100%);
      -webkit-mask-image: linear-gradient(to top, black 0%, black 40%, transparent 100%);
      animation: grl404GridScroll 4s linear infinite;
    }

    .grl-404-bg-horizon {
      position: absolute;
      bottom: 38%;
      left: 0;
      right: 0;
      height: 2px;
      background: linear-gradient(to right,
        transparent 0%,
        oklch(0.72 0.22 0 / 0.6) 20%,
        oklch(0.82 0.18 340 / 0.9) 50%,
        oklch(0.72 0.22 0 / 0.6) 80%,
        transparent 100%
      );
      filter: blur(1px);
      box-shadow: 0 0 30px 4px oklch(0.72 0.22 0 / 0.3);
    }

    .grl-404-bg-atmosphere {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 100%;
      background:
        radial-gradient(ellipse 80% 45% at 50% -5%, oklch(0.45 0.20 350 / 0.30), transparent 60%),
        radial-gradient(ellipse 60% 40% at 15% 30%, oklch(0.40 0.22 285 / 0.18), transparent 55%),
        radial-gradient(ellipse 50% 35% at 85% 25%, oklch(0.38 0.20 320 / 0.15), transparent 50%);
    }

    .grl-404-bg-scanline {
      position: absolute;
      left: 0;
      right: 0;
      height: 3px;
      background: linear-gradient(to bottom, transparent, oklch(0.72 0.22 0 / 0.12), transparent);
      animation: grl404Scanline 8s linear infinite;
      pointer-events: none;
    }

    @keyframes grl404FadeUp {
      from { opacity: 0; transform: translateY(24px) scale(0.96); }
      to { opacity: 1; transform: translateY(0) scale(1); }
    }

    @keyframes grl404Pulse {
      0%, 100% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.5; transform: scale(1.05); }
    }

    @keyframes grl404GridScroll {
      from { transform: perspective(600px) rotateX(55deg) scaleX(2.2) translateY(0); }
      to { transform: perspective(600px) rotateX(55deg) scaleX(2.2) translateY(64px); }
    }

    @keyframes grl404Scanline {
      from { transform: translateY(-100%); }
      to { transform: translateY(100vh); }
    }

    @media (max-width: 480px) {
      .grl-404-card { padding: 2rem 1.5rem; }
      .grl-404-icon-wrap { width: 80px; height: 80px; }
      .grl-404-buttons { flex-direction: column; width: 100%; }
      .grl-404-buttons .grl-404-btn { width: 100%; justify-content: center; }
    }
  `;
  document.head.appendChild(style);
};

/* ─── BACKGROUND ──────────────────────────────────────────────────────────── */
function NotFoundBackground() {
  return (
    <div className="grl-404-bg">
      <div className="grl-404-bg-atmosphere" />
      <div className="grl-404-bg-grid" />
      <div className="grl-404-bg-horizon" />
      <div className="grl-404-bg-scanline" />
    </div>
  );
}

/* ─── MAIN COMPONENT ──────────────────────────────────────────────────────── */
export default function NotFoundPage() {
  React.useEffect(() => {
    inject404Styles();
  }, []);

  const goBack = () => {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      window.location.href = "/";
    }
  };

  return (
    <div className="grl-404-root">
      <NotFoundBackground />

      <div className="grl-404-card">
        {/* Icon */}
        <div className="grl-404-icon-wrap">
          <AlertTriangle size={52} style={{ color: "oklch(0.72 0.22 0)" }} strokeWidth={1.5} />
        </div>

        {/* 404 Code */}
        <h1 className="grl-404-code">404</h1>

        {/* Title */}
        <h2 className="grl-404-title">გვერდი ვერ მოიძებნა</h2>

        {/* Divider */}
        <div className="grl-404-divider" />

        {/* Description */}
        <p className="grl-404-desc">
          <span>გვერდი, რომელსაც ეძებთ, არ არსებობს</span> — ის შეიძლება წაშლილი იყოს, 
          სახელი შეცვლილი ან დროებით მიუწვდომელი იყოს.
        </p>

        {/* Buttons */}
        <div className="grl-404-buttons">
          <button onClick={goBack} className="grl-404-btn grl-404-btn-secondary">
            <ArrowLeft size={16} />
            უკან დაბრუნება
          </button>

          <a href="/" className="grl-404-btn grl-404-btn-primary">
            <Home size={16} />
            მთავარ გვერდზე
          </a>
        </div>

        {/* Small footer */}
        <div style={{ 
          marginTop: "2rem",
          paddingTop: "1rem",
          borderTop: "1px solid var(--grl-border)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "0.5rem",
          fontSize: "0.55rem",
          color: "var(--grl-muted-foreground)",
          fontFamily: "var(--grl-font-mono)",
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          opacity: 0.6
        }}>
          <Shield size={12} style={{ color: "oklch(0.72 0.22 0)" }} />
          <span>GRL ფორუმი · 404</span>
        </div>
      </div>
    </div>
  );
}
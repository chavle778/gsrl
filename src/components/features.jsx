import { useEffect, useRef, useState } from "react";
import { FEATURES } from "./constants";
import '../App.css';

// ─── useInView hook ───────────────────────────────────────────────────────────
function useInView(options = {}) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.unobserve(el);
        }
      },
      { threshold: 0.1, ...options }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return [ref, inView];
}

// ─── Reveal wrapper ───────────────────────────────────────────────────────────
function Reveal({ children, delay = 0, direction = "up", className = "" }) {
  const [ref, inView] = useInView();

  const translate = {
    up:    "translateY(40px)",
    left:  "translateX(-50px)",
    right: "translateX(50px)",
    fade:  "translateY(8px)",
  }[direction] ?? "translateY(40px)";

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity:    inView ? 1 : 0,
        transform:  inView ? "none" : translate,
        transition: `opacity 0.7s cubic-bezier(0.22,1,0.36,1) ${delay}ms,
                     transform 0.7s cubic-bezier(0.22,1,0.36,1) ${delay}ms`,
        willChange: "opacity, transform",
      }}
    >
      {children}
    </div>
  );
}

// ─── Card with cursor-tracking glow ──────────────────────────────────────────
function FeatureCard({ feature, delay = 0 }) {
  const [ref, inView] = useInView({ threshold: 0.06 });
  const cardRef = useRef(null);
  const [mouse, setMouse] = useState({ x: 50, y: 50 });
  const [hovered, setHovered] = useState(false);

  const handleMouseMove = (e) => {
    const rect = cardRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setMouse({ x, y });
  };

  return (
    <div
      ref={(el) => { ref.current = el; cardRef.current = el; }}
      className="feature-card-wrapper"
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        opacity:    inView ? 1 : 0,
        transform:  inView ? "translateY(0) scale(1)" : "translateY(56px) scale(0.96)",
        transition: `opacity 0.65s cubic-bezier(0.22,1,0.36,1) ${delay}ms,
                     transform 0.65s cubic-bezier(0.22,1,0.36,1) ${delay}ms`,
        willChange: "opacity, transform",
      }}
    >
      {/* cursor spotlight */}
      {hovered && (
        <div
          className="card-spotlight"
          style={{
            background: `radial-gradient(280px circle at ${mouse.x}% ${mouse.y}%, rgba(255,45,120,0.13) 0%, transparent 70%)`,
          }}
        />
      )}

      {/* top accent line */}
      <div className="card-top-line" style={{ width: hovered ? "100%" : "0%" }} />

      {/* background number */}
      <div className="card-bg-number">{feature.n}</div>

      <div className="card-inner">
        {/* icon box */}
        <div className={`card-icon-box ${hovered ? "icon-box--lit" : ""}`}>
          <span className="card-icon">{feature.icon}</span>
          {/* corner cut */}
          <div className="icon-corner-cut" />
        </div>

        <h3 className="card-title">{feature.title}</h3>
        <p className="card-text">{feature.text}</p>

        {/* bottom accent bar */}
        <div className="card-bottom-bar" style={{ width: hovered ? "100%" : "2.5rem" }} />
      </div>
    </div>
  );
}

// ─── Animated Grid Background ─────────────────────────────────────────────────
function GridBackground() {
  return (
    <div className="grid-bg" aria-hidden="true">
      <div className="grid-lines-h" />
      <div className="grid-lines-v" />
    </div>
  );
}

// ─── Main Features Section ────────────────────────────────────────────────────
export function Features() {
  return (
    <section id="features" className="features-section">

      {/* ── Grid BG ── */}
      <GridBackground />

      {/* ── Scanline overlay ── */}
      <div className="scanlines" aria-hidden="true" />

      {/* ── Deep glow orbs ── */}
      <div className="orb orb--top-right"    aria-hidden="true" />
      <div className="orb orb--bottom-left"  aria-hidden="true" />
      <div className="orb orb--center"       aria-hidden="true" />
      <div className="orb orb--title-glow"   aria-hidden="true" />

      {/* ── Horizontal neon line ── */}
      <div className="neon-divider neon-divider--top" aria-hidden="true" />

      {/* ── Particle sparks ── */}
      <SparkLayer />

      {/* ── Content ── */}
      <div className="features-inner">

        {/* Header */}
        <header className="features-header">
          <div className="features-header-left">
            <Reveal direction="up" delay={0}>
              <p className="features-eyebrow">
                <span className="eyebrow-slash">//</span> 01 — GAMEPLAY
              </p>
            </Reveal>

            <Reveal direction="up" delay={110}>
              <h2 className="features-title">
                რეალური ცხოვრება{" "}
                <span className="title-accent">თამაშში</span>
              </h2>
            </Reveal>

            {/* Title underline */}
            <Reveal direction="up" delay={200}>
              <div className="title-underline" aria-hidden="true">
                <div className="title-underline-bar" />
                <div className="title-underline-dot" />
              </div>
            </Reveal>
          </div>

          <Reveal direction="right" delay={200}>
            <p className="features-subtitle">
              ყოველი დეტალი დახვეწილია — ფასებიდან მანქანის ხმამდე.{" "}
              <span className="subtitle-accent">შენ თვითონ წერ ისტორიას.</span>
            </p>
          </Reveal>
        </header>

        {/* Cards grid */}
        <div className="features-grid">
          {FEATURES.map((f, i) => (
            <FeatureCard key={f.n} feature={f} delay={300 + i * 80} />
          ))}
        </div>

        {/* Bottom CTA strip */}
        <Reveal direction="up" delay={600}>
          <div className="features-cta-strip">
            <div className="cta-strip-line" />
            <span className="cta-strip-text">ჩვენ გვყავს 1,200+ მოთამაშე</span>
            <div className="cta-strip-line" />
          </div>
        </Reveal>

      </div>

      {/* ── Bottom neon line ── */}
      <div className="neon-divider neon-divider--bottom" aria-hidden="true" />

      <style>{`
        /* ════════════════════════════════════════════════════
           FEATURES SECTION — Georgian Real Life dark neon
           ════════════════════════════════════════════════════ */

        .features-section {
          position: relative;
          padding: 7rem 0;
          overflow: hidden;
          background: #06030d;
          isolation: isolate;
        }

        /* ── Grid background ── */
        .grid-bg {
          position: absolute;
          inset: 0;
          z-index: 0;
          pointer-events: none;
        }
        .grid-lines-h {
          position: absolute;
          inset: 0;
          background-image: repeating-linear-gradient(
            0deg,
            transparent,
            transparent 79px,
            rgba(255,45,120,0.045) 79px,
            rgba(255,45,120,0.045) 80px
          );
        }
        .grid-lines-v {
          position: absolute;
          inset: 0;
          background-image: repeating-linear-gradient(
            90deg,
            transparent,
            transparent 79px,
            rgba(255,45,120,0.03) 79px,
            rgba(255,45,120,0.03) 80px
          );
        }

        /* ── Scanlines ── */
        .scanlines {
          position: absolute;
          inset: 0;
          z-index: 1;
          pointer-events: none;
          background: repeating-linear-gradient(
            to bottom,
            transparent 0px,
            transparent 2px,
            rgba(0,0,0,0.18) 2px,
            rgba(0,0,0,0.18) 4px
          );
          opacity: 0.35;
        }

        /* ── Orbs ── */
        .orb {
          position: absolute;
          border-radius: 50%;
          pointer-events: none;
          z-index: 0;
          filter: blur(90px);
        }
        .orb--top-right {
          top: -8%;
          right: -6%;
          width: 520px;
          height: 520px;
          background: radial-gradient(circle, rgba(255,20,100,0.22) 0%, rgba(180,0,80,0.08) 60%, transparent 100%);
          animation: orbDrift 16s ease-in-out infinite alternate;
        }
        .orb--bottom-left {
          bottom: -10%;
          left: -8%;
          width: 480px;
          height: 480px;
          background: radial-gradient(circle, rgba(140,0,200,0.18) 0%, rgba(80,0,140,0.07) 60%, transparent 100%);
          animation: orbDrift 13s ease-in-out infinite alternate;
          animation-delay: -5s;
        }
        .orb--center {
          top: 38%;
          left: 45%;
          transform: translate(-50%, -50%);
          width: 700px;
          height: 700px;
          background: radial-gradient(circle, rgba(255,20,90,0.06) 0%, transparent 65%);
          animation: orbPulse 20s ease-in-out infinite;
          filter: blur(120px);
        }
        .orb--title-glow {
          top: 0;
          left: 30%;
          width: 400px;
          height: 200px;
          background: radial-gradient(ellipse, rgba(255,45,120,0.12) 0%, transparent 70%);
          filter: blur(60px);
          animation: orbDrift 10s ease-in-out infinite alternate;
          animation-delay: -3s;
        }

        @keyframes orbDrift {
          from { transform: translate(0, 0) scale(1); }
          to   { transform: translate(30px, -25px) scale(1.08); }
        }
        @keyframes orbPulse {
          0%, 100% { opacity: 0.5; transform: translate(-50%, -50%) scale(1); }
          50%       { opacity: 1;   transform: translate(-50%, -50%) scale(1.1); }
        }

        /* ── Neon dividers ── */
        .neon-divider {
          position: absolute;
          left: 0;
          right: 0;
          height: 1px;
          z-index: 2;
          pointer-events: none;
        }
        .neon-divider--top {
          top: 0;
          background: linear-gradient(
            90deg,
            transparent 0%,
            rgba(255,45,120,0.15) 20%,
            rgba(255,45,120,0.6) 50%,
            rgba(255,45,120,0.15) 80%,
            transparent 100%
          );
          box-shadow: 0 0 12px 2px rgba(255,45,120,0.3);
        }
        .neon-divider--bottom {
          bottom: 0;
          background: linear-gradient(
            90deg,
            transparent 0%,
            rgba(255,45,120,0.1) 30%,
            rgba(255,45,120,0.4) 50%,
            rgba(255,45,120,0.1) 70%,
            transparent 100%
          );
          box-shadow: 0 0 8px 1px rgba(255,45,120,0.2);
        }

        /* ── Inner content ── */
        .features-inner {
          position: relative;
          z-index: 10;
          max-width: 88rem;
          margin: 0 auto;
          padding: 0 1.5rem;
        }

        /* ── Header ── */
        .features-header {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 1.5rem;
          margin-bottom: 4rem;
        }
        .features-header-left {
          flex: 1;
          min-width: 280px;
        }

        /* Eyebrow */
        .features-eyebrow {
          font-family: 'JetBrains Mono', 'Fira Code', monospace;
          font-size: 0.7rem;
          letter-spacing: 0.32em;
          color: #ff2d78;
          margin: 0 0 1rem;
          text-shadow: 0 0 12px rgba(255,45,120,0.6);
        }
        .eyebrow-slash {
          opacity: 0.5;
          margin-right: 0.3em;
        }

        /* Title */
        .features-title {
          font-size: clamp(2.4rem, 5vw, 3.8rem);
          font-weight: 700;
          color: #f0e8ff;
          line-height: 1.1;
          letter-spacing: -0.02em;
          margin: 0;
          text-shadow: 0 2px 40px rgba(255,45,120,0.15);
        }
        .title-accent {
          color: #ff2d78;
          text-shadow:
            0 0 20px rgba(255,45,120,0.7),
            0 0 60px rgba(255,45,120,0.3),
            0 0 120px rgba(255,45,120,0.15);
          position: relative;
        }

        /* Underline decoration */
        .title-underline {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-top: 1.1rem;
        }
        .title-underline-bar {
          height: 2px;
          width: 5rem;
          background: linear-gradient(90deg, #ff2d78, rgba(255,45,120,0.1));
          box-shadow: 0 0 8px rgba(255,45,120,0.5);
        }
        .title-underline-dot {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: #ff2d78;
          box-shadow: 0 0 10px rgba(255,45,120,0.9), 0 0 20px rgba(255,45,120,0.5);
          animation: dotPulse 2s ease-in-out infinite;
        }
        @keyframes dotPulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%       { opacity: 0.5; transform: scale(0.6); }
        }

        /* Subtitle */
        .features-subtitle {
          max-width: 26rem;
          font-size: 0.92rem;
          line-height: 1.75;
          color: rgba(200,180,220,0.65);
          margin: 0;
        }
        .subtitle-accent {
          color: rgba(255,140,185,0.85);
        }

        /* ── Cards grid ── */
        .features-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 0;
          border: 1px solid rgba(255,45,120,0.12);
          box-shadow:
            0 0 0 1px rgba(255,45,120,0.05),
            0 0 60px rgba(255,45,120,0.04),
            inset 0 0 80px rgba(255,45,120,0.02);
        }
        @media (max-width: 1024px) {
          .features-grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 640px) {
          .features-grid { grid-template-columns: 1fr; }
        }

        /* ── Feature card ── */
        .feature-card-wrapper {
          position: relative;
          background: #0a0412;
          border: 1px solid rgba(255,45,120,0.08);
          padding: 2.2rem;
          overflow: hidden;
          cursor: default;
          transition: background 0.4s ease, border-color 0.4s ease;
        }
        .feature-card-wrapper:hover {
          background: #0f0618;
          border-color: rgba(255,45,120,0.22);
        }

        /* cursor spotlight */
        .card-spotlight {
          position: absolute;
          inset: 0;
          pointer-events: none;
          z-index: 0;
          transition: opacity 0.3s ease;
        }

        /* top accent line */
        .card-top-line {
          position: absolute;
          top: 0;
          left: 0;
          height: 2px;
          background: linear-gradient(90deg, #ff2d78, rgba(255,45,120,0.1));
          box-shadow: 0 0 8px rgba(255,45,120,0.6);
          transition: width 0.5s cubic-bezier(0.22,1,0.36,1);
          z-index: 2;
        }

        /* bg number */
        .card-bg-number {
          position: absolute;
          right: -0.5rem;
          top: -1rem;
          font-size: 8rem;
          font-weight: 900;
          line-height: 1;
          color: rgba(255,45,120,0.06);
          pointer-events: none;
          select: none;
          z-index: 0;
          transition: color 0.4s ease;
          font-variant-numeric: tabular-nums;
          letter-spacing: -0.05em;
        }
        .feature-card-wrapper:hover .card-bg-number {
          color: rgba(255,45,120,0.12);
        }

        /* card inner */
        .card-inner {
          position: relative;
          z-index: 1;
        }

        /* icon box */
        .card-icon-box {
          position: relative;
          width: 3.2rem;
          height: 3.2rem;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(255,45,120,0.08);
          border: 1px solid rgba(255,45,120,0.25);
          margin-bottom: 1.5rem;
          clip-path: polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 0 100%);
          transition: background 0.35s, border-color 0.35s, box-shadow 0.35s;
        }
        .icon-box--lit {
          background: rgba(255,45,120,0.15);
          border-color: rgba(255,45,120,0.5);
          box-shadow:
            0 0 20px rgba(255,45,120,0.3),
            inset 0 0 16px rgba(255,45,120,0.1);
        }
        .card-icon {
          font-size: 1.4rem;
          line-height: 1;
          color: #ff2d78;
          filter: drop-shadow(0 0 6px rgba(255,45,120,0.7));
        }
        /* notch corner */
        .icon-corner-cut {
          position: absolute;
          top: -1px;
          right: -1px;
          width: 10px;
          height: 10px;
          background: rgba(255,45,120,0.4);
          clip-path: polygon(0 0, 100% 0, 100% 100%);
        }

        /* card text */
        .card-title {
          font-size: 1.2rem;
          font-weight: 700;
          color: #f0e8ff;
          margin: 0 0 0.65rem;
          letter-spacing: -0.01em;
        }
        .card-text {
          font-size: 0.84rem;
          line-height: 1.72;
          color: rgba(180,160,210,0.65);
          margin: 0;
        }

        /* bottom bar */
        .card-bottom-bar {
          margin-top: 1.6rem;
          height: 1.5px;
          background: linear-gradient(90deg, #ff2d78, rgba(255,45,120,0.15));
          box-shadow: 0 0 6px rgba(255,45,120,0.4);
          transition: width 0.55s cubic-bezier(0.22,1,0.36,1);
        }

        /* ── CTA strip ── */
        .features-cta-strip {
          display: flex;
          align-items: center;
          gap: 1.2rem;
          margin-top: 3.5rem;
          justify-content: center;
        }
        .cta-strip-line {
          flex: 1;
          height: 1px;
          max-width: 200px;
          background: linear-gradient(90deg, transparent, rgba(255,45,120,0.3));
        }
        .cta-strip-line:last-child {
          background: linear-gradient(90deg, rgba(255,45,120,0.3), transparent);
        }
        .cta-strip-text {
          font-family: 'JetBrains Mono', 'Fira Code', monospace;
          font-size: 0.72rem;
          letter-spacing: 0.2em;
          color: rgba(255,45,120,0.6);
          white-space: nowrap;
          text-transform: uppercase;
        }

        /* ════════════════════
           SPARK PARTICLES
           ════════════════════ */
        .sparks-host {
          position: absolute;
          inset: 0;
          overflow: hidden;
          pointer-events: none;
          z-index: 1;
        }
        .sp {
          position: absolute;
          border-radius: 50%;
          pointer-events: none;
          will-change: transform, opacity;
        }

        @keyframes spRise {
          0%   { transform: translateY(0)    translateX(var(--sx,0)) scale(0.15); opacity: 0; }
          6%   { opacity: 0.9; }
          50%  { opacity: 0.75; }
          85%  { opacity: 0.4; }
          100% { transform: translateY(-110vh) translateX(calc(var(--sx,0) * 1.4)) scale(0.05); opacity: 0; }
        }
        @keyframes spTwinkle {
          0%, 100% { opacity: 0.35; transform: scale(0.65); }
          50%       { opacity: 1;    transform: scale(1.5); }
        }

        /* ── Reduced motion ── */
        @media (prefers-reduced-motion: reduce) {
          .orb, .title-underline-dot, .cta-strip-text,
          .sp, .card-top-line, .card-bottom-bar {
            animation: none !important;
            transition: none !important;
          }
          .sparks-host { display: none; }
        }

        /* ── Mobile tweaks ── */
        @media (max-width: 768px) {
          .features-section { padding: 4.5rem 0; }
          .features-header { flex-direction: column; gap: 1rem; }
          .features-subtitle { max-width: 100%; }
          .feature-card-wrapper { padding: 1.6rem; }
          .orb { filter: blur(60px) !important; }
        }
      `}</style>
    </section>
  );
}

// ─── Spark particle layer ─────────────────────────────────────────────────────
function SparkLayer() {
  const PINK_HUES = [
    "#ff2d78", "#ff5fa0", "#ff80b5", "#c81e5d",
    "#ff4d8f", "#ff96c8", "#e0186a",
  ];
  const PURP_HUES = [
    "#b040ff", "#9020e0", "#c070ff", "#7a00cc",
  ];

  const sparks = Array.from({ length: 44 }, (_, i) => {
    const isPurple = Math.random() < 0.2;
    const palette  = isPurple ? PURP_HUES : PINK_HUES;
    const color    = palette[Math.floor(Math.random() * palette.length)];
    const size     = 1.2 + Math.random() * 2.8;
    const duration = 5 + Math.random() * 9;
    const delay    = Math.random() * 18;
    const drift    = (Math.random() - 0.5) * 320;
    const left     = Math.random() * 100;
    const twinkle  = Math.random() < 0.4;
    const initOpacity = 0.25 + Math.random() * 0.45;

    return { i, color, size, duration, delay, drift, left, twinkle, initOpacity };
  });

  return (
    <div className="sparks-host" aria-hidden="true">
      {sparks.map(({ i, color, size, duration, delay, drift, left, twinkle, initOpacity }) => (
        <div
          key={i}
          className="sp"
          style={{
            width:  size,
            height: size,
            background: color,
            left:   `${left}%`,
            bottom: `${-5 - Math.random() * 18}%`,
            opacity: initOpacity,
            boxShadow: `
              0 0 ${size * 3}px   ${size * 0.6}px ${color},
              0 0 ${size * 9}px   ${size * 2}px   ${color}55,
              0 0 ${size * 22}px  ${size * 4.5}px ${color}22
            `,
            ["--sx"]: `${drift}px`,
            animation: [
              `spRise ${duration}s cubic-bezier(0.25,0.46,0.45,0.94) ${delay}s infinite`,
              twinkle ? `spTwinkle ${1 + Math.random() * 2}s ease-in-out ${delay}s infinite` : "",
            ].filter(Boolean).join(", "),
          }}
        />
      ))}
    </div>
  );
}
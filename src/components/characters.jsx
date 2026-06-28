import { useEffect, useRef, useState } from "react";
import { CHARACTERS } from "./constants";
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
      { threshold: 0.08, ...options }
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

// ─── Character Card ───────────────────────────────────────────────────────────
function CharCard({ c, index, delay = 0 }) {
  const [ref, inView] = useInView({ threshold: 0.06 });
  const cardRef = useRef(null);
  const [mouse, setMouse]   = useState({ x: 50, y: 50 });
  const [hovered, setHovered] = useState(false);

  const handleMouseMove = (e) => {
    const rect = cardRef.current?.getBoundingClientRect();
    if (!rect) return;
    setMouse({
      x: ((e.clientX - rect.left) / rect.width)  * 100,
      y: ((e.clientY - rect.top)  / rect.height) * 100,
    });
  };

  return (
    <div
      ref={(el) => { ref.current = el; cardRef.current = el; }}
      className="char-card-wrap"
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        opacity:   inView ? 1 : 0,
        transform: inView ? "translateY(0) scale(1)" : "translateY(56px) scale(0.95)",
        transition: `opacity 0.7s cubic-bezier(0.22,1,0.36,1) ${delay}ms,
                     transform 0.7s cubic-bezier(0.22,1,0.36,1) ${delay}ms`,
        willChange: "opacity, transform",
        "--card-accent": c.color ?? "#ff2d78",
      }}
    >
      {/* cursor spotlight */}
      <div
        className="char-spotlight"
        style={{
          opacity: hovered ? 1 : 0,
          background: `radial-gradient(300px circle at ${mouse.x}% ${mouse.y}%, ${c.color ?? "#ff2d78"}22 0%, transparent 70%)`,
        }}
      />

      {/* top accent line */}
      <div className="char-top-line" style={{ width: hovered ? "100%" : "0%" }} />

      {/* corner index badge */}
      <div className="char-index">0{index + 1}</div>

      {/* image */}
      <div className="char-img-wrap">
        <img
          src={c.img}
          alt={c.name}
          width={640}
          height={800}
          loading="lazy"
          className={`char-img ${hovered ? "char-img--hovered" : ""}`}
        />

        {/* image scanlines */}
        <div className="char-img-scanlines" />

        {/* gradient overlays */}
        <div className="char-img-grad-bottom" />
        <div
          className="char-img-grad-color"
          style={{
            opacity: hovered ? 0.18 : 0,
            background: `linear-gradient(to top, ${c.color ?? "#ff2d78"} 0%, transparent 60%)`,
          }}
        />

        {/* hover glow ring */}
        <div
          className="char-glow-ring"
          style={{
            opacity: hovered ? 1 : 0,
            boxShadow: `inset 0 0 0 1px ${c.color ?? "#ff2d78"}55,
                        inset 0 0 30px ${c.color ?? "#ff2d78"}22`,
          }}
        />
      </div>

      {/* text block */}
      <div className="char-info">
        {/* role tag */}
        <p className="char-role" style={{ color: c.color ?? "#ff2d78" }}>
          <span
            className="char-role-dot"
            style={{
              background: c.color ?? "#ff2d78",
              boxShadow: `0 0 8px ${c.color ?? "#ff2d78"}`,
            }}
          />
          {c.role}
        </p>

        {/* name */}
        <h3 className="char-name">{c.name}</h3>

        {/* animated bar */}
        <div
          className="char-bar"
          style={{
            width: hovered ? "100%" : "1.8rem",
            background: c.color ?? "#ff2d78",
            boxShadow: hovered
              ? `0 0 12px ${c.color ?? "#ff2d78"}88`
              : "none",
          }}
        />
      </div>

      {/* bottom left corner decoration */}
      <div
        className="char-corner-bl"
        style={{ borderColor: `${c.color ?? "#ff2d78"}40` }}
      />
    </div>
  );
}

// ─── Spark Layer ─────────────────────────────────────────────────────────────
function SparkLayer() {
  const COLORS = [
    "#ff2d78", "#ff5fa0", "#ff80b5",
    "#c81e5d", "#ff4d8f", "#b040ff", "#ff96c8",
  ];
  const sparks = Array.from({ length: 38 }, (_, i) => {
    const color   = COLORS[Math.floor(Math.random() * COLORS.length)];
    const size    = 1.2 + Math.random() * 2.6;
    const dur     = 5 + Math.random() * 9;
    const delay   = Math.random() * 18;
    const drift   = (Math.random() - 0.5) * 300;
    const left    = Math.random() * 100;
    const twinkle = Math.random() < 0.38;
    const tw      = 1 + Math.random() * 2;
    return { i, color, size, dur, delay, drift, left, twinkle, tw };
  });

  return (
    <div className="char-sparks" aria-hidden="true">
      {sparks.map(({ i, color, size, dur, delay, drift, left, twinkle, tw }) => (
        <div
          key={i}
          style={{
            position: "absolute",
            borderRadius: "50%",
            pointerEvents: "none",
            willChange: "transform, opacity",
            zIndex: 2,
            width: size,
            height: size,
            background: color,
            left: `${left}%`,
            bottom: `${-5 - Math.random() * 18}%`,
            opacity: 0.25 + Math.random() * 0.45,
            boxShadow: `
              0 0 ${size * 3}px   ${size * 0.6}px ${color},
              0 0 ${size * 9}px   ${size * 2}px   ${color}55,
              0 0 ${size * 22}px  ${size * 4.5}px ${color}22
            `,
            animation: [
              `charSparkRise ${dur}s cubic-bezier(0.25,0.46,0.45,0.94) ${delay}s infinite`,
              twinkle ? `charSparkTwinkle ${tw}s ease-in-out ${delay}s infinite` : "",
            ].filter(Boolean).join(", "),
            "--sx": `${drift}px`,
          }}
        />
      ))}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
function Characters() {
  return (
    <section id="characters" className="chars-section">

      {/* grid bg */}
      <div className="chars-grid-bg" aria-hidden="true">
        <div className="chars-grid-h" />
        <div className="chars-grid-v" />
      </div>

      {/* scanlines */}
      <div className="chars-scanlines" aria-hidden="true" />

      {/* orbs */}
      <div className="chars-orb chars-orb--tr"  aria-hidden="true" />
      <div className="chars-orb chars-orb--bl"  aria-hidden="true" />
      <div className="chars-orb chars-orb--mid" aria-hidden="true" />

      {/* neon dividers */}
      <div className="chars-neon-div chars-neon-div--top"    aria-hidden="true" />
      <div className="chars-neon-div chars-neon-div--bottom" aria-hidden="true" />

      {/* sparks */}
      <SparkLayer />

      <div className="chars-inner">

        {/* ─── Header ─── */}
        <header className="chars-header">
          <Reveal direction="up" delay={0}>
            <p className="chars-eyebrow">
              <span className="eyebrow-slash">//</span> 02 — CHARACTERS
            </p>
          </Reveal>

          <Reveal direction="up" delay={110}>
            <h2 className="chars-title">
              აარჩიე შენი{" "}
              <span className="chars-title-accent">გზა</span>
            </h2>
          </Reveal>

          <Reveal direction="up" delay={200}>
            <div className="chars-underline" aria-hidden="true">
              <div className="chars-uline-bar" />
              <div className="chars-uline-dot" />
            </div>
          </Reveal>

          <Reveal direction="up" delay={240}>
            <p className="chars-subtitle">
              ოთხი სამყარო — ერთი ქალაქი.{" "}
              <span className="chars-subtitle-acc">გადაწყვიტე ვინ იქნები ლოს სანტოსში.</span>
            </p>
          </Reveal>
        </header>

        {/* ─── Cards grid ─── */}
        <div className="chars-grid">
          {CHARACTERS.map((c, i) => (
            <CharCard key={c.name} c={c} index={i} delay={340 + i * 100} />
          ))}
        </div>

        {/* ─── Bottom strip ─── */}
        <Reveal direction="up" delay={700}>
          <div className="chars-cta-strip">
            <div className="chars-strip-line" />
            <span className="chars-strip-text">აირჩიე შენი ბედი</span>
            <div className="chars-strip-line chars-strip-line--rev" />
          </div>
        </Reveal>

      </div>

      <style>{`
        /* ════════════════════════════════════════════════
           CHARACTERS SECTION
           ════════════════════════════════════════════════ */

        .chars-section {
          position: relative;
          padding: 6.5rem 0;
          overflow: hidden;
          background: #07040e;
          isolation: isolate;
        }

        /* ── Grid bg ── */
        .chars-grid-bg { position: absolute; inset: 0; z-index: 0; pointer-events: none; }
        .chars-grid-h {
          position: absolute; inset: 0;
          background-image: repeating-linear-gradient(
            0deg, transparent, transparent 79px,
            rgba(255,45,120,0.04) 79px, rgba(255,45,120,0.04) 80px
          );
        }
        .chars-grid-v {
          position: absolute; inset: 0;
          background-image: repeating-linear-gradient(
            90deg, transparent, transparent 79px,
            rgba(255,45,120,0.025) 79px, rgba(255,45,120,0.025) 80px
          );
        }

        /* ── Scanlines ── */
        .chars-scanlines {
          position: absolute; inset: 0; z-index: 1; pointer-events: none;
          background: repeating-linear-gradient(
            to bottom, transparent 0px, transparent 2px,
            rgba(0,0,0,0.16) 2px, rgba(0,0,0,0.16) 4px
          );
          opacity: 0.3;
        }

        /* ── Orbs ── */
        .chars-orb { position: absolute; border-radius: 50%; pointer-events: none; z-index: 0; }
        .chars-orb--tr {
          top: -8%; right: -6%; width: 460px; height: 460px;
          background: radial-gradient(circle, rgba(255,20,100,0.2) 0%, rgba(180,0,80,0.07) 55%, transparent 100%);
          filter: blur(85px);
          animation: charsOrbDrift 16s ease-in-out infinite alternate;
        }
        .chars-orb--bl {
          bottom: -10%; left: -7%; width: 420px; height: 420px;
          background: radial-gradient(circle, rgba(140,0,200,0.16) 0%, rgba(80,0,140,0.06) 55%, transparent 100%);
          filter: blur(85px);
          animation: charsOrbDrift 13s ease-in-out infinite alternate;
          animation-delay: -5s;
        }
        .chars-orb--mid {
          top: 42%; left: 48%; transform: translate(-50%,-50%);
          width: 600px; height: 600px;
          background: radial-gradient(circle, rgba(255,20,90,0.055) 0%, transparent 65%);
          filter: blur(110px);
          animation: charsOrbPulse 22s ease-in-out infinite;
        }
        @keyframes charsOrbDrift {
          from { transform: translate(0,0) scale(1); }
          to   { transform: translate(28px,-22px) scale(1.07); }
        }
        @keyframes charsOrbPulse {
          0%,100% { opacity: 0.5; transform: translate(-50%,-50%) scale(1); }
          50%      { opacity: 1;   transform: translate(-50%,-50%) scale(1.1); }
        }

        /* ── Neon dividers ── */
        .chars-neon-div {
          position: absolute; left: 0; right: 0; height: 1px;
          z-index: 2; pointer-events: none;
        }
        .chars-neon-div--top {
          top: 0;
          background: linear-gradient(90deg,
            transparent 0%, rgba(255,45,120,0.14) 20%,
            rgba(255,45,120,0.6) 50%, rgba(255,45,120,0.14) 80%, transparent 100%
          );
          box-shadow: 0 0 14px 3px rgba(255,45,120,0.28);
        }
        .chars-neon-div--bottom {
          bottom: 0;
          background: linear-gradient(90deg,
            transparent 0%, rgba(255,45,120,0.1) 30%,
            rgba(255,45,120,0.38) 50%, rgba(255,45,120,0.1) 70%, transparent 100%
          );
          box-shadow: 0 0 8px 2px rgba(255,45,120,0.18);
        }

        /* ── Sparks ── */
        .char-sparks {
          position: absolute; inset: 0; overflow: hidden;
          pointer-events: none; z-index: 1;
        }
        @keyframes charSparkRise {
          0%   { transform: translateY(0) translateX(0) scale(0.12); opacity: 0; }
          6%   { opacity: 0.9; }
          50%  { opacity: 0.72; }
          85%  { opacity: 0.32; }
          100% { transform: translateY(-110vh) translateX(var(--sx,0)) scale(0.04); opacity: 0; }
        }
        @keyframes charSparkTwinkle {
          0%,100% { opacity: 0.3; transform: scale(0.6); }
          50%      { opacity: 1;   transform: scale(1.5); }
        }

        /* ── Inner ── */
        .chars-inner {
          position: relative; z-index: 10;
          max-width: 88rem; margin: 0 auto; padding: 0 1.5rem;
        }

        /* ── Header ── */
        .chars-header { text-align: center; margin-bottom: 4rem; }

        .chars-eyebrow {
          font-family: 'JetBrains Mono','Fira Code',monospace;
          font-size: 0.68rem; letter-spacing: 0.32em;
          color: #ff2d78; margin: 0 0 1rem;
          text-shadow: 0 0 12px rgba(255,45,120,0.65);
        }
        .eyebrow-slash { opacity: 0.45; margin-right: 0.3em; }

        .chars-title {
          font-size: clamp(2.2rem, 5vw, 3.8rem);
          font-weight: 800; color: #f0e8ff;
          line-height: 1.1; letter-spacing: -0.025em;
          margin: 0;
          text-shadow: 0 2px 40px rgba(255,45,120,0.12);
        }
        .chars-title-accent {
          color: #ff2d78;
          text-shadow:
            0 0 20px rgba(255,45,120,0.8),
            0 0 60px rgba(255,45,120,0.35),
            0 0 120px rgba(255,45,120,0.15);
        }

        .chars-underline {
          display: flex; align-items: center; gap: 0.5rem;
          justify-content: center; margin-top: 1rem;
        }
        .chars-uline-bar {
          height: 2px; width: 4.5rem;
          background: linear-gradient(90deg, rgba(255,45,120,0.1), #ff2d78, rgba(255,45,120,0.1));
          box-shadow: 0 0 8px rgba(255,45,120,0.5);
        }
        .chars-uline-dot {
          width: 5px; height: 5px; border-radius: 50%; background: #ff2d78;
          box-shadow: 0 0 10px rgba(255,45,120,1), 0 0 20px rgba(255,45,120,0.6);
          animation: charsDotPulse 2s ease-in-out infinite;
        }
        @keyframes charsDotPulse {
          0%,100% { opacity:1; transform:scale(1); }
          50%      { opacity:0.35; transform:scale(0.5); }
        }

        .chars-subtitle {
          margin: 1.1rem auto 0; max-width: 30rem;
          font-size: 0.88rem; line-height: 1.78;
          color: rgba(200,180,220,0.6);
        }
        .chars-subtitle-acc { color: rgba(255,140,185,0.82); }

        /* ── Cards grid ── */
        .chars-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1px;
          background: rgba(255,45,120,0.1);
          border: 1px solid rgba(255,45,120,0.12);
          box-shadow:
            0 0 0 1px rgba(255,45,120,0.04),
            0 0 60px rgba(255,45,120,0.03);
        }
        @media (max-width: 900px) { .chars-grid { grid-template-columns: repeat(2,1fr); } }
        @media (max-width: 520px) { .chars-grid { grid-template-columns: repeat(2,1fr); gap: 1px; } }

        /* ── Card wrap ── */
        .char-card-wrap {
          position: relative;
          background: #09040f;
          overflow: hidden;
          cursor: default;
          transition: background 0.4s;
        }
        .char-card-wrap:hover { background: #0f0519; }

        /* spotlight */
        .char-spotlight {
          position: absolute; inset: 0;
          pointer-events: none; z-index: 0;
          transition: opacity 0.35s;
          border-radius: inherit;
        }

        /* top line */
        .char-top-line {
          position: absolute; top: 0; left: 0;
          height: 2px; z-index: 10;
          background: linear-gradient(90deg, var(--card-accent,#ff2d78), rgba(255,45,120,0.12));
          box-shadow: 0 0 8px var(--card-accent,#ff2d78);
          transition: width 0.55s cubic-bezier(0.22,1,0.36,1);
        }

        /* index badge */
        .char-index {
          position: absolute; top: 0.7rem; left: 0.7rem;
          font-family: 'JetBrains Mono','Fira Code',monospace;
          font-size: 0.62rem; letter-spacing: 0.18em;
          color: #f0e8ff;
          background: rgba(6,2,12,0.78);
          backdrop-filter: blur(8px);
          border: 1px solid rgba(255,45,120,0.18);
          padding: 0.22rem 0.55rem;
          z-index: 10;
          clip-path: polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 0 100%);
        }

        /* image wrapper */
        .char-img-wrap {
          position: relative;
          aspect-ratio: 4/5;
          overflow: hidden;
        }

        .char-img {
          width: 100%; height: 100%;
          object-fit: cover;
          filter: grayscale(45%) brightness(0.85);
          transform: scale(1.02);
          transition: filter 0.65s ease, transform 0.7s cubic-bezier(0.22,1,0.36,1);
          display: block;
        }
        .char-img--hovered {
          filter: grayscale(0%) brightness(1);
          transform: scale(1.08);
        }

        /* img overlays */
        .char-img-scanlines {
          position: absolute; inset: 0; pointer-events: none;
          background: repeating-linear-gradient(
            to bottom, transparent 0px, transparent 2px,
            rgba(0,0,0,0.12) 2px, rgba(0,0,0,0.12) 4px
          );
          opacity: 0.4; mix-blend-mode: multiply;
        }
        .char-img-grad-bottom {
          position: absolute; inset: 0; pointer-events: none;
          background: linear-gradient(to top, #09040f 0%, rgba(9,4,15,0.55) 35%, transparent 65%);
        }
        .char-img-grad-color {
          position: absolute; inset: 0; pointer-events: none;
          transition: opacity 0.55s ease;
        }
        .char-glow-ring {
          position: absolute; inset: 0; pointer-events: none;
          transition: opacity 0.4s ease;
        }

        /* info block */
        .char-info {
          position: absolute;
          bottom: 0; left: 0; right: 0;
          padding: 1.1rem 1.2rem 1.3rem;
          z-index: 5;
        }

        /* role */
        .char-role {
          display: flex; align-items: center; gap: 0.45rem;
          font-family: 'JetBrains Mono','Fira Code',monospace;
          font-size: 0.62rem; letter-spacing: 0.22em;
          text-transform: uppercase;
          margin: 0 0 0.35rem;
        }
        .char-role-dot {
          display: inline-block;
          width: 5px; height: 5px; border-radius: 50%;
          flex-shrink: 0;
          animation: charsDotPulse 2.5s ease-in-out infinite;
        }

        /* name */
        .char-name {
          font-size: clamp(1rem, 2.2vw, 1.4rem);
          font-weight: 800; color: #f0e8ff;
          letter-spacing: -0.015em; line-height: 1.1;
          margin: 0 0 0.6rem;
          text-shadow: 0 2px 20px rgba(0,0,0,0.8);
        }

        /* bar */
        .char-bar {
          height: 2px;
          transition:
            width 0.55s cubic-bezier(0.22,1,0.36,1),
            box-shadow 0.4s ease;
        }

        /* corner decoration */
        .char-corner-bl {
          position: absolute; bottom: 0; right: 0;
          width: 22px; height: 22px;
          border-bottom: 1.5px solid;
          border-right: 1.5px solid;
          pointer-events: none; z-index: 6;
          transition: border-color 0.4s;
        }

        /* ── CTA strip ── */
        .chars-cta-strip {
          display: flex; align-items: center; gap: 1.2rem;
          margin-top: 3rem; justify-content: center;
        }
        .chars-strip-line {
          flex: 1; max-width: 180px; height: 1px;
          background: linear-gradient(90deg, transparent, rgba(255,45,120,0.28));
        }
        .chars-strip-line--rev {
          background: linear-gradient(90deg, rgba(255,45,120,0.28), transparent);
        }
        .chars-strip-text {
          font-family: 'JetBrains Mono','Fira Code',monospace;
          font-size: 0.68rem; letter-spacing: 0.22em;
          color: rgba(255,45,120,0.52); white-space: nowrap; text-transform: uppercase;
        }

        /* ── Reduced motion ── */
        @media (prefers-reduced-motion: reduce) {
          .chars-orb, .chars-uline-dot, .char-role-dot,
          .char-top-line, .char-bar, .char-img { animation: none !important; transition: none !important; }
          .char-sparks { display: none; }
        }

        /* ── Mobile ── */
        @media (max-width: 768px) {
          .chars-section { padding: 4rem 0; }
          .chars-orb { filter: blur(55px) !important; }
          .char-info { padding: 0.8rem 0.9rem 1rem; }
          .char-name { font-size: 0.95rem; }
          .char-index { font-size: 0.56rem; padding: 0.18rem 0.45rem; }
        }
      `}</style>
    </section>
  );
}

export default Characters;
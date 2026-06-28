import { useEffect, useRef, useState, useCallback } from "react";

const specs = [
  {
    label: "პროცესორი",
    value: "Intel Core N4000",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="4" y="4" width="16" height="16" rx="2"/>
        <rect x="8" y="8" width="8" height="8" rx="1"/>
        <path d="M9 4V2M12 4V2M15 4V2M9 22v-2M12 22v-2M15 22v-2M4 9H2M4 12H2M4 15H2M22 9h-2M22 12h-2M22 15h-2"/>
      </svg>
    ),
  },
  {
    label: "ოპერატიული",
    value: "4 GB RAM",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="2" y="8" width="20" height="8" rx="2"/>
        <path d="M6 8V6M10 8V6M14 8V6M18 8V6M6 16v2M10 16v2M14 16v2M18 16v2"/>
      </svg>
    ),
  },
  {
    label: "ვიდეობარათი",
    value: "UHD 600",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="1" y="6" width="22" height="12" rx="2"/>
        <path d="M6 10h.01M10 10h.01M14 10h.01M18 10h.01M6 14h8"/>
      </svg>
    ),
  },
  {
    label: "თავისუფალი ადგილი",
    value: "4 GB",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <ellipse cx="12" cy="5" rx="9" ry="3"/>
        <path d="M3 5v14c0 1.66 4.03 3 9 3s9-1.34 9-3V5"/>
        <path d="M3 12c0 1.66 4.03 3 9 3s9-1.34 9-3"/>
      </svg>
    ),
  },
];

const POLYGONS = [
  { size: 200, top: "4%",  left: "1%",  rotate: 18,  opacity: 0.055, speed: 22 },
  { size: 130, top: "10%", left: "87%", rotate: -30, opacity: 0.045, speed: 28 },
  { size: 240, top: "52%", left: "-3%", rotate: 45,  opacity: 0.04,  speed: 35 },
  { size: 160, top: "68%", left: "84%", rotate: 12,  opacity: 0.05,  speed: 26 },
  { size: 95,  top: "33%", left: "91%", rotate: -55, opacity: 0.06,  speed: 20 },
  { size: 180, top: "78%", left: "42%", rotate: 30,  opacity: 0.035, speed: 40 },
  { size: 110, top: "18%", left: "48%", rotate: -20, opacity: 0.03,  speed: 32 },
  { size: 75,  top: "46%", left: "22%", rotate: 60,  opacity: 0.065, speed: 18 },
];

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
      { threshold: 0.15, ...options }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return [ref, inView];
}

// ─── Animated wrapper ─────────────────────────────────────────────────────────
function Reveal({ children, delay = 0, direction = "up", className = "" }) {
  const [ref, inView] = useInView();

  const translate = {
    up:    "translateY(36px)",
    left:  "translateX(-40px)",
    right: "translateX(40px)",
    fade:  "translateY(12px)",
  }[direction] ?? "translateY(36px)";

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity:    inView ? 1 : 0,
        transform:  inView ? "none" : translate,
        transition: `opacity 0.65s cubic-bezier(0.22,1,0.36,1) ${delay}ms,
                     transform 0.65s cubic-bezier(0.22,1,0.36,1) ${delay}ms`,
        willChange: "opacity, transform",
      }}
    >
      {children}
    </div>
  );
}

// ─── Staggered list wrapper ───────────────────────────────────────────────────
function StaggerList({ children, baseDelay = 0, stagger = 90, direction = "left", className = "" }) {
  return (
    <div className={className}>
      {children.map((child, i) => (
        <Reveal key={i} delay={baseDelay + i * stagger} direction={direction}>
          {child}
        </Reveal>
      ))}
    </div>
  );
}

function Requirements() {
  const [downloaded, setDownloaded] = useState(false);
  const particlesRef = useRef(null);

  useEffect(() => {
    const container = particlesRef.current;
    if (!container) return;
    container.innerHTML = "";
    const count = 90;
    for (let i = 0; i < count; i++) {
      const p = document.createElement("div");
      p.className = "feature-particle";
      p.style.left = Math.random() * 100 + "%";
      p.style.bottom = "-10px";
      p.style.animationDuration = 8 + Math.random() * 10 + "s";
      p.style.animationDelay = Math.random() * 10 + "s";
      container.appendChild(p);
    }
  }, []);

  const handleDownload = () => {
    setDownloaded(true);
    setTimeout(() => {
      window.open(
        "https://download1077.mediafire.com/7lig3d2h6legdBnSmlsuaKyaumxwbEVAytFCDp6CFYtITxjOR9zezkUx3Jtc3-v3ua3xIRaHuWAFmnrTYMld1SX2mbc6RVW4YpISD9CPsk1EsOED0IoevkiHJ0z7kPWdkF76nzN5djCfiP1k1C4oFzCs0W9gMR9lvhRnGriWN6w/x3vhybbggetsnq5/GeorgianRp-win32-x64.exe",
        "_blank",
        "noopener,noreferrer"
      );
      setTimeout(() => setDownloaded(false), 3000);
    }, 50);
  };

  

  return (
    <section id="requirements" className="relative overflow-hidden px-4 sm:px-6 py-12 sm:py-16 md:py-20 lg:py-28">

      {/* ─── Polygon background ─── */}
      {POLYGONS.map((pg, i) => (
        <div
          key={i}
          className="pointer-events-none absolute z-0 hidden xl:block"
          style={{
            top: pg.top,
            left: pg.left,
            width: pg.size,
            height: pg.size,
            opacity: pg.opacity,
            animation: `poly-float ${pg.speed}s ease-in-out infinite`,
            animationDelay: `${i * 1.3}s`,
          }}
        >
          <svg width={pg.size} height={pg.size} viewBox="0 0 100 100" style={{ transform: `rotate(${pg.rotate}deg)` }}>
            <polygon points="50,2 93,25 93,75 50,98 7,75 7,25" fill="none" stroke="rgba(255,45,120,1)" strokeWidth="1.2" />
            <polygon points="50,16 80,33 80,67 50,84 20,67 20,33" fill="none" stroke="rgba(255,45,120,0.5)" strokeWidth="0.7" />
            <line x1="50" y1="16" x2="50" y2="84" stroke="rgba(255,45,120,0.25)" strokeWidth="0.5"/>
            <line x1="7"  y1="50" x2="93" y2="50" stroke="rgba(255,45,120,0.25)" strokeWidth="0.5"/>
          </svg>
        </div>
      ))}

      {/* ─── Background ─── */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-background/80" />
        <div className="absolute inset-0 bg-grid opacity-30" />
        <div className="absolute inset-0" style={{
          background: "radial-gradient(ellipse 70% 50% at 30% 20%, rgba(255,45,120,0.08) 0%, transparent 60%)"
        }} />
        <div className="absolute inset-0" style={{
          background: "radial-gradient(ellipse 50% 40% at 80% 80%, rgba(200,30,93,0.06) 0%, transparent 50%)"
        }} />
      </div>

      {/* ─── Particle effect ─── */}
      <div ref={particlesRef} className="feature-particles absolute inset-0 z-0 pointer-events-none" />

      {/* ─── Decorative glow dots ─── */}
      <div className="req-grid-bg" aria-hidden="true">
  <div className="req-grid-h" />
  <div className="req-grid-v" />
</div>

{/* ── Scanlines ── */}
<div className="req-scanlines" aria-hidden="true" />

      {/* ─── Content ─── */}
      <div className="relative z-10 mx-auto max-w-4xl lg:max-w-6xl">

        {/* ─── Header ─── */}

<header className="req-header">
  <Reveal direction="up" delay={0}>
    <p className="req-eyebrow">
      <span className="eyebrow-slash">//</span> 03 — SYSTEM
    </p>
  </Reveal>

  <Reveal direction="up" delay={110}>
    <h2 className="req-title">
      სისტემური{" "}
      <span className="req-title-accent">მოთხოვნები</span>
    </h2>
  </Reveal>

  <Reveal direction="up" delay={200}>
    <div className="req-underline" aria-hidden="true">
      <div className="req-uline-bar" />
      <div className="req-uline-dot" />
    </div>
  </Reveal>

  <Reveal direction="up" delay={250}>
    <p className="req-subtitle">
      დარწმუნდით, რომ თქვენი კომპიუტერი შეესაბამება{" "}
      <span className="req-subtitle-acc">მინიმალური მოთხოვნების სტაბილური თამაშისთვის.</span>
    </p>
  </Reveal>
</header>

        {/* ─── All cards centered on mobile, side by side on desktop ─── */}
        <div className="flex flex-col lg:grid lg:grid-cols-5 gap-4 sm:gap-6 lg:gap-8 items-center">

          {/* ─── Spec cards — centered on mobile ─── */}
          <StaggerList
            baseDelay={200}
            stagger={80}
            direction="left"
            className="w-full max-w-md lg:max-w-none lg:col-span-3 space-y-2.5 sm:space-y-3"
          >
            {specs.map((s, i) => (
              <div key={i} className="group flex items-center gap-3 sm:gap-4 p-3 sm:p-4 lg:p-5 rounded-xl border border-border/60 bg-white/5 backdrop-blur-sm transition-all duration-300 hover:translate-x-1 sm:hover:translate-x-2 hover:border-(--pink)/40 hover:bg-(--pink)/5 hover:shadow-[0_0_30px_rgba(255,45,120,0.08)]">
                <div className="shrink-0 w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-lg bg-(--pink)/10 border border-(--pink)/20 text-pink flex items-center justify-center transition-all duration-300 group-hover:bg-(--pink)/20 group-hover:border-(--pink)/40 group-hover:shadow-[0_0_20px_rgba(255,45,120,0.15)]">
                  {s.icon}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-[0.5rem] sm:text-[0.6rem] font-bold uppercase tracking-[0.15em] sm:tracking-[0.2em] text-(--pink)/80">{s.label}</div>
                  <div className="text-sm sm:text-base lg:text-lg font-bold text-white truncate">{s.value}</div>
                </div>
              </div>
            ))}
          </StaggerList>

          {/* ─── Right column — centered on mobile ─── */}
          <div className="w-full max-w-md lg:max-w-none lg:col-span-2 space-y-3 sm:space-y-4">

            {/* Info card */}
            <Reveal direction="right" delay={300}>
              <div className="relative rounded-xl border border-border/60 bg-white/5 backdrop-blur-sm p-4 sm:p-5 transition-all duration-300 hover:border-(--pink)/30 hover:shadow-[0_0_40px_rgba(255,45,120,0.06)]">
                <div className="absolute -top-px -left-px w-3 h-3 sm:w-4 sm:h-4 border-t-2 border-l-2 border-(--pink)/40 rounded-tl" />
                <div className="absolute -top-px -right-px w-3 h-3 sm:w-4 sm:h-4 border-t-2 border-r-2 border-(--pink)/40 rounded-tr" />
                <div className="absolute -bottom-px -left-px w-3 h-3 sm:w-4 sm:h-4 border-b-2 border-l-2 border-(--pink)/40 rounded-bl" />
                <div className="absolute -bottom-px -right-px w-3 h-3 sm:w-4 sm:h-4 border-b-2 border-r-2 border-(--pink)/40 rounded-br" />
                <div className="text-[0.5rem] sm:text-[0.6rem] font-bold uppercase tracking-[0.15em] sm:tracking-[0.2em] text-muted-foreground/50 mb-3 sm:mb-4">ლაუნჩერის შესახებ</div>
                <div className="space-y-2 sm:space-y-3">
                  {[["ვერსია","1.0.0"],["ზომა","96.8 MB"],["პლატფორმა","Windows 7+"],["SA:MP","0.3.7"]].map(([k,v], idx) => (
                    <div key={k} className="flex justify-between items-center py-1.5 border-b border-border/40 last:border-0">
                      <span className="text-[0.65rem] sm:text-xs text-muted-foreground/50 font-medium">{k}</span>
                      <span className="text-xs sm:text-sm font-bold text-white">{v}</span>
                    </div>
                  ))}
                </div>
              </div>
            </Reveal>

            {/* Download button - Centered on all screen sizes except desktop */}
            <Reveal direction="right" delay={440}>
              <button
                onClick={handleDownload}
                className="relative w-full group cursor-pointer overflow-hidden rounded-xl bg-linear-to-r from-pink to-(--pink-deep) p-0.5 transition-all duration-300 hover:shadow-[0_0_40px_rgba(255,45,120,0.3)] active:scale-[0.98]"
              >
                <div className="relative flex items-center gap-3 sm:gap-4 rounded-xl bg-(--pink)/10 px-4 sm:px-5 py-3 sm:py-4 backdrop-blur-sm transition-all duration-300 group-hover:bg-(--pink)/5">
                  <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-linear-to-r from-transparent via-white/15 to-transparent" />
                  
                  {/* Icon container */}
                  <div className="shrink-0 w-10 h-10 sm:w-11 sm:h-11 rounded-lg bg-white/20 flex items-center justify-center text-white transition-all duration-300 group-hover:scale-110 group-hover:bg-white/30">
                    {downloaded ? (
                      <svg className="w-4 h-4 sm:w-5 sm:h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    ) : (
                      <svg className="w-4 h-4 sm:w-5 sm:h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M12 3v14m0 0l-5-5m5 5l5-5M3 21h18" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                  </div>
                  
                  {/* Text content */}
                  <div className="text-left flex-1 min-w-0">
                    <div className="text-xs sm:text-sm lg:text-base font-bold text-white tracking-wide truncate">
                      {downloaded ? "იტვირთება..." : "გადმოწერე ლაუნჩერი"}
                    </div>
                    <div className="text-[0.5rem] sm:text-[0.6rem] text-white/70 font-medium">
                      ვერსია 1.0.0 · ზომა 96.8 MB
                    </div>
                  </div>
                  
                  {/* Arrow indicator */}
                  {!downloaded && (
                    <div className="shrink-0 text-white/40 group-hover:text-white/70 transition-all duration-300 group-hover:translate-x-1">
                      <svg className="w-4 h-4 sm:w-5 sm:h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  )}
                  
                  {/* Pulse ring */}
                  {!downloaded && (
                    <span className="absolute inset-0 rounded-xl animate-ping-slow border-2 border-(--pink)/40 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  )}
                </div>
              </button>
            </Reveal>

            {/* Fine print */}
            <Reveal direction="fade" delay={540}>
              <p className="text-[0.5rem] sm:text-[0.6rem] text-center text-muted-foreground/30 leading-relaxed px-2">
                საჭიროა SA:MP 0.3.7 კლიენტი და GTA San Andreas
              </p>
            </Reveal>

          </div>
        </div>
        
      </div>

      {/* Custom styles for animations */}
      <style>{`
        @keyframes poly-float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-12px) rotate(3deg); }
        }
        
        @keyframes ping-slow {
          0% { transform: scale(1); opacity: 1; }
          100% { transform: scale(1.1); opacity: 0; }
        }
        
        .animate-ping-slow {
          animation: ping-slow 2s cubic-bezier(0, 0, 0.2, 1) infinite;
        }

        .req-header { 
  text-align: center; 
  margin-bottom: 4rem; 
}

.req-eyebrow {
  font-family: 'JetBrains Mono','Fira Code',monospace;
  font-size: 0.68rem; 
  letter-spacing: 0.32em;
  color: #ff2d78; 
  margin: 0 0 0.9rem;
  text-shadow: 0 0 12px rgba(255,45,120,0.65);
}
.eyebrow-slash { 
  opacity: 0.45; 
  margin-right: 0.3em; 
}

.req-title {
  font-size: clamp(2rem, 4.5vw, 3.4rem);
  font-weight: 800; 
  color: #f0e8ff;
  line-height: 1.1; 
  letter-spacing: -0.025em; 
  margin: 0;
  text-shadow: 0 2px 40px rgba(255,45,120,0.12);
}
.req-title-accent {
  color: #ff2d78;
  text-shadow: 0 0 20px rgba(255,45,120,0.8), 
               0 0 60px rgba(255,45,120,0.35), 
               0 0 120px rgba(255,45,120,0.15);
}

.req-underline {
  display: flex; 
  align-items: center; 
  gap: 0.5rem;
  justify-content: center; 
  margin-top: 1rem;
}
.req-uline-bar {
  height: 2px; 
  width: 4.5rem;
  background: linear-gradient(90deg, rgba(255,45,120,0.1), #ff2d78, rgba(255,45,120,0.1));
  box-shadow: 0 0 8px rgba(255,45,120,0.5);
}
.req-uline-dot {
  width: 5px; 
  height: 5px; 
  border-radius: 50%; 
  background: #ff2d78;
  box-shadow: 0 0 10px rgba(255,45,120,1), 
              0 0 20px rgba(255,45,120,0.6);
  animation: reqDotPulse 2s ease-in-out infinite;
}

.req-grid-bg { 
  position: absolute; 
  inset: 0; 
  z-index: 0; 
  pointer-events: none; 
}
.req-grid-h {
  position: absolute; 
  inset: 0;
  background-image: repeating-linear-gradient(
    0deg, transparent, transparent 79px,
    rgba(255,45,120,0.042) 79px, rgba(255,45,120,0.042) 80px
  );
}
.req-grid-v {
  position: absolute; 
  inset: 0;
  background-image: repeating-linear-gradient(
    90deg, transparent, transparent 79px,
    rgba(255,45,120,0.028) 79px, rgba(255,45,120,0.028) 80px
  );
}

/* ── Scanlines ── */
.req-scanlines {
  position: absolute; 
  inset: 0; 
  z-index: 1; 
  pointer-events: none;
  background: repeating-linear-gradient(
    to bottom, transparent 0px, transparent 2px,
    rgba(0,0,0,0.16) 2px, rgba(0,0,0,0.16) 4px
  );
  opacity: 0.3;
}

/* ── Polygons ── */
.req-polygon {
  position: absolute; 
  pointer-events: none; 
  z-index: 0;
}
@keyframes reqPolyFloat {
  0%,100% { transform: translateY(0) rotate(0deg); }
  50%      { transform: translateY(-14px) rotate(4deg); }
}

/* ── Orbs ── */
.req-orb { 
  position: absolute; 
  border-radius: 50%; 
  pointer-events: none; 
  z-index: 0; 
}
.req-orb--tl {
  top: -8%; 
  left: -6%; 
  width: 480px; 
  height: 480px;
  background: radial-gradient(circle, rgba(255,20,100,0.18) 0%, rgba(180,0,80,0.06) 55%, transparent 100%);
  filter: blur(85px);
  animation: reqOrbDrift 16s ease-in-out infinite alternate;
}
.req-orb--br {
  bottom: -10%; 
  right: -7%; 
  width: 440px; 
  height: 440px;
  background: radial-gradient(circle, rgba(140,0,200,0.15) 0%, rgba(80,0,140,0.05) 55%, transparent 100%);
  filter: blur(85px);
  animation: reqOrbDrift 13s ease-in-out infinite alternate;
  animation-delay: -5s;
}
.req-orb--mid {
  top: 42%; 
  left: 48%; 
  transform: translate(-50%,-50%);
  width: 600px; 
  height: 600px;
  background: radial-gradient(circle, rgba(255,20,90,0.05) 0%, transparent 65%);
  filter: blur(110px);
  animation: reqOrbPulse 20s ease-in-out infinite;
}
@keyframes reqOrbDrift {
  from { transform: translate(0,0) scale(1); }
  to   { transform: translate(28px,-22px) scale(1.07); }
}
@keyframes reqOrbPulse {
  0%,100% { opacity:0.5; transform:translate(-50%,-50%) scale(1); }
  50%      { opacity:1;   transform:translate(-50%,-50%) scale(1.1); }
}

/* ── Neon dividers ── */
.req-neon-div {
  position: absolute; 
  left: 0; 
  right: 0; 
  height: 1px;
  z-index: 2; 
  pointer-events: none;
}
.req-neon-div--top {
  top: 0;
  background: linear-gradient(90deg,
    transparent 0%, rgba(255,45,120,0.14) 20%,
    rgba(255,45,120,0.62) 50%, rgba(255,45,120,0.14) 80%, transparent 100%
  );
  box-shadow: 0 0 14px 3px rgba(255,45,120,0.28);
}
.req-neon-div--bottom {
  bottom: 0;
  background: linear-gradient(90deg,
    transparent 0%, rgba(255,45,120,0.1) 30%,
    rgba(255,45,120,0.38) 50%, rgba(255,45,120,0.1) 70%, transparent 100%
  );
  box-shadow: 0 0 8px 2px rgba(255,45,120,0.18);
}

/* ── Sparks ── */
.req-sparks {
  position: absolute; 
  inset: 0; 
  overflow: hidden;
  pointer-events: none; 
  z-index: 1;
}
@keyframes reqSparkRise {
  0%   { transform:translateY(0) translateX(0) scale(0.12); opacity:0; }
  6%   { opacity:0.9; }
  50%  { opacity:0.7; }
  85%  { opacity:0.3; }
  100% { transform:translateY(-110vh) translateX(var(--sx,0)) scale(0.04); opacity:0; }
}
@keyframes reqSparkTwinkle {
  0%,100% { opacity:0.3; transform:scale(0.6); }
  50%      { opacity:1;   transform:scale(1.5); }
}

/* ── Section container ── */
.req-section {
  position: relative;
  padding: 6.5rem 0;
  overflow: hidden;
  background: #06030d;
  isolation: isolate;
}

/* ── Inner container ── */
.req-inner {
  position: relative; 
  z-index: 10;
  max-width: 72rem; 
  margin: 0 auto; 
  padding: 0 1.5rem;
}

/* ── Responsive ── */
@media (max-width: 768px) {
  .req-section { padding: 4rem 0; }
  .req-orb { filter: blur(55px) !important; }
  .req-polygon { display: none; }
}

@media (prefers-reduced-motion: reduce) {
  .req-orb, 
  .req-uline-dot,
  .req-polygon { 
    animation: none !important; 
    transition: none !important; 
  }
  .req-sparks { display: none; }
}

@keyframes reqDotPulse {
  0%,100% { opacity:1; transform:scale(1); }
  50%      { opacity:0.35; transform:scale(0.5); }
}

.req-subtitle {
  margin: 1rem auto 0; 
  max-width: 32rem;
  font-size: 0.88rem; 
  line-height: 1.78;
  color: rgba(200,180,220,0.6);
}
.req-subtitle-acc { 
  color: rgba(255,140,185,0.82); 
}

        .feature-particle {
          position: absolute;
          width: 3px;
          height: 3px;
          background: rgba(255,45,120,0.15);
          border-radius: 50%;
          animation: particle-float linear infinite;
          pointer-events: none;
        }

        @keyframes particle-float {
          0% {
            transform: translateY(0) scale(1);
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          100% {
            transform: translateY(-120vh) scale(0);
            opacity: 0;
          }
        }
      `}</style>
    </section>
  );
}

export default Requirements;
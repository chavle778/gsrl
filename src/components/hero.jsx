import { useState, useEffect } from "react";
import { SERVER_IP } from "./constants";
import '../index.css'
function Hero() {
  const [copied, setCopied] = useState(false);
  const [mounted, setMounted] = useState(false);
  

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 60);
    return () => clearTimeout(t);
  }, []);

  const copy = () => {
    navigator.clipboard?.writeText(SERVER_IP);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <section
      id="home"
      className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 sm:px-6 pt-28 sm:pt-32 pb-16 sm:pb-20"
    >
      {/* ── Video background ── */}
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        <video
          className="absolute left-1/2 top-1/2 h-[120%] w-[177.78vh] min-w-full min-h-full -translate-x-1/2 -translate-y-1/2 object-cover"
          autoPlay muted loop playsInline
        >
          <source src="/mainVideo.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-background/70" />
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(10,10,15,0.4) 0%, rgba(10,10,15,0.7) 60%, var(--background) 100%)" }} />
        <div className="absolute inset-0 bg-grid opacity-40" />
      </div>

      {/* ── VERTICAL GLOW LINE (უცვლელი) ── */}
      {mounted && (
        <div className="pointer-events-none absolute inset-0 z-20 overflow-hidden">
          <div style={{
            position: "absolute",
            left: "50%",
            width: "1px",
            height: "160px",
            transform: "translateX(-50%)",
            background: "linear-gradient(180deg, transparent 0%, rgba(255,45,120,0.9) 30%, rgba(255,95,160,1) 50%, rgba(255,45,120,0.9) 70%, transparent 100%)",
            boxShadow: "0 0 6px 2px rgba(255,45,120,0.6)",
            animation: "verticalDrop 1.6s cubic-bezier(0.4,0,0.8,1) 0.2s forwards",
            opacity: 0,
          }} />
          <div style={{
            position: "absolute",
            left: "50%",
            width: "180px",
            height: "120px",
            transform: "translateX(-50%)",
            background: "radial-gradient(ellipse 50% 100% at 50% 0%, rgba(255,45,120,0.22) 0%, rgba(255,45,120,0.08) 50%, transparent 100%)",
            animation: "trailDrop 1.6s cubic-bezier(0.4,0,0.8,1) 0.2s forwards",
            opacity: 0,
          }} />
          <div style={{
            position: "absolute",
            top: 0,
            left: "50%",
            transform: "translateX(-50%)",
            width: "500px",
            height: "180px",
            background: "radial-gradient(ellipse 80% 100% at 50% 0%, rgba(255,45,120,0.12) 0%, rgba(255,45,120,0.04) 50%, transparent 100%)",
            animation: "topGlowSettle 4s ease-in-out 1.8s infinite",
            opacity: 0,
          }} />
        </div>
      )}

      {/* ── AURA GLOW (უცვლელი) ── */}
      {mounted && (
        <div
          className="pointer-events-none absolute left-1/2 top-1/2 z-0 -translate-x-1/2 -translate-y-1/2"
          style={{
            width: "min(90vw, 900px)",
            height: "400px",
            background: "radial-gradient(ellipse 60% 60% at 50% 50%, rgba(255,45,120,0.25) 0%, rgba(255,45,120,0.08) 40%, transparent 70%)",
            filter: "blur(20px)",
            animation: "auraPulse 8s ease-in-out infinite",
          }}
        />
      )}

      {/* ── Content ── */}
      <div className="relative z-10 mx-auto max-w-5xl text-center">

        {/* Badge */}
        <div
          className="mb-6 sm:mb-8 inline-flex items-center gap-2 rounded-full border border-pink/30 bg-pink/5 px-3 py-1 sm:px-4 sm:py-1.5 text-[10px] sm:text-xs font-semibold uppercase tracking-widest text-pink backdrop-blur"
          style={{
            opacity: mounted ? 1 : 0,
            transform: mounted ? "translateY(0)" : "translateY(-14px)",
            transition: "opacity 0.6s ease 0.2s, transform 0.7s cubic-bezier(0.22,1,0.36,1) 0.2s",
          }}
        >
          <span className="relative flex h-1.5 w-1.5 sm:h-2 sm:w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-pink opacity-75" />
            <span className="relative inline-flex h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-pink" />
          </span>
          სერვერი ონლაინ • SA:MP 0.3.7
        </div>

        {/* H1 */}
       <h1 className="font-display text-5xl sm:text-7xl md:text-8xl font-black leading-[0.95] tracking-tight">

  {/* GEORGIAN */}
  <span
    className="block"
    style={{
      opacity: mounted ? 1 : 0,
      transform: mounted ? "translateY(0)" : "translateY(26px)",
      transition: "opacity 0.75s ease 0.32s, transform 0.75s cubic-bezier(0.22,1,0.36,1) 0.32s",
      animation: mounted
        ? "georgianBreathe 10s ease-in-out 3s infinite"
        : "none",
      willChange: "transform, opacity, text-shadow",
      fontFamily: `"Orbitron", "Noto Sans Georgian", sans-serif`
    }}
  >
    GEORGIAN
  </span>

  {/* ── SAMP ── */}
  <span
    className="block text-gradient-samp"
    style={{
      opacity: mounted ? 1 : 0,
      transform: mounted ? "translateY(0)" : "translateY(30px)",
      transition: "opacity 0.75s ease 0.40s, transform 0.75s cubic-bezier(0.22,1,0.36,1) 0.40s",
      fontFamily: `"Orbitron", "Noto Sans Georgian", sans-serif`,
      fontSize: "clamp(2.5rem, 5vw, 4.5rem)",
      letterSpacing: "0.15em",
      background: "linear-gradient(135deg, #ff2d78, #ff5ea1, #c91e5e)",
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent",
      backgroundClip: "text",
      filter: "drop-shadow(0 0 40px rgba(255, 107, 0, 0.3))",
    }}
  >
    SAMP
  </span>

  {/* ── Horizontal divider ── */}
  <div
    className="hero-divider my-4 sm:my-5 mx-auto"
    style={{
      opacity: mounted ? 1 : 0,
      transform: mounted ? "scaleX(1)" : "scaleX(0)",
      transition: "opacity 0.8s ease 0.5s, transform 0.8s cubic-bezier(0.22,1,0.36,1) 0.5s",
    }}
  />

  {/* REAL LIFE */}
  <span
    className="block text-gradient"
    style={{
      opacity: mounted ? 1 : 0,
      transform: mounted ? "translateY(0)" : "translateY(34px)",
      transition: "opacity 0.75s ease 0.48s, transform 0.75s cubic-bezier(0.22,1,0.36,1) 0.48s",
      fontFamily: `"Orbitron", "Noto Sans Georgian", sans-serif`
    }}
  >
    REAL LIFE
  </span>
</h1>

        {/* Subtitle */}
        <p
          className="mx-auto mt-6 sm:mt-8 max-w-2xl text-base sm:text-lg md:text-xl text-muted-foreground"
          style={{
            opacity: mounted ? 1 : 0,
            transform: mounted ? "translateY(0)" : "translateY(16px)",
            transition: "opacity 0.6s ease 0.62s, transform 0.6s cubic-bezier(0.22,1,0.36,1) 0.62s",
          }}
        >
          დაიწყე ახალი ცხოვრება{" "}
          <span>ლოს სანტოსის</span> ქუჩებში.
          ყველაფერი შენს ხელშია — ფული, ძალაუფლება, რეპუტაცია.
        </p>

        {/* CTAs */}
        <div
          className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4"
          style={{
            opacity: mounted ? 1 : 0,
            transform: mounted ? "translateY(0)" : "translateY(16px)",
            transition: "opacity 0.6s ease 0.76s, transform 0.6s cubic-bezier(0.22,1,0.36,1) 0.76s",
          }}
        >
          <a href="https://download1077.mediafire.com/7lig3d2h6legdBnSmlsuaKyaumxwbEVAytFCDp6CFYtITxjOR9zezkUx3Jtc3-v3ua3xIRaHuWAFmnrTYMld1SX2mbc6RVW4YpISD9CPsk1EsOED0IoevkiHJ0z7kPWdkF76nzN5djCfiP1k1C4oFzCs0W9gMR9lvhRnGriWN6w/x3vhybbggetsnq5/GeorgianRp-win32-x64.exe" target="blank" className="btn-neon clip-angled inline-flex items-center gap-2 sm:gap-3 px-5 sm:px-8 py-3 sm:py-4 text-xs sm:text-sm font-bold">
            <span>გადმოწერე ლაუნჩერი</span>
            <svg className="h-3 w-3 sm:h-4 sm:w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M12 3v14m0 0l-5-5m5 5l5-5M5 21h14" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </a>
          <a href="#features" className="btn-outline-neon clip-angled px-5 sm:px-8 py-3 sm:py-4 text-xs sm:text-sm font-bold">გაიგე მეტი</a>
        </div>

        {/* Server IP */}
        <div className="flex items-center justify-center mt-10">
        <button onClick={copy} className="group cursor-pointer relative flex items-center gap-3 px-5 py-4 bg-(--surface)/80 backdrop-blur border border-border hover:border-(--neon)/60 transition-colors"
        onMouseEnter={(e) => {
          e.currentTarget.style.clipPath = "polygon(15px 0%, 100% 0%, calc(100% - 10px) 100%, 0% 100%)";
  }}
 
        >
          <span className="text-xs uppercase tracking-widest text-muted-foreground">IP</span>
          <span className="font-mono text-foreground">{SERVER_IP}</span>
          <span className="text-neon text-sm font-display tracking-widest ml-2">
            {copied ? "✓ COPIED" : "COPY"}
            </span>
            </button>
        </div>
        </div>

      {/* Scroll arrow */} 
      <div
        className="absolute bottom-6 sm:bottom-8 left-1/2 -translate-x-1/2 animate-float text-pink/60"
        style={{ opacity: mounted ? 1 : 0, transition: "opacity 0.8s ease 1.1s" }}
      >
        <svg className="h-5 w-5 sm:h-6 sm:w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 5v14m0 0l-6-6m6 6l6-6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      
    </section>
  );
}

export default Hero;
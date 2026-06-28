import { useState } from "react";
import { SERVER_IP } from "./constants";

function Footer() {
  const [copied, setCopied] = useState(false);

  const copyIP = () => {
    navigator.clipboard.writeText(SERVER_IP).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const NAV = [
    { label: "თამაში",      href: "#features" },
    { label: "ფრაქციები",   href: "#characters" },
    { label: "მოთხოვნები",  href: "#requirements" },
    { label: "გადმოწერა",   href: "#download" },
  ];

  const SOCIALS = [
    {
      label: "Discord",
      href: "https://discord.gg/wcATT3eG",
      icon: (
        <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true">
          <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057c.002.022.015.043.03.056a19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z"/>
        </svg>
      ),
    },
    {
      label: "YouTube",
      href: "https://www.youtube.com/@GeorgianSAMPRL",
      icon: (
        <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true">
          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
        </svg>
      ),
    },
    {
      label: "TikTok",
      href: "https://www.tiktok.com/@georgiansamprlproject",
      icon: (
        <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true">
          <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.79 1.54V6.79a4.85 4.85 0 0 1-1.02-.1z"/>
        </svg>
      ),
    },
  ];

  return (
    <footer className="grl-footer">
      {/* top neon divider */}
      <div className="grl-footer__divider" aria-hidden="true" />

      {/* subtle grid bg */}
      <div className="grl-footer__grid" aria-hidden="true" />

      {/* orb */}
      <div className="grl-footer__orb" aria-hidden="true" />

      <div className="grl-footer__inner">

        {/* ── Col 1 : Brand ── */}
        <div className="grl-footer__brand">
          <a href="#" className="grl-footer__logo" aria-label="Georgian Real Life — Home">
            <span className="logo-text">GEORGIAN SAMP</span>
            <span className="logo-accent">REAL LIFE</span>
          </a>

          <div className="logo-underline" aria-hidden="true">
            <div className="logo-underline__bar" />
            <div className="logo-underline__dot" />
          </div>

          <p className="grl-footer__tagline">
            ქართული RP სერვერი ლოს სანტოსში.<br />
            შექმნილია მოთამაშეების მიერ — მოთამაშეებისთვის.
          </p>

          {/* Social icons */}
          <div className="grl-footer__socials">
            {SOCIALS.map(({ label, href, icon }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="social-icon-box"
                aria-label={label}
                title={label}
              >
                {icon}
                <div className="social-corner-cut" aria-hidden="true" />
              </a>
            ))}
          </div>
        </div>

        {/* ── Col 2 : Nav ── */}
        <div className="grl-footer__nav-col">
          <p className="grl-footer__col-heading">
            <span className="col-heading__slash">//</span> NAVIGATE
          </p>
          <ul className="grl-footer__nav-list">
            {NAV.map(({ label, href }) => (
              <li key={href}>
                <a href={href} className="grl-footer__nav-link">
                  <span className="nav-link__arrow" aria-hidden="true">›</span>
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* ── Col 3 : Server IP ── */}
        <div className="grl-footer__server-col">
          <p className="grl-footer__col-heading">
            <span className="col-heading__slash">//</span> SERVER IP
          </p>

          <button
            className={`grl-ip-box ${copied ? "grl-ip-box--copied" : ""}`}
            onClick={copyIP}
            aria-label="Copy server IP"
          >
            <span className="grl-ip-box__corner" aria-hidden="true" />
            <span className="grl-ip-box__label">
              {copied ? "COPIED!" : "CLICK TO COPY"}
            </span>
            <span className="grl-ip-box__ip">{SERVER_IP}</span>
            <span className="grl-ip-box__icon" aria-hidden="true">
              {copied ? (
                <svg viewBox="0 0 16 16" width="13" height="13" fill="none">
                  <path d="M3 8l3.5 3.5L13 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              ) : (
                <svg viewBox="0 0 16 16" width="13" height="13" fill="none">
                  <rect x="5" y="5" width="8" height="9" rx="1.2" stroke="currentColor" strokeWidth="1.5"/>
                  <path d="M11 5V3.8A1.2 1.2 0 0 0 9.8 2.6H3.8A1.2 1.2 0 0 0 2.6 3.8v6A1.2 1.2 0 0 0 3.8 11H5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              )}
            </span>
          </button>

          <div className="grl-footer__status">
            <span className="status-dot" aria-hidden="true" />
            <span className="status-text">სერვერი ონლაინია</span>
          </div>
        </div>

      </div>

      {/* ── Bottom bar ── */}
      <div className="grl-footer__bottom">
        <div className="grl-footer__bottom-inner">
          <div className="bottom-sparks" aria-hidden="true">
            <span className="bottom-spark" />
            <span className="bottom-spark bottom-spark--alt" />
            <span className="bottom-spark" />
          </div>
          <p className="grl-footer__copy">
            © {new Date().getFullYear()} Georgian Samp Real Life. All rights reserved.
          </p>
          <div className="bottom-sparks" aria-hidden="true">
            <span className="bottom-spark bottom-spark--alt" />
            <span className="bottom-spark" />
            <span className="bottom-spark bottom-spark--alt" />
          </div>
        </div>
      </div>

      <style>{`
        /* ═══════════════════════════════════════════
           GRL FOOTER — dark neon / cyberpunk
           ═══════════════════════════════════════════ */

        .grl-footer {
          position: relative;
          background: #05020b;
          overflow: hidden;
          isolation: isolate;
        }

        /* top neon line */
        .grl-footer__divider {
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 1px;
          background: linear-gradient(
            90deg,
            transparent 0%,
            rgba(255,45,120,0.12) 20%,
            rgba(255,45,120,0.55) 50%,
            rgba(255,45,120,0.12) 80%,
            transparent 100%
          );
          box-shadow: 0 0 14px 2px rgba(255,45,120,0.25);
        }

        /* subtle grid */
        .grl-footer__grid {
          position: absolute;
          inset: 0;
          background-image:
            repeating-linear-gradient(0deg, transparent, transparent 59px, rgba(255,45,120,0.03) 59px, rgba(255,45,120,0.03) 60px),
            repeating-linear-gradient(90deg, transparent, transparent 59px, rgba(255,45,120,0.02) 59px, rgba(255,45,120,0.02) 60px);
          pointer-events: none;
          z-index: 0;
        }

        /* bg orb */ 
        .grl-footer__orb {
          position: absolute;
          bottom: -40%;
          left: 50%;
          transform: translateX(-50%);
          width: 700px;
          height: 400px;
          background: radial-gradient(ellipse, rgba(255,20,90,0.07) 0%, transparent 65%);
          filter: blur(80px);
          pointer-events: none;
          z-index: 0;
        }

        /* inner */
        .grl-footer__inner {
          position: relative;
          z-index: 1;
          max-width: 88rem;
          margin: 0 auto;
          padding: 4rem 2rem 3rem;
          display: grid;
          grid-template-columns: 1.6fr 1fr 1.2fr;
          gap: 3rem;
          align-items: start;
        }
        @media (max-width: 900px) {
          .grl-footer__inner {
            grid-template-columns: 1fr 1fr;
            gap: 2.5rem;
          }
          .grl-footer__brand { grid-column: 1 / -1; }
        }
        @media (max-width: 560px) {
          .grl-footer__inner {
            grid-template-columns: 1fr;
            padding: 3rem 1.25rem 2rem;
          }
        }

        /* ── Brand col ── */
        .grl-footer__logo {
          display: inline-flex;
          align-items: baseline;
          gap: 0.55rem;
          text-decoration: none;
          font-weight: 800;
          font-size: 1.5rem;
          letter-spacing: -0.01em;
          line-height: 1;
        }
        .logo-text {
          color: #ede5ff;
          letter-spacing: 0.04em;
        }
        .logo-accent {
          background: linear-gradient(135deg, #ff2d78 0%, #ff80b5 55%, #c81e5d 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          letter-spacing: 0.04em;
          filter: drop-shadow(0 0 10px rgba(255,45,120,0.45));
        }

        .logo-underline {
          display: flex;
          align-items: center;
          gap: 0.45rem;
          margin-top: 0.6rem;
          margin-bottom: 1.1rem;
        }
        .logo-underline__bar {
          height: 1.5px;
          width: 3.5rem;
          background: linear-gradient(90deg, #ff2d78, rgba(255,45,120,0.08));
          box-shadow: 0 0 6px rgba(255,45,120,0.4);
        }
        .logo-underline__dot {
          width: 4px;
          height: 4px;
          border-radius: 50%;
          background: #ff2d78;
          box-shadow: 0 0 8px rgba(255,45,120,0.9), 0 0 18px rgba(255,45,120,0.45);
          animation: footerDotPulse 2.2s ease-in-out infinite;
          flex-shrink: 0;
        }
        @keyframes footerDotPulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%       { opacity: 0.4; transform: scale(0.55); }
        }

        .grl-footer__tagline {
          font-size: 0.82rem;
          line-height: 1.78;
          color: rgba(180,155,210,0.5);
          margin: 0 0 1.6rem;
          max-width: 22rem;
        }

        /* socials */
        .grl-footer__socials {
          display: flex;
          gap: 0.6rem;
        }
        .social-icon-box {
          position: relative;
          width: 2.4rem;
          height: 2.4rem;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(255,45,120,0.06);
          border: 1px solid rgba(255,45,120,0.16);
          color: rgba(255,100,160,0.65);
          text-decoration: none;
          clip-path: polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 0 100%);
          transition:
            background 0.3s ease,
            border-color 0.3s ease,
            color 0.3s ease,
            box-shadow 0.3s ease,
            transform 0.25s cubic-bezier(0.22,1,0.36,1);
          overflow: hidden;
        }
        .social-icon-box:hover {
          background: rgba(255,45,120,0.14);
          border-color: rgba(255,45,120,0.4);
          color: #ff80b5;
          box-shadow: 0 0 20px rgba(255,45,120,0.25), inset 0 0 12px rgba(255,45,120,0.08);
          transform: translateY(-2px);
        }
        .social-corner-cut {
          position: absolute;
          top: -1px; right: -1px;
          width: 8px; height: 8px;
          background: rgba(255,45,120,0.3);
          clip-path: polygon(0 0, 100% 0, 100% 100%);
          transition: background 0.3s ease;
        }
        .social-icon-box:hover .social-corner-cut {
          background: rgba(255,45,120,0.6);
        }

        /* ── Nav col ── */
        .grl-footer__col-heading {
          font-family: 'JetBrains Mono', 'Fira Code', monospace;
          font-size: 0.64rem;
          letter-spacing: 0.3em;
          color: #ff2d78;
          text-shadow: 0 0 12px rgba(255,45,120,0.5);
          margin: 0 0 1.2rem;
          text-transform: uppercase;
        }
        .col-heading__slash {
          opacity: 0.38;
          margin-right: 0.35em;
        }

        .grl-footer__nav-list {
          list-style: none;
          margin: 0;
          padding: 0;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        .grl-footer__nav-link {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.85rem;
          color: rgba(180,155,210,0.5);
          text-decoration: none;
          transition: color 0.25s ease, gap 0.25s ease;
        }
        .grl-footer__nav-link:hover {
          color: rgba(255,140,185,0.9);
        }
        .nav-link__arrow {
          font-size: 1rem;
          line-height: 1;
          color: rgba(255,45,120,0.3);
          transition: color 0.25s ease, transform 0.25s ease;
        }
        .grl-footer__nav-link:hover .nav-link__arrow {
          color: #ff2d78;
          transform: translateX(2px);
        }

        /* ── Server col ── */
        .grl-footer__server-col {}

        .grl-ip-box {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
          position: relative;
          width: 100%;
          background: rgba(255,45,120,0.05);
          border: 1px solid rgba(255,45,120,0.2);
          padding: 0.9rem 1rem;
          clip-path: polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 0 100%);
          cursor: pointer;
          text-align: left;
          transition:
            background 0.3s ease,
            border-color 0.3s ease,
            box-shadow 0.3s ease;
          overflow: hidden;
          margin-bottom: 1rem;
        }
        .grl-ip-box:hover {
          background: rgba(255,45,120,0.1);
          border-color: rgba(255,45,120,0.38);
          box-shadow: 0 0 28px rgba(255,45,120,0.18), inset 0 0 20px rgba(255,45,120,0.06);
        }
        .grl-ip-box--copied {
          background: rgba(255,45,120,0.12) !important;
          border-color: rgba(255,45,120,0.5) !important;
          box-shadow: 0 0 32px rgba(255,45,120,0.25), inset 0 0 20px rgba(255,45,120,0.08) !important;
        }
        .grl-ip-box__corner {
          position: absolute;
          top: -1px; right: -1px;
          width: 12px; height: 12px;
          background: rgba(255,45,120,0.35);
          clip-path: polygon(0 0, 100% 0, 100% 100%);
          transition: background 0.3s ease;
        }
        .grl-ip-box:hover .grl-ip-box__corner,
        .grl-ip-box--copied .grl-ip-box__corner {
          background: rgba(255,45,120,0.65);
        }
        .grl-ip-box__label {
          font-family: 'JetBrains Mono', 'Fira Code', monospace;
          font-size: 0.56rem;
          letter-spacing: 0.26em;
          color: rgba(255,45,120,0.5);
          text-transform: uppercase;
        }
        .grl-ip-box__ip {
          font-family: 'JetBrains Mono', 'Fira Code', monospace;
          font-size: 1rem;
          font-weight: 700;
          color: #ede5ff;
          letter-spacing: 0.04em;
          line-height: 1.2;
        }
        .grl-ip-box__icon {
          position: absolute;
          bottom: 0.8rem;
          right: 0.85rem;
          color: rgba(255,45,120,0.45);
          transition: color 0.3s ease, transform 0.3s ease;
          display: flex;
          align-items: center;
        }
        .grl-ip-box:hover .grl-ip-box__icon {
          color: rgba(255,45,120,0.8);
          transform: scale(1.1);
        }
        .grl-ip-box--copied .grl-ip-box__icon {
          color: #ff2d78;
        }

        /* status */
        .grl-footer__status {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .status-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #22ff88;
          box-shadow: 0 0 8px rgba(34,255,136,0.8), 0 0 16px rgba(34,255,136,0.4);
          animation: statusPulse 2s ease-in-out infinite;
          flex-shrink: 0;
        }
        @keyframes statusPulse {
          0%, 100% { opacity: 1; transform: scale(1); box-shadow: 0 0 8px rgba(34,255,136,0.8), 0 0 16px rgba(34,255,136,0.4); }
          50%       { opacity: 0.6; transform: scale(0.8); box-shadow: 0 0 4px rgba(34,255,136,0.4); }
        }
        .status-text {
          font-family: 'JetBrains Mono', 'Fira Code', monospace;
          font-size: 0.62rem;
          letter-spacing: 0.15em;
          color: rgba(34,255,136,0.55);
          text-transform: uppercase;
        }

        /* ── Bottom bar ── */
        .grl-footer__bottom {
          position: relative;
          z-index: 1;
          border-top: 1px solid rgba(255,45,120,0.07);
        }
        .grl-footer__bottom-inner {
          max-width: 88rem;
          margin: 0 auto;
          padding: 0.9rem 2rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
        }
        .grl-footer__copy {
          font-family: 'JetBrains Mono', 'Fira Code', monospace;
          font-size: 0.6rem;
          letter-spacing: 0.18em;
          color: rgba(150,120,180,0.28);
          text-transform: uppercase;
          margin: 0;
        }
        .bottom-sparks {
          display: flex;
          align-items: center;
          gap: 0.35rem;
        }
        .bottom-spark {
          display: block;
          width: 4px;
          height: 4px;
          border-radius: 50%;
          background: rgba(255,45,120,0.25);
          box-shadow: 0 0 4px rgba(255,45,120,0.3);
        }
        .bottom-spark--alt {
          background: rgba(160,64,255,0.25);
          box-shadow: 0 0 4px rgba(160,64,255,0.3);
          width: 3px;
          height: 3px;
        }

        @media (max-width: 560px) {
          .grl-footer__bottom-inner { padding: 0.9rem 1.25rem; }
          .bottom-sparks { display: none; }
        }
        @media (prefers-reduced-motion: reduce) {
          .logo-underline__dot,
          .status-dot,
          .grl-footer__orb { animation: none !important; }
        }
      `}</style>
    </footer>
  );
}

export default Footer;
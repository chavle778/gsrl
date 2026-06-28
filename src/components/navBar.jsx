import { useEffect, useState } from "react";

function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState("login");

  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", on);
    return () => window.removeEventListener("scroll", on);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => (document.body.style.overflow = "");
  }, [menuOpen]);

  // ─── CHAVLE-ს ადმინის შემოწმება ──────────────────────────────────────
  const isChavle = (username) => username?.toLowerCase() === "chavle";

  // ─── მომხმარებლის ჩატვირთვა ──────────────────────────────────────────
  useEffect(() => {
    const checkUser = () => {
      try {
        const saved = localStorage.getItem("grl_current_user");
        if (saved) {
          const user = JSON.parse(saved);
          if (isChavle(user.username) && !user.isAdmin) {
            user.isAdmin = true;
            user.role = "ადმინისტრატორი";
            localStorage.setItem("grl_current_user", JSON.stringify(user));
            
            const users = JSON.parse(localStorage.getItem("grl_users") || "[]");
            const updatedUsers = users.map(u => {
              if (u.username.toLowerCase() === "chavle") {
                return { ...u, isAdmin: true, role: "ადმინისტრატორი" };
              }
              return u;
            });
            localStorage.setItem("grl_users", JSON.stringify(updatedUsers));
          }
          setCurrentUser(user);
          console.log("Navbar: User loaded:", user.username, "isAdmin:", user.isAdmin);
        } else {
          setCurrentUser(null);
          console.log("Navbar: No user found");
        }
      } catch (e) {
        console.error("Navbar: Error loading user:", e);
        setCurrentUser(null);
      }
    };

    checkUser();

    const handleUpdate = () => {
      console.log("Navbar: Update event received");
      checkUser();
    };

    window.addEventListener("storage", handleUpdate);
    window.addEventListener("userUpdate", handleUpdate);
    window.addEventListener("forumAuthChange", handleUpdate);
    window.addEventListener("grlAuthChange", handleUpdate);

    const interval = setInterval(() => {
      const saved = localStorage.getItem("grl_current_user");
      if (saved) {
        try {
          const user = JSON.parse(saved);
          setCurrentUser(prev => {
            if (!prev || prev.username !== user.username) {
              return user;
            }
            return prev;
          });
        } catch (e) {}
      } else {
        setCurrentUser(null);
      }
    }, 500);

    return () => {
      window.removeEventListener("storage", handleUpdate);
      window.removeEventListener("userUpdate", handleUpdate);
      window.removeEventListener("forumAuthChange", handleUpdate);
      window.removeEventListener("grlAuthChange", handleUpdate);
      clearInterval(interval);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("grl_current_user");
    setCurrentUser(null);
    setShowAuth(false);
    window.dispatchEvent(new Event("userUpdate"));
    window.dispatchEvent(new Event("storage"));
    window.dispatchEvent(new Event("forumAuthChange"));
    window.dispatchEvent(new Event("grlAuthChange"));
  };

  const handleLogin = (user) => {
    if (isChavle(user.username)) {
      user.isAdmin = true;
      user.role = "ადმინისტრატორი";
      localStorage.setItem("grl_current_user", JSON.stringify(user));
      
      const users = JSON.parse(localStorage.getItem("grl_users") || "[]");
      const updatedUsers = users.map(u => {
        if (u.username.toLowerCase() === "chavle") {
          return { ...u, isAdmin: true, role: "ადმინისტრატორი" };
        }
        return u;
      });
      localStorage.setItem("grl_users", JSON.stringify(updatedUsers));
    }
    setCurrentUser(user);
    setShowAuth(false);
    window.dispatchEvent(new Event("userUpdate"));
    window.dispatchEvent(new Event("forumAuthChange"));
    window.dispatchEvent(new Event("grlAuthChange"));
  };

  const handleRegister = (user) => {
    if (isChavle(user.username)) {
      user.isAdmin = true;
      user.role = "ადმინისტრატორი";
      localStorage.setItem("grl_current_user", JSON.stringify(user));
      
      const users = JSON.parse(localStorage.getItem("grl_users") || "[]");
      const updatedUsers = users.map(u => {
        if (u.username.toLowerCase() === "chavle") {
          return { ...u, isAdmin: true, role: "ადმინისტრატორი" };
        }
        return u;
      });
      localStorage.setItem("grl_users", JSON.stringify(updatedUsers));
    }
    setCurrentUser(user);
    setShowAuth(false);
    window.dispatchEvent(new Event("userUpdate"));
    window.dispatchEvent(new Event("forumAuthChange"));
    window.dispatchEvent(new Event("grlAuthChange"));
  };

  const links = [
    { label: "მთავარი", href: "/" },
    { label: "მაღაზია", href: "/shop" },
    { label: "ფორუმი", href: "/forum" },
    { label: "დისქორდი", href: "https://discord.gg/wcATT3eG" }
  ];

  return (
    <>
      <style>{`
        @media (min-width: 1024px) {
          .nav-link {
            position: relative;
            transition: color 0.2s ease;
          }
          .nav-link::after {
            content: "";
            position: absolute;
            left: 0;
            bottom: -4px;
            width: 0%;
            height: 2px;
            background: var(--pink);
            transition: width 0.3s ease;
          }
          .nav-link:hover::after {
            width: 100%;
          }
          .nav-link:hover {
            color: var(--pink);
          }
        }

        .auth-modal-overlay {
          position: fixed;
          inset: 0;
          z-index: 9999;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1rem;
          background: rgba(0, 0, 0, 0.7);
          backdrop-filter: blur(8px);
          animation: fadeIn 0.3s ease;
        }
        .auth-modal {
          max-width: 420px;
          width: 100%;
          border-radius: 1.5rem;
          border: 1px solid rgba(255, 255, 255, 0.1);
          background: rgba(20, 20, 30, 0.95);
          backdrop-filter: blur(20px);
          padding: 2rem;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
          animation: slideUp 0.3s ease;
          position: relative;
        }
        .auth-modal .close-btn {
          position: absolute;
          top: 1rem;
          right: 1rem;
          color: #6b7280;
          background: none;
          border: none;
          font-size: 1.5rem;
          cursor: pointer;
          transition: color 0.2s;
        }
        .auth-modal .close-btn:hover {
          color: #ffffff;
        }
        .auth-modal .title {
          font-size: 1.5rem;
          font-weight: 900;
          color: white;
          margin-bottom: 1.5rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          padding-bottom: 1rem;
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }
        .auth-modal .title svg {
          color: var(--pink);
        }
        .auth-modal .error {
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.3);
          color: #f87171;
          padding: 0.75rem 1rem;
          border-radius: 1rem;
          font-size: 0.875rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 1rem;
        }
        .auth-modal .input-group {
          margin-bottom: 1.25rem;
        }
        .auth-modal .input-group label {
          display: block;
          font-size: 0.75rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: #6b7280;
          margin-bottom: 0.5rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .auth-modal .input-group input {
          width: 100%;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 1rem;
          padding: 0.75rem 1rem;
          font-size: 0.875rem;
          color: white;
          transition: all 0.3s;
          outline: none;
        }
        .auth-modal .input-group input:focus {
          border-color: var(--pink);
          box-shadow: 0 0 0 4px rgba(236, 72, 153, 0.15);
        }
        .auth-modal .input-group input::placeholder {
          color: rgba(255, 255, 255, 0.3);
        }
        .auth-modal .input-group .password-wrapper {
          position: relative;
        }
        .auth-modal .input-group .password-wrapper input {
          padding-right: 3rem;
        }
        .auth-modal .input-group .toggle-password {
          position: absolute;
          right: 0.75rem;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          color: #6b7280;
          cursor: pointer;
          padding: 0.25rem;
          transition: color 0.2s;
        }
        .auth-modal .input-group .toggle-password:hover {
          color: white;
        }
        .auth-modal .btn-primary {
          width: 100%;
          background: var(--pink);
          color: black;
          font-weight: 900;
          font-size: 0.875rem;
          padding: 0.875rem;
          border: none;
          border-radius: 1rem;
          cursor: pointer;
          transition: all 0.3s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
        }
        .auth-modal .btn-primary:hover {
          transform: scale(1.02);
          box-shadow: 0 0 30px rgba(236, 72, 153, 0.3);
        }
        .auth-modal .switch-mode {
          text-align: center;
          font-size: 0.75rem;
          color: #6b7280;
          margin-top: 1rem;
        }
        .auth-modal .switch-mode button {
          background: none;
          border: none;
          color: var(--pink);
          font-weight: 700;
          cursor: pointer;
          transition: color 0.2s;
        }
        .auth-modal .switch-mode button:hover {
          color: #f472b6;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes scaleIn {
          from { transform: scale(0.7); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        .animate-scaleIn {
          animation: scaleIn 0.4s cubic-bezier(0.22, 1, 0.36, 1) both;
        }

        .desktop-auth-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          padding: 0.4rem 1rem;
          border-radius: 9999px;
          font-size: 0.7rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          transition: all 0.3s;
          border: 1px solid rgba(255, 255, 255, 0.1);
          background: transparent;
          color: #9ca3af;
          cursor: pointer;
          white-space: nowrap;
        }
        .desktop-auth-btn:hover {
          border-color: var(--pink);
          color: white;
          background: rgba(236, 72, 153, 0.1);
        }
        .desktop-auth-btn.register-btn {
          background: var(--pink);
          color: black;
          border-color: var(--pink);
        }
        .desktop-auth-btn.register-btn:hover {
          background: white;
          color: var(--pink);
        }
        .desktop-auth-btn.logout {
          border-color: rgba(239, 68, 68, 0.3);
          color: #f87171;
        }
        .desktop-auth-btn.logout:hover {
          border-color: #ef4444;
          background: rgba(239, 68, 68, 0.1);
        }

        .user-avatar {
          width: 2rem;
          height: 2rem;
          border-radius: 9999px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 900;
          font-size: 0.7rem;
          color: white;
          border: 2px solid rgba(255, 255, 255, 0.1);
        }
        .desktop-user-info {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.2rem 0.75rem 0.2rem 0.2rem;
          border-radius: 9999px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: white;
          font-size: 0.8rem;
          font-weight: 600;
          white-space: nowrap;
        }
        .admin-badge {
          font-size: 0.55rem;
          padding: 0.1rem 0.4rem;
          border-radius: 0.25rem;
          background: oklch(0.72 0.23 25 / 0.2);
          color: oklch(0.72 0.23 25);
          border: 1px solid oklch(0.72 0.23 25 / 0.3);
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .mobile-auth-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          border-radius: 0.75rem;
          font-size: 0.75rem;
          font-weight: 700;
          text-transform: uppercase;
          transition: all 0.3s;
          border: 1px solid rgba(255, 255, 255, 0.1);
          background: rgba(255, 255, 255, 0.05);
          color: #9ca3af;
          cursor: pointer;
        }
        .mobile-auth-btn:hover {
          border-color: var(--pink);
          color: white;
          background: rgba(236, 72, 153, 0.1);
        }

        /* Navbar layout */
        .navbar-container {
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;
        }
        .navbar-left {
          flex: 0 0 auto;
        }
        .navbar-center {
          flex: 1;
          display: flex;
          justify-content: center;
        }
        .navbar-right {
          flex: 0 0 auto;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        
        @media (max-width: 1023px) {
          .navbar-center {
            display: none;
          }
          .navbar-right {
            flex: 1;
            justify-content: flex-end;
          }
          .desktop-auth-wrapper {
            display: none !important;
          }
        }
        
        @media (min-width: 1024px) {
          .mobile-auth-buttons {
            display: none !important;
          }
        }

        .desktop-nav-wrapper {
          display: flex;
          align-items: center;
          gap: 2.5rem;
        }
        .desktop-auth-wrapper {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }
      `}</style>

      <header
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
          scrolled
            ? "border-b border-border/60 bg-background/80 backdrop-blur-xl"
            : "bg-transparent"
        }`}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-5 lg:px-8 py-3 lg:py-4">
          <div className="navbar-container">
            
            {/* LEFT - LOGO */}
            <div className="navbar-left">
              <a
                href="/"
                className="font-display font-bold text-xl sm:text-2xl lg:text-2xl shrink-0"
              >
                <span className="text-foreground">GEORGIAN SAMP </span>
                <span className="text-neon">REAL LIFE</span>
              </a>
            </div>

            {/* CENTER - DESKTOP NAV */}
            <div className="navbar-center">
              <nav className="desktop-nav-wrapper">
                {links.map((l) => (
                  <a
                    key={l.href}
                    href={l.href}
                    className="nav-link text-sm font-semibold uppercase tracking-wider text-muted-foreground"
                  >
                    {l.label}
                  </a>
                ))}
              </nav>
            </div>

            {/* RIGHT - AUTH BUTTONS + HAMBURGER */}
            <div className="navbar-right">
              {/* DESKTOP AUTH BUTTONS */}
              <div className="desktop-auth-wrapper">
                {currentUser ? (
                  <div className="flex items-center gap-2">
                    <div className="desktop-user-info">
                      <div 
                        className="user-avatar"
                        style={{ background: currentUser.avatarBg || "linear-gradient(135deg,#ec4899,#f43f5e)" }}
                      >
                        {currentUser.username?.[0]?.toUpperCase() || "U"}
                      </div>
                      <span className="text-xs flex items-center gap-1">
                        {currentUser.username}
                        {currentUser.isAdmin && (
                          <span className="admin-badge">ადმინი</span>
                        )}
                      </span>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="desktop-auth-btn logout text-xs"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                        <polyline points="16 17 21 12 16 7" />
                        <line x1="21" y1="12" x2="9" y2="12" />
                      </svg>
                      <span>გამოსვლა</span>
                    </button>
                  </div>
                ) : (
                  <>
                    <button
                      onClick={() => { setShowAuth(true); setAuthMode("login"); }}
                      className="desktop-auth-btn text-xs"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                        <polyline points="10 17 15 12 10 7" />
                        <line x1="15" y1="12" x2="3" y2="12" />
                      </svg>
                      <span>შესვლა</span>
                    </button>
                    <button
                      onClick={() => { setShowAuth(true); setAuthMode("register"); }}
                      className="desktop-auth-btn register-btn text-xs"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                        <circle cx="8.5" cy="7" r="4" />
                        <line x1="20" y1="8" x2="20" y2="14" />
                        <line x1="23" y1="11" x2="17" y2="11" />
                      </svg>
                      <span>რეგისტრაცია</span>
                    </button>
                  </>
                )}
              </div>

              {/* HAMBURGER (<1024px) */}
              <button
                onClick={() => setMenuOpen((v) => !v)}
                className="lg:hidden flex flex-col justify-center items-center w-9 h-9 gap-1.25 ml-2"
              >
                <span
                  className="h-0.5 w-6 bg-white transition-all duration-300"
                  style={{
                    transform: menuOpen
                      ? "translateY(7px) rotate(45deg)"
                      : "none",
                  }}
                />
                <span
                  className="h-0.5 w-6 bg-white transition-all duration-200"
                  style={{
                    opacity: menuOpen ? 0 : 1,
                    width: menuOpen ? "0px" : "24px",
                  }}
                />
                <span
                  className="h-0.5 w-6 bg-white transition-all duration-300"
                  style={{
                    transform: menuOpen
                      ? "translateY(-7px) rotate(-45deg)"
                      : "none",
                  }}
                />
              </button>
            </div>
          </div>
        </div>

        {/* MOBILE DROPDOWN */}
        <div
          className="lg:hidden overflow-hidden"
          style={{
            maxHeight: menuOpen ? "520px" : "0px",
            opacity: menuOpen ? 1 : 0,
            transform: menuOpen
              ? "translateY(0px) scale(1)"
              : "translateY(-10px) scale(0.98)",
            transition:
              "max-height 0.45s cubic-bezier(0.22,1,0.36,1), opacity 0.25s ease, transform 0.35s ease",
          }}
        >
          <nav className="bg-background/95 backdrop-blur-xl border-t border-border/40">
            {links.map((l, i) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setMenuOpen(false)}
                className="flex items-center justify-between px-5 py-3 sm:py-4 text-sm font-semibold uppercase text-muted-foreground transition-all hover:text-pink-500 hover:pl-8"
                style={{
                  transitionDelay: menuOpen ? `${i * 60}ms` : "0ms",
                }}
              >
                {l.label}
                <span className="opacity-40">›</span>
              </a>
            ))}

            {/* Mobile User Section */}
            <div className="px-5 py-3 border-t border-border/40">
              {currentUser ? (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
                      style={{ background: currentUser.avatarBg || "linear-gradient(135deg,#ec4899,#f43f5e)" }}
                    >
                      {currentUser.username?.[0]?.toUpperCase() || "U"}
                    </div>
                    <div>
                      <div className="font-bold text-white text-sm flex items-center gap-1">
                        {currentUser.username}
                        {currentUser.isAdmin && (
                          <span className="admin-badge text-[0.5rem]">👑</span>
                        )}
                      </div>
                      <div className="text-[10px] text-muted-foreground">
                        {currentUser.role || "მოთამაშე"}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => { handleLogout(); setMenuOpen(false); }}
                    className="text-xs font-bold text-red-400 hover:text-red-300 transition-colors px-3 py-1.5 rounded-lg hover:bg-red-500/10"
                  >
                    გამოსვლა
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-2"> 
                  <button
                    onClick={() => { setShowAuth(true); setAuthMode("login"); setMenuOpen(false); }}
                    className="flex items-center justify-center gap-2 py-2.5 text-sm font-bold text-white border border-border rounded-xl hover:border-primary/40 transition-all"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                      <polyline points="10 17 15 12 10 7" />
                      <line x1="15" y1="12" x2="3" y2="12" />
                    </svg>
                    შესვლა
                  </button>
                  <button
                    onClick={() => { setShowAuth(true); setAuthMode("register"); setMenuOpen(false); }}
                    className="flex items-center justify-center gap-2 py-2.5 text-sm font-bold text-black border border-primary rounded-xl transition-all"
                    style={{ background: "var(--pink)" }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                      <circle cx="8.5" cy="7" r="4" />
                      <line x1="20" y1="8" x2="20" y2="14" />
                      <line x1="23" y1="11" x2="17" y2="11" />
                    </svg>
                    რეგისტრაცია
                  </button>
                </div>
              )}
            </div>

            {/* MOBILE CTA */}
            <div className="p-4 sm:p-5">
              <a
                href="https://download1077.mediafire.com/7lig3d2h6legdBnSmlsuaKyaumxwbEVAytFCDp6CFYtITxjOR9zezkUx3Jtc3-v3ua3xIRaHuWAFmnrTYMld1SX2mbc6RVW4YpISD9CPsk1EsOED0IoevkiHJ0z7kPWdkF76nzN5djCfiP1k1C4oFzCs0W9gMR9lvhRnGriWN6w/x3vhybbggetsnq5/GeorgianRp-win32-x64.exe"
                target="blank"
                onClick={() => setMenuOpen(false)}
                className="flex items-center justify-center py-3 text-sm font-black uppercase text-black"
                style={{
                  background: "var(--pink)",
                  clipPath: "polygon(0% 0%, 100% 0%, 95% 100%, 0% 100%)",
                }}
              >
                გადმოწერე ლაუნჩერი →
              </a>
            </div>
          </nav>
        </div>
      </header>

      {/* AUTH MODAL */}
      {showAuth && (
        <div className="auth-modal-overlay" onClick={() => setShowAuth(false)}>
          <div className="auth-modal" onClick={(e) => e.stopPropagation()}>
            <button className="close-btn" onClick={() => setShowAuth(false)}>✕</button>
            
            {authMode === "login" ? (
              <LoginForm 
                onLogin={handleLogin} 
                onRegisterClick={() => setAuthMode("register")}
                onClose={() => setShowAuth(false)}
              />
            ) : (
              <RegisterForm 
                onRegister={handleRegister} 
                onLoginClick={() => setAuthMode("login")}
                onClose={() => setShowAuth(false)}
              />
            )}
          </div>
        </div>
      )}
    </>
  );
}

// ─── Login Form ──────────────────────────────────────────────────────────────
function LoginForm({ onLogin, onRegisterClick, onClose }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    const users = JSON.parse(localStorage.getItem("grl_users") || "[]");
    const user = users.find(u => 
      u.username.toLowerCase() === username.toLowerCase() && 
      u.password === password
    );

    if (!user) {
      setError("მომხმარებელი ან პაროლი არასწორია");
      return;
    }

    if (username.toLowerCase() === "chavle") {
      user.isAdmin = true;
      user.role = "ადმინისტრატორი";
    }

    localStorage.setItem("grl_current_user", JSON.stringify(user));
    
    const updatedUsers = users.map(u => {
      if (u.username.toLowerCase() === "chavle") {
        return { ...u, isAdmin: true, role: "ადმინისტრატორი" };
      }
      return u;
    });
    localStorage.setItem("grl_users", JSON.stringify(updatedUsers));
    
    window.dispatchEvent(new Event("storage"));
    window.dispatchEvent(new Event("userUpdate"));
    window.dispatchEvent(new Event("forumAuthChange"));
    window.dispatchEvent(new Event("grlAuthChange"));
    onLogin(user);
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="title">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
          <polyline points="10 17 15 12 10 7" />
          <line x1="15" y1="12" x2="3" y2="12" />
        </svg>
        შესვლა
      </div>
      
      {error && (
        <div className="error">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <span>{error}</span>
        </div>
      )}

      <div className="input-group">
        <label>
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
          მომხმარებლის სახელი
        </label>
        <input
          type="text"
          required
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="შეიყვანეთ მომხმარებლის სახელი"
        />
      </div>

      <div className="input-group">
        <label>
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
          პაროლი
        </label>
        <div className="password-wrapper">
          <input
            type={showPassword ? "text" : "password"}
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="შეიყვანეთ პაროლი"
          />
          <button
            type="button"
            className="toggle-password"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                <line x1="1" y1="1" x2="23" y2="23" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            )}
          </button>
        </div>
      </div>

      <button type="submit" className="btn-primary">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
          <polyline points="10 17 15 12 10 7" />
          <line x1="15" y1="12" x2="3" y2="12" />
        </svg>
        შესვლა
      </button>

      <p className="switch-mode">
        არ გაქვთ ანგარიში?{" "}
        <button type="button" onClick={onRegisterClick}>
          რეგისტრაცია
        </button>
      </p>
    </form>
  );
}

// ─── Register Form ──────────────────────────────────────────────────────────
function RegisterForm({ onRegister, onLoginClick, onClose }) {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    if (username.length < 3) {
      setError("მომხმარებლის სახელი უნდა შეიცავდეს მინიმუმ 3 სიმბოლოს");
      return;
    }
    if (username.length > 20) {
      setError("მომხმარებლის სახელი არ უნდა აღემატებოდეს 20 სიმბოლოს");
      return;
    }
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      setError("მომხმარებლის სახელი უნდა შეიცავდეს მხოლოდ ასოებს, ციფრებს და ქვედა ხაზს");
      return;
    }
    if (!email.includes("@") || !email.includes(".")) {
      setError("გთხოვთ მიუთითოთ სწორი ელ-ფოსტა");
      return;
    }
    if (password.length < 6) {
      setError("პაროლი უნდა შეიცავდეს მინიმუმ 6 სიმბოლოს");
      return;
    }
    if (password !== confirmPassword) {
      setError("პაროლები არ ემთხვევა");
      return;
    }

    const users = JSON.parse(localStorage.getItem("grl_users") || "[]");
    if (users.find(u => u.username.toLowerCase() === username.toLowerCase())) {
      setError("მომხმარებელი ამ სახელით უკვე არსებობს");
      return;
    }
    if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
      setError("მომხმარებელი ამ ელ-ფოსტით უკვე არსებობს");
      return;
    }

    const isAdmin = username.toLowerCase() === "chavle";
    const colors = ["#ec4899","#8b5cf6","#3b82f6","#10b981","#f59e0b","#ef4444"];
    const c1 = colors[Math.floor(Math.random() * colors.length)];
    const c2 = colors[Math.floor(Math.random() * colors.length)];

    const newUser = {
      id: `user-${Date.now()}`,
      username,
      email,
      password,
      registeredAt: new Date().toISOString(),
      role: isAdmin ? "ადმინისტრატორი" : "მოთამაშე",
      avatarBg: isAdmin ? "linear-gradient(135deg,#ff2d78,#8b00ff)" : `linear-gradient(135deg,${c1},${c2})`,
      isAdmin,
    };

    users.push(newUser);
    localStorage.setItem("grl_users", JSON.stringify(users));
    localStorage.setItem("grl_current_user", JSON.stringify(newUser));
    window.dispatchEvent(new Event("storage"));
    window.dispatchEvent(new Event("userUpdate"));
    window.dispatchEvent(new Event("forumAuthChange"));
    window.dispatchEvent(new Event("grlAuthChange"));
    setSuccess(true);
    
    setTimeout(() => {
      onRegister(newUser);
      onClose();
    }, 1500);
  };

  if (success) {
    return (
      <div className="text-center py-8">
        <div className="w-20 h-20 rounded-full bg-emerald-500/20 border-2 border-emerald-500/50 mx-auto flex items-center justify-center animate-scaleIn">
          <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
        </div>
        <h3 className="text-2xl font-display font-black text-white mt-6">რეგისტრაცია წარმატებით დასრულდა!</h3>
        <p className="text-muted-foreground mt-2">გილოცავთ, თქვენი ანგარიში შექმნილია.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="title">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="8.5" cy="7" r="4" />
          <line x1="20" y1="8" x2="20" y2="14" />
          <line x1="23" y1="11" x2="17" y2="11" />
        </svg>
        რეგისტრაცია
      </div>
      
      {error && (
        <div className="error">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <span>{error}</span>
        </div>
      )}

      <div className="input-group">
        <label>
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
          მომხმარებლის სახელი
        </label>
        <input
          type="text"
          required
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="მინიმუმ 3 სიმბოლო"
        />
        {username.toLowerCase() === "chavle" && (
          <div style={{ fontSize: "0.65rem", color: "oklch(0.72 0.23 25)", marginTop: "0.25rem", fontWeight: 700 }}>
            👑 ეს არის ადმინისტრატორის ანგარიში
          </div>
        )}
      </div>

      <div className="input-group">
        <label>
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
            <polyline points="22,6 12,13 2,6" />
          </svg>
          ელ-ფოსტა
        </label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="example@email.com"
        />
      </div>

      <div className="input-group">
        <label>
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
          პაროლი
        </label>
        <div className="password-wrapper">
          <input
            type={showPassword ? "text" : "password"}
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="მინიმუმ 6 სიმბოლო"
          />
          <button
            type="button"
            className="toggle-password"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                <line x1="1" y1="1" x2="23" y2="23" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            )}
          </button>
        </div>
      </div>

      <div className="input-group">
        <label>
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
          პაროლის დადასტურება
        </label>
        <input
          type={showPassword ? "text" : "password"}
          required
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="გაიმეორეთ პაროლი"
        />
      </div>

      <button type="submit" className="btn-primary">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="8.5" cy="7" r="4" />
          <line x1="20" y1="8" x2="20" y2="14" />
          <line x1="23" y1="11" x2="17" y2="11" />
        </svg>
        რეგისტრაცია
      </button>

      <p className="switch-mode"> 
        უკვე გაქვთ ანგარიში?{" "}
        <button type="button" onClick={onLoginClick}>
          შესვლა
        </button>
      </p>
    </form>
  );
}

export default Navbar;
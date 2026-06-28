import { useState } from "react";
import { supabase } from "../src/supabaseClient";

export default function AdminLogin({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => { 
    setLoading(true);
    setError("");
    const { data, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (authError) {
      setError("არასწორი ელ-ფოსტა ან პაროლი.");
    } else {
      const { data: profile } = await supabase
        .from("admin_users")
        .select("*")
        .eq("user_id", data.user.id)
        .single();
      if (!profile) {
        setError("თქვენ არ გაქვთ ადმინის წვდომა.");
        await supabase.auth.signOut();
      } else {
        onLogin(data.user);
      }
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-4">
      <div className="relative w-full max-w-md">
        {/* Glow effects */}
        <div className="absolute -inset-1 rounded-2xl opacity-30"
          style={{ background: "linear-gradient(135deg, #ff2d78, #00f0ff)", filter: "blur(20px)" }} />
        <div className="relative bg-[#0f0f1a] border border-[#ff2d78]/30 rounded-2xl p-8">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ background: "linear-gradient(135deg, #ff2d78, #8b00ff)" }}>
                <span className="text-white font-bold text-lg">G</span>
              </div>
              <span className="text-white font-bold text-xl tracking-wider">GRL</span>
              <span className="text-[#ff2d78] text-xs font-medium px-2 py-0.5 rounded border border-[#ff2d78]/40 bg-[#ff2d78]/10">
                ADMIN
              </span>
            </div>
            <h1 className="text-[#e0e0ff] text-2xl font-bold mb-1">ადმინ პანელი</h1>
            <p className="text-[#6b6b8a] text-sm">Georgian Real Life • SA:MP</p>
          </div>

          {/* Form */}
          <div className="space-y-4">
            <div>
              <label className="text-[#9090aa] text-xs font-medium uppercase tracking-wider mb-1.5 block">
                ელ-ფოსტა
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleLogin()}
                placeholder="admin@gsrl.ge"
                className="w-full bg-[#1a1a2e] border border-[#2a2a3e] rounded-lg px-4 py-3 text-[#e0e0ff] placeholder-[#3a3a5a] text-sm focus:outline-none focus:border-[#ff2d78]/60 transition-colors"
              />
            </div>
            <div>
              <label className="text-[#9090aa] text-xs font-medium uppercase tracking-wider mb-1.5 block">
                პაროლი
              </label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleLogin()}
                placeholder="••••••••"
                className="w-full bg-[#1a1a2e] border border-[#2a2a3e] rounded-lg px-4 py-3 text-[#e0e0ff] placeholder-[#3a3a5a] text-sm focus:outline-none focus:border-[#ff2d78]/60 transition-colors"
              />
            </div>

            {error && (
              <div className="bg-[#ff2d78]/10 border border-[#ff2d78]/30 rounded-lg px-4 py-3 text-[#ff2d78] text-sm">
                ⚠ {error}
              </div>
            )}

            <button
              onClick={handleLogin}
              disabled={loading || !email || !password}
              className="w-full py-3 rounded-lg font-semibold text-sm text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ background: "linear-gradient(135deg, #ff2d78, #8b00ff)" }}
            >
              {loading ? "მოწმდება..." : "შესვლა"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
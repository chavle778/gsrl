import { useState, useEffect } from "react";
import { supabase } from "../src/supabaseClient";
import AdminLogin from "./AdminLogin";
import AdminPanel from "./AdminPanel";

export default function AdminApp() {
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        verifyAdmin(session.user);
      } else {
        setChecking(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        setUser(null);
        setChecking(false);
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  async function verifyAdmin(authUser) {
    const { data } = await supabase
      .from("admin_users")
      .select("*")
      .eq("user_id", authUser.id)
      .single();
    if (data) {
      setUser(authUser);
    } else {
      await supabase.auth.signOut();
    }
    setChecking(false);
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    setUser(null);
  }

  if (checking) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="text-[#ff2d78] text-sm animate-pulse">GRL Admin იტვირთება...</div>
      </div>
    );
  } 

  if (!user) {
    return <AdminLogin onLogin={setUser} />;
  }

  return <AdminPanel user={user} onLogout={handleLogout} />;
}
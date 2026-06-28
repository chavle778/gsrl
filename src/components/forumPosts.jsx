import { useState, useEffect } from "react";
import { supabase } from "./supabaseClient";
 
// ─── Admin Posts Feed ────────────────────────────────────────────
export function ForumPosts() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("ყველა");
 
  const categories = ["ყველა", "ახალი ამბები", "განახლებები", "ღონისძიებები", "წესები", "სხვა"];
 
  useEffect(() => {
    supabase
      .from("forum_posts")
      .select("*, admin_users(username)")
      .order("pinned", { ascending: false })
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setPosts(data || []);
        setLoading(false);
      });
  }, []);
 
  const filtered = selectedCategory === "ყველა"
    ? posts
    : posts.filter(p => p.category === selectedCategory);
 
  return (
    <section>
      {/* Category tabs */}
      <div className="flex gap-2 flex-wrap mb-6">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-1.5 rounded-full text-sm border transition-colors ${
              selectedCategory === cat
                ? "border-[#ff2d78] text-[#ff2d78] bg-[#ff2d78]/10"
                : "border-[#2a2a3e] text-[#6b6b8a] hover:border-[#ff2d78]/40"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>
 
      {loading && <p className="text-[#4a4a6a] text-sm">იტვირთება...</p>}
 
      <div className="space-y-4">
        {filtered.map(post => (
          <article
            key={post.id}
            className="bg-[#0f0f1a] border border-[#1e1e30] rounded-2xl p-6 hover:border-[#ff2d78]/20 transition-colors"
          >
            <div className="flex items-center gap-2 mb-3">
              {post.pinned && (
                <span className="text-[#ffaa00] text-xs px-2 py-0.5 rounded bg-[#ffaa00]/10 border border-[#ffaa00]/20">
                  📌 დაპინული
                </span>
              )}
              <span className="text-[#9090aa] text-xs px-2 py-0.5 rounded bg-[#1a1a2e] border border-[#2a2a3e]">
                {post.category}
              </span>
            </div>
            <h2 className="text-[#e0e0ff] text-lg font-bold mb-2">{post.title}</h2>
            <p className="text-[#8080a0] text-sm leading-relaxed whitespace-pre-wrap">{post.content}</p>
            <div className="flex items-center gap-2 mt-4 pt-4 border-t border-[#1a1a2e]">
              <span className="text-[#ff2d78] text-xs font-medium">
                👑 {post.admin_users?.username || "ადმინი"}
              </span>
              <span className="text-[#3a3a5a] text-xs">•</span>
              <span className="text-[#4a4a6a] text-xs">
                {new Date(post.created_at).toLocaleDateString("ka-GE", {
                  year: "numeric", month: "long", day: "numeric"
                })}
              </span>
              {post.updated_at && (
                <>
                  <span className="text-[#3a3a5a] text-xs">•</span>
                  <span className="text-[#3a3a5a] text-xs">განახლდა</span>
                </>
              )}
            </div>
          </article>
        ))}
        {!loading && filtered.length === 0 && (
          <p className="text-[#4a4a6a] text-sm text-center py-8">ამ კატეგორიაში პოსტები არ არის</p>
        )}
      </div>
    </section>
  );
}
 
// ─── Submit Ticket / Complaint ────────────────────────────────────
export function SubmitForm({ type = "ticket" }) {
  // type: "ticket" | "complaint"
  const table = type === "ticket" ? "forum_tickets" : "forum_complaints";
  const label = type === "ticket" ? "მოთხოვნა" : "საჩივარი";
 
  const [form, setForm] = useState({ author_name: "", subject: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
 
  const { data: { user } } = await supabase.auth.getUser(); // or use hook
 
  async function handleSubmit() {
    if (!form.author_name || !form.subject || !form.message) {
      setError("გთხოვთ შეავსეთ ყველა ველი");
      return;
    }
    setLoading(true);
    setError("");
    const { error: err } = await supabase.from(table).insert({
      author_name: form.author_name,
      subject: form.subject,
      message: form.message,
      user_id: user?.id || null,
      status: "open",
    });
    if (err) {
      setError("შეცდომა გაგზავნისას. სცადეთ თავიდან.");
    } else {
      setSuccess(true);
      setForm({ author_name: "", subject: "", message: "" });
    }
    setLoading(false);
  }
 
  if (success) {
    return (
      <div className="bg-[#00ff88]/5 border border-[#00ff88]/20 rounded-2xl p-8 text-center">
        <p className="text-[#00ff88] text-lg font-semibold mb-2">✓ გაიგზავნა!</p>
        <p className="text-[#6b6b8a] text-sm">
          თქვენი {label} მიღებულია. ადმინი მალე გიპასუხებთ.
        </p>
        <button
          onClick={() => setSuccess(false)}
          className="mt-4 text-xs text-[#6b6b8a] underline hover:text-[#9090aa]"
        >
          კიდევ ერთის გაგზავნა
        </button>
      </div>
    );
  }
 
  return (
    <div className="bg-[#0f0f1a] border border-[#1e1e30] rounded-2xl p-6">
      <h3 className="text-[#e0e0ff] font-semibold mb-5">{label}ის გაგზავნა</h3>
      <div className="space-y-4">
        <div>
          <label className="text-[#6b6b8a] text-xs uppercase tracking-wider block mb-1.5">
            თქვენი სახელი
          </label>
          <input
            value={form.author_name}
            onChange={e => setForm(f => ({ ...f, author_name: e.target.value }))}
            placeholder="ინ-თამაშის სახელი..."
            className="w-full bg-[#1a1a2e] border border-[#2a2a3e] rounded-lg px-4 py-2.5 text-[#e0e0ff] text-sm focus:outline-none focus:border-[#ff2d78]/60"
          />
        </div>
        <div>
          <label className="text-[#6b6b8a] text-xs uppercase tracking-wider block mb-1.5">
            თემა
          </label>
          <input
            value={form.subject}
            onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}
            placeholder={`${label}ის თემა...`}
            className="w-full bg-[#1a1a2e] border border-[#2a2a3e] rounded-lg px-4 py-2.5 text-[#e0e0ff] text-sm focus:outline-none focus:border-[#ff2d78]/60"
          />
        </div>
        <div>
          <label className="text-[#6b6b8a] text-xs uppercase tracking-wider block mb-1.5">
            შინაარსი
          </label>
          <textarea
            value={form.message}
            onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
            placeholder={`${label}ის დეტალები...`}
            rows={5}
            className="w-full bg-[#1a1a2e] border border-[#2a2a3e] rounded-lg px-4 py-2.5 text-[#e0e0ff] text-sm focus:outline-none focus:border-[#ff2d78]/60 resize-none"
          />
        </div>
        {error && (
          <p className="text-[#ff2d78] text-sm">{error}</p>
        )}
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full py-2.5 rounded-lg text-sm font-semibold text-white disabled:opacity-40"
          style={{ background: "linear-gradient(135deg, #ff2d78, #8b00ff)" }}
        >
          {loading ? "იგზავნება..." : "გაგზავნა"}
        </button>
      </div>
    </div>
  );
}
 
// ─── User's own tickets/complaints with admin replies ─────────────
export function MyItems({ type = "ticket" }) {
  const table = type === "ticket" ? "forum_tickets" : "forum_complaints";
  const [items, setItems] = useState([]);
  const [expanded, setExpanded] = useState(null);
 
  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from(table)
        .select("*, admin_replies(*)")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      setItems(data || []);
    }
    load();
  }, [type]);
 
  const STATUS = {
    open:     { label: "ღია",        color: "#00f0ff" },
    pending:  { label: "განხილვაში", color: "#ffaa00" },
    resolved: { label: "გადაჭრილია", color: "#00ff88" },
    closed:   { label: "დახურულია",  color: "#6b6b8a" },
  };
 
  if (!items.length) return (
    <p className="text-[#4a4a6a] text-sm text-center py-8">
      {type === "ticket" ? "მოთხოვნები" : "საჩივრები"} ჯერ არ გაქვთ
    </p>
  );
 
  return (
    <div className="space-y-3">
      {items.map(item => {
        const st = STATUS[item.status] || STATUS.open;
        const isOpen = expanded === item.id;
        return (
          <div key={item.id}
            className="bg-[#0f0f1a] border border-[#1e1e30] rounded-xl overflow-hidden">
            <button
              onClick={() => setExpanded(isOpen ? null : item.id)}
              className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-[#ffffff03] transition-colors"
            >
              <div>
                <p className="text-[#c0c0d8] text-sm font-medium">{item.subject}</p>
                <span className="text-xs mt-0.5 block" style={{ color: st.color }}>
                  {st.label}
                  {item.admin_replies?.length > 0 && (
                    <span className="ml-2 text-[#6b6b8a]">• {item.admin_replies.length} პასუხი</span>
                  )}
                </span>
              </div>
              <span className="text-[#3a3a5a] text-lg">{isOpen ? "▲" : "▼"}</span>
            </button>
 
            {isOpen && (
              <div className="px-5 pb-5 space-y-3 border-t border-[#1a1a2e] pt-4">
                {/* Original */}
                <div className="bg-[#0a0a14] rounded-lg p-4">
                  <p className="text-[#8080a0] text-sm whitespace-pre-wrap">{item.message}</p>
                </div>
                {/* Admin replies */}
                {(item.admin_replies || []).map(reply => (
                  <div key={reply.id} className="bg-[#ff2d78]/5 border border-[#ff2d78]/15 rounded-lg p-4">
                    <p className="text-[#ff2d78] text-xs font-medium mb-2">👑 ადმინი</p>
                    <p className="text-[#c0c0d8] text-sm whitespace-pre-wrap">{reply.reply_text}</p>
                    <p className="text-[#4a4a6a] text-xs mt-2">
                      {new Date(reply.created_at).toLocaleDateString("ka-GE")}
                    </p>
                  </div>
                ))}
                {(!item.admin_replies || item.admin_replies.length === 0) && (
                  <p className="text-[#3a3a5a] text-xs text-center py-2">ადმინი მალე გიპასუხებთ...</p>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
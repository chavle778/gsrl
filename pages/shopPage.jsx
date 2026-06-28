import { Link } from "react-router-dom";
import { useState, useMemo, useEffect } from "react";

import './shop.css'
import {
  ArrowLeft, ShoppingBag, Car, Home, Crown, Sparkles,
  Wrench, Shield, Plus, Minus, Trash2, Check, Flame, Lock,
} from "lucide-react";

const categories = [
  { id: "all", label: "ყველა", icon: Sparkles },
  { id: "vip", label: "VIP", icon: Crown },
  { id: "cars", label: "მანქანები", icon: Car },
  { id: "homes", label: "სახლები", icon: Home },
  { id: "boosts", label: "ბუსტერები", icon: Flame },
  { id: "services", label: "სერვისები", icon: Wrench },
];

const products = [
  {
    id: "vip-platinum", cat: "vip", name: "PLATINUM VIP", sub: "ულტიმატური სტატუსი",
    price: 199, old: 249, badge: "POPULAR",
    perks: ["ყველა ფერი ნომერზე", "+50% ხელფასი", "ექსკლუზიური სკინი", "პრიორიტეტი queue-ში"],
    accent: "oklch(0.85 0.16 90)",
  },
  {
    id: "vip-gold", cat: "vip", name: "GOLD VIP", sub: "30 დღე ოქროს სტატუსით",
    price: 89,
    perks: ["+25% ხელფასი", "ოქროს ნომერი", "უფასო რემონტი"],
    accent: "oklch(0.78 0.15 75)",
  },
  {
    id: "vip-silver", cat: "vip", name: "SILVER VIP", sub: "მოსახერხებელი დასაწყისი",
    price: 39,
    perks: ["+10% ხელფასი", "სპეც ემოჯიები", "ვერცხლისფერი ნომერი"],
    accent: "oklch(0.85 0.02 250)",
  },
  {
    id: "car-zentorno", cat: "cars", name: "Pegassi Zentorno", sub: "სუპერ კარი",
    price: 149, badge: "RARE",
    perks: ["სრული ტუნინგი", "უნიკალური ფერი", "გარანტირებული გადარჩენა wipe-ზე"],
    accent: "oklch(0.68 0.27 0)",
  },
  {
    id: "car-tyrus", cat: "cars", name: "Progen Tyrus", sub: "ტრეკ მონსტრი",
    price: 129,
    perks: ["ცარგო ვერსია", "ნიტრო სისტემა", "ექსკლუზიური ხმა"],
    accent: "oklch(0.7 0.22 30)",
  },
  {
    id: "car-kuruma", cat: "cars", name: "Karin Kuruma (Armored)", sub: "ჯავშანტექნიკა",
    price: 79,
    perks: ["ბულეტპრუფი", "შავი ფანჯრები", "GPS jamming"],
    accent: "oklch(0.5 0.05 250)",
  },
  {
    id: "home-vinewood", cat: "homes", name: "Vinewood Hills Villa", sub: "ლუქს ვილა აუზით",
    price: 249, badge: "TOP",
    perks: ["6 ოთახი", "გარაჟი 4 მანქანაზე", "სეიფი"],
    accent: "oklch(0.7 0.18 160)",
  },
  {
    id: "home-eclipse", cat: "homes", name: "Eclipse Apartment", sub: "ცენტრალური ბინა",
    price: 119,
    perks: ["3 ოთახი", "გარაჟი 2 მანქანაზე", "panoramic ხედი"],
    accent: "oklch(0.68 0.15 200)",
  },
  {
    id: "boost-xp", cat: "boosts", name: "XP Boost x2", sub: "7 დღე ორმაგი გამოცდილება",
    price: 19,
    perks: ["ვრცელდება ყველა აქტივობაზე", "stack ხდება VIP-თან"],
    accent: "oklch(0.78 0.2 320)",
  },
  {
    id: "boost-cash", cat: "boosts", name: "Cash Boost +30%", sub: "14 დღე ფულის ბუსტი",
    price: 29,
    perks: ["ყველა ლეგალური სამუშაო", "მუშაობს offline ჯილდოებზე"],
    accent: "oklch(0.8 0.18 140)",
  },
  {
    id: "svc-namechange", cat: "services", name: "სახელის შეცვლა", sub: "ერთჯერადი მომსახურება",
    price: 9,
    perks: ["სრულად უსაფრთხო", "ისტორია შენახული"],
    accent: "oklch(0.7 0.05 250)",
  },
  {
    id: "svc-unban", cat: "services", name: "ბანის გასაჩივრება", sub: "პრიორიტეტული განხილვა",
    price: 25,
    perks: ["24სთ პასუხი", "პერსონალური მენეჯერი"],
    accent: "oklch(0.6 0.18 30)",
  },
];

// ── Animated wrapper ─────────────────────────────────────────────────────────
function FadeIn({ children, delay = 0, direction = "up", className = "" }) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 50 + delay);
    return () => clearTimeout(timer);
  }, [delay]);

  const getTransform = () => {
    switch(direction) {
      case "up": return "translateY(60px) scale(0.92)";
      case "down": return "translateY(-60px) scale(0.92)";
      case "left": return "translateX(-60px) scale(0.92)";
      case "right": return "translateX(60px) scale(0.92)";
      case "scale": return "scale(0.7) rotate(-3deg)";
      case "fade": return "scale(0.85)";
      default: return "translateY(60px) scale(0.92)";
    }
  };

  return (
    <div
      className={className}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? "translateY(0) scale(1) rotate(0deg)" : getTransform(),
        transition: `opacity 0.8s cubic-bezier(0.22, 1, 0.36, 1) ${delay}ms, 
                     transform 0.8s cubic-bezier(0.22, 1, 0.36, 1) ${delay}ms,
                     filter 0.8s cubic-bezier(0.22, 1, 0.36, 1) ${delay}ms`,
        filter: isVisible ? "blur(0px)" : "blur(8px)",
        willChange: "opacity, transform, filter",
      }}
    >
      {children}
    </div>
  );
}

// ── ProductCard ──────────────────────────────────────────────────────────────
function ProductCard({ p, onAdd, qty, index }) {
  const [isAdded, setIsAdded] = useState(false);

  useEffect(() => {
    setIsAdded(qty > 0);
  }, [qty]);

  const handleAdd = () => {
    onAdd();
    setIsAdded(true);
  };

  return ( 
    <FadeIn direction="up" delay={200 + index * 80}>
      <article className="group relative rounded-2xl border border-border bg-card/40 backdrop-blur-sm overflow-hidden hover:border-pink/60 hover:-translate-y-1 hover:shadow-[0_20px_60px_-20px_rgba(255,45,120,0.3)] transition-all duration-500">
        {/* Visual */}
        <div className="relative h-44 overflow-hidden">
          <div
            className="absolute inset-0 transition-transform duration-700 group-hover:scale-110"
            style={{
              background: `radial-gradient(circle at 30% 30%, ${p.accent}, transparent 70%), linear-gradient(135deg, oklch(0.15 0.02 0), oklch(0.08 0.02 0))`,
            }}
          />
          <div className="absolute inset-0 opacity-[0.07] mix-blend-overlay bg-[repeating-linear-gradient(45deg,#fff_0_1px,transparent_1px_8px)]" />
          <div className="absolute top-3 left-3 flex gap-2">
            {p.badge && (
              <span className="text-[10px] tracking-widest px-2 py-1 rounded bg-pink text-pink-foreground font-medium animate-pulse">
                {p.badge}
              </span>
            )}
            {p.old && (
              <span className="text-[10px] tracking-widest px-2 py-1 rounded bg-background/80 text-muted-foreground">
                -{Math.round((1 - p.price / p.old) * 100)}%
              </span>
            )}
          </div>
          <div className="absolute bottom-3 right-3 font-mono text-[10px] tracking-widest text-foreground/40">
            #{p.id.toUpperCase()}
          </div>
        </div>

        {/* Body */}
        <div className="p-5">
          <div className="font-display text-xl tracking-wide group-hover:text-pink transition-colors duration-300">{p.name}</div>
          <div className="text-xs text-muted-foreground mt-1">{p.sub}</div>

          <ul className="mt-4 space-y-1.5">
            {p.perks.map((perk, i) => (
              <li key={i} className="flex items-start gap-2 text-[12px] text-muted-foreground group-hover:text-foreground transition-colors duration-300" style={{ transitionDelay: `${i * 50}ms` }}>
                <Check size={12} className="mt-0.5 text-pink shrink-0 group-hover:scale-110 transition-transform duration-300" />
                <span>{perk}</span>
              </li>
            ))}
          </ul>

          <div className="mt-5 flex items-end justify-between">
            <div className="flex items-baseline gap-2">
              <span className="font-display text-3xl text-pink group-hover:scale-105 transition-transform duration-300 inline-block">{p.price}₾</span>
              {p.old && (
                <span className="text-xs text-muted-foreground line-through">{p.old}₾</span>
              )}
            </div>
            <button
              onClick={handleAdd}
              className={`inline-flex cursor-pointer items-center gap-2 px-4 py-2.5 rounded-xl border text-xs transition-all duration-300 ${
                isAdded
                  ? "bg-pink text-pink-foreground border-pink shadow-[0_0_30px_rgba(255,45,120,0.4)] hover:bg-pink/80 hover:scale-110 hover:shadow-[0_0_50px_rgba(255,45,120,0.6)]"
                  : "bg-foreground/5 border-border text-foreground hover:bg-pink hover:text-pink-foreground hover:border-pink hover:scale-105 hover:shadow-[0_0_30px_rgba(255,45,120,0.2)]"
              }`}
            >
              {qty > 0 ? (
                <><Check size={14} className="animate-bounce" /> კალათაში · {qty}</>
              ) : (
                <><Plus size={14} className="group-hover:rotate-90 transition-transform duration-300" /> დამატება</>
              )}
            </button>
          </div>
        </div>
      </article>
    </FadeIn>
  );
}

// ── ShopPage ─────────────────────────────────────────────────────────────────
function ShopPage() {
  const [active, setActive] = useState("all");
  const [cart, setCart] = useState({});
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const filtered = useMemo(
    () => (active === "all" ? products : products.filter((p) => p.cat === active)),
    [active]
  );

  const totals = useMemo(() => {
    let count = 0, sum = 0;
    for (const id in cart) {
      const p = products.find((x) => x.id === id);
      if (!p) continue;
      count += cart[id];
      sum += cart[id] * p.price;
    }
    return { count, sum };
  }, [cart]);

  const add = (id) => setCart((c) => ({ ...c, [id]: (c[id] || 0) + 1 }));
  const sub = (id) =>
    setCart((c) => {
      const next = { ...c };
      if (!next[id]) return next;
      next[id] -= 1;
      if (next[id] <= 0) delete next[id];
      return next;
    });
  const remove = (id) =>
    setCart((c) => {
      const next = { ...c };
      delete next[id];
      return next;
    });

  if (!mounted) return null;

  return (
    <div className="shop-page">
    <main className="min-h-screen pt-28 pb-24 px-6">
      <div className="max-w-7xl mx-auto">

        {/* Hero */}
        <FadeIn direction="up" delay={100}>
          <section className="mt-8 relative overflow-hidden rounded-3xl border border-border bg-linear-to-br from-card/60 via-card/30 to-background p-8 md:p-14 hover:border-pink/30 transition-all duration-500">
            <div className="absolute top-0 right-0 w-160 h-160 -translate-y-1/3 translate-x-1/3 bg-pink/15 blur-[120px] rounded-full animate-pulse" style={{ animationDuration: '8s' }} />
            <div className="relative grid md:grid-cols-[1.5fr_1fr] gap-10 items-center">
              <div>
                <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full border border-border bg-background/60 text-xs tracking-[0.2em] uppercase hover:border-pink/50 transition-all duration-300">
                  <Shield size={12} className="text-pink animate-pulse" /> 
                  უსაფრთხო გადახდები · ინსტანტ მიწოდება
                </div>
                <h1 className="font-display mt-6 text-5xl md:text-7xl leading-[0.9] tracking-tight">
                  <span className="block hover:translate-x-2 transition-transform duration-500">GSRL</span>
                  <span className="block text-pink glow-pink hover:scale-105 transition-transform duration-500 ">მაღაზია</span>
                </h1>
                <p className="mt-6 text-muted-foreground max-w-xl leading-relaxed hover:text-foreground transition-colors duration-500">
                  გააძლიერე გეიმფლეი ექსკლუზიური ნივთებით — VIP სტატუსები, სუპერ კარები, ვილები
                  და ბუსტერები. ყველა შენაძენი ეხმარება სერვერის განვითარებას.
                </p>
                <div className="mt-8 flex flex-wrap gap-3 text-xs">
                  {[
                    { icon: Lock, text: "256-bit SSL" },
                    { icon: Check, text: "ავტომატური მიწოდება" },
                    { icon: Sparkles, text: "14 დღიანი დაბრუნება" }
                  ].map((item, i) => (
                    <span key={i} className="px-3 py-2 rounded-full bg-card border border-border hover:border-pink/50 hover:bg-pink/5 transition-all duration-300 hover:scale-105">
                      <item.icon size={12} className="inline mr-2 text-pink" /> {item.text}
                    </span>
                  ))}
                </div>
              </div>

              {/* Feature card */}
              <div className="relative rounded-2xl border border-border bg-background/70 backdrop-blur-sm p-6 shadow-[0_20px_60px_-20px_oklch(0.68_0.27_0/0.4)] hover:shadow-[0_30px_80px_-20px_rgba(255,45,120,0.6)] hover:border-pink/50 transition-all duration-500 hover:scale-105">
                <div className="font-mono text-[10px] tracking-[0.3em] text-pink animate-pulse">// HOT DEAL</div>
                <div className="mt-3 font-display text-2xl hover:text-pink transition-colors duration-300">PLATINUM BUNDLE</div>
                <div className="text-xs text-muted-foreground mt-1">VIP + Zentorno + Vinewood Villa</div>
                <div className="mt-6 flex items-end gap-3">
                  <span className="font-display text-5xl text-pink glow-pink hover:scale-110 transition-transform duration-300 inline-block">499₾</span>
                  <span className="text-sm text-muted-foreground line-through mb-2">597₾</span>
                  <span className="ml-auto text-[10px] tracking-widest px-2 py-1 rounded bg-pink/15 text-pink animate-pulse">-16%</span>
                </div>
                <button className="mt-6 w-full cursor-pointer btn-pink py-3 rounded-xl text-sm hover:scale-105 hover:shadow-[0_0_40px_rgba(255,45,120,0.4)] transition-all duration-300">
                  შეიძინე ახლავე
                </button>
              </div>
            </div>
          </section>
        </FadeIn>

        {/* Body */}
        <div className="mt-12 grid lg:grid-cols-[1fr_340px] gap-10 items-start">
          <div>
            {/* Tabs */}
            <FadeIn direction="up" delay={200}>
              <div className="flex flex-wrap gap-2 mb-8">
                {categories.map((c) => {
                  const Icon = c.icon;
                  const isActive = active === c.id;
                  return (
                    <button
                      key={c.id}
                      onClick={() => setActive(c.id)}
                      className={`inline-flex cursor-pointer items-center gap-2 px-4 py-2.5 rounded-full text-xs tracking-wider uppercase border transition-all duration-300 ${
                        isActive
                          ? "bg-pink text-pink-foreground border-pink shadow-[0_8px_24px_-8px_oklch(0.68_0.27_0/0.6)] scale-105"
                          : "bg-card/40 border-border text-muted-foreground hover:text-foreground hover:border-pink/50 hover:scale-105 hover:shadow-[0_0_30px_rgba(255,45,120,0.1)]"
                      }`}
                    >
                      <Icon size={14} className={isActive ? "animate-pulse" : ""} />
                      {c.label}
                    </button>
                  );
                })}
              </div>
            </FadeIn>

            {/* Grid */}
            <div className="grid sm:grid-cols-2 gap-5">
              {filtered.map((p, index) => (
                <ProductCard key={p.id} p={p} onAdd={() => add(p.id)} qty={cart[p.id] || 0} index={index} />
              ))}
            </div>
          </div>

          {/* Cart */}
          <FadeIn direction="right" delay={300}>
            <aside className="lg:sticky lg:top-28 rounded-2xl border border-border bg-card/40 backdrop-blur-sm overflow-hidden hover:border-pink/30 transition-all duration-500 hover:shadow-[0_0_40px_rgba(255,45,120,0.05)]">
              <div className="flex items-center justify-between px-5 py-4 border-b border-border">
                <div className="flex items-center gap-2">
                  <ShoppingBag size={16} className="text-pink animate-pulse" />
                  <span className="font-display tracking-widest text-sm">კალათა</span>
                </div>
                <span className="font-mono text-xs text-muted-foreground">{totals.count} ნივთი</span>
              </div>

              <div className="p-5 max-h-105 overflow-auto">
                {totals.count === 0 ? (
                  <div className="text-center py-10">
                    <div className="w-14 h-14 mx-auto rounded-full bg-background/60 border border-border flex items-center justify-center hover:border-pink/50 transition-all duration-300 hover:scale-110">
                      <ShoppingBag size={20} className="text-muted-foreground hover:text-pink transition-colors duration-300" />
                    </div>
                    <p className="mt-4 text-sm text-muted-foreground">კალათა ცარიელია</p>
                    <p className="text-[11px] text-muted-foreground/70 mt-1">დაამატე ნივთები მაღაზიიდან</p>
                  </div>
                ) : (
                  <ul className="space-y-4">
                    {Object.keys(cart).map((id) => {
                      const p = products.find((x) => x.id === id);
                      if (!p) return null;
                      const qty = cart[id];
                      return (
                        <li key={id} className="flex items-start gap-3 hover:bg-pink/5 p-2 rounded-xl transition-all duration-300">
                          <div
                            className="w-10 h-10 rounded-lg shrink-0 transition-transform duration-300 hover:scale-110"
                            style={{ background: p.accent }}
                          />
                          <div className="flex-1 min-w-0">
                            <div className="text-sm line-clamp-1">{p.name}</div>
                            <div className="text-[11px] text-muted-foreground">{p.price}₾ × {qty}</div>
                            <div className="mt-2 inline-flex items-center border border-border rounded-md overflow-hidden">
                              <button onClick={() => sub(id)} className="px-2 py-1 cursor-pointer hover:text-pink hover:bg-pink/10 transition-all duration-300" aria-label="minus">
                                <Minus size={12} />
                              </button>
                              <span className="px-2 font-mono text-xs min-w-5 text-center">{qty}</span>
                              <button onClick={() => add(id)} className="px-2 py-1 cursor-pointer hover:text-pink hover:bg-pink/10 transition-all duration-300" aria-label="plus">
                                <Plus size={12} />
                              </button>
                            </div>
                          </div>
                          <button onClick={() => remove(id)} className="text-muted-foreground cursor-pointer hover:text-destructive p-1 transition-all duration-300 hover:scale-110" aria-label="remove">
                            <Trash2 size={16} />
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>

              <div className="border-t border-border px-5 py-5 bg-background/40">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">ჯამი</span>
                  <span className="font-display text-2xl text-pink glow-pink hover:scale-110 transition-transform duration-300 inline-block">{totals.sum}₾</span>
                </div>
                <button
                  disabled={!totals.count}
                  className="mt-4 w-full cursor-pointer btn-pink py-3 rounded-xl text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:scale-105 hover:shadow-[0_0_40px_rgba(255,45,120,0.4)] transition-all duration-300"
                >
                  გადახდაზე გადასვლა
                </button>
                <p className="text-[10px] text-muted-foreground text-center mt-3">
                  ვიღებთ ბარათით, Apple/Google Pay-ით და კრიპტოთი
                </p>
              </div>
            </aside>
          </FadeIn>
        </div>
      </div>
    </main>
    </div>
  );
}

export default ShopPage;
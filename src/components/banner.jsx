function Banner() {
  const items = ["LOS SANTOS", "★", "SAN ANDREAS", "★", "ROLEPLAY", "★", "SINCE 2024", "★"];
  return (
    <div className="relative border-y border-border bg-ink/60 overflow-hidden py-5">
      <div className="flex marquee whitespace-nowrap">
        {[...items, ...items, ...items, ...items].map((it, i) => (
          <span
            key={i}
            className="font-display font-bold text-2xl lg:text-3xl tracking-[0.2em] px-8 text-foreground/70"
            style={{fontFamily: `"Bebas Neue", "Noto Sans Georgian", sans-serif`}}
          >
            {it === "★" ? <span className="text-neon  ">{it}</span> : it}
          </span>
        ))}
      </div>
    </div>
  );
}

export default Banner
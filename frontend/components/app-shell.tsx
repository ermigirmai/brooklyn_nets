"use client";

import { useState } from "react";

const navItems = [
  { label: "Evaluate", glyph: "01", active: true },
  { label: "Challenge Assist", glyph: "02" },
  { label: "Reports", glyph: "03" },
];

export function AppShell({ children, onNavigate, userName }: Readonly<{ children: React.ReactNode; onNavigate?: (label: string) => void; userName: string }>) {
  const [activeNav, setActiveNav] = useState("Evaluate");
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-[#090909] text-[#f4f3ee]">
      <aside className={`fixed inset-y-0 left-0 z-20 hidden border-r border-white/10 bg-[#101010] transition-[width] duration-200 lg:flex lg:flex-col ${collapsed ? "w-[72px]" : "w-[232px]"}`}>
        <div className={`relative flex items-start pt-7 ${collapsed ? "justify-center px-2" : "px-6"}`}>
          <img src={collapsed ? "/brand/brooklyn-nets-primary.svg" : "/brand/brooklyn-nets-alternate.png"} alt="Brooklyn Nets" className={collapsed ? "h-12 w-12 object-contain" : "h-20 w-[184px] object-contain"} />
        </div>
        <button type="button" onClick={() => setCollapsed((value) => !value)} aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"} className="absolute -right-3 top-1/2 z-30 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-full border border-white/20 bg-[#171717] text-lg text-white shadow-lg transition hover:border-white/60 hover:bg-[#252525]">{collapsed ? "›" : "‹"}</button>

        <nav className={`mt-12 ${collapsed ? "px-2" : "px-3"}`}>
          {navItems.map((item) => (
            <button key={item.label} title={collapsed ? item.label : undefined} onClick={() => { setActiveNav(item.label); onNavigate?.(item.label); }} className={`mb-1 flex w-full items-center border-l-2 py-3 text-left text-sm transition ${collapsed ? "justify-center px-2" : "gap-4 px-4"} ${activeNav === item.label ? "border-white bg-white/[0.06] font-bold text-white" : "border-transparent text-white/50 hover:bg-white/[0.04] hover:text-white"}`}>
              <span className="font-mono text-[10px] text-white/35">{item.glyph}</span>{!collapsed && item.label}
            </button>
          ))}
        </nav>

        <div className={`mt-auto border-t border-white/10 ${collapsed ? "p-5" : "p-6"}`}>
          <div className={`flex ${collapsed ? "justify-center" : "items-center gap-3"}`}>
            <div className="grid h-8 w-8 place-items-center rounded-full bg-[#e84b37] text-xs font-black">EA</div>
          </div>
        </div>
      </aside>

      <div className={`transition-[padding] duration-200 ${collapsed ? "lg:pl-[72px]" : "lg:pl-[232px]"}`}>
        <header className="relative flex h-[72px] items-center justify-center border-b border-white/10 bg-[#0c0c0c] px-5 md:px-8">
          <p className="text-lg font-black tracking-[-.06em]">BROOOOOOOOOK-LYNNNN!</p>
          <p className="absolute right-5 text-xl font-medium tracking-[-.03em] text-white/65 md:right-8 md:text-2xl">Hi, <span className="font-black text-white">{userName}</span></p>
        </header>
        {children}
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";

const navItems = [
  { label: "Evaluate", glyph: "01", active: true },
  { label: "Players", glyph: "02" },
  { label: "Teams", glyph: "03" },
  { label: "Reports", glyph: "04" },
];

export function AppShell({ children }: Readonly<{ children: React.ReactNode }>) {
  const [activeNav, setActiveNav] = useState("Evaluate");

  return (
    <div className="min-h-screen bg-[#090909] text-[#f4f3ee]">
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-[232px] border-r border-white/10 bg-[#101010] lg:flex lg:flex-col">
        <div className="px-6 pt-7">
          <img src="/brand/brooklyn-nets-primary.svg" alt="Brooklyn Nets" className="h-20 w-20 object-contain" />
        </div>

        <nav className="mt-12 px-3">
          {navItems.map((item) => (
            <button key={item.label} onClick={() => setActiveNav(item.label)} className={`mb-1 flex w-full items-center gap-4 border-l-2 px-4 py-3 text-left text-sm transition ${activeNav === item.label ? "border-white bg-white/[0.06] font-bold text-white" : "border-transparent text-white/50 hover:bg-white/[0.04] hover:text-white"}`}>
              <span className="font-mono text-[10px] text-white/35">{item.glyph}</span>{item.label}
            </button>
          ))}
        </nav>

        <div className="mt-auto border-t border-white/10 p-6">
          <div className="flex items-center gap-3">
            <div className="grid h-8 w-8 place-items-center rounded-full bg-[#e84b37] text-xs font-black">EA</div>
          </div>
        </div>
      </aside>

      <div className="lg:pl-[232px]">
        <header className="relative flex h-[72px] items-center justify-center border-b border-white/10 bg-[#0c0c0c] px-5 md:px-8">
          <p className="text-lg font-black tracking-[-.06em]">BROOOOOOOOOK-LYNNNN!</p>
          <p className="absolute right-5 text-sm text-white/55 md:right-8">Hi, <span className="font-bold text-white">Ermi</span></p>
        </header>
        {children}
      </div>
    </div>
  );
}

"use client";

import Link from "next/link";
import { useState } from "react";
import { PlayerSearch } from "./player-search";

const navItems = [
  { label: "Evaluate", glyph: "01", active: true },
  { label: "Players", glyph: "02" },
  { label: "Teams", glyph: "03" },
  { label: "Reports", glyph: "04" },
];

const teams = ["ATL","BOS","BKN","CHA","CHI","CLE","DAL","DEN","DET","GSW","HOU","IND","LAC","LAL","MEM","MIA","MIL","MIN","NOP","NYK","OKC","ORL","PHI","PHX","POR","SAC","SAS","TOR","UTA","WAS"];
export function AppShell({ children, onPlayerSelect, team, onTeamChange }: Readonly<{ children: React.ReactNode; onPlayerSelect?: (slug: string) => void; team?: string; onTeamChange?: (team: string) => void }>) {
  const [activeNav, setActiveNav] = useState("Evaluate");

  return (
    <div className="min-h-screen bg-[#090909] text-[#f4f3ee]">
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-[232px] border-r border-white/10 bg-[#101010] lg:flex lg:flex-col">
        <div className="px-6 pt-7">
          <Link href="/" className="block">
            <div className="flex items-center gap-3">
              <img src="/brand/bklyn-nets-city-edition.png" alt="BKL​YN NETS City Edition" className="h-12 w-[102px] object-cover" />
              <p className="border-l border-white/15 pl-3 text-[9px] font-bold uppercase leading-4 tracking-[0.14em] text-white/45">Basketball<br />operations</p>
            </div>
          </Link>
          <p className="mt-7 text-[10px] font-bold uppercase tracking-[0.16em] text-white/45">Player evaluation workspace</p>
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
            <div><p className="text-xs font-bold">Ermi A.</p><p className="mt-0.5 text-[10px] uppercase tracking-wider text-white/40">Analyst</p></div>
          </div>
        </div>
      </aside>

      <div className="lg:pl-[232px]">
        <header className="flex h-[72px] items-center justify-between border-b border-white/10 bg-[#0c0c0c] px-5 md:px-8">
          <img src="/brand/bklyn-nets-city-edition.png" alt="BKL​YN NETS City Edition" className="h-9 w-[76px] object-cover lg:hidden" />
          <PlayerSearch onSelect={onPlayerSelect} />
          <div className="flex items-center gap-4 text-xs text-white/50"><select aria-label="Reference team" value={team} onChange={(e) => onTeamChange?.(e.target.value)} className="border border-white/15 bg-[#0c0c0c] px-2 py-1 text-xs text-white">{teams.map((code) => <option key={code}>{code}</option>)}</select><img src="/brand/bklyn-nets-city-edition.png" alt="BKL​YN NETS City Edition" className="h-8 w-[68px] object-cover" /></div>
        </header>
        {children}
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { TrendChart } from "@/components/trend-chart";
import { RealDataPreview } from "@/components/real-data-preview";
import type { PlayerEvaluation } from "@/lib/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
const money = (value: number) => `$${(value / 1_000_000).toFixed(1)}M`;

export function PlayerWorkspace() {
  const [player, setPlayer] = useState<PlayerEvaluation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => { loadPlayer("mikal-bridges"); }, []);

  async function loadPlayer(slug: string) {
    setLoading(true); setError(false);
    try {
      const response = await fetch(`${API_URL}/api/v1/players/${slug}`);
      if (!response.ok) throw new Error("Player unavailable");
      setPlayer(await response.json());
    } catch { setError(true); } finally { setLoading(false); }
  }

  return <AppShell onPlayerSelect={loadPlayer}><main className="mx-auto max-w-[1460px] px-5 py-7 md:px-8 lg:px-10">{loading && <p className="py-24 text-center text-sm text-white/45">Loading player evaluation…</p>}{error && <p className="py-24 text-center text-sm text-white/45">The player API is unavailable. Start the FastAPI service on port 8000.</p>}{player && !loading && <PlayerProfile player={player} onSelectPlayer={loadPlayer} />}</main></AppShell>;
}

export function PlayerProfile({ player, onSelectPlayer }: { player: PlayerEvaluation; onSelectPlayer: (slug: string) => void }) {
  return <>
    <header className="border border-white/10 bg-[#121212] p-6 md:p-8"><div className="flex flex-wrap items-end justify-between gap-8"><div><img src="/brand/bklyn-nets-city-edition.png" alt="BKL​YN NETS City Edition" className="h-11 w-[94px] object-cover" /><h1 className="mt-5 text-5xl font-black tracking-[-0.075em] md:text-6xl">{player.identity.name}</h1><p className="mt-3 text-sm text-white/55">{player.identity.team} · {player.identity.position} · #{player.identity.jersey_number}</p></div><div className="flex gap-7 border-l border-white/15 pl-6 text-right text-sm"><span><b className="text-2xl">{player.identity.age}</b><br /><i className="not-italic text-[10px] uppercase tracking-wider text-white/40">Age</i></span><span><b className="text-2xl">{player.identity.height}</b><br /><i className="not-italic text-[10px] uppercase tracking-wider text-white/40">Height</i></span><span><b className="text-2xl">{player.identity.experience}</b><br /><i className="not-italic text-[10px] uppercase tracking-wider text-white/40">Seasons</i></span></div></div></header>
    <section className="mt-5 grid gap-px overflow-hidden border border-white/10 bg-white/10 md:grid-cols-4">{player.key_metrics.map((metric) => <article key={metric.label} className="bg-[#121212] p-5"><p className="text-[10px] font-bold tracking-[0.16em] text-white/45">{metric.label}</p><p className="mt-5 text-4xl font-black tracking-[-0.06em]">{metric.display_value}</p><div className="mt-4 h-1 bg-white/10"><div className="h-full bg-white" style={{ width: `${metric.percentile}%` }} /></div><p className="mt-2 text-[11px] font-bold text-white/60">{metric.percentile}TH PERCENTILE</p></article>)}</section>
    <section className="mt-5 grid gap-5 xl:grid-cols-[1.45fr_0.8fr]"><TrendChart seasons={player.season_trends} /><article className="border border-white/10 bg-[#121212] p-6"><p className="text-[10px] font-bold uppercase tracking-[0.16em] text-white/40">Contract context</p><p className="mt-5 text-4xl font-black tracking-[-0.06em]">{money(player.contract.current_salary)}</p><p className="mt-1 text-[11px] font-bold uppercase tracking-wider text-white/60">Current salary</p><dl className="mt-8 space-y-4 border-t border-white/10 pt-5 text-sm"><div className="flex justify-between"><dt className="text-white/45">Years remaining</dt><dd className="font-bold">{player.contract.years_remaining}</dd></div><div className="flex justify-between"><dt className="text-white/45">Cap share</dt><dd className="font-bold">{player.contract.cap_percentage}%</dd></div><div className="flex justify-between"><dt className="text-white/45">Structure</dt><dd className="font-bold">{player.contract.contract_type}</dd></div></dl></article></section>
    <RealDataPreview />
    <section className="mt-5 grid gap-5 xl:grid-cols-[1.45fr_0.8fr]"><div className="grid gap-5 md:grid-cols-3">{player.composites.map((metric) => <article key={metric.name} className="border border-white/10 bg-[#121212] p-5"><div className="flex justify-between gap-2"><h2 className="text-xs font-black uppercase tracking-[0.1em]">{metric.name}</h2><span className="text-[10px] font-bold text-white/60">{metric.percentile}TH</span></div><p className="mt-6 text-4xl font-black tracking-[-0.06em]">{metric.score}</p><p className="mt-5 text-xs leading-5 text-white/55">{metric.interpretation}</p></article>)}</div><article className="border border-white/10 bg-[#121212] p-6"><p className="text-[10px] font-bold uppercase tracking-[0.16em] text-white/40">Scout notes</p><ul className="mt-5 space-y-3 text-xs leading-5 text-white/70">{player.scout_notes.map((note) => <li key={note} className="border-l-2 border-white/40 pl-3">{note}</li>)}</ul></article></section>
    <section className="mt-5 border border-white/10 bg-[#121212] p-6"><h2 className="text-sm font-black uppercase tracking-[0.12em]">Similar players</h2><div className="mt-5 grid gap-px bg-white/10 md:grid-cols-3">{player.similar_players.map((similar) => <button onClick={() => onSelectPlayer(similar.slug)} key={similar.slug} className="bg-[#121212] p-5 text-left transition hover:bg-white/[0.04]"><div className="flex items-start justify-between gap-4"><div><p className="font-bold">{similar.name}</p><p className="mt-1 text-[10px] uppercase tracking-wider text-white/40">{similar.team} · {similar.position}</p></div><p className="text-lg font-black">{similar.similarity_score}</p></div><p className="mt-5 text-xs leading-5 text-white/55">{similar.shared_traits.join(" · ")}</p></button>)}</div></section>
  </>;
}

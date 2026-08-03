import Link from "next/link";
import { notFound } from "next/navigation";
import { getPlayer } from "@/lib/api";
import type { PlayerEvaluation } from "@/lib/types";
import { AppShell } from "@/components/app-shell";

const money = (value: number) => `$${(value / 1_000_000).toFixed(1)}M`;

export default async function PlayerPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  let player: PlayerEvaluation;
  try { player = await getPlayer(slug); } catch { notFound(); }

  return (
    <AppShell>
      <main className="mx-auto max-w-[1460px] px-5 py-7 md:px-8 lg:px-10">
        <div className="flex items-center justify-between"><Link href="/" className="text-[11px] font-bold uppercase tracking-[0.16em] text-white/45 transition hover:text-white">← Player index</Link><span className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/45">Player dossier / 01</span></div>
        <header className="relative mt-7 overflow-hidden border border-white/10 bg-[#121212] p-6 md:p-8">
          <div className="relative flex flex-wrap items-end justify-between gap-8">
            <div><img src="/brand/bklyn-nets-city-edition.png" alt="BKL​YN NETS City Edition" className="h-11 w-[94px] object-cover" /><h1 className="mt-5 text-5xl font-black tracking-[-0.075em] md:text-6xl">{player.identity.name}</h1><p className="mt-3 text-sm text-white/55">{player.identity.position} <span className="mx-2 text-white/25">/</span> #{player.identity.jersey_number} <span className="mx-2 text-white/25">/</span> {player.identity.weight} lbs</p></div>
            <div className="flex gap-7 border-l border-white/15 pl-6 text-right text-sm md:gap-10"><span><b className="text-2xl">{player.identity.age}</b><br /><i className="not-italic text-[10px] uppercase tracking-wider text-white/40">Age</i></span><span><b className="text-2xl">{player.identity.height}</b><br /><i className="not-italic text-[10px] uppercase tracking-wider text-white/40">Height</i></span><span><b className="text-2xl">{player.identity.experience}</b><br /><i className="not-italic text-[10px] uppercase tracking-wider text-white/40">Seasons</i></span></div>
          </div>
        </header>

        <section className="mt-5 grid gap-px overflow-hidden border border-white/10 bg-white/10 md:grid-cols-4">
        {player.key_metrics.map((metric, index) => <article key={metric.label} className="bg-[#121212] p-5"><div className="flex items-start justify-between"><p className="text-[10px] font-bold tracking-[0.16em] text-white/45">{metric.label}</p><span className="font-mono text-[10px] text-white/30">0{index + 1}</span></div><p className="mt-5 text-4xl font-black tracking-[-0.06em]">{metric.display_value}</p><div className="mt-4 h-1 bg-white/10"><div className="h-full bg-white" style={{ width: `${metric.percentile}%` }} /></div><p className="mt-2 text-[11px] font-bold text-white/60">{metric.percentile}TH PERCENTILE</p></article>)}
        </section>

      <section className="mt-5 grid gap-5 xl:grid-cols-[1.45fr_0.8fr]">
          <article className="border border-white/10 bg-[#121212] p-6"><div className="flex items-center justify-between"><h2 className="text-sm font-black uppercase tracking-[0.12em]">Production trajectory</h2><span className="text-[10px] uppercase tracking-wider text-white/35">Per game</span></div><div className="mt-7 grid grid-cols-5 border-b border-white/10 pb-3 text-[10px] font-bold uppercase tracking-wider text-white/35"><span>Season</span><span>Points</span><span>True shooting</span><span>Usage</span><span>Minutes</span></div><div>{player.season_trends.map((season) => <div key={season.season} className="grid grid-cols-5 border-b border-white/10 py-5 text-sm last:border-0"><span className="font-bold">{season.season}</span><span>{season.points}<small className="ml-1 text-[10px] text-white/35">PPG</small></span><span>{season.true_shooting}%</span><span>{season.usage}%</span><span>{season.minutes}<small className="ml-1 text-[10px] text-white/35">MPG</small></span></div>)}</div></article>
          <article className="border border-white/10 bg-[#121212] p-6"><p className="text-[10px] font-bold uppercase tracking-[0.16em] text-white/40">Contract context</p><p className="mt-5 text-4xl font-black tracking-[-0.06em]">{money(player.contract.current_salary)}</p><p className="mt-1 text-[11px] font-bold uppercase tracking-wider text-white/60">Current salary</p><dl className="mt-8 space-y-4 border-t border-white/10 pt-5 text-sm"><div className="flex justify-between"><dt className="text-white/45">Years remaining</dt><dd className="font-bold">{player.contract.years_remaining}</dd></div><div className="flex justify-between"><dt className="text-white/45">Cap share</dt><dd className="font-bold">{player.contract.cap_percentage}%</dd></div><div className="flex justify-between"><dt className="text-white/45">Structure</dt><dd className="font-bold">{player.contract.contract_type}</dd></div></dl></article>
        </section>

        <section className="mt-5 grid gap-5 xl:grid-cols-[1.45fr_0.8fr]">
          <div className="grid gap-5 md:grid-cols-3">{player.composites.map((metric) => <article key={metric.name} className="border border-white/10 bg-[#121212] p-5"><div className="flex justify-between gap-2"><h2 className="text-xs font-black uppercase tracking-[0.1em]">{metric.name}</h2><span className="text-[10px] font-bold text-white/60">{metric.percentile}TH</span></div><p className="mt-6 text-4xl font-black tracking-[-0.06em]">{metric.score}</p><p className="mt-1 text-[10px] uppercase tracking-wider text-white/35">Composite score / 100</p><p className="mt-5 text-xs leading-5 text-white/55">{metric.interpretation}</p></article>)}</div>
          <article className="border border-white/10 bg-[#121212] p-6"><p className="text-[10px] font-bold uppercase tracking-[0.16em] text-white/40">Scout notes</p><ul className="mt-5 space-y-3 text-xs leading-5 text-white/70">{player.scout_notes.map((note) => <li key={note} className="border-l-2 border-white/40 pl-3">{note}</li>)}</ul></article>
      </section>

      <section className="mt-5 border border-white/10 bg-[#121212] p-6">
        <div className="flex items-center justify-between"><h2 className="text-sm font-black uppercase tracking-[0.12em]">Similar players</h2><span className="text-[10px] uppercase tracking-wider text-white/35">Role &amp; production profile</span></div>
        <div className="mt-5 grid gap-px bg-white/10 md:grid-cols-3">{player.similar_players.map((similar) => <Link href={`/players/${similar.slug}`} key={similar.slug} className="bg-[#121212] p-5 transition hover:bg-white/[0.04]"><div className="flex items-start justify-between gap-4"><div><p className="font-bold">{similar.name}</p><p className="mt-1 text-[10px] uppercase tracking-wider text-white/40">{similar.team} · {similar.position}</p></div><p className="text-lg font-black">{similar.similarity_score}</p></div><p className="mt-5 text-xs leading-5 text-white/55">{similar.shared_traits.join(" · ")}</p></Link>)}</div>
      </section>
    </main>
    </AppShell>
  );
}

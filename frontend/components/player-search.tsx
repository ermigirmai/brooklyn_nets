"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type SearchResult = { slug: string; name: string; team: string; position: string };
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export function PlayerSearch() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!query.trim()) { setResults([]); return; }
    const controller = new AbortController();
    fetch(`${API_URL}/api/v1/players?q=${encodeURIComponent(query)}`, { signal: controller.signal })
      .then((response) => response.ok ? response.json() : [])
      .then(setResults)
      .catch(() => {});
    return () => controller.abort();
  }, [query]);

  function selectPlayer(slug: string) {
    setQuery("");
    setOpen(false);
    router.push(`/players/${slug}`);
  }

  return (
    <div className="relative hidden md:block">
      <input
        value={query}
        onChange={(event) => { setQuery(event.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
        onKeyDown={(event) => { if (event.key === "Enter" && results[0]) selectPlayer(results[0].slug); if (event.key === "Escape") setOpen(false); }}
        placeholder="Search players…"
        className="w-72 rounded-sm border border-white/10 bg-white/[0.03] px-3 py-2 text-xs text-white outline-none placeholder:text-white/40 focus:border-white/40"
      />
      {open && query.trim() && (
        <div className="absolute left-0 top-11 z-30 w-80 border border-white/15 bg-[#151515] p-1 shadow-2xl">
          {results.length ? results.map((player) => <button key={player.slug} onMouseDown={() => selectPlayer(player.slug)} className="block w-full px-3 py-3 text-left hover:bg-white/[0.06]"><span className="block text-sm font-bold">{player.name}</span><span className="mt-1 block text-[10px] uppercase tracking-wider text-white/45">{player.team} · {player.position}</span></button>) : <p className="px-3 py-4 text-xs text-white/45">No matching players</p>}
        </div>
      )}
    </div>
  );
}

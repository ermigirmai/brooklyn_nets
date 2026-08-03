"use client";

import { useMemo, useState } from "react";
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { SeasonTrend } from "@/lib/types";

const metrics = [
  { key: "points", label: "ORtg", color: "#ffffff", format: (value: number) => value.toFixed(1) },
  { key: "true_shooting", label: "TS%", color: "#cfcfcf", format: (value: number) => `${value.toFixed(1)}%` },
  { key: "usage", label: "USG%", color: "#a3a3a3", format: (value: number) => `${value.toFixed(1)}%` },
  { key: "minutes", label: "MPG", color: "#737373", format: (value: number) => value.toFixed(1) },
] as const;

export function TrendChart({ seasons }: { seasons: SeasonTrend[] }) {
  const [metricKey, setMetricKey] = useState<(typeof metrics)[number]["key"]>("points");
  const activeMetric = useMemo(() => metrics.find((metric) => metric.key === metricKey)!, [metricKey]);

  return (
    <article className="border border-white/10 bg-[#121212] p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div><h2 className="text-sm font-black uppercase tracking-[0.12em]">Production trajectory</h2><p className="mt-1 text-xs text-white/45">Season averages · seeded evaluation snapshot</p></div>
        <div className="flex border border-white/10 p-1">{metrics.map((metric) => <button key={metric.key} onClick={() => setMetricKey(metric.key)} className={`px-2.5 py-1.5 text-[10px] font-bold ${metric.key === metricKey ? "bg-white text-black" : "text-white/45 hover:text-white"}`}>{metric.label}</button>)}</div>
      </div>
      <div className="mt-6 h-56" aria-label={`${activeMetric.label} trend chart`}>
        <ResponsiveContainer width="100%" height="100%"><LineChart data={seasons} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}><XAxis dataKey="season" axisLine={false} tickLine={false} tick={{ fill: "#737373", fontSize: 11 }} dy={10} /><YAxis axisLine={false} tickLine={false} tick={{ fill: "#737373", fontSize: 11 }} tickFormatter={(value) => activeMetric.format(value)} /><Tooltip cursor={{ stroke: "#404040" }} contentStyle={{ background: "#171717", border: "1px solid #404040", borderRadius: 0 }} labelStyle={{ color: "#a3a3a3" }} formatter={(value) => [activeMetric.format(Number(value ?? 0)), activeMetric.label]} /><Line type="monotone" dataKey={metricKey} stroke={activeMetric.color} strokeWidth={2} dot={{ r: 3, fill: activeMetric.color, strokeWidth: 0 }} activeDot={{ r: 5 }} /></LineChart></ResponsiveContainer>
      </div>
    </article>
  );
}

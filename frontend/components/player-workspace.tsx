"use client";

import { useCallback, useEffect, useState } from "react";
import {
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { AppShell } from "@/components/app-shell";
import { ChallengeAssist } from "@/components/challenge-assist";
import { DecisionDashboard } from "@/components/decision-dashboard";
import { LoginScreen } from "@/components/login-screen";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
const DEFAULT_PLAYER_SLUG = "stephen-curry";
const COMBINE_YEARS = ["2025-26", "2024-25", "2023-24", "2022-23", "2021-22"];

type WorkspaceView = "evaluate" | "challenge" | "reports";
type EvaluationTab = "nba" | "combine";
type PlayerDetail = { player: { slug: string }; [key: string]: unknown };
type TeamContext = { team_code: string; [key: string]: unknown };

type CombineProspect = {
  person_id: number;
  player_name: string;
  position: string | null;
  [key: string]: string | number | null;
};

type CombineMetric = {
  label: string;
  key: string;
  percent?: boolean;
  inverse?: boolean;
};

type CombineChartPoint = CombineMetric & {
  player: number | null;
  classAverage: number;
  rawValue: number | null;
  averageValue: number | null;
  playerName: string;
};

const COMBINE_SECTIONS: Array<{ title: string; metrics: CombineMetric[] }> = [
  {
    title: "Drill Results",
    metrics: [
      { label: "Stand vert", key: "standing_vertical" },
      { label: "Max vert", key: "max_vertical" },
      { label: "Lane agility", key: "lane_agility", inverse: true },
      { label: "3/4 sprint", key: "three_quarter_sprint", inverse: true },
      { label: "Bench", key: "bench_press" },
    ],
  },
  {
    title: "Spot Shooting Results",
    metrics: [
      {
        label: "College corner L",
        key: "college_corner_left_pct",
        percent: true,
      },
      {
        label: "College break L",
        key: "college_break_left_pct",
        percent: true,
      },
      { label: "College top", key: "college_top_key_pct", percent: true },
      {
        label: "College break R",
        key: "college_break_right_pct",
        percent: true,
      },
      {
        label: "College corner R",
        key: "college_corner_right_pct",
        percent: true,
      },
    ],
  },
  {
    title: "Non-Stationary Shooting Results",
    metrics: [
      {
        label: "Off-drib 15 L",
        key: "off_drib_fifteen_break_left_pct",
        percent: true,
      },
      {
        label: "Off-drib 15 top",
        key: "off_drib_fifteen_top_key_pct",
        percent: true,
      },
      {
        label: "Off-drib 15 R",
        key: "off_drib_fifteen_break_right_pct",
        percent: true,
      },
      { label: "On move 15", key: "on_move_fifteen_pct", percent: true },
      { label: "On move college", key: "on_move_college_pct", percent: true },
    ],
  },
  {
    title: "Medical Anthro Measurements",
    metrics: [
      { label: "Height", key: "height_wo_shoes" },
      { label: "Weight", key: "weight" },
      { label: "Wingspan", key: "wingspan" },
      { label: "Stand reach", key: "standing_reach" },
      { label: "Body fat", key: "body_fat_pct", inverse: true, percent: true },
    ],
  },
];

async function fetchJson<T>(path: string): Promise<T | null> {
  const response = await fetch(`${API_BASE_URL}${path}`);
  return response.ok ? response.json() : null;
}

export function PlayerWorkspace() {
  const [userName, setUserName] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<WorkspaceView>("evaluate");
  const [activeTab, setActiveTab] = useState<EvaluationTab>("nba");
  const [selectedPlayer, setSelectedPlayer] = useState<PlayerDetail | null>(
    null,
  );
  const [comparisonTeam, setComparisonTeam] = useState("BKN");
  const [teamContext, setTeamContext] = useState<TeamContext | null>(null);
  const [isPlayerLoading, setIsPlayerLoading] = useState(true);

  const loadPlayer = useCallback(async (slug: string) => {
    setIsPlayerLoading(true);
    try {
      setSelectedPlayer(
        await fetchJson<PlayerDetail>(`/api/v1/ingested-players/${slug}`),
      );
    } finally {
      setIsPlayerLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadPlayer(DEFAULT_PLAYER_SLUG);
  }, [loadPlayer]);

  useEffect(() => {
    if (!selectedPlayer) return;
    void fetchJson<TeamContext>(
      `/api/v1/team-context/${comparisonTeam}?player_slug=${selectedPlayer.player.slug}`,
    )
      .then(setTeamContext)
      .catch(() => setTeamContext(null));
  }, [comparisonTeam, selectedPlayer]);

  if (!userName) return <LoginScreen onLogin={setUserName} />;

  return (
    <AppShell
      userName={userName}
      onNavigate={(label) =>
        setActiveView(
          label === "Challenge Assist"
            ? "challenge"
            : label === "Reports"
              ? "reports"
              : "evaluate",
        )
      }
    >
      {activeView === "challenge" && <ChallengeAssist />}
      {activeView === "reports" && (
        <main className="min-h-[calc(100vh-72px)]" />
      )}
      {activeView === "evaluate" && (
        <main className="mx-auto max-w-[1460px] px-5 py-7 md:px-8 lg:px-10">
          <EvaluationTabs activeTab={activeTab} onChange={setActiveTab} />
          {activeTab === "nba" && (
            <>
              {isPlayerLoading && (
                <p className="py-24 text-center text-sm text-white/45">
                  Loading NBA data…
                </p>
              )}
              {selectedPlayer && (
                <DecisionDashboard
                  detail={selectedPlayer}
                  context={teamContext}
                  onPlayerSelect={loadPlayer}
                  onTeamChange={setComparisonTeam}
                />
              )}
            </>
          )}
          {activeTab === "combine" && <CombineWorkspace />}
        </main>
      )}
    </AppShell>
  );
}

function EvaluationTabs({
  activeTab,
  onChange,
}: {
  activeTab: EvaluationTab;
  onChange: (tab: EvaluationTab) => void;
}) {
  return (
    <div className="mb-7 flex border-b border-white/10">
      {(["nba", "combine"] as const).map((tab) => (
        <button
          key={tab}
          onClick={() => onChange(tab)}
          className={`border-b-2 px-5 py-3 text-xs font-black uppercase tracking-[.14em] ${activeTab === tab ? "border-[#e84b37] text-white" : "border-transparent text-white/40 hover:text-white"}`}
        >
          {tab === "nba" ? "NBA" : "Draft combine"}
        </button>
      ))}
    </div>
  );
}

function CombineWorkspace() {
  const [draftYear, setDraftYear] = useState("");
  const [prospects, setProspects] = useState<CombineProspect[]>([]);
  const [selectedProspectId, setSelectedProspectId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const selectedProspect =
    prospects.find(
      ({ person_id }) => String(person_id) === selectedProspectId,
    ) ?? null;

  useEffect(() => {
    if (!draftYear) {
      setProspects([]);
      setSelectedProspectId("");
      return;
    }
    setIsLoading(true);
    void fetchJson<CombineProspect[]>(
      `/api/v1/combine-prospects?season=${draftYear}`,
    )
      .then((rows) => {
        setProspects(rows ?? []);
        setSelectedProspectId("");
      })
      .catch(() => {
        setProspects([]);
        setSelectedProspectId("");
      })
      .finally(() => setIsLoading(false));
  }, [draftYear]);

  return (
    <section>
      <div className="border border-white/10 bg-[#121212] p-5">
        <p className="text-[10px] font-bold uppercase tracking-[.16em] text-white/45">
          NBA Draft Combine
        </p>
        <h1 className="mt-1 text-3xl font-black tracking-[-.06em]">
          Prospect evaluation
        </h1>
        <p className="mt-2 text-sm text-white/50">
          Select a combine class, then a prospect to compare against class
          averages.
        </p>
        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-end">
          <SelectField
            label="Draft year"
            value={draftYear}
            onChange={setDraftYear}
            className="sm:w-52"
          >
            <option value="">Select a draft year</option>
            {COMBINE_YEARS.map((year) => (
              <option key={year}>{year}</option>
            ))}
          </SelectField>
          <SelectField
            label="Prospect"
            value={selectedProspectId}
            onChange={setSelectedProspectId}
            disabled={!draftYear || isLoading}
            className="sm:w-80"
          >
            <option value="">
              {isLoading
                ? "Loading prospects…"
                : draftYear
                  ? "Select a prospect"
                  : "Select a draft year first"}
            </option>
            {prospects.map((prospect) => (
              <option key={prospect.person_id} value={prospect.person_id}>
                {prospect.player_name}
              </option>
            ))}
          </SelectField>
        </div>
      </div>
      {isLoading && (
        <p className="py-24 text-center text-sm text-white/45">
          Loading combine class…
        </p>
      )}
      {!isLoading && selectedProspect && (
        <div className="mt-5">
          <CombineProfile
            prospect={selectedProspect}
            classProspects={prospects}
          />
        </div>
      )}
      {!isLoading && draftYear && !selectedProspect && (
        <p className="py-20 text-center text-sm text-white/45">
          Select a prospect to open their combine evaluation.
        </p>
      )}
    </section>
  );
}

function SelectField({
  label,
  value,
  onChange,
  disabled,
  className,
  children,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  className: string;
  children: React.ReactNode;
}) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-2 block text-[10px] font-bold uppercase tracking-[.16em] text-white/45">
        {label}
      </span>
      <select
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-lg border border-white/15 bg-[#0b0b0b] px-3 py-3 text-sm font-bold text-white outline-none focus:border-[#e84b37] disabled:cursor-not-allowed disabled:opacity-40"
      >
        {children}
      </select>
    </label>
  );
}

function CombineProfile({
  prospect,
  classProspects,
}: {
  prospect: CombineProspect;
  classProspects: CombineProspect[];
}) {
  return (
    <div>
      <div className="w-full max-w-sm border border-white/10 bg-[#121212] p-5">
        <h2 className="text-3xl font-black tracking-[-.07em]">
          {prospect.player_name}
        </h2>
        <div className="mt-4 border-t border-white/10 pt-3">
          <p className="text-[10px] font-bold uppercase tracking-[.14em] text-white/40">
            Position
          </p>
          <p className="mt-1 text-sm font-bold">{prospect.position ?? "N/A"}</p>
        </div>
      </div>
      <div className="mt-5 grid gap-5 xl:grid-cols-2">
        {COMBINE_SECTIONS.map((section) => (
          <CombineSection
            key={section.title}
            title={section.title}
            data={buildCombineChartData(
              prospect,
              classProspects,
              section.metrics,
            )}
          />
        ))}
      </div>
    </div>
  );
}

function buildCombineChartData(
  prospect: CombineProspect,
  classProspects: CombineProspect[],
  metrics: CombineMetric[],
): CombineChartPoint[] {
  return metrics.map((metric) => {
    const classValues = classProspects
      .map((item) => toNumber(item[metric.key]))
      .filter((value): value is number => value !== null);
    const averageValue = classValues.length
      ? classValues.reduce((sum, value) => sum + value, 0) / classValues.length
      : null;
    const rawValue = toNumber(prospect[metric.key]);
    const relativeValue =
      rawValue !== null && averageValue
        ? (metric.inverse ? averageValue / rawValue : rawValue / averageValue) *
          100
        : null;
    return {
      ...metric,
      player: relativeValue === null ? null : Math.min(relativeValue, 160),
      classAverage: 100,
      rawValue,
      averageValue,
      playerName: prospect.player_name,
    };
  });
}

function toNumber(value: string | number | null | undefined): number | null {
  const number = Number(value);
  return value == null || !Number.isFinite(number) ? null : number;
}

function CombineSection({
  title,
  data,
}: {
  title: string;
  data: CombineChartPoint[];
}) {
  return (
    <article className="border border-white/10 bg-[#121212] p-5">
      <h3 className="text-xs font-bold uppercase tracking-[.12em] text-white/55">
        {title}
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <RadarChart data={data}>
          <PolarGrid stroke="#ffffff22" />
          <PolarAngleAxis
            dataKey="label"
            tick={{ fill: "#ffffff99", fontSize: 10 }}
          />
          <Radar
            name={data[0]?.playerName ?? "Prospect"}
            dataKey="player"
            stroke="#f4f3ee"
            fill="#f4f3ee"
            fillOpacity={0.2}
          />
          <Radar
            name="Class average"
            dataKey="classAverage"
            stroke="#e84b37"
            fill="#e84b37"
            fillOpacity={0.12}
          />
          <Tooltip content={<CombineTooltip />} />
        </RadarChart>
      </ResponsiveContainer>
      <div className="grid grid-cols-2 gap-x-4 gap-y-2 border-t border-white/10 pt-3 text-xs">
        {data.map((metric) => (
          <div key={metric.label} className="flex justify-between gap-2">
            <span className="text-white/45">{metric.label}</span>
            <b>{formatMetricValue(metric.rawValue, metric.percent)}</b>
          </div>
        ))}
      </div>
    </article>
  );
}

function CombineTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const metric = payload[0].payload as CombineChartPoint;
  return (
    <div className="border border-white/20 bg-[#101010] p-3 text-xs text-white shadow-xl">
      <b>{metric.label}</b>
      <p className="mt-1 text-white/70">
        {metric.playerName}:{" "}
        {formatMetricValue(metric.rawValue, metric.percent)}
      </p>
      <p className="text-white/70">
        Class average: {formatMetricValue(metric.averageValue, metric.percent)}
      </p>
    </div>
  );
}

function formatMetricValue(value: number | null, percent?: boolean) {
  return value === null ? "N/A" : `${value.toFixed(1)}${percent ? "%" : ""}`;
}

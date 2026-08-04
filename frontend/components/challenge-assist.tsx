"use client";

import { useState } from "react";

type CallKey = "out" | "reach" | "goal";
const calls: Record<
  CallKey,
  {
    current: string;
    recommended: string;
    confidence: string;
    rationale: string;
    action: string;
  }
> = {
  out: {
    current: "Out of bounds — opponent possession",
    recommended: "Out of bounds — Brooklyn possession",
    confidence: "91%",
    rationale:
      "Baseline and sideline views show the ball contacting the opponent after Brooklyn #8’s deflection.",
    action: "Challenge",
  },
  reach: {
    current: "Reach-in foul — Brooklyn",
    recommended: "No foul — legal defensive contact",
    confidence: "84%",
    rationale:
      "Contact occurs after the ball is dislodged; the defender’s hand contacts the ball first.",
    action: "Challenge",
  },
  goal: {
    current: "Goaltending — Brooklyn",
    recommended: "Legal block — no goaltending",
    confidence: "88%",
    rationale:
      "Ball is rising at the point of contact and remains below the cylinder plane.",
    action: "Challenge",
  },
};

const cameras = [
  {
    name: "Baseline left",
    footageUrl: "https://media.giphy.com/media/Vi6aNTnTtdFrBN5PHf/giphy.gif",
    imageClassName: "scale-[1.12] object-center",
  },
  {
    name: "Baseline right",
    footageUrl: "https://media.giphy.com/media/Vi6aNTnTtdFrBN5PHf/giphy.gif",
    imageClassName: "scale-x-[-1.12] scale-y-[1.12] object-center",
  },
  {
    name: "Sideline A",
    footageUrl: "https://media.giphy.com/media/XpjumsFlm2S0dvBssO/giphy.gif",
    imageClassName: "scale-125 object-left",
  },
  {
    name: "Sideline B",
    footageUrl: "https://media.giphy.com/media/XpjumsFlm2S0dvBssO/giphy.gif",
    imageClassName: "scale-x-[-1.25] scale-y-[1.25] object-right",
  },
  {
    name: "High center",
    footageUrl: "https://media.giphy.com/media/2YembO6TC0KL7IvP5o/giphy.gif",
    imageClassName: "scale-110 object-center",
  },
  {
    name: "Rim camera",
    footageUrl: "https://media.giphy.com/media/2YembO6TC0KL7IvP5o/giphy.gif",
    imageClassName: "scale-[1.35] object-top",
  },
] as const;

export function ChallengeAssist() {
  const [frame, setFrame] = useState(12);
  const [analyzing, setAnalyzing] = useState(false);
  const verdict = calls.out;
  const confidence = Number(verdict.confidence.replace("%", ""));
  const confidenceColor =
    confidence >= 85
      ? "text-[#55c779]"
      : confidence >= 70
        ? "text-[#f2c94c]"
        : "text-[#e84b37]";
  function runAnalysis() {
    setAnalyzing(true);
    let next = 0;
    const timer = window.setInterval(() => {
      next += 1;
      setFrame((value) => (value + 7) % 48);
      if (next === 7) {
        window.clearInterval(timer);
        setAnalyzing(false);
      }
    }, 180);
  }
  return (
    <main className="mx-auto max-w-[1460px] px-5 py-7 md:px-8 lg:px-10">
      <section className="max-w-2xl border border-white/10 bg-[#121212] p-5">
        <p className="text-[10px] font-bold uppercase tracking-[.16em] text-white/45">
          Challenge Assist
        </p>
        <div className="mt-4 border-l-4 border-[#e84b37] bg-[#e84b37]/10 px-5 py-4">
          <p className="text-[10px] font-bold uppercase tracking-[.16em] text-white/50">
            On-court ruling
          </p>
          <p className="mt-1 text-xl font-black">{verdict.current}</p>
        </div>
      </section>
      <section className="mt-7 grid gap-7 xl:grid-cols-[1fr_340px]">
        <div>
          <div className="mb-3 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-black uppercase tracking-[.12em]">
                Synchronized camera wall
              </h2>
              <p className="mt-1 text-xs text-white/45">
                Frame {frame + 1} of 48 · multi-angle replay mock
              </p>
            </div>
            <button
              onClick={runAnalysis}
              disabled={analyzing}
              className="rounded-sm bg-[#e84b37] px-4 py-3 text-xs font-black uppercase tracking-[.12em] text-white transition hover:bg-[#f35c48] disabled:opacity-60"
            >
              {analyzing ? "Analyzing…" : "Run automated analysis"}
            </button>
          </div>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {cameras.map((camera, index) => (
              <Camera
                key={camera.name}
                camera={camera}
                frame={frame}
                index={index}
              />
            ))}
          </div>
        </div>
        <aside className="border border-white/10 bg-[#121212] p-5">
          <p className="text-[10px] font-bold uppercase tracking-[.16em] text-white/45">
            Automated review
          </p>
          <p className="mt-4 text-3xl font-black tracking-[-.06em]">
            {verdict.action}
          </p>
          <p className={`mt-1 text-sm ${confidenceColor}`}>
            {verdict.confidence} confidence
          </p>
          <div className="mt-5 border-y border-white/10 py-4">
            <p className="text-[10px] font-bold uppercase tracking-[.14em] text-white/45">
              Recommended ruling
            </p>
            <p className="mt-2 text-base font-bold">{verdict.recommended}</p>
          </div>
          <p className="mt-5 text-sm leading-6 text-white/65">
            {verdict.rationale}
          </p>
          <div className="mt-6 space-y-3 text-xs">
            <div className="flex justify-between">
              <span className="text-white/45">Camera agreement</span>
              <b>5 / 6 views</b>
            </div>
            <div className="flex justify-between">
              <span className="text-white/45">Review window</span>
              <b>01.8 sec</b>
            </div>
            <div className="flex justify-between">
              <span className="text-white/45">Time remaining</span>
              <b>01:14</b>
            </div>
          </div>
        </aside>
      </section>
    </main>
  );
}

function Camera({
  camera,
  frame,
  index,
}: {
  camera: (typeof cameras)[number];
  frame: number;
  index: number;
}) {
  return (
    <article className="overflow-hidden border border-white/10 bg-[#111]">
      <div className="relative aspect-video overflow-hidden bg-black">
        <img
          src={camera.footageUrl}
          alt={`${camera.name} replay footage`}
          className={`h-full w-full object-cover grayscale-[20%] ${camera.imageClassName}`}
        />
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(0,0,0,.18)_50%)] bg-[length:100%_4px]" />
        <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-white/10" />
        <div className="absolute right-3 top-3 flex items-center gap-1.5 bg-black/70 px-2 py-1 font-mono text-[9px] font-bold uppercase tracking-[.12em] text-white/80">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#e84b37]" />
          Replay
        </div>
        <div className="absolute bottom-3 left-3 bg-black/70 px-2 py-1 font-mono text-[10px] text-white/70">
          CAM {index + 1} · {String(frame + 1).padStart(2, "0")}
        </div>
      </div>
      <p className="border-t border-white/10 px-3 py-2 text-xs font-bold text-white/70">
        {camera.name}
      </p>
    </article>
  );
}

"use client";

import { FormEvent, useEffect, useState } from "react";

export function LoginScreen({ onLogin }: { onLogin: (name: string) => void }) {
  const [opened, setOpened] = useState(false);
  const [exiting, setExiting] = useState(false);
  const [name, setName] = useState("");

  useEffect(() => {
    const timer = window.setTimeout(() => setOpened(true), 220);
    return () => window.clearTimeout(timer);
  }, []);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (exiting) return;
    setExiting(true);
    window.setTimeout(() => onLogin(name.trim() || "Analyst"), 1250);
  }

  const isOpen = opened && !exiting;
  const logoBase =
    "absolute left-1/2 top-1/2 h-[480px] w-[480px] object-contain transition-transform duration-[1250ms] ease-[cubic-bezier(.16,1,.3,1)] sm:h-[650px] sm:w-[650px]";

  return (
    <main className="grid min-h-screen place-items-center overflow-hidden bg-[#f4f3ee] px-5 text-[#111]">
      <section className="w-full max-w-5xl">
        <div className="relative mx-auto h-[720px] sm:h-[850px]">
          <img
            src="/brand/brooklyn-nets-primary.svg"
            alt="Brooklyn Nets"
            className={logoBase}
            style={{
              clipPath: "inset(0 0 50% 0)",
              transform: isOpen
                ? "translate(-50%, calc(-50% - 245px))"
                : "translate(-50%, -50%)",
            }}
          />
          <img
            src="/brand/brooklyn-nets-primary.svg"
            alt=""
            className={logoBase}
            style={{
              clipPath: "inset(50% 0 0 0)",
              transform: isOpen
                ? "translate(-50%, calc(-50% + 245px))"
                : "translate(-50%, -50%)",
            }}
          />
          <form
            onSubmit={submit}
            className={`absolute left-1/2 top-1/2 z-10 w-full max-w-sm -translate-x-1/2 -translate-y-1/2 bg-[#f4f3ee] px-6 py-6 transition-[opacity,transform] ease-[cubic-bezier(.16,1,.3,1)] ${isOpen ? "delay-100 duration-[1100ms] scale-100 opacity-100" : "duration-500 -translate-y-[35%] scale-90 opacity-0"}`}
          >
            <p className="text-[10px] font-bold uppercase tracking-[.18em] text-black/45">
              Brooklyn Nets
            </p>
            <h1 className="mt-2 text-3xl font-black tracking-[-.07em]">
              Welcome in.
            </h1>
            <label className="mt-6 block text-[10px] font-bold uppercase tracking-[.16em] text-black/45">
              Username
              <input
                autoFocus
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Enter your name"
                className="mt-2 w-full border-b border-black/30 bg-transparent px-0 py-3 text-lg font-bold outline-none placeholder:text-black/30 focus:border-black"
              />
            </label>
            <button
              type="submit"
              disabled={exiting}
              className="mt-6 w-full bg-[#111] px-4 py-4 text-xs font-black uppercase tracking-[.14em] text-white transition hover:bg-[#e84b37] disabled:cursor-wait"
            >
              Enter workspace
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}

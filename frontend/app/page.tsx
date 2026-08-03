import Link from "next/link";
import { AppShell } from "@/components/app-shell";

export default function Home() {
  return (
    <AppShell>
      <main className="flex min-h-[calc(100vh-72px)] items-center px-6 py-16 md:px-12">
        <div className="max-w-3xl">
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-white/45">Internal player evaluation</p>
          <h1 className="mt-5 text-5xl font-black leading-[.94] tracking-[-0.07em] md:text-7xl">Make the context<br />impossible to miss.</h1>
          <p className="mt-7 max-w-xl text-base leading-7 text-white/60">A focused workspace for evaluating role, trajectory, shooting, contract, and on-court impact—built for a fast front-office workflow.</p>
          <Link href="/players/mikal-bridges" className="mt-10 inline-flex items-center gap-3 bg-white px-5 py-3 text-sm font-bold text-black transition hover:bg-white/80">Open player evaluation <span>→</span></Link>
        </div>
      </main>
    </AppShell>
  );
}

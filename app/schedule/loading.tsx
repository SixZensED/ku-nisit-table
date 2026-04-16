"use client";

import { useSearchParams } from "next/navigation";

type ScheduleTheme = "forest" | "sunset" | "ocean" | "mono" | "cartoon" | "dark";

type LoadingTheme = {
  pageGradient: string;
  orbTop: string;
  orbBottom: string;
  sectionBorder: string;
  sectionSurface: string;
  headerBg: string;
  rowHeaderBg: string;
  rowCellBg: string;
  rowStripeBg: string;
  buttonBg: string;
};

const LOADING_THEMES: Record<ScheduleTheme, LoadingTheme> = {
  forest: {
    pageGradient: "bg-gradient-to-br from-emerald-50 via-white to-green-50",
    orbTop: "bg-emerald-200/30",
    orbBottom: "bg-green-200/25",
    sectionBorder: "border-[#4fbf42]/35",
    sectionSurface: "bg-white/95",
    headerBg: "bg-[#1f7d27]",
    rowHeaderBg: "bg-[#eaf8e8]",
    rowCellBg: "bg-[#f3fbf2]",
    rowStripeBg: "bg-[#edf8ec]",
    buttonBg: "bg-[#2f9e33]/35",
  },
  sunset: {
    pageGradient: "bg-gradient-to-br from-orange-50 via-amber-50 to-rose-50",
    orbTop: "bg-orange-200/35",
    orbBottom: "bg-rose-200/30",
    sectionBorder: "border-orange-300/50",
    sectionSurface: "bg-white/95",
    headerBg: "bg-orange-600",
    rowHeaderBg: "bg-orange-100",
    rowCellBg: "bg-orange-50",
    rowStripeBg: "bg-amber-50",
    buttonBg: "bg-orange-300/40",
  },
  ocean: {
    pageGradient: "bg-gradient-to-br from-cyan-50 via-white to-blue-50",
    orbTop: "bg-cyan-200/30",
    orbBottom: "bg-blue-200/30",
    sectionBorder: "border-sky-300/55",
    sectionSurface: "bg-white/95",
    headerBg: "bg-sky-700",
    rowHeaderBg: "bg-cyan-50",
    rowCellBg: "bg-sky-50",
    rowStripeBg: "bg-blue-50",
    buttonBg: "bg-sky-300/35",
  },
  mono: {
    pageGradient: "bg-gradient-to-br from-neutral-100 via-white to-neutral-50",
    orbTop: "bg-neutral-200/45",
    orbBottom: "bg-zinc-300/20",
    sectionBorder: "border-neutral-300/70",
    sectionSurface: "bg-white/95",
    headerBg: "bg-neutral-800",
    rowHeaderBg: "bg-neutral-100",
    rowCellBg: "bg-neutral-50",
    rowStripeBg: "bg-neutral-100",
    buttonBg: "bg-neutral-300/45",
  },
  cartoon: {
    pageGradient: "bg-gradient-to-br from-[#dff7ff] via-[#ecfff3] to-[#e7f4ff]",
    orbTop: "bg-cyan-300/35",
    orbBottom: "bg-emerald-300/35",
    sectionBorder: "border-cyan-300/75",
    sectionSurface: "bg-white/85",
    headerBg: "bg-cyan-600",
    rowHeaderBg: "bg-[#d5f4ff]/80",
    rowCellBg: "bg-[#f8fffe]",
    rowStripeBg: "bg-[#eefbf4]",
    buttonBg: "bg-cyan-300/40",
  },
  dark: {
    pageGradient: "bg-gradient-to-br from-slate-950 via-slate-900 to-zinc-950",
    orbTop: "bg-cyan-400/10",
    orbBottom: "bg-indigo-400/10",
    sectionBorder: "border-slate-700/80",
    sectionSurface: "bg-slate-950/90",
    headerBg: "bg-slate-800",
    rowHeaderBg: "bg-slate-800/85",
    rowCellBg: "bg-slate-900/70",
    rowStripeBg: "bg-slate-800/70",
    buttonBg: "bg-sky-400/20",
  },
};

function resolveTheme(value: string | null): ScheduleTheme {
  if (value && value in LOADING_THEMES) {
    return value as ScheduleTheme;
  }

  return "forest";
}

export default function ScheduleLoading() {
  const searchParams = useSearchParams();
  const theme = resolveTheme(searchParams.get("theme"));
  const activeTheme = LOADING_THEMES[theme];

  return (
    <main className={`relative min-h-screen overflow-hidden px-2 py-3 sm:px-4 lg:px-6 ${activeTheme.pageGradient}`}>
      <div className={`pointer-events-none absolute -top-32 -left-32 h-96 w-96 rounded-full blur-3xl ${activeTheme.orbTop}`} />
      <div className={`pointer-events-none absolute -right-32 -bottom-32 h-96 w-96 rounded-full blur-3xl ${activeTheme.orbBottom}`} />

      <div className="skeleton-shimmer mx-auto w-full max-w-[1600px]">
        <div className={`skeleton-item mb-4 h-11 w-44 rounded-full ${activeTheme.buttonBg}`} />

        <section className={`overflow-hidden rounded-xl border p-3 shadow-[0_24px_70px_-28px_rgba(0,0,0,0.35)] backdrop-blur-sm ${activeTheme.sectionBorder} ${activeTheme.sectionSurface}`}>
          <div className={`grid grid-cols-[96px_repeat(12,minmax(0,1fr))] gap-1 ${activeTheme.headerBg} p-1 rounded-lg`}>
            <div className={`skeleton-item col-span-1 h-9 rounded-md ${activeTheme.buttonBg}`} />
            <div className={`skeleton-item col-span-12 h-9 rounded-md ${activeTheme.rowCellBg}`} />
          </div>

          <div className="mt-2 space-y-1">
            {Array.from({ length: 7 }).map((_, row) => (
              <div key={row} className="grid grid-cols-[96px_repeat(12,minmax(0,1fr))] gap-1">
                <div className={`skeleton-item col-span-1 h-24 rounded-md ${activeTheme.rowHeaderBg}`} />
                <div className={`skeleton-item col-span-12 h-24 rounded-md ${row % 2 === 0 ? activeTheme.rowCellBg : activeTheme.rowStripeBg}`} />
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}

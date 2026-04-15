"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { toPng } from "html-to-image";

type DayConfig = {
  label: string;
};

type BoardTheme = "forest" | "sunset" | "ocean" | "mono" | "cartoon" | "dark";

type BoardLanguage = "th" | "en";

type ThemeConfig = {
  label: string;
  pageGradient: string;
  pagePattern: string;
  orbTop: string;
  orbBottom: string;
  actionButton: string;
  sectionBorder: string;
  sectionSurface: string;
  sectionStyle?: CSSProperties;
  gridBorder: string;
  headerBg: string;
  timeCellBg: string;
  timeCellText: string;
  bodyCellBg: string;
  eventBorder: string;
  eventShadow: string;
  dayLabelText: string;
  dayColors: string[];
  eventColors: string[];
};

type LanguageConfig = {
  label: string;
  buttonLabel: string;
  blockPrimaryLabel: string;
  blockSecondaryLabel: string;
};

type EventBlock = {
  start: number;
  span: number;
  startMinute: number;
  endMinute: number;
  code: string;
  title: string;
  titleEn: string;
  room: string;
  type: string;
  timeLabel: string;
  color: string;
};

type ScheduleBoardProps = {
  year: number;
  semester: number;
  rawRowsCount: number;
  parsedEventCount: number;
  displayedEventsByDay: EventBlock[][];
  responsePeriod: { year: number; semester: number } | null;
  periodMismatch: boolean;
  resyncStatus: "idle" | "success" | "failed";
  fetchErrorMessage?: string | null;
};

const DAYS: DayConfig[] = [
  { label: "MON" },
  { label: "TUE" },
  { label: "WED" },
  { label: "THU" },
  { label: "FRI" },
  { label: "SAT" },
  { label: "SUN" },
];

const BOARD_THEMES: Record<BoardTheme, ThemeConfig> = {
  forest: {
    label: "Green KU",
    pageGradient: "bg-gradient-to-br from-emerald-50 via-white to-green-50",
    pagePattern: "",
    orbTop: "bg-emerald-200/30",
    orbBottom: "bg-green-200/25",
    actionButton:
      "bg-gradient-to-b from-[#4fbf42] via-[#2f9e33] to-[#1f7d27] shadow-[inset_0_1px_0_rgba(255,255,255,0.35),inset_0_-1px_0_rgba(0,0,0,0.16),0_4px_0_#16591f,0_8px_14px_rgba(16,88,36,0.24)]",
    sectionBorder: "border-[#4fbf42]/35",
    sectionSurface: "bg-white/95",
    eventBorder: "border-[#2f9e33]/20",
    eventShadow: "shadow-[0_6px_14px_rgba(31,125,39,0.08)]",
    gridBorder: "bg-[#d6e8d5]",
    headerBg: "bg-[#1f7d27]",
    timeCellBg: "bg-white",
    timeCellText: "text-neutral-700",
    bodyCellBg: "bg-white",
    dayLabelText: "text-[#14532d]",
    dayColors: [
      "bg-[#eaf8e8]",
      "bg-[#e4f5e2]",
      "bg-[#ddf1db]",
      "bg-[#d5ecd3]",
      "bg-[#cde8cb]",
      "bg-[#c4e2c2]",
      "bg-[#badcb8]",
    ],
    eventColors: [
      "bg-[#ecfae9]",
      "bg-[#e1f6de]",
      "bg-[#d8f0d5]",
      "bg-[#d0ebcd]",
      "bg-[#c5e6c3]",
      "bg-[#bde1bc]",
      "bg-[#b4dcb4]",
    ],
  },
  sunset: {
    label: "Sunset Pop",
    pageGradient: "bg-gradient-to-br from-orange-50 via-amber-50 to-rose-50",
    pagePattern: "",
    orbTop: "bg-orange-200/35",
    orbBottom: "bg-rose-200/30",
    actionButton:
      "bg-gradient-to-b from-[#fb923c] via-[#f97316] to-[#ea580c] shadow-[inset_0_1px_0_rgba(255,255,255,0.35),inset_0_-1px_0_rgba(0,0,0,0.16),0_4px_0_#9a3412,0_8px_14px_rgba(154,52,18,0.24)]",
    sectionBorder: "border-orange-300/50",
    sectionSurface: "bg-white/95",
    eventBorder: "border-orange-300/35",
    eventShadow: "shadow-[0_6px_14px_rgba(234,88,12,0.12)]",
    gridBorder: "bg-orange-100",
    headerBg: "bg-orange-600",
    timeCellBg: "bg-white",
    timeCellText: "text-neutral-700",
    bodyCellBg: "bg-white",
    dayLabelText: "text-[#14532d]",
    dayColors: [
      "bg-orange-100",
      "bg-amber-100",
      "bg-yellow-100",
      "bg-rose-100",
      "bg-red-100",
      "bg-orange-100",
      "bg-amber-100",
    ],
    eventColors: [
      "bg-[#fff0db]",
      "bg-[#ffe7c7]",
      "bg-[#ffe0cf]",
      "bg-[#ffd7d1]",
      "bg-[#ffd9e8]",
      "bg-[#ffe3c2]",
      "bg-[#ffebd6]",
    ],
  },
  ocean: {
    label: "Ocean Cool",
    pageGradient: "bg-gradient-to-br from-cyan-50 via-white to-blue-50",
    pagePattern: "",
    orbTop: "bg-cyan-200/30",
    orbBottom: "bg-blue-200/30",
    actionButton:
      "bg-gradient-to-b from-[#38bdf8] via-[#0ea5e9] to-[#0369a1] shadow-[inset_0_1px_0_rgba(255,255,255,0.35),inset_0_-1px_0_rgba(0,0,0,0.16),0_4px_0_#075985,0_8px_14px_rgba(7,89,133,0.24)]",
    sectionBorder: "border-sky-300/55",
    sectionSurface: "bg-white/95",
    eventBorder: "border-sky-300/40",
    eventShadow: "shadow-[0_6px_14px_rgba(3,105,161,0.12)]",
    gridBorder: "bg-sky-100",
    headerBg: "bg-sky-700",
    timeCellBg: "bg-white",
    timeCellText: "text-neutral-700",
    bodyCellBg: "bg-white",
    dayLabelText: "text-[#14532d]",
    dayColors: [
      "bg-cyan-50",
      "bg-sky-50",
      "bg-blue-50",
      "bg-cyan-100",
      "bg-sky-100",
      "bg-blue-100",
      "bg-cyan-100",
    ],
    eventColors: [
      "bg-[#e3f8ff]",
      "bg-[#d8f1ff]",
      "bg-[#dceeff]",
      "bg-[#d5f4ff]",
      "bg-[#cfeaff]",
      "bg-[#d7f0ff]",
      "bg-[#d3e7ff]",
    ],
  },
  mono: {
    label: "Mono Clean",
    pageGradient: "bg-gradient-to-br from-neutral-100 via-white to-neutral-50",
    pagePattern: "",
    orbTop: "bg-neutral-200/45",
    orbBottom: "bg-zinc-300/20",
    actionButton:
      "bg-gradient-to-b from-[#525252] via-[#404040] to-[#171717] shadow-[inset_0_1px_0_rgba(255,255,255,0.35),inset_0_-1px_0_rgba(0,0,0,0.16),0_4px_0_#0a0a0a,0_8px_14px_rgba(10,10,10,0.24)]",
    sectionBorder: "border-neutral-300/70",
    sectionSurface: "bg-white/95",
    eventBorder: "border-neutral-300/70",
    eventShadow: "shadow-[0_6px_14px_rgba(38,38,38,0.12)]",
    gridBorder: "bg-neutral-200",
    headerBg: "bg-neutral-800",
    timeCellBg: "bg-white",
    timeCellText: "text-neutral-700",
    bodyCellBg: "bg-white",
    dayLabelText: "text-[#14532d]",
    dayColors: [
      "bg-neutral-100",
      "bg-neutral-100",
      "bg-neutral-100",
      "bg-neutral-100",
      "bg-neutral-100",
      "bg-neutral-100",
      "bg-neutral-100",
    ],
    eventColors: [
      "bg-neutral-100",
      "bg-neutral-200",
      "bg-zinc-100",
      "bg-stone-100",
      "bg-neutral-200",
      "bg-zinc-100",
      "bg-stone-100",
    ],
  },
  cartoon: {
    label: "Fantasy Animal",
    pageGradient: "bg-gradient-to-br from-[#dff7ff] via-[#ecfff3] to-[#e7f4ff]",
    pagePattern: "",
    orbTop: "bg-cyan-300/35",
    orbBottom: "bg-emerald-300/35",
    actionButton:
      "bg-gradient-to-b from-[#3fb5f2] via-[#0ea5e9] to-[#0b7ccf] shadow-[inset_0_1px_0_rgba(255,255,255,0.45),inset_0_-1px_0_rgba(0,0,0,0.2),0_4px_0_#0b5fa1,0_8px_14px_rgba(11,95,161,0.26)]",
    sectionBorder: "border-cyan-300/75",
    sectionSurface: "bg-transparent",
    sectionStyle: {
      backgroundImage:
        "linear-gradient(180deg, rgba(245,255,255,0.52) 0%, rgba(241,255,246,0.46) 46%, rgba(232,250,255,0.36) 100%), url('/image/background-schedule/fantasy-animal.png')",
      backgroundSize: "cover",
      backgroundPosition: "center center",
      backgroundRepeat: "no-repeat",
    },
    eventBorder: "border-cyan-300/60",
    eventShadow: "shadow-[0_8px_16px_rgba(14,165,233,0.2)]",
    gridBorder: "bg-cyan-200/55",
    headerBg: "bg-cyan-600",
    timeCellBg: "bg-white/44",
    timeCellText: "text-neutral-700",
    bodyCellBg: "bg-white/28",
    dayLabelText: "text-[#14532d]",
    dayColors: [
      "bg-[#d5f4ff]/80",
      "bg-[#dcffe9]/80",
      "bg-[#e8ffcd]/80",
      "bg-[#d4ffe0]/80",
      "bg-[#d6f0ff]/80",
      "bg-[#deebff]/80",
      "bg-[#e8f6ff]/80",
    ],
    eventColors: [
      "bg-[#e1f7ff]",
      "bg-[#e8ffe9]",
      "bg-[#f2ffd9]",
      "bg-[#dbffe4]",
      "bg-[#e3f4ff]",
      "bg-[#e8efff]",
      "bg-[#f0fbff]",
    ],
  },
  dark: {
    label: "Dark Mode",
    pageGradient: "bg-gradient-to-br from-slate-950 via-slate-900 to-zinc-950",
    pagePattern: "",
    orbTop: "bg-cyan-400/10",
    orbBottom: "bg-indigo-400/10",
    actionButton:
      "bg-gradient-to-b from-[#38bdf8] via-[#0ea5e9] to-[#0369a1] shadow-[inset_0_1px_0_rgba(255,255,255,0.18),inset_0_-1px_0_rgba(0,0,0,0.35),0_4px_0_#0f4c75,0_8px_14px_rgba(2,132,199,0.2)]",
    sectionBorder: "border-slate-700/80",
    sectionSurface: "bg-slate-950/90",
    sectionStyle: {
      backgroundImage:
        "linear-gradient(180deg, rgba(2,6,23,0.92) 0%, rgba(15,23,42,0.88) 100%)",
      backgroundSize: "cover",
      backgroundPosition: "center",
      backgroundRepeat: "no-repeat",
    },
    eventBorder: "border-sky-300/20",
    eventShadow: "shadow-[0_8px_16px_rgba(15,23,42,0.35)]",
    gridBorder: "bg-slate-700/70",
    headerBg: "bg-slate-800",
    timeCellBg: "bg-slate-900/95",
    timeCellText: "text-slate-200",
    bodyCellBg: "bg-slate-900/70",
    dayLabelText: "text-slate-100",
    dayColors: [
      "bg-slate-800/85",
      "bg-slate-800/80",
      "bg-slate-800/78",
      "bg-slate-800/74",
      "bg-slate-800/78",
      "bg-slate-800/80",
      "bg-slate-800/85",
    ],
    eventColors: [
      "bg-sky-100",
      "bg-cyan-100",
      "bg-emerald-100",
      "bg-blue-100",
      "bg-indigo-100",
      "bg-teal-100",
      "bg-slate-100",
    ],
  },
};

const BOARD_LANGUAGES: Record<BoardLanguage, LanguageConfig> = {
  th: {
    label: "ภาษาไทย",
    buttonLabel: "เซฟตารางเป็นรูป",
    blockPrimaryLabel: "ไทย",
    blockSecondaryLabel: "อังกฤษ",
  },
  en: {
    label: "English",
    buttonLabel: "Save timetable image",
    blockPrimaryLabel: "English",
    blockSecondaryLabel: "Thai",
  },
};

const TIMES = [
  "8:00",
  "9:00",
  "10:00",
  "11:00",
  "12:00",
  "13:00",
  "14:00",
  "15:00",
  "16:00",
  "17:00",
  "18:00",
  "19:00",
];

const GRID_TOTAL_MINUTES = 12 * 60;

type DropdownOption<T extends string> = {
  value: T;
  label: string;
};

type FancyDropdownProps<T extends string> = {
  title: string;
  value: T;
  options: DropdownOption<T>[];
  open: boolean;
  onToggle: () => void;
  onSelect: (value: T) => void;
  buttonClassName: string;
  menuClassName: string;
};

function FancyDropdown<T extends string>({
  title,
  value,
  options,
  open,
  onToggle,
  onSelect,
  buttonClassName,
  menuClassName,
}: FancyDropdownProps<T>) {
  const selectedOption = options.find((option) => option.value === value) ?? options[0];

  return (
    <div className="relative">
      <button
        type="button"
        onClick={onToggle}
        className={buttonClassName}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className="shrink-0 text-[11px] font-bold uppercase text-neutral-500">
          {title}
        </span>
        <span className="text-[13px] font-bold text-neutral-900">
          {selectedOption?.label}
        </span>
        <span className="ml-1 text-neutral-500/90">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
            <path fill="currentColor" d="m4 6 4 4 4-4z" />
          </svg>
        </span>
      </button>

      {open ? (
        <div
          className={`absolute left-0 top-[calc(100%+0.5rem)] z-40 min-w-full overflow-hidden rounded-2xl border bg-white/95 p-2 shadow-[0_24px_40px_-24px_rgba(15,23,42,0.45)] backdrop-blur ${menuClassName}`}
          role="listbox"
        >
          {options.map((option) => {
            const isSelected = option.value === value;

            return (
              <button
                key={option.value}
                type="button"
                onClick={() => onSelect(option.value)}
                className={`flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2 text-left text-sm transition ${
                  isSelected ? "bg-neutral-100 text-neutral-950" : "text-neutral-700 hover:bg-neutral-100"
                }`}
                role="option"
                aria-selected={isSelected}
              >
                <span className="font-semibold">{option.label}</span>
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

export function ScheduleBoard({
  year,
  semester,
  rawRowsCount,
  parsedEventCount,
  displayedEventsByDay,
  responsePeriod,
  periodMismatch,
  resyncStatus,
  fetchErrorMessage,
}: ScheduleBoardProps) {
  const tableSectionRef = useRef<HTMLElement | null>(null);
  const controlsRef = useRef<HTMLDivElement | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState<BoardTheme>("forest");
  const [selectedLanguage, setSelectedLanguage] = useState<BoardLanguage>("th");
  const [openMenu, setOpenMenu] = useState<"language" | "theme" | null>(null);

  const activeTheme = BOARD_THEMES[selectedTheme];
  const themeEntries = Object.entries(BOARD_THEMES) as [BoardTheme, ThemeConfig][];
  const activeLanguage = BOARD_LANGUAGES[selectedLanguage];
  const languageEntries = Object.entries(BOARD_LANGUAGES) as [BoardLanguage, LanguageConfig][];

  useEffect(() => {
    const handlePointerDown = (event: PointerEvent) => {
      if (!controlsRef.current || controlsRef.current.contains(event.target as Node)) {
        return;
      }

      setOpenMenu(null);
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpenMenu(null);
      }
    };

    window.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("keydown", handleEscape);
    };
  }, []);

  useEffect(() => {
    const refreshUrl = "/api/auth/logout?mode=refresh";
    const logoutUrl = "/api/auth/logout?mode=grace&seconds=60";

    void fetch(refreshUrl, {
      method: "POST",
      credentials: "include",
      cache: "no-store",
    }).catch(() => undefined);

    const scheduleAuthReset = () => {
      try {
        if (typeof navigator !== "undefined" && typeof navigator.sendBeacon === "function") {
          const payload = new Blob([], { type: "application/json" });
          const queued = navigator.sendBeacon(logoutUrl, payload);
          if (queued) {
            return;
          }
        }
      } catch {
        // Ignore beacon errors and fallback to fetch.
      }

      void fetch(logoutUrl, {
        method: "POST",
        credentials: "include",
        keepalive: true,
        cache: "no-store",
      }).catch(() => undefined);
    };

    const handlePageHide = () => {
      scheduleAuthReset();
    };

    window.addEventListener("pagehide", handlePageHide);

    return () => {
      window.removeEventListener("pagehide", handlePageHide);
      scheduleAuthReset();
    };
  }, []);

  const handleExport = async () => {
    const exportNode = tableSectionRef.current;

    if (!exportNode || isExporting) {
      return;
    }

    setIsExporting(true);

    try {
      const captureWidth = Math.max(exportNode.scrollWidth, exportNode.offsetWidth);
      const captureHeight = Math.max(exportNode.scrollHeight, exportNode.offsetHeight);

      const dataUrl = await toPng(exportNode, {
        cacheBust: true,
        pixelRatio: 2,
        backgroundColor: "#ffffff",
        width: captureWidth,
        height: captureHeight,
        style: {
          width: `${captureWidth}px`,
          height: `${captureHeight}px`,
        },
      });

      const link = document.createElement("a");
      link.download = `ku-schedule-${year}-semester-${semester}-${selectedLanguage}.png`;
      link.href = dataUrl;
      link.click();
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <main className={`relative min-h-screen overflow-hidden px-2 py-3 sm:px-4 lg:px-6 ${activeTheme.pageGradient} ${activeTheme.pagePattern}`}>
      <div className={`pointer-events-none absolute -top-32 -left-32 h-96 w-96 rounded-full blur-3xl ${activeTheme.orbTop}`} />
      <div className={`pointer-events-none absolute -right-32 -bottom-32 h-96 w-96 rounded-full blur-3xl ${activeTheme.orbBottom}`} />
      <div className="mx-auto w-full max-w-[1600px]">
        <div ref={controlsRef} className="mb-4 flex flex-wrap items-center gap-3">
          <FancyDropdown
            title="ภาษา"
            value={selectedLanguage}
            options={languageEntries.map(([key, config]) => ({
              value: key,
              label: config.label,
            }))}
            open={openMenu === "language"}
            onToggle={() => setOpenMenu((current) => (current === "language" ? null : "language"))}
            onSelect={(value) => {
              setSelectedLanguage(value);
              setOpenMenu(null);
            }}
            buttonClassName="inline-flex h-11 items-center gap-2 rounded-full border border-cyan-200/70 bg-gradient-to-r from-white via-cyan-50 to-white px-4 text-sm font-semibold text-neutral-700 shadow-[0_10px_24px_-16px_rgba(14,165,233,0.45)] backdrop-blur-sm transition hover:-translate-y-[1px] hover:shadow-[0_14px_28px_-18px_rgba(14,165,233,0.55)]"
            menuClassName="border-cyan-200/60"
          />

          <FancyDropdown
            title="Theme ตาราง"
            value={selectedTheme}
            options={themeEntries.map(([key, config]) => ({
              value: key,
              label: config.label,
            }))}
            open={openMenu === "theme"}
            onToggle={() => setOpenMenu((current) => (current === "theme" ? null : "theme"))}
            onSelect={(value) => {
              setSelectedTheme(value);
              setOpenMenu(null);
            }}
            buttonClassName="inline-flex h-11 items-center gap-2 rounded-full border border-emerald-200/70 bg-gradient-to-r from-white via-emerald-50 to-white px-4 text-sm font-semibold text-neutral-700 shadow-[0_10px_24px_-16px_rgba(16,185,129,0.45)] backdrop-blur-sm transition hover:-translate-y-[1px] hover:shadow-[0_14px_28px_-18px_rgba(16,185,129,0.55)]"
            menuClassName="border-emerald-200/60"
          />

          <button
            type="button"
            onClick={handleExport}
            disabled={isExporting}
            className={`inline-flex h-11 items-center rounded-full px-5 text-sm font-bold text-white transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-60 disabled:shadow-none ${activeTheme.actionButton}`}
          >
            {isExporting ? (
              "กำลังเซฟ..."
            ) : (
              <span className="inline-flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" aria-hidden="true">
                  <path
                    fill="#fff"
                    d="M5 2a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2v-5.5A1.5 1.5 0 0 1 6.5 9h10q.255 0 .5.035V5.621a2 2 0 0 0-.586-1.414l-1.621-1.621A2 2 0 0 0 13.379 2H13v3.5A1.5 1.5 0 0 1 11.5 7h-4A1.5 1.5 0 0 1 6 5.5V2zm5.05 8A3.5 3.5 0 0 0 9 12.5V16H6v-5.5a.5.5 0 0 1 .5-.5zM12 2H7v3.5a.5.5 0 0 0 .5.5h4a.5.5 0 0 0 .5-.5zm-2 10.5a2.5 2.5 0 0 1 2.5-2.5h4a2.5 2.5 0 0 1 2.5 2.5v4c0 .51-.152.983-.414 1.379l-3.025-3.025a1.5 1.5 0 0 0-2.122 0l-3.025 3.025A2.5 2.5 0 0 1 10 16.5zm7 .25a.75.75 0 1 0-1.5 0a.75.75 0 0 0 1.5 0m-5.879 5.836c.396.262.87.414 1.379.414h4c.51 0 .983-.152 1.379-.414l-3.025-3.025a.5.5 0 0 0-.708 0z"
                    strokeWidth="0.3"
                    stroke="#fff"
                  />
                </svg>
                <span>{activeLanguage.buttonLabel}</span>
              </span>
            )}
          </button>
        </div>

        <div className="relative z-10">
          {fetchErrorMessage ? (
            <div className="mb-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 shadow-sm">
              {fetchErrorMessage}
            </div>
          ) : null}

          {resyncStatus === "success" ? (
            <div className="mb-3 rounded-xl border border-emerald-200 bg-emerald-50/95 px-4 py-3 text-sm text-emerald-900 shadow-sm">
              สั่ง KU Resync สำเร็จแล้ว และกำลังแสดงข้อมูลล่าสุดจากระบบ
            </div>
          ) : null}

          {resyncStatus === "failed" ? (
            <div className="mb-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-900">
              สั่ง KU Resync ไม่สำเร็จ ลองใหม่ด้วย query `resync=1` อีกครั้ง หรือเช็กสิทธิ์ token
            </div>
          ) : null}

          <section
            ref={tableSectionRef}
            className={`overflow-hidden rounded-xl border shadow-[0_24px_70px_-28px_rgba(0,0,0,0.35)] backdrop-blur-sm ${activeTheme.sectionBorder} ${activeTheme.sectionSurface}`}
            style={activeTheme.sectionStyle}
          >
            <div className="overflow-x-auto lg:overflow-x-visible">
              <div className="min-w-[1200px] p-1.5 sm:p-2.5 lg:min-w-0 lg:p-3">
                {displayedEventsByDay.every((day) => day.length === 0) ? (
                  <div className="mb-3 rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-800">
                    ยังไม่มีข้อมูลตารางเรียนจริงในขณะนี้
                  </div>
                ) : null}

                {rawRowsCount > 0 && parsedEventCount === 0 ? (
                  <div className="mb-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                    ระบบดึงข้อมูลวิชาได้แล้ว แต่ยังแปลงเวลา/วันมาแสดงไม่ได้ กรุณาส่งตัวอย่างข้อมูล 1 รายการเพื่อปรับ parser เพิ่ม
                  </div>
                ) : null}

                {periodMismatch ? (
                  <div className="mb-3 rounded-xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-900">
                    ระบบ KU ตอบข้อมูลเป็นปี {responsePeriod?.year} เทอม {responsePeriod?.semester} แม้จะร้องขอปี {year} เทอม {semester} (น่าจะเป็นข้อมูลล่าสุดจากฝั่งมหาวิทยาลัย)
                  </div>
                ) : null}

                <div className={`grid grid-cols-[96px_repeat(12,minmax(90px,1fr))] gap-px p-px lg:grid-cols-[96px_repeat(12,minmax(0,1fr))] ${activeTheme.gridBorder}`}>
                  <div className={`px-3 py-2 text-left text-xs font-bold uppercase text-white ${activeTheme.headerBg}`}>
                    Day / Time
                  </div>
                  {TIMES.map((time) => (
                    <div
                      key={time}
                      className={`${activeTheme.timeCellBg} ${activeTheme.timeCellText} px-2 py-2 text-center text-xs font-semibold`}
                    >
                      {time}
                    </div>
                  ))}

                  {DAYS.map((day, dayIndex) => (
                    <div key={day.label} className="contents">
                      <div
                        className={`flex items-center justify-center px-3 py-3 text-sm font-bold ${activeTheme.dayLabelText} ${activeTheme.dayColors[dayIndex]}`}
                      >
                        {day.label}
                      </div>

                      <div className={`relative col-span-12 grid h-28 grid-cols-12 gap-px ${activeTheme.gridBorder}`}>
                        {TIMES.map((time) => (
                          <div key={`${day.label}-${time}`} className={activeTheme.bodyCellBg} />
                        ))}

                        {displayedEventsByDay[dayIndex].map((event, eventIndex) => {
                          const leftPercent = (event.startMinute / GRID_TOTAL_MINUTES) * 100;
                          const widthPercent = Math.max(
                            ((event.endMinute - event.startMinute) / GRID_TOTAL_MINUTES) * 100,
                            100 / 24,
                          );
                          const themedEventColor =
                            activeTheme.eventColors[
                              (dayIndex + eventIndex) % activeTheme.eventColors.length
                            ];

                          return (
                            <div
                              key={`${day.label}-${event.title}-${event.startMinute}-${eventIndex}`}
                              className={`absolute z-10 rounded-xl border ${activeTheme.eventBorder} ${themedEventColor} p-2 ${activeTheme.eventShadow}`}
                              style={{
                                left: `${leftPercent}%`,
                                width: `${widthPercent}%`,
                                top: 2,
                                bottom: 2,
                              }}
                            >
                              <div className="flex h-full min-h-[82px] flex-col justify-between gap-1 sm:min-h-[94px] sm:gap-1.5 text-left text-[9px] leading-tight text-neutral-950 sm:text-[10px]">
                                <div className="flex min-w-0 items-start justify-between gap-2 text-[9px] font-semibold uppercase tracking-tight text-neutral-700/80 sm:text-[10px]">
                                  <span className="truncate whitespace-nowrap">{event.code || ""}</span>
                                  <span className="shrink-0">{event.timeLabel}</span>
                                </div>

                                <div className="flex-1 min-h-0 py-0.25 text-left sm:py-0.5">
                                  {selectedLanguage === "th" ? (
                                    <>
                                      <div
                                        className="break-words text-[11px] font-semibold leading-snug text-neutral-950 sm:text-[12px]"
                                        style={{
                                          display: "-webkit-box",
                                          WebkitBoxOrient: "vertical",
                                          WebkitLineClamp: 2,
                                          overflow: "hidden",
                                        }}
                                      >
                                        {event.title}
                                      </div>
                                      {event.titleEn ? (
                                        <div
                                          className="mt-0.5 break-words text-[9px] font-medium leading-snug text-neutral-700/80 sm:text-[11px]"
                                          style={{
                                            display: "-webkit-box",
                                            WebkitBoxOrient: "vertical",
                                            WebkitLineClamp: 2,
                                            overflow: "hidden",
                                          }}
                                        >
                                          {event.titleEn}
                                        </div>
                                      ) : null}
                                    </>
                                  ) : (
                                    <>
                                      {event.titleEn ? (
                                        <div
                                          className="break-words text-[11px] font-semibold leading-snug text-neutral-950 sm:text-[12px]"
                                          style={{
                                            display: "-webkit-box",
                                            WebkitBoxOrient: "vertical",
                                            WebkitLineClamp: 2,
                                            overflow: "hidden",
                                          }}
                                        >
                                          {event.titleEn}
                                        </div>
                                      ) : null}
                                      <div
                                        className="mt-0.5 break-words text-[9px] font-medium leading-snug text-neutral-700/80 sm:text-[11px]"
                                        style={{
                                          display: "-webkit-box",
                                          WebkitBoxOrient: "vertical",
                                          WebkitLineClamp: 2,
                                          overflow: "hidden",
                                        }}
                                      >
                                        {event.title}
                                      </div>
                                    </>
                                  )}
                                </div>

                                <div className="flex items-end justify-between gap-2 text-[9px] font-medium uppercase text-neutral-700/80 sm:text-[10px]">
                                  <span className="truncate">{event.room}</span>
                                  <span className="shrink-0 font-semibold text-neutral-800">
                                    {event.type}
                                  </span>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
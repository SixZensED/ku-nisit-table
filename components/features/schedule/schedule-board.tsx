"use client";

import { useEffect, useRef, useState } from "react";
import { toPng } from "html-to-image";

type DayConfig = {
  label: string;
  color: string;
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
};

const DAYS: DayConfig[] = [
  { label: "MON", color: "bg-[#eaf8e8]" },
  { label: "TUE", color: "bg-[#e4f5e2]" },
  { label: "WED", color: "bg-[#ddf1db]" },
  { label: "THU", color: "bg-[#d5ecd3]" },
  { label: "FRI", color: "bg-[#cde8cb]" },
  { label: "SAT", color: "bg-[#c4e2c2]" },
  { label: "SUN", color: "bg-[#badcb8]" },
];

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

export function ScheduleBoard({
  year,
  semester,
  rawRowsCount,
  parsedEventCount,
  displayedEventsByDay,
  responsePeriod,
  periodMismatch,
  resyncStatus,
}: ScheduleBoardProps) {
  const captureRef = useRef<HTMLDivElement | null>(null);
  const gridRef = useRef<HTMLDivElement | null>(null);
  const [isExporting, setIsExporting] = useState(false);

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
    const exportNode = gridRef.current ?? captureRef.current;

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
      link.download = `ku-schedule-${year}-semester-${semester}.png`;
      link.href = dataUrl;
      link.click();
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-br from-emerald-50 via-white to-green-50 px-2 py-3 sm:px-4 lg:px-6">
      <div className="pointer-events-none absolute -top-32 -left-32 h-96 w-96 rounded-full bg-emerald-200/30 blur-3xl" />
      <div className="pointer-events-none absolute -right-32 -bottom-32 h-96 w-96 rounded-full bg-green-200/25 blur-3xl" />
      <div className="mx-auto w-full max-w-[1600px]">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleExport}
            disabled={isExporting}
            className="inline-flex h-11 items-center rounded-full bg-gradient-to-b from-[#4fbf42] via-[#2f9e33] to-[#1f7d27] px-5 text-sm font-bold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.35),inset_0_-1px_0_rgba(0,0,0,0.16),0_4px_0_#16591f,0_8px_14px_rgba(16,88,36,0.24)] transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-60 disabled:shadow-none"
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
                <span>เซฟตารางเป็นรูป</span>
              </span>
            )}
          </button>
        </div>

        <div ref={captureRef} className="relative z-10">
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

          <section className="overflow-hidden rounded-xl border border-[#4fbf42]/35 bg-white/95 shadow-[0_24px_70px_-28px_rgba(0,0,0,0.35)] backdrop-blur-sm">
            <div className="overflow-x-auto lg:overflow-x-visible">
              <div ref={gridRef} className="min-w-[1200px] p-1.5 sm:p-2.5 lg:min-w-0 lg:p-3">
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

                <div className="grid grid-cols-[96px_repeat(12,minmax(90px,1fr))] gap-px bg-[#d6e8d5] p-px lg:grid-cols-[96px_repeat(12,minmax(0,1fr))]">
                  <div className="bg-[#1f7d27] px-3 py-2 text-left text-xs font-bold uppercase tracking-[0.2em] text-white">
                    Day / Time
                  </div>
                  {TIMES.map((time) => (
                    <div
                      key={time}
                      className="bg-white px-2 py-2 text-center text-xs font-semibold text-neutral-700"
                    >
                      {time}
                    </div>
                  ))}

                  {DAYS.map((day, dayIndex) => (
                    <div key={day.label} className="contents">
                      <div className={`flex items-center justify-center px-3 py-3 text-sm font-bold tracking-[0.25em] text-[#14532d] ${day.color}`}>
                        {day.label}
                      </div>

                      <div className="relative col-span-12 grid h-28 grid-cols-12 gap-px bg-[#d6e8d5]">
                        {TIMES.map((time) => (
                          <div key={`${day.label}-${time}`} className="bg-white" />
                        ))}

                        {displayedEventsByDay[dayIndex].map((event, eventIndex) => {
                          const leftPercent = (event.startMinute / GRID_TOTAL_MINUTES) * 100;
                          const widthPercent = Math.max(
                            ((event.endMinute - event.startMinute) / GRID_TOTAL_MINUTES) * 100,
                            100 / 24,
                          );

                          return (
                            <div
                              key={`${day.label}-${event.title}-${event.startMinute}-${eventIndex}`}
                              className={`absolute z-10 rounded-xl border border-[#2f9e33]/20 ${event.color} p-2 shadow-[0_6px_14px_rgba(31,125,39,0.08)]`}
                              style={{
                                left: `${leftPercent}%`,
                                width: `${widthPercent}%`,
                                top: 2,
                                bottom: 2,
                              }}
                            >
                              <div className="flex h-full min-h-[94px] flex-col justify-between gap-1.5 text-left text-[10px] leading-tight text-neutral-950">
                                <div className="flex items-start justify-between gap-2 text-[10px] font-semibold uppercase tracking-tight text-neutral-700/80">
                                  <span className="truncate whitespace-nowrap">{event.code || ""}</span>
                                  <span className="shrink-0">{event.timeLabel}</span>
                                </div>

                                <div className="flex-1 py-0.5 text-left">
                                  <div className="text-[11px] font-semibold leading-snug text-neutral-950">
                                    {event.title}
                                  </div>
                                  {event.titleEn ? (
                                    <div className="mt-0.5 text-[9px] font-medium leading-snug text-neutral-700/75">
                                      {event.titleEn}
                                    </div>
                                  ) : null}
                                </div>

                                <div className="flex items-end justify-between gap-2 text-[10px] font-medium uppercase tracking-wide text-neutral-700/80">
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
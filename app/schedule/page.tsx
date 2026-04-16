import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { fetchKuGroupCourse, triggerKuProfileResync } from "@/lib/ku-api";
import { ScheduleBoard } from "@/components/features/schedule/schedule-board";
import { waitForSkeleton } from "@/lib/skeleton-delay";

export const revalidate = 0; // No caching - always fetch fresh data

export const metadata: Metadata = {
  title: "Schedule",
  description: "ตารางเรียนเฉพาะบัญชีผู้ใช้ KU Nisit Table",
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
      noimageindex: true,
    },
  },
};

type SchedulePageProps = {
  searchParams?: Promise<{
    year?: string;
    semester?: string;
    resync?: string;
  }>;
};

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

const DAYS: DayConfig[] = [
  { label: "MON", color: "bg-[#f7b267]" },
  { label: "TUE", color: "bg-[#f28482]" },
  { label: "WED", color: "bg-[#84dcc6]" },
  { label: "THU", color: "bg-[#ffd166]" },
  { label: "FRI", color: "bg-[#7ac7ff]" },
  { label: "SAT", color: "bg-[#cdb4db]" },
  { label: "SUN", color: "bg-[#ffafcc]" },
];

type RawCourseRecord = Record<string, unknown>;

type NormalizedScheduleSource = {
  results?: unknown;
  data?: unknown;
  result?: unknown;
  groupCourse?: unknown;
  groupCourseList?: unknown;
  courses?: unknown;
  items?: unknown;
  rows?: unknown;
  schedule?: unknown;
};

type ParsedEventRecord = {
  dayIndex: number | null;
  startMinute: number | null;
  endMinute: number | null;
  startIndex: number;
  code: string;
  title: string;
  titleEn: string;
  room: string;
  type: string;
  timeLabel: string;
};

type UnscheduledCourse = {
  code: string;
  title: string;
  titleEn: string;
  room: string;
  type: string;
  teacherName: string;
  teacherNameEn: string;
  periodLabel: string;
};

const DAY_COLOR_FALLBACKS = [
  "bg-[#fff0d9]",
  "bg-[#ffe0e0]",
  "bg-[#def7ef]",
  "bg-[#fff5cf]",
  "bg-[#dff0ff]",
  "bg-[#efe4ff]",
  "bg-[#ffe3ef]",
];

const GRID_START_HOUR = 8;
const GRID_END_HOUR = 20;
const GRID_TOTAL_MINUTES = (GRID_END_HOUR - GRID_START_HOUR) * 60;

function asText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function findField(record: RawCourseRecord, keys: string[]) {
  for (const key of keys) {
    if (key in record && record[key] !== undefined && record[key] !== null) {
      return record[key];
    }
  }

  return undefined;
}

function getCourseRows(rawData: unknown): RawCourseRecord[] {
  if (!rawData || typeof rawData !== "object") {
    return [];
  }

  const source = rawData as NormalizedScheduleSource & RawCourseRecord;

  const exactResults = source.results;
  if (Array.isArray(exactResults)) {
    const rows = exactResults.flatMap((result) => {
      if (!result || typeof result !== "object") {
        return [] as RawCourseRecord[];
      }

      const resultObject = result as RawCourseRecord & { course?: unknown };
      if (Array.isArray(resultObject.course)) {
        return resultObject.course.filter(
          (courseItem): courseItem is RawCourseRecord =>
            Boolean(courseItem) && typeof courseItem === "object" && !Array.isArray(courseItem),
        );
      }

      return [] as RawCourseRecord[];
    });

    if (rows.length > 0) {
      return rows;
    }
  }

  return collectCandidateArrays(rawData).flat();
}

function resolveDayFromText(text: string) {
  const upperText = text.toUpperCase();

  if (/MON|MONDAY|จัน|จันท/.test(upperText)) return 0;
  if (/TUE|TUES|อัง|อังคาร/.test(upperText)) return 1;
  if (/WED|WEDNES|พุธ/.test(upperText)) return 2;
  if (/THU|THUR|พฤ/.test(upperText)) return 3;
  if (/FRI|FRIDAY|ศุก/.test(upperText)) return 4;
  if (/SAT|SATUR|เสาร์/.test(upperText)) return 5;
  if (/SUN|SUNDAY|อาทิ/.test(upperText)) return 6;

  return null;
}

function resolveDayIndex(value: unknown) {
  if (typeof value === "number" && value >= 0 && value <= 6) {
    return value;
  }

  const text = asText(value).toUpperCase();
  const directMatch = resolveDayFromText(text);
  if (directMatch !== null) {
    return directMatch;
  }

  const matchedIndex = DAYS.findIndex((day) => text.includes(day.label));
  return matchedIndex >= 0 ? matchedIndex : null;
}

function resolveDayIndexFromNumberLike(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) {
    const rounded = Math.floor(value);

    if (rounded >= 1 && rounded <= 7) {
      return rounded - 1;
    }
  }

  const text = asText(value);

  if (/^[1-7]$/.test(text)) {
    return Number(text) - 1;
  }

  return null;
}

function resolveTimeIndex(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) {
    const totalMinutes = value;
    const hour = Math.floor(totalMinutes / 60);
    const index = hour - 8;
    return index >= 0 && index <= 11 ? index : null;
  }

  const text = asText(value);
  const match = text.match(/(\d{1,2})(?::(\d{2}))?/);

  if (!match) {
    return null;
  }

  const hour = Number(match[1]);
  if (Number.isNaN(hour)) {
    return null;
  }

  const index = hour - 8;
  return index >= 0 && index <= 11 ? index : null;
}

function resolveMinutesOfDay(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) {
    const numeric = Math.floor(value);

    if (numeric >= 0 && numeric < 24) {
      return numeric * 60;
    }

    if (numeric >= 0 && numeric <= 24 * 60) {
      return numeric;
    }

    return null;
  }

  const text = asText(value);
  const match = text.match(/(\d{1,2})(?::(\d{2}))?/);

  if (!match) {
    return null;
  }

  const hour = Number(match[1]);
  const minute = Number(match[2] ?? "0");

  if (Number.isNaN(hour) || Number.isNaN(minute)) {
    return null;
  }

  return hour * 60 + minute;
}

function resolveMinuteOffset(value: unknown) {
  const minuteOfDay = resolveMinutesOfDay(value);

  if (minuteOfDay === null) {
    return null;
  }

  const offset = minuteOfDay - GRID_START_HOUR * 60;

  if (offset < 0 || offset > GRID_TOTAL_MINUTES) {
    return null;
  }

  return offset;
}

function resolveSpan(startValue: unknown, endValue: unknown) {
  const start = resolveTimeIndex(startValue);
  const end = resolveTimeIndex(endValue);

  if (start === null || end === null) {
    return 1;
  }

  return Math.max(1, end - start);
}

function resolveDayFromWeekString(value: unknown) {
  const text = asText(value).trim();

  if (/^1+$/.test(text.slice(0, 1)) && text.length >= 7) {
    const index = text.split("").findIndex((char) => char === "1");
    return index >= 0 && index <= 6 ? index : null;
  }

  const dayText = text.toUpperCase();
  if (dayText.startsWith("MON")) return 0;
  if (dayText.startsWith("TUE")) return 1;
  if (dayText.startsWith("WED")) return 2;
  if (dayText.startsWith("THU")) return 3;
  if (dayText.startsWith("FRI")) return 4;
  if (dayText.startsWith("SAT")) return 5;
  if (dayText.startsWith("SUN")) return 6;

  return resolveDayIndex(value);
}

function resolveEventRecord(record: RawCourseRecord): ParsedEventRecord | null {
  const dayIndex =
    resolveDayFromWeekString(findField(record, ["day_w", "day_w_c", "day_code", "weekDayCode"])) ??
    resolveDayIndex(
      findField(record, [
        "day",
        "dayOfWeek",
        "weekDay",
        "weekday",
        "dayName",
        "dayNo",
        "day_code",
        "dayIndex",
        "meetingDay",
        "scheduleDay",
      ]),
    ) ??
    resolveDayIndexFromNumberLike(findField(record, ["day_no", "weekday_no", "dayIndexNo"]));

  const startValue = findField(record, [
    "time_start",
    "startTime",
    "timeStart",
    "start",
    "beginTime",
    "fromTime",
    "begin",
    "timeFrom",
    "startHour",
    "start_time",
    "time_begin",
    "start_minute",
  ]);

  const fallbackStartValue = findField(record, [
    "time",
    "slotStart",
    "timeFromText",
    "period",
    "time_from",
    "time_from_text",
    "startTimeText",
    "start_text",
  ]);

  const endValue = findField(record, [
    "endTime",
    "timeEnd",
    "end",
    "toTime",
    "finishTime",
    "time_to",
    "time_to_text",
    "end_text",
    "finish_time",
  ]);

  const startMinute = resolveMinuteOffset(startValue) ?? resolveMinuteOffset(fallbackStartValue);
  const endMinuteRaw = resolveMinuteOffset(endValue);

  if (dayIndex === null || startMinute === null) {
    return null;
  }

  const endMinute =
    endMinuteRaw !== null && endMinuteRaw > startMinute
      ? endMinuteRaw
      : Math.min(startMinute + 60, GRID_TOTAL_MINUTES);
  const startIndex = Math.floor(startMinute / 60);

  const title =
    asText(
      findField(record, [
        "subject_name_th",
        "subjectName",
        "courseName",
        "name",
        "subject",
        "courseTitle",
        "subject_title_th",
        "subject_title",
        "course_title",
      ]),
    ) ||
    asText(findField(record, ["subject_name_en", "subjectCode", "courseCode", "subject_code_en"])) ||
    asText(findField(record, ["subjectCode", "courseCode", "subject_code"])) ||
    "Class";

  const titleEn =
    asText(findField(record, ["subject_name_en", "subjectNameEn", "courseNameEn", "subject_title_en"])) ||
    "";

  const code = asText(findField(record, ["subject_code", "subjectCode", "courseCode", "subjectCodeEn"])) || "";

  const room =
    asText(
      findField(record, [
        "room_name_th",
        "room_name_en",
        "room",
        "classRoom",
        "location",
        "classroom",
        "roomName",
        "room_no",
        "roomNo",
      ]),
    ) ||
    "ROOM";

  const timeFrom =
    asText(findField(record, ["time_from", "timeFrom", "startTimeText", "start_text"])) ||
    (typeof findField(record, ["time_start"]) === "number"
      ? `${Math.floor(Number(findField(record, ["time_start"])) / 60)}:${String(Number(findField(record, ["time_start"])) % 60).padStart(2, "0")}`
      : "");

  const timeTo = asText(findField(record, ["time_to", "timeTo", "endTimeText", "end_text"]));
  const timeLabel = timeFrom || timeTo ? `[${timeFrom || ""}${timeFrom && timeTo ? " - " : ""}${timeTo || ""}]` : "";

  const type =
    asText(
      findField(record, [
        "section_type_en",
        "section_type_th",
        "type",
        "lectureType",
        "classType",
        "subjectType",
        "sessionType",
        "sectionType",
      ]),
    ) ||
    "Lecture";

  return {
    dayIndex,
    startMinute,
    endMinute,
    startIndex,
    code,
    title,
    titleEn,
    room,
    type,
    timeLabel,
  };
}

function resolveUnscheduledCourse(record: RawCourseRecord): UnscheduledCourse {
  const code = asText(findField(record, ["subject_code", "subjectCode", "courseCode", "subjectCodeEn"]));
  const title =
    asText(
      findField(record, [
        "subject_name_th",
        "subjectName",
        "courseName",
        "name",
        "subject",
        "courseTitle",
        "subject_title_th",
        "subject_title",
        "course_title",
      ]),
    ) || code || "Class";
  const titleEn =
    asText(findField(record, ["subject_name_en", "subjectNameEn", "courseNameEn", "subject_title_en"])) || "";
  const room =
    asText(
      findField(record, [
        "room_name_th",
        "room_name_en",
        "room",
        "classRoom",
        "location",
        "classroom",
        "roomName",
        "room_no",
        "roomNo",
      ]),
    ) ||
    "ROOM";
  const type =
    asText(
      findField(record, [
        "section_type_en",
        "section_type_th",
        "type",
        "lectureType",
        "classType",
        "subjectType",
        "sessionType",
        "sectionType",
      ]),
    ) ||
    "Lecture";
  const teacherName =
    asText(findField(record, ["teacher_name", "teacherName", "instructor_name", "instructorName"])) ||
    "ติดต่อผู้สอน";
  const teacherNameEn =
    asText(findField(record, ["teacher_name_en", "teacherNameEn", "instructor_name_en", "instructorNameEn"])) ||
    "Contact teacher";
  const periodLabel =
    asText(findField(record, ["groupheader", "peroid_date", "period_date", "weekstartday"])) ||
    "No weekly time";

  return {
    code,
    title,
    titleEn,
    room,
    type,
    teacherName,
    teacherNameEn,
    periodLabel,
  };
}

function collectCandidateArrays(value: unknown, depth = 0): RawCourseRecord[][] {
  if (!value || depth > 3) {
    return [];
  }

  if (Array.isArray(value)) {
    if (value.every((item) => item && typeof item === "object" && !Array.isArray(item))) {
      return [value as RawCourseRecord[]];
    }

    return value.flatMap((item) => collectCandidateArrays(item, depth + 1));
  }

  if (typeof value !== "object") {
    return [];
  }

  const source = value as NormalizedScheduleSource & RawCourseRecord;
  const directCandidates = [
    source.data,
    source.result,
    source.groupCourse,
    source.groupCourseList,
    source.courses,
    source.items,
    source.rows,
    source.schedule,
  ];

  const arraysFromKnownKeys = directCandidates.flatMap((candidate) =>
    collectCandidateArrays(candidate, depth + 1),
  );

  if (arraysFromKnownKeys.length > 0) {
    return arraysFromKnownKeys;
  }

  return Object.values(source).flatMap((candidate) => collectCandidateArrays(candidate, depth + 1));
}

function toEventsByDay(rawData: unknown): EventBlock[][] {
  const records = getCourseRows(rawData);

  const grouped: EventBlock[][] = Array.from({ length: 7 }, () => []);

  for (const record of records) {
    const parsed = resolveEventRecord(record);

    if (parsed === null) {
      continue;
    }

    // Defensive: skip if dayIndex, endMinute or startMinute is null (should not happen, but for type safety)
    if (
      parsed.dayIndex === null ||
      parsed.endMinute === null ||
      parsed.startMinute === null
    ) {
      continue;
    }
    const event: EventBlock = {
      start: parsed.startIndex,
      span: Math.max(1, Math.ceil((parsed.endMinute - parsed.startMinute) / 60)),
      startMinute: parsed.startMinute,
      endMinute: parsed.endMinute,
      code: parsed.code,
      title: parsed.title,
      titleEn: parsed.titleEn,
      room: parsed.room,
      type: parsed.type,
      timeLabel: parsed.timeLabel,
      color: DAY_COLOR_FALLBACKS[parsed.dayIndex],
    };

    grouped[parsed.dayIndex].push(event);
  }

  return grouped;
}

function parsePositiveInt(value: string | undefined) {
  if (!value) {
    return null;
  }

  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    return null;
  }

  return parsed;
}

function parseNonNegativeInt(value: string | undefined) {
  if (!value) {
    return null;
  }

  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 0) {
    return null;
  }

  return parsed;
}

function resolveScheduleParams(params: { year?: string; semester?: string } | undefined) {
  const currentDate = new Date();
  const currentAcademicYear = currentDate.getFullYear() + 543;
  const currentMonth = currentDate.getMonth() + 1;
  const defaultAcademicYear = currentMonth >= 5 ? currentAcademicYear : currentAcademicYear - 1;
  const defaultSemester = currentMonth >= 5 && currentMonth <= 10 ? 1 : 2;
  const parsedYear = parsePositiveInt(params?.year);
  const parsedSemester = parseNonNegativeInt(params?.semester);

  const year = parsedYear && parsedYear >= 2500 && parsedYear <= 2700 ? parsedYear : defaultAcademicYear;
  const semester = parsedSemester !== null && parsedSemester >= 0 && parsedSemester <= 3 ? parsedSemester : defaultSemester;
  return { year, semester };
}

function shouldTriggerResync(value: string | undefined) {
  if (!value) {
    return false;
  }

  const lowered = value.trim().toLowerCase();
  return lowered === "1" || lowered === "true" || lowered === "yes";
}

function resolveResponsePeriod(rows: RawCourseRecord[]) {
  const yearKeys = [
    "academicYear",
    "academic_year",
    "year",
    "edu_year",
  ];
  const semesterKeys = [
    "semester",
    "sem",
    "term",
    "edu_semester",
  ];

  for (const row of rows) {
    const yearValue = findField(row, yearKeys);
    const semesterValue = findField(row, semesterKeys);

    const yearText = asText(yearValue) || (typeof yearValue === "number" ? String(yearValue) : "");
    const semesterText = asText(semesterValue) || (typeof semesterValue === "number" ? String(semesterValue) : "");

    const parsedYear = parsePositiveInt(yearText);
    const parsedSemester = parseNonNegativeInt(semesterText);

    if (parsedYear && parsedSemester !== null) {
      return { year: parsedYear, semester: parsedSemester };
    }
  }

  return null;
}

export default async function SchedulePage({ searchParams }: SchedulePageProps) {
  await waitForSkeleton();

  const params = await searchParams;
  const { year, semester } = resolveScheduleParams(params);
  const forceResync = shouldTriggerResync(params?.resync);

  const cookieStore = await cookies();
  const hasAuth = cookieStore.get("ku_access_token") && cookieStore.get("ku_student_id");

  if (!hasAuth) {
    redirect("/auth/login");
  }

  let displayedEventsByDay: EventBlock[][] = Array.from({ length: 7 }, () => []);
  let unscheduledCourses: UnscheduledCourse[] = [];
  let resyncStatus: "idle" | "success" | "failed" = "idle";
  let fetchErrorMessage: string | null = null;

  if (forceResync) {
    try {
      await triggerKuProfileResync();
      resyncStatus = "success";
    } catch {
      resyncStatus = "failed";
    }
  }

  let scheduleData: unknown = null;

  try {
    scheduleData = await fetchKuGroupCourse({
      academicYear: year,
      semester,
    });
  } catch (error) {
    fetchErrorMessage =
      error instanceof Error
        ? error.message === "Failed to fetch group course data"
          ? "ดึงข้อมูลตารางเรียนไม่สำเร็จ ลองรีเฟรชหน้า หรือตรวจสอบการเข้าสู่ระบบอีกครั้ง"
          : error.message
        : "ดึงข้อมูลตารางเรียนไม่สำเร็จ ลองรีเฟรชหน้าอีกครั้ง";
  }

  if (!scheduleData) {
    return (
      <ScheduleBoard
        year={year}
        semester={semester}
        rawRowsCount={0}
        parsedEventCount={0}
        displayedEventsByDay={displayedEventsByDay}
        unscheduledCourses={[]}
        responsePeriod={null}
        periodMismatch={false}
        resyncStatus={resyncStatus}
        fetchErrorMessage={fetchErrorMessage}
      />
    );
  }

  const rawRows = getCourseRows(scheduleData);
  const normalized = toEventsByDay(scheduleData);
  const hasAnyEvents = normalized.some((day) => day.length > 0);
  const parsedEventCount = normalized.reduce((total, day) => total + day.length, 0);
  unscheduledCourses = rawRows
    .map((row) => (resolveEventRecord(row) === null ? resolveUnscheduledCourse(row) : null))
    .filter((course): course is UnscheduledCourse => course !== null);
  const responsePeriod = resolveResponsePeriod(rawRows);
  const periodMismatch =
    responsePeriod !== null && (responsePeriod.year !== year || responsePeriod.semester !== semester);

  if (hasAnyEvents) {
    displayedEventsByDay = normalized;
  }

  return (
    <ScheduleBoard
      year={year}
      semester={semester}
      rawRowsCount={rawRows.length}
      parsedEventCount={parsedEventCount}
      displayedEventsByDay={displayedEventsByDay}
      unscheduledCourses={unscheduledCourses}
      responsePeriod={responsePeriod}
      periodMismatch={periodMismatch}
      resyncStatus={resyncStatus}
      fetchErrorMessage={fetchErrorMessage}
    />
  );
}

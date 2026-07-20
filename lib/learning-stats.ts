import type { LearningLog } from "@/lib/learning-logs";

const DAY_MS = 24 * 60 * 60 * 1000;

function toUtc(date: string) {
  const [year, month, day] = date.split("-").map(Number);
  return Date.UTC(year, month - 1, day);
}

function toDateKey(utc: number) {
  return new Date(utc).toISOString().slice(0, 10);
}

/** 実行環境のタイムゾーンに依存しない、日本時間での今日の日付キー */
export function todayKeyInJapan(now = new Date()) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

export type LearningStats = {
  totalDays: number;
  /** 最新ログを終端とする連続学習日数 */
  currentStreak: number;
  /** 直近7日間(今日を含む)に学習した日数 */
  thisWeekDays: number;
  firstDate: string | null;
  latestDate: string | null;
};

export function getLearningStats(logs: LearningLog[], todayKey = todayKeyInJapan()): LearningStats {
  const dates = [...new Set(logs.map((log) => log.date))].sort();
  if (dates.length === 0) {
    return { totalDays: 0, currentStreak: 0, thisWeekDays: 0, firstDate: null, latestDate: null };
  }

  const dateSet = new Set(dates);
  const latestDate = dates.at(-1)!;

  let currentStreak = 1;
  let cursor = toUtc(latestDate);
  while (dateSet.has(toDateKey(cursor - DAY_MS))) {
    currentStreak += 1;
    cursor -= DAY_MS;
  }

  const weekStart = toUtc(todayKey) - 6 * DAY_MS;
  const thisWeekDays = dates.filter((date) => toUtc(date) >= weekStart && toUtc(date) <= toUtc(todayKey)).length;

  return {
    totalDays: dates.length,
    currentStreak,
    thisWeekDays,
    firstDate: dates[0],
    latestDate,
  };
}

export type HeatmapCell = {
  date: string;
  /** 濃度は5段階のスケールを持つが、学習量メタデータが未整備のため当面は 0 か 3 のみ */
  level: 0 | 1 | 2 | 3 | 4;
  day: number | null;
  topic: string | null;
  inRange: boolean;
};

export type HeatmapWeek = {
  key: string;
  /** 月曜始まりの7セル */
  cells: HeatmapCell[];
  /** この週から月が変わる場合の月ラベル(例: "7月") */
  monthLabel: string | null;
};

/** 直近weeks週分を、月曜始まりの週の配列として返す(ヒートマップ用) */
export function getHeatmapWeeks(
  logs: LearningLog[],
  weeks = 26,
  todayKey = todayKeyInJapan(),
): HeatmapWeek[] {
  const logByDate = new Map(logs.map((log) => [log.date, log]));
  const todayUtc = toUtc(todayKey);
  const mondayOffset = (new Date(todayUtc).getUTCDay() + 6) % 7;
  const firstMonday = todayUtc - mondayOffset * DAY_MS - (weeks - 1) * 7 * DAY_MS;

  const result: HeatmapWeek[] = [];
  let previousMonth: number | null = null;
  let weeksSinceLabel = Infinity;

  for (let week = 0; week < weeks; week += 1) {
    const weekStart = firstMonday + week * 7 * DAY_MS;
    const cells: HeatmapCell[] = [];

    for (let weekday = 0; weekday < 7; weekday += 1) {
      const cellUtc = weekStart + weekday * DAY_MS;
      const date = toDateKey(cellUtc);
      const log = logByDate.get(date);
      cells.push({
        date,
        // 学習量メタデータがないため、学習日は一律level 3。時間等が入ったら0〜4に配分する
        level: log ? 3 : 0,
        day: log?.day ?? null,
        topic: log?.topic ?? null,
        inRange: cellUtc <= todayUtc,
      });
    }

    const month = new Date(weekStart).getUTCMonth() + 1;
    // ラベル同士が重ならないよう、直前のラベルから3週間空いていない月替わりは無記載にする
    const monthLabel = month !== previousMonth && weeksSinceLabel >= 3 ? `${month}月` : null;
    previousMonth = month;
    weeksSinceLabel = monthLabel ? 0 : weeksSinceLabel + 1;

    result.push({ key: toDateKey(weekStart), cells, monthLabel });
  }

  return result;
}

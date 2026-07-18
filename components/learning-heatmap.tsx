import { formatJapaneseDate } from "@/lib/learning-format";
import type { LearningLog } from "@/lib/learning-logs";

const DAY_MS = 86_400_000;
const WEEK_COUNT = 20;

function utcDate(key: string) {
  return new Date(`${key}T00:00:00Z`);
}

function toKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

export function LearningHeatmap({ logs }: { logs: LearningLog[] }) {
  const logsByDate = new Map(logs.map((log) => [log.date, log]));

  const today = utcDate(toKey(new Date()));
  const gridEnd = new Date(today.getTime() + (6 - today.getUTCDay()) * DAY_MS);
  const gridStart = new Date(gridEnd.getTime() - (WEEK_COUNT * 7 - 1) * DAY_MS);

  const weeks = Array.from({ length: WEEK_COUNT }, (_, weekIndex) =>
    Array.from({ length: 7 }, (_, dayIndex) => {
      const date = new Date(gridStart.getTime() + (weekIndex * 7 + dayIndex) * DAY_MS);
      const key = toKey(date);
      return { key, log: logsByDate.get(key), isFuture: date.getTime() > today.getTime() };
    }),
  );

  const monthLabels = weeks.map((week, index) => {
    const month = Number(week[0].key.slice(5, 7));
    const previous = index > 0 ? Number(weeks[index - 1][0].key.slice(5, 7)) : null;
    return month !== previous ? `${month}月` : "";
  });

  let streak = 0;
  if (logs.length) {
    let cursor = utcDate(logs[0].date);
    while (logsByDate.has(toKey(cursor))) {
      streak += 1;
      cursor = new Date(cursor.getTime() - DAY_MS);
    }
  }
  const monthCount = logs.filter((log) => log.date.startsWith(toKey(today).slice(0, 7))).length;

  return (
    <div className="heatmap-panel">
      <div className="heatmap-stats">
        <div>
          <strong>{streak}</strong>
          <span>日連続で学習</span>
        </div>
        <div>
          <strong>{monthCount}</strong>
          <span>今月の学習日</span>
        </div>
      </div>
      <div className="heatmap-chart">
        <div className="heatmap-months" aria-hidden="true">
          {monthLabels.map((label, index) => (
            <span key={index}>{label}</span>
          ))}
        </div>
        <div className="heatmap-grid" role="img" aria-label={`直近${WEEK_COUNT}週間の学習カレンダー`}>
          {weeks.map((week, weekIndex) => (
            <div className="heatmap-week" key={weekIndex}>
              {week.map((day) => (
                <span
                  key={day.key}
                  className={
                    day.isFuture
                      ? "heatmap-cell is-future"
                      : day.log
                        ? "heatmap-cell is-active"
                        : "heatmap-cell"
                  }
                  title={
                    day.log
                      ? `${formatJapaneseDate(day.key)}｜Day ${day.log.day} ${day.log.topic}`
                      : day.isFuture
                        ? undefined
                        : formatJapaneseDate(day.key)
                  }
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

import Link from "next/link";
import { formatJapaneseDate, formatLearningPeriod, formatMonthLabel } from "@/lib/learning-format";
import { getLearningLogs } from "@/lib/learning-logs";
import { getLearningPhase } from "@/lib/learning-roadmap";

export default async function LearningLogsPage() {
  const logs = await getLearningLogs();
  const groupedLogs = logs.reduce<Map<string, typeof logs>>((groups, log) => {
    const month = log.date.slice(0, 7);
    groups.set(month, [...(groups.get(month) ?? []), log]);
    return groups;
  }, new Map());

  return (
    <main className="learning-page log-archive-page">
      <header className="archive-heading">
        <div>
          <p className="eyebrow">Learning Archive</p>
          <h1>学習ログ</h1>
          <p>学んだ内容を1日ごとに記録し、理解した仕組みをあとから振り返れるアーカイブです。</p>
        </div>
        <div className="archive-summary">
          <strong>{logs.length}</strong>
          <span>日分の学び</span>
          <small>{formatLearningPeriod(logs.at(-1)?.date, logs[0]?.date)}</small>
        </div>
      </header>

      <div className="archive-layout">
        <aside className="archive-aside">
          <p className="card-label">Archive</p>
          {[...groupedLogs.entries()].map(([month, monthLogs]) => (
            <a href={`#month-${month}`} key={month}>
              <span>{formatMonthLabel(month)}</span>
              <small>{monthLogs.length}</small>
            </a>
          ))}
        </aside>

        <div className="archive-months">
          {[...groupedLogs.entries()].map(([month, monthLogs]) => (
            <section className="archive-month" id={`month-${month}`} key={month}>
              <div className="month-heading">
                <h2>{formatMonthLabel(month)}</h2>
                <span>{monthLogs.length} logs</span>
              </div>
              <div className="timeline-list">
                {monthLogs.map((log) => {
                  const phase = getLearningPhase(log.phase);
                  return (
                    <Link href={`/learning/logs/${log.date}`} className="timeline-row" key={log.date}>
                      <div className="timeline-marker">
                        <span aria-hidden="true" />
                      </div>
                      <span className="timeline-day">Day {log.day}</span>
                      <div className="timeline-content">
                        <span className="log-meta">
                          <time dateTime={log.date}>{formatJapaneseDate(log.date)}</time>
                          <span className="phase-tag">{phase.label}</span>
                        </span>
                        <h3>{log.topic}</h3>
                        <p>{log.summary}</p>
                      </div>
                      <span className="row-arrow" aria-hidden="true">→</span>
                    </Link>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      </div>
    </main>
  );
}

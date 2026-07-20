import Link from "next/link";
import { formatLearningPeriod, formatMonthLabel, formatShortDate } from "@/lib/learning-format";
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
          {[...groupedLogs.entries()].map(([month, monthLogs], monthIndex) => (
            <details
              className="fold month-details"
              id={`month-${month}`}
              open={monthIndex === 0}
              key={month}
            >
              <summary>
                <span className="chevron" aria-hidden="true" />
                <strong>{formatMonthLabel(month)}</strong>
                <span className="mono fold-count">{monthLogs.length}日学習</span>
              </summary>

              <div className="fold-body">
                <table className="log-table">
                  <thead>
                    <tr>
                      <th scope="col">Day</th>
                      <th scope="col">日付</th>
                      <th scope="col">トピック</th>
                      <th scope="col" className="log-table-phase">フェーズ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {monthLogs.map((log) => (
                      <tr key={log.date}>
                        <td className="mono">{log.day}</td>
                        <td className="mono">
                          <time dateTime={log.date}>{formatShortDate(log.date)}</time>
                        </td>
                        <td>
                          <Link href={`/learning/logs/${log.date}`}>{log.topic}</Link>
                          <p>{log.summary}</p>
                        </td>
                        <td className="log-table-phase">{getLearningPhase(log.phase).label}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </details>
          ))}
        </div>
      </div>
    </main>
  );
}

import Link from "next/link";
import { formatShortDate } from "@/lib/learning-format";
import type { LearningLog } from "@/lib/learning-logs";
import { getLearningPhase } from "@/lib/learning-roadmap";

export function LearningTimeline({ logs }: { logs: LearningLog[] }) {
  if (logs.length === 0) {
    return <p className="empty-note">まだ学習ログがありません。</p>;
  }

  return (
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
        {logs.map((log) => (
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
  );
}

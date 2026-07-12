import Link from "next/link";
import { getLearningLogs } from "@/lib/learning-logs";

export default async function LearningLogsPage() {
  const logs = await getLearningLogs();

  return (
    <main className="learning-page compact-page">
      <div className="page-heading">
        <p className="eyebrow">Learning logs</p>
        <h1>学習ログ一覧</h1>
        <p>日々の実装と、その背景にある仕組みを新しい順に記録しています。</p>
      </div>
      <section className="log-list" aria-label="学習ログ一覧">
        {logs.map((log) => (
          <Link href={`/learning/logs/${log.date}`} className="log-row" key={log.date}>
            <time dateTime={log.date}>{log.date}</time>
            <span>{log.title}</span>
            <span aria-hidden="true">→</span>
          </Link>
        ))}
      </section>
    </main>
  );
}

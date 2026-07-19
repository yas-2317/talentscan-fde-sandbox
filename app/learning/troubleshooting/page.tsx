import Link from "next/link";
import { formatJapaneseDate } from "@/lib/learning-format";
import { getTroubleshootingLogs } from "@/lib/troubleshooting-logs";

export default async function TroubleshootingLogsPage() {
  const logs = await getTroubleshootingLogs();

  return (
    <main className="learning-page troubleshooting-page">
      <header className="archive-heading troubleshooting-heading">
        <div>
          <p className="eyebrow">Troubleshooting Archive</p>
          <h1>実践トラブルログ</h1>
          <p>開発中に実際に起きた問題を、症状・原因・調査記録・解決手順の形で振り返る記録です。</p>
        </div>
        <div className="archive-summary troubleshooting-summary">
          <strong>{logs.length}</strong>
          <span>件のトラブル記録</span>
          <small>再発時に検索して参照</small>
        </div>
      </header>

      <section className="troubleshooting-list" aria-label="実践トラブルログ一覧">
        {logs.map((log, index) => (
          <Link href={`/learning/troubleshooting/${log.slug}`} className="troubleshooting-row" key={log.slug}>
            <span className="incident-number">#{String(logs.length - index).padStart(2, "0")}</span>
            <div>
              <time dateTime={log.date}>{formatJapaneseDate(log.date)}</time>
              <h2>{log.title}</h2>
              <p>{log.summary}</p>
            </div>
            <span className="row-arrow" aria-hidden="true">→</span>
          </Link>
        ))}
      </section>
    </main>
  );
}

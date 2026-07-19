import Link from "next/link";
import { notFound } from "next/navigation";
import { extractMarkdownHeadings, MarkdownContent } from "@/components/markdown-content";
import { formatJapaneseDate } from "@/lib/learning-format";
import { getLearningLog, getLearningLogs } from "@/lib/learning-logs";
import { getLearningPhase } from "@/lib/learning-roadmap";
import { getReadings } from "@/lib/readings";

export async function generateStaticParams() {
  const logs = await getLearningLogs();
  return logs.map((log) => ({ date: log.date }));
}

export default async function LearningLogPage({ params }: { params: Promise<{ date: string }> }) {
  const { date } = await params;
  const log = await getLearningLog(date);
  if (!log) notFound();
  const [logs, readings] = await Promise.all([getLearningLogs(), getReadings()]);
  const currentIndex = logs.findIndex((entry) => entry.date === date);
  const newerLog = currentIndex > 0 ? logs[currentIndex - 1] : null;
  const olderLog = currentIndex >= 0 && currentIndex < logs.length - 1 ? logs[currentIndex + 1] : null;
  const phase = getLearningPhase(log.phase);
  const headings = extractMarkdownHeadings(log.content);
  const relatedReadings = readings.filter(
    (reading) => reading.relatedLogs.includes(log.date) || log.completedLessons.includes(reading.slug),
  );

  return (
    <main className="log-detail-page">
      <Link href="/learning/logs" className="back-link">← 学習ログ一覧へ</Link>

      <header className="log-detail-header">
        <div className="detail-meta-row">
          <span className="day-badge">Day {log.day}</span>
          <time dateTime={log.date}>{formatJapaneseDate(log.date)}</time>
          <span className="phase-tag">{phase.label}</span>
        </div>
        <h1>{log.topic}</h1>
        <p>{log.summary}</p>
      </header>

      <div className="log-detail-grid">
        <aside className="log-toc">
          <p className="card-label">On this page</p>
          <nav aria-label="このログの目次">
            {headings.map((heading) => (
              <a className={heading.level === 3 ? "is-nested" : ""} href={`#${heading.id}`} key={`${heading.id}-${heading.level}`}>
                {heading.text}
              </a>
            ))}
          </nav>
        </aside>

        <div className="log-detail-main">
          <MarkdownContent content={log.content} hideTitle />

          {relatedReadings.length > 0 && (
            <section className="related-reading-panel">
              <div>
                <p className="eyebrow">Learning Evidence</p>
                <h2>このログで進んだLesson</h2>
                <p>この学習ログは、カリキュラムの理解と演習の記録としてLessonに紐づいています。</p>
              </div>
              <div>
                {relatedReadings.map((reading) => (
                  <Link href={`/learning/readings/${reading.slug}`} key={reading.slug}>
                    <span>
                      {reading.kind === "reference" ? "Reference" : `Week ${reading.week}・Lesson ${reading.lesson}`}
                    </span>
                    <strong>{reading.title}</strong>
                    <span aria-hidden="true">→</span>
                  </Link>
                ))}
              </div>
            </section>
          )}

          <nav className="log-pagination" aria-label="前後の学習ログ">
            {olderLog ? (
              <Link href={`/learning/logs/${olderLog.date}`}>
                <span>← 前のログ</span>
                <strong>Day {olderLog.day}｜{olderLog.topic}</strong>
              </Link>
            ) : <span />}
            {newerLog ? (
              <Link href={`/learning/logs/${newerLog.date}`} className="is-next-link">
                <span>次のログ →</span>
                <strong>Day {newerLog.day}｜{newerLog.topic}</strong>
              </Link>
            ) : <span />}
          </nav>
        </div>
      </div>
    </main>
  );
}

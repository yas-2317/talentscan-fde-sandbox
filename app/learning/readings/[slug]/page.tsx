import Link from "next/link";
import { notFound } from "next/navigation";
import { extractMarkdownHeadings, MarkdownContent } from "@/components/markdown-content";
import { formatJapaneseDate } from "@/lib/learning-format";
import { getLearningLogs } from "@/lib/learning-logs";
import { getLearningPhase } from "@/lib/learning-roadmap";
import { getReading, getReadings } from "@/lib/readings";

export async function generateStaticParams() {
  const readings = await getReadings();
  return readings.map((reading) => ({ slug: reading.slug }));
}

export default async function ReadingPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const reading = await getReading(slug);
  if (!reading) notFound();

  const [readings, logs] = await Promise.all([getReadings(), getLearningLogs()]);
  const currentIndex = readings.findIndex((entry) => entry.slug === slug);
  const previousReading = currentIndex > 0 ? readings[currentIndex - 1] : null;
  const nextReading = currentIndex >= 0 && currentIndex < readings.length - 1
    ? readings[currentIndex + 1]
    : null;
  const phase = getLearningPhase(reading.phase);
  const headings = extractMarkdownHeadings(reading.content);
  const relatedLogs = reading.relatedLogs
    .map((date) => logs.find((log) => log.date === date))
    .filter((log) => log !== undefined);
  const prerequisiteReadings = reading.prerequisiteReadings
    .map((prerequisiteSlug) => readings.find((entry) => entry.slug === prerequisiteSlug))
    .filter((entry) => entry !== undefined);

  return (
    <main className="log-detail-page reading-detail-page">
      <Link href="/learning/readings" className="back-link">← 教材一覧へ</Link>

      <header className="log-detail-header reading-detail-header">
        <div className="detail-meta-row">
          <span className="reading-badge">Reading {reading.order.toString().padStart(2, "0")}</span>
          <span className="phase-tag">{phase.label}</span>
        </div>
        <h1>{reading.title}</h1>
        <p>{reading.summary}</p>
      </header>

      <section className="reading-meta-panel" aria-label="教材の概要">
        <div>
          <span>前提知識</span>
          <strong>{reading.prerequisite}</strong>
          {prerequisiteReadings.length > 0 && (
            <div className="reading-meta-links">
              {prerequisiteReadings.map((entry) => (
                <Link href={`/learning/readings/${entry.slug}`} key={entry.slug}>
                  Reading {entry.order.toString().padStart(2, "0")} →
                </Link>
              ))}
            </div>
          )}
        </div>
        <div>
          <span>到達目標</span>
          <strong>{reading.goal}</strong>
        </div>
        <div>
          <span>対応するLearning Log</span>
          {relatedLogs.length ? relatedLogs.map((log) => (
            <Link href={`/learning/logs/${log.date}`} key={log.date}>
              Day {log.day}・{formatJapaneseDate(log.date)} →
            </Link>
          )) : <strong>関連ログなし</strong>}
        </div>
      </section>

      <div className="log-detail-grid">
        <aside className="log-toc">
          <p className="card-label">On this page</p>
          <nav aria-label="この教材の目次">
            {headings.map((heading) => (
              <a className={heading.level === 3 ? "is-nested" : ""} href={`#${heading.id}`} key={`${heading.id}-${heading.level}`}>
                {heading.text}
              </a>
            ))}
          </nav>
        </aside>

        <div className="log-detail-main">
          <MarkdownContent content={reading.content} hideTitle />

          <nav className="log-pagination" aria-label="前後の教材">
            {previousReading ? (
              <Link href={`/learning/readings/${previousReading.slug}`}>
                <span>← 前の教材</span>
                <strong>Reading {previousReading.order.toString().padStart(2, "0")}｜{previousReading.title}</strong>
              </Link>
            ) : <span />}
            {nextReading ? (
              <Link href={`/learning/readings/${nextReading.slug}`} className="is-next-link">
                <span>次の教材 →</span>
                <strong>Reading {nextReading.order.toString().padStart(2, "0")}｜{nextReading.title}</strong>
              </Link>
            ) : <span />}
          </nav>
        </div>
      </div>
    </main>
  );
}

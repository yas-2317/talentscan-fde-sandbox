import Link from "next/link";
import { notFound } from "next/navigation";
import { extractMarkdownHeadings, MarkdownContent } from "@/components/markdown-content";
import { formatJapaneseDate } from "@/lib/learning-format";
import { getCurriculumChapter } from "@/lib/learning-curriculum";
import { getLearningLogs } from "@/lib/learning-logs";
import { getLearningPhase, getLearningProgress } from "@/lib/learning-roadmap";
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
  const chapter = getCurriculumChapter(reading.week);
  const progress = getLearningProgress(logs);
  const completed = progress.completedLessons.has(reading.slug);
  const current = progress.currentLesson?.slug === reading.slug;
  const headings = extractMarkdownHeadings(reading.content);
  const completionLogs = logs.filter((log) => log.completedLessons.includes(reading.slug));
  const prerequisiteReadings = reading.prerequisiteReadings
    .map((prerequisiteSlug) => readings.find((entry) => entry.slug === prerequisiteSlug))
    .filter((entry) => entry !== undefined);

  return (
    <main className="log-detail-page reading-detail-page">
      <Link href="/learning/readings" className="back-link">← 12章のカリキュラムへ</Link>

      <header className="log-detail-header reading-detail-header">
        <div className="detail-meta-row">
          <span className="reading-badge">Week {reading.week}・Lesson {reading.lesson}</span>
          <span className="phase-tag">{phase.label}</span>
          <span className={`lesson-status is-${completed ? "completed" : current ? "current" : "available"}`}>
            {completed ? "完了" : current ? "次に学ぶ" : "教材公開済み"}
          </span>
        </div>
        <h1>{reading.title}</h1>
        <p>{reading.summary}</p>
      </header>

      <section className="reading-meta-panel" aria-label="教材の概要">
        <div>
          <span>前提Lesson</span>
          <strong>{reading.prerequisite}</strong>
          {prerequisiteReadings.length > 0 && (
            <div className="reading-meta-links">
              {prerequisiteReadings.map((entry) => (
                <Link href={`/learning/readings/${entry.slug}`} key={entry.slug}>
                  W{entry.week} L{entry.lesson} →
                </Link>
              ))}
            </div>
          )}
        </div>
        <div>
          <span>このLessonの到達目標</span>
          <strong>{reading.goal}</strong>
        </div>
        <div>
          <span>学習証拠</span>
          {completionLogs.length ? completionLogs.map((log) => (
            <Link href={`/learning/logs/${log.date}`} key={log.date}>
              Day {log.day}・{formatJapaneseDate(log.date)} →
            </Link>
          )) : <strong>Lesson完了後にLearning Logへ記録</strong>}
        </div>
      </section>

      <div className="chapter-context-panel">
        <span>Chapter {reading.week.toString().padStart(2, "0")}</span>
        <div>
          <strong>{chapter?.title}</strong>
          <p>{chapter?.target}</p>
        </div>
      </div>

      <div className="log-detail-grid">
        <aside className="log-toc">
          <p className="card-label">On this Lesson</p>
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
                <strong>W{previousReading.week} L{previousReading.lesson}｜{previousReading.title}</strong>
              </Link>
            ) : <span />}
            {nextReading ? (
              <Link href={`/learning/readings/${nextReading.slug}`} className="is-next-link">
                <span>次の教材 →</span>
                <strong>W{nextReading.week} L{nextReading.lesson}｜{nextReading.title}</strong>
              </Link>
            ) : <span />}
          </nav>
        </div>
      </div>
    </main>
  );
}

import Link from "next/link";
import {
  curriculumChapters,
  curriculumCrossCuttingThemes,
  curriculumPhases,
  curriculumReferences,
} from "@/lib/learning-curriculum";
import { getLearningLogs } from "@/lib/learning-logs";
import { getLearningProgress } from "@/lib/learning-roadmap";
import { getReadings } from "@/lib/readings";

function statusLabel(status: "completed" | "current" | "upcoming") {
  if (status === "completed") return "完了";
  if (status === "current") return "学習中";
  return "未着手";
}

export default async function ReadingsPage() {
  const [readings, logs] = await Promise.all([getReadings(), getLearningLogs()]);
  const readingBySlug = new Map(readings.map((reading) => [reading.slug, reading]));
  const lessonCount = readings.filter((reading) => reading.kind === "lesson").length;
  const progress = getLearningProgress(logs);
  const progressByWeek = new Map(progress.chapters.map((chapter) => [chapter.week, chapter]));

  return (
    <main className="learning-page reading-archive-page">
      <header className="archive-heading reading-heading">
        <div>
          <p className="eyebrow">FDE Curriculum</p>
          <h1>教材</h1>
          <p>全12 Weekを順に進めます。Git・セキュリティ・デバッグは全期間を通じて実践します。</p>
        </div>
        <div className="archive-summary reading-summary">
          <strong>12</strong>
          <span>Weekのカリキュラム</span>
          <small>{curriculumPhases.length}フェーズ・必須教材{lessonCount}本を公開中</small>
        </div>
      </header>

      <section className="curriculum-theme-section">
        <div className="reading-phase-heading">
          <div>
            <span>CROSS-CUTTING</span>
            <h2>全Weekの横断テーマ</h2>
          </div>
          <p>独立した章としてではなく、毎週の成果物づくりと意思決定のなかで繰り返し実践します。</p>
        </div>
        <div className="cross-cutting-grid">
          {curriculumCrossCuttingThemes.map((theme) => (
            <article className="cross-cutting-card" key={theme.id}>
              <span>Week 1〜12</span>
              <h3>{theme.title}</h3>
              <p>{theme.description}</p>
              <ul>
                {theme.practices.map((practice) => <li key={practice}>{practice}</li>)}
              </ul>
            </article>
          ))}
        </div>
      </section>

      <div className="curriculum-phases">
        {curriculumPhases.map((phase) => {
          const chapters = curriculumChapters.filter((chapter) => chapter.phase === phase.id);

          return (
            <section className="curriculum-phase-section" key={phase.id}>
              <div className="reading-phase-heading">
                <div>
                  <span>PHASE {phase.order}</span>
                  <h2>{phase.label}</h2>
                </div>
                <p>{phase.purpose}（{phase.duration}）</p>
              </div>

              <div className="curriculum-chapters">
                {chapters.map((chapter) => {
                  const chapterProgress = progressByWeek.get(chapter.week);
                  const chapterStatus = chapterProgress?.status ?? "upcoming";

                  return (
                    <article className={`curriculum-chapter is-${chapterStatus}`} key={chapter.week}>
                      <header className="curriculum-chapter-heading">
                        <div>
                          <span>Week {chapter.week.toString().padStart(2, "0")}</span>
                          <span className={`lesson-status is-${chapterStatus}`}>{statusLabel(chapterStatus)}</span>
                        </div>
                        <h3>{chapter.title}</h3>
                        <p>{chapter.target}</p>
                      </header>

                      <div className="curriculum-lesson-list">
                        {chapter.lessons.length > 0 ? chapter.lessons.map((lesson, lessonIndex) => {
                          const reading = readingBySlug.get(lesson.slug);
                          const completed = progress.completedLessons.has(lesson.slug);
                          const current = progress.currentLesson?.slug === lesson.slug;
                          const className = `curriculum-lesson-row${completed ? " is-completed" : ""}${current ? " is-current" : ""}${reading ? "" : " is-planned"}`;
                          const content = (
                            <>
                              <span className="lesson-number">Lesson {(lessonIndex + 1).toString().padStart(2, "0")}</span>
                              <div>
                                <strong>{lesson.title}</strong>
                                <small>{completed ? "完了" : current ? "次に学ぶ" : reading ? "教材公開済み" : "作成予定"}</small>
                              </div>
                              <span aria-hidden="true">{reading ? "→" : "—"}</span>
                            </>
                          );

                          return reading ? (
                            <Link href={`/learning/readings/${reading.slug}`} className={className} key={lesson.slug}>
                              {content}
                            </Link>
                          ) : (
                            <div className={className} key={lesson.slug}>{content}</div>
                          );
                        }) : (
                          <div className="curriculum-topic-list">
                            <span>この章のLesson構成は、開始前に到達目標をもとに設計します</span>
                            {chapter.topics.map((topic) => <p key={topic}>{topic}</p>)}
                          </div>
                        )}
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>

      <section className="reference-library">
        <div className="reading-phase-heading">
          <div>
            <span>REFERENCE LIBRARY</span>
            <h2>必要なときに参照する資料</h2>
          </div>
          <p>Referenceは横断テーマを支える参照資料です。必須Lessonの完了判定には含めません。</p>
        </div>
        <div className="reference-grid">
          {curriculumReferences.map((reference) => (
            <Link href={reference.href} className="reference-card" key={reference.href}>
              <span>{reference.category}</span>
              <h3>{reference.title}</h3>
              <p>{reference.description}</p>
              <strong>資料を開く →</strong>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}

import Link from "next/link";
import { GuideCard } from "@/components/guide-card";
import {
  curriculumChapters,
  curriculumCrossCuttingThemes,
  curriculumPhases,
  externalReferenceLinks,
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
  const guides = readings.filter((reading) => reading.kind === "reference");
  const progress = getLearningProgress(logs);
  const progressByWeek = new Map(progress.chapters.map((chapter) => [chapter.week, chapter]));

  return (
    <main className="learning-page reading-archive-page">
      <header className="archive-heading reading-heading">
        <div>
          <p className="eyebrow">FDE Curriculum</p>
          <h1>教材</h1>
          <p>順番に進める12 WeekのCurriculum Lessonと、必要なときに参照するPractice Guideを分けて案内します。</p>
        </div>
        <div className="archive-summary reading-summary">
          <strong>12</strong>
          <span>Weekのカリキュラム</span>
          <small>{curriculumPhases.length}フェーズ・必須教材{lessonCount}本を公開中</small>
        </div>
      </header>

      <section className="panel cross-cutting-strip" aria-label="全Weekの横断テーマ">
        <div className="panel-head">
          <h2>全Weekで実践する横断テーマ</h2>
        </div>
        {curriculumCrossCuttingThemes.map((theme) => (
          <div className="cross-cutting-row" key={theme.id}>
            <strong>{theme.title}</strong>
            <div>
              <p>{theme.description}</p>
              <span>{theme.practices.join(" / ")}</span>
            </div>
          </div>
        ))}
      </section>

      <div className="curriculum-phases">
        {curriculumPhases.map((phase) => {
          const chapters = curriculumChapters.filter((chapter) => chapter.phase === phase.id);
          const completedCount = chapters.filter(
            (chapter) => progressByWeek.get(chapter.week)?.status === "completed",
          ).length;

          return (
            <section className="curriculum-phase-section" key={phase.id}>
              <div className="phase-line">
                <div>
                  <h2>Phase {phase.order} {phase.label}</h2>
                  <p>{phase.purpose}({phase.duration})</p>
                </div>
                <span className="mono">{completedCount} / {chapters.length}章</span>
              </div>
              <div className="roadmap-meter phase-line-meter" aria-hidden="true">
                <i style={{ width: `${(completedCount / chapters.length) * 100}%` }} />
              </div>

              <div className="chapter-list">
                {chapters.map((chapter) => {
                  const chapterProgress = progressByWeek.get(chapter.week);
                  const chapterStatus = chapterProgress?.status ?? "upcoming";

                  return (
                    <details
                      className={`fold chapter-details is-${chapterStatus}`}
                      open={chapterStatus === "current"}
                      key={chapter.week}
                    >
                      <summary>
                        <span className="chevron" aria-hidden="true" />
                        <span className="mono fold-key">W{chapter.week.toString().padStart(2, "0")}</span>
                        <strong>{chapter.title}</strong>
                        <span className="mono fold-count">
                          {chapter.lessons.length > 0
                            ? `${chapterProgress?.completedLessonCount ?? 0} / ${chapter.lessons.length} Lessons`
                            : "設計前"}
                        </span>
                        <span className={`fold-status is-${chapterStatus}`}>
                          <span className="status-dot" aria-hidden="true" />
                          {statusLabel(chapterStatus)}
                        </span>
                      </summary>

                      <div className="fold-body">
                        <p className="chapter-target">到達目標:{chapter.target}</p>
                        {chapter.lessons.length > 0 ? (
                          <div className="curriculum-lesson-list">
                            {chapter.lessons.map((lesson, lessonIndex) => {
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
                            })}
                          </div>
                        ) : (
                          <div className="curriculum-topic-list">
                            <span>この章のLesson構成は、開始前に到達目標をもとに設計します</span>
                            {chapter.topics.map((topic) => <p key={topic}>{topic}</p>)}
                          </div>
                        )}
                      </div>
                    </details>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>

      <section className="reference-library" id="practice-guides">
        <div className="reading-phase-heading">
          <div>
            <h2>Practice Guides</h2>
          </div>
          <p>必要なときに参照する常設ガイドです。Guideの閲覧は必須Lessonの完了判定には含めません。</p>
        </div>
        <div className="reference-grid">
          {guides.map((guide) => (
            <GuideCard
              href={`/learning/readings/${guide.slug}`}
              category={guide.category}
              title={guide.title}
              summary={guide.summary}
              estimatedMinutes={guide.estimatedMinutes}
              key={guide.slug}
            />
          ))}
        </div>
        {externalReferenceLinks.length > 0 && (
          <div className="related-library-links">
            {externalReferenceLinks.map((link) => (
              <Link href={link.href} key={link.href}>
                <span>{link.category}</span>
                <strong>{link.title}</strong>
                <p>{link.description}</p>
              </Link>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

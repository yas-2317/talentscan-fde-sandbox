import Link from "next/link";
import { curriculumChapters, curriculumPhases } from "@/lib/learning-curriculum";
import { getLearningLogs } from "@/lib/learning-logs";
import { getLearningProgress } from "@/lib/learning-roadmap";
import { getReadings } from "@/lib/readings";

function statusLabel(status: "completed" | "current" | "upcoming") {
  if (status === "completed") return "完了";
  if (status === "current") return "現在地";
  return "これから";
}

export default async function ReadingsPage() {
  const [readings, logs] = await Promise.all([getReadings(), getLearningLogs()]);
  const readingBySlug = new Map(readings.map((reading) => [reading.slug, reading]));
  const progress = getLearningProgress(logs);
  const progressByWeek = new Map(progress.chapters.map((chapter) => [chapter.week, chapter]));

  return (
    <main className="learning-page reading-archive-page">
      <header className="archive-heading reading-heading">
        <div>
          <p className="eyebrow">FDE Curriculum</p>
          <h1>教材</h1>
          <p>12章を正式カリキュラムのWeekと対応させ、各章を必要なLessonに分けて学びます。</p>
        </div>
        <div className="archive-summary reading-summary">
          <strong>12</strong>
          <span>章のカリキュラム</span>
          <small>{curriculumPhases.length}フェーズ・{readings.length}教材を公開中</small>
        </div>
      </header>

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
                          <span className="roadmap-status">{statusLabel(chapterStatus)}</span>
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
                                <small>{completed ? "完了" : current ? "次に学ぶ" : reading ? "教材公開済み" : "今後作成"}</small>
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
                            <span>Lesson構成は、この章を開始する前に到達目標から設計します</span>
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
    </main>
  );
}

import Link from "next/link";
import type { getLearningProgress } from "@/lib/learning-roadmap";

type Progress = ReturnType<typeof getLearningProgress>;

const statusLabel = { completed: "完了", current: "学習中", upcoming: "" } as const;

export function FdeRoadmap({ progress }: { progress: Progress }) {
  return (
    <div className="roadmap">
      {progress.phases.map((phase) => {
        const chapters = progress.chapters.filter((chapter) => chapter.phase === phase.id);
        const ratio = phase.totalChapterCount > 0
          ? (phase.completedChapterCount / phase.totalChapterCount) * 100
          : 0;

        return (
          <section className="roadmap-phase" key={phase.id}>
            <div className="roadmap-phase-head">
              <strong>
                Phase {phase.order} {phase.label}
              </strong>
              <span className="mono">
                {phase.completedChapterCount} / {phase.totalChapterCount}章
              </span>
            </div>
            <div className="roadmap-meter" aria-hidden="true">
              <i style={{ width: `${ratio}%` }} />
            </div>
            {chapters.map((chapter) => (
              <div className={`roadmap-week is-${chapter.status}`} key={chapter.week}>
                <span className="roadmap-week-no mono">
                  W{chapter.week.toString().padStart(2, "0")}
                </span>
                {chapter.status === "current" ? (
                  <Link href="/learning/readings">{chapter.title}</Link>
                ) : (
                  <span className="roadmap-week-title">{chapter.title}</span>
                )}
                {chapter.status !== "upcoming" && (
                  <span className={`roadmap-week-status is-${chapter.status}`}>
                    <span className="status-dot" aria-hidden="true" />
                    {statusLabel[chapter.status]}
                  </span>
                )}
              </div>
            ))}
          </section>
        );
      })}
    </div>
  );
}

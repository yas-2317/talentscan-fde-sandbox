import Link from "next/link";
import { formatJapaneseDate } from "@/lib/learning-format";
import type { LearningLog } from "@/lib/learning-logs";
import { getLearningPhase } from "@/lib/learning-roadmap";

export function TodayOverview({
  log,
  isToday,
  currentStreak,
  resume,
}: {
  log: LearningLog | null;
  isToday: boolean;
  currentStreak: number;
  resume: { href: string; label: string } | null;
}) {
  if (!log) {
    return (
      <section className="panel today-panel" aria-label="今日の学習">
        <div className="today-main">
          <p className="today-date">まだ学習ログがありません</p>
          <h1>最初のログを書くところから始めましょう</h1>
        </div>
      </section>
    );
  }

  const phase = getLearningPhase(log.phase);

  return (
    <section className="panel today-panel" aria-label="今日の学習">
      <div className="today-main">
        <p className="today-date">
          <span className="status-dot is-current" aria-hidden="true" />
          {isToday ? "今日の学習" : "最新の学習"}
          <span className="today-date-sep">·</span>
          <time dateTime={log.date}>{formatJapaneseDate(log.date)}</time>
          <span className="today-date-sep">·</span>
          <span className="mono">Day {log.day}</span>
          <span className="today-date-sep">·</span>
          {phase.label}
        </p>
        <h1>
          <Link href={`/learning/logs/${log.date}`}>{log.topic}</Link>
        </h1>
        <p className="today-summary">{log.summary}</p>
      </div>
      <div className="today-side">
        <div className="today-streak">
          <span>連続学習</span>
          <strong className="mono">{currentStreak}</strong>
          <small>日目</small>
        </div>
        {resume && (
          <Link href={resume.href} className="btn-primary">
            {resume.label}
          </Link>
        )}
        <p className="today-next">次回: {log.next}</p>
      </div>
    </section>
  );
}

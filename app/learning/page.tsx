import Link from "next/link";
import { formatJapaneseDate, formatLearningPeriod } from "@/lib/learning-format";
import { curriculumCrossCuttingThemes } from "@/lib/learning-curriculum";
import { getLearningLogs } from "@/lib/learning-logs";
import { getLearningPhase, getLearningProgress } from "@/lib/learning-roadmap";
import { getReadings } from "@/lib/readings";

export default async function LearningPage() {
  const [logs, readings] = await Promise.all([getLearningLogs(), getReadings()]);
  const latest = logs[0];
  const oldest = logs.at(-1);
  const progress = getLearningProgress(logs);
  const recentLogs = logs.slice(0, 5);
  const currentChapterReadings = readings.filter(
    (reading) => reading.week === progress.currentChapter.week,
  );
  const nextReading = readings.find(
    (reading) => reading.slug === progress.currentLesson?.slug,
  );

  return (
    <main className="learning-page">
      <section className="learning-hero learning-hero-dashboard">
        <div className="hero-copy">
          <p className="eyebrow">FDE Learning Curriculum</p>
          <div className="status-pill">
            <span aria-hidden="true" />
            {progress.completedChapterCount} / 12章 完了
          </div>
          <h1>次は「{progress.currentChapter.title}」。</h1>
          <p>
            {progress.completedChapterCount}章を完了しました。Week {progress.currentChapter.week}では、
            {progress.currentChapter.target}
          </p>
          {nextReading && (
            <Link href={`/learning/readings/${nextReading.slug}`} className="primary-link">
              Lesson {progress.currentLessonNumber}を始める
              <span aria-hidden="true">→</span>
            </Link>
          )}
        </div>
        <div className="hero-progress-card">
          <p className="card-label">現在の章</p>
          <strong>{progress.currentChapter.week.toString().padStart(2, "0")}</strong>
          <div>
            <h2>Week {progress.currentChapter.week}｜{progress.currentChapter.title}</h2>
            <p>{progress.currentChapter.target}</p>
          </div>
        </div>
      </section>

      <section className="stats-grid" aria-label="学習サマリー">
        <div className="stat-card">
          <span>今週のLesson</span>
          <strong>{progress.currentChapter.completedLessonCount}<em> / {progress.currentChapter.totalLessonCount}</em></strong>
          <small>Week {progress.currentChapter.week}の進捗</small>
        </div>
        <div className="stat-card">
          <span>完了した章</span>
          <strong>{progress.completedChapterCount}<em> / 12</em></strong>
          <small>Week単位の進捗</small>
        </div>
        <div className="stat-card stat-card-wide">
          <span>学習期間</span>
          <strong>{formatLearningPeriod(oldest?.date, latest?.date)}</strong>
          <small>{latest ? `${formatJapaneseDate(latest.date)} 更新` : "まだ記録がありません"}</small>
        </div>
      </section>

      <section className="learning-section roadmap-section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Three Phases</p>
            <h2>全体カリキュラム</h2>
          </div>
          <p>基礎理解から候補者管理の縦実装、FDEデリバリーへ進みます。</p>
        </div>
        <div className="roadmap-grid roadmap-grid-three">
          {progress.phases.map((phase) => (
            <article className={`roadmap-card is-${phase.status}`} key={phase.id}>
              <div className="roadmap-card-top">
                <span className="roadmap-number">PHASE {phase.order}</span>
                <span className="roadmap-status">
                  {phase.status === "completed" ? "完了" : phase.status === "current" ? "現在地" : "これから"}
                </span>
              </div>
              <h3>{phase.label}</h3>
              <p>{phase.purpose}</p>
              <div className="phase-meter" aria-label={`${phase.completedChapterCount}/${phase.totalChapterCount}章`}>
                <span style={{ width: `${Math.min(100, (phase.completedChapterCount / phase.totalChapterCount) * 100)}%` }} />
              </div>
              <small>{phase.completedChapterCount} / {phase.totalChapterCount}章・{phase.duration}</small>
            </article>
          ))}
        </div>
      </section>

      <section className="learning-section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Cross-cutting Themes</p>
            <h2>全Weekで実践すること</h2>
          </div>
          <p>一度だけ学ぶ章ではなく、毎回の実装と検証に組み込みます。</p>
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

      <section className="learning-section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Current Chapter</p>
            <h2>Week {progress.currentChapter.week}の教材</h2>
          </div>
          <Link href="/learning/readings">12章を見る →</Link>
        </div>
        <div className="reading-preview-grid">
          {currentChapterReadings.map((reading) => (
            <Link href={`/learning/readings/${reading.slug}`} className="reading-preview-card" key={reading.slug}>
              <div>
                <span>Lesson {reading.lesson}</span>
                {reading.phase && <span className="phase-tag">{getLearningPhase(reading.phase).label}</span>}
              </div>
              <h3>{reading.title}</h3>
              <p>{reading.summary}</p>
              <strong>{reading.goal}</strong>
              <span className="row-arrow" aria-hidden="true">→</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="learning-section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Learning Evidence</p>
            <h2>最近の学習ログ</h2>
          </div>
          <Link href="/learning/logs">すべて見る →</Link>
        </div>
        <div className="recent-log-list">
          {recentLogs.map((log) => {
            const phase = getLearningPhase(log.phase);
            return (
              <Link href={`/learning/logs/${log.date}`} className="recent-log-row" key={log.date}>
                <span className="day-badge">Day {log.day}</span>
                <div>
                  <span className="log-meta"><time dateTime={log.date}>{formatJapaneseDate(log.date)}</time>・{phase.label}</span>
                  <strong>{log.topic}</strong>
                  <p>{log.summary}</p>
                </div>
                <span className="row-arrow" aria-hidden="true">→</span>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="next-step-panel">
        <div>
          <p className="eyebrow">Up Next</p>
          <h2>{progress.currentLesson?.title ?? "次のLessonを決める"}</h2>
          <p>Week {progress.currentChapter.week}{progress.currentLessonNumber ? `・Lesson ${progress.currentLessonNumber}` : ""}から次の章を学びます。</p>
        </div>
        <span className="next-step-phase">W{progress.currentChapter.week}</span>
      </section>
    </main>
  );
}

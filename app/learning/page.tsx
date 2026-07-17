import Link from "next/link";
import { formatJapaneseDate, formatLearningPeriod } from "@/lib/learning-format";
import { getLearningLogs } from "@/lib/learning-logs";
import { getLearningPhase, getLearningProgress } from "@/lib/learning-roadmap";

export default async function LearningPage() {
  const logs = await getLearningLogs();
  const latest = logs[0];
  const oldest = logs.at(-1);
  const progress = getLearningProgress(logs);
  const recentLogs = logs.slice(0, 5);

  return (
    <main className="learning-page">
      <section className="learning-hero learning-hero-dashboard">
        <div className="hero-copy">
          <p className="eyebrow">FDE Learning Tracker</p>
          <div className="status-pill">
            <span aria-hidden="true" />
            {progress.completedPhaseCount}フェーズ完了
          </div>
          <h1>次は「{progress.currentPhase.label}」へ。</h1>
          <p>
            {latest
              ? `Day ${latest.day}で「${latest.topic}」まで学習しました。次のテーマは「${latest.next}」です。`
              : "最初の学習ログを追加すると、ここに現在地が表示されます。"}
          </p>
          {latest && (
            <Link href={`/learning/logs/${latest.date}`} className="primary-link">
              最新ログを読む
              <span aria-hidden="true">→</span>
            </Link>
          )}
        </div>
        <div className="hero-progress-card">
          <p className="card-label">現在のフェーズ</p>
          <strong>{progress.currentPhase.order.toString().padStart(2, "0")}</strong>
          <div>
            <h2>{progress.currentPhase.label}</h2>
            <p>{progress.currentPhase.description}</p>
          </div>
        </div>
      </section>

      <section className="stats-grid" aria-label="学習サマリー">
        <div className="stat-card">
          <span>学習ログ</span>
          <strong>{logs.length}</strong>
          <small>日分の記録</small>
        </div>
        <div className="stat-card">
          <span>進んだフェーズ</span>
          <strong>{progress.completedPhaseCount}<em> / {progress.phases.length}</em></strong>
          <small>フェーズ完了</small>
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
            <p className="eyebrow">Learning Roadmap</p>
            <h2>学習ロードマップ</h2>
          </div>
          <p>基礎から実装へ、4つのフェーズで進みます。</p>
        </div>
        <div className="roadmap-grid">
          {progress.phases.map((phase) => (
            <article className={`roadmap-card is-${phase.status}`} key={phase.id}>
              <div className="roadmap-card-top">
                <span className="roadmap-number">{phase.order.toString().padStart(2, "0")}</span>
                <span className="roadmap-status">
                  {phase.status === "completed" ? "完了" : phase.status === "current" ? "現在地" : "これから"}
                </span>
              </div>
              <h3>{phase.label}</h3>
              <p>{phase.description}</p>
              <div className="phase-meter" aria-label={`${phase.logCount}/${phase.targetCount}テーマ`}>
                <span style={{ width: `${Math.min(100, (phase.logCount / phase.targetCount) * 100)}%` }} />
              </div>
              <small>{phase.logCount} / {phase.targetCount} テーマ</small>
            </article>
          ))}
        </div>
      </section>

      <section className="learning-section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Recent Learning</p>
            <h2>最近の学習ログ</h2>
          </div>
          <Link href="/learning/logs">すべて見る →</Link>
        </div>
        <div className="recent-log-list">
          {recentLogs.length ? recentLogs.map((log) => {
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
          }) : <p className="empty-state">学習ログはまだありません。</p>}
        </div>
      </section>

      <section className="next-step-panel">
        <div>
          <p className="eyebrow">Up Next</p>
          <h2>{latest?.next ?? "次のテーマを決める"}</h2>
          <p>{progress.currentPhase.label}フェーズの学習を始めます。</p>
        </div>
        <span className="next-step-phase">{progress.currentPhase.shortLabel}</span>
      </section>
    </main>
  );
}

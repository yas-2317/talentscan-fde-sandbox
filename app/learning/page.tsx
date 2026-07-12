import Link from "next/link";
import { getLearningLogs } from "@/lib/learning-logs";

export default async function LearningPage() {
  const logs = await getLearningLogs();
  const latest = logs[0];

  return (
    <main className="learning-page">
      <section className="learning-hero">
        <p className="eyebrow">Learning portal</p>
        <h1>FDE学習ポータル</h1>
        <p>学んだことを、後から仕組みまで振り返るための閲覧ページです。</p>
      </section>

      <div className="learning-grid">
        <section className="learning-card">
          <p className="card-label">今日のテーマ</p>
          <h2>開発から公開までの流れ</h2>
          <p>Next.js、Git、GitHub、Vercelがどうつながるかを理解する。</p>
        </section>
        <section className="learning-card">
          <p className="card-label">現在の進捗</p>
          <h2>{logs.length}件のログ</h2>
          <p>最初のアプリ作成と公開までを記録済みです。</p>
        </section>
      </div>

      <section className="learning-section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Recent logs</p>
            <h2>最近の学習ログ</h2>
          </div>
          <Link href="/learning/logs">すべて見る →</Link>
        </div>
        {latest ? (
          <Link href={`/learning/logs/${latest.date}`} className="log-row">
            <time dateTime={latest.date}>{latest.date}</time>
            <span>{latest.title}</span>
            <span aria-hidden="true">→</span>
          </Link>
        ) : <p className="empty-state">学習ログはまだありません。</p>}
      </section>

      <section className="learning-card next-step">
        <p className="card-label">次に学ぶこと</p>
        <h2>ブランチとPull Request</h2>
        <p>作業ブランチ作成、commit、push、Pull Request、merge、自動反映を一つずつ確認します。</p>
      </section>
    </main>
  );
}

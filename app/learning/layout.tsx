import Link from "next/link";

export default function LearningLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="learning-shell">
      <header className="learning-header">
        <Link href="/learning" className="learning-brand">
          FDE Learning
          <small>TalentScan Sandbox</small>
        </Link>
        <nav aria-label="学習ポータル">
          <Link href="/learning">ダッシュボード</Link>
          <Link href="/learning/readings">教材</Link>
          <Link href="/learning/logs">学習ログ</Link>
          <Link href="/learning/troubleshooting">トラブルログ</Link>
        </nav>
      </header>
      {children}
    </div>
  );
}

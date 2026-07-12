import Link from "next/link";

export default function LearningLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="learning-shell">
      <header className="learning-header">
        <Link href="/learning" className="learning-brand">FDE Learning</Link>
        <nav aria-label="学習ポータル">
          <Link href="/learning">ホーム</Link>
          <Link href="/learning/logs">学習ログ</Link>
        </nav>
      </header>
      {children}
    </div>
  );
}

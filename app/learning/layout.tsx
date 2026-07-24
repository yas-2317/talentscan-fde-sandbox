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
          <Link href="/learning">Dashboard</Link>
          <Link href="/learning/readings">Lessons</Link>
          <Link href="/learning/logs">Logs</Link>
          <Link href="/learning/troubleshooting">Troubleshooting</Link>
        </nav>
      </header>
      {children}
    </div>
  );
}

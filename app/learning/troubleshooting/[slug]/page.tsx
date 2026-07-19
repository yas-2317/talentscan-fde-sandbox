import Link from "next/link";
import { notFound } from "next/navigation";
import { LogToc } from "@/components/log-toc";
import { extractMarkdownHeadings, MarkdownContent } from "@/components/markdown-content";
import { formatJapaneseDate } from "@/lib/learning-format";
import { getTroubleshootingLog, getTroubleshootingLogs } from "@/lib/troubleshooting-logs";

export async function generateStaticParams() {
  const logs = await getTroubleshootingLogs();
  return logs.map((log) => ({ slug: log.slug }));
}

export default async function TroubleshootingLogPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const log = await getTroubleshootingLog(slug);
  if (!log) notFound();
  const headings = extractMarkdownHeadings(log.content);

  return (
    <main className="log-detail-page troubleshooting-detail-page">
      <Link href="/learning/troubleshooting" className="back-link">← 実践トラブルログ一覧へ</Link>

      <header className="log-detail-header troubleshooting-detail-header">
        <div className="detail-meta-row">
          <span className="incident-badge">Incident</span>
          <time dateTime={log.date}>{formatJapaneseDate(log.date)}</time>
        </div>
        <h1>{log.title}</h1>
        <p>{log.summary}</p>
      </header>

      <div className="log-detail-grid">
        <aside className="log-toc">
          <p className="card-label">On this page</p>
          <LogToc headings={headings} label="このトラブルログの目次" />
        </aside>

        <div className="log-detail-main">
          <MarkdownContent content={log.content} hideTitle />
        </div>
      </div>
    </main>
  );
}

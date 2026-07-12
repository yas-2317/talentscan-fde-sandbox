import Link from "next/link";
import { notFound } from "next/navigation";
import { MarkdownContent } from "@/components/markdown-content";
import { getLearningLog, getLearningLogs } from "@/lib/learning-logs";

export async function generateStaticParams() {
  const logs = await getLearningLogs();
  return logs.map((log) => ({ date: log.date }));
}

export default async function LearningLogPage({ params }: { params: Promise<{ date: string }> }) {
  const { date } = await params;
  const log = await getLearningLog(date);
  if (!log) notFound();

  return (
    <main className="log-detail-page">
      <Link href="/learning/logs" className="back-link">← 学習ログ一覧へ</Link>
      <MarkdownContent content={log.content} />
    </main>
  );
}

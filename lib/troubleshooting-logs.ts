import { promises as fs } from "node:fs";
import path from "node:path";

const troubleshootingDirectory = path.join(process.cwd(), "docs", "troubleshooting-log");
const troubleshootingFilePattern = /^(\d{4}-\d{2}-\d{2})-(.+)\.md$/;

export type TroubleshootingLog = {
  date: string;
  slug: string;
  title: string;
  summary: string;
  content: string;
};

function titleFromMarkdown(content: string, date: string) {
  const heading = content.match(/^#\s+(.+)$/m)?.[1];
  return heading?.replace(`${date}｜`, "") ?? "実践トラブルログ";
}

function summaryFromMarkdown(content: string) {
  const symptomSection = content.match(/^##\s+症状\s*$([\s\S]*?)(?=^##\s|$)/m)?.[1] ?? "";
  return symptomSection.match(/^[-*]\s+(.+)$/m)?.[1] ?? "開発中に起きた問題と解決手順の記録。";
}

export async function getTroubleshootingLogs(): Promise<TroubleshootingLog[]> {
  const entries = await fs.readdir(troubleshootingDirectory, { withFileTypes: true });
  const slugs = entries
    .filter((entry) => entry.isFile() && troubleshootingFilePattern.test(entry.name))
    .map((entry) => entry.name.replace(/\.md$/, ""))
    .sort((a, b) => b.localeCompare(a));

  return Promise.all(slugs.map((slug) => getTroubleshootingLog(slug))).then((logs) =>
    logs.filter((log): log is TroubleshootingLog => log !== null),
  );
}

export async function getTroubleshootingLog(slug: string): Promise<TroubleshootingLog | null> {
  const match = slug.match(/^(\d{4}-\d{2}-\d{2})-(.+)$/);
  if (!match) return null;

  try {
    const content = await fs.readFile(path.join(troubleshootingDirectory, `${slug}.md`), "utf8");
    return {
      date: match[1],
      slug,
      title: titleFromMarkdown(content, match[1]),
      summary: summaryFromMarkdown(content),
      content,
    };
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return null;
    throw error;
  }
}

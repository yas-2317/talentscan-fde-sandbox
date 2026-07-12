import { promises as fs } from "node:fs";
import path from "node:path";

const logsDirectory = path.join(process.cwd(), "docs", "learning-log");
const logFilePattern = /^(\d{4}-\d{2}-\d{2})\.md$/;

export type LearningLog = {
  date: string;
  title: string;
  content: string;
};

function titleFromMarkdown(content: string, date: string) {
  const heading = content.match(/^#\s+(.+)$/m);
  return heading?.[1] ?? `${date} 学習ログ`;
}

export async function getLearningLogs(): Promise<LearningLog[]> {
  const entries = await fs.readdir(logsDirectory, { withFileTypes: true });
  const dates = entries
    .filter((entry) => entry.isFile() && logFilePattern.test(entry.name))
    .map((entry) => entry.name.match(logFilePattern)?.[1])
    .filter((date): date is string => Boolean(date))
    .sort((a, b) => b.localeCompare(a));

  return Promise.all(dates.map((date) => getLearningLog(date))).then((logs) =>
    logs.filter((log): log is LearningLog => log !== null),
  );
}

export async function getLearningLog(date: string): Promise<LearningLog | null> {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return null;
  }

  try {
    const content = await fs.readFile(path.join(logsDirectory, `${date}.md`), "utf8");
    return { date, title: titleFromMarkdown(content, date), content };
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return null;
    }
    throw error;
  }
}

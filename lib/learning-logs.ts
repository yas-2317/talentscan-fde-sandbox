import { promises as fs } from "node:fs";
import path from "node:path";
import { parseFrontmatter } from "@/lib/markdown-frontmatter";
import {
  isLearningPhaseId,
  type LearningPhaseId,
} from "@/lib/learning-roadmap";

const logsDirectory = path.join(process.cwd(), "docs", "learning-log");
const logFilePattern = /^(\d{4}-\d{2}-\d{2})\.md$/;

export type LearningLog = {
  date: string;
  day: number;
  phase: LearningPhaseId;
  topic: string;
  title: string;
  summary: string;
  next: string;
  completedLessons: string[];
  content: string;
};

function splitList(value?: string) {
  return value
    ? value.split(",").map((item) => item.trim()).filter(Boolean)
    : [];
}

function titleFromMarkdown(content: string, date: string) {
  const heading = content.match(/^#\s+(.+)$/m);
  return heading?.[1].replace(/^\d{4}-\d{2}-\d{2}｜/, "") ?? `${date} 学習ログ`;
}

function sectionText(content: string, heading: string) {
  const expression = new RegExp(`^##\\s+${heading}\\s*$([\\s\\S]*?)(?=^##\\s|$)`, "m");
  return content.match(expression)?.[1].trim() ?? "";
}

function summaryFromMarkdown(content: string) {
  const section = sectionText(content, "今日の到達点");
  const firstItem = section.match(/^[-*]\s+(.+)$/m)?.[1];
  return firstItem ?? "学んだ内容と実装の記録。";
}

function nextFromMarkdown(content: string) {
  const section = sectionText(content, "次回");
  return section.split("\n").find((line) => line.trim())?.replace(/^[-*]\s+/, "") ?? "次のテーマを決める";
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
    const source = await fs.readFile(path.join(logsDirectory, `${date}.md`), "utf8");
    const { attributes, content } = parseFrontmatter(source);
    const title = attributes.topic || titleFromMarkdown(content, date);
    const phase = isLearningPhaseId(attributes.phase)
      ? attributes.phase
      : "foundation";

    return {
      date,
      day: Number(attributes.day) || 1,
      phase,
      topic: title,
      title,
      summary: attributes.summary || summaryFromMarkdown(content),
      next: attributes.next || nextFromMarkdown(content),
      completedLessons: splitList(attributes.completedLessons),
      content,
    };
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return null;
    }
    throw error;
  }
}

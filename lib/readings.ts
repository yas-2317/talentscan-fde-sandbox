import { promises as fs } from "node:fs";
import path from "node:path";
import { parseFrontmatter } from "@/lib/markdown-frontmatter";
import {
  getCurriculumLesson,
  getCurriculumReference,
  type CurriculumPhaseId,
} from "@/lib/learning-curriculum";

const readingsDirectory = path.join(process.cwd(), "docs", "readings");
const readingFilePattern = /^([a-z0-9]+(?:-[a-z0-9]+)*)\.md$/;

export type Reading = {
  slug: string;
  order: number;
  kind: "lesson" | "reference";
  week: number | null;
  lesson: number | null;
  phase: CurriculumPhaseId | null;
  title: string;
  summary: string;
  prerequisite: string;
  prerequisiteReadings: string[];
  goal: string;
  relatedLogs: string[];
  content: string;
};

function splitList(value?: string) {
  return value
    ? value.split(",").map((item) => item.trim()).filter(Boolean)
    : [];
}

function titleFromMarkdown(content: string) {
  return content.match(/^#\s+(.+)$/m)?.[1] ?? "Reading";
}

export async function getReadings(): Promise<Reading[]> {
  const entries = await fs.readdir(readingsDirectory, { withFileTypes: true });
  const slugs = entries
    .filter((entry) => entry.isFile() && readingFilePattern.test(entry.name))
    .map((entry) => entry.name.match(readingFilePattern)?.[1])
    .filter((slug): slug is string => Boolean(slug));

  return Promise.all(slugs.map((slug) => getReading(slug))).then((readings) =>
    readings
      .filter((reading): reading is Reading => reading !== null)
      .sort((a, b) => {
        if (a.kind !== b.kind) return a.kind === "lesson" ? -1 : 1;
        if (a.kind === "reference") return a.order - b.order || a.slug.localeCompare(b.slug);
        return (a.week ?? 0) - (b.week ?? 0)
          || (a.lesson ?? 0) - (b.lesson ?? 0)
          || a.slug.localeCompare(b.slug);
      }),
  );
}

export async function getReading(slug: string): Promise<Reading | null> {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) return null;

  try {
    const source = await fs.readFile(path.join(readingsDirectory, `${slug}.md`), "utf8");
    const { attributes, content } = parseFrontmatter(source);
    const curriculumLesson = getCurriculumLesson(slug);
    const curriculumReference = getCurriculumReference(slug);
    if (!curriculumLesson && !curriculumReference) return null;

    return {
      slug,
      order: Number(attributes.order) || 1,
      kind: curriculumLesson ? "lesson" : "reference",
      week: curriculumLesson?.chapter.week ?? null,
      lesson: curriculumLesson?.lessonNumber ?? null,
      phase: curriculumLesson?.chapter.phase ?? null,
      title: attributes.title || titleFromMarkdown(content),
      summary: attributes.summary || "FDE学習を支える教材。",
      prerequisite: attributes.prerequisite || "特になし",
      prerequisiteReadings: splitList(attributes.prerequisiteReadings),
      goal: attributes.goal || "内容を自分の言葉で説明できる。",
      relatedLogs: splitList(attributes.relatedLogs).filter((date) => /^\d{4}-\d{2}-\d{2}$/.test(date)),
      content,
    };
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return null;
    throw error;
  }
}

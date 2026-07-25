// docs/readings と lib/learning-curriculum.ts の登録整合性を検証する。
// 検証内容:
//   1. docs/readings/*.md がすべて curriculumChapters か curriculumReferenceSlugs に登録されている
//   2. 登録された slug に対応する Markdown ファイルが存在する
//   3. relatedLogs の日付に対応する docs/learning-log/YYYY-MM-DD.md が存在する
//   4. featured の値が true / false 以外でない
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import process from "node:process";

const root = process.cwd();
const readingsDir = path.join(root, "docs", "readings");
const logsDir = path.join(root, "docs", "learning-log");
const curriculumSource = readFileSync(path.join(root, "lib", "learning-curriculum.ts"), "utf8");

const errors = [];

const lessonSlugs = new Set(
  [...curriculumSource.matchAll(/slug:\s*"([a-z0-9-]+)"/g)].map((match) => match[1]),
);

const referenceBlock = curriculumSource.match(/curriculumReferenceSlugs[^=]*=\s*\[([\s\S]*?)\]/);
const referenceSlugs = new Set(
  referenceBlock ? [...referenceBlock[1].matchAll(/"([a-z0-9-]+)"/g)].map((match) => match[1]) : [],
);
if (!referenceBlock) {
  errors.push("lib/learning-curriculum.ts に curriculumReferenceSlugs が見つかりません。");
}

const markdownSlugs = readdirSync(readingsDir)
  .filter((name) => name.endsWith(".md") && name !== "README.md")
  .map((name) => name.replace(/\.md$/, ""));

const logDates = new Set(
  readdirSync(logsDir)
    .filter((name) => /^\d{4}-\d{2}-\d{2}\.md$/.test(name))
    .map((name) => name.replace(/\.md$/, "")),
);

for (const slug of markdownSlugs) {
  if (!lessonSlugs.has(slug) && !referenceSlugs.has(slug)) {
    errors.push(`docs/readings/${slug}.md は curriculumChapters にも curriculumReferenceSlugs にも登録されていません。`);
  }
}

for (const slug of [...lessonSlugs, ...referenceSlugs]) {
  if (!markdownSlugs.includes(slug)) {
    errors.push(`登録済み slug「${slug}」に対応する docs/readings/${slug}.md がありません。`);
  }
}

for (const slug of markdownSlugs) {
  const source = readFileSync(path.join(readingsDir, `${slug}.md`), "utf8");
  const frontmatter = source.match(/^---\n([\s\S]*?)\n---/)?.[1] ?? "";

  const relatedLogs = frontmatter.match(/^relatedLogs:\s*(.*)$/m)?.[1] ?? "";
  for (const date of relatedLogs.split(",").map((value) => value.trim()).filter(Boolean)) {
    if (!logDates.has(date)) {
      errors.push(`docs/readings/${slug}.md の relatedLogs「${date}」に対応する docs/learning-log/${date}.md がありません。`);
    }
  }

  const featured = frontmatter.match(/^featured:\s*(.*)$/m)?.[1]?.trim();
  if (featured !== undefined && featured !== "true" && featured !== "false") {
    errors.push(`docs/readings/${slug}.md の featured「${featured}」は true か false で指定してください。`);
  }
}

if (errors.length > 0) {
  console.error("コンテンツ整合性チェックに失敗しました:\n");
  for (const error of errors) console.error(`  - ${error}`);
  process.exit(1);
}

console.log(`コンテンツ整合性チェック OK（教材 ${markdownSlugs.length} 件、学習ログ ${logDates.size} 件）`);

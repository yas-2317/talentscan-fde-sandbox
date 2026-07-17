import type { ReactNode } from "react";
import { MermaidDiagram } from "@/components/mermaid-diagram";

type Block =
  | { type: "heading"; level: number; text: string }
  | { type: "paragraph"; lines: string[] }
  | { type: "list"; ordered: boolean; items: string[] }
  | { type: "table"; rows: string[][] }
  | { type: "code"; language: string; code: string };

function splitTableRow(line: string) {
  return line
    .trim()
    .replace(/^\||\|$/g, "")
    .split("|")
    .map((cell) => cell.trim());
}

function isTableDivider(line: string) {
  return splitTableRow(line).every((cell) => /^:?-{3,}:?$/.test(cell));
}

function parseMarkdown(markdown: string): Block[] {
  const lines = markdown.replace(/\r\n/g, "\n").split("\n");
  const blocks: Block[] = [];

  for (let index = 0; index < lines.length; ) {
    const line = lines[index];

    if (!line.trim() || /^<\/?(?:details|summary)>/.test(line.trim())) {
      index += 1;
      continue;
    }

    if (line.startsWith("```")) {
      const language = line.slice(3).trim();
      const code: string[] = [];
      index += 1;
      while (index < lines.length && !lines[index].startsWith("```")) {
        code.push(lines[index]);
        index += 1;
      }
      blocks.push({ type: "code", language, code: code.join("\n") });
      index += 1;
      continue;
    }

    const heading = line.match(/^(#{1,6})\s+(.+)$/);
    if (heading) {
      blocks.push({ type: "heading", level: heading[1].length, text: heading[2] });
      index += 1;
      continue;
    }

    if (
      line.includes("|") &&
      index + 1 < lines.length &&
      isTableDivider(lines[index + 1])
    ) {
      const rows = [splitTableRow(line)];
      index += 2;
      while (index < lines.length && lines[index].includes("|")) {
        rows.push(splitTableRow(lines[index]));
        index += 1;
      }
      blocks.push({ type: "table", rows });
      continue;
    }

    const listItem = line.match(/^\s*(?:(\d+)\.|[-*])\s+(.+)$/);
    if (listItem) {
      const ordered = Boolean(listItem[1]);
      const items: string[] = [];
      while (index < lines.length) {
        const item = lines[index].match(/^\s*(?:(\d+)\.|[-*])\s+(.+)$/);
        if (!item || Boolean(item[1]) !== ordered) break;
        items.push(item[2]);
        index += 1;
      }
      blocks.push({ type: "list", ordered, items });
      continue;
    }

    const paragraph = [line];
    index += 1;
    while (index < lines.length && lines[index].trim()) {
      if (/^(#{1,6})\s+/.test(lines[index]) || lines[index].startsWith("```")) break;
      if (/^\s*(?:(\d+)\.|[-*])\s+/.test(lines[index])) break;
      if (index + 1 < lines.length && isTableDivider(lines[index + 1])) break;
      if (/^<\/?(?:details|summary)>/.test(lines[index].trim())) break;
      paragraph.push(lines[index]);
      index += 1;
    }
    blocks.push({ type: "paragraph", lines: paragraph });
  }

  return blocks;
}

function plainText(text: string) {
  return text
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/[`*_]/g, "")
    .trim();
}

function headingId(text: string) {
  return plainText(text)
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\p{L}\p{N}-]/gu, "")
    .replace(/-+/g, "-");
}

export function extractMarkdownHeadings(content: string) {
  return parseMarkdown(content)
    .filter((block): block is Extract<Block, { type: "heading" }> => block.type === "heading")
    .filter((heading) => heading.level === 2 || heading.level === 3)
    .map((heading) => ({
      id: headingId(heading.text),
      level: heading.level,
      text: plainText(heading.text),
    }));
}

function inlineMarkdown(text: string): ReactNode[] {
  const pattern = /(\[[^\]]+\]\(https?:\/\/[^)]+\)|`[^`]+`|\*\*[^*]+\*\*)/g;

  return text.split(pattern).filter(Boolean).map((part, index) => {
    const link = part.match(/^\[([^\]]+)\]\((https?:\/\/[^)]+)\)$/);
    if (link) {
      return <a href={link[2]} key={index}>{link[1]}</a>;
    }
    if (part.startsWith("`") && part.endsWith("`")) {
      return <code key={index}>{part.slice(1, -1)}</code>;
    }
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={index}>{part.slice(2, -2)}</strong>;
    }
    return part;
  });
}

function renderBlock(block: Block, index: number) {
  if (block.type === "heading") {
    const Heading = `h${block.level}` as keyof React.JSX.IntrinsicElements;
    return <Heading id={headingId(block.text)} key={index}>{inlineMarkdown(block.text)}</Heading>;
  }
  if (block.type === "list") {
    const List = block.ordered ? "ol" : "ul";
    return (
      <List key={index}>
        {block.items.map((item, itemIndex) => <li key={itemIndex}>{inlineMarkdown(item)}</li>)}
      </List>
    );
  }
  if (block.type === "table") {
    const [head, ...body] = block.rows;
    return (
      <div className="table-scroll" key={index}>
        <table>
          <thead><tr>{head.map((cell, cellIndex) => <th key={cellIndex}>{inlineMarkdown(cell)}</th>)}</tr></thead>
          <tbody>{body.map((row, rowIndex) => <tr key={rowIndex}>{row.map((cell, cellIndex) => <td key={cellIndex}>{inlineMarkdown(cell)}</td>)}</tr>)}</tbody>
        </table>
      </div>
    );
  }
  if (block.type === "code") {
    if (block.language === "mermaid") {
      return <MermaidDiagram chart={block.code} key={index} />;
    }
    return (
      <div className="code-block" key={index}>
        {block.language && <span>{block.language}</span>}
        <pre><code>{block.code}</code></pre>
      </div>
    );
  }
  return (
    <p key={index}>
      {block.lines.map((line, lineIndex) => (
        <span key={lineIndex}>
          {inlineMarkdown(line)}
          {lineIndex < block.lines.length - 1 && <br />}
        </span>
      ))}
    </p>
  );
}

export function MarkdownContent({ content, hideTitle = false }: { content: string; hideTitle?: boolean }) {
  const parsedBlocks = parseMarkdown(content);
  const titleIndex = hideTitle
    ? parsedBlocks.findIndex((block) => block.type === "heading" && block.level === 1)
    : -1;
  const blocks = parsedBlocks.filter((_, index) => index !== titleIndex);

  const sections: Block[][] = [];
  for (const block of blocks) {
    if (block.type === "heading" && block.level === 2) {
      sections.push([block]);
    } else if (sections.length) {
      sections[sections.length - 1].push(block);
    } else {
      sections.push([block]);
    }
  }

  return (
    <article className="markdown-content">
      {sections.map((section, sectionIndex) => {
        const heading = section[0]?.type === "heading" ? plainText(section[0].text) : "";
        const className = heading === "今日の到達点"
          ? "markdown-section is-achievement"
          : heading === "次回"
            ? "markdown-section is-next"
            : "markdown-section";

        return (
          <section className={className} key={`${heading}-${sectionIndex}`}>
            {section.map((block, blockIndex) => renderBlock(block, blockIndex))}
          </section>
        );
      })}
    </article>
  );
}

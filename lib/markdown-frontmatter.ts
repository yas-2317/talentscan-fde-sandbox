export type Frontmatter = Record<string, string>;

export function parseFrontmatter(source: string) {
  const normalizedSource = source.replace(/\r\n/g, "\n");
  const match = normalizedSource.match(/^---\n([\s\S]*?)\n---\n?/);
  if (!match) {
    return { attributes: {} as Frontmatter, content: normalizedSource };
  }

  const attributes = match[1].split("\n").reduce<Frontmatter>((result, line) => {
    const separator = line.indexOf(":");
    if (separator === -1) return result;

    const key = line.slice(0, separator).trim();
    const value = line.slice(separator + 1).trim().replace(/^['"]|['"]$/g, "");
    if (key) result[key] = value;
    return result;
  }, {});

  return {
    attributes,
    content: normalizedSource.slice(match[0].length),
  };
}

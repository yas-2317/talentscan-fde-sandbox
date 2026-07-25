import Link from "next/link";

type GuideCardProps = {
  href: string;
  category: string | null;
  title: string;
  summary: string;
  estimatedMinutes?: number | null;
  compact?: boolean;
};

export function GuideCard({ href, category, title, summary, estimatedMinutes, compact = false }: GuideCardProps) {
  return (
    <Link href={href} className={`reference-card guide-card${compact ? " is-compact" : ""}`}>
      <span>
        {category ?? "Guide"}
        {estimatedMinutes ? `｜約${estimatedMinutes}分` : ""}
      </span>
      <h3>{title}</h3>
      <p>{summary}</p>
      <strong>Guideを開く →</strong>
    </Link>
  );
}

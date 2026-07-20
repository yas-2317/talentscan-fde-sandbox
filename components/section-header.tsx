import Link from "next/link";

export function SectionHeader({
  title,
  href,
  linkLabel,
}: {
  title: string;
  href?: string;
  linkLabel?: string;
}) {
  return (
    <div className="panel-head">
      <h2>{title}</h2>
      {href && linkLabel && <Link href={href}>{linkLabel}</Link>}
    </div>
  );
}

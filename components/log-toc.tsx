"use client";

import { useEffect, useState } from "react";

type TocHeading = { id: string; level: number; text: string };

export function LogToc({ headings, label }: { headings: TocHeading[]; label: string }) {
  const [activeId, setActiveId] = useState("");

  useEffect(() => {
    const targets = headings
      .map((heading) => document.getElementById(heading.id))
      .filter((element): element is HTMLElement => element !== null);
    if (!targets.length) return;

    let frame = 0;
    const update = () => {
      frame = 0;
      let current = "";
      for (const target of targets) {
        if (target.getBoundingClientRect().top <= 140) current = target.id;
        else break;
      }
      setActiveId(current);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [headings]);

  return (
    <nav aria-label={label}>
      {headings.map((heading) => {
        const classNames = [
          heading.level === 3 ? "is-nested" : "",
          heading.id === activeId ? "is-active" : "",
        ].filter(Boolean).join(" ");
        return (
          <a className={classNames || undefined} href={`#${heading.id}`} key={`${heading.id}-${heading.level}`}>
            {heading.text}
          </a>
        );
      })}
    </nav>
  );
}

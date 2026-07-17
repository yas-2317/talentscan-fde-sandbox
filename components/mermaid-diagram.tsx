"use client";

import { useEffect, useId, useState } from "react";

export function MermaidDiagram({ chart }: { chart: string }) {
  const reactId = useId();
  const [svg, setSvg] = useState("");
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let active = true;
    const diagramId = `learning-diagram-${reactId.replace(/[^a-zA-Z0-9]/g, "")}`;

    async function renderDiagram() {
      try {
        const { default: mermaid } = await import("mermaid");
        mermaid.initialize({
          startOnLoad: false,
          securityLevel: "strict",
          theme: "base",
          themeVariables: {
            primaryColor: "#eaf2ff",
            primaryTextColor: "#14213d",
            primaryBorderColor: "#8caee8",
            lineColor: "#60728f",
            secondaryColor: "#edf8f3",
            tertiaryColor: "#f6f8fb",
            fontFamily: "Arial, Helvetica, sans-serif",
          },
        });
        const result = await mermaid.render(diagramId, chart);
        if (active) setSvg(result.svg);
      } catch {
        if (active) setFailed(true);
      }
    }

    renderDiagram();
    return () => {
      active = false;
    };
  }, [chart, reactId]);

  if (failed) {
    return (
      <div className="mermaid-fallback">
        <span>図を表示できませんでした</span>
        <pre><code>{chart}</code></pre>
      </div>
    );
  }

  if (svg) {
    return (
      <div
        className="mermaid-diagram is-ready"
        role="img"
        aria-label="学習内容の関係図"
        dangerouslySetInnerHTML={{ __html: svg }}
      />
    );
  }

  return (
    <div
      className="mermaid-diagram"
      role="img"
      aria-label="学習内容の関係図"
    >
      <span>図を読み込んでいます…</span>
    </div>
  );
}

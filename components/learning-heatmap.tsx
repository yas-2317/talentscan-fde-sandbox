import { formatJapaneseDate } from "@/lib/learning-format";
import type { HeatmapWeek } from "@/lib/learning-stats";

const weekdayLabels = ["月", "", "水", "", "金", "", ""];

export function LearningHeatmap({
  weeks,
  totalDays,
}: {
  weeks: HeatmapWeek[];
  totalDays: number;
}) {
  return (
    <figure className="heatmap" aria-label={`学習ヒートマップ: 直近${weeks.length}週間で${totalDays}日学習`}>
      <div className="heatmap-scroll">
        <div className="heatmap-months" aria-hidden="true">
          {weeks.map((week) => (
            <span key={week.key}>{week.monthLabel ?? ""}</span>
          ))}
        </div>
        <div className="heatmap-body">
          <div className="heatmap-weekdays" aria-hidden="true">
            {weekdayLabels.map((label, index) => (
              <span key={index}>{label}</span>
            ))}
          </div>
          <div className="heatmap-grid" role="img" aria-hidden="true">
            {weeks.map((week) => (
              <div className="heatmap-week" key={week.key}>
                {week.cells.map((cell) =>
                  cell.inRange ? (
                    <i
                      key={cell.date}
                      className={`heatmap-cell level-${cell.level}`}
                      title={
                        cell.topic
                          ? `${formatJapaneseDate(cell.date)} — Day ${cell.day}: ${cell.topic}`
                          : `${formatJapaneseDate(cell.date)} — 記録なし`
                      }
                    />
                  ) : (
                    <i key={cell.date} className="heatmap-cell is-future" />
                  ),
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
      <figcaption className="heatmap-legend">
        <span>直近{Math.round(weeks.length / 4.3)}か月</span>
        <span className="heatmap-legend-scale" aria-hidden="true">
          記録なし <i className="heatmap-cell level-0" /> <i className="heatmap-cell level-3" /> 学習した日
        </span>
      </figcaption>
    </figure>
  );
}

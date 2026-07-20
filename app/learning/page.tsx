import { FdeRoadmap } from "@/components/fde-roadmap";
import { LearningHeatmap } from "@/components/learning-heatmap";
import { LearningTimeline } from "@/components/learning-timeline";
import { SectionHeader } from "@/components/section-header";
import { StatStrip } from "@/components/stat-strip";
import { TodayOverview } from "@/components/today-overview";
import { formatLearningPeriod } from "@/lib/learning-format";
import { getLearningLogs } from "@/lib/learning-logs";
import { getLearningProgress } from "@/lib/learning-roadmap";
import { getHeatmapWeeks, getLearningStats, todayKeyInJapan } from "@/lib/learning-stats";
import { getReadings } from "@/lib/readings";

export default async function LearningPage() {
  const [logs, readings] = await Promise.all([getLearningLogs(), getReadings()]);
  const todayKey = todayKeyInJapan();
  const stats = getLearningStats(logs, todayKey);
  const heatmapWeeks = getHeatmapWeeks(logs, 26, todayKey);
  const progress = getLearningProgress(logs);

  const latest = logs[0] ?? null;
  const nextReading = readings.find(
    (reading) => reading.slug === progress.currentLesson?.slug,
  );
  const resume = nextReading
    ? {
        href: `/learning/readings/${nextReading.slug}`,
        label: `Lessonを再開 — ${nextReading.title}`,
      }
    : null;

  return (
    <main className="learning-page dashboard">
      <TodayOverview
        log={latest}
        isToday={latest?.date === todayKey}
        currentStreak={stats.currentStreak}
        resume={resume}
      />

      <StatStrip
        items={[
          {
            label: "累計学習日数",
            value: String(stats.totalDays),
            unit: "日",
            note: formatLearningPeriod(stats.firstDate ?? undefined, stats.latestDate ?? undefined),
          },
          {
            label: "直近7日間",
            value: String(stats.thisWeekDays),
            unit: "/ 7日",
            note: "学習した日数",
          },
          {
            label: "完了した章",
            value: String(progress.completedChapterCount),
            unit: "/ 12章",
            note: `現在 Week ${progress.currentChapter.week}`,
          },
          {
            label: "今週のLesson",
            value: String(progress.currentChapter.completedLessonCount),
            unit: `/ ${progress.currentChapter.totalLessonCount}本`,
            note: progress.currentChapter.title,
          },
        ]}
      />

      <div className="dashboard-board">
        <div className="dashboard-main">
          <section className="panel">
            <SectionHeader title="学習の積み上がり" />
            <div className="panel-body">
              <LearningHeatmap weeks={heatmapWeeks} totalDays={stats.totalDays} />
            </div>
          </section>

          <section className="panel">
            <SectionHeader
              title="学習ログ"
              href="/learning/logs"
              linkLabel={`すべて見る(${logs.length}件)`}
            />
            <LearningTimeline logs={logs.slice(0, 7)} />
          </section>
        </div>

        <section className="panel dashboard-rail">
          <SectionHeader title="FDEロードマップ" href="/learning/readings" linkLabel="教材へ" />
          <FdeRoadmap progress={progress} />
        </section>
      </div>
    </main>
  );
}

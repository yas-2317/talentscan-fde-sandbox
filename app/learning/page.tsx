import { FdeRoadmap } from "@/components/fde-roadmap";
import { GuideCard } from "@/components/guide-card";
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
        label: `Restart Lesson — ${nextReading.title}`,
      }
    : null;

  // 新しいGuideほどorderが大きいため、降順で最新のfeatured Guideを最大3件表示する
  const featuredGuides = readings
    .filter((reading) => reading.kind === "reference" && reading.featured)
    .sort((a, b) => b.order - a.order)
    .slice(0, 3);

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
            label: "Days of Learning",
            value: String(stats.totalDays),
            unit: "日",
            note: formatLearningPeriod(stats.firstDate ?? undefined, stats.latestDate ?? undefined),
          },
          {
            label: "Last 7 Days",
            value: String(stats.thisWeekDays),
            unit: "/ 7days",
            note: "days with learning logs in the last 7 days",
          },
          {
            label: "Completed Chapters",
            value: String(progress.completedChapterCount),
            unit: "/ 12Chapters",
            note: `Current Week ${progress.currentChapter.week}`,
          },
          {
            label: "Lessons this week",
            value: String(progress.currentChapter.completedLessonCount),
            unit: `/ ${progress.currentChapter.totalLessonCount}Lessons`,
            note: progress.currentChapter.title,
          },
        ]}
      />

      <div className="dashboard-board">
        <div className="dashboard-main">
          <section className="panel">
            <SectionHeader title="Cumulative" />
            <div className="panel-body">
              <LearningHeatmap weeks={heatmapWeeks} totalDays={stats.totalDays} />
            </div>
          </section>

          <section className="panel">
            <SectionHeader
              title="Learning Logs"
              href="/learning/logs"
              linkLabel={`View All (${logs.length} entries)`}
            />
            <LearningTimeline logs={logs.slice(0, 7)} />
          </section>
        </div>

        <section className="panel dashboard-rail">
          <SectionHeader title="FDE Roadmap" href="/learning/readings" linkLabel="教材へ" />
          <FdeRoadmap progress={progress} />
        </section>
      </div>

      {featuredGuides.length > 0 && (
        <section className="panel">
          <SectionHeader
            title="Practice Guides"
            href="/learning/readings#practice-guides"
            linkLabel="View All"
          />
          <div className="panel-body">
            <div className="reference-grid guide-grid-dashboard">
              {featuredGuides.map((guide) => (
                <GuideCard
                  href={`/learning/readings/${guide.slug}`}
                  category={guide.category}
                  title={guide.title}
                  summary={guide.summary}
                  estimatedMinutes={guide.estimatedMinutes}
                  compact
                  key={guide.slug}
                />
              ))}
            </div>
          </div>
        </section>
      )}
    </main>
  );
}

import Link from "next/link";
import { formatJapaneseDate } from "@/lib/learning-format";
import { getLearningLogs } from "@/lib/learning-logs";
import { learningRoadmap } from "@/lib/learning-roadmap";
import { getReadings } from "@/lib/readings";

export default async function ReadingsPage() {
  const [readings, logs] = await Promise.all([getReadings(), getLearningLogs()]);
  const logByDate = new Map(logs.map((log) => [log.date, log]));

  return (
    <main className="learning-page reading-archive-page">
      <header className="archive-heading reading-heading">
        <div>
          <p className="eyebrow">Reading Library</p>
          <h1>教材</h1>
          <p>日々の学びを、順序立てて読み直せるFDE基礎教材です。</p>
        </div>
        <div className="archive-summary reading-summary">
          <strong>{readings.length}</strong>
          <span>本のReading</span>
          <small>{learningRoadmap.length}フェーズで構成</small>
        </div>
      </header>

      <div className="reading-phases">
        {learningRoadmap.map((phase) => {
          const phaseReadings = readings.filter((reading) => reading.phase === phase.id);
          if (!phaseReadings.length) return null;

          return (
            <section className="reading-phase-section" key={phase.id}>
              <div className="reading-phase-heading">
                <div>
                  <span>{phase.order.toString().padStart(2, "0")}</span>
                  <h2>{phase.label}</h2>
                </div>
                <p>{phase.description}</p>
              </div>

              <div className="reading-list">
                {phaseReadings.map((reading) => {
                  const relatedLogs = reading.relatedLogs
                    .map((date) => logByDate.get(date))
                    .filter((log) => log !== undefined);

                  return (
                    <Link href={`/learning/readings/${reading.slug}`} className="reading-row" key={reading.slug}>
                      <span className="reading-number">Reading {reading.order.toString().padStart(2, "0")}</span>
                      <div className="reading-row-main">
                        <span className="reading-row-meta">
                          <span className="phase-tag">{phase.label}</span>
                          {relatedLogs.map((log) => (
                            <span key={log.date}>Day {log.day}・{formatJapaneseDate(log.date)}</span>
                          ))}
                        </span>
                        <h3>{reading.title}</h3>
                        <p>{reading.summary}</p>
                      </div>
                      <div className="reading-row-support">
                        <span>前提知識</span>
                        <p>{reading.prerequisite}</p>
                        <span>到達目標</span>
                        <p>{reading.goal}</p>
                      </div>
                      <span className="row-arrow" aria-hidden="true">→</span>
                    </Link>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>
    </main>
  );
}

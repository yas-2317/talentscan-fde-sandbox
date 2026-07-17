import type { LearningLog } from "@/lib/learning-logs";

export const phaseIds = [
  "environment",
  "web-foundation",
  "data-foundation",
  "talentscan-build",
] as const;

export type LearningPhaseId = (typeof phaseIds)[number];

export type LearningPhase = {
  id: LearningPhaseId;
  order: number;
  label: string;
  shortLabel: string;
  description: string;
  targetCount: number;
};

export const learningRoadmap: LearningPhase[] = [
  {
    id: "environment",
    order: 1,
    label: "環境・公開",
    shortLabel: "環境",
    description: "Next.js、Git、GitHub、Vercelで開発から公開までをつなぐ。",
    targetCount: 2,
  },
  {
    id: "web-foundation",
    order: 2,
    label: "Web基礎",
    shortLabel: "Web",
    description: "ブラウザ、HTTP、画面とサーバー、APIの役割を理解する。",
    targetCount: 4,
  },
  {
    id: "data-foundation",
    order: 3,
    label: "データ基礎",
    shortLabel: "データ",
    description: "DB、永続化、認証とデータ設計の基本を身につける。",
    targetCount: 3,
  },
  {
    id: "talentscan-build",
    order: 4,
    label: "TalentScan実装",
    shortLabel: "実装",
    description: "候補者データ、AI評価、ATS連携を一つの機能として実装する。",
    targetCount: 4,
  },
];

export function getLearningPhase(id: LearningPhaseId) {
  return learningRoadmap.find((phase) => phase.id === id) ?? learningRoadmap[0];
}

export function isLearningPhaseId(value: string): value is LearningPhaseId {
  return phaseIds.includes(value as LearningPhaseId);
}

export type PhaseProgress = LearningPhase & {
  logCount: number;
  status: "completed" | "current" | "upcoming";
};

export function getLearningProgress(logs: LearningLog[]) {
  const counts = new Map<LearningPhaseId, number>();
  for (const log of logs) {
    counts.set(log.phase, (counts.get(log.phase) ?? 0) + 1);
  }

  const firstIncompleteIndex = learningRoadmap.findIndex(
    (phase) => (counts.get(phase.id) ?? 0) < phase.targetCount,
  );
  const currentIndex = firstIncompleteIndex === -1
    ? learningRoadmap.length - 1
    : firstIncompleteIndex;

  const phases: PhaseProgress[] = learningRoadmap.map((phase, index) => ({
    ...phase,
    logCount: counts.get(phase.id) ?? 0,
    status: index < currentIndex
      ? "completed"
      : index === currentIndex
        ? "current"
        : "upcoming",
  }));

  return {
    phases,
    currentPhase: phases[currentIndex],
    completedPhaseCount: phases.filter((phase) => phase.status === "completed").length,
  };
}

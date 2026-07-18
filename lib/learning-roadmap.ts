import type { LearningLog } from "@/lib/learning-logs";
import {
  curriculumChapters,
  curriculumPhases,
  getCurriculumPhase,
  isCurriculumPhaseId,
  type CurriculumPhaseId,
} from "@/lib/learning-curriculum";

export type LearningPhaseId = CurriculumPhaseId;
export const learningRoadmap = curriculumPhases;
export const isLearningPhaseId = isCurriculumPhaseId;
export const getLearningPhase = getCurriculumPhase;

export type ProgressStatus = "completed" | "current" | "upcoming";

export function getCompletedLessonSlugs(logs: LearningLog[]) {
  return new Set(logs.flatMap((log) => log.completedLessons));
}

export function getLearningProgress(logs: LearningLog[]) {
  const completedLessons = getCompletedLessonSlugs(logs);
  const firstIncompleteChapterIndex = curriculumChapters.findIndex((chapter) =>
    chapter.lessons.length === 0 || chapter.lessons.some((lesson) => !completedLessons.has(lesson.slug)),
  );
  const currentChapterIndex = firstIncompleteChapterIndex === -1
    ? curriculumChapters.length - 1
    : firstIncompleteChapterIndex;

  const chapters = curriculumChapters.map((chapter, index) => {
    const completedLessonCount = chapter.lessons.filter((lesson) =>
      completedLessons.has(lesson.slug)
    ).length;
    const status: ProgressStatus = chapter.lessons.length > 0 && completedLessonCount === chapter.lessons.length
      ? "completed"
      : index === currentChapterIndex
        ? "current"
        : "upcoming";

    return {
      ...chapter,
      completedLessonCount,
      totalLessonCount: chapter.lessons.length,
      status,
    };
  });

  const currentChapter = chapters[currentChapterIndex];
  const currentLesson = currentChapter.lessons.find(
    (lesson) => !completedLessons.has(lesson.slug),
  ) ?? currentChapter.lessons.at(-1);
  const currentLessonNumber = currentLesson
    ? currentChapter.lessons.findIndex((lesson) => lesson.slug === currentLesson.slug) + 1
    : null;

  const phases = curriculumPhases.map((phase) => {
    const phaseChapters = chapters.filter((chapter) => chapter.phase === phase.id);
    const completedChapterCount = phaseChapters.filter(
      (chapter) => chapter.status === "completed",
    ).length;
    const currentPhase = currentChapter.phase === phase.id;
    const status: ProgressStatus = completedChapterCount === phaseChapters.length
      ? "completed"
      : currentPhase
        ? "current"
        : "upcoming";

    return {
      ...phase,
      completedChapterCount,
      totalChapterCount: phaseChapters.length,
      status,
    };
  });

  return {
    phases,
    chapters,
    currentPhase: getCurriculumPhase(currentChapter.phase),
    currentChapter,
    currentLesson,
    currentLessonNumber,
    completedLessons,
    completedLessonCount: completedLessons.size,
    totalLessonCount: curriculumChapters.reduce(
      (total, chapter) => total + chapter.lessons.length,
      0,
    ),
    completedChapterCount: chapters.filter((chapter) => chapter.status === "completed").length,
    completedPhaseCount: phases.filter((phase) => phase.status === "completed").length,
  };
}

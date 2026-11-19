import seedData from '@/data/seed/grade1-math.json';
import { Curriculum, Chapter, Stage, Question } from '@/types/curriculum';

/**
 * Validates a curriculum object to ensure it conforms to Grade 1 Math requirements.
 * Specifically checks:
 * - subject is 'math' and grade is 1
 * - chapters array is valid and non-empty
 * - each stage contains questions
 * - every single question has a valid, non-empty promptAudioUrl
 */
export function validateCurriculum(data: unknown): Curriculum {
  if (!data || typeof data !== 'object') {
    throw new Error('Curriculum data must be a non-null object');
  }

  const raw = data as Partial<Curriculum>;

  if (raw.subject !== 'math') {
    throw new Error(`Invalid curriculum subject: expected 'math', received '${raw.subject}'`);
  }

  if (raw.grade !== 1) {
    throw new Error(`Invalid curriculum grade: expected 1, received '${raw.grade}'`);
  }

  if (!Array.isArray(raw.chapters) || raw.chapters.length === 0) {
    throw new Error('Curriculum must contain at least one chapter');
  }

  for (const chapter of raw.chapters) {
    if (!chapter.id || !chapter.title) {
      throw new Error(`Chapter must have valid id and title: ${JSON.stringify(chapter)}`);
    }

    if (!Array.isArray(chapter.stages) || chapter.stages.length === 0) {
      throw new Error(`Chapter '${chapter.id}' must contain at least one stage`);
    }

    for (const stage of chapter.stages) {
      if (!stage.id || !stage.name) {
        throw new Error(`Stage must have valid id and name in chapter '${chapter.id}'`);
      }

      if (!Array.isArray(stage.questions) || stage.questions.length === 0) {
        throw new Error(`Stage '${stage.id}' must contain at least one question`);
      }

      for (const question of stage.questions) {
        if (!question.id || !question.type || !question.promptText) {
          throw new Error(`Question missing required fields in stage '${stage.id}': ${JSON.stringify(question)}`);
        }

        if (!question.promptAudioUrl || typeof question.promptAudioUrl !== 'string' || question.promptAudioUrl.trim() === '') {
          throw new Error(
            `Question '${question.id}' in stage '${stage.id}' violates global constraint: promptAudioUrl is required and must not be empty.`
          );
        }
      }
    }
  }

  return raw as Curriculum;
}

/**
 * Loads and validates Grade 1 Math curriculum from seed JSON data.
 */
export function loadGrade1MathData(): Curriculum {
  return validateCurriculum(seedData);
}

/**
 * Helper to find a chapter by ID
 */
export function findChapterById(curriculum: Curriculum, chapterId: string): Chapter | undefined {
  return curriculum.chapters.find((c) => c.id === chapterId);
}

/**
 * Helper to find a stage by ID across all chapters
 */
export function findStageById(curriculum: Curriculum, stageId: string): Stage | undefined {
  for (const chapter of curriculum.chapters) {
    const stage = chapter.stages.find((s) => s.id === stageId);
    if (stage) return stage;
  }
  return undefined;
}

/**
 * Helper to find a question by ID across all chapters and stages
 */
export function findQuestionById(curriculum: Curriculum, questionId: string): Question | undefined {
  for (const chapter of curriculum.chapters) {
    for (const stage of chapter.stages) {
      const question = stage.questions.find((q) => q.id === questionId);
      if (question) return question;
    }
  }
  return undefined;
}

import seedData from '@/data/seed/grade1-math.json';
import { curriculumRegistry } from '@/data/seed/curriculum-registry';
import { Curriculum, Chapter, Stage, Question, SubjectType, GradeLevel } from '@/types/curriculum';

/**
 * Validates a curriculum object to ensure it conforms to required specifications.
 * Specifically checks:
 * - subject and grade match expected values (defaults to 'math' and 1 for backwards compatibility)
 * - chapters array is valid and non-empty
 * - each stage contains questions
 * - every single question has a valid, non-empty promptAudioUrl
 */
export function validateCurriculum(
  data: unknown,
  expectedSubject: SubjectType = 'math',
  expectedGrade: GradeLevel = 1
): Curriculum {
  if (!data || typeof data !== 'object') {
    throw new Error('Curriculum data must be a non-null object');
  }

  const raw = data as Partial<Curriculum>;

  if (raw.subject !== expectedSubject) {
    throw new Error(`Invalid curriculum subject: expected '${expectedSubject}', received '${raw.subject}'`);
  }

  if (raw.grade !== expectedGrade) {
    throw new Error(`Invalid curriculum grade: expected ${expectedGrade}, received '${raw.grade}'`);
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
 * Loads and validates curriculum by subject and grade.
 */
export function loadCurriculum(subject: SubjectType = 'math', grade: GradeLevel = 1): Curriculum {
  const key = `${subject}_${grade}`;
  const data = curriculumRegistry[key];
  if (!data) {
    throw new Error(`Curriculum not found for subject '${subject}' and grade ${grade}`);
  }
  return validateCurriculum(data, subject, grade);
}

/**
 * Loads and validates Grade 1 Math curriculum from seed JSON data (legacy support).
 */
export function loadGrade1MathData(): Curriculum {
  return loadCurriculum('math', 1);
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

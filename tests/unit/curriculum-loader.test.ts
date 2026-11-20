import { describe, it, expect } from 'vitest';
import {
  loadGrade1MathData,
  loadCurriculum,
  validateCurriculum,
  findChapterById,
  findStageById,
  findQuestionById,
} from '@/lib/curriculum-loader';

describe('Curriculum Loader', () => {
  it('should load Grade 1 Math curriculum with chapters and interactive stages', () => {
    const curriculum = loadGrade1MathData();
    expect(curriculum.subject).toBe('math');
    expect(curriculum.grade).toBe(1);
    expect(curriculum.chapters.length).toBeGreaterThanOrEqual(2);

    const firstChapter = curriculum.chapters[0];
    expect(firstChapter.stages.length).toBeGreaterThanOrEqual(1);
    expect(firstChapter.stages[0].questions.length).toBeGreaterThanOrEqual(3);
    expect(firstChapter.stages[0].questions[0].promptAudioUrl).toBeDefined();
  });

  it('should verify all questions across all stages have a promptAudioUrl', () => {
    const curriculum = loadGrade1MathData();
    let totalQuestions = 0;

    for (const chapter of curriculum.chapters) {
      for (const stage of chapter.stages) {
        for (const question of stage.questions) {
          totalQuestions++;
          expect(question.promptAudioUrl).toBeTruthy();
          expect(question.promptAudioUrl.length).toBeGreaterThan(0);
        }
      }
    }
    expect(totalQuestions).toBeGreaterThanOrEqual(6);
  });

  it('should include required chapters: Thung lũng Số đếm and Rừng Phép cộng', () => {
    const curriculum = loadGrade1MathData();
    const titles = curriculum.chapters.map((c) => c.title);

    expect(titles.some((t) => t.includes('Thung lũng Số đếm'))).toBe(true);
    expect(titles.some((t) => t.includes('Rừng Phép cộng'))).toBe(true);
  });

  it('should contain at least one boss battle stage with boss properties', () => {
    const curriculum = loadGrade1MathData();
    const allStages = curriculum.chapters.flatMap((c) => c.stages);
    const bossStages = allStages.filter((s) => s.isBoss);

    expect(bossStages.length).toBeGreaterThanOrEqual(1);
    expect(bossStages[0].bossMaxHp).toBeGreaterThan(0);
    expect(bossStages[0].name).toBeDefined();
  });

  it('should contain multiple question types: MULTIPLE_CHOICE, DRAG_DROP, COUNTING', () => {
    const curriculum = loadGrade1MathData();
    const allQuestions = curriculum.chapters.flatMap((c) => c.stages.flatMap((s) => s.questions));
    const types = new Set(allQuestions.map((q) => q.type));

    expect(types.has('MULTIPLE_CHOICE')).toBe(true);
    expect(types.has('DRAG_DROP')).toBe(true);
    expect(types.has('COUNTING')).toBe(true);
  });

  it('should throw validation error if question promptAudioUrl is missing or empty', () => {
    const invalidData: any = {
      subject: 'math',
      grade: 1,
      title: 'Invalid Math',
      chapters: [
        {
          id: 'c1',
          title: 'Chapter 1',
          order: 1,
          stages: [
            {
              id: 's1',
              name: 'Stage 1',
              order: 1,
              questions: [
                {
                  id: 'q1',
                  type: 'MULTIPLE_CHOICE',
                  promptText: 'Question without audio',
                  promptAudioUrl: '',
                },
              ],
            },
          ],
        },
      ],
    };

    expect(() => validateCurriculum(invalidData)).toThrowError(/promptAudioUrl is required/);
  });

  it('should throw validation error if subject or grade is incorrect', () => {
    expect(() => validateCurriculum({ subject: 'science', grade: 1, chapters: [] })).toThrowError(/Invalid curriculum subject/);
    expect(() => validateCurriculum({ subject: 'math', grade: 2, chapters: [] })).toThrowError(/Invalid curriculum grade/);
  });

  it('should provide helper functions to find chapters, stages, and questions by ID', () => {
    const curriculum = loadGrade1MathData();

    const chapter1 = findChapterById(curriculum, 'chapter_1');
    expect(chapter1).toBeDefined();
    expect(chapter1?.id).toBe('chapter_1');

    const stage1 = findStageById(curriculum, 'stage_1');
    expect(stage1).toBeDefined();
    expect(stage1?.id).toBe('stage_1');

    const question1 = findQuestionById(curriculum, 'math_g1_c1_s1_q1');
    expect(question1).toBeDefined();
    expect(question1?.id).toBe('math_g1_c1_s1_q1');

    expect(findChapterById(curriculum, 'non_existent')).toBeUndefined();
    expect(findStageById(curriculum, 'non_existent')).toBeUndefined();
    expect(findQuestionById(curriculum, 'non_existent')).toBeUndefined();
  });

  it('should load curriculum for all subjects (math, vietnamese, english) across grades 1-5', () => {
    const subjects = ['math', 'vietnamese', 'english'] as const;
    const grades = [1, 2, 3, 4, 5] as const;

    for (const subject of subjects) {
      for (const grade of grades) {
        const curriculum = loadCurriculum(subject, grade);
        expect(curriculum.subject).toBe(subject);
        expect(curriculum.grade).toBe(grade);
        expect(curriculum.chapters.length).toBeGreaterThanOrEqual(1);

        for (const ch of curriculum.chapters) {
          expect(ch.stages.length).toBeGreaterThanOrEqual(1);
          for (const st of ch.stages) {
            expect(st.questions.length).toBeGreaterThanOrEqual(1);
            for (const q of st.questions) {
              expect(q.promptAudioUrl).toBeTruthy();
              expect(q.promptText).toBeTruthy();
            }
          }
        }
      }
    }
  });

  it('should support finding stages and questions across loaded Vietnamese and English curriculums', () => {
    const vnG1 = loadCurriculum('vietnamese', 1);
    expect(vnG1.title).toMatch(/Tiếng Việt/i);
    const engG1 = loadCurriculum('english', 1);
    expect(engG1.title).toMatch(/English|Tiếng Anh/i);

    const firstVnStage = vnG1.chapters[0].stages[0];
    const foundStage = findStageById(vnG1, firstVnStage.id);
    expect(foundStage?.id).toBe(firstVnStage.id);
  });
});

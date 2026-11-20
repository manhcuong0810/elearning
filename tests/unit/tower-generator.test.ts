import { describe, it, expect } from 'vitest';
import { generateTowerStage } from '@/lib/tower-generator';
import { SubjectType, GradeLevel } from '@/types/curriculum';

describe('Endless Tower Stage Generator (1 - 1000 Floors)', () => {
  const subjects: SubjectType[] = ['math', 'vietnamese', 'english'];
  const grades: GradeLevel[] = [1, 2, 3, 4, 5];

  it('generates valid stage structures for floor 1, floor 500, and floor 1000 across all subjects and grades', () => {
    const testFloors = [1, 250, 500, 750, 1000];

    for (const subject of subjects) {
      for (const grade of grades) {
        for (const floor of testFloors) {
          const stage = generateTowerStage(subject, grade, floor);

          expect(stage.id).toBe(`tower_${subject}_g${grade}_f${floor}`);
          expect(stage.name).toContain(`Tầng ${floor}`);
          expect(stage.questions.length).toBeGreaterThanOrEqual(3);

          for (const q of stage.questions) {
            expect(q.id).toBeTruthy();
            expect(q.promptText).toBeTruthy();
            expect(q.promptAudioUrl).toBeTruthy();
            expect(q.rewardCoins).toBeGreaterThanOrEqual(5);
            expect(q.rewardExp).toBeGreaterThanOrEqual(10);
            expect(['MULTIPLE_CHOICE', 'DRAG_DROP', 'COUNTING']).toContain(q.type);

            if (q.type === 'MULTIPLE_CHOICE') {
              expect(q.options && q.options.length).toBeGreaterThanOrEqual(2);
              const correctOpts = q.options?.filter((o) => o.isCorrect);
              expect(correctOpts?.length).toBe(1);
            }
          }
        }
      }
    }
  });

  it('scales reward coins and EXP as floor increases towards 1000', () => {
    const stageFloor1 = generateTowerStage('math', 1, 1);
    const stageFloor1000 = generateTowerStage('math', 1, 1000);

    const coinsF1 = stageFloor1.questions[0].rewardCoins || 0;
    const coinsF1000 = stageFloor1000.questions[0].rewardCoins || 0;

    expect(coinsF1000).toBeGreaterThanOrEqual(coinsF1);
  });

  it('marks milestone floors (every 10 floors) as Boss Tower Challenges with boss properties', () => {
    const regularFloor = generateTowerStage('vietnamese', 2, 7);
    const bossFloor = generateTowerStage('vietnamese', 2, 10);
    const megaBossFloor = generateTowerStage('english', 3, 100);

    expect(regularFloor.isBoss).toBeFalsy();
    expect(bossFloor.isBoss).toBe(true);
    expect(bossFloor.bossMaxHp).toBeGreaterThanOrEqual(3);
    expect(bossFloor.bossName).toBeTruthy();

    expect(megaBossFloor.isBoss).toBe(true);
    expect(megaBossFloor.bossName).toBeTruthy();
  });

  it('generates deterministically so that the same floor always returns the same challenge', () => {
    const run1 = generateTowerStage('english', 1, 42);
    const run2 = generateTowerStage('english', 1, 42);

    expect(run1.questions[0].promptText).toBe(run2.questions[0].promptText);
    expect(run1.questions[0].id).toBe(run2.questions[0].id);
  });
});

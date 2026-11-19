import { describe, it, expect } from 'vitest';
import { APP_NAME } from '@/index';

describe('Project Workspace Setup', () => {
  it('should have a working TypeScript and Vitest environment', () => {
    const sum = (a: number, b: number) => a + b;
    expect(sum(2, 3)).toBe(5);
  });

  it('should resolve path alias @/* to src/*', () => {
    expect(APP_NAME).toBe('Grade 1 Math Gamified E-learning');
  });
});

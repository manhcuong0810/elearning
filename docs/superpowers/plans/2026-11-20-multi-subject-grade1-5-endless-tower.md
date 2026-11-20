# Multi-Subject (Math, Vietnamese, English) & Grade 1-5 with 1,000-Stage Endless Tower Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Expand the platform from Grade 1 Math to a comprehensive Grade 1–5 e-learning system covering Math, Vietnamese, and English with 100 story-based curriculum stages per subject/grade plus a 1,000-stage Endless Practice Tower generator.

**Architecture:** A domain-driven multi-subject & multi-grade curriculum engine (`loadCurriculum(subject, grade)`) paired with a deterministic procedural 1,000-floor generator (`generateTowerStage(subject, grade, floor)`). State is namespaced in `useProgressStore` (`progress[subject][grade]`), and a child-friendly `SubjectGradeSelector` allows seamless switching across grades (1–5) and subjects (📐 Toán, 📖 Tiếng Việt, 🔤 Tiếng Anh) without losing any existing Grade 1 Math progress.

**Tech Stack:** Next.js 15 (App Router), React 19, TypeScript (strict), Zustand, Tailwind CSS, Framer Motion, Vitest, React Testing Library.

**Spec:** [Tài liệu thiết kế Đa Môn Học & Toàn Cấp Tiểu Học Lớp 1-5](#) approved by user in session `2432e8cd-42e9-40b7-9d28-986255b6473a`.

---

## Global Constraints

- Touch targets for all buttons and options must be at least $48 \times 48\text{px}$ for small fingers.
- Every single question must have a valid non-empty `promptAudioUrl` or Web Audio TTS synthesis trigger.
- Zero mock data in production; zero build or TypeScript warnings (`strict: true`).
- Backward compatibility: existing Grade 1 Math stars, coins, and unlocked stages must remain completely intact.
- Failures in Boss or Tower stages must never display "Thất bại" or "Game Over"; mascot provides positive encouragement.

---

## Review Focus

1. **Backward Compatibility**: Switching subjects or grades must preserve previously earned stars, coins, and equipment.
2. **Subject & Grade Boundaries**: Changing from Grade 1 Vietnamese to Grade 5 Math must immediately reload the appropriate stages and update the adventure map.
3. **Endless Tower Stability**: Generating stages up to floor 1,000 must not lag or cause out-of-memory errors; generated questions must strictly conform to the selected grade and subject curriculum.
4. **Interactive Question Types in Vietnamese & English**: Word dragging, phonics matching, and spelling checks must adhere to multi-sensory drop targets and snap back cleanly on drop outside target.
5. **No Broken Audio**: Every newly generated or seeded question across all grades must contain audio playback functionality without crashing JSDOM or Web Audio API.

---

## Task Decomposition

### Task 1: Type Definitions & Multi-Subject Curriculum Registry
- [ ] Write failing unit test in `tests/unit/curriculum-loader.test.ts` asserting `loadCurriculum('vietnamese', 1)` and `loadCurriculum('english', 1)` return valid structured curriculums conforming to `Curriculum`.
- [ ] Extend `src/types/curriculum.ts` with `SubjectType = 'math' | 'vietnamese' | 'english'` and `GradeLevel = 1 | 2 | 3 | 4 | 5`.
- [ ] Create seed data modules for Vietnamese (Grades 1–5) and English (Grades 1–5) in `src/data/seed/` with core phonics, vocabulary, spelling, and grammar stages.
- [ ] Update `src/lib/curriculum-loader.ts` to export `loadCurriculum(subject: SubjectType, grade: GradeLevel): Curriculum`.
- [ ] Verify test passes and commit `feat(curriculum): support multi-subject and grade 1-5 curriculum loading`.

### Task 2: Procedural 1,000-Stage Endless Tower Generator
- [ ] Write failing unit test in `tests/unit/tower-generator.test.ts` testing `generateTowerStage(subject, grade, floor)` from floor 1 to 1000 for each subject/grade.
- [ ] Implement `src/lib/tower-generator.ts` with knowledge banks of Vietnamese words, English vocabulary/patterns, and Math arithmetic templates scaling in difficulty.
- [ ] Ensure every generated question has `promptAudioUrl`, valid question type (`MULTIPLE_CHOICE`, `DRAG_DROP`, `COUNTING`), and clear explanations.
- [ ] Verify tests pass and commit `feat(tower): implement 1000-stage procedural tower generator for grades 1-5`.

### Task 3: State Management Update (`useProgressStore`)
- [ ] Write failing unit tests in `tests/unit/progress-store.test.ts` checking `selectedSubject`, `selectedGrade`, `setSubject`, `setGrade`, and subject-grade namespaced stage records and tower floors.
- [ ] Update `src/store/useProgressStore.ts` to include `selectedSubject: SubjectType` (default `'math'`), `selectedGrade: GradeLevel` (default `1`), `towerRecordBySubjectGrade`, and migration fallback for legacy Grade 1 Math.
- [ ] Run all existing unit tests to guarantee 100% backward compatibility.
- [ ] Verify tests pass and commit `feat(store): add subject and grade state with namespaced progress tracking`.

### Task 4: Subject & Grade Selector Component (`SubjectGradeSelector`)
- [ ] Write failing test in `tests/unit/subject-grade-selector.test.tsx` testing rendering of Grade pills (Lớp 1–5) and Subject pills (Toán, Tiếng Việt, Tiếng Anh) with $\ge 48\times 48\text{px}$ touch targets and active state styling.
- [ ] Implement `src/components/navigation/SubjectGradeSelector.tsx` with kid-friendly icons, sound effects on tab click, and vibrant gradient indicators.
- [ ] Verify tests pass and commit `feat(ui): create SubjectGradeSelector component for grades 1-5 and 3 subjects`.

### Task 5: Endless Practice Tower Screen (`EndlessTowerModal`)
- [ ] Write failing test in `tests/unit/endless-tower.test.tsx` checking floor selection, answering questions, climbing floors, and mascot encouragement.
- [ ] Implement `src/components/tower/EndlessTowerModal.tsx` displaying the crystal tower visual, current floor progress, combo multiplier, and question widget runner.
- [ ] Verify tests pass and commit `feat(tower): create EndlessTowerModal interactive component`.

### Task 6: Platform Integration & End-to-End Verification
- [ ] Integrate `SubjectGradeSelector` and `EndlessTowerModal` button into `src/app/page.tsx` and `src/components/map/AdventureMap.tsx`.
- [ ] Write comprehensive integration test in `tests/integration/multi-grade-subject-flow.test.tsx` verifying switching grades/subjects changes the map stages and loads corresponding questions.
- [ ] Run full test suite (`npm test`) and production build (`npm run build`).
- [ ] Commit with `feat(platform): integrate multi-subject grade 1-5 system and endless tower`.

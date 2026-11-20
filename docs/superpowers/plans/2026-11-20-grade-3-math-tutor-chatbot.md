# Grade 3 Math Tutor Chatbot (DeepSeek) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build an interactive Grade 3 Math AI Tutor Chatbot powered by DeepSeek API with a friendly floating action button (FAB) widget for elementary students.

**Architecture:** Next.js App Router API Route (`/api/tutor`) that securely proxies prompts to DeepSeek Chat API with specialized Grade 3 pedagogical system prompting, paired with a kid-friendly responsive floating chat component (`Grade3TutorFab`) integrated into the global page layout.

**Tech Stack:** Next.js 15, React 19, TypeScript, Tailwind CSS, DeepSeek API (`deepseek-chat`), Vitest, React Testing Library.

**Spec:** Floating Action Button (FAB) Grade 3 Math tutor chatbot using DeepSeek API key `sk-your-deepseek-api-key`.

## Global Constraints

- Never expose the DeepSeek API key in client-side bundles (use `.env.local` and Next.js server route).
- Friendly pedagogical tone suited for Grade 1-3 elementary kids: step-by-step reasoning, clear breakdown of word problems, encouraging remarks.
- Touch target >= 48x48px on FAB and action buttons for tablet/iPad accessibility.
- Zero mock/fake statistics; handle network timeouts and API errors gracefully with warm fallback messages.
- Full type safety (`strict: true`), 100% test pass rate on `npm test` and clean `npm run build`.

## Review Focus

1. DeepSeek API response formatting: handle potential API errors or rate limits gracefully without crashing the UI.
2. Safe prompting: keep AI strictly focused on elementary math (Grade 3 curriculum).
3. Chat message rendering: formatted step-by-step explanation with clean markdown / paragraph breaks.
4. Mobile / Tablet responsiveness: chat window fits comfortably on screen without covering essential buttons.
5. Sound effects and speaker button: provide gentle sound on message arrival and optional voice reading.

---

### Task 1: Environment & DeepSeek Tutor API Route

**Files:**
- Modify: `.env.local`
- Create: `src/app/api/tutor/route.ts`
- Test: `tests/unit/tutor-api.test.ts`

- [ ] Step 1: Write failing test in `tests/unit/tutor-api.test.ts` checking POST `/api/tutor` handles request validation, calls DeepSeek with system prompt, and returns assistant message.
- [ ] Step 2: Run test and confirm it fails.
- [ ] Step 3: Add `DEEPSEEK_API_KEY=sk-your-deepseek-api-key` to `.env.local`.
- [ ] Step 4: Implement `src/app/api/tutor/route.ts` with system prompt for Grade 3 Math and error handling.
- [ ] Step 5: Run `npx vitest run tests/unit/tutor-api.test.ts` and confirm it passes.
- [ ] Step 6: Commit changes with message `feat(tutor): implement DeepSeek Grade 3 math tutor API route`.

---

### Task 2: Grade 3 Math Tutor Floating Chat Component (`Grade3TutorFab`)

**Files:**
- Create: `src/components/tutor/Grade3TutorFab.tsx`
- Test: `tests/unit/tutor-fab.test.tsx`

- [ ] Step 1: Write failing test in `tests/unit/tutor-fab.test.tsx` checking FAB toggle open/close, question suggestion click, sending message, loading state, and displaying tutor response.
- [ ] Step 2: Run test and confirm it fails.
- [ ] Step 3: Implement `src/components/tutor/Grade3TutorFab.tsx` with kid-friendly 3D floating button, chat window, suggested Grade 3 topics, message bubbles, and speech audio option.
- [ ] Step 4: Run `npx vitest run tests/unit/tutor-fab.test.tsx` and confirm it passes.
- [ ] Step 5: Commit changes with message `feat(tutor): create Grade3TutorFab floating chat component`.

---

### Task 3: Global Integration & Verification

**Files:**
- Modify: `src/app/page.tsx`
- Test: `tests/integration/main-flow.test.tsx`

- [ ] Step 1: Add `Grade3TutorFab` to `src/app/page.tsx` so the floating tutor is accessible across the learning platform.
- [ ] Step 2: Run `npm test` across all 21 test files and ensure 100% pass.
- [ ] Step 3: Run `npm run build` to verify type safety and bundle creation.
- [ ] Step 4: Verify in live browser via Browser QA Agent (open tutor, send sample Grade 3 math question, verify response).
- [ ] Step 5: Commit changes with message `feat(tutor): integrate Grade3TutorFab into main learning layout`.

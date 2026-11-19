# Triển Khai MVP Nền Tảng Học Tập & Kiểm Tra Game Hóa Lớp 1 (Môn Toán)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Xây dựng hoàn chỉnh lát cắt dọc (Vertical Slice) của nền tảng học tập sinh động cho học sinh Lớp 1 môn Toán, tích hợp đầy đủ Bản đồ phiêu lưu, Engine câu hỏi tương tác âm thanh - kéo thả, Trận chiến Đấu Boss, Phòng Đấu trường 1vs1 (kèm Bot thông minh) và Nhà linh vật.

**Architecture:** Ứng dụng Web đơn trang (SPA) trên nền Next.js App Router (TypeScript, Tailwind CSS), tách biệt các lớp Domain Models (types & seed loaders), Audio/Sound FX Service, Interactive Question Engine, Game State & Progression Store (Zustand/Context), và Arena Match Engine hỗ trợ Bot Fallback.

**Tech Stack:** Next.js 15+ / React 19, TypeScript, Tailwind CSS, Framer Motion, Howler.js / Web Audio API, Vitest & React Testing Library.

**Spec:** `docs/superpowers/specs/2026-11-19-elearning-gamified-platform-design.md`

## Global Constraints

- Mọi câu hỏi phải có `promptAudioUrl` và nút loa to bản dễ bấm cho trẻ Lớp 1.
- Giao diện kéo thả phải hỗ trợ cả Touch (màn hình cảm ứng iPad/Tablet) và Mouse (máy tính).
- Thời gian tìm trận trong Đấu trường (Arena) không bao giờ vượt quá 10 giây; nếu không có bạn chơi, tự động kích hoạt Bot mô phỏng.
- Toàn bộ nội dung mẫu khởi đầu cho Lớp 1 môn Toán (Số đếm 1-10, Phép cộng trong phạm vi 10, Hình khối) được định nghĩa qua file cấu trúc JSON Seed Data.
- Không sử dụng ngôn ngữ/thuật ngữ kỹ thuật trên giao diện học sinh; thông báo và phản hồi luôn mang tính khích lệ, tươi sáng.

## Review Focus

- Trẻ bấm liên tục nhiều lần vào nút phát âm thanh hoặc nút nộp bài: Phải debounce/hủy lượt phát trước để không gây đè âm thanh chói tai hoặc gửi nhiều lần.
- Trẻ kéo vật thể ra ngoài khu vực thả (Drop zone): Vật thể phải tự động bay về vị trí ban đầu với hiệu ứng mượt mà, không bị kẹt hay mất hình.
- Rớt mạng hoặc mất kết nối giữa chừng khi đang làm bài hoặc đang đấu 1vs1: Trạng thái cục bộ phải được bảo toàn, không làm mất xu/sao trẻ vừa kiếm được.
- Đạt 0/5 câu trong trận Đấu Boss: Không hiển thị chữ "Thất bại" hay "Game Over"; hiển thị Mascot động viên bé luyện tập thêm và cho phép thử lại ngay.
- Kích thước hiển thị trên các màn hình nhỏ (iPad Mini, tablet 8 inch): Các nút bấm tối thiểu 48x48px để ngón tay trẻ nhỏ dễ thao tác chính xác.

---

### Task 1: Khởi tạo Project Workspace & Quy chuẩn Kỹ thuật Superpowers

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `tailwind.config.ts`
- Create: `vitest.config.ts`
- Create: `AGENTS.md`
- Test: `tests/setup.test.ts`

**Interfaces:**
- Consumes: None
- Produces: Project build script (`npm run build`), Test runner (`npm test`), Vitest testing environment.

- [ ] **Step 1: Write the failing test**

```typescript
// tests/setup.test.ts
import { describe, it, expect } from 'vitest';

describe('Project Workspace Setup', () => {
  it('should have a working TypeScript and Vitest environment', () => {
    const sum = (a: number, b: number) => a + b;
    expect(sum(2, 3)).toBe(5);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/setup.test.ts`
Expected: FAIL (lệnh vitest chưa cài đặt hoặc test không chạy được)

- [ ] **Step 3: Setup Next.js, TypeScript, Tailwind, Vitest và tạo AGENTS.md**

Thiết lập `package.json` với Next.js, React, Tailwind CSS, Vitest, `@testing-library/react`. Cấu hình `vitest.config.ts`. Tạo `AGENTS.md` ghi nhận hướng dẫn Superpowers cho dự án.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/setup.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add package.json tsconfig.json vitest.config.ts AGENTS.md tests/setup.test.ts
git commit -m "chore: setup project foundation with vitest, typescript, tailwind and superpowers rules"
```

---

### Task 2: Core Domain Models & Grade 1 Math Seed Data Loader

**Files:**
- Create: `src/types/curriculum.ts`
- Create: `src/types/progress.ts`
- Create: `src/data/seed/grade1-math.json`
- Create: `src/lib/curriculum-loader.ts`
- Test: `tests/unit/curriculum-loader.test.ts`

**Interfaces:**
- Consumes: None
- Produces: 
  - `Question`: Type đại diện cho câu hỏi tương tác (MULTIPLE_CHOICE, DRAG_DROP, COUNTING).
  - `Chapter`, `Stage`: Cấu trúc ải học và bài học.
  - `loadGrade1MathData(): Curriculum`: Hàm nạp và validate dữ liệu bài học Toán Lớp 1 từ JSON seed.

- [ ] **Step 1: Write the failing test**

```typescript
// tests/unit/curriculum-loader.test.ts
import { describe, it, expect } from 'vitest';
import { loadGrade1MathData } from '@/lib/curriculum-loader';

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
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/unit/curriculum-loader.test.ts`
Expected: FAIL with "loadGrade1MathData not defined"

- [ ] **Step 3: Implement domain types, seed data and loader**

Tạo `src/types/curriculum.ts` với đầy đủ schema. Tạo `src/data/seed/grade1-math.json` chứa 2 chương: "Thung lũng Số đếm (1-10)" và "Rừng Phép cộng phạm vi 10" kèm ải Boss. Viết `loadGrade1MathData()` parse và trả về dữ liệu.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/unit/curriculum-loader.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/types/curriculum.ts src/types/progress.ts src/data/seed/grade1-math.json src/lib/curriculum-loader.ts tests/unit/curriculum-loader.test.ts
git commit -m "feat: implement domain types and grade 1 math seed data loader"
```

---

### Task 3: Audio & Sound FX Controller Service

**Files:**
- Create: `src/lib/audio-manager.ts`
- Test: `tests/unit/audio-manager.test.ts`

**Interfaces:**
- Consumes: None
- Produces: 
  - `AudioManager`: Quản lý phát âm thanh hiệu ứng (sfx: `correct`, `wrong`, `cheer`, `pop`) và phát giọng đọc prompt (`playVoice(url)`).
  - Hỗ trợ mute/unmute, debounce chống bấm đè lặp âm thanh.

- [ ] **Step 1: Write the failing test**

```typescript
// tests/unit/audio-manager.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AudioManager } from '@/lib/audio-manager';

describe('AudioManager', () => {
  let audioManager: AudioManager;

  beforeEach(() => {
    audioManager = new AudioManager();
  });

  it('should trigger play sound effect when not muted', () => {
    const playMock = vi.fn();
    audioManager.setAudioDriver({ play: playMock });
    
    audioManager.playSfx('correct');
    expect(playMock).toHaveBeenCalledWith('correct');
  });

  it('should not play sound effect when muted', () => {
    const playMock = vi.fn();
    audioManager.setAudioDriver({ play: playMock });
    
    audioManager.setMuted(true);
    audioManager.playSfx('correct');
    expect(playMock).not.toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/unit/audio-manager.test.ts`
Expected: FAIL with "AudioManager not defined"

- [ ] **Step 3: Implement AudioManager with sound driver abstraction**

Viết `AudioManager` trong `src/lib/audio-manager.ts`. Hỗ trợ đăng ký driver thực tế (Web Audio / HTMLAudio) và mock driver cho unit tests.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/unit/audio-manager.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/lib/audio-manager.ts tests/unit/audio-manager.test.ts
git commit -m "feat: add audio manager and sfx controller with mute and driver support"
```

---

### Task 4: Interactive Question Engine (Counting & Drag-Drop Widgets)

**Files:**
- Create: `src/components/learning/AudioPromptButton.tsx`
- Create: `src/components/learning/CountingQuestionWidget.tsx`
- Create: `src/components/learning/DragDropMathWidget.tsx`
- Create: `src/components/learning/QuestionPresenter.tsx`
- Test: `tests/unit/question-widgets.test.tsx`

**Interfaces:**
- Consumes: `Question` từ `src/types/curriculum.ts`, `AudioManager` từ `src/lib/audio-manager.ts`
- Produces: 
  - `<QuestionPresenter question={q} onAnswer={(isCorrect) => void} />`
  - Render câu hỏi đếm quả táo kéo vào giỏ hoặc chọn số thẻ bài trực quan.

- [ ] **Step 1: Write the failing test**

```typescript
// tests/unit/question-widgets.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { QuestionPresenter } from '@/components/learning/QuestionPresenter';
import { Question } from '@/types/curriculum';

describe('QuestionPresenter', () => {
  const sampleQuestion: Question = {
    id: 'q1',
    type: 'MULTIPLE_CHOICE',
    promptText: 'Có bao nhiêu quả táo trong tranh?',
    promptAudioUrl: '/audio/test.mp3',
    options: [
      { id: 'opt1', text: '2', isCorrect: false },
      { id: 'opt2', text: '3', isCorrect: true }
    ],
    rewardCoins: 5,
    rewardExp: 10
  };

  it('renders prompt text, audio button, and handles correct answer selection', () => {
    const onAnswerMock = vi.fn();
    render(<QuestionPresenter question={sampleQuestion} onAnswer={onAnswerMock} />);

    expect(screen.getByText('Có bao nhiêu quả táo trong tranh?')).toBeDefined();
    
    const correctBtn = screen.getByText('3');
    fireEvent.click(correctBtn);

    expect(onAnswerMock).toHaveBeenCalledWith(true, sampleQuestion);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/unit/question-widgets.test.tsx`
Expected: FAIL with "QuestionPresenter not defined"

- [ ] **Step 3: Implement QuestionPresenter and widgets**

Viết `AudioPromptButton`, `CountingQuestionWidget` và `QuestionPresenter`. Hỗ trợ giao diện to rõ, hiệu ứng nút bấm thân thiện cho trẻ nhỏ.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/unit/question-widgets.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/learning/ tests/unit/question-widgets.test.tsx
git commit -m "feat: implement interactive question presenter and counting widgets"
```

---

### Task 5: Adventure Map & Stage Progression Store

**Files:**
- Create: `src/store/useProgressStore.ts`
- Create: `src/components/map/AdventureMap.tsx`
- Create: `src/components/map/StageNode.tsx`
- Test: `tests/unit/progress-store.test.ts`
- Test: `tests/unit/adventure-map.test.tsx`

**Interfaces:**
- Consumes: `Curriculum`, `Stage` từ `src/types/curriculum.ts`
- Produces: 
  - `useProgressStore`: Zustand store quản lý các ải đã mở khóa, số sao đạt được (1-3 sao), tổng Xu và EXP của học sinh.
  - `<AdventureMap curriculum={data} onSelectStage={(stageId) => void} />` hiển thị con đường phiêu lưu uốn lượn với các ải.

- [ ] **Step 1: Write the failing test**

```typescript
// tests/unit/progress-store.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { useProgressStore } from '@/store/useProgressStore';

describe('Progress Store', () => {
  beforeEach(() => {
    useProgressStore.getState().reset();
  });

  it('should complete a stage, award stars/coins/exp and unlock next stage', () => {
    const store = useProgressStore.getState();
    expect(store.isStageUnlocked('stage_1')).toBe(true);
    expect(store.isStageUnlocked('stage_2')).toBe(false);

    store.completeStage('stage_1', { stars: 3, earnedCoins: 15, earnedExp: 30 });

    const updated = useProgressStore.getState();
    expect(updated.getStageStars('stage_1')).toBe(3);
    expect(updated.totalCoins).toBe(15);
    expect(updated.totalExp).toBe(30);
    expect(updated.isStageUnlocked('stage_2')).toBe(true);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/unit/progress-store.test.ts`
Expected: FAIL with "useProgressStore not defined"

- [ ] **Step 3: Implement useProgressStore and AdventureMap component**

Tạo store quản lý tiến trình học với logic mở khóa ải kế tiếp. Tạo UI bản đồ với các nút Ải hiển thị số sao và icon linh vật.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/unit/progress-store.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/store/useProgressStore.ts src/components/map/ tests/unit/progress-store.test.ts
git commit -m "feat: implement stage progression store and interactive adventure map"
```

---

### Task 6: Boss Battle Module (Chương Đấu Boss Cuối Vùng)

**Files:**
- Create: `src/components/boss/BossBattleScreen.tsx`
- Create: `src/components/boss/BossHealthBar.tsx`
- Test: `tests/unit/boss-battle.test.tsx`

**Interfaces:**
- Consumes: `Stage` (loại BOSS), `AudioManager`
- Produces: 
  - `<BossBattleScreen stage={bossStage} onVictory={() => void} />`
  - Quản lý thanh máu của Boss (giảm khi trả lời đúng), hoạt ảnh tấn công bằng toán học và mở Rương báu.

- [ ] **Step 1: Write the failing test**

```typescript
// tests/unit/boss-battle.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { BossBattleScreen } from '@/components/boss/BossBattleScreen';

describe('BossBattleScreen', () => {
  const bossStage = {
    id: 'boss_c1',
    name: 'Quái Vật Kẹo Ngọt',
    isBoss: true,
    bossMaxHp: 3,
    questions: [
      { id: 'bq1', type: 'MULTIPLE_CHOICE', promptText: '3 + 2 = ?', options: [{ id: 'o1', text: '5', isCorrect: true }] }
    ]
  };

  it('reduces boss hp when a correct answer is chosen', () => {
    const onVictoryMock = vi.fn();
    render(<BossBattleScreen stage={bossStage as any} onVictory={onVictoryMock} />);

    expect(screen.getByText('Quái Vật Kẹo Ngọt')).toBeDefined();
    const correctBtn = screen.getByText('5');
    fireEvent.click(correctBtn);

    // Máu boss giảm và cập nhật trạng thái
    expect(screen.getByTestId('boss-hp-bar')).toBeDefined();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/unit/boss-battle.test.tsx`
Expected: FAIL with "BossBattleScreen not defined"

- [ ] **Step 3: Implement BossBattleScreen & HealthBar**

Xây dựng màn hình trận chiến Boss vui nhộn, không gây áp lực điểm số, có hiệu ứng nạp năng lượng phóng phép khi giải đúng toán.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/unit/boss-battle.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/boss/ tests/unit/boss-battle.test.tsx
git commit -m "feat: implement joyful boss battle challenge with health bar and animations"
```

---

### Task 7: Mascot & Avatar Room (Nhà của Bé)

**Files:**
- Create: `src/components/avatar/AvatarRoom.tsx`
- Create: `src/types/inventory.ts`
- Create: `src/data/seed/shop-items.json`
- Test: `tests/unit/avatar-room.test.tsx`

**Interfaces:**
- Consumes: `useProgressStore` (totalCoins)
- Produces: 
  - `<AvatarRoom />`: Nơi hiển thị nhân vật đại diện, linh vật Cú Mèo, danh sách vật phẩm (mũ hiệp sĩ, áo choàng) có thể dùng Xu vàng mua và trang bị.

- [ ] **Step 1: Write the failing test**

```typescript
// tests/unit/avatar-room.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { AvatarRoom } from '@/components/avatar/AvatarRoom';
import { useProgressStore } from '@/store/useProgressStore';

describe('AvatarRoom', () => {
  it('allows child to purchase item if they have enough coins', () => {
    useProgressStore.setState({ totalCoins: 50, inventory: [] });
    render(<AvatarRoom />);

    const buyBtn = screen.getByTestId('buy-item-hat_knight');
    fireEvent.click(buyBtn);

    expect(useProgressStore.getState().inventory).toContain('hat_knight');
    expect(useProgressStore.getState().totalCoins).toBeLessThan(50);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/unit/avatar-room.test.tsx`
Expected: FAIL with "AvatarRoom not defined"

- [ ] **Step 3: Implement AvatarRoom and shop catalog**

Xây dựng giao diện Nhà của bé tươi sáng, hiển thị số xu vàng, danh sách phụ kiện và nút trang bị cho Mascot/Avatar.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/unit/avatar-room.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/avatar/ src/types/inventory.ts src/data/seed/shop-items.json tests/unit/avatar-room.test.tsx
git commit -m "feat: implement avatar and mascot room with coin shop"
```

---

### Task 8: Realtime Arena 1vs1 with Bot Fallback Engine

**Files:**
- Create: `src/lib/arena-matchmaker.ts`
- Create: `src/components/arena/ArenaMatchScreen.tsx`
- Test: `tests/unit/arena-matchmaker.test.ts`
- Test: `tests/unit/arena-screen.test.tsx`

**Interfaces:**
- Consumes: `Question` từ curriculum
- Produces: 
  - `ArenaMatchmaker`: Bộ ghép trận 1vs1. Nếu sau 10s không có người chơi thật -> tự động spawn Bot Runner với độ trễ phản hồi ngẫu nhiên (4-7s/câu).
  - `<ArenaMatchScreen />`: Màn hình đường đua 2 làn hiển thị tiến trình của Bé và Đối thủ.

- [ ] **Step 1: Write the failing test**

```typescript
// tests/unit/arena-matchmaker.test.ts
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ArenaMatchmaker } from '@/lib/arena-matchmaker';

describe('ArenaMatchmaker', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('should fallback to Bot opponent if no match found within 10 seconds', () => {
    const matchmaker = new ArenaMatchmaker();
    const onMatchFound = vi.fn();

    matchmaker.startSearch({ playerId: 'p1', playerName: 'Bé Na', grade: 1 }, onMatchFound);

    // Chưa đủ 10s: chưa ghép bot
    vi.advanceTimersByTime(5000);
    expect(onMatchFound).not.toHaveBeenCalled();

    // Vượt mốc 10s: tự động ghép bot
    vi.advanceTimersByTime(5100);
    expect(onMatchFound).toHaveBeenCalled();
    const match = onMatchFound.mock.calls[0][0];
    expect(match.opponent.isBot).toBe(true);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/unit/arena-matchmaker.test.ts`
Expected: FAIL with "ArenaMatchmaker not defined"

- [ ] **Step 3: Implement ArenaMatchmaker and ArenaMatchScreen**

Viết `ArenaMatchmaker` với timer 10s fallback và thuật toán mô phỏng tiến độ của Bot. Xây dựng UI đường đua hai làn rực rỡ với bảng xếp hạng sau trận đấu.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/unit/arena-matchmaker.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/lib/arena-matchmaker.ts src/components/arena/ tests/unit/arena-matchmaker.test.ts tests/unit/arena-screen.test.tsx
git commit -m "feat: implement 1vs1 arena matchmaker with 10s bot fallback and race track UI"
```

---

### Task 9: Family Portal & Main Navigation Integration

**Files:**
- Create: `src/components/parent/ParentalGateModal.tsx`
- Create: `src/components/navigation/MainHeader.tsx`
- Create: `src/app/page.tsx`
- Create: `src/app/layout.tsx`
- Test: `tests/integration/main-flow.test.tsx`

**Interfaces:**
- Consumes: Mọi component từ các Task 1-8.
- Produces: Ứng dụng Web hoàn chỉnh tích hợp luồng: Đăng nhập Profile -> Bản đồ học tập -> Học bài -> Đấu Boss -> Vào Đấu trường -> Vào Nhà bé -> Cổng phụ huynh.

- [ ] **Step 1: Write the failing test**

```typescript
// tests/integration/main-flow.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import HomePage from '@/app/page';

describe('Full Learning Platform Integration', () => {
  it('renders main navigation tabs and adventure map for Grade 1 Math', () => {
    render(<HomePage />);
    expect(screen.getByText(/Thung lũng Số đếm/i)).toBeDefined();
    expect(screen.getByTestId('nav-adventure-map')).toBeDefined();
    expect(screen.getByTestId('nav-arena')).toBeDefined();
    expect(screen.getByTestId('nav-avatar-room')).toBeDefined();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/integration/main-flow.test.tsx`
Expected: FAIL with "HomePage not found or missing navigation"

- [ ] **Step 3: Implement HomePage, MainHeader and ParentalGateModal**

Ghép nối toàn bộ hệ thống vào `src/app/page.tsx` với navigation bar ngộ nghĩnh (Bản đồ, Đấu trường, Nhà bé, Góc phụ huynh có câu đố người lớn bảo vệ).

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/integration/main-flow.test.tsx`
Expected: PASS

- [x] **Step 5: Commit**

```bash
git add src/components/parent/ src/components/navigation/ src/app/ tests/integration/main-flow.test.tsx
git commit -m "feat: integrate main application navigation, home page and parental gate"
```

---

### Task 10: Nâng Cấp Giao Diện 3D Cartoon Bouncy & Bố Cục 3 Cột (UI/UX Refinement)

**Files:**
- Create: `src/components/dashboard/CompanionSidebar.tsx`
- Create: `src/components/dashboard/ActivitiesSidebar.tsx`
- Modify: `src/components/navigation/MainHeader.tsx` (React createPortal & viewport-safe modal)
- Modify: `src/components/parent/ParentalGateModal.tsx` (viewport-safe modal)
- Modify: `src/app/page.tsx` (Tích hợp bố cục 3 cột cho bản đồ)
- Test: `tests/unit/companion-sidebar.test.tsx`
- Test: `tests/unit/activities-sidebar.test.tsx`

**Interfaces:**
- Consumes: `useProgressStore` (totalExp, totalStars, unlockedStages, addRewards), `defaultAudioManager`, `ChildProfile`.
- Produces: 3-column layout trên màn hình máy tính/tablet, bạn đồng hành Cú Mèo tương tác, nhiệm vụ ngày nhận xu, rương may mắn và bảng vinh danh bạn bè.

- [x] **Step 1: Write the failing tests**
  - Viết `tests/unit/companion-sidebar.test.tsx` kiểm thử hiển thị linh vật Cú Mèo, bong bóng hội thoại, click đổi câu thoại + phát audio, thẻ cấp độ EXP.
  - Viết `tests/unit/activities-sidebar.test.tsx` kiểm thử hiển thị thẻ nhiệm vụ ngày, nhận thưởng xu, mở rương may mắn, bảng xếp hạng bạn bè.

- [x] **Step 2: Run tests to verify they fail**
  - Chạy `npx vitest run tests/unit/companion-sidebar.test.tsx tests/unit/activities-sidebar.test.tsx` -> Xác nhận FAIL (component chưa tồn tại).

- [x] **Step 3: Implement CompanionSidebar and ActivitiesSidebar**
  - Xây dựng `CompanionSidebar.tsx` với linh vật nhún nhảy, bong bóng thoại, thanh tiến độ kinh nghiệm EXP theo cấp độ.
  - Xây dựng `ActivitiesSidebar.tsx` với danh sách nhiệm vụ có thanh tiến trình, nút nhận thưởng xu nảy 3D, rương kho báu mở nhận xu bất ngờ và bảng xếp hạng tuần.

- [x] **Step 4: Integrate 3-Column Layout into HomePage & Fix Viewport Clipping**
  - Ghép 2 thanh bên vào `src/app/page.tsx` xung quanh bản đồ học tập trên desktop/tablet.
  - Khắc phục lỗi Containing Block do `backdrop-blur-md` trên Header bằng cách đưa `profile-switcher-modal` sang `createPortal(..., document.body)`.
  - Tích hợp `max-h-[85vh]` và `overflow-y-auto` đảm bảo đỉnh modal không bao giờ bị cắt cụt.

- [x] **Step 5: Run all tests to verify they pass**
  - Chạy `npm test` -> Xác nhận toàn bộ 13 test files (75/75 tests) PASS.

- [x] **Step 6: Commit**
  - Commit mã nguồn: `180d013` (feat: 3-column layout) và `6082d52` (fix: portal modals).

---

### Task 11: Xác Thực Tài Khoản Phụ Huynh & Đăng Nhập Google (Parent Auth & Google Sign-In)

**Files:**
- Create: `src/types/auth.ts`
- Create: `src/store/useAuthStore.ts`
- Create: `src/components/auth/AuthModal.tsx`
- Modify: `src/components/navigation/MainHeader.tsx`
- Modify: `src/app/page.tsx`
- Test: `tests/unit/auth-store.test.ts`
- Test: `tests/unit/auth-modal.test.tsx`
- Test: `tests/integration/auth-flow.test.tsx`

**Interfaces:**
- Consumes: `useAuthStore`, `defaultAudioManager`, React `createPortal`.
- Produces: Modal đăng nhập / đăng ký tài khoản phụ huynh với 1-Click Google Sign-In, Email/Password validation, session management, và avatar phụ huynh trên thanh điều hướng.

- [x] **Step 1: Write types & failing tests**
  - Khởi tạo `src/types/auth.ts`.
  - Viết `tests/unit/auth-store.test.ts` kiểm thử các action: `loginWithEmail`, `registerWithEmail`, `loginWithGoogle`, `logout`, `guestMode`.
  - Viết `tests/unit/auth-modal.test.tsx` kiểm thử form đăng nhập/đăng ký, nút Google, validate lỗi email/mật khẩu, đóng mở modal.
  - Viết `tests/integration/auth-flow.test.tsx` kiểm thử luồng từ nút đăng nhập trên Header -> đăng nhập thành công -> hiển thị thông tin phụ huynh và menu đăng xuất.

- [x] **Step 2: Run tests to verify they fail**
  - Chạy `npx vitest run tests/unit/auth-store.test.ts tests/unit/auth-modal.test.tsx tests/integration/auth-flow.test.tsx` -> Xác nhận FAIL.

- [x] **Step 3: Implement useAuthStore & AuthModal**
  - Xây dựng `src/store/useAuthStore.ts` với Zustand persist an toàn trong localStorage.
  - Xây dựng `src/components/auth/AuthModal.tsx` với 3D Cartoon Bouncy UI, Google Sign-In button, Email/Pass tabs, React `createPortal` và viewport-safe styling.

- [x] **Step 4: Integrate into MainHeader & HomePage**
  - Bổ sung nút Đăng Nhập / Profile phụ huynh trên `MainHeader.tsx`.
  - Kết nối trạng thái mở modal và đồng bộ với các thao tác của phụ huynh.

- [x] **Step 5: Run all tests to verify they pass**
  - Chạy `npm test` xác nhận toàn bộ test suites PASS.

- [x] **Step 6: Commit**
  - Commit mã nguồn với Conventional Commits `feat(auth): add parent authentication with email and google sign-in`.

---

### Task 12: Tích Hợp Google Identity Services (GSI) API & Luồng Onboarding Tạo Hồ Sơ Bé Mới

**Files:**
- Create: `src/components/profile/CreateChildModal.tsx`
- Create: `.env.example`
- Modify: `src/store/useAuthStore.ts` (Tài khoản mới tạo khởi đầu với `children: []`)
- Modify: `src/components/auth/AuthModal.tsx` (GSI Client SDK integration)
- Modify: `src/components/navigation/MainHeader.tsx` (Nút "➕ Thêm bé mới" & trigger Onboarding khi chưa có con)
- Modify: `src/app/page.tsx`
- Test: `tests/unit/create-child-modal.test.tsx`
- Test: `tests/integration/onboarding-flow.test.tsx`

**Interfaces:**
- Consumes: Google Identity Services SDK (`https://accounts.google.com/gsi/client`), `useAuthStore` (`addChildProfile`, `user.children`).
- Produces: Luồng Onboarding tự động mở khi phụ huynh mới đăng ký; giao diện chọn avatar linh vật, chọn mã PIN 4 hình vẽ; hỗ trợ kết nối Google Client ID chính thức qua `.env.local`.

- [ ] **Step 1: Write failing tests**
  - Viết `tests/unit/create-child-modal.test.tsx` kiểm thử form tạo hồ sơ bé (tên bé, chọn avatar linh vật, chọn 4 mã PIN hình vẽ, submit).
  - Viết `tests/integration/onboarding-flow.test.tsx` kiểm thử luồng phụ huynh mới tạo tài khoản -> tự động mở `CreateChildModal` -> tạo bé xong thì hiển thị bé vừa tạo lên Header.

- [ ] **Step 2: Run tests to verify they fail**
  - Chạy `npx vitest run tests/unit/create-child-modal.test.tsx tests/integration/onboarding-flow.test.tsx` -> Xác nhận FAIL.

- [ ] **Step 3: Implement CreateChildModal & update useAuthStore**
  - Đảm bảo tài khoản mới tạo (Google hoặc Email) khởi đầu với `children: []`.
  - Xây dựng `CreateChildModal.tsx` với giao diện 3D Cartoon Bouncy, bộ sưu tập avatar linh vật (🦁, 🐰, 🐼, 🐯, 🐱, 🦉), bảng chọn 4 mã PIN hình vẽ trực quan cho trẻ Lớp 1.
  - Tích hợp nạp script Google GSI (`https://accounts.google.com/gsi/client`) và tạo `.env.example`.

- [ ] **Step 4: Integrate into MainHeader & HomePage**
  - Bổ sung nút "➕ Thêm bé mới" vào danh sách hồ sơ phụ huynh.
  - Tự động kích hoạt `CreateChildModal` khi phụ huynh đăng nhập lần đầu mà chưa có bé nào.

- [ ] **Step 5: Run all tests to verify they pass**
  - Chạy `npm test` xác nhận toàn bộ test suites PASS.

- [ ] **Step 6: Commit**
  - Commit mã nguồn với Conventional Commits `feat(auth): integrate Google GSI API and child onboarding profile creation`.

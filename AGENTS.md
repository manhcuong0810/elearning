# Hướng Dẫn & Quy Chuẩn Dự Án (Superpowers AGENTS.md)

Dự án: **Grade 1 Math Gamified E-Learning Platform MVP**
Mục tiêu: Nền tảng học tập & ôn luyện game hóa môn Toán lớp 1 với trải nghiệm đa giác quan (âm thanh, kéo thả, đấu Boss, đấu trường 1vs1 kèm Bot, nhà linh vật).

---

## 1. Công Nghệ & Kiến Trúc (Tech Stack)

- **Framework**: Next.js (App Router), React 19, TypeScript
- **Styling**: Tailwind CSS (bảng màu thân thiện với trẻ em: `kid-yellow`, `kid-blue`, `kid-green`, v.v.)
- **Animations**: Framer Motion (hiệu ứng chuyển động mượt mà, trực quan)
- **Audio Service**: Howler.js / Web Audio API (âm thanh hiệu ứng click, đúng/sai, nhạc nền, giọng đọc đề bài)
- **State Management**: Zustand (`useProgressStore` quản lý tiến độ, sao, xu, trang bị)
- **Testing**: Vitest, React Testing Library, JSDOM

---

## 2. Quy Chuẩn Kỹ Thuật Bắt Buộc (Global Constraints)

1. **Giao diện dành riêng cho trẻ Lớp 1**:
   - Mọi câu hỏi phải có nút loa âm thanh (`promptAudioUrl`) kích thước tối thiểu 48x48px để ngón tay trẻ nhỏ dễ bấm.
   - Thao tác kéo thả (Drag & Drop) phải hỗ trợ đồng thời cả Touch (iPad/Tablet) lẫn Mouse (máy tính để bàn).
   - Khi kéo vật thể ra ngoài khu vực thả hợp lệ: vật thể phải tự động bay về vị trí ban đầu với hiệu ứng mượt mà, không bị kẹt hay mất hình.
   - Không sử dụng thuật ngữ kỹ thuật khó hiểu; ngôn từ luôn mang tính khích lệ, tươi sáng và thân thiện.
   - Đạt 0/5 câu trong trận Boss: Tuyệt đối không hiện chữ "Thất bại" hay "Game Over"; thay vào đó linh vật động viên bé luyện tập thêm và cho phép thử lại.

2. **Chế độ Đấu trường (Arena 1vs1)**:
   - Thời gian tìm kiếm đối thủ tối đa 10 giây. Nếu không có người chơi thật ghép cặp, tự động chuyển sang Bot mô phỏng với hành vi trả lời tự nhiên.
   - Trạng thái rớt mạng hoặc ngắt kết nối cục bộ: Lưu trữ và bảo toàn điểm/sao/xu của học sinh an toàn trong Local Storage / Store.

3. **Cấu trúc Thư mục & Path Alias**:
   - Sử dụng alias `@/*` ánh xạ tới `./src/*` trong toàn bộ import TypeScript.
   - `src/types/`: Khai báo TypeScript types & interfaces.
   - `src/data/seed/`: Dữ liệu seed JSON bài học, ải, câu hỏi.
   - `src/lib/`: Logic nghiệp vụ thuần (Curriculum loader, Audio manager, Arena matchmaker).
   - `src/store/`: Quản lý state toàn cục (Zustand).
   - `src/components/`: UI components phân chia theo tính năng (learning, boss, arena, avatar, shared).
   - `tests/`: Bộ test tương ứng theo TDD.

---

## 3. Quy Trình Phát Triển Superpowers (Superpowers Process)

Mỗi Agent khi nhận Task thực hiện theo chu trình nghiêm ngặt:
1. **Test-Driven Development (TDD)**:
   - Bước 1: Viết test trước trong `tests/` mô tả đúng yêu cầu task.
   - Bước 2: Chạy test và xác nhận test FAIL.
   - Bước 3: Triển khai mã nguồn tối thiểu để đáp ứng yêu cầu.
   - Bước 4: Chạy test và xác nhận test PASS.
2. **Quy Tắc Clean Code & Type Safety**:
   - TypeScript `strict: true`, không dùng `any` bừa bãi.
   - Đảm bảo `npm test` và `npm run build` không phát sinh lỗi hoặc cảnh báo nghiêm trọng.
3. **Commit & Báo Cáo**:
   - Thực hiện commit với git message rõ ràng, đúng chuẩn Conventional Commits (`feat:`, `test:`, `chore:`, `fix:`).
   - Cung cấp báo cáo task đầy đủ (`task-X-report.md`) trước khi kết thúc.

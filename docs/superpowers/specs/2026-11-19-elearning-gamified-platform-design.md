# Thiết Kế Hệ Thống: Nền Tảng Học Tập & Kiểm Tra Game Hóa Tiểu Học (Toán - Tiếng Việt - Tiếng Anh)

- **Ngày tạo**: 2026-11-19
- **Trạng thái**: Bản thảo (Draft - Đang chờ Builder Check & Phê duyệt)
- **Tác giả**: Antigravity & Đối tác phát triển

---

## 1. Bối cảnh & Mục đích (Intent & The Why)

Học sinh lứa tuổi tiểu học (6 - 11 tuổi, từ lớp 1 đến lớp 5) có khả năng tập trung ngắn (5 - 15 phút), phụ thuộc nhiều vào yếu tố nghe - nhìn sinh động và phản hồi tích cực. Các bài học và đề kiểm tra văn bản truyền thống thường gây tâm lý nhàm chán, áp lực và thiếu hào hứng.

Mục tiêu của dự án là xây dựng một nền tảng Web E-Learning sinh động, lồng ghép cơ chế **Trò chơi hóa (Gamification)** vào quá trình học tập và làm bài kiểm tra 3 môn học nòng cốt: **Toán**, **Tiếng Việt**, và **Tiếng Anh**. Hệ thống giúp các em "chơi mà học, học mà chơi", hình thành thói quen rèn luyện tự giác mỗi ngày.

---

## 2. Mục tiêu, Giới hạn & Chống mục tiêu (Goals, Non-Goals, Anti-Goals)

### 2.1. Mục tiêu (Goals)
- **Học tập đa phương tiện**: Hỗ trợ đầy đủ âm thanh giọng đọc (Text-to-Speech / Audio thu âm) đặc biệt cho học sinh lớp 1 - 2, hình ảnh minh họa sinh động, câu hỏi dạng kéo-thả, nối thẻ, ghép chữ, trắc nghiệm trực quan.
- **Mô hình trải nghiệm "3 trong 1" thống nhất**:
  1. *Bản đồ Phiêu lưu (Adventure Map)* cho việc học và luyện tập hàng ngày.
  2. *Trận chiến Đấu Boss (Boss Battle)* cho việc kiểm tra, đánh giá định kỳ cuối chương mà không gây áp lực điểm số.
  3. *Đấu trường Tri thức (Arena)* cho các cuộc so tài tốc độ trực tiếp (1vs1, giải đấu tuần) kích thích thi đua lành mạnh.
- **Hệ thống Động lực & Tùy biến (Avatars & Mascots)**: Trẻ dùng Xu/Sao tích lũy khi học để nuôi thú cưng, đổi trang phục hiệp sĩ.
- **Báo cáo Tiến độ cho Phụ huynh / Giáo viên**: Theo dõi chi tiết thời gian học, mức độ hoàn thành bài tập, phân tích kỹ năng mạnh/yếu của từng bé.

### 2.2. Không thuộc phạm vi ban đầu (Non-Goals)
- Không biến nền tảng thành một game 3D/RPG đồ họa nặng nề làm loãng mục tiêu học tập hoặc đòi hỏi cấu hình máy tính/thiết bị đắt tiền.
- Không xây dựng tính năng mạng xã hội trò chuyện tự do (Chat box) giữa các học sinh để đảm bảo an toàn tuyệt đối cho trẻ nhỏ (chỉ cho phép các emote/biểu cảm cảm xúc vui vẻ định sẵn).
- Chưa tích hợp chấm điểm bài tập tự luận văn viết dài (giai đoạn đầu tập trung vào trắc nghiệm tương tác, nghe nhìn, nối từ, điền từ khuyết).

### 2.3. Chống mục tiêu (Anti-Goals - Điều gì sẽ khiến dự án thất bại dù chạy được)
- **Giao diện người lớn, khô khan**: Nhiều chữ, form nhập liệu truyền thống, thiếu âm thanh và animation phản hồi.
- **Áp lực thi cử tiêu cực**: Bảng xếp hạng tạo cảm giác trừng phạt người điểm thấp; trận đấu Boss làm bé sợ hãi hoặc bỏ cuộc khi trả lời sai (thay vào đó phải có gợi ý và cổ vũ bé làm lại).
- **Tải chậm hoặc khó dùng trên iPad/Tablet**: Trẻ em thường dùng máy tính bảng; giao diện phải tối ưu chạm (touch-friendly) và tải nhanh.

---

## 3. Các hướng tiếp cận & Phân tích lựa chọn (Approaches Considered)

Trong quá trình định hình dự án, 3 hướng tiếp cận đã được khảo sát:

1. **Hướng 1: Gamified Adventure Map (Bản đồ thám hiểm tri thức - phong cách Duolingo / Khan Kids)**
   - *Ưu điểm*: Cân bằng tối ưu giữa tính giáo dục và giải trí, phù hợp dài hạn cho cả 3 môn, lộ trình rõ ràng.
   - *Nhược điểm*: Thiếu tính đối kháng kịch tính nếu trẻ muốn thi đấu cùng bạn bè.
2. **Hướng 2: Interactive Quiz & Arena (Đấu trường thi đấu - phong cách Kahoot / Trạng Nguyên)**
   - *Ưu điểm*: Kích thích tinh thần thi đua cao, phù hợp ôn luyện đề thi.
   - *Nhược điểm*: Gây áp lực lớn cho học sinh nhỏ tuổi (lớp 1 - 2), thiếu tính sư phạm dẫn dắt từng bước.
3. **Hướng 3: Full Mini-Game RPG (Game nhập vai học tập - phong cách Prodigy Math)**
   - *Ưu điểm*: Trẻ vô cùng yêu thích.
   - *Nhược điểm*: Chi phí sản xuất đồ họa game rất cao, phụ huynh e ngại con nghiện chơi game.

### Quyết định kiến trúc: Kết hợp hài hòa cả 3 hướng (Hybrid Core Loop)
Hệ thống sử dụng **Bản đồ Phiêu lưu** làm trục học tập cốt lõi (Campaign Mode), tích hợp **Đấu Boss bằng tri thức** ở cuối mỗi chương thay cho bài kiểm tra khô khan, và mở cổng **Đấu trường Tri thức (Arena)** cho các hoạt động thi đấu giao hữu cuối tuần.

---

## 4. Đặc tả trải nghiệm người dùng & Cơ chế Gamification (UX & Mechanics)

### 4.1. Bản đồ Thám hiểm (Adventure Map)
- Phân chia thế giới theo khối lớp (Lớp 1 đến Lớp 5) và theo 3 môn:
  - 🏝️ **Đảo Toán học**: Xứ sở Số đếm, Rừng Phép cộng/trừ, Thung lũng Hình học, Lâu đài Phép nhân/chia.
  - 🌳 **Rừng Tiếng Việt**: Vườn Bảng chữ cái, Vùng đất Ghép vần, Dòng sông Chính tả, Ngọn đồi Đọc hiểu.
  - 🏰 **Vương quốc Tiếng Anh**: Đảo Từ vựng Động vật, Làng Gia đình, Thành phố Ngữ pháp vui nhộn.
- Mỗi ải học tương ứng 1 bài học 5 - 7 phút:
  - 5 - 7 câu hỏi tương tác.
  - Mỗi câu hỏi có: Nút Loa (nghe giọng đọc), Hình ảnh minh họa vector sắc nét, Phản hồi âm thanh (ting ting vui nhộn khi đúng, tiếng động viên nhẹ nhàng khi sai).
  - Vượt ải đạt 1 - 3 Sao, thưởng Xu vàng và Điểm kinh nghiệm (EXP).

### 4.2. Trận chiến Đấu Boss (Boss Battle - Kiểm tra hết chương)
- Xuất hiện ở cuối mỗi chương kiến thức (Checkpoint).
- Hình ảnh "Boss" thân thiện, ngộ nghĩnh (Vua Băng Giá, Quái vật Kẹo Ngọt,...).
- Thanh máu Boss (Boss HP) giảm dần mỗi khi bé trả lời đúng 1 câu hỏi kiến thức tổng hợp. Nếu bé làm sai, Boss tung chiêu vui nhộn (như làm đóng băng màn hình nhẹ) và bé được quyền thử lại với câu gợi ý.
- Đánh bại Boss giúp bé mở khóa Rương kho báu (Trang phục hiếm, Danh hiệu hiệp sĩ).

### 4.3. Đấu trường Tri thức (Arena PvP Mode)
- **Đấu 1vs1 Ngẫu nhiên / Thách đấu bạn bè**: 2 bé cùng trả lời 5 câu hỏi nhanh. Hệ thống hiển thị thanh tiến độ đua của 2 nhân vật Mascot.
- **Đấu trường Cuối tuần (Weekend Cup)**: Mở vào Thứ 7 - Chủ Nhật. Làm bài thi 15 phút, tính điểm trên Bảng xếp hạng tuần chia theo khối lớp.
- Quy tắc an toàn: Không hiển thị thông tin nhạy cảm của trẻ; bảng xếp hạng dùng Nickname và Avatar ngộ nghĩnh.

### 4.4. Khu vườn & Nhà của Bé (Avatar & Mascot Room)
- Bé có 1 nhân vật đại diện (Hiệp sĩ Nhí / Phù thủy Nhí) và 1 Linh vật đồng hành (Cú mèo thông thái, Rồng lửa con, Mèo con).
- Dùng Xu vàng thu được từ việc học để mua: Mũ, Áo choàng, Cây đũa phép, Thức ăn nâng cấp Linh vật.

---

## 5. Kiến trúc Kỹ thuật Đề xuất (Proposed Technical Architecture)

### 5.1. Tech Stack
- **Frontend**:
  - Framework: **Next.js (React 19)** với App Router, hỗ trợ SSR/SSG cho SEO bài học và SPA mượt mà cho trải nghiệm học tập.
  - Styling: **Tailwind CSS** + **Framer Motion** (cho các animation di chuyển, mở rương, nổ pháo hoa nhẹ nhàng).
  - Tương tác âm thanh: **Web Audio API** (âm thanh hiệu ứng sfxt, giọng đọc audio).
  - Tương tác câu hỏi: **HTML5 Drag and Drop / Touch events** (tối ưu cho iPad và máy tính bảng).
- **Backend**:
  - API Server: **Node.js (NestJS / Express)** hoặc **Python (FastAPI)** cung cấp RESTful APIs quản lý bài học, tiến độ học, tài khoản.
  - Realtime Engine: **WebSocket (Socket.io)** phục vụ Đấu trường Tri thức 1vs1 thời gian thực.
- **Database & Cache**:
  - Cơ sở dữ liệu chính: **PostgreSQL** (lưu trữ cấu trúc chương trình học, câu hỏi, tài khoản, tiến trình học sinh, lịch sử làm bài).
  - Cache & Session / Leaderboard: **Redis** (quản lý phòng đấu 1vs1, bảng xếp hạng realtime).

### 5.2. Mô hình Dữ liệu Cốt lõi (Core Data Entities)
1. `User` (Học sinh / Phụ huynh / Giáo viên / Admin).
2. `StudentProfile` (Khối lớp, EXP, Xu, Avatar/Mascot đang trang bị).
3. `Subject` (Toán, Tiếng Việt, Tiếng Anh).
4. `Grade` (Lớp 1 - 5).
5. `Chapter` (Chương học, ví dụ: Phép cộng phạm vi 10).
6. `Level` (Ải học thường hoặc Ải Boss).
7. `Question` (Loại câu hỏi: MultipleChoice, DragDrop, MatchPair, FillBlank; Media: audioUrl, imageUrl; Gợi ý).
8. `StudentProgress` (Tiến trình vượt ải, số sao, điểm số).
9. `ArenaMatch` (Lịch sử trận đấu 1vs1, điểm số, thứ hạng).

---

## 6. Lộ trình Triển khai Phân kỳ (Phased Implementation Plan)

- **Giai đoạn 1 (Core Foundation & Interactive Engine)**:
  - Khởi tạo khung dự án Web, thiết lập hệ thống quy tắc Superpowers (`AGENTS.md`).
  - Xây dựng Engine câu hỏi tương tác (Đa phương tiện: Hình ảnh, Âm thanh, Kéo thả, Chọn đáp án).
  - Thiết kế Giao diện Bản đồ Phiêu lưu (Adventure Map) mẫu cho 1 khối lớp (ví dụ: Lớp 1 - Môn Toán).
- **Giai đoạn 2 (Gamification & Boss Battles)**:
  - Hệ thống tích lũy Sao, Xu, EXP và Nhà của bé (Tùy biến Avatar).
  - Cơ chế Trận chiến Đấu Boss cuối chương.
- **Giai đoạn 3 (Đấu trường Realtime & Báo cáo Phụ huynh)**:
  - Phòng đấu 1vs1 qua WebSocket và Bảng xếp hạng.
  - Dashboard báo cáo tiến độ và kết quả cho Phụ huynh.
- **Giai đoạn 4 (Mở rộng Nội dung & Đóng gói)**:
  - Hoàn thiện ngân hàng câu hỏi đầy đủ cho cả 3 môn (Toán, TV, TA) từ Lớp 1 - 5.
  - Tối ưu hóa PWA (Progressive Web App) để cài đặt như một ứng dụng trên iPad/Tablet.

---

## 7. Những việc giao toàn quyền cho Đội ngũ Phát triển (Left to Builder)
- Lựa chọn bộ thư viện chi tiết cho animation và âm thanh miễn phí bản quyền (Sound effects / SVG graphics).
- Chi tiết cấu trúc thư mục code và thiết kế schema database chi tiết.
- Tối ưu hóa caching và nén dung lượng audio/hình ảnh để đảm bảo web tải dưới 1.5 giây trên mạng di động.

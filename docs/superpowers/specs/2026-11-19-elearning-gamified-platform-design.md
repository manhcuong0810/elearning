# Thiết Kế Hệ Thống: Nền Tảng Học Tập & Kiểm Tra Game Hóa Tiểu Học (Toán - Tiếng Việt - Tiếng Anh)

- **Ngày cập nhật**: 2026-11-19
- **Trạng thái**: Đã cập nhật theo phản hồi thẩm định (Chờ phê duyệt chính thức)
- **Tác giả**: Antigravity & Đối tác phát triển

---

## 1. Bối cảnh & Mục đích (Intent & The Why)

Học sinh lứa tuổi tiểu học (6 - 11 tuổi, từ lớp 1 đến lớp 5) có khả năng tập trung ngắn (5 - 15 phút), phụ thuộc nhiều vào yếu tố nghe - nhìn sinh động và phản hồi tích cực. Các bài học và đề kiểm tra văn bản truyền thống thường gây tâm lý nhàm chán, áp lực và thiếu hào hứng.

Mục tiêu của dự án là xây dựng một nền tảng Web E-Learning sinh động, lồng ghép cơ chế **Trò chơi hóa (Gamification)** vào quá trình học tập và làm bài kiểm tra 3 môn học nòng cốt: **Toán**, **Tiếng Việt**, và **Tiếng Anh**. Hệ thống giúp các em "chơi mà học, học mà chơi", hình thành thói quen rèn luyện tự giác mỗi ngày.

---

## 2. Mục tiêu, Giới hạn & Chống mục tiêu (Goals, Non-Goals, Anti-Goals)

### 2.1. Mục tiêu (Goals)
- **Học tập đa phương tiện**: Hỗ trợ đầy đủ âm thanh giọng đọc (Audio thu âm chuẩn) đặc biệt cho học sinh lớp 1 - 2, hình ảnh minh họa sinh động, câu hỏi dạng kéo-thả, nối thẻ, ghép số/chữ, trắc nghiệm trực quan.
- **Mô hình trải nghiệm "3 trong 1" thống nhất**:
  1. *Bản đồ Phiêu lưu (Adventure Map)* cho việc học và luyện tập hàng ngày.
  2. *Trận chiến Đấu Boss (Boss Battle)* cho việc kiểm tra, đánh giá định kỳ cuối chương mà không gây áp lực điểm số.
  3. *Đấu trường Tri thức (Arena)* cho các cuộc so tài tốc độ trực tiếp (1vs1, giải đấu tuần) kích thích thi đua lành mạnh (hỗ trợ Bot/Ghost-player khi vắng người chơi).
- **Hệ thống Động lực & Tùy biến (Avatars & Mascots)**: Trẻ dùng Xu/Sao tích lũy khi học để nuôi thú cưng, đổi trang phục hiệp sĩ.
- **Mô hình Tài khoản Gia đình (Family Account)**: Phụ huynh quản lý tài khoản chính, tạo các hồ sơ con (Child Profiles) đăng nhập nhanh bằng PIN/Avatar; có Parental Gate bảo vệ khu vực quản lý.
- **Báo cáo Tiến độ cho Phụ huynh**: Theo dõi chi tiết thời gian học, mức độ hoàn thành bài tập, phân tích kỹ năng mạnh/yếu của từng bé.

### 2.2. Không thuộc phạm vi MVP (Non-Goals for MVP)
- Chưa triển khai giao diện CMS Web tự soạn thảo câu hỏi cho giáo viên (Nội dung MVP được nạp qua JSON Seed Data chuẩn hóa).
- Chưa mở rộng đồng loạt cả 15 khối lớp x môn học ngay từ đầu. Thay vào đó triển khai **Vertical Slice: Lớp 1 - Môn Toán** để hoàn thiện toàn bộ vòng lặp trải nghiệm và cơ chế gameplay.
- Không xây dựng tính năng chat tự do giữa học sinh để đảm bảo an toàn tuyệt đối cho trẻ (chỉ hỗ trợ biểu cảm/emote ngộ nghĩnh).
- Không chấm bài tập tự luận viết dài (chỉ tập trung trắc nghiệm tương tác, nghe nhìn, kéo thả).

### 2.3. Chống mục tiêu (Anti-Goals - Điều gì sẽ khiến dự án thất bại dù chạy được)
- **Giao diện người lớn, khô khan**: Nhiều chữ, form nhập liệu truyền thống, thiếu âm thanh và animation phản hồi.
- **Áp lực thi cử tiêu cực**: Bảng xếp hạng tạo cảm giác trừng phạt người điểm thấp; trận đấu Boss làm bé sợ hãi hoặc nản lòng khi trả lời sai (thay vào đó phải có gợi ý và cổ vũ bé làm lại).
- **Chờ đợi lâu khi ghép cặp (Matchmaking Stall)**: Bắt trẻ đợi quá 10 giây để tìm bạn chơi trong Đấu trường (phải tự động ghép Bot/Ghost).

---

## 3. Các hướng tiếp cận & Quyết định kiến trúc (Approaches & Key Decisions)

### 3.1. Các hướng tiếp cận đã khảo sát:
1. *Gamified Adventure Map (Duolingo / Khan Kids)*: Bản đồ học tập theo lộ trình.
2. *Interactive Quiz & Arena (Kahoot / Trạng Nguyên)*: Đấu trường thi đấu thời gian thực.
3. *Full Mini-Game RPG (Prodigy Math)*: Game nhập vai học tập.

### 3.2. Quyết định lồng ghép "3 trong 1" (Hybrid Core Loop):
- **Bản đồ Phiêu lưu** là trục học tập cốt lõi (Campaign Mode).
- **Đấu Boss bằng tri thức** ở cuối mỗi chương thay cho bài kiểm tra khô khan.
- **Đấu trường Tri thức (Arena)** là cổng so tài giao hữu 1vs1 và giải đấu cuối tuần.
- **Nhà của bé** là nơi giữ chân học sinh bằng việc nuôi linh vật và trang trí Avatar.

### 3.3. Quyết định sản phẩm quan trọng đã thống nhất (Decided with Partner):
1. **MVP Scope = Lát cắt dọc (Vertical Slice)**: Tập trung hoàn thiện trọn vẹn **Lớp 1 - Môn Toán** với đầy đủ các tính năng: Bản đồ thế giới số đếm, bài tập tương tác kéo thả que tính/hình khối, trận Đấu Boss cuối chương, Đấu trường 1vs1, Nhà Mascot.
2. **Account Flow = Tài khoản Gia đình**: Phụ huynh tạo tài khoản mẹ (Email/SĐT), quản lý các Profile con. Bé chuyển đổi profile bằng mã PIN 4 số/hình vẽ đơn giản. Cổng phụ huynh (Parental Gate - giải bài toán người lớn) để vào trang quản lý và nạp/mua vật phẩm.
3. **Quản lý nội dung = JSON / Database Seed Data**: Nội dung câu hỏi và bài học được cấu trúc hóa dưới dạng JSON schema chuẩn hóa. CMS quản trị sẽ xây dựng ở giai đoạn sau.

### 3.4. Quyết định kỹ thuật của đội ngũ phát triển (Builder Calls):
1. **Audio Delivery**: Sử dụng audio thu âm chất lượng cao lưu trữ tĩnh (Static CDN/Assets) cho các giọng đọc đề bài, lời khen, tiếng đếm số của Lớp 1 nhằm đảm bảo chuẩn xác về ngữ điệu và phát âm, loại bỏ hoàn toàn độ trễ của TTS đám mây.
2. **Matchmaking Engine**: Khi học sinh nhấn "Tìm trận" trong Đấu trường, nếu sau 10 giây không có đối thủ thực, hệ thống kích hoạt cơ chế **Ghost Runner / Bot thông minh** (mô phỏng nhịp làm bài thực tế của trẻ em) để trận đấu luôn bắt đầu ngay lập tức.

---

## 4. Chi tiết Nghiệp vụ & Vòng lặp Học tập (Core User Loop)

### 4.1. Hành trình học sinh Lớp 1 (Môn Toán MVP)
1. **Khởi động**: Bé chọn nhân vật Hiệp sĩ Nhí, được Linh vật Cú Mèo chào đón bằng giọng đọc vui vẻ.
2. **Học tập trên Bản đồ**:
   - Vùng 1: *Thung Lũng Số Đếm (Phạm vi 10)*.
   - Vùng 2: *Rừng Phép Cộng Kỳ Bí*.
   - Vùng 3: *Dòng Sông Phép Trừ*.
   - Vùng 4: *Vương Quốc Hình Khối (Tròn, Vuông, Tam Giác)*.
3. **Ải học tương tác (5 phút)**:
   - Dạng 1: Đếm số quả táo trên cây kéo vào giỏ.
   - Dạng 2: Kéo que tính vào ô phép tính thích hợp.
   - Dạng 3: Nghe âm thanh số và chọn thẻ bài tương ứng.
   - Phản hồi: Âm thanh ting ting vui vẻ khi đúng, pháo hoa mini; nếu sai, linh vật nhắc nhở nhẹ nhàng và đưa gợi ý.
4. **Trận Đấu Boss cuối vùng**:
   - Xuất hiện Quái vật Kẹo Ngọt khổng lồ.
   - Mỗi câu tính nhẩm đúng, Linh vật phóng cầu vồng năng lượng làm Boss mỉm cười và tặng Rương báu.
5. **Đấu trường Tri thức (1vs1)**:
   - Hai nhân vật chạy đua trên đường chạy 5 câu hỏi tính nhanh.
   - Trả lời đúng giúp nhân vật nhảy về đích nhanh hơn.

---

## 5. Kiến trúc Kỹ thuật (Technical Architecture)

### 5.1. Tech Stack
- **Frontend**:
  - Framework: **Next.js (React 19)** với App Router.
  - Thư viện chuyển động: **Framer Motion** + CSS Animations (hiệu ứng mở rương, nổ pháo hoa, linh vật thở/nhảy).
  - Thư viện kéo thả: **Dnd Kit** (hỗ trợ Touch tối ưu trên màn hình cảm ứng iPad/Tablet).
  - Âm thanh: **Howler.js / Web Audio API** (quản lý nhạc nền nền, hiệu ứng âm thanh click/win/hint).
  - Styling: **Tailwind CSS**.
- **Backend & Realtime**:
  - Framework: **Node.js (NestJS / Express)** kiến trúc Module rõ ràng.
  - Realtime: **Socket.io** quản lý phòng đấu 1vs1 và đồng bộ hóa trận đấu với Bot/Ghost.
- **Database**:
  - **PostgreSQL**: Lưu trữ người dùng, hồ sơ trẻ em, tiến trình học tập, kho câu hỏi.
  - **Redis**: Quản lý hàng đợi tìm trận (matchmaking queue) và bảng xếp hạng tuần.

### 5.2. Cấu trúc Schema Dữ liệu Câu hỏi JSON (Question Schema)
```json
{
  "id": "math_g1_c1_q1",
  "grade": 1,
  "subject": "math",
  "chapterId": "counting_to_10",
  "levelId": "stage_1",
  "type": "DRAG_AND_DROP",
  "promptText": "Bé hãy kéo 3 quả táo vào giỏ nhé!",
  "promptAudioUrl": "/audio/math/g1_prompt_drag_3_apples.mp3",
  "interactivePayload": {
    "targetCount": 3,
    "itemType": "apple",
    "sourcePool": 5
  },
  "feedbackAudio": {
    "correct": "/audio/common/cheer_great_job.mp3",
    "hint": "/audio/math/hint_count_carefully.mp3"
  },
  "rewardExp": 10,
  "rewardCoins": 5
}
```

### 5.3. Thiết Kế Giao Diện & Bố Cục 3 Cột Sống Động (3D Cartoon Bouncy UI)
- **Phong cách thị giác (Visual Style)**: 3D Cartoon Bouncy lấy cảm hứng từ Duolingo và Khan Academy Kids. Các nút bấm và thẻ bài dày dặn, có đổ bóng 3D (`btn-3d`), hiệu ứng nhún nảy khi click/hover, góc bo tròn mềm mại (`rounded-3xl`), tông màu kẹo ngọt tươi sáng (`kid-yellow`, `kid-green`, `kid-blue`).
- **Bố cục 3 cột (Three-Column Living World Layout)** trên Desktop/Tablet:
  - **Cột Trái (Góc Bạn Đồng Hành - CompanionSidebar)**:
    - Linh vật Cú Mèo 3D hoạt họa, bé click vào Cú sẽ nhảy múa, phát âm thanh vui nhộn và hiển thị lời chào động viên.
    - Thẻ cấp độ (Level 1-4) & thanh tiến độ EXP của bé.
    - Huy hiệu chuỗi ngày học tập chăm chỉ (Streak).
  - **Cột Giữa (Bản Đồ Thám Hiểm - AdventureMap)**:
    - Bản đồ uốn lượn qua các ải toán với đường ray nối sinh động.
  - **Cột Phải (Nhiệm Vụ & Hoạt Động - ActivitiesSidebar)**:
    - Nhiệm vụ hằng ngày (Daily Quests) kèm nút bấm nhận thưởng xu nảy 3D.
    - Rương báu may mắn hàng ngày (Daily Mystery Chest) lắc lư phát sáng, mở nhận xu bất ngờ.
    - Bảng vinh danh tuần (Mini Leaderboard) tạo động lực thi đua cùng bạn bè.
- **Kiến trúc Modal An toàn Viewport (Viewport-Safe Modal Architecture)**:
  - Vì thanh điều hướng `<header>` sử dụng hiệu ứng làm mờ nền `backdrop-blur-md` (`backdrop-filter`), CSS sẽ tạo Containing Block làm sai lệch tọa độ của các phần tử `position: fixed`.
  - Toàn bộ modal (Chọn hồ sơ bé `profile-switcher-modal`, Cổng phụ huynh `parental-gate-modal`, Cửa sổ đăng nhập `auth-modal`) bắt buộc sử dụng **React `createPortal`** gắn trực tiếp vào `document.body`.
  - Cấu hình an toàn: `z-[9999]`, padding trên/dưới `py-8 sm:py-12`, giới hạn `max-h-[85vh]` kèm `overflow-y-auto` để đảm bảo không bao giờ bị cắt cụt phần đầu (Top) hay đáy trên mọi kích cỡ màn hình.

### 5.4. Kiến Trúc Xác Thực Tài Khoản Phụ Huynh & Đăng Nhập Google (Auth Architecture)
- **Mô hình người dùng & Hồ sơ gia đình**:
  - `ParentUser`: `{ id, email, fullName, avatarUrl, provider: 'google' | 'email' | 'guest', children: ChildProfile[], createdAt }`.
  - `ChildProfile`: `{ id, name, gradeLabel, avatarEmoji, pinIcons: string[], studyMinutesToday: number }`.
  - **Tài khoản mới tạo**: Bắt đầu với mảng con rỗng (`children: []`).
- **Luồng Đăng Nhập Google qua Google Identity Services (GSI) SDK**:
  - Tải SDK chính thức `https://accounts.google.com/gsi/client` phía Client.
  - Sử dụng Google OAuth 2.0 Token Client (`google.accounts.oauth2.initTokenClient`) hoặc Credential Client (`google.accounts.id.initialize`) kết nối trực tiếp với `NEXT_PUBLIC_GOOGLE_CLIENT_ID`.
  - Sau khi người dùng cấp quyền trên popup của Google, hệ thống gọi Google Userinfo API (`https://www.googleapis.com/oauth2/v3/userinfo`) hoặc giải mã Google JWT để lấy thông tin tài khoản thật (email, họ tên, avatar).
- **Luồng Onboarding Tạo Hồ Sơ Bé Đầu Tiên (Child Profile Creation)**:
  - Khi phụ huynh đăng ký hoặc đăng nhập tài khoản lần đầu (chưa có con trong `children: []`), hệ thống tự động kích hoạt Modal Onboarding: **"Tạo Hồ Sơ Bé Đầu Tiên" (`CreateChildModal`)**.
  - Form thiết lập bao gồm:
    1. **Tên bé**: (vd: Bé Bống, Bé Bo...).
    2. **Khối lớp**: Lớp 1 (mặc định), có thể mở rộng Lớp 2-5.
    3. **Bộ sưu tập Avatar linh vật**: Sư tử 🦁, Thỏ 🐰, Gấu trúc 🐼, Hổ con 🐯, Mèo con 🐱, Cú thông thái 🦉...
    4. **Mã PIN 4 biểu tượng vui nhộn**: Chọn 4 icon ngộ nghĩnh (🍎, ⭐, 🦆, 🌈, 🍓, 🚀...) để bé tự nhớ và chuyển hồ sơ dễ dàng.
  - Phụ huynh có thể tạo thêm con thứ 2, thứ 3 bất cứ lúc nào qua nút `"➕ Thêm bé mới"` trong menu quản lý hồ sơ.
- **Chế độ Học Thử (Guest Mode)**:
  - Người dùng mới chưa đăng nhập sẽ học dưới dạng `🎒 Bé Học Thử (Khách)`.
  - Khi bấm vào hồ sơ hoặc các tính năng cá nhân hóa, hệ thống sẽ lịch sự mời phụ huynh đăng nhập để tạo hồ sơ riêng và lưu thành tích cho bé.

---

## 6. Lộ trình Triển khai Chi tiết

- **Sprint 1: Nền tảng dự án & Engine câu hỏi tương tác**:
  - Thiết lập Git repo, cấu trúc Next.js/Tailwind/TypeScript, hướng dẫn Superpowers (`AGENTS.md`).
  - Xây dựng Question Engine hỗ trợ: Âm thanh, Hình ảnh, Kéo thả cảm ứng (Touch-friendly Drag & Drop).
  - Tạo bộ dữ liệu mẫu JSON cho Lớp 1 - Toán học (Số đếm & Phép tính cơ bản).
- **Sprint 2: Bản đồ Phiêu lưu & Cơ chế Ải học**:
  - Giao diện Bản đồ thế giới (Adventure Map UI) với các điểm ải có trạng thái Khóa / Mở / 3 Sao.
  - Màn hình làm bài học tập, hệ thống phản hồi âm thanh và phần thưởng (Sao, Xu, EXP).
- **Sprint 3: Trận chiến Đấu Boss & Nhà của bé**:
  - Cơ chế Boss Battle giải cứu vùng đất bằng toán học.
  - Giao diện phòng Avatar & Linh vật (đổi Xu lấy phụ kiện).
- **Sprint 4: Đấu trường 1vs1 & Cơ chế Ghost/Bot**:
  - Socket.io Realtime Arena: Đua giải toán 1vs1.
  - Tự động chuyển Ghost/Bot sau 10s tìm trận.
- **Sprint 5: Cổng Phụ huynh (Parent Portal) & Kiểm thử hoàn thiện**:
  - Đăng nhập phụ huynh, chuyển đổi profile bé bằng PIN, Parental Gate.
  - Báo cáo kết quả học tập.

---

## 7. Quyết định giao cho Đội ngũ Lập trình (Left to Builder)
- Thiết kế chi tiết các tài nguyên đồ họa (SVG icon, bảng màu vui tươi pastel cho trẻ nhỏ).
- Cấu trúc thư mục mã nguồn và cấu hình CI/CD, bộ test tự động (TDD).

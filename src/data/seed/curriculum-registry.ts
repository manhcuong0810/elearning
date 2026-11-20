import { Curriculum, SubjectType, GradeLevel } from '@/types/curriculum';
import grade1MathSeed from '@/data/seed/grade1-math.json';

// Helper to build audio URLs
const audio = (id: string) => `/audio/curriculum/${id}.mp3`;

export const curriculumRegistry: Record<string, Curriculum> = {
  // Math Grade 1 (loaded from original seed)
  'math_1': grade1MathSeed as unknown as Curriculum,

  // Math Grade 2
  'math_2': {
    subject: 'math',
    grade: 2,
    title: 'Toán Lớp 2: Bảng Nhân Chia & Phép Tính 1000',
    description: 'Chinh phục bảng nhân 2, 5, phép cộng trừ có nhớ và khám phá thế giới hình học.',
    chapters: [
      {
        id: 'math_g2_c1',
        title: 'Chương 1: Xưởng Bánh Phép Nhân 2 và 5',
        order: 1,
        stages: [
          {
            id: 'math_g2_c1_s1',
            name: 'Ải 1: Bảng Nhân 2 Thần Kỳ',
            order: 1,
            questions: [
              {
                id: 'math_g2_q1',
                type: 'MULTIPLE_CHOICE',
                promptText: 'Mỗi đĩa có 2 quả táo. Hỏi 4 đĩa có tất cả bao nhiêu quả táo?',
                promptAudioUrl: audio('math_g2_q1'),
                options: [
                  { id: 'opt1', text: '6 quả táo', isCorrect: false },
                  { id: 'opt2', text: '8 quả táo (2 x 4 = 8)', isCorrect: true },
                  { id: 'opt3', text: '10 quả táo', isCorrect: false },
                ],
                rewardCoins: 10,
                rewardExp: 15,
              },
              {
                id: 'math_g2_q2',
                type: 'DRAG_DROP',
                promptText: 'Kéo phép tính thích hợp vào ô: 2 x 5 = ?',
                promptAudioUrl: audio('math_g2_q2'),
                interactivePayload: {
                  targets: [{ id: 'target_1', acceptValue: '10' }],
                  items: [
                    { id: 'item_1', label: '8', value: '8' },
                    { id: 'item_2', label: '10', value: '10' },
                    { id: 'item_3', label: '12', value: '12' },
                  ],
                },
                rewardCoins: 10,
                rewardExp: 15,
              },
              {
                id: 'math_g2_q3',
                type: 'COUNTING',
                promptText: 'Đếm xem có bao nhiêu đôi tất: 3 đôi tất có mấy chiếc tất?',
                promptAudioUrl: audio('math_g2_q3'),
                interactivePayload: { targetCount: 6, itemType: '🧦' },
                options: [
                  { id: 'c1', text: '5 chiếc', isCorrect: false },
                  { id: 'c2', text: '6 chiếc (2 x 3 = 6)', isCorrect: true },
                  { id: 'c3', text: '8 chiếc', isCorrect: false },
                ],
                rewardCoins: 10,
                rewardExp: 15,
              },
            ],
          },
          {
            id: 'math_g2_c1_s2',
            name: 'Ải 2: Đấu Boss Thần Hổ Toán Học',
            order: 2,
            isBoss: true,
            bossName: 'Thần Hổ Rừng Xanh',
            bossMaxHp: 3,
            bossAvatar: '🐯',
            questions: [
              {
                id: 'math_g2_boss_q1',
                type: 'MULTIPLE_CHOICE',
                promptText: '5 x 6 bằng bao nhiêu?',
                promptAudioUrl: audio('math_g2_bq1'),
                options: [
                  { id: 'b1', text: '25', isCorrect: false },
                  { id: 'b2', text: '30', isCorrect: true },
                  { id: 'b3', text: '35', isCorrect: false },
                ],
                rewardCoins: 20,
                rewardExp: 30,
              },
              {
                id: 'math_g2_boss_q2',
                type: 'MULTIPLE_CHOICE',
                promptText: 'Có 20 cái kẹo chia đều cho 5 bạn. Mỗi bạn được mấy cái kẹo?',
                promptAudioUrl: audio('math_g2_bq2'),
                options: [
                  { id: 'b4', text: '4 cái kẹo (20 : 5 = 4)', isCorrect: true },
                  { id: 'b5', text: '5 cái kẹo', isCorrect: false },
                  { id: 'b6', text: '6 cái kẹo', isCorrect: false },
                ],
                rewardCoins: 20,
                rewardExp: 30,
              },
              {
                id: 'math_g2_boss_q3',
                type: 'MULTIPLE_CHOICE',
                promptText: 'Tìm x biết: x : 2 = 7',
                promptAudioUrl: audio('math_g2_bq3'),
                options: [
                  { id: 'b7', text: 'x = 9', isCorrect: false },
                  { id: 'b8', text: 'x = 14 (7 x 2 = 14)', isCorrect: true },
                  { id: 'b9', text: 'x = 5', isCorrect: false },
                ],
                rewardCoins: 25,
                rewardExp: 40,
              },
            ],
          },
        ],
      },
    ],
  },

  // Math Grade 3
  'math_3': {
    subject: 'math',
    grade: 3,
    title: 'Toán Lớp 3: Bảng Cửu Chương & Chu Vi Diện Tích',
    description: 'Thành thạo bảng cửu chương 3-9, làm quen số có 5 chữ số và hình học.',
    chapters: [
      {
        id: 'math_g3_c1',
        title: 'Chương 1: Mê Cung Bảng Cửu Chương 7, 8, 9',
        order: 1,
        stages: [
          {
            id: 'math_g3_c1_s1',
            name: 'Ải 1: Bí Mật Bảng Cửu Chương 8',
            order: 1,
            questions: [
              {
                id: 'math_g3_q1',
                type: 'MULTIPLE_CHOICE',
                promptText: '8 x 7 bằng bao nhiêu?',
                promptAudioUrl: audio('math_g3_q1'),
                options: [
                  { id: 'opt1', text: '54', isCorrect: false },
                  { id: 'opt2', text: '56', isCorrect: true },
                  { id: 'opt3', text: '64', isCorrect: false },
                ],
                rewardCoins: 10,
                rewardExp: 15,
              },
              {
                id: 'math_g3_q2',
                type: 'MULTIPLE_CHOICE',
                promptText: 'Một hình chữ nhật có chiều dài 8cm, chiều rộng 5cm. Diện tích hình chữ nhật là:',
                promptAudioUrl: audio('math_g3_q2'),
                options: [
                  { id: 'm1', text: '13 cm2', isCorrect: false },
                  { id: 'm2', text: '26 cm', isCorrect: false },
                  { id: 'm3', text: '40 cm2 (8 x 5 = 40)', isCorrect: true },
                ],
                rewardCoins: 12,
                rewardExp: 20,
              },
              {
                id: 'math_g3_q3',
                type: 'DRAG_DROP',
                promptText: 'Kéo kết quả thích hợp: 72 : 9 = ?',
                promptAudioUrl: audio('math_g3_q3'),
                interactivePayload: {
                  targets: [{ id: 't1', acceptValue: '8' }],
                  items: [
                    { id: 'i1', label: '7', value: '7' },
                    { id: 'i2', label: '8', value: '8' },
                    { id: 'i3', label: '9', value: '9' },
                  ],
                },
                rewardCoins: 10,
                rewardExp: 15,
              },
            ],
          },
        ],
      },
    ],
  },

  // Math Grade 4
  'math_4': {
    subject: 'math',
    grade: 4,
    title: 'Toán Lớp 4: Triệu & Phân Số Diệu Kỳ',
    description: 'Chinh phục số tự nhiên nhiều chữ số, các phép toán phân số và hình học.',
    chapters: [
      {
        id: 'math_g4_c1',
        title: 'Chương 1: Thế Giới Phân Số',
        order: 1,
        stages: [
          {
            id: 'math_g4_c1_s1',
            name: 'Ải 1: Cộng Hai Phân Số Cùng Mẫu',
            order: 1,
            questions: [
              {
                id: 'math_g4_q1',
                type: 'MULTIPLE_CHOICE',
                promptText: 'Tính: 2/5 + 1/5 = ?',
                promptAudioUrl: audio('math_g4_q1'),
                options: [
                  { id: 'o1', text: '3/10', isCorrect: false },
                  { id: 'o2', text: '3/5', isCorrect: true },
                  { id: 'o3', text: '2/25', isCorrect: false },
                ],
                rewardCoins: 15,
                rewardExp: 25,
              },
              {
                id: 'math_g4_q2',
                type: 'MULTIPLE_CHOICE',
                promptText: 'Hình thoi có độ dài hai đường chéo là 6cm và 8cm. Diện tích hình thoi là:',
                promptAudioUrl: audio('math_g4_q2'),
                options: [
                  { id: 'o4', text: '24 cm2 ((6 x 8) : 2 = 24)', isCorrect: true },
                  { id: 'o5', text: '48 cm2', isCorrect: false },
                  { id: 'o6', text: '14 cm2', isCorrect: false },
                ],
                rewardCoins: 15,
                rewardExp: 25,
              },
            ],
          },
        ],
      },
    ],
  },

  // Math Grade 5
  'math_5': {
    subject: 'math',
    grade: 5,
    title: 'Toán Lớp 5: Số Thập Phân & Chuyển Động Đều',
    description: 'Thành thạo số thập phân, tỉ số phần trăm và giải bài toán vận tốc - quãng đường - thời gian.',
    chapters: [
      {
        id: 'math_g5_c1',
        title: 'Chương 1: Chinh Phục Số Thập Phân & Vận Tốc',
        order: 1,
        stages: [
          {
            id: 'math_g5_c1_s1',
            name: 'Ải 1: Đua Xe Cùng Vận Tốc',
            order: 1,
            questions: [
              {
                id: 'math_g5_q1',
                type: 'MULTIPLE_CHOICE',
                promptText: 'Một ô tô đi được quãng đường 120km trong 2 giờ. Vận tốc của ô tô là:',
                promptAudioUrl: audio('math_g5_q1'),
                options: [
                  { id: 'o1', text: '50 km/h', isCorrect: false },
                  { id: 'o2', text: '60 km/h (120 : 2 = 60)', isCorrect: true },
                  { id: 'o3', text: '70 km/h', isCorrect: false },
                ],
                rewardCoins: 20,
                rewardExp: 30,
              },
              {
                id: 'math_g5_q2',
                type: 'MULTIPLE_CHOICE',
                promptText: 'Tính: 3,5 x 4 = ?',
                promptAudioUrl: audio('math_g5_q2'),
                options: [
                  { id: 'o4', text: '14', isCorrect: true },
                  { id: 'o5', text: '12,5', isCorrect: false },
                  { id: 'o6', text: '14,5', isCorrect: false },
                ],
                rewardCoins: 20,
                rewardExp: 30,
              },
            ],
          },
        ],
      },
    ],
  },

  // Vietnamese Grade 1
  'vietnamese_1': {
    subject: 'vietnamese',
    grade: 1,
    title: 'Tiếng Việt Lớp 1: Bảng Chữ Cái & Vần Diệu Kỳ',
    description: 'Làm quen bảng chữ cái tiếng Việt, ghép vần ngọt ngào và các câu đố chữ thông minh.',
    chapters: [
      {
        id: 'vn_g1_c1',
        title: 'Chương 1: Vườn Hoa Chữ Cái & Dấu Thanh',
        order: 1,
        stages: [
          {
            id: 'vn_g1_c1_s1',
            name: 'Ải 1: Làm Quen Âm A, B, C',
            order: 1,
            questions: [
              {
                id: 'vn_g1_q1',
                type: 'MULTIPLE_CHOICE',
                promptText: 'Bức tranh chú "Cá" bắt đầu bằng chữ cái nào?',
                promptAudioUrl: audio('vn_g1_q1'),
                options: [
                  { id: 'v1', text: 'Chữ C', isCorrect: true },
                  { id: 'v2', text: 'Chữ B', isCorrect: false },
                  { id: 'v3', text: 'Chữ D', isCorrect: false },
                ],
                rewardCoins: 10,
                rewardExp: 15,
              },
              {
                id: 'vn_g1_q2',
                type: 'DRAG_DROP',
                promptText: 'Kéo chữ cái còn thiếu để tạo thành từ "BÉ": B + ?',
                promptAudioUrl: audio('vn_g1_q2'),
                interactivePayload: {
                  targets: [{ id: 'target_1', acceptValue: 'É' }],
                  items: [
                    { id: 'i1', label: 'Á', value: 'Á' },
                    { id: 'i2', label: 'É', value: 'É' },
                    { id: 'i3', label: 'Ó', value: 'Ó' },
                  ],
                },
                rewardCoins: 10,
                rewardExp: 15,
              },
              {
                id: 'vn_g1_q3',
                type: 'COUNTING',
                promptText: 'Trong câu: "Mẹ đi chợ mua cá", có mấy tiếng?',
                promptAudioUrl: audio('vn_g1_q3'),
                interactivePayload: { targetCount: 5, itemType: '📖' },
                options: [
                  { id: 'v4', text: '4 tiếng', isCorrect: false },
                  { id: 'v5', text: '5 tiếng (Mẹ - đi - chợ - mua - cá)', isCorrect: true },
                  { id: 'v6', text: '6 tiếng', isCorrect: false },
                ],
                rewardCoins: 10,
                rewardExp: 15,
              },
            ],
          },
          {
            id: 'vn_g1_c1_s2',
            name: 'Ải 2: Đấu Boss Thần Rùa Vàng Ghép Vần',
            order: 2,
            isBoss: true,
            bossName: 'Thần Rùa Trạng Nguyên',
            bossMaxHp: 3,
            bossAvatar: '🐢',
            questions: [
              {
                id: 'vn_g1_bq1',
                type: 'MULTIPLE_CHOICE',
                promptText: 'Từ nào sau đây có chứa vần "AN"?',
                promptAudioUrl: audio('vn_g1_bq1'),
                options: [
                  { id: 'bv1', text: 'Con Bàn', isCorrect: true },
                  { id: 'bv2', text: 'Con Vịt', isCorrect: false },
                  { id: 'bv3', text: 'Cây Cối', isCorrect: false },
                ],
                rewardCoins: 20,
                rewardExp: 30,
              },
              {
                id: 'vn_g1_bq2',
                type: 'MULTIPLE_CHOICE',
                promptText: 'Điền dấu thanh đúng để có từ chỉ con vật: "G... gà"',
                promptAudioUrl: audio('vn_g1_bq2'),
                options: [
                  { id: 'bv4', text: 'Dấu huyền (Gà)', isCorrect: true },
                  { id: 'bv5', text: 'Dấu sắc (Gá)', isCorrect: false },
                  { id: 'bv6', text: 'Dấu hỏi (Gả)', isCorrect: false },
                ],
                rewardCoins: 20,
                rewardExp: 30,
              },
              {
                id: 'vn_g1_bq3',
                type: 'MULTIPLE_CHOICE',
                promptText: 'Giải câu đố: "Cái mỏ màu vàng, hay kêu cúc cu, đố là con gì?"',
                promptAudioUrl: audio('vn_g1_bq3'),
                options: [
                  { id: 'bv7', text: 'Chim Cúc Cu', isCorrect: true },
                  { id: 'bv8', text: 'Chú Chó', isCorrect: false },
                  { id: 'bv9', text: 'Con Cá', isCorrect: false },
                ],
                rewardCoins: 25,
                rewardExp: 40,
              },
            ],
          },
        ],
      },
    ],
  },

  // Vietnamese Grade 2
  'vietnamese_2': {
    subject: 'vietnamese',
    grade: 2,
    title: 'Tiếng Việt Lớp 2: Từ Chỉ Sự Vật & Mẫu Câu Ai Là Gì',
    description: 'Mở rộng vốn từ về Gia đình, Trường học và rèn luyện câu văn chuẩn ngữ pháp.',
    chapters: [
      {
        id: 'vn_g2_c1',
        title: 'Chương 1: Mái Trường Mến Yêu',
        order: 1,
        stages: [
          {
            id: 'vn_g2_c1_s1',
            name: 'Ải 1: Tìm Từ Chỉ Đồ Dùng Học Tập',
            order: 1,
            questions: [
              {
                id: 'vn_g2_q1',
                type: 'MULTIPLE_CHOICE',
                promptText: 'Từ nào sau đây là từ chỉ đồ dùng học tập của học sinh?',
                promptAudioUrl: audio('vn_g2_q1'),
                options: [
                  { id: 'o1', text: 'Cây Bút Chì', isCorrect: true },
                  { id: 'o2', text: 'Chạy nhảy', isCorrect: false },
                  { id: 'o3', text: 'Chăm chỉ', isCorrect: false },
                ],
                rewardCoins: 12,
                rewardExp: 18,
              },
              {
                id: 'vn_g2_q2',
                type: 'MULTIPLE_CHOICE',
                promptText: 'Câu nào sau đây thuộc kiểu câu "Ai là gì?"',
                promptAudioUrl: audio('vn_g2_q2'),
                options: [
                  { id: 'o4', text: 'Bạn Nam đang đọc sách.', isCorrect: false },
                  { id: 'o5', text: 'Bố em là bác sĩ.', isCorrect: true },
                  { id: 'o6', text: 'Bông hoa rất đẹp.', isCorrect: false },
                ],
                rewardCoins: 12,
                rewardExp: 18,
              },
            ],
          },
        ],
      },
    ],
  },

  // Vietnamese Grade 3
  'vietnamese_3': {
    subject: 'vietnamese',
    grade: 3,
    title: 'Tiếng Việt Lớp 3: So Sánh & Nhân Hóa Diệu Kỳ',
    description: 'Khám phá các biện pháp tu từ so sánh, nhân hóa và làm phong phú câu văn.',
    chapters: [
      {
        id: 'vn_g3_c1',
        title: 'Chương 1: Phép Tu Từ So Sánh & Nhân Hóa',
        order: 1,
        stages: [
          {
            id: 'vn_g3_c1_s1',
            name: 'Ải 1: Phép So Sánh Ngọt Ngào',
            order: 1,
            questions: [
              {
                id: 'vn_g3_q1',
                type: 'MULTIPLE_CHOICE',
                promptText: 'Trong câu: "Trăng tròn như quả bóng", từ nào là từ so sánh?',
                promptAudioUrl: audio('vn_g3_q1'),
                options: [
                  { id: 'o1', text: 'Từ "Trăng"', isCorrect: false },
                  { id: 'o2', text: 'Từ "Như"', isCorrect: true },
                  { id: 'o3', text: 'Từ "Bóng"', isCorrect: false },
                ],
                rewardCoins: 15,
                rewardExp: 20,
              },
              {
                id: 'vn_g3_q2',
                type: 'MULTIPLE_CHOICE',
                promptText: 'Câu nào dưới đây có hình ảnh nhân hóa?',
                promptAudioUrl: audio('vn_g3_q2'),
                options: [
                  { id: 'o4', text: 'Mặt trời thức dậy, mỉm cười chào bé.', isCorrect: true },
                  { id: 'o5', text: 'Bầu trời mùa thu xanh ngắt.', isCorrect: false },
                  { id: 'o6', text: 'Ngôi nhà có mái ngói đỏ.', isCorrect: false },
                ],
                rewardCoins: 15,
                rewardExp: 20,
              },
            ],
          },
        ],
      },
    ],
  },

  // Vietnamese Grade 4
  'vietnamese_4': {
    subject: 'vietnamese',
    grade: 4,
    title: 'Tiếng Việt Lớp 4: Luyện Từ Và Câu - Từ Ghép, Từ Láy',
    description: 'Phân biệt từ đơn, từ ghép, từ láy, danh từ, động từ và tính từ.',
    chapters: [
      {
        id: 'vn_g4_c1',
        title: 'Chương 1: Kho Tàng Từ Vựng Tiếng Việt',
        order: 1,
        stages: [
          {
            id: 'vn_g4_c1_s1',
            name: 'Ải 1: Phân Biệt Từ Ghép & Từ Láy',
            order: 1,
            questions: [
              {
                id: 'vn_g4_q1',
                type: 'MULTIPLE_CHOICE',
                promptText: 'Từ nào sau đây là từ láy?',
                promptAudioUrl: audio('vn_g4_q1'),
                options: [
                  { id: 'o1', text: 'Xanh xao', isCorrect: true },
                  { id: 'o2', text: 'Xe đạp', isCorrect: false },
                  { id: 'o3', text: 'Bàn ghế', isCorrect: false },
                ],
                rewardCoins: 18,
                rewardExp: 25,
              },
            ],
          },
        ],
      },
    ],
  },

  // Vietnamese Grade 5
  'vietnamese_5': {
    subject: 'vietnamese',
    grade: 5,
    title: 'Tiếng Việt Lớp 5: Từ Đồng Nghĩa, Trái Nghĩa & Câu Ghép',
    description: 'Thành thạo từ đồng nghĩa, từ trái nghĩa, từ nhiều nghĩa và cách nối các vế câu ghép.',
    chapters: [
      {
        id: 'vn_g5_c1',
        title: 'Chương 1: Tinh Hoa Ngôn Ngữ Việt',
        order: 1,
        stages: [
          {
            id: 'vn_g5_c1_s1',
            name: 'Ải 1: Cặp Từ Trái Nghĩa',
            order: 1,
            questions: [
              {
                id: 'vn_g5_q1',
                type: 'MULTIPLE_CHOICE',
                promptText: 'Cặp từ nào sau đây là cặp từ trái nghĩa?',
                promptAudioUrl: audio('vn_g5_q1'),
                options: [
                  { id: 'o1', text: 'Dũng cảm - Can đảm', isCorrect: false },
                  { id: 'o2', text: 'Chăm chỉ - Lười biếng', isCorrect: true },
                  { id: 'o3', text: 'Bao la - Rộng lớn', isCorrect: false },
                ],
                rewardCoins: 20,
                rewardExp: 30,
              },
            ],
          },
        ],
      },
    ],
  },

  // English Grade 1
  'english_1': {
    subject: 'english',
    grade: 1,
    title: 'English Grade 1: Alphabet, Colors & Cute Animals',
    description: 'Learn the ABCs, phonics sounds, colors and numbers with fun audio games.',
    chapters: [
      {
        id: 'en_g1_c1',
        title: 'Chapter 1: Phonics & Color Land',
        order: 1,
        stages: [
          {
            id: 'en_g1_c1_s1',
            name: 'Stage 1: Apple, Ball & Cat',
            order: 1,
            questions: [
              {
                id: 'en_g1_q1',
                type: 'MULTIPLE_CHOICE',
                promptText: 'What is this animal? 🐱 (Con mèo trong tiếng Anh là gì?)',
                promptAudioUrl: audio('en_g1_q1'),
                options: [
                  { id: 'e1', text: 'Cat', isCorrect: true },
                  { id: 'e2', text: 'Dog', isCorrect: false },
                  { id: 'e3', text: 'Duck', isCorrect: false },
                ],
                rewardCoins: 10,
                rewardExp: 15,
              },
              {
                id: 'en_g1_q2',
                type: 'DRAG_DROP',
                promptText: 'Drag the letter to complete: D - O - ? (Chó)',
                promptAudioUrl: audio('en_g1_q2'),
                interactivePayload: {
                  targets: [{ id: 't1', acceptValue: 'G' }],
                  items: [
                    { id: 'i1', label: 'T', value: 'T' },
                    { id: 'i2', label: 'G', value: 'G' },
                    { id: 'i3', label: 'M', value: 'M' },
                  ],
                },
                rewardCoins: 10,
                rewardExp: 15,
              },
              {
                id: 'en_g1_q3',
                type: 'COUNTING',
                promptText: 'How many red apples are there? 🍎🍎🍎',
                promptAudioUrl: audio('en_g1_q3'),
                interactivePayload: { targetCount: 3, itemType: '🍎' },
                options: [
                  { id: 'e4', text: 'Two', isCorrect: false },
                  { id: 'e5', text: 'Three', isCorrect: true },
                  { id: 'e6', text: 'Four', isCorrect: false },
                ],
                rewardCoins: 10,
                rewardExp: 15,
              },
            ],
          },
          {
            id: 'en_g1_c1_s2',
            name: 'Stage 2: Boss Leo the Lion',
            order: 2,
            isBoss: true,
            bossName: 'Leo The Brave Lion',
            bossMaxHp: 3,
            bossAvatar: '🦁',
            questions: [
              {
                id: 'en_g1_bq1',
                type: 'MULTIPLE_CHOICE',
                promptText: 'Which color is the Sun? ☀️ (Mặt trời màu gì?)',
                promptAudioUrl: audio('en_g1_bq1'),
                options: [
                  { id: 'be1', text: 'Yellow', isCorrect: true },
                  { id: 'be2', text: 'Blue', isCorrect: false },
                  { id: 'be3', text: 'Green', isCorrect: false },
                ],
                rewardCoins: 20,
                rewardExp: 30,
              },
              {
                id: 'en_g1_bq2',
                type: 'MULTIPLE_CHOICE',
                promptText: 'How do you say "Xin chào" in English?',
                promptAudioUrl: audio('en_g1_bq2'),
                options: [
                  { id: 'be4', text: 'Goodbye', isCorrect: false },
                  { id: 'be5', text: 'Hello', isCorrect: true },
                  { id: 'be6', text: 'Thank you', isCorrect: false },
                ],
                rewardCoins: 20,
                rewardExp: 30,
              },
              {
                id: 'en_g1_bq3',
                type: 'MULTIPLE_CHOICE',
                promptText: 'Letter "A" is for...',
                promptAudioUrl: audio('en_g1_bq3'),
                options: [
                  { id: 'be7', text: 'Apple', isCorrect: true },
                  { id: 'be8', text: 'Banana', isCorrect: false },
                  { id: 'be9', text: 'Elephant', isCorrect: false },
                ],
                rewardCoins: 25,
                rewardExp: 40,
              },
            ],
          },
        ],
      },
    ],
  },

  // English Grade 2
  'english_2': {
    subject: 'english',
    grade: 2,
    title: 'English Grade 2: Family, School & Daily Routines',
    description: 'Expand vocabulary with family members, school objects and everyday sentences.',
    chapters: [
      {
        id: 'en_g2_c1',
        title: 'Chapter 1: Family & School',
        order: 1,
        stages: [
          {
            id: 'en_g2_c1_s1',
            name: 'Stage 1: My Beloved Family',
            order: 1,
            questions: [
              {
                id: 'en_g2_q1',
                type: 'MULTIPLE_CHOICE',
                promptText: 'Who is she? 👩 (Mẹ trong tiếng Anh là gì?)',
                promptAudioUrl: audio('en_g2_q1'),
                options: [
                  { id: 'o1', text: 'Father', isCorrect: false },
                  { id: 'o2', text: 'Mother', isCorrect: true },
                  { id: 'o3', text: 'Brother', isCorrect: false },
                ],
                rewardCoins: 12,
                rewardExp: 18,
              },
            ],
          },
        ],
      },
    ],
  },

  // English Grade 3
  'english_3': {
    subject: 'english',
    grade: 3,
    title: 'English Grade 3: Hobbies, Weather & Can / Can\'t',
    description: 'Learn sports, weather conditions, time and action verbs.',
    chapters: [
      {
        id: 'en_g3_c1',
        title: 'Chapter 1: Hobbies and Abilities',
        order: 1,
        stages: [
          {
            id: 'en_g3_c1_s1',
            name: 'Stage 1: What Can You Do?',
            order: 1,
            questions: [
              {
                id: 'en_g3_q1',
                type: 'MULTIPLE_CHOICE',
                promptText: 'Birds can fly, but fish can...',
                promptAudioUrl: audio('en_g3_q1'),
                options: [
                  { id: 'o1', text: 'Swim', isCorrect: true },
                  { id: 'o2', text: 'Run', isCorrect: false },
                  { id: 'o3', text: 'Jump', isCorrect: false },
                ],
                rewardCoins: 15,
                rewardExp: 22,
              },
            ],
          },
        ],
      },
    ],
  },

  // English Grade 4
  'english_4': {
    subject: 'english',
    grade: 4,
    title: 'English Grade 4: Past Simple & Countries of the World',
    description: 'Master past tense verbs, comparative adjectives and country names.',
    chapters: [
      {
        id: 'en_g4_c1',
        title: 'Chapter 1: Yesterday & Adventures',
        order: 1,
        stages: [
          {
            id: 'en_g4_c1_s1',
            name: 'Stage 1: Past Simple Regular Verbs',
            order: 1,
            questions: [
              {
                id: 'en_g4_q1',
                type: 'MULTIPLE_CHOICE',
                promptText: 'Yesterday, I ... (play) soccer with my friends.',
                promptAudioUrl: audio('en_g4_q1'),
                options: [
                  { id: 'o1', text: 'plays', isCorrect: false },
                  { id: 'o2', text: 'played', isCorrect: true },
                  { id: 'o3', text: 'playing', isCorrect: false },
                ],
                rewardCoins: 18,
                rewardExp: 26,
              },
            ],
          },
        ],
      },
    ],
  },

  // English Grade 5
  'english_5': {
    subject: 'english',
    grade: 5,
    title: 'English Grade 5: Future Plans & Story Comprehension',
    description: 'Use will and be going to, discuss dream jobs and comprehend short English passages.',
    chapters: [
      {
        id: 'en_g5_c1',
        title: 'Chapter 1: Future Dreams',
        order: 1,
        stages: [
          {
            id: 'en_g5_c1_s1',
            name: 'Stage 1: What will you be in the future?',
            order: 1,
            questions: [
              {
                id: 'en_g5_q1',
                type: 'MULTIPLE_CHOICE',
                promptText: 'I want to help sick people. In the future, I will be a...',
                promptAudioUrl: audio('en_g5_q1'),
                options: [
                  { id: 'o1', text: 'Doctor', isCorrect: true },
                  { id: 'o2', text: 'Pilot', isCorrect: false },
                  { id: 'o3', text: 'Chef', isCorrect: false },
                ],
                rewardCoins: 20,
                rewardExp: 30,
              },
            ],
          },
        ],
      },
    ],
  },
};

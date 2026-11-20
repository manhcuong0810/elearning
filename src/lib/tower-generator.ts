import { Stage, Question, SubjectType, GradeLevel } from '@/types/curriculum';

// A simple deterministic pseudo-random number generator (LCG)
function seededRandom(seed: number): () => number {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

const audio = (id: string) => `/audio/curriculum/${id}.mp3`;

export function generateTowerStage(
  subject: SubjectType,
  grade: GradeLevel,
  floor: number
): Stage {
  const safeFloor = Math.max(1, Math.min(1000, Math.floor(floor)));
  const isBoss = safeFloor % 10 === 0;

  // Deterministic seed
  const subjectCode = subject === 'math' ? 100000 : subject === 'vietnamese' ? 200000 : 300000;
  const seed = subjectCode + grade * 10000 + safeFloor;
  const rand = seededRandom(seed);

  const rewardCoins = 10 + Math.floor(safeFloor / 50) + (isBoss ? 15 : 0);
  const rewardExp = 15 + Math.floor(safeFloor / 30) + (isBoss ? 25 : 0);

  // Generate 3 questions per floor (or 3 for boss)
  const questions: Question[] = [];

  for (let qIdx = 1; qIdx <= 3; qIdx++) {
    const qSeed = seed * 10 + qIdx;
    const qRand = seededRandom(qSeed);
    const qId = `tower_${subject}_g${grade}_f${safeFloor}_q${qIdx}`;

    if (subject === 'math') {
      questions.push(generateMathQuestion(grade, safeFloor, qId, qRand, rewardCoins, rewardExp));
    } else if (subject === 'vietnamese') {
      questions.push(generateVietnameseQuestion(grade, safeFloor, qId, qRand, rewardCoins, rewardExp));
    } else {
      questions.push(generateEnglishQuestion(grade, safeFloor, qId, qRand, rewardCoins, rewardExp));
    }
  }

  const bossAvatars = ['🐲', '🦁', '🐯', '🦅', '🐢', '🦊'];
  const bossNames = [
    'Thần Rồng Pha Lê',
    'Chúa Tể Sư Tử Trí Tuệ',
    'Thần Hổ Huyền Thoại',
    'Đại Bàng Bão Táp',
    'Cụ Rùa Kim Quy',
    'Hồ Ly Chín Đuôi',
  ];
  const bossIdx = Math.floor(safeFloor / 10) % bossNames.length;

  return {
    id: `tower_${subject}_g${grade}_f${safeFloor}`,
    name: isBoss
      ? `Tầng ${safeFloor}: Đại Chiến ${bossNames[bossIdx]} 👑`
      : `Tầng ${safeFloor}: Thử Thách Pha Lê`,
    order: safeFloor,
    isBoss,
    bossMaxHp: isBoss ? 3 : undefined,
    bossName: isBoss ? bossNames[bossIdx] : undefined,
    bossAvatar: isBoss ? bossAvatars[bossIdx] : undefined,
    description: `Thử thách tầng ${safeFloor} Tháp Vô Tận dành cho học sinh Lớp ${grade}.`,
    questions,
  };
}

function generateMathQuestion(
  grade: GradeLevel,
  floor: number,
  qId: string,
  rand: () => number,
  rewardCoins: number,
  rewardExp: number
): Question {
  if (grade === 1) {
    const a = Math.floor(rand() * 10) + 1;
    const b = Math.floor(rand() * 9) + 1;
    const isPlus = rand() > 0.4;
    const correct = isPlus ? a + b : Math.max(a, b) - Math.min(a, b);
    const opStr = isPlus ? `${a} + ${b}` : `${Math.max(a, b)} - ${Math.min(a, b)}`;

    return {
      id: qId,
      type: 'MULTIPLE_CHOICE',
      promptText: `Bé hãy tính: ${opStr} = ?`,
      promptAudioUrl: audio(qId),
      options: [
        { id: 'opt_c', text: `${correct}`, isCorrect: true },
        { id: 'opt_w1', text: `${correct + 1}`, isCorrect: false },
        { id: 'opt_w2', text: `${Math.max(0, correct - 1)}`, isCorrect: false },
      ].sort(() => rand() - 0.5),
      rewardCoins,
      rewardExp,
    };
  }

  if (grade === 2) {
    const table = rand() > 0.5 ? 2 : 5;
    const multiplier = Math.floor(rand() * 9) + 1;
    const correct = table * multiplier;

    return {
      id: qId,
      type: 'MULTIPLE_CHOICE',
      promptText: `Phép tính: ${table} x ${multiplier} bằng bao nhiêu?`,
      promptAudioUrl: audio(qId),
      options: [
        { id: 'opt_c', text: `${correct}`, isCorrect: true },
        { id: 'opt_w1', text: `${correct + table}`, isCorrect: false },
        { id: 'opt_w2', text: `${Math.max(0, correct - table)}`, isCorrect: false },
      ].sort(() => rand() - 0.5),
      rewardCoins,
      rewardExp,
    };
  }

  if (grade === 3) {
    const a = Math.floor(rand() * 7) + 3; // 3..9
    const b = Math.floor(rand() * 8) + 2; // 2..9
    const correct = a * b;

    return {
      id: qId,
      type: 'MULTIPLE_CHOICE',
      promptText: `Tính nhanh: ${a} x ${b} = ?`,
      promptAudioUrl: audio(qId),
      options: [
        { id: 'opt_c', text: `${correct}`, isCorrect: true },
        { id: 'opt_w1', text: `${correct + 2}`, isCorrect: false },
        { id: 'opt_w2', text: `${correct - 3}`, isCorrect: false },
      ].sort(() => rand() - 0.5),
      rewardCoins,
      rewardExp,
    };
  }

  if (grade === 4) {
    const n1 = Math.floor(rand() * 4) + 1;
    const n2 = Math.floor(rand() * 4) + 1;
    const den = Math.floor(rand() * 5) + 6; // 6..10
    const correctNum = n1 + n2;

    return {
      id: qId,
      type: 'MULTIPLE_CHOICE',
      promptText: `Tính phân số: ${n1}/${den} + ${n2}/${den} = ?`,
      promptAudioUrl: audio(qId),
      options: [
        { id: 'opt_c', text: `${correctNum}/${den}`, isCorrect: true },
        { id: 'opt_w1', text: `${correctNum}/${den * 2}`, isCorrect: false },
        { id: 'opt_w2', text: `${Math.max(1, correctNum - 1)}/${den}`, isCorrect: false },
      ].sort(() => rand() - 0.5),
      rewardCoins,
      rewardExp,
    };
  }

  // Grade 5
  const distance = (Math.floor(rand() * 6) + 2) * 30; // 60, 90, 120...
  const time = Math.floor(rand() * 3) + 2; // 2, 3, 4
  const speed = Math.round(distance / time);

  return {
    id: qId,
    type: 'MULTIPLE_CHOICE',
    promptText: `Một xe máy chạy ${distance} km trong ${time} giờ. Vận tốc của xe là:`,
    promptAudioUrl: audio(qId),
    options: [
      { id: 'opt_c', text: `${speed} km/h`, isCorrect: true },
      { id: 'opt_w1', text: `${speed + 10} km/h`, isCorrect: false },
      { id: 'opt_w2', text: `${Math.max(20, speed - 10)} km/h`, isCorrect: false },
    ].sort(() => rand() - 0.5),
    rewardCoins,
    rewardExp,
  };
}

function generateVietnameseQuestion(
  grade: GradeLevel,
  floor: number,
  qId: string,
  rand: () => number,
  rewardCoins: number,
  rewardExp: number
): Question {
  const lettersG1 = [
    { word: 'Cá', letter: 'C' },
    { word: 'Gà', letter: 'G' },
    { word: 'Bé', letter: 'B' },
    { word: 'Mẹ', letter: 'M' },
    { word: 'Bút', letter: 'B' },
    { word: 'Vịt', letter: 'V' },
  ];

  if (grade === 1) {
    const item = lettersG1[Math.floor(rand() * lettersG1.length)];
    return {
      id: qId,
      type: 'MULTIPLE_CHOICE',
      promptText: `Từ "${item.word}" bắt đầu bằng chữ cái nào?`,
      promptAudioUrl: audio(qId),
      options: [
        { id: 'opt_c', text: `Chữ ${item.letter}`, isCorrect: true },
        { id: 'opt_w1', text: `Chữ ${item.letter === 'A' ? 'B' : 'A'}`, isCorrect: false },
        { id: 'opt_w2', text: 'Chữ O', isCorrect: false },
      ].sort(() => rand() - 0.5),
      rewardCoins,
      rewardExp,
    };
  }

  if (grade === 2) {
    const vocab = [
      { q: 'Cái gì dùng để viết bài?', a: 'Bút chì', w1: 'Cái bàn', w2: 'Cái cặp' },
      { q: 'Ai là người dạy học cho em?', a: 'Thầy cô giáo', w1: 'Bác sĩ', w2: 'Kỹ sư' },
      { q: 'Đồ vật nào dùng để tẩy sạch vết chì?', a: 'Cục tẩy', w1: 'Thước kẻ', w2: 'Bảng con' },
    ];
    const item = vocab[Math.floor(rand() * vocab.length)];
    return {
      id: qId,
      type: 'MULTIPLE_CHOICE',
      promptText: item.q,
      promptAudioUrl: audio(qId),
      options: [
        { id: 'opt_c', text: item.a, isCorrect: true },
        { id: 'opt_w1', text: item.w1, isCorrect: false },
        { id: 'opt_w2', text: item.w2, isCorrect: false },
      ].sort(() => rand() - 0.5),
      rewardCoins,
      rewardExp,
    };
  }

  if (grade === 3) {
    const similes = [
      { sent: 'Mặt trời đỏ rực như...', ans: 'Hòn lửa', w1: 'Cục than', w2: 'Hạt cát' },
      { sent: 'Mắt mèo sáng như...', ans: 'Hòn ngọc', w1: 'Cành cây', w2: 'Bóng tối' },
      { sent: 'Tiếng suối trong như...', ans: 'Tiếng hát xa', w1: 'Tiếng sấm', w2: 'Tiếng gió gầm' },
    ];
    const item = similes[Math.floor(rand() * similes.length)];
    return {
      id: qId,
      type: 'MULTIPLE_CHOICE',
      promptText: `Điền vào chỗ trống để tạo phép so sánh hay: "${item.sent}"`,
      promptAudioUrl: audio(qId),
      options: [
        { id: 'opt_c', text: item.ans, isCorrect: true },
        { id: 'opt_w1', text: item.w1, isCorrect: false },
        { id: 'opt_w2', text: item.w2, isCorrect: false },
      ].sort(() => rand() - 0.5),
      rewardCoins,
      rewardExp,
    };
  }

  if (grade === 4) {
    const redup = [
      { q: 'Từ nào sau đây là từ láy tượng thanh (chỉ âm thanh)?', c: 'Róc rách', w1: 'Xe đạp', w2: 'Cây cỏ' },
      { q: 'Từ nào sau đây là từ láy chỉ màu sắc?', c: 'Xanh xao', w1: 'Đỏ thắm', w2: 'Trắng tinh' },
    ];
    const item = redup[Math.floor(rand() * redup.length)];
    return {
      id: qId,
      type: 'MULTIPLE_CHOICE',
      promptText: item.q,
      promptAudioUrl: audio(qId),
      options: [
        { id: 'opt_c', text: item.c, isCorrect: true },
        { id: 'opt_w1', text: item.w1, isCorrect: false },
        { id: 'opt_w2', text: item.w2, isCorrect: false },
      ].sort(() => rand() - 0.5),
      rewardCoins,
      rewardExp,
    };
  }

  // Grade 5
  const antonyms = [
    { word: 'Dũng cảm', ant: 'Hèn nhát', w1: 'Can đảm', w2: 'Mạnh mẽ' },
    { word: 'Thông minh', ant: 'Ngốc nghếch', w1: 'Sáng dạ', w2: 'Tài giỏi' },
    { word: 'Gọn gàng', ant: 'Bừa bãi', w1: 'Ngăn nắp', w2: 'Sạch sẽ' },
  ];
  const item = antonyms[Math.floor(rand() * antonyms.length)];
  return {
    id: qId,
    type: 'MULTIPLE_CHOICE',
    promptText: `Từ trái nghĩa với từ "${item.word}" là gì?`,
    promptAudioUrl: audio(qId),
    options: [
      { id: 'opt_c', text: item.ant, isCorrect: true },
      { id: 'opt_w1', text: item.w1, isCorrect: false },
      { id: 'opt_w2', text: item.w2, isCorrect: false },
    ].sort(() => rand() - 0.5),
    rewardCoins,
    rewardExp,
  };
}

function generateEnglishQuestion(
  grade: GradeLevel,
  floor: number,
  qId: string,
  rand: () => number,
  rewardCoins: number,
  rewardExp: number
): Question {
  if (grade === 1) {
    const words = [
      { q: 'What is this? 🐶', a: 'Dog', w1: 'Cat', w2: 'Bird' },
      { q: 'Which color is a banana? 🍌', a: 'Yellow', w1: 'Red', w2: 'Blue' },
      { q: 'How many ears do you have?', a: 'Two', w1: 'One', w2: 'Three' },
    ];
    const item = words[Math.floor(rand() * words.length)];
    return {
      id: qId,
      type: 'MULTIPLE_CHOICE',
      promptText: item.q,
      promptAudioUrl: audio(qId),
      options: [
        { id: 'opt_c', text: item.a, isCorrect: true },
        { id: 'opt_w1', text: item.w1, isCorrect: false },
        { id: 'opt_w2', text: item.w2, isCorrect: false },
      ].sort(() => rand() - 0.5),
      rewardCoins,
      rewardExp,
    };
  }

  if (grade === 2) {
    const family = [
      { q: 'Who is your mother\'s mother?', a: 'Grandmother', w1: 'Aunt', w2: 'Sister' },
      { q: 'What do you use to write?', a: 'Pencil', w1: 'Eraser', w2: 'Ruler' },
    ];
    const item = family[Math.floor(rand() * family.length)];
    return {
      id: qId,
      type: 'MULTIPLE_CHOICE',
      promptText: item.q,
      promptAudioUrl: audio(qId),
      options: [
        { id: 'opt_c', text: item.a, isCorrect: true },
        { id: 'opt_w1', text: item.w1, isCorrect: false },
        { id: 'opt_w2', text: item.w2, isCorrect: false },
      ].sort(() => rand() - 0.5),
      rewardCoins,
      rewardExp,
    };
  }

  if (grade === 3) {
    const sports = [
      { q: 'I like kicking a ball into the goal. I love...', a: 'Soccer', w1: 'Swimming', w2: 'Chess' },
      { q: 'When it rains, you should take an...', a: 'Umbrella', w1: 'Apple', w2: 'Ice cream' },
    ];
    const item = sports[Math.floor(rand() * sports.length)];
    return {
      id: qId,
      type: 'MULTIPLE_CHOICE',
      promptText: item.q,
      promptAudioUrl: audio(qId),
      options: [
        { id: 'opt_c', text: item.a, isCorrect: true },
        { id: 'opt_w1', text: item.w1, isCorrect: false },
        { id: 'opt_w2', text: item.w2, isCorrect: false },
      ].sort(() => rand() - 0.5),
      rewardCoins,
      rewardExp,
    };
  }

  if (grade === 4) {
    const past = [
      { q: 'Yesterday, he ... (visit) his grandparents.', a: 'visited', w1: 'visits', w2: 'visiting' },
      { q: 'An elephant is ... than a mouse.', a: 'bigger', w1: 'smaller', w2: 'tallest' },
    ];
    const item = past[Math.floor(rand() * past.length)];
    return {
      id: qId,
      type: 'MULTIPLE_CHOICE',
      promptText: item.q,
      promptAudioUrl: audio(qId),
      options: [
        { id: 'opt_c', text: item.a, isCorrect: true },
        { id: 'opt_w1', text: item.w1, isCorrect: false },
        { id: 'opt_w2', text: item.w2, isCorrect: false },
      ].sort(() => rand() - 0.5),
      rewardCoins,
      rewardExp,
    };
  }

  // Grade 5
  const future = [
    { q: 'Tomorrow is Sunday. We ... go camping.', a: 'will', w1: 'did', w2: 'was' },
    { q: 'A person who flies an airplane is a...', a: 'Pilot', w1: 'Doctor', w2: 'Dentist' },
  ];
  const item = future[Math.floor(rand() * future.length)];
  return {
    id: qId,
    type: 'MULTIPLE_CHOICE',
    promptText: item.q,
    promptAudioUrl: audio(qId),
    options: [
      { id: 'opt_c', text: item.a, isCorrect: true },
      { id: 'opt_w1', text: item.w1, isCorrect: false },
      { id: 'opt_w2', text: item.w2, isCorrect: false },
    ].sort(() => rand() - 0.5),
    rewardCoins,
    rewardExp,
  };
}

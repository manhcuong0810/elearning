import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

const GRADE_3_MATH_SYSTEM_PROMPT = `Bạn là "Gia Sư của Moon" 🌙 - người bạn gia sư AI thông thái, tận tâm, chuyên gia sư phạm dạy TẤT CẢ CÁC MÔN HỌC LỚP 3 Tiểu học theo chương trình Giáo dục Phổ thông Việt Nam (sách Kết Nối Tri Thức, Cánh Diều, Chân Trời Sáng Tạo) và chương trình song ngữ quốc tế.

Nhiệm vụ của bạn:
1. Giải đáp và hướng dẫn bài tập ở TẤT CẢ CÁC MÔN HỌC LỚP 3 một cách chuẩn mực, dễ hiểu, khích lệ và thân thiện nhất.
2. Đối tượng học sinh: Trẻ em 8-9 tuổi (Lớp 3). Hãy xưng hô là "Gia Sư của Moon" (hoặc "Gia Sư") và gọi học sinh là "bé", "em" hoặc "Moon".
3. Phạm vi các môn học Lớp 3 bạn phụ trách:
   - 📐 **Môn Toán**: Cộng, trừ, nhân, chia trong phạm vi 10.000 & 100.000; bảng nhân chia 1-9; giải toán có lời văn (rút về đơn vị, gấp một số lên nhiều lần, giảm đi một số lần); tìm thành phần chưa biết (tìm x); chu vi & diện tích hình chữ nhật, hình vuông; đo lường, xem đồng hồ, số La Mã, tiền Việt Nam và Toán tư duy/Toán quốc tế (AMO, Kangaroo, SASMO...).
   - 📖 **Môn Tiếng Việt**: Đọc hiểu văn bản; chính tả; Luyện từ và câu (từ chỉ sự vật, hoạt động, đặc điểm; từ có nghĩa giống nhau/trái ngược nhau; câu kể, câu hỏi, câu khiến, câu cảm; biện pháp so sánh, nhân hóa; dấu câu); Tập làm văn (viết đoạn văn ngắn kể về người thân, bạn bè, thầy cô, tả đồ vật, quê hương, lễ hội, kể lại sự việc, viết thư, thông báo...).
   - 🌍 **Môn Tiếng Anh (English)**: Từ vựng theo chủ đề lớp 3 (Family, School, Colors, Animals, Toys, Body parts, Daily activities, Weather, House...); mẫu câu giao tiếp & ngữ pháp cơ bản; hướng dẫn cách phát âm dễ nhớ, dịch nghĩa và giải bài tập Tiếng Anh.
   - 🌱 **Môn Tự nhiên và Xã hội**: Gia đình & họ hàng; trường học & an toàn; cộng đồng địa phương; thực vật và động vật (các bộ phận của cây, quang hợp, phân loại động vật); các cơ quan trong cơ thể người (tiêu hóa, tuần hoàn, hô hấp, thần kinh); Trái Đất và bầu trời (phương hướng, đới khí hậu, địa hình Trái Đất, Mặt Trời, Mặt Trăng).
   - 🎨 **Các môn học khác Lớp 3**: Đạo đức, Tin học và Công nghệ, Âm nhạc, Mỹ thuật, Giáo dục thể chất, Hoạt động trải nghiệm và các câu hỏi khám phá tri thức phù hợp lứa tuổi tiểu học.
4. Cấu trúc hướng dẫn trả lời linh hoạt theo từng môn:
   - Với **Toán học**: 💡 Tóm tắt & Phân tích đề ➜ 📝 Các bước thực hiện ➜ ✏️ Bài giải chi tiết & Đáp số ➜ 🌟 Mẹo hay ghi nhớ.
   - Với **Tiếng Việt / Tập làm văn**: 💡 Tìm ý & Dàn ý ngắn gọn ➜ ✍️ Bài văn/Đoạn văn mẫu giàu cảm xúc hoặc lời giải chi tiết ➜ 🌟 Từ ngữ hay bé nên dùng.
   - Với **Tiếng Anh**: 🇬🇧 Đáp án & Mẫu câu chuẩn ➜ 🇻🇳 Giải thích nghĩa Tiếng Việt & Ngữ pháp dễ hiểu ➜ 🗣️ Mẹo ghi nhớ từ vựng/phát âm.
   - Với **Tự nhiên và Xã hội & các môn khác**: 💡 Giải thích cốt lõi trực quan, sinh động ➜ 🌍 Liên hệ thực tế gần gũi với bé ➜ 🌟 Điều thú vị cần nhớ.
5. Ngôn từ luôn mang tính yêu thương, động viên, tươi sáng; tuyệt đối không dùng từ ngữ tiêu cực hay quá trừu tượng.`;

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string | Array<{ type: string; text?: string; image_url?: { url: string } }>;
  image?: string;
}

let cachedResolvedChatId: string | null = null;

async function resolveTelegramChatId(botToken: string, rawChatId: string): Promise<string> {
  if (!rawChatId.startsWith('@')) {
    return rawChatId;
  }
  if (cachedResolvedChatId) {
    return cachedResolvedChatId;
  }

  try {
    const targetUsername = rawChatId.slice(1).toLowerCase();
    const res = await fetch(`https://api.telegram.org/bot${botToken}/getUpdates`, {
      method: 'GET',
      signal: AbortSignal.timeout(5000),
    });
    if (res.ok) {
      const data = await res.json();
      const updates: any[] = Array.isArray(data?.result) ? data.result : [];
      for (let i = updates.length - 1; i >= 0; i--) {
        const chat =
          updates[i]?.message?.chat ||
          updates[i]?.edited_message?.chat ||
          updates[i]?.my_chat_member?.chat;
        if (chat?.id) {
          if (
            String(chat.username || '').toLowerCase() === targetUsername ||
            updates.length === 1
          ) {
            cachedResolvedChatId = String(chat.id);
            return cachedResolvedChatId;
          }
        }
      }
      // Fallback to most recent chat id in updates if present
      const lastChat = updates[updates.length - 1]?.message?.chat;
      if (lastChat?.id) {
        cachedResolvedChatId = String(lastChat.id);
        return cachedResolvedChatId;
      }
    }
  } catch {
    // ignore and fallback to rawChatId
  }

  return rawChatId;
}

async function forwardQuestionToTelegram(params: {
  questionText: string;
  attachedImage: string | null;
  studentName?: string;
}): Promise<void> {
  const botToken = process.env.TELEGRAM_BOT_TOKEN?.trim();
  const rawChatId = process.env.TELEGRAM_CHAT_ID?.trim();
  if (!botToken || !rawChatId) return;

  try {
    const chatId = await resolveTelegramChatId(botToken, rawChatId);
    const senderLabel = params.studentName?.trim() ? ` từ ${params.studentName.trim()}` : '';
    const textBody =
      params.questionText.trim() || '📷 [Học sinh gửi hình ảnh đề bài toán]';
    const messageText = `📩 [Gia Sư của Moon] Câu hỏi mới${senderLabel}:\n\n${textBody}`;

    if (params.attachedImage && params.attachedImage.startsWith('data:image/')) {
      const match = params.attachedImage.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/);
      if (match) {
        const mimeType = match[1];
        const base64Data = match[2];
        const binaryBuffer = Buffer.from(base64Data, 'base64');
        const ext = mimeType.split('/')[1] || 'jpg';
        const formData = new FormData();
        formData.append('chat_id', chatId);
        formData.append('caption', messageText.slice(0, 1024));
        formData.append(
          'photo',
          new Blob([binaryBuffer], { type: mimeType }),
          `question.${ext}`
        );

        await fetch(`https://api.telegram.org/bot${botToken}/sendPhoto`, {
          method: 'POST',
          body: formData,
          signal: AbortSignal.timeout(10000),
        });
        return;
      }
    }

    await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: messageText.slice(0, 4000),
      }),
      signal: AbortSignal.timeout(10000),
    });
  } catch (err) {
    console.warn('Telegram notification failed:', err);
  }
}

export async function POST(req: Request) {
  try {
    const apiKey = process.env.DEEPSEEK_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Chưa cấu hình API Key cho DeepSeek trên máy chủ.' },
        { status: 500 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const rawMessages: ChatMessage[] = Array.isArray(body.messages) ? [...body.messages] : [];
    const attachedImage = typeof body.image === 'string' && body.image.trim().length > 0 ? body.image.trim() : null;

    // Support single 'message' payload without duplicating existing last message
    const incomingText = typeof body.message === 'string' ? body.message.trim() : '';
    const lastRaw = rawMessages[rawMessages.length - 1];

    if (incomingText && (!lastRaw || lastRaw.content !== incomingText)) {
      rawMessages.push({ role: 'user', content: incomingText });
    } else if (attachedImage && rawMessages.length === 0) {
      rawMessages.push({
        role: 'user',
        content: 'Bé gửi hình ảnh đề bài toán này, Gia Sư hãy đọc kỹ các chữ số, câu hỏi và hình vẽ trong ảnh rồi hướng dẫn bé giải từng bước chi tiết nhé!',
      });
    }

    if (!Array.isArray(rawMessages) || rawMessages.length === 0) {
      return NextResponse.json(
        { error: 'Vui lòng nhập nội dung câu hỏi hoặc gửi ảnh đề bài toán.' },
        { status: 400 }
      );
    }

    // Build message array with Grade 3 Math system prompt
    const messagesPayload: any[] = [
      { role: 'system', content: GRADE_3_MATH_SYSTEM_PROMPT },
    ];

    rawMessages.forEach((m, idx) => {
      const isLast = idx === rawMessages.length - 1;
      const role = m.role === 'assistant' ? 'assistant' : 'user';

      if (role === 'user' && isLast && attachedImage) {
        const textContent =
          typeof m.content === 'string' &&
          m.content.trim().length > 0 &&
          m.content.trim() !== 'Đề bài trong ảnh đính kèm 📷'
            ? m.content.trim()
            : 'Bé gửi hình ảnh đề bài toán này, Gia Sư hãy đọc kỹ các chữ số, câu hỏi và hình vẽ trong ảnh rồi hướng dẫn bé giải từng bước chi tiết nhé!';

        messagesPayload.push({
          role: 'user',
          content: [
            {
              type: 'text',
              text: textContent,
            },
            {
              type: 'image_url',
              image_url: { url: attachedImage },
            },
          ],
        });
      } else {
        messagesPayload.push({
          role,
          content: typeof m.content === 'string' ? m.content.slice(0, 2000) : m.content,
        });
      }
    });

    const studentName = typeof body.studentName === 'string' ? body.studentName.trim() : undefined;
    const latestUserContent =
      incomingText ||
      (typeof rawMessages[rawMessages.length - 1]?.content === 'string'
        ? (rawMessages[rawMessages.length - 1].content as string)
        : '');

    const telegramPromise = forwardQuestionToTelegram({
      questionText: latestUserContent,
      attachedImage,
      studentName,
    });

    const [deepseekResponse] = await Promise.all([
      fetch('https://api.deepseek.com/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: messagesPayload,
          temperature: 0.3,
          max_tokens: 4096,
        }),
        signal: AbortSignal.timeout(45000),
      }),
      telegramPromise,
    ]);

    if (!deepseekResponse.ok) {
      const errorText =
        typeof deepseekResponse.text === 'function'
          ? await deepseekResponse.text().catch(() => '')
          : '';
      console.error('DeepSeek API Error:', deepseekResponse.status, errorText);
      return NextResponse.json(
        { error: 'Gia Sư của Moon đang bận một chút, bé vui lòng thử lại sau giây lát nhé!' },
        { status: 502 }
      );
    }

    const data = await deepseekResponse.json();
    const messageObj = data?.choices?.[0]?.message;
    const reply =
      messageObj?.content?.trim() ||
      messageObj?.reasoning_content?.trim() ||
      'Gia Sư của Moon đã nhận được câu hỏi nhưng chưa có phản hồi, bé hãy thử lại nhé!';

    return NextResponse.json({ reply });
  } catch (error) {
    console.error('Error in tutor route:', error);
    return NextResponse.json(
      { error: 'Đã có lỗi xảy ra khi kết nối tới gia sư. Bé thử lại nhé!' },
      { status: 500 }
    );
  }
}

import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

const GRADE_3_MATH_SYSTEM_PROMPT = `Bạn là "Gia Sư của Moon" 🌙 - người bạn gia sư AI thông thái, chuyên gia sư phạm dạy môn Toán Lớp 3 Tiểu học theo chương trình Giáo dục Phổ thông Việt Nam (sách Kết Nối Tri Thức, Cánh Diều, Chân Trời Sáng Tạo).

Nhiệm vụ của bạn:
1. Giải đáp và hướng dẫn các bài toán Lớp 3 một cách chuẩn mực, dễ hiểu, khích lệ và thân thiện nhất.
2. Đối tượng học sinh: Trẻ em 8-9 tuổi (Lớp 3). Hãy xưng hô là "Gia Sư của Moon" (hoặc "Gia Sư") và gọi học sinh là "bé" hoặc "em" hoặc "Moon".
3. Cấu trúc hướng dẫn giải bài toán có lời văn hoặc bài tính:
   - 💡 **Tóm tắt & Phân tích đề bài**: Giúp bé hiểu bài toán cho biết gì và hỏi gì.
   - 📝 **Các bước thực hiện**: Giải thích cặn kẽ từng bước tính (Bước 1, Bước 2).
   - ✏️ **Bài giải chi tiết**: Trình bày câu lời giải, phép tính, đơn vị và Đáp số chuẩn mực như trong vở bài tập.
   - 🌟 **Mẹo hay ghi nhớ**: Công thức ngắn gọn hoặc câu chúc khích lệ bé.
4. Trọng tâm kiến thức Lớp 3:
   - Các phép tính cộng, trừ, nhân, chia trong phạm vi 1.000 và 10.000.
   - Bảng nhân, bảng chia từ 1 đến 9; nhân/chia có nhớ và chia có dư.
   - Dạng toán giải bằng hai bước tính, dạng toán "Rút về đơn vị".
   - Tìm thành phần chưa biết (tìm x: x + a, a - x, x * a, x : a).
   - Chu vi & diện tích hình chữ nhật, hình vuông.
   - Đo lường (gam, ki-lô-gam, mi-li-lít, lít, mi-li-mét, mét, ki-lô-mét).
   - Xem đồng hồ, số La Mã, lịch, tiền Việt Nam.
5. Nếu câu hỏi không thuộc phạm vi toán học: Nhẹ nhàng nhắc nhở bé và mời bé cùng giải các bài toán Lớp 3 thú vị.
6. Ngôn từ luôn mang tính yêu thương, động viên, tuyệt đối không dùng từ ngữ tiêu cực hay quá trừu tượng.`;

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string | Array<{ type: string; text?: string; image_url?: { url: string } }>;
  image?: string;
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
    const rawMessages: ChatMessage[] = body.messages || [];
    const attachedImage = typeof body.image === 'string' && body.image.trim().length > 0 ? body.image.trim() : null;

    // Support single 'message' payload
    if (typeof body.message === 'string' && body.message.trim().length > 0) {
      rawMessages.push({ role: 'user', content: body.message.trim() });
    } else if (attachedImage && rawMessages.length === 0) {
      rawMessages.push({
        role: 'user',
        content: 'Bé gửi hình ảnh đề bài toán này, Gia Sư hãy đọc đề trong hình và hướng dẫn giải từng bước chi tiết nhé!',
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
        messagesPayload.push({
          role: 'user',
          content: [
            {
              type: 'text',
              text:
                typeof m.content === 'string' && m.content.trim().length > 0
                  ? m.content.trim()
                  : 'Bé gửi hình ảnh đề bài toán này, Gia Sư hãy đọc đề trong ảnh và hướng dẫn giải từng bước chi tiết nhé!',
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

    const deepseekResponse = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'deepseek-flash',
        messages: messagesPayload,
        temperature: 0.3,
        max_tokens: 1500,
      }),
    });

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
    const reply =
      data?.choices?.[0]?.message?.content?.trim() ||
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

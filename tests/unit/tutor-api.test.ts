import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { POST } from '@/app/api/tutor/route';

describe('POST /api/tutor', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv, DEEPSEEK_API_KEY: 'test-deepseek-key' };
    vi.restoreAllMocks();
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('returns 400 when message or messages are missing', async () => {
    const req = new Request('http://localhost:3000/api/tutor', {
      method: 'POST',
      body: JSON.stringify({}),
      headers: { 'Content-Type': 'application/json' },
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBeDefined();
  });

  it('calls DeepSeek API with system prompt and returns the assistant reply', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        choices: [
          {
            message: {
              role: 'assistant',
              content: 'Chào bé! Để tính chu vi hình chữ nhật, ta lấy (chiều dài + chiều rộng) x 2 nhé!',
            },
          },
        ],
      }),
    });
    vi.stubGlobal('fetch', mockFetch);

    const req = new Request('http://localhost:3000/api/tutor', {
      method: 'POST',
      body: JSON.stringify({
        messages: [{ role: 'user', content: 'Làm thế nào để tính chu vi hình chữ nhật ạ?' }],
      }),
      headers: { 'Content-Type': 'application/json' },
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.reply).toContain('chu vi hình chữ nhật');

    expect(mockFetch).toHaveBeenCalledWith(
      'https://api.deepseek.com/chat/completions',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          Authorization: 'Bearer test-deepseek-key',
        }),
      })
    );
  });

  it('handles DeepSeek API errors gracefully', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
    });
    vi.stubGlobal('fetch', mockFetch);

    const req = new Request('http://localhost:3000/api/tutor', {
      method: 'POST',
      body: JSON.stringify({
        message: 'Tìm x: x + 15 = 45',
      }),
      headers: { 'Content-Type': 'application/json' },
    });

    const res = await POST(req);
    expect(res.status).toBe(502);
    const data = await res.json();
    expect(data.error).toBeDefined();
  });

  it('supports sending image data URL to DeepSeek vision API (deepseek-flash)', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        choices: [
          {
            message: {
              role: 'assistant',
              content: 'Gia Sư của Moon đã đọc bài toán trong ảnh: Một hình chữ nhật có chu vi 24cm...',
            },
          },
        ],
      }),
    });
    vi.stubGlobal('fetch', mockFetch);

    const req = new Request('http://localhost:3000/api/tutor', {
      method: 'POST',
      body: JSON.stringify({
        message: 'Giải bài trong ảnh giúp em với',
        image: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
      }),
      headers: { 'Content-Type': 'application/json' },
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.reply).toContain('chu vi 24cm');

    expect(mockFetch).toHaveBeenCalledWith(
      'https://api.deepseek.com/chat/completions',
      expect.objectContaining({
        body: expect.stringContaining('"type":"image_url"'),
      })
    );
  });

  it('forwards user text question to Telegram when TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID are configured', async () => {
    process.env.TELEGRAM_BOT_TOKEN = '123456:ABC-DEF';
    process.env.TELEGRAM_CHAT_ID = '987654321';

    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        ok: true,
        choices: [
          {
            message: {
              role: 'assistant',
              content: 'Kết quả của 12 x 5 là 60 nhé bé!',
            },
          },
        ],
      }),
    });
    vi.stubGlobal('fetch', mockFetch);

    const req = new Request('http://localhost:3000/api/tutor', {
      method: 'POST',
      body: JSON.stringify({
        message: '12 x 5 bằng bao nhiêu ạ?',
        studentName: 'Bé Moon',
      }),
      headers: { 'Content-Type': 'application/json' },
    });

    const res = await POST(req);
    expect(res.status).toBe(200);

    expect(mockFetch).toHaveBeenCalledWith(
      'https://api.telegram.org/bot123456:ABC-DEF/sendMessage',
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: expect.stringContaining('12 x 5 bằng bao nhiêu ạ?'),
      })
    );
  });

  it('forwards user image question to Telegram sendPhoto when image is attached', async () => {
    process.env.TELEGRAM_BOT_TOKEN = '123456:ABC-DEF';
    process.env.TELEGRAM_CHAT_ID = '987654321';

    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        ok: true,
        choices: [
          {
            message: {
              role: 'assistant',
              content: 'Đã giải bài trong ảnh!',
            },
          },
        ],
      }),
    });
    vi.stubGlobal('fetch', mockFetch);

    const req = new Request('http://localhost:3000/api/tutor', {
      method: 'POST',
      body: JSON.stringify({
        message: 'Giải bài toán hình học này giúp con',
        image: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
      }),
      headers: { 'Content-Type': 'application/json' },
    });

    const res = await POST(req);
    expect(res.status).toBe(200);

    expect(mockFetch).toHaveBeenCalledWith(
      'https://api.telegram.org/bot123456:ABC-DEF/sendPhoto',
      expect.objectContaining({
        method: 'POST',
      })
    );
  });
});

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { POST, GET } from '@/app/api/tutor/route';

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

  it('auto-resolves @username TELEGRAM_CHAT_ID to numeric chat_id via getUpdates', async () => {
    process.env.TELEGRAM_BOT_TOKEN = '9112563920:TEST_TOKEN';
    process.env.TELEGRAM_CHAT_ID = '@manhcuong0810';

    const mockFetch = vi.fn().mockImplementation(async (url: string) => {
      if (url.includes('/getUpdates')) {
        return {
          ok: true,
          json: async () => ({
            ok: true,
            result: [
              {
                update_id: 1,
                message: {
                  chat: {
                    id: 555666777,
                    username: 'manhcuong0810',
                  },
                },
              },
            ],
          }),
        };
      }
      return {
        ok: true,
        json: async () => ({
          ok: true,
          choices: [{ message: { role: 'assistant', content: 'Trả lời bài toán!' } }],
        }),
      };
    });
    vi.stubGlobal('fetch', mockFetch);

    const req = new Request('http://localhost:3000/api/tutor', {
      method: 'POST',
      body: JSON.stringify({
        message: '25 x 4 bằng mấy?',
      }),
      headers: { 'Content-Type': 'application/json' },
    });

    const res = await POST(req);
    expect(res.status).toBe(200);

    expect(mockFetch).toHaveBeenCalledWith(
      'https://api.telegram.org/bot9112563920:TEST_TOKEN/sendMessage',
      expect.objectContaining({
        method: 'POST',
        body: expect.stringContaining('"chat_id":"555666777"'),
      })
    );
  });

  it('includes all Grade 3 subjects (Toán, Tiếng Việt, Tiếng Anh, Tự nhiên và Xã hội) in system prompt', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        choices: [
          {
            message: {
              role: 'assistant',
              content: 'Đoạn văn mẫu tả người thân lớp 3...',
            },
          },
        ],
      }),
    });
    vi.stubGlobal('fetch', mockFetch);

    const req = new Request('http://localhost:3000/api/tutor', {
      method: 'POST',
      body: JSON.stringify({
        message: 'Giúp em viết đoạn văn ngắn kể về mẹ của em môn Tiếng Việt lớp 3',
      }),
      headers: { 'Content-Type': 'application/json' },
    });

    const res = await POST(req);
    expect(res.status).toBe(200);

    const deepseekCall = mockFetch.mock.calls.find((c) =>
      String(c[0]).includes('api.deepseek.com')
    );
    expect(deepseekCall).toBeDefined();
    const sentBody = JSON.parse(deepseekCall![1].body);
    const systemPrompt = sentBody.messages[0].content;
    expect(systemPrompt).toMatch(/Toán/i);
    expect(systemPrompt).toMatch(/Tiếng Việt/i);
    expect(systemPrompt).toMatch(/Tiếng Anh/i);
    expect(systemPrompt).toMatch(/Tự nhiên và Xã hội/i);
  });

  it('GET /api/tutor returns incoming text, photo, and video messages from Telegram getUpdates', async () => {
    process.env.TELEGRAM_BOT_TOKEN = '9112563920:TEST_TOKEN';
    process.env.TELEGRAM_CHAT_ID = '640222844';

    const nowSec = Math.floor(Date.now() / 1000);
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        ok: true,
        result: [
          {
            update_id: 101,
            message: {
              message_id: 501,
              chat: { id: 640222844, username: 'manhcuong0810' },
              date: nowSec,
              text: 'Chào con, bài này con nhân 6 trước nhé!',
            },
          },
          {
            update_id: 102,
            message: {
              message_id: 502,
              chat: { id: 640222844, username: 'manhcuong0810' },
              date: nowSec + 1,
              caption: 'Ảnh bài giải mẫu của thầy',
              photo: [
                { file_id: 'small_photo_id', width: 100, height: 100 },
                { file_id: 'large_photo_id', width: 800, height: 600 },
              ],
            },
          },
          {
            update_id: 103,
            message: {
              message_id: 503,
              chat: { id: 640222844, username: 'manhcuong0810' },
              date: nowSec + 2,
              caption: 'Video hướng dẫn cách đặt tính',
              video: {
                file_id: 'video_file_id_123',
                mime_type: 'video/mp4',
              },
            },
          },
        ],
      }),
    });
    vi.stubGlobal('fetch', mockFetch);

    const req = new Request('http://localhost:3000/api/tutor?since=0', {
      method: 'GET',
    });

    const res = await GET(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(Array.isArray(data.messages)).toBe(true);
    expect(data.messages.length).toBe(3);

    expect(data.messages[0]).toMatchObject({
      id: 'tg-501',
      content: 'Chào con, bài này con nhân 6 trước nhé!',
    });
    expect(data.messages[1]).toMatchObject({
      id: 'tg-502',
      content: 'Ảnh bài giải mẫu của thầy',
      image: '/api/tutor?fileId=large_photo_id',
    });
    expect(data.messages[2]).toMatchObject({
      id: 'tg-503',
      content: 'Video hướng dẫn cách đặt tính',
      video: '/api/tutor?fileId=video_file_id_123',
    });
  });

  it('GET /api/tutor?fileId=... proxies media file from Telegram getFile', async () => {
    process.env.TELEGRAM_BOT_TOKEN = '9112563920:TEST_TOKEN';

    const mockFetch = vi.fn().mockImplementation(async (url: string) => {
      if (url.includes('/getFile')) {
        return {
          ok: true,
          json: async () => ({
            ok: true,
            result: { file_path: 'videos/file_10.mp4' },
          }),
        };
      }
      return new Response(new Uint8Array([1, 2, 3, 4]), {
        status: 200,
        headers: { 'Content-Type': 'video/mp4' },
      });
    });
    vi.stubGlobal('fetch', mockFetch);

    const req = new Request('http://localhost:3000/api/tutor?fileId=video_file_id_123', {
      method: 'GET',
    });

    const res = await GET(req);
    expect(res.status).toBe(200);
    expect(res.headers.get('Content-Type')).toContain('video/mp4');
  });
});

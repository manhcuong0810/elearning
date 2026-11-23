import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { Grade3TutorFab } from '@/components/tutor/Grade3TutorFab';

describe('Grade3TutorFab', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('renders floating action button with >= 48x48px touch target and opens chat window on click', () => {
    render(<Grade3TutorFab />);

    const fabButton = screen.getByTestId('grade3-tutor-fab-btn');
    expect(fabButton).toBeDefined();
    expect(fabButton.className).toMatch(/min-w-\[48px\]|w-14|w-16|h-14|h-16/);

    // Chat window is initially hidden
    expect(screen.queryByTestId('grade3-tutor-window')).toBeNull();

    // Click FAB to open chat
    fireEvent.click(fabButton);
    expect(screen.getByTestId('grade3-tutor-window')).toBeDefined();
    expect(screen.getAllByText(/Gia Sư của Moon/i).length).toBeGreaterThanOrEqual(1);

    // Verify avatar image is rendered
    const avatarImages = screen.getAllByRole('img', { name: /Gia Sư của Moon/i });
    expect(avatarImages.length).toBeGreaterThanOrEqual(1);
    expect(avatarImages[0].getAttribute('src')).toBe('/images/tutor/moon-avatar.png');

    // Close button dismisses chat
    const closeBtn = screen.getByTestId('tutor-close-btn');
    fireEvent.click(closeBtn);
    expect(screen.queryByTestId('grade3-tutor-window')).toBeNull();
  });

  it('sends question on prompt suggestion click and displays tutor response', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        reply: 'Để tính diện tích hình chữ nhật, ta lấy Chiều dài nhân Chiều rộng (cùng đơn vị đo) nhé bé!',
      }),
    });
    vi.stubGlobal('fetch', mockFetch);

    render(<Grade3TutorFab />);
    fireEvent.click(screen.getByTestId('grade3-tutor-fab-btn'));

    // Click suggestion pill
    const suggestionBtn = screen.getByText(/diện tích hình chữ nhật/i);
    fireEvent.click(suggestionBtn);

    // Shows user message in chat
    expect(screen.getAllByText(/diện tích hình chữ nhật/i).length).toBeGreaterThanOrEqual(2);

    // Waits for tutor reply to be rendered
    await waitFor(() => {
      expect(
        screen.getByText(/Chiều dài nhân Chiều rộng/i)
      ).toBeDefined();
    });
  });

  it('allows typing custom math question and sending with Enter or Send button', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        reply: 'Bài toán tìm x: x + 15 = 45 => x = 45 - 15 = 30.',
      }),
    });
    vi.stubGlobal('fetch', mockFetch);

    render(<Grade3TutorFab />);
    fireEvent.click(screen.getByTestId('grade3-tutor-fab-btn'));

    const input = screen.getByPlaceholderText(/Nhập đề bài toán lớp 3/i);
    fireEvent.change(input, { target: { value: 'Giải giúp em bài toán: x + 15 = 45' } });

    const sendBtn = screen.getByTestId('tutor-send-btn');
    fireEvent.click(sendBtn);

    await waitFor(() => {
      expect(screen.getByText(/x \+ 15 = 45 => x = 45 - 15 = 30/i)).toBeDefined();
    });
  });

  it('renders microphone button and camera/photo upload button with >= 40x40px touch targets', () => {
    render(<Grade3TutorFab />);
    fireEvent.click(screen.getByTestId('grade3-tutor-fab-btn'));

    const micBtn = screen.getByTestId('tutor-mic-btn');
    expect(micBtn).toBeDefined();
    expect(micBtn.className).toMatch(/min-w-\[40px\]|min-h-\[40px\]|min-w-\[44px\]|min-h-\[44px\]|min-w-\[48px\]/);

    const cameraBtn = screen.getByTestId('tutor-camera-btn');
    expect(cameraBtn).toBeDefined();
    expect(cameraBtn.className).toMatch(/min-w-\[40px\]|min-h-\[40px\]|min-w-\[44px\]|min-h-\[44px\]|min-w-\[48px\]/);

    const fileInput = screen.getByTestId('tutor-file-input');
    expect(fileInput).toBeDefined();
    expect(fileInput.getAttribute('type')).toBe('file');
    expect(fileInput.getAttribute('accept')).toContain('image');
  });

  it('supports selecting photo of math problem, shows preview thumbnail, and sends with image payload', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        reply: 'Cú Mèo đã đọc bài toán trong ảnh: Chiều dài 12m, chiều rộng 6m...',
      }),
    });
    vi.stubGlobal('fetch', mockFetch);

    // Mock FileReader
    class MockFileReader {
      result = 'data:image/jpeg;base64,mockimagedata';
      onload: (() => void) | null = null;
      readAsDataURL() {
        setTimeout(() => this.onload?.(), 10);
      }
    }
    vi.stubGlobal('FileReader', MockFileReader);

    render(<Grade3TutorFab />);
    fireEvent.click(screen.getByTestId('grade3-tutor-fab-btn'));

    const fileInput = screen.getByTestId('tutor-file-input');
    const fakeFile = new File(['dummy content'], 'math-exercise.jpg', { type: 'image/jpeg' });
    fireEvent.change(fileInput, { target: { files: [fakeFile] } });

    // Expect preview thumbnail to appear
    await waitFor(() => {
      expect(screen.getByTestId('tutor-image-preview')).toBeDefined();
    });

    const sendBtn = screen.getByTestId('tutor-send-btn');
    fireEvent.click(sendBtn);

    await waitFor(() => {
      expect(screen.getByText(/Chiều dài 12m, chiều rộng 6m/i)).toBeDefined();
    });

    expect(mockFetch).toHaveBeenCalledWith(
      '/api/tutor',
      expect.objectContaining({
        body: expect.stringContaining('mockimagedata'),
      })
    );
  });

  it('renders tutor responses strictly as formatted text message without voice/read-aloud button', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        reply: 'Lời giải bài toán: Ta lấy 24 : 4 = 6 (cm). Đáp số: 6 cm.',
      }),
    });
    vi.stubGlobal('fetch', mockFetch);

    render(<Grade3TutorFab />);
    fireEvent.click(screen.getByTestId('grade3-tutor-fab-btn'));

    const input = screen.getByPlaceholderText(/Nhập đề bài toán lớp 3/i);
    fireEvent.change(input, { target: { value: 'Một hình vuông có chu vi 24cm, tính cạnh hình vuông' } });
    fireEvent.click(screen.getByTestId('tutor-send-btn'));

    await waitFor(() => {
      expect(screen.getByText(/Lời giải bài toán/i)).toBeDefined();
    });

    // Verify there is no "Nghe đọc" button or audio speech trigger
    expect(screen.queryByText(/Nghe đọc/i)).toBeNull();
    expect(screen.queryByTitle(/Nghe đọc lời giải/i)).toBeNull();
  });

  it('handles server errors gracefully and displays informative message', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      json: async () => ({
        error: 'Gia Sư của Moon đang bận một chút, bé vui lòng thử lại sau giây lát nhé!',
      }),
    });
    vi.stubGlobal('fetch', mockFetch);

    render(<Grade3TutorFab />);
    fireEvent.click(screen.getByTestId('grade3-tutor-fab-btn'));

    const input = screen.getByPlaceholderText(/Nhập đề bài toán lớp 3/i);
    fireEvent.change(input, { target: { value: '1+1=?' } });
    fireEvent.click(screen.getByTestId('tutor-send-btn'));

    await waitFor(() => {
      expect(
        screen.getByText(/Gia Sư của Moon đang bận một chút/i)
      ).toBeDefined();
    });
  });
});

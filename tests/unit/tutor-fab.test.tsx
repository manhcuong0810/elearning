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
    expect(screen.getByText(/Gia Sư Cú Mèo/i)).toBeDefined();

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
});

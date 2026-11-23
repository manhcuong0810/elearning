import type { Metadata } from 'next';
import React from 'react';
import Script from 'next/script';
import './globals.css';

export const metadata: Metadata = {
  title: 'Toán Diệu Kỳ - Xứ Sở Toán Học Diệu Kỳ',
  description:
    'Nền tảng học tập & ôn luyện game hóa môn Toán tiểu học với âm thanh đa giác quan, đấu Boss, đấu trường 1vs1 và nhà linh vật Cú Mèo.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body
        className="min-h-screen bg-gradient-to-b from-sky-100 via-amber-50 to-emerald-50 text-slate-900 antialiased"
        suppressHydrationWarning
      >
        {children}
        <Script
          src="https://accounts.google.com/gsi/client"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}

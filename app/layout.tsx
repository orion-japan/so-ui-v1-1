import './styles/globals.css';
import './styles/markdown.scss';

import React from 'react';
import type { Metadata } from 'next';
import { AuthProvider } from './context/AuthContext'; // 👈 追加

export const metadata: Metadata = {
  title: 'iros-Sofia',
  description: 'Sofia 共鳴UI',
};

// ✅ ロケールは暫定固定
function getLocaleOnServer(): string {
  return 'ja';
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = getLocaleOnServer();

  return (
    <html lang={locale} className="h-full">
      <head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, viewport-fit=cover"
        />
      </head>
      <body className="min-h-screen h-full w-full overflow-x-hidden">
        {/* ✅ Sofia共鳴UIのコンテナ */}
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}

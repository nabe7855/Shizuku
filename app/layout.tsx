// src/app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";
import React from "react";

export const metadata: Metadata = {
  title: "Mii/Shizuku: AIマインドフルネスジャーナル",
  description: "AIが感情と行動を見つめ直すマインドフルネス日記アプリ",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <head>
        {/* Google Fonts */}
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@300;400;500;700&display=swap"
          rel="stylesheet"
        />
        {/* Google Sign-In */}
        <script src="https://accounts.google.com/gsi/client" async defer />
      </head>
      <body
        style={{
          backgroundColor: "var(--background)",
          color: "var(--foreground)",
          fontFamily: "'Noto Sans JP', sans-serif",
        }}
      >
        {children}
      </body>
    </html>
  );
}

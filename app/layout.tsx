import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ai-mukjjang",
  description: "AI가 블로그 후기를 분석해 신뢰도 기반 맛집 리스트를 제공합니다."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ThemeInit from "./ThemeInit";
import RobotAssistant from "../components/RobotAssistant";

const inter = Inter({
  subsets: ["latin", "vietnamese"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "PhishArmor AI - Hệ thống giám sát & Phòng thủ Phishing",
  description: "Bảo vệ thời gian thực trước các nguy cơ lừa đảo trực tuyến với trí tuệ nhân tạo PhoBERT & XAI",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" suppressHydrationWarning className={inter.variable}>
      <body className={`${inter.className} antialiased min-h-full flex flex-col font-sans`}>
        <ThemeInit />
        {children}
        <RobotAssistant />
      </body>
    </html>
  );
}

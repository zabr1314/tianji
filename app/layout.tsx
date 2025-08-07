import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { Navbar } from "@/components/navbar";
import "./globals.css";

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(defaultUrl),
  title: "天机AI - 传统智慧遇见现代AI | 八字命理分析平台",
  description: "天机AI结合千年易学智慧与先进人工智能技术，提供八字命盘分析、合盘配对、日常卜卦、运势预测等专业命理服务。传统智慧，现代科技，为您的人生指路明灯。",
  keywords: "天机AI,八字分析,命理预测,易经卜卦,八字合盘,运势分析,AI算命,传统文化,人工智能,生辰八字",
  authors: [{ name: "天机AI团队" }],
  creator: "天机AI",
  publisher: "天机AI",
  openGraph: {
    title: "天机AI - 传统智慧遇见现代AI",
    description: "专业的AI驱动命理分析平台，结合千年易学智慧与现代科技",
    url: defaultUrl,
    siteName: "天机AI",
    locale: "zh_CN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "天机AI - 传统智慧遇见现代AI",
    description: "专业的AI驱动命理分析平台",
  },
  robots: {
    index: true,
    follow: true,
  },
};

const geistSans = Geist({
  variable: "--font-geist-sans",
  display: "swap",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body className={`${geistSans.className} antialiased min-h-screen bg-amber-50/30 dark:bg-slate-900`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Navbar />
          <main>
            {children}
          </main>
        </ThemeProvider>
      </body>
    </html>
  );
}

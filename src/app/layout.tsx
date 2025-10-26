import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/theme-provider";
import { SessionProviderWrapper } from "@/components/providers/session-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "OLT & ONU Monitoring Panel",
  description: "Comprehensive monitoring dashboard for Optical Line Terminal and Optical Network Unit devices",
  keywords: ["OLT", "ONU", "Fiber Optic", "Monitoring", "Network", "Telecommunications"],
  authors: [{ name: "Network Admin Team" }],
  icons: {
    icon: "https://z-cdn.chatglm.cn/z-ai/static/logo.svg",
  },
  openGraph: {
    title: "OLT & ONU Monitoring Panel",
    description: "Real-time monitoring dashboard for fiber optic network devices",
    url: "https://chat.z.ai",
    siteName: "Network Monitoring",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "OLT & ONU Monitoring Panel",
    description: "Real-time monitoring dashboard for fiber optic network devices",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <SessionProviderWrapper>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {children}
            <Toaster />
          </ThemeProvider>
        </SessionProviderWrapper>
      </body>
    </html>
  );
}

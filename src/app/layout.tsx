import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Better Prompt - AI Prompt Optimizer",
  description: "Transform your ideas into powerful, optimized prompts that get better results from AI models. Free prompt optimization tool using advanced AI.",
  keywords: ["AI prompt optimizer", "prompt engineering", "ChatGPT prompts", "AI tools", "prompt improvement", "OpenRouter", "free AI tools"],
  authors: [{ name: "Better Prompt Team" }],
  creator: "Better Prompt",
  publisher: "Better Prompt",
  
  // Favicon and icons
  icons: {
    icon: [
      { url: "/better-propt-1.jpeg", sizes: "any", type: "image/jpeg" },
      { url: "/better-propt-1.jpeg", sizes: "32x32", type: "image/jpeg" },
      { url: "/better-propt-1.jpeg", sizes: "16x16", type: "image/jpeg" },
    ],
    apple: [
      { url: "/better-propt-1.jpeg", sizes: "180x180", type: "image/jpeg" },
    ],
    shortcut: "/better-propt-1.jpeg",
  },
  
  // Open Graph (Facebook, LinkedIn, etc.)
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://better-prompt.vercel.app",
    title: "Better Prompt - AI Prompt Optimizer",
    description: "Transform your ideas into powerful, optimized prompts that get better results from AI models. Free prompt optimization tool using advanced AI.",
    siteName: "Better Prompt",
    images: [
      {
        url: "/better-propt-1.jpeg",
        width: 1200,
        height: 630,
        alt: "Better Prompt - AI Prompt Optimizer Tool",
        type: "image/jpeg",
      },
    ],
  },
  
  // Twitter Cards
  twitter: {
    card: "summary_large_image",
    title: "Better Prompt - AI Prompt Optimizer",
    description: "Transform your vague ideas into powerful, optimized prompts that get better results from AI models. Free AI tool.",
    images: ["/better-propt-1.jpeg"],
    creator: "@BetterPrompt",
    site: "@BetterPrompt",
  },
  
  // Additional SEO
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  
  // Verification (add your own verification codes)
  verification: {
    google: "your-google-verification-code",
    yandex: "your-yandex-verification-code",
    yahoo: "your-yahoo-verification-code",
  },
  
  // App specific
  category: "technology",
  classification: "AI Tools",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* Additional favicon formats for better compatibility */}
        <link rel="icon" href="/better-propt-1.jpeg" sizes="any" />
        <link rel="icon" href="/better-propt-1.jpeg" type="image/jpeg" />
        <link rel="apple-touch-icon" href="/better-propt-1.jpeg" />
        <link rel="shortcut icon" href="/better-propt-1.jpeg" />
        
        {/* PWA support */}
        <meta name="theme-color" content="#6366f1" />
        <meta name="application-name" content="Better Prompt" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Better Prompt" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-TileColor" content="#6366f1" />
        <meta name="msapplication-TileImage" content="/better-propt-1.jpeg" />
        
        {/* Additional SEO */}
        <meta name="format-detection" content="telephone=no" />
        <meta name="color-scheme" content="light dark" />
        
        {/* Canonical URL */}
        <link rel="canonical" href="https://better-prompt.vercel.app" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}

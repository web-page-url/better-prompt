import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://better-prompt-alpha.vercel.app"),
  title: "Better Prompt - AI Prompt Optimizer",
  description: "Transform your ideas into powerful, optimized prompts that get better results from AI models. Free prompt optimization tool using advanced AI.",
  keywords: ["AI prompt optimizer", "prompt engineering", "ChatGPT prompts", "AI tools", "prompt improvement", "OpenRouter", "free AI tools"],
  authors: [{ name: "Better Prompt Team" }],
  creator: "Better Prompt",
  publisher: "Better Prompt",
  
  // Favicon and icons
  icons: {
    icon: [
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon.ico", sizes: "any" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
  },
  
  // Open Graph (Facebook, LinkedIn, etc.)
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://better-prompt-alpha.vercel.app",
    title: "Better Prompt - AI Prompt Optimizer",
    description: "Transform your ideas into powerful, optimized prompts that get better results from AI models. Free prompt optimization tool using advanced AI.",
    siteName: "Better Prompt",
    images: [
      {
        url: "/better-prompt-alpha.png",
        width: 1200,
        height: 630,
        alt: "Better Prompt - AI Prompt Optimizer Tool",
        type: "image/png",
      },
    ],
  },

  // Twitter Cards
  twitter: {
    card: "summary_large_image",
    title: "Better Prompt - AI Prompt Optimizer",
    description: "Transform your vague ideas into powerful, optimized prompts that get better results from AI models. Free AI tool.",
    images: ["/better-prompt-alpha.png"],
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
        {/* Favicon for all screen sizes */}
        <link rel="icon" type="image/x-icon" href="/favicon.ico" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="192x192" href="/android-chrome-192x192.png" />
        <link rel="icon" type="image/png" sizes="512x512" href="/android-chrome-512x512.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/site.webmanifest" />

        {/* Microsoft tiles */}
        <meta name="msapplication-TileColor" content="#00ffff" />
        <meta name="msapplication-TileImage" content="/mstile-150x150.png" />
        <meta name="msapplication-config" content="/browserconfig.xml" />

        {/* Safari pinned tab */}
        <link rel="mask-icon" href="/safari-pinned-tab.svg" color="#00ffff" />

        {/* PWA support */}
        <meta name="theme-color" content="#00ffff" />
        <meta name="application-name" content="Better Prompt" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Better Prompt" />
        <meta name="mobile-web-app-capable" content="yes" />

        {/* Additional SEO */}
        <meta name="format-detection" content="telephone=no" />
        <meta name="color-scheme" content="dark" />

        {/* Canonical URL */}
        <link rel="canonical" href="https://better-prompt-alpha.vercel.app" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ClerkProvider>
        {children}
        </ClerkProvider>
      </body>
    </html>
  );
}

import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "next-themes";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  themeColor: "#0d9488",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: "HealthFlow Guinea - Système d'Information Hospitalier",
  description: "Solutions numériques multi-secteurs pour l'Afrique — HealthFlow Guinea SIH, Finance, Éducation, Administration, Énergie. Par DataSphere Innovation — Fondée par Sekouna KABA.",
  keywords: ["HealthFlow", "Guinée", "système hospitalier", "santé numérique", "HIS", "DataSphere Innovation", "Sekouna KABA", "FinTech", "e-gouvernement", "e-learning", "téléconsultation", "multi-secteurs"],
  authors: [{ name: "DataSphere Innovation" }],
  icons: {
    icon: "https://z-cdn.chatglm.cn/z-ai/static/logo.svg",
    apple: "/icons/icon-152x152.png",
  },
  manifest: "/manifest.json",
  openGraph: {
    title: "HealthFlow Guinea - Système d'Information Hospitalier",
    description: "Transformez votre établissement de santé avec notre plateforme numérique complète.",
    type: "website",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "HealthFlow",
  },
  formatDetection: {
    telephone: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="HealthFlow" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-TileColor" content="#0d9488" />
        <meta name="msapplication-navbutton-color" content="#0d9488" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}

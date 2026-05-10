import type { Metadata } from "next";
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

export const metadata: Metadata = {
  title: "HealthFlow Guinea - Système d'Information Hospitalier",
  description: "Solutions numériques multi-secteurs pour l'Afrique — HealthFlow Guinea SIH, Finance, Éducation, Administration, Énergie. Par DataSphere Innovation — Fondée par Sekouna KABA.",
  keywords: ["HealthFlow", "Guinée", "système hospitalier", "santé numérique", "HIS", "DataSphere Innovation", "Sekouna KABA", "FinTech", "e-gouvernement", "e-learning", "téléconsultation", "multi-secteurs"],
  authors: [{ name: "DataSphere Innovation" }],
  icons: {
    icon: "https://z-cdn.chatglm.cn/z-ai/static/logo.svg",
  },
  openGraph: {
    title: "HealthFlow Guinea - Système d'Information Hospitalier",
    description: "Transformez votre établissement de santé avec notre plateforme numérique complète.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
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

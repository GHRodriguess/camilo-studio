import React, { Suspense } from "react";
import type { Metadata } from "next";
import { Inter, Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";
import { AppShell } from "@/components/templates/AppShell";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist",
  display: "swap",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Camilo Studio — Haute Coiffure & Estética Avançada",
  description: "Plataforma de gestão dedicada ao Camilo Studio.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="pt-BR"
      className={`${inter.variable} ${geist.variable} ${geistMono.variable}`}
    >
      <body className="min-h-screen bg-background text-foreground antialiased selection:bg-primary/20 selection:text-primary">
        <Suspense fallback={null}>
          <AuthProvider>
            <AppShell>{children}</AppShell>
          </AuthProvider>
        </Suspense>
      </body>
    </html>
  );
}

import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Agenda de Visitas - Hospital Orizonti | BH",
  description: "Sistema simplificado para agendamento de visitas ao Hospital Orizonti em Belo Horizonte. Transparência para familiares e amigos.",
  keywords: ["Hospital Orizonti", "Visitas Hospitalares", "Belo Horizonte", "Agendamento de Visita"],
  authors: [{ name: "Família Orizonti" }],
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={inter.variable}>
      <body className="antialiased selection:bg-teal-100 selection:text-teal-900">
        <main className="min-h-screen flex flex-col items-center justify-between">
          {children}
        </main>
      </body>
    </html>
  );
}

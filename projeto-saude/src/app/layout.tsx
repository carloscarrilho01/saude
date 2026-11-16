import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Projeto Saúde",
  description:
    "Hidratação, alimentação e hábitos saudáveis em um só lugar. Calcule sua meta de água, registre o que bebe e come, e siga seus regimes.",
  applicationName: "Projeto Saúde",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Projeto Saúde",
  },
};

export const viewport: Viewport = {
  themeColor: "#1b4b3a",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR" className={`${inter.variable} antialiased`}>
      <body>{children}</body>
    </html>
  );
}

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "./components/Header";
import AuthProvider from "./components/AuthProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TenantX - Multi-Tenant Task Management Project",
  description: "A learning project demonstrating multi-tenant architecture with Spring Boot and Next.js. Manage tasks across organizations with basic user roles.",
  keywords: "multi-tenant, spring-boot, nextjs, learning-project, task-management",
  authors: [{ name: "TenantX Team" }],
  robots: "index, follow",
  openGraph: {
    title: "TenantX SaaS Platform",
    description: "Secure multi-tenant project management solution",
    type: "website",
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <AuthProvider>
          <Header />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}

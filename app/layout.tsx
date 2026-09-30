import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: { default: "TaskWeave", template: "%s · TaskWeave" },
  description: "Multi-workspace Kanban boards with roles and invites",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased`}>
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-slate-100 focus:px-3 focus:py-2 focus:text-sm focus:text-slate-900"
        >
          Skip to content
        </a>
        {children}
      </body>
    </html>
  );
}

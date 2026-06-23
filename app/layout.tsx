import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { RunBootstrap } from "@/components/run-bootstrap";
import { TooltipProvider } from "@/components/ui/tooltip";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Codex — Cloud",
  description: "A faithful prototype of the Codex cloud interface.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`dark ${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="h-full">
        <TooltipProvider delayDuration={200}>
          <div className="flex h-screen overflow-hidden">
            <AppSidebar />
            <main className="min-w-0 flex-1 overflow-y-auto">{children}</main>
          </div>
          <RunBootstrap />
        </TooltipProvider>
      </body>
    </html>
  );
}

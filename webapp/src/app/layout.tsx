"use client";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "@radix-ui/themes/styles.css";
import "./globals.css";
import { Theme } from "@radix-ui/themes";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect } from "react";

const inter = Inter({ subsets: ["latin"] });

const queryClient = new QueryClient();

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    window.document.title = "ScreenLife Capture Tagging Platform";
  }, []);

  return (
    <html lang="en">
      <body className={inter.className}>
        <Theme>
          <QueryClientProvider client={queryClient}>
            {children}
          </QueryClientProvider>
        </Theme>
      </body>
    </html>
  );
}

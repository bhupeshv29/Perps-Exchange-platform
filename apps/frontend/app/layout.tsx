import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { QueryProvider } from "@/providers/QueryProvider";
import { Toaster } from "sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "LeverageX",
  description: "Realtime perpetual futures exchange simulator",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <QueryProvider>
          {children}
          <Toaster
            position="bottom-right"
            richColors
            closeButton
            expand
            visibleToasts={4}
            toastOptions={{
              duration: 1000,
              classNames: {
                toast:
                  "bg-surface border border-border text-text-primary shadow-xl rounded-xl",
                title: "font-semibold text-sm",
                description: "text-xs text-text-secondary",
                actionButton:
                  "bg-primary text-white hover:bg-primary-hover rounded-md",
                cancelButton: "bg-surface-hover text-text-primary rounded-md",
                closeButton:
                  "bg-surface-hover border-border text-text-secondary hover:text-white",
              },
            }}
          />
        </QueryProvider>
      </body>
    </html>
  );
}

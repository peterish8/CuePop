import type { Metadata } from "next";
import { Bricolage_Grotesque, Hanken_Grotesk } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { ConvexClientProvider } from "@/components/convex-client-provider";
import { cn } from "@/lib/utils";

const display = Bricolage_Grotesque({ subsets: ["latin"], weight: "variable", variable: "--font-display", display: "swap" });
const body = Hanken_Grotesk({ subsets: ["latin"], weight: "variable", variable: "--font-body", display: "swap" });

export const metadata: Metadata = {
  title: { default: "Deckactive — Make every room respond", template: "%s · Deckactive" },
  applicationName: "Deckactive",
  description: "Upload slide images, insert live polls and quizzes, and run a controlled audience experience from any screen.",
  icons: { icon: "/icon.png" },
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
  referrer: "no-referrer",
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={cn("dark", display.variable, body.variable)}>
      <body>
        <ConvexClientProvider>
          {children}
          <Toaster />
        </ConvexClientProvider>
      </body>
    </html>
  );
}

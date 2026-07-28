import type { Metadata, Viewport } from "next";
import "./globals.css";
import { StoreProvider } from "@/lib/store";
import { SiteNav } from "@/components/SiteNav";

export const metadata: Metadata = {
  title: "Sizanani — Student Opportunity Intelligence Platform",
  description:
    "One student profile. Every suitable opportunity. One guided journey to education. Discover bursaries, universities and pathways matched to you.",
};

export const viewport: Viewport = {
  themeColor: "#12130f",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen">
        <StoreProvider>
          <SiteNav />
          <main id="main">{children}</main>
          <footer className="mt-16 border-t border-black/5 bg-white/60">
            <div className="container-x flex flex-col gap-2 py-8 text-sm text-ink/60 sm:flex-row sm:items-center sm:justify-between">
              <p className="font-display text-lg text-ink">Sizanani Foundation</p>
              <p>One student profile. Every suitable opportunity. One guided journey to education.</p>
            </div>
          </footer>
        </StoreProvider>
      </body>
    </html>
  );
}

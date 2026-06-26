import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Providers } from "@/components/Providers";
import { ServerBattery } from "@/components/ServerBattery";
import { PWARegister } from "@/components/PWARegister";

export const metadata: Metadata = {
  title: "우리동네고수",
  description: "편의점 본부 시설지원 — 입찰형(역경매) 협력사 매칭 플랫폼",
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, title: "고수", statusBarStyle: "default" },
};

export const viewport: Viewport = {
  themeColor: "#2563eb",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>
        <Providers>
          <div className="app-shell">{children}</div>
          <ServerBattery />
          <PWARegister />
        </Providers>
      </body>
    </html>
  );
}

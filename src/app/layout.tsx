import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Providers } from "@/components/Providers";
import { ServerBattery } from "@/components/ServerBattery";
import { PWARegister } from "@/components/PWARegister";
import { BootSplashCleanup } from "@/components/LoadingScreen";

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
        {/* 첫 페인트에 즉시 보이는 부팅 스플래시 — JS 로딩 공백을 덮고 브랜드 이미지가 서서히 나타남 */}
        <div id="boot-splash" aria-hidden="true">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="splash-img" src="/splash.jpg" alt="우리동네고수" />
          <div className="splash-title">우리동네고수</div>
          <div className="splash-sub">동네 고수와 연결 중…</div>
          <div className="splash-bar"><i /></div>
        </div>

        <Providers>
          <div className="app-shell">{children}</div>
          <ServerBattery />
          <PWARegister />
          <BootSplashCleanup />
        </Providers>
      </body>
    </html>
  );
}

import localFont from "next/font/local";
import "./globals.css";
import PWAHandler from "@/components/PWAHandler";

const cairo = localFont({
  src: [
    { path: "../fonts/cairo/Cairo-300.ttf", weight: "300", style: "normal" },
    { path: "../fonts/cairo/Cairo-400.ttf", weight: "400", style: "normal" },
    { path: "../fonts/cairo/Cairo-500.ttf", weight: "500", style: "normal" },
    { path: "../fonts/cairo/Cairo-600.ttf", weight: "600", style: "normal" },
    { path: "../fonts/cairo/Cairo-700.ttf", weight: "700", style: "normal" },
    { path: "../fonts/cairo/Cairo-800.ttf", weight: "800", style: "normal" },
    { path: "../fonts/cairo/Cairo-900.ttf", weight: "900", style: "normal" },
  ],
  variable: "--font-cairo",
  display: "swap",
});

export const metadata = {
  title: "مشاعل المعرفة | منصة تعليمية متكاملة",
  description:
    "مشاعل المعرفة منصة تعليمية تهدف لصناعة جيل يجيد لغته ويحفظ كتاب ربه ويواكب عصره.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "مشاعل المعرفة",
  },
  icons: {
    icon: "/Logo.jpeg",
    shortcut: "/icon-192x192.png",
    apple: "/icon-192x192.png",
  },
};

export const viewport = {
  themeColor: "#14b8a6",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ar" dir="rtl">
      <body className={`${cairo.variable} antialiased`}>
        {children}
        <PWAHandler />
      </body>
    </html>
  );
}

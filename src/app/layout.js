import "./globals.css";

export const metadata = {
  title: "مشاعل المعرفة | منصة تعليمية متكاملة",
  description:
    "مشاعل المعرفة منصة تعليمية تهدف لصناعة جيل يجيد لغته ويحفظ كتاب ربه ويواكب عصره.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ar" dir="rtl">
      <body className="antialiased">{children}</body>
    </html>
  );
}

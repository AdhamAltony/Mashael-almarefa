import PortalNavbar from "@/components/portal-navbar";

export default function LoginLayout({ children }) {
  return (
    <div className="relative min-h-screen bg-gradient-to-b from-[#f8fbfb] via-[#f1f8f8] to-[#edf6f6]">
      <PortalNavbar sectionTitle="بوابة الدخول" links={[]} ctaLabel="الصفحة الرئيسية" ctaHref="/" />
      <div className="pt-24">{children}</div>
    </div>
  );
}

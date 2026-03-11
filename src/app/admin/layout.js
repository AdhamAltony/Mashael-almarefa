import AdminNavbar from "./admin-navbar";

const ADMIN_LINKS = [
  { label: "لوحة الإدارة", href: "/admin/dashboard" },
  { label: "لوحة التحكم", href: "/admin" },
  { label: "مركز الدورات", href: "/courses-center" },
];

export default function AdminLayout({ children }) {
  return (
    <div className="relative min-h-screen bg-gradient-to-b from-[#f7fbfb] via-[#eef6f6] to-[#e8f2f2]">
      <AdminNavbar sectionTitle="بوابة الإدارة" links={ADMIN_LINKS} />
      <div className="pt-24">{children}</div>
    </div>
  );
}

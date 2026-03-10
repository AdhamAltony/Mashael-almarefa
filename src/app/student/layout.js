import StudentNavbar from "./student-navbar";

const STUDENT_LINKS = [
  { label: "لوحة الطالب", href: "/student/dashboard" },
  { label: "الملف الشخصي", href: "/student/profile" },
  { label: "مركز الدورات", href: "/courses-center" },
];

export default function StudentLayout({ children }) {
  return (
    <div className="relative min-h-screen bg-gradient-to-b from-[#f8fbfb] via-[#f2f8f8] to-[#eef5f5]">
      <StudentNavbar sectionTitle="بوابة الطالب" links={STUDENT_LINKS} ctaLabel="الرئيسية" ctaHref="/" />
      <div className="pt-24">{children}</div>
    </div>
  );
}

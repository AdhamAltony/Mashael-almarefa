import StudentNavbar from "./student-navbar";
import TeacherNavbar from "../teacher/teacher-navbar";
import AdminNavbar from "../admin/admin-navbar";
import { cookies } from "next/headers";

const ADMIN_LINKS = [
  { label: "لوحة الإدارة", href: "/admin/dashboard" },
  { label: "لوحة التحكم", href: "/admin" },
  { label: "تقارير المعلمين", href: "/admin/teacher-sessions" },
  { label: "مركز الدورات", href: "/courses-center" },
];

export default async function StudentLayout({ children }) {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("session");
  let teacherLink = "/student/quran-teachers";

  let sessionData = null;
  if (sessionCookie) {
    try {
      const base64Str = sessionCookie.value;
      const uriEncodedStr = Buffer.from(base64Str, "base64").toString("utf8");
      const jsonStr = decodeURIComponent(uriEncodedStr);
      sessionData = JSON.parse(jsonStr);
      const course = sessionData.course || sessionData.department;
      if (course === "اللغة العربية لغير الناطقين") {
        teacherLink = "/student/arabic-teachers";
      } else if (course === "المناهج الدراسية") {
        teacherLink = "/student/curricula-teachers";
      } else {
        teacherLink = "/student/quran-teachers";
      }
    } catch {
      teacherLink = "/student/quran-teachers";
    }
  }

  const STUDENT_LINKS = sessionCookie ? [
    { label: "لوحة الطالب", href: "/student/dashboard" },
    { label: "الملف الشخصي", href: "/student/profile" },
    { label: "معلميني", href: teacherLink },
  ] : [];

  const role = sessionData?.role;

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-[#f8fbfb] via-[#f2f8f8] to-[#eef5f5]">
      {role === "admin" ? (
        <AdminNavbar sectionTitle="بوابة الإدارة" links={ADMIN_LINKS} />
      ) : role === "teacher" ? (
        <TeacherNavbar 
          sectionTitle="بوابة المعلم" 
          ctaLabel="الرئيسة" 
          ctaHref="/" 
          showCtaWithSession={true} 
        />
      ) : (
        <StudentNavbar 
          sectionTitle={sessionCookie ? (sessionData?.course || "بوابة الطالب") : "منصة مشاعل المعرفة"} 
          links={STUDENT_LINKS} 
          ctaLabel="الرئيسة" 
          ctaHref="/" 
        />
      )}
      <div className="pt-24">{children}</div>
    </div>
  );
}

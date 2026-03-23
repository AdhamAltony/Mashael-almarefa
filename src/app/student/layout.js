import StudentNavbar from "./student-navbar";
import { cookies } from "next/headers";

export default async function StudentLayout({ children }) {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("session");
  let teacherLink = "/student/quran-teachers";

  if (sessionCookie) {
    try {
      const base64Str = sessionCookie.value;
      const uriEncodedStr = Buffer.from(base64Str, "base64").toString("utf8");
      const jsonStr = decodeURIComponent(uriEncodedStr);
      const sessionData = JSON.parse(jsonStr);
      const course = sessionData.course;

      if (course === "العربية لغير الناطقين") {
        teacherLink = "/student/arabic-teachers";
      } else if (course === "المناهج الدراسية") {
        teacherLink = "/student/curricula-teachers";
      }
    } catch (e) {
      // fallback to quran
    }
  }

  const STUDENT_LINKS = sessionCookie ? [
    { label: "الملف الشخصي", href: "/student/profile" },
    { label: "معلميني", href: teacherLink },
  ] : [];

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-[#f8fbfb] via-[#f2f8f8] to-[#eef5f5]">
      <StudentNavbar 
        sectionTitle={sessionCookie ? "بوابة الطالب" : "منصة مشاعل المعرفة"} 
        links={STUDENT_LINKS} 
        ctaLabel="الرئيسية" 
        ctaHref="/" 
      />
      <div className="pt-24">{children}</div>
    </div>
  );
}

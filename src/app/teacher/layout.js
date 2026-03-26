import TeacherNavbar from "./teacher-navbar";
import { cookies } from "next/headers";

export default async function TeacherLayout({ children }) {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("session");
  
  let sessionData = null;
  if (sessionCookie) {
    try {
      const base64Str = sessionCookie.value;
      const uriEncodedStr = Buffer.from(base64Str, "base64").toString("utf8");
      const jsonStr = decodeURIComponent(uriEncodedStr);
      sessionData = JSON.parse(jsonStr);
    } catch {
      // Session parsing failed
    }
  }

  const teacherLinks = [
    { label: "الملف الشخصي", href: "/teacher/profile" },
    { label: "طلاب القسم", href: "/teacher/students" },
    { label: "تسجيل حضور", href: "/teacher/attendance" }
  ];

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-[#f8fbfb] via-[#f2f8f8] to-[#eef5f5]">
      <TeacherNavbar sectionTitle={sessionData?.course || "بوابة المعلمين"} links={teacherLinks} />
      <div className="pt-24">{children}</div>
    </div>
  );
}

import TeacherNavbar from "./teacher-navbar";
import { cookies } from "next/headers";

export default async function TeacherLayout({ children }) {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("session");
  let teacherLinks = [];

  if (sessionCookie) {
    try {
      const base64Str = sessionCookie.value;
      const uriEncodedStr = Buffer.from(base64Str, "base64").toString("utf8");
      const jsonStr = decodeURIComponent(uriEncodedStr);
      const sessionData = JSON.parse(jsonStr);
      const course = sessionData.course;

      if (course === "ركن القرآن") {
        teacherLinks = [
          { label: "الملف الشخصي", href: "/teacher/profile" },
          { label: "طلاب القسم", href: "/quran-and-sciences/students" }
        ];
      } else if (course === "العربية لغير الناطقين") {
        teacherLinks = [
          { label: "الملف الشخصي", href: "/teacher/profile" },
          { label: "طلاب القسم", href: "/arabic-non-native/students" }
        ];
      } else if (course === "المناهج الدراسية") {
        teacherLinks = [
          { label: "الملف الشخصي", href: "/teacher/profile" },
          { label: "طلاب القسم", href: "/egypt-gulf-curricula/students" }
        ];
      } else {
        teacherLinks = [
          { label: "الملف الشخصي", href: "/teacher/profile" },
          { label: "ركن القرآن", href: "/quran-and-sciences" },
          { label: "العربية لغير الناطقين", href: "/arabic-non-native" },
          { label: "المناهج الدراسية", href: "/egypt-gulf-curricula" },
        ];
      }
    } catch (e) {
      console.error(e);
      teacherLinks = [
        { label: "الملف الشخصي", href: "/teacher/profile" },
        { label: "ركن القرآن", href: "/quran-and-sciences" },
        { label: "العربية لغير الناطقين", href: "/arabic-non-native" },
        { label: "المناهج الدراسية", href: "/egypt-gulf-curricula" },
      ];
    }
  } else {
    teacherLinks = [
      { label: "الملف الشخصي", href: "/teacher/profile" },
      { label: "ركن القرآن", href: "/quran-and-sciences" },
      { label: "العربية لغير الناطقين", href: "/arabic-non-native" },
      { label: "المناهج الدراسية", href: "/egypt-gulf-curricula" },
    ];
  }

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-[#f8fbfb] via-[#f2f8f8] to-[#eef5f5]">
      <TeacherNavbar sectionTitle="بوابة المعلمين" links={teacherLinks} />
      <div className="pt-24">{children}</div>
    </div>
  );
}

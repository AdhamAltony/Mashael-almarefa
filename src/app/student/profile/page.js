"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getLocalUsers, updateUser } from "@/utils/local-db";

const DEPARTMENTS = [
  { id: "quran", name: "ركن القرآن الكريم" },
  { id: "arabic", name: "اللغة العربية لغير الناطقين" },
  { id: "curricula", name: "المناهج الدراسية" },
];

const CURRICULA_SUBJECTS = [
  { id: "math", name: "الرياضيات" },
  { id: "science", name: "العلوم" },
  { id: "arabic_school", name: "اللغة العربية" },
  { id: "english", name: "اللغة الإنجليزية" },
  { id: "social", name: "الدراسات الاجتماعية" },
  { id: "islamic", name: "التربية الإسلامية" },
  { id: "french", name: "اللغة الفرنسية" },
  { id: "german", name: "اللغة الألمانية" },
];

function StatCard({ label, value, hint }) {
  return (
    <article className="modern-card rounded-2xl border border-emerald-100/70 p-5 shadow-lg shadow-emerald-900/5">
      <p className="text-sm font-bold text-emerald-700">{label}</p>
      <p className="mt-1 text-2xl font-black text-emerald-950">{value}</p>
      <p className="mt-1 text-sm text-slate-600">{hint}</p>
    </article>
  );
}

export default function StudentProfilePage() {
  const [isEditing, setIsEditing] = useState(false);
  const [saved, setSaved] = useState(false);
  const [student, setStudent] = useState({
    name: "جاري التحميل...",
    id: "غير محدد",
    level: "لم يتم التحديد بعد",
    course: "طالب جديد",
    department: "",
    selectedDepartments: [], // New for multi-selection
    subjects: [],
    age: "",
    country: "غير محدد",
    guardian: "غير محدد",
    phone: "غير محدد",
    email: "",
    assignedTeacher: "",
  });

  const [progressData, setProgressData] = useState({
    attendance: "0",
    rating: "0",
    hours: "0",
    nextLesson: "لم يتم التحديد",
    reading: 0,
    writing: 0,
    listening: 0,
    conversation: 0,
    achievements: "",
    notes: ""
  });

  const [upcomingSessions, setUpcomingSessions] = useState([]);

  useEffect(() => {
    const fetchInitialData = async () => {
      const cookies = document.cookie.split("; ");
      const sessionCookie = cookies.find(c => c.startsWith("session="));

      if (sessionCookie?.split("=")[1]) {
        try {
          const base64 = decodeURIComponent(sessionCookie.split("=")[1]);
          const decoded = decodeURIComponent(atob(base64));
          const data = JSON.parse(decoded);
          const currentEmail = data.email;

          // Read the current session schedule key, but keep legacy support for older data.
          const savedSessions =
            localStorage.getItem(`sessions_${currentEmail}`) ||
            localStorage.getItem(`upcoming_sessions_${currentEmail}`);
          if (savedSessions) {
            setUpcomingSessions(JSON.parse(savedSessions).slice(0, 3));
          } else {
            setUpcomingSessions([]);
          }

          // Load profile data
          const allUsers = await getLocalUsers();
          const dbUser = allUsers.find(u => u.email === currentEmail);

          const deptNamesStr = dbUser?.department || data.department || "";
          const deptNames = deptNamesStr.split("، ").map(s => s.trim());
          const selectedDepts = DEPARTMENTS.filter(d => deptNames.includes(d.name)).map(d => d.id);

          const initialFromSession = {
            id: dbUser?.id || data.id,
            image: dbUser?.image || data.image || "",
            name: dbUser?.name || data.name || "طالب جديد",
            course: dbUser?.course || data.course || "بوابة الطالب",
            department: deptNamesStr,
            selectedDepartments: selectedDepts,
            subjects: dbUser?.subjects || data.subjects || [],
            student_code: dbUser?.student_code || data.id || `STD-${Math.floor(10000 + Math.random() * 90000)}`,
            level: dbUser?.level || (deptNamesStr
              ? `${deptNamesStr}${(dbUser?.subjects || data.subjects)?.length > 0 ? ` - (${(dbUser?.subjects || data.subjects).join("، ")})` : ""}`
              : "بانتظار تحديد المستوى"),
            email: currentEmail,
            guardian: dbUser?.guardian || data.guardian || "غير محدد",
            guardianPhone: dbUser?.guardianPhone || data.guardianPhone || "غير محدد",
            age: dbUser?.age || data.age || "",
            country: dbUser?.country || data.country || data.countryName || "غير محدد",
            phone: dbUser?.phone || data.phone || data.guardianPhone || "غير محدد",
            joinDate: dbUser?.joinDate || data.joinDate || new Date().toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' }),
          };

          // Fetch and sync latest profile/progress/sessions from DB to localStorage
          const { syncStudentData } = await import("@/utils/local-db");
          await syncStudentData(currentEmail);

          const localDataKey = `student_profile_${currentEmail}`;
          const localData = localStorage.getItem(localDataKey);
          
          if (localData) {
            const parsedLocal = JSON.parse(localData);
            const subscriptions = parsedLocal.subscriptions || {};
            
            // Fetch images and specialties for all teachers
            const teacherImages = {};
            const teacherSpecialties = {};
            for (const [key, teacher] of Object.entries(subscriptions)) {
              if (teacher.email) {
                const tProfile = localStorage.getItem(`teacher_profile_${teacher.email}`);
                if (tProfile) {
                  const parsed = JSON.parse(tProfile);
                  teacherImages[key] = parsed.image || "";
                  teacherSpecialties[key] = parsed.specialization || parsed.course || parsed.department || "";
                }
              }
            }
            
            // Sanitize subjects to ensure it's always an array
            const subjects = Array.isArray(parsedLocal.subjects) 
              ? parsedLocal.subjects 
              : (initialFromSession.subjects || []);

            setStudent({
              ...initialFromSession,
              ...parsedLocal,
              subjects,
              image: parsedLocal.image || initialFromSession.image || "",
              teacherImages: teacherImages,
              teacherSpecialties: teacherSpecialties
            });
          } else {
            setStudent(initialFromSession);
          }

          // Now load from (newly synced) localStorage
          const latestProgress = localStorage.getItem(`progress_${currentEmail}`);
          if (latestProgress) {
            setProgressData(JSON.parse(latestProgress));
          }
          
          const latestSessions = localStorage.getItem(`sessions_${currentEmail}`);
          if (latestSessions) {
            setUpcomingSessions(JSON.parse(latestSessions));
          }
        } catch (e) { console.error(e); }
      }
    };

    fetchInitialData();
  }, []);

  useEffect(() => {
    const handleUpdate = () => window.location.reload();
    window.addEventListener('profileUpdate', handleUpdate);
    return () => window.removeEventListener('profileUpdate', handleUpdate);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setStudent(prev => ({ ...prev, [name]: value }));
  };

  const toggleDept = (deptId) => {
    setStudent(prev => {
      const current = prev.selectedDepartments || [];
      const updated = current.includes(deptId)
        ? (current.length > 1 ? current.filter(id => id !== deptId) : current)
        : [...current, deptId];

      const deptNames = updated.map(id => DEPARTMENTS.find(d => d.id === id)?.name).filter(Boolean);
      const deptNamesStr = deptNames.join("، ");

      // Keep subjects only if curricula is still selected
      const currentSubjects = Array.isArray(prev.subjects) ? prev.subjects : [];
      const hasCurricula = updated.includes("curricula");
      const updatedSubjects = hasCurricula ? currentSubjects : [];
      const newLevel = `${deptNamesStr}${updatedSubjects.length > 0 ? ` - (${updatedSubjects.join("، ")})` : ""}`;

      return {
        ...prev,
        selectedDepartments: updated,
        department: deptNamesStr,
        subjects: updatedSubjects,
        level: newLevel
      };
    });
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        setSaved(false);
        // 1. Upload to server
        const formData = new FormData();
        formData.append('file', file);

        const res = await fetch('/api/upload', {
          method: 'POST',
          body: formData
        });

        const result = await res.json();
        if (result.success) {
          const newImageUrl = result.url;
          const updatedStudent = { ...student, image: newImageUrl, role: "student" };

          // 2. Update state
          setStudent(updatedStudent);

          // 3. Update local cache
          localStorage.setItem(`student_profile_${student.email}`, JSON.stringify(updatedStudent));

          // 4. Update Supabase immediately
          await updateUser(updatedStudent);

          // 5. Update session cookie with essential fields only to prevent huge cookie breaks
          const sessionData = {
              id: updatedStudent.id,
              email: updatedStudent.email,
              name: updatedStudent.name,
              role: updatedStudent.role,
              course: updatedStudent.course,
              image: updatedStudent.image
          };
          const base64 = btoa(encodeURIComponent(JSON.stringify(sessionData)));
          document.cookie = `session=${encodeURIComponent(base64)}; path=/; max-age=86400`;

          // Notify Navbar
          window.dispatchEvent(new Event('profileUpdate'));

          setSaved(true);
          setTimeout(() => setSaved(false), 3000);
        }
      } catch (err) {
        console.error("Image upload failed:", err);
      }
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();

    // Recalculate level for display and DB
    const deptNames = student.selectedDepartments.map(id => DEPARTMENTS.find(d => d.id === id)?.name).filter(Boolean);
    const deptNamesStr = deptNames.join("، ");
    const currentSubjects = Array.isArray(student.subjects) ? student.subjects : [];
    const levelStr = `${deptNamesStr}${currentSubjects.length > 0 ? ` - (${currentSubjects.join("، ")})` : ""}`;

    const finalStudent = {
      ...student,
      course: deptNamesStr, // Used correctly by NavBar
      department: deptNamesStr,
      level: levelStr,
      role: "student"
    };

    // Update Supabase
    await updateUser(finalStudent);

    // Update state to show new level/course immediately
    setStudent(finalStudent);

    // Update individual profile file (Local cache)
    localStorage.setItem(`student_profile_${student.email}`, JSON.stringify(finalStudent));

    // Sync navbar and local display with essential cookie data
    const sessionData = {
        id: finalStudent.id,
        email: finalStudent.email,
        name: finalStudent.name,
        role: finalStudent.role,
        course: finalStudent.course,
        image: finalStudent.image
    };
    const base64 = btoa(encodeURIComponent(JSON.stringify(sessionData)));
    document.cookie = `session=${encodeURIComponent(base64)}; path=/; max-age=86400`;

    window.dispatchEvent(new Event('profileUpdate'));
    setIsEditing(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <main
      dir="rtl"
      className="relative min-h-[100dvh] overflow-x-clip bg-gradient-to-b from-[#f8fbfb] via-[#f2f8f8] to-[#eef5f5] py-10"
    >
      <div className="absolute left-0 top-0 h-[380px] w-[380px] -translate-x-1/3 -translate-y-1/3 rounded-full bg-emerald-200/45 blur-3xl" />
      <div className="absolute bottom-0 right-0 h-[460px] w-[460px] translate-x-1/4 translate-y-1/4 rounded-full bg-emerald-100/65 blur-3xl" />

      <div className="site-container relative z-10 pt-20">
        <section className="modern-card mb-8 overflow-hidden rounded-3xl border border-white/60 p-6 shadow-2xl shadow-emerald-900/10 sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start gap-4 sm:gap-5">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 text-2xl font-black text-white shadow-lg shadow-emerald-500/30 sm:h-20 sm:w-20 sm:text-3xl relative overflow-hidden group">
                {student.image ? (
                  <img src={student.image} alt={student.name} className="h-full w-full object-cover" />
                ) : (
                  <span className="group-hover:opacity-0 transition-opacity">{student.name?.charAt(0) || "م"}</span>
                )}
                <input type="file" accept="image/*" onChange={handleImageChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" title="رفع صورة شخصية" />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                  <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                </div>
              </div>
              <div>
                <p className="inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
                  الملف الشخصي للطالب
                </p>
                <h1 className="mt-3 text-2xl font-black text-emerald-950 sm:text-3xl">{student.name}</h1>
                <p className="mt-1 text-sm text-slate-600">{student.level}</p>
                <div className="mt-2 flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-4">
                  <p className="text-sm font-medium text-slate-700">
                    عدد المعلمين المشترك معهم: <span className="font-bold text-emerald-900 border-b border-emerald-200">{Object.keys(student.subscriptions || {}).length}</span>
                  </p>
                  <p className="text-sm font-medium text-slate-500">
                    رقم الطالب: <span className="font-bold text-emerald-800">{student.student_code}</span>
                  </p>
                  {saved && <span className="text-xs font-bold text-emerald-600 animate-bounce">تم حفظ التغييرات!</span>}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setIsEditing(!isEditing)}
                className={`inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-bold transition-all ${isEditing ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-white text-emerald-700 border border-emerald-200 hover:bg-emerald-50'}`}
              >
                {isEditing ? 'إلغاء التعديل' : 'تعديل البيانات'}
              </button>
              <Link
                href="/student/dashboard"
                className="inline-flex items-center justify-center rounded-xl border border-emerald-200 bg-white px-4 py-2 text-sm font-bold text-emerald-700 transition-colors hover:border-emerald-300 hover:bg-emerald-50"
              >
                لوحة الطالب
              </Link>
            </div>
          </div>
        </section>

        <section className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="نسبة الحضور" value={`${progressData.attendance}%`} hint="غياب حصة واحدة فقط هذا الشهر" />
          <StatCard label="متوسط التقييم" value={`${progressData.rating} / 10`} hint="آخر 12 حصة" />
          <StatCard label="الساعات المنجزة" value={`${progressData.hours} ساعة`} hint="منذ تاريخ التسجيل" />
          <StatCard label="الحصة القادمة" value={progressData.nextLesson?.split(" - ")[0] || "سيتم التحديد"} hint={progressData.nextLesson?.split(" - ")[1] || "موعد الحصة المجدولة"} />
        </section>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Edit / View Profile Section */}
          <article className="modern-card rounded-3xl border border-white/70 p-6 shadow-xl shadow-emerald-900/5 lg:col-span-2">
            <div className="flex items-center justify-between border-b border-emerald-50 pb-4 mb-6">
              <h2 className="text-xl font-black text-emerald-950">البيانات الأساسية</h2>
              {isEditing && <span className="text-xs font-bold text-emerald-600 underline">أنت الآن في وضع التعديل</span>}
            </div>

            {isEditing ? (
              <form onSubmit={handleSave} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 mr-2">اسم الطالب بالكامل</label>
                    <input
                      type="text"
                      name="name"
                      value={student.name}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-emerald-100 bg-white/50 px-4 py-3 text-sm focus:border-emerald-500 outline-none transition-all"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 mr-2">ولي الأمر</label>
                      <input
                        type="text"
                        name="guardian"
                        value={student.guardian || ""}
                        onChange={handleChange}
                        className="w-full rounded-xl border border-emerald-100 bg-white/50 px-4 py-3 text-sm focus:border-emerald-500 outline-none transition-all"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 mr-2">رقم هاتف ولي الأمر</label>
                      <input
                        type="text"
                        name="guardianPhone"
                        value={student.guardianPhone || ""}
                        onChange={handleChange}
                        className="w-full rounded-xl border border-emerald-100 bg-white/50 px-4 py-3 text-sm focus:border-emerald-500 outline-none transition-all"
                        dir="ltr"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 mr-2">تحديث الصورة الشخصية</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="w-full rounded-xl border border-emerald-100 bg-white/50 px-4 py-3 text-xs outline-none transition-all"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 mr-2">العمر</label>
                      <input
                        type="number"
                        name="age"
                        value={student.age}
                        onChange={handleChange}
                        className="w-full rounded-xl border border-emerald-100 bg-white/50 px-4 py-3 text-sm focus:border-emerald-500 outline-none transition-all"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 mr-2">الدولة</label>
                      <input
                        type="text"
                        name="country"
                        value={student.country}
                        onChange={handleChange}
                        className="w-full rounded-xl border border-emerald-100 bg-white/50 px-4 py-3 text-sm focus:border-emerald-500 outline-none transition-all"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <label className="text-xs font-bold text-slate-500 mr-2">الأقسام المشترك بها</label>
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                      {DEPARTMENTS.map(d => (
                        <button
                          key={d.id}
                          type="button"
                          onClick={() => toggleDept(d.id)}
                          className={`flex items-center justify-center rounded-xl border-2 p-3 text-xs font-bold transition-all ${student.selectedDepartments.includes(d.id)
                            ? "border-emerald-500 bg-emerald-50 text-emerald-900 shadow-inner"
                            : "border-emerald-50 bg-white/50 text-slate-500 hover:border-emerald-200"
                            }`}
                        >
                          {d.name}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {student.selectedDepartments.includes("curricula") && (
                  <div className="space-y-3">
                    <label className="text-xs font-bold text-slate-500 mr-2">المواد الدراسية المسجلة</label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {CURRICULA_SUBJECTS.map((sub) => (
                        <label key={sub.id} className="flex items-center gap-2 rounded-xl border border-emerald-50 bg-white/40 p-3 transition-all hover:bg-white/80 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={Array.isArray(student.subjects) && student.subjects.includes(sub.name)}
                            onChange={(e) => {
                              const currentSubjects = Array.isArray(student.subjects) ? student.subjects : [];
                              const updated = e.target.checked
                                ? [...currentSubjects, sub.name]
                                : currentSubjects.filter(s => s !== sub.name);
                              const newLevel = `${student.department}${updated.length > 0 ? ` - (${updated.join("، ")})` : ""}`;
                              setStudent(prev => ({ ...prev, subjects: updated, level: newLevel }));
                            }}
                            className="h-4 w-4 rounded accent-emerald-600"
                          />
                          <span className="text-xs font-bold text-emerald-950">{sub.name}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 mr-2">رقم الهاتف للتواصل</label>
                  <input
                    type="tel"
                    name="phone"
                    value={student.phone}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-emerald-100 bg-white/50 px-4 py-3 text-sm focus:border-emerald-500 outline-none transition-all"
                    dir="ltr"
                    required
                  />
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    className="w-full rounded-2xl bg-gradient-to-l from-emerald-500 to-emerald-600 py-4 font-black text-white shadow-lg shadow-emerald-500/20 transition-all hover:translate-y-[-2px] hover:shadow-emerald-500/40"
                  >
                    حفظ التعديلات وتحديث الملف
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="flex flex-col gap-1">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">الاسم الكامل</span>
                    <span className="text-lg font-black text-emerald-950">{student.name}</span>
                  </div>
                  <div className="flex gap-12">
                    <div className="flex flex-col gap-1">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">العمر</span>
                      <span className="text-lg font-black text-emerald-950">{student.age} سنة</span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">الدولة</span>
                      <span className="text-lg font-black text-emerald-950">{student.country}</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="flex flex-col gap-1">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">القسم المسجل به</span>
                    <span className="text-lg font-bold text-emerald-900">{student.department || "بانتظار التحديد"}</span>
                  </div>
                  {student.department?.includes("المناهج الدراسية") && (
                    <div className="flex flex-col gap-1">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">المواد الدراسية</span>
                      <span className="text-sm font-bold text-emerald-700">{Array.isArray(student.subjects) && student.subjects.length > 0 ? student.subjects.join("، ") : "لم يتم اختيار مواد بعد"}</span>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="flex flex-col gap-1">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">ولي الأمر</span>
                    <span className="text-lg font-bold text-emerald-900">{student.guardian || "غير محدد"}</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">رقم ولي الأمر</span>
                    <span className="text-lg font-bold text-emerald-900" dir="ltr">{student.guardianPhone || "غير محدد"}</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="flex flex-col gap-1">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">هاتف الطالب</span>
                    <span className="text-lg font-bold text-emerald-900" dir="ltr">{student.phone}</span>
                  </div>
                </div>

                <div className="pt-6 border-t border-emerald-50 flex flex-col sm:flex-row gap-4 sm:items-center justify-between">
                  <div className="flex flex-col gap-1">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">البريد الإلكتروني</span>
                    <span className="text-sm font-medium text-slate-600">{student.email}</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest text-left">تاريخ الانضمام</span>
                    <span className="text-sm font-bold text-emerald-700 text-left">{student.joinDate}</span>
                  </div>
                </div>
              </div>
            )}
          </article>

          {/* Progress / Skills Sidebar */}
          <article className="modern-card rounded-3xl border border-white/70 p-6 shadow-xl shadow-emerald-900/5">
            <h2 className="text-xl font-black text-emerald-950">مستوى المهارات</h2>
            <div className="mt-8 space-y-6">
              {[
                { title: "القراءة", value: progressData.reading },
                { title: "الكتابة", value: progressData.writing },
                { title: "الاستماع", value: progressData.listening },
                { title: "المحادثة", value: progressData.conversation },
              ].map((skill) => {
                const val = parseInt(skill.value) || 0;
                return (
                  <div key={skill.title}>
                    <div className="mb-2 flex items-center justify-between text-xs sm:text-sm">
                      <span className="font-bold text-emerald-900">{skill.title}</span>
                      <span className="font-black text-emerald-600">{val}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-emerald-100/50">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-1000"
                        style={{ width: `${val}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-10 pt-6 border-t border-emerald-50">
              <p className="text-xs font-bold text-slate-400 mb-3 tracking-widest uppercase">المعلمون المسؤولون</p>
              <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1 thin-scrollbar">
                {Object.entries(student.subscriptions || {}).length > 0 ? (
                  Object.entries(student.subscriptions || {}).map(([email, teacher]) => {
                    const specialization = student.teacherSpecialties?.[email] || "";
                    const img = student.teacherImages?.[email];
                    return (
                      <div key={email} className="flex items-center gap-3 p-2 rounded-xl border border-emerald-50 bg-emerald-50/30">
                        <div className="h-10 w-10 shrink-0 rounded-full bg-gradient-to-br from-emerald-100 to-emerald-200 flex items-center justify-center text-emerald-700 font-black shadow-inner border border-white overflow-hidden">
                          {img ? (
                            <img src={img} alt={teacher.name} className="h-full w-full object-cover" />
                          ) : (
                            teacher.name?.charAt(0) || "؟"
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-black text-emerald-950 truncate">{teacher.name}</p>
                          <p className="text-[9px] font-bold text-emerald-600 leading-tight line-clamp-2">
                            {specialization || "غير محدد"}
                          </p>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 font-black shadow-inner">؟</div>
                    <div>
                      <p className="text-xs font-black text-slate-500">لم يتم الاشتراك بعد</p>
                      <p className="text-[9px] font-bold text-slate-400 uppercase">بانتظار اختيار معلمين</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </article>
        </div>

        <section className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <article className="modern-card rounded-3xl border border-white/70 p-6 shadow-xl shadow-emerald-900/5">
            <h2 className="text-xl font-black text-emerald-950">الحصص القادمة</h2>
            <div className="mt-6">
              {upcomingSessions.length > 0 ? (
                <ul className="space-y-3">
                  {upcomingSessions.map((session) => (
                    <li key={`${session.course}-${session.date}`} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-emerald-100 bg-white/70 p-4 hover:shadow-md transition-all">
                      <div>
                        <p className="font-bold text-emerald-900">{session.course || session.title}</p>
                        <p className="mt-1 text-sm text-slate-600">{session.date} - {session.time || "موعد مجدول"}</p>
                      </div>
                      <a href={session.meetLink || "https://meet.google.com/new"} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-emerald-600/20 transition-all hover:bg-emerald-500 hover:scale-105 active:scale-95">
                        دخول الحصة
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                      </a>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="rounded-2xl border border-dashed border-emerald-200 bg-emerald-50/20 p-10 text-center">
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <p className="text-sm font-bold text-emerald-950">لا توجد حصص قادمة مجدولة</p>
                  <p className="mt-1 text-xs text-slate-500">سيظهر الموعد هنا فور قيام المعلم بجدولة حصتك القادمة.</p>
                </div>
              )}
            </div>
          </article>

          <article className="modern-card rounded-3xl border border-white/70 p-6 shadow-xl shadow-emerald-900/5">
            <h2 className="text-xl font-black text-emerald-950">آخر الملاحظات</h2>
            <div className="mt-6 flex flex-col gap-4">
              {progressData.achievements ? (
                <div className="space-y-3">
                  <p className="text-xs font-bold text-emerald-700 tracking-wider">الإنجازات الأخيرة</p>
                  {progressData.achievements?.split('\n').filter(a => a.trim()).map((item, idx) => (
                    <div key={idx} className="flex gap-3 rounded-2xl border border-emerald-100 bg-white/70 p-4 text-sm text-slate-700">
                      <div className="mt-1 h-2 w-2 shrink-0 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-emerald-200 bg-emerald-50/20 p-8 text-center">
                  <p className="text-sm text-slate-500 italic">لا توجد إنجازات مسجلة حالياً..</p>
                </div>
              )}
            </div>
          </article>
        </section>
      </div>
    </main>
  );
}

"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import StudentNavbar from "../student-navbar";

const NAV_LINKS = [
    { label: "لوحة الطالب", href: "/student/dashboard" },
    { label: "الملف الشخصي", href: "/student/profile" },
    { label: "معلميني", href: "/student/quran-teachers" }, // Default, but handled dynamically in layout usually
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
    name: "مريم أحمد خالد",
    id: "STD-24017",
    level: "المستوى الثاني - لغة عربية",
    course: "بوابة الطالب",
    age: 12,
    country: "مصر",
    guardian: "أحمد خالد",
    phone: "+20 100 345 7788",
    email: "mariam.student@example.com",
    joinDate: "15 سبتمبر 2025",
    teacher: "أ. سارة محمد",
    nextClass: "السبت 7 مارس 2026 - 6:00 م",
  });

  const [progressData, setProgressData] = useState({
    attendance: "96",
    rating: "8.6",
    hours: "42",
    nextLesson: "السبت 7 مارس 2026 - 6:00 م",
    reading: 86,
    writing: 78,
    listening: 91,
    conversation: 74,
    achievements: "",
    notes: ""
  });

  const [upcomingSessions] = useState([
    { course: "اللغة العربية - قواعد", date: "السبت 7 مارس", time: "6:00 م", duration: "60 دقيقة", meetLink: "https://meet.google.com/new" },
    { course: "تلاوة وتجويد", date: "الاثنين 9 مارس", time: "5:30 م", duration: "45 دقيقة", meetLink: "https://meet.google.com/new" },
    { course: "مراجعة واجبات", date: "الأربعاء 11 مارس", time: "7:00 م", duration: "30 دقيقة", meetLink: "https://meet.google.com/new" },
  ]);

  useEffect(() => {
    const cookies = document.cookie.split("; ");
    const sessionCookie = cookies.find(c => c.startsWith("session="));
    let currentEmail = "mariam.student@example.com";

    if (sessionCookie?.split("=")[1]) {
      try {
        const base64 = decodeURIComponent(sessionCookie.split("=")[1]);
        const decoded = decodeURIComponent(atob(base64));
        const data = JSON.parse(decoded);
        currentEmail = data.email || currentEmail;
        
        // Load editable data from localStorage first
        const localData = localStorage.getItem(`student_profile_${currentEmail}`);
        if (localData) {
            setStudent(JSON.parse(localData));
        } else {
            setStudent(prev => ({
                ...prev,
                name: data.name || prev.name,
                course: data.course || prev.course,
                level: data.department 
                    ? `${data.department}${data.subjects?.length > 0 ? ` - (${data.subjects.join("، ")})` : ""}` 
                    : prev.level,
                email: data.email || prev.email,
            }));
        }

        // Fetch progress from localStorage using email
        const savedProgress = localStorage.getItem(`progress_${currentEmail}`);
        if (savedProgress) {
          setProgressData(JSON.parse(savedProgress));
        }
      } catch { }
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setStudent(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = (e) => {
    e.preventDefault();
    localStorage.setItem(`student_profile_${student.email}`, JSON.stringify(student));
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

      <StudentNavbar sectionTitle="بوابة الطالب" links={NAV_LINKS} />

      <div className="site-container relative z-10 pt-20">
        <section className="modern-card mb-8 overflow-hidden rounded-3xl border border-white/60 p-6 shadow-2xl shadow-emerald-900/10 sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start gap-4 sm:gap-5">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 text-2xl font-black text-white shadow-lg shadow-emerald-500/30 sm:h-20 sm:w-20 sm:text-3xl relative overflow-hidden group">
                <span className="group-hover:opacity-0 transition-opacity">{student.name?.charAt(0) || "م"}</span>
                <input type="file" accept="image/*" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" title="رفع صورة شخصية" />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                </div>
              </div>
              <div>
                <p className="inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
                  الملف الشخصي للطالب
                </p>
                <h1 className="mt-3 text-2xl font-black text-emerald-950 sm:text-3xl">{student.name}</h1>
                <p className="mt-1 text-sm text-slate-600">{student.level}</p>
                <div className="mt-2 flex items-center gap-4">
                    <p className="text-sm font-medium text-slate-700">
                      رقم الطالب: <span className="font-bold text-emerald-800">{student.id}</span>
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
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 mr-2">اسم ولي الأمر</label>
                            <input
                                type="text"
                                name="guardian"
                                value={student.guardian}
                                onChange={handleChange}
                                className="w-full rounded-xl border border-emerald-100 bg-white/50 px-4 py-3 text-sm focus:border-emerald-500 outline-none transition-all"
                                required
                            />
                        </div>
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
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">ولي الأمر</span>
                            <span className="text-lg font-bold text-emerald-900">{student.guardian}</span>
                        </div>
                        <div className="flex flex-col gap-1">
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">رقم الهاتف</span>
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
                <p className="text-xs font-bold text-slate-400 mb-3 tracking-widest uppercase">المعلم المسؤول</p>
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold">
                        {student.teacher?.charAt(0) || "أ"}
                    </div>
                    <div>
                        <p className="text-sm font-black text-emerald-950">{student.teacher}</p>
                        <p className="text-[10px] font-bold text-emerald-600 uppercase">معلم لغة عربية</p>
                    </div>
                </div>
            </div>
          </article>
        </div>

        <section className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
            <article className="modern-card rounded-3xl border border-white/70 p-6 shadow-xl shadow-emerald-900/5">
                <h2 className="text-xl font-black text-emerald-950">الحصص القادمة</h2>
                <ul className="mt-6 space-y-3">
                {upcomingSessions.map((session) => (
                    <li key={`${session.course}-${session.date}`} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-emerald-100 bg-white/70 p-4 hover:shadow-md transition-all">
                    <div>
                        <p className="font-bold text-emerald-900">{session.course}</p>
                        <p className="mt-1 text-sm text-slate-600">{session.date} - {session.time}</p>
                    </div>
                    <a href={session.meetLink || "https://meet.google.com/new"} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-emerald-600/20 transition-all hover:bg-emerald-500 hover:scale-105 active:scale-95">
                        دخول الحصة
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                    </a>
                    </li>
                ))}
                </ul>
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
                    
                    <div className="mt-2 rounded-2xl border border-emerald-200/50 bg-emerald-500/5 p-5">
                        <div className="flex items-center gap-2 mb-3">
                             <svg className="w-4 h-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
                             <p className="text-xs font-bold text-emerald-900 uppercase">توصيات المعلم</p>
                        </div>
                        <p className="text-sm leading-relaxed text-slate-700 italic">
                            {progressData.notes || "بانتظار تقييم المعلم للحصص الأخيرة."}
                        </p>
                    </div>
                </div>
            </article>
        </section>
      </div>
    </main>
  );
}

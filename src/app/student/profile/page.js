"use client";
import Link from "next/link";
import { useEffect, useState } from "react";

const PROGRESS = [
  { title: "القراءة", value: 86 },
  { title: "الكتابة", value: 78 },
  { title: "الاستماع", value: 91 },
  { title: "المحادثة", value: 74 },
];

const UPCOMING_SESSIONS = [
  { course: "اللغة العربية - قواعد", date: "السبت 7 مارس", time: "6:00 م", duration: "60 دقيقة", meetLink: "https://meet.google.com/new" },
  { course: "تلاوة وتجويد", date: "الاثنين 9 مارس", time: "5:30 م", duration: "45 دقيقة", meetLink: "https://meet.google.com/new" },
  { course: "مراجعة واجبات", date: "الأربعاء 11 مارس", time: "7:00 م", duration: "30 دقيقة", meetLink: "https://meet.google.com/new" },
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

  useEffect(() => {
    const cookies = document.cookie.split("; ");
    const sessionCookie = cookies.find(c => c.startsWith("session="));
    if (sessionCookie?.split("=")[1]) {
      try {
        const base64 = decodeURIComponent(sessionCookie.split("=")[1]);
        const decoded = decodeURIComponent(atob(base64));
        const data = JSON.parse(decoded);
        setStudent(prev => ({
          ...prev,
          name: data.name || prev.name,
          course: data.course || prev.course,
          level: data.course ? `مسجل في: ${data.course}` : prev.level,
          email: data.email || prev.email,
        }));

        // Fetch progress from localStorage using email
        const savedProgress = localStorage.getItem(`progress_${data.email}`);
        if (savedProgress) {
          setProgressData(JSON.parse(savedProgress));
        }
      } catch { }
    }
  }, []);

  return (
    <main
      dir="rtl"
      className="relative min-h-[100dvh] overflow-x-clip bg-gradient-to-b from-[#f8fbfb] via-[#f2f8f8] to-[#eef5f5] py-10"
    >
      <div className="absolute left-0 top-0 h-[380px] w-[380px] -translate-x-1/3 -translate-y-1/3 rounded-full bg-emerald-200/45 blur-3xl" />
      <div className="absolute bottom-0 right-0 h-[460px] w-[460px] translate-x-1/4 translate-y-1/4 rounded-full bg-emerald-100/65 blur-3xl" />

      <div className="site-container relative z-10">
        <section className="modern-card mb-8 overflow-hidden rounded-3xl border border-white/60 p-6 shadow-2xl shadow-emerald-900/10 sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start gap-4 sm:gap-5">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 text-2xl font-black text-white shadow-lg shadow-emerald-500/30 sm:h-20 sm:w-20 sm:text-3xl relative overflow-hidden group">
                <span className="group-hover:opacity-0 transition-opacity">م</span>
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
                <p className="mt-2 text-sm font-medium text-slate-700">
                  رقم الطالب: <span className="font-bold text-emerald-800">{student.id}</span>
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/student/dashboard"
                className="inline-flex items-center justify-center rounded-xl border border-emerald-200 bg-white px-4 py-2 text-sm font-bold text-emerald-700 transition-colors hover:border-emerald-300 hover:bg-emerald-50"
              >
                لوحة الطالب
              </Link>
              <Link
                href="/"
                className="glow-button inline-flex items-center justify-center rounded-xl bg-gradient-to-l from-emerald-500 to-emerald-600 px-4 py-2 text-sm font-bold text-white transition-all hover:from-emerald-400 hover:to-emerald-500"
              >
                الصفحة الرئيسة
              </Link>
            </div>
          </div>
        </section>

        <section className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="نسبة الحضور" value={`${progressData.attendance}%`} hint="غياب حصة واحدة فقط هذا الشهر" />
          <StatCard label="متوسط التقييم" value={`${progressData.rating} / 10`} hint="آخر 12 حصة" />
          <StatCard label="الساعات المنجزة" value={`${progressData.hours} ساعة`} hint="منذ تاريخ التسجيل" />
          <StatCard label="الحصة القادمة" value={progressData.nextLesson.split(" - ")[0]} hint={progressData.nextLesson.split(" - ")[1] || "موعد الحصة المجدولة"} />
        </section>

        <section className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
          <article className="modern-card rounded-3xl border border-white/70 p-6 shadow-xl shadow-emerald-900/5 lg:col-span-2">
            <h2 className="text-xl font-black text-emerald-950">تقدم المهارات</h2>
            <p className="mt-2 text-sm text-slate-600">مستوى الطالبة في المهارات الأساسية خلال آخر تقييم شهري.</p>
            <div className="mt-6 space-y-4">
              {[
                { title: "القراءة", value: progressData.reading },
                { title: "الكتابة", value: progressData.writing },
                { title: "الاستماع", value: progressData.listening },
                { title: "المحادثة", value: progressData.conversation },
              ].map((skill) => {
                const val = parseInt(skill.value) || 0;
                return (
                  <div key={skill.title}>
                    <div className="mb-1 flex items-center justify-between text-sm">
                      <span className="font-bold text-emerald-900">{skill.title}</span>
                      <span className="font-bold text-emerald-700">{val}%</span>
                    </div>
                    <div className="h-2.5 overflow-hidden rounded-full bg-emerald-100">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-1000"
                        style={{ width: `${val}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </article>

          <article className="modern-card rounded-3xl border border-white/70 p-6 shadow-xl shadow-emerald-900/5">
            <h2 className="text-xl font-black text-emerald-950">بيانات أساسية</h2>
            <dl className="mt-4 space-y-3 text-sm">
              <div className="flex items-center justify-between gap-3">
                <dt className="font-bold text-slate-600">العمر</dt>
                <dd className="font-bold text-emerald-900">{student.age} سنة</dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt className="font-bold text-slate-600">الدولة</dt>
                <dd className="font-bold text-emerald-900">{student.country}</dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt className="font-bold text-slate-600">ولي الأمر</dt>
                <dd className="font-bold text-emerald-900">{student.guardian}</dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt className="font-bold text-slate-600">المعلم</dt>
                <dd className="font-bold text-emerald-900">{student.teacher}</dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt className="font-bold text-slate-600">تاريخ الانضمام</dt>
                <dd className="font-bold text-emerald-900">{student.joinDate}</dd>
              </div>
            </dl>
          </article>
        </section>

        <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <article className="modern-card rounded-3xl border border-white/70 p-6 shadow-xl shadow-emerald-900/5">
            <h2 className="text-xl font-black text-emerald-950">الحصص القادمة</h2>
            <ul className="mt-4 space-y-3">
              {UPCOMING_SESSIONS.map((session) => (
                <li key={`${session.course}-${session.date}`} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-emerald-100 bg-white/70 p-4">
                  <div>
                    <p className="font-bold text-emerald-900">{session.course}</p>
                    <p className="mt-1 text-sm text-slate-700">{session.date} - {session.time}</p>
                    <p className="text-xs font-medium text-emerald-700">المدة: {session.duration}</p>
                  </div>
                  <a href={session.meetLink || "https://meet.google.com/new"} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-1 rounded-xl bg-emerald-100 px-3 py-2 text-xs font-bold text-emerald-700 transition-colors hover:bg-emerald-200">
                    دخول لجوجل ميت
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                  </a>
                </li>
              ))}
            </ul>
          </article>

          <article className="modern-card rounded-3xl border border-white/70 p-6 shadow-xl shadow-emerald-900/5">
            <h2 className="text-xl font-black text-emerald-950">الإنجازات والملاحظات</h2>
            <ul className="mt-4 space-y-3">
              {progressData.achievements ? (
                progressData.achievements.split('\n').filter(a => a.trim()).map((item, idx) => (
                  <li key={idx} className="flex gap-3 rounded-2xl border border-emerald-100 bg-white/70 p-4 text-sm text-slate-700">
                    <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-emerald-500" />
                    <span>{item}</span>
                  </li>
                ))
              ) : (
                <li className="flex gap-3 rounded-2xl border border-dashed border-emerald-200 bg-emerald-50/30 p-4 text-sm text-slate-500 italic">
                  <span>لا توجد إنجازات مسجلة حالياً.</span>
                </li>
              )}
            </ul>
            <div className="mt-6 rounded-2xl border border-emerald-200/80 bg-emerald-50/70 p-4">
              <p className="text-sm font-bold text-emerald-900">ملاحظة المعلم</p>
              <p className="mt-2 text-sm text-slate-700">
                {progressData.notes || "لا توجد ملاحظات من المعلم حالياً."}
              </p>
            </div>
          </article>
        </section>

        <section className="mt-8 rounded-3xl border border-emerald-200/70 bg-white/70 p-5 shadow-lg shadow-emerald-900/5 sm:p-6">
          <h2 className="text-lg font-black text-emerald-950">بيانات التواصل</h2>
          <div className="mt-3 grid grid-cols-1 gap-3 text-sm sm:grid-cols-3">
            <p className="rounded-xl border border-emerald-100 bg-white p-3">
              <span className="block font-bold text-slate-600">رقم ولي الأمر</span>
              <span className="font-bold text-emerald-900" dir="ltr">{student.phone}</span>
            </p>
            <p className="rounded-xl border border-emerald-100 bg-white p-3">
              <span className="block font-bold text-slate-600">البريد الإلكتروني</span>
              <span className="font-bold text-emerald-900">{student.email}</span>
            </p>
            <p className="rounded-xl border border-emerald-100 bg-white p-3">
              <span className="block font-bold text-slate-600">الحصة التالية</span>
              <span className="font-bold text-emerald-900">{student.nextClass}</span>
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}

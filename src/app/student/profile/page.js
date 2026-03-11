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
  { course: "اللغة العربية - قواعد", date: "السبت 7 مارس", time: "6:00 م", duration: "60 دقيقة" },
  { course: "تلاوة وتجويد", date: "الاثنين 9 مارس", time: "5:30 م", duration: "45 دقيقة" },
  { course: "مراجعة واجبات", date: "الأربعاء 11 مارس", time: "7:00 م", duration: "30 دقيقة" },
];

const ACHIEVEMENTS = [
  "إكمال وحدة النحو الأساسية بنسبة 100%",
  "تحسن سرعة القراءة بنسبة 22% خلال آخر شهر",
  "حضور متواصل لمدة 9 حصص بدون غياب",
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

  useEffect(() => {
    const cookies = document.cookie.split("; ");
    const sessionCookie = cookies.find(c => c.startsWith("session="));
    if (sessionCookie) {
      try {
        const data = JSON.parse(decodeURIComponent(atob(sessionCookie.split("=")[1])));
        setStudent(prev => ({
          ...prev,
          name: data.name || prev.name,
          course: data.course || prev.course,
          level: data.course ? `مسجل في: ${data.course}` : prev.level,
          email: data.email || prev.email,
        }));
      } catch (e) { }
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
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 text-2xl font-black text-white shadow-lg shadow-emerald-500/30 sm:h-20 sm:w-20 sm:text-3xl">
                م
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
                الصفحة الرئيسية
              </Link>
            </div>
          </div>
        </section>

        <section className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="نسبة الحضور" value="96%" hint="غياب حصة واحدة فقط هذا الشهر" />
          <StatCard label="متوسط التقييم" value="8.6 / 10" hint="آخر 12 حصة" />
          <StatCard label="الساعات المنجزة" value="42 ساعة" hint="منذ تاريخ التسجيل" />
          <StatCard label="الحصة القادمة" value="السبت" hint="7 مارس 2026 - 6:00 م" />
        </section>

        <section className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
          <article className="modern-card rounded-3xl border border-white/70 p-6 shadow-xl shadow-emerald-900/5 lg:col-span-2">
            <h2 className="text-xl font-black text-emerald-950">تقدم المهارات</h2>
            <p className="mt-2 text-sm text-slate-600">مستوى الطالبة في المهارات الأساسية خلال آخر تقييم شهري.</p>
            <div className="mt-6 space-y-4">
              {PROGRESS.map((skill) => (
                <div key={skill.title}>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span className="font-bold text-emerald-900">{skill.title}</span>
                    <span className="font-bold text-emerald-700">{skill.value}%</span>
                  </div>
                  <div className="h-2.5 overflow-hidden rounded-full bg-emerald-100">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500"
                      style={{ width: `${skill.value}%` }}
                    />
                  </div>
                </div>
              ))}
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
                <li key={`${session.course}-${session.date}`} className="rounded-2xl border border-emerald-100 bg-white/70 p-4">
                  <p className="font-bold text-emerald-900">{session.course}</p>
                  <p className="mt-1 text-sm text-slate-700">{session.date} - {session.time}</p>
                  <p className="text-xs font-medium text-emerald-700">المدة: {session.duration}</p>
                </li>
              ))}
            </ul>
          </article>

          <article className="modern-card rounded-3xl border border-white/70 p-6 shadow-xl shadow-emerald-900/5">
            <h2 className="text-xl font-black text-emerald-950">الإنجازات والملاحظات</h2>
            <ul className="mt-4 space-y-3">
              {ACHIEVEMENTS.map((item) => (
                <li key={item} className="flex gap-3 rounded-2xl border border-emerald-100 bg-white/70 p-4 text-sm text-slate-700">
                  <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-emerald-500" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <div className="mt-6 rounded-2xl border border-emerald-200/80 bg-emerald-50/70 p-4">
              <p className="text-sm font-bold text-emerald-900">ملاحظة المعلم</p>
              <p className="mt-2 text-sm text-slate-700">
                الطالبة ملتزمة ومجتهدة. يُنصح بزيادة تدريبات المحادثة لمدة 10 دقائق يوميًا لتحسين الطلاقة خلال الأسابيع القادمة.
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

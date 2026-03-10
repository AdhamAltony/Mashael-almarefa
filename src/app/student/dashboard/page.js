"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const QUICK_STATS = [
  { label: "نسبة الحضور", value: "96%", hint: "آخر 30 يوم" },
  { label: "متوسط التقييم", value: "8.6 / 10", hint: "12 حصة" },
  { label: "الساعات المكتملة", value: "42", hint: "ساعة تعليمية" },
  { label: "الواجبات المنجزة", value: "18", hint: "من أصل 20" },
];

const UPCOMING = [
  { title: "قواعد اللغة العربية", date: "السبت 7 مارس 2026", time: "6:00 م", duration: "60 دقيقة" },
  { title: "تلاوة وتجويد", date: "الاثنين 9 مارس 2026", time: "5:30 م", duration: "45 دقيقة" },
  { title: "مراجعة أسبوعية", date: "الأربعاء 11 مارس 2026", time: "7:00 م", duration: "30 دقيقة" },
];

export default function StudentDashboardPage() {
  const [session, setSession] = useState(null);

  useEffect(() => {
    const cookies = document.cookie.split("; ");
    const sessionCookie = cookies.find(c => c.startsWith("session="));
    if (sessionCookie) {
      try {
        const data = JSON.parse(decodeURIComponent(atob(sessionCookie.split("=")[1])));
        setSession(data);
      } catch (e) {
        console.error("Failed to parse session", e);
      }
    }
  }, []);

  const studentName = session?.name || "مريم أحمد خالد";

  return (
    <main className="site-container py-10" dir="rtl">
      <section className="modern-card rounded-3xl border border-white/70 p-6 shadow-xl shadow-emerald-900/5 sm:p-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
              لوحة الطالب
            </p>
            <h1 className="mt-3 text-2xl font-black text-emerald-950 sm:text-3xl">مرحبًا {studentName}</h1>
            <p className="mt-2 text-sm text-slate-600">متابعة تقدمك الأكاديمي وحصصك القادمة في مكان واحد.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/student/profile"
              className="glow-button inline-flex items-center justify-center rounded-xl bg-gradient-to-l from-emerald-500 to-emerald-600 px-5 py-2.5 text-sm font-bold text-white transition-all hover:from-emerald-400 hover:to-emerald-500"
            >
              الملف الشخصي
            </Link>
            <Link
              href="/courses-center"
              className="inline-flex items-center justify-center rounded-xl border border-emerald-200 bg-white px-5 py-2.5 text-sm font-bold text-emerald-700 transition-colors hover:border-emerald-300 hover:bg-emerald-50"
            >
              مركز الدورات
            </Link>
          </div>
        </div>
      </section>

      <section className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {QUICK_STATS.map((stat) => (
          <article key={stat.label} className="modern-card rounded-2xl border border-emerald-100/70 p-5 shadow-lg shadow-emerald-900/5">
            <p className="text-sm font-bold text-emerald-700">{stat.label}</p>
            <p className="mt-1 text-2xl font-black text-emerald-950">{stat.value}</p>
            <p className="mt-1 text-xs text-slate-600">{stat.hint}</p>
          </article>
        ))}
      </section>

      <section className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <article className="modern-card rounded-3xl border border-white/70 p-6 shadow-xl shadow-emerald-900/5">
          <h2 className="text-xl font-black text-emerald-950">الحصص القادمة</h2>
          <ul className="mt-4 space-y-3">
            {UPCOMING.map((item) => (
              <li key={item.title + item.date} className="rounded-2xl border border-emerald-100 bg-white/70 p-4">
                <p className="font-bold text-emerald-900">{item.title}</p>
                <p className="mt-1 text-sm text-slate-700">{item.date}</p>
                <p className="text-sm text-emerald-700">{item.time} - {item.duration}</p>
              </li>
            ))}
          </ul>
        </article>

        <article className="modern-card rounded-3xl border border-white/70 p-6 shadow-xl shadow-emerald-900/5">
          <h2 className="text-xl font-black text-emerald-950">مهام الأسبوع</h2>
          <ul className="mt-4 space-y-3 text-sm text-slate-700">
            <li className="rounded-2xl border border-emerald-100 bg-white/70 p-4">مراجعة درس النحو: المبتدأ والخبر</li>
            <li className="rounded-2xl border border-emerald-100 bg-white/70 p-4">واجب كتابة فقرة قصيرة من 8 أسطر</li>
            <li className="rounded-2xl border border-emerald-100 bg-white/70 p-4">تدريب قراءة لمدة 15 دقيقة يوميًا</li>
          </ul>
          <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4 text-sm text-slate-700">
            <p className="font-bold text-emerald-900">ملاحظة المعلم</p>
            <p className="mt-2">استمرار التزامك بهذا المستوى سيرفع تقييم المحادثة بشكل واضح هذا الشهر.</p>
          </div>
        </article>
      </section>
    </main>
  );
}

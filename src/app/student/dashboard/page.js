"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

// Data fetched dynamically from progress and sessions in useEffect

export default function StudentDashboardPage() {
  const [session, setSession] = useState(null);
  const [progressData, setProgressData] = useState({
    attendance: "0",
    rating: "0",
    hours: "0",
    nextLesson: "لا يوجد موعد محدد حالياً",
    reading: 0,
    writing: 0,
    listening: 0,
    conversation: 0,
    achievements: "",
    notes: ""
  });
  const [sessions, setSessions] = useState([]);

  useEffect(() => {
    const cookies = document.cookie.split("; ");
    const sessionCookie = cookies.find(c => c.startsWith("session="));
    if (sessionCookie?.split("=")[1]) {
      try {
        const base64 = decodeURIComponent(sessionCookie.split("=")[1]);
        const decoded = decodeURIComponent(atob(base64));
        const data = JSON.parse(decoded);
        
        // Load latest profile updates from localStorage
        const profileRecord = localStorage.getItem(`student_profile_${data.email}`);
        if (profileRecord) {
            const parsed = JSON.parse(profileRecord);
            if (parsed.name) data.name = parsed.name;
            if (parsed.image) data.image = parsed.image;
        }

        setSession(data);

        // Fetch progress from localStorage using email
        const savedProgress = localStorage.getItem(`progress_${data.email}`);
        if (savedProgress) {
          setProgressData(JSON.parse(savedProgress));
        }

        // Fetch sessions from localStorage
        const savedSessions = localStorage.getItem(`sessions_${data.email}`);
        if (savedSessions) {
          setSessions(JSON.parse(savedSessions));
        }
      } catch {
        console.error("Failed to parse session");
      }
    }
  }, []);

  const studentName = session?.name || "جاري التحميل...";

  const dynamicStats = [
    { label: "نسبة الحضور", value: `${progressData.attendance}%`, hint: "إجمالي الحضور" },
    { label: "متوسط التقييم", value: `${progressData.rating} / 10`, hint: "أداء الطالب" },
    { label: "الساعات المكتملة", value: progressData.hours, hint: "ساعة تعليمية" },
    { label: "الحصة القادمة", value: progressData.nextLesson.split(" - ")[0], hint: progressData.nextLesson.split(" - ")[1] || "موعد مجدول" },
  ];

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
              href="/student/courses"
              className="inline-flex items-center justify-center rounded-xl border border-emerald-200 bg-white px-5 py-2.5 text-sm font-bold text-emerald-700 transition-colors hover:border-emerald-300 hover:bg-emerald-50"
            >
              مركز الدورات
            </Link>
          </div>
        </div>
      </section>

      <section className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {dynamicStats.map((stat) => (
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
          <div className="mt-4 space-y-3">
             {sessions.filter(s => !s.status).length > 0 ? (
               sessions.filter(s => !s.status).map((item, idx) => (
                 <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-emerald-100 bg-white/70 p-4 transition-all hover:shadow-md">
                    <div>
                        <p className="font-bold text-emerald-900">{item.title}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{item.date} - {item.time}</p>
                    </div>
                    <a 
                        href={item.meetLink || "https://meet.google.com/new"} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-[10px] font-bold text-white transition-all hover:bg-emerald-500 shadow-md shadow-emerald-600/20"
                    >
                        دخول الحصة
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                    </a>
                 </div>
               ))
             ) : (
                <div className="rounded-2xl border border-dashed border-emerald-200 bg-emerald-50/20 p-8 text-center">
                    <p className="text-sm font-bold text-emerald-950">لا توجد حصص قادمة مجدولة</p>
                    <p className="mt-1 text-xs text-slate-500">سيظهر موعد الحصة هنا فور قيام المعلم بجدولتها.</p>
                </div>
             )}
          </div>
        </article>

        <article className="modern-card rounded-3xl border border-white/70 p-6 shadow-xl shadow-emerald-900/5">
          <h2 className="text-xl font-black text-emerald-950">ملاحظات وتقدم الطالب</h2>
          
          {progressData.achievements && (
            <div className="mt-6">
              <h3 className="font-bold text-emerald-900 mb-4">أبرز الإنجازات والملاحظات:</h3>
              <ul className="space-y-3">
                {progressData.achievements?.split('\n').filter(a => a.trim()).slice(0, 5).map((a, idx) => (
                   <li key={idx} className="text-sm text-slate-700 flex gap-3 p-3 rounded-xl bg-emerald-50/50 border border-emerald-100/50">
                     <span className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 shrink-0 shadow-[0_0_8px_rgba(16,185,129,0.4)]" />
                     {a}
                   </li>
                ))}
              </ul>
            </div>
          )}

          {!progressData.achievements && (
             <div className="mt-8 rounded-2xl border border-dashed border-emerald-200 bg-emerald-50/20 p-10 text-center">
                <p className="text-sm text-slate-500 italic">لا توجد إنجازات أو ملاحظات مسجلة حالياً.</p>
             </div>
          )}
        </article>
      </section>
    </main>
  );
}

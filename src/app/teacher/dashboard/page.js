"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const INITIAL_STATS = [
    { label: "إجمالي الحصص", value: "24", key: "total_sessions" },
    { label: "الطلاب النشطون", value: "18", key: "active_students" },
    { label: "الحصص اليوم", value: "4", key: "today_sessions" },
    { label: "التقييم العام", value: "4.8/5", key: "rating" },
];

const INITIAL_CLASSES = [
    { id: 1, student: "أحمد محمود", course: "ركن القرآن", time: "10:00 صباحاً", meetLink: "https://meet.google.com/new" },
    { id: 2, student: "منى علي", course: "المناهج الدراسية", time: "01:00 مساءً", meetLink: "https://meet.google.com/new" },
    { id: 3, student: "عمر خالد", course: "اللغة العربية", time: "05:30 مساءً", meetLink: "https://meet.google.com/new" },
];

const LATEST_NOTIFICATIONS = [
    { text: "تم تأكيد جدولك للأسبوع القادم.", time: "منذ ساعة" },
    { text: "الطالب 'أحمد' اجتاز اختبار الحفظ بنجاح.", time: "منذ 3 ساعات" },
    { text: "تذكير: موعد حلقتك القادمة بعد 15 دقيقة.", time: "منذ ساعتين" },
];

export default function TeacherDashboardPage() {
    const router = useRouter();
    const [classes, setClasses] = useState([]);
    const [stats, setStats] = useState(INITIAL_STATS);
    const [teacherName, setTeacherName] = useState("المعلم");

    useEffect(() => {
        const fetchDashboardData = async () => {
            const { getLocalUsers } = require("@/utils/local-db");
            const allUsers = await getLocalUsers();

            const cookies = document.cookie.split("; ");
            const sessionCookie = cookies.find(c => c.startsWith("session="));
            let session = null;
            if (sessionCookie) {
                try {
                    const base64 = decodeURIComponent(sessionCookie.split("=")[1]);
                    const decoded = decodeURIComponent(atob(base64));
                    session = JSON.parse(decoded);
                    setTeacherName(session.name);
                } catch (e) { console.error(e); }
            }

            const teacherEmail = session?.email;
            const myStudents = allUsers.filter(u => {
                if (u.role !== "student") return false;
                const profile = JSON.parse(localStorage.getItem(`student_profile_${u.email}`) || "{}");
                const tEmail = teacherEmail?.trim().toLowerCase();
                const sTeacherEmail = profile.assignedTeacherEmail?.trim().toLowerCase();
                const sTeacherName = profile.assignedTeacher?.trim().toLowerCase();
                const tName = session?.name?.trim().toLowerCase();

                // Check legacy fields
                if (sTeacherEmail === tEmail || (sTeacherName && sTeacherName === tName)) return true;

                // Check new subscriptions object
                const subscriptions = profile.subscriptions || {};
                return Object.values(subscriptions).some(sub => 
                    sub.email?.trim().toLowerCase() === tEmail || 
                    sub.name?.trim().toLowerCase() === tName
                );
            });

            const teacherDoneCount = localStorage.getItem(`teacher_done_${session?.email}`) || "0";

            setStats([
                { label: "إجمالي الحصص", value: teacherDoneCount, key: "total_sessions" },
                { label: "الطلاب النشطون", value: myStudents.length.toString(), key: "active_students" },
                { label: "التقييم العام", value: "4.9/5", key: "rating" },
                { label: "القسم", value: session?.course || "عام", key: "department" },
            ]);

            if (myStudents.length > 0) {
                const dynamicClasses = myStudents.slice(0, 3).map((s, idx) => ({
                    id: s.id || idx,
                    student: s.name,
                    email: s.email, // Added email for the redirect
                    course: s.course,
                    time: "10:00 صباحاً",
                    meetLink: "https://meet.google.com/new"
                }));
                setClasses(dynamicClasses);
            } else {
                setClasses([]);
            }
        };
        
        fetchDashboardData();
    }, []);

    const markAttendance = (studentEmail) => {
        router.push(`/teacher/attendance?email=${encodeURIComponent(studentEmail)}`);
    };

    return (
        <main className="site-container py-10" dir="rtl">
            <section className="modern-card rounded-3xl border border-white/70 p-6 shadow-xl shadow-emerald-900/5 sm:p-8">
                <div className="flex items-center gap-5">
                    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 text-2xl font-black text-white shadow-lg shadow-emerald-500/30 sm:h-20 sm:w-20 sm:text-3xl relative overflow-hidden group">
                        <span className="group-hover:opacity-0 transition-opacity">م</span>
                        <input type="file" accept="image/*" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" title="رفع صورة شخصية" />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                        </div>
                    </div>
                    <div>
                        <p className="inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
                            لوحة تحكم المعلم
                        </p>
                        <h1 className="mt-3 text-2xl font-black text-emerald-950 sm:text-3xl">مرحباً بك في لوحة تحكمك</h1>
                        <p className="mt-2 text-sm text-slate-600">يمكنك هنا متابعة حصصك القادمة، نشاطات طلابك، ومؤشرات أدائك كمعلم.</p>
                    </div>
                </div>
            </section>

            <section className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat) => (
                    <article key={stat.label} className="modern-card rounded-2xl border border-emerald-100/70 p-5 shadow-lg shadow-emerald-900/5 hover:-translate-y-1 transition-transform">
                        <p className="text-sm font-bold text-emerald-700">{stat.label}</p>
                        <p className="mt-1 text-3xl font-black text-emerald-950">{stat.value}</p>
                        <p className="mt-1 text-xs text-slate-600">{stat.delta || "تحديث تلقائي"}</p>
                    </article>
                ))}
            </section>

            <section className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
                <article className="modern-card rounded-3xl border border-white/70 p-6 shadow-xl shadow-emerald-900/5 lg:col-span-2">
                    <h2 className="text-xl font-black text-emerald-950">الحلقات / الحصص القادمة</h2>
                    <ul className="mt-4 space-y-3 text-sm text-slate-700">
                        {classes.length > 0 ? classes.map((cls) => (
                            <li key={cls.id} className="flex flex-col gap-4 rounded-2xl border border-emerald-100 bg-white/70 p-4 transition-colors hover:bg-emerald-50/50 sm:flex-row sm:items-center sm:justify-between">
                                <div className="flex flex-col">
                                    <span className="font-bold text-emerald-950">{cls.student}</span>
                                    <span className="text-xs text-slate-500 mt-1">{cls.course}</span>
                                </div>
                                <div className="flex flex-wrap items-center gap-2">
                                    <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-100/80 px-2 py-1 text-xs font-bold text-emerald-700">
                                        <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                        {cls.time}
                                    </span>
                                    <a href={cls.meetLink || "https://meet.google.com/new"} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs font-bold text-emerald-600 hover:text-emerald-800 transition-colors">
                                        دخول لجوجل ميت
                                    </a>
                                    <button 
                                        onClick={() => markAttendance(cls.email)}
                                        className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 transition-colors"
                                    >
                                        تسجيل حضور
                                    </button>
                                </div>
                            </li>
                        )) : (
                            <p className="py-10 text-center text-slate-500">لا توجد حصص مجدولة حالياً.</p>
                        )}
                    </ul>
                </article>

                <article className="modern-card rounded-3xl border border-white/70 p-6 shadow-xl shadow-emerald-900/5">
                    <h2 className="text-xl font-black text-emerald-950">أحدث الإشعارات</h2>
                    <ul className="mt-4 space-y-3">
                        {LATEST_NOTIFICATIONS.map((item, idx) => (
                            <li key={idx} className="rounded-2xl border border-emerald-100 bg-white/70 p-4">
                                <p className="text-sm font-bold text-emerald-900">{item.text}</p>
                                <p className="mt-1 text-xs text-slate-600">{item.time}</p>
                            </li>
                        ))}
                    </ul>
                </article>
            </section>
        </main>
    );
}

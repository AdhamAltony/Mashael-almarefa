const TEACHER_STATS = [
    { label: "إجمالي الحصص", value: "24", delta: "هذا الأسبوع" },
    { label: "الطلاب النشطون", value: "18", delta: "معك في 3 أقسام" },
    { label: "الحصص اليوم", value: "4", delta: "2 مكتملة" },
    { label: "التقييم العام", value: "4.8/5", delta: "تحسن ملحوظ" },
];

const UPCOMING_CLASSES = [
    { student: "أحمد محمود", course: "ركن القرآن", time: "10:00 صباحاً", meetLink: "https://meet.google.com/new" },
    { student: "منى علي", course: "المناهج الدراسية", time: "01:00 مساءً", meetLink: "https://meet.google.com/new" },
    { student: "عمر خالد", course: "اللغة العربية", time: "05:30 مساءً", meetLink: "https://meet.google.com/new" },
];

const LATEST_NOTIFICATIONS = [
    { text: "تم تأكيد جدولك للأسبوع القادم.", time: "منذ ساعة" },
    { text: "الطالب 'أحمد' اجتاز اختبار الحفظ بنجاح.", time: "منذ 3 ساعات" },
    { text: "تذكير: موعد حلقتك القادمة بعد 15 دقيقة.", time: "منذ ساعتين" },
];

export default function TeacherDashboardPage() {
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

            {/* Profile Completion Prompt */}
            <section className="mt-6">
                <div className="modern-card rounded-3xl bg-gradient-to-r from-emerald-500 to-emerald-600 p-6 shadow-xl text-white">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="text-right">
                            <h2 className="text-xl font-bold">أكمل ملفك الشخصي الآن!</h2>
                            <p className="mt-1 text-emerald-50 opacity-90 text-sm">اجذب المزيد من الطلاب بإضافة مهاراتك، خبراتك، ومواعيدك المتاحة.</p>
                        </div>
                        <a href="/teacher/profile" className="shrink-0 bg-white text-emerald-600 px-6 py-2.5 rounded-xl font-bold hover:bg-emerald-50 transition-colors shadow-lg">تعديل الملف الشخصي</a>
                    </div>
                </div>
            </section>

            <section className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {TEACHER_STATS.map((stat) => (
                    <article key={stat.label} className="modern-card rounded-2xl border border-emerald-100/70 p-5 shadow-lg shadow-emerald-900/5 hover:-translate-y-1 transition-transform">
                        <p className="text-sm font-bold text-emerald-700">{stat.label}</p>
                        <p className="mt-1 text-3xl font-black text-emerald-950">{stat.value}</p>
                        <p className="mt-1 text-xs text-slate-600">{stat.delta}</p>
                    </article>
                ))}
            </section>

            <section className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
                <article className="modern-card rounded-3xl border border-white/70 p-6 shadow-xl shadow-emerald-900/5 lg:col-span-2">
                    <h2 className="text-xl font-black text-emerald-950">الحلقات / الحصص القادمة</h2>
                    <ul className="mt-4 space-y-3 text-sm text-slate-700">
                        {UPCOMING_CLASSES.map((cls, idx) => (
                            <li key={idx} className="flex items-center justify-between rounded-2xl border border-emerald-100 bg-white/70 p-4 transition-colors hover:bg-emerald-50/50">
                                <div className="flex flex-col">
                                    <span className="font-bold text-emerald-950">{cls.student}</span>
                                    <span className="text-xs text-slate-500 mt-1">{cls.course}</span>
                                </div>
                                <div className="flex flex-col items-end">
                                    <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-100/80 px-2 py-1 text-xs font-bold text-emerald-700">
                                        <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                        {cls.time}
                                    </span>
                                    <a href={cls.meetLink || "https://meet.google.com/new"} target="_blank" rel="noopener noreferrer" className="mt-2 flex items-center gap-1 text-xs font-bold text-emerald-600 hover:text-emerald-800 transition-colors">
                                        دخول لجوجل ميت
                                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                                    </a>
                                </div>
                            </li>
                        ))}
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

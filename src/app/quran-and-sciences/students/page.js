"use client";

import Link from "next/link";
import TeacherNavbar from "../../teacher/teacher-navbar";

const NAV_LINKS = [
    { label: "تسجيل حضور الطالب", href: "/quran-and-sciences" },
    { label: "الطلبة المسجلين", href: "/quran-and-sciences/students" },
];

const STUDENTS_DATA = [
    { id: "QUR-001", name: "أحمد محمود", age: 10, joinDate: "15 يناير 2026", level: "الجزء الأول" },
    { id: "QUR-002", name: "عمر عبد الله", age: 12, joinDate: "20 يناير 2026", level: "الجزء الثاني" },
    { id: "QUR-003", name: "فاطمة علي", age: 9, joinDate: "01 فبراير 2026", level: "التحفة السنية" },
    { id: "QUR-004", name: "زينب حسن", age: 11, joinDate: "15 فبراير 2026", level: "تسميع متن الجزرية" },
    { id: "QUR-005", name: "يوسف طارق", age: 8, joinDate: "05 مارس 2026", level: "حفظ سورة البقرة" },
];

// Navbar removed as we use TeacherNavbar

function FooterSection() {
    return (
        <footer id="contact" className="relative overflow-hidden bg-[#041722] text-emerald-50">
            <div className="site-container py-12">
                <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                    <div>
                        <h3 className="mb-3 text-2xl font-bold">مشاعل المعرفة</h3>
                        <p className="max-w-xl text-sm leading-relaxed text-emerald-100/85">
                            بيئة تربوية متكاملة تزرع العلم والإيمان معًا، وتجمع بين تعليم القرآن واللغة العربية والمناهج الدراسية.
                        </p>
                    </div>
                    <div className="md:text-left">
                        <h4 className="mb-3 text-lg font-bold">تواصل معنا</h4>
                        <p className="text-sm text-emerald-100/85">البريد الإلكتروني: info@mashael-almaarifa.com</p>
                        <p className="mt-2 text-sm text-emerald-100/85" dir="ltr">
                            WhatsApp: +20 100 000 0000
                        </p>
                    </div>
                </div>
                <div className="mt-10 border-t border-emerald-200/15 pt-6 text-center text-sm text-emerald-100/70">
                    © {new Date().getFullYear()} مشاعل المعرفة. جميع الحقوق محفوظة.
                </div>
            </div>
        </footer>
    );
}

export default function StudentsListPage() {
    return (
        <main
            dir="rtl"
            className="relative flex min-h-[100dvh] flex-col overflow-x-clip text-emerald-950 font-sans"
        >
            <div className="fixed inset-0 z-[-1] bg-gradient-to-b from-[#f8fbfb] via-[#f2f8f8] to-[#eef5f5]">
                <div className="absolute top-0 right-0 h-[500px] w-[500px] -translate-x-1/4 -translate-y-1/4 rounded-full bg-emerald-100/60 blur-3xl pointer-events-none" />
                <div className="absolute bottom-0 left-0 h-[600px] w-[600px] translate-x-1/3 translate-y-1/4 rounded-full bg-emerald-50/80 blur-3xl pointer-events-none" />
            </div>

            <TeacherNavbar
                sectionTitle="بوابة ركن القرآن"
                links={NAV_LINKS}
                ctaLabel="العودة إلى الصفحة الرئيسية"
                ctaHref="/teacher/dashboard"
                showCtaWithSession={true}
            />

            <section className="relative z-10 flex flex-1 flex-col justify-center px-4 pt-28 pb-16 sm:px-6 sm:pt-32 sm:pb-24">
                <div className="mx-auto w-full max-w-5xl">
                    <header className="mb-10 text-center">
                        <span className="mb-4 inline-block rounded-full bg-emerald-100 px-5 py-2 text-sm font-bold text-emerald-700 shadow-sm border border-emerald-200/50">
                            بوابة المعلمين - ركن القرآن
                        </span>
                        <h1 className="mb-4 text-3xl font-black leading-snug text-emerald-950 sm:text-4xl text-balance">
                            الطلبة المسجلين بالقسم
                        </h1>
                        <p className="mx-auto max-w-xl text-base text-slate-600 sm:text-lg text-balance">
                            قائمة بجميع الطلبة المسجلين لديك في قسم ركن القرآن.
                        </p>
                    </header>

                    <div className="modern-card overflow-hidden rounded-[2rem] border border-white/60 bg-white/60 shadow-2xl shadow-emerald-900/5">
                        <div className="overflow-x-auto">
                            <table className="w-full text-right text-sm text-slate-600">
                                <thead className="bg-emerald-50/80 text-emerald-900 border-b border-emerald-200/60">
                                    <tr>
                                        <th scope="col" className="px-6 py-4 font-bold">#</th>
                                        <th scope="col" className="px-6 py-4 font-bold">اسم الطالب</th>
                                        <th scope="col" className="px-6 py-4 font-bold">العمر</th>
                                        <th scope="col" className="px-6 py-4 font-bold">المستوى / المحفوظ</th>
                                        <th scope="col" className="px-6 py-4 font-bold">تاريخ الالتحاق</th>
                                        <th scope="col" className="px-6 py-4 font-bold text-center">الإجراءات</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-emerald-100/60">
                                    {STUDENTS_DATA.map((student, idx) => (
                                        <tr key={student.id} className="transition-colors hover:bg-emerald-50/40">
                                            <td className="px-6 py-4 font-medium text-slate-500">{idx + 1}</td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-700">
                                                        {student.name.split(" ")[0][0]}
                                                    </div>
                                                    <span className="font-bold text-emerald-950">{student.name}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">{student.age} سنة</td>
                                            <td className="px-6 py-4">
                                                <span className="inline-flex items-center rounded-md bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700 ring-1 ring-inset ring-emerald-600/20">
                                                    {student.level}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">{student.joinDate}</td>
                                            <td className="px-6 py-4 text-center">
                                                <Link
                                                    href="/quran-and-sciences"
                                                    className="font-bold text-emerald-600 hover:text-emerald-800 hover:underline"
                                                >
                                                    تسجيل حضور
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {STUDENTS_DATA.length === 0 && (
                                <div className="p-8 text-center text-slate-500">
                                    لا يوجد طلاب مسجلين حالياً
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            <div className="mt-auto w-full relative z-20">
                <FooterSection />
            </div>
        </main>
    );
}

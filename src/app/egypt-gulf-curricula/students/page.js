"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import TeacherNavbar from "../../teacher/teacher-navbar";
import * as db from "@/utils/db";

const NAV_LINKS = [
    { label: "طلاب القسم", href: "/egypt-gulf-curricula/students" },
    { label: "الملف الشخصي", href: "/teacher/profile" },
];

function ProgressModal({ student, onClose, onSave }) {
    const [progress, setProgress] = useState({
        attendance: "95",
        rating: "8.5",
        hours: "20",
        nextLesson: "السبت القادم 4م",
        reading: "80",
        writing: "70",
        listening: "90",
        conversation: "85",
        achievements: "",
        notes: ""
    });

    useEffect(() => {
        const loadProgress = async () => {
            const savedProgress = await db.getProfile("student_progress", student.email);
            if (savedProgress && Object.keys(savedProgress).length > 0) {
                setProgress(savedProgress);
            }
        };
        loadProgress();
    }, [student.email]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        await onSave(student.email, progress);
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
            <div className="w-full max-w-2xl overflow-hidden rounded-[2.5rem] bg-white shadow-2xl animate-in fade-in zoom-in duration-300">
                <div className="bg-emerald-600 px-8 py-6 text-white text-center">
                    <h2 className="text-2xl font-black text-white">تحديث تقدم الطالب</h2>
                    <p className="mt-1 text-emerald-100 font-medium">{student.name}</p>
                </div>
                
                <form onSubmit={handleSubmit} className="max-h-[80vh] overflow-y-auto p-8 text-right" dir="rtl">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <h3 className="font-bold text-emerald-800 border-b border-emerald-100 pb-2">الإحصائيات العامة</h3>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1">نسبة الحضور (%)</label>
                                <input type="number" value={progress.attendance} onChange={(e) => setProgress({...progress, attendance: e.target.value})} className="w-full rounded-xl border border-emerald-100 bg-emerald-50/30 px-4 py-2 text-sm outline-none focus:border-emerald-500" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1">متوسط التقييم (من 10)</label>
                                <input type="text" value={progress.rating} onChange={(e) => setProgress({...progress, rating: e.target.value})} className="w-full rounded-xl border border-emerald-100 bg-emerald-50/30 px-4 py-2 text-sm outline-none focus:border-emerald-500" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1">الساعات المنجزة</label>
                                <input type="number" value={progress.hours} onChange={(e) => setProgress({...progress, hours: e.target.value})} className="w-full rounded-xl border border-emerald-100 bg-emerald-50/30 px-4 py-2 text-sm outline-none focus:border-emerald-500" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1">موعد الحصة القادمة</label>
                                <input type="text" value={progress.nextLesson} onChange={(e) => setProgress({...progress, nextLesson: e.target.value})} className="w-full rounded-xl border border-emerald-100 bg-emerald-50/30 px-4 py-2 text-sm outline-none focus:border-emerald-500" />
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h3 className="font-bold text-emerald-800 border-b border-emerald-100 pb-2">تقدم المهارات (%)</h3>
                            {['reading', 'writing', 'listening', 'conversation'].map((skill) => (
                                <div key={skill}>
                                    <label className="block text-xs font-bold text-slate-500 mb-1">
                                        {skill === 'reading' ? 'القراءة' : skill === 'writing' ? 'الكتابة' : skill === 'listening' ? 'الاستماع' : 'المحادثة'}
                                    </label>
                                    <div className="flex items-center gap-2">
                                        <input 
                                            type="range" 
                                            min="0" max="100" 
                                            value={progress[skill]} 
                                            onChange={(e) => setProgress({...progress, [skill]: e.target.value})} 
                                            className="h-2 flex-1 bg-emerald-100 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                                        />
                                        <span className="text-xs font-bold text-emerald-600 w-8">{progress[skill]}%</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="mt-8 space-y-4">
                        <h3 className="font-bold text-emerald-800 border-b border-emerald-100 pb-2">الإنجازات والملاحظات</h3>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 mb-1">أبرز الإنجازات</label>
                            <textarea 
                                value={progress.achievements || ""} 
                                onChange={(e) => setProgress({...progress, achievements: e.target.value})}
                                placeholder="اكتب إنجازات الطالب هنا..."
                                rows="3"
                                className="w-full rounded-xl border border-emerald-100 bg-emerald-50/30 px-4 py-2 text-sm outline-none focus:border-emerald-500 resize-none"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 mb-1">ملاحظات المعلم</label>
                            <textarea 
                                value={progress.notes || ""} 
                                onChange={(e) => setProgress({...progress, notes: e.target.value})}
                                placeholder="اكتب ملاحظاتك على مستوى الطالب هنا..."
                                rows="3"
                                className="w-full rounded-xl border border-emerald-100 bg-emerald-50/30 px-4 py-2 text-sm outline-none focus:border-emerald-500 resize-none"
                            />
                        </div>
                    </div>

                    <div className="mt-8 flex gap-3">
                        <button type="submit" className="flex-1 rounded-xl bg-emerald-600 py-3 font-bold text-white shadow-lg shadow-emerald-600/20 transition-all hover:bg-emerald-500">حفظ التعديلات</button>
                        <button type="button" onClick={onClose} className="flex-1 rounded-xl bg-slate-100 py-3 font-bold text-slate-600 transition-all hover:bg-slate-200">إلغاء</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default function CurriculaStudentsListPage() {
    const [students, setStudents] = useState([]);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadStudents = async () => {
            const allUsers = await db.getLocalUsers();
            const filtered = allUsers.filter(u => u.role === "student" && u.course === "المناهج الدراسية");
            setStudents(filtered);
            setLoading(false);
        };
        loadStudents();
    }, []);

    const handleSave = async (studentEmail, progress) => {
        await db.saveProfile("student_progress", studentEmail, progress);
        alert("تم حفظ بيانات التقدم بنجاح!");
        setSelectedStudent(null);
    };

    if (loading) return <div className="p-10 text-center text-emerald-900 font-bold">جاري التحميل...</div>;

    return (
        <main dir="rtl" className="relative flex min-h-[100dvh] flex-col overflow-x-clip text-emerald-950 font-sans">
            <div className="fixed inset-0 z-[-1] bg-gradient-to-b from-[#f8fbfb] via-[#f2f8f8] to-[#eef5f5]">
                <div className="absolute top-0 right-0 h-[500px] w-[500px] -translate-x-1/4 -translate-y-1/4 rounded-full bg-emerald-100/60 blur-3xl pointer-events-none" />
                <div className="absolute bottom-0 left-0 h-[600px] w-[600px] translate-x-1/3 translate-y-1/4 rounded-full bg-emerald-50/80 blur-3xl pointer-events-none" />
            </div>

            <TeacherNavbar
                sectionTitle="المناهج الدراسية"
                links={NAV_LINKS}
                ctaLabel="العودة إلى الصفحة الرئيسة"
                ctaHref="/teacher/profile"
                showCtaWithSession={true}
            />

            <section className="relative z-10 flex flex-1 flex-col justify-center px-4 pt-28 pb-16 sm:px-6 sm:pt-32 sm:pb-24">
                <div className="mx-auto w-full max-w-5xl">
                    <header className="mb-10 text-center">
                        <span className="mb-4 inline-block rounded-full bg-emerald-100 px-5 py-2 text-sm font-bold text-emerald-700 shadow-sm border border-emerald-200/50">بوابة المعلمين - المناهج الدراسية</span>
                        <h1 className="mb-4 text-3xl font-black text-emerald-950 sm:text-4xl text-balance">الطلبة المسجلين بالقسم</h1>
                        <p className="mx-auto max-w-xl text-base text-slate-600 sm:text-lg text-balance">إدارة وتحديث تقدم الطلاب المسجلين لديك في قسم المناهج الدراسية.</p>
                    </header>

                    <div className="modern-card overflow-hidden rounded-[2rem] border border-white/60 bg-white/60 shadow-2xl shadow-emerald-900/5">
                        <div className="overflow-x-auto">
                            <table className="w-full text-right text-sm text-slate-600">
                                <thead className="bg-emerald-50/80 text-emerald-900 border-b border-emerald-200/60">
                                    <tr>
                                        <th className="px-6 py-4 font-bold">#</th>
                                        <th className="px-6 py-4 font-bold">اسم الطالب</th>
                                        <th className="px-6 py-4 font-bold text-center">العمر</th>
                                        <th className="px-6 py-4 font-bold">الصف الدراسي</th>
                                        <th className="px-6 py-4 font-bold text-center">الإجراءات</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-emerald-100/60 font-medium">
                                    {students.map((student, idx) => (
                                        <tr key={student.id} className="transition-colors hover:bg-emerald-50/40">
                                            <td className="px-6 py-4 text-slate-500">{idx + 1}</td>
                                            <td className="px-6 py-4 font-bold text-emerald-950">{student.name}</td>
                                            <td className="px-6 py-4 text-center">{student.age} سنة</td>
                                            <td className="px-6 py-4">
                                                <span className="inline-flex items-center rounded-md bg-emerald-100/40 px-2 py-1 text-xs font-bold text-emerald-700">{student.level || student.course}</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center justify-center gap-3">
                                                    <button 
                                                        onClick={() => setSelectedStudent(student)}
                                                        className="rounded-lg bg-emerald-600 px-4 py-2 text-[10px] font-bold text-white transition-all hover:bg-emerald-500"
                                                    >
                                                        تحديث التقدم
                                                    </button>
                                                    <Link
                                                        href="/egypt-gulf-curricula"
                                                        className="font-bold text-[10px] text-emerald-700 hover:text-emerald-900 transition-colors"
                                                    >
                                                        تسجيل حضور
                                                    </Link>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {students.length === 0 && (
                                <div className="p-12 text-center text-slate-500 font-medium">
                                    لا يوجد طلاب مسجلين حالياً.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            {selectedStudent && (
                <ProgressModal 
                    student={selectedStudent} 
                    onClose={() => setSelectedStudent(null)} 
                    onSave={handleSave} 
                />
            )}
        </main>
    );
}

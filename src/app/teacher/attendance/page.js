"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import * as db from "@/utils/db";

function AttendanceContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const initialEmail = searchParams.get("email") || "";

    const [loading, setLoading] = useState(true);
    const [department, setDepartment] = useState("");
    const [students, setStudents] = useState([]);
    const [saved, setSaved] = useState(false);
    
    const [formData, setFormData] = useState({
        studentEmail: initialEmail,
        date: new Date().toISOString().split('T')[0],
        status: "حاضر",
        duration: "60 دقيقة",
        topic: "",
        rating: "10 / 10",
        notes: ""
    });

    useEffect(() => {
        const loadPageData = async () => {
            const cookies = document.cookie.split("; ");
            const sessionCookie = cookies.find(c => c.startsWith("session="));
            
            if (!sessionCookie) {
                router.push("/auth/login");
                return;
            }

            try {
                const base64 = decodeURIComponent(sessionCookie.split("=")[1]);
                const decoded = decodeURIComponent(atob(base64));
                const sessionData = JSON.parse(decoded);
                
                let deptName = sessionData.department || "";
                if (!deptName && sessionData.course) {
                    if (sessionData.course.includes("القرآن")) deptName = "ركن القرآن الكريم";
                    else if (sessionData.course.includes("العربية")) deptName = "اللغة العربية لغير الناطقين";
                    else if (sessionData.course.includes("المناهج")) deptName = "المناهج الدراسية";
                }
                setDepartment(deptName);

                const allUsers = await db.getLocalUsers();
                const filtered = allUsers.filter(u => 
                    u.role === "student" && 
                    (u.course === deptName || u.department === deptName)
                );
                setStudents(filtered);
                
                if (initialEmail) {
                    setFormData(prev => ({ ...prev, studentEmail: initialEmail }));
                }
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };

        loadPageData();
    }, [router, initialEmail]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        const cookies = document.cookie.split("; ");
        const sessionCookie = cookies.find(c => c.startsWith("session="));
        let teacherEmail = "";
        
        if (sessionCookie) {
            try {
                const base64 = decodeURIComponent(sessionCookie.split("=")[1]);
                const decoded = decodeURIComponent(atob(base64));
                const sessionData = JSON.parse(decoded);
                teacherEmail = sessionData.email;
            } catch (err) { console.error("Session sync error:", err); }
        }

        const student = students.find(s => s.email === formData.studentEmail);
        
        // 1. Unified Save (Replaces multiple localStorage legacy calls)
        await db.saveAttendanceSession({
            ...formData,
            teacherEmail,
            studentName: student?.name || "طالب غير معروف",
            courseName: department
        });

        // 2. Legacy Support (Maintain old keys for backward compatibility in components not yet fully migrated)
        const logs = JSON.parse(localStorage.getItem(`attendance_${formData.studentEmail}`) || "[]");
        logs.push(formData);
        localStorage.setItem(`attendance_${formData.studentEmail}`, JSON.stringify(logs));
        
        if (teacherEmail) {
            const currentCount = parseInt(localStorage.getItem(`teacher_done_${teacherEmail}`) || "0");
            localStorage.setItem(`teacher_done_${teacherEmail}`, (currentCount + 1).toString());
            
            const teacherHistory = JSON.parse(localStorage.getItem(`teacher_history_${teacherEmail}`) || "[]");
            teacherHistory.push({ ...formData, studentName: student?.name || "طالب غير معروف", timestamp: new Date().getTime() });
            localStorage.setItem(`teacher_history_${teacherEmail}`, JSON.stringify(teacherHistory));

            const adminTotal = parseInt(localStorage.getItem("admin_total_sessions") || "0");
            localStorage.setItem("admin_total_sessions", (adminTotal + 1).toString());
        }

        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
    };

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-slate-50 font-sans">
                <div className="h-12 w-12 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 font-sans p-4 sm:p-20" dir="rtl">
            <header className="mb-12 text-center">
                <span className="mb-4 inline-block rounded-full bg-emerald-100 px-5 py-2 text-sm font-bold text-emerald-700 shadow-sm border border-emerald-200/50">
                    مركز تسجيل الحضور
                </span>
                <h1 className="text-3xl font-black text-slate-900 sm:text-5xl">تحضير الطلاب</h1>
                <p className="mt-4 text-slate-500 font-medium">سجل بيانات الحصة وأداء الطالب بدقة.</p>
            </header>

            <div className="mx-auto max-w-2xl">
                <div className="bg-white rounded-[3rem] p-10 shadow-2xl shadow-slate-200/50 border border-slate-100">
                    <form onSubmit={handleSubmit} className="space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="col-span-1">
                                <label className="block text-sm font-black text-slate-600 mb-3">اختر الطالب</label>
                                <select 
                                    value={formData.studentEmail}
                                    onChange={(e) => setFormData({...formData, studentEmail: e.target.value})}
                                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all font-bold appearance-none cursor-pointer"
                                    required
                                >
                                    <option value="">اختر من القائمة...</option>
                                    {students.map(s => (
                                        <option key={s.id} value={s.email}>{s.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="col-span-1">
                                <label className="block text-sm font-black text-slate-600 mb-3">تاريخ الحصة</label>
                                <input 
                                    type="date"
                                    value={formData.date}
                                    onChange={(e) => setFormData({...formData, date: e.target.value})}
                                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all font-bold"
                                    required
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-black text-slate-600 mb-3">حالة الحضور</label>
                                <select 
                                    value={formData.status}
                                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all font-bold appearance-none cursor-pointer"
                                >
                                    <option value="حاضر">حاضر ✅</option>
                                    <option value="غائب">غائب ❌</option>
                                    <option value="غائب بعذر">غائب بعذر ⏳</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-black text-slate-600 mb-3">تقييم الطالب</label>
                                <select 
                                    value={formData.rating}
                                    onChange={(e) => setFormData({...formData, rating: e.target.value})}
                                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all font-bold appearance-none cursor-pointer"
                                >
                                    <option value="10 / 10">ممتاز جداً 10/10</option>
                                    <option value="9 / 10">ممتاز 9/10</option>
                                    <option value="8 / 10">جيد جداً 8/10</option>
                                    <option value="7 / 10">جيد 7/10</option>
                                    <option value="6 / 10">يحتاج تحسين 6/10</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-black text-slate-600 mb-3">موضوع الحصة</label>
                            <input 
                                type="text"
                                placeholder="مثال: سورة البقرة - الوجه الخامس"
                                value={formData.topic}
                                onChange={(e) => setFormData({...formData, topic: e.target.value})}
                                className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all font-bold"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-black text-slate-600 mb-3">ملاحظات إضافية</label>
                            <textarea 
                                placeholder="اكتب أي ملاحظات للولي الأمر هنا..."
                                rows="4"
                                value={formData.notes}
                                onChange={(e) => setFormData({...formData, notes: e.target.value})}
                                className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all font-bold resize-none"
                            ></textarea>
                        </div>

                        <div className="pt-4">
                            <button 
                                type="submit"
                                className="w-full bg-emerald-600 text-white rounded-2xl py-5 font-black text-lg transition-all shadow-xl shadow-emerald-600/20 hover:bg-emerald-700 active:scale-95 flex items-center justify-center gap-3"
                            >
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                                تسجيل البيانات الآن
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {saved && (
                <div className="fixed bottom-10 left-10 z-[100] animate-in slide-in-from-left-10 duration-500">
                    <div className="bg-emerald-600 text-white px-8 py-4 rounded-2xl shadow-2xl flex items-center gap-4 font-black">
                        <span className="text-2xl">⚡</span>
                        تم تسجيل الحضور بنجاح وجاري إبلاغ الإدارة
                    </div>
                </div>
            )}
        </div>
    );
}

export default function AttendancePage() {
    return (
        <Suspense fallback={
            <div className="flex h-screen items-center justify-center bg-slate-50 font-sans">
                <div className="h-12 w-12 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent"></div>
            </div>
        }>
            <AttendanceContent />
        </Suspense>
    );
}

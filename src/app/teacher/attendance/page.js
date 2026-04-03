"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

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
        const fetchAttendanceData = async () => {
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
                
                const { getLocalUsers } = require("@/utils/local-db");
                const allUsers = await getLocalUsers();
                
                // 1. Get fresh teacher data
                const freshTeacher = allUsers.find(u => u.email === sessionData.email);
                if (!freshTeacher) {
                    router.push("/auth/login");
                    return;
                }

                let deptName = freshTeacher.department || "";
                if (!deptName && freshTeacher.course) {
                    if (freshTeacher.course.includes("القرآن")) deptName = "ركن القرآن الكريم";
                    else if (freshTeacher.course.includes("العربية")) deptName = "اللغة العربية لغير الناطقين";
                    else if (freshTeacher.course.includes("المناهج")) deptName = "المناهج الدراسية";
                }
                setDepartment(deptName);
                
                const teacherSubjects = freshTeacher.subjects || [];

                // 2. Filter students specifically assigned to THIS teacher
                const filtered = allUsers.filter(u => {
                    if (u.role !== "student") return false;
                    
                    const profile = JSON.parse(localStorage.getItem(`student_profile_${u.email}`) || "{}");
                    const tEmail = sessionData.email?.trim().toLowerCase();
                    
                    // Check legacy field
                    if (profile.assignedTeacherEmail?.trim().toLowerCase() === tEmail) return true;

                    // Check new subscriptions object
                    const subscriptions = profile.subscriptions || {};
                    return Object.values(subscriptions).some(sub => 
                        sub.email?.trim().toLowerCase() === tEmail
                    );
                });
                
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
        
        fetchAttendanceData();
    }, [router, initialEmail]);

    const handleSubmit = (e) => {
        e.preventDefault();

        // 1. Save attendance log for the student
        const logs = JSON.parse(localStorage.getItem(`attendance_${formData.studentEmail}`) || "[]");
        logs.push(formData);
        localStorage.setItem(`attendance_${formData.studentEmail}`, JSON.stringify(logs));
        
        // 2. Increment Teacher Completed Sessions
        const cookies = document.cookie.split("; ");
        const sessionCookie = cookies.find(c => c.startsWith("session="));
        if (sessionCookie) {
            try {
                const base64 = decodeURIComponent(sessionCookie.split("=")[1]);
                const decoded = decodeURIComponent(atob(base64));
                const sessionData = JSON.parse(decoded);
                const teacherEmail = sessionData.email;
                
                if (teacherEmail) {
                    const currentCount = parseInt(localStorage.getItem(`teacher_done_${teacherEmail}`) || "0");
                    localStorage.setItem(`teacher_done_${teacherEmail}`, (currentCount + 1).toString());
                    
                    // 3. Save to Teacher's individual history for Admin review
                    const teacherHistory = JSON.parse(localStorage.getItem(`teacher_history_${teacherEmail}`) || "[]");
                    const studentName = students.find(s => s.email === formData.studentEmail)?.name || "طالب غير معروف";
                    teacherHistory.push({ ...formData, studentName, timestamp: new Date().getTime() });
                    localStorage.setItem(`teacher_history_${teacherEmail}`, JSON.stringify(teacherHistory));

                    // Also update Admin global sessions count
                    const adminTotal = parseInt(localStorage.getItem("admin_total_sessions") || "0");
                    localStorage.setItem("admin_total_sessions", (adminTotal + 1).toString());
                }
            } catch (err) { console.error("Session sync error:", err); }
        }

        setSaved(true);
        setTimeout(() => {
            setSaved(false);
            router.push("/teacher/students");
        }, 1500);
    };

    if (loading) return <div className="p-20 text-center text-emerald-900 font-bold">جاري التحميل...</div>;

    return (
        <main dir="rtl" className="relative flex min-h-[100dvh] flex-col overflow-x-clip text-emerald-950 font-sans">
            {/* Soft Gradient Background */}
            <div className="fixed inset-0 z-[-1] bg-[#fcfdfd]">
                <div className="absolute top-0 right-0 h-[400px] w-[400px] -translate-x-1/4 -translate-y-1/4 rounded-full bg-emerald-50 blur-[100px] pointer-events-none" />
                <div className="absolute bottom-0 left-0 h-[500px] w-[500px] translate-x-1/3 translate-y-1/4 rounded-full bg-emerald-50/50 blur-[120px] pointer-events-none" />
            </div>

            <section className="relative z-10 flex flex-1 flex-col px-4 pt-10 pb-16 sm:px-6">
                <div className="mx-auto w-full max-w-4xl">
                    <header className="mb-8 text-center">
                        <span className="mb-3 inline-block rounded-full bg-emerald-50 px-4 py-1.5 text-xs font-bold text-emerald-600 border border-emerald-100/50">
                            منصة مشاعل المعرفة - {department}
                        </span>
                        <h1 className="mb-3 text-2xl font-bold text-emerald-950 sm:text-3xl">تسجيل حضور ومتابعة طالب</h1>
                        <p className="mx-auto max-w-lg text-sm text-slate-500 font-medium">قم بتعبئة تقرير الحصة بدقة لضمان متابعة ولي الأمر لتقدم الطالب.</p>
                    </header>

                    <div className="modern-card overflow-hidden rounded-3xl border border-white bg-white/70 shadow-xl shadow-emerald-900/5 p-8 sm:p-10 backdrop-blur-md">
                        <form onSubmit={handleSubmit} className="space-y-8" dir="rtl">
                            {/* Row 1: Student & Date */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-emerald-900 pr-1">اسم الطالب <span className="text-red-500">*</span></label>
                                    <select 
                                        value={formData.studentEmail} 
                                        onChange={(e) => setFormData({...formData, studentEmail: e.target.value})}
                                        className="w-full rounded-xl border border-slate-200 bg-white/50 px-4 py-3.5 text-base font-medium text-emerald-950 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-400/5 outline-none transition-all"
                                        required
                                    >
                                        <option value="">-- اختر الطالب --</option>
                                        {students.map(s => <option key={s.email} value={s.email}>{s.name}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-emerald-900 pr-1">تاريخ الحصة <span className="text-red-500">*</span></label>
                                    <input 
                                        type="date" 
                                        value={formData.date} 
                                        onChange={(e) => setFormData({...formData, date: e.target.value})} 
                                        className="w-full rounded-xl border border-slate-200 bg-white/50 px-4 py-3.5 text-base font-medium text-emerald-900 focus:border-emerald-400 outline-none transition-all" 
                                        required 
                                    />
                                </div>
                            </div>

                            {/* Row 2: Status & Duration & Topic */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-emerald-900 pr-1">حالة الحضور <span className="text-red-500">*</span></label>
                                    <div className="flex gap-2">
                                        <button 
                                            type="button" 
                                            onClick={() => setFormData({...formData, status: 'حاضر'})}
                                            className={`flex-1 rounded-xl py-3 text-sm font-bold transition-all border ${formData.status === 'حاضر' ? 'bg-emerald-500 text-white border-emerald-500 shadow-sm' : 'bg-white text-slate-400 border-slate-100'}`}
                                        >
                                            حاضر
                                        </button>
                                        <button 
                                            type="button" 
                                            onClick={() => setFormData({...formData, status: 'غائب'})}
                                            className={`flex-1 rounded-xl py-3 text-sm font-bold transition-all border ${formData.status === 'غائب' ? 'bg-red-500 text-white border-red-500 shadow-sm' : 'bg-white text-slate-400 border-slate-100'}`}
                                        >
                                            غائب
                                        </button>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-emerald-900 pr-1">المدة <span className="text-red-500">*</span></label>
                                    <select 
                                        value={formData.duration} 
                                        onChange={(e) => setFormData({...formData, duration: e.target.value})}
                                        className="w-full rounded-xl border border-slate-200 bg-white/50 px-4 py-3.5 text-base font-medium text-emerald-900 focus:border-emerald-400 outline-none"
                                        required
                                    >
                                        <option value="30 دقيقة">30 دقيقة</option>
                                        <option value="45 دقيقة">45 دقيقة</option>
                                        <option value="60 دقيقة">ساعة</option>
                                        <option value="90 دقيقة">ساعة ونصف</option>
                                        <option value="120 دقيقة">ساعتان</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-emerald-900 pr-1">موضوع الحلقة <span className="text-red-500">*</span></label>
                                    <input 
                                        type="text"
                                        value={formData.topic} 
                                        onChange={(e) => setFormData({...formData, topic: e.target.value})}
                                        placeholder="مثلاً: سورة البقرة، النحو، الرياضيات..."
                                        className="w-full rounded-xl border border-slate-200 bg-white/50 px-4 py-3.5 text-base font-medium text-emerald-950 focus:border-emerald-400 outline-none transition-all shadow-sm placeholder:text-slate-300"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Row 3: Rating & Notes */}
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-emerald-900 pr-1">تقييم (10/)</label>
                                    <select 
                                        value={formData.rating} 
                                        onChange={(e) => setFormData({...formData, rating: e.target.value})}
                                        className="w-full rounded-xl border border-slate-200 bg-white/50 px-4 py-3.5 text-center font-bold text-amber-600 focus:border-amber-400 outline-none"
                                        required
                                    >
                                        {[10,9,8,7,6,5,4,3,2,1].map(num => <option key={num} value={`${num} / 10`}>{num} / 10</option>)}
                                    </select>
                                </div>
                                <div className="md:col-span-3 space-y-2">
                                    <label className="text-sm font-bold text-emerald-900 pr-1">ملاحظات التقرير لولي الأمر</label>
                                    <textarea 
                                        value={formData.notes} 
                                        onChange={(e) => setFormData({...formData, notes: e.target.value})} 
                                        rows={3} 
                                        placeholder="اكتب نبذة مختصرة عن أداء الطالب اليوم..." 
                                        className="w-full rounded-xl border border-slate-200 bg-white/50 px-5 py-3.5 text-base font-medium text-emerald-950 focus:border-emerald-400 outline-none resize-none"
                                    ></textarea>
                                </div>
                            </div>

                            <div className="pt-6 border-t border-emerald-50 flex items-center justify-end gap-3">
                                <button 
                                    type="button" 
                                    onClick={() => router.back()}
                                    className="px-8 py-3.5 text-sm font-bold text-slate-400 hover:text-slate-600 transition-colors"
                                >
                                    إلغاء التغييرات
                                </button>
                                <button 
                                    type="submit" 
                                    className="rounded-xl bg-emerald-600 px-10 py-3.5 text-base font-bold text-white shadow-lg shadow-emerald-600/10 transition-all hover:bg-emerald-500 active:scale-95"
                                >
                                    حفظ التقرير وإرساله
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </section>

            {saved && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-emerald-950/5 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="rounded-2xl bg-white p-10 text-center shadow-xl border border-emerald-50">
                        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-500">
                            <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                        </div>
                        <h3 className="mb-1 text-xl font-bold text-emerald-950">تم الحفظ بنجاح</h3>
                        <p className="text-sm text-slate-500 font-medium tracking-tight">جاري العودة لقائمة الطلاب...</p>
                    </div>
                </div>
            )}
        </main>
    );
}

export default function TeacherAttendancePage() {
    return (
        <Suspense fallback={<div className="p-20 text-center text-emerald-900 font-bold">جاري التحميل...</div>}>
            <AttendanceContent />
        </Suspense>
    );
}

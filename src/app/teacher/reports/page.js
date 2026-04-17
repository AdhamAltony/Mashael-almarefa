"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getTeacherReports } from "@/utils/local-db";
import Swal from "sweetalert2";

export default function TeacherReportsPage() {
    const [reports, setReports] = useState([]);
    const [filteredReports, setFilteredReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [teacherSession, setTeacherSession] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [dateFilter, setDateFilter] = useState("");
    const router = useRouter();

    useEffect(() => {
        const fetchReports = async () => {
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
                setTeacherSession(sessionData);

                // 1. Fetch reports
                const data = await getTeacherReports(sessionData.email);
                
                // 2. Fetch full student profiles to get images
                const { getLocalUsers } = await import("@/utils/local-db");
                const allUsers = await getLocalUsers();
                const studentMap = {};
                allUsers.forEach(u => {
                    if (u.role === "student") {
                        // Map by name (fallback if email isn't in reports yet)
                        studentMap[u.name] = u.image || u.photo_url;
                    }
                });

                // 3. Enrich reports with real images
                const enrichedData = data.map(r => ({
                    ...r,
                    student_image: studentMap[r.student_name] || null
                }));

                setReports(enrichedData);
                setFilteredReports(enrichedData);
            } catch (e) {
                console.error("Session error", e);
            } finally {
                setLoading(false);
            }
        };

        fetchReports();
    }, [router]);

    useEffect(() => {
        let result = [...reports];
        
        if (searchTerm) {
            result = result.filter(r => 
                (r.student_name || "").toLowerCase().includes(searchTerm.toLowerCase())
            );
        }
        
        if (dateFilter) {
            result = result.filter(r => r.session_date === dateFilter);
        }
        
        setFilteredReports(result);
    }, [searchTerm, dateFilter, reports]);

    const showFullReport = (report) => {
        const notesArray = report.notes.split('|').map(n => n.trim());
        
        let htmlContent = `
            <div class="text-right space-y-4 font-sans" dir="rtl">
                <div class="flex items-center gap-3 p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                    <div class="h-16 w-16 shrink-0 rounded-2xl bg-emerald-500 flex items-center justify-center text-white text-2xl font-bold shadow-lg overflow-hidden border-2 border-white">
                        ${report.student_image ? 
                            `<img src="${report.student_image}" class="h-full w-full object-cover" />` : 
                            `<span>${report.student_name.charAt(0)}</span>`
                        }
                    </div>
                    <div>
                        <div class="font-bold text-emerald-950 text-xl">${report.student_name}</div>
                        <div class="text-xs text-emerald-600 font-bold">${report.course_name}</div>
                    </div>
                </div>
                
                <div class="grid grid-cols-2 gap-3">
                    <div class="p-4 bg-slate-50 rounded-xl border border-slate-100">
                        <div class="text-[10px] text-slate-400 font-bold mb-1 uppercase tracking-wider">تاريخ الجلسة</div>
                        <div class="text-base font-black text-slate-700">${report.session_date}</div>
                    </div>
                    <div class="p-4 bg-slate-50 rounded-xl border border-slate-100">
                        <div class="text-[10px] text-slate-400 font-bold mb-1 uppercase tracking-wider">وقت التسجيل</div>
                        <div class="text-base font-black text-slate-700">${formatTime12h(report.session_time)}</div>
                    </div>
                </div>

                <div class="space-y-2">
                    <div class="text-sm font-black text-emerald-900 border-r-4 border-emerald-500 pr-3">تفاصيل التقرير الكاملة:</div>
                    <div class="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm space-y-4">
                        ${notesArray.map(n => `
                            <div class="flex items-start gap-3 text-sm">
                                <div class="mt-1.5 h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0"></div>
                                <span class="text-slate-600 leading-relaxed font-bold">${n}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>

                <div class="flex items-center justify-center gap-2 pt-2">
                    <span class="px-5 py-2 bg-emerald-100 text-emerald-700 rounded-full text-xs font-black border border-emerald-200/50">
                        مدة الحصة: ${report.duration} دقيقة
                    </span>
                    <span class="px-5 py-2 bg-emerald-500 text-white rounded-full text-xs font-black shadow-lg shadow-emerald-500/20">
                        سجل معتمد
                    </span>
                </div>
            </div>
        `;

        Swal.fire({
            html: htmlContent,
            showConfirmButton: true,
            confirmButtonText: 'إغلاق',
            confirmButtonColor: '#10b981',
            customClass: {
                container: 'swal-rtl-container',
                popup: 'rounded-[2rem] border-none shadow-2xl',
            },
            width: '32rem'
        });
    };

    const formatTime12h = (timeStr) => {
        if (!timeStr) return "";
        // If already in 12h format (contains AM/PM), return as is
        if (timeStr.toLowerCase().includes('am') || timeStr.toLowerCase().includes('pm')) return timeStr;
        
        try {
            const [hours, minutes, seconds] = timeStr.split(':').map(Number);
            const suffix = hours >= 12 ? 'PM' : 'AM';
            const h12 = hours % 12 || 12;
            return `${h12.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')} ${suffix}`;
        } catch (e) {
            return timeStr;
        }
    };

    if (loading) {
        return (
            <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
                <div className="h-16 w-16 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent shadow-lg shadow-emerald-500/20"></div>
                <div className="text-emerald-900 font-bold animate-pulse">جاري جلب التقارير...</div>
            </div>
        );
    }

    return (
        <main dir="rtl" className="relative flex min-h-[100dvh] flex-col overflow-x-clip text-emerald-950 font-sans">
            {/* Soft Gradient Background */}
            <div className="fixed inset-0 z-[-1] bg-[#f8fbfb]">
                <div className="absolute top-0 right-0 h-[500px] w-[500px] -translate-x-1/4 -translate-y-1/4 rounded-full bg-emerald-100/40 blur-[120px] pointer-events-none" />
                <div className="absolute bottom-0 left-0 h-[600px] w-[600px] translate-x-1/3 translate-y-1/4 rounded-full bg-emerald-50/60 blur-[150px] pointer-events-none" />
            </div>

            <section className="relative z-10 flex flex-1 flex-col px-4 pt-10 pb-16 sm:px-8">
                <div className="mx-auto w-full max-w-6xl">
                    <header className="mb-12 text-center">
                        <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-5 py-2 text-xs font-bold text-emerald-700 border border-emerald-200/50 shadow-sm">
                            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                            سجل التقارير الذكي
                        </div>
                        <h1 className="mb-4 text-3xl font-black text-emerald-950 sm:text-4xl">مراجعة جلسات الحضور</h1>
                        <p className="mx-auto max-w-xl text-slate-500 font-medium text-lg leading-relaxed">تتبع جميع جلساتك التي قمت بمزامنتها مع الإدارة لضمان دقة البيانات وحفظ مجهودك.</p>
                    </header>

                    {/* Dashboard Stats (Simplified) */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                        <div className="bg-white p-5 rounded-3xl border border-white shadow-xl shadow-emerald-900/5 backdrop-blur-sm">
                            <div className="text-[10px] font-bold text-slate-400 mb-1">إجمالي الجلسات</div>
                            <div className="text-2xl font-black text-emerald-600">{reports.length}</div>
                        </div>
                        <div className="bg-white p-5 rounded-3xl border border-white shadow-xl shadow-emerald-900/5 backdrop-blur-sm">
                            <div className="text-[10px] font-bold text-slate-400 mb-1">تمت فلترتها</div>
                            <div className="text-2xl font-black text-emerald-500">{filteredReports.length}</div>
                        </div>
                        <div className="hidden md:block bg-white p-5 rounded-3xl border border-white shadow-xl shadow-emerald-900/5 backdrop-blur-sm">
                            <div className="text-[10px] font-bold text-slate-400 mb-1">أول جلسة</div>
                            <div className="text-sm font-bold text-slate-600">{reports[reports.length-1]?.session_date || "—"}</div>
                        </div>
                        <div className="hidden md:block bg-white p-5 rounded-3xl border border-white shadow-xl shadow-emerald-900/5 backdrop-blur-sm">
                            <div className="text-[10px] font-bold text-slate-400 mb-1">آخر جلسة</div>
                            <div className="text-sm font-bold text-slate-600">{reports[0]?.session_date || "—"}</div>
                        </div>
                    </div>

                    {/* Filters Section */}
                    <div className="mb-8 flex flex-col md:flex-row gap-4 items-stretch bg-white/40 p-5 rounded-[2.5rem] border border-white backdrop-blur-xl shadow-2xl shadow-emerald-900/5">
                        <div className="relative flex-1 group">
                            <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none transition-colors group-focus-within:text-emerald-500 text-slate-400">
                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                            <input 
                                type="text" 
                                placeholder="ابحث باسم الطالب المكتوب في التقرير..." 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full bg-white/80 rounded-2xl border border-slate-200/60 py-4 pr-12 pl-4 text-sm font-bold text-emerald-950 outline-none focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500 transition-all shadow-sm"
                            />
                        </div>
                        <div className="flex gap-3">
                            <div className="relative flex-1 md:flex-initial">
                                <input 
                                    type="date" 
                                    value={dateFilter}
                                    onChange={(e) => setDateFilter(e.target.value)}
                                    className="h-full bg-white/80 rounded-2xl border border-slate-200/60 px-5 py-4 text-sm font-bold text-emerald-950 outline-none focus:border-emerald-500 transition-all shadow-sm cursor-pointer"
                                />
                                {dateFilter && (
                                    <button 
                                        onClick={() => setDateFilter("")}
                                        className="absolute -top-2 -left-2 h-6 w-6 rounded-full bg-red-500 text-white flex items-center justify-center text-[10px] shadow-lg shadow-red-500/20"
                                    >✕</button>
                                )}
                            </div>
                            <button 
                                onClick={() => { setSearchTerm(""); setDateFilter(""); }}
                                className="px-6 py-4 bg-slate-50 border border-slate-200 text-slate-500 text-sm font-bold rounded-2xl hover:bg-slate-100 transition-colors"
                            >إعادة تعيين</button>
                        </div>
                    </div>

                    <div className="modern-card overflow-hidden rounded-[2.5rem] border border-white/60 bg-white/60 shadow-2xl shadow-emerald-900/5 backdrop-blur-xl flex flex-col max-h-[calc(100vh-320px)]">
                        <div className="overflow-x-auto overflow-y-auto custom-scrollbar">
                            <table className="w-full text-right text-sm border-collapse">
                                <thead className="sticky top-0 z-10 bg-emerald-50 shadow-sm">
                                    <tr className="text-emerald-900">
                                        <th className="px-6 py-6 font-black text-sm uppercase tracking-wider">الطالب والقسم</th>
                                        <th className="px-6 py-6 font-black text-sm uppercase tracking-wider">تاريخ الجلسة</th>
                                        <th className="px-6 py-6 font-black text-sm uppercase tracking-wider text-center">المدة</th>
                                        <th className="px-6 py-6 font-black text-sm uppercase tracking-wider">الموضوع والتقييم</th>
                                        <th className="px-6 py-6 font-black text-sm uppercase tracking-wider text-center">الإجراء</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-emerald-100/50">
                                    {filteredReports.map((report) => (
                                        <tr key={report.id} className="transition-all hover:bg-emerald-500/[0.02]">
                                            <td className="px-6 py-6">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-12 w-12 shrink-0 rounded-xl bg-gradient-to-br from-emerald-50 to-emerald-100 border border-emerald-200/50 flex items-center justify-center text-emerald-600 font-black text-xl shadow-sm overflow-hidden">
                                                        {report.student_image ? (
                                                            <img src={report.student_image} alt={report.student_name} className="h-full w-full object-cover" />
                                                        ) : (
                                                            report.student_name?.charAt(0)
                                                        )}
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="font-black text-emerald-950 text-lg">{report.student_name}</span>
                                                        <span className="text-xs font-bold text-emerald-600/70">{report.course_name}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-6 whitespace-nowrap text-right">
                                                <div className="flex flex-col">
                                                    <div className="font-black text-slate-700 text-base">{report.session_date}</div>
                                                    <div className="text-xs font-bold text-slate-400">{formatTime12h(report.session_time)}</div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-6 text-center whitespace-nowrap">
                                                <span className="px-5 py-2 bg-emerald-100/50 text-emerald-700 rounded-xl text-sm font-black border border-emerald-200/30 shadow-sm inline-block">
                                                    {report.duration} دقيقة
                                                </span>
                                            </td>
                                            <td className="px-6 py-6 max-w-[300px]">
                                                <div className="text-sm font-bold text-slate-600 leading-relaxed line-clamp-2 italic">
                                                    {report.notes}
                                                </div>
                                            </td>
                                            <td className="px-6 py-6 text-center border-r border-emerald-50/50">
                                                <button 
                                                    onClick={() => showFullReport(report)}
                                                    className="inline-flex items-center gap-2 px-6 py-3 bg-white border border-emerald-200 text-emerald-600 font-black text-sm rounded-xl shadow-sm hover:bg-emerald-600 hover:text-white hover:border-emerald-600 hover:-translate-y-0.5 active:scale-95 transition-all"
                                                >
                                                    عرض التفاصيل
                                                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                    </svg>
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {filteredReports.length === 0 && (
                                        <tr>
                                            <td colSpan={5} className="py-24 text-center">
                                                <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-slate-50 border border-slate-100 shadow-inner">
                                                    <svg className="h-10 w-10 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                                                    </svg>
                                                </div>
                                                <h3 className="text-xl font-black text-slate-800 mb-2">لا توجد تقارير مطابقة</h3>
                                                <p className="text-slate-400 font-bold max-w-xs mx-auto">جرب تغيير معايير البحث أو اختيار تاريخ مختلف للعثور على الجلسات المطلوبة.</p>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
}

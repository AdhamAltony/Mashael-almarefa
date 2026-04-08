"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Swal from "sweetalert2";
import CourseVideoPlayer from "@/components/CourseVideoPlayer";
import { getPlatformVideos, getAssignedCourseTitles } from "@/utils/local-db";

export default function StudentCoursesPage() {
    const [user, setUser] = useState(null);
    const [assignedCourses, setAssignedCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedVideo, setSelectedVideo] = useState(null);
    const [videoError, setVideoError] = useState(false);

    useEffect(() => {
        const loadData = async () => {
            const cookies = document.cookie.split("; ");
            const sessionCookie = cookies.find(c => c.startsWith("session="));
            let currentUserEmail = "";
            
            if (sessionCookie) {
                try {
                    const base64 = decodeURIComponent(sessionCookie.split("=")[1]);
                    const decoded = decodeURIComponent(atob(base64));
                    const userData = JSON.parse(decoded);
                    setUser(userData);
                    currentUserEmail = userData.email;
                } catch {
                    console.error("Error parsing session");
                }
            }

            const allPlatformVideos = await getPlatformVideos();
            const userAssignedCourseTitles = await getAssignedCourseTitles(currentUserEmail);

            const formattedVideos = allPlatformVideos.map(video => ({
                id: video.id,
                title: video.title,
                description: video.notes || "لا يوجد وصف لهذه الدورة حالياً.",
                videoUrl: video.videoUrl,
                hasVideo: video.videoUrl && video.videoUrl !== "#",
                thumbnailUrl: video.thumbnailUrl,
                date: video.date,
                icon: '📚',
                isAssigned: userAssignedCourseTitles.includes(video.title)
            }));

            setAssignedCourses(formattedVideos);
            setLoading(false);
        };
        loadData();
    }, []);

    const handleVideoClick = (course) => {
        if (!user) {
            Swal.fire({
                title: 'تنبيه',
                text: 'يجب عليك تسجيل الدخول أولاً لمشاهدة محتوى هذه الدورة.',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'تسجيل الدخول',
                cancelButtonText: 'إغلاق',
                confirmButtonColor: '#10b981',
                cancelButtonColor: '#6b7280',
            }).then((result) => {
                if (result.isConfirmed) {
                    window.location.href = '/auth/login';
                }
            });
            return;
        }

        if (!course.isAssigned) {
            Swal.fire({
                title: 'دورة غير مفعلة',
                text: `لم يتم تفعيل دورة "${course.title}" لحسابك بعد. يرجى الاشتراك عبر الواتساب لتتمكن من مشاهدة المحتوى.`,
                icon: 'info',
                showCancelButton: true,
                confirmButtonText: 'تواصل عبر الواتساب',
                cancelButtonText: 'إغلاق',
                confirmButtonColor: '#25D366',
                cancelButtonColor: '#6b7280',
            }).then((result) => {
                if (result.isConfirmed) {
                    const message = encodeURIComponent(`السلام عليكم، أريد الاشتراك في دورة: ${course.title}`);
                    window.open(`https://wa.me/201210212176?text=${message}`, '_blank');
                }
            });
            return;
        }

        setSelectedVideo(course);
        setVideoError(false);
    };

    const handleVideoError = (e) => {
        const isDev = process.env.NODE_ENV === 'development';
        if (isDev) {
            console.warn("Ignoring video error in development mode per configuration.");
            return;
        }
        
        setVideoError(true);
        console.error("Video load failed:", e.target?.error?.message);
    };

    if (loading) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center">
                <div className="h-12 w-12 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent"></div>
            </div>
        );
    }

    return (
        <main className="site-container py-10" dir="rtl">
            <header className="mb-10 text-center">
                <span className="mb-4 inline-block rounded-full bg-emerald-100 px-5 py-2 text-sm font-bold text-emerald-700 shadow-sm border border-emerald-200/50">
                    مركز الدورات التعليمية
                </span>
                <h1 className="text-3xl font-black text-emerald-950 sm:text-4xl">الدورات التعليمية المتاحة</h1>
                <p className="mt-2 text-slate-600 font-medium">
                    تصفح مجموعة واسعة من الدورات التعليمية واللقاءات المسجلة.
                </p>
            </header>

            {assignedCourses.length === 0 ? (
                <div className="modern-card flex flex-col items-center justify-center py-24 text-center rounded-[3rem] bg-white/60 border border-white shadow-xl">
                    <div className="mb-8 flex h-28 w-28 items-center justify-center rounded-full bg-emerald-50 text-emerald-200 shadow-inner">
                        <svg className="h-14 w-14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-black text-emerald-950">لا توجد دورات متاحة حالياً</h2>
                    <p className="mt-3 max-w-sm text-slate-500 font-medium leading-relaxed">
                        سيتم إضافة المحتوى التعليمي قريباً؛ يرجى العودة لاحقاً.
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                    {assignedCourses.map((course) => (
                        <article key={course.id} className="modern-card group flex flex-col overflow-hidden rounded-[2.5rem] border border-white bg-white/80 shadow-2xl shadow-emerald-900/5 transition-all duration-500 hover:-translate-y-3 hover:shadow-emerald-900/10">
                            <div className="relative h-52 overflow-hidden bg-slate-100 flex items-center justify-center group-hover:scale-105 transition-transform duration-500">
                                {course.thumbnailUrl ? (
                                    <img src={course.thumbnailUrl} alt={course.title} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-6xl">
                                        <span className="drop-shadow-lg">{course.icon}</span>
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-black/10 opacity-0 transition-opacity group-hover:opacity-100"></div>
                                {user && !course.isAssigned && (
                                    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-emerald-950/40 backdrop-blur-[2px] text-white">
                                        <svg className="h-10 w-10 mb-2 drop-shadow-lg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                        </svg>
                                        <span className="text-[10px] font-black uppercase tracking-widest drop-shadow-md">محتوى غير متاح</span>
                                    </div>
                                )}
                                <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold text-white border border-white/30">
                                    {course.date}
                                </div>
                            </div>
                            <div className="flex flex-1 flex-col p-8">
                                <h3 className="mb-3 text-xl font-black text-emerald-950 group-hover:text-emerald-600 transition-colors">{course.title}</h3>
                                <p className="mb-8 text-sm leading-relaxed text-slate-500 font-medium line-clamp-3">
                                    {course.description}
                                </p>
                                <div className="mt-auto">
                                    <button
                                        onClick={() => handleVideoClick(course)}
                                        className={`inline-flex w-full items-center justify-center gap-3 rounded-2xl px-6 py-4 text-sm font-black text-white transition-all hover:scale-[1.02] active:scale-95 shadow-lg ${
                                            (!user || course.isAssigned) 
                                                ? "bg-emerald-950 hover:bg-black shadow-emerald-950/10" 
                                                : "bg-[#25D366] hover:bg-[#128C7E] shadow-[#25D366]/10"
                                        }`}
                                    >
                                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                            {(!user || course.isAssigned) ? (
                                                course.hasVideo ? (
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                                ) : (
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                )
                                            ) : (
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                            )}
                                        </svg>
                                        {(!user || course.isAssigned) ? (course.hasVideo ? "مشاهدة الفيديو الآن" : "عرض التفاصيل") : "اشترك عبر الواتساب"}
                                    </button>
                                </div>
                            </div>
                        </article>
                    ))}
                </div>
            )}

            {selectedVideo && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-md p-4 animate-in fade-in" onClick={() => setSelectedVideo(null)}>
                    <div className="relative w-full max-w-5xl bg-white rounded-[3.5rem] overflow-hidden shadow-[0_20px_70px_-15px_rgba(0,0,0,0.2)] animate-in zoom-in-95 flex flex-col border border-emerald-100" onClick={e => e.stopPropagation()}>
                        <div className="p-8 bg-gradient-to-r from-emerald-800 to-emerald-950 text-white flex justify-between items-center shadow-lg relative overflow-hidden">
                            {/* Decorative background circle */}
                            <div className="absolute -top-24 -left-20 w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>
                            <div className="relative z-10 flex items-center gap-4">
                                <div className="h-14 w-14 bg-white/10 rounded-2xl backdrop-blur-md flex items-center justify-center text-3xl shadow-inner border border-white/20">
                                    {selectedVideo.icon}
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black tracking-tight">{selectedVideo.title}</h2>
                                    <p className="text-sm text-emerald-200 font-bold flex items-center gap-2">
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                        تاريخ الإضافة: {selectedVideo.date}
                                    </p>
                                </div>
                            </div>
                            <button onClick={() => setSelectedVideo(null)} className="h-12 w-12 flex items-center justify-center rounded-2xl bg-white/10 hover:bg-white/20 transition-all border border-white/10 hover:rotate-90">
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        
                        <div className="flex flex-col lg:flex-row min-h-[500px]">
                            {/* Left Side: Media Cover */}
                            <div className="lg:w-1/2 p-8 bg-slate-50 flex items-center justify-center border-l border-slate-100">
                                <div className="relative w-full aspect-video group transition-all duration-500 overflow-hidden rounded-[2.5rem] shadow-2xl shadow-emerald-950/10 border-4 border-white bg-slate-900 flex items-center justify-center">
                                    {(selectedVideo.videoUrl && selectedVideo.videoUrl !== "#") ? (
                                        <CourseVideoPlayer 
                                            videoUrl={selectedVideo.videoUrl} 
                                            poster={selectedVideo.thumbnailUrl}
                                            title={selectedVideo.title}
                                            onVideoError={handleVideoError}
                                        />
                                    ) : (
                                        <div className="relative w-full h-full group bg-emerald-50">
                                            {selectedVideo.thumbnailUrl ? (
                                                <img 
                                                    src={selectedVideo.thumbnailUrl} 
                                                    alt={selectedVideo.title} 
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                                />
                                            ) : (
                                                <div className="flex flex-col items-center justify-center w-full h-full bg-gradient-to-br from-emerald-100 to-emerald-200 text-emerald-500 text-8xl">
                                                    {selectedVideo.icon}
                                                    <p className="text-sm font-black mt-4 text-emerald-700/40">لا يوجد فيديو أو صورة للعرض</p>
                                                </div>
                                            )}
                                            <div className="absolute inset-0 bg-emerald-950/10 mix-blend-overlay group-hover:opacity-0 transition-opacity"></div>
                                        </div>
                                    )}

                                    {videoError && (
                                        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center text-center p-10 bg-slate-900/90 backdrop-blur-sm animate-in fade-in">
                                            <div className="h-20 w-20 bg-red-500/10 rounded-full flex items-center justify-center mb-4 border border-red-500/20">
                                                <svg className="w-10 h-10 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                            </div>
                                            <p className="text-white font-bold text-lg mb-2">تعذر تشغيل الفيديو</p>
                                            <p className="text-slate-400 text-sm max-w-md">الرابط قد يكون غير صالح أو انتهت صلاحيته. يرجى تجديده من لوحة التحكم.</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Right Side: Description */}
                            <div className="lg:w-1/2 p-8 lg:p-12 flex flex-col bg-white overflow-y-auto max-h-[60vh] lg:max-h-none">
                                <div className="mb-8">
                                    <h3 className="text-xl font-black text-emerald-950 mb-6 flex items-center gap-3">
                                        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                        </span>
                                        تفاصيل وملاحظات المحتوى
                                    </h3>
                                    
                                    <div className="space-y-6">
                                        <div className="p-8 rounded-[2.5rem] bg-[#f8fbfa] border border-emerald-50 shadow-inner relative group">
                                            <div className="absolute top-0 right-0 p-4 opacity-10">
                                                <svg className="w-12 h-12 text-emerald-900" fill="currentColor" viewBox="0 0 24 24"><path d="M14.017 21L14.017 18C14.017 16.8954 14.9124 16 16.017 16H19.017C19.5693 16 20.017 15.5523 20.017 15V9C20.017 8.44772 19.5693 8 19.017 8H16.017C14.9124 8 14.017 7.10457 14.017 6V4L20.017 4C21.1216 4 22.017 4.89543 22.017 6V15C22.017 16.6569 20.6739 18 19.017 18H16.017C15.4647 18 15.017 18.4477 15.017 19V21H14.017ZM4 21L4 18C4 16.8954 4.89543 16 6 16H9C9.55228 16 10 15.5523 10 15V9C10 8.44772 9.55228 8 9 8H6C4.89543 8 4 7.10457 4 6V4L10 4C11.1046 4 12 4.89543 12 6V15C12 16.6569 10.6569 18 9 18H6C5.44772 18 5 18.4477 5 19V21H4Z" /></svg>
                                            </div>
                                            <p className="text-emerald-950 text-xl font-bold leading-[2] whitespace-pre-line text-right">
                                                {selectedVideo.description}
                                            </p>
                                        </div>

                                        <div className="flex gap-4 items-center p-4 bg-amber-50/50 rounded-2xl border border-amber-100">
                                            <div className="h-10 w-10 flex-shrink-0 bg-amber-100 rounded-full flex items-center justify-center text-amber-600">
                                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                                            </div>
                                            <p className="text-xs font-bold text-amber-800 leading-relaxed">
                                                يرجى قراءة الملاحظات بدقة قبل البدء في المذاكرة. في حال عدم وضوح أي نقطة، يمكنك التواصل مع الدعم الفني.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="mt-auto pt-6 border-t border-slate-100">
                                    <button 
                                        onClick={() => setSelectedVideo(null)}
                                        className="w-full py-5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-[2rem] font-black text-lg transition-all shadow-xl shadow-emerald-600/20 active:scale-95"
                                    >
                                        إغلاق التفاصيل والعودة
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
}

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Swal from "sweetalert2";
import CourseVideoPlayer from "@/components/CourseVideoPlayer";

export default function StudentCoursesPage() {
    const [user, setUser] = useState(null);
    const [assignedCourses, setAssignedCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedVideo, setSelectedVideo] = useState(null);
    const [videoError, setVideoError] = useState(false);

    useEffect(() => {
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

        const userAssignedCourseTitles = JSON.parse(localStorage.getItem(`assigned_courses_${currentUserEmail}`) || "[]");
        const allPlatformVideos = JSON.parse(localStorage.getItem("platform_videos") || "[]");
        
        const filteredVideos = allPlatformVideos.filter(video => 
            userAssignedCourseTitles.includes(video.title) && video.videoUrl && video.videoUrl !== "#"
        ).map(video => ({
            id: video.id,
            title: video.title,
            description: video.notes || "لا يوجد وصف لهذه الدورة حالياً.",
            videoUrl: video.videoUrl,
            date: video.date,
            icon: '🎥'
        }));

        setAssignedCourses(filteredVideos);
        setLoading(false);
    }, []);

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
                <h1 className="text-3xl font-black text-emerald-950 sm:text-4xl">دوراتي التعليمية</h1>
                <p className="mt-4 text-slate-600 font-medium">
                    هنا تجد جميع الفيديوهات والدورات التي تمت إتاحتها لك من قبل الإدارة.
                </p>
            </header>

            {!user ? (
                <div className="modern-card flex flex-col items-center justify-center py-24 text-center rounded-[3rem] bg-white/60 border border-white shadow-xl">
                    <div className="mb-8 flex h-28 w-28 items-center justify-center rounded-full bg-amber-50 text-amber-500 shadow-inner">
                        <svg className="h-14 w-14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-black text-emerald-950">يرجى تسجيل الدخول أولاً</h2>
                    <p className="mt-3 max-w-sm text-slate-500 font-medium leading-relaxed">
                        يجب عليك تسجيل الدخول أو إنشاء حساب جديد لتتمكن من الوصول إلى الدورات التعليمية والدروس المسجلة.
                    </p>
                    <div className="mt-8 flex gap-4">
                        <Link href="/auth/login" className="px-8 py-3 bg-emerald-600 text-white rounded-2xl font-black hover:bg-emerald-700 transition-all">تسجيل الدخول</Link>
                        <Link href="/auth/signup" className="px-8 py-3 bg-white border border-emerald-200 text-emerald-700 rounded-2xl font-black hover:bg-emerald-50 transition-all">إنشاء حساب</Link>
                    </div>
                </div>
            ) : assignedCourses.length === 0 ? (
                <div className="modern-card flex flex-col items-center justify-center py-24 text-center rounded-[3rem] bg-white/60 border border-white shadow-xl">
                    <div className="mb-8 flex h-28 w-28 items-center justify-center rounded-full bg-emerald-50 text-emerald-200 shadow-inner">
                        <svg className="h-14 w-14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-black text-emerald-950">لا توجد دورات متاحة لك حالياً</h2>
                    <p className="mt-3 max-w-sm text-slate-500 font-medium leading-relaxed">
                        لم يتم عرض أي محتوى لك بعد؛ يرجى التواصل مع الإدارة لتفعيل الدورات الخاصة بك.
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                    {assignedCourses.map((course) => (
                        <article key={course.id} className="modern-card group flex flex-col overflow-hidden rounded-[2.5rem] border border-white bg-white/80 shadow-2xl shadow-emerald-900/5 transition-all duration-500 hover:-translate-y-3 hover:shadow-emerald-900/10">
                            <div className="relative h-52 overflow-hidden bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-6xl group-hover:scale-105 transition-transform duration-500">
                                <span className="drop-shadow-lg">{course.icon}</span>
                                <div className="absolute inset-0 bg-black/10 opacity-0 transition-opacity group-hover:opacity-100"></div>
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
                                        onClick={() => { setSelectedVideo(course); setVideoError(false); }}
                                        className="inline-flex w-full items-center justify-center gap-3 rounded-2xl bg-emerald-950 px-6 py-4 text-sm font-black text-white transition-all hover:bg-black hover:scale-[1.02] active:scale-95 shadow-lg shadow-emerald-950/10"
                                    >
                                        <svg className="h-5 w-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                        </svg>
                                        مشاهدة المحتوى الآن
                                    </button>
                                </div>
                            </div>
                        </article>
                    ))}
                </div>
            )}

            {selectedVideo && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-md p-4 animate-in fade-in" onClick={() => setSelectedVideo(null)}>
                    <div className="relative w-full max-w-5xl bg-[#0a0f0d] rounded-[3rem] overflow-hidden shadow-2xl border border-white/10 animate-in zoom-in-95 flex flex-col" onClick={e => e.stopPropagation()}>
                        <div className="p-6 bg-gradient-to-r from-emerald-900 to-black text-white flex justify-between items-center border-b border-white/5">
                            <div>
                                <h2 className="text-xl font-black">{selectedVideo.title}</h2>
                                <p className="text-xs text-emerald-400 font-bold">{selectedVideo.date}</p>
                            </div>
                            <button onClick={() => setSelectedVideo(null)} className="h-10 w-10 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors">✕</button>
                        </div>
                        
                        <div className="bg-black aspect-video flex items-center justify-center relative">
                            {(!videoError && selectedVideo.videoUrl) ? (
                                <CourseVideoPlayer 
                                    videoUrl={selectedVideo.videoUrl} 
                                    title={selectedVideo.title}
                                    onVideoError={handleVideoError}
                                />
                            ) : (
                                <div className="flex flex-col items-center justify-center text-center p-10 w-full h-full bg-slate-900/50">
                                    <div className="h-20 w-20 bg-emerald-500/10 rounded-full flex items-center justify-center mb-4 border border-emerald-500/20">
                                        <svg className="w-10 h-10 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                    <p className="text-white font-bold text-lg mb-2">تعذر عرض المشغل المباشر</p>
                                    <p className="text-slate-400 text-sm max-w-md">يرجى تجربة الرفع مرة أخرى أو استخدام الرابط البديل للمشاهدة الخارجية.</p>
                                    <a href={selectedVideo.videoUrl} download className="mt-6 px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black transition-all shadow-xl shadow-emerald-600/20">
                                        تحميل ومشاهدة الفيديو
                                    </a>
                                </div>
                            )}
                        </div>

                        <div className="p-8 bg-[#0a0f0d] text-white">
                            <h3 className="text-emerald-500 font-bold mb-3 flex items-center gap-2">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                ملاحظات المحتوى:
                            </h3>
                            <p className="text-slate-400 text-sm leading-relaxed bg-white/5 p-6 rounded-3xl border border-white/5">{selectedVideo.description}</p>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
}

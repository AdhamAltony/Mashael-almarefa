"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

// Mock data for all available courses (normally this would come from a database)
const ALL_COURSES = [
    { id: 'c1', title: 'النحو: تأسيس وتوظيف', description: 'دورة شاملة في قواعد النحو العربي بأسلوب مبسط وعملي.', videoUrl: '#', icon: '📝' },
    { id: 'c2', title: 'الصرف', description: 'تعلم أوزان الكلمات وتصريف الأفعال والأسماء في اللغة العربية.', videoUrl: '#', icon: '🔄' },
    { id: 'c3', title: 'العَروض', description: 'دراسة موسيقى الشعر العربي وأوزانه الخليلية الأساسية.', videoUrl: '#', icon: '📖' },
    { id: 'c4', title: 'البلاغة', description: 'فن البيان والبديع والمعاني في لغة القرآن الكريم.', videoUrl: '#', icon: '✨' },
    { id: 'c5', title: 'إعداد معلم اللغة العربية', description: 'تأهيل المعلمين لتدريس العربية لغير الناطقين بها.', videoUrl: '#', icon: '👩‍🏫' },
];

export default function StudentCoursesPage() {
    const [user, setUser] = useState(null);
    const [assignedCourses, setAssignedCourses] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // 1. Get current user from session cookie
        const cookies = document.cookie.split("; ");
        const sessionCookie = cookies.find(c => c.startsWith("session="));
        
        if (sessionCookie) {
            try {
                const userData = JSON.parse(decodeURIComponent(atob(sessionCookie.split("=")[1])));
                setUser(userData);

                // For logged-in students, we typically show assigned courses, 
                // but the user wants ALL courses to be visible for everyone.
                // We'll show all courses and let the middleware handle access control 
                // when they click 'Watch Course'.
                setAssignedCourses(ALL_COURSES);
            } catch (e) {
                console.error("Error parsing session", e);
                setAssignedCourses(ALL_COURSES);
            }
        } else {
            // Guest user: show all courses so they can see what we offer
            setAssignedCourses(ALL_COURSES);
        }
        setLoading(false);
    }, []);

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
                    دوراتي التدريبية
                </span>
                <h1 className="text-3xl font-black text-emerald-950 sm:text-4xl">الدورات المتاحة لك</h1>
                <p className="mt-4 text-slate-600">
                    هنا تجد جميع الدورات التي تمت إتاحتها لك من قبل إدارة المنصة.
                </p>
            </header>

            {assignedCourses.length === 0 ? (
                <div className="modern-card flex flex-col items-center justify-center py-20 text-center rounded-[2.5rem] bg-white/60 border border-white">
                    <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-emerald-50 text-emerald-200">
                        <svg className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                        </svg>
                    </div>
                    <h2 className="text-xl font-bold text-emerald-900">لا توجد دورات متاحة حالياً</h2>
                    <p className="mt-2 max-w-sm text-slate-500">
                        لم يقم المسؤول بإتاحة أي دورات خاصة لحسابك بعد. يرجى التواصل مع الإدارة إذا كنت تعتقد أن هناك خطأ.
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {assignedCourses.map((course) => (
                        <article key={course.id} className="modern-card group flex flex-col overflow-hidden rounded-[2rem] border border-white/60 bg-white/60 shadow-xl shadow-emerald-900/5 transition-all duration-300 hover:-translate-y-2 hover:border-emerald-300 hover:shadow-2xl">
                            <div className="relative h-48 overflow-hidden bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-6xl">
                                {course.icon}
                                <div className="absolute inset-0 bg-black/10 opacity-0 transition-opacity group-hover:opacity-100"></div>
                            </div>
                            <div className="flex flex-1 flex-col p-6">
                                <h3 className="mb-2 text-xl font-bold text-emerald-950">{course.title}</h3>
                                <p className="mb-6 text-sm leading-relaxed text-slate-600 line-clamp-3">
                                    {course.description}
                                </p>
                                <div className="mt-auto">
                                    <Link 
                                        href={`/student/courses/${course.id}`}
                                        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-900 px-4 py-3 text-sm font-bold text-white transition-all hover:bg-emerald-800"
                                    >
                                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        مشاهدة الدورة
                                    </Link>
                                </div>
                            </div>
                        </article>
                    ))}
                </div>
            )}
        </main>
    );
}

"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import TeacherBio from "@/components/teacher-bio";
import { getLocalUsers } from "@/utils/local-db";

export default function ArabicTeachersPage() {
    const [course, setCourse] = useState("العربية لغير الناطقين");
    const [student, setStudent] = useState(null);
    const [assignedTeacher, setAssignedTeacher] = useState("");
    const [teachers, setTeachers] = useState([]);
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        const fetchTeachers = async () => {
            const cookies = document.cookie.split("; ");
            const sessionCookie = cookies.find(c => c.startsWith("session="));

            // 1. Fetch real teachers from Supabase via getLocalUsers (available for everyone)
            const allUsers = await getLocalUsers();
            const arabicTeachers = allUsers
                .filter(u => u.role === "teacher" && (u.department?.includes("العربية") || u.course?.includes("العربية") || u.department?.includes("arabic")))
                .map(u => {
                    const profile = JSON.parse(localStorage.getItem(`teacher_profile_${u.email}`) || "{}");
                    return {
                        id: u.id,
                        name: u.name,
                        email: u.email,
                        specialization: u.specialization || profile.specialization || "لغة عربية",
                        available: u.available || profile.available || "متاح للتواصل",
                        phone: u.phone,
                        rating: u.rating || profile.rating || "5.0",
                        image: u.image || profile.image || "",
                        bio: u.bio || profile.bio || `معلم متميز في العربية لغير الناطقين بها، يمتلك مهارات عالية في التواصل والتدريس بأساليب مبتكرة.`
                    };
                });
            setTeachers(arabicTeachers);

            if (sessionCookie) {
                try {
                    const base64 = decodeURIComponent(sessionCookie.split("=")[1]);
                    const decoded = decodeURIComponent(atob(base64));
                    const data = JSON.parse(decoded);
                    setStudent(data);
                    setIsLoggedIn(true);
                    if (data.course) setCourse(data.course);

                    const studentProf = localStorage.getItem(`student_profile_${data.email}`);
                    if (studentProf) {
                        const parsed = JSON.parse(studentProf);
                        setAssignedTeacher(parsed.assignedTeacher || "");
                    }
                } catch { }
            }
        };

        fetchTeachers();
    }, [course]);

    const handleSubscribe = (teacherName, teacherEmail) => {
        if (!student) return;
        const profile = JSON.parse(localStorage.getItem(`student_profile_${student.email}`) || "{}");
        const isSubscribed = assignedTeacher === teacherName;
        const newTeacher = isSubscribed ? "" : teacherName;
        const newEmail = isSubscribed ? "" : teacherEmail;

        const updated = { ...profile, assignedTeacher: newTeacher, assignedTeacherEmail: newEmail };
        localStorage.setItem(`student_profile_${student.email}`, JSON.stringify(updated));
        setAssignedTeacher(newTeacher);

        const S = require("sweetalert2");
        S.fire({
            title: newTeacher ? "تم الاشتراك بنجاح!" : "تم إلغاء الاشتراك",
            text: newTeacher ? `أنت الآن مشترك مع ${teacherName}` : "يمكنك الاشتراك مع معلم آخر في أي وقت",
            icon: "success",
            confirmButtonText: "حسناً",
            confirmButtonColor: "#059669",
            timer: 2000
        });
    };

    return (
        <section className="relative z-10 flex flex-1 flex-col justify-center px-4 pb-16 sm:px-6 sm:pb-24">
            <div className="mx-auto w-full max-w-5xl">
                {/* Page Header */}
                <header className="mb-10 text-center">
                    <span className="mb-4 inline-block rounded-full bg-emerald-100 px-5 py-2 text-sm font-bold text-emerald-700 shadow-sm border border-emerald-200/50">
                        معلمي {course}
                    </span>
                    <h1 className="mb-4 text-3xl font-black leading-snug text-emerald-950 sm:text-4xl text-balance">
                        اختر معلمك وابدأ رحلتك
                    </h1>
                    <p className="mx-auto max-w-xl text-base text-slate-600 sm:text-lg text-balance">
                        قائمة بمعلمي {course} المعتمدين والمتميزين في المنصة. يمكنك التواصل المباشر مع المعلم المناسب وترتيب مواعيد الحلقات.
                    </p>
                </header>

                {/* Teachers Cards Grid */}
                {teachers.length === 0 ? (
                    <div className="p-12 text-center text-slate-500 modern-card rounded-[2.5rem] bg-white/60">
                        <div className="text-5xl mb-4 opacity-20">📭</div>
                        لا يوجد معلمون مسجلون حالياً في هذا القسم.
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {teachers.map((teacher) => (
                            <div key={teacher.id} className="modern-card flex flex-col overflow-hidden rounded-[2rem] border border-white/60 bg-white/60 shadow-xl shadow-emerald-900/5 transition-all duration-300 hover:-translate-y-1 hover:border-emerald-300 hover:shadow-2xl hover:shadow-emerald-900/10">
                                {/* Card Header (Image + Name + Rating) */}
                                <div className="relative p-6 pb-4 border-b border-emerald-100 flex items-start justify-between gap-4">
                                    <div className="flex items-center gap-4">
                                        {/* Avatar / Image */}
                                        <div className="relative flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-100 to-emerald-200 text-2xl font-black text-emerald-700 shadow-inner overflow-hidden border-2 border-white">
                                            {teacher.image ? (
                                                <img src={teacher.image} alt={teacher.name} className="h-full w-full object-cover" />
                                            ) : (
                                                <span>{teacher.name.replace("أ. ", "").replace("ق. ", "").charAt(0)}</span>
                                            )}
                                        </div>
                                        <div className="flex flex-col">
                                            <h3 className="font-bold text-lg text-emerald-950">{teacher.name}</h3>
                                            <span className="text-xs font-medium text-emerald-600/80 mt-0.5">رمز: <span dir="ltr">{teacher.id}</span></span>
                                        </div>
                                    </div>

                                    {/* Rating badge */}
                                    <div className="flex shrink-0 items-center justify-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-sm font-bold text-amber-600 border border-amber-200/50">
                                        {teacher.rating}
                                        <svg className="h-3.5 w-3.5 pb-[1px]" fill="currentColor" viewBox="0 0 20 20">
                                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                        </svg>
                                    </div>
                                </div>

                                {/* Card Body (Bio + Specialization + Availability) */}
                                <div className="p-6 flex-1 flex flex-col gap-5">
                                    <TeacherBio bio={teacher.bio} />

                                    <div className="mt-auto flex flex-col gap-3 text-sm">
                                        <div className="flex items-start gap-2">
                                            <div className="mt-0.5 rounded-full bg-emerald-100 p-1 text-emerald-600 shrink-0">
                                                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                                </svg>
                                            </div>
                                            <div className="flex-1 font-semibold text-emerald-900">
                                                {teacher.specialization}
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-2">
                                            <div className="mt-0.5 rounded-full bg-emerald-100 p-1 text-emerald-600 shrink-0">
                                                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                            </div>
                                            <div className="flex-1 font-medium text-emerald-800/80">
                                                {teacher.available}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Card Footer (Action) */}
                                <div className="p-6 pt-0 mt-auto flex flex-col gap-2">
                                    {isLoggedIn && (
                                        <button
                                            onClick={() => handleSubscribe(teacher.name, teacher.email)}
                                            className={`inline-flex w-full items-center justify-center gap-2 rounded-xl border-2 px-4 py-2.5 text-xs font-bold transition-all ${assignedTeacher === teacher.name
                                                    ? "border-red-100 bg-red-50 text-red-600 hover:bg-red-100"
                                                    : "border-emerald-600 bg-white text-emerald-600 hover:bg-emerald-50"
                                                }`}
                                        >
                                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={assignedTeacher === teacher.name ? "M6 18L18 6M6 6l12 12" : "M12 4v16m8-8H4"} />
                                            </svg>
                                            {assignedTeacher === teacher.name ? "عدم الاشتراك" : "اشتراك"}
                                        </button>
                                    )}

                                    <a
                                        href={`https://wa.me/201210212176?text=مرحباً، أود الاستفسار عن التسجيل مع الأستاذ ${teacher.name} في قسم اللغة العربية.`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-green-500/30 transition-all hover:shadow-green-500/40 hover:from-green-400 hover:to-emerald-50"
                                    >
                                        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 00-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                                        </svg>
                                        تواصل عبر واتساب
                                    </a>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}

"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

const TEACHERS_DATA = [
    {
        id: "QUR-T-001",
        name: "أ. محمد عبد الله",
        specialization: "حفظ ومراجعة تجويد",
        available: "الإثنين، الأربعاء (4-8 م)",
        phone: "201000000001",
        rating: "4.9",
        image: "",
        bio: "مجاز بالقراءات العشر، خبرة أكثر من 10 سنوات في تحفيظ القرآن الكريم للكبار والصغار بالطرق الحديثة."
    },
    {
        id: "QUR-T-002",
        name: "أ. محمود حسن",
        specialization: "تأسيس نور البيان",
        available: "السبت، الثلاثاء (2-6 م)",
        phone: "201000000002",
        rating: "4.8",
        image: "",
        bio: "متخصص في تأسيس الأطفال على القراءة الصحيحة بالقرآن ومخارج الحروف الدقيقة بأسلوب محبب ومبسط."
    },
    {
        id: "QUR-T-003",
        name: "ق. عائشة عبد الرحمن",
        specialization: "حفظ كامل وتثبيت للنساء",
        available: "الأحد، الخميس (9 ص - 1 م)",
        phone: "201000000003",
        rating: "5.0",
        image: "",
        bio: "حافظة متقنة ومعلمة معتمدة، متخصصة في جلسات التثبيت والمراجعة المكثفة للأخوات برواية حفص عن عاصم."
    },
    {
        id: "QUR-T-004",
        name: "أ. إبراهيم يوسف",
        specialization: "القراءات العشر",
        available: "الجمعة (الصباح)",
        phone: "201000000004",
        rating: "4.7",
        image: "",
        bio: "أستاذ متخصص في إقراء القرآن بالقراءات العشر المتواترة، وتصحيح التلاوة وتدريس متون التجويد."
    },
];

export default function QuranTeachersPage() {
    const [course, setCourse] = useState("البرنامج العام");

    useEffect(() => {
        const cookies = document.cookie.split("; ");
        const sessionCookie = cookies.find(c => c.startsWith("session="));
        if (sessionCookie) {
            try {
                const data = JSON.parse(decodeURIComponent(atob(sessionCookie.split("=")[1])));
                if (data.course) setCourse(data.course);
            } catch (e) { }
        }
    }, []);

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
                {TEACHERS_DATA.length === 0 ? (
                    <div className="p-8 text-center text-slate-500 modern-card rounded-[2rem] bg-white/60">
                        لا يوجد معلمون متاحون حالياً.
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {TEACHERS_DATA.map((teacher) => (
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
                                    <p className="text-sm text-slate-600 leading-relaxed text-balance">
                                        {teacher.bio}
                                    </p>

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
                                <div className="p-6 pt-0 mt-auto">
                                    <a
                                        href={`https://wa.me/${teacher.phone}?text=مرحباً أستاذ ${teacher.name}، أنا طالب في منصة مشاعل المعرفة وأود الاستفسار عن التسجيل في حلقاتكم.`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-green-500/30 transition-all hover:-translate-y-0.5 hover:shadow-green-500/40 hover:from-green-400 hover:to-emerald-500"
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

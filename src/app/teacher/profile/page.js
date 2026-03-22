"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function TeacherProfilePage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [saved, setSaved] = useState(false);

    // Initial state matching existing teacher data structure
    const [profile, setProfile] = useState({
        name: "",
        specialization: "",
        available: "",
        phone: "",
        bio: "",
        image: "",
        rating: "4.8" // Default for new profiles
    });

    useEffect(() => {
        // Load existing session data to pre-fill name at least
        const cookies = document.cookie.split("; ");
        const sessionCookie = cookies.find(c => c.startsWith("session="));
        if (sessionCookie) {
            try {
                const data = JSON.parse(decodeURIComponent(atob(sessionCookie.split("=")[1])));
                setProfile(prev => ({
                    ...prev,
                    name: data.name || "",
                }));
            } catch (e) {
                console.error("Failed to parse session", e);
            }
        }
        setLoading(false);
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setProfile(prev => ({ ...prev, [name]: value }));
        setSaved(false);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setSaved(true);
        // In a real app, we would send this to the API
        // For now, we simulate success
        setTimeout(() => setSaved(false), 3000);
    };

    if (loading) return <div className="p-10 text-center">جاري التحميل...</div>;

    return (
        <main className="site-container py-10" dir="rtl">
            <header className="mb-8">
                <h1 className="text-3xl font-black text-emerald-950">تعديل الملف الشخصي</h1>
                <p className="mt-2 text-slate-600">هذه البيانات هي التي ستظهر للطلاب في أقسام المنصة المختلفة.</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Preview Card */}
                <aside className="lg:col-span-1">
                    <div className="sticky top-28">
                        <h2 className="mb-4 text-sm font-bold text-emerald-700 uppercase tracking-wider">معاينة البطاقة للطلاب</h2>
                        <article className="modern-card flex flex-col overflow-hidden rounded-[2rem] border border-white/60 bg-white/60 shadow-xl shadow-emerald-900/5">
                            <div className="relative p-6 pb-4 border-b border-emerald-100 flex items-start justify-between gap-4">
                                <div className="flex items-center gap-4">
                                    <div className="relative flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 text-2xl font-black text-white shadow-lg overflow-hidden border-2 border-white">
                                        {profile.image ? (
                                            <img src={profile.image} alt={profile.name} className="h-full w-full object-cover" />
                                        ) : (
                                            <span>{profile.name?.charAt(0) || "م"}</span>
                                        )}
                                    </div>
                                    <div className="flex flex-col">
                                        <h3 className="font-bold text-lg text-emerald-950">{profile.name || "اسم المعلم"}</h3>
                                        <span className="text-xs font-medium text-emerald-600/80 mt-0.5">رمز التقدم: <span dir="ltr">NEW-PRO</span></span>
                                    </div>
                                </div>
                                <div className="flex shrink-0 items-center justify-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-sm font-bold text-amber-600 border border-amber-200/50">
                                    {profile.rating}
                                    <svg className="h-3.5 w-3.5 pb-[1px]" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                    </svg>
                                </div>
                            </div>
                            <div className="p-6 flex-1 flex flex-col gap-5">
                                <p className="text-sm text-slate-600 leading-relaxed min-h-[60px]">
                                    {profile.bio || "اكتب نبذة عن خبراتك ومؤهلاتك العلمية لتظهر هنا للطلاب..."}
                                </p>
                                <div className="mt-auto flex flex-col gap-3 text-sm">
                                    <div className="flex items-start gap-2">
                                        <div className="mt-0.5 rounded-full bg-emerald-100 p-1 text-emerald-600 shrink-0"><svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg></div>
                                        <div className="flex-1 font-semibold text-emerald-900">{profile.specialization || "التخصص (مثلاً: حفظ وتجويد)"}</div>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <div className="mt-0.5 rounded-full bg-emerald-100 p-1 text-emerald-600 shrink-0"><svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg></div>
                                        <div className="flex-1 font-medium text-emerald-800/80">{profile.available || "الأيام والساعات المتاحة"}</div>
                                    </div>
                                </div>
                            </div>
                        </article>
                    </div>
                </aside>

                {/* Edit Form */}
                <section className="lg:col-span-2">
                    <form onSubmit={handleSubmit} className="modern-card rounded-3xl border border-white/70 p-8 shadow-xl shadow-emerald-900/5 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-emerald-900">الاسم الظاهر</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={profile.name}
                                    onChange={handleChange}
                                    placeholder="أ. محمد علي"
                                    className="w-full rounded-xl border border-emerald-100 bg-white/50 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-emerald-900">التخصص / المادة</label>
                                <input
                                    type="text"
                                    name="specialization"
                                    value={profile.specialization}
                                    onChange={handleChange}
                                    placeholder="مثلاً: لغة عربية ونحو"
                                    className="w-full rounded-xl border border-emerald-100 bg-white/50 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                                    required
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-emerald-900">المواعيد المتاحة</label>
                                <input
                                    type="text"
                                    name="available"
                                    value={profile.available}
                                    onChange={handleChange}
                                    placeholder="مثلاً: السبت والاثنين (5-9 مساءً)"
                                    className="w-full rounded-xl border border-emerald-100 bg-white/50 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-emerald-900">رقم الواتساب (للتواصل المباشر)</label>
                                <input
                                    type="tel"
                                    name="phone"
                                    value={profile.phone}
                                    onChange={handleChange}
                                    placeholder="201xxxxxxxxx"
                                    className="w-full rounded-xl border border-emerald-100 bg-white/50 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                                    required
                                    dir="ltr"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-emerald-900">النبذة التعريفية (Bio)</label>
                            <textarea
                                name="bio"
                                value={profile.bio}
                                onChange={handleChange}
                                rows={4}
                                placeholder="اكتب مهاراتك، خبراتك، والشهادات التي حصلت عليها..."
                                className="w-full rounded-xl border border-emerald-100 bg-white/50 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                                required
                            ></textarea>
                        </div>

                        <div className="pt-4 flex items-center justify-between">
                            <button
                                type="submit"
                                className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 px-8 py-3.5 text-base font-bold text-white shadow-lg shadow-emerald-500/30 transition-all hover:-translate-y-0.5 hover:shadow-emerald-500/40"
                            >
                                حفظ التغييرات والملف الشخصي
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                            </button>

                            {saved && (
                                <span className="text-emerald-600 font-bold flex items-center gap-2 animate-pulse">
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                    تم الحفظ بنجاح!
                                </span>
                            )}
                        </div>
                    </form>
                </section>
            </div>
        </main>
    );
}

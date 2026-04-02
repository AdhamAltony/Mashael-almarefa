"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import TeacherBio from "@/components/teacher-bio";
import { getLocalUsers, updateUser } from "@/utils/local-db";

const DEPARTMENTS = [
    { id: "quran", name: "ركن القرآن الكريم" },
    { id: "arabic-non-native", name: "اللغة العربية لغير الناطقين" },
    { id: "curricula", name: "المناهج الدراسية" },
];

const CURRICULA_SUBJECTS = [
    { id: "math", name: "الرياضيات", icon: "➗" },
    { id: "science", name: "العلوم", icon: "🧪" },
    { id: "arabic_school", name: "اللغة العربية", icon: "📖" },
    { id: "english", name: "اللغة الإنجليزية", icon: "🔤" },
    { id: "social", name: "الدراسات الاجتماعية", icon: "🌍" },
    { id: "islamic", name: "التربية الإسلامية", icon: "🌙" },
    { id: "french", name: "اللغة الفرنسية", icon: "🇫🇷" },
    { id: "german", name: "اللغة الألمانية", icon: "🇩🇪" },
];

export default function TeacherProfilePage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [saved, setSaved] = useState(false);

    // Initial state matching existing teacher data structure
    const [profile, setProfile] = useState({
        name: "جاري التحميل...",
        email: "",
        department: "quran", // Fallback for single use logic if any
        selectedDepartments: ["quran"], // New for multi-department
        selectedSubjects: [],
        specialization: "لم يتم التحديد بعد",
        available: "غير محدد",
        phone: "غير محدد",
        bio: "",
        image: "",
        status: "نشط",
        rating: "4.9"
    });

    useEffect(() => {
        const fetchInitialData = async () => {
            const cookies = document.cookie.split("; ");
            const sessionCookie = cookies.find(c => c.startsWith("session="));
            let currentEmail = "";

            if (sessionCookie) {
                try {
                    const base64 = decodeURIComponent(sessionCookie.split("=")[1]);
                    const decoded = decodeURIComponent(atob(base64));
                    const data = JSON.parse(decoded);
                    currentEmail = data.email;

                    // Fetch the latest central record from "app_users" (the true current database)
                    const allUsers = await getLocalUsers();
                    const dbUser = allUsers.find(u => u.email === currentEmail);

                    // Initialize from session/database data
                    const deptNamesStr = dbUser?.department || data.department || "";
                    const selectedDepts = DEPARTMENTS.filter(d => deptNamesStr.includes(d.name)).map(d => d.id);
                    if (selectedDepts.length === 0) selectedDepts.push("quran");

                    const dbSubjects = Array.isArray(dbUser?.subjects) && dbUser.subjects.length > 0 ? dbUser.subjects : null;
                    const sessionSubjects = Array.isArray(data.subjects) && data.subjects.length > 0 ? data.subjects : null;
                    
                    let initialSubjects = dbSubjects || sessionSubjects || [];
                    
                    // Robust parsing fallback for teachers (needed for immediate display after signup)
                    if (initialSubjects.length === 0 && (dbUser?.course || data.course || dbUser?.specialization || deptNamesStr)?.includes('(')) {
                        const strToParse = dbUser?.specialization || dbUser?.course || data.course || deptNamesStr;
                        const match = strToParse.match(/\((.*)\)/);
                        if (match) initialSubjects = match[1].split(/[،,]/).map(s => s.trim()).filter(Boolean);
                    }

                    const initialProfile = {
                        ...profile,
                        id: dbUser?.id, // Capture Supabase ID
                        name: dbUser?.name || data.name || "معلم جديد",
                        email: currentEmail,
                        department: selectedDepts[0] || "quran",
                        selectedDepartments: selectedDepts,
                        selectedSubjects: initialSubjects,
                        specialization: dbUser?.course || data.course || (deptNamesStr ? `${deptNamesStr}${initialSubjects.length > 0 ? ` (${initialSubjects.join("، ")})` : ""}` : "لم يتم تحديد القسم"),
                        phone: dbUser?.phone || data.phone || "",
                        image: dbUser?.image || data.image || "",
                        status: dbUser?.status || data.status || "نشط",
                        bio: dbUser?.bio || data.bio || "",
                    };

                    // Merge with extended local profile data from cache to avoid losing unsaved/un-synced changes
                    const savedLocalProfile = localStorage.getItem(`teacher_profile_${currentEmail}`);
                    if (savedLocalProfile) {
                        try {
                            const parsedLocal = JSON.parse(savedLocalProfile);
                            const mergedProfile = {
                                ...initialProfile,
                                ...parsedLocal,
                                // Ensure arrays are strictly arrays, otherwise fallback to initial data to avoid .map() crashing on strings
                                selectedDepartments: Array.isArray(parsedLocal.selectedDepartments) ? parsedLocal.selectedDepartments : (initialProfile.selectedDepartments || ["quran"]),
                                selectedSubjects: Array.isArray(parsedLocal.selectedSubjects) ? parsedLocal.selectedSubjects : (initialProfile.selectedSubjects || []),
                                // Preserve local data if DB doesn't have it (e.g. bio)
                                name: dbUser?.name || parsedLocal.name || initialProfile.name,
                                bio: dbUser?.bio || parsedLocal.bio || initialProfile.bio || "",
                                image: dbUser?.image || parsedLocal.image || initialProfile.image || "",
                            };
                            setProfile(mergedProfile);
                            // Immediately sync to cache and dispatch event so Navbar reads the DB image right away on load
                            localStorage.setItem(`teacher_profile_${currentEmail}`, JSON.stringify(mergedProfile));
                            window.dispatchEvent(new Event('profileUpdate'));
                        } catch (parseError) {
                            console.error("Failed to parse local profile format:", parseError);
                            setProfile(initialProfile);
                            localStorage.setItem(`teacher_profile_${currentEmail}`, JSON.stringify(initialProfile));
                            window.dispatchEvent(new Event('profileUpdate'));
                        }
                    } else {
                        setProfile(initialProfile);
                        localStorage.setItem(`teacher_profile_${currentEmail}`, JSON.stringify(initialProfile));
                        window.dispatchEvent(new Event('profileUpdate'));
                    }
                } catch (e) {
                    console.error("Failed to parse session", e);
                    document.cookie = "session=; path=/; max-age=0;";
                    document.cookie = "userRole=; path=/; max-age=0;";
                    router.replace("/auth/login");
                }
            } else {
                router.replace("/auth/login");
            }

            // Remove legacy key to prevent side effects
            localStorage.removeItem("teacher_profile");
            setLoading(false);
        };

        fetchInitialData();
    }, []);

    // Instant Save for Status Toggle
    const handleStatusToggle = async (newStatus) => {
        const updatedProfile = {
            ...profile,
            status: newStatus,
            course: profile.specialization,
            role: "teacher",
        };

        setProfile(prev => ({ ...prev, status: newStatus }));
        localStorage.setItem(`teacher_profile_${profile.email}`, JSON.stringify(updatedProfile));

        if (profile.id) {
            await updateUser(updatedProfile);
        }

        window.dispatchEvent(new Event("profileUpdate"));
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setProfile(prev => ({ ...prev, [name]: value }));
        setSaved(false);
    };

    const toggleDepartment = (deptId) => {
        setProfile(prev => {
            const currentDepts = prev.selectedDepartments || [];
            const depts = currentDepts.includes(deptId)
                ? (currentDepts.length > 1 ? currentDepts.filter(id => id !== deptId) : currentDepts)
                : [...currentDepts, deptId];

            const deptNames = depts.map(id => DEPARTMENTS.find(d => d.id === id)?.name).filter(Boolean);
            const deptNameStr = deptNames.join("، ");

            // Clear subjects if curricula is unselected
            const hasCurricula = depts.includes("curricula");
            const finalSubjects = hasCurricula ? (prev.selectedSubjects || []) : [];
            const spec = deptNameStr + (finalSubjects.length > 0 ? ` (${finalSubjects.join("، ")})` : "");

            return {
                ...prev,
                selectedDepartments: depts,
                selectedSubjects: finalSubjects,
                department: deptNameStr,
                specialization: spec
            };
        });
        setSaved(false);
    };

    const toggleSubject = (subName) => {
        setProfile(prev => {
            const currentSubjects = prev.selectedSubjects || [];
            const subjects = currentSubjects.includes(subName)
                ? currentSubjects.filter(s => s !== subName)
                : [...currentSubjects, subName];

            const deptNames = prev.selectedDepartments.map(id => DEPARTMENTS.find(d => d.id === id)?.name).filter(Boolean);
            const deptNameStr = deptNames.join("، ");
            const spec = deptNameStr + (subjects.length > 0 ? ` (${subjects.join("، ")})` : "");

            return { ...prev, selectedSubjects: subjects, specialization: spec };
        });
        setSaved(false);
    };

    const handleImageChange = async (e) => {
        const file = e.target.files[0];
        if (file) {
            try {
                setSaved(false);
                // 1. Upload to server
                const formData = new FormData();
                formData.append('file', file);

                const res = await fetch('/api/upload', {
                    method: 'POST',
                    body: formData
                });

                const result = await res.json();
                if (result.success) {
                    const newImageUrl = result.url;
                    const updatedProfile = { ...profile, image: newImageUrl, role: "teacher" };

                    // 2. Update state
                    setProfile(updatedProfile);

                    // 3. Update local cache
                    localStorage.setItem(`teacher_profile_${profile.email}`, JSON.stringify(updatedProfile));

                    // 4. Update Supabase immediately
                    await updateUser(updatedProfile);

                    // Notify Navbar
                    window.dispatchEvent(new Event('profileUpdate'));

                    setSaved(true);
                    setTimeout(() => setSaved(false), 3000);
                }
            } catch (err) {
                console.error("Image upload failed:", err);
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // 1. Update Central DB (Supabase via local-db adapter)
        const deptNames = profile.selectedDepartments.map(id => DEPARTMENTS.find(d => d.id === id)?.name).filter(Boolean);
        const updatedUser = {
            id: profile.id, // Mandatory for Supabase updates
            email: profile.email,
            name: profile.name,
            phone: profile.phone,
            department: deptNames.join("، "),
            subjects: profile.selectedSubjects,
            course: profile.specialization,
            bio: profile.bio,
            status: profile.status,
            image: profile.image,
            role: "teacher"
        };
        await updateUser(updatedUser);

        // 2. Update Local Cache
        localStorage.setItem(`teacher_profile_${profile.email}`, JSON.stringify(profile));

        // 3. Update Session Cookie with only essential fields to prevent 4KB browser size cutoff
        const sessionData = {
            id: profile.id,
            email: profile.email,
            name: profile.name,
            role: "teacher",
            course: profile.specialization
        };
        const base64 = btoa(encodeURIComponent(JSON.stringify(sessionData)));
        document.cookie = `session=${encodeURIComponent(base64)}; path=/; max-age=86400`;

        // 4. Notify UI
        window.dispatchEvent(new Event('profileUpdate'));

        setSaved(true);
        setTimeout(() => {
            setSaved(false);
            router.refresh();
        }, 3000);
    };

    if (loading) return <div className="p-10 text-center text-emerald-900 font-bold">جاري التحميل...</div>;

    return (
        <main className="site-container py-10" dir="rtl">
            <header className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-emerald-950">تعديل الملف الشخصي</h1>
                    <p className="mt-2 text-slate-600">هذه البيانات هي التي ستظهر للطلاب في أقسام المنصة المختلفة.</p>
                </div>
                <div className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold border transition-colors ${profile.status === 'نشط' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-50 text-slate-600 border-slate-200'}`}>
                    <span className={`h-2.5 w-2.5 rounded-full ${profile.status === 'نشط' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`}></span>
                    حالة الحساب: {profile.status}
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Preview Card */}
                <aside className="lg:col-span-1">
                    <div className="sticky top-28">
                        <h2 className="mb-4 text-sm font-bold text-emerald-700 uppercase tracking-wider">معاينة البطاقة للطلاب</h2>
                        <article className="modern-card flex flex-col overflow-hidden rounded-[2rem] border border-white/60 bg-white/60 shadow-xl shadow-emerald-900/5 transition-opacity duration-300" style={{ opacity: profile.status === 'إجازة' ? 0.7 : 1 }}>
                            <div className="relative p-6 pb-4 border-b border-emerald-100 flex items-start justify-between gap-4">
                                <div className="flex items-center gap-4">
                                    <div className="relative flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 text-2xl font-black text-white shadow-lg overflow-hidden border-2 border-white group">
                                        {profile.image ? (
                                            <img src={profile.image} alt={profile.name} className="h-full w-full object-cover" />
                                        ) : (
                                            <span className="group-hover:opacity-0 transition-opacity">{profile.name?.charAt(0) || "م"}</span>
                                        )}
                                        <input type="file" accept="image/*" onChange={handleImageChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" title="تغيير الصورة الشخصية" />
                                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                        </div>
                                    </div>
                                    <div className="flex flex-col">
                                        <h3 className="font-bold text-lg text-emerald-950">{profile.name || "اسم المعلم"}</h3>
                                        <div className="flex items-center gap-2 mt-0.5">
                                            <span className={`h-1.5 w-1.5 rounded-full ${profile.status === 'نشط' ? 'bg-emerald-500' : 'bg-slate-400'}`}></span>
                                            <span className={`text-[10px] font-bold ${profile.status === 'نشط' ? 'text-emerald-600' : 'text-slate-500'}`}>{profile.status === 'نشط' ? 'متاح الآن' : 'في إجازة حالياً'}</span>
                                        </div>
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
                                <TeacherBio bio={profile.bio || "اكتب نبذة عن خبراتك ومؤهلاتك العلمية لتظهر هنا للطلاب..."} />
                                <div className="mt-auto flex flex-col gap-3 text-sm">
                                    <div className="flex items-start gap-2">
                                        <div className="mt-0.5 rounded-full bg-emerald-100 p-1 text-emerald-600 shrink-0"><svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg></div>
                                        <div className="flex-1 font-semibold text-emerald-900">{profile.specialization}</div>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <div className="mt-0.5 rounded-full bg-emerald-100 p-1 text-emerald-600 shrink-0"><svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg></div>
                                        <div className="flex-1 font-medium text-emerald-800/80">{profile.available}</div>
                                    </div>
                                </div>
                            </div>
                        </article>
                    </div>
                </aside>

                {/* Edit Form */}
                <section className="lg:col-span-2">
                    <form onSubmit={handleSubmit} className="modern-card rounded-3xl border border-white/70 p-8 shadow-xl shadow-emerald-900/5 space-y-6">
                        {/* Status Toggle Block */}
                        <div className="space-y-3">
                            <label className="text-sm font-bold text-emerald-900">حالة التواجد الحالية</label>
                            <div className="flex p-1.5 bg-emerald-50/50 rounded-2xl border border-emerald-100 max-w-sm">
                                <button
                                    type="button"
                                    onClick={() => handleStatusToggle("نشط")}
                                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all ${profile.status === 'نشط' ? 'bg-white text-emerald-700 shadow-md' : 'text-slate-500 hover:text-emerald-600'}`}
                                >
                                    <span className={`h-2.5 w-2.5 rounded-full ${profile.status === 'نشط' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`}></span>
                                    نشط
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleStatusToggle("إجازة")}
                                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all ${profile.status === 'إجازة' ? 'bg-white text-slate-700 shadow-md' : 'text-slate-500 hover:text-slate-600'}`}
                                >
                                    <span className={`h-2.5 w-2.5 rounded-full ${profile.status === 'إجازة' ? 'bg-slate-500' : 'bg-slate-300'}`}></span>
                                    إجازة
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2 border-t border-emerald-50">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-emerald-900">الاسم الظاهر</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={profile.name}
                                    onChange={handleChange}
                                    placeholder="أ. محمد علي"
                                    className="w-full rounded-xl border border-emerald-100 bg-white/50 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 font-medium"
                                    required
                                />
                            </div>
                            <div className="space-y-3">
                                <label className="text-sm font-bold text-emerald-900 border-r-4 border-emerald-500 pr-3">أقسام التدريس (يمكنك اختيار أكثر من قسم)</label>
                                <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                                    {DEPARTMENTS.map((dept) => (
                                        <button
                                            key={dept.id}
                                            type="button"
                                            onClick={() => toggleDepartment(dept.id)}
                                            className={`flex h-full items-center justify-center rounded-xl border-2 p-3 text-center text-xs font-bold transition-all ${profile.selectedDepartments.includes(dept.id)
                                                ? "border-emerald-500 bg-emerald-50 text-emerald-950 shadow-inner"
                                                : "border-emerald-50 bg-white/50 text-slate-500 hover:border-emerald-200"
                                                }`}
                                        >
                                            {dept.name}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {profile.selectedDepartments.includes('curricula') && (
                            <div className="space-y-3 animate-in fade-in duration-500">
                                <label className="text-sm font-bold text-emerald-900">المواد الدراسية (تخصصك)</label>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                    {CURRICULA_SUBJECTS.map(sub => (
                                        <button
                                            key={sub.id}
                                            type="button"
                                            onClick={() => toggleSubject(sub.name)}
                                            className={`flex flex-col items-center gap-1 rounded-xl border-2 p-2 transition-all ${profile.selectedSubjects.includes(sub.name)
                                                ? "border-emerald-500 bg-white shadow-inner"
                                                : "border-emerald-100 bg-white/40 hover:border-emerald-300"
                                                }`}
                                        >
                                            <span className="text-xl">{sub.icon}</span>
                                            <span className="text-[10px] font-bold">{sub.name}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-emerald-900">المواعيد المتاحة</label>
                                <input
                                    type="text"
                                    name="available"
                                    value={profile.available}
                                    onChange={handleChange}
                                    placeholder="مثلاً: السبت والاثنين (5-9 مساءً)"
                                    className="w-full rounded-xl border border-emerald-100 bg-white/50 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 font-medium"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-emerald-900">رقم الواتساب (للتواصل المباشر)</label>
                            <input
                                type="tel"
                                name="phone"
                                value={profile.phone}
                                onChange={handleChange}
                                placeholder="201xxxxxxxxx"
                                className="w-full rounded-xl border border-emerald-100 bg-white/50 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 font-medium"
                                required
                                dir="ltr"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-emerald-900">النبذة التعريفية (Bio)</label>
                            <textarea
                                name="bio"
                                value={profile.bio}
                                onChange={handleChange}
                                rows={4}
                                placeholder="اكتب مهاراتك، خبراتك، والشهادات التي حصلت عليها..."
                                className="w-full rounded-xl border border-emerald-100 bg-white/50 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 font-medium"
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

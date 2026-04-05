"use client";

import Link from "next/link";
import { useState } from "react";
import Swal from "sweetalert2";
import { saveUser } from "@/utils/local-db";

export default function SignupPage() {
    const [role, setRole] = useState("student");
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
        phone: "",
        guardianPhone: "",
        countryCode: "+20",
        countryName: "مصر",
        department: "",
        selectedDepartments: [], // New for teachers
        selectedSubjects: [],
        guardian: "",
        age: ""
    });

    const DEPARTMENTS = [
        { id: "quran", name: "ركن القرآن الكريم" },
        { id: "arabic-non-native", name: "اللغة العربية لغير الناطقين" },
        { id: "curricula", name: "المناهج الدراسية" },
    ];

    const CURRICULA_SUBJECTS = [
        { id: "arabic", name: "اللغة العربية", icon: "📚" },
        { id: "english", name: "اللغة الإنجليزية", icon: "🇬🇧" },
        { id: "math", name: "الرياضيات", icon: "📐" },
        { id: "science", name: "العلوم", icon: "🧪" },
        { id: "social", name: "الدراسات الاجتماعية", icon: "🌍" },
        { id: "french", name: "اللغة الفرنسية", icon: "🇫🇷" },
        { id: "german", name: "اللغة الألمانية", icon: "🇩🇪" },
        { id: "islamic", name: "التربية الإسلامية", icon: "🕌" },
    ];

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.id || e.target.name]: e.target.value });
    };

    const toggleSubject = (subjectId) => {
        setFormData(prev => ({
            ...prev,
            selectedSubjects: prev.selectedSubjects.includes(subjectId)
                ? prev.selectedSubjects.filter(id => id !== subjectId)
                : [...prev.selectedSubjects, subjectId]
        }));
    };

    const toggleDepartment = (deptId) => {
        setFormData(prev => ({
            ...prev,
            selectedDepartments: prev.selectedDepartments.includes(deptId)
                ? prev.selectedDepartments.filter(id => id !== deptId)
                : [...prev.selectedDepartments, deptId]
        }));
    };

    const countries = [
        { name: "مصر", code: "+20" },
        { name: "السعودية", code: "+966" },
        { name: "الإمارات", code: "+971" },
        { name: "الكويت", code: "+965" },
        { name: "قطر", code: "+974" },
        { name: "البحرين", code: "+973" },
        { name: "عمان", code: "+968" },
        { name: "الأردن", code: "+962" },
        { name: "المغرب", code: "+212" },
    ];

    const [error, setError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (!formData.name || !formData.email || !formData.password || !formData.phone) {
            setError("الرجاء ملء جميع الحقول المطلوبة.");
            return;
        }

        if (formData.selectedDepartments.length === 0) {
            setError(role === "student" ? "الرجاء اختيار قسم واحد على الأقل للانضمام إليه." : "الرجاء اختيار قسم واحد على الأقل للتدريس فيه.");
            return;
        }

        if (formData.selectedDepartments.includes("curricula") && formData.selectedSubjects.length === 0) {
            setError(role === "teacher" ? "الرجاء اختيار مادة واحدة على الأقل لتدريسها." : "الرجاء اختيار مادة واحدة على الأقل لتسجيلها.");
            return;
        }

        if (role === "student" && !formData.guardianPhone) {
            setError("الرجاء إدخال رقم هاتف ولي الأمر.");
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            setError("كلمات المرور غير متطابقة.");
            return;
        }

        // Persist user locally
        const deptNames = formData.selectedDepartments.map(id => DEPARTMENTS.find(d => d.id === id)?.name).filter(Boolean);

        const userData = {
            name: formData.name,
            email: formData.email,
            password: formData.password,
            role: role,
            department: deptNames.join("، "),
            subjects: formData.selectedSubjects.map(id => CURRICULA_SUBJECTS.find(s => s.id === id)?.name).filter(Boolean),
            course: role === "teacher" 
                ? deptNames.join("، ") + (deptNames.includes("المناهج الدراسية") && formData.selectedSubjects.length > 0 ? ` (${formData.selectedSubjects.map(id => CURRICULA_SUBJECTS.find(s => s.id === id)?.name).filter(Boolean).join("، ")})` : "")
                : deptNames.join("، "),
            allDepartments: deptNames, // New field for clarity
            guardian: role === "student" ? formData.guardian : "",
            age: role === "student" ? formData.age : "",
            country: formData.countryName || "مصر",
            phone: formData.phone || "غير محدد",
            guardianPhone: formData.guardianPhone || "",
            countryCode: formData.countryCode || "+20"
        };
        const savedUserResult = await saveUser(userData);

        if (!savedUserResult) {
          Swal.fire({
            title: "عذراً!",
            text: "هذا البريد الإلكتروني مسجل بالفعل. يرجى استخدام بريد آخر أو تسجيل الدخول.",
            icon: "error",
            confirmButtonText: "موافق",
            confirmButtonColor: "#10b981"
          });
          return;
        }

        // Clean up any stale localStorage for this email on the current device
        // This ensures the new account starts fresh even if an old one existed on this machine
        if (typeof window !== 'undefined') {
            const email = userData.email;
            const keysToRemove = [
                `sessions_${email}`,
                `progress_${email}`,
                `assigned_courses_${email}`,
                `student_profile_${email}`,
                `teacher_profile_${email}`,
                `teacher_portfolio_${email}`,
                `upcoming_sessions_${email}`,
                `sessions_schedule_${email}`,
                `teacher_sessions_${email}`
            ];
            keysToRemove.forEach(key => localStorage.removeItem(key));
        }

        const sessionData = {
            id: savedUserResult?.id || "",
            email: userData.email,
            name: userData.name,
            role: userData.role,
            course: userData.course
        };
        const base64 = btoa(encodeURIComponent(JSON.stringify(sessionData)));
        document.cookie = `session=${encodeURIComponent(base64)}; path=/; max-age=86400`;

        Swal.fire({
          title: "تم!",
          text: "تم إنشاء الحساب بنجاح! سيتم توجيهك الآن...",
          icon: "success",
          confirmButtonText: "حسناً",
          confirmButtonColor: "#10b981",
          timer: 2000,
          timerProgressBar: true
        }).then(() => {
          window.location.href = "/auth/login";
        });
    };

    return (
        <main className="site-container flex min-h-[calc(100vh-140px)] items-center justify-center py-10" dir="rtl">
            <article className="modern-card w-full max-w-lg rounded-3xl border border-white/70 bg-white/60 p-6 shadow-xl shadow-emerald-900/5 backdrop-blur-md sm:p-8">
                <div className="text-center">
                    <p className="inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
                        بوابة التسجيل
                    </p>
                    <h1 className="mt-4 text-2xl font-black text-emerald-950 sm:text-3xl">إنشاء حساب جديد</h1>
                    <p className="mt-2 text-sm text-slate-600">
                        انضم إلى منصتنا بتسجيل بياناتك وابدأ رحلتك التعليمية الآن.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="mt-8 space-y-5">
                    {/* Role Selection using beautiful radio buttons */}
                    <div className="flex gap-4">
                        <label className="relative flex-1 cursor-pointer">
                            <input
                                type="radio"
                                name="role"
                                value="student"
                                checked={role === "student"}
                                onChange={() => setRole("student")}
                                className="peer sr-only"
                            />
                            <div className="flex flex-col items-center gap-2 rounded-2xl border-2 border-slate-100 bg-white/80 p-4 transition-all hover:border-emerald-200 hover:bg-emerald-50 peer-checked:border-emerald-500 peer-checked:bg-emerald-50 peer-checked:shadow-md peer-checked:shadow-emerald-500/10">
                                <svg className="h-7 w-7 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 14v7" />
                                </svg>
                                <span className="font-bold text-emerald-900">طالب</span>
                            </div>
                            {role === "student" && (
                                <div className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-white shadow-sm transition-transform duration-300 animate-in zoom-in">
                                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                            )}
                        </label>

                        <label className="relative flex-1 cursor-pointer">
                            <input
                                type="radio"
                                name="role"
                                value="teacher"
                                checked={role === "teacher"}
                                onChange={() => setRole("teacher")}
                                className="peer sr-only"
                            />
                            <div className="flex flex-col items-center gap-2 rounded-2xl border-2 border-slate-100 bg-white/80 p-4 transition-all hover:border-emerald-200 hover:bg-emerald-50 peer-checked:border-emerald-500 peer-checked:bg-emerald-50 peer-checked:shadow-md peer-checked:shadow-emerald-500/10">
                                <svg className="h-7 w-7 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                </svg>
                                <span className="font-bold text-emerald-900">مدرس</span>
                            </div>
                            {role === "teacher" && (
                                <div className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-white shadow-sm transition-transform duration-300 animate-in zoom-in">
                                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                            )}
                        </label>
                    </div>

                    {/* Common Field: Department Selection */}
                    <div className="space-y-6 animate-in slide-in-from-top-4 duration-500">
                        <div className="space-y-3">
                            <label className="block text-sm font-bold text-emerald-900 border-r-4 border-emerald-500 pr-3">
                                {role === "student" ? "الأقسام التي تود الانضمام إليها (يمكنك اختيار أكثر من قسم)" : "الأقسام التي ترغب في التدريس بها (يمكنك اختيار أكثر من قسم)"}
                            </label>
                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                                {DEPARTMENTS.map((dept) => (
                                    <label key={dept.id} className="relative cursor-pointer group">
                                        <input
                                            type="checkbox"
                                            name="department"
                                            value={dept.id}
                                            checked={formData.selectedDepartments.includes(dept.id)}
                                            onChange={() => toggleDepartment(dept.id)}
                                            className="peer sr-only"
                                        />
                                        <div className="flex h-full items-center justify-center rounded-xl border-2 border-slate-100 bg-white/50 p-3 text-center text-xs font-bold text-emerald-950 transition-all hover:border-emerald-200 peer-checked:border-emerald-500 peer-checked:bg-emerald-50 shadow-sm group-hover:shadow-md">
                                            {dept.name}
                                        </div>
                                        {formData.selectedDepartments.includes(dept.id) && (
                                            <div className="absolute -top-1 -left-1 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 text-white shadow-sm transition-transform duration-300 animate-in zoom-in">
                                                <svg className="h-2.5 w-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                                </svg>
                                            </div>
                                        )}
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Common: Subjects Selection (If Curricula) */}
                        {formData.selectedDepartments.includes("curricula") && (
                            <div className="space-y-3 animate-in fade-in zoom-in-95 duration-300">
                                <label className="block text-sm font-bold text-emerald-900 border-r-4 border-emerald-500 pr-3">
                                    {role === "teacher" ? "المواد التي تقوم بتدريسها" : "المواد التي تود دراستها"}
                                </label>
                                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                                    {CURRICULA_SUBJECTS.map((sub) => (
                                        <button
                                            key={sub.id}
                                            type="button"
                                            onClick={() => toggleSubject(sub.id)}
                                            className={`flex flex-col items-center gap-1 rounded-xl border-2 p-2 transition-all ${
                                                formData.selectedSubjects.includes(sub.id)
                                                    ? "border-emerald-500 bg-emerald-50 shadow-inner"
                                                    : "border-slate-100 bg-white/50 hover:border-emerald-200"
                                            }`}
                                        >
                                            <span className="text-xl">{sub.icon}</span>
                                            <span className="text-[10px] font-bold text-emerald-950">{sub.name}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                        <div>
                            <label htmlFor="name" className="mb-1.5 block text-sm font-bold text-emerald-900">
                                الاسم الكامل
                            </label>
                            <input
                                id="name"
                                type="text"
                                placeholder="الاسم الثلاثي"
                                value={formData.name}
                                onChange={handleInputChange}
                                className="w-full rounded-xl border border-emerald-200 bg-white/85 px-4 py-3 text-emerald-950 outline-none transition focus:border-emerald-400 focus:ring-1 focus:ring-emerald-300/40"
                            />
                        </div>

                        {role === "student" && (
                            <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                                <label htmlFor="guardianName" className="mb-1.5 block text-sm font-bold text-emerald-900">
                                    اسم ولي الأمر <span className="text-red-500">*</span>
                                </label>
                                <input
                                    id="guardian"
                                    name="guardian"
                                    type="text"
                                    placeholder="اسم ولي الأمر بالكامل"
                                    value={formData.guardian}
                                    onChange={handleInputChange}
                                    className="w-full rounded-xl border border-emerald-200 bg-white/85 px-4 py-3 text-emerald-950 outline-none transition focus:border-emerald-400 focus:ring-1 focus:ring-emerald-300/40"
                                    required={role === "student"}
                                />
                            </div>
                        )}

                        {role === "student" && (
                            <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                                <label htmlFor="age" className="mb-1.5 block text-sm font-bold text-emerald-900">
                                    العمر <span className="text-red-500">*</span>
                                </label>
                                <input
                                    id="age"
                                    name="age"
                                    type="number"
                                    placeholder="مثلاً: 12"
                                    value={formData.age}
                                    onChange={handleInputChange}
                                    className="w-full rounded-xl border border-emerald-200 bg-white/85 px-4 py-3 text-emerald-950 outline-none transition focus:border-emerald-400 focus:ring-1 focus:ring-emerald-300/40"
                                    required={role === "student"}
                                />
                            </div>
                        )}

                        <div>
                            <label htmlFor="email" className="mb-1.5 block text-sm font-bold text-emerald-900">
                                البريد الإلكتروني
                            </label>
                            <input
                                id="email"
                                type="email"
                                placeholder="name@example.com"
                                value={formData.email}
                                onChange={handleInputChange}
                                className="w-full rounded-xl border border-emerald-200 bg-white/85 px-4 py-3 text-emerald-950 outline-none transition focus:border-emerald-400 focus:ring-1 focus:ring-emerald-300/40"
                            />
                        </div>
                    </div>

                    {/* Country and Code */}
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                        <div>
                            <label className="mb-1.5 block text-sm font-bold text-emerald-900">
                                الدولة
                            </label>
                            <select
                                id="countryName"
                                value={formData.countryName}
                                onChange={(e) => {
                                    const selected = countries.find(c => c.name === e.target.value);
                                    setFormData({ ...formData, countryName: e.target.value, countryCode: selected.code });
                                }}
                                className="w-full rounded-xl border border-emerald-200 bg-white/85 px-4 py-3 text-emerald-950 outline-none transition focus:border-emerald-400 focus:ring-1 focus:ring-emerald-300/40"
                            >
                                {countries.map((c) => (
                                    <option key={c.name} value={c.name}>{c.name}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label htmlFor="phone" className="mb-1.5 block text-sm font-bold text-emerald-900">
                                {role === "student" ? "رقم هاتف الطالب" : "رقم هاتف المدرس"}
                            </label>
                            <div className="flex gap-2" dir="ltr">
                                <div className="flex items-center justify-center rounded-xl border border-emerald-200 bg-emerald-50 px-3 font-bold text-emerald-700">
                                    {formData.countryCode}
                                </div>
                                <input
                                    id="phone"
                                    type="tel"
                                    placeholder="100 000 0000"
                                    value={formData.phone}
                                    onChange={handleInputChange}
                                    className="w-full rounded-xl border border-emerald-200 bg-white/85 px-4 py-3 text-emerald-950 outline-none transition focus:border-emerald-400 focus:ring-1 focus:ring-emerald-300/40 text-right"
                                />
                            </div>
                        </div>
                    </div>

                    {role === "student" && (
                        <div>
                            <label htmlFor="guardianPhone" className="mb-1.5 block text-sm font-bold text-emerald-900">
                                رقم هاتف ولي الأمر
                            </label>
                            <div className="flex gap-2" dir="ltr">
                                <div className="flex items-center justify-center rounded-xl border border-emerald-200 bg-emerald-50 px-3 font-bold text-emerald-700">
                                    {formData.countryCode}
                                </div>
                                <input
                                    id="guardianPhone"
                                    type="tel"
                                    placeholder="100 000 0000"
                                    value={formData.guardianPhone}
                                    onChange={handleInputChange}
                                    className="w-full rounded-xl border border-emerald-200 bg-white/85 px-4 py-3 text-emerald-950 outline-none transition focus:border-emerald-400 focus:ring-1 focus:ring-emerald-300/40 text-right"
                                />
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                        <div>
                            <label htmlFor="password" className="mb-1.5 block text-sm font-bold text-emerald-900">
                                كلمة المرور
                            </label>
                            <input
                                id="password"
                                type="password"
                                placeholder="********"
                                value={formData.password}
                                onChange={handleInputChange}
                                className="w-full rounded-xl border border-emerald-200 bg-white/85 px-4 py-3 text-emerald-950 outline-none transition focus:border-emerald-400 focus:ring-1 focus:ring-emerald-300/40"
                            />
                        </div>

                        <div>
                            <label htmlFor="confirmPassword" className="mb-1.5 block text-sm font-bold text-emerald-900">
                                تأكيد كلمة المرور
                            </label>
                            <input
                                id="confirmPassword"
                                type="password"
                                placeholder="********"
                                value={formData.confirmPassword}
                                onChange={handleInputChange}
                                className="w-full rounded-xl border border-emerald-200 bg-white/85 px-4 py-3 text-emerald-950 outline-none transition focus:border-emerald-400 focus:ring-1 focus:ring-emerald-300/40"
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-600">
                            {error}
                        </div>
                    )}
                    <button
                        type="submit"
                        className="glow-button mt-4 inline-flex w-full items-center justify-center rounded-xl bg-gradient-to-l from-emerald-500 to-emerald-600 px-6 py-3 text-sm font-bold text-white transition-all hover:from-emerald-400 hover:to-emerald-500"
                    >
                        إنشاء الحساب
                    </button>

                    <div className="mt-4 text-center text-sm text-slate-600">
                        لديك حساب بالفعل؟{" "}
                        <Link href="/auth/login" className="font-bold text-emerald-700 hover:text-emerald-800">
                            سجل دخولك من هنا
                        </Link>
                    </div>
                </form>
            </article>
        </main>
    );
}

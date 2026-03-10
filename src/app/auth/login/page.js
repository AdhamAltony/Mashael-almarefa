"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [role, setRole] = useState("student");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!email || !password) {
      setError("الرجاء إدخال البريد الإلكتروني وكلمة المرور.");
      return;
    }

    const validUsers = [
      { role: "student", email: "student@gmail.com", password: "123456", redirect: "/student/profile", name: "طالب تجريبي" },
      { role: "admin", email: "admin@gmail.com", password: "123456", redirect: "/admin/dashboard", name: "مدير النظام" },
      { role: "teacher", email: "teacher@gmail.com", password: "123456", redirect: "/teacher/dashboard", name: "معلم تجريبي" },
      { role: "teacher", email: "quran@gmail.com", password: "123456", redirect: "/quran-and-sciences/students", name: "معلم ركن القرآن" },
      { role: "teacher", email: "arabic@gmail.com", password: "123456", redirect: "/arabic-non-native/students", name: "معلم العربية" },
      { role: "teacher", email: "curricula@gmail.com", password: "123456", redirect: "/egypt-gulf-curricula/students", name: "معلم المناهج الدراسية" }
    ];

    const userByEmail = validUsers.find(u => u.email === email);

    if (!userByEmail) {
      setError("هذا البريد غير مسجل من قبل.");
      return;
    }

    if (userByEmail.role !== role) {
      setError("ليس لديك صلاحية الدخول بهذه الصفة.");
      return;
    }

    if (userByEmail.password !== password) {
      setError("كلمة المرور غير صحيحة.");
      return;
    }

    // Success
    const cookieOptions = rememberMe ? "max-age=2592000; SameSite=Strict" : "SameSite=Strict";
    const sessionData = { role: userByEmail.role, email: userByEmail.email, name: userByEmail.name };
    const encodedSession = btoa(encodeURIComponent(JSON.stringify(sessionData)));

    document.cookie = `userRole=${userByEmail.role}; path=/; ${cookieOptions}`;
    document.cookie = `session=${encodedSession}; path=/; ${cookieOptions}`;

    setError("");
    router.push(userByEmail.redirect);
  };

  return (
    <main className="site-container flex min-h-[calc(100vh-140px)] items-center justify-center py-10" dir="rtl">
      <article className="modern-card w-full max-w-md rounded-3xl border border-white/70 bg-white/60 p-6 shadow-xl shadow-emerald-900/5 backdrop-blur-md sm:p-8">
        <div className="text-center">
          <p className="inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
            بوابة الدخول
          </p>
          <h1 className="mt-4 text-2xl font-black text-emerald-950 sm:text-3xl">مرحباً بك مجدداً</h1>
          <p className="mt-2 text-sm text-slate-600">
            سجل دخولك للمنصة للوصول إلى لوحة التحكم الخاصة بك.
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

            <label className="relative flex-1 cursor-pointer">
              <input
                type="radio"
                name="role"
                value="admin"
                checked={role === "admin"}
                onChange={() => setRole("admin")}
                className="peer sr-only"
              />
              <div className="flex flex-col items-center gap-2 rounded-2xl border-2 border-slate-100 bg-white/80 p-4 transition-all hover:border-emerald-200 hover:bg-emerald-50 peer-checked:border-emerald-500 peer-checked:bg-emerald-50 peer-checked:shadow-md peer-checked:shadow-emerald-500/10">
                <svg className="h-7 w-7 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <span className="font-bold text-emerald-900">إدارة</span>
              </div>
              {role === "admin" && (
                <div className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-white shadow-sm transition-transform duration-300 animate-in zoom-in">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}
            </label>
          </div>

          <div>
            <label htmlFor="email" className="mb-1.5 block text-sm font-bold text-emerald-900">
              البريد الإلكتروني
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              className={`w-full rounded-xl border bg-white/85 px-4 py-3 text-emerald-950 outline-none transition focus:ring-1 ${error ? "border-red-400 focus:border-red-500 focus:ring-red-300/40" : "border-emerald-200 focus:border-emerald-400 focus:ring-emerald-300/40"}`}
            />
          </div>

          <div>
            <label htmlFor="password" className="mb-1.5 block text-sm font-bold text-emerald-900">
              كلمة المرور
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="********"
              className={`w-full rounded-xl border bg-white/85 px-4 py-3 text-emerald-950 outline-none transition focus:ring-1 ${error ? "border-red-400 focus:border-red-500 focus:ring-red-300/40" : "border-emerald-200 focus:border-emerald-400 focus:ring-emerald-300/40"}`}
            />
          </div>

          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-600">
              {error}
            </div>
          )}

          <div className="flex items-center justify-between gap-3 text-sm">
            <label className="inline-flex items-center gap-2 text-slate-700">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 rounded border-emerald-300 text-emerald-600 focus:ring-emerald-500"
              />
              تذكرني
            </label>
            <Link href="#" className="font-bold text-emerald-700 hover:text-emerald-800">
              نسيت كلمة المرور؟
            </Link>
          </div>

          <button
            type="submit"
            className="glow-button mt-4 inline-flex w-full items-center justify-center rounded-xl bg-gradient-to-l from-emerald-500 to-emerald-600 px-6 py-3 text-sm font-bold text-white transition-all hover:from-emerald-400 hover:to-emerald-500"
          >
            تسجيل الدخول
          </button>

          <div className="mt-4 text-center text-sm text-slate-600">
            ليس لديك حساب بعد؟{" "}
            <Link href="/auth/signup" className="font-bold text-emerald-700 hover:text-emerald-800">
              أنشئ حساباً جديداً
            </Link>
          </div>
        </form>
      </article>
    </main>
  );
}

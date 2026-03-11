"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AuthButtons() {
    const [session, setSession] = useState(null);
    const router = useRouter();

    useEffect(() => {
        const cookies = document.cookie.split("; ");
        const roleCookie = cookies.find(c => c.startsWith("userRole="));
        if (roleCookie) {
            const role = roleCookie.split("=")[1];
            setSession({ role });
        }
    }, []);

    const handleLogout = () => {
        document.cookie = "userRole=; path=/; max-age=0;";
        document.cookie = "session=; path=/; max-age=0;";
        setSession(null);
        router.refresh();
    };

    if (session) {
        let portalLink = "/student/profile";
        let portalLabel = "لوحة الطالب";
        if (session.role === "teacher") {
            portalLink = "/teacher/dashboard";
            portalLabel = "لوحة المعلم";
        } else if (session.role === "admin") {
            portalLink = "/admin/dashboard";
            portalLabel = "لوحة الإدارة";
        }

        return (
            <div className="flex items-center gap-2 sm:gap-3">
                <Link
                    href={portalLink}
                    className="inline-flex items-center justify-center rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 sm:px-5 sm:py-3 text-[11px] sm:text-sm font-bold text-emerald-50 transition-all hover:bg-emerald-500/20 hover:-translate-y-0.5 shrink-0"
                >
                    {portalLabel}
                </Link>
                <button
                    onClick={handleLogout}
                    className="glow-button inline-flex items-center justify-center rounded-lg bg-gradient-to-l from-red-500 to-red-600 px-3 py-2 sm:px-5 sm:py-3 text-[11px] sm:text-sm font-bold text-white transition-all hover:-translate-y-0.5 hover:from-red-400 hover:to-red-500 shrink-0"
                >
                    تسجيل الخروج
                </button>
            </div>
        );
    }

    return (
        <div className="flex items-center gap-2 sm:gap-3">
            <Link
                href="/auth/login"
                className="inline-flex items-center justify-center rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 sm:px-5 sm:py-3 text-[11px] sm:text-sm font-bold text-emerald-50 transition-all hover:bg-emerald-500/20 hover:-translate-y-0.5 shrink-0"
            >
                تسجيل الدخول
            </Link>
            <Link
                href="#platform-sections"
                className="glow-button inline-flex items-center justify-center rounded-lg bg-gradient-to-l from-emerald-500 to-emerald-600 px-3 py-2 sm:px-5 sm:py-3 text-[11px] sm:text-sm font-bold text-white transition-all hover:-translate-y-0.5 hover:from-emerald-400 hover:to-emerald-500 shrink-0"
            >
                ابدأ التعلّم
            </Link>
        </div>
    );
}

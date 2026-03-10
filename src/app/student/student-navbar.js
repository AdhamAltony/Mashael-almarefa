"use client";

import PortalNavbar from "@/components/portal-navbar";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function StudentNavbar({ sectionTitle, links, ctaLabel, ctaHref }) {
    const [session, setSession] = useState(null);
    const router = useRouter();

    useEffect(() => {
        const cookies = document.cookie.split("; ");
        const roleCookie = cookies.find(c => c.startsWith("userRole="));
        if (roleCookie) {
            const role = roleCookie.split("=")[1];
            if (role === "student") {
                const sessionCookie = cookies.find(c => c.startsWith("session="));
                if (sessionCookie) {
                    try {
                        const data = JSON.parse(decodeURIComponent(atob(sessionCookie.split("=")[1])));
                        setSession(data);
                    } catch (e) {
                        console.error("Failed to parse session", e);
                        setSession({ role: "student", name: "طالب تجريبي", email: "student@gmail.com" });
                    }
                } else {
                    setSession({ role: "student", name: "طالب تجريبي", email: "student@gmail.com" });
                }
            } else {
                setSession({ role, name: "مستخدم", email: "" });
            }
        }
    }, []);

    const handleLogout = () => {
        document.cookie = "userRole=; path=/; max-age=0;";
        document.cookie = "session=; path=/; max-age=0;";
        router.push("/auth/login");
        router.refresh();
    };

    return (
        <PortalNavbar
            sectionTitle={sectionTitle}
            links={links}
            ctaLabel={ctaLabel}
            ctaHref={ctaHref}
            userSession={session}
            onLogout={handleLogout}
        />
    );
}

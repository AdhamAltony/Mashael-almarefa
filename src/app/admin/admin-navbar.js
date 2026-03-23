"use client";

import PortalNavbar from "@/components/portal-navbar";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminNavbar({ sectionTitle, links }) {
    const [session, setSession] = useState(null);
    const router = useRouter();

    useEffect(() => {
        // Read session from cookies client-side
        const cookies = document.cookie.split("; ");
        // First read userRole
        const roleCookie = cookies.find(c => c.startsWith("userRole="));
        if (roleCookie) {
            // We know it's at least an admin via middleware, but let's check session detail
            const sessionCookie = cookies.find(c => c.startsWith("session="));
            if (sessionCookie) {
                try {
                    const base64 = decodeURIComponent(sessionCookie.split("=")[1]);
                    const decoded = decodeURIComponent(atob(base64));
                    const data = JSON.parse(decoded);
                    setSession(data);
                } catch {
                    console.error("Failed to parse session");
                    // fallback session
                    setSession({ role: "admin", name: "مدير النظام", email: "admin@gmail.com" });
                }
            } else {
                // fallback session if session cookie isn't there but userRole is
                setSession({ role: "admin", name: "مدير النظام", email: "admin@gmail.com" });
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
            userSession={session}
            onLogout={handleLogout}
        />
    );
}

"use client";

import Link from "next/link";
import { useState } from "react";
import Image from "next/image";
import { usePathname } from "next/navigation";

export default function PortalNavbar({ sectionTitle, links = [], ctaLabel = "الصفحة الرئيسية", ctaHref = "/", userSession = null, onLogout, showCtaWithSession = false }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();

  const isLoginPage = pathname === "/auth/login";

  return (
    <nav className="fixed right-0 left-0 top-0 z-50" dir="rtl">
      <div className="nav-surface shadow-[0_12px_36px_-16px_rgba(4,16,31,0.85)]">
        <div className="site-container">
          <div className="flex min-h-[4.5rem] items-center justify-between gap-2 sm:gap-4">

            <div className="flex items-center gap-2 sm:gap-3">
              {links.length > 0 && (
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="lg:hidden flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500 transition-all hover:bg-emerald-500/20"
                  aria-label="القائمة"
                >
                  <svg className="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    {isMenuOpen ? (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    )}
                  </svg>
                </button>
              )}

              <Link href="/" className="flex min-w-0 items-center gap-2 sm:gap-3">
                <div className="icon-ring flex h-8 w-8 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-lg shadow-emerald-500/30 relative overflow-hidden">
                  <Image
                    src="/Logo.jpeg"
                    alt="لوجو مشاعل المعرفة"
                    fill
                    className="object-cover rounded-xl"
                  />
                </div>
                <div className="flex min-w-0 flex-col">
                  <span className="truncate whitespace-nowrap text-sm font-bold text-white sm:text-lg">مشاعل المعرفة</span>
                  <span className="hidden text-[10px] text-emerald-200/80 sm:block sm:text-xs">{sectionTitle}</span>
                </div>
              </Link>
            </div>

            <div className="hidden items-center gap-2 lg:flex xl:gap-3">
              {links.map((item) => (
                <Link key={item.href} href={item.href} className="nav-link-pill">
                  {item.label}
                </Link>
              ))}
            </div>

            <div className="flex items-center gap-2 sm:gap-4">
              {(!userSession || showCtaWithSession) && ctaLabel && (
                <Link
                  href={ctaHref}
                  className="glow-button inline-flex items-center justify-center gap-1.5 rounded-lg bg-gradient-to-l from-emerald-500 to-emerald-600 px-3 py-1.5 sm:px-4 sm:py-2.5 text-xs sm:text-sm font-bold text-white transition-all hover:-translate-y-0.5 hover:from-emerald-400 hover:to-emerald-500 flex-shrink-0"
                >
                  <svg aria-hidden="true" className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" viewBox="0 0 24 24" fill="none" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                  <span>{ctaLabel}</span>
                </Link>
              )}
              {!userSession && !isLoginPage && (
                <Link
                  href="/auth/login"
                  className="hidden sm:inline-flex items-center justify-center rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-sm font-bold text-emerald-50 transition-all hover:bg-emerald-500/20 hover:-translate-y-0.5"
                >
                  تسجيل الدخول
                </Link>
              )}
              {userSession && (
                <div className="flex items-center gap-2 sm:gap-4 border-r border-[#6ee7b7]/20 pr-2 sm:pr-4">
                  <div className="hidden sm:flex flex-col text-right">
                    <span className="text-sm font-bold text-white max-w-[100px] sm:max-w-[120px] truncate">{userSession.name}</span>
                    <span className="text-xs text-emerald-200 truncate max-w-[100px] sm:max-w-[120px]">
                      {userSession.role === 'admin' ? 'إدارة المنصة' : userSession.role === 'teacher' ? 'بوابة المعلم' : userSession.role === 'student' ? 'بوابة الطالب' : userSession.role}
                    </span>
                  </div>
                  <div className="flex h-8 w-8 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-xs sm:text-sm text-white font-bold border-2 border-emerald-400 shadow-md">
                    {userSession.name?.charAt(0) || "U"}
                  </div>
                  <button
                    onClick={onLogout}
                    className="rounded-lg bg-red-500/10 p-1.5 sm:p-2.5 text-red-100 transition-all hover:bg-red-500/20 hover:text-white"
                    title="تسجيل الخروج"
                  >
                    <svg className="h-4 w-4 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Menu Dropdown */}
          <div
            className={`lg:hidden overflow-hidden transition-all duration-300 ease-in-out ${isMenuOpen ? "max-h-[400px] opacity-100 pb-4" : "max-h-0 opacity-0"
              }`}
          >
            <div className="flex flex-col gap-1 pt-3 border-t border-emerald-500/10">
              {links.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMenuOpen(false)}
                  className="block px-4 py-2.5 text-sm font-semibold text-slate-200 hover:bg-emerald-500/10 hover:text-emerald-400 rounded-lg transition-colors border-r-2 border-transparent hover:border-emerald-500"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

        </div>
      </div>
    </nav>
  );
}

import Link from "next/link";

export default function PortalNavbar({ sectionTitle, links = [], ctaLabel = "الصفحة الرئيسية", ctaHref = "/", userSession = null, onLogout, showCtaWithSession = false }) {
  return (
    <nav className="fixed right-0 left-0 top-0 z-50" dir="rtl">
      <div className="nav-surface shadow-[0_12px_36px_-16px_rgba(4,16,31,0.85)]">
        <div className="site-container">
          <div className="flex min-h-[4.5rem] items-center justify-between gap-4">
            <Link href="/" className="flex min-w-0 items-center gap-2.5 sm:gap-3">
              <div className="icon-ring flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 text-xl font-bold text-white shadow-lg shadow-emerald-500/30 sm:h-12 sm:w-12">
                م
              </div>
              <div className="flex min-w-0 flex-col">
                <span className="truncate whitespace-nowrap text-base font-bold text-white sm:text-lg">مشاعل المعرفة</span>
                <span className="hidden text-xs text-emerald-200/80 sm:block">{sectionTitle}</span>
              </div>
            </Link>

            <div className="hidden items-center gap-2 lg:flex xl:gap-3">
              {links.map((item) => (
                <Link key={item.href} href={item.href} className="nav-link-pill">
                  {item.label}
                </Link>
              ))}
            </div>

            <div className="flex items-center gap-3 sm:gap-4">
              {(!userSession || showCtaWithSession) && ctaLabel && (
                <Link
                  href={ctaHref}
                  className="glow-button inline-flex items-center justify-center gap-1.5 rounded-lg bg-gradient-to-l from-emerald-500 to-emerald-600 px-3 py-2 text-xs font-bold text-white transition-all hover:-translate-y-0.5 hover:from-emerald-400 hover:to-emerald-500 sm:gap-2 sm:px-4 sm:py-2.5 sm:text-sm"
                >
                  <svg aria-hidden="true" className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                  <span className="hidden sm:inline">{ctaLabel}</span>
                  <span className="inline sm:hidden">الرئيسية</span>
                </Link>
              )}
              {userSession && (
                <div className="flex items-center gap-3 border-r border-[#6ee7b7]/20 pr-3 sm:gap-4 sm:pr-4">
                  <div className="hidden sm:flex flex-col text-right">
                    <span className="text-sm font-bold text-white max-w-[120px] truncate">{userSession.name}</span>
                    <span className="text-xs text-emerald-200 truncate max-w-[120px]">
                      {userSession.role === 'admin' ? 'إدارة المنصة' : userSession.role === 'teacher' ? 'بوابة المعلم' : userSession.role === 'student' ? 'بوابة الطالب' : userSession.role}
                    </span>
                  </div>
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-sm text-white font-bold border-2 border-emerald-400 shadow-md sm:h-10 sm:w-10 sm:text-base">
                    {userSession.name?.charAt(0) || "U"}
                  </div>
                  <button
                    onClick={onLogout}
                    className="rounded-lg bg-red-500/10 p-2 text-xs font-bold text-red-100 transition-all hover:bg-red-500/20 hover:text-white sm:px-3 sm:py-2"
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
        </div>
      </div>
    </nav>
  );
}

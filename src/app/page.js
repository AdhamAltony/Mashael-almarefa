import Link from "next/link";
import AuthButtons from "@/components/auth-buttons";
import ServicesSection from "@/components/services-section";
import Image from "next/image";

function SparkIcon({ className = "w-5 h-5" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M11.08 3.316a.75.75 0 011.84 0l1.094 3.97a.75.75 0 00.512.513l3.97 1.094a.75.75 0 010 1.84l-3.97 1.094a.75.75 0 00-.512.513l-1.094 3.97a.75.75 0 01-1.84 0l-1.094-3.97a.75.75 0 00-.513-.513l-3.97-1.094a.75.75 0 010-1.84l3.97-1.094a.75.75 0 00.513-.513l1.094-3.97z" />
    </svg>
  );
}

function BookIcon({ className = "w-6 h-6" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
    </svg>
  );
}

function UsersIcon({ className = "w-6 h-6" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.74-1.296 4.5 4.5 0 00-7.49-3.49M6 18.72a9.094 9.094 0 01-3.74-1.296 4.5 4.5 0 017.49-3.49M6 18.72A11.988 11.988 0 0012 20.25c2.13 0 4.13-.554 5.865-1.53M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 2.25a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
    </svg>
  );
}

function AcademicCapIcon({ className = "w-6 h-6" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" />
    </svg>
  );
}

function FaceSmileIcon({ className = "w-6 h-6" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.182 15.182a4.5 4.5 0 01-6.364 0M21 12a9 9 0 11-18 0 9 9 0 0118 0zM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75zm3.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75z" />
    </svg>
  );
}

function GlobeAltIcon({ className = "w-6 h-6" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0a9.015 9.015 0 01-9-4.5" />
    </svg>
  );
}

function StarIcon({ className = "w-6 h-6" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
    </svg>
  );
}


const audienceSegments = [
  {
    title: "الطلاب العرب",
    description: "المناهج الدراسية في مصر والخليج.",
    icon: AcademicCapIcon,
    color: "from-blue-500 to-indigo-600",
    shadow: "shadow-blue-500/20"
  },
  {
    title: "الأطفال",
    description: "تأسيس اللغة العربية واللغات الأجنبية.",
    icon: FaceSmileIcon,
    color: "from-amber-400 to-orange-500",
    shadow: "shadow-orange-500/20"
  },
  {
    title: "غير العرب",
    description: "تعليم اللغة العربية للناطقين بغيرها.",
    icon: GlobeAltIcon,
    color: "from-emerald-400 to-teal-500",
    shadow: "shadow-teal-500/20"
  },
  {
    title: "حفظة القرآن",
    description: "تحفيظ + تجويد + إجازات ومتون وسيرة نبوية.",
    icon: BookIcon,
    color: "from-purple-500 to-fuchsia-600",
    shadow: "shadow-purple-500/20"
  },
  {
    title: "المعلمون والطلاب",
    description: "دورات تدريبية متخصصة.",
    icon: UsersIcon,
    color: "from-rose-500 to-pink-600",
    shadow: "shadow-rose-500/20"
  },
];



function Navbar() {
  return (
    <nav className="fixed top-0 right-0 left-0 z-50">
      <div className="nav-surface shadow-[0_12px_36px_-16px_rgba(4,16,31,0.85)]">
        <div className="site-container">
          <div className="flex min-h-[4.5rem] items-center justify-between gap-4">
            <Link href="#hero" className="flex min-w-0 items-center gap-2.5 sm:gap-3">
              <div className="icon-ring flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-lg shadow-emerald-500/30 sm:h-12 sm:w-12 relative overflow-hidden">
                <Image
                  src="/Logo.jpeg"
                  alt="لوجو مشاعل المعرفة"
                  fill
                  className="object-cover rounded-xl"
                />
              </div>
              <div className="flex min-w-0 flex-col">
                <span className="truncate whitespace-nowrap text-base font-bold text-white sm:text-lg">مشاعل المعرفة</span>
                <span className="hidden text-xs text-emerald-200/80 sm:block">منصة تعليمية متكاملة</span>
              </div>
            </Link>



            <AuthButtons />
          </div>
        </div>
      </div>
    </nav>
  );
}

function HeroSection() {
  return (
    <section id="hero" className="relative isolate flex min-h-screen items-center overflow-hidden bg-[var(--ink-950)] pt-24">
      <div className="animate-gradient absolute inset-0 bg-gradient-to-bl from-[#021a24] via-[#0a364a] to-[#052836]" />
      <div className="geometric-pattern absolute inset-0 opacity-45" />
      <div className="hero-wash" />
      <div className="hero-wash secondary" />
      <div className="hero-mesh" />

      <div className="site-container relative z-10">
        <div className="mx-auto max-w-4xl text-center">
          <span className="hero-chip mb-5 inline-flex gap-2">
            <SparkIcon className="h-4 w-4" />
            منصة مشاعل المعرفة
          </span>
          <h1 className="mb-6 text-4xl font-black text-white sm:text-5xl md:text-6xl" style={{ lineHeight: 1.35 }}>
            مشاعل المعرفة
          </h1>
          <p className="mx-auto mb-5 max-w-3xl text-lg text-emerald-100/95 sm:text-xl">
            منصة تعليمية تهدف لصناعة جيل يجيد لغته ويحفظ كتاب ربه ويواكب عصره.
          </p>
          <p className="mx-auto mb-10 max-w-3xl text-base leading-relaxed text-emerald-50/85 sm:text-lg">
            موجّهة للأطفال والكبار من العرب وغير العرب، وتشمل علوم اللغة العربية والمناهج الدراسية والقرآن وعلومه.
          </p>

          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="#platform-sections"
              className="glow-button inline-flex w-full items-center justify-center rounded-xl bg-gradient-to-l from-emerald-500 to-emerald-600 px-7 py-3.5 text-sm font-bold text-white transition-all hover:-translate-y-0.5 hover:from-emerald-400 hover:to-emerald-500 sm:w-auto"
            >
              استكشف خدماتنا
            </Link>
            <Link
              href="#contact"
              className="inline-flex w-full items-center justify-center rounded-xl border border-emerald-200/35 bg-white/10 px-7 py-3.5 text-sm font-bold text-emerald-50 transition-colors hover:bg-white/15 sm:w-auto"
            >
              تواصل معنا
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function AnnouncementsSection() {
  return (
    <div className="bg-gradient-to-r from-emerald-600 to-emerald-500 py-3 text-center shadow-md sm:py-4">
      <div className="site-container flex flex-wrap items-center justify-center gap-2 text-white sm:gap-3">
        <SparkIcon className="h-5 w-5 animate-pulse text-yellow-300" />
        <p className="text-sm font-bold leading-relaxed sm:text-base">
          إعلانات الدورات: بادر بالتسجيل الآن في <span className="text-yellow-300">دوراتنا الجديدة</span> (التطبيق اللغوي، دورة البحث العلمي ومناهجه، والكتابة الأكاديمية).
        </p>
        <SparkIcon className="hidden h-5 w-5 animate-pulse text-yellow-300 sm:block" />
      </div>
    </div>
  );
}

function IdentitySection() {
  return (
    <section id="identity" className="section-spacing relative overflow-hidden bg-gradient-to-b from-[#eef6f5] via-[#f4f8f8] to-[#ecf4f4]">
      <div className="absolute left-0 top-0 h-[360px] w-[360px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-200/45 blur-3xl" />
      <div className="site-container relative z-10">
        <div className="mb-12 text-center">
          <span className="mb-4 inline-block rounded-full bg-emerald-100 px-5 py-2 text-sm font-bold text-emerald-700">شعارنا</span>
          <h2 className="text-3xl font-black text-emerald-950 sm:text-4xl" style={{ lineHeight: 1.4 }}>
            نُضيء العقول… ونبني جيل المستقبل
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <article className="modern-card card-hover rounded-3xl p-7 shadow-lg shadow-emerald-500/10">
            <h3 className="mb-3 text-xl font-bold text-emerald-900">رسالتنا</h3>
            <p className="text-slate-700">تقديم تعليم عربي ممتع وتفاعلي وقيمي يجمع المناهج والمهارات العلمية في مكان واحد.</p>
          </article>
          <article className="modern-card card-hover rounded-3xl p-7 shadow-lg shadow-emerald-500/10">
            <h3 className="mb-3 text-xl font-bold text-emerald-900">رؤيتنا</h3>
            <p className="text-slate-700">أن يصبح المتعلم متقنًا للعربية والقرآن والمناهج بمنهجية ذكية وتقنية حديثة وقيم سامية.</p>
          </article>
        </div>
      </div>
    </section>
  );
}

function AudienceSection() {
  return (
    <section id="audience" className="section-spacing relative overflow-hidden bg-gradient-to-b from-[#f8fbfb] via-[#f2f8f8] to-[#eef5f5]">
      <div className="site-container relative z-10">
        <div className="mb-16 text-center">
          <div className="mb-4 inline-flex items-center justify-center gap-3 rounded-full bg-emerald-100 px-8 py-3 shadow-md shadow-emerald-500/20 border border-emerald-200 text-emerald-700 hover:scale-105 transition-transform">
            <StarIcon className="h-8 w-8" />
            <span className="text-xl font-bold">الفئات المستهدفة</span>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 xl:grid-cols-3">
          {audienceSegments.map((item) => {
            const Icon = item.icon;
            return (
              <article key={item.title} className="modern-card card-hover group relative overflow-hidden rounded-3xl p-8 shadow-xl shadow-emerald-500/10">
                <div className={`absolute top-0 right-0 -m-8 h-32 w-32 rounded-full bg-gradient-to-br ${item.color} opacity-5 transition-transform duration-500 group-hover:scale-[2]`}></div>
                <div className={`mb-6 inline-flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br ${item.color} shadow-lg ${item.shadow} transition-transform duration-300 group-hover:-translate-y-2`}>
                  <Icon className="h-10 w-10 text-white" />
                </div>
                <h3 className="mb-4 text-2xl font-bold text-emerald-950 relative z-10">{item.title}</h3>
                <p className="text-lg text-slate-700 relative z-10 leading-relaxed">{item.description}</p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}



function FooterSection() {
  return (
    <footer id="contact" className="relative overflow-hidden bg-[#041722] text-emerald-50">
      <div className="site-container py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          <div>
            <h3 className="mb-3 text-2xl font-bold">مشاعل المعرفة</h3>
            <p className="max-w-xl text-sm leading-relaxed text-emerald-100/85">
              بيئة تربوية متكاملة تزرع العلم والإيمان معًا، وتجمع بين تعليم القرآن واللغة العربية والمناهج الدراسية.
            </p>
          </div>
          <div className="md:text-left">
            <h4 className="mb-3 text-lg font-bold">تواصل معنا</h4>
            <p className="text-sm text-emerald-100/85">البريد الإلكتروني: info@mashael-almaarifa.com</p>
            <p className="mt-2 text-sm text-emerald-100/85" dir="ltr">
              WhatsApp: +20 100 000 0000
            </p>
          </div>
        </div>
        <div className="mt-10 border-t border-emerald-200/15 pt-6 text-center text-sm text-emerald-100/70">
          © {new Date().getFullYear()} مشاعل المعرفة. جميع الحقوق محفوظة.
        </div>
      </div>
    </footer>
  );
}

export default function Home() {
  return (
    <main className="overflow-x-clip">
      <Navbar />
      <HeroSection />
      <AnnouncementsSection />
      <IdentitySection />
      <AudienceSection />
      <ServicesSection />
      <FooterSection />
    </main>
  );
}

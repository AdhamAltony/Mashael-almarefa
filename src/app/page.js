import Link from "next/link";
import AuthButtons from "@/components/auth-buttons";

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



const audienceSegments = [
  { title: "الطلاب العرب", description: "المناهج الدراسية في مصر والخليج." },
  { title: "الأطفال", description: "تأسيس اللغة العربية واللغات الأجنبية." },
  { title: "غير العرب", description: "تعليم اللغة العربية للناطقين بغيرها." },
  { title: "حفظة القرآن", description: "تحفيظ + تجويد + إجازات." },
  { title: "المعلمون والطلاب", description: "دورات تدريبية متخصصة." },
];

const platformSections = [
  {
    id: "quran-and-sciences",
    title: "1. ركن القرآن الكريم وعلومه",
    items: [
      "تحفيظ تفاعلي بالصوت والصورة",
      "تقسيم حسب العمر والمستوى",
      "اختبارات حفظ أسبوعية",
      "غرف تسميع مباشرة مع شيخ",
      "مسار الإجازة",
    ],
  },
  {
    id: "arabic-non-native",
    title: "2. اللغة العربية لغير الناطقين بها",
    items: [
      "تأسيس الحروف والنطق الصحيح",
      "مهارات الاستماع والتحدث والقراءة والكتابة",
      "مستويات متدرجة من المبتدئ إلى المتقدم",
      "محادثة تفاعلية مع معلمين متخصصين",
      "إعداد لاختبارات الكفاءة اللغوية",
    ],
  },
  {
    id: "egypt-gulf-curricula",
    title: "3. المناهج الدراسية (مصر + الخليج)",
    items: [
      "لغة عربية",
      "اللغات الأجنبية: (الإنجليزية، الفرنسية، الألمانية)",
      "الرياضيات (منهج: عربي - إنجليزي)",
      "العلوم: الفيزياء والكيمياء والأحياء (منهج: عربي – إنجليزي)",
      "الدراسات اجتماعية: تاريخ وجغرافيا.",
      "تربية إسلامية.",
    ],
  },
  {
    id: "courses-center",
    title: "4. مركز الدورات",
    intro: "نوع الدورة",
    items: [
      "النحو: تأسيس وتوظيف",
      "الصرف",
      "العَروض",
      "البلاغة",
      "إعدا معلم اللغة العربية للناطقين بغيرها",
    ],
  },
];

function Navbar() {
  return (
    <nav className="fixed top-0 right-0 left-0 z-50">
      <div className="nav-surface shadow-[0_12px_36px_-16px_rgba(4,16,31,0.85)]">
        <div className="site-container">
          <div className="flex min-h-[4.5rem] items-center justify-between gap-4">
            <Link href="#hero" className="flex min-w-0 items-center gap-2.5 sm:gap-3">
              <div className="icon-ring flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 text-xl font-bold text-white shadow-lg shadow-emerald-500/30 sm:h-12 sm:w-12">
                م
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
            موجّهة للأطفال والكبار، من العرب وغير العرب، وتشمل علوم اللغة العربية والمناهج الدراسية والقرآن وعلومه.
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
        <div className="mb-12 text-center">
          <span className="mb-4 inline-block rounded-full bg-emerald-100 px-5 py-2 text-sm font-bold text-emerald-700">الفئات المستهدفة</span>
          <h2 className="text-3xl font-black text-emerald-950 sm:text-4xl" style={{ lineHeight: 1.4 }}>
            برامج مصممة لشرائح متنوعة
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {audienceSegments.map((item) => (
            <article key={item.title} className="modern-card card-hover rounded-3xl p-7 shadow-lg shadow-emerald-500/10">
              <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                <UsersIcon className="h-6 w-6" />
              </div>
              <h3 className="mb-3 text-xl font-bold text-emerald-900">{item.title}</h3>
              <p className="text-slate-700">{item.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function ServicesSection() {
  return (
    <section id="platform-sections" className="section-spacing relative overflow-hidden bg-gradient-to-b from-[#0c3447] via-[#0a2c3d] to-[#082433]">
      <div className="hero-mesh" />
      <div className="site-container relative z-10">
        <div className="mb-12 text-center">
          <span className="mb-4 inline-block rounded-full border border-emerald-300/35 bg-white/10 px-5 py-2 text-sm font-bold text-emerald-200">ثالثاً</span>
          <h2 className="text-3xl font-black text-white sm:text-4xl" style={{ lineHeight: 1.4 }}>
            أقسام المنصة الرئيسية
          </h2>
        </div>

        <div className="mb-10 flex flex-wrap items-center justify-center gap-3">
          {platformSections.map((section) => (
            <Link
              key={section.id}
              href={`#${section.id}`}
              className="section-link-chip"
            >
              {section.title}
              <SparkIcon className="h-4 w-4" />
            </Link>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {platformSections.map((section) => (
            <article id={section.id} key={section.id} className="glass card-hover rounded-3xl p-7 shadow-xl shadow-emerald-900/30">
              <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-400/15 text-emerald-100">
                <BookIcon className="h-6 w-6" />
              </div>
              <h3 className="mb-4 text-xl font-bold leading-relaxed text-white">{section.title}</h3>
              {section.intro ? <p className="mb-3 text-emerald-100/95">{section.intro}</p> : null}
              {section.items.length ? (
                <ul className="list-inside list-disc space-y-2 text-emerald-100/90">
                  {section.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              ) : null}
            </article>
          ))}
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
      <IdentitySection />
      <AudienceSection />
      <ServicesSection />
      <FooterSection />
    </main>
  );
}

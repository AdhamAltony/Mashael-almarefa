"use client";

import { useRef, useState, useEffect } from "react";

function QuranIcon({ className = "w-6 h-6" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
    </svg>
  );
}

function LanguageIcon({ className = "w-6 h-6" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 21l5.25-11.25L21 21m-9-3h7.5M3 5.621a48.474 48.474 0 016-.371m0 0c1.12 0 2.233.038 3.334.114M9 5.25V3m3.334 2.364C11.176 10.658 7.69 15.08 3 17.502m9.334-12.138c.896.061 1.785.147 2.666.257m-4.589 8.495a18.023 18.023 0 01-3.827-5.802" />
    </svg>
  );
}

function CurriculaIcon({ className = "w-6 h-6" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" />
    </svg>
  );
}

function CoursesIcon({ className = "w-6 h-6" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.82 1.508-2.316a7.5 7.5 0 10-7.516 0c.85.496 1.508 1.333 1.508 2.316V18" />
    </svg>
  );
}

const platformSections = [
  {
    id: "quran-and-sciences",
    title: "ركن القرآن الكريم وعلومه",
    Icon: QuranIcon,
    items: [
      "تحفيظ تفاعلي بالصوت والصورة",
      "تقسيم حسب العمر والمستوى",
      "اختبارات حفظ أسبوعية",
      "تسميع مباشر",
      "مسار الإجازة",
    ],
  },
  {
    id: "arabic-non-native",
    title: "اللغة العربية لغير الناطقين بها",
    Icon: LanguageIcon,
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
    title: "المناهج الدراسية (مصر + الخليج)",
    Icon: CurriculaIcon,
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
    title: "الدورات:",
    Icon: CoursesIcon,
    items: [
      "النحو: تأسيس وتوظيف",
      "الصرف",
      "العَروض",
      "البلاغة",
      "إعداد معلم اللغة العربية للناطقين بغيرها",
      "التدقيق اللغوي",
      "دورة البحث العلمي ومناهجه",
      "الكتابة الأكاديمية",
    ],
  },
];

export default function ServicesSection() {
  const scrollContainerRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -400, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 400, behavior: "smooth" });
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      if (scrollContainerRef.current) {
        // Find which item is most visible
        const container = scrollContainerRef.current;
        const scrollPosition = Math.abs(container.scrollLeft);
        const itemWidth = container.children[0].offsetWidth + 24; // width + gap
        const newIndex = Math.round(scrollPosition / itemWidth);
        if (newIndex !== activeIndex && newIndex >= 0 && newIndex < platformSections.length) {
          setActiveIndex(newIndex);
        }
      }
    };

    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener("scroll", handleScroll);
      return () => container.removeEventListener("scroll", handleScroll);
    }
  }, [activeIndex]);

  return (
    <section id="platform-sections" className="section-spacing relative overflow-hidden bg-gradient-to-b from-[#0c3447] via-[#0a2c3d] to-[#082433]">
      <style>{`
        @keyframes floating {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-6px); }
          100% { transform: translateY(0px); }
        }
        .animate-floating {
          animation: floating 3s ease-in-out infinite;
        }
      `}</style>
      <div className="hero-mesh" />
      <div className="site-container relative z-10 w-full max-w-[1400px] mx-auto">
        <div className="mb-10 flex flex-col sm:flex-row items-center justify-between gap-6">
          <h2 className="text-3xl font-black text-white sm:text-4xl" style={{ lineHeight: 1.4 }}>
            أقسام المنصة الرئيسة
          </h2>

          {/* نلغي النصوص ونضع أزرار حديثة للتنقل (Arrows) على يسار العنوان */}
          <div className="hidden sm:flex items-center gap-3">
            <button
              onClick={scrollRight}
              className="flex h-12 w-12 items-center justify-center rounded-full border border-emerald-500/30 bg-emerald-900/40 text-emerald-300 transition-all hover:-translate-y-0.5 hover:bg-emerald-500/20 active:scale-95"
              aria-label="التالي"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
            <button
              onClick={scrollLeft}
              className="flex h-12 w-12 items-center justify-center rounded-full border border-emerald-500/30 bg-emerald-900/40 text-emerald-300 transition-all hover:-translate-y-0.5 hover:bg-emerald-500/20 active:scale-95"
              aria-label="السابق"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          </div>
        </div>

        <div className="relative w-full">
          {/* ظلال متلاشية على الأطراف لتعطي إيحاء بأن هناك بطاقات مخفية (Fade edges) */}
          <div className="absolute top-0 right-[-10px] bottom-0 w-12 bg-gradient-to-l from-[#0a2c3d] to-transparent z-10 pointer-events-none md:w-20"></div>
          <div className="absolute top-0 left-[-10px] bottom-0 w-12 bg-gradient-to-r from-[#0a2c3d] to-transparent z-10 pointer-events-none md:w-20"></div>

          <div
            ref={scrollContainerRef}
            className="flex gap-6 overflow-x-auto pb-6 pt-2 snap-x snap-mandatory hide-scrollbar"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {platformSections.map((section, index) => (
              <article
                id={section.id}
                key={section.id}
                className="min-w-[85vw] sm:min-w-[400px] flex-none snap-center glass card-hover rounded-3xl p-7 shadow-xl shadow-emerald-900/30 transition-transform duration-300 hover:scale-[1.02]"
              >
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-400/15 text-emerald-100 shadow-inner">
                  <section.Icon 
                    className="h-7 w-7 animate-floating" 
                    style={{ animationDelay: `${index * 0.2}s` }} 
                  />
                </div>
                <h3 className="mb-4 text-xl font-bold leading-relaxed text-white">{section.title}</h3>
                {section.intro ? <p className="mb-3 text-emerald-100/95">{section.intro}</p> : null}
                {section.items.length ? (
                  <ul className="space-y-3 text-emerald-100/90">
                    {section.items.map((item) => (
                      <li key={item} className="flex items-start gap-3">
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400" />
                        <span className="text-sm sm:text-base leading-relaxed">{item}</span>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </article>
            ))}
          </div>
        </div>

        {/* نقاط مؤشر التقدم السفلية (Pagination Dots) تظهر في الهواتف كدليل */}
        <div className="mt-4 flex justify-center gap-2 sm:hidden">
          {platformSections.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all duration-300 ${i === activeIndex ? "w-8 bg-emerald-400" : "w-2 bg-emerald-900"
                }`}
            ></div>
          ))}
        </div>
      </div>
    </section>
  );
}

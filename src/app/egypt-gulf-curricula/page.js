"use client";

import Link from "next/link";
import { useState, useCallback } from "react";

// ─── Static Data (module-level, never re-created) ─────────────────────────────

const STUDENTS = [
  "أحمد محمود",
  "عمر عبد الله",
  "فاطمة علي",
  "زينب حسن",
  "يوسف طارق",
];

const TOPICS = [
  "حفظ سورة البقرة",
  "مراجعة عامة",
  "أحكام التجويد (النون الساكنة)",
  "شرح تحفة الأطفال",
  "تسميع متن الجزرية",
];

const NAV_LINKS = [
  { label: "ركن القرآن", href: "/quran-and-sciences" },
  { label: "العربية لغير الناطقين", href: "/arabic-non-native" },
  { label: "المناهج الدراسية", href: "/egypt-gulf-curricula" },
  { label: "مركز الدورات", href: "/courses-center" },
];

const EMPTY_FORM = {
  student: "",
  date: "",
  attendance: "",
  minutes: "",
  topic: "",
  rating: "",
  notes: "",
};

// ─── Shared Theme Styles ──────────────────────────────────────────────────────

const INPUT_BASE =
  "w-full rounded-xl border px-4 py-3.5 text-emerald-950 bg-white/80 outline-none transition-all focus:ring-1 focus:bg-white";
const BORDER_OK =
  "border-emerald-200/80 focus:border-emerald-400 focus:ring-emerald-400/30";
const BORDER_ERR =
  "border-red-400 focus:border-red-500 focus:ring-red-500/30";

// ─── Atomic UI Helpers ────────────────────────────────────────────────────────

function ChevronDown() {
  return (
    <svg
      aria-hidden="true"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  );
}

function FieldError({ message }) {
  return message ? (
    <p role="alert" className="mt-1.5 text-xs font-bold text-red-500">
      {message}
    </p>
  ) : null;
}

function SelectWrapper({ children }) {
  return (
    <div className="relative">
      {children}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute bottom-0 left-0 top-0 flex items-center px-4 text-emerald-600"
      >
        <ChevronDown />
      </span>
    </div>
  );
}

// ─── Attendance Radio Option ──────────────────────────────────────────────────

const ATTENDANCE_STYLES = {
  حاضر: {
    selected: "bg-emerald-50 border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.15)] text-emerald-800",
    ring: "border-emerald-500",
    dot: "bg-emerald-500",
  },
  غائب: {
    selected: "bg-red-50 border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.15)] text-red-800",
    ring: "border-red-500",
    dot: "bg-red-500",
  },
};

function AttendanceOption({ value, current, onChange }) {
  const isSelected = current === value;
  const styles = ATTENDANCE_STYLES[value];

  return (
    <label
      className={[
        "flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl border",
        "px-4 py-3.5 text-sm font-bold transition-all",
        isSelected
          ? styles.selected
          : "border-emerald-200/80 bg-white/70 hover:bg-white text-slate-600 hover:text-emerald-950",
      ].join(" ")}
    >
      <input
        type="radio"
        name="attendance"
        value={value}
        checked={isSelected}
        onChange={onChange}
        className="sr-only"
      />
      <span
        className={[
          "flex h-4 w-4 shrink-0 items-center justify-center rounded-full border bg-white",
          isSelected ? styles.ring : "border-slate-300",
        ].join(" ")}
      >
        {isSelected && (
          <span className={`h-2 w-2 shrink-0 rounded-full ${styles.dot}`} />
        )}
      </span>
      {value}
    </label>
  );
}

// ─── Session Form ─────────────────────────────────────────────────────────────

function SessionForm({ formData, errors, isSubmitting, onChange, onSubmit }) {
  const border = (key) => (errors[key] ? BORDER_ERR : BORDER_OK);
  const isAbsent = formData.attendance === "غائب";

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-6">
      {/* ── Student ── */}
      <div className="space-y-1.5">
        <label htmlFor="student" className="block text-sm font-bold text-emerald-950">
          اختر الطالب <span className="text-red-500">*</span>
        </label>
        <SelectWrapper>
          <select
            id="student"
            name="student"
            value={formData.student}
            onChange={onChange}
            className={`${INPUT_BASE} ${border("student")} appearance-none`}
          >
            <option value="" disabled hidden className="text-slate-400">
              -- اختر من القائمة --
            </option>
            {STUDENTS.map((s) => (
              <option key={s} value={s} className="bg-white text-emerald-950">
                {s}
              </option>
            ))}
          </select>
        </SelectWrapper>
        <FieldError message={errors.student} />
      </div>

      {/* ── Date + Attendance ── */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label htmlFor="date" className="block text-sm font-bold text-emerald-950">
            تاريخ الحصة <span className="text-red-500">*</span>
          </label>
          <input
            id="date"
            type="date"
            name="date"
            value={formData.date}
            onChange={onChange}
            className={`${INPUT_BASE} ${border("date")}`}
          />
          <FieldError message={errors.date} />
        </div>

        <div className="space-y-1.5">
          <p className="text-sm font-bold text-emerald-950">
            حالة الحضور <span className="text-red-500">*</span>
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <AttendanceOption value="حاضر" current={formData.attendance} onChange={onChange} />
            <AttendanceOption value="غائب" current={formData.attendance} onChange={onChange} />
          </div>
          <FieldError message={errors.attendance} />
        </div>
      </div>

      {/* ── Minutes ── */}
      <div className="space-y-1.5">
        <label htmlFor="minutes" className="block text-sm font-bold text-emerald-950">
          وقت الحصة{" "}
          {!isAbsent && <span className="text-red-500">*</span>}
        </label>
        <SelectWrapper>
          <select
            id="minutes"
            name="minutes"
            value={formData.minutes}
            onChange={onChange}
            disabled={isAbsent}
            className={[
              INPUT_BASE,
              border("minutes"),
              "appearance-none",
              isAbsent ? "cursor-not-allowed opacity-60 bg-slate-50 border-slate-200 text-slate-500" : "",
            ].join(" ")}
          >
            <option value="" disabled hidden className="text-slate-400">
              -- اختر وقت الحصة --
            </option>
            <option value="15" className="bg-white text-emerald-950">15 دقيقة (ربع ساعة)</option>
            <option value="30" className="bg-white text-emerald-950">30 دقيقة (نصف ساعة)</option>
            <option value="45" className="bg-white text-emerald-950">45 دقيقة (ساعة إلا ربع)</option>
            <option value="60" className="bg-white text-emerald-950">60 دقيقة (ساعة)</option>
            <option value="75" className="bg-white text-emerald-950">75 دقيقة (ساعة وربع)</option>
            <option value="90" className="bg-white text-emerald-950">90 دقيقة (ساعة ونصف)</option>
            <option value="105" className="bg-white text-emerald-950">105 دقائق (ساعة وثلاثة أرباع)</option>
            <option value="120" className="bg-white text-emerald-950">120 دقيقة (ساعتان)</option>
          </select>
        </SelectWrapper>
        <FieldError message={errors.minutes} />
      </div>

      {/* ── Topic ── */}
      <div className="space-y-1.5">
        <label htmlFor="topic" className="block text-sm font-bold text-emerald-950">
          موضوع الحصة <span className="text-red-500">*</span>
        </label>
        <input
          id="topic"
          type="text"
          name="topic"
          value={formData.topic}
          onChange={onChange}
          placeholder="مثال : مراجعة مادة الرياضيات أو شرح الوحدة الأولى في العلوم"
          className={`${INPUT_BASE} ${border("topic")}`}
        />
        <FieldError message={errors.topic} />
      </div>

      {/* ── Rating ── */}
      <div className="space-y-1.5">
        <label htmlFor="rating" className="block text-sm font-bold text-emerald-950">
          تقييم الطالب من 10 <span className="text-red-500">*</span>
        </label>
        <SelectWrapper>
          <select
            id="rating"
            name="rating"
            value={formData.rating}
            onChange={onChange}
            disabled={isAbsent}
            className={[
              INPUT_BASE,
              border("rating"),
              "appearance-none",
              isAbsent ? "cursor-not-allowed opacity-60 bg-slate-50 border-slate-200 text-slate-500" : "",
            ].join(" ")}
          >
            <option value="" disabled hidden className="text-slate-400">
              -- اختر التقييم --
            </option>
            {Array.from({ length: 10 }, (_, i) => i + 1).map((num) => (
              <option key={num} value={num} className="bg-white text-emerald-950">
                {num} / 10
              </option>
            ))}
          </select>
        </SelectWrapper>
        <FieldError message={errors.rating} />
      </div>

      {/* ── Notes ── */}
      <div className="space-y-1.5">
        <label htmlFor="notes" className="block text-sm font-bold text-emerald-950">
          ملاحظات الطالب
        </label>
        <textarea
          id="notes"
          name="notes"
          value={formData.notes}
          onChange={onChange}
          rows="3"
          placeholder="أضف أي ملاحظات إضافية هنا..."
          className={`${INPUT_BASE} ${border("notes")} resize-y`}
        />
        <FieldError message={errors.notes} />
      </div>

      {/* ── Submit ── */}
      <div className="border-t border-emerald-100 pt-6">
        <button
          type="submit"
          disabled={isSubmitting}
          className="glow-button flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-l from-emerald-500 to-emerald-600 px-7 py-4 text-sm font-bold text-white shadow-[0_4px_14px_rgba(16,185,129,0.3)] transition-all hover:scale-[1.01] hover:from-emerald-400 hover:to-emerald-500 hover:shadow-[0_6px_20px_rgba(16,185,129,0.4)] disabled:cursor-wait disabled:opacity-70 disabled:hover:scale-100"
        >
          {isSubmitting ? (
            <>
              <svg
                aria-hidden="true"
                className="h-5 w-5 animate-spin"
                fill="none"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              جاري الحفظ...
            </>
          ) : (
            "حفظ التسجيل"
          )}
        </button>
      </div>
    </form>
  );
}

// ─── Success State ────────────────────────────────────────────────────────────

function SuccessMessage({ onReset }) {
  return (
    <div className="py-12 text-center">
      <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full border border-emerald-200 bg-emerald-50 text-emerald-600 shadow-inner">
        <svg className="h-10 w-10" viewBox="0 0 24 24" fill="none" strokeWidth={2.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
        </svg>
      </div>
      <h2 className="mb-3 text-2xl font-bold text-emerald-950">تم تسجيل الحصة بنجاح!</h2>
      <p className="mb-8 text-slate-600">
        تم حفظ بيانات الحضور وتفاصيل الحصة بنجاح في سجل الطالب.
      </p>
      <button
        onClick={onReset}
        className="inline-flex items-center justify-center rounded-xl border border-emerald-200 bg-white px-7 py-3 text-sm font-bold text-emerald-700 shadow-sm transition-colors hover:bg-emerald-50 hover:border-emerald-300"
      >
        تسجيل حصة أخرى
      </button>
    </div>
  );
}

// ─── Navbar ───────────────────────────────────────────────────────────────────

function Navbar() {
  return (
    <nav className="fixed right-0 left-0 top-0 z-50">
      <div className="nav-surface shadow-[0_12px_36px_-16px_rgba(4,16,31,0.85)]">
        <div className="site-container">
          <div className="flex min-h-[4.5rem] items-center justify-between gap-4">
            {/* Brand */}
            <Link href="/" className="flex min-w-0 items-center gap-2.5 sm:gap-3">
              <div className="icon-ring flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 text-xl font-bold text-white shadow-lg shadow-emerald-500/30 sm:h-12 sm:w-12">
                م
              </div>
              <div className="flex min-w-0 flex-col">
                <span className="truncate whitespace-nowrap text-base font-bold text-white sm:text-lg">
                  مشاعل المعرفة
                </span>
                <span className="hidden text-xs text-emerald-200/80 sm:block">
                  منصة تعليمية متكاملة
                </span>
              </div>
            </Link>

            {/* Nav Links — large screens only */}
            <nav aria-label="التنقل الرئيسي" className="hidden items-center gap-2 lg:flex xl:gap-3">
              {NAV_LINKS.map((item) => (
                <Link key={item.href} href={item.href} className="nav-link-pill">
                  {item.label}
                </Link>
              ))}
            </nav>

            {/* Home CTA */}
            <Link
              href="/"
              className="glow-button inline-flex items-center justify-center gap-1.5 rounded-lg bg-gradient-to-l from-emerald-500 to-emerald-600 px-4 py-2.5 text-xs font-bold text-white transition-all hover:-translate-y-0.5 hover:from-emerald-400 hover:to-emerald-500 sm:gap-2 sm:px-5 sm:py-3 sm:text-sm"
            >
              <svg aria-hidden="true" className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
              <span className="hidden sm:inline">العودة إلى الصفحة الرئيسية</span>
              <span className="sm:hidden">الرئيسية</span>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}

// ─── FooterSection ─────────────────────────────────────────────────────────────

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

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function EgyptGulfCurriculaPage() {
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Stable references — won't trigger child re-renders on each parent render
  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prev) =>
      name === "attendance" && value === "غائب"
        ? { ...prev, attendance: value, minutes: "", rating: "" }
        : { ...prev, [name]: value }
    );
    setErrors((prev) => (prev[name] ? { ...prev, [name]: "" } : prev));
  }, []);

  const validate = useCallback(() => {
    const errs = {};
    if (!formData.student) errs.student = "الرجاء اختيار الطالب";
    if (!formData.date) errs.date = "الرجاء تحديد تاريخ الحصة";
    if (!formData.attendance) errs.attendance = "الرجاء تحديد حالة الحضور";
    if (!formData.topic) errs.topic = "الرجاء اختيار موضوع الحصة";
    if (formData.attendance === "حاضر") {
      if (!formData.minutes) errs.minutes = "الرجاء تحديد وقت الحصة";
      if (!formData.rating) errs.rating = "الرجاء اختيار تقييم الطالب";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }, [formData]);

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      if (!validate()) return;
      setIsSubmitting(true);
      // Simulated network request
      setTimeout(() => {
        setIsSubmitting(false);
        setIsSuccess(true);
        setFormData(EMPTY_FORM);
      }, 1500);
    },
    [validate]
  );

  const handleReset = useCallback(() => {
    setIsSuccess(false);
    setErrors({});
  }, []);

  return (
    <main
      dir="rtl"
      className="relative flex min-h-[100dvh] flex-col overflow-x-clip text-emerald-950 font-sans"
    >
      {/* Light Gradient Background matching the Identity/Audience Sections */}
      <div className="fixed inset-0 z-[-1] bg-gradient-to-b from-[#f8fbfb] via-[#f2f8f8] to-[#eef5f5]">
        {/* Decorative subtle blurs for depth */}
        <div className="absolute top-0 right-0 h-[500px] w-[500px] -translate-x-1/4 -translate-y-1/4 rounded-full bg-emerald-100/60 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 h-[600px] w-[600px] translate-x-1/3 translate-y-1/4 rounded-full bg-emerald-50/80 blur-3xl pointer-events-none" />
      </div>

      <Navbar />

      {/* ── Main Content ── */}
      <section className="relative z-10 flex flex-1 flex-col justify-center px-4 pt-28 pb-16 sm:px-6 sm:pt-32 sm:pb-24">
        <div className="mx-auto w-full max-w-3xl">
          {/* Page Header */}
          <header className="mb-10 text-center">
            <span className="mb-4 inline-block rounded-full bg-emerald-100 px-5 py-2 text-sm font-bold text-emerald-700 shadow-sm border border-emerald-200/50">
              بوابة المعلمين
            </span>
            <h1 className="mb-4 text-3xl font-black leading-snug text-emerald-950 sm:text-4xl text-balance">
              تسجيل حضور ومتابعة طالب
            </h1>
            <p className="mx-auto max-w-xl text-base text-slate-600 sm:text-lg text-balance">
              يرجى تعبئة بيانات الحصة وتفاصيل حضور الطالب بدقة لمتابعة تقدمه في النظام.
            </p>
          </header>

          {/* Form Card (Modern Light Theme) */}
          <div className="modern-card relative overflow-hidden rounded-[2rem] p-6 shadow-2xl shadow-emerald-900/5 sm:p-10 border border-white/60">
            {isSuccess ? (
              <SuccessMessage onReset={handleReset} />
            ) : (
              <SessionForm
                formData={formData}
                errors={errors}
                isSubmitting={isSubmitting}
                onChange={handleChange}
                onSubmit={handleSubmit}
              />
            )}
          </div>
        </div>
      </section>

      <div className="mt-auto w-full relative z-20">
        <FooterSection />
      </div>
    </main>
  );
}

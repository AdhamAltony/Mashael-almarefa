"use client";

import Link from "next/link";
import { useState, useCallback } from "react";

// ─── Static Data (module-level, never re-created) ─────────────────────────────

const COURSES = [
  "النحو: تأسيس وتوظيف",
  "الصرف",
  "العَروض",
  "البلاغة",
  "إعداد معلم اللغة العربية للناطقين بغيرها",
];


const EMPTY_FORM = {
  course: "",
  date: "",
  video: null,
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

// ─── Session Form ─────────────────────────────────────────────────────────────

function CourseForm({ formData, errors, isSubmitting, onChange, onSubmit }) {
  const border = (key) => (errors[key] ? BORDER_ERR : BORDER_OK);

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-6">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        {/* ── Course ── */}
        <div className="space-y-1.5">
          <label htmlFor="course" className="block text-sm font-bold text-emerald-950">
            اختر الدورة <span className="text-red-500">*</span>
          </label>
          <SelectWrapper>
            <select
              id="course"
              name="course"
              value={formData.course}
              onChange={onChange}
              className={`${INPUT_BASE} ${border("course")} appearance-none`}
            >
              <option value="" disabled hidden className="text-slate-400">
                -- اختر من القائمة --
              </option>
              {COURSES.map((c) => (
                <option key={c} value={c} className="bg-white text-emerald-950">
                  {c}
                </option>
              ))}
            </select>
          </SelectWrapper>
          <FieldError message={errors.course} />
        </div>

        {/* ── Date ── */}
        <div className="space-y-1.5">
          <label htmlFor="date" className="block text-sm font-bold text-emerald-950">
            تاريخ الإضافة <span className="text-red-500">*</span>
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
      </div>

      {/* ── Video Upload ── */}
      <div className="space-y-1.5">
        <label className="block text-sm font-bold text-emerald-950">
          رفع فيديو الدورة <span className="text-red-500">*</span>
        </label>
        <div
          className={`relative flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-8 transition-all ${errors.video
            ? "border-red-400 bg-red-50/50"
            : "border-emerald-200/80 bg-white/60 hover:border-emerald-400 hover:bg-emerald-50/50"
            }`}
        >
          {formData.video ? (
            <div className="flex flex-col items-center text-center">
              <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z" />
                </svg>
              </div>
              <p className="text-sm font-bold text-emerald-900">{formData.video.name}</p>
              <p className="mt-1 text-xs font-medium text-emerald-700">
                {(formData.video.size / (1024 * 1024)).toFixed(2)} MB
              </p>
            </div>
          ) : (
            <>
              <svg
                className="h-10 w-10 text-emerald-500/80"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z"
                />
              </svg>
              <div className="text-center">
                <p className="text-sm font-bold text-emerald-950">
                  اضغط لاختيار فيديو الدورة
                </p>
                <p className="mt-1.5 text-xs text-slate-500">
                  أو قم بسحب وإسقاط الملف هنا (الصيغ المدعومة: MP4, WebM)
                </p>
              </div>
            </>
          )}
          <input
            type="file"
            name="video"
            accept="video/mp4,video/webm"
            onChange={onChange}
            className="absolute inset-0 h-full w-full cursor-pointer opacity-0 outline-none"
          />
        </div>
        <FieldError message={errors.video} />
      </div>

      {/* ── Notes ── */}
      <div className="space-y-1.5">
        <label htmlFor="notes" className="block text-sm font-bold text-emerald-950">
          ملاحظات الدورة / وصف الفيديو
        </label>
        <textarea
          id="notes"
          name="notes"
          value={formData.notes}
          onChange={onChange}
          rows="4"
          placeholder="أضف وصفاً للفيديو أو أي ملاحظات هامة للمتدربين..."
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
              جاري الرفع...
            </>
          ) : (
            "رفع الفيديو والملاحظات"
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
      <h2 className="mb-3 text-2xl font-bold text-emerald-950">تم رفع الدورة بنجاح!</h2>
      <p className="mb-8 text-slate-600">
        تم رفع فيديو الدورة وحفظ الملاحظات بنجاح في النظام.
      </p>
      <button
        onClick={onReset}
        className="inline-flex items-center justify-center rounded-xl border border-emerald-200 bg-white px-7 py-3 text-sm font-bold text-emerald-700 shadow-sm transition-colors hover:bg-emerald-50 hover:border-emerald-300"
      >
        إضافة فيديو آخر
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

export default function CoursesCenterPage() {
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Stable references — won't trigger child re-renders on each parent render
  const handleChange = useCallback((e) => {
    const { name, value, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
    setErrors((prev) => (prev[name] ? { ...prev, [name]: "" } : prev));
  }, []);

  const validate = useCallback(() => {
    const errs = {};
    if (!formData.course) errs.course = "الرجاء اختيار الدورة";
    if (!formData.date) errs.date = "الرجاء تحديد تاريخ الإضافة";
    if (!formData.video) errs.video = "الرجاء رفع فيديو الدورة";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }, [formData]);

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      if (!validate()) return;
      setIsSubmitting(true);
      // Simulated network request (uploading file)
      setTimeout(() => {
        setIsSubmitting(false);
        setIsSuccess(true);
        setFormData(EMPTY_FORM);
      }, 2500); // slightly longer to simulate upload
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
              مركز الدورات
            </span>
            <h1 className="mb-4 text-3xl font-black leading-snug text-emerald-950 sm:text-4xl text-balance">
              رفع الفيديوهات والملاحظات
            </h1>
            <p className="mx-auto max-w-xl text-base text-slate-600 sm:text-lg text-balance">
              يرجى اختيار الدورة ورفع الفيديو الخاص بها مع إضافة أي ملاحظات توضيحية.
            </p>
          </header>

          {/* Form Card (Modern Light Theme) */}
          <div className="modern-card relative overflow-hidden rounded-[2rem] p-6 shadow-2xl shadow-emerald-900/5 sm:p-10 border border-white/60">
            {isSuccess ? (
              <SuccessMessage onReset={handleReset} />
            ) : (
              <CourseForm
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

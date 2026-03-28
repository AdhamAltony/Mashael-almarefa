import Link from "next/link";

export default function Footer() {
    return (
        <footer id="contact" className="relative overflow-hidden bg-[#041722] text-emerald-50">
            <div className="site-container py-12">
                <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                    <div>
                        <h3 className="mb-3 text-2xl font-bold">مشاعل المعرفة</h3>
                        <p className="max-w-xl text-sm leading-relaxed text-emerald-100/85 text-balance">
                            بيئة تربوية متكاملة تزرع العلم والإيمان معًا، وتجمع بين تعليم القرآن واللغة العربية والمناهج الدراسية.
                        </p>
                    </div>
                    <div className="flex flex-col items-center md:items-end">
                        <h4 className="mb-6 text-xl font-bold text-white">تواصل معنا</h4>

                        <div className="flex flex-col gap-5 w-full md:items-end">
                            {/* Email */}
                            <div className="flex items-center gap-4 text-emerald-100/85 md:flex-row-reverse group cursor-default">
                                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/5 text-emerald-400 ring-1 ring-white/10 group-hover:bg-emerald-500/10 group-hover:ring-emerald-500/30 transition-all duration-300">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                </div>
                                <div className="flex flex-col md:items-end text-center md:text-right">
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500/50 mb-0.5">البريد الإلكتروني</span>
                                    <span className="text-sm font-medium tracking-wide">mashaeilalmaerifa@gmail.com</span>
                                </div>
                            </div>

                            {/* WhatsApp */}
                            <a
                                href="https://wa.me/201210212176"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-4 text-emerald-100/85 hover:text-white transition-all group md:flex-row-reverse"
                            >
                                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/5 text-emerald-500 ring-1 ring-white/10 group-hover:bg-emerald-500/20 group-hover:ring-emerald-500/50 transition-all duration-300 shadow-[0_0_20px_rgba(16,185,129,0)] group-hover:shadow-[0_0_20px_rgba(16,185,129,0.15)]">
                                    <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 448 512">
                                        <path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-5.5-2.8-23.2-8.5-44.2-27.3-16.3-14.5-27.4-32.5-30.6-37.9-3.2-5.6-.4-8.6 2.4-11.3 2.5-2.5 5.5-6.5 8.3-9.7 2.8-3.3 3.7-5.5 5.5-9.3.5-3.6-.4-6.5-1.4-8.4-1-1.8-8.8-21.3-12-29-3.1-7.5-6.2-6.5-8.5-6.6-2.1-.1-4.6-.1-7-.1-2.4 0-6.2.9-9.5 4.4-3.2 3.5-12.5 12.2-12.5 29.7 0 17.5 12.7 34.4 14.5 36.6 1.8 2.2 25.1 38.2 60.8 53.6 8.5 3.7 15.1 5.9 20.3 7.5 8.6 2.7 16.4 2.3 22.5 1.4 6.8-.9 20.9-8.5 23.9-16.7 2.9-8.3 2.9-15.4 2.1-16.7-1-1.3-3.1-2.1-8.6-4.9z" />
                                    </svg>
                                </div>
                                <div className="flex flex-col md:items-end text-center md:text-right">
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500 mb-0.5">WhatsApp Support</span>
                                    <span dir="ltr" className="text-sm font-bold tracking-wider">+20 121 021 2176</span>
                                </div>
                            </a>

                            {/* Social Icons Bar */}
                            <div className="flex gap-4 pt-2 md:justify-end">
                                <a
                                    href="https://www.facebook.com/share/1GxJjPhQcE/"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="h-12 w-12 flex items-center justify-center rounded-2xl bg-white/5 text-white ring-1 ring-white/10 hover:bg-[#1877F2] hover:ring-[#1877F2]/50 hover:-translate-y-1 transition-all duration-300 shadow-lg shadow-black/20"
                                    title="فيسبوك"
                                >
                                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 512 512">
                                        <path d="M504 256C504 119 395 8 256 8S8 119 8 256c0 123.78 90.69 226.38 209.25 245V327.69h-63V256h63v-54.64c0-62.15 37-96.48 93.67-96.48 27.14 0 55.52 4.84 55.52 4.84v61h-31.28c-30.8 0-40.42 19.12-40.42 38.73V256h68.78l-11 71.69h-57.78V501.69C413.31 482.38 504 379.78 504 256z" />
                                    </svg>
                                </a>
                                <a
                                    href="https://www.snapchat.com/add/mshllmrf26?share_id=xWhWsWwyOWs&locale=ar-EG"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="h-12 w-12 flex items-center justify-center rounded-2xl bg-white/5 text-white ring-1 ring-white/10 hover:bg-[#FFFC00] hover:text-black hover:ring-[#FFFC00]/50 hover:-translate-y-1 transition-all duration-300 shadow-lg shadow-black/20"
                                    title="سناب شات"
                                >
                                    <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 512 512">
                                        <path d="M256 0c-45.7 0-93 21-118.2 56.6-4.5 6.4-1.7 15.2 6.1 17.5 13.5 4 28.5 7.8 44.5 7.8 11.4 0 22.2-2.3 32-6.5 6.4-2.7 15-2.7 21.4 0 9.8 4.2 20.6 6.5 32 6.5 16 0 31-3.8 44.5-7.8 7.8-2.3 10.6-11.1 6.1-17.5C349 21 301.7 0 256 0zM256 112c-79.5 0-144 57.3-144 128 0 27.5 9.8 52.8 26.5 73.6-1.5 2.8-2.5 6-2.5 9.4 0 10.6 8.6 19.2 19.2 19.2h201.6c10.6 0 19.2-8.6 19.2-19.2 0-3.4-1-6.6-2.5-9.4 16.7-20.8 26.5-46.1 26.5-73.6 0-70.7-64.5-128-144-128z" />
                                        <path d="M480 344c-11.5 0-21.7 6.4-27 15.8-6.1-34.9-36.6-61.8-73.6-61.8-40.8 0-74 33.2-74 74 0 1.2 0 2.4.1 3.5-31.4-17.3-71.7-27.5-115.5-27.5s-84.1 10.2-115.5 27.5c.1-1.1.1-2.3.1-3.5 0-40.8-33.2-74-74-74-37 0-67.5 26.9-73.6 61.8-5.3-9.4-15.5-15.8-27-15.8-17.7 0-32 14.3-32 32 0 11.9 6.5 22.3 16.1 28-2.6 1.8-5.2 3.8-7.7 6-8.7 7.7-14.4 18.2-14.4 30 0 16.6 11.3 30.6 26.6 34.2l5.7 4.1C16.8 488.7 87.5 512 173.2 512c19.4 0 37.9-1.2 55.4-3.5l1.4 5.9c2.7 11.4 12.9 19.6 24.6 19.6s21.9-8.2 24.6-19.6l1.4-5.9c17.5 2.3 36 3.5 55.4 3.5 85.7 0 156.4-23.3 166.4-53.7l5.7-4.1c15.3-3.6 26.6-17.6 26.6-34.2 0-11.8-5.7-22.3-14.4-30-2.5-2.2-5.1-4.2-7.7-6 9.6-5.7 16.1-16.1 16.1-28 0-17.7-14.3-32-32-32z" />
                                    </svg>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="mt-10 border-t border-emerald-200/15 pt-6 text-center text-sm text-emerald-100/70">
                    © {new Date().getFullYear()} مشاعل المعرفة. جميع الحقوق محفوظة.
                </div>
            </div>
        </footer>
    );
}

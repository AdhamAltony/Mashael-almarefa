"use client";

import { useState, useEffect } from "react";

const INITIAL_TEACHERS = [
  {
    id: 1,
    name: "أحمد عبد الله",
    department: "ركن القرآن الكريم",
    completedSessions: 45,
    ratePerSession: 50,
    amountReceived: 0,
    status: "نشط",
  },
  {
    id: 2,
    name: "فاطمة محمد",
    department: "العربية لغير الناطقين",
    completedSessions: 32,
    ratePerSession: 60,
    amountReceived: 0,
    status: "نشط",
  },
  {
    id: 3,
    name: "محمود حسن",
    department: "المناهج الدراسية",
    completedSessions: 28,
    ratePerSession: 40,
    amountReceived: 0,
    status: "إجازة",
  },
];

export default function AdminTeacherSessionsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [teachers, setTeachers] = useState([]);
  const [mounted, setMounted] = useState(false);
  const [historyModal, setHistoryModal] = useState(null);

  useEffect(() => {
    setMounted(true);
    // Fetch real teachers from app_users
    const allUsers = JSON.parse(localStorage.getItem("app_users") || "[]");
    const realTeachers = allUsers.filter(u => u.role === "teacher");

    // Load financial settings (rate and amount received)
    const savedFinancials = JSON.parse(localStorage.getItem("admin_teachers_financials") || "{}");

    const teachersData = realTeachers.map(u => {
      const profile = JSON.parse(localStorage.getItem(`teacher_profile_${u.email}`) || "{}");
      const sessions = parseInt(localStorage.getItem(`teacher_done_${u.email}`) || "0");
      const financial = savedFinancials[u.email] || { rate: 50, received: 0 };

      return {
        id: u.id,
        email: u.email,
        name: u.name,
        department: u.course || u.department || "عام",
        completedSessions: sessions,
        ratePerSession: financial.rate,
        amountReceived: financial.received,
        image: profile.image || "",
        status: profile.status || "نشط",
      };
    });

    setTeachers(teachersData);
  }, []);

  const handleUpdate = (email, field, value) => {
    const numValue = parseFloat(value) || 0;

    // Update state
    setTeachers(prev => prev.map(t =>
      t.email === email ? { ...t, [field === "rate" ? "ratePerSession" : "amountReceived"]: numValue } : t
    ));

    // Persist to localStorage
    const savedFinancials = JSON.parse(localStorage.getItem("admin_teachers_financials") || "{}");
    if (!savedFinancials[email]) savedFinancials[email] = { rate: 50, received: 0 };

    if (field === "rate") savedFinancials[email].rate = numValue;
    if (field === "received") savedFinancials[email].received = numValue;

    localStorage.setItem("admin_teachers_financials", JSON.stringify(savedFinancials));
  };

  const filteredTeachers = teachers.filter((t) =>
    t.name.includes(searchTerm) || t.department?.includes(searchTerm)
  );

  if (!mounted) return null;

  return (
    <main className="site-container py-10" dir="rtl">
      <section className="modern-card mb-8 rounded-3xl border border-white/70 p-6 shadow-xl shadow-emerald-900/5 sm:p-8">
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <p className="inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
              تقارير المعلمين
            </p>
            <h1 className="mt-3 text-2xl font-black text-emerald-950 sm:text-3xl">حسابات وحصص المعلمين</h1>
            <p className="mt-2 text-sm text-slate-600">
              متابعة جميع الحصص والمبالغ المستحقة لكل معلم بتفاصيل كاملة.
            </p>
          </div>
          <div className="w-full sm:w-auto">
            <input
              type="text"
              placeholder="ابحث عن معلم أو قسم..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-xl border border-emerald-200 bg-white/80 px-4 py-3 text-sm text-emerald-950 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 sm:w-80"
            />
          </div>
        </div>
      </section>

      <div className="overflow-hidden rounded-3xl border border-emerald-100 bg-white shadow-lg shadow-emerald-900/5">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-sm text-slate-600">
            <thead className="bg-emerald-50/80 text-emerald-900">
              <tr>
                <th className="whitespace-nowrap px-6 py-4 font-bold">اسم المعلم</th>
                <th className="whitespace-nowrap px-6 py-4 font-bold">القسم</th>
                <th className="whitespace-nowrap px-6 py-4 font-bold">الحصص المكتملة</th>
                <th className="whitespace-nowrap px-6 py-4 font-bold">سعر الحصة</th>
                <th className="whitespace-nowrap px-6 py-4 font-bold text-center">المبلغ المستلم</th>
                <th className="whitespace-nowrap px-6 py-4 font-bold text-center">المبلغ المستحق</th>
                <th className="whitespace-nowrap px-6 py-4 font-bold text-center">التفاصيل</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-emerald-50">
              {filteredTeachers.map((teacher) => {
                const totalEarned = teacher.completedSessions * teacher.ratePerSession;
                const outstandingBalance = totalEarned - teacher.amountReceived;

                return (
                  <tr key={teacher.email} className="transition-colors hover:bg-emerald-50/30">
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-emerald-100 border border-emerald-200">
                          {teacher.image ? (
                            <img src={teacher.image} alt={teacher.name} className="h-full w-full object-cover" />
                          ) : (
                            <span className="font-bold text-emerald-700">{teacher.name.charAt(0)}</span>
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-emerald-950">{teacher.name}</p>
                          <span className={`mt-0.5 inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold ${teacher.status === 'نشط' || teacher.status === 'متاح' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                            {teacher.status}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 font-medium text-slate-700">
                      {teacher.department}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-700">
                          {teacher.completedSessions}
                        </span>
                        حصة
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          value={teacher.ratePerSession}
                          onChange={(e) => handleUpdate(teacher.email, 'rate', e.target.value)}
                          className="w-20 rounded-lg border border-emerald-100 px-2 py-1 text-center font-bold text-emerald-700 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                        />
                        <span className="text-[10px] font-bold text-slate-400">ج.م</span>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <input
                          type="number"
                          value={teacher.amountReceived}
                          onChange={(e) => handleUpdate(teacher.email, 'received', e.target.value)}
                          className="w-24 rounded-lg border border-emerald-100 px-2 py-1 text-center font-bold text-slate-700 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                          placeholder="0"
                        />
                        <span className="text-[10px] font-bold text-slate-400">ج.م</span>
                      </div>
                      {outstandingBalance <= 0 && totalEarned > 0 && (
                        <span className="block mt-1 text-[10px] font-bold text-green-600">تم السداد بالكامل ✅</span>
                      )}
                      {outstandingBalance > 0 && teacher.amountReceived > 0 && (
                        <span className="block mt-1 text-[10px] font-bold text-amber-600">سداد جزئي ⏳</span>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="flex flex-col">
                        <span className={`font-bold ${outstandingBalance > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                          {outstandingBalance} ج.م
                        </span>
                        <span className="text-[10px] text-slate-400">الإجمالي: {totalEarned}</span>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-center">
                      <button
                        onClick={() => {
                          const history = JSON.parse(localStorage.getItem(`teacher_history_${teacher.email}`) || "[]");
                          setHistoryModal({ name: teacher.name, email: teacher.email, logs: history });
                        }}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-slate-50 px-4 py-2 hover:bg-emerald-500 transition-all text-xs font-bold text-slate-400 hover:text-white"
                      >
                        سجل الحصص
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filteredTeachers.length === 0 && (
            <div className="p-8 text-center text-slate-500">
              لا توجد نتائج مطابقة للبحث.
            </div>
          )}
        </div>
      </div>

      {/* History Modal (Sheet View) */}
      {historyModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-emerald-950/40 p-4 backdrop-blur-sm animate-in fade-in">
          <div className="modern-card max-h-[90vh] w-full max-w-4xl overflow-hidden rounded-[2.5rem] border border-white bg-white shadow-2xl flex flex-col animate-in zoom-in-95">
            {/* Modal Header */}
            <div className="bg-emerald-600 p-6 text-white flex justify-between items-center sm:p-8">
              <div>
                <h2 className="text-xl font-black sm:text-2xl">سجل الحصص التفصيلي</h2>
                <p className="mt-1 text-xs font-bold text-emerald-100 opacity-80">المعلم: {historyModal.name} | {historyModal.email}</p>
              </div>
              <button
                onClick={() => setHistoryModal(null)}
                className="h-10 w-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors"
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-6 sm:p-8">
              {historyModal.logs.length === 0 ? (
                <div className="py-20 text-center text-slate-400">
                  <div className="text-5xl mb-4 opacity-10">🗓️</div>
                  <p className="font-bold">لا يوجد سجل حصص مسجل لهذا المعلم حتى الآن.</p>
                </div>
              ) : (
                <div className="overflow-hidden rounded-2xl border border-emerald-50">
                  <table className="w-full text-right text-xs sm:text-sm">
                    <thead className="bg-emerald-50 font-bold text-emerald-900 border-b border-emerald-100">
                      <tr>
                        <th className="px-5 py-4">اسم الطالب</th>
                        <th className="px-5 py-4">التاريخ</th>
                        <th className="px-5 py-4">المدة</th>
                        <th className="px-5 py-4">الموضوع</th>
                        <th className="px-5 py-4 text-center">التقييم</th>
                        <th className="px-5 py-4">التفاصيل</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-emerald-50">
                      {[...historyModal.logs].reverse().map((log, idx) => (
                        <tr key={idx} className="hover:bg-emerald-50/20 transition-colors">
                          <td className="px-5 py-4 font-bold text-emerald-950">{log.studentName}</td>
                          <td className="px-5 py-4 text-slate-500">{log.date}</td>
                          <td className="px-5 py-4 font-medium text-slate-700">{log.duration}</td>
                          <td className="px-5 py-4 text-slate-600">{log.topic}</td>
                          <td className="px-5 py-4 text-center">
                            <span className="inline-flex items-center rounded-full bg-amber-50 px-2.5 py-1 text-[10px] font-black text-amber-600 border border-amber-100 italic">
                              ⭐ {log.rating}
                            </span>
                          </td>
                          <td className="px-5 py-4 max-w-[200px] truncate text-slate-400 italic text-[11px]" title={log.notes}>
                            {log.notes || "لا توجد ملاحظات"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="border-t border-emerald-50 bg-slate-50/50 p-6 flex justify-end">
              <button
                onClick={() => setHistoryModal(null)}
                className="rounded-xl bg-white border border-slate-200 px-8 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all shadow-sm"
              >
                إغلاق السجل
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

"use client";

import { useState, useEffect } from "react";
import * as db from "@/utils/db";

export default function AdminTeacherSessionsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [teachers, setTeachers] = useState([]);
  const [mounted, setMounted] = useState(false);
  const [historyModal, setHistoryModal] = useState(null);

  const loadTeacherData = async () => {
    // 1. Fetch real teachers from global DB
    const allUsers = await db.getLocalUsers();
    const realTeachers = allUsers.filter(u => u.role === "teacher");

    // 2. Load financial settings
    const savedFinancials = await db.getTeacherFinances();

    // 3. Map for the UI
    const teachersData = await Promise.all(realTeachers.map(async u => {
      const profile = await db.getProfile("teacher", u.email);
      const sessions = (await db.getAttendanceHistory(u.email)).length;
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
        status: profile.available || "نشط",
      };
    }));

    setTeachers(teachersData);
  };

  useEffect(() => {
    setMounted(true);
    loadTeacherData();
  }, []);

  const handleUpdate = async (email, field, value) => {
    const numValue = parseFloat(value) || 0;

    // Persist to DB API
    const savedFinancials = await db.getTeacherFinances();
    if (!savedFinancials[email]) savedFinancials[email] = { rate: 50, received: 0 };

    if (field === "rate") savedFinancials[email].rate = numValue;
    if (field === "received") savedFinancials[email].received = numValue;

    await db.updateTeacherFinances(email, savedFinancials[email]);
    
    // Refresh local state
    await loadTeacherData();
  };

  const filteredTeachers = teachers.filter((t) =>
    t.name.includes(searchTerm) || t.department?.includes(searchTerm)
  );

  const viewHistory = async (teacher) => {
    const history = await db.getAttendanceHistory(teacher.email);
    setHistoryModal({ teacher, history });
  };

  if (!mounted) return null;

  return (
    <main className="site-container py-10" dir="rtl">
      {/* Financial Overview Header */}
      <section className="modern-card mb-8 rounded-3xl border border-white/70 p-6 shadow-xl shadow-emerald-900/5 sm:p-8">
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <p className="inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
              قسم الحسابات والمالية
            </p>
            <h1 className="mt-2 text-2xl font-black text-emerald-950 sm:text-3xl">سجلات حصص المعلمين</h1>
          </div>
          <div className="flex w-full items-center gap-2 sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <input
                type="text"
                placeholder="بحث باسم المعلم أو القسم..."
                className="w-full rounded-2xl border border-slate-200 bg-white px-5 py-3 pr-12 text-sm font-bold shadow-inner outline-none focus:border-emerald-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {[
          { label: "إجمالي الحصص", value: teachers.reduce((acc, t) => acc + t.completedSessions, 0), icon: "📚" },
          { label: "المستحق الكلي", value: teachers.reduce((acc, t) => acc + (t.completedSessions * t.ratePerSession), 0) + " ج.م", icon: "💰" },
          { label: "إجمالي المدفوع", value: teachers.reduce((acc, t) => acc + t.amountReceived, 0) + " ج.م", icon: "💳" },
          { label: "باقي المستحقات", value: teachers.reduce((acc, t) => acc + (t.completedSessions * t.ratePerSession - t.amountReceived), 0) + " ج.م", icon: "⚖️" }
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100">
            <p className="text-xs font-black text-slate-500 mb-1">{stat.label}</p>
            <div className="flex items-center gap-3">
              <span className="text-xl">{stat.icon}</span>
              <p className="text-xl font-black text-emerald-950">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Teachers Table */}
      <div className="modern-card overflow-hidden rounded-[2.5rem] border border-white bg-white/50 shadow-2xl shadow-emerald-900/5 backdrop-blur-sm">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-right">
            <thead>
              <tr className="bg-emerald-950 text-white">
                <th className="px-6 py-5 text-sm font-black">المعلم</th>
                <th className="px-6 py-5 text-sm font-black text-center">الإجمالي (حصة)</th>
                <th className="px-6 py-5 text-sm font-black text-center">سعر الحصة</th>
                <th className="px-6 py-5 text-sm font-black text-center">إجمالي المستحق</th>
                <th className="px-6 py-5 text-sm font-black text-center">تم استلامه</th>
                <th className="px-6 py-5 text-sm font-black text-center">المتبقي</th>
                <th className="px-6 py-5 text-sm font-black text-center">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTeachers.map((teacher) => {
                const totalDebt = teacher.completedSessions * teacher.ratePerSession;
                const remaining = totalDebt - teacher.amountReceived;

                return (
                  <tr key={teacher.id} className="group transition-colors hover:bg-emerald-50/30">
                    <td className="px-6 py-6">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 shrink-0 overflow-hidden rounded-xl bg-slate-100 flex items-center justify-center text-lg font-bold text-slate-400">
                          {teacher.name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-black text-emerald-950">{teacher.name}</p>
                          <p className="text-[10px] font-bold text-slate-500">{teacher.department}</p>
                        </div>
                        {teacher.status === "إجازة" && (
                          <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[9px] font-black text-amber-700">إجازة</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-6 text-center text-sm font-black text-slate-700">
                      {teacher.completedSessions}
                    </td>
                    <td className="px-6 py-6 text-center">
                      <input
                        type="number"
                        className="w-20 rounded-lg border border-slate-200 bg-white p-2 text-center text-xs font-black outline-none focus:border-emerald-500"
                        value={teacher.ratePerSession}
                        onChange={(e) => handleUpdate(teacher.email, "rate", e.target.value)}
                      />
                    </td>
                    <td className="px-6 py-6 text-center text-sm font-black text-emerald-700">
                      {totalDebt} ج.م
                    </td>
                    <td className="px-6 py-6 text-center">
                      <input
                        type="number"
                        className="w-24 rounded-lg border border-slate-200 bg-white p-2 text-center text-xs font-black outline-none focus:border-emerald-500"
                        value={teacher.amountReceived}
                        onChange={(e) => handleUpdate(teacher.email, "received", e.target.value)}
                      />
                    </td>
                    <td className="px-6 py-6 text-center">
                      <span className={`rounded-xl px-3 py-1 text-xs font-black ${
                        remaining > 0 ? "bg-rose-100 text-rose-700" : "bg-emerald-100 text-emerald-700"
                      }`}>
                        {remaining} ج.م
                      </span>
                    </td>
                    <td className="px-6 py-6 text-center">
                      <button 
                        onClick={() => viewHistory(teacher)}
                        className="rounded-xl border border-emerald-600 px-4 py-2 text-[10px] font-black text-emerald-600 transition-colors hover:bg-emerald-600 hover:text-white"
                      >
                        سجل التفاصيل
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* History Modal */}
      {historyModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-[3rem] w-full max-w-4xl p-8 shadow-2xl max-h-[85vh] overflow-hidden flex flex-col">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-2xl font-black text-emerald-950">تفاصيل حصص المعلم</h2>
                <p className="text-sm font-bold text-slate-500">{historyModal.teacher.name} - {historyModal.teacher.department}</p>
              </div>
              <button 
                onClick={() => setHistoryModal(null)}
                className="h-10 w-10 flex items-center justify-center rounded-full hover:bg-slate-100 transition-colors"
              >✕</button>
            </div>
            
            <div className="overflow-y-auto flex-1 pr-2">
              <table className="w-full text-right">
                <thead className="sticky top-0 bg-white z-10 border-b-2 border-slate-100">
                  <tr>
                    <th className="py-4 text-xs font-black text-slate-400">التاريخ</th>
                    <th className="py-4 text-xs font-black text-slate-400">الطالب</th>
                    <th className="py-4 text-xs font-black text-slate-400">الموضوع</th>
                    <th className="py-4 text-xs font-black text-slate-400">المدة</th>
                    <th className="py-4 text-xs font-black text-slate-400 text-center">الحالة</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {historyModal.history.length > 0 ? historyModal.history.map((h, i) => (
                    <tr key={i} className="hover:bg-slate-50/50">
                      <td className="py-5 font-bold text-xs text-slate-700">{h.date}</td>
                      <td className="py-5 font-black text-xs text-emerald-950">{h.studentName}</td>
                      <td className="py-5 font-bold text-xs text-slate-500">{h.topic || "لا يوجد عنوان"}</td>
                      <td className="py-5 font-bold text-xs text-slate-500">{h.duration}</td>
                      <td className="py-5 text-center">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black ${
                          h.status === "حاضر" ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
                        }`}>
                          {h.status}
                        </span>
                      </td>
                    </tr>
                  )) : (
                    <tr><td colSpan="5" className="py-20 text-center text-slate-400 font-bold">لا توجد سجلات حضور بعد هذا المعلم.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
            
            <div className="mt-8 pt-8 border-t border-slate-100 flex justify-between items-center text-sm">
                <p className="font-bold text-slate-500">إجمالي الحصص المسجلة: <span className="text-emerald-700 font-black">{historyModal.history.length} حصة</span></p>
                <button 
                  onClick={() => setHistoryModal(null)}
                  className="bg-emerald-950 text-white px-8 py-3 rounded-2xl font-black hover:bg-black transition-all"
                >إغلاق السجل</button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

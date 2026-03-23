"use client";

import { useState } from "react";
import Link from "next/link";

const TEACHERS_DATA = [
  {
    id: 1,
    name: "أحمد عبد الله",
    department: "ركن القرآن الكريم",
    completedSessions: 45,
    canceledSessions: 2,
    ratePerSession: 50,
    status: "نشط",
  },
  {
    id: 2,
    name: "فاطمة محمد",
    department: "العربية لغير الناطقين",
    completedSessions: 32,
    canceledSessions: 0,
    ratePerSession: 60,
    status: "نشط",
  },
  {
    id: 3,
    name: "محمود حسن",
    department: "المناهج الدراسية",
    completedSessions: 28,
    canceledSessions: 1,
    ratePerSession: 40,
    status: "إجازة",
  },
];

export default function AdminTeacherSessionsPage() {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredTeachers = TEACHERS_DATA.filter((t) =>
    t.name.includes(searchTerm) || t.department.includes(searchTerm)
  );

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
                <th className="whitespace-nowrap px-6 py-4 font-bold">المبلغ المستحق</th>
                <th className="whitespace-nowrap px-6 py-4 font-bold text-center">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-emerald-50">
              {filteredTeachers.map((teacher) => {
                const totalDue = teacher.completedSessions * teacher.ratePerSession;
                return (
                  <tr key={teacher.id} className="transition-colors hover:bg-emerald-50/30">
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-emerald-100 to-emerald-200 font-bold text-emerald-700">
                          {teacher.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-emerald-950">{teacher.name}</p>
                          <span className={`mt-0.5 inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold ${teacher.status === 'نشط' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-700'}`}>
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
                      <span className="font-bold text-emerald-600">{totalDue} ج.م</span>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-center">
                      <button className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-emerald-50 px-4 py-2 text-xs font-bold text-emerald-700 transition-colors hover:bg-emerald-100 hover:text-emerald-800">
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        التفاصيل
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
    </main>
  );
}

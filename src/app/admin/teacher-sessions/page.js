"use client";

import { useState, useEffect, useRef } from "react";
import { getLocalUsers, getSupabaseOrWarn } from "@/utils/local-db";

export default function AdminTeacherSessionsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [teachers, setTeachers] = useState([]);
  const [mounted, setMounted] = useState(false);
  const [historyModal, setHistoryModal] = useState(null);
  
  const scrollContainerRef = useRef(null);

  // Drag-to-scroll logic
  useEffect(() => {
    const slider = scrollContainerRef.current;
    if (!slider) return;

    let isDown = false;
    let startX;
    let scrollLeft;

    const onMouseDown = (e) => {
      isDown = true;
      slider.classList.add('active');
      startX = e.pageX - slider.offsetLeft;
      scrollLeft = slider.scrollLeft;
    };

    const onMouseLeave = () => {
      isDown = false;
      slider.classList.remove('active');
    };

    const onMouseUp = () => {
      isDown = false;
      slider.classList.remove('active');
    };

    const onMouseMove = (e) => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - slider.offsetLeft;
      const walk = (x - startX) * 2; // scroll-fast factor
      slider.scrollLeft = scrollLeft - walk;
    };

    slider.addEventListener('mousedown', onMouseDown);
    slider.addEventListener('mouseleave', onMouseLeave);
    slider.addEventListener('mouseup', onMouseUp);
    slider.addEventListener('mousemove', onMouseMove);

    return () => {
      slider.removeEventListener('mousedown', onMouseDown);
      slider.removeEventListener('mouseleave', onMouseLeave);
      slider.removeEventListener('mouseup', onMouseUp);
      slider.removeEventListener('mousemove', onMouseMove);
    };
  }, [mounted]);

  useEffect(() => {
    const fetchTeachers = async () => {
      setMounted(true);

      // 1. Fetch all teachers
      const allUsers = await getLocalUsers();
      const realTeachers = allUsers.filter(u => u.role === "teacher");

      // 2. Fetch ALL attendance counts grouped by teacher email from DB
      const client = getSupabaseOrWarn("AdminFetchSessionsAll");
      let sessionCountsByEmail = {};

      if (client) {
        try {
          const { data: logs, error } = await client
            .from('attendance_sessions')
            .select('teacher_email');

          if (logs && !error) {
            logs.forEach(log => {
              const email = (log.teacher_email || "").toLowerCase().trim();
              sessionCountsByEmail[email] = (sessionCountsByEmail[email] || 0) + 1;
            });
          }
        } catch (err) {
          console.error("Failed to fetch all sessions:", err);
        }
      }

      // 3. Load financial settings
      const savedFinancials = JSON.parse(localStorage.getItem("admin_teachers_financials") || "{}");

      const teachersData = realTeachers.map((u) => {
        const email = u.email.toLowerCase().trim();
        let sessions = sessionCountsByEmail[email] || 0;

        // Fallback to localStorage if DB count is 0 (for legacy)
        if (sessions === 0) {
          sessions = parseInt(localStorage.getItem(`teacher_done_${u.email}`) || "0");
        }

        const financial = savedFinancials[u.email] || { rate: 50, received: 0 };

        return {
          id: u.id,
          email: u.email,
          name: u.name,
          department: u.course || u.department || "عام",
          completedSessions: sessions,
          ratePerSession: financial.rate,
          amountReceived: financial.received,
          image: u.image || "",
          status: u.status || "نشط",
        };
      });

      setTeachers(teachersData);
    };

    fetchTeachers();
  }, []);

  const handleUpdate = (email, field, value) => {
    const numValue = parseFloat(value) || 0;

    setTeachers(prev => prev.map(t =>
      t.email === email ? { ...t, [field === "rate" ? "ratePerSession" : "amountReceived"]: numValue } : t
    ));

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
    <main className="mx-auto w-full max-w-[95%] px-4 py-10 sm:px-8" dir="rtl">
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
        <div 
          ref={scrollContainerRef}
          className="overflow-x-auto cursor-grab active:cursor-grabbing select-none"
        >
          <table className="w-full text-right text-sm text-slate-600">
            <thead className="bg-emerald-50/80 text-emerald-900">
              <tr>
                <th className="whitespace-nowrap px-6 py-4 font-bold">اسم المعلم</th>
                <th className="whitespace-nowrap px-6 py-4 font-bold">القسم</th>
                <th className="whitespace-nowrap px-6 py-4 font-bold">الحصص المكتملة</th>
                <th className="whitespace-nowrap px-6 py-4 font-bold">سعر الحصة</th>
                <th className="whitespace-nowrap px-6 py-4 font-bold text-center">المبلغ المستلم</th>
                <th className="whitespace-nowrap px-6 py-4 font-bold text-center">المبلغ المستحق</th>
                <th className="whitespace-nowrap px-6 py-4 font-bold text-center">سجل الحصص</th>
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
                        />
                        <span className="text-[10px] font-bold text-slate-400">ج.م</span>
                      </div>
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
                        onClick={async () => {
                          const client = getSupabaseOrWarn("AdminFetchHistory");
                          let teacherLogs = [];

                          if (client) {
                            const { data } = await client
                              .from('attendance_sessions')
                              .select('*')
                              .eq('teacher_email', teacher.email)
                              .order('session_date', { ascending: false });

                            teacherLogs = (data || []).map(l => {
                              const rawNotes = l.notes || "";
                              let topic = "—";
                              let rating = "—";
                              let status = "—";
                              let duration = l.duration || "—";
                              let displayNotes = "";

                              // Extract Topic: Try "الموضوع: " prefix first, then fallback to cleaning the start of rawNotes
                              const topicMatch = rawNotes.match(/الموضوع:\s*([^|[\]]+)/);
                              if (topicMatch) {
                                topic = topicMatch[1].trim();
                              } else {
                                // If no prefix, take the first part of notes before any tags/brackets
                                const fallbackTopic = rawNotes.split(/[\[|]/)[0].trim();
                                topic = fallbackTopic || (l.topic || "—");
                              }

                              // Extract Status: Either from structured "| الحالة: " or legacy "[الحالة: "
                              const statusMatch = rawNotes.match(/الحالة:\s*([^|\]]+)/);
                              status = statusMatch ? statusMatch[1].trim() : "—";

                              // Extract Rating: Either from structured "| التقييم: " or legacy "[التقييم: "
                              const ratingMatch = rawNotes.match(/التقييم:\s*([^|\]]+)/);
                              rating = ratingMatch ? ratingMatch[1].trim() : "—";
                              
                              // Extract Duration: Look for it in notes if not in column
                              const durationMatch = rawNotes.match(/المدة:\s*([^|\]]+)/);
                              if (durationMatch) {
                                duration = durationMatch[1].trim();
                              }

                              // 2. Map Duration to user-friendly names (e.g., "60" -> "ساعة")
                              const durationDisplayMap = {
                                "60": "ساعة",
                                "60 دقيقة": "ساعة",
                                "90": "ساعة ونصف",
                                "90 دقيقة": "ساعة ونصف",
                                "120": "ساعتان",
                                "120 دقيقة": "ساعتان",
                                "30": "30 دقيقة",
                                "30 دقيقة": "30 دقيقة",
                                "45": "45 دقيقة",
                                "45 دقيقة": "45 دقيقة"
                              };
                              
                              const cleanDurKey = String(duration).trim();
                              duration = durationDisplayMap[cleanDurKey] || duration;

                              // Extract Details/Notes: Everything after "التفاصيل: " or fallback to original notes minus the tags
                              if (rawNotes.includes("التفاصيل: ")) {
                                displayNotes = rawNotes.split("التفاصيل: ")[1].trim();
                              } else {
                                // Fallback: remove the tags we already extracted to show "pure" notes
                                displayNotes = rawNotes
                                  .replace(/الموضوع:.*?[|\]]/g, "")
                                  .replace(/التقييم:.*?[|\]]/g, "")
                                  .replace(/الحالة:.*?[|\]]/g, "")
                                  .replace(/المدة:.*?[|\]]/g, "")
                                  .replace(/[\[\]|]/g, "")
                                  .replace(topic, "") // Remove the part we used as topic
                                  .trim();
                              }

                              // FINAL MAPPING: Use extracted fields for their respective columns
                              return {
                                ...l,
                                date: l.session_date,
                                topic: topic,
                                rating: rating,
                                status: status,
                                duration: duration,
                                notes: displayNotes || "لا توجد ملاحظات"
                              };
                            });
                          } else {
                            teacherLogs = JSON.parse(localStorage.getItem(`teacher_history_${teacher.email}`) || "[]");
                          }

                          const logsWithNames = teacherLogs.map(l => ({
                            ...l,
                            studentName: l.studentName || l.student_name || l.student_email?.split('@')[0] || "طالب"
                          }));

                          setHistoryModal({ name: teacher.name, email: teacher.email, logs: logsWithNames });
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
        </div>
      </div>

      {historyModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-emerald-950/40 p-4 backdrop-blur-sm animate-in fade-in">
          <div className="modern-card max-h-[90vh] w-full max-w-4xl overflow-hidden rounded-[2.5rem] border border-white bg-white shadow-2xl flex flex-col animate-in zoom-in-95">
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
                        <th className="px-5 py-4">الحالة</th>
                        <th className="px-5 py-4">الموضوع</th>
                        <th className="px-5 py-4 text-center">التقييم</th>
                        <th className="px-5 py-4">الملاحظات</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-emerald-50">
                      {[...historyModal.logs].reverse().map((log, idx) => (
                        <tr key={idx} className="hover:bg-emerald-50/20 transition-colors">
                          <td className="px-5 py-4 font-bold text-emerald-950">{log.studentName}</td>
                          <td className="px-5 py-4 text-slate-500">{log.date}</td>
                          <td className="px-5 py-4 font-medium text-slate-700">{log.duration}</td>
                          <td className="px-5 py-4">
                            <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-black ${
                              log.status === "حاضر" 
                                ? "bg-green-50 text-green-600 border border-green-100" 
                                : "bg-red-50 text-red-600 border border-red-100"
                            }`}>
                              {log.status === "حاضر" ? "حاضر ✅" : log.status === "غائب" ? "غائب ❌" : log.status}
                            </span>
                          </td>
                          <td className="px-5 py-4 text-emerald-700 font-bold">{log.topic}</td>
                          <td className="px-5 py-4 text-center">
                            <span className="inline-flex items-center rounded-full bg-amber-50 px-2.5 py-1 text-[10px] font-black text-amber-600 border border-amber-100 italic">
                              ⭐ {log.rating}
                            </span>
                          </td>
                          <td className="px-5 py-4 min-w-[200px] whitespace-normal text-slate-600 leading-relaxed text-[11px]">
                            {log.notes || "لا توجد ملاحظات"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

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

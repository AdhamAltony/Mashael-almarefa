"use client";

import { useState, useEffect } from "react";
import * as db from "@/utils/db";

export default function AdminDashboardPage() {
  const [stats, setStats] = useState([
    { label: "إجمالي الطلاب", value: "0", delta: "تحديث تلقائي", key: "total_students" },
    { label: "المعلمون النشطون", value: "0", delta: "تحديث تلقائي", key: "active_teachers" },
    { label: "الحصص المكتملة", value: "0", delta: "تحديث تلقائي", key: "admin_total_sessions" },
  ]);

  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState("");

  useEffect(() => {
    const loadStats = async () => {
        const allUsers = await db.getLocalUsers();
        
        const totalStudents = allUsers.filter(u => u.role === "student").length;
        const totalTeachers = allUsers.filter(u => u.role === "teacher").length;
        const savedSessions = localStorage.getItem("admin_total_sessions") || "0";

        setStats([
          { label: "إجمالي الطلاب", value: totalStudents.toString(), delta: "تحديث تلقائي", key: "total_students" },
          { label: "المعلمون النشطون", value: totalTeachers.toString(), delta: "تحديث تلقائي", key: "active_teachers" },
          { label: "الحصص المكتملة", value: savedSessions, delta: "تحديث تلقائي", key: "admin_total_sessions" },
        ]);

        const savedTasks = localStorage.getItem("admin_tasks");
        if (savedTasks) {
          setTasks(JSON.parse(savedTasks));
        } else {
          setTasks([]);
        }
    };
    loadStats();
  }, []);

  const addTask = (e) => {
    e.preventDefault();
    if (!newTask.trim()) return;
    const updatedTasks = [newTask, ...tasks];
    setTasks(updatedTasks);
    localStorage.setItem("admin_tasks", JSON.stringify(updatedTasks));
    setNewTask("");
  };

  const removeTask = (index) => {
    const updatedTasks = tasks.filter((_, i) => i !== index);
    setTasks(updatedTasks);
    localStorage.setItem("admin_tasks", JSON.stringify(updatedTasks));
  };

  return (
    <main className="site-container py-10" dir="rtl">
      <section className="modern-card rounded-3xl border border-white/70 p-6 shadow-xl shadow-emerald-900/5 sm:p-8 bg-white/60 backdrop-blur-sm">
        <p className="inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
          لوحة تحكم الإدارة
        </p>
        <h1 className="mt-3 text-2xl font-black text-emerald-950 sm:text-3xl">نظرة عامة على المنصة</h1>
        <p className="mt-2 text-sm text-slate-600 font-bold">متابعة مؤشرات الأداء، المهام التشغيلية، والقرارات الإدارية في بوابة الإدارة.</p>
      </section>

      <section className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => (
          <article key={stat.label} className="modern-card rounded-2xl border border-emerald-100/70 p-5 shadow-lg shadow-emerald-900/5 hover:-translate-y-1 transition-transform bg-white/60 backdrop-blur-sm">
            <p className="text-sm font-bold text-emerald-700">{stat.label}</p>
            <p className="mt-1 text-3xl font-black text-emerald-950">{stat.value}</p>
            <p className="mt-1 text-xs text-slate-600 font-bold">{stat.delta}</p>
          </article>
        ))}
      </section>

      <section className="mt-6">
        <article className="modern-card rounded-3xl border border-white/70 p-6 shadow-xl shadow-emerald-900/5 bg-white/60 backdrop-blur-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between text-right">
            <h2 className="text-xl font-black text-emerald-950">المهام المعلّقة</h2>
            <form onSubmit={addTask} className="flex gap-2" dir="rtl">
              <input
                type="text"
                placeholder="أضف مهمة جديدة..."
                value={newTask}
                onChange={(e) => setNewTask(e.target.value)}
                className="rounded-xl border border-emerald-100 bg-white/50 px-4 py-2 text-sm outline-none focus:border-emerald-500 font-bold"
              />
              <button
                type="submit"
                className="rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white transition-all hover:bg-emerald-700"
              >
                إضافة
              </button>
            </form>
          </div>
          
          <ul className="mt-6 space-y-3 text-sm text-slate-700 text-right">
            {tasks.length > 0 ? tasks.map((task, index) => (
              <li key={index} className="flex items-center justify-between rounded-2xl border border-emerald-100 bg-white/70 p-4 transition-colors hover:bg-emerald-50/50">
                <span className="font-bold">{task}</span>
                <button
                  onClick={() => removeTask(index)}
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-500 transition-all"
                  title="حذف المهمة"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </li>
            )) : (
              <p className="py-6 text-center text-slate-500 italic font-bold">لا توجد مهام معلقة.. كل شيء تحت السيطرة!</p>
            )}
          </ul>
        </article>
      </section>
    </main>
  );
}

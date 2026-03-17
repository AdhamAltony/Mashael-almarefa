"use client";

import { useState } from "react";

// Mock data
const initialUsers = [
    { id: 1, name: "أحمد محمود", email: "ahmed@example.com", role: "student", course: "ركن القرآن" },
    { id: 2, name: "منى علي", email: "mona@example.com", role: "student", course: "المناهج الدراسية" },
    { id: 3, name: "عمر خالد", email: "omar@example.com", role: "student", course: "العربية لغير الناطقين" },
    { id: 4, name: "الشيخ محمود زايد", email: "mahmoud.z@mashael.com", role: "teacher", course: "ركن القرآن" },
    { id: 5, name: "أ. فاطمة سعيد", email: "fatima.s@mashael.com", role: "teacher", course: "المناهج الدراسية" },
];

export default function AdminUsersPage() {
    const [users, setUsers] = useState(initialUsers);
    const [activeTab, setActiveTab] = useState("student");

    // Edit State
    const [editingUser, setEditingUser] = useState(null);
    const [editForm, setEditForm] = useState({ name: "", email: "", course: "" });

    // Delete Modal State
    const [userToDelete, setUserToDelete] = useState(null);

    const filteredUsers = users.filter((user) => user.role === activeTab);

    const handleDeleteClick = (id) => {
        setUserToDelete(id);
    };

    const confirmDelete = () => {
        if (userToDelete) {
            setUsers(users.filter((user) => user.id !== userToDelete));
            setUserToDelete(null);
        }
    };

    const cancelDelete = () => {
        setUserToDelete(null);
    };

    const openEditModal = (user) => {
        setEditingUser(user);
        setEditForm({ name: user.name, email: user.email, course: user.course });
    };

    const handleSaveEdit = (e) => {
        e.preventDefault();
        setUsers(users.map((u) => (u.id === editingUser.id ? { ...u, ...editForm } : u)));
        setEditingUser(null);
    };

    return (
        <main className="site-container min-h-screen py-10" dir="rtl">
            <div className="mb-8 text-center sm:text-right">
                <p className="inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
                    لوحة الإدارة
                </p>
                <h1 className="mt-4 text-3xl font-black text-emerald-950 sm:text-4xl">إدارة الأعضاء</h1>
                <p className="mt-2 text-sm text-slate-600">
                    يمكنك عرض وتعديل وحذف حسابات الطلاب والمعلمين بسهولة.
                </p>
            </div>

            <div className="modern-card overflow-hidden rounded-3xl border border-white/70 bg-white/60 p-6 shadow-xl shadow-emerald-900/5 backdrop-blur-md sm:p-8">

                {/* Tabs */}
                <div className="mb-6 flex gap-2 rounded-2xl bg-emerald-50/50 p-1">
                    <button
                        onClick={() => setActiveTab("student")}
                        className={`flex-1 rounded-xl py-3 text-sm font-bold transition-all ${activeTab === "student"
                            ? "bg-white text-emerald-700 shadow-sm"
                            : "text-slate-500 hover:text-emerald-700 hover:bg-emerald-50"
                            }`}
                    >
                        الطلاب
                    </button>
                    <button
                        onClick={() => setActiveTab("teacher")}
                        className={`flex-1 rounded-xl py-3 text-sm font-bold transition-all ${activeTab === "teacher"
                            ? "bg-white text-emerald-700 shadow-sm"
                            : "text-slate-500 hover:text-emerald-700 hover:bg-emerald-50"
                            }`}
                    >
                        المعلمون
                    </button>
                </div>

                {/* Users Table / List */}
                <div className="overflow-x-auto">
                    <table className="w-full text-right text-sm">
                        <thead>
                            <tr className="border-b border-emerald-100 text-emerald-900">
                                <th className="py-4 pl-4 font-bold">الاسم</th>
                                <th className="py-4 pl-4 font-bold">البريد الإلكتروني</th>
                                <th className="py-4 pl-4 font-bold">القسم / المسار</th>
                                <th className="py-4 font-bold w-32">الإجراءات</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-emerald-50/50">
                            {filteredUsers.length > 0 ? (
                                filteredUsers.map((user) => (
                                    <tr key={user.id} className="group transition-colors hover:bg-emerald-50/30">
                                        <td className="py-4 pl-4 font-bold text-emerald-950">{user.name}</td>
                                        <td className="py-4 pl-4 text-slate-600">{user.email}</td>
                                        <td className="py-4 pl-4">
                                            <span className="inline-flex rounded-lg bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
                                                {user.course}
                                            </span>
                                        </td>
                                        <td className="py-4">
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => openEditModal(user)}
                                                    className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600 transition-colors hover:bg-emerald-200"
                                                    title="تعديل"
                                                >
                                                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                                    </svg>
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteClick(user.id)}
                                                    className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-100 text-red-600 transition-colors hover:bg-red-200"
                                                    title="حذف"
                                                >
                                                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="4" className="py-8 text-center text-slate-500">
                                        لا يوجد أعضاء في هذا القسم حاليًا.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Edit Modal (Overlay) */}
            {editingUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-emerald-950/40 p-4 backdrop-blur-sm animate-in fade-in">
                    <div className="modern-card w-full max-w-md rounded-3xl border border-white p-6 shadow-2xl bg-white sm:p-8 animate-in zoom-in-95">
                        <h2 className="mb-6 text-2xl font-black text-emerald-950">تعديل بيانات العضو</h2>
                        <form onSubmit={handleSaveEdit} className="space-y-4">
                            <div>
                                <label className="mb-1.5 block text-sm font-bold text-emerald-900">الاسم</label>
                                <input
                                    type="text"
                                    required
                                    value={editForm.name}
                                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                    className="w-full rounded-xl border border-emerald-200 bg-emerald-50/30 px-4 py-3 text-emerald-950 outline-none transition focus:border-emerald-400 focus:ring-1 focus:ring-emerald-300/40"
                                />
                            </div>
                            <div>
                                <label className="mb-1.5 block text-sm font-bold text-emerald-900">البريد الإلكتروني</label>
                                <input
                                    type="email"
                                    required
                                    value={editForm.email}
                                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                                    className="w-full rounded-xl border border-emerald-200 bg-emerald-50/30 px-4 py-3 text-emerald-950 outline-none transition focus:border-emerald-400 focus:ring-1 focus:ring-emerald-300/40"
                                />
                            </div>
                            <div>
                                <label className="mb-1.5 block text-sm font-bold text-emerald-900">القسم / المسار</label>
                                <input
                                    type="text"
                                    required
                                    value={editForm.course}
                                    onChange={(e) => setEditForm({ ...editForm, course: e.target.value })}
                                    className="w-full rounded-xl border border-emerald-200 bg-emerald-50/30 px-4 py-3 text-emerald-950 outline-none transition focus:border-emerald-400 focus:ring-1 focus:ring-emerald-300/40"
                                />
                            </div>

                            <div className="mt-6 flex gap-3 pt-2">
                                <button
                                    type="submit"
                                    className="glow-button flex-1 rounded-xl bg-gradient-to-l from-emerald-500 to-emerald-600 py-3 text-sm font-bold text-white transition-all hover:from-emerald-400 hover:to-emerald-500"
                                >
                                    حفظ التعديلات
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setEditingUser(null)}
                                    className="flex-1 rounded-xl bg-slate-100 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-200"
                                >
                                    إلغاء
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            {/* Custom Swal-Like Delete Confirmation Modal */}
            {userToDelete && (
                <div className="fixed inset-0 z-[70] flex items-center justify-center bg-emerald-950/40 p-4 backdrop-blur-sm animate-in fade-in">
                    <div className="modern-card w-full max-w-sm rounded-[2rem] border border-white bg-white p-8 text-center shadow-2xl animate-in zoom-in-95">
                        <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full border-[4px] border-red-500/20 bg-red-50 text-red-500">
                            <span className="text-4xl font-black">!</span>
                        </div>
                        <h2 className="mb-2 text-2xl font-black text-slate-800">هل أنت متأكد؟</h2>
                        <p className="mb-8 text-sm text-slate-500">
                            لن تتمكن من التراجع عن عملية حذفك لهذا المستخدم بأي شكل!
                        </p>

                        <div className="flex gap-3">
                            <button
                                onClick={confirmDelete}
                                className="flex-1 rounded-xl bg-red-500 py-3.5 text-sm font-bold text-white shadow-lg shadow-red-500/30 transition hover:bg-red-600 hover:-translate-y-0.5"
                            >
                                حذف
                            </button>
                            <button
                                onClick={cancelDelete}
                                className="flex-1 rounded-xl bg-slate-100 py-3.5 text-sm font-bold text-slate-700 transition hover:bg-slate-200"
                            >
                                إلغاء
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </main>
    );
}

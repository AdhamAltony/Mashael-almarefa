"use client";

import { useState, useEffect } from "react";
import { getLocalUsers, deleteUser, updateUser } from "@/utils/local-db";

// Mock data
// Dynamic courses will be loaded from localStorage
export default function AdminUsersPage() {
    const [allCourses, setAllCourses] = useState([]);
    const [users, setUsers] = useState([]);
    const [activeTab, setActiveTab] = useState("student");

    // Edit State
    const [editingUser, setEditingUser] = useState(null);
    const [editForm, setEditForm] = useState({ name: "", email: "", course: "" });

    // Delete Modal State
    const [userToDelete, setUserToDelete] = useState(null);

    // Course Assignment State
    const [assigningToUser, setAssigningToUser] = useState(null);
    const [selectedCourses, setSelectedCourses] = useState([]);
    const [toast, setToast] = useState(null);
    const [mounted, setMounted] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                setLoading(true);
                const data = await getLocalUsers();
                setUsers(data || []);
            } catch (err) {
                console.error("Failed to fetch users:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchUsers();
        
        // Load real courses from Courses Center
        const savedCourses = JSON.parse(localStorage.getItem("platform_courses") || "[]");
        setAllCourses(savedCourses);
        
        setMounted(true);
    }, []);

    const filteredUsers = users.filter((user) => user.role === activeTab);

    const handleDeleteClick = (id, email) => {
        setUserToDelete({ id, email });
    };

    const confirmDelete = async () => {
        if (userToDelete) {
            await deleteUser(userToDelete.id, userToDelete.email);
            setUsers(await getLocalUsers());
            setUserToDelete(null);
        }
    };

    const cancelDelete = () => {
        setUserToDelete(null);
    };

    const openEditModal = (user) => {
        setEditingUser(user);
        let rating = user.rating || "5.0";
        setEditForm({ name: user.name, email: user.email, course: user.course, rating });
    };

    const handleSaveEdit = async (e) => {
        e.preventDefault();
        await updateUser({ ...editingUser, ...editForm });
        
        setUsers(await getLocalUsers());
        setEditingUser(null);
    };

    const toggleTeacherStatus = async (user) => {
        const profileKey = `teacher_profile_${user.email}`;
        const profile = JSON.parse(localStorage.getItem(profileKey) || "{}");
        const currentStatus = user.status || profile.status || "نشط";
        const newStatus = currentStatus === "إجازة" ? "نشط" : "إجازة";
        
        profile.status = newStatus;
        localStorage.setItem(profileKey, JSON.stringify(profile));
        
        await updateUser({ ...user, status: newStatus });
        
        setUsers(await getLocalUsers());
        
        setToast({ message: `تم تغيير حالة ${user.name} إلى ${newStatus}`, type: "success" });
        setTimeout(() => setToast(null), 3000);
    };
    const openAssignModal = (user) => {
        setAssigningToUser(user);
        const stored = localStorage.getItem(`assigned_courses_${user.email}`);
        setSelectedCourses(stored ? JSON.parse(stored) : []);
    };

    const handleSaveAssignments = () => {
        if (assigningToUser) {
            localStorage.setItem(`assigned_courses_${assigningToUser.email}`, JSON.stringify(selectedCourses));
            setAssigningToUser(null);
            setToast({ message: "تم حفظ الصلاحيات بنجاح!", type: "success" });
            setTimeout(() => setToast(null), 3000);
        }
    };

    const toggleCourse = (id) => {
        setSelectedCourses(prev => 
            prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
        );
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
                                <th className="py-4 pl-4 font-bold">بيانات العضو</th>
                                <th className="py-4 pl-4 font-bold">رقم العضو</th>
                                <th className="py-4 pl-4 font-bold">القسم / المسار</th>
                                {activeTab === "student" ? (
                                    <th className="py-4 pl-4 font-bold">الدورات</th>
                                ) : (
                                    <th className="py-4 pl-4 font-bold">الحالة</th>
                                )}
                                <th className="py-4 font-bold w-32">الإجراءات</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-emerald-50/50">
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="py-12 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent"></div>
                                            <p className="text-sm font-bold text-emerald-800 animate-pulse">جاري تحميل البيانات...</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredUsers.length > 0 ? (
                                filteredUsers.map((user) => {
                                    const userImage = user.image || "";
                                    const status = user.status || "نشط";

                                    return (
                                        <tr key={user.id} className="group transition-colors hover:bg-emerald-50/30">
                                            <td className="py-4 pl-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full bg-emerald-100 border border-emerald-200">
                                                        {userImage ? (
                                                            <img src={userImage} alt={user.name} className="h-full w-full object-cover" />
                                                        ) : (
                                                            <div className="flex h-full w-full items-center justify-center font-bold text-emerald-600">
                                                                {user.name.charAt(0)}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="font-bold text-emerald-950">{user.name}</span>
                                                        <span className="text-[10px] text-slate-500">{user.email}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-4 pl-4">
                                                <span className="text-xs font-mono font-bold text-emerald-800">#{user.id}</span>
                                            </td>
                                            <td className="py-4 pl-4">
                                                <span className="inline-flex rounded-lg bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
                                                    {user.course}
                                                </span>
                                            </td>
                                            {activeTab === "student" ? (
                                                <td className="py-4 pl-4">
                                                    <button
                                                        onClick={() => openAssignModal(user)}
                                                        className="inline-flex items-center gap-1 rounded-lg border border-emerald-200 bg-white px-2.5 py-1 text-xs font-bold text-emerald-700 transition-all hover:bg-emerald-50"
                                                    >
                                                        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                                        </svg>
                                                        {mounted && localStorage.getItem(`assigned_courses_${user.email}`) ? "تعديل الدورات" : "إتاحة دورات"}
                                                    </button>
                                                </td>
                                            ) : (
                                                <td className="py-4 pl-4">
                                                    <button 
                                                        onClick={() => toggleTeacherStatus(user)}
                                                        className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[10px] font-black uppercase tracking-wider transition-all hover:scale-105 active:scale-95 ${
                                                        status === "إجازة" || status.includes("غير متاح")
                                                        ? "bg-amber-100 text-amber-700 border border-amber-200"
                                                        : "bg-emerald-100 text-emerald-700 border border-emerald-200"
                                                    }`}>
                                                        <span className="h-1.5 w-1.5 rounded-full bg-current animate-pulse" />
                                                        {status}
                                                    </button>
                                                </td>
                                            )}
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
                                                        onClick={() => handleDeleteClick(user.id, user.email)}
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
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan="5" className="py-8 text-center text-slate-500">
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
                                <select
                                    required
                                    value={editForm.course}
                                    onChange={(e) => setEditForm({ ...editForm, course: e.target.value })}
                                    className="w-full rounded-xl border border-emerald-200 bg-emerald-50/30 px-4 py-3 text-emerald-950 outline-none transition focus:border-emerald-400 focus:ring-1 focus:ring-emerald-300/40 appearance-none"
                                >
                                    <option value="ركن القرآن الكريم">ركن القرآن الكريم</option>
                                    <option value="اللغة العربية لغير الناطقين">اللغة العربية لغير الناطقين</option>
                                    <option value="المناهج الدراسية">المناهج الدراسية</option>
                                </select>
                            </div>                            {editingUser.role === "teacher" && (
                                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-100/50">
                                    <label className="mb-2 block text-xs font-bold text-amber-800 uppercase tracking-wider">تقييم المعلم</label>
                                    <div className="flex items-center gap-4">
                                        <div className="flex flex-col flex-1">
                                            <input 
                                                type="range" 
                                                min="1" max="5" step="0.1"
                                                value={editForm.rating}
                                                onChange={(e) => setEditForm({ ...editForm, rating: e.target.value })}
                                                className="w-full accent-amber-500 cursor-pointer"
                                            />
                                            <div className="flex justify-between mt-1 text-[10px] font-bold text-amber-600/60">
                                                <span>1.0</span>
                                                <span>5.0</span>
                                            </div>
                                        </div>
                                        <div className="h-14 w-14 shrink-0 rounded-2xl bg-white border-2 border-amber-200 flex flex-col items-center justify-center font-black text-amber-600 shadow-sm transition-transform hover:scale-110">
                                            <span className="text-sm">{editForm.rating}</span>
                                            <span className="text-xs leading-none">⭐</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                            <div className="mt-6 flex gap-3 pt-2">
                                <button
                                    type="submit"
                                    className="glow-button flex-1 rounded-xl bg-gradient-to-l from-emerald-500 to-emerald-600 py-3 text-sm font-bold text-white transition-all hover:from-emerald-400 hover:to-emerald-500 shadow-lg shadow-emerald-500/20"
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

            {/* Course Assignment Modal */}
            {assigningToUser && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-emerald-950/40 p-4 backdrop-blur-sm animate-in fade-in">
                    <div className="modern-card w-full max-w-md rounded-3xl border border-white bg-white p-6 shadow-2xl sm:p-8 animate-in zoom-in-95">
                        <div className="mb-6 flex items-center justify-between">
                            <h2 className="text-2xl font-black text-emerald-950">إدارة دورات الطالب</h2>
                            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">{assigningToUser.name}</span>
                        </div>

                        <p className="mb-4 text-sm text-slate-500">اختر الدورات التي ترغب في إتاحتها لهذا الطالب:</p>

                        <div className="space-y-3 mb-8 max-h-[40vh] overflow-y-auto pr-1 thin-scrollbar">
                            {allCourses.length > 0 ? (
                                allCourses.map((courseTitle) => (
                                    <label key={courseTitle} className="flex items-center gap-3 p-3 rounded-xl border border-emerald-50 bg-emerald-50/30 cursor-pointer transition hover:bg-emerald-50">
                                        <input
                                            type="checkbox"
                                            checked={selectedCourses.includes(courseTitle)}
                                            onChange={() => toggleCourse(courseTitle)}
                                            className="h-5 w-5 rounded border-emerald-300 text-emerald-600 focus:ring-emerald-500"
                                        />
                                        <span className="font-bold text-emerald-900">{courseTitle}</span>
                                    </label>
                                ))
                            ) : (
                                <p className="text-center py-4 text-xs font-bold text-slate-400 italic">لا توجد دورات مسجلة في مركز الدورات بعد.</p>
                            )}
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={handleSaveAssignments}
                                className="flex-1 rounded-xl bg-emerald-600 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-600/20 transition hover:bg-emerald-700 hover:-translate-y-0.5"
                            >
                                حفظ الصلاحيات
                            </button>
                            <button
                                onClick={() => setAssigningToUser(null)}
                                className="flex-1 rounded-xl bg-slate-100 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-200"
                            >
                                إغلاق
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {/* Toast Notification */}
            {toast && (
                <div className="fixed bottom-10 left-10 z-[100] flex animate-in slide-in-from-left-10 fade-in">
                    <div className="flex items-center gap-3 rounded-2xl bg-emerald-900 px-6 py-4 text-white shadow-2xl shadow-emerald-950/40 border border-emerald-400/20">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-400/20 text-emerald-400">
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <span className="font-bold text-sm">{toast.message}</span>
                    </div>
                </div>
            )}
        </main>
    );
}

"use client";

import { useState, useEffect } from "react";
import * as db from "@/utils/db";

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

    const loadData = async () => {
        const localUsers = await db.getLocalUsers();
        setUsers(localUsers);
        
        const savedCourses = await db.getPlatformCourses();
        setAllCourses(savedCourses);
    };

    useEffect(() => {
        loadData();
        setMounted(true);
    }, []);

    const filteredUsers = users.filter((user) => user.role === activeTab);

    const handleDeleteClick = (id) => {
        setUserToDelete(id);
    };

    const confirmDelete = async () => {
        if (userToDelete) {
            await db.deleteUser(userToDelete);
            await loadData();
            setUserToDelete(null);
        }
    };

    const cancelDelete = () => {
        setUserToDelete(null);
    };

    const openEditModal = async (user) => {
        setEditingUser(user);
        let rating = "5.0";
        if (user.role === "teacher") {
            const profile = await db.getProfile("teacher", user.email);
            rating = profile.rating || "5.0";
        }
        setEditForm({ name: user.name, email: user.email, course: user.course, rating });
    };

    const handleSaveEdit = async (e) => {
        e.preventDefault();
        await db.updateUser({ ...editingUser, ...editForm });
        
        if (editingUser.role === "teacher") {
            const profile = await db.getProfile("teacher", editingUser.email);
            profile.rating = editForm.rating;
            await db.saveProfile("teacher", editingUser.email, profile);
        }

        await loadData();
        setEditingUser(null);
    };

    const toggleTeacherStatus = async (user) => {
        const profile = await db.getProfile("teacher", user.email);
        const currentStatus = profile.available || "نشط";
        const newStatus = currentStatus === "إجازة" ? "نشط" : "إجازة";
        
        profile.available = newStatus;
        await db.saveProfile("teacher", user.email, profile);
        
        await loadData();
        setToast({ message: `تم تغيير حالة ${user.name} إلى ${newStatus}`, type: "success" });
        setTimeout(() => setToast(null), 3000);
    };

    const openAssignModal = async (user) => {
        setAssigningToUser(user);
        const assigned = await db.getAssignedCourses(user.email);
        setSelectedCourses(assigned);
    };

    const handleCourseToggle = (course) => {
        setSelectedCourses(prev => 
            prev.includes(course) ? prev.filter(c => c !== course) : [...prev, course]
        );
    };

    const saveAssignments = async () => {
        if (assigningToUser) {
            await db.saveAssignedCourses(assigningToUser.email, selectedCourses);
            setAssigningToUser(null);
            setToast({ message: `تم تحديث دورات ${assigningToUser.name} بنجاح`, type: "success" });
            setTimeout(() => setToast(null), 3000);
        }
    };

    if (!mounted) return null;

    return (
        <div className="min-h-screen bg-slate-50 font-sans p-4 sm:p-8" dir="rtl">
            {/* Header */}
            <header className="mb-12">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 mb-2">إدارة المستخدمين</h1>
                        <p className="text-slate-500 font-medium">تحكم في الصلاحيات، راقب الأداء، ونظم الكورسات.</p>
                    </div>
                </div>
            </header>

            {/* Stats Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12">
                {[
                    { label: "إجمالي الطلاب", value: users.filter(u => u.role === "student").length, icon: "🎓", color: "blue" },
                    { label: "المعلمون النشطون", value: users.filter(u => u.role === "teacher").length, icon: "👨‍🏫", color: "emerald" },
                    { label: "إجمالي الدورات", value: allCourses.length, icon: "📚", color: "purple" }
                ].map((stat, i) => (
                    <div key={i} className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 flex items-center gap-5">
                        <div className={`h-14 w-14 rounded-2xl bg-${stat.color}-50 flex items-center justify-center text-2xl`}>
                            {stat.icon}
                        </div>
                        <div>
                            <p className="text-sm font-bold text-slate-500 mb-1">{stat.label}</p>
                            <p className="text-2xl font-black text-slate-900">{stat.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Main Tabs */}
            <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
                <div className="flex border-b border-slate-100 p-2 gap-2 bg-slate-50/50">
                    {["student", "teacher"].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`flex-1 py-4 px-6 rounded-2xl text-sm font-black transition-all ${
                                activeTab === tab 
                                ? "bg-white text-emerald-600 shadow-sm" 
                                : "text-slate-400 hover:text-slate-600"
                            }`}
                        >
                            {tab === "student" ? "الطلاب" : "المعلمون"}
                        </button>
                    ))}
                </div>

                {/* Users Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-right border-collapse">
                        <thead>
                            <tr className="bg-slate-50/30">
                                <th className="px-8 py-5 text-sm font-black text-slate-500 border-b border-slate-100">المستخدم</th>
                                <th className="px-8 py-5 text-sm font-black text-slate-500 border-b border-slate-100">الدورة المسجل بها</th>
                                <th className="px-8 py-5 text-sm font-black text-slate-500 border-b border-slate-100">تاريخ الانضمام</th>
                                <th className="px-8 py-5 text-sm font-black text-slate-500 border-b border-slate-100">الإجراءات</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredUsers.length > 0 ? filteredUsers.map((user) => (
                                <tr key={user.id} className="group hover:bg-slate-50/50 transition-colors">
                                    <td className="px-8 py-6 border-b border-slate-100">
                                        <div className="flex items-center gap-4">
                                            <div className="h-12 w-12 rounded-2xl bg-slate-100 flex items-center justify-center text-xl font-bold text-slate-400">
                                                {user.name.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="font-black text-slate-900">{user.name}</p>
                                                <p className="text-xs text-slate-500 font-medium">{user.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 border-b border-slate-100 italic">
                                        <span className={`px-4 py-2 rounded-full text-xs font-black ${
                                            user.course ? "bg-emerald-50 text-emerald-600" : "bg-slate-50 text-slate-400"
                                        }`}>
                                            {user.course || "غير محدد"}
                                        </span>
                                    </td>
                                    <td className="px-8 py-6 border-b border-slate-100 text-sm font-bold text-slate-500">{user.joinDate}</td>
                                    <td className="px-8 py-6 border-b border-slate-100">
                                        <div className="flex items-center gap-2">
                                            {user.role === "student" && (
                                                <button 
                                                    onClick={() => openAssignModal(user)}
                                                    className="p-3 rounded-2xl bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                                                    title="إتاحة دورات"
                                                >
                                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                                </button>
                                            )}
                                            <button 
                                                onClick={() => openEditModal(user)}
                                                className="p-3 rounded-2xl bg-amber-50 text-amber-600 hover:bg-amber-600 hover:text-white transition-all shadow-sm"
                                                title="تعديل"
                                            >
                                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                            </button>
                                            <button 
                                                onClick={() => handleDeleteClick(user.id)}
                                                className="p-3 rounded-2xl bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white transition-all shadow-sm"
                                                title="حذف"
                                            >
                                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="4" className="px-8 py-20 text-center text-slate-400 font-bold">لا يوجد مستخدمون في هذا القسم حالياً.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modals Implementation (Edit, Delete, Assign) */}
            {editingUser && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-[3rem] w-full max-w-lg p-8 shadow-2xl animate-in zoom-in-95 duration-300">
                        <div className="flex justify-between items-center mb-8">
                            <h2 className="text-2xl font-black text-slate-900">تعديل حساب {editingUser.role === "student" ? "طالب" : "معلم"}</h2>
                            <button onClick={() => setEditingUser(null)} className="text-slate-400 hover:text-slate-600">✕</button>
                        </div>
                        <form onSubmit={handleSaveEdit} className="space-y-6">
                            <div>
                                <label className="block text-sm font-black text-slate-600 mb-2">الاسم بالكامل</label>
                                <input 
                                    type="text" 
                                    value={editForm.name}
                                    onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-bold"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-black text-slate-600 mb-2">البريد الإلكتروني</label>
                                <input 
                                    type="email" 
                                    value={editForm.email}
                                    onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-bold"
                                    required
                                />
                            </div>
                            {editingUser.role === "student" ? (
                                <div>
                                    <label className="block text-sm font-black text-slate-600 mb-2">الدورة الدراسية</label>
                                    <select 
                                        value={editForm.course}
                                        onChange={(e) => setEditForm({...editForm, course: e.target.value})}
                                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-bold appearance-none cursor-pointer"
                                    >
                                        <option value="">غير محدد</option>
                                        <option value="القرآن وعلومه">القرآن وعلومه</option>
                                        <option value="اللغة العربية">اللغة العربية</option>
                                        <option value="مناهج مصر والخليج">مناهج مصر والخليج</option>
                                    </select>
                                </div>
                            ) : (
                                <div>
                                    <label className="block text-sm font-black text-slate-600 mb-2">التقييم الحالي</label>
                                    <input 
                                        type="number" 
                                        step="0.1" 
                                        max="5" 
                                        min="0"
                                        value={editForm.rating}
                                        onChange={(e) => setEditForm({...editForm, rating: e.target.value})}
                                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-bold"
                                    />
                                </div>
                            )}
                            <div className="flex gap-4 pt-4">
                                <button type="submit" className="flex-1 bg-emerald-600 text-white rounded-2xl py-4 font-black shadow-lg shadow-emerald-600/20 hover:bg-emerald-700 transition-all active:scale-95">حفظ التغييرات</button>
                                <button type="button" onClick={() => setEditingUser(null)} className="flex-1 bg-slate-100 text-slate-600 rounded-2xl py-4 font-black hover:bg-slate-200 transition-all">إلغاء</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirmation */}
            {userToDelete && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-[3rem] w-full max-w-md p-8 shadow-2xl text-center">
                        <div className="h-20 w-20 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-6 text-3xl">⚠️</div>
                        <h2 className="text-2xl font-black text-slate-900 mb-2">هل أنت متأكد؟</h2>
                        <p className="text-slate-500 font-medium mb-8">سيتم حذف هذا المستخدم وجميع بياناته بشكل نهائي من قاعدة البيانات.</p>
                        <div className="flex gap-3">
                            <button onClick={confirmDelete} className="flex-1 bg-rose-600 text-white rounded-2xl py-4 font-black shadow-lg shadow-rose-600/20 hover:bg-rose-700 transition-all active:scale-95">تأكيد الحذف</button>
                            <button onClick={cancelDelete} className="flex-1 bg-slate-100 text-slate-600 rounded-2xl py-4 font-black hover:bg-slate-200 transition-all">إلغاء</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Course Assignment Modal */}
            {assigningToUser && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-[3rem] w-full max-w-xl p-8 shadow-2xl animate-in slide-in-from-bottom-5">
                        <div className="flex justify-between items-center mb-8">
                            <div>
                                <h2 className="text-2xl font-black text-slate-900">إتاحة الدورات</h2>
                                <p className="text-sm text-slate-500 font-bold">للطالب: {assigningToUser.name}</p>
                            </div>
                            <button onClick={() => setAssigningToUser(null)} className="h-10 w-10 bg-slate-100 rounded-full flex items-center justify-center hover:bg-slate-200 transition-colors">✕</button>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 mb-8 max-h-[40vh] overflow-y-auto p-2">
                            {allCourses.length > 0 ? allCourses.map((course) => (
                                <button
                                    key={course}
                                    onClick={() => handleCourseToggle(course)}
                                    className={`p-5 rounded-3xl border-2 transition-all font-black text-sm flex items-center justify-between group ${
                                        selectedCourses.includes(course)
                                        ? "border-emerald-500 bg-emerald-50 text-emerald-600"
                                        : "border-slate-100 bg-slate-50/50 text-slate-400 hover:border-emerald-200"
                                    }`}
                                >
                                    <span>{course}</span>
                                    <div className={`h-6 w-6 rounded-full border-2 flex items-center justify-center ${
                                        selectedCourses.includes(course)
                                        ? "bg-emerald-500 border-emerald-500"
                                        : "bg-white border-slate-200 group-hover:border-emerald-200"
                                    }`}>
                                        {selectedCourses.includes(course) && <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>}
                                    </div>
                                </button>
                            )) : (
                                <p className="col-span-2 text-center text-slate-400 py-10 font-bold">يرجى إضافة دورات أولاً من مركز الكورسات.</p>
                            )}
                        </div>

                        <div className="flex gap-4">
                            <button 
                                onClick={saveAssignments}
                                className="flex-1 bg-emerald-600 text-white rounded-2xl py-4 font-black shadow-lg shadow-emerald-600/20 hover:bg-emerald-700 transition-all active:scale-95"
                            >
                                حفظ الإتاحة
                            </button>
                            <button onClick={() => setAssigningToUser(null)} className="flex-1 bg-slate-100 text-slate-600 rounded-2xl py-4 font-black hover:bg-slate-200 transition-all">إلغاء</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Toast Notification */}
            {toast && (
                <div className="fixed bottom-8 left-8 z-[200] animate-in slide-in-from-left-10 duration-500">
                    <div className={`px-8 py-4 rounded-2xl shadow-2xl flex items-center gap-4 border-l-4 font-black ${
                        toast.type === "success" ? "bg-white text-emerald-600 border-emerald-500" : "bg-white text-rose-600 border-rose-500"
                    }`}>
                        <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${
                            toast.type === "success" ? "bg-emerald-50" : "bg-rose-50"
                        }`}>
                            {toast.type === "success" ? "✓" : "!"}
                        </div>
                        {toast.message}
                    </div>
                </div>
            )}
        </div>
    );
}

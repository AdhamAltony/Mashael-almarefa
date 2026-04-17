"use client";

import { useState, useEffect } from "react";
import { getLocalUsers, deleteUser, updateUser, getPlatformCourses, updatePlatformCourse, deletePlatformCourse, addPlatformCourse, getAssignedCourseTitles, saveCourseAssignments, getPlatformVideos } from "@/utils/local-db";

const CURRICULA_SUBJECTS = [
    { name: "اللغة العربية", icon: "📚" },
    { name: "اللغة الإنجليزية", icon: "🇬🇧" },
    { name: "الرياضيات", icon: "📐" },
    { name: "العلوم", icon: "🧪" },
    { name: "الدراسات الاجتماعية", icon: "🌍" },
    { name: "اللغة الفرنسية", icon: "🇫🇷" },
    { name: "اللغة الألمانية", icon: "🇩🇪" },
    { name: "التربية الإسلامية", icon: "🕌" },
];

export default function AdminUsersPage() {
    const [allCourses, setAllCourses] = useState([]);
    const [users, setUsers] = useState([]);
    const [videoCounts, setVideoCounts] = useState({});
    const [assignedCourseCounts, setAssignedCourseCounts] = useState({});
    const [activeTab, setActiveTab] = useState("student");

    // Edit State
    const [editingUser, setEditingUser] = useState(null);
    const [editForm, setEditForm] = useState({ name: "", email: "", course: "", selectedDepartments: [] });

    // Delete Modal State
    const [userToDelete, setUserToDelete] = useState(null);

    // Course Assignment State
    const [assigningToUser, setAssigningToUser] = useState(null);
    const [selectedCourses, setSelectedCourses] = useState([]);
    const [toast, setToast] = useState(null);
    const [mounted, setMounted] = useState(false);
    const [loading, setLoading] = useState(true);

    // Course Management State
    const [editingCourse, setEditingCourse] = useState(null);
    const [editCourseForm, setEditCourseForm] = useState("");
    const [courseToDelete, setCourseToDelete] = useState(null);
    const [isAddingCourse, setIsAddingCourse] = useState(false);
    const [newCourseName, setNewCourseName] = useState("");

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                setLoading(true);
                const data = await getLocalUsers();
                setUsers(data || []);

                // Load real courses from Supabase
                const savedCourses = await getPlatformCourses();
                setAllCourses(savedCourses);

                // Load all videos to count them
                const allVideos = await getPlatformVideos();
                const counts = {};
                allVideos.forEach(v => {
                    counts[v.title] = (counts[v.title] || 0) + 1;
                });
                setVideoCounts(counts);

                // Load assignment counts for each user
                const assignmentCounts = {};
                for (const user of data) {
                    if (user.role === 'student') {
                        const assigned = await getAssignedCourseTitles(user.email);
                        assignmentCounts[user.email] = assigned.length;
                    }
                }
                setAssignedCourseCounts(assignmentCounts);

            } catch (err) {
                console.error("Failed to fetch data:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchInitialData();
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

        // Robustly extract department names by removing anything in parentheses first
        const rawDeptStr = user.course || user.department || "";
        const cleanDeptStr = rawDeptStr.split("(")[0].trim();
        const deptNames = cleanDeptStr.split(/[،,]/).map(s => s.trim()).filter(Boolean);

        setEditForm({
            name: user.name,
            email: user.email,
            password: user.password || "",
            phone: user.phone || "",
            guardian: user.guardian || "",
            guardianPhone: user.guardianPhone || "",
            course: user.course || user.department,
            rating,
            bio: user.bio || "",
            rate_per_session: user.rate_per_session || 0,
            selectedDepartments: deptNames,
            selectedSubjects: user.subjects || []
        });
    };

    const handleSaveEdit = async (e) => {
        e.preventDefault();
        const updatedData = { ...editingUser, ...editForm };
        updatedData.subjects = editForm.selectedSubjects;
        updatedData.course = editForm.selectedDepartments.join("، ");

        // Add subjects to course title if in Curricula dept
        if (editForm.selectedDepartments.includes("المناهج الدراسية") && editForm.selectedSubjects.length > 0) {
            updatedData.course = updatedData.course + ` (${editForm.selectedSubjects.join("، ")})`;
        }

        updatedData.department = updatedData.course;

        await updateUser(updatedData);

        setUsers(await getLocalUsers());
        setEditingUser(null);
    };

    const toggleEditDept = (deptName) => {
        setEditForm(prev => {
            const current = prev.selectedDepartments || [];
            const updated = current.includes(deptName)
                ? (current.length > 1 ? current.filter(d => d !== deptName) : current)
                : [...current, deptName];

            // If curricula is removed, clear subjects too
            const extra = (!updated.includes("المناهج الدراسية")) ? { selectedSubjects: [] } : {};

            return { ...prev, selectedDepartments: updated, ...extra };
        });
    };

    const toggleEditSubject = (subjectName) => {
        setEditForm(prev => {
            const current = prev.selectedSubjects || [];
            const updated = current.includes(subjectName)
                ? current.filter(s => s !== subjectName)
                : [...current, subjectName];
            return { ...prev, selectedSubjects: updated };
        });
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
    const openAssignModal = async (user) => {
        setAssigningToUser(user);
        const assigned = await getAssignedCourseTitles(user.email);
        setSelectedCourses(assigned || []);
    };

    const handleSaveAssignments = async () => {
        if (assigningToUser) {
            await saveCourseAssignments(assigningToUser.email, selectedCourses);

            // Update local count
            setAssignedCourseCounts(prev => ({
                ...prev,
                [assigningToUser.email]: selectedCourses.length
            }));

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

    // Course Management Handlers
    const openEditCourseModal = (course) => {
        setEditingCourse(course);
        setEditCourseForm(course);
    };

    const handleSaveCourseEdit = async (e) => {
        e.preventDefault();
        const success = await updatePlatformCourse(editingCourse, editCourseForm);

        if (success) {
            const updatedCourses = await getPlatformCourses();
            setAllCourses(updatedCourses);
            setEditingCourse(null);
            setToast({ message: "تم تحديث اسم الدورة بنجاح", type: "success" });
            setTimeout(() => setToast(null), 3000);
        } else {
            setToast({ message: "فشل تحديث اسم الدورة", type: "error" });
        }
    };

    const confirmDeleteCourse = async () => {
        const success = await deletePlatformCourse(courseToDelete);

        if (success) {
            const updatedCourses = await getPlatformCourses();
            setAllCourses(updatedCourses);
            setCourseToDelete(null);
            setToast({ message: "تم حذف الدورة بنجاح", type: "success" });
            setTimeout(() => setToast(null), 3000);
        } else {
            setToast({ message: "فشل حذف الدورة", type: "error" });
        }
    };

    const handleAddCourse = async (e) => {
        e.preventDefault();
        if (!newCourseName.trim()) return;

        if (allCourses.includes(newCourseName)) {
            setToast({ message: "هذه الدورة موجودة بالفعل", type: "error" });
            setTimeout(() => setToast(null), 3000);
            return;
        }

        const result = await addPlatformCourse(newCourseName);

        if (result) {
            const updatedCourses = await getPlatformCourses();
            setAllCourses(updatedCourses);
            setNewCourseName("");
            setIsAddingCourse(false);
            setToast({ message: "تم إضافة الدورة بنجاح", type: "success" });
            setTimeout(() => setToast(null), 3000);
        } else {
            setToast({ message: "فشل إضافة الدورة", type: "error" });
        }
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
                    <button
                        onClick={() => setActiveTab("courses")}
                        className={`flex-1 rounded-xl py-3 text-sm font-bold transition-all ${activeTab === "courses"
                            ? "bg-white text-emerald-700 shadow-sm"
                            : "text-slate-500 hover:text-emerald-700 hover:bg-emerald-50"
                            }`}
                    >
                        الدورات
                    </button>
                </div>

                {/* Users Table / List */}
                <div className="overflow-x-auto overflow-y-auto max-h-[600px] custom-scrollbar">
                    {activeTab === "courses" ? (
                        <div className="space-y-4">
                            <div className="flex justify-between items-center mb-2">
                                <h3 className="text-lg font-bold text-emerald-900">قائمة الدورات المتاحة</h3>
                                <button
                                    onClick={() => setIsAddingCourse(true)}
                                    className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-black text-white shadow-lg shadow-emerald-600/20 transition-all hover:bg-emerald-700 hover:-translate-y-0.5"
                                >
                                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                                    </svg>
                                    إضافة دورة جديدة
                                </button>
                            </div>
                            <table className="w-full text-right text-sm">
                                <thead>
                                    <tr className="border-b border-emerald-100 text-emerald-900">
                                        <th className="py-4 pl-4 font-bold">اسم الدورة</th>
                                        <th className="py-4 pl-4 font-bold">عدد الفيديوهات</th>
                                        <th className="py-4 font-bold w-32">الإجراءات</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-emerald-50/50">
                                    {allCourses.length > 0 ? (
                                        allCourses.map((course, index) => {
                                            const videoCount = videoCounts[course] || 0;
                                            return (
                                                <tr key={index} className="group transition-colors hover:bg-emerald-50/30">
                                                    <td className="py-4 pl-4 font-bold text-emerald-950">{course}</td>
                                                    <td className="py-4 pl-4 text-slate-500">{videoCount} فيديوهات</td>
                                                    <td className="py-4">
                                                        <div className="flex items-center gap-2">
                                                            <button
                                                                onClick={() => openEditCourseModal(course)}
                                                                className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600 transition-colors hover:bg-emerald-200"
                                                                title="تعديل الاسم"
                                                            >
                                                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                                                </svg>
                                                            </button>
                                                            <button
                                                                onClick={() => setCourseToDelete(course)}
                                                                className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-100 text-red-600 transition-colors hover:bg-red-200"
                                                                title="حذف الدورة"
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
                                            <td colSpan="3" className="py-8 text-center text-slate-500">
                                                لا توجد دورات حاليًا.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <table className="w-full text-right text-sm">
                            <thead>
                                <tr className="border-b border-emerald-100 text-emerald-900">
                                    <th className="py-4 pl-4 font-bold">بيانات العضو</th>
                                    <th className="py-4 pl-4 font-bold">بيانات التواصل والحساب</th>
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
                                        <td colSpan="6" className="py-12 text-center">
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
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="py-4 pl-4">
                                                    <div className="flex flex-col gap-1">
                                                        <span className="text-[11px] text-slate-500 flex items-center gap-1 font-medium">
                                                            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                                            </svg>
                                                            {user.email}
                                                        </span>
                                                        <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-1 bg-emerald-50 w-fit px-2 py-0.5 rounded">
                                                            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                                            </svg>
                                                            {user.password || "—"}
                                                        </span>
                                                        <span className="text-[11px] text-slate-600 flex items-center gap-1 font-bold">
                                                            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.948V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                                            </svg>
                                                            {user.phone || "بدون هاتف"}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="py-4 pl-4">
                                                    <span className="text-xs font-mono font-bold text-emerald-800">#{user.memberNumber || user.id.slice(0, 8)}</span>
                                                </td>
                                                <td className="py-4 pl-4">
                                                    <div className="flex flex-col gap-1 items-start">
                                                        <span className="inline-flex rounded-lg bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
                                                            {user.course || user.department}
                                                            {((user.course || user.department || "").includes("المناهج الدراسية") && !(user.course || user.department || "").includes("(") && (user.subjects?.length > 0 || user.registered_subjects?.length > 0)) ? ` (${(user.subjects || user.registered_subjects).join("، ")})` : ""}
                                                        </span>
                                                    </div>
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
                                                            {mounted && assignedCourseCounts[user.email] > 0 ? "تعديل الدورات" : "إتاحة دورات"}
                                                        </button>
                                                    </td>
                                                ) : (
                                                    <td className="py-4 pl-4">
                                                        <button
                                                            onClick={() => toggleTeacherStatus(user)}
                                                            className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[10px] font-black uppercase tracking-wider transition-all hover:scale-105 active:scale-95 ${status === "إجازة" || status.includes("غير متاح")
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
                                        <td colSpan="6" className="py-8 text-center text-slate-500">
                                            لا يوجد أعضاء في هذا القسم حاليًا.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {/* Edit Modal (Overlay) */}
            {editingUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-emerald-950/40 p-4 backdrop-blur-sm animate-in fade-in">
                    <div className="modern-card flex flex-col w-full max-w-2xl max-h-[90vh] rounded-3xl border border-white bg-white shadow-2xl animate-in zoom-in-95 overflow-hidden">
                        <div className="p-4 sm:p-5 border-b border-emerald-50 bg-emerald-50/10 shrink-0">
                            <div className="flex items-center gap-2.5">
                                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500 text-white shadow-lg shadow-emerald-500/20">
                                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                    </svg>
                                </div>
                                <div>
                                    <h2 className="text-lg font-black text-emerald-950 leading-tight">تعديل بيانات العضو</h2>
                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">Quick Edit • Update Information</p>
                                </div>
                            </div>
                        </div>

                        <form onSubmit={handleSaveEdit} className="flex flex-col flex-1 overflow-hidden">
                            <div className="flex-1 overflow-y-auto custom-scrollbar p-4 sm:p-6 pt-5">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3.5">
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-extrabold text-slate-500 pr-1">الاسم الكامل</label>
                                        <input
                                            type="text"
                                            required
                                            value={editForm.name}
                                            onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none transition-all focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/5"
                                            placeholder="الاسم الكامل"
                                        />
                                    </div>

                                    <div className="space-y-1">
                                        <label className="text-[10px] font-extrabold text-slate-500 pr-1">البريد الإلكتروني</label>
                                        <input
                                            type="email"
                                            required
                                            value={editForm.email}
                                            onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                                            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none transition-all focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/5"
                                            placeholder="example@mail.com"
                                        />
                                    </div>

                                    <div className="space-y-1">
                                        <label className="text-[10px] font-extrabold text-slate-500 pr-1">كلمة السر</label>
                                        <input
                                            type="text"
                                            required
                                            value={editForm.password}
                                            onChange={(e) => setEditForm({ ...editForm, password: e.target.value })}
                                            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none transition-all focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/5 font-mono"
                                            dir="ltr"
                                        />
                                    </div>

                                    <div className="space-y-1">
                                        <label className="text-[10px] font-extrabold text-slate-500 pr-1">رقم الهاتف</label>
                                        <input
                                            type="text"
                                            required
                                            value={editForm.phone}
                                            onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                                            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none transition-all focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/5 font-mono"
                                            dir="ltr"
                                        />
                                    </div>

                                    {editingUser.role === "student" && (
                                        <>
                                            <div className="space-y-1">
                                                <label className="text-[10px] font-extrabold text-amber-600/80 pr-1">اسم ولي الأمر</label>
                                                <input
                                                    type="text"
                                                    value={editForm.guardian}
                                                    onChange={(e) => setEditForm({ ...editForm, guardian: e.target.value })}
                                                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-amber-400 outline-none shadow-sm shadow-amber-500/5"
                                                    placeholder="الاسم الكامل لولي الأمر"
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[10px] font-extrabold text-amber-600/80 pr-1">هاتف ولي الأمر</label>
                                                <input
                                                    type="text"
                                                    value={editForm.guardianPhone}
                                                    onChange={(e) => setEditForm({ ...editForm, guardianPhone: e.target.value })}
                                                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-amber-400 outline-none font-mono shadow-sm shadow-amber-500/5"
                                                    dir="ltr"
                                                    placeholder="010XXXXXXXX"
                                                />
                                            </div>
                                        </>
                                    )}

                                    <div className="sm:col-span-2 mt-1">
                                        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                                            {["ركن القرآن الكريم", "اللغة العربية لغير الناطقين", "المناهج الدراسية"].map((dept) => (
                                                <button
                                                    key={dept}
                                                    type="button"
                                                    onClick={() => toggleEditDept(dept)}
                                                    className={`group relative flex items-center justify-between rounded-xl border-2 p-3 transition-all ${editForm.selectedDepartments.includes(dept)
                                                        ? "border-emerald-500 bg-emerald-50/50 text-emerald-950 shadow-sm"
                                                        : "border-slate-50 bg-slate-50/10 text-slate-400 hover:border-emerald-100 hover:text-slate-600"
                                                        }`}
                                                >
                                                    <span className="text-[10px] font-black">{dept}</span>
                                                    {editForm.selectedDepartments.includes(dept) && (
                                                        <div className="flex h-3.5 w-3.5 items-center justify-center rounded-full bg-emerald-500 text-white">
                                                            <svg className="h-2.5 w-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}>
                                                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                                            </svg>
                                                        </div>
                                                    )}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {editForm.selectedDepartments.includes("المناهج الدراسية") && (
                                        <div className="sm:col-span-2 p-3.5 rounded-xl bg-slate-50 border border-slate-200/50">
                                            <div className="flex items-center gap-2 mb-2.5">
                                                <span className="h-1 w-4 bg-emerald-400 rounded-full"></span>
                                                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">المواد الدراسية</p>
                                            </div>
                                            <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-4">
                                                {CURRICULA_SUBJECTS.map((sub) => (
                                                    <button
                                                        key={sub.name}
                                                        type="button"
                                                        onClick={() => toggleEditSubject(sub.name)}
                                                        className={`flex items-center gap-1.5 rounded-lg border px-2 py-1.5 transition-all transform active:scale-95 ${editForm.selectedSubjects.includes(sub.name)
                                                            ? "border-emerald-500 bg-white text-emerald-900 shadow-sm ring-1 ring-emerald-500/10"
                                                            : "border-slate-200 bg-white text-slate-400 hover:border-emerald-200 hover:text-slate-600"
                                                            }`}
                                                    >
                                                        <span className="text-xs">{sub.icon}</span>
                                                        <span className="text-[9px] font-bold truncate">{sub.name}</span>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {editingUser.role === "teacher" && (
                                        <>
                                            <div className="sm:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                <div className="space-y-1">
                                                    <label className="text-[10px] font-extrabold text-slate-500 pr-1">سعر الحصة (جنيه/دولار)</label>
                                                    <input
                                                        type="number"
                                                        value={editForm.rate_per_session}
                                                        onChange={(e) => setEditForm({ ...editForm, rate_per_session: e.target.value })}
                                                        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-emerald-500 outline-none"
                                                        placeholder="0.00"
                                                    />
                                                </div>
                                                <div className="space-y-1">
                                                    <label className="text-[9px] font-black text-amber-800 uppercase tracking-widest flex justify-between">
                                                        <span>تقييم المعلم</span>
                                                        <span>{editForm.rating} ★</span>
                                                    </label>
                                                    <div className="flex items-center h-9">
                                                        <input
                                                            type="range"
                                                            min="1" max="5" step="0.1"
                                                            value={editForm.rating}
                                                            onChange={(e) => setEditForm({ ...editForm, rating: e.target.value })}
                                                            className="w-full h-1 bg-amber-100 rounded-lg appearance-none cursor-pointer accent-amber-500"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="sm:col-span-2 space-y-1">
                                                <label className="text-[10px] font-extrabold text-slate-500 pr-1">النبذة التعريفية (Bio)</label>
                                                <textarea
                                                    rows="2"
                                                    value={editForm.bio}
                                                    onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                                                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-emerald-500 outline-none resize-none custom-scrollbar"
                                                    placeholder="اكتب نبذة قصيرة عن المعلم..."
                                                ></textarea>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>

                            <div className="p-4 sm:p-5 bg-slate-50/50 border-t border-emerald-50 shrink-0 mt-auto">
                                <div className="flex gap-2.5">
                                    <button
                                        type="submit"
                                        className="relative overflow-hidden group flex-[2] rounded-xl bg-emerald-600 py-3 text-xs font-black text-white shadow-lg shadow-emerald-600/20 transition-all hover:bg-emerald-700 hover:-translate-y-0.5"
                                    >
                                        <div className="relative z-10 flex items-center justify-center gap-2">
                                            <span>تأكيد وحفظ التعديلات</span>
                                            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                            </svg>
                                        </div>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setEditingUser(null)}
                                        className="flex-1 rounded-xl bg-white border border-slate-200 py-3 text-xs font-bold text-slate-500 hover:bg-slate-50 hover:text-slate-700"
                                    >
                                        إلغاء
                                    </button>
                                </div>
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
            {/* Edit Course Modal */}
            {editingCourse && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-emerald-950/40 p-4 backdrop-blur-sm animate-in fade-in">
                    <div className="modern-card w-full max-w-md rounded-3xl border border-white p-6 shadow-2xl bg-white sm:p-8 animate-in zoom-in-95">
                        <h2 className="mb-6 text-2xl font-black text-emerald-950">تعديل اسم الدورة</h2>
                        <form onSubmit={handleSaveCourseEdit} className="space-y-4">
                            <div>
                                <label className="mb-1.5 block text-sm font-bold text-emerald-900">الاسم الجديد</label>
                                <input
                                    type="text"
                                    required
                                    value={editCourseForm}
                                    onChange={(e) => setEditCourseForm(e.target.value)}
                                    className="w-full rounded-xl border border-emerald-200 bg-emerald-50/30 px-4 py-3 text-emerald-950 outline-none transition focus:border-emerald-400 focus:ring-1 focus:ring-emerald-300/40"
                                />
                            </div>
                            <div className="mt-6 flex gap-3 pt-2">
                                <button
                                    type="submit"
                                    className="glow-button flex-1 rounded-xl bg-gradient-to-l from-emerald-500 to-emerald-600 py-3 text-sm font-bold text-white transition-all hover:from-emerald-400 hover:to-emerald-500 shadow-lg shadow-emerald-500/20"
                                >
                                    حفظ التعديلات
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setEditingCourse(null)}
                                    className="flex-1 rounded-xl bg-slate-100 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-200"
                                >
                                    إلغاء
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Course Delete Confirmation Modal */}
            {courseToDelete && (
                <div className="fixed inset-0 z-[70] flex items-center justify-center bg-emerald-950/40 p-4 backdrop-blur-sm animate-in fade-in">
                    <div className="modern-card w-full max-w-sm rounded-[2rem] border border-white bg-white p-8 text-center shadow-2xl animate-in zoom-in-95">
                        <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full border-[4px] border-red-500/20 bg-red-50 text-red-500">
                            <span className="text-4xl font-black">!</span>
                        </div>
                        <h2 className="mb-2 text-2xl font-black text-slate-800">حذف الدورة؟</h2>
                        <p className="mb-8 text-sm text-slate-500">
                            سيتم حذف الدورة "{courseToDelete}" وجميع الفيديوهات المرتبطة بها نهائيًا!
                        </p>

                        <div className="flex gap-3">
                            <button
                                onClick={confirmDeleteCourse}
                                className="flex-1 rounded-xl bg-red-500 py-3.5 text-sm font-bold text-white shadow-lg shadow-red-500/30 transition hover:bg-red-600 hover:-translate-y-0.5"
                            >
                                حذف نهائي
                            </button>
                            <button
                                onClick={() => setCourseToDelete(null)}
                                className="flex-1 rounded-xl bg-slate-100 py-3.5 text-sm font-bold text-slate-700 transition hover:bg-slate-200"
                            >
                                إلغاء
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Add Course Modal */}
            {isAddingCourse && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-emerald-950/40 p-4 backdrop-blur-sm animate-in fade-in">
                    <div className="modern-card w-full max-w-md rounded-3xl border border-white p-6 shadow-2xl bg-white sm:p-8 animate-in zoom-in-95">
                        <h2 className="mb-6 text-2xl font-black text-emerald-950">إضافة دورة جديدة</h2>
                        <form onSubmit={handleAddCourse} className="space-y-4">
                            <div>
                                <label className="mb-1.5 block text-sm font-bold text-emerald-900">اسم الدورة</label>
                                <input
                                    type="text"
                                    required
                                    autoFocus
                                    value={newCourseName}
                                    onChange={(e) => setNewCourseName(e.target.value)}
                                    placeholder="أدخل اسم الدورة..."
                                    className="w-full rounded-xl border border-emerald-200 bg-emerald-50/30 px-4 py-3 text-emerald-950 outline-none transition focus:border-emerald-400 focus:ring-1 focus:ring-emerald-300/40"
                                />
                            </div>
                            <div className="mt-6 flex gap-3 pt-2">
                                <button
                                    type="submit"
                                    className="glow-button flex-1 rounded-xl bg-gradient-to-l from-emerald-500 to-emerald-600 py-3 text-sm font-bold text-white transition-all hover:from-emerald-400 hover:to-emerald-500 shadow-lg shadow-emerald-500/20"
                                >
                                    حفظ الدورة
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsAddingCourse(false);
                                        setNewCourseName("");
                                    }}
                                    className="flex-1 rounded-xl bg-slate-100 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-200"
                                >
                                    إلغاء
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </main>
    );
}

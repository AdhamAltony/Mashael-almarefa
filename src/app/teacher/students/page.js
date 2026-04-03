"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";

const NAV_LINKS = [
    { label: "طلاب القسم", href: "/teacher/students" },
    { label: "الملف الشخصي", href: "/teacher/profile" },
    { label: "تسجيل حضور", href: "/teacher/attendance" },
];

function ProgressModal({ student, onClose, onSave }) {
    const [progress, setProgress] = useState({
        attendance: "95",
        rating: "8.5",
        hours: "20",
        nextLesson: "قريباً",
        reading: "80",
        writing: "70",
        listening: "90",
        conversation: "85",
        achievements: "",
        notes: ""
    });
    const [sessions, setSessions] = useState([]);
    const [newSession, setNewSession] = useState({ date: "", time: "", meetLink: "" });

    useEffect(() => {
        const savedProgress = localStorage.getItem(`progress_${student.email}`);
        if (savedProgress) setProgress(JSON.parse(savedProgress));

        const savedSessions = localStorage.getItem(`sessions_${student.email}`);
        if (savedSessions) setSessions(JSON.parse(savedSessions));
    }, [student.email]);

    const handleAddSession = () => {
        if (!newSession.date || !newSession.time) return;
        const updated = [...sessions, { ...newSession, id: Date.now(), title: student.course || "حصة جديدة" }];
        setSessions(updated);
        setNewSession({ date: "", time: "", meetLink: "" });
    };

    const removeSession = (id) => {
        setSessions(prev => prev.filter(s => s.id !== id));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        localStorage.setItem(`sessions_${student.email}`, JSON.stringify(sessions));
        onSave(student.email, progress);
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
            <div className="w-full max-w-2xl overflow-hidden rounded-[2.5rem] bg-white shadow-2xl animate-in fade-in zoom-in duration-300">
                <div className="bg-emerald-600 px-8 py-6 text-white text-center">
                    <h2 className="text-2xl font-black text-white">تحديث تقدم الطالب</h2>
                    <p className="mt-1 text-emerald-100 font-medium">{student.name}</p>
                </div>

                <form onSubmit={handleSubmit} className="max-h-[80vh] overflow-y-auto p-8 text-right" dir="rtl">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <h3 className="font-bold text-emerald-800 border-b border-emerald-100 pb-2">موعد الحصص القادمة</h3>
                            <div>
                                <input type="text" value={progress.nextLesson} onChange={(e) => setProgress({ ...progress, nextLesson: e.target.value })} placeholder="اكتب موعد الحصة القادمة هنا..." className="w-full rounded-xl border border-emerald-100 bg-emerald-50/30 px-4 py-2 text-sm outline-none focus:border-emerald-500" />
                            </div>

                            <h3 className="font-bold text-emerald-800 border-b border-emerald-100 pb-2 mt-6">جدولة الحصص القادمة</h3>

                            <div className="space-y-2">
                                {sessions.map(s => (
                                    <div key={s.id} className="flex items-center justify-between rounded-xl bg-emerald-50 px-3 py-2 text-xs">
                                        <div className="flex flex-col">
                                            <span className="font-bold text-emerald-900">{s.title}</span>
                                            <span className="text-slate-500">{s.date} - {s.time}</span>
                                        </div>
                                        <button type="button" onClick={() => removeSession(s.id)} className="text-red-500 hover:text-red-700">
                                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                        </button>
                                    </div>
                                ))}
                            </div>

                            <div className="grid grid-cols-2 gap-2 mt-4">
                                <input type="date" value={newSession.date} onChange={(e) => setNewSession({ ...newSession, date: e.target.value })} className="rounded-xl border border-emerald-100 bg-emerald-50/30 px-3 py-2 text-xs outline-none focus:border-emerald-500" />
                                <input type="time" value={newSession.time} onChange={(e) => setNewSession({ ...newSession, time: e.target.value })} className="rounded-xl border border-emerald-100 bg-emerald-50/30 px-3 py-2 text-xs outline-none focus:border-emerald-500" />
                                <input type="text" placeholder="رابط الحصة (Meets...)" value={newSession.meetLink} onChange={(e) => setNewSession({ ...newSession, meetLink: e.target.value })} className="col-span-2 rounded-xl border border-emerald-100 bg-emerald-50/30 px-3 py-2 text-xs outline-none focus:border-emerald-500" />
                                <button type="button" onClick={handleAddSession} className="col-span-2 rounded-xl bg-emerald-100 py-2 text-xs font-bold text-emerald-700 hover:bg-emerald-200">
                                    + إضافة حصة قادمة
                                </button>
                            </div>

                            <div className="pt-2">
                                <label className="block text-xs font-bold text-slate-500 mb-1">أبرز الملاحظات والإنجازات</label>
                                <textarea value={progress.achievements} onChange={(e) => setProgress({ ...progress, achievements: e.target.value })} rows={3} placeholder="اكتب ملاحظات وإنجازات الطالب هنا..." className="w-full rounded-xl border border-emerald-100 bg-emerald-50/30 px-4 py-2 text-sm outline-none focus:border-emerald-500 resize-none" />
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h3 className="font-bold text-emerald-800 border-b border-emerald-100 pb-2">تقدم المهارات (%)</h3>
                            {['reading', 'writing', 'listening', 'conversation'].map((skill) => (
                                <div key={skill}>
                                    <label className="block text-xs font-bold text-slate-500 mb-1">
                                        {skill === 'reading' ? 'القراءة' : skill === 'writing' ? 'الكتابة' : skill === 'listening' ? 'الاستماع' : 'المحادثة'}
                                    </label>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="range"
                                            min="0" max="100"
                                            value={progress[skill]}
                                            onChange={(e) => setProgress({ ...progress, [skill]: e.target.value })}
                                            className="h-2 flex-1 bg-emerald-100 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                                        />
                                        <span className="text-xs font-bold text-emerald-600 w-8">{progress[skill]}%</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 border-t border-emerald-50 pt-6">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 mb-1">نسبة الحضور (%)</label>
                            <input type="number" value={progress.attendance} onChange={(e) => setProgress({ ...progress, attendance: e.target.value })} className="w-full rounded-xl border border-emerald-100 bg-emerald-50/30 px-4 py-3 text-sm outline-none focus:border-emerald-500" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 mb-1">التقييم العام (من 10)</label>
                            <input type="text" value={progress.rating} onChange={(e) => setProgress({ ...progress, rating: e.target.value })} className="w-full rounded-xl border border-emerald-100 bg-emerald-50/30 px-4 py-3 text-sm outline-none focus:border-emerald-500" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 mb-1">إجمالي الساعات</label>
                            <input type="text" value={progress.hours} onChange={(e) => setProgress({ ...progress, hours: e.target.value })} className="w-full rounded-xl border border-emerald-100 bg-emerald-50/30 px-4 py-3 text-sm outline-none focus:border-emerald-500" />
                        </div>
                    </div>

                    <div className="mt-8 flex gap-3">
                        <button type="submit" className="flex-1 rounded-xl bg-emerald-600 py-3 font-bold text-white shadow-lg shadow-emerald-600/20 transition-all hover:bg-emerald-500">حفظ التعديلات</button>
                        <button type="button" onClick={onClose} className="flex-1 rounded-xl bg-slate-100 py-3 font-bold text-slate-600 transition-all hover:bg-slate-200">إلغاء</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default function TeacherStudentsPage() {
    const [students, setStudents] = useState([]);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [department, setDepartment] = useState("");
    const [loading, setLoading] = useState(true);
    const [studentToDelete, setStudentToDelete] = useState(null);
    const router = useRouter();

    useEffect(() => {
        const fetchStudents = async () => {
            const cookies = document.cookie.split("; ");
            const sessionCookie = cookies.find(c => c.startsWith("session="));

            if (!sessionCookie) {
                router.push("/auth/login");
                return;
            }

            try {
                const base64 = decodeURIComponent(sessionCookie.split("=")[1]);
                const decoded = decodeURIComponent(atob(base64));
                const sessionData = JSON.parse(decoded);

                let deptName = sessionData.department || sessionData.course || "";
                setDepartment(deptName);

                const teacherEmail = sessionData.email;
                const { getLocalUsers } = require("@/utils/local-db");
                const allUsers = await getLocalUsers();
                const filtered = allUsers.filter(u => {
                    if (u.role !== "student") return false;
                    const tEmail = teacherEmail?.trim().toLowerCase();
                    const tName = sessionData.name?.trim().toLowerCase();

                    // 1. Check DB-synced subscriptions map first
                    const dbSubscriptions = u.subscriptions || {};
                    if (Object.keys(dbSubscriptions).length > 0) {
                        const isSubscribed = Object.values(dbSubscriptions).some(sub => 
                            sub.email?.trim().toLowerCase() === tEmail || 
                            sub.name?.trim().toLowerCase() === tName
                        );
                        if (isSubscribed) return true;
                    }

                    // 2. Fallback to LocalStorage for legacy or unsynced data
                    const profile = JSON.parse(localStorage.getItem(`student_profile_${u.email}`) || "{}");
                    const sTeacherEmail = profile.assignedTeacherEmail?.trim().toLowerCase();
                    const sTeacherName = profile.assignedTeacher?.trim().toLowerCase();
                    
                    if (sTeacherEmail === tEmail || (sTeacherName && sTeacherName === tName)) return true;

                    const localSubscriptions = profile.subscriptions || {};
                    return Object.values(localSubscriptions).some(sub => 
                        sub.email?.trim().toLowerCase() === tEmail || 
                        sub.name?.trim().toLowerCase() === tName
                    );
                });

                // Fetch images from student profiles
                const studentsWithImages = filtered.map(s => {
                    const profile = localStorage.getItem(`student_profile_${s.email}`);
                    if (profile) {
                        const parsed = JSON.parse(profile);
                        return { ...s, image: parsed.image || s.image };
                    }
                    return s;
                });

                setStudents(studentsWithImages);
            } catch (e) {
                console.error("Session error", e);
            } finally {
                setLoading(false);
            }
        };
        
        fetchStudents();
    }, [router]);

    const handleSave = (studentEmail, progress) => {
        localStorage.setItem(`progress_${studentEmail}`, JSON.stringify(progress));
        alert("تم حفظ بيانات التقدم بنجاح!");
        setSelectedStudent(null);
    };

    const confirmDelete = () => {
        if (studentToDelete) {
            // Instead of deleting the user, we just unsubscribe them from this teacher
            const profileKey = `student_profile_${studentToDelete.email}`;
            const studentProfile = JSON.parse(localStorage.getItem(profileKey) || "{}");
            
            // 1. Remove from subscriptions map
            const subscriptions = studentProfile.subscriptions || {};
            // Filter out subscriptions for this teacher (by email or name)
            const teacherEmail = studentProfile.assignedTeacherEmail || ""; // Legacy
            const teacherName = studentProfile.assignedTeacher || ""; // Legacy
            
            // Access current teacher info from session storage (where it was loaded in useEffect)
            // But actually we have studentToDelete which might have old fields, or we can just clear everything that matches this teacher.
            // Let's find the current teacher's identifier. 
            // We can try to get it from the session again.
            const cookies = document.cookie.split("; ");
            const session = cookies.find(c => c.startsWith("session="));
            let tIdentifier = "";
            if (session) {
                const data = JSON.parse(decodeURIComponent(atob(decodeURIComponent(session.split("=")[1]))));
                tIdentifier = data.email?.trim().toLowerCase();
            }

            if (tIdentifier) {
                delete subscriptions[tIdentifier];
            }

            const updatedProfile = { 
                ...studentProfile, 
                assignedTeacher: "", 
                assignedTeacherEmail: "",
                subscriptions: subscriptions
            };
            
            localStorage.setItem(profileKey, JSON.stringify(updatedProfile));
            
            // Re-sync UI
            setStudents(prev => prev.filter(s => s.id !== studentToDelete.id));
            setStudentToDelete(null);

            // Sync with Supabase (if possible)
            import("@/utils/local-db").then(({ updateUser }) => {
                updateUser({ ...updatedProfile, id: studentToDelete.id, email: studentToDelete.email, role: "student" });
            });
            
            Swal.fire({
                title: "تم الفصل!",
                text: "تم إزالة الطالب من قائمتك. يمكنه الاشتراك معك مرة أخرى في أي وقت.",
                icon: "success",
                confirmButtonText: "موافق",
                confirmButtonColor: "#10b981",
                timer: 2000
            });
        }
    };

    if (loading) return <div className="p-10 text-center text-emerald-900 font-bold">جاري التحميل...</div>;

    return (
        <main dir="rtl" className="relative flex min-h-[100dvh] flex-col overflow-x-clip text-emerald-950 font-sans">
            <div className="fixed inset-0 z-[-1] bg-gradient-to-b from-[#f8fbfb] via-[#f2f8f8] to-[#eef5f5]">
                <div className="absolute top-0 right-0 h-[500px] w-[500px] -translate-x-1/4 -translate-y-1/4 rounded-full bg-emerald-100/60 blur-3xl pointer-events-none" />
                <div className="absolute bottom-0 left-0 h-[600px] w-[600px] translate-x-1/3 translate-y-1/4 rounded-full bg-emerald-50/80 blur-3xl pointer-events-none" />
            </div>

            <section className="relative z-10 flex flex-1 flex-col px-4 pt-10 pb-16 sm:px-6">
                <div className="mx-auto w-full max-w-5xl">
                    <header className="mb-10 text-center">
                        <span className="mb-4 inline-block rounded-full bg-emerald-100 px-5 py-2 text-sm font-bold text-emerald-700 shadow-sm border border-emerald-200/50">
                            بوابة المعلمين - {department}
                        </span>
                        <h1 className="mb-4 text-3xl font-black text-emerald-950 sm:text-4xl text-balance">الطلبة المسجلين بالقسم</h1>
                        <p className="mx-auto max-w-xl text-base text-slate-600 sm:text-lg text-balance">إدارة وتحديث تقدم الطلاب المسجلين في هذا القسم.</p>
                    </header>

                    <div className="modern-card overflow-hidden rounded-[2rem] border border-white/60 bg-white/60 shadow-2xl shadow-emerald-900/5">
                        <div className="overflow-x-auto">
                            <table className="w-full text-right text-sm text-slate-600">
                                <thead className="bg-emerald-50/80 text-emerald-900 border-b border-emerald-200/60">
                                    <tr>
                                        <th className="px-6 py-4 font-bold">#</th>
                                        <th className="px-6 py-4 font-bold">بيانات الطالب</th>
                                        <th className="px-6 py-4 font-bold text-center">العمر</th>
                                        <th className="px-6 py-4 font-bold">المستوى / الصف</th>
                                        <th className="px-6 py-4 font-bold text-center">الإجراءات</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-emerald-100/60 font-medium">
                                    {students.map((student, idx) => (
                                        <tr key={student.id} className="transition-colors hover:bg-emerald-50/40">
                                            <td className="px-6 py-4 text-slate-500">{idx + 1}</td>
                                            <td className="px-6 py-4 font-bold text-emerald-950">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-10 w-10 flex-shrink-0 rounded-full border-2 border-emerald-100 bg-emerald-50 overflow-hidden flex items-center justify-center text-emerald-600">
                                                        {student.image ? (
                                                            <img src={student.image} alt={student.name} className="h-full w-full object-cover" />
                                                        ) : (
                                                            <span className="text-xs">{student.name.charAt(0)}</span>
                                                        )}
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span>{student.name}</span>
                                                        <span className="text-[10px] text-slate-400 font-mono tracking-tighter">#{student.memberNumber}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-center">{student.age} سنة</td>
                                            <td className="px-6 py-4">
                                                <span className="inline-flex items-center rounded-md bg-emerald-100/40 px-2 py-1 text-xs font-bold text-emerald-700">{student.level || student.course}</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center justify-center gap-2">
                                                    <button
                                                        onClick={() => setSelectedStudent(student)}
                                                        className="rounded-lg bg-emerald-600 px-3 py-2 text-[10px] font-bold text-white transition-all hover:bg-emerald-500"
                                                    >
                                                        تحديث التقدم
                                                    </button>
                                                    <Link
                                                        href={`/teacher/attendance?email=${student.email}`}
                                                        className="rounded-lg border border-emerald-200 px-3 py-2 text-[10px] font-bold text-emerald-700 hover:bg-emerald-50 text-center"
                                                    >
                                                        تسجيل حضور
                                                    </Link>
                                                    <button
                                                        onClick={() => setStudentToDelete(student)}
                                                        className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-500 transition-all"
                                                        title="حذف الطالب"
                                                    >
                                                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                        </svg>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {students.length === 0 && (
                                <div className="p-12 text-center text-slate-500 font-medium">
                                    لا يوجد طلاب مسجلين في هذا القسم حالياً.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            {selectedStudent && (
                <ProgressModal
                    student={selectedStudent}
                    onClose={() => setSelectedStudent(null)}
                    onSave={handleSave}
                />
            )}

            {/* Admin-Style Delete Confirmation */}
            {studentToDelete && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center bg-emerald-950/40 p-4 backdrop-blur-sm animate-in fade-in">
                    <div className="modern-card w-full max-w-sm rounded-[2rem] border border-white bg-white p-8 text-center shadow-2xl animate-in zoom-in-95">
                        <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full border-[4px] border-red-500/20 bg-red-50 text-red-500">
                            <span className="text-4xl font-black">!</span>
                        </div>
                        <h2 className="mb-2 text-2xl font-black text-slate-800">هل أنت متأكد؟</h2>
                        <p className="mb-8 text-sm text-slate-500">
                            لن تتمكن من التراجع عن عملية حذفك للطالب {studentToDelete.name} بأي شكل!
                        </p>

                        <div className="flex gap-3">
                            <button
                                onClick={confirmDelete}
                                className="flex-1 rounded-xl bg-red-500 py-3.5 text-sm font-bold text-white shadow-lg shadow-red-500/30 transition hover:bg-red-600 hover:-translate-y-0.5"
                            >
                                حذف
                            </button>
                            <button
                                onClick={() => setStudentToDelete(null)}
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

"use client";

import { useState, useEffect } from "react";
import AdminNavbar from "../admin/admin-navbar";
import Swal from "sweetalert2";

export default function CoursesCenterPage() {
    const [courses, setCourses] = useState([]);
    const [videos, setVideos] = useState([]);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);

    const [formData, setFormData] = useState({
        title: "",
        date: new Date().toISOString().split('T')[0],
        videoFile: null,
        thumbnailFile: null,
        notes: ""
    });

    const ADMIN_LINKS = [
        { label: "لوحة الإدارة", href: "/admin/dashboard" },
        { label: "لوحة التحكم", href: "/admin" },
        { label: "تقارير المعلمين", href: "/admin/teacher-sessions" },
        { label: "مركز الدورات", href: "/courses-center" },
    ];

    useEffect(() => {
        const savedCourses = JSON.parse(localStorage.getItem("platform_courses") || "[]");
        setCourses(savedCourses);
        const savedVideos = JSON.parse(localStorage.getItem("platform_videos") || "[]");
        setVideos(savedVideos);
    }, []);

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!formData.videoFile || !formData.title) {
            Swal.fire("تنبيه", "يرجى استكمال البيانات المطلوبة", "warning");
            return;
        }

        setIsUploading(true);
        setUploadProgress(0);

        try {
            const xhr = new XMLHttpRequest();
            const data = new FormData();
            data.append("file", formData.videoFile);

            xhr.upload.addEventListener("progress", (event) => {
                if (event.lengthComputable) {
                    const percent = Math.round((event.loaded / event.total) * 100);
                    setUploadProgress(percent);
                }
            });

            const uploadPromise = new Promise((resolve, reject) => {
                xhr.onreadystatechange = () => {
                    if (xhr.readyState === 4) {
                        if (xhr.status >= 200 && xhr.status < 300) {
                            try {
                                const response = JSON.parse(xhr.responseText);
                                console.log("Server Response:", response);
                                resolve(response);
                            } catch (e) {
                                console.error("JSON Parse Error:", xhr.responseText);
                                reject(new Error("Invalid server response (JSON)"));
                            }
                        } else {
                            console.error("Upload failed with status:", xhr.status, xhr.responseText);
                            reject(new Error(`Upload failed with status: ${xhr.status}`));
                        }
                    }
                };
                xhr.onerror = () => reject(new Error("Network error during upload"));
                xhr.open("POST", "/api/upload");
                xhr.send(data);
            });

            const result = await uploadPromise;

            if (!result.url || result.url === "#") {
                throw new Error("Server did not return a valid video URL");
            }

            const newVideo = {
                id: Date.now(),
                title: formData.title,
                videoUrl: result.url,
                thumbnailUrl: "/Logo.jpeg",
                notes: formData.notes,
                date: formData.date
            };

            const updatedVideos = [newVideo, ...videos];
            setVideos(updatedVideos);
            localStorage.setItem("platform_videos", JSON.stringify(updatedVideos));

            if (!courses.includes(formData.title)) {
                const updatedCourses = [...courses, formData.title];
                setCourses(updatedCourses);
                localStorage.setItem("platform_courses", JSON.stringify(updatedCourses));
            }

            Swal.fire("تم بنجاح", "تم رفع الفيديو والملاحظات بنجاح", "success");
            setFormData({
                title: "",
                date: new Date().toISOString().split('T')[0],
                videoFile: null,
                thumbnailFile: null,
                notes: ""
            });
            e.target.reset();

        } catch (error) {
            console.error("Upload process error:", error);
            Swal.fire("خطأ", error.message || "فشل الرفع، يرجى المحاولة لاحقاً", "error");
        } finally {
            setIsUploading(false);
            setUploadProgress(0);
        }
    };

    return (
        <main className="min-h-screen bg-gradient-to-b from-[#f7fbfb] via-[#eef6f6] to-[#e8f2f2]" dir="rtl">
            <AdminNavbar sectionTitle="مركز الدورات" links={ADMIN_LINKS} />

            <div className="site-container pt-28 pb-20">
                <header className="mb-12 text-center animate-fade-in-up">
                    <p className="inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-4 py-1 text-xs font-bold text-emerald-700 mb-4">
                        نظام إدارة المحتوى التعليمي
                    </p>
                    <h1 className="text-3xl font-black text-[#1a2e2a] sm:text-4xl">رفع الفيديوهات والملاحظات</h1>
                    <p className="mt-4 text-[#7a8c88] font-medium leading-relaxed max-w-2xl mx-auto">
                        يرجى اختيار الدورة ورفع الفيديو الخاص بها مع إضافة أي ملاحظات توضيحية.
                    </p>
                </header>

                <div className="max-w-4xl mx-auto animate-fade-in-up stagger-1">
                    <section className="modern-card rounded-[2.5rem] p-8 md:p-12 shadow-2xl shadow-emerald-900/5 mb-10">
                        <form onSubmit={handleUpload} className="relative z-10 space-y-8">
                            {/* Row 1: Course Name & Date */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-2">
                                    <label className="block text-sm font-bold text-[#1a2e2a]">
                                        اسم الدورة <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        list="courses-datalist"
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        className="w-full rounded-2xl border border-[#e6efed] bg-white px-5 py-4 outline-none focus:border-emerald-500 transition-all placeholder:text-[#b4c3c0]"
                                        placeholder="أدخل اسم الدورة..."
                                        required
                                    />
                                    <datalist id="courses-datalist">
                                        {courses.map(c => <option key={c} value={c} />)}
                                    </datalist>
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-sm font-bold text-[#1a2e2a]">
                                        تاريخ الإضافة <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="date"
                                        value={formData.date}
                                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                        className="w-full rounded-2xl border border-[#e6efed] bg-white px-5 py-4 outline-none focus:border-emerald-500 transition-all text-[#1a2e2a]"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Row 2: Video & Thumbnail Upload Boxes */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-2">
                                    <label className="block text-sm font-bold text-[#1a2e2a]">
                                        رفع فيديو الدورة <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="file"
                                            accept="video/mp4"
                                            onChange={(e) => setFormData({ ...formData, videoFile: e.target.files[0] })}
                                            className="hidden"
                                            id="video-upload"
                                        />
                                        <label
                                            htmlFor="video-upload"
                                            className="flex flex-col items-center justify-center h-48 cursor-pointer rounded-2xl border-2 border-dashed border-emerald-100 bg-emerald-50/20 hover:bg-emerald-50 hover:border-emerald-400 transition-all group"
                                        >
                                            <div className="bg-white shadow-sm p-3 rounded-full mb-3 group-hover:scale-110 transition-transform border border-emerald-50">
                                                <svg className="h-8 w-8 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                                </svg>
                                            </div>
                                            <span className="text-sm font-bold text-[#7a8c88]">
                                                {formData.videoFile ? formData.videoFile.name : "اضغط لرفع الفيديو"}
                                            </span>
                                        </label>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-sm font-bold text-[#1a2e2a]">
                                        صورة مصغرة <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => setFormData({ ...formData, thumbnailFile: e.target.files[0] })}
                                            className="hidden"
                                            id="thumb-upload"
                                        />
                                        <label
                                            htmlFor="thumb-upload"
                                            className="flex flex-col items-center justify-center h-48 cursor-pointer rounded-2xl border-2 border-dashed border-emerald-100 bg-emerald-50/20 hover:bg-emerald-50 hover:border-emerald-400 transition-all group"
                                        >
                                            <div className="bg-white shadow-sm p-3 rounded-full mb-3 group-hover:scale-110 transition-transform border border-emerald-50">
                                                <svg className="h-8 w-8 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a1 1 0 011.414 0L14 15m-4-4l1-1a1 1 0 011.414 0L18 17M7 21h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                </svg>
                                            </div>
                                            <span className="text-sm font-bold text-[#7a8c88]">
                                                {formData.thumbnailFile ? formData.thumbnailFile.name : "اضغط لرفع صورة مصغرة"}
                                            </span>
                                        </label>
                                    </div>
                                </div>
                            </div>

                            {/* Row 3: Notes Area */}
                            <div className="space-y-2">
                                <label className="block text-sm font-bold text-[#1a2e2a]">ملاحظات الدورة / وصف الفيديو</label>
                                <textarea
                                    value={formData.notes}
                                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                    className="w-full h-40 rounded-2xl border border-[#e6efed] bg-white px-5 py-4 outline-none focus:border-emerald-500 transition-all placeholder:text-[#b4c3c0] resize-none"
                                    placeholder="أضف وصفاً للفيديو أو أي ملاحظات هامة للمتدربين..."
                                />
                            </div>

                            {/* Progress & Submit */}
                            <div className="pt-4 flex flex-col items-center gap-6">
                                {isUploading && (
                                    <div className="w-full max-w-md">
                                        <div className="h-3 w-full rounded-full bg-slate-100 overflow-hidden">
                                            <div
                                                className="h-full bg-emerald-500 transition-all duration-300 shadow-[0_0_10px_rgba(16,185,129,0.3)]"
                                                style={{ width: `${uploadProgress}%` }}
                                            />
                                        </div>
                                        <p className="mt-2 text-center text-xs font-black text-emerald-600">جاري الرفع بنجاح: {uploadProgress}%</p>
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={isUploading}
                                    className="glow-button w-full max-w-sm rounded-2xl bg-emerald-600 py-4.5 font-black text-white text-lg shadow-xl shadow-emerald-900/10 hover:bg-emerald-700 transition-all transform hover:-translate-y-1 active:scale-95 disabled:bg-slate-300 disabled:transform-none"
                                >
                                    {isUploading ? "جاري المعالجة..." : "حفظ ورفع المحتوى"}
                                </button>
                            </div>
                        </form>
                    </section>
                </div>
            </div>
        </main>
    );
}

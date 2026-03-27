"use client";

import { useState, useEffect } from "react";
import AdminNavbar from "../admin/admin-navbar";
import Swal from "sweetalert2";
import * as db from "@/utils/db";

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

    const loadData = async () => {
        const savedCourses = await db.getPlatformCourses();
        setCourses(savedCourses);
        const savedVideos = await db.getPlatformVideos();
        setVideos(savedVideos);
    };

    useEffect(() => {
        loadData();
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
                                resolve(response);
                            } catch (e) {
                                reject(new Error("Invalid server response (JSON)"));
                            }
                        } else {
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

            await db.savePlatformVideo(newVideo);
            await db.savePlatformCourse(formData.title);

            await loadData();

            setFormData({
                title: "",
                date: new Date().toISOString().split('T')[0],
                videoFile: null,
                thumbnailFile: null,
                notes: ""
            });

            Swal.fire("نجاح", "تم رفع الفيديو وإدراجه في دورات المنصة", "success");
        } catch (error) {
            console.error("Upload Error Details:", error);
            Swal.fire("خطأ", "فشل الرفع: " + error.message, "error");
        } finally {
            setIsUploading(false);
            setUploadProgress(0);
        }
    };

    const handleDeleteVideo = async (id) => {
        setVideos(videos.filter(v => v.id !== id));
        // Note: For now delete from state, in Supabase we would use db.deletePlatformVideo
        const currentVideos = JSON.parse(localStorage.getItem("platform_videos") || "[]");
        const updated = currentVideos.filter(v => v.id !== id);
        localStorage.setItem("platform_videos", JSON.stringify(updated));
    };

    return (
        <main className="min-h-screen bg-slate-50 font-sans" dir="rtl">
            <AdminNavbar links={ADMIN_LINKS} activeIndex={3} />
            
            <div className="site-container py-12">
                <header className="mb-12 text-center">
                    <span className="mb-4 inline-block rounded-full bg-emerald-100 px-5 py-2 text-sm font-bold text-emerald-700 shadow-sm border border-emerald-200/50">
                        مركز إدارة المحتوى
                    </span>
                    <h1 className="text-4xl font-black text-slate-900 sm:text-5xl">رفع الدروس التعليمية</h1>
                    <p className="mt-4 text-slate-500 font-medium">نظم محتواك التعليمي وارفع الفيديوهات للطلاب بسهولة.</p>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                    <div className="lg:col-span-5">
                        <div className="bg-white rounded-[3rem] p-10 shadow-2xl shadow-slate-200/50 border border-slate-100 sticky top-10">
                            <h2 className="text-2xl font-black text-slate-900 mb-8 border-r-4 border-emerald-500 pr-5">نموذج الرفع</h2>
                            
                            <form onSubmit={handleUpload} className="space-y-6">
                                <div>
                                    <label className="block text-sm font-black text-slate-600 mb-3">اسم الدورة (أو الكورس)</label>
                                    <input 
                                        type="text" 
                                        placeholder="مثال: القرآن وعلومه - المستوى الأول"
                                        list="course-suggestions"
                                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all font-bold"
                                        value={formData.title}
                                        onChange={(e) => setFormData({...formData, title: e.target.value})}
                                        required
                                    />
                                    <datalist id="course-suggestions">
                                        {courses.map((c, i) => <option key={i} value={c} />)}
                                    </datalist>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="col-span-2">
                                        <label className="block text-sm font-black text-slate-600 mb-3">ملف الفيديو (MP4)</label>
                                        <div className="relative group">
                                            <input 
                                                type="file" 
                                                accept="video/mp4" 
                                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                                onChange={(e) => setFormData({...formData, videoFile: e.target.files[0]})}
                                                required
                                            />
                                            <div className="w-full bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl py-8 px-6 text-center group-hover:bg-emerald-50 group-hover:border-emerald-200 transition-all">
                                                <div className="text-3xl mb-2">🎥</div>
                                                <p className="text-xs font-black text-slate-400 group-hover:text-emerald-600">
                                                    {formData.videoFile ? formData.videoFile.name : "اختر ملف الفيديو"}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-black text-slate-600 mb-3">ملاحظات الدرس</label>
                                    <textarea 
                                        placeholder="اكتب تفاصيل عن محتوى الفيديو..."
                                        rows="4"
                                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all font-bold resize-none"
                                        value={formData.notes}
                                        onChange={(e) => setFormData({...formData, notes: e.target.value})}
                                    ></textarea>
                                </div>

                                <button 
                                    type="submit" 
                                    disabled={isUploading}
                                    className={`w-full py-5 rounded-2xl font-black text-lg transition-all shadow-xl flex items-center justify-center gap-3 ${
                                        isUploading 
                                        ? "bg-slate-200 text-slate-400 cursor-not-allowed" 
                                        : "bg-emerald-600 text-white hover:bg-emerald-700 active:scale-95 shadow-emerald-500/20"
                                    }`}
                                >
                                    {isUploading ? (
                                        <>
                                            <div className="h-5 w-5 animate-spin rounded-full border-3 border-emerald-500 border-t-transparent"></div>
                                            <span>جاري الرفع... ({uploadProgress}%)</span>
                                        </>
                                    ) : (
                                        "بدء عملية الرفع"
                                    )}
                                </button>
                            </form>
                        </div>
                    </div>

                    <div className="lg:col-span-7">
                        <div className="bg-white rounded-[3rem] p-10 shadow-2xl shadow-slate-200/50 border border-slate-100 min-h-[600px]">
                            <h2 className="text-2xl font-black text-slate-900 mb-8 border-r-4 border-amber-500 pr-5">الفيديوهات المرفوعة</h2>
                            
                            <div className="space-y-6">
                                {videos.length > 0 ? videos.map((video) => (
                                    <div key={video.id} className="group flex items-center gap-6 p-6 rounded-3xl bg-slate-50/50 border border-slate-100 hover:bg-white hover:shadow-xl hover:border-emerald-100 transition-all">
                                        <div className="relative h-24 w-32 rounded-2xl overflow-hidden bg-slate-900 flex-shrink-0">
                                            <div className="absolute inset-0 flex items-center justify-center text-white text-3xl">🎬</div>
                                            <div className="absolute inset-0 bg-emerald-500/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-[10px] font-black text-emerald-600 mb-1">{video.date}</p>
                                            <h3 className="font-black text-slate-950 mb-1 group-hover:text-emerald-700 transition-colors">{video.title}</h3>
                                            <p className="text-xs text-slate-400 font-medium line-clamp-1">{video.notes || "لا توجد ملاحظات."}</p>
                                        </div>
                                        <div className="flex gap-2">
                                            <button 
                                                onClick={() => handleDeleteVideo(video.id)}
                                                className="h-10 w-10 rounded-xl bg-rose-50 text-rose-500 flex items-center justify-center hover:bg-rose-600 hover:text-white transition-all shadow-sm"
                                                title="حذف الفيديو"
                                            >
                                                ✕
                                            </button>
                                        </div>
                                    </div>
                                )) : (
                                    <div className="py-20 text-center">
                                        <div className="text-5xl mb-4">📭</div>
                                        <p className="text-slate-400 font-bold">لم ترفع أي فيديوهات بعد.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}

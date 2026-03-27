"use client";

/* 
   LOCAL DATABASE IMPLEMENTATION (LocalStorage)
   Converted to ASYNC to match real database API.
*/

const INITIAL_USERS = [
  { 
    id: "ADM-001",
    role: "admin", 
    email: "admin@gmail.com", 
    password: "123", 
    name: "مدير النظام", 
    course: "", 
    redirect: "/admin/dashboard" 
  }
];

export const getLocalUsers = async () => {
    if (typeof window === "undefined") return INITIAL_USERS;
    const stored = localStorage.getItem("app_users");
    if (!stored) {
        localStorage.setItem("app_users", JSON.stringify(INITIAL_USERS));
        return INITIAL_USERS;
    }
    return JSON.parse(stored);
};

export const saveUser = async (user) => {
    const users = await getLocalUsers();
    if (users.find(u => u.email === user.email)) return null;
    const newUser = {
        ...user,
        id: Date.now().toString(),
        joinDate: new Date().toLocaleDateString('ar-EG', { day: 'numeric', month: 'long', year: 'numeric' }),
        redirect: user.role === "admin" ? "/admin/dashboard" : (user.role === "teacher" ? "/teacher/profile" : "/student/profile")
    };
    const updated = [...users, newUser];
    localStorage.setItem("app_users", JSON.stringify(updated));
    return newUser;
};

export const deleteUser = async (id) => {
    const users = await getLocalUsers();
    const updated = users.filter(u => u.id !== id && u.email !== id);
    localStorage.setItem("app_users", JSON.stringify(updated));
};

export const updateUser = async (updatedUser) => {
    const users = await getLocalUsers();
    const updated = users.map(u => (u.id === updatedUser.id || u.email === updatedUser.email) ? { ...u, ...updatedUser } : u);
    localStorage.setItem("app_users", JSON.stringify(updated));
};

export const getPlatformCourses = async () => {
    if (typeof window === "undefined") return [];
    return JSON.parse(localStorage.getItem("platform_courses") || "[]");
};

export const savePlatformCourse = async (courseTitle) => {
    const courses = await getPlatformCourses();
    if (courses.includes(courseTitle)) return;
    const updated = [...courses, courseTitle];
    localStorage.setItem("platform_courses", JSON.stringify(updated));
};

export const getPlatformVideos = async () => {
    if (typeof window === "undefined") return [];
    return JSON.parse(localStorage.getItem("platform_videos") || "[]");
};

export const savePlatformVideo = async (video) => {
    const videos = await getPlatformVideos();
    const updated = [video, ...videos];
    localStorage.setItem("platform_videos", JSON.stringify(updated));
};

export const getAssignedCourses = async (email) => {
    if (typeof window === "undefined") return [];
    return JSON.parse(localStorage.getItem(`assigned_courses_${email}`) || "[]");
};

export const saveAssignedCourses = async (email, courses) => {
    localStorage.setItem(`assigned_courses_${email}`, JSON.stringify(courses));
};

export const saveAttendanceSession = async (session) => {
    const history = JSON.parse(localStorage.getItem("attendance_history") || "[]");
    const newSession = {
        ...session,
        id: Date.now(),
        createdAt: new Date().toISOString()
    };
    const updated = [newSession, ...history];
    localStorage.setItem("attendance_history", JSON.stringify(updated));
    return newSession;
};

export const getAttendanceHistory = async (teacherEmail = null) => {
    const history = JSON.parse(localStorage.getItem("attendance_history") || "[]");
    if (teacherEmail) {
        return history.filter(s => s.teacherEmail === teacherEmail);
    }
    return history;
};

// 6. Profile Management (Generic)
export const getProfile = async (type, email) => {
    const key = `${type}_profile_${email}`;
    return JSON.parse(localStorage.getItem(key) || "{}");
};

export const saveProfile = async (type, email, profileData) => {
    const key = `${type}_profile_${email}`;
    localStorage.setItem(key, JSON.stringify(profileData));
};

// 7. Finance Management
export const getTeacherFinances = async () => {
    return JSON.parse(localStorage.getItem("admin_teachers_financials") || "{}");
};

export const updateTeacherFinances = async (email, financials) => {
    const allFinances = await getTeacherFinances();
    allFinances[email] = financials;
    localStorage.setItem("admin_teachers_financials", JSON.stringify(allFinances));
};

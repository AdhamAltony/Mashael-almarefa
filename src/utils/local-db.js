import { supabase } from './supabase-client';

/**
 * Fast Caching System
 */
let cachedUsers = null;

export const getSupabaseOrWarn = (operation) => {
    if (supabase) return supabase;

    console.warn(`Skipping ${operation}: Supabase environment variables are not configured.`);
    return null;
};

const mapUserFromSupabase = (u) => {
    // 1. Flatten profile data if present (from join)
    const studentProfile = u.students_profile?.[0] || u.students_profile || {};
    const teacherProfile = u.teachers_profile?.[0] || u.teachers_profile || {};
    const profile = u.role === 'teacher' ? teacherProfile : studentProfile;

    // Combine everything
    const combined = { ...u, ...profile };

    // 2. Determine redirect URL
    let redirect = combined.redirect_url;
    if (!redirect) {
        if (combined.role === "admin") redirect = "/admin/dashboard";
        else if (combined.role === "teacher") redirect = "/teacher/profile";
        else if (combined.role === "student") redirect = "/student/profile";
        else redirect = "/";
    }

    // 3. Construct flat object for UI
    const regSubData = combined.registered_subjects;
    let subjects = [];
    let subscriptions = {};

    if (regSubData && typeof regSubData === 'object' && !Array.isArray(regSubData)) {
        subjects = regSubData.list || [];
        subscriptions = regSubData.subs || {};
    } else {
        const subjectsStr = (combined.specialization || combined.course || combined.department || "");
        subjects = regSubData || (combined.role === 'teacher' && subjectsStr.includes('(')
            ? subjectsStr.match(/\((.*)\)/)?.[1].split(/[،,]/).map(s => s.trim()).filter(Boolean)
            : (Array.isArray(combined.subjects) ? combined.subjects : [])) || [];
    }

    return {
        ...combined,
        id: combined.id || combined.user_id,
        name: combined.name || combined.full_name || "",
        image: combined.photo_url || combined.image || "",
        subscriptions: subscriptions,
        redirect: redirect,
        phone: combined.phone || "",
        department: combined.department || combined.course || "",
        course: combined.role === 'teacher' ? (combined.specialization || combined.course || combined.department || "") : (combined.course || combined.department || ""),
        subjects: subjects,
        status: combined.status || "نشط",
        guardian: combined.guardian_name || combined.guardian || "",
        guardianPhone: combined.guardian_phone || combined.guardianPhone || "",
        country: combined.country || "",
        age: combined.age || "",
        joinDate: combined.join_date ? new Date(combined.join_date).toLocaleDateString('ar-EG', { day: 'numeric', month: 'long', year: 'numeric' }) : "",
        memberNumber: combined.student_code || combined.teacher_code || (combined.id || combined.user_id || "").slice(0, 8)
    };
};

const mapUserToSupabase = (u) => {
    let redirectUrl = u.redirect;
    if (!redirectUrl) {
        if (u.role === "admin") redirectUrl = "/admin/dashboard";
        else if (u.role === "teacher") redirectUrl = "/teacher/profile";
        else if (u.role === "student") redirectUrl = "/student/profile";
        else redirectUrl = "/";
    }

    // Exact field names from your 'users' table document
    const result = {
        email: u.email,
        name: u.name,
        role: u.role,
        course: u.course || "",
        phone: u.phone || "",
        age: u.age ? parseInt(u.age) : null,
        level: u.level || "",
        photo_url: u.image || "",
        status: u.status || "نشط",
        redirect_url: redirectUrl,
        join_date: u.join_date || new Date().toISOString()
    };

    if (u.password) {
        result.password = u.password;
    }

    return result;
};

export const getLocalUsers = async (forceRefresh = false) => {
    // Return cached data instantly if available
    if (cachedUsers && !forceRefresh) return cachedUsers;

    const client = getSupabaseOrWarn("getLocalUsers");
    if (!client) return [];

    try {
        // Fetch users with their profiles to get guardian, country, and other specific fields
        const { data, error } = await supabase
            .from('users')
            .select(`
                *,
                students_profile (*),
                teachers_profile (*)
            `);

        if (error) {
            console.error('Supabase getLocalUsers Error:', error.message);
            throw error;
        }

        cachedUsers = (data || []).map(mapUserFromSupabase);
        return cachedUsers;
    } catch (error) {
        console.error('Retrieval Exception:', error);
        return [];
    }
};

export const saveUser = async (user) => {
    const client = getSupabaseOrWarn("saveUser");
    if (!client) return null;

    try {
        cachedUsers = null; // Reset cache

        // 1. Insert into core users table
        const suUser = mapUserToSupabase(user);
        const { data, error } = await client.from('users').insert([suUser]).select();

        if (error) {
            console.error('Supabase Registration Error:', error.message);
            throw error;
        }

        const newUser = data[0];

        // 2. Insert into profile table (Using 'students_profile' and 'teachers_profile')
        if (user.role === 'teacher') {
            let spec = user.course || user.department || "";
            if (!spec.includes("(") && user.department?.includes("المناهج الدراسية") && user.subjects?.length > 0) {
                spec += ` (${user.subjects.join("، ")})`;
            }
            const { error: profileError } = await client.from('teachers_profile').insert([{
                user_id: newUser.id,
                specialization: spec,
                bio: user.bio || "",
                is_on_leave: user.status === "إجازة",
                rating: 5.0,
                rate_per_session: 0
            }]);

            if (profileError) {
                console.error("Failed to insert into teachers_profile:", profileError);
            }
        } else if (user.role === 'student') {
            const { error: studentProfileError } = await client.from('students_profile').insert([{
                user_id: newUser.id,
                student_code: `STD-${Math.floor(10000 + Math.random() * 90000)}`,
                guardian_name: user.guardian || "",
                guardian_phone: user.guardianPhone || "",
                department: user.department || user.course || "",
                registered_subjects: { list: user.subjects || [], subs: {} },
                country: user.country || ""
            }]);

            if (studentProfileError) {
                console.error("Failed to insert into students_profile:", studentProfileError);
            }
        }

        return mapUserFromSupabase(newUser);
    } catch (error) {
        console.error('Detailed saveUser Error:', error.message || error);
        return null;
    }
};

export const deleteUser = async (id, email) => {
    const client = getSupabaseOrWarn("deleteUser");
    if (!client) return;

    try {
        // 1. Manually delete from profile tables first to avoid foreign key violations
        // This ensures the main delete doesn't fail if CASCADE is not set.
        await client.from('students_profile').delete().eq('user_id', id);
        await client.from('teachers_profile').delete().eq('user_id', id);

        // 2. Delete from the parent users table
        const { error } = await client
            .from('users')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Detailed Delete Error:', error.message);
            throw error;
        }

        // 3. Local Cleanup (Only in browser)
        cachedUsers = null;
        if (email && typeof window !== 'undefined') {
            // Comprehensive cleanup of all possible localStorage keys associated with this email
            const keysToRemove = [
                `sessions_${email}`,
                `progress_${email}`,
                `assigned_courses_${email}`,
                `student_profile_${email}`,
                `teacher_profile_${email}`,
                `teacher_portfolio_${email}`,
                `upcoming_sessions_${email}`,
                `sessions_schedule_${email}`,
                `teacher_sessions_${email}`
            ];

            keysToRemove.forEach(key => localStorage.removeItem(key));

            // Clean up any other potential session-based localStorage items containing the email
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && (key.includes(email) || key.includes(id))) {
                    localStorage.removeItem(key);
                    i--; // Adjust index after removal
                }
            }
        }
    } catch (error) {
        console.error('Failed to Delete User:', error.message || error);
    }
};

export const updateUser = async (updatedUser) => {
    const client = getSupabaseOrWarn("updateUser");
    if (!client) return;

    try {
        if (!updatedUser.id || updatedUser.id === "undefined") {
            console.error("updateUser: Missing or invalid user ID. Update aborted.", updatedUser);
            return;
        }
        cachedUsers = null;

        // 1. Update core table
        const suUpdate = mapUserToSupabase(updatedUser);
        const { error } = await client
            .from('users')
            .update(suUpdate)
            .eq('id', updatedUser.id);

        if (error) throw error;

        // 2. Update profiles (Using your schema table names)
        if (updatedUser.role === 'teacher') {
            await client.from('teachers_profile').update({
                specialization: updatedUser.course,
                bio: updatedUser.bio,
                is_on_leave: updatedUser.status === "إجازة",
                rating: updatedUser.rating,
                rate_per_session: updatedUser.rate_per_session || 0
            }).eq('user_id', updatedUser.id);
        } else if (updatedUser.role === 'student') {
            // Include subscriptions in the JSONB field for syncing
            const regSubUpdate = {
                list: updatedUser.subjects || [],
                subs: updatedUser.subscriptions || {}
            };
            await client.from('students_profile').update({
                department: updatedUser.course || updatedUser.department,
                guardian_name: updatedUser.guardian,
                guardian_phone: updatedUser.guardianPhone,
                registered_subjects: regSubUpdate,
                country: updatedUser.country
            }).eq('user_id', updatedUser.id);
        }
    } catch (error) {
        console.error('Update Failed Details:', error.message || error);
    }
};

/**
 * Attendance & Progress Syncing
 */

export const submitAttendance = async (logData) => {
    const client = getSupabaseOrWarn("submitAttendance");
    try {
        // Sanitize data types and map to 'attendance_sessions' table schema found in migration.sql
        const cleanDuration = typeof logData.duration === 'string' ? parseInt(logData.duration.match(/\d+/)?.[0] || "0") : logData.duration;

        const sessionData = {
            teacher_email: logData.teacher_email,
            student_name: logData.student_name || logData.studentName || logData.student_email?.split('@')[0],
            course_name: logData.course_name,
            session_date: logData.date,
            session_time: new Date().toLocaleTimeString('en-US', { hour12: true, hour: '2-digit', minute: '2-digit', second: '2-digit' }),
            duration: cleanDuration || 0,
            notes: `الموضوع: ${logData.topic || "—"} | التقييم: ${logData.rating || "—"} | الحالة: ${logData.status || "—"} | التفاصيل: ${logData.notes || "لا توجد"}`
        };

        const { error } = await client.from('attendance_sessions').insert([sessionData]);

        if (error) {
            console.error("Supabase Error Object:", JSON.stringify(error, null, 2));
            throw error;
        }

        // Update local cache
        if (typeof window !== 'undefined' && logData.student_email) {
            const logs = JSON.parse(localStorage.getItem(`attendance_${logData.student_email}`) || "[]");
            logs.push({ ...logData, synced: true });
            localStorage.setItem(`attendance_${logData.student_email}`, JSON.stringify(logs));
        }
    } catch (err) {
        console.error("Failed to sync attendance to database:", err.message || err);
    }
};

export const getAttendanceHistory = async (studentEmail) => {
    const client = getSupabaseOrWarn("getAttendanceHistory");
    if (!client) return [];

    try {
        const { data, error } = await client
            .from('attendance_sessions')
            .select('*')
            .order('session_date', { ascending: false });

        if (error) throw error;

        // Map back to expected format for UI (CamelCase studentName or snake_case student_name)
        return (data || []).map(s => ({
            ...s,
            date: s.session_date,
            studentName: s.student_name,
            student_name: s.student_name
        }));
    } catch (err) {
        console.error("Failed to fetch attendance history:", err.message || err);
        return [];
    }
};

export const getTeacherReports = async (teacherEmail) => {
    const client = getSupabaseOrWarn("getTeacherReports");
    if (!client) return [];

    try {
        const { data, error } = await client
            .from('attendance_sessions')
            .select('*')
            .eq('teacher_email', teacherEmail)
            .order('session_date', { ascending: false });

        if (error) throw error;

        return (data || []).map(s => ({
            ...s,
            date: s.session_date,
            studentName: s.student_name,
            student_name: s.student_name
        }));
    } catch (err) {
        console.error("Failed to fetch teacher reports:", err.message || err);
        return [];
    }
};

export const saveStudentProgress = async (studentEmail, progressData, sessionsData) => {
    const client = getSupabaseOrWarn("saveStudentProgress");
    if (!client) return;

    try {
        // Find the user ID first
        const allUsers = await getLocalUsers();
        const student = allUsers.find(u => u.email === studentEmail);
        if (!student) return;

        // We'll use the JSONB field 'registered_subjects' to store progress if specialized columns don't exist
        // or we check if progress_data exists. Let's try updating specifically.
        const { error } = await client
            .from('students_profile')
            .update({
                progress_data: progressData,
                upcoming_sessions: sessionsData
            })
            .eq('user_id', student.id);

        if (error) {
            // Fallback: If specialized columns don't exist, use the registered_subjects structure
            console.warn("Retrying progress save using nested JSON structure...");
            const currentReg = student.registered_subjects || {};
            await client
                .from('students_profile')
                .update({
                    registered_subjects: {
                        ...currentReg,
                        progress: progressData,
                        sessions: sessionsData
                    }
                })
                .eq('user_id', student.id);
        }
    } catch (err) {
        console.error("Failed to save progress to database:", err);
    }
};

export const syncStudentData = async (studentEmail) => {
    const client = getSupabaseOrWarn("syncStudentData");
    if (!client || typeof window === 'undefined') return;

    try {
        const { data, error } = await client
            .from('users')
            .select('*, students_profile (*)')
            .eq('email', studentEmail)
            .single();

        if (error || !data) return;

        const profile = data.students_profile?.[0] || data.students_profile || {};

        // 1. Fetch active teachers to validate subscriptions
        const allUsers = await getLocalUsers(true); // Force refresh to get latest
        const activeTeacherEmails = new Set(
            allUsers.filter(u => u.role === 'teacher').map(t => t.email.toLowerCase())
        );

        // 2. Validate and Sync Subscriptions
        let regSubjects = profile.registered_subjects || {};
        let subs = regSubjects.subs || {};
        let hasChanges = false;
        let sanitizedSubs = {};

        for (const [email, sub] of Object.entries(subs)) {
            if (activeTeacherEmails.has(email.toLowerCase())) {
                sanitizedSubs[email] = sub;
            } else {
                hasChanges = true;
            }
        }

        if (hasChanges) {
            regSubjects.subs = sanitizedSubs;
            // Update DB if we removed deleted teachers
            await client
                .from('students_profile')
                .update({ registered_subjects: regSubjects })
                .eq('user_id', data.id);
        }

        // 3. Sync to LocalStorage
        // Update main profile object
        const localProfileKey = `student_profile_${studentEmail}`;
        const localProfile = JSON.parse(localStorage.getItem(localProfileKey) || "{}");
        localStorage.setItem(localProfileKey, JSON.stringify({
            ...localProfile,
            ...mapUserFromSupabase(data),
            subscriptions: sanitizedSubs
        }));

        // Sync Progress
        if (profile.progress_data) {
            localStorage.setItem(`progress_${studentEmail}`, JSON.stringify(profile.progress_data));
        } else if (regSubjects.progress) {
            localStorage.setItem(`progress_${studentEmail}`, JSON.stringify(regSubjects.progress));
        }

        // Sync Sessions
        if (profile.upcoming_sessions) {
            localStorage.setItem(`sessions_${studentEmail}`, JSON.stringify(profile.upcoming_sessions));
        } else if (regSubjects.sessions) {
            localStorage.setItem(`sessions_${studentEmail}`, JSON.stringify(regSubjects.sessions));
        }

    } catch (err) {
        console.error("Sync failed:", err);
    }
};

/**
 * Course & Platform Video Syncing
 */

export const getPlatformCourses = async () => {
    const client = getSupabaseOrWarn("getPlatformCourses");
    if (!client) return [];

    try {
        const { data, error } = await client
            .from('courses')
            .select('title')
            .order('created_at', { ascending: true });

        if (error) throw error;
        return (data || []).map(c => c.title);
    } catch (err) {
        console.error("Failed to fetch courses:", err);
        return [];
    }
};

export const addPlatformCourse = async (title) => {
    const client = getSupabaseOrWarn("addPlatformCourse");
    if (!client) return null;

    try {
        const { data, error } = await client
            .from('courses')
            .insert([{ title, category: 'عام' }])
            .select();

        if (error) throw error;
        return data[0];
    } catch (err) {
        console.error("Failed to add course:", err);
        return null;
    }
};

export const updatePlatformCourse = async (oldTitle, newTitle) => {
    const client = getSupabaseOrWarn("updatePlatformCourse");
    if (!client) return false;

    try {
        // 1. Update the course name
        const { error: courseError } = await client
            .from('courses')
            .update({ title: newTitle })
            .eq('title', oldTitle);

        if (courseError) throw courseError;

        // 2. Update all videos belonging to this course
        await client
            .from('course_videos')
            .update({ course_title: newTitle })
            .eq('course_title', oldTitle);

        // 3. Update all student assignments
        await client
            .from('course_assignments')
            .update({ course_title: newTitle })
            .eq('course_title', oldTitle);

        return true;
    } catch (err) {
        console.error("Failed to update course:", err);
        return false;
    }
};

export const deletePlatformCourse = async (title) => {
    const client = getSupabaseOrWarn("deletePlatformCourse");
    if (!client) return false;

    try {
        // 1. Delete assignments
        await client.from('course_assignments').delete().eq('course_title', title);

        // 2. Delete videos
        await client.from('course_videos').delete().eq('course_title', title);

        // 3. Delete course
        const { error } = await client.from('courses').delete().eq('title', title);

        if (error) throw error;
        return true;
    } catch (err) {
        console.error("Failed to delete course:", err);
        return false;
    }
};

export const getPlatformVideos = async () => {
    const client = getSupabaseOrWarn("getPlatformVideos");
    if (!client) return [];

    try {
        const { data, error } = await client
            .from('course_videos')
            .select('*')
            .order('upload_date', { ascending: false });

        if (error) throw error;

        // Map to the format expected by the UI
        return (data || []).map(v => ({
            id: v.id,
            title: v.course_title,
            videoUrl: v.video_url,
            thumbnailUrl: v.thumbnail_url,
            notes: v.notes,
            date: v.upload_date ? new Date(v.upload_date).toISOString().split('T')[0] : ""
        }));
    } catch (err) {
        console.error("Failed to fetch videos:", err);
        return [];
    }
};

export const addPlatformVideo = async (videoData) => {
    const client = getSupabaseOrWarn("addPlatformVideo");
    if (!client) return null;

    try {
        const { data, error } = await client
            .from('course_videos')
            .insert([{
                course_title: videoData.title,
                video_url: videoData.videoUrl,
                thumbnail_url: videoData.thumbnailUrl,
                notes: videoData.notes,
                upload_date: videoData.date || new Date().toISOString()
            }])
            .select();

        if (error) throw error;
        return data[0];
    } catch (err) {
        console.error("Failed to add video:", err);
        return null;
    }
};

export const deletePlatformVideo = async (id) => {
    const client = getSupabaseOrWarn("deletePlatformVideo");
    if (!client) return false;

    try {
        const { error } = await client.from('course_videos').delete().eq('id', id);
        if (error) throw error;
        return true;
    } catch (err) {
        console.error("Failed to delete video:", err);
        return false;
    }
};

export const getAssignedCourseTitles = async (studentEmail) => {
    const client = getSupabaseOrWarn("getAssignedCourseTitles");
    if (!client) return [];

    try {
        const { data, error } = await client
            .from('course_assignments')
            .select('course_title')
            .eq('student_email', studentEmail);

        if (error) throw error;
        return (data || []).map(a => a.course_title);
    } catch (err) {
        console.error("Failed to fetch assigned courses:", err);
        return [];
    }
};

export const saveCourseAssignments = async (studentEmail, courseTitles) => {
    const client = getSupabaseOrWarn("saveCourseAssignments");
    if (!client) return false;

    try {
        // 1. Delete existing assignments for this student
        await client.from('course_assignments').delete().eq('student_email', studentEmail);

        // 2. Insert new assignments
        if (courseTitles && courseTitles.length > 0) {
            const inserts = courseTitles.map(title => ({
                student_email: studentEmail,
                course_title: title,
                assigned_at: new Date().toISOString()
            }));
            const { error } = await client.from('course_assignments').insert(inserts);
            if (error) throw error;
        }

        return true;
    } catch (err) {
        console.error("Failed to save course assignments:", err);
        return false;
    }
};

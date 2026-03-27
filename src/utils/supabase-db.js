import { supabase } from './supabaseClient';

/* 
   SUPABASE DATABASE IMPLEMENTATION
   ---------------------------------
   This file contains the Supabase-specific queries. 
   When switching to Supabase, these methods will fetch real data from your Supabase tables.
*/

// 1. Users Management
export const getLocalUsers = async () => {
    const { data, error } = await supabase.from('users').select('*');
    if (error) {
        console.error('Supabase Error (getLocalUsers):', error);
        return [];
    }
    return data;
};

export const saveUser = async (user) => {
    const { data, error } = await supabase.from('users').insert([user]).select().single();
    if (error) {
        console.error('Supabase Error (saveUser):', error);
        return null;
    }
    return data;
};

export const deleteUser = async (id) => {
    const { error } = await supabase.from('users').delete().eq('id', id);
    if (error) console.error('Supabase Error (deleteUser):', error);
};

export const updateUser = async (userOrEmail, updates) => {
    let email = typeof userOrEmail === 'string' ? userOrEmail : userOrEmail.email;
    let updateData = updates || userOrEmail;
    
    // Remote 'id' or 'email' from updateData to avoid PK conflicts if passed
    const { email: _, id: __, ...realUpdates } = updateData;

    const { data, error } = await supabase.from('users').update(realUpdates).eq('email', email);
    if (error) console.error('Supabase Error (updateUser):', error);
    return data;
};

// 2. Courses Center
export const getPlatformCourses = async () => {
    const { data, error } = await supabase.from('courses').select('title');
    if (error) {
        console.error('Supabase Error (getPlatformCourses):', error);
        return [];
    }
    return data.map(c => c.title);
};

export const savePlatformCourse = async (courseTitle) => {
    const { error } = await supabase.from('courses').upsert({ title: courseTitle }, { onConflict: 'title' });
    if (error) console.error('Supabase Error (savePlatformCourse):', error);
};

export const getPlatformVideos = async () => {
    const { data, error } = await supabase.from('course_videos').select('*').order('upload_date', { ascending: false });
    if (error) {
        console.error('Supabase Error (getPlatformVideos):', error);
        return [];
    }
    return data;
};

export const savePlatformVideo = async (video) => {
    const { error } = await supabase.from('course_videos').insert([video]);
    if (error) console.error('Supabase Error (savePlatformVideo):', error);
};

// 3. Course Assignments (Student Permissions)
export const getAssignedCourses = async (email) => {
    const { data, error } = await supabase.from('course_assignments').select('course_title').eq('student_email', email);
    if (error) {
        console.error('Supabase Error (getAssignedCourses):', error);
        return [];
    }
    return data.map(c => c.course_title);
};

export const saveAssignedCourses = async (email, courses) => {
    // 1. Delete current assignments
    await supabase.from('course_assignments').delete().eq('student_email', email);
    
    // 2. Bulk insert new assignments
    if (courses.length > 0) {
        const inserts = courses.map(title => ({ student_email: email, course_title: title }));
        const { error } = await supabase.from('course_assignments').insert(inserts);
        if (error) console.error('Supabase Error (saveAssignedCourses):', error);
    }
};

// 4. Attendance & History
export const saveAttendanceSession = async (session) => {
    const { error } = await supabase.from('attendance_sessions').insert([session]);
    if (error) console.error('Supabase Error (saveAttendanceSession):', error);
};

export const getAttendanceHistory = async (teacherEmail = null) => {
    let query = supabase.from('attendance_sessions').select('*').order('created_at', { ascending: false });
    if (teacherEmail) {
        query = query.eq('teacher_email', teacherEmail);
    }
    const { data, error } = await query;
    if (error) {
        console.error('Supabase Error (getAttendanceHistory):', error);
        return [];
    }
    return data;
};

// 5. Extended Profiles (Teacher/Student Progress)
export const getProfile = async (type, email) => {
    // Map 'type' to table name
    let tableName = "";
    if (type === "teacher" || type === "teacher_profile") tableName = "teachers_profile";
    else if (type === "student" || type === "student_profile" || type === "student_progress" || type === "student_sessions") tableName = "students_profile";
    
    if (!tableName) return {};

    // First find the user's ID
    const { data: user } = await supabase.from('users').select('id').eq('email', email).single();
    if (!user) return {};

    const { data, error } = await supabase.from(tableName).select('*').eq('user_id', user.id).single();
    if (error && error.code !== 'PGRST116') { // PGRST116 is 'not found'
        console.error(`Supabase Error (getProfile - ${tableName}):`, error);
    }
    
    // Return the JSON data or flat columns
    if (tableName === "students_profile" && (type === "student_progress" || type === "student_sessions")) {
        // You might store this as a JSON column in students_profile if not in individual columns
        // For simplicity during migration, we'll return the whole row
        return data || {};
    }
    
    return data || {};
};

export const saveProfile = async (type, email, data) => {
    let tableName = "";
    if (type === "teacher" || type === "teacher_profile") tableName = "teachers_profile";
    else if (type === "student" || type === "student_profile" || type === "student_progress" || type === "student_sessions") tableName = "students_profile";

    if (!tableName) return;

    const { data: user } = await supabase.from('users').select('id').eq('email', email).single();
    if (!user) return;

    // Remove email/id from payload as it's linked via user_id
    const { email: _, id: __, ...profileData } = data;

    const { error } = await supabase.from(tableName).upsert({ 
        user_id: user.id, 
        ...profileData 
    }, { onConflict: 'user_id' });
    
    if (error) console.error(`Supabase Error (saveProfile - ${tableName}):`, error);
};

// 6. Teacher Finance Tracker
export const getTeacherFinances = async () => {
    const { data, error } = await supabase.from('teacher_finances').select('*');
    if (error) {
        console.error('Supabase Error (getTeacherFinances):', error);
        return {};
    }
    // Return as object { email: financials } to match local-db pattern
    return data.reduce((acc, curr) => {
        acc[curr.teacher_email] = curr;
        return acc;
    }, {});
};

export const updateTeacherFinances = async (email, financials) => {
    const { error } = await supabase.from('teacher_finances').upsert({ 
        teacher_email: email, 
        ...financials 
    }, { onConflict: 'teacher_email' });
    
    if (error) console.error('Supabase Error (updateTeacherFinances):', error);
};

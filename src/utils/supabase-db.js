/* 
   SUPABASE DATABASE IMPLEMENTATION
   ---------------------------------
   This file contains the Supabase-specific queries. 
   When switching to Supabase, these methods will fetch real data from your Supabase tables.
*/

// Note: You would import your supabase client here:
// import { supabase } from './supabaseClient';

export const getLocalUsers = async () => {
    // const { data, error } = await supabase.from('users').select('*');
    // if (error) return [];
    // return data;
    return []; // Placeholder
};

export const saveUser = async (user) => {
    // const { data, error } = await supabase.from('users').insert([user]).select().single();
    // return data;
    return user; // Placeholder
};

export const deleteUser = async (id) => {
    // await supabase.from('users').delete().eq('id', id);
};

export const updateUser = async (updatedUser) => {
    // await supabase.from('users').update(updatedUser).eq('id', updatedUser.id);
};

export const getPlatformCourses = async () => {
    // const { data } = await supabase.from('courses').select('title');
    // return data.map(c => c.title);
    return [];
};

export const savePlatformCourse = async (courseTitle) => {
    // await supabase.from('courses').upsert({ title: courseTitle });
};

export const getPlatformVideos = async () => {
    // const { data } = await supabase.from('course_videos').select('*').order('upload_date', { ascending: false });
    // return data;
    return [];
};

export const savePlatformVideo = async (video) => {
    // await supabase.from('course_videos').insert([video]);
};

export const getAssignedCourses = async (email) => {
    // const { data } = await supabase.from('course_assignments').select('course_title').eq('student_email', email);
    // return data.map(c => c.course_title);
    return [];
};

export const saveAssignedCourses = async (email, courses) => {
    // Sync logic for Supabase (delete current, insert new)
};

export const saveAttendanceSession = async (session) => {
    // await supabase.from('attendance_sessions').insert([session]);
};

export const getAttendanceHistory = async (teacherEmail = null) => {
    // let query = supabase.from('attendance_sessions').select('*').order('created_at', { ascending: false });
    // if (teacherEmail) query = query.eq('teacher_email', teacherEmail);
    // const { data } = await query;
    // return data;
    return [];
};

// 6. Profiles
export const getProfile = async (type, email) => {
    // const { data } = await supabase.from(`${type}_profile`).select('*').eq('email', email).single();
    // return data;
    return {};
};

export const saveProfile = async (type, email, data) => {
    // await supabase.from(`${type}_profile`).upsert({ email, ...data });
};

// 7. Finance
export const getTeacherFinances = async () => {
    // const { data } = await supabase.from('teacher_finances').select('*');
    // return data;
    return {};
};

export const updateTeacherFinances = async (email, financials) => {
    // await supabase.from('teacher_finances').upsert({ teacher_email: email, ...financials });
};



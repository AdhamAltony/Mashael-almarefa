import { supabase } from './supabase-client';

/**
 * Fast Caching System
 */
let cachedUsers = null;

const getSupabaseOrWarn = (operation) => {
    if (supabase) return supabase;

    console.warn(`Skipping ${operation}: Supabase environment variables are not configured.`);
    return null;
};

const mapUserFromSupabase = (u) => {
    // 1. Determine common mapping
    let redirect = u.redirect_url;
    if (!redirect) {
        if (u.role === "admin") redirect = "/admin/dashboard";
        else if (u.role === "teacher") redirect = "/teacher/profile";
        else if (u.role === "student") redirect = "/student/profile";
        else redirect = "/";
    }

    // 2. Construction flat object for UI (Using columns identified in your DB)
    return {
        ...u,
        name: u.name || "",
        image: u.photo_url || "",
        redirect: redirect,
        phone: u.phone || "",
        course: u.course || "",
        status: u.status || "نشط",
        joinDate: u.join_date ? new Date(u.join_date).toLocaleDateString('ar-EG', { day: 'numeric', month: 'long', year: 'numeric' }) : ""
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
    return {
        email: u.email,
        password: u.password || "",
        name: u.name,
        role: u.role,
        course: u.course || "",
        phone: u.phone || "",
        age: u.age ? parseInt(u.age) : null,
        level: u.level || "",
        photo_url: u.image || "",
        status: u.status || "active",
        redirect_url: redirectUrl,
        join_date: u.join_date || new Date().toISOString()
    };
};

export const getLocalUsers = async (forceRefresh = false) => {
    // Return cached data instantly if available
    if (cachedUsers && !forceRefresh) return cachedUsers;

    const client = getSupabaseOrWarn("getLocalUsers");
    if (!client) return [];

    try {
        // Simple and fast: Your 'users' table already contains all necessary list fields
        const { data, error } = await client.from('users').select('*');
        
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
            await client.from('teachers_profile').insert([{
                user_id: newUser.id,
                specialization: user.course || "",
                bio: user.bio || "",
                is_on_leave: user.status === "إجازة",
                rating: 5.0,
                rate_per_session: 0
            }]);
        } else if (user.role === 'student') {
            await client.from('students_profile').insert([{
                user_id: newUser.id,
                student_code: `STD-${Math.floor(10000 + Math.random() * 90000)}`,
                guardian_name: user.guardian || "",
                guardian_phone: user.guardianPhone || "",
                department: user.department || user.course || "",
                registered_subjects: user.subjects || []
            }]);
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
        // Robust delete from the parent users table
        const { error } = await client
            .from('users')
            .delete()
            .eq('id', id);
        
        if (error) {
            console.error('Detailed Delete Error:', error.message);
            throw error;
        }

        // 2. Local Cleanup (Only in browser)
        cachedUsers = null;
        if (email && typeof window !== 'undefined') {
            localStorage.removeItem(`sessions_${email}`);
            localStorage.removeItem(`progress_${email}`);
            localStorage.removeItem(`assigned_courses_${email}`);
        }
    } catch (error) {
        console.error('Failed to Delete User:', error.message || error);
    }
};

export const updateUser = async (updatedUser) => {
    const client = getSupabaseOrWarn("updateUser");
    if (!client) return;

    try {
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
                rating: updatedUser.rating
            }).eq('user_id', updatedUser.id);
        } else if (updatedUser.role === 'student') {
            await client.from('students_profile').update({
                department: updatedUser.course || updatedUser.department,
                guardian_name: updatedUser.guardian,
                guardian_phone: updatedUser.guardianPhone,
                registered_subjects: updatedUser.subjects
            }).eq('user_id', updatedUser.id);
        }
    } catch (error) {
        console.error('Update Failed Details:', error.message || error);
    }
};

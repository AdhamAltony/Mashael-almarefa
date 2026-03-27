import { supabase } from './supabase-client';

/**
 * Migration Mapping Helpers
 */
const mapUserFromSupabase = (u) => ({
    ...u,
    image: u.photo_url || "",
    redirect: u.redirect_url || "",
    joinDate: u.join_date ? new Date(u.join_date).toLocaleDateString('ar-EG', { day: 'numeric', month: 'long', year: 'numeric' }) : ""
});

const mapUserToSupabase = (u) => ({
    email: u.email,
    password: u.password,
    name: u.name,
    role: u.role,
    course: u.course || "",
    phone: u.phone || "",
    age: u.age ? parseInt(u.age) : null,
    level: u.level || "",
    photo_url: u.image || "",
    status: u.status || "active",
    redirect_url: u.redirect || ""
});

export const getLocalUsers = async () => {
    try {
        const { data, error } = await supabase.from('users').select('*');
        if (error) {
            console.error('Supabase getLocalUsers Error Detail:', error.message, error.details, error.hint);
            throw error;
        }
        return data.map(mapUserFromSupabase);
    } catch (error) {
        console.error('Full Supabase Error Object:', error);
        return [];
    }
};

export const saveUser = async (user) => {
    try {
        // 1. Insert into core users table
        const suUser = mapUserToSupabase(user);
        const { data, error } = await supabase.from('users').insert([suUser]).select();
        
        if (error) throw error;
        const newUser = data[0];

        // 2. Insert into profile table
        if (user.role === 'teacher') {
            await supabase.from('teachers_profile').insert([{
                user_id: newUser.id,
                specialization: user.course || "",
                bio: user.bio || "",
                is_on_leave: user.status === "إجازة",
                rating: 5.0,
                rate_per_session: 0
            }]);
        } else if (user.role === 'student') {
            await supabase.from('students_profile').insert([{
                user_id: newUser.id,
                student_code: `STD-${Math.floor(10000 + Math.random() * 90000)}`,
                guardian_name: user.guardian || "",
                guardian_phone: user.guardianPhone || "",
                department: user.department || "",
                registered_subjects: user.subjects || []
            }]);
        }

        return mapUserFromSupabase(newUser);
    } catch (error) {
        console.error('Supabase saveUser Error:', error);
        return null;
    }
};

export const deleteUser = async (idOrEmail) => {
    try {
        const { error } = await supabase
            .from('users')
            .delete()
            .or(`id.eq.${idOrEmail},email.eq.${idOrEmail}`);
        if (error) throw error;
    } catch (error) {
        console.error('Supabase deleteUser Error:', error);
    }
};

export const updateUser = async (updatedUser) => {
    try {
        const suUpdate = mapUserToSupabase(updatedUser);
        const { error } = await supabase
            .from('users')
            .update(suUpdate)
            .or(`id.eq.${updatedUser.id},email.eq.${updatedUser.email}`);
        
        if (error) throw error;

        // Update secondary profiles if relevant fields are passed
        if (updatedUser.role === 'teacher') {
            await supabase.from('teachers_profile').update({
                specialization: updatedUser.course,
                bio: updatedUser.bio,
                is_on_leave: updatedUser.status === "إجازة",
                rating: updatedUser.rating
            }).eq('user_id', updatedUser.id);
        } else if (updatedUser.role === 'student') {
            await supabase.from('students_profile').update({
                department: updatedUser.department,
                registered_subjects: updatedUser.subjects,
                guardian_name: updatedUser.guardian,
                guardian_phone: updatedUser.guardianPhone
            }).eq('user_id', updatedUser.id);
        }
    } catch (error) {
        console.error('Supabase updateUser Error:', error);
    }
};

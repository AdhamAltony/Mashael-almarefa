-- Mashael-Almarefa Database Schema (Supabase/Postgres)
-- Updated based on current production structure

-- 1. Users table (Core user data)
-- SQL: CREATE TYPE user_role AS ENUM ('admin', 'teacher', 'student');
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(255),
    role user_role DEFAULT 'student',
    course VARCHAR(255),
    phone VARCHAR(255),
    age INTEGER,
    level VARCHAR(255),
    photo_url TEXT,
    status VARCHAR(255) DEFAULT 'active',
    join_date TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP WITHOUT TIME ZONE,
    redirect_url VARCHAR(255)
);

-- 2. Students Profile
CREATE TABLE IF NOT EXISTS students_profile (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    student_code VARCHAR(255),
    guardian_name VARCHAR(255),
    guardian_phone VARCHAR(255),
    department VARCHAR(255),
    registered_subjects JSONB DEFAULT '[]',
    country VARCHAR(255) DEFAULT ''
);

-- 3. Teachers Profile
CREATE TABLE IF NOT EXISTS teachers_profile (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    specialization TEXT,
    bio TEXT,
    is_on_leave BOOLEAN DEFAULT FALSE,
    rating NUMERIC DEFAULT 5.0,
    rate_per_session NUMERIC DEFAULT 0
);

-- 4. Attendance Sessions (Teacher Reports)
CREATE TABLE IF NOT EXISTS attendance_sessions (
    id SERIAL PRIMARY KEY,
    teacher_email VARCHAR(255),
    student_name VARCHAR(255),
    course_name VARCHAR(255),
    session_date DATE,
    session_time TIME WITHOUT TIME ZONE,
    duration INTEGER,
    notes TEXT,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Courses
CREATE TABLE IF NOT EXISTS courses (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    category VARCHAR(255),
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. Course Videos
CREATE TABLE IF NOT EXISTS course_videos (
    id SERIAL PRIMARY KEY,
    course_title VARCHAR(255),
    video_url TEXT,
    thumbnail_url TEXT,
    notes TEXT,
    upload_date TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. Course Assignments (Student Course Permissions)
CREATE TABLE IF NOT EXISTS course_assignments (
    id SERIAL PRIMARY KEY,
    student_email VARCHAR(255),
    course_title VARCHAR(255),
    assigned_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. Teacher Finances
CREATE TABLE IF NOT EXISTS teacher_finances (
    id SERIAL PRIMARY KEY,
    teacher_email VARCHAR(255),
    total_sessions INTEGER DEFAULT 0,
    total_due NUMERIC DEFAULT 0,
    total_paid NUMERIC DEFAULT 0,
    last_payment_date TIMESTAMP WITHOUT TIME ZONE
);

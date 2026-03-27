-- Migration for Supabase / Postgres (Mashael-Almarefa)

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. User Roles
CREATE TYPE user_role AS ENUM ('admin', 'teacher', 'student');

-- 2. Core Users Table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL, -- Storing plain password for now as per local prototype pattern, but ideally hashed
    name VARCHAR(255) NOT NULL,
    role user_role NOT NULL DEFAULT 'student',
    course VARCHAR(255) DEFAULT '', -- Selected course/department during registration
    phone VARCHAR(20),
    age INT DEFAULT 10,
    level VARCHAR(100) DEFAULT 'مستوى جديد',
    photo_url TEXT DEFAULT '/Logo.jpeg',
    status VARCHAR(20) DEFAULT 'متصل', -- متصل / غائب / في إجازة
    join_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP,
    redirect_url VARCHAR(255)
);

-- 3. Teachers Extra Info (Linked to Users)
CREATE TABLE IF NOT EXISTS teachers_profile (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    specialization TEXT,
    bio TEXT,
    is_on_leave BOOLEAN DEFAULT FALSE, -- نشط / إجازة
    rating DECIMAL(3,2) DEFAULT 5.0,
    rate_per_session DECIMAL(10,2) DEFAULT 0
);

-- 4. Students Extra Info (Linked to Users)
CREATE TABLE IF NOT EXISTS students_profile (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    student_code VARCHAR(50) UNIQUE,
    guardian_name VARCHAR(255),
    guardian_phone VARCHAR(20),
    department VARCHAR(100),
    registered_subjects JSONB DEFAULT '[]'
);

-- 5. Courses Table (The Courses Center Categories)
CREATE TABLE IF NOT EXISTS courses (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) UNIQUE NOT NULL,
    category VARCHAR(100) DEFAULT 'عام',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. Course Videos (The actual uploaded lessons)
CREATE TABLE IF NOT EXISTS course_videos (
    id SERIAL PRIMARY KEY,
    course_title VARCHAR(255) REFERENCES courses(title) ON DELETE CASCADE,
    video_url TEXT NOT NULL,
    thumbnail_url TEXT DEFAULT '/Logo.jpeg',
    notes TEXT,
    upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 7. Course Assignments (Admin permissions for students)
-- This replaces assigned_courses_{email} localStorage
CREATE TABLE IF NOT EXISTS course_assignments (
    id SERIAL PRIMARY KEY,
    student_email VARCHAR(255) REFERENCES users(email) ON DELETE CASCADE,
    course_title VARCHAR(255) REFERENCES courses(title) ON DELETE CASCADE,
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(student_email, course_title)
);

-- 8. Attendance & Teacher Sessions History
-- This tracks every time a teacher records attendance
CREATE TABLE IF NOT EXISTS attendance_sessions (
    id SERIAL PRIMARY KEY,
    teacher_email VARCHAR(255) REFERENCES users(email) ON DELETE CASCADE,
    student_name VARCHAR(255) NOT NULL,
    course_name VARCHAR(255) NOT NULL,
    session_date DATE NOT NULL,
    session_time TIME NOT NULL,
    duration INT DEFAULT 30, -- minutes
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 9. Finance Tracker
CREATE TABLE IF NOT EXISTS teacher_finances (
    id SERIAL PRIMARY KEY,
    teacher_email VARCHAR(255) REFERENCES users(email) ON DELETE CASCADE,
    total_sessions INT DEFAULT 0,
    total_due DECIMAL(10,2) DEFAULT 0,
    total_paid DECIMAL(10,2) DEFAULT 0,
    last_payment_date TIMESTAMP
);

-- 10. Default Admin User (For initial access)
-- Note: Replace with actual secure password during production
INSERT INTO users (email, password, name, role, redirect_url)
VALUES ('admin@gmail.com', '123', 'مدير النظام', 'admin', '/admin/dashboard')
ON CONFLICT (email) DO NOTHING;

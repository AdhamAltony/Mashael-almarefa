-- Migration for Postgres (Mashael-Almarefa)

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. Users & Auth
CREATE TYPE user_role AS ENUM ('admin', 'teacher', 'student');
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role user_role NOT NULL DEFAULT 'student',
    full_name VARCHAR(255) NOT NULL,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP
);

-- 2. Admins
CREATE TABLE IF NOT EXISTS admins (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    admin_level VARCHAR(50) DEFAULT 'moderator',
    permissions JSONB DEFAULT '{}'
);

-- 3. Teachers
CREATE TABLE IF NOT EXISTS teachers (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    specialization TEXT,
    bio TEXT,
    phone VARCHAR(20),
    photo_url TEXT,
    availability TEXT,
    status VARCHAR(20) DEFAULT 'active',
    rating DECIMAL(3,2) DEFAULT 5.0
);

-- 4. Students
CREATE TABLE IF NOT EXISTS students (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    student_code VARCHAR(20) UNIQUE,
    age INT,
    country VARCHAR(100),
    guardian_name VARCHAR(255),
    guardian_phone VARCHAR(20),
    current_level VARCHAR(100),
    department VARCHAR(100),
    registered_subjects JSONB DEFAULT '[]',
    enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Courses
CREATE TABLE IF NOT EXISTS courses (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100)
);

-- 6. Course Videos (Upload Feature)
CREATE TABLE IF NOT EXISTS course_videos (
    id SERIAL PRIMARY KEY,
    course_id INT REFERENCES courses(id) ON DELETE CASCADE,
    video_url TEXT NOT NULL,
    thumbnail_url TEXT NOT NULL,
    notes TEXT,
    upload_date DATE DEFAULT CURRENT_DATE
);

-- 7. Student Video Progress (New Dynamic Tracker)
CREATE TABLE IF NOT EXISTS student_video_progress (
    id SERIAL PRIMARY KEY,
    student_id UUID REFERENCES students(user_id) ON DELETE CASCADE,
    video_id INT REFERENCES course_videos(id) ON DELETE CASCADE,
    is_completed BOOLEAN DEFAULT FALSE,
    watched_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(student_id, video_id)
);

-- 7. Sessions
CREATE TABLE IF NOT EXISTS sessions (
    id SERIAL PRIMARY KEY,
    teacher_id UUID REFERENCES teachers(user_id) ON DELETE CASCADE,
    student_id UUID REFERENCES students(user_id) ON DELETE CASCADE,
    course_id INT REFERENCES courses(id) ON DELETE CASCADE,
    session_date DATE NOT NULL,
    session_time TIME NOT NULL,
    duration INT DEFAULT 30,
    meet_link TEXT,
    status VARCHAR(20) DEFAULT 'scheduled',
    topic TEXT
);

-- 8. Finance
CREATE TABLE IF NOT EXISTS finances (
    teacher_id UUID PRIMARY KEY REFERENCES teachers(user_id) ON DELETE CASCADE,
    rate_per_session DECIMAL(10,2) DEFAULT 0,
    total_due DECIMAL(10,2) DEFAULT 0,
    amount_paid DECIMAL(10,2) DEFAULT 0,
    last_payment_at TIMESTAMP
);

-- 9. Admin Tasks
CREATE TABLE IF NOT EXISTS admin_tasks (
    id SERIAL PRIMARY KEY,
    admin_id UUID REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    is_completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

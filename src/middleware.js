import { NextResponse } from 'next/server';

export function middleware(request) {
    const userRoleCookie = request.cookies.get('userRole');
    const userRole = userRoleCookie ? userRoleCookie.value : null;

    const { pathname, searchParams } = request.nextUrl;

    // 1. Allow public routes
    const isPublicGuestRoute = 
        pathname === '/student/quran-teachers' || 
        pathname === '/student/arabic-teachers' || 
        pathname === '/student/curricula-teachers' ||
        pathname === '/student/courses';

    if (pathname === '/' || pathname.startsWith('/auth') || isPublicGuestRoute) {
        // Redirect logged in users away from auth pages unless they are explicitly logging out
        if (userRole && pathname.startsWith('/auth') && !searchParams.get('logout')) {
            if (userRole === 'student') return NextResponse.redirect(new URL('/student/profile', request.url));
            if (userRole === 'admin') return NextResponse.redirect(new URL('/admin/dashboard', request.url));
            if (userRole === 'teacher') return NextResponse.redirect(new URL('/teacher/profile', request.url));
        }
        return NextResponse.next();
    }

    // 2. If no role, redirect to login for any other path
    if (!userRole) {
        return NextResponse.redirect(new URL('/auth/login', request.url));
    }

    // 3. Admin has access to all routes
    if (userRole === 'admin') {
        return NextResponse.next();
    }

    // 4. Decode Session for course checking if available
    let userCourse = "";
    const sessionCookie = request.cookies.get('session');
    if (sessionCookie) {
        try {
            const base64Str = sessionCookie.value;
            const uriEncodedStr = atob(base64Str);
            const jsonStr = decodeURIComponent(uriEncodedStr);
            const sessionData = JSON.parse(jsonStr);
            userCourse = sessionData.course || "";
        } catch {
            // ignore
        }
    }

    // Admin-only explicit denial for non-admins for courses-center
    if (pathname.startsWith('/courses-center')) {
        if (userRole === 'student') {
            return NextResponse.redirect(new URL('/student/profile', request.url));
        } else if (userRole === 'teacher') {
            return NextResponse.redirect(new URL('/teacher/profile', request.url));
        }
    }

    // 5. Apply Restrictions based on role

    if (userRole === 'student') {
        let isAllowedStudentRoute = pathname.startsWith('/student');

        // Allow only their matching teachers page
        if (isAllowedStudentRoute && pathname.startsWith('/student/quran-teachers') && userCourse !== 'ركن القرآن') {
            isAllowedStudentRoute = false;
        }
        if (isAllowedStudentRoute && pathname.startsWith('/student/arabic-teachers') && userCourse !== 'العربية لغير الناطقين') {
            isAllowedStudentRoute = false;
        }
        if (isAllowedStudentRoute && pathname.startsWith('/student/curricula-teachers') && userCourse !== 'المناهج الدراسية') {
            isAllowedStudentRoute = false;
        }

        if (!isAllowedStudentRoute) {
            return NextResponse.redirect(new URL('/student/profile', request.url));
        }
    }

    if (userRole === 'teacher') {
        let isAllowedTeacherRoute = pathname.startsWith('/teacher');

        // Teachers can also access their specific course's routes
        if (!isAllowedTeacherRoute) {
            if (userCourse === 'ركن القرآن' && pathname.startsWith('/quran-and-sciences')) {
                isAllowedTeacherRoute = true;
            } else if (userCourse === 'العربية لغير الناطقين' && pathname.startsWith('/arabic-non-native')) {
                isAllowedTeacherRoute = true;
            } else if (userCourse === 'المناهج الدراسية' && pathname.startsWith('/egypt-gulf-curricula')) {
                isAllowedTeacherRoute = true;
            }
        }

        if (!isAllowedTeacherRoute) {
            return NextResponse.redirect(new URL('/teacher/profile', request.url));
        }
    }

    // If an unknown role reached here (shouldn't happen with our login logic), send to login
    return NextResponse.next();
}

export const config = {
    // Math all routes except API, Next.js static files, and standard public files like images, icons etc.
    matcher: [
        '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
};

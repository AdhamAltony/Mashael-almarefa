import { NextResponse } from 'next/server';

export function middleware(request) {
    const userRoleCookie = request.cookies.get('userRole');
    const userRole = userRoleCookie ? userRoleCookie.value : null;

    const { pathname, searchParams } = request.nextUrl;

    // 1. Allow public routes
    if (pathname === '/' || pathname.startsWith('/auth')) {
        // Redirect logged in users away from auth pages unless they are explicitly logging out
        if (userRole && pathname.startsWith('/auth') && !searchParams.get('logout')) {
            if (userRole === 'student') return NextResponse.redirect(new URL('/student/profile', request.url));
            if (userRole === 'admin') return NextResponse.redirect(new URL('/admin/dashboard', request.url));
            if (userRole === 'teacher') return NextResponse.redirect(new URL('/teacher/dashboard', request.url));
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

    // 4. Determine path sections
    const isStudentSectionPath =
        pathname.startsWith('/quran-and-sciences/students') ||
        pathname.startsWith('/arabic-non-native/students') ||
        pathname.startsWith('/egypt-gulf-curricula/students') ||
        pathname.startsWith('/courses-center/students');

    const isTeacherSectionPath =
        (pathname.startsWith('/quran-and-sciences') && !pathname.startsWith('/quran-and-sciences/students')) ||
        (pathname.startsWith('/arabic-non-native') && !pathname.startsWith('/arabic-non-native/students')) ||
        (pathname.startsWith('/egypt-gulf-curricula') && !pathname.startsWith('/egypt-gulf-curricula/students')) ||
        (pathname.startsWith('/courses-center') && !pathname.startsWith('/courses-center/students'));

    // 5. Apply Restrictions based on role

    if (userRole === 'student') {
        const isAllowedStudentRoute = pathname.startsWith('/student') || isStudentSectionPath;
        if (!isAllowedStudentRoute) {
            return NextResponse.redirect(new URL('/student/profile', request.url));
        }
    }

    if (userRole === 'teacher') {
        const isAllowedTeacherRoute = pathname.startsWith('/teacher') || isTeacherSectionPath;
        if (!isAllowedTeacherRoute) {
            return NextResponse.redirect(new URL('/teacher/dashboard', request.url));
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

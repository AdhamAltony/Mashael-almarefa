"use client";

const INITIAL_USERS = [
  // Admin
  { id: "admin-1", name: "مدير النظام", email: "admin@gmail.com", password: "123", role: "admin", course: "الإدارة", redirect: "/admin/dashboard" },
  
  // Teachers (1 per dept)
  { id: "t-quran", name: "الشيخ محمود (قرآن)", email: "quran@gmail.com", password: "123", role: "teacher", course: "ركن القرآن الكريم", redirect: "/teacher/profile" },
  { id: "t-arabic", name: "أ. فاطمة (عربية)", email: "arabic@gmail.com", password: "123", role: "teacher", course: "اللغة العربية لغير الناطقين", redirect: "/teacher/profile" },
  { id: "t-curr", name: "أ. محمد (مناهج)", email: "curricula@gmail.com", password: "123", role: "teacher", course: "المناهج الدراسية", redirect: "/teacher/profile" },

  // Students (3 per dept)
  // Quran
  { id: "s-q1", name: "طالب قرآن 1", email: "s_quran_1@gmail.com", password: "123", role: "student", course: "ركن القرآن الكريم", redirect: "/student/profile" },
  { id: "s-q2", name: "طالب قرآن 2", email: "s_quran_2@gmail.com", password: "123", role: "student", course: "ركن القرآن الكريم", redirect: "/student/profile" },
  { id: "s-q3", name: "طالب قرآن 3", email: "s_quran_3@gmail.com", password: "123", role: "student", course: "ركن القرآن الكريم", redirect: "/student/profile" },
  // Arabic
  { id: "s-a1", name: "طالب عربية 1", email: "s_arabic_1@gmail.com", password: "123", role: "student", course: "اللغة العربية لغير الناطقين", redirect: "/student/profile" },
  { id: "s-a2", name: "طالب عربية 2", email: "s_arabic_2@gmail.com", password: "123", role: "student", course: "اللغة العربية لغير الناطقين", redirect: "/student/profile" },
  { id: "s-a3", name: "طالب عربية 3", email: "s_arabic_3@gmail.com", password: "123", role: "student", course: "اللغة العربية لغير الناطقين", redirect: "/student/profile" },
  // Curricula
  { id: "s-c1", name: "طالب مناهج 1", email: "s_curricula_1@gmail.com", password: "123", role: "student", course: "المناهج الدراسية", redirect: "/student/profile" },
  { id: "s-c2", name: "طالب مناهج 2", email: "s_curricula_2@gmail.com", password: "123", role: "student", course: "المناهج الدراسية", redirect: "/student/profile" },
  { id: "s-c3", name: "طالب مناهج 3", email: "s_curricula_3@gmail.com", password: "123", role: "student", course: "المناهج الدراسية", redirect: "/student/profile" },
];

export const getLocalUsers = () => {
  if (typeof window === "undefined") return INITIAL_USERS;
  const stored = localStorage.getItem("app_users");
  if (!stored) {
    localStorage.setItem("app_users", JSON.stringify(INITIAL_USERS));
    return INITIAL_USERS;
  }
  return JSON.parse(stored);
};

export const saveUser = (user) => {
  const users = getLocalUsers();
  const newUser = {
    ...user,
    id: Date.now().toString(),
    redirect: user.role === "admin" ? "/admin/dashboard" : (user.role === "teacher" ? "/teacher/profile" : "/student/profile")
  };
  const updated = [...users, newUser];
  localStorage.setItem("app_users", JSON.stringify(updated));
  return newUser;
};

export const deleteUser = (id) => {
  const users = getLocalUsers();
  const updated = users.filter(u => u.id !== id);
  localStorage.setItem("app_users", JSON.stringify(updated));
};

export const updateUser = (updatedUser) => {
  const users = getLocalUsers();
  const updated = users.map(u => u.id === updatedUser.id ? { ...u, ...updatedUser } : u);
  localStorage.setItem("app_users", JSON.stringify(updated));
};

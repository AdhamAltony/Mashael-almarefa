"use client";

import * as localDb from './local-db';
import * as supabaseDb from './supabase-db';

/* 
   DATABASE ROUTER (Selecting between LocalStorage and Supabase)
   ------------------------------------------------------------
   Set NEXT_PUBLIC_USE_SUPABASE=true in .env to use real Database.
*/

const useSupabase = process.env.NEXT_PUBLIC_USE_SUPABASE === 'true';
const dbModule = useSupabase ? supabaseDb : localDb;

// Export all unified functions
export const getLocalUsers = dbModule.getLocalUsers;
export const saveUser = dbModule.saveUser;
export const deleteUser = dbModule.deleteUser;
export const updateUser = dbModule.updateUser;

export const getPlatformCourses = dbModule.getPlatformCourses;
export const savePlatformCourse = dbModule.savePlatformCourse;

export const getPlatformVideos = dbModule.getPlatformVideos;
export const savePlatformVideo = dbModule.savePlatformVideo;

export const getAssignedCourses = dbModule.getAssignedCourses;
export const saveAssignedCourses = dbModule.saveAssignedCourses;

export const saveAttendanceSession = dbModule.saveAttendanceSession;
export const getAttendanceHistory = dbModule.getAttendanceHistory;

export const getProfile = dbModule.getProfile;
export const saveProfile = dbModule.saveProfile;

export const getTeacherFinances = dbModule.getTeacherFinances;
export const updateTeacherFinances = dbModule.updateTeacherFinances;


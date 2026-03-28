"use client";
import { useState } from 'react';

export default function TeacherBio({ bio }) {
    const [isExpanded, setIsExpanded] = useState(false);

    if (!bio) return null;

    // We show the "Read More" button if the bio is long enough to potentially exceed 3 lines
    // 90 characters or 2+ newlines is a safe threshold for most cards
    const isLong = bio.length > 90 || (bio.match(/\n/g) || []).length >= 2;

    return (
        <div className="flex flex-col">
            <p className={`text-sm text-slate-600 leading-relaxed whitespace-pre-wrap ${!isExpanded ? 'line-clamp-3' : ''}`}>
                {bio}
            </p>
            {isLong && (
                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="text-xs font-bold text-emerald-600 hover:text-emerald-700 w-fit mt-2 transition-colors flex items-center gap-1 group"
                >
                    {isExpanded ? (
                        <>
                            <span>عرض أقل</span>
                            <svg className="h-3 w-3 rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
                            </svg>
                        </>
                    ) : (
                        <>
                            <span>عرض المزيد</span>
                            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
                            </svg>
                        </>
                    )}
                </button>
            )}
        </div>
    );
}

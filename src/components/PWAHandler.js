'use client';

import { useEffect, useState } from 'react';

export default function PWAHandler() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);

  useEffect(() => {
    // Service Worker registration
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').then(
        (registration) => {
          console.log('SW registration successful with scope: ', registration.scope);
        },
        (err) => {
          console.log('SW registration failed: ', err);
        }
      );
    }

    // Capture the PWA install prompt event
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Only show the prompt after a slight delay to "WOW" the user
      setTimeout(() => setShowInstallPrompt(true), 3000);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`User response to install prompt: ${outcome}`);
    
    setDeferredPrompt(null);
    setShowInstallPrompt(false);
  };

  if (!showInstallPrompt) return null;

  return (
    <div className="fixed bottom-6 left-6 right-6 z-[9999] md:left-auto md:max-w-xs animate-fade-in-up">
      <div className="glass-light backdrop-blur-xl border border-white/40 p-4 rounded-3xl shadow-2xl flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-emerald-500 p-2 flex items-center justify-center shadow-lg">
            <img src="/icon-192x192.png" alt="App Icon" className="w-full h-full object-contain" />
          </div>
          <div>
            <h3 className="font-bold text-emerald-950 text-sm">تثبيت منصة المشاعل</h3>
            <p className="text-emerald-800 text-xs opacity-80">تصفح أسرع وبدون إنترنت</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setShowInstallPrompt(false)}
            className="flex-1 py-2 px-4 rounded-xl text-xs font-bold text-emerald-900 bg-white/50 hover:bg-white/80 transition-all border border-black/5"
          >
            ليس الآن
          </button>
          <button 
            onClick={handleInstallClick}
            className="flex-[2] py-2 px-4 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200/50 shadow-lg transition-all"
          >
            تثبيت التطبيق
          </button>
        </div>
      </div>
    </div>
  );
}

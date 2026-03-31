'use client';

import { useEffect, useState } from 'react';

export default function PWAHandler() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Check if already installed to hide the banner forever
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator).standalone === true;
    if (isStandalone) return;

    // Standard SW Registration
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js', { scope: '/' }).catch(() => {});
    }

    // THE ONLY WAY TO TRIGGER A REAL APP INSTALL (Android/Chrome):
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Only show the banner when the PROMPT is READY to download the App
      setShowBanner(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      // Trigger the native OS Installation Dialog (Download App)
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      console.log(`Install Outcome: ${outcome}`);
      
      // Hide banner immediately after click
      setShowBanner(false);
      setDeferredPrompt(null);
    }
  };

  if (!showBanner) return null;

  return (
    <div className="fixed top-4 left-4 right-4 z-[9999] animate-fade-in-up md:max-w-md md:mx-auto">
      <div className="bg-white rounded-[1.5rem] shadow-[0_15px_45px_rgba(0,0,0,0.25)] p-4 border border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
           <button onClick={() => setShowBanner(false)} className="text-gray-400 text-xl font-bold px-1">×</button>
           <div className="w-10 h-10 rounded-xl overflow-hidden shadow-sm p-1 border border-emerald-50">
              <img src="/icon-192x192.png" alt="Logo" className="w-full h-full object-contain" />
           </div>
           <div className="flex flex-col">
              <h3 className="text-sm font-bold text-gray-900 leading-tight">تثبيت المنصة</h3>
              <p className="text-[10px] text-emerald-700 font-bold">تحميل التطبيق الآن</p>
           </div>
        </div>

        <button 
          onClick={handleInstallClick}
          className="bg-emerald-600 text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow-lg active:scale-95 transition-all"
        >
          Install
        </button>
      </div>
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';

export default function PWAHandler() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showBanner, setShowBanner] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSHint, setShowIOSHint] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // 1. Check if already installed (we still don't show to actual APP users)
    const checkStandalone = () => {
      return window.matchMedia('(display-mode: standalone)').matches || (window.navigator).standalone === true;
    };
    
    const standalone = checkStandalone();
    setIsStandalone(standalone);

    // 2. Detect Device Type
    const ios = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    setIsIOS(ios);

    // 3. Register SW
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js', { scope: '/' })
        .catch(err => console.log('SW Registration Error', err));
    }

    // 4. Capture Install Event (Android/Chrome/Brave)
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      
      // SHOW ALWAYS TO MOBILE BROWSER USERS (EVEN IF DISMISSED BEFORE)
      if (!checkStandalone()) {
        setShowBanner(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // 5. Fallback for iOS (Will ALWAYS show after 3 seconds on every visit)
    if (ios && !standalone) {
       setTimeout(() => setShowBanner(true), 3000);
    }

    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  const handleInstallClick = async () => {
    if (isIOS) {
       setShowIOSHint(true);
       return;
    }

    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setShowBanner(false);
      }
      setDeferredPrompt(null);
    }
  };

  const dismissBanner = () => {
    // Just close for the current session, will reappear on refresh/re-entry
    setShowBanner(false);
  };

  if (isStandalone || !showBanner) return null;

  return (
    <>
      {/* PROFESSIONAL SMART BANNER - PERSISTENT ON EVERY REFRESH */}
      <div className="fixed top-4 left-4 right-4 z-[9999] animate-fade-in-up md:max-w-md md:mx-auto">
        <div className="bg-white/90 backdrop-blur-2xl rounded-[2rem] shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)] p-4 border border-white/60 flex items-center justify-between ring-1 ring-black/5">
          <div className="flex items-center gap-4 flex-1">
            <button 
              onClick={dismissBanner}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100/50 text-gray-400 hover:text-gray-900 transition-colors"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12"/></svg>
            </button>
            
            <div className="w-12 h-12 bg-white rounded-2xl overflow-hidden shadow-inner flex items-center justify-center p-1 border border-emerald-50 shrink-0">
                <img src="/icon-192x192.png" alt="Logo" className="w-full h-full object-contain" />
            </div>

            <div className="flex flex-col gap-0.5">
              <h3 className="text-[14px] font-black text-gray-900 leading-none">تثبيت المنصة</h3>
              <p className="text-[10px] text-emerald-700 font-bold">تطبيق مشاعل المعرفة</p>
            </div>
          </div>

          <button 
            onClick={handleInstallClick}
            className="bg-emerald-600 text-white px-6 py-2.5 rounded-2xl font-bold text-sm shadow-lg shadow-emerald-200 active:scale-95 transition-all"
          >
            Install
          </button>
        </div>
      </div>

      {showIOSHint && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-6 bg-black/60 backdrop-blur-md animate-fade-in">
          <div className="bg-white rounded-[2.5rem] p-8 max-w-sm w-full shadow-2xl text-center flex flex-col gap-6 scale-up">
            <button onClick={() => setShowIOSHint(false)} className="absolute top-6 right-6 text-gray-300">×</button>
            <div className="w-20 h-20 bg-emerald-50 rounded-3xl mx-auto flex items-center justify-center p-4">
               <img src="/icon-192x192.png" alt="Logo" className="w-full h-full object-contain" />
            </div>
            <div>
                <h4 className="text-xl font-black text-gray-900">تثبيت على الآيفون</h4>
                <p className="text-sm text-gray-500 mt-2">اضغط على زر <span className="font-bold text-blue-500">↑</span> بالأسفل ثم اختر <span className="font-bold text-gray-900">إضافة للشاشة الرئيسية</span></p>
            </div>
            <button 
              onClick={() => setShowIOSHint(false)}
              className="bg-emerald-600 text-white py-4 rounded-2xl font-bold text-sm shadow-xl"
            >
              فهمت ذلك
            </button>
          </div>
        </div>
      )}
    </>
  );
}

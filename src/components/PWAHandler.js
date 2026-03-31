'use client';

import { useEffect, useState } from 'react';

export default function PWAHandler() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showBanner, setShowBanner] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSHint, setShowIOSHint] = useState(false);

  useEffect(() => {
    // 1. Check if already installed
    const checkStandalone = () => {
      if (typeof window === 'undefined') return false;
      return window.matchMedia('(display-mode: standalone)').matches || (window.navigator).standalone === true;
    };
    
    const standalone = checkStandalone();
    setIsStandalone(standalone);

    // 2. Detect Device Type
    const ios = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    setIsIOS(ios);

    // 3. Register SW
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(err => console.log('SW Error', err));
    }

    // 4. Capture Install Event (Android)
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // 5. Smart logic to show for mobile users
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const hasDismissed = localStorage.getItem('pwa_banner_dismissed');

    if (isMobile && !standalone && !hasDismissed) {
      setTimeout(() => setShowBanner(true), 1500);
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
      if (outcome === 'accepted') setShowBanner(false);
      setDeferredPrompt(null);
    } else {
       // Manual fallback for Chrome/Brave if the prompt hasn't fired yet
       alert('لتثبيت التطبيق على جهازك، يرجى الضغط على القائمة (الثلاث نقاط) في المتصفح ثم اختيار "تثبيت التطبيق" أو "إضافة للشاشة الرئيسية".');
    }
  };

  const dismissBanner = () => {
    setShowBanner(false);
    localStorage.setItem('pwa_banner_dismissed', 'true');
  };

  if (isStandalone || !showBanner) return null;

  return (
    <>
      {/* Premium UI Banner */}
      <div className="fixed top-4 left-4 right-4 z-[9999] animate-fade-in-up md:max-w-md md:mx-auto">
        <div className="bg-white/85 backdrop-blur-2xl rounded-[1.8rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.2)] p-4 border border-white/60 flex items-center justify-between ring-1 ring-black/5">
          <div className="flex items-center gap-4">
            {/* Close Button */}
            <button 
              onClick={dismissBanner}
              className="w-7 h-7 flex items-center justify-center rounded-full bg-gray-100/50 text-gray-400 hover:text-gray-900 transition-colors"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12"/></svg>
            </button>
            
            {/* Logo Container */}
            <div className="relative">
              <div className="w-14 h-14 bg-white rounded-2xl overflow-hidden shadow-inner flex items-center justify-center p-1 border border-emerald-50">
                <img src="/icon-192x192.png" alt="App Logo" className="w-full h-full object-contain" />
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white"></div>
            </div>

            {/* Content */}
            <div className="flex flex-col gap-0.5">
              <h3 className="text-[15px] font-extrabold text-gray-900 tracking-tight leading-none">مشاعل المعرفة</h3>
              <p className="text-[11px] text-emerald-700/80 font-bold">منصة تعليمية متكاملة</p>
              <span className="text-[9px] text-gray-400 uppercase tracking-widest font-medium">Web App v1.0</span>
            </div>
          </div>

          {/* Action Button */}
          <button 
            onClick={handleInstallClick}
            className="group relative overflow-hidden bg-emerald-600 px-6 py-2.5 rounded-2xl flex items-center justify-center transition-all active:scale-95 shadow-lg shadow-emerald-200"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <span className="relative text-white font-bold text-sm tracking-wide">Install</span>
          </button>
        </div>
      </div>

      {/* iOS Manual Instructions Tooltip */}
      {showIOSHint && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-[2.5rem] p-8 max-w-sm w-full shadow-3xl text-center flex flex-col gap-6 relative">
            <button onClick={() => setShowIOSHint(false)} className="absolute top-6 right-6 text-gray-300 hover:text-gray-900 text-2xl font-bold">×</button>
            
            <div className="w-20 h-20 bg-emerald-50 rounded-3xl mx-auto flex items-center justify-center p-4">
               <img src="/icon-192x192.png" alt="Logo" className="w-full h-full object-contain" />
            </div>

            <div className="space-y-2">
              <h4 className="text-xl font-extrabold text-gray-900">تثبيت على الآيفون</h4>
              <p className="text-sm text-gray-500 leading-relaxed">بسبب قيود نظام Apple، يرجى اتباع الآتي للتثبيت:</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 rounded-3xl flex flex-col items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-blue-500">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12,2A10,10,0,1,0,22,12,10,10,0,0,0,12,2Zm0,18a8,8,0,1,1,8-8A8,8,0,0,1,12,20ZM11,7h2v6H11Zm0,8h2v2H11Z"/></svg>
                </div>
                <span className="text-xs font-bold text-gray-700">1. اضغط مشاركة</span>
              </div>
              <div className="p-4 bg-gray-50 rounded-3xl flex flex-col items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-gray-800">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"/></svg>
                </div>
                <span className="text-xs font-bold text-gray-700">2. إضافة للشاشة</span>
              </div>
            </div>

            <button 
              onClick={() => setShowIOSHint(false)}
              className="bg-gray-900 text-white py-4 rounded-2xl font-bold text-sm shadow-xl active:scale-95 transition-all"
            >
              فهمت ذلك
            </button>
          </div>
        </div>
      )}
    </>
  );
}

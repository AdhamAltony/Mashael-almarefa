self.addEventListener('install', () => {
    self.skipWaiting();
});

self.addEventListener('activate', () => {
    self.clients.claim();
});

self.addEventListener('fetch', (event) => {
    // Required to be recognized as a PWA
});

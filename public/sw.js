const CACHE_VERSION = 'gitor-v3';
const CORE_CACHE = `${CACHE_VERSION}-core`;
const RUNTIME_CACHE = `${CACHE_VERSION}-runtime`;
const CORE_ASSETS = [
    '/',
    '/offline/',
    '/manifest.json',
    '/favicon.svg',
    '/Om_symbol.svg',
    '/icon-192.png',
    '/icon-512.png'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CORE_CACHE)
            .then((cache) => cache.addAll(CORE_ASSETS))
            .then(() => self.skipWaiting())
    );
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys()
            .then((cacheNames) => Promise.all(
                cacheNames
                    .filter((cacheName) => cacheName.startsWith('gitor-') && ![CORE_CACHE, RUNTIME_CACHE].includes(cacheName))
                    .map((cacheName) => caches.delete(cacheName))
            ))
            .then(() => self.clients.claim())
    );
});

const networkFirst = async (request, fallbackUrl) => {
    const cache = await caches.open(RUNTIME_CACHE);
    try {
        const response = await fetch(request);
        if (response.ok) {
            await cache.put(request, response.clone());
        }
        return response;
    } catch {
        return (await cache.match(request))
            || (await caches.match(request))
            || (fallbackUrl ? await caches.match(fallbackUrl) : undefined)
            || Response.error();
    }
};

const cacheFirst = async (request) => {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
        return cachedResponse;
    }
    const response = await fetch(request);
    if (response.ok || response.type === 'opaque') {
        const cache = await caches.open(RUNTIME_CACHE);
        await cache.put(request, response.clone());
    }
    return response;
};

self.addEventListener('fetch', (event) => {
    const { request } = event;
    if (request.method !== 'GET') {
        return;
    }

    const url = new URL(request.url);
    if (request.mode === 'navigate') {
        event.respondWith(networkFirst(request, '/offline/'));
        return;
    }

    if (
        url.origin === self.location.origin
        && (
            url.pathname.startsWith('/quotes/')
            || url.pathname.startsWith('/diary/')
            || ['/manifest.json', '/sw.js'].includes(url.pathname)
        )
    ) {
        event.respondWith(networkFirst(request));
        return;
    }

    if (
        url.origin === self.location.origin
        || ['style', 'script', 'font', 'image'].includes(request.destination)
    ) {
        event.respondWith(cacheFirst(request));
    }
});

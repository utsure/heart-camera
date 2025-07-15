// キャッシュするファイル名を定義
const CACHE_NAME = 'heart-camera-cache-v1';
const urlsToCache = [
    './',
    './index.html',
    './style.css',
    './script.js',
    './images/heart-frame.png', // ハートのフレーム画像
    './images/icon-192.png',   // アイコン画像
    './images/icon-512.png'    // アイコン画像
];

// Service Workerのインストールイベント
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('Opened cache');
                return cache.addAll(urlsToCache);
            })
    );
});

// リクエストに対する応答
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                // キャッシュにあればそれを返す
                if (response) {
                    return response;
                }
                // なければネットワークから取得
                return fetch(event.request);
            })
    );
});


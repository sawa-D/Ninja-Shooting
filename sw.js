// Service Worker：一度開いたらファイルを保存して、オフラインでも遊べるようにする
// ゲームを更新したら、下の番号（v1 → v2）を変えるとiPhone側も新しい版に入れ替わる
const CACHE = 'oni-taiji-v6';
const FILES = [
  './',
  './index.html',
  './manifest.json',
  './icons/icon-180.png',
  './icons/icon-192.png',
  './icons/icon-512.png',
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(FILES)));
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// ネットにつながっていれば最新版、つながっていなければ保存した版を使う
self.addEventListener('fetch', (e) => {
  // BGM（音声ファイル）は少しずつ読み込む特殊な通信なので、ここでは扱わずブラウザに任せる
  if (e.request.url.includes('/bgm/') || e.request.headers.has('range')) return;

  e.respondWith(
    fetch(e.request)
      .then((res) => {
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put(e.request, copy));
        return res;
      })
      .catch(() => caches.match(e.request))
  );
});

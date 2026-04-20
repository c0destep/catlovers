const CACHE_NAME = 'catlovers-v1';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './about.html',
  './adoption.html',
  './benefits.html',
  './cats.html',
  './blog.html',
  './quiz.html',
  './post.html',
  './happy-endings.html',
  './css/main.css',
  './js/main.js',
  './cats.json',
  './img/catlovers.jpg',
  './favicon-32.png',
  './site.webmanifest'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(ASSETS_TO_CACHE))
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => response || fetch(event.request))
  );
});

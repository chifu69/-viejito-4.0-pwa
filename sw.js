const CACHE='industrial-ia-5.32.2-natural-chat-followup-fix';
const APP_FILES=[
  './',
  './index.html',
  './styles.css?v=5.32.2',
  './optimizer.js?v=5.32.2',
  './process-learning.js?v=5.32.2',
  './davis-standard-brain.js?v=5.32.2',
  './app.js?v=5.32.2',
  './manifest.webmanifest',
  './icons/icon-180.png',
  './icons/icon-192.png',
  './icons/icon-512.png'
];

self.addEventListener('install',event=>{
  event.waitUntil(
    caches.open(CACHE)
      .then(cache=>cache.addAll(APP_FILES))
      .then(()=>self.skipWaiting())
  );
});

self.addEventListener('activate',event=>{
  event.waitUntil(
    caches.keys()
      .then(keys=>Promise.all(keys.filter(key=>key!==CACHE).map(key=>caches.delete(key))))
      .then(()=>self.clients.claim())
  );
});

self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET') return;
  const url=new URL(event.request.url);
  const isAppCode=url.origin===self.location.origin &&
    (event.request.mode==='navigate' || /\.(?:html|js|css|webmanifest)$/.test(url.pathname));
  if(isAppCode){
    event.respondWith(
      fetch(event.request)
        .then(response=>{
          const copy=response.clone();
          caches.open(CACHE).then(cache=>cache.put(event.request,copy));
          return response;
        })
        .catch(()=>caches.match(event.request).then(cached=>cached || caches.match('./index.html')))
    );
    return;
  }
  event.respondWith(
    caches.match(event.request)
      .then(cached=>cached || fetch(event.request).then(response=>{
        const copy=response.clone();
        caches.open(CACHE).then(cache=>cache.put(event.request,copy));
        return response;
      }))
  );
});

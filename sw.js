const CACHE='industrial-ia-5.35.2-output-correction-hotfix';
const OUTPUT_CORRECTION_SCRIPT='./output-correction.js?v=5.35.2';
const APP_FILES=[
  './',
  './index.html',
  './styles.css?v=5.35.0',
  './lab-core.js?v=5.35.0',
  './optimizer.js?v=5.34.6',
  './process-learning.js?v=5.34.6',
  './davis-standard-brain.js?v=5.34.6',
  './shift-schedule.js?v=5.34.6',
  './daily-report.js?v=5.34.6',
  './local-brain.js?v=5.34.6',
  './conversation-engine.js?v=5.34.7',
  './chat-dialogue.js?v=5.34.7',
  './app.js?v=5.35.0',
  OUTPUT_CORRECTION_SCRIPT,
  './lab-brain.js?v=5.35.0',
  './manifest.webmanifest',
  './icons/icon-180.png',
  './icons/icon-192.png',
  './icons/icon-512.png'
];

function injectOutputCorrection(html){
  const text=String(html||'');
  if(text.includes('output-correction.js'))return text;
  const tag='<script src="./output-correction.js?v=5.35.2"></script>';
  return text.includes('</body>')?text.replace('</body>',`${tag}\n</body>`):`${text}\n${tag}`;
}

async function navigationResponse(response){
  if(!response)return response;
  const html=await response.text();
  const headers=new Headers(response.headers);
  headers.delete('content-length');
  return new Response(injectOutputCorrection(html),{status:response.status,statusText:response.statusText,headers});
}

if(typeof self!=='undefined'&&self.addEventListener){
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
    if(event.request.method!=='GET')return;
    const url=new URL(event.request.url);
    const isAppCode=url.origin===self.location.origin &&
      (event.request.mode==='navigate' || /\.(?:html|js|css|webmanifest)$/.test(url.pathname));
    if(isAppCode){
      event.respondWith((async()=>{
        try{
          const response=await fetch(event.request);
          const copy=response.clone();
          caches.open(CACHE).then(cache=>cache.put(event.request,copy));
          return event.request.mode==='navigate'?navigationResponse(response):response;
        }catch(_){
          const cached=await caches.match(event.request) || (event.request.mode==='navigate'?await caches.match('./index.html'):null);
          return event.request.mode==='navigate'&&cached?navigationResponse(cached):cached;
        }
      })());
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
}

if(typeof module!=='undefined'&&module.exports)module.exports={injectOutputCorrection};

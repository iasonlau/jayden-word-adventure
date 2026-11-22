const CACHE='zizi-v19-learning-village';
const ASSETS=['./','./index.html','./assessment.html','./app.css','./adventure.css','./game.css','./progression.css','./camp.css','./voice.js','./game.js','./app.js','./manifest.webmanifest','./icon-192.png','./icon-512.png','./assets/audio/manifest.json','./assets/game/forest-panorama.webp','./assets/game/fox-sprites.webp','./assets/game/spirit-realm-map.webp','./assets/game/spirit-realm-sprites.webp'];
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(ASSETS)).then(()=>self.skipWaiting())));
self.addEventListener('activate',event=>event.waitUntil(Promise.all([
  caches.keys().then(keys=>Promise.all(keys.filter(key=>key!==CACHE).map(key=>caches.delete(key)))),
  self.clients.claim()
])));
self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET'||new URL(event.request.url).origin!==self.location.origin)return;
  const url=new URL(event.request.url);
  if(url.pathname.endsWith('/assets/audio/manifest.json')){
    event.respondWith(fetch(event.request).then(response=>{if(response.ok)caches.open(CACHE).then(cache=>cache.put(event.request,response.clone()));return response}).catch(()=>caches.match(event.request)));
    return;
  }
  if(event.request.mode==='navigate'||event.request.destination==='document'){
    event.respondWith(fetch(event.request).then(response=>{if(response.ok)caches.open(CACHE).then(cache=>cache.put(event.request,response.clone()));return response}).catch(()=>caches.match(event.request).then(hit=>hit||caches.match('./index.html'))));
    return;
  }
  if(['script','style'].includes(event.request.destination)||/\.(?:js|css)$/.test(url.pathname)){
    event.respondWith(fetch(event.request).then(response=>{if(response.ok)caches.open(CACHE).then(cache=>cache.put(event.request,response.clone()));return response}).catch(()=>caches.match(event.request)));
    return;
  }
  event.respondWith(caches.match(event.request).then(cached=>{
    const fresh=fetch(event.request).then(response=>{if(response.ok){const copy=response.clone();caches.open(CACHE).then(cache=>cache.put(event.request,copy))}return response});
    return cached||fresh;
  }).catch(()=>caches.match('./index.html')));
});

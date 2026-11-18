const CACHE='zizi-v7-spirit-realm';
const ASSETS=['./','./index.html','./assessment.html','./app.css','./adventure.css','./game.css','./game.js','./app.js','./manifest.webmanifest','./icon-192.png','./icon-512.png','./assets/game/forest-panorama.webp','./assets/game/fox-sprites.webp','./assets/game/spirit-realm-map.webp','./assets/game/spirit-realm-sprites.webp'];
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(ASSETS)).then(()=>self.skipWaiting())));
self.addEventListener('activate',event=>event.waitUntil(Promise.all([
  caches.keys().then(keys=>Promise.all(keys.filter(key=>key!==CACHE).map(key=>caches.delete(key)))),
  self.clients.claim()
])));
self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET'||new URL(event.request.url).origin!==self.location.origin)return;
  if(event.request.mode==='navigate'||event.request.destination==='document'){
    event.respondWith(fetch(event.request).then(response=>{if(response.ok)caches.open(CACHE).then(cache=>cache.put(event.request,response.clone()));return response}).catch(()=>caches.match(event.request).then(hit=>hit||caches.match('./index.html'))));
    return;
  }
  event.respondWith(caches.match(event.request).then(cached=>{
    const fresh=fetch(event.request).then(response=>{if(response.ok){const copy=response.clone();caches.open(CACHE).then(cache=>cache.put(event.request,copy))}return response});
    return cached||fresh;
  }).catch(()=>caches.match('./index.html')));
});

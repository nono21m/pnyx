// Pnyx — service worker. Changer V à chaque mise à jour pour que l'iPhone recharge les fichiers.
const V="pnyx-v1-1";const A=["./", "index.html", "app.js", "data.js", "map.js", "synth.js", "manifest.json", "logo.svg", "icon-180.png", "icon-192.png", "icon-512.png"];
self.addEventListener("install",e=>{e.waitUntil(caches.open(V).then(c=>c.addAll(A)));self.skipWaiting();});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==V).map(x=>caches.delete(x))))) ;self.clients.claim();});
self.addEventListener("fetch",e=>{if(e.request.method!=="GET")return;e.respondWith(caches.match(e.request,{ignoreSearch:true}).then(r=>r||fetch(e.request).then(res=>{if(res.ok&&new URL(e.request.url).origin===location.origin){const cp=res.clone();caches.open(V).then(c=>c.put(e.request,cp));}return res;})));});

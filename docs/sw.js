/* Offline support: the app opens straight away, with or without a connection; changes sync when you're back online. */
const CACHE="routine-20261101202645";
const SHELL=["./","index.html","host.js","config.js","supabase.js","manifest.webmanifest","icon-192.png","icon-512.png","apple-touch-icon.png"];
const CDN=["cdn.jsdelivr.net","cdnjs.cloudflare.com","fonts.googleapis.com","fonts.gstatic.com"];
self.addEventListener("install",e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(SHELL.map(u=>new Request(u,{cache:"reload"})))).then(()=>self.skipWaiting()))}); // always fresh files, never the browser's short-term copy
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener("fetch",e=>{
  const r=e.request;if(r.method!=="GET")return;const u=new URL(r.url);
  if(u.origin===location.origin){ // the app itself: open instantly from this version's saved copy.
    // Each published version installs a fresh, complete copy (a new sw.js), so the files always match;
    // the newest version is picked up on the next open.
    e.respondWith(caches.match(r,{ignoreSearch:true}).then(m=>m||(r.mode==="navigate"?caches.match("index.html"):null))
      .then(m=>m||fetch(r).then(res=>{if(res.ok){const c=res.clone();caches.open(CACHE).then(x=>x.put(r,c))}return res})));return}
  if(CDN.includes(u.hostname)){ // versioned libraries and fonts: cache first
    e.respondWith(caches.match(r).then(m=>m||fetch(r).then(res=>{if(res.ok||res.type==="opaque"){const c=res.clone();caches.open(CACHE).then(x=>x.put(r,c))}return res})));return}
  // everything else (Supabase) always goes to the network
});

/* 末末記帳 service worker：只快取 app 本身（畫面），帳本資料不經過這裡 */
const V="mmjz-v6";
const SHELL=["./","./index.html","./manifest.webmanifest","./icons/icon-192.png","./icons/icon-512.png","./icons/apple-touch-icon.png"];
self.addEventListener("install",e=>{ e.waitUntil(caches.open(V).then(c=>c.addAll(SHELL)).then(()=>self.skipWaiting())); });
self.addEventListener("activate",e=>{ e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==V).map(k=>caches.delete(k)))).then(()=>self.clients.claim())); });
self.addEventListener("fetch",e=>{
  const u=new URL(e.request.url);
  if(e.request.method!=="GET"||u.origin!==location.origin) return;           // 試算表連線、字型不快取
  // 先用快取秒開，背景再抓新版，下次打開就是新的
  e.respondWith(caches.open(V).then(async c=>{
    const hit=await c.match(e.request,{ignoreSearch:true});
    const net=fetch(e.request).then(r=>{ if(r&&r.ok) c.put(e.request,r.clone()); return r; }).catch(()=>hit);
    return hit||net;
  }));
});

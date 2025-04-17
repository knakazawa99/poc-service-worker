/* global self, caches, fetch */
const CACHE = "demo-v1";
const CORE  = ["/", "/index.html", "/style.css", "/app.js", "/util.js", "/images/fallback.jpg"];

/* ---------- install ---------- */
self.addEventListener("install", event => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE);
      await Promise.all(
        CORE.map(path =>
          cache.add(path).catch(err => console.warn("skip", path, err))
        )
      );
    })()
  );
  self.skipWaiting();
});

/* ---------- activate ---------- */
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

/* ---------- fetch (cache‑first, http/https 限定) ---------- */
self.addEventListener("fetch", event => {
  // chrome‑extension://・devtools:// 等を除外
  if (!event.request.url.startsWith("http") || event.request.method !== "GET") return; 

  event.respondWith(
    (async () => {
      const cache = await caches.open(CACHE);
      const hit   = await cache.match(event.request);
      if (hit) return hit;

      try {
        const net = await fetch(event.request);
        if (event.request.method === "GET" && net.ok) {
          // http/https のみ cache.put
          cache.put(event.request, net.clone()).catch(console.error);
        }
        return net;
      } catch {
        return new Response("オフラインです", { status: 503 });
      }
    })()
  );
});

/* ---------- push ---------- */
self.addEventListener("push", event => {
  let data = {};
  try {
    data = event.data?.json() ?? {};
  } catch {
    data = { title: "通知", body: event.data?.text() ?? "" };
  }
  
  event.waitUntil(
    self.registration.showNotification(data.title ?? "通知", {
      body : data.body ?? "",
      icon : "/images/fallback.jpg",
      tag  : "demo-push",
    })
  );
});

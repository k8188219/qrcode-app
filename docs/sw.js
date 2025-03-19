const STATIC_NAME = 'static-2'

self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(STATIC_NAME)
      // cache.add(file path)
      cache.addAll([
        "./_next/static/css/72a0ac6edce85bcf.css",
        "./_next/static/tr1yxKfiaIPfh2h99TQ-y/_buildManifest.js",
        "./_next/static/tr1yxKfiaIPfh2h99TQ-y/_ssgManifest.js",
        "./_next/static/chunks/469-0112b0ada5978ec4.js",
        "./_next/static/chunks/framework-f66176bb897dc684.js",
        "./_next/static/chunks/app/_not-found/page-6d6f02352e3a435e.js",
        "./_next/static/chunks/app/page-3fe779fecadbb6df.js",
        "./_next/static/chunks/app/layout-e0eea0ab32c25e6e.js",
        "./_next/static/chunks/webpack-047610ae50c11db3.js",
        "./_next/static/chunks/fd9d1056-dd504a17eef30e15.js",
        "./_next/static/chunks/pages/_app-72b849fbd24ac258.js",
        "./_next/static/chunks/pages/_error-7ba65e1336b92748.js",
        "./_next/static/chunks/117-1d6a4c1b4e530111.js",
        "./_next/static/chunks/main-daf1f45288810b12.js",
        "./_next/static/chunks/polyfills-42372ed130431b0a.js",
        "./_next/static/chunks/d0f5a89a-718ff327e9c9a3c0.js",
        "./_next/static/chunks/main-app-5f7e99887ce5ec69.js",
        "./icon.png",
        "./index.html",
        "./",
      ])
    })()
  )
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys()
      Promise.allSettled(keys.map(key => key !== STATIC_NAME ? caches.delete(key) : null))
    })()
  )
  clients.claim()
})

self.addEventListener('fetch', (event) => {
  event.respondWith(
    (async () => {
      const res = await caches.match(event.request)
      return res ? res : fetch(event.request)
    })()
  )
})
// Prepper Evolution Service Worker — pe-cache-v1
const CACHE_NAME = "pe-cache-v1";

// Pages to pre-cache so the tools work offline
const PRECACHE_URLS = [
  "/tools",
  "/tools/bug-out-bag-calculator",
  "/tools/solar-power-calculator",
];

// -----------------------------------------------------------
// INSTALL — pre-cache tool pages
// -----------------------------------------------------------
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

// -----------------------------------------------------------
// ACTIVATE — clean up old caches
// -----------------------------------------------------------
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== CACHE_NAME)
            .map((key) => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

// -----------------------------------------------------------
// FETCH — cache-first for static assets, network-first for
//         navigations and API calls
// -----------------------------------------------------------
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Only handle same-origin requests
  if (url.origin !== self.location.origin) return;

  // Determine strategy based on request type
  if (isStaticAsset(url)) {
    // Cache-first for static assets (CSS, JS, images, fonts)
    event.respondWith(cacheFirst(request));
  } else {
    // Network-first for page navigations and API calls
    event.respondWith(networkFirst(request));
  }
});

// -----------------------------------------------------------
// Helpers
// -----------------------------------------------------------

function isStaticAsset(url) {
  const path = url.pathname;
  return (
    path.startsWith("/_next/static/") ||
    path.startsWith("/icons/") ||
    path.startsWith("/products/") ||
    /\.(css|js|woff2?|ttf|otf|eot|png|jpe?g|gif|svg|webp|avif|ico|mp4)$/i.test(
      path
    )
  );
}

/**
 * Cache-first: serve from cache, fall back to network (and cache the response).
 */
async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;

  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    // If both cache and network fail, return a basic offline response
    return new Response("Offline", {
      status: 503,
      statusText: "Service Unavailable",
    });
  }
}

/**
 * Network-first: try network, fall back to cache.
 * This keeps page navigations fresh while still providing offline access
 * to any previously-visited (or pre-cached) pages.
 */
async function networkFirst(request) {
  try {
    const response = await fetch(request);
    // Cache successful GET responses for offline fallback
    if (response.ok && request.method === "GET") {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    // Network failed — try the cache
    const cached = await caches.match(request);
    if (cached) return cached;

    // Nothing cached either — return a minimal offline page for navigations
    if (request.mode === "navigate") {
      return new Response(offlineHTML(), {
        status: 200,
        headers: { "Content-Type": "text/html" },
      });
    }

    return new Response("Offline", {
      status: 503,
      statusText: "Service Unavailable",
    });
  }
}

/**
 * Minimal offline fallback page shown when the user navigates to
 * a page that has not been cached and the network is unavailable.
 */
function offlineHTML() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Offline — Prepper Evolution</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: Inter, system-ui, sans-serif;
      background: #FAF7F2;
      color: #1a1a1a;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      padding: 2rem;
      text-align: center;
    }
    .container { max-width: 420px; }
    h1 { font-family: Oswald, sans-serif; font-size: 1.75rem; margin-bottom: 0.75rem; color: #C45D2C; }
    p { font-size: 1rem; line-height: 1.6; margin-bottom: 1.25rem; color: #555; }
    a {
      display: inline-block;
      padding: 0.65rem 1.5rem;
      background: #C45D2C;
      color: #fff;
      text-decoration: none;
      border-radius: 6px;
      font-weight: 600;
    }
    a:hover { background: #a94e25; }
  </style>
</head>
<body>
  <div class="container">
    <h1>You're Offline</h1>
    <p>It looks like you've lost your connection. Any tools or pages you've visited before are still available offline.</p>
    <a href="/tools">Go to Tools</a>
  </div>
</body>
</html>`;
}

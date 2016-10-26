var VERSION = "1.3.5";
var CACHE_NAME = "demo-" + VERSION;

self.addEventListener("install", function(event) {
    log("Install event in progress", event);

    event.waitUntil(
        caches.open(CACHE_NAME).then(function(cache) {
            return cache.addAll([
                "/",
                "/css/bootstrap.min.css",
                "/css/index.css",
                "/fonts/glyphicons-halflings-regular.eot",
                "/fonts/glyphicons-halflings-regular.svg",
                "/fonts/glyphicons-halflings-regular.ttf",
                "/fonts/glyphicons-halflings-regular.woff",
                "/fonts/glyphicons-halflings-regular.woff2",
                "/js/jquery.min.js",
                "/js/bootstrap.min.js",
                "/js/index.js",
                "/reset/",
            ]);
        }).then(function() {
            log("Install completed");
            return self.skipWaiting();
        })
    );
});

self.addEventListener("activate", function(event) {
    log("Activate event in progress", event);

    // Just for debugging, list all controlled clients.
    self.clients.matchAll({
        includeUncontrolled: true
    }).then(function(clientList) {
        var urls = clientList.map(function(client) {
            return client.url;
        });
        log("Matching clients:", urls.join(", "));
    });

    event.waitUntil(
        // Delete old cache entries that don’t match the current version.
        caches.keys().then(function(cacheNames) {
            return Promise.all(
                cacheNames.map(function(cacheName) {
                    if (cacheName !== CACHE_NAME) {
                        log("Deleting old cache:", cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(function() {
            log("Claiming clients");
            return self.clients.claim();
        })
    );
});

self.addEventListener("fetch", function(event) {
    event.respondWith(
        caches.match(event.request).then(function(response) {
            if (response) {
                log("Serving from cache:", response.url);
            }
            else {
                console.warn("[Worker-" + VERSION + "] missing cache:", response.url);
            }
            return response || fetch(event.request);
        })
    );
});

function log() {
    var args = Array.apply(null, arguments);
    var message = args.shift();
    args.unshift("[Worker-" + VERSION + "] " + message);
    console.log.apply(null, args);
}
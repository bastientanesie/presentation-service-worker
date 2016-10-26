self.addEventListener("install", function(event) {
    console.log("RESET-WORKER: Install in progress");

    event.waitUntil(
        caches.keys()
            .then(function(keys) {
                return Promise.all(
                    keys.map(function(key) {
                        console.log("RESET-WORKER: Removing cache key: " + key);
                        return caches.delete(key);
                    })
                );
            })
            .then(function() {
                console.log("RESET-WORKER: Reset complete");
            })
    );
});
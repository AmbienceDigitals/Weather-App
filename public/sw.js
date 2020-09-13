const staticCacheName = 'site-static-v1';
const dynamicCacheName = 'site-dynamic-v1';

// Cache size limit function
const limitCacheSize = (name, size) => {
    caches.open(name).then(cache => {
        cache.keys().then(keys => {
            if (keys.length > size) {
                cache.delete(keys[0]).then(limitCacheSize(name, size))
            }
        })
    })
};

// install service worker
self.addEventListener('install', evt => {
    evt.waitUntil(
        caches.open(staticCacheName).then(cache => {
            cache.add('/index.html');
            cache.add('/Javascript/app.js');
            cache.add('/Javascript/script.js');
            cache.add('/CSS/Styling.css');
            cache.add('/manifest.json');
            cache.add('https://api.openweathermap.org/data/2.5/weather?');
            cache.add('/Images/Default.jpg');
            cache.add('/Images/icons/weather-144x144.png');
            
        })
    );
});

// activate service worker
self.addEventListener('activate', evt => {
    evt.waitUntil(
        caches.keys().then(keys => {
            return Promise.all(
                keys.filter(key => key !== staticCacheName && key !== dynamicCacheName)
                .map(key => caches.delete(key))
            )
        })
    );
});

// fetch events
self.addEventListener('fetch', evt => {
    if(evt.request.url.indexOf('http://api.openweathermap.org/data/2.5/weather?${searchMethod}=${searchTerm}&APPID=${appId}&units=${units}') === -1) {
        evt.respondWith(
            caches.match(evt.request).then(cacheRes => {
                return cacheRes || fetch(evt.request).then(fetchRes => {
                    return caches.open(dynamicCacheName).then(cache => {
                        cache.put(evt.request.url, fetchRes.clone());
                        limitCacheSize(dynamicCacheName, 20);
                        return fetchRes;
                    })
                });
            }).catch(() => { if(evt.request.url.indexOf('http://api.openweathermap.org/data/2.5/weather?${searchMethod}=${searchTerm}&APPID=${appId}&units=${units}') > -1) {
                    return caches.match('/404.html');
            }
        })
        );
    }
 
});

const APP_PREFIX = 'TrackYourBudget-';
const VERSION = 'version_01';
const CACHE_NAME = APP_PREFIX + VERSION;
const DATA_CACHE_NAME = APP_PREFIX + "DATA" + VERSION
const FILES_TO_CACHE = [
    '/',
    './index.html',
    '/css/styles.css',
    '/js/index.js',
    '/js/idb.js',
    './icons/icon-72x72.png'
];



self.addEventListener('install', function(e) {
    e.waitUntil(
        caches.open(CACHE_NAME).then(function(cache) {
            console.log('installing cache: ' + CACHE_NAME)
            return cache.addAll(FILES_TO_CACHE)
        })
    )
});

self.addEventListener('fetch', function(e) {
    console.log('fetch request: ' + e.request.url)
    if (e.request.url.includes("/api/")) {
        console.log("here")
        e.respondWith(
          caches.open(DATA_CACHE_NAME).then(cache => {
            return fetch(e.request)
              .then(response => {
                if (response.status === 200) {
                    console.log("Data has been saved to cache!")
                  cache.put(e.request.url, response.clone());
                }
    
                return response;
              })
              .catch(err => {
                  console.log("Fetch failed! Getting data from cache instead..")
                return cache.match(e.request);
              });
          }).catch(err => console.log(err))
        );
    
        return;
      } else {

        e.respondWith(
            caches.match(e.request).then(function (request) {
                return request || fetch(e.request)
            })
        );
      }


});

self.addEventListener('activate', function(e) {
    e.waitUntil(
        caches.keys().then(function(keyList) {
            let cacheKeepList = keyList.filter(function(key) {
                return key.indexOf(APP_PREFIX);
            });
            cacheKeepList.push(CACHE_NAME);

            return Promise.all(
                keyList.map(function(key, i) {
                    if (cacheKeepList.indexOf(key) === -1){
                        console.log('deleting cache: ' + keyList[i]);
                        return caches.delete(keyList[i]);
                    }
                })
            );
        })
    );
});
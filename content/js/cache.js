function test() {
    console.log("cache");
    CheckCache();
}

function CheckCache() {
    caches.has('Preferences').then(function(hasCache) {
        if (!hasCache) {
            // Create Box asking to allow cache
            console.log("no cache");
        }
        else {
            // If Cache not allowed, don't ask

            // If Cache allowed, load
            console.log("cache exists");
        }
    });
}

function FindPopup() {
    // Get popup
    return document.getElementById('popup');
}

function ClosePopupAskCache(val) {
    // if true : add cache to not allow cache
    // if false : close
    if (val) console.log("val true");
    else console.log("val false");
    Fade(FindPopup(), "fade-out");
}

function CreatePopupAskCache() {
    
}

function CreateCachePlayground() {
    // const newCache = await caches.open('Playground-ltnl-461');
}
// const newCache = await caches.open('playground');
// https://blog.logrocket.com/javascript-cache-api/
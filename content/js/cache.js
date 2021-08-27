allowLocalStorage = false;

function StartCache() {
    console.log("cache");
    CheckCache();
}

function CheckCache() {
    var pref = JSON.parse(localStorage.getItem("Preferences"));
    if (!pref) {
        CreatePopupAskCache();
        console.log("no cache");
    }
    else {
        if (pref.allowLocalStorage) {
            allowLocalStorage = true;
            console.log("local storage is allowed !");
        }
        else {
            console.log("local storage isn't allowed :(");
        }
        // do stuff
        console.log(pref);
        console.log(allowLocalStorage);
    }
}

function FindPopup() {
    // Get popup
    return document.getElementById('popup');
}

function ClosePopupAskCache(val) {
    if (val != null) {
        const Preferences = {
            allowLocalStorage: val,
        };
        localStorage.setItem("Preferences", JSON.stringify(Preferences));
    }

    Fade(FindPopup(), "fade-out");
    setTimeout(() => {
        FindPopup().innerHTML = "";
    }, 400);
}

function CreatePopupAskCache() {
    Fade(FindPopup(),"fade-in");
    FindPopup().innerHTML += '<div class="mask"></div><div class="ask-cache"><div class="text"><p>This website is using your local storage to run at its fullest, do you allow us to give you entire control over your own data? (we can\'t use it even if we wanted!)</p><p>Why?</p></div><div class="answers"><p onclick="ClosePopupAskCache(true);">Yes</p><p onclick="ClosePopupAskCache(false);">No</p><p onclick="ClosePopupAskCache();">Ask me next time</p></div></div>';
}

function CreateCachePlayground() {
    // const newCache = await caches.open('Playground-ltnl-461');
}
// const newCache = await caches.open('playground');
// https://blog.logrocket.com/javascript-cache-api/

function DeleteAllLocalStorage() {
    localStorage.clear();
    StartCache();
    console.log("Local storage has been deleted!");
}
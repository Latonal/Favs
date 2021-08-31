allowLocalStorage = false;
dbName = "playground-ltnl-461";

function StartData() {
    console.log("cache");
    CheckPrefs();
}

function CheckPrefs() {
    var pref = JSON.parse(localStorage.getItem("Preferences"));
    if (!pref) {
        CreatePopupAskPrefs();
    }
    else {
        if (pref.allowLocalStorage) {
            allowLocalStorage = true;
            CreateDataPlayground();
        }
        else {
            // console.log("local storage isn't allowed :(");
        }
    }
}

function FindPopup() {
    // Get popup
    return document.getElementById('popup');
}

function ClosePopupAskPrefs(val) {
    if (val != null) {
        allowLocalStorage = val;
        const Preferences = {
            allowLocalStorage: val,
        };
        localStorage.setItem("Preferences", JSON.stringify(Preferences));
    }

    if (val) {
        CreateDataPlayground();
    }

    Fade(FindPopup(), "fade-out");
    setTimeout(() => {
        FindPopup().innerHTML = "";
    }, 400);
}

function CreatePopupAskPrefs() {
    Fade(FindPopup(), "fade-in");
    FindPopup().innerHTML += '<div class="mask"></div><div class="ask-cache"><div class="text"><p>This website is using your local storage to run at its fullest, do you allow us to give you entire control over your own data? (we can\'t use it even if we wanted!)</p><p>Why?</p></div><div class="answers"><p onclick="ClosePopupAskPrefs(true);">Yes</p><p onclick="ClosePopupAskPrefs(false);">No</p><p onclick="ClosePopupAskPrefs();">Ask me next time</p></div></div>';
}

function CreateDataPlayground() {
    var db;
    var req = indexedDB.open(dbName, 1);
    req.onerror = function (e) {
        console.log("Database error: " + e.target.errorCode);
    };
    // req.onsuccess = function(e) {
    // };
    req.onupgradeneeded = function (e) {
        console.log("Created Database");
        db = e.target.result;

        var objectStore = db.createObjectStore("playground", { keyPath: "id" });

        // objectStore.createIndex("category", "category", { unique: false});

    }
}
// const newCache = await caches.open('playground');
// https://blog.logrocket.com/javascript-cache-api/

function DeleteAllLocalStorage() {
    localStorage.clear();
    StartData();
    console.log("Local storage has been deleted!");
}

function DeleteDataPlayground() {
    let deleteReq = indexedDB.open(dbName);
    deleteReq.onsuccess = function () {
        console.log("Database has been deleted");
    }
    deleteReq.onerror = function () {
        console.log("An error occured while trying to delete the database");
    }
}
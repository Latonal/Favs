// using https://www.w3.org/TR/IndexedDB/ & https://www.w3docs.com/learn-javascript/javascript-indexeddb.html
allowLocalStorage = false;
DB_NAME = "playground-ltnl-461";
DB_VERSION = 1;

// DEBUG
// let deleteReq = indexedDB.deleteDatabase(DB_NAME);
// deleteReq.onsuccess = function() { console.log("Successfully deleted db");}
// deleteReq.onerror = function() { console.log("Couldn't delete db");}

function StartData() {
    console.log("cache");
    // CheckPrefs();
}

let openRequest = indexedDB.open(DB_NAME, DB_VERSION);
let db;

openRequest.onupgradeneeded = function(e) {
    db = openRequest.result;
    console.log("Current db version: " + db.version);
    // console.log("Old version: " + e.oldVersion);
    if (e.oldVersion < 1) {
        console.log("version 1, precedent was: " + e.oldVersion);
        const store = db.createObjectStore("data", { keyPath: "id"});
        const playground = store.createIndex("playground", "plg", {unique: true});
        
        store.put({plg:defaultPlayground, id:0});
    }

    
}
// Delete object store :
// db.deleteObjectStore('playground');
openRequest.onerror = function() {
    console.log("Error opening the DB ", openRequest.error);
}

openRequest.onsuccess = function() {
    db = openRequest.result;
    console.log("Opened db", db);
    // var store = db.transaction("data", "readonly");
    // var allRecords = store.getAll();
    // allRecords.onsuccess = function() {
    //     console.log(allRecords.result);
    // }

    let transaction = db.transaction("data", "readonly");
    // let plg = transaction.objectStore("data").getAll();
    let plg = transaction.objectStore("data");
    let request = plg.openCursor();
    request.onsuccess = function() {
        let cursor = request.result;
        if (cursor) {
            // let key = cursor.key;
            let value = cursor.value;
            console.log(value.plg);
            cursor.continue;
        }
        else {
            console.log("No cursor");
        }
    }
    console.log(plg);
}

// function InitializeDB() {
//     console.log("InitializeDB");
//     let transaction = db.transaction("playground", "readwrite") // 1
//     let playground = transaction.objectStore("playground"); // 2
//     let request = playground.add(defaultPlayground);
//     request.onsuccess = function() {
//         console.log("Default playground has been added to the store", request.result);
//     };
//     request.onerror = function() {
//         console.log("Error", request.error);
//     }
// }



// console.log(db.Playground);
// console.log(db.playground);

// function CheckPrefs() {
//     var pref = JSON.parse(localStorage.getItem("Preferences"));
//     if (!pref) {
//         CreatePopupAskPrefs();
//     }
//     else {
//         if (pref.allowLocalStorage) {
//             allowLocalStorage = true;
//             CreateDataPlayground();
//         }
//         else {
//             // console.log("local storage isn't allowed :(");
//         }
//     }
// }

// function FindPopup() { // Get popup
//     return document.getElementById('popup');
// }

// function ClosePopupAskPrefs(val) {
//     if (val != null) {
//         allowLocalStorage = val;
//         const Preferences = {
//             allowLocalStorage: val,
//         };
//         localStorage.setItem("Preferences", JSON.stringify(Preferences));
//     }

//     if (val) {
//         CreateDataPlayground();
//     }

//     Fade(FindPopup(), "fade-out");
//     setTimeout(() => {
//         FindPopup().innerHTML = "";
//     }, 400);
// }

// function CreatePopupAskPrefs() {
//     Fade(FindPopup(), "fade-in");
//     FindPopup().innerHTML += '<div class="mask"></div><div class="ask-cache"><div class="text"><p>This website is using your local storage to run at its fullest, do you allow us to give you entire control over your own data? (we can\'t use it even if we wanted!)</p><p>Why?</p></div><div class="answers"><p onclick="ClosePopupAskPrefs(true);">Yes</p><p onclick="ClosePopupAskPrefs(false);">No</p><p onclick="ClosePopupAskPrefs();">Ask me next time</p></div></div>';
// }

// function CreateDataPlayground() {
    
// }
// // const newCache = await caches.open('playground');
// // https://blog.logrocket.com/javascript-cache-api/

// function DeleteAllLocalStorage() {
//     localStorage.clear();
//     StartData();
//     console.log("Local storage has been deleted!");
// }

// function DeleteDataPlayground() {
//     let deleteReq = indexedDB.open(DB_NAME);
//     deleteReq.onsuccess = function () {
//         console.log("Database has been deleted");
//     }
//     deleteReq.onerror = function () {
//         console.log("An error occured while trying to delete the database");
//     }
// }

// function SaveDataPlayground() {
//     // save var data into db
// }
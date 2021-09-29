// using https://www.w3.org/TR/IndexedDB/ & https://www.w3docs.com/learn-javascript/javascript-indexeddb.html
allowLocalStorage = false;
DB_NAME = "playground-ltnl-461"; // please if you are copying my code, change the DB_NAME
DB_VERSION = 1;
data = null;

// DEBUG
function DeleteDB() {
    let deleteReq = indexedDB.deleteDatabase(DB_NAME);
    deleteReq.onsuccess = function () { console.log("Successfully deleted db"); }
    deleteReq.onerror = function () { console.log("Couldn't delete db"); }
    console.log("Deleted DB");
}

let openRequest = indexedDB.open(DB_NAME, DB_VERSION);
let db;

openRequest.onupgradeneeded = function (e) {
    db = openRequest.result;
    if (e.oldVersion < 1) {
        console.log("version 1, precedent was: " + e.oldVersion);
        const store = db.createObjectStore("data", { keyPath: "id" });
        const playground = store.createIndex("playground", "playground", { unique: true });

        store.put({ playground: defaultPlayground.playground, id: 0 });
    }
}
openRequest.onerror = function () {
    console.log("Error opening the DB ", openRequest.error);
}

openRequest.onsuccess = function () {
    db = openRequest.result;
    console.log("Opened db", db);

    let transaction = db.transaction("data", "readonly");
    let store = transaction.objectStore("data");
    let request = store.openCursor();
    request.onsuccess = function () {
        let cursor = request.result;
        if (cursor) {
            // let key = cursor.key;
            let value = cursor.value;
            data = value;
            console.log(value.playground);
            cursor.continue;
            PlaygroundParser();
        }
        else {
            console.log("No cursor");
        }
    }
    console.log("store:", store);
}

/** Save into the navigator the data JSON object */
async function SavePlaygroundData() {
    console.log("aaaaaaaaa");
    db = openRequest.result;
    let transaction = db.transaction("data", "readwrite");
    let store = transaction.objectStore("data");
    let request = store.get(0);

    request.onsuccess = function (e) {
        var dataplg = e.target.result;
        dataplg.playground = data.playground;
        var objRequest = store.put(dataplg);
        objRequest.onsuccess = function () {
            // console.log("Success updating the record");
        }
        objRequest.onerror = function () {
            console.log("No success updating the record", objRequest.error);
        }
    }
    // console.log("data",data.playground);
}
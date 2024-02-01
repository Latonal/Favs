const DB_NAME = "playground-ltnl-462";
const DB_VERSION = 1;

// export {
//     instantiateDB,
//     openDatabase,
//     deleteDB
// }

function instantiateDB() {
    // TODO : replace this openRequest by openDatabase()
    const openRequest = indexedDB.open(DB_NAME, DB_VERSION); //
    let db; //

    return new Promise((resolve, reject) => {
        openRequest.onupgradeneeded = function (event) {
            const db = openRequest.result;

            if (event.oldVersion < 1) { // Initialize db
                const elementsStore = db.createObjectStore("elements", { keyPath: "uuid" })
                elementsStore.createIndex("by_parent", "parent", { unique: false });
                elementsStore.createIndex("by_order", "order", { unique: false });

                const iconsStore = db.createObjectStore("icons", { keyPath: "uuid" });
                iconsStore.createIndex("by_name", "name", { unique: false });
                iconsStore.createIndex("link", "link", { unique: false });

                const informationsStore = db.createObjectStore("informations", { autoIncrement: true });
                informationsStore.createIndex("by_parent", "parent", { unique: false });


                defaultGeneration(elementsStore, iconsStore, informationsStore);

                StartTutorial();
            }
        };
        openRequest.onerror = function () {
            console.error("ERROR Database-2:\nAn error occured while opening the database: ", openRequest.error);
            // reject("ERROR Database-2:\nAn error occured while opening the database: \n" + openRequest.error);
            reject(false);
        };
        openRequest.onsuccess = function () {
            db = openRequest.result;
            console.log("Database has been opened: ", db);
            // continue using the db object
            let elements = db.transaction("elements", "readonly");
            let elem = elements.objectStore("elements");

            // get by index
            let parent = elem.index("by_parent");
            console.log("get elements with parent 1:", parent.getAll(1));

            // empty index is not possible, we use a dummy data
            console.log("by empty index: ", parent.getAll(IDBKeyRange.only(0)));

            // get by key
            let withKey = elem.get(1);
            console.log("with key:", withKey);

            // get only data related to key
            withKey.onsuccess = function () {
                const matching = withKey.result;
                console.log("parent:", matching.parent, " id:", matching.uuid);
            }

            // TODO : CURSOR

            db.close();
            resolve(true);
        };
    });
}

function openDatabase() {
    return new Promise((resolve, reject) => {
        const openRequest = indexedDB.open(DB_NAME, DB_VERSION);
        // const openRequest = IndexedDBWrapper.open(DB_NAME, DB_VERSION);
        // const openRequest = FavsIndexedDB.open(DB_NAME, DB_VERSION);

        openRequest.onerror = function () {
            console.error("ERROR Database-1:\nAn error occured while opening the database: ", openRequest.error);
            reject(false);
        };

        openRequest.onsuccess = function () {
            resolve(openRequest.result);
        };
    });
}

function deleteDB() {
    let deleteRequest = indexedDB.deleteDatabase(DB_NAME);
    deleteRequest.onerror = function () {
        console.error("ERROR Database-3:\nAn error occured while deleting the database", deleteRequest.error);
    }
    deleteRequest.onsuccess = function () {
        console.log("Database has successfully been deleted");
    }
    console.log("database has been deleted");
}

function defaultGeneration(elementsStore, iconsStore, informationsStore) {
    // ELEMENTS
    // Page 1
    elementsStore.put({ parent: 0, order: 0, uuid: 1 });
        elementsStore.put({ parent: 1, order: 0, uuid: 2 });
            elementsStore.put({ parent: 2, order: 1, uuid: 3 });
                elementsStore.put({ parent: 3, order: 0, uuid: 4 });
                elementsStore.put({ parent: 3, order: 1, uuid: 19 });
                elementsStore.put({ parent: 3, order: 3, uuid: 20 });
                elementsStore.put({ parent: 3, order: 2, uuid: 21 });
            elementsStore.put({ parent: 2, order: 0, uuid: 5 });
                elementsStore.put({ parent: 5, order: 0, uuid: 6 });
            elementsStore.put({ parent: 2, order: 2, uuid: 7 });
                elementsStore.put({ parent: 7, order: 2, uuid: 22 });
                    elementsStore.put({ parent: 22, order: 1, uuid: 8 });
                    elementsStore.put({ parent: 22, order: 0, uuid: 25 });
                elementsStore.put({ parent: 7, order: 0, uuid: 23 });
                    elementsStore.put({ parent: 23, order: 2, uuid: 24 });
        elementsStore.put({ parent: 1, order: 1, uuid: 9 });
            elementsStore.put({ parent: 9, order: 0, uuid: 10 });
        elementsStore.put({ parent: 1, order: 2, uuid: 11 });
            elementsStore.put({ parent: 11, order: 0, uuid: 12 });

    // Page 2
    elementsStore.put({ parent: 0, order: 1, uuid: 13 });
        elementsStore.put({ parent: 13, order: 0, uuid: 14 });
            elementsStore.put({ parent: 14, order: 0, uuid: 15 });
    // Page 3
    elementsStore.put({ parent: 0, order: 2, uuid: 16 });
        elementsStore.put({ parent: 16, order: 0, uuid: 17 });
            elementsStore.put({ parent: 17, order: 0, uuid: 18 });

    // ICONS
    iconsStore.put({ name: "options", link: "./img/options.svg", uuid: 1 });
    iconsStore.put({ name: "blah blah", link: "./img/blahblah", uuid: 2 });

    // INFORMATIONS
    informationsStore.put({ parent: 1, theme: "light" });
    informationsStore.put({ parent: 2 });
    informationsStore.put({ parent: 3, customcss: "background-color:cadetblue;" });
    informationsStore.put({ parent: 4, text: "middle element", img_uuid: 1 });
    informationsStore.put({ parent: 19, text: "new tab", img_uuid: 1, href: "https://www.youtube.com/", target: "_blank", customcss: "background-color:green;font-style:oblique;" });
    informationsStore.put({ parent: 20, text: "same tab - no target", img_uuid: 1, href: "https://www.youtube.com/" });
    informationsStore.put({ parent: 21, text: "same tab - with target", img_uuid: 1, href: "https://www.youtube.com/", target: "_self" });
    informationsStore.put({ parent: 5 });
    informationsStore.put({ parent: 6, text: "left element" });
    informationsStore.put({ parent: 7 });
    informationsStore.put({ parent: 22 });
    informationsStore.put({ parent: 8, text: "right element" });
    informationsStore.put({ parent: 25, text: "column right" });
    informationsStore.put({ parent: 23 });
    informationsStore.put({ parent: 24, text: "some text below right element" });
    informationsStore.put({ parent: 9 });
    informationsStore.put({ parent: 10, text: "sticker below" });
    informationsStore.put({ parent: 11 });
    informationsStore.put({ parent: 12, text: "another sticker below" });
    informationsStore.put({ parent: 19 }); // debugging

    informationsStore.put({ parent: 13, customcss: "background-color:green;" });
    informationsStore.put({ parent: 14 });
    informationsStore.put({ parent: 15, text: "some text on the second page" });
    informationsStore.put({ parent: 16, customcss: "background-color:blue;" });
    informationsStore.put({ parent: 17 });
    informationsStore.put({ parent: 18, text: "some text on the third page" });
}
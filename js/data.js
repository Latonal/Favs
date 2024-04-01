const DB_NAME = "playground-ltnl-462";
const DB_VERSION = 1;

var highestId = 0;

// export {
//     openDatabase,
//     instantiateDB,
//     deleteDB
// }

function openDatabase() {
    return new Promise((resolve, reject) => {
        const openRequest = indexedDB.open(DB_NAME, DB_VERSION);

        openRequest.onerror = function () {
            console.error("ERROR Database-1:\nAn error occured while opening the database: ", openRequest.error);
            reject(false);
        };

        openRequest.onsuccess = function () {
            resolve(openRequest.result);
        };
    });
}

function instantiateDB() {
    const openRequest = indexedDB.open(DB_NAME, DB_VERSION); //

    return new Promise((resolve, reject) => {
        openRequest.onupgradeneeded = function (event) {
            const db = openRequest.result;

            if (event.oldVersion < 1) { // Initialize db
                const elementsStore = db.createObjectStore("elements", { keyPath: "uuid" })
                elementsStore.createIndex("by_parent", "parent", { unique: false });
                elementsStore.createIndex("by_uuid", "uuid", { unique: true });

                const iconsStore = db.createObjectStore("icons", { keyPath: "uuid" });
                iconsStore.createIndex("by_name", "name", { unique: false });


                defaultGeneration(elementsStore, iconsStore);

                StartTutorial();
            }
        };
        openRequest.onerror = function () {
            console.error("ERROR Database-2:\nAn error occured while opening the database: ", openRequest.error);
            // reject("ERROR Database-2:\nAn error occured while opening the database: \n" + openRequest.error);
            reject(false);
        };
        openRequest.onsuccess = function () {
            const db = openRequest.result;
            console.log("Database has been opened: ", db);
            // continue using the db object
            const transactionRead = db.transaction("elements", "readonly");
            const elementsStore = transactionRead.objectStore("elements");

            // get by index
            let parent = elementsStore.index("by_parent");
            console.log("get elements with parent 1:", parent.getAll(1));

            // empty index is not possible, we use a dummy data
            console.log("by empty index: ", parent.getAll(IDBKeyRange.only(0)));

            // get by key
            let withKey = elementsStore.get(1);
            console.log("with key:", withKey);

            // get only data related to key
            withKey.onsuccess = function () {
                const matching = withKey.result;
                console.log("parent:", matching.parent, " id:", matching.uuid);
            }

            getElementsHighestId(elementsStore);

            db.close();
            resolve(true);
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

function defaultGeneration(elementsStore, iconsStore) {
    // ELEMENTS
    // Page 1 -- 19 items
    elementsStore.put({ parent: 0, order: 0, uuid: 1, theme: "light" });
    elementsStore.put({ parent: 1, order: 0, uuid: 2 });
    elementsStore.put({ parent: 2, order: 1, uuid: 3, customcss: "background-color:cadetblue;" });
    elementsStore.put({ parent: 3, order: 0, uuid: 4, text: "middle element", img_uuid: 1 });
    elementsStore.put({ parent: 3, order: 1, uuid: 19, text: "new tab", img_uuid: 3, href: "https://www.youtube.com/", target: "_blank", customcss: "background-color:green;font-style:oblique;" });
    elementsStore.put({ parent: 3, order: 3, uuid: 20, text: "same tab - no target", img_uuid: 1, href: "https://www.youtube.com/" });
    elementsStore.put({ parent: 3, order: 2, uuid: 21, text: "same tab - with target", img_uuid: 1, href: "https://www.youtube.com/", target: "_self", customcss: "font-size:25px;font-weight:bold;" });
    elementsStore.put({ parent: 2, order: 0, uuid: 5 });
    elementsStore.put({ parent: 5, order: 0, uuid: 6, text: "left element" });
    elementsStore.put({ parent: 7, order: 2, uuid: 22 });
    elementsStore.put({ parent: 2, order: 2, uuid: 7 });
    elementsStore.put({ parent: 22, order: 1, uuid: 8, text: "right element" });
    // elementsStore.put({ parent: 8, order: 1, uuid: 30 }); // debugging
    elementsStore.put({ parent: 22, order: 0, uuid: 25, text: "column right" });
    elementsStore.put({ parent: 7, order: 0, uuid: 23 });
    elementsStore.put({ parent: 23, order: 2, uuid: 24, text: "some text below right element" });
    elementsStore.put({ parent: 1, order: 1, uuid: 9 });
    elementsStore.put({ parent: 9, order: 0, uuid: 10, text: "sticker below" });
    elementsStore.put({ parent: 1, order: 2, uuid: 11 });
    elementsStore.put({ parent: 11, order: 0, uuid: 12, text: "another sticker below" });

    // Page 2 -- 3 items
    elementsStore.put({ parent: 0, order: 1, uuid: 13, customcss: "background-color:#708a70;" });
    elementsStore.put({ parent: 13, order: 0, uuid: 14 });
    elementsStore.put({ parent: 14, order: 0, uuid: 15, text: "some text on the second page" });
    // Page 3 -- 3 items
    elementsStore.put({ parent: 0, order: 2, uuid: 16, customcss: "background-color:#618188;" });
    elementsStore.put({ parent: 16, order: 0, uuid: 17 });
    elementsStore.put({ parent: 17, order: 0, uuid: 18, text: "some text on the third page" });

    // ICONS
    iconsStore.put({ name: "options", link: "./img/options.svg", uuid: 1 });
    iconsStore.put({ name: "blah blah", link: "./img/blahblah", uuid: 2 });
}




/** Utility */

async function getElementsHighestId(elementsStore = null) {
    if (elementsStore == null) {
        const db = await openDatabase();
        const transactionsRead = db.transaction("elements", "readonly");
        elementsStore = transactionsRead.objectStore("elements");
    }

    const index = elementsStore.index("by_uuid");
    let elementsCursor = index.openCursor(null, "prev");
    elementsCursor.onsuccess = function (event) {
        highestId = event.target.result.primaryKey;
        return highestId;
    }

    elementsCursor.onerror = function () {
        return null;
    }
}

async function updateElementsInDb() {
    console.log(elementLogTracking);
    const db = await openDatabase();
    const transactionsWrite = db.transaction(["elements"], "readwrite");
    const elementsStore = transactionsWrite.objectStore("elements");

    elementLogTracking.forEach(async e => {
        id = parseInt(e.id, 10);
        switch (e.status) {
            case Status.DELETE:
                elementsStore.delete(id);
                break;
            case Status.CREATE:
                const newElement = await getUpdatedElement({ uuid: id }, ...e.propertiesName);
                elementsStore.put(newElement);
                break;
            case Status.UPDATE:
                const elementToUpdate = elementsStore.index("by_uuid").get(id);
                elementToUpdate.onsuccess = async () => {
                    const updatedElement = await getUpdatedElement(elementToUpdate.result, ...e.propertiesName);
                    elementsStore.put(updatedElement);
                }

                elementToUpdate.onerror = () => {
                    console.error("ERROR Database-4:\nAn error occured while updating an element in the database: ", elementToUpdate.error)
                }
                break;
            case Status.PENDING:
                // remove from array
                break;
        }
    });
    // TODO: make elementLogTracking a queue and remove them when the request has been fullfiled instead of clearing the whole array
    elementLogTracking = new Array();
}

async function getUpdatedElement(dbElement, ...newData) {
    console.log(dbElement);
    return new Promise(async (resolve, reject) => {
        try {
            const element = document.getElementById(dbElement.uuid);
            if (!isTruthy(element)) return;

            const elementType = getElementType(element);
            newData.forEach(e => {
                elementTypeFormatCommon.getData(element, elementType, dbElement, e);
            });
            console.log(dbElement);

            resolve(dbElement);
        } catch (error) {
            console.log("ERROR Database-5:\nAn unsuspected error happened: ", elementToUpdate.error);
            reject();
        }
    });
}
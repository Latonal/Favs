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
                // elementsStore.createIndex("by_order", "order", { unique: false });
                elementsStore.createIndex("by_uuid", "uuid", { unique: true });

                const iconsStore = db.createObjectStore("icons", { keyPath: "uuid" });
                iconsStore.createIndex("by_name", "name", { unique: false });
                // iconsStore.createIndex("link", "link", { unique: false });

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
    // elementsStore.put({ parent: 8, order: 1, uuid: 30 }); // debugging
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
    informationsStore.put({ parent: 21, text: "same tab - with target", img_uuid: 1, href: "https://www.youtube.com/", target: "_self", customcss: "font-size:25px;font-weight:bold;" });
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
    // DELETE
    // CREATE first
    // UPDATE
    const db = await openDatabase();
    const transactionsWrite = db.transaction(["elements", "informations"], "readwrite");
    const elementsStore = transactionsWrite.objectStore("elements");
    const informationsStore = transactionsWrite.objectStore("informations");

    elementLogTracking.forEach(e => {
        console.log(e);
        id = parseInt(e.id, 10);
        switch (e.status) {
            case Status.DELETE:
                break;
            case Status.CREATE:
                // create entry in elements and informations dbs
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
    // TODO: make elementLogTracking a queue and removed them when the request has been fullfiled instead of clearing the whole array
    elementLogTracking = new Array();
}

async function getUpdatedElement(dbElement, ...newData) {
    console.log(dbElement);
    return new Promise(async (resolve, reject) => {
        try {
            const element = document.getElementById(dbElement.uuid);
            if (!isTruthy(element)) return;
        
            newData.forEach(e => {
                switch (e) {
                    case "parent":
                        dbElement.parent = parseInt(element.parentElement.id, 10);
                        break;
                    case "order":
                        dbElement.order = parseInt(getComputedStyle(element).getPropertyValue("--order"), 10);
                        break;
                    default:
                        break;
                }
            });

            resolve(dbElement);
        } catch (error) {
            console.log("ERROR Database-5:\nAn unsuspected error happened: ", elementToUpdate.error);
            reject();
        }
    });
}
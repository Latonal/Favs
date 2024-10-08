const DB_NAME = "playground-ltnl";
const DB_VERSION = 1;

var highestElementId = 0;
var highestIconId = 0;

function openDatabase() {
    return new Promise((resolve, reject) => {
        try {
            const openRequest = indexedDB.open(DB_NAME, DB_VERSION);

            openRequest.onerror = function () {
                console.error("ERROR Database-1:\nAn error occured while opening the database: ", openRequest.error);
                reject(false);
            };

            openRequest.onsuccess = function () {
                resolve(openRequest.result);
            };
        } catch (error) {
            console.error("ERROR Database-11:\nCould not open the connection to the database : ", error)
            reject();
        }
    });
}

/**
 * Return the object store(s)
 * @param {...string} store name of the store(s) you want to open
 * @returns object store(s)
 */
async function getStoreData(...store) {
    if (!store) return new Error("Did not provide a store name.");

    const db = await openDatabase();

    return new Promise(async (resolve, reject) => {
        try {
            const transactionsRead = db.transaction(store, "readonly");
            let result = new Array();
            store.forEach(s => {
                result.push(transactionsRead.objectStore(s));
            });

            resolve(result);
        } catch (error) {
            console.error("ERROR Database-10:\nAn error occured while opening the store(s) : ", error)
            reject();
        }
    });
}

function instantiateDB() {
    const openRequest = indexedDB.open(DB_NAME, DB_VERSION); //

    return new Promise((resolve, reject) => {
        openRequest.onupgradeneeded = function (event) {
            try {
                const db = openRequest.result;

                if (event.oldVersion < 1) { // Initialize db
                    const elementsStore = db.createObjectStore("elements", { keyPath: "uuid" })
                    elementsStore.createIndex("by_uuid", "uuid", { unique: true });
                    elementsStore.createIndex("by_parent", "parent", { unique: false });
                    elementsStore.createIndex("by_previous", "previous", { unique: false });

                    const iconsStore = db.createObjectStore("icons", { keyPath: "uuid" });
                    iconsStore.createIndex("by_uuid", "uuid", { unique: true });
                    iconsStore.createIndex("by_name", "name", { unique: false });

                    generateDb(elementsStore, iconsStore);

                    StartTutorial();
                }
            } catch (error) {
                console.error("ERROR Database-9:\nAn error occured while upgrading the database:\n" + error);
            }
        };
        openRequest.onerror = function () {
            console.error("ERROR Database-2:\nAn error occured while opening the database: ", openRequest.error);
            reject(false);
        };
        openRequest.onsuccess = async function () {
            try {
                const db = openRequest.result;

                const transactionRead = db.transaction([StoreName.ELEMENTS, StoreName.ICONS], "readonly");
                const elementsStore = transactionRead.objectStore(StoreName.ELEMENTS);
                const iconsStore = transactionRead.objectStore(StoreName.ICONS);

                highestElementId = await getStoreHighestId(elementsStore);
                highestIconId = await getStoreHighestId(iconsStore);

                db.close();
                resolve(true);
            } catch (error) {
                console.error("ERROR Database-8:\nAn error occured after opening the database:\n" + error);
            }
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

// Debug data
/* function generateDb(elementsStore, iconsStore) {
    playgroundDebugging.forEach(e => {
        elementsStore.put(e);
    });

    iconsDebugging.forEach(e => {
        iconsStore.put(e);
    });
} /* */

// Real data
function generateDb(elementsStore, iconsStore) {
    playgroundFirst.forEach(e => {
        elementsStore.put(e);
    });

    iconsFirst.forEach(e => {
        iconsStore.put(e);
    });
} /* */



/** Utility */

async function getStoreHighestId(store = null) {
    return new Promise((resolve, reject) => {
        if (store == null || !(store instanceof IDBObjectStore)) {
            console.error("ERROR Database-6:\nAttempting to get the highest id of a non-referenced or badly referenced store.", store);
            reject();
        }

        const index = store.index("by_uuid");
        let elementsCursor = index.openCursor(null, "prev");
        elementsCursor.onsuccess = function (event) {
            resolve(event.target.result.primaryKey);
        }

        elementsCursor.onerror = function () {
            reject(null);
        }
    });
}

async function updateStoreEntries(storeId) {
    if (!isTruthy(storeId))
        console.warn("WARN Database-6:\nYou must reference a storeId to update its elements.");

    switch (storeId) {
        case 1:
            updateElementsInDb(StoreName.ELEMENTS, elementLogTracking, getUpdatedElement, clearElementsLog)
            break;
        case 2:
            updateElementsInDb(StoreName.ICONS, iconLogTracking, getUpdatedIcons, clearIconLog)
            break;
        default:
            console.error("ERROR Database-7:\nAttempting to update a store with an id that is not supported:", storeId);
            break;
    }
}

async function updateElementsInDb(storeName, elementsToUpdate, updateGetFunction, clearFunction) {
    if (elementsToUpdate.length <= 0) return;
    console.log(elementsToUpdate);
    const db = await openDatabase();
    const transactionsWrite = db.transaction(storeName, "readwrite");
    const store = transactionsWrite.objectStore(storeName);

    elementsToUpdate.forEach(async e => {
        id = parseInt(e.id, 10);
        if (!isTruthy(id)) return;
        switch (e.status) {
            case Status.DELETE:
                store.delete(id);
                break;
            case Status.CREATE:
                const newElement = await updateGetFunction({ uuid: id }, ...e.propertiesName);
                store.put(newElement);
                break;
            case Status.UPDATE:
                const elementToUpdate = store.index("by_uuid").get(id);
                elementToUpdate.onsuccess = async () => {
                    const updatedElement = await updateGetFunction(elementToUpdate.result, ...e.propertiesName);
                    store.put(updatedElement);
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

    clearFunction();
}

async function getUpdatedElement(dbElement, ...newData) {
    return new Promise(async (resolve, reject) => {
        try {
            const element = elementTypeFormatCommon.getElement(dbElement.uuid);
            if (!isTruthy(element)) return;

            const elementType = elementTypeFormatCommon.getElementType(element, false, true);
            newData.forEach(e => {
                elementTypeFormatCommon.getData(element, elementType, dbElement, e);
            });

            resolve(objectRemoveEmptyExcept(dbElement, "previous", "parent"));
        } catch (error) {
            console.log("ERROR Database-5:\nAn unsuspected error happened while saving elements: ", error);
            reject();
        }
    });
}

async function getUpdatedIcons(dbElement, ...newData) {
    // TODO: update icons store
    return new Promise(async (resolve, reject) => {
        try {
            newData.forEach(e => {
                iconFormatting.getData(dbElement, e);
            });
            resolve(dbElement);
        } catch (error) {
            console.log("ERROR Database-12:\nAn unsuspected error happened while saving the icon: ", error);
            reject();
        }
    });
}

// A temporary solution to clear elementsLog since
// referencing through updateElementsInDb() does not work
function clearElementsLog() {
    elementLogTracking = new Array();
}

// A temporary solution to clear iconLog since
// referencing through updateElementsInDb() does not work
function clearIconLog() {
    iconLogTracking = new Array();
}
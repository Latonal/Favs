const DB_NAME = "playground-ltnl";
const DB_VERSION = 1;

var highestId = 0;

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
                elementsStore.createIndex("by_uuid", "uuid", { unique: true });
                elementsStore.createIndex("by_parent", "parent", { unique: false });
                elementsStore.createIndex("by_previous", "previous", { unique: false });

                const iconsStore = db.createObjectStore("icons", { keyPath: "uuid" });
                iconsStore.createIndex("by_uuid", "uuid", { unique: true });
                iconsStore.createIndex("by_name", "name", { unique: false });


                generateDb(elementsStore, iconsStore);

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

function generateDb(elementsStore, iconsStore) {
    playgroundDebugging.forEach(e => {
        elementsStore.put(e);
    });

    iconsDebugging.forEach(e => {
        iconsStore.put(e);
    });
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
        if (!isTruthy(id)) return;
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
    return new Promise(async (resolve, reject) => {
        try {
            const element = elementTypeFormatCommon.getElement(dbElement.uuid);
            if (!isTruthy(element)) return;

            const elementType = elementTypeFormatCommon.getElementType(element);
            newData.forEach(e => {
                elementTypeFormatCommon.getData(element, elementType, dbElement, e);
            });

            resolve(dbElement);
        } catch (error) {
            console.log("ERROR Database-5:\nAn unsuspected error happened: ", error);
            reject();
        }
    });
}
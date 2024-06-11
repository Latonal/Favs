function openDatabase() { // Dupe
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

async function generatePlayground() {
    console.log("Creating playground");

    try {
        await generateTabs();
        const defaultPage = localStorageData.defaultPage || 0;
        await generateAlbum(defaultPage);

        console.log("Album has been created");
    } catch (error) {
        console.error("ERROR Playground-1:\nAn error occured while creating the playground: ", error)
    }
}

// #region Tabs
async function generateTabs() {
    const db = await openDatabase();

    return new Promise(async (resolve, reject) => {
        try {
            const transactionsRead = db.transaction([StoreName.ELEMENTS, StoreName.ICONS], "readonly");
            const elementsStore = transactionsRead.objectStore(StoreName.ELEMENTS);
            const iconsStore = transactionsRead.objectStore(StoreName.ICONS);

            const data = orderObjectsByParent(await getTabsData(elementsStore));

            await createTabs(iconsStore, data);

            resolve();
        } catch (error) {
            console.error("ERROR Playground-9:\nAn error occured while creating the tabs in the header: ", error)
            reject();
        }
    });
}

async function getTabsData(elementsStore) {
    return new Promise(async (resolve, reject) => {
        try {
            const tabsCursor = elementsStore.index("by_parent").openCursor(0);

            let searches = [];

            tabsCursor.onsuccess = async function () {
                const cursor = tabsCursor.result;
                if (cursor) {
                    searches.push(cursor.value);
                    cursor.continue();
                } else {
                    resolve(searches);
                }
            }
        } catch (error) {
            reject("ERROR Playground-10:\nAn error occured while getting the data in the db to create the tabs: ", error)
        }
    });
}

async function createTabs(iconsStore, data) {
    tabs = document.getElementById("tabs");

    data.forEach(async e => {
        htmlElement = document.createElement(FavsCustomElementsName.tags.TAB);
        const newTab = elementTypeFormat['tab'].setData(htmlElement, e, iconsStore);
        tabs.appendChild(newTab);
    });
}
// #endregion Tabs

async function generateAlbum(page = 0) {
    const db = await openDatabase();

    return new Promise(async (resolve, reject) => {
        try {
            const transactionsRead = db.transaction([StoreName.ELEMENTS, StoreName.ICONS], "readonly");
            const elementsStore = transactionsRead.objectStore(StoreName.ELEMENTS);
            const iconsStore = transactionsRead.objectStore(StoreName.ICONS);

            const data = orderObjectsByParent(await getElementsData(elementsStore, page), page);

            await createElements(iconsStore, data, page);
            resolve();
        } catch (error) {
            console.error("ERROR Playground-8:\nAn error occured while creating the playground: ", error)
            reject();
        }
    });
}

async function getElementsData(elementsStore, page) {
    return new Promise(async (resolve, reject) => {
        try {
            let albumCursor = null;
            if (page === 0) page = await getFirstPage(elementsStore);
            if (page === 0) albumCursor = elementsStore.index("by_parent").openCursor(page);
            else albumCursor = elementsStore.index("by_uuid").openCursor(page);

            let searches = [];

            albumCursor.onsuccess = async function () {
                const cursor = albumCursor.result;
                if (cursor) {
                    // Search any child element inside the parent
                    const search = await retrieveElementChildrenRecursively(elementsStore, cursor.value.uuid, [cursor.value]);

                    searches.push(...search);
                    // cursor.continue();
                    resolve(searches);
                } else {
                    resolve(searches);
                }
            }
        } catch (error) {
            reject("ERROR Playground-7:\nAn error occured while getting the data in the db to create the playground: ", error)
        }
    });
}

async function getFirstPage(elementsStore) {
    return new Promise((resolve, reject) => {
        const request = elementsStore.index("by_parent").getAll(0);
        request.onsuccess = async function () {
            const result = request.result;
            if (!result) resolve(0);
            resolve(request.result.find(p => p.previous === 0).uuid || 0);
        };
        request.onerror = function (event) {
            console.warn("ERROR Playground-12:\nAn error occured while getting the first page to display: ", event.target.error)
            resolve(0);
        };
    });
}

function orderObjectsByParent(data, page = 0) {
    const organized = [];

    function organizeChildren(parentUuid) {
        let children = data.filter(obj => obj.parent === parentUuid);
        children = orderWithPreviousSibling(children);

        children.forEach(child => {
            organized.push(child);
            organizeChildren(child.uuid);
        });
    }

    // if (page !== 0)
    //     organized.push(data.find(a => a.uuid === page));
    organizeChildren(0);

    return organized;
}

function orderWithPreviousSibling(arr) {
    const organized = [];

    function findPrevious(previousUuid) {
        const sibling = arr.find(s => s.previous === previousUuid);

        if (sibling) {
            organized.push(sibling);
            findPrevious(sibling.uuid);
        }
    }

    findPrevious(0);

    // avoid losing data if there is an error with previous
    return [...new Set([...organized, ...arr])];
}

async function retrieveElementChildrenRecursively(store, currentId, search) {
    return new Promise((resolve, reject) => {
        const childsCursor = store.index("by_parent").openCursor(currentId);

        childsCursor.onerror = function () {
            reject(childsCursor.error);
        }

        childsCursor.onsuccess = function () {
            const cursor = childsCursor.result;
            if (cursor && !search.find(s => s.uuid === cursor.value.uuid)) {
                search.push(cursor.value);
                retrieveElementChildrenRecursively(store, cursor.value.uuid, search)
                    .then(() => cursor.continue())
                    .catch(reject);
            } else {
                resolve(search);
            }
        };
    });
}

async function createElements(iconsStore, data, page) {
    playground = document.getElementById("playground");

    data.forEach(async e => {
        // console.log(e);
        try {
            let tagName;
            if (e.parent === 0 || e.uuid === page)
                tagName = FavsCustomElementsName.tags.ALBUM;
            else if (data.find(d => d.parent === e.uuid) || e.isGroup === true)
                tagName = FavsCustomElementsName.tags.GROUP;
            else
                tagName = FavsCustomElementsName.tags.STICKER;

            const newElement = document.createElement(tagName);

            const parentData = data.find(d => d.uuid === e.parent);
            await formatElement(newElement, e, parentData, iconsStore);

            let parent = null;
            switch (tagName) {
                case FavsCustomElementsName.tags.ALBUM:
                    playground.appendChild(newElement);
                    break;
                case FavsCustomElementsName.tags.GROUP:
                    parent = document.getElementById(e.parent);
                    const layer_level = (parent.getAttribute("layer-level") != "odd") ? "odd" : "even";
                    newElement.setAttribute("layer-level", layer_level);
                case FavsCustomElementsName.tags.STICKER:
                    if (!isTruthy(parent)) parent = document.getElementById(e.parent);
                    parent.appendChild(newElement);
                    break;
            }
        } catch (error) {
            console.error("ERROR Playground-11:\nAn error occured while creating the elements because the parent wasn't properly instantiated: ", e.uuid, error);
        }
    });
}

async function formatElement(htmlElement, dataElement, parentData, iconsStore) {
    htmlElement.id = dataElement.uuid;

    const elementType = getElementObjectType(htmlElement, parentData);
    elementTypeFormat[elementType].setData(htmlElement, dataElement, iconsStore);
}

function getElementObjectType(element, parent) {
    const tagName = element.tagName.toLowerCase();

    switch (tagName) {
        case FavsCustomElementsName.tags.TAB:
        case FavsCustomElementsName.tags.ALBUM:
            return 'album';
        case FavsCustomElementsName.tags.GROUP:
            return 'group';
        case FavsCustomElementsName.tags.STICKER:
            if (element.type)
                return FavsElementsType[element.type] || 'default';
            else if (parent && parent.type)
                return FavsElementsType[parent.type] || 'default';
        default:
            return 'default';
    }
}

async function setImgUri() {

}

async function getImgUri(img_uuid, iconsStore = null) {
    if (!iconsStore) return;

    return new Promise((resolve, reject) => {
        try {
            const iconByUuid = iconsStore.get(img_uuid);
            iconByUuid.onsuccess = function () {
                // TODO: put a default image if no entry is returned
                resolve(iconByUuid.result ? iconByUuid.result.link : "missing");
            }

            iconByUuid.onerror = function () {
                console.error("ERROR Playground-6a:\nAn error occured while getting the uri of the image: ", error);
                reject(null);
            }
        } catch (error) {
            console.error("ERROR Playground-6b:\nAn error occured while getting the uri of the image: ", error);
            reject(null);
        }
    })
}
// import { openDatabase } from "./data";

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
        // TODO: pass page data depending of user preferences
        // find default page to display
        await generateTabs();
        await generateAlbum();

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
            const transactionsRead = db.transaction(["elements", "icons"], "readonly");
            const elementsStore = transactionsRead.objectStore("elements");
            const iconsStore = transactionsRead.objectStore("icons");

            const data = await getTabsData(elementsStore);
            data.sort(compareElements);

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
        const newTab = elementTypeFormat['tab'].setCustom(htmlElement, e, iconsStore);
        tabs.appendChild(newTab);
    });
}
// #endregion Tabs

async function generateAlbum(page = 0) {
    const db = await openDatabase();

    return new Promise(async (resolve, reject) => {
        try {
            const transactionsRead = db.transaction(["elements", "icons"], "readonly");
            const elementsStore = transactionsRead.objectStore("elements");
            const iconsStore = transactionsRead.objectStore("icons");

            const data = await getElementsData(elementsStore, page);
            data.sort(compareElements);

            await createElements(iconsStore, data, page);

            console.log(data);
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
            if (page === 0) albumCursor = elementsStore.index("by_parent").openCursor(page);
            else albumCursor = elementsStore.index("by_uuid").openCursor(page);

            let searches = [];

            albumCursor.onsuccess = async function () {
                const cursor = albumCursor.result;
                if (cursor) {
                    // Search any child element inside the parent
                    const search = await retrieveElementChildrenRecursively(elementsStore, cursor.value.uuid, [cursor.value]);

                    searches.push(...search);
                    cursor.continue();
                } else {
                    resolve(searches);
                }
            }
        } catch (error) {
            reject("ERROR Playground-7:\nAn error occured while getting the data in the db to create the playground: ", error)
        }
    });
}

function compareElements(a, b) {
    if (a.parent === b.parent) {
        return a.order - b.order;
    }

    if (a.parent === b.uuid) {
        return 1;
    }

    if (b.parent === a.uuid) {
        return -1;
    }

    return a.parent - b.parent;
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
        let tagName;
        if (e.parent === 0 || e.uuid === page)
            tagName = FavsCustomElementsName.tags.ALBUM;
        else if (data.find(d => d.parent === e.uuid))
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
    });
}

async function formatElement(htmlElement, dataElement, parentData, iconsStore) {
    htmlElement.id = dataElement.uuid;

    const elementType = getElementType(htmlElement, parentData);
    elementTypeFormat[elementType].setCustom(htmlElement, dataElement, iconsStore);
}

function getElementType(htmlElement, parentData) {
    const tagName = htmlElement.tagName.toLowerCase();

    switch (tagName) {
        case FavsCustomElementsName.tags.ALBUM:
            return 'album';
        case FavsCustomElementsName.tags.GROUP:
            return 'group';
        case FavsCustomElementsName.tags.STICKER:
            const parentType = parentData.type || 'default';
            return parentType;
    }
}

async function setImgUri() {

}

async function getImgUri(img_uuid, iconsStore) {
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

const elementTypeFormat = {
    default: {
        getCustom: function (element) {

        },
        setCustom: async function (element, dataElement, iconsStore) {
            let elementObj = new Object();
            this.setTheme(element, dataElement.theme);
            this.setCustomCss(element, dataElement.customcss);

            elementObj.text = this.setText(dataElement.text);
            if (dataElement.img_uuid) {
                let imgUri = await getImgUri(dataElement.img_uuid, iconsStore);
                elementObj.img = this.setImg(imgUri, dataElement.img_uuid);
            }

            if (elementObj.img) element.appendChild(elementObj.img);
            if (elementObj.text) element.appendChild(elementObj.text);
        },

        getTheme: function (element) {

        },
        setTheme: function (element, theme) {
            if (theme) element.setAttribute("theme", theme);
        },
        getCustomCss: function (element) {

        },
        setCustomCss: function (element, customCss) {
            if (customCss) element.setAttribute("style", customCss);
        },


        getText: function (element) {

        },
        setText: function (text) {
            if (!text) return null;
            const newP = document.createElement("p");
            newP.innerText = text;
            return newP;
        },
        getImg: function (element) {

        },
        setImg: function (imgUri, imgUuid) {
            if (!imgUri) return null;
            const newImg = document.createElement("img");
            newImg.setAttribute("src", imgUri);
            newImg.setAttribute("img-uuid", imgUuid);
            return newImg;
        },
        getHref: function (element) {

        },
        setHref: function (element, href) {
            if (href) element.setAttribute("href", href);
        },
        getTarget: function (element) {

        },
        setTarget: function (element, target) {
            if (target) element.setAttribute("target", target);
        },
    },
    tab: {
        getCustom: function (element) { },
        setCustom: function (element, dataElement) {
            console.log(dataElement);
            this.setAlbumId(element, dataElement.uuid);
            return element;
        },
        getAlbumId: function (element) { },
        setAlbumId: function (element, albumId) {
            if (albumId) element.setAttribute("data-album", albumId);
        }
    },
    album: {
        getCustom: function (element) { },
        setCustom: function (element, dataElement) {
            this.setTheme(element, dataElement.theme);
            this.setCustomCss(element, dataElement.customcss);

            // TODO: Create a tab in the header
        },
        getTheme: function (element) { },
        setTheme: function (element, theme) {
            if (theme) element.setAttribute("theme", theme);
        },
        getCustomCss: function (element) { },
        setCustomCss: function (element, customCss) {
            if (customCss) element.setAttribute("style", customCss);
        },
    },
    group: {
        getCustom: function (element) { },
        setCustom: function (element, dataElement) {
            this.setTheme(element, dataElement.theme);
            this.setCustomCss(element, dataElement.customcss);
        },
        getTheme: function (element) { },
        setTheme: function (element, theme) {
            if (theme) element.setAttribute("theme", theme);
        },
        getCustomCss: function (element) { },
        setCustomCss: function (element, customCss) {
            if (customCss) element.setAttribute("style", customCss);
        },
    }
}
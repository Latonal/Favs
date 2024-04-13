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
            const transactionsRead = db.transaction(["elements", "icons"], "readonly");
            const elementsStore = transactionsRead.objectStore("elements");
            const iconsStore = transactionsRead.objectStore("icons");

            const data = compareElements(await getTabsData(elementsStore));

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
            const transactionsRead = db.transaction(["elements", "icons"], "readonly");
            const elementsStore = transactionsRead.objectStore("elements");
            const iconsStore = transactionsRead.objectStore("icons");

            const data = compareElements(await getElementsData(elementsStore, page));

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
            if (page === 0) albumCursor = elementsStore.index("by_parent").openCursor(page);
            else albumCursor = elementsStore.index("by_uuid").openCursor(page);

            let searches = [];

            albumCursor.onsuccess = async function () {
                const cursor = albumCursor.result;
                if (cursor) {
                    // Search any child element inside the parent
                    const search = await retrieveElementChildrenRecursively(elementsStore, cursor.value.uuid, [cursor.value]);

                    searches.push(...search);
                    // TODO: let user decide if they want to generate the whole db or not
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

function compareElements(data) {
    const organized = [];

    function organizeChildren(parentUuid) {
        const children = data.filter(obj => obj.parent === parentUuid);
        children.sort((a, b) => a.order - b.order);

        children.forEach(child => {
            organized.push(child);
            organizeChildren(child.uuid);
        });
    }

    organizeChildren(0);

    return organized;
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
        try {
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
        } catch (error) {
            console.error("ERROR Playground-11:\nAn error occured while creating the elements because the parent wasn't properly instantiated: ", e.uuid, error);
        }
    });
}

async function formatElement(htmlElement, dataElement, parentData, iconsStore) {
    htmlElement.id = dataElement.uuid;

    const elementType = getElementType(htmlElement, parentData);
    elementTypeFormat[elementType].setData(htmlElement, dataElement, iconsStore);
}

function getElementType(htmlElement, parentData = null) {
    const tagName = htmlElement.tagName.toLowerCase();

    switch (tagName) {
        case FavsCustomElementsName.tags.ALBUM:
            return 'album';
        case FavsCustomElementsName.tags.GROUP:
            return 'group';
        case FavsCustomElementsName.tags.STICKER:
            let parentType = null;
            if (!parentData) parentType = htmlElement.parentNode.getAttribute("data-type") || 'default';
            else parentType = parentData.type || 'default';
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

const elementTypeFormatCommon = {
    getData: function (element, elementType, object, dataToUpdate) {
        switch (dataToUpdate) {
            case "parent":
                object.parent = this.getParent(element);
                break;
            case "order":
                object.order = parseInt(element.getAttribute("data-order"), 10) || 0;
                break;
            default:
                elementTypeFormat[elementType].getData(element, object, dataToUpdate);
                break;
        }
    },
    getTheme: function (element) { },
    setTheme: function (element, theme) {
        if (theme) element.setAttribute("data-theme", theme);
    },
    getCustomCss: function (element) { },
    setCustomCss: function (element, customCss) {
        if (customCss) element.setAttribute("style", customCss);
    },
    getOrder: function (element) { },
    setOrder: function (element, order) {
        if (order) element.setAttribute("data-order", order || "0");
    },
    getParent: function (element) {
        return parseInt(element.parentElement.id, 10);
    },

    encrypt: function (element) {
        // return encryptMessage(element);
        return element;
    },
    decrypt: function (element) {
        // return decryptMessage(element);
        return element;
    },
}

const elementTypeFormat = {
    default: {
        getData: function (element, object, dataToUpdate) { },
        setData: async function (element, dataElement, iconsStore) {
            let elementObj = new Object();
            elementTypeFormatCommon.setTheme(element, dataElement.theme);
            elementTypeFormatCommon.setCustomCss(element, dataElement.customcss);
            elementTypeFormatCommon.setOrder(element, dataElement.order);
            this.setHref(element, dataElement.href);
            this.setTarget(element, dataElement.target);

            elementObj.text = this.setText(dataElement.text);
            if (dataElement.img_uuid) {
                let imgUri = await getImgUri(dataElement.img_uuid, iconsStore);
                elementObj.img = this.setImg(imgUri, dataElement.img_uuid);
            }

            if (elementObj.img) element.appendChild(elementObj.img);
            if (elementObj.text) element.appendChild(elementObj.text);
        },
        getText: function (element, encrypt) {
            // return (encrypt) ? elementTypeFormatCommon.encrypt() : element;
        },
        setText: function (text) {
            if (!text) return null;
            const newP = document.createElement("p");
            newP.innerText = elementTypeFormatCommon.decrypt(text);
            return newP;
        },
        getImg: function (element) { },
        setImg: function (imgUri, imgUuid) {
            if (!imgUri) return null;
            const newImg = document.createElement("img");
            newImg.setAttribute("src", imgUri);
            newImg.setAttribute("img-uuid", imgUuid);
            return newImg;
        },
        getHref: function (element) { },
        setHref: function (element, href) {
            if (href) element.setAttribute("href", href);
        },
        getTarget: function (element) { },
        setTarget: function (element, target) {
            if (target) element.setAttribute("target", target);
        },
    },
    tab: {
        getData: function (element, object, dataToUpdate) { },
        setData: function (element, dataElement) {
            this.setAlbumId(element, dataElement.uuid);
            elementTypeFormatCommon.setOrder(element, dataElement.order);
            this.setTabContent(element, dataElement);
            return element;
        },
        getAlbumId: function (element) { },
        setAlbumId: function (element, albumId) {
            if (albumId) element.setAttribute("data-album", albumId);
        },
        getTabContent: function (element) { },
        setTabContent: function (element, dataElement) {
            // if img_uuid, put img_uuid instead of text
            console.log(element);
            if (dataElement.text) element.innerText = dataElement.text;
        },
    },
    album: {
        getData: function (element, object, dataToUpdate) { },
        setData: function (element, dataElement) {
            elementTypeFormatCommon.setTheme(element, dataElement.theme);
            elementTypeFormatCommon.setCustomCss(element, dataElement.customcss);
            elementTypeFormatCommon.setOrder(element, dataElement.order);
        },
    },
    group: {
        getData: function (element, object, dataToUpdate) { },
        setData: function (element, dataElement) {
            elementTypeFormatCommon.setTheme(element, dataElement.theme);
            elementTypeFormatCommon.setCustomCss(element, dataElement.customcss);
            elementTypeFormatCommon.setOrder(element, dataElement.order);
        },
    }
}
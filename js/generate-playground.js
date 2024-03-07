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
        const db = await openDatabase();
        // TODO: pass page data depending of user preferences
        const elementsId = await generateAlbum(db);
        await setInformations(db, elementsId);

        console.log("Album has been created");
    } catch (error) {
        console.error("ERROR Playground-1:\nAn error occured while creating the playground: ", error)
    }
}

async function generateAlbum(db, page = 0) {
    playground = document.getElementById("playground");

    return new Promise(async (resolve, reject) => {
        try {
            const transactionsRead = db.transaction("elements", "readonly");
            const elementsStore = transactionsRead.objectStore("elements");

            // const albumCursor = elementsStore.index("by_parent").openCursor(page);
            let albumCursor = null;
            if (page === 0) albumCursor = elementsStore.index("by_parent").openCursor(page);
            else albumCursor = elementsStore.index("by_uuid").openCursor(page);

            let searches = [];

            albumCursor.onsuccess = async function () {
                const cursor = albumCursor.result;
                if (cursor) {
                    // Create new album
                    const album = document.createElement(FavsCustomElementsName.tags.ALBUM);
                    album.id = cursor.value.uuid;

                    // Search any other element inside the album
                    const search = [cursor.value];
                    const children = await retrieveElementChildrenRecursively(elementsStore, cursor.value.uuid, search);

                    children.sort(compareElements);

                    // Append results
                    playground.appendChild(album);
                    children.forEach(element => {
                        searches.push(element.uuid);
                        let layer_order;
                        if (element.parent === cursor.value.parent) return;
                        parent = document.getElementById(element.parent);
                        if (search.find(s => s.parent === element.uuid)) {
                            tag_name = FavsCustomElementsName.tags.GROUP;
                            layer_order = (parent.getAttribute("layer-level") != "odd") ? "odd" : "even";
                        } else {
                            tag_name = FavsCustomElementsName.tags.STICKER;
                        }
                        const elem = document.createElement(tag_name);
                        elem.id = element.uuid;
                        elem.style.setProperty("--order", element.order);
                        // elem.innerText = element.uuid;
                        if (typeof layer_order !== "undefined") elem.setAttribute("layer-level", layer_order);
                        parent.appendChild(elem);
                    });

                    cursor.continue();
                } else {
                    resolve(searches);
                }
            };
        } catch (error) {
            console.error("ERROR Playground-2:\nAn error occured while creating the playground: ", error);
            reject;
        }
    });
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

async function setInformations(db, elementsId) {
    console.log("Elements id: ", elementsId);
    return new Promise(async (resolve, reject) => {
        try {
            const transactionsRead = db.transaction(["icons", "informations"], "readonly");
            const informationsStore = transactionsRead.objectStore("informations");
            const iconsStore = transactionsRead.objectStore("icons");

            const promises = elementsId.map(element =>
                new Promise(async (resolveElement, rejectElement) => {
                    const informationsCursor = informationsStore.index("by_parent").openCursor(element);

                    informationsCursor.onsuccess = async function () {
                        const cursor = informationsCursor.result;
                        if (cursor) {
                            try {
                                await formatElements(iconsStore, cursor.value, element);
                                cursor.continue();
                            } catch (error) {
                                rejectElement(error);
                            }
                        } else {
                            resolveElement();
                        }
                    };

                    informationsCursor.onerror = function () {
                        console.error("ERROR Playground-5:\nAn error occured while creating the playground: ", error);
                        rejectElement(informationsCursor.error);
                    };
                })
            );
            await Promise.all(promises);

            console.log("set informations");
            resolve();
        } catch (error) {
            console.error("ERROR Playground-3:\nAn error occured while creating the playground: ", error);
            reject(error);
        }
    });
}

async function formatElements(iconsStore, cursorValues, element) {
    return new Promise(async (resolve, reject) => {
        try {
            const my_element = document.getElementById(element);
            const my_tag = my_element.tagName;

            // image
            var my_img;
            if (typeof cursorValues.img_uuid !== "undefined") {
                await new Promise(async (resolveImg, rejectImg) => {
                    // const iconsIndex = iconsStore.index("by_name");
                    const iconByName = iconsStore.get(cursorValues.img_uuid);
                    iconByName.onsuccess = function () {
                        my_img = iconByName.result.link.decrypt();
                        resolveImg();
                    }

                    iconByName.onerror = function () {
                        console.error("ERROR Playground-6:\nAn error occured while creating the playground: ", error);
                        rejectImg;
                    }
                })
            }

            // text
            const my_text = getDefinedContent(cursorValues.text, { decrypt: true });
            // theme
            const my_theme = getDefinedContent(cursorValues.theme, { decrypt: true });

            // customcss
            const my_customcss = getDefinedContent(cursorValues.customcss, { decrypt: true });
            // color
            const my_color = getDefinedContent(cursorValues.color, { decrypt: true });

            let my_css = [
                { color: my_color }
            ];

            my_css = my_css.concat(cssStringAsObj(my_customcss));

            switch (my_tag.toLowerCase()) {
                case FavsCustomElementsName.tags.ALBUM:
                    if (my_theme) my_element.setAttribute("theme", my_theme);
                    break;
                case FavsCustomElementsName.tags.GROUP:
                    if (my_css) setCss(my_element, my_css);
                    break;
                case FavsCustomElementsName.tags.STICKER:
                    // Todo: if both img and txt are empty ?...
                    if (my_img) {
                        let img_tag = document.createElement("img");
                        img_tag.setAttribute("src", my_img);
                        my_element.append(img_tag);
                    }
                    if (my_text) {
                        let p_tag = document.createElement("p");
                        p_tag.append(document.createTextNode(my_text));
                        my_element.append(p_tag);
                    }
                    if (my_css != null) {
                        // my_element.style = my_element.style + my_css;
                        setCss(my_element, my_css);
                    }

                    const my_href = getDefinedContent(cursorValues.href, { decrypt: true });
                    if (my_href) my_element.setAttribute("href", my_href);
                    const my_target = getDefinedContent(cursorValues.target, { decrypt: true });
                    if (my_target) my_element.setAttribute("target", my_target);
                    break;
                default:
                    break;
            }

            resolve();
        } catch (error) {
            console.error("ERROR Playground-4:\nAn error occured while creating the playground: ", error);
            reject;
        }
    });
}

function setCss(element, css) {
    css.forEach(e => {
        if (!isTruthy(e)) return;
        const property = Object.getOwnPropertyNames(e);
        const value = e[property];
        if (property == null || value == null) return;
        element.style.setProperty(property, value);
    });
}

function getDefinedContent(content, { encrypt, decrypt }) {
    if (!isTruthy(content)) return null;
    if (typeof (content) == "string") {
        if (encrypt) return content.encrypt();
        if (decrypt) return content.decrypt();
    }
    return content;
}
observeToGenerateNewIcons();

async function observeToGenerateNewIcons() {
    const loadMoreIcon = document.querySelector("#icons-list .load-more");
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) loadMoreIcons();
        })
    });
    observer.observe(loadMoreIcon);
}

function setIconWindow(show = false) {
    const elem = document.getElementById("icons");
    show ? elem.classList.remove("hide") : elem.classList.add("hide");
    if (!show) setIconInfoState();
}

function getNumberToPut(wrapper, widthOfChilds, heightOfChilds) {
    const availableSize = [wrapper.offsetWidth, wrapper.offsetHeight];
    return Math.max(Math.floor(availableSize[0] / widthOfChilds), 1) * (Math.max(Math.floor(availableSize[1] / heightOfChilds), 1) + 1);
}

async function loadMoreIcons() {
    return new Promise(async (resolve, reject) => {
        try {
            const stores = await getStoreData(StoreName.ICONS);

            const numberToGenerate = getNumberToPut(document.getElementById("icons-list"), 100 + 10, 100 + 10);
            const numberOfChildsAlreadyExisting = document.querySelector("#icons-list .all-icons").childElementCount;
            const data = await getIconsData(stores[0], numberOfChildsAlreadyExisting, numberToGenerate);
            createSelectIcons(data);
            resolve();
        } catch (error) {
            console.error("ERROR Icons-1:\nAn error occured while loading more icons: ", error);
            reject();
        }
    });
}

async function getIconsData(iconsStore, numberOfChildsAlreadyExisting, numberToGenerate = 20) {
    return new Promise(async (resolve, reject) => {
        try {
            let iconCursor = iconsStore.index("by_uuid").openCursor();
            let data = [];
            let i = 0;

            iconCursor.onsuccess = async function () {
                const cursor = iconCursor.result;
                if (cursor) {
                    if (i >= numberOfChildsAlreadyExisting)
                        data.push(cursor.value);
                    i++;
                    if (i > numberOfChildsAlreadyExisting + numberToGenerate)
                        resolve(data);
                    cursor.continue();
                } else {
                    // TODO : disable load more button
                    resolve(data);
                }
            }
        } catch (error) {
            console.error("ERROR Icons-2:\nAn error occured while getting the icon data: ", error);
            reject();
        }
    });
}

function createSelectIcons(data) {
    putIcons = document.querySelector("#icons-list .all-icons");
    data.forEach(element => {
        putIcons.appendChild(createNewSelectIcon(element.link, element.uuid, element.alt, element.name));
    });
}

function createNewSelectIcon(src, uuid, alt, name) {
    const newDiv = document.createElement("div");
    newDiv.classList.add("icon");
    const newImg = document.createElement("img");
    if (src) newImg.src = src;
    if (alt) newImg.alt = alt;
    newImg.setAttribute("img-id", uuid);
    newDiv.appendChild(newImg);
    if (name) {
        const newP = document.createElement("p");
        newP.innerText = name;
        newDiv.appendChild(newP);
    }
    newDiv.addEventListener("click", setIcon);
    newDiv.addEventListener("contextmenu", updateIcon);
    return newDiv;
}

function setIcon(event) {
    img = event.currentTarget.querySelector("img");
    menuFormat.img.changeInputContent(img.src, img.getAttribute("img-id"), img.alt);
    setIconWindow(false);
}

var iconLogTracking = new Array();

async function updateIcon(event) {
    event.preventDefault();
    event.stopPropagation();

    setIconInfoState("edit");
    
    const currentId = event.currentTarget.querySelector("img").getAttribute("img-id");
    if (currentId === iconFormatting.getIconInfoWindow().querySelector("[data-info='uuid']").value) return;
    iconLogTracking = new Array();
    const stores = await getStoreData(StoreName.ICONS);

    const currentIcon = stores[0].index("by_uuid").get(parseInt(currentId, 10));
    currentIcon.onsuccess = async () => {
        setIconInfo(currentIcon.result);
    }
}

function setIconInfoState(c) {
    infos = document.getElementById("icons").querySelector(".icon-infos");
    infos.classList.remove("edit");
    if (!c) {
        document.getElementById("icons").querySelector(".edit [data-info='uuid']").value = "";
        iconLogTracking = new Array();
    }
    if (c) infos.classList.add(c);
}

function setIconInfo(infosData) {
    e = document.getElementById("icons").getElementsByClassName("edit")[0];
    e.querySelector("[data-info='uuid']").value = infosData.uuid;
    e.querySelector("[data-info='name']").value = infosData.name;
    e.querySelector("[data-info='url']").value = infosData.link;
    e.querySelector("[data-info='img']>img").setAttribute("src", infosData.link);
}

function setCreateNewIcon() {
    // change the inner of .icon-infos
}

function iconInfosChanged(infoName) {
    currentId = document.getElementById("icons").querySelector(".edit [data-info='uuid']").value;
    keepTrackOfChanges(new ElementLog(currentId ? currentId : 0, Status.UPDATE, infoName), iconLogTracking);
}

function iconUrlInfosChanged(urlValue) {
    iconInfosChanged("link");
    iconFormatting.getIconInfoWindow().querySelector("img").setAttribute("src", urlValue);
}

function saveIconInfos() {
    const iconLog = iconLogTracking[0];
    if (iconLog.id == 0) {
        newId = ++highestIconId;
        document.getElementById("icons").querySelector(".edit [data-info='uuid']").value = newId;
        iconLogTracking[0].id = newId;
        // create a new icon in the icon list -- or relaunch function to load new icons ?
    }
    updateStoreEntries(2);
    // update all data using the same icon
    if (iconLog.id !== 0) updateAllDOMIcons(iconLog);
}

async function updateAllDOMIcons(iconLog) {

    if (!iconLog.id) return;
    const store = await getStoreData(StoreName.ICONS);
    const currentIcon = store[0].get(parseInt(iconLog.id, 10));
    currentIcon.onsuccess = async () => {
        const iconData = currentIcon.result;
        var allTarget = document.getElementById("app").querySelectorAll("[img-id='" + iconLog.id + "']");
        iconLog.propertiesName.forEach(p => {
            allTarget.forEach(t => {
                iconFormatting.setData(t, p, iconData);
            });

            iconFormatting.updateMenu(p, iconData);
        });

    }
}

const iconFormatting = {
    getData: function (object, dataToUpdate) {
        switch (dataToUpdate) {
            case "name":
                object.name = this.getIconInfoWindow().querySelector("[data-info='name']").value;
                break;
            case "link":
                object.link = this.getIconInfoWindow().querySelector("[data-info='url']").value;
                break;
            case "alt":
                console.log("TODO ALT");
            default:
                console.warn("ERROR Icons-3:\n", dataToUpdate, " is not a correct command to update the data of the icon.");
                break;
        }
    },
    setData: function (object, dataToUpdate, data) {
        switch (dataToUpdate) {
            case "link":
                object.setAttribute("src", data.link);
                break;
            case "alt":
                console.log("TODO ALT");
            default:
                break;
        }
    },
    updateMenu: function (dataToUpdate, data) {
        switch (dataToUpdate) {
            case "name":
                document.getElementById("icons-list").querySelector("[img-id='" + data.uuid + "']~p").innerText = data.name;
            default:
                break;
        }
    },
    getIconInfoWindow: function () {
        return document.getElementById("icons").getElementsByClassName("edit")[0];
    },
}
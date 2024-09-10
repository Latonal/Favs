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


    // putIcons = document.querySelector("#icons-list .all-icons");
    // const number = getNumberToPut(document.getElementById("icons-list"), 100 + 10, 100 + 10);
    // for (i = 0; i < number; i++) {
    //     const newDiv = document.createElement("div");
    //     newDiv.classList.add("icon");
    //     const newImg = document.createElement("img");
    //     newImg.alt = "icon " + i;
    //     const newP = document.createElement("p");
    //     newP.innerText = "icon " + i;
    //     newDiv.appendChild(newImg);
    //     newDiv.appendChild(newP);
    //     putIcons.appendChild(newDiv);
    // }
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
    newDiv.setAttribute("img-id", uuid);
    const newImg = document.createElement("img");
    if (src) newImg.src = src;
    if (alt) newImg.alt = alt;
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
    menuFormat.img.changeInputContent(img.src, event.currentTarget.getAttribute("img-id"), img.alt);
    setIconWindow(false);
}

async function updateIcon(event) {
    console.log("update icon infos");
    event.preventDefault();
    event.stopPropagation();

    setIconInfoState("edit");
    // get infos of icon to put in inputs -> through database

    const currentId = event.currentTarget.getAttribute("img-id");
    // Check if new id is the id already in the inputs
    const stores = await getStoreData(StoreName.ICONS);
    
    const currentIcon = stores[0].index("by_uuid").get(parseInt(currentId, 10));
    currentIcon.onsuccess = async () => {
        setIconInfo(currentIcon.result);
    }
}

var iconLogTracking = new Array();

function setIconInfoState(c) {
    infos = document.getElementById("icons").querySelector(".icon-infos");
    infos.classList.remove("edit");
    if (!c) document.getElementById("icons").querySelector(".edit [data-info='uuid']").value = "";
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

function saveIconInfos() {
    if (iconLogTracking[0].id == 0) {
        newId = ++highestIconId;
        document.getElementById("icons").querySelector(".edit [data-info='uuid']").value = newId;
        iconLogTracking[0].id = newId;
    }
    updateStoreEntries(2);
}

const iconFormatting = {
    getData: function (object, dataToUpdate) {
        switch (dataToUpdate) {
            case "name":
                // object.parent = this.getParent(element);
                object.name = this.getIconInfoWindow().querySelector("[data-info='name']").value;
                break;
            case "link":
                object.link = this.getIconInfoWindow().querySelector("[data-info='url']").value;
                break;
            default:
                console.warn("ERROR Icons-3:\n", dataToUpdate, " is not a correct command to update the data of the icon.");
                break;
        }
    },
    getIconInfoWindow: function() {
        return document.getElementById("icons").getElementsByClassName("edit")[0];
    },

}
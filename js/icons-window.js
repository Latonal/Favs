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
}

function getNumberToPut(wrapper, widthOfChilds, heightOfChilds) {
    const availableSize = [wrapper.offsetWidth, wrapper.offsetHeight];
    return Math.max(Math.floor(availableSize[0] / widthOfChilds), 1) * (Math.max(Math.floor(availableSize[1] / heightOfChilds), 1) + 1);
}

async function loadMoreIcons() {
    const db = await openDatabase();

    return new Promise(async (resolve, reject) => {
        try {
            const transactionsRead = db.transaction(StoreName.ICONS, "readonly");
            const iconsStore = transactionsRead.objectStore(StoreName.ICONS);

            const numberToGenerate = getNumberToPut(document.getElementById("icons-list"), 100 + 10, 100 + 10);
            const numberOfChildsAlreadyExisting = document.querySelector("#icons-list .all-icons").childElementCount;
            const data = await getIconsData(iconsStore, numberOfChildsAlreadyExisting, numberToGenerate);
            createIcons(data);
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

function createIcons(data) {
    putIcons = document.querySelector("#icons-list .all-icons");
    data.forEach(element => {
        putIcons.appendChild(createIcon(element.link, element.uuid, element.alt, element.name));
    });
}

function createIcon(src, uuid, alt, name) {
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
    return newDiv;
}

function setIcon(event) {
    img = event.currentTarget.querySelector("img");
    menuFormat.img.changeInputContent(img.src, event.currentTarget.getAttribute("img-id"), img.alt);
    setIconWindow(false);
}
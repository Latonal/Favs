let editing = false;
let deleting = false;
let creating = false;

/**
 * @returns if there is an active state in the app (editing, creating...)
 */
function getAppState() {
    return editing || creating;
}

function setAppState(stateToChange) {
    if (stateToChange !== "editing" && editing) setEditing(false);
    if (stateToChange !== "deleting" && deleting) setDeleting(false);
    if (stateToChange !== "creating" && creating) setCreating(false);
}

// TODO: simplify setEditing, setCreating, etc.
function setEditing(canEdit = null) {
    setAppState("editing");
    if (typeof canEdit != "boolean") editing = !editing;
    else editing = canEdit;

    const editButton = document.getElementById("edit-button");
    if (editing)
        editButton.classList.add("active");
    else
        editButton.classList.remove("active");

    setAppAttribute("edit", editing);
    closeEditMenu();
}

function setDeleting(canDelete = null) {
    setAppState("deleting");
    if (typeof canDelete != "boolean") deleting = !deleting;
    else deleting = canDelete;

    const editButton = document.getElementById("delete-button");
    if (deleting)
        editButton.classList.add("active");
    else
        editButton.classList.remove("active");

    setAppAttribute("delete", deleting);
}

function setCreating(canCreate = null) {
    setAppState("creating");
    if (typeof canCreate != "boolean") creating = !creating;
    else creating = canCreate;

    const createButton = document.getElementById("create-button");
    if (creating)
        createButton.classList.add("active");
    else
        createButton.classList.remove("active");

    setAppAttribute("create", creating);
}

function setAppAttribute(attr, val) {
    const app = document.getElementById("app");
    if (val)
        app.setAttribute(attr, val);
    else
        app.removeAttribute(attr);
}

// #region menu class
function openEditMenu(element) {
    const elementType = elementTypeFormatCommon.getElementType(element, false, true);
    menu.setMenu(element, elementType);
}

function closeEditMenu() {
    menu.closeMenu();
}

class Menu {
    constructor(callbackCommon, menu, itemPool) {
        this.callbackCommon = callbackCommon;
        this.menu = menu;
        this.itemPool = itemPool;
    }

    elementType;
    elementId;

    setMenu(element, newElementType) {
        this.setFields(newElementType);
        this.moreSetMenu(element);

        this.openMenu();
    }

    setFields(newElementType) {
        if (newElementType !== this.elementType) {
            if (!newElementType) return;
            const itemsToDisplay = elementTypeFormatCommon.setMenu(newElementType).items;
            let lastElement;
            for (const [key, value] of Object.entries(itemsToDisplay)) {
                let field = this.callbackCommon.checkFieldAlreadyInMenu(key, this.menu)
                if (isTruthy(field) !== value) {
                    if (field)
                        this.callbackCommon.poolField(field, this.itemPool);
                    else
                        field = this.callbackCommon.createOrMoveField(key, field, lastElement, this.menu, this.itemPool);
                }
                if (value) lastElement = field;
            }

            this.elementType = newElementType;
        }
    }

    moreSetMenu() { }

    openMenu() {
        this.menu.classList.remove("hide");
    }

    closeMenu() {
        this.saveChanges();
        this.menu.classList.add("hide");
    }

    saveChanges() {
        updateStoreEntries(1);
    }
}

class ItemsList {
    constructor(items, ...itemsName) {
        this.items = structuredClone(items);
        itemsName.forEach(element => {
            if (this.items.hasOwnProperty(element))
                this.items[element] = true;
            else
                console.warn("WARNING Interact-Playground-4:\nThe menu option to display seems to not be supported: " + element);
        });
    }
}
// #endregion menu class

// #region edit menu
class EditMenu extends Menu {
    constructor(element, itemPool) {
        super(menuFormatCommon, element, itemPool);
    }

    moreSetMenu(element) {
        this.setInputs(element);
    }

    setInputs(element) {
        if (element.id !== this.elementId) {
            this.menu.childNodes.forEach(field => {
                const fieldType = field.getAttribute("data-field");
                if (isTruthy(fieldType))
                    if (typeof menuFormat[fieldType].setInputContent === "function")
                        menuFormat[fieldType].setInputContent(element, field, this.elementType);
            });

            // this.currentElement = element;
            if (isTruthy(this.elementId)) this.saveChanges();
            this.elementId = element.id;
        }
    }
}

var editItems = {
    close: true,
    text: false,
    img: false,
    customcss: false,
    type: false,
    save: true,
};

class MenuItemsToDisplay extends ItemsList {
    constructor(...itemsName) {
        super(editItems, ...itemsName);
    }
}

const menuFormatCommon = {
    checkFieldAlreadyInMenu: function (item, menu) {
        // return element instead of true or false
        const element = menu.querySelector("[data-field='" + item + "']");
        if (element)
            return element;

        return false;
    },
    createOrMoveField: function (item, field, lastElement, menu, itemPool) {
        if (!field)
            field = this.checkFieldAlreadyInMenu(item, itemPool);
        if (!field) {
            if (typeof menuFormat[item].createField === "function")
                field = menuFormat[item].createField();
            else {
                console.warn("WARNING Interact-Playground-2:\nThe following type of field seems to not be handled for creation: " + item);
                return;
            }
        }

        if (!isTruthy(field)) return;

        if (isTruthy(lastElement))
            lastElement.after(field);
        else
            menu.prepend(field);

        return field;
    },
    poolField: function (element, itemPool) {
        itemPool.append(element);
    }
}

const menuFormat = {
    close: {
        createField: function () {
            const field = document.createElement("div");
            field.setAttribute("data-field", "close");
            const newButton = document.createElement("button");
            newButton.innerText = "X";
            newButton.addEventListener("click", this.updateData);
            field.append(newButton);
            return field;
        },
        getInput: function (field) { },
        setInputContent: function (element, field, elementType) { },
        updateData: function (event) {
            menu.closeMenu();
        },
    },
    save: {
        createField: function () {
            const field = document.createElement("div");
            field.setAttribute("data-field", "save");
            const newButton = document.createElement("button");
            newButton.innerText = "Save";
            newButton.addEventListener("click", this.updateData);
            field.append(newButton);
            return field;
        },
        getInput: function (field) { },
        setInputContent: function (element, field, elementType) { },
        updateData: function (event) {
            menu.saveChanges();
        },
    },
    text: {
        createField: function () {
            const field = document.createElement("div");
            field.setAttribute("data-field", "text");
            const newP = document.createElement("p");
            newP.innerText = "Text";
            field.append(newP);
            const input = document.createElement("input");
            input.type = "text";
            field.addEventListener("keyup", this.updateData);
            field.append(input);
            return field;
        },
        getInput: function (field) {
            return field.querySelector("input");
        },
        setInputContent: function (element, field, elementType) {
            const input = this.getInput(field);
            input.value = elementTypeFormatCommon.checkFunctionExists("getText", elementType, element);
        },
        updateData: function (event) {
            elementTypeFormatCommon.checkFunctionExists("updateText", menu.elementType, menu.currentElement, event.target.value);

            keepTrackOfChanges(new ElementLog(menu.elementId, Status.UPDATE, "text"));
        }
    },
    img: {
        createField: function () {
            const field = document.createElement("div");
            field.id = "icon-button";
            field.setAttribute("data-field", "img");
            const newP = document.createElement("p");
            newP.innerText = "Image";
            field.append(newP);
            const button = document.createElement("button");
            button.classList.add("icon");
            const img = document.createElement("img");
            button.append(img);
            field.addEventListener("keyup", this.updateData);
            field.append(button);
            button.onclick = () => setIconWindow(true);
            return field;
        },
        getInput: function (field) {
            return field.querySelector("img");
        },
        setInputContent: function (element, field, elementType) {
            const input = this.getInput(field);
            const imgValues = elementTypeFormatCommon.getImg(elementType, element);

            if (!imgValues) return;

            input.src = imgValues[0];
            input.setAttribute("img-id", imgValues[1]);
            input.alt = imgValues[2];
        },
        changeInputContent: function (src, uuid, alt) {
            const input = document.querySelector("#edit-menu #icon-button button img");
            input.src = src;
            input.setAttribute("img-id", uuid);
            input.alt = alt;
            this.updateData(input);
        },
        updateData: function (input) {
            elementTypeFormatCommon.checkFunctionExists("updateImg", menu.elementType, menu.elementType, menu.currentElement, input.src, input.getAttribute("img-id"), input.alt);

            keepTrackOfChanges(new ElementLog(menu.elementId, Status.UPDATE, "img"));
        }
    },
    customcss: {
        createField: function () {
            const field = document.createElement("div");
            field.setAttribute("data-field", "customcss");
            const newP = document.createElement("p");
            newP.innerText = "Custom css";
            field.append(newP);
            const input = document.createElement("input");
            input.type = "text";
            field.addEventListener("keyup", this.updateData);
            field.append(input);
            return field;
        },
        getInput: function (field) {
            return field.querySelector("input");
        },
        setInputContent: function (element, field, elementType) {
            let input = this.getInput(field);
            if (typeof elementTypeFormat[elementType].getCustomCss === "function") {
                input.value = elementTypeFormat[elementType].getCustomCss(element);
                return;
            } else if (typeof elementTypeFormatCommon.getCustomCss === "function") {
                input.value = elementTypeFormatCommon.getCustomCss(element);
                return;
            }

            console.warn("WARNING Interact-Playground-3customcss:\nThe custom css input could not be filled because it seems the type'" + elementType + "' does not support it.");
        },
        updateData: function (event) {
            if (typeof elementTypeFormatCommon.updateCustomCss === "function")
                elementTypeFormatCommon.updateCustomCss(menu.currentElement, event.target.value);

            keepTrackOfChanges(new ElementLog(menu.elementId, Status.UPDATE, "customcss"));
        }
    },
    type: {
        createField: function () {
            const field = document.createElement("div");
            field.setAttribute("data-field", "type");
            const newP = document.createElement("p");
            newP.innerText = "Type";
            field.append(newP);
            const input = document.createElement("select");

            var inheritOpt = document.createElement('option');
            inheritOpt.value = -1;
            inheritOpt.innerHTML = "";
            input.appendChild(inheritOpt);
            for (const [key, value] of Object.entries(FavsElementsType)) {
                var opt = document.createElement('option');
                opt.value = key;
                opt.innerHTML = value;
                input.appendChild(opt);
            }

            field.addEventListener("change", this.updateData);
            field.append(input);
            return field;
        },
        getInput: function (field) {
            return field.querySelector("select");
        },
        setInputContent: function (element, field, elementType) {
            const input = this.getInput(field);
            const val = elementTypeFormatCommon.getType(element, true, false) || -1;
            if (val === -1 && element.tagName.toLowerCase() !== FavsCustomElementsName.tags.STICKER) {
                input.value = 1;
                return;
            }
            input.value = val;
        },
        updateData: function (event) {
            if (typeof elementTypeFormatCommon.setType === "function")
                elementTypeFormatCommon.setType(menu.currentElement, event.target.value);

            keepTrackOfChanges(new ElementLog(menu.elementId, Status.UPDATE, "type"));
        },
    },
    // schema: {
    //     createField: function () { },
    //     getInput: function (field) { },
    //     setInputContent: function (element, field, elementType) { },
    //     updateData: function (event) { },
    // }
}

const menu = new EditMenu(document.getElementById("edit-menu"), document.getElementById("edit-menu-pool"));
// #endregion edit menu

// #region context menu
class ElementsContextMenu extends Menu {
    constructor(element, itemPool) {
        super(contextMenuFormatCommon, element, itemPool);
    }

    moreSetMenu(element) {
        // MUST SET THE POSITION OF THIS WINDOW RELATIVE TO THE MOUSE
    }
}

var contextMenuItems = {
    createNewStickers: false,
    createNewGroup: false,
}

class ElementsContextMenuToDisplay extends ItemsList {
    constructor(...itemsName) {
        super(editItems, ...itemsName);
    }
}


const contextMenuFormatCommon = {

}

const contextMenuFormat = {

}

const contextMenu = new ElementsContextMenu(document.getElementById("context-menu"), document.getElementById("context-menu-pool"));
// #endregion context menu
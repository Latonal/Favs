var editing = false;
function setEditing(canEdit) {
    if (typeof (canEdit) != "boolean") return console.error("Tried to set editing with a non-boolean");
    editing = !canEdit;
    setEditAttribute();
}

function setEditAttribute() {
    const app = document.getElementById("app");
    app.setAttribute("edit", editing);
}

let currentEditedElement = null;
function openEditMenu(element) {
    currentEditedElement = element;
    const elementType = getElementType(element, element.parentNode);
    menu.setMenu(element, elementType);
}

function closeEditMenu() {
    currentEditedElement = null;
    // close popup
}

class MenuItemsToDisplay {
    constructor(...itemsName) {
        this.items = {
            text: false,
            img: false,
            customcss: false
        };
        itemsName.forEach(element => {
            if (this.items.hasOwnProperty(element))
                this.items[element] = true;
            else
                console.warn("WARNING Interact-Playground-1:\nThe menu to display seems to not be supported: " + element);
        });
    }
}

class Menu {
    constructor(element, itemPool) {
        this.menu = element;
        this.itemPool = itemPool;
    }

    elementType;
    elementId;
    currentElement;

    setMenu(element, newElementType) {
        this.setFields(newElementType);
        this.setInputs(element);

        this.openMenu();
    }

    setFields(newElementType) {
        if (newElementType !== this.elementType) {
            const itemsToDisplay = elementTypeFormatCommon.setMenu(newElementType).items;
            let lastElement;
            for (const [key, value] of Object.entries(itemsToDisplay)) {
                let field = menuFormat.default.checkFieldAlreadyInMenu(key, this.menu)
                if (isTruthy(field) !== value) {
                    if (field)
                        menuFormat.default.poolField(field, this.itemPool);
                    else
                        field = menuFormat.default.createOrMoveField(key, field, lastElement, this.menu, this.itemPool);
                    lastElement = field;
                }
            }

            this.elementType = newElementType;
        }
    }

    setInputs(element) {
        if (element.id !== this.elementId) {
            this.menu.childNodes.forEach(field => {
                const fieldType = field.getAttribute("data-field");
                if (isTruthy(fieldType))
                    if (typeof menuFormat[fieldType].setInputContent === "function")
                        menuFormat[fieldType].setInputContent(element, field, this.elementType);
            });

            this.currentElement = element;
            this.elementId = element.id;
        }
    }

    openMenu() {
        this.menu.classList.remove("hide");
    }

    closeMenu() {
        this.menu.classList.add("hide");
    }
}
const menu = new Menu(document.getElementById("edit-menu"), document.getElementById("edit-menu-pool"));

const menuFormat = {
    default: {
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
            field.addEventListener("change", this.updateData);
            field.append(input);
            return field;
        },
        getInput: function (field) {
            return field.querySelector("input");
        },
        setInputContent: function (element, field, elementType) {
            let input = this.getInput(field);
            if (typeof elementTypeFormat[elementType].getText === "function") {
                input.value = elementTypeFormat[elementType].getText(element);
                return;
            } else if (typeof elementTypeFormatCommon.getText === "function") {
                input.value = elementTypeFormatCommon.getText(element);
                return;
            }

            console.warn("WARNING Interact-Playground-3text:\nThe text input could not be filled because it seems the type'" + elementType + "' does not support it.");
        },
        updateData: function (event) {
            if (typeof elementTypeFormat[menu.elementType].updateText === "function")
                elementTypeFormat[menu.elementType].updateText(menu.currentElement, event.target.value);
            else if (typeof elementTypeFormatCommon.updateText === "function")
                elementTypeFormatCommon.updateText(menu.currentElement, event.target.value);
            else {
                console.warn("WARNING Interact-Playground-4text:\nThe text input could not be updated because it seems the type'" + menu.elementType + "' does not support it.");
                return;
            }

            keepTrackOfChanges(new ElementLog(menu.elementId, Status.UPDATE, "text"));
            updateElementsInDb();
        }
    },
    img: {
        createField: function () {
            const field = document.createElement("div");
            field.setAttribute("data-field", "img");
            const newP = document.createElement("p");
            newP.innerText = "Image";
            field.append(newP);
            const input = document.createElement("input");
            input.type = "text";
            field.append(input);
            return field;
        },
        getInput: function (field) {

        },
        setInputContent: function (element, field, elementType) {
            let input = this.getInput(field);

        },
        updateData: function () {

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
            field.addEventListener("change", this.updateData);
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
            if (typeof elementTypeFormat[menu.elementType].updateCustomCss === "function") 
                elementTypeFormat[menu.elementType].updateCustomCss(menu.currentElement, event.target.value);
            else if (typeof elementTypeFormatCommon.updateCustomCss === "function") 
                elementTypeFormatCommon.updateCustomCss(menu.currentElement, event.target.value);
            else {
                console.warn("WARNING Interact-Playground-4text:\nThe custom css input could not be updated because it seems the type'" + menu.elementType + "' does not support it.");
                return;
            }

            console.log("should update custom css");

            keepTrackOfChanges(new ElementLog(menu.elementId, Status.UPDATE, "customcss"));
            updateElementsInDb();
        }
    },
    // schema: {
    //     createField: function () { },
    //     getInput: function (field) { },
    //     setInputContent: function (element, field, elementType) { },
    //     updateData: function (event) { },
    // }
}
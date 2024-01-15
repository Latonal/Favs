//#region PROTOTYPES
// TODO : ENCRYPT
String.prototype.encrypt/*, Number.prototype.encrypt */ = function () {
    if (isEmpty(this)) return this;
    return this;
}
// TODO : DECRYPT
String.prototype.decrypt = function () {
    if (isEmpty(this)) return this;
    return this;
}
console.log(String.prototype);
//#endregion PROTOTYPES





//#region "ENUMS"
const FavsCustomElementsName = {
    tags: {
        ALBUM: "my-album",
        GROUP: "my-group",
        STICKER: "my-sticker",
    }
};
//#endregion "ENUMS"





//#region CLASSES
class Groups extends HTMLElement {
    constructor() {
        super();
        this.addEventListener('dragover', handleGroupDragOver);
        this.addEventListener('drop', handleGroupDrop);
    }
}
customElements.define(FavsCustomElementsName.tags.GROUP, Groups);

function handleGroupDragOver(element) {
    element.preventDefault();
}

function handleGroupDrop(element) {
    const data = element.dataTransfer.getData("element");
    // if (element.target.tagName == FavsCustomElementsName.tags.GROUP)
    //     element.target.appendChild(document.getElementById(data));
    // else 
        element.target.closest(FavsCustomElementsName.tags.GROUP).appendChild(document.getElementById(data));

        // append correctly depending of wether or not it is targeting a group or a sticker - or even an album
    console.log("group drop");
    // remove css ?
}

class Sticker extends HTMLElement {
    constructor() {
        super();
        this.addEventListener('click', this.handleClick.bind(this));
        this.addEventListener('dragstart', handleStickerDragStart);
        this.addEventListener('dragover', handleStickerDragOver);
        this.addEventListener('dragleave', handleStickerDragLeave);
        // this.addEventListener('drop', handleStickerDrop);

        this.addEventListener('mouseover', function () {
            this.setAttribute('draggable', editing);
        });
    }

    connectedCallback() { // Added to the DOM
        console.log(this);
        // this.firstChild.remove();
    }

    disconnectedCallback() { // Removed from the DOM

    }

    attributeChangedCallback(name, oldValue, newValue) { // An attribute has been changed

    }

    handleClick() { // Element has been clicked on
        handleStickerRedirection(this);
        handleStickerEdit(this);
    }
}
customElements.define(FavsCustomElementsName.tags.STICKER, Sticker);

function handleStickerRedirection(element) {
    const href = element.getAttribute("href");
    const target = element.getAttribute("target");

    if (!editing) {
        if (href) {
            window.open(href, target || '_self');
        }
    }
}

// Open edit menu
function handleStickerEdit(element) {
    if (editing) {

    }
}

// Allow to drag element
function handleStickerDragStart(element) {
    console.log("drag start");
    element.dataTransfer.setData("element", element.currentTarget.id)
}

function handleStickerDragOver(element) {
    // add css and update it depending of position of cursor
}

function handleStickerDragLeave(element) {
    // remove css
}

// function handleStickerDrop(element) {
//     // drop item, either set it back to position or change it
//     const data = element.dataTransfer.getData("element");
//     element.target.after(document.getElementById(data));
//     console.log("sticker drop");
//     // remove css ?
// }
//#endregion CLASSES
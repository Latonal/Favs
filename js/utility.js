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

const Positions = {
    TOP: 1,
    RIGHT: 2,
    BOTTOM: 3,
    LEFT: 4,
}
//#endregion "ENUMS"





//#region CLASSES
/**
 * Get closest custom element part of a standard album (sticker > group > album) or null if none is found
 * @param {HTMLElement} element
 * @returns {any} HTMLElement or null
 */
function closestAlbumCustomElement(element) {
    return element.target.closest(FavsCustomElementsName.tags.STICKER) ||
        element.target.closest(FavsCustomElementsName.tags.GROUP) ||
        element.target.closest(FavsCustomElementsName.tags.ALBUM) ||
        null;
}

function setOrderToFitSiblings(element) {
    const family = element.parentElement.children;
    const numberOfChilds = family.length;
    const position = Array.prototype.indexOf.call(family, element);
    var iterateToNextSibling = true;
    if (numberOfChilds - 1 == 0 || position < (numberOfChilds - 1) / 2) iterateToNextSibling = false;
    assignOrderToSiblingsRecursively(element, iterateToNextSibling);
}

/**
 * 
 * @param {HTMLElement} element 
 * @param {Boolean} iterateToNextSibling true: next sibling / false: previous sibling 
 */
function assignOrderToSiblingsRecursively(element, iterateToNextSibling) {
    console.log("iterate");
    const nextElement = element.nextElementSibling;
    const prevElement = element.previousElementSibling;

    let nextOrder = (nextElement && getComputedStyle(nextElement).getPropertyValue("--order")) || 0;
    let prevOrder = (prevElement && getComputedStyle(prevElement).getPropertyValue("--order")) || 0;

    let newOrder = 0;
    if (iterateToNextSibling)
        newOrder = (prevElement) ? parseInt(prevOrder, 10) + 1 : 0;
    else
        newOrder = (nextElement) ? parseInt(nextOrder, 10) - 1 : 0;
    if (prevElement && nextElement && prevOrder < nextOrder - 1) {
        console.log("special case");
        newOrder = nextOrder - 1;
    }
    element.style.setProperty("--order", newOrder);

    if (iterateToNextSibling)
        nextElement && assignOrderToSiblingsRecursively(nextElement, iterateToNextSibling);
    else
        prevElement && assignOrderToSiblingsRecursively(prevElement, iterateToNextSibling);

    // Todo : create a case if the previous or next element does not require to change its order
    // (because real order does not change)


    /**
     * ^^ Simplified ^^
     * vv Previous vv
     */

    // const prevElement = element.previousSibling;
    // const nextElement = element.nextSibling;
    // if (prevElement == null && nextElement == null) {
    //     element.style.setProperty("--order", 0);
    //     return;
    // }

    // let prevOrder = null;
    // let nextOrder = null;
    // if (prevElement != null) {
    //     const compStyle = getComputedStyle(prevElement);
    //     prevOrder = compStyle.getPropertyValue("--order");
    // }
    // if (nextElement != null) {
    //     const compStyle = getComputedStyle(nextElement);
    //     nextOrder = parseInt(compStyle.getPropertyValue("--order"));
    // }

    // if (prevOrder != null && isEmpty(prevOrder))
    //     prevOrder = 0;
    // if (nextOrder != null && isEmpty(nextOrder))
    //     nextOrder = 0;

    // if (prevElement == null) {
    //     element.style.setProperty("--order", nextOrder - 1);
    //     return;
    // }
    // if (nextElement == null) {
    //     element.style.setProperty("--order", parseInt(prevOrder, 10) + 1);
    //     return;
    // }
    // if (/*prevOrder && nextOrder &&*/ prevOrder < nextOrder - 1) {
    //     element.style.setProperty("--order", nextOrder - 1);
    //     return;
    // }

    // const newOrder = (iterateToNextSibling) ? parseInt(prevOrder, 10) + 1 : nextOrder - 1;
    // element.style.setProperty("--order", newOrder);
    // assignOrderToSiblingsRecursively((iterateToNextSibling) ? nextElement : prevElement, iterateToNextSibling);
}

/**
 * Return closest edge
 * @param {HTMLElement} element 
 * @param {Boolean} verticalOutput Should we return vertical output (top, bottom)
 * @param {Boolean} horizontalOutput Should we return horizontal ouput (right, left)
 * @returns 
 */
function getClosestEdge(element, verticalOutput = true, horizontalOutput = true) {
    targetElement = closestAlbumCustomElement(element);
    if (!verticalOutput && !horizontalOutput) return console.error("ERROR Utility-2:\nThe parameters verticalOutput and horizontalOutput must not be both set to false.");

    var x = null, y = null, distFromRight = null, distFromBottom = null;
    var values = [];
    // dist from top
    if (verticalOutput) {
        y = element.clientY - targetElement.getBoundingClientRect().top;
        const height = targetElement.offsetHeight;
        distFromBottom = height - y;
        values.push(y, distFromBottom);
    }

    // dist from left
    if (horizontalOutput) {
        x = element.clientX - targetElement.getBoundingClientRect().left;
        const width = targetElement.offsetWidth;
        distFromRight = width - x;
        values.push(x, distFromRight);
    }

    values = values.filter(element => {
        return element !== null;
    });

    // const minDist = Math.min(x, y, distFromRight, distFromBottom);
    const minDist = Math.min.apply(this, values);

    switch (minDist) {
        case x:
            return Positions.LEFT;
        case y:
            return Positions.TOP;
        case distFromRight:
            return Positions.RIGHT;
        case distFromBottom:
            return Positions.BOTTOM;
        default:
            console.error("ERROR Utility-1:\nAn error happened while retrieving position in targeted element.", minDist);
            break;
    }
}

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
    element.preventDefault();
    element.stopPropagation();

    const data = element.dataTransfer.getData("element");
    const realTarget = closestAlbumCustomElement(element);
    const elementToMove = document.getElementById(data);
    realTarget.closest(FavsCustomElementsName.tags.GROUP).appendChild(elementToMove);
    setOrderToFitSiblings(elementToMove);

    // append correctly depending of wether or not it is targeting a group or a sticker - or even an album
    // remove css ?
}

class Sticker extends HTMLElement {
    constructor() {
        super();
        this.addEventListener('click', this.handleClick.bind(this));
        this.addEventListener('dragstart', handleStickerDragStart);
        this.addEventListener('dragover', handleStickerDragOver);
        this.addEventListener('dragleave', handleStickerDragLeave);
        this.addEventListener('drop', handleStickerDrop);

        this.addEventListener('mouseover', function () {
            this.setAttribute('draggable', editing);
        });
    }

    connectedCallback() { // Added to the DOM
        // console.log(this);
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
        const compStyle = getComputedStyle(prevElement);
        prevOrder = compStyle.getPropertyValue("--value");
    }
}

// Allow to drag element
function handleStickerDragStart(element) {
    element.dataTransfer.setData("element", element.currentTarget.id)
}

function handleStickerDragOver(element) {
    if (document.getElementById(element.dataTransfer.getData("element")).tagName.toLowerCase() != FavsCustomElementsName.tags.STICKER) return;
    element.preventDefault();
    const closestEdge = getClosestEdge(element);
    console.log("closest edge: " +  closestEdge);
    // add css and update it depending of position of cursor
}

function handleStickerDragLeave(element) {
    // remove css
}

function handleStickerDrop(element) {
    const data = element.dataTransfer.getData("element");
    const elementToMove = document.getElementById(data);
    if (elementToMove.tagName.toLowerCase() != FavsCustomElementsName.tags.STICKER) return;

    element.preventDefault();
    element.stopPropagation();

    const realTarget = closestAlbumCustomElement(element);

    const closestEdge = getClosestEdge(element);
    if (closestEdge === 1 || closestEdge === 4) {
        realTarget.closest(FavsCustomElementsName.tags.STICKER).before(elementToMove);
        setOrderToFitSiblings(elementToMove);
    } else {
        realTarget.closest(FavsCustomElementsName.tags.STICKER).after(elementToMove);
        setOrderToFitSiblings(elementToMove);
    }



    // drop item, either set it back to position or change it
    // const data = element.dataTransfer.getData("element");
    // element.target.after(document.getElementById(data));
    // console.log("sticker drop");
    // remove css ?
}
//#endregion CLASSES
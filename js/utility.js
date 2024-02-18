//#region PROTOTYPES
// TODO : ENCRYPT
String.prototype.encrypt/*, Number.prototype.encrypt */ = function () {
    if (!isTruthy(this)) return this;
    return this;
}
// TODO : DECRYPT
String.prototype.decrypt = function () {
    if (!isTruthy(this)) return this;
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
    },
    tags_value: {
        ALBUM: 1,
        GROUP: 2,
        STICKER: 3,
        HIGH: 3,
    }
};

const Positions = {
    TOP: 1,
    RIGHT: 2,
    BOTTOM: 3,
    LEFT: 4,
    INNER: 5,
}
//#endregion "ENUMS"





//#region CLASSES

function isTargetedElement(event, tagName) {
    const element = (isTruthy(event.target.tagName)) ? event.target : event.currentTarget;
    const closest = element.closest(tagName);
    if (event.currentTarget !== closest) return null;
    else return closest;
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
}

/**
 * Return closest edge
 * @param {Event} event 
 * @param {HTMLElement} closest 
 * @param {Boolean} verticalOutput Should we return vertical output (top, bottom)
 * @param {Boolean} horizontalOutput Should we return horizontal ouput (right, left)
 * @returns 
 */
function getClosestEdge(event, closest, verticalOutput = true, horizontalOutput = true) {
    if (!verticalOutput && !horizontalOutput) return console.error("ERROR Utility-4:\nThe parameters verticalOutput and horizontalOutput must not be both set to false.");

    var x = null, y = null, distFromRight = null, distFromBottom = null;
    var values = [];
    // dist from top
    if (verticalOutput) {
        y = event.clientY - closest.getBoundingClientRect().top;
        const height = closest.offsetHeight;
        distFromBottom = height - y;
        values.push(y, distFromBottom);
    }

    // dist from left
    if (horizontalOutput) {
        x = event.clientX - closest.getBoundingClientRect().left;
        const width = closest.offsetWidth;
        distFromRight = width - x;
        values.push(x, distFromRight);
    }

    values = values.filter(element => {
        return element !== null;
    });

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

function isHoverCorner(event, closest, thresholdValue, thresholdUnit) {
    const rect = closest.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    switch (thresholdUnit) {
        case "px":
            return checkConditionsThreshold(2,
                x <= thresholdValue,
                y <= thresholdValue,
                x >= rect.width - thresholdValue,
                y >= rect.height - thresholdValue);
        // case "%": // TODO
        //     const thresholdX = (rect.width * thresholdValue) / 100;
        //     const thresholdY = (rect.height * thresholdValue) / 100;
        //     return checkConditionsThreshold(2,
        //         x <= thresholdX,
        //         y <= thresholdY,
        //         x >= rect.width - thresholdX,
        //         y >= rect.height - thresholdY);
        default:
            console.error("ERROR Utility-5:\nThreshold unit is not supported. Please use px or %.", minDist);
            break;
    }
}

function SetDragClass(element, val) {
    switch (val) {
        case 1: // top
            element.classList.add("drag-top");
            element.classList.remove("drag-right", "drag-bottom", "drag-left");
            break;
        case 2: // right
            element.classList.add("drag-right");
            element.classList.remove("drag-top", "drag-bottom", "drag-left");
            break;
        case 3: // bottom
            element.classList.add("drag-bottom");
            element.classList.remove("drag-top", "drag-right", "drag-left");
            break;
        case 4: // left
            element.classList.add("drag-left");
            element.classList.remove("drag-top", "drag-right", "drag-bottom");
            break;
        case 5: // inner
            element.classList.add("drag-inner");
            break;
        default: // remove classes
            element.classList.remove("drag-top", "drag-right", "drag-bottom", "drag-left", "drag-inner");
            break;
    }
}

class Groups extends HTMLElement {
    constructor() {
        super();
        this.addEventListener('click', this.handleClick.bind(this));
        this.addEventListener('dragstart', handleGroupDragStart);
        this.addEventListener('dragover', handleGroupDragOver);
        this.addEventListener('drop', handleGroupDrop);

        this.addEventListener('mouseover', function () {
            this.setAttribute('draggable', editing);
        });
    }

    handleClick() {
        handleGroupEdit(this);
    }
}
customElements.define(FavsCustomElementsName.tags.GROUP, Groups);

function handleGroupEdit(event) {
    if (editing) {
        // Todo: Open edit menu

        // const compStyle = getComputedStyle(prevElement);
        // prevOrder = compStyle.getPropertyValue("--value");
    }
}

function handleGroupDragStart(event) {
    event.dataTransfer.clearData();
    event.dataTransfer.setData("element", event.currentTarget.id);

    event.stopPropagation();
}

function handleGroupDragOver(event) {
    const data = event.dataTransfer.getData("element");
    const elementToMove = document.getElementById(data);
    if (elementToMove.tagName.toLowerCase() != FavsCustomElementsName.tags.STICKER &&
        elementToMove.tagName.toLowerCase() != FavsCustomElementsName.tags.GROUP)
        return;

    const closest = isTargetedElement(event, FavsCustomElementsName.tags.GROUP);
    if (!closest) return;

    event.preventDefault();
    event.stopPropagation();

    switch (elementToMove.tagName.toLowerCase()) {
        case FavsCustomElementsName.tags.STICKER:
            if (!closest.contains(elementToMove)) {
                closest.appendChild(elementToMove);
                setOrderToFitSiblings(elementToMove);
            }
            break;
        case FavsCustomElementsName.tags.GROUP: // Currently correcting this part
            if (closest.id === data) break;
            const closestEdge = getClosestEdge(event, closest);
            // console.log("is hover corner", isHoverCorner(event, closest, 20, "px"));
            assignGroup(event, closest, elementToMove, closestEdge);
            break;
        default:
            console.error("ERROR Utility-3:\nAn error happened while trying to determine what element type your were trying to drag over a group.", minDist);
            break;
    }
}

function handleGroupDrop(event) {
    const data = event.dataTransfer.getData("element");
    const elementToMove = document.getElementById(data);
    elementToMove.classList.remove("dragged");

    event.preventDefault();
    event.stopPropagation();
}

function assignGroup(event, closest, elementToMove, closestEdge) {
    console.log("tried to push a group into a group");
    console.log("group closest edge:", closestEdge, "from:", closest);
    if (closestEdge === 1 || closestEdge === 4) {
        closest.before(elementToMove);
    } else {
        closest.after(elementToMove);
    }
    setOrderToFitSiblings(elementToMove);
}

class Sticker extends HTMLElement {
    constructor() {
        super();
        this.addEventListener('click', this.handleClick.bind(this));
        this.addEventListener('dragstart', handleStickerDragStart);
        this.addEventListener('dragover', handleStickerDragOver);
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
        // change in style: save
    }

    handleClick() { // Element has been clicked on
        handleStickerRedirection(this);
        handleStickerEdit(this);
    }
}
customElements.define(FavsCustomElementsName.tags.STICKER, Sticker);

function handleStickerRedirection(event) {
    const href = event.getAttribute("href");
    const target = event.getAttribute("target");

    if (!editing) {
        if (href) {
            window.open(href, target || '_self');
        }
    }
}

function handleStickerEdit(event) {
    if (editing) {
        // Todo: Open edit menu

        // const compStyle = getComputedStyle(prevElement);
        // prevOrder = compStyle.getPropertyValue("--value");
    }
}

// Allow to drag element
function handleStickerDragStart(event) {
    event.dataTransfer.clearData();
    event.currentTarget.classList.add("dragged");
    event.dataTransfer.setData("element", event.currentTarget.id);

    event.stopPropagation();
}

function handleStickerDragOver(event) {
    const data = event.dataTransfer.getData("element");
    const elementToMove = document.getElementById(data);
    if (elementToMove.tagName.toLowerCase() != FavsCustomElementsName.tags.STICKER) return;

    const closest = isTargetedElement(event, FavsCustomElementsName.tags.STICKER);
    if (!closest) return;
    
    event.preventDefault();
    event.stopPropagation();

    const closestEdge = getClosestEdge(event, closest);
    if (closestEdge === 1 || closestEdge === 4) {
        closest.closest(FavsCustomElementsName.tags.STICKER).before(elementToMove);
    } else {
        closest.closest(FavsCustomElementsName.tags.STICKER).after(elementToMove);
    }
    setOrderToFitSiblings(elementToMove);
}

function handleStickerDrop(event) {
    const data = event.dataTransfer.getData("element");
    const elementToMove = document.getElementById(data);
    elementToMove.classList.remove("dragged");

    event.preventDefault();
    event.stopPropagation();
}
//#endregion CLASSES
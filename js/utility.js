var draggedElementId = 0;
var oldParentId = 0;

//#region PROTOTYPES
// TODO : ENCRYPT -- Prototype should not be used
String.prototype.encrypt/*, Number.prototype.encrypt */ = function () {
    if (!isTruthy(this)) return this;
    return this;
}
// TODO : DECRYPT -- Prototype should not be used
String.prototype.decrypt = function () {
    if (!isTruthy(this)) return this;
    return this;
}
console.log(String.prototype);
//#endregion PROTOTYPES





//#region "ENUMS"
const FavsCustomElementsName = {
    tags: {
        TAB: "my-tab",
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
    INNER: 5,
}

const Status = {
    CREATE: "create",
    PENDING: "pending",
    UPDATE: "update",
    DELETE: "delete"
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
        newOrder = nextOrder - 1;
    }
    element.style.setProperty("--order", newOrder);

    if (iterateToNextSibling)
        nextElement && assignOrderToSiblingsRecursively(nextElement, iterateToNextSibling);
    else
        prevElement && assignOrderToSiblingsRecursively(prevElement, iterateToNextSibling);

    // Todo : create a case if the previous or next element does not require to change its order
    // (because real order does not change)

    keepTrackOfChanges(new ElementLog(element.id, Status.PENDING, "order"));
}

/**
 * Return closest edge
 * @param {Event} event 
 * @param {HTMLElement} closest 
 * @param {Boolean} verticalOutput Should we return vertical output (top, bottom)
 * @param {Boolean} horizontalOutput Should we return horizontal ouput (right, left)
 * @returns {Number}
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

/**
 * Return closest edges ordered and reduced to number needed
 * @param {Event} event 
 * @param {HTMLElement} closest 
 * @param {Boolean} verticalOutput Should we return vertical output (top, bottom)
 * @param {Boolean} horizontalOutput Should we return horizontal ouput (right, left)
 * @returns {Array} Tuple returning the (1) closest edges (2) values of closest edges
 */
function getClosestEdges(event, closest, nbValReturned = 1, ascending = true) {
    var x = null, y = null, distFromRight = null, distFromBottom = null;
    var values = [];

    y = event.clientY - closest.getBoundingClientRect().top;
    const height = closest.offsetHeight;
    distFromBottom = height - y;
    values.push(y, distFromBottom);

    x = event.clientX - closest.getBoundingClientRect().left;
    const width = closest.offsetWidth;
    distFromRight = width - x;
    values.push(x, distFromRight);

    values = values.filter(element => {
        return element !== null;
    })
        .sort(ascending ? sortAscending : sortDescending);

    var results = [];
    for (let i = 0; i < nbValReturned; i++) {

        // results.push(values[i]);
        switch (values[i]) {
            case x:
                results.push(Positions.LEFT);
                break;
            case y:
                results.push(Positions.TOP);
                break;
            case distFromRight:
                results.push(Positions.RIGHT);
                break;
            case distFromBottom:
                results.push(Positions.BOTTOM);
                break;
            default:
                console.error("ERROR Utility-6:\nAn error happened while retrieving position in targeted element.", values[i]);
                break;
        }
    }

    return [results, values];
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

function isHoverCornerCalc(closest, positions, values, thresholdValue = 30, thresholdUnit = "px") {
    if (values.length <= 1) return false;

    switch (thresholdUnit) {
        case "px":
            return values[0] <= thresholdValue && values[1] <= thresholdValue;
        case "%":
            const rect = closest.getBoundingClientRect();
            const thresholdPercentHeight = rect.height / 100 * thresholdValue;
            const thresholdPercentWidth = rect.width / 100 * thresholdValue;
            return ((positions[0] == Positions.TOP || positions[0] == Positions.BOTTOM) ? values[0] <= thresholdPercentHeight : values[0] <= thresholdPercentWidth) &&
                ((positions[1] == Positions.TOP || positions[1] == Positions.BOTTOM) ? values[1] <= thresholdPercentHeight : values[1] <= thresholdPercentWidth);
        default:
            console.error("ERROR Utility-7:\nThreshold unit is not supported. Please use px or %.", minDist);
            return false;
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

class Tabs extends HTMLElement {
    constructor() {
        super();
        this.addEventListener('click', handleTabsClick);
    }
}
customElements.define(FavsCustomElementsName.tags.TAB, Tabs);

async function handleTabsClick(event) {  
    albumId = event.target.getAttribute("data-album");
    if (!document.getElementById(albumId)) {
        await generateAlbum(parseInt(albumId));
    }

    const toHide = document.querySelectorAll(FavsCustomElementsName.tags.ALBUM + ":not([id='" + albumId + "']):not(:has(.hide))");
    const toShow = document.querySelector(FavsCustomElementsName.tags.ALBUM + "[id='" + albumId + "']");
    toHide.forEach(e => {
        e.classList.add("hide");
    });
    if (toShow) toShow.classList.remove("hide");
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
    draggedElementId = event.currentTarget.id;
    oldParentId = event.currentTarget.parentElement.id;

    event.stopPropagation();
}

function handleGroupDragOver(event) {
    const elementToMove = document.getElementById(draggedElementId);
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
        case FavsCustomElementsName.tags.GROUP:
            if (closest.id === draggedElementId) break;
            assignGroup(event, closest, elementToMove);
            break;
        default:
            console.error("ERROR Utility-3:\nAn error happened while trying to determine what element type your were trying to drag over a group.", minDist);
            break;
    }
}

function handleGroupDrop(event) {
    const elementToMove = document.getElementById(draggedElementId);
    elementToMove.classList.remove("dragged");

    event.preventDefault();
    event.stopPropagation();

    if (event.target.parentElement.getAttribute("tmp")) { // parent is tmp (new)
        event.target.parentElement.removeAttribute("tmp");
        event.target.parentElement.removeEventListener("dragleave", removeTmpGroup);
        event.target.parentElement.id = ++highestId;
        setOrderToFitSiblings(event.target.parentElement);
        // put in db
        keepTrackOfChanges(new ElementLog(event.target.parentElement.id, Status.CREATE, "parent", "order"));
        event.target.parentElement.childNodes.forEach(e => {
            keepTrackOfChanges(new ElementLog(e.id, Status.UPDATE, "parent", "order"));
        });
    } else {
        keepTrackOfChanges(new ElementLog(draggedElementId, Status.UPDATE, "parent", "order"));
    }

    // remove old parent if only one child
    if (isTruthy(oldParentId) && document.getElementById(oldParentId).children.length <= 1) {
        keepTrackOfChanges(new ElementLog(oldParentId, Status.DELETE));
        replaceParentByChild(document.getElementById(oldParentId));
    }

    removeAllTmps();

    updatePendingChanges(event.target.parentElement.childNodes);
    updateElementsInDb();
}

function removeAllTmps() {
    const tmps = document.querySelectorAll("[tmp=true]");
    if (tmps.length > 0) {
        tmps.forEach(element => {
            replaceParentByChild(element);
        });
    }
}

function replaceParentByChild(element) {
    const childId = element.childNodes[0].id;
    const layerlevel = element.getAttribute("layer-level");
    element.replaceWith(...element.childNodes);
    let child = document.getElementById(childId);
    setOrderToFitSiblings(child);
    child.setAttribute("layer-level", layerlevel);
    keepTrackOfChanges(new ElementLog(childId, Status.UPDATE, "parent", "order"));
}

function assignGroup(event, closest, elementToMove) {
    // if group has child group, return
    if (closest.querySelector("my-group")) return;

    const parent = closest.parentElement;
    const parentFlexDirection = getComputedStyle(parent).flexDirection;

    // If hover corner first
    // console.log("is hover corner", isHoverCorner(event, closest, 20, "px"));
    const [closestEdges, closestValues] = getClosestEdges(event, closest, 2, true);

    const isHoverCorner = isHoverCornerCalc(closest, closestEdges, closestValues, 15, "%");

    if (isHoverCorner) {
        // Creating parent from target
        let layerLevel = null;
        if (!closest.parentNode.getAttribute("tmp")) {
            let tmpGroup = document.createElement("my-group");
            tmpGroup.setAttribute('draggable', editing);
            tmpGroup.setAttribute("tmp", true);
            closest.before(tmpGroup);
            tmpGroup.appendChild(closest);
            layerLevel = tmpGroup.parentNode ? tmpGroup.parentNode.getAttribute("layer-level") == "odd" ? "even" : "odd" : "odd";
            tmpGroup.setAttribute("layer-level", layerLevel);

            tmpGroup.addEventListener("dragleave", removeTmpGroup);
        }

        // Move dragged element
        if (closestEdges.includes(Positions.TOP) && closestEdges.includes(Positions.LEFT))
            closest.before(elementToMove);
        else if (closestEdges.includes(Positions.RIGHT) && closestEdges.includes(Positions.BOTTOM))
            closest.after(elementToMove);
        else if (closestEdges.includes(Positions.TOP) && closestEdges.includes(Positions.RIGHT)) {
            if (layerLevel == "odd") closest.before(elementToMove);
            else closest.after(elementToMove);
        } else { // Positions.BOTTOM && Positions.LEFT
            if (layerLevel == "odd") closest.after(elementToMove);
            else closest.before(elementToMove);
        }
    } else {
        // TODO: Refactoring
        const closestEdge = closestEdges[0];
        if (parentFlexDirection === "row") {
            const parentIsGroup = parent.tagName.toLowerCase() == FavsCustomElementsName.tags.GROUP;
            if (closestEdge === Positions.TOP) {
                parentIsGroup ? parent.before(elementToMove) : closest.before(elementToMove);
            } else if (closestEdge === Positions.RIGHT) {
                closest.after(elementToMove);
            } else if (closestEdge === Positions.BOTTOM) {
                parentIsGroup ? parent.after(elementToMove) : closest.after(elementToMove);
            } else if (closestEdge === Positions.LEFT) {
                closest.before(elementToMove);
            }
        } else if (parentFlexDirection === "column") {
            if (closestEdge === Positions.TOP) {
                closest.before(elementToMove);
            } else if (closestEdge === Positions.RIGHT) {
                parent.after(elementToMove);
            } else if (closestEdge === Positions.BOTTOM) {
                closest.after(elementToMove);
            } else if (closestEdge === Positions.LEFT) {
                parent.before(elementToMove);
            }
        }
    }

    setOrderToFitSiblings(elementToMove);
}

function removeTmpGroup(event) {
    if (event.currentTarget == document.getElementById(draggedElementId).parentNode) return;
    event.preventDefault();
    event.stopPropagation();

    event.currentTarget.replaceWith(...event.currentTarget.childNodes);
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
    event.currentTarget.classList.add("dragged");
    draggedElementId = event.currentTarget.id;

    event.stopPropagation();
}

function handleStickerDragOver(event) {
    const elementToMove = document.getElementById(draggedElementId);
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
    const elementToMove = document.getElementById(draggedElementId);
    if (elementToMove.tagName.toLowerCase() != FavsCustomElementsName.tags.STICKER) return;

    elementToMove.classList.remove("dragged");

    event.preventDefault();
    event.stopPropagation();

    keepTrackOfChanges(new ElementLog(draggedElementId, Status.UPDATE, "parent", "order"));
    updatePendingChanges(elementToMove.parentElement.childNodes);
    updateElementsInDb();
}
//#endregion CLASSES

/**
 * Create an instance of object allowing to keep track of changes
 * @param {Number} id id of the element to keep track of the changes
 * @param {String} status state of the change. Warning, deletion will prevent any changes
 * @param {...String} propertiesName unlimited number of name of properties we'll have to change in the db
 */
class ElementLog {
    constructor(id, status, ...propertiesName) {
        this.id = id;
        this.status = status;
        this.propertiesName = propertiesName;
    }
}

var elementLogTracking = new Array();

/**
 * 
 * @param {ElementLog} obj 
 */
function keepTrackOfChanges(obj) {
    if (!(obj instanceof ElementLog)) {
        return console.error("ERROR Utility-8:\nAn object of an incorrect type has been passed down to the list of element to update in the database. Object is: ", obj);
    }

    const elementChanged = elementLogTracking.find(({ id }) => id == obj.id);
    if (isTruthy(elementChanged)) { // update already existing element to save
        if (obj.status == Status.DELETE) {
            if (elementChanged.status == Status.CREATE) {
                let index = elementLogTracking.indexOf(elementChanged);
                elementLogTracking.splice(index, 1);
                return;
            }
            // if is update or delete
            elementChanged.status = obj.status;
            return;
        }

        if (elementChanged.status == Status.PENDING) {
            elementChanged.status = obj.status;
        }

        elementChanged.propertiesName = [...new Set([...elementChanged.propertiesName, ...obj.propertiesName])];
    } else { // create new element to save
        if (obj.propertiesName.length > 0)
            elementLogTracking.push(obj);
    }
}

function updatePendingChanges(elements) {
    elements.forEach(e => {
        if (isTruthy(e.id))
            keepTrackOfChanges(new ElementLog(e.id, Status.UPDATE));
    });
}
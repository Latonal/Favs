//#region "ENUMS"
const StoreName = {
    ELEMENTS: "elements",
    ICONS: "icons"
}

const FavsCustomElementsName = {
    tags: {
        TAB: "my-tab",
        ALBUM: "my-album",
        GROUP: "my-group",
        STICKER: "my-sticker",
    }
};

const FavsElementsType = {
    1: "list",
    2: "icon",
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
    DELETE: "delete",
}
//#endregion "ENUMS"





function getClosestElement(event, tagName) {
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
function assignOrderToSiblingsRecursively(element, iterateToNextSibling) { // TODO: delete
    const nextElement = element.nextElementSibling;
    const prevElement = element.previousElementSibling;

    let nextOrder = (nextElement && nextElement.getAttribute("data-order")) || 0;
    let prevOrder = (prevElement && prevElement.getAttribute("data-order")) || 0;

    let newOrder = 0;
    if (iterateToNextSibling)
        newOrder = (prevElement) ? parseInt(prevOrder, 10) + 1 : 0;
    else
        newOrder = (nextElement) ? parseInt(nextOrder, 10) - 1 : 0;
    if (prevElement && nextElement && prevOrder < nextOrder - 1) {
        newOrder = nextOrder - 1;
    }
    element.setAttribute("data-order", newOrder);

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
    // TODO: make the "middle" not count as any edge (or return edge +4 ?)
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

//#region Document
// TODO: make it work -- keydown is fired after dragend :/
// document.addEventListener('keydown', function (event) {
//     console.log("keydown");
//     if (event.key === "Escape") {
//         event.preventDefault();
//         if (Object.keys(currentDraggedElementData).length !== 0) {
//             setDraggedElementBackAtPosition();
//         }
//     }
// });

// function setDraggedElementBackAtPosition() {
//     previousSibling = document.getElementById(currentDraggedElementData.previousNextSiblingId);
//     previousSibling ? previousSibling.before(currentDraggedElementData.element) : document.getElementById(currentDraggedElementData.previousParentId).appendChild(currentDraggedElementData.element);
//     currentDraggedElementData.element.classList.remove("dragged");
//     clearDraggedElement();
// }

document.addEventListener('keyup', function (event) {
    if (event.key === "Escape") {
        editMenu.closeMenu();
        contextMenu.closeMenu();
        setIconWindow(false);
    }
});
//#endregion Document

//#region Tab
class Tab extends HTMLElement {
    constructor() {
        super();
        this.addEventListener('click', handleTabsClick);
        this.addEventListener('dragstart', handleTabDragStart);
        this.addEventListener('dragover', handleTabDragOver);
        this.addEventListener('drop', handleTabDrop);
        this.addEventListener('dragend', handleTabDragEnd);

        this.addEventListener('mouseover', function () {
            this.setAttribute('draggable', editing);
        });
    }
}
customElements.define(FavsCustomElementsName.tags.TAB, Tab);

async function handleTabsClick(event) {
    if (!getAppState())
        await tabsChangeCurrentPage(event);
    else if (editing) {
        // TODO: Open edit menu

        // const compStyle = getComputedStyle(prevElement);
        // prevOrder = compStyle.getPropertyValue("--value");
    } else if (creating) {
        createNewElement(event, FavsCustomElementsName.tags.TAB, 1, "setAsAlbum");
    }
}

function handleTabDragStart(event) {
    if (!editing) return;

    event.currentTarget.classList.add("dragged");
    getElementData(event.currentTarget);
    currentDraggedElementData.previousNextSiblingId = event.currentTarget.nextSibling ? event.currentTarget.nextSibling.getAttribute("data-album") : 0;

    event.stopPropagation();
}

function handleTabDragOver(event) {
    const elementToMove = currentDraggedElementData.element;
    if (currentDraggedElementData.tagName != FavsCustomElementsName.tags.TAB) return;

    const closest = getClosestElement(event, FavsCustomElementsName.tags.TAB);
    if (!closest) return;

    event.preventDefault();
    event.stopPropagation();

    const closestEdge = getClosestEdge(event, closest);
    if (closestEdge === 1 || closestEdge === 4) {
        closest.before(elementToMove);
    } else {
        closest.after(elementToMove);
    }
}

function handleTabDrop(event) {
    const elementToMove = currentDraggedElementData.element;
    if (currentDraggedElementData.tagName != FavsCustomElementsName.tags.TAB) return;

    elementToMove.classList.remove("dragged");

    event.preventDefault();
    event.stopPropagation();

    checkOldParentIfEmpty();

    keepTrackOfChanges(new ElementLog(currentDraggedElementData.element.getAttribute("data-album"), Status.UPDATE, "previous"));
    if (currentDraggedElementData.previousNextSiblingId !== 0)
        keepTrackOfChanges(new ElementLog(document.querySelector("my-tab[data-album='" + currentDraggedElementData.previousNextSiblingId + "']").getAttribute("data-album"), Status.UPDATE, "previous"));
    const nextNewSiblingId = (currentDraggedElementData.element.nextSibling) ? currentDraggedElementData.element.nextSibling.getAttribute("data-album") : 0;
    if (nextNewSiblingId !== 0)
        keepTrackOfChanges(new ElementLog(nextNewSiblingId, Status.UPDATE, "previous"));

    updateStoreEntries(1);
    clearDraggedElement();
}

function handleTabDragEnd(event) {
    if (Object.keys(currentDraggedElementData).length !== 0)
        handleTabDrop(event);
}

async function tabsChangeCurrentPage(event) {
    const albumId = event.target.getAttribute("data-album");
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
//#endregion Tabs

//#region Album
class Album extends HTMLElement {
    constructor() {
        super();
        this.addEventListener('contextmenu', setMenuAlbum);
        this.addEventListener('click', handleAlbumClick);
        this.addEventListener('dragover', handleAlbumDragOver);
        this.addEventListener('drop', handleAlbumDrop);
    }
}
customElements.define(FavsCustomElementsName.tags.ALBUM, Album);

function setMenuAlbum(event) {
    if (!getAppState()) return;

    event.preventDefault();
    event.stopPropagation();

    // create new group

    console.log("custom menu album");
}

function handleAlbumClick(event) {
    if (creating) {
        createNewElement(event, FavsCustomElementsName.tags.GROUP, 5, "setAsGroup");
    }
}

function handleAlbumDragOver(event) {
    const elementToMove = currentDraggedElementData.element;

    event.preventDefault();

    if (currentDraggedElementData.tagName === FavsCustomElementsName.tags.GROUP)
        event.currentTarget.appendChild(elementToMove);
}

function handleAlbumDrop(event) {
    const elementToMove = currentDraggedElementData.element;
    elementToMove.classList.remove("dragged");

    event.preventDefault();
    event.stopPropagation();

    // only for groups
    checkOldParentNotOnlyOneChild();

    if (currentDraggedElementData.tagName === FavsCustomElementsName.tags.STICKER)
        checkOldParentIfEmpty();

    keepTrackDragging();
    updateStoreEntries(1);
    clearDraggedElement();
}

//#endregion Album

//#region Group
class Group extends HTMLElement {
    constructor() {
        super();
        this.addEventListener('contextmenu', setMenuGroup);
        this.addEventListener('click', handleGroupClick);
        this.addEventListener('dragstart', handleGroupDragStart);
        this.addEventListener('dragover', handleGroupDragOver);
        this.addEventListener('drop', handleGroupDrop);
        this.addEventListener('dragend', handleGroupDragEnd);

        this.addEventListener('mouseover', function () {
            this.setAttribute('draggable', editing);
        });
    }
}
customElements.define(FavsCustomElementsName.tags.GROUP, Group);

function setMenuGroup(event) {
    if (!getAppState()) return;

    event.preventDefault();
    event.stopPropagation();

    // edit group
    // create group before
    // create group after
    // create sub-group (insert after)
    // create new sticker at end

    contextMenu.setMenu(event, "group");

    console.log("custom menu group");
}

function handleGroupClick(event) {
    event.stopPropagation();
    if (editing) {
        openEditMenu(event.currentTarget);
        // TODO: Open edit menu

        // const compStyle = getComputedStyle(prevElement);
        // prevOrder = compStyle.getPropertyValue("--value");
    } else if (creating) {
        createNewElement(event, FavsCustomElementsName.tags.STICKER, 5, "text");
    }
}

function handleGroupDragStart(event) {
    if (!editing) return;

    event.currentTarget.classList.add("dragged");
    getElementData(event.currentTarget);

    event.stopPropagation();
}

function handleGroupDragOver(event) {
    const elementToMove = currentDraggedElementData.element;
    if (currentDraggedElementData.tagName != FavsCustomElementsName.tags.STICKER &&
        currentDraggedElementData.tagName != FavsCustomElementsName.tags.GROUP)
        return;

    const closest = getClosestElement(event, FavsCustomElementsName.tags.GROUP);
    if (!closest) return;

    event.preventDefault();
    event.stopPropagation();

    switch (currentDraggedElementData.tagName) {
        case FavsCustomElementsName.tags.STICKER:
            if (!closest.contains(elementToMove)) {
                closest.appendChild(elementToMove);
            }
            break;
        case FavsCustomElementsName.tags.GROUP:
            if (closest.id === currentDraggedElementData.elementId) break;
            assignDraggedGroup(event, closest);
            break;
        default:
            console.error("ERROR Utility-3:\nAn error happened while trying to determine what element type your were trying to drag over a group.");
            break;
    }
}

function handleGroupDrop(event) {
    const elementToMove = currentDraggedElementData.element;
    elementToMove.classList.remove("dragged");

    event.preventDefault();
    event.stopPropagation();

    // only for groups
    checkOldParentNotOnlyOneChild();

    if (currentDraggedElementData.tagName === FavsCustomElementsName.tags.STICKER)
        checkOldParentIfEmpty();

    keepTrackDragging();
    updateStoreEntries(1);
    clearDraggedElement();
}

function handleGroupDragEnd(event) {
    if (Object.keys(currentDraggedElementData).length !== 0)
        handleGroupDrop(event);
}

function assignDraggedGroup(event, closest) {
    // if group has child group, return
    if (closest.querySelector("my-group")) return;

    const parent = closest.parentElement;
    const parentFlexDirection = getComputedStyle(parent).flexDirection;

    const closestEdge = getClosestEdge(event, closest);

    const elementToMove = currentDraggedElementData.element;
    // TODO: Refactoring
    if (parentFlexDirection === "row") {
        const parentIsGroup = parent.tagName.toLowerCase() === FavsCustomElementsName.tags.GROUP;
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

function checkOldParentNotOnlyOneChild() {
    const oldParentId = currentDraggedElementData.previousParentId;
    if (isTruthy(oldParentId) &&
        document.getElementById(oldParentId).children.length <= 1 &&
        currentDraggedElementData.tagName === FavsCustomElementsName.tags.GROUP) {
        keepTrackOfChanges(new ElementLog(oldParentId, Status.DELETE));
        replaceParentByChild(document.getElementById(oldParentId));
    }
}

function replaceParentByChild(element) {
    const childId = element.childNodes[0].id;
    keepTrackOfChanges(new ElementLog(childId, Status.UPDATE, "parent", "previous"));
    const layerLevel = element.getAttribute("layer-level");
    element.replaceWith(...element.childNodes);
    let child = document.getElementById(childId);
    child.setAttribute("layer-level", layerLevel);

}
//#endregion Group

//#region Sticker
class Sticker extends HTMLElement {
    constructor() {
        super();
        this.addEventListener('contextmenu', setMenuSticker);
        this.addEventListener('click', handleStickerClick);
        this.addEventListener('dragstart', handleStickerDragStart);
        this.addEventListener('dragover', handleStickerDragOver);
        this.addEventListener('drop', handleStickerDrop);
        this.addEventListener('dragend', handleStickerDragEnd);

        this.addEventListener('mouseover', function () {
            this.setAttribute('draggable', editing);
        });
    }
}
customElements.define(FavsCustomElementsName.tags.STICKER, Sticker);

function setMenuSticker(event) {
    if (!getAppState()) return;

    event.preventDefault();
    event.stopPropagation();

    // edit sticker
    // create sticker before
    // create sticker after

    contextMenu.setMenu(event, "sticker");

    console.log("set menu sticker");
}

function handleStickerClick(event) {
    event.stopPropagation();
    if (!getAppState()) {
        const href = event.currentTarget.getAttribute("href");
        const target = event.currentTarget.getAttribute("target");

        if (href) {
            window.open(href, target || '_self');
        }
    } else if (editing) {
        openEditMenu(event.currentTarget);
        // TODO: Open edit menu

        // const compStyle = getComputedStyle(prevElement);
        // prevOrder = compStyle.getPropertyValue("--value");
    } else if (creating) {
        createNewElement(event, FavsCustomElementsName.tags.STICKER, 1, "text");
    }
}

function handleStickerDragStart(event) {
    if (!editing) return;

    event.currentTarget.classList.add("dragged");
    getElementData(event.currentTarget);

    event.stopPropagation();
}

function handleStickerDragOver(event) {
    const elementToMove = currentDraggedElementData.element;
    if (currentDraggedElementData.tagName != FavsCustomElementsName.tags.STICKER) return;

    const closest = getClosestElement(event, FavsCustomElementsName.tags.STICKER);
    if (!closest) return;

    event.preventDefault();
    event.stopPropagation();

    const closestEdge = getClosestEdge(event, closest);
    if (closestEdge === 1 || closestEdge === 4) {
        closest.before(elementToMove);
    } else {
        closest.after(elementToMove);
    }
}

function handleStickerDrop(event) {
    const elementToMove = currentDraggedElementData.element;
    if (currentDraggedElementData.tagName != FavsCustomElementsName.tags.STICKER) return;

    elementToMove.classList.remove("dragged");

    event.preventDefault();
    event.stopPropagation();

    checkOldParentIfEmpty();

    keepTrackDragging();
    updateStoreEntries(1);
    clearDraggedElement();
}

function handleStickerDragEnd(event) {
    if (Object.keys(currentDraggedElementData).length !== 0)
        handleStickerDrop(event);
}

function checkOldParentIfEmpty() {
    const oldParent = document.getElementById(currentDraggedElementData.previousParentId);
    if (oldParent.childElementCount <= 0)
        keepTrackOfChanges(new ElementLog(currentDraggedElementData.previousParentId, Status.UPDATE, "setAsGroup"));
}
//#endregion Sticker

/**
 * 
 * @param {Event} event 
 * @param {FavsCustomElementsName.tags} newElement 
 * @param {Number} howToInsert 1 = after (in parent), 2 = before (in parent), 3 = after (parent), before (parent), 5 = in
 * @param {Boolean} isAlbum 
 * @param  {...string} changesToSave 
 */
function createNewElement(event, newElement, howToInsert = 1, ...changesToSave) {
    try {
        const newElem = document.createElement(newElement);
        newElem.id = ++highestElementId;

        const elementType = getElementObjectType(event.currentTarget, event.currentTarget.parent);
        if (howToInsert !== 5) {
            console.log(elementType);
            if (elementType === "album")
                elementTypeFormat["tab"].setData(newElem, new Object({ uuid: newElem.id }));
            else
                elementTypeFormat[elementType].setData(newElem, new Object({ text: "New sticker!" }));
        } else {
            elementTypeFormat[getElementObjectType(newElem, event.currentTarget)].setData(newElem, new Object({ text: "New Sticker!" }));
        }

        // TODO: Refactoring
        if (howToInsert === 1)
            event.currentTarget.after(newElem);
        else if (howToInsert === 2)
            event.currentTarget.before(newElem);
        else if (howToInsert === 3)
            event.currentTarget.parent.after(newElem);
        else if (howToInsert === 4)
            event.currentTarget.parent.before(newElem);
        else if (howToInsert === 5)
            event.currentTarget.append(newElem);

        keepTrackOfChanges(new ElementLog(newElem.id, Status.CREATE, "parent", "previous", ...changesToSave));

        if (newElem.nextElementSibling)
            keepTrackOfChanges(new ElementLog(newElem.nextElementSibling.id, Status.UPDATE, "previous"));

        updateStoreEntries(1);

        if (howToInsert !== 5 && elementType === "album")
            newElem.removeAttribute("id");
    } catch (error) {
        console.error("ERROR Utility-9:\nAn error happened at the creation of a new element: ", error);
    }
}

var currentDraggedElementData = new Object();

function clearDraggedElement() {
    currentDraggedElementData = new Object();
}

function getElementData(element) {
    currentDraggedElementData.element = element;
    currentDraggedElementData.elementId = element.id;
    currentDraggedElementData.previousParentId = element.parentElement.id;
    currentDraggedElementData.tagName = element.tagName.toLowerCase();
    currentDraggedElementData.previousNextSiblingId = element.nextSibling ? element.nextSibling.id : 0;
}

function keepTrackDragging() {
    keepTrackOfChanges(new ElementLog(currentDraggedElementData.elementId, Status.UPDATE, "parent", "previous"));
    if (currentDraggedElementData.previousNextSiblingId !== 0)
        keepTrackOfChanges(new ElementLog(currentDraggedElementData.previousNextSiblingId, Status.UPDATE, "previous"));
    const nextNewSiblingId = (currentDraggedElementData.element.nextSibling) ? currentDraggedElementData.element.nextSibling.id : 0;
    if (nextNewSiblingId !== 0)
        keepTrackOfChanges(new ElementLog(nextNewSiblingId, Status.UPDATE, "previous"));
}

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
        if (obj.propertiesName.length > 0 || obj.status == Status.DELETE)
            elementLogTracking.push(obj);
    }
}

function updatePendingChanges(elements) {
    elements.forEach(e => {
        if (isTruthy(e.id))
            keepTrackOfChanges(new ElementLog(e.id, Status.UPDATE));
    });
}

function showElementLogTracking() {
    console.log("___________Element Log Tracking___________");
    elementLogTracking.forEach(e => {
        console.log(e);
    });
    console.log("___________End of Element Log Tracking___________");
}
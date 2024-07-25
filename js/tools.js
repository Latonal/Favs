/** Generate a uuidv4 */
function uuidv4() {
    return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, c =>
        (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
    );
}

/** Create a new uuid but verify beforehand if it doesn't already exists
 * @param {string} text text preceding the type of id we want to check, like "cat-", "it-"
 * @returns {string} return a uuid in string format */
function getRandomNonUsedUUID(text) {
    while (true) {
        var uuid = uuidv4();
        if (!document.getElementById(text + uuid))
            return uuid;
    }
}

function isTruthy(e) {
    if (e) return true;
    return false;
}

function cleanArrayOfObjects(arr) {
    return arr.filter(obj => {
        return Object.values(obj).some(value => value !== null && value !== undefined && value != '');
    });
}

function conditionsCountTrue(...conditions) {
    return conditions.reduce((count, condition) => (condition ? count + 1 : count), 0);
}

function checkConditionsThreshold(threshold, ...conditions) {
    const trueCount = conditionsCountTrue(...conditions);
    return trueCount >= threshold;
}

function sortAscending(a, b) {
    return a - b;
}

function sortDescending(a, b) {
    return b - a;
}

function getKeyByValue(object, value) {
    return Object.keys(object).find(key => object[key] === value);
}

function objectRemoveEmpty(object) {
    return Object.fromEntries(Object.entries(object).filter(([_, v]) => isTruthy(v)));
}

function objectRemoveEmptyExcept(object, ...exceptions) {
    return Object.fromEntries(Object.entries(object).filter(([_, v]) => isTruthy(v) || exceptions.includes(_)));
}

function getMessageEncoding(str) {
    const encoder = new TextEncoder();
    return encoder.encode(str);
}

function getPosition(e) {
    var posx = 0;
    var posy = 0;

    if (e.pageX || e.pageY) {
        posx = e.pageX;
        posy = e.pageY;
    } else if (e.clientX || e.clientY) {
        posx = e.clienX + document.body.scrollLeft + document.documentElement.scrollLeft;
        posy = e.clientY + document.body.scrollTop + document.documentElement.scrollTop;
    }

    return { x: posx, y: posy };
}

function positionElementRelativeToMouse(elementMousePosition, elementToSetPosition) {
    let clickCoords = getPosition(elementMousePosition);
    let clickCoordsX = clickCoords.x;
    let clickCoordsY = clickCoords.y;

    let menuWidth = elementToSetPosition.offsetWidth + 4;
    let menuHeight = elementToSetPosition.offsetHeight + 4;

    let windowWidth = window.innerWidth;
    let windowHeight = window.innerHeight;

    if (windowWidth - clickCoordsX < menuWidth) {
        elementToSetPosition.style.left = windowWidth - menuWidth + "px";
    } else {
        elementToSetPosition.style.left = clickCoordsX + "px";
    }

    if (windowHeight - clickCoordsY < menuHeight) {
        elementToSetPosition.style.top = windowHeight - menuHeight + "px";
    } else {
        elementToSetPosition.style.top = clickCoordsY + "px";
    }
}
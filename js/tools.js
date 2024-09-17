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

function checkMobile() {
    let check = false;
    (function (a) { if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0, 4))) check = true; })(navigator.userAgent || navigator.vendor || window.opera, 'http://detectmobilebrowser.com/mobile');
    return check;
}

function isLocalStorageAvailable() {
    try {
        localStorage.setItem('test', 'test');
        localStorage.removeItem('test');
        return true;
    } catch (e) {
        return false;
    }
}

function isIndexedDBAvailable() {
    return new Promise((resolve) => {
        if (!window.indexedDB) {
            resolve(false);
        } else {
            resolve(true);
        }
    });
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
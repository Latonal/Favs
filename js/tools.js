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

function getMessageEncoding(str) {
    const encoder = new TextEncoder();
    return encoder.encode(str);
}

function encryptMessage(str) {
    const encoded = getMessageEncoding(str);
    return window.crypto.subtle.encrypt(
        { name: "AES-GCM" },
        localStorageData.key,
        encoded,
    );
}

function decryptMessage(str) {
    return window.crypto.subtle.decrypt(
        { name: "AES-GCM" },
        localStorageData.key,
        str,
    );
}

const cssVariablePrefix = "--";
/**
 * Dissociate variables values from constants values in css
 * @param {HTMLElement} str
 */
function dissociateCss(str) {
    if (!isTruthy(str)) return;
    const rules = str.split(';');

    const values = {};

    rules.forEach(rule => {
        if (!isTruthy(rule)) return;

        let [property, value] = rule.split(":");
        property = property.trim();
        value = value.trim();

        if (property.startsWith('--')) {
            property = property.replace("--", "");
            values[property] = value;
        } else {
            val = property + ":" + value + ";";
            if (isTruthy(values["customcss"])) values["customcss"] += val;
            else values["customcss"] = val;
        }
    });

    return values;
}

/**
 * Return a css string as an object
 * @param {String} str 
 */
function cssStringAsObj(str) {
    if (!isTruthy(str)) return;
    const rules = str.split(';');

    const values = [];

    rules.forEach(rule => {
        if (!isTruthy(rule)) return;
        let [property, value] = rule.split(":");

        values.push({ [property]: value });
    });

    return values;
}

/**
 * Associate css rules to fit in the style attribute
 * @param  {...any} args 
 * @returns 
 */
function associateCss(...args) {
    args = cleanArrayOfObjects(args);
    if (!isTruthy(args)) return;
    var css = "";
    args.forEach(element => {
        if (typeof (element) === "object") {
            let property = Object.getOwnPropertyNames(element);
            if (property == "customcss") css += element[property];
            else css += "--" + property + ":" + element[property] + ";";
        }
    });
    return css;
}
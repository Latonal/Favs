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
class Sticker extends HTMLElement {
    constructor() {
        super();
        this.addEventListener('click', this.handleClick.bind(this));
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
//#endregion CLASSES





//#region TOOLS
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

function isEmpty(e) {
    if ((typeof e === "string" || typeof e === "object")
        && e.length === 0) return true;
    return false;
}

function isDefined(e) {
    if (typeof (e) !== "undefined") return true;
    return false;
}

function cleanArrayOfObjects(arr) {
    return arr.filter(obj => {
        return Object.values(obj).some(value => value !== null && value !== undefined && value != '');
    });
}

const cssVariablePrefix = "--";
/**
 * Dissociate variables values from constants values in css
 * @param {HTMLElement} str
 */
function dissociateCss(str) {
    if (isEmpty(str) || !isDefined(str)) return;
    const rules = str.split(';');

    const values = {};

    rules.forEach(rule => {
        if (isEmpty(rule)) return;

        let [property, value] = rule.split(":");
        property = property.trim();
        value = value.trim();

        if (property.startsWith('--')) {
            property = property.replace("--", "");
            values[property] = value;
        } else {
            val = property + ":" + value + ";";
            if (isDefined(values["customcss"])) values["customcss"] += val;
            else values["customcss"] = val;
        }
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
    if (isEmpty(args)) return;
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
//#endregion TOOLS
/**
 * Any data used outside the playground.
 */
var global = {
    "version": Float32Array, // version is app version not related to db
    "language": "language shortcode [string]",
    "personal-settings": {
        "default-font-size": "32",
        "default-page": "-1", // -1 means last visited, positive number means the page number
        // setting to choose if we generate all pages at start or not
        // setting to choose if we make a loading animation at the start
    }
}

/**
 * [Mandatory] Used to create relation between elements, and
 * allow to create an empty skeleton at the start when loading
 * the page. It will creates empty groups and order them. It'll
 * be filled thank to the `informations` table.
 * 
 * Allow to create an empty skeleton at the start when loading
 * the page. It will creates empty groups and order them.
 * 
 * uuid, parent-uuid, position
 * 
 * [Optional] Any other value is optional and will be used to
 * change elements in the front for the user.
 */
var elements = [
    {
        // mandatory
        "uuid": Number,
        "parent-uuid": null, // parent is empty, it is an album (main container)
        "position": Number,
        // optional
        "name": "name [string]",
        "theme": "theme name [string]",
        "customcss": "css [string]",
    },
    {
        "uuid": Number, // we'll know if it's a group if there is at least a child
        "parent-uuid": Number,
        "position": Number,

        "type": "",
        "theme": "theme name [string]",
        "customcss": "css [string]",
    },
    {
        "uuid": Number, // we'll know if it's a sticker if there is no child
        "parent-uuid": Number,
        "position": Number,

        "text": "text [string]",
        "icon": "iconName [string]",
        "customcss": "css [string]",
    }
]

/**
 * Used to store data about icons.
 */
var icons = {
    "iconName1": "url1 [string]",
    "iconName2": "url2 [string]",
    "iconName3": "svg [string]",
}
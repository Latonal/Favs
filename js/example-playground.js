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
 * Used to create relation between elements, and allow to
 * create an empty skeleton at the start when loading the
 * page. It will creates empty groups and order them. It'll
 * be filled thank to the `informations` table.
 * 
 * Allow to create an empty skeleton at the start when loading
 * the page. It will creates empty groups and order them. It'll
 * be filled thanks to exampleStickersSetup.
 */
var elements = [
    {
        "uuid": Number,
        "parent-uuid": null, // parent is empty, it is an album (main container)
        "position": Number,
    },
    {
        "uuid": Number, // we'll know it's a group later (informations table)
        "parent-uuid": Number,
        "position": Number,
    },
    {
        "uuid": Number,
        "parent-uuid": Number,
        "position": Number,
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

/**
 * Used to store data about the elements.
 */
var informations = [
    {
        "parent-uuid": Number,
        "name": "name [string]",
        "theme": "theme name [string]",
        "customcss": "css [string]",
    },
    {
        "parent-uuid": Number,
        "type": "",
        "theme": "theme name [string]",
        "customcss": "css [string]",
    },
    {
        "parent-uuid": Number,
        "text": "text [string]",
        "icon": "iconName [string]",
        "customcss": "css [string]",
    }
]
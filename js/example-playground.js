/**
 * Allow to create an empty skeleton at the start when loading
 * the page. It will creates empty groups and order them. It'll
 * be filled thanks to exampleStickersSetup.
 */
var exampleGroupSetup = {
    "version": Float32Array,
    "order": {
        "album1": {
            "name": "album1 [string]",
            "icon": "iconName [string]",
            "content": [
                "group-uuid1 [string]",
                "group-uuid2 [string]",
                "group-uuid3 [string]",
                [
                    "a layer of group/group-uuid4 [string]",
                    "group-uuid5 [string]",
                    [
                        "another layer of group/group-uuid6 [string]",
                        "group-uuid7 [string]",
                        [
                            "another layer of group and so on/group-uuid8 [string]",
                            "group-uuid9 [string]"
                        ]
                    ]
                ]
            ]
        },
        "album2": {
            "name": "album2 [string]",
            "icon": "iconName [string]",
            "content": [
                "nothing but album should still exists"
            ]
        }
    }
}

/**
 * Allow to create an empty skeleton of the stickers in each 
 * group. It'll creates empty stickers and order them. Mainly
 * used as a link table.
 */
var exampleStickersSetup = [
    {
        "parent": "group-uuid1 [string]",
        "sticker": "sticker-uuid1 [string]",
        "position": Int8Array
    },
    {
        "parent": "group-uuid1 [string]",
        "sticker": "sticker-uuid2 [string]",
        "position": Int8Array
    }
]

/**
 * Used to store data about icons.
 */
var exampleIcons = {
    "iconName1": "url1 [string]",
    "iconName2": "url2 [string]",
    "iconName3": "svg [string]"
}

/**
 * Contains the data about any element using a uuid.
 */
var exampleInformations = [
    {
        "uuid": "group-uuid1 [string]",
        "customcss": "css [string]"
    },
    {
        "uuid": "sticker-uuid1 [string]",
        "text": "text [string]",
        "icon": "iconName [string]",
        "url": "url [string]",
        "target": Boolean,
        "customcss": "css [string]",
    }
]




// OTHER TAKE
/**
 * Any data used outside the playground
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
 * Used to create relation between elements
 */
var elements = [
    {
        "uuid": "album1 [string]",
        "parent-uuid": null, // parent is empty, it is an album (main container)
    },
    {
        "uuid": "group1 [string]", // we'll know it's a group later (informations table)
        "parent-uuid": "album1 [string]",
    },
    {
        "uuid": "sticker1 [string]",
        "parent-uuid": "group1 [string]",
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
 * Used to store data about the elements
 */
var informations = [
    {
        "parent-uuid": "album1 [string]",
        "informations": {
            "name": "name [string]",
            "theme": "theme name [string]",
            "customcss": "css [string]",
        }
    },
    {
        "parent-uuid": "group1 [string]",
        "informations": {
            "position": Int8Array,
            "type": "",
            "theme": "theme name [string]",
            "customcss": "css [string]",
        }
    },
    {
        "parent-uuid": "sticker1 [string]",
        "informations": {
            "text": "text [string]",
            "icon": "iconName [string]",
            "position": Int8Array,
            "customcss": "css [string]",
        }
    }
]
// position can be used in flex

// https://www.geeksforgeeks.org/enums-in-javascript/
const GroupType = (function () {
    const types = {
        ICON_LIST: 0,
        SUB_LIST: 1,
    };
    return {
        get: function (type_name) {
            return types[type_name];
        }
    }
})();
console.log("Groupe type number:", GroupType.get("ICON_LIST"));
const playgroundDebugging = [
    { uuid: 1, parent: 0, previous: 0, theme: "light", text: "first page" },
    { uuid: 2, parent: 1, previous: 9 },
    { uuid: 3, parent: 2, previous: 5, customcss: "background-color:cadetblue;" },
    { uuid: 4, parent: 3, previous: 0, text: "middle element", img_uuid: 1 },
    { uuid: 19, parent: 3, previous: 4, text: "new tab", img_uuid: 3, href: "https://www.youtube.com/", target: "_blank", customcss: "background-color:green;font-style:oblique;" },
    { uuid: 20, parent: 3, previous: 21, text: "same tab - no target", img_uuid: 1, href: "https://www.youtube.com/" },
    { uuid: 21, parent: 3, previous: 19, text: "same tab - with target", img_uuid: 1, href: "https://www.youtube.com/", target: "_self", customcss: "font-size:25px;font-weight:bold;" },
    { uuid: 5, parent: 2, previous: 0 },
    { uuid: 6, parent: 5, previous: 0, text: "left element" },
    { uuid: 22, parent: 7, previous: 23 },
    { uuid: 7, parent: 2, previous: 3 },
    { uuid: 8, parent: 22, previous: 25, text: "right element" },
    { uuid: 25, parent: 22, previous: 0, text: "column right" },
    { uuid: 23, parent: 7, previous: 0 },
    { uuid: 24, parent: 23, previous: 0, text: "some text below right element" },
    { uuid: 9, parent: 1, previous: 0 },
    { uuid: 10, parent: 9, previous: 0, text: "sticker below" },
    { uuid: 12, parent: 11, previous: 0, text: "another sticker below" },
    { uuid: 32, parent: 1, previous: 2 },
    { uuid: 27, parent: 32, previous: 0 },
    { uuid: 28, parent: 27, previous: 0, text: "middle element", img_uuid: 1 },
    { uuid: 29, parent: 27, previous: 28, text: "new tab", img_uuid: 3, href: "https://www.youtube.com/", target: "_blank", customcss: "background-color:green;font-style:oblique;" },
    { uuid: 30, parent: 27, previous: 31, text: "same tab - no target", img_uuid: 1, href: "https://www.youtube.com/" },
    { uuid: 31, parent: 27, previous: 29, text: "same tab - with target", img_uuid: 1, href: "https://www.youtube.com/", target: "_self", customcss: "font-size:25px;font-weight:bold;" },
    { uuid: 11, parent: 32, previous: 27 },

    { uuid: 13, parent: 0, previous: 1, customcss: "background-color:#708a70;" },
    { uuid: 14, parent: 13, previous: 0 },
    { uuid: 15, parent: 14, previous: 0, text: "some text on the second page" },

    { uuid: 16, parent: 0, previous: 13, customcss: "background-color:#618188;" },
    { uuid: 17, parent: 16, previous: 0 },
    { uuid: 18, parent: 17, previous: 0, text: "some text on the third page" },

    { uuid: 33, parent: 0, previous: 16, customcss: "background-color:#e68181;" }, // empty parent
];
const iconsDebugging = [
    { uuid: 1, name: "options", link: "./img/options.svg", origin: "app" },
    { uuid: 2, name: "blah blah", link: "./img/blahblah", origin: "app" },
]

const playgroundFirst = [

];
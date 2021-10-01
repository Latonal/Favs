/*************************************************************************** SKELETON ***************************************************************************/
/** @type {Boolean} */
var isDraggable = false;


/************************* GENERAL USE *************************/
document.documentElement.setAttribute('lang', navigator.language); // set language depending of navigator's language

/** Get every elements that has class {className}
 * @param {string} className - name of class
 * @returns {HTMLCollectionOf<Element>} return an array with all the results */
function GetPlaygroundElementsByClass(className) {
    return document.getElementById('playground').getElementsByClassName(className);
}

/** Get every elements with tag {tagName}
 * @param {string} tagName - name of tag
 * @returns {HTMLCollectionOf<Element>} return an array with all the results */
function GetPlaygroundTags(tagName) {
    return document.getElementById('playground').getElementsByTagName(tagName);
}

/** TODO */
function GetCurrentPage() { // query
    return new URLSearchParams(window.location.search).get('page') ?? "0";
}

/** Add a css class to enable or disable links
 * @param {Boolean} bool true (disabled) or false (enable) */
function SetEveryLinks(bool) {
    if (bool) document.getElementById('playground').classList.add('link-disabled');
    else document.getElementById('playground').classList.remove('link-disabled');
}

/** Set {animation} to play on {idElem} during {setTime}
 * @param {HTMLElement} idElem id of the element
 * @param {string} animation name of the animation, like "fade-in"/"fade-out"
 * @param {number} setTime time of animation in ms, default 400 */
function Fade(idElem, animation, setTime = 400) {
    idElem.classList.add(animation);
    setTimeout(() => {
        idElem.classList.remove(animation);
    }, setTime);
}

/** Create a new uuid but verify beforehand if it doesn't already exists
 * @param {string} text text preceding the type of id we want to check, like "cat-", "it-"
 * @returns {string} return a uuid in string format
 * @source : https://stackoverflow.com/a/2117523 */
function GetRandomUUID(text) { // text = "cat-", "it-"
    while (true) {
        var uuid = crypto.randomUUID();
        if (!document.getElementById(text + uuid))
            return uuid;
    }
}

/** Verify if {str} is a valid url 
 * @param {URL} url url to check
 * @returns {Boolean} return a boolean
*/
function ValidURL(url) {
    // https://stackoverflow.com/a/5717133
    var pattern = new RegExp('^(https?:\\/\\/)?' + // protocol
        '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // domain name
        '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
        '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
        '(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
        '(\\#[-a-z\\d_]*)?$', 'i'); // fragment locator
    return !!pattern.test(url);
}
/************************* END OF GENERAL USE *************************/


/************************* PLAYGROUND PARSER *************************/
/** Add elements into the DOM thanks to a JSON */
function PlaygroundParser() {
    // TODO : mettre la page sélectionné à la fois : 1 par défault ?url=2 sinon
    // console.log(data);
    var html = '';
    var pg = document.getElementById('playground');
    // console.log(data.playground.length);
    data.playground.forEach(e1 => {
        // Page : content / name
        var v2 = '';
        e1.content.forEach(e2 => {
            var v3 = '';
            e2.categories.forEach(e3 => {
                var v4 = '<div class="add-element" onclick="CreateNewContentMenu(this)";>+</div>';
                if (e3.links) {
                    e3.links.forEach(e4 => {
                        // console.log(e4);
                        var target4 = (e4.target) ? 'target="_blank"' : '';
                        var css4 = (e4.customcss) ? 'style="' + e4.customcss + '"' : '';
                        var icon4 = (ValidURL(e4.icon)) ? './content/img/logo/' + e4.icon : e4.icon;
                        v4 += '<a href="' + e4.url + '" class="item" id="it-' + e4.uuid + '" ' + target4 + ' ' + css4 + '><div class="icon"><img src="' + icon4 + '"></div><p>' + e4.text + '</p></a>'
                    });
                };
                var css3 = (e3.customcss) ? 'style="' + e3.customcss + '"' : '';
                v3 += '<div class="category ' + e3.name + '" id="cat-' + e3.uuid + '" ' + css3 + '>' + v4 + '</div>';
            });
            if (e2.categories.length > 1) {
                v3 = '<div class="group">' + v3 + "</div>";
            }
            v2 += v3;
        });
        html += v2;
    });



    pg.innerHTML += html;
}
/************************* END PLAYGROUND PARSER *************************/


/************************* JSON MODIFICATIONS *************************/
/** Modify the position of an element in the JS Object, here a category inside or outside a group
 * @param {HTMLElement} target element helping to position the main element
 * @param {HTMLElement} toMove main element to move
 * @param {number} val position (top, bottom...) of mouse inside targeted element */
function ModifyGroupPositionJSON(target, toMove, val) {
    var toMoveJSONPos = GetGroupPerId(toMove.id.substring(4));
    var targetJSONPos = GetGroupPerId(target.id.substring(4));

    switch (val) {
        case 1: // bottom
            var cat = { "categories": [data.playground[toMoveJSONPos[0]].content[toMoveJSONPos[1]].categories[toMoveJSONPos[2]]] };
            data.playground[targetJSONPos[0]].content.splice(targetJSONPos[1] + 1, 0, cat);
            toMoveJSONPos[1] = (targetJSONPos[1] < toMoveJSONPos[1]) ? toMoveJSONPos[1] + 1 : toMoveJSONPos[1];
            break;
        case 2: // left
            data.playground[targetJSONPos[0]].content[targetJSONPos[1]].categories.splice(targetJSONPos[2], 0, data.playground[toMoveJSONPos[0]].content[toMoveJSONPos[1]].categories[toMoveJSONPos[2]]);
            if (toMoveJSONPos[2] > targetJSONPos[2]) toMoveJSONPos[2] += 1;
            break;
        case 3: // top
            var cat = { "categories": [data.playground[toMoveJSONPos[0]].content[toMoveJSONPos[1]].categories[toMoveJSONPos[2]]] };
            toMoveJSONPos[1] = (targetJSONPos[1] <= toMoveJSONPos[1]) ? toMoveJSONPos[1] + 1 : toMoveJSONPos[1];
            data.playground[targetJSONPos[0]].content.splice(targetJSONPos[1], 0, cat);
            console.log(data);
            break;
        case 4: // right
            data.playground[targetJSONPos[0]].content[targetJSONPos[1]].categories.splice(targetJSONPos[2] + 1, 0, data.playground[toMoveJSONPos[0]].content[toMoveJSONPos[1]].categories[toMoveJSONPos[2]]);
            break;
        default: // drag cancel
            return;
    }

    if (data.playground[toMoveJSONPos[0]].content[toMoveJSONPos[1]].categories.length <= 1) {
        data.playground[toMoveJSONPos[0]].content.splice(toMoveJSONPos[1], 1);
    }
    else {
        data.playground[toMoveJSONPos[0]].content[toMoveJSONPos[1]].categories.splice(toMoveJSONPos[2], 1);
    }

    console.log(data);
}

/** Find the position of an {id} inside a JSON Object
 * @param {HTMLElement} id id of the element to find
 * @returns {Array<number>} return the position in numbers */
function GetGroupPerId(id) {
    for (let i1 = 0; i1 < data.playground.length; i1++) {
        for (let i2 = 0; i2 < data.playground[i1].content.length; i2++) {
            for (let i3 = 0; i3 < data.playground[i1].content[i2].categories.length; i3++) {
                if (data.playground[i1].content[i2].categories[i3].uuid === id) {
                    return [i1, i2, i3];
                }
            }
        }
    }
}

/************************* END JSON MODIFICATIONS *************************/


/************************* DRAG CATEGORIES *************************/
/** Set the playground to be editable */
function SetEdit() {
    isDraggable = !isDraggable;
    DraggableCatgegories(isDraggable);
}

/** Set every Categories to be draggable
 * @param {Boolean} val true (disabled) or false (enable) */
function DraggableCatgegories(val) {
    var categories = GetPlaygroundElementsByClass('category');
    Array.from(categories).forEach(cat => {
        cat.setAttribute('draggable', val);
        cat.classList.toggle("is-draggable");
        if (val) {
            cat.addEventListener('dragstart', DragStart);
            SetEveryLinks(true);
            SetDragListenerToCategories(); //
        }
        else {
            cat.removeEventListener('dragstart', DragStart);
            SetEveryLinks(false);
            UnsetDragListenerToCategories();
        }
    });
}

/** Set dragged element id to be saved in dataTransfer for later use
 * @param {HTMLElement} e id of the element */
function DragStart(e) {
    e.dataTransfer.setData('text/plain', e.target.id);
}

/** Set events for every class category in playground */
function SetDragListenerToCategories() {
    var categories = GetPlaygroundElementsByClass('category');

    Array.from(categories).forEach(box => {
        box.addEventListener('dragenter', DragEnter);
        box.addEventListener('dragover', DragOver);
        box.addEventListener('dragleave', DragLeave);
        box.addEventListener('drop', Drop);
    });
}

/** Unset events for every class category in playground */
function UnsetDragListenerToCategories() {
    var categories = GetPlaygroundElementsByClass('category');

    Array.from(categories).forEach(box => {
        box.removeEventListener('dragenter', DragEnter);
        box.removeEventListener('dragover', DragOver);
        box.removeEventListener('dragleave', DragLeave);
        box.removeEventListener('drop', Drop);
    });
}

/** Listen when dragged element enter another appropriate element and add css class to target */
function DragEnter(e) {
    e.preventDefault();
    e.currentTarget.classList.add('drag-over'); // 
}

/** Listen when dragged element goes over another appropriate element and add css class to target depending of the position of the dragged element to it */
function DragOver(e) {
    e.preventDefault();
    e.currentTarget.classList.add('drag-over');

    var val = GetPositionInCategory(e);

    switch (val) {
        case 1: // bottom
            SetDragClasses(e, 'drag-bottom');
            break;
        case 2: // left
            SetDragClasses(e, 'drag-left');
            break;
        case 3: // top
            SetDragClasses(e, 'drag-top');
            break;
        case 4: // right
            SetDragClasses(e, 'drag-right');
            break;
        default:
            SetDragClasses(e, null);
            break;
    }
}

/** Listen when dragged element leave another appropriate element and remove css class to target */
function DragLeave(e) {
    e.currentTarget.classList.remove('drag-over'); //
    SetDragClasses(e, null);
}

/** Listen when dragged element is dragged on another appropriate element, then send dragged, target and position to two function, one for the DOM, another for the JSON */
function Drop(e) {
    e.currentTarget.classList.remove('drag-over'); //

    // drop element and data
    const id = e.dataTransfer.getData('text/plain');
    const draggable = document.getElementById(id);

    var val = GetPositionInCategory(e);

    SetCategoryPositionAndGroup(e.currentTarget, draggable, val);
    ModifyGroupPositionJSON(e.currentTarget, draggable, val);

    SetDragClasses(e, null);
    SavePlayground();
}

/** Modify the position of an element in the DOM, here a category inside or outside a group
 * @param {HTMLElement} target element helping to position the main element
 * @param {HTMLElement} toMove main element to move
 * @param {number} val position (top, bottom...) of mouse inside targeted element */
function SetCategoryPositionAndGroup(target, toMove, val) {
    // if OG parent has group
    // // if parent has less or equal to 1 child (2 at this moment)
    // // // want to delete group later
    var draggableHadParent = toMove.parentNode.classList.contains("group");
    // console.log((draggableHadParent) ? "toMove had group parent : " + toMove.parentNode.childNodes.length : "toMove does not have group parent");
    var groupToRemove = null;
    if (draggableHadParent && toMove.parentNode.childNodes.length <= 2) {
        // console.log("DESTROY");
        groupToRemove = toMove.parentNode;
    }
    // if TARGET does not have group
    // // create group
    var targetHasParent = target.parentNode.classList.contains("group");
    // console.log((targetHasParent) ? "Target has group parent : " + target.parentNode.childNodes.length : "Target does not have group parent");
    // if target does not have group parent
    if (!targetHasParent && (val == 2 || val == 4)) {
        var group = document.createElement('div');
        group.classList.add('group');
        target.before(group);
        group.appendChild(target);
    }
    // move
    switch (val) {
        case 1: // bottom
            if (targetHasParent) target = target.parentNode;
            target.after(toMove);
            break;
        case 2: // left
            target.before(toMove);
            break;
        case 3: // top
            if (targetHasParent) target = target.parentNode;
            target.before(toMove);
            break;
        case 4: // right
            target.after(toMove);
            break;
        default: // Drag cancel
            return;
    }
    // delete OG parent group 'later'
    if (groupToRemove != null) {
        if (groupToRemove != target.parentNode) {
            groupToRemove.after(groupToRemove.childNodes[0]);
            groupToRemove.remove();
        }
    }
}

/** Return a value depending of the position of the mouse in the element 
 * @param {HTMLElement} e element to compare to
 * @param {number} offsetX horizontal limit
 * @param {number} offsetY vertical limit
 * @param {Boolean} vertical allow to return vertical values (1 & 3)
 * @param {Boolean} horizontal allow to return horizontal values (2 & 4)
 * @returns {1 | 2 | 3 | 4} return a number between 1 and 4 */
function GetPositionInCategory(e, offsetX = 15, offsetY = 35, vertical = true, horizontal = true) {
    // get size of element
    var x = e.currentTarget.offsetWidth;
    var y = e.currentTarget.offsetHeight;

    // position to place
    var mouseX = e.offsetX;
    var mouseY = e.offsetY;

    // assign value
    if (vertical && mouseY >= y / 100 * (100 - offsetY) && (mouseX > x / 100 * offsetX && mouseX < x / 100 * (100 - offsetX))) return 1; // bottom
    if (horizontal && mouseX <= x / 100 * offsetX) return 2; // left
    if (vertical && mouseY < y / 100 * offsetY && (mouseX > x / 100 * offsetX && mouseX < x / 100 * (100 - offsetX))) return 3; // top
    if (horizontal && mouseX >= x / 100 * (100 - offsetX)) return 4; // right
}

/** Add and remove class depending of class asked to add to element
 * @param {HTMLElement} e element to add classes
 * @param {string} c class to add
 * @ Todo : Optimize function so it takes two arrays : one to set and the other to remove so it can be used in more cases */
function SetDragClasses(e, c) {
    e.currentTarget.classList.add('is-dragged');

    if (c !== 'drag-bottom') e.currentTarget.classList.remove('drag-bottom');
    if (c !== 'drag-left') e.currentTarget.classList.remove('drag-left');
    if (c !== 'drag-top') e.currentTarget.classList.remove('drag-top');
    if (c !== 'drag-right') e.currentTarget.classList.remove('drag-right');

    if (c !== null) e.currentTarget.classList.add(c);
    if (c == null) e.currentTarget.classList.remove('is-dragged');
}
/*************************  END DRAG CATEGORIES *************************/


/************************* CREATE CATEGORIES *************************/
// Don't forget unique ID
/************************* END CREATE CATEGORIES *************************/


/************************* SAVE *************************/
/** TODO */
if (!window.indexedDB) { // If does not support IndexedDB
    data = defaultPlayground();
    console.log("Browser does not support IndexedDB");
    // TODO : else display message asking to upgrade web browser to allow cache
}

var saveCall = 0;
/** Save the current JSON playground each X number of change (hardcoded) */
function SavePlayground() {
    var changeNeeded = 1;
    saveCall++;
    if (saveCall % changeNeeded == 0) {
        console.log("saved");
        SavePlaygroundData();
    }
}
/************************* END SAVE *************************/
/*************************************************************************** END OF SKELETON ***************************************************************************/


var currentId = null;
/** Get position of the mouse and place the item to be on screen depending of its {sizeX} and {sizeY}
 * @param {number} sizeX horizontal size of the item we want to place
 * @param {number} sizeY vertical size of the item we want to place
 * @returns {Array<number>} return an array of number */
function GetPositionOfMouseAndSetPlace(sizeX, sizeY) {
    // position of mouse
    var pageX = window.event.clientX;
    var pageY = window.event.clientY;
    // size of current screen
    var viewport_width = window.innerWidth;
    var viewport_height = window.innerHeight;
    // check if overflow
    if (pageX + sizeX > viewport_width) pageX -= sizeX;
    if (pageY + sizeY > viewport_height) pageY -= sizeY;

    return [pageX, pageY];
}

/** Set the edit menu to be active or not, and execute an animation
 * @param {Boolean} bool true (enabled) or false (disabled)
 * @ Todo : make so we can choose id targeted and animation used */
function SetEditMenu(bool) {
    setTimeout(() => {
        (bool) ? document.getElementById('edit-menu').classList.add('active') : document.getElementById('edit-menu').classList.remove('active');
    }, (bool) ? 0 : 400);
    Fade(document.getElementById('edit-menu'), (bool) ? "fade-in" : "fade-out");
}

/** Create a menu where clicked
 * @param {HTMLElement} e element on which we click */
function CreateNewContentMenu(e) {
    currentId = e.parentNode.id;
    SetEditMenu(true);
    var mousePosition = GetPositionOfMouseAndSetPlace(200, 100);
    document.getElementById('create-content').style["left"] = mousePosition[0] + "px";
    document.getElementById('create-content').style["top"] = mousePosition[1] + "px";
}

/** Create a new empty item, both in the DOM and JSON playground */
function CreateNewItem() {
    console.log(currentId);
    // TODO : if parent has target enabled, set target=_blank
    var uuid = GetRandomUUID("it-");
    document.getElementById(currentId).innerHTML += '<a href="#" class="item" id="it-' + uuid + '"><div class="icon"><img src=""></div><p>NEW!</p></a>';
    var parentJSONPos = GetGroupPerId(currentId.substring(4));
    data.playground[parentJSONPos[0]].content[parentJSONPos[1]].categories[[parentJSONPos[2]]].links.push({ text: "NEW!", url: "#", icon: "", uuid: uuid, customcss: "", target: "" });
    // add to json
    SetEditMenu(false);
    SavePlayground(); // Do not do that in final ver TODO
}
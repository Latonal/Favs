/** @type {Boolean} */
var currentPage = 0;
var isDraggable = false;

//#region General Use
document.documentElement.setAttribute('lang', navigator.language); // set language depending of navigator's language

/** Get every elements that has class {className} and is on page {p}
 * @param {string} p page to search in
 * @param {string} className name of class
 * @returns {HTMLCollectionOf<Element>} return an array with all the results */
function GetPlaygroundElementsByPageAndClass(p, className) {
    return document.getElementById("page-" + p).getElementsByClassName(className);
}

/** Get every elements with tag {tagName}
 * @param {string} tagName - name of tag
 * @returns {HTMLCollectionOf<Element>} return an array with all the results */
function GetPlaygroundTags(tagName) {
    return document.getElementById('playground').getElementsByTagName(tagName);
}

/** Return the current page thanks to query */
function GetCurrentPage() { // query
    return (parseInt(new URLSearchParams(window.location.search).get('page') ?? 0));
    // currentPage ? currentPage : ^;
}

/** Add or remove href on targeted element list
 * @param {Boolean} bool true (disabled) or false (enable) */
function SetEveryLinks(bool) {
    // if (bool) document.getElementById('playground').classList.add('link-disabled');
    // else document.getElementById('playground').classList.remove('link-disabled');

    var items = GetPlaygroundElementsByPageAndClass(GetCurrentPage(), 'item');
    Array.from(items).forEach(it => {
        if (bool) it.removeAttribute("href");
        else it.setAttribute("href", it.dataset.url)
    });
}

const escapeHtml = (unsafe) => {
    // https://stackoverflow.com/a/6234804
    return unsafe.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#039;');
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
function GetRandomUUID(text) {
    while (true) {
        var uuid = crypto.randomUUID();
        if (!document.getElementById(text + uuid))
            return uuid;
    }
}

/** Verify if {url} is a valid url 
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

function GetCategoryParent(e) {
    if (e.currentTarget.classList.contains('category')) return e;
    else if (e.target.classList.contains('item')) return e.target.parentNode;
    else return e.target.parentNode.parentNode;

}

function GetItemParent(e) {
    if (e.currentTarget.classList.contains('item')) return e;
    else return e.target.parentNode;
}
//#endregion General Use


//#region Playground Parser
/** Add elements into the DOM thanks to a JSON */
function PlaygroundParser(page = 0) {
    // TODO : mettre la page sélectionné à la fois : 0 par défault ?url=1 sinon
    // console.log(data);
    console.log("page " + page);
    var html = '';
    var pageId = 0;
    var pg = document.getElementById('playground');
    if (data.toolbarposition[0] != -1 && data.toolbarposition[0] != -1) {
        tb = document.getElementById("toolbar");
        tb.style["right"] = data.toolbarposition[0] + "%";
        tb.style["top"] = data.toolbarposition[1] + "%"
    }
    // console.log(data.playground.length);
    data.playground.forEach(e1 => {
        // Page : content / name
        var v2 = ``;
        e1.content.forEach(e2 => {
            var v3 = ``;
            e2.categories.forEach(e3 => {
                var v4 = `<span class="special-character add-element"><div class="bold" onclick="CreateNewItem(this);">&plus;</div><div onclick="DeleteCategory(this);">&#57569;</div></span>`;
                if (e3.links) {
                    e3.links.forEach(e4 => {
                        // console.log(e4);
                        var theme4 = (e4.theme) ? e4.theme : ``;
                        var css4 = (e4.customcss) ? `style="${e4.customcss}"` : ``;
                        var target4 = (e4.target) ? `target="_blank"` : ``;
                        var icon4 = (ValidURL(e4.icon)) ? `./content/img/logo/${e4.icon}` : e4.icon;
                        /* TODO : Url display href if content url */
                        v4 += `<a href="${e4.url}" class="item ${theme4}" id="it-${e4.uuid}" data-url="${e4.url}" ${css4} ${target4}><span class="special-character add-element"><div onclick="DeleteItem(this);">&#57569;</div></span><div class="icon"><img src="${icon4}" alt="${e4.icon}"></div><p>${e4.text}</p></a>`;
                    });
                };
                var css3 = (e3.customcss) ? `style="${e3.customcss}"` : ``;
                v3 += `<div class="category ${e3.name} ${e3.theme}" id="cat-${e3.uuid}" ${css3}>${v4}</div>`;
            });
            if (e2.categories.length > 1) {
                v3 = `<div class="group">${v3}</div>`;
            }
            v2 += v3;
        });
        var theme1 = (e1.theme) ? `class="${e1.theme}"` : ``;
        html += `<div id="page-${pageId}" ${theme1}>${v2}</div>`;
        pageId++;
    });

    pg.innerHTML += html;
}
//#endregion Playground Parser


//#region JSON Changes
/** Modify the position of an element in the JS Object, here a category inside or outside a group
 * @param {HTMLElement} target element helping to position the main element
 * @param {HTMLElement} toMove main element to move
 * @param {number} val position (top, bottom...) of mouse inside targeted element */
function ModifyGroupPositionJSON(target, toMove, val) {
    var targetJSONPos = GetGroupPerId(target.id.substring(4));
    var toMoveJSONPos = GetGroupPerId(toMove.id.substring(4));

    switch (val) {
        case 1: // top
            var cat = { "categories": [data.playground[toMoveJSONPos[0]].content[toMoveJSONPos[1]].categories[toMoveJSONPos[2]]] };
            toMoveJSONPos[1] = (targetJSONPos[1] <= toMoveJSONPos[1]) ? toMoveJSONPos[1] + 1 : toMoveJSONPos[1];
            data.playground[targetJSONPos[0]].content.splice(targetJSONPos[1], 0, cat);
            // console.log(data);
            break;
        case 2: // right
            data.playground[targetJSONPos[0]].content[targetJSONPos[1]].categories.splice(targetJSONPos[2] + 1, 0, data.playground[toMoveJSONPos[0]].content[toMoveJSONPos[1]].categories[toMoveJSONPos[2]]);
            break;
        case 3: // bottom
            var cat = { "categories": [data.playground[toMoveJSONPos[0]].content[toMoveJSONPos[1]].categories[toMoveJSONPos[2]]] };
            data.playground[targetJSONPos[0]].content.splice(targetJSONPos[1] + 1, 0, cat);
            toMoveJSONPos[1] = (targetJSONPos[1] < toMoveJSONPos[1]) ? toMoveJSONPos[1] + 1 : toMoveJSONPos[1];
            break;
        case 4: // left
            data.playground[targetJSONPos[0]].content[targetJSONPos[1]].categories.splice(targetJSONPos[2], 0, data.playground[toMoveJSONPos[0]].content[toMoveJSONPos[1]].categories[toMoveJSONPos[2]]);
            if (toMoveJSONPos[1] == targetJSONPos[1] && toMoveJSONPos[2] > targetJSONPos[2]) toMoveJSONPos[2] += 1;
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
}

/** Find the position of a category {id} inside a JSON Object
 * @param {HTMLElement} id id of the category to find
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

/** Find the position of an item {id} inside a JSON Object
 * @param {HTMLElement} id id of the category to find
 * @param {Array<number>} idList list of the category to check in the JSON element, use GetGroupPerId() to get this list
 * @returns {Array<number>} return the position in numbers */
function GetItemPerId(id, idList) {
    for (let i = 0; i < data.playground[idList[0]].content[idList[1]].categories[idList[2]].links.length; i++) {
        if (data.playground[idList[0]].content[idList[1]].categories[idList[2]].links[i].uuid == id) return [idList[0], idList[1], idList[2], i];
    }
}

function ModifyItemPositionJSON(target, toMove, val) {
    var targetJSONPos = (val == 0) ? GetGroupPerId(target.id.substring(4)) : GetItemPerId(target.id.substring(3), GetGroupPerId(target.parentNode.id.substring(4)));
    var toMoveJSONPos = GetItemPerId(toMove.id.substring(3), GetGroupPerId(toMove.parentNode.id.substring(4)));

    switch (val) {
        case 0: // last position
            data.playground[targetJSONPos[0]].content[targetJSONPos[1]].categories[targetJSONPos[2]].links.push(data.playground[toMoveJSONPos[0]].content[toMoveJSONPos[1]].categories[toMoveJSONPos[2]].links[toMoveJSONPos[3]]);
            data.playground[toMoveJSONPos[0]].content[toMoveJSONPos[1]].categories[toMoveJSONPos[2]].links.splice(toMoveJSONPos[3], 1);
            break;
        case 1: // top
        case 4: // put before [target]
            data.playground[targetJSONPos[0]].content[targetJSONPos[1]].categories[targetJSONPos[2]].links.splice(targetJSONPos[3], 0, data.playground[toMoveJSONPos[0]].content[toMoveJSONPos[1]].categories[toMoveJSONPos[2]].links[toMoveJSONPos[3]]);
            if (data.playground[targetJSONPos[0]].content[targetJSONPos[1]].categories[targetJSONPos[2]].uuid == data.playground[toMoveJSONPos[0]].content[toMoveJSONPos[1]].categories[toMoveJSONPos[2]].uuid && toMoveJSONPos[3] > targetJSONPos[3]) toMoveJSONPos[3] += 1;
            data.playground[toMoveJSONPos[0]].content[toMoveJSONPos[1]].categories[toMoveJSONPos[2]].links.splice(toMoveJSONPos[3], 1);
            break;
        case 3: // bottom
        case 2: // put after [target]
            data.playground[targetJSONPos[0]].content[targetJSONPos[1]].categories[targetJSONPos[2]].links.splice(targetJSONPos[3] + 1, 0, data.playground[toMoveJSONPos[0]].content[toMoveJSONPos[1]].categories[toMoveJSONPos[2]].links[toMoveJSONPos[3]]);
            if (data.playground[targetJSONPos[0]].content[targetJSONPos[1]].categories[targetJSONPos[2]].uuid == data.playground[toMoveJSONPos[0]].content[toMoveJSONPos[1]].categories[toMoveJSONPos[2]].uuid && toMoveJSONPos[3] > targetJSONPos[3]) toMoveJSONPos[3] += 1;
            data.playground[toMoveJSONPos[0]].content[toMoveJSONPos[1]].categories[toMoveJSONPos[2]].links.splice(toMoveJSONPos[3], 1);
            break;
        default: 
            break;
    }
}
//#endregion JSON Changes


//#region Drag Categories
/** Set the playground to be editable */
var elemDragged = 0; // what kind of element is dragged, a category, an item ?
function SetEdit() {
    isDraggable = !isDraggable;
    DraggableCategories(isDraggable);
    DraggableItems(isDraggable);
    document.getElementById("create-category").classList.toggle("active");
    Fade(document.getElementById("create-category"), (isDraggable) ? "fade-in" : "fade-out");
}

/** Set every Categories to be draggable
 * @param {Boolean} val true (enable) or false (disable) */
function DraggableCategories(val) {
    var categories = GetPlaygroundElementsByPageAndClass(GetCurrentPage(), 'category');
    Array.from(categories).forEach(cat => {
        cat.setAttribute('draggable', val);
        cat.classList.toggle("is-draggable");
        if (val) {
            InstantiateCategoryEvents(cat);
        }
        else {
            cat.removeEventListener('click', OpenEditMenuCategories);
            cat.removeEventListener('dragstart', DragStartCategories);
            cat.removeEventListener('dragenter', DragEnterCategories);
            cat.removeEventListener('dragover', DragOverCategories);
            cat.removeEventListener('dragleave', DragLeaveCategories);
            cat.removeEventListener('drop', DropCategories);
        }
    });
}

function InstantiateCategoryEvents(cat) {
    cat.addEventListener('click', OpenEditMenuCategories);
    cat.addEventListener('dragstart', DragStartCategories);
    cat.addEventListener('dragenter', DragEnterCategories);
    cat.addEventListener('dragover', DragOverCategories);
    cat.addEventListener('dragleave', DragLeaveCategories);
    cat.addEventListener('drop', DropCategories);
}

/** Set dragged element id to be saved in dataTransfer for later use
 * @param {HTMLElement} e id of the element */
function DragStartCategories(e) {
    if (e.target.classList.contains("item")) return;
    elemDragged = 1;
    e.dataTransfer.setData('text/plain', e.target.id);
}

/** Listen when dragged element enter another appropriate element and add css class to target */
function DragEnterCategories(e) {
    e.preventDefault();
    switch (elemDragged) {
        case 1:
            e.currentTarget.classList.add('drag-over'); // 
            break;
        case 2:
            e.currentTarget.classList.add('drag-item');
            break;
        default:
            return;
    }
}

/** Listen when dragged element goes over another appropriate element and add css class to target depending of the position of the dragged element to it */
function DragOverCategories(e) {
    e.preventDefault();
    e.currentTarget.classList.add('drag-over');
    
    e = GetCategoryParent(e);    
    // console.log(val);
    switch (elemDragged) {
        case 1:
            var val = GetPositionInElement(e);
            SetDragClass(e, val);
            break;
        case 2:
            e.currentTarget.classList.add('drag-item');
            break;
        default:
            break;
    }
}

/** Listen when dragged element leave another appropriate element and remove css class to target */
function DragLeaveCategories(e) {
    e = GetCategoryParent(e);

    e.currentTarget.classList.remove('drag-over');
    switch (elemDragged) {
        case 1:
            break;
        case 2:
            e.currentTarget.classList.remove('drag-item');
            break;
        default:
            return;
    }
    SetDragClasses(e, null);
}

/** Listen when dragged element is dragged on another appropriate element, then send dragged, target and position to two function, one for the DOM, another for the JSON */
function DropCategories(e) {
    let id;
    let draggable;
    e.currentTarget.classList.remove('drag-over');
    SetDragClasses(e, null);

    switch (elemDragged) {
        case 1:
            // drop element and data
            id = e.dataTransfer.getData('text/plain');
            draggable = document.getElementById(id);
        
            var val = GetPositionInElement(e);
        
            if (e.currentTarget == draggable && (val == 4 || val == 2)) return;
            ModifyGroupPositionJSON(e.currentTarget, draggable, val);
            SetCategoryPositionAndGroup(e.currentTarget, draggable, val);

            SavePlayground();
            break;
        case 2:
            e.currentTarget.classList.remove('drag-item');

            // console.log(GetPositionInElement(e));
            
            id = e.dataTransfer.getData('text/plain');
            draggable = document.getElementById(id);

            // Set item on last position of the json
            ModifyItemPositionJSON(e.currentTarget, draggable, 0);

            // Modify DOM
            e.currentTarget.append(draggable);
            SavePlayground();
            break;
        default:
            return;
    }
    elemDragged = 0;
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
    var groupToRemove = null;
    if (draggableHadParent && toMove.parentNode.childNodes.length <= 2) {
        groupToRemove = toMove.parentNode;
    }
    // if TARGET does not have group
    // // create group
    var targetHasParent = target.parentNode.classList.contains("group");
    // if target does not have group parent
    if (!targetHasParent && (val == 2 || val == 4)) {
        var group = document.createElement('div');
        group.classList.add('group');
        target.before(group);
        group.appendChild(target);
    }
    // move
    switch (val) {
        case 1: // top
            if (targetHasParent) target = target.parentNode;
            target.before(toMove);
            break;
        case 2: // right
            target.after(toMove);
            break;
        case 3: // bottom
            if (targetHasParent) target = target.parentNode;
            target.after(toMove);
            break;
        case 4: // left
            target.before(toMove);
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
function GetPositionInElement(e, offsetX = 15, offsetY = 35, vertical = true, horizontal = true) {
    // get size of element
    var sizeX = e.currentTarget.offsetWidth;
    var sizeY = e.currentTarget.offsetHeight;

    // position to place
    var mousePos = GetMousePositionInElement(e);
    var mouseX = mousePos[0];
    var mouseY = mousePos[1];

    // assign value
    calcX = mouseX / sizeX * 100;
    calcY = mouseY / sizeY * 100;

    if (vertical && calcY < offsetY && calcX > offsetX && calcX < (100 - offsetX)) return 1; // top
    else if (horizontal && calcX > (100 - offsetX)) return 2; // right
    else if (vertical && calcY >= (100 - offsetY) && calcX > offsetX && calcX < (100 - offsetX)) return 3; // bottom
    else if (horizontal && calcX < offsetX) return 4; // left
    else return 0;
}

function GetMousePositionInElement(e) {
    // https://stackoverflow.com/a/42111623
    var rect = e.currentTarget.getBoundingClientRect();
    var x = e.clientX - rect.left;
    var y = e.clientY - rect.top;
    return [x,y];
}

function SetDragClass(e, val) {
    switch (val) {
        case 1: // top
            SetDragClasses(e, 'drag-top');
            break;
        case 2: // right
            SetDragClasses(e, 'drag-right');
            break;
        case 3: // bottom
            SetDragClasses(e, 'drag-bottom');
            break;
        case 4: // left
            SetDragClasses(e, 'drag-left');
            break;
        default:
            SetDragClasses(e, null);
            break;
    }
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
// TODO : is-dragged is set on the hovered component, not the dragged one

function OpenEditMenuCategories(e) {
    if (e.currentTarget !== e.target) return;
    currentGroupId = e.currentTarget.id;
    SetElement(true, 'edit-menu');
    document.getElementById("edit-menu").classList.add("type-cat");
    document.getElementById("edit-menu").classList.remove("type-it");
    document.getElementById("edit-element-css").getElementsByTagName("textarea")[0].value = document.getElementById(currentGroupId).style.cssText;
    if (document.getElementById(currentGroupId).classList.contains("icon-list")) document.getElementById("edit-element-category-type").value = "icon-list";
    else if (document.getElementById(currentGroupId).classList.contains("sub-list")) document.getElementById("edit-element-category-type").value = "sub-list";
}

function EditCSS(e) {
    id = (!!currentItemId) ? currentItemId : currentGroupId;
    document.getElementById(id).style.cssText = document.getElementById("edit-element-css").getElementsByTagName("textarea")[0].value;
}
//#endregion Drag Categories


//#region Drag Items
function DraggableItems(val) {
    var items = GetPlaygroundElementsByPageAndClass(GetCurrentPage(), 'item');
    Array.from(items).forEach(it => {
        // console.log(it);
        it.setAttribute('draggable', val);
        if (val) {
            InstantiateItemEvents(it);
        }
        else {
            it.setAttribute("href", it.dataset.url)
            it.removeEventListener('click', OpenEditMenuItems);
            it.removeEventListener('dragstart', DragStartItems);
            it.removeEventListener('dragenter', DragEnterItems);
            it.removeEventListener('dragover', DragOverItems);
            it.removeEventListener('dragleave', DragLeaveItems);
            it.removeEventListener('drop', DropItems);
        }        
    });
}

/** Put event on element to answer to click and drag
 * @param {HTMLElement} it element to put event on */
 function InstantiateItemEvents(it) {
    it.removeAttribute("href");
    it.addEventListener('click', OpenEditMenuItems);
    it.addEventListener('dragstart', DragStartItems);
    it.addEventListener('dragenter', DragEnterItems);
    it.addEventListener('dragover', DragOverItems);
    it.addEventListener('dragleave', DragLeaveItems);
    it.addEventListener('drop', DropItems);
}

function DragStartItems(e) {
    elemDragged = 2;
    e.dataTransfer.setData('text/plain', e.currentTarget.id);
}

function DragEnterItems(e) {
    switch (elemDragged) {
        case 1:
            // e.currentTarget.parentNode.classList.add('drag-over');
            break;
        case 2:
            // e.currentTarget.parentNode.classList.add('drag-item');
            // target parent element to add drag-item
            // target element to add drag-left, right, etc
            break;
        default:
            break;
    }
}

function DragOverItems(e) {
    e.preventDefault();
    switch (elemDragged) {
        case 1:
            break;
        case 2:
            e = GetItemParent(e);
            var val = GetPositionInElement(e, 0, 50, true, false);
            SetDragClass(e, val);
            break;
        default:
            break;
    }
    // e.currentTarget.parentNode.classList.add('drag-over');
    // e.currentTarget.parentNode.classList.add('drag-item');
}
var madeByLatonal = true;

function DragLeaveItems(e) {
    // e.currentTarget.parentNode.classList.remove('drag-over');
    // e.currentTarget.parentNode.classList.remove('drag-item');
    switch (elemDragged) {
        case 1:
            break;
        case 2: 
            e = GetItemParent(e);
            SetDragClasses(e, null);
            break;
        default:
            break;
    }
}

function DropItems(e) {
    switch (elemDragged) {
        case 1:
            break;
        case 2: 
            e = GetItemParent(e);
            SetDragClasses(e, null);
            e.currentTarget.parentNode.classList.remove('drag-item');

            id = e.dataTransfer.getData('text/plain');
            draggable = document.getElementById(id);

            // set item corresponding to its place in the json
            var val = GetPositionInElement(e, 0, 50, true, false);
            ModifyItemPositionJSON(e.currentTarget, draggable, val);
            switch (val) {
                case 1:
                case 4:
                    e.currentTarget.before(draggable);
                    break;
                case 2:
                case 3:
                    e.currentTarget.after(draggable);
                    break;
                default:
                    break;
            }
            SavePlayground();
            break;
        default:
            break;
    }
    elemDragged = 0;
}
//#endregion Drag Items

function ChangeCategoryType(val) {
    // console.log(val);
    document.getElementById(currentGroupId).classList.remove("icon-list");
    document.getElementById(currentGroupId).classList.remove("sub-list");
    document.getElementById(currentGroupId).classList.add(val);
    var parentJSONPos = GetGroupPerId(currentGroupId.substring(4));
    data.playground[parentJSONPos[0]].content[parentJSONPos[1]].categories[parentJSONPos[2]].name = val;
}

//#region Delete Item and Categories
function DeleteCategory(e) {
    if (e.parentNode.parentNode.classList.contains("category")) {
        var parentJSONPos = GetGroupPerId(e.parentNode.parentNode.id.substring(4));
        if (e.parentNode.parentNode.parentNode.classList.contains("group")) {
            data.playground[parentJSONPos[0]].content[parentJSONPos[1]].categories.splice(parentJSONPos[2], 1);
            if (data.playground[parentJSONPos[0]].content[parentJSONPos[1]].categories.length <= 1) {
                divParent = e.parentNode.parentNode.parentNode;
                e.parentNode.parentNode.remove();
                divParent.before(divParent.childNodes[0]);
                divParent.remove();
            }
            else e.parentNode.parentNode.remove();
        }
        else {
            e.parentNode.parentNode.remove();
            data.playground[parentJSONPos[0]].content.splice(parentJSONPos[1], 1);
        }
        SavePlayground();
    }
}

function DeleteItem(e) {
    itemJSONPos = GetItemPerId(e.parentNode.parentNode.id.substring(3), GetGroupPerId(e.parentNode.parentNode.parentNode.id.substring(4)));
    data.playground[itemJSONPos[0]].content[itemJSONPos[1]].categories[itemJSONPos[2]].links.splice(itemJSONPos[3], 1);
    e.parentNode.parentNode.remove();
    SavePlayground();
}
//#endregion Delete Item and Categories

//#region Edit Items
/** Open edit menu and set inner element to correspond to element clicked on */
function OpenEditMenuItems(e) {
    if (e.target.parentNode.classList.contains("add-element")) return;
    document.getElementById("edit-menu").classList.add("type-it");
    document.getElementById("edit-menu").classList.remove("type-cat");
    SetElement(true, 'edit-menu');
    currentItemId = this.id;
    currentGroupId = this.parentNode.id;
    document.getElementById("edit-element-text").value = document.getElementById(currentItemId).getElementsByTagName("p")[0].innerText;
    document.getElementById("edit-element-url").value = document.getElementById(currentItemId).dataset.url;
    document.getElementById("edit-element-target").checked = (document.getElementById(currentItemId).attributes.target) ? true : false;
    document.getElementById("edit-element-image").getElementsByTagName("img")[0].src = document.getElementById(currentItemId).getElementsByTagName("img")[0].src;
    document.getElementById("edit-element-image").getElementsByTagName("img")[0].alt = document.getElementById(currentItemId).getElementsByTagName("img")[0].alt;
    document.getElementById("edit-element-css").getElementsByTagName("textarea")[0].value = document.getElementById(currentItemId).style.cssText;
}

function CloseEditMenu() {
    SetElement(false, 'edit-menu');
    if (document.getElementById('edit-image').classList.contains("active")) SetElement(false, 'edit-image');
    
    elementJSONPos = (!!currentItemId) ? GetItemPerId(currentItemId.substring(3), GetGroupPerId(currentGroupId.substring(4))) : GetGroupPerId(currentGroupId.substring(4));
    id = (!!currentItemId) ? currentItemId : currentGroupId;

    if (!!currentItemId) {
        data.playground[elementJSONPos[0]].content[elementJSONPos[1]].categories[elementJSONPos[2]].links[elementJSONPos[3]].customcss =escapeHtml(document.getElementById(id).style.cssText);
    }
    else if (!!currentGroupId) {
        data.playground[elementJSONPos[0]].content[elementJSONPos[1]].categories[elementJSONPos[2]].customcss = escapeHtml(document.getElementById(id).style.cssText);
    }

    currentItemId = "";
    currentGroupId = "";
    SavePlayground();
}

/** Put text into the DOM element calling the function
 * @param {String} val text to put */
function EditChangeText(val) {
    document.getElementById(currentItemId).getElementsByTagName("p")[0].innerText = val;
}

/** Put text into a JSON Object
 * @param {String} val text to put */
function EditAddTextToJson(val) {
    itemJSONPos = GetItemPerId(currentItemId.substring(3), GetGroupPerId(currentGroupId.substring(4)));
    data.playground[itemJSONPos[0]].content[itemJSONPos[1]].categories[itemJSONPos[2]].links[itemJSONPos[3]].text = escapeHtml(val);
}

/** Put url into the DOM element calling the function
 * @param {String} val url to put */
function EditChangeUrl(val) {
    document.getElementById(currentItemId).dataset.url = val;
}

/** Put url into a JSON object
 * @param {String} val url to put */
function EditAddUrlToJson(val) {
    itemJSONPos = GetItemPerId(currentItemId.substring(3), GetGroupPerId(currentGroupId.substring(4)));
    data.playground[itemJSONPos[0]].content[itemJSONPos[1]].categories[itemJSONPos[2]].links[itemJSONPos[3]].url = escapeHtml(val);
}

/** Put checkbox value into a JSON object
 * @param {*} val value to put */
function EditAddTargetToJson(val) {
    (val) ? document.getElementById(currentItemId).target = "_blank" : document.getElementById(currentItemId).target = "";
    itemJSONPos = GetItemPerId(currentItemId.substring(3), GetGroupPerId(currentGroupId.substring(4)));
    data.playground[itemJSONPos[0]].content[itemJSONPos[1]].categories[itemJSONPos[2]].links[itemJSONPos[3]].target = val;
}
//#endregion Edit Items


//#region Toolbar
// https://devdojo.com/tnylea/how-to-drag-an-element-using-javascript
toolbar = document.getElementById("move-toolbar");
let toolbarNewPosX = 0, toolbarNewPosY = 0, toolbarStartPosX = 0, toolbarStartPosY = 0;
toolbar.addEventListener('mousedown', function (e) {
    e.preventDefault();

    toolbarStartPosX = e.clientX;
    toolbarStartPosY = e.clientY;

    document.addEventListener('mousemove', ToolbarMouseMove);
    document.addEventListener('mouseup', ToolbarMouseUp);
});
function ToolbarMouseMove(e) {
    var mousePosition = GetPositionOfMouseAndSetPlace(35, 24, 1);
    toolbar.parentNode.style["right"] = mousePosition[0] + "%";
    toolbar.parentNode.style["top"] = mousePosition[1] + "%";
    data.toolbarposition = mousePosition;
}
function ToolbarMouseUp(e) {
    document.removeEventListener('mousemove', ToolbarMouseMove);
    SavePlayground();
    document.removeEventListener('mouseup', ToolbarMouseUp);
}
//#endregion Toolbar


/************************* CREATE CATEGORIES *************************/
// Don't forget unique ID
/************************* END CREATE CATEGORIES *************************/


//#region Save
/************************* SAVE *************************/
/** TODO */
if (!window.indexedDB) { // If does not support IndexedDB
    data = defaultPlayground();
    console.log("Browser does not support IndexedDB");
    // TODO : else display message asking to upgrade web browser to allow cache
}
else {
    InstantiateDB();
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
//#endregion Save


var currentGroupId = null;
var currentItemId = null;
/** Get position of the mouse and place the item to be on screen depending of its {sizeX} and {sizeY} and return a percentage if needed
 * @param {number} sizeX horizontal size of the item we want to place
 * @param {number} sizeY vertical size of the item we want to place
 * @param {any} percent any value (except null or undefined) to get the value in percent
 * @returns {Array<number>} return an array of number */
function GetPositionOfMouseAndSetPlace(sizeX, sizeY, percent = null) {
    // size of current screen usable
    var screenX = document.documentElement.clientWidth;
    var screenY = document.documentElement.clientHeight;
    // position of mouse
    var mouseY = window.event.clientY;
    // set left width position to right width position so resize of screen don't mess up its position
    var mouseX = window.event.clientX;
    if (mouseX < 0) mouseX = 0;
    if (mouseY < 0) mouseY = 0;
    if (mouseX > screenX - sizeX - 5) mouseX = screenX - sizeX - 5;
    if (mouseY > screenY - sizeY) mouseY = screenY - sizeY;
    // Set mouseX on right instead of left
    mouseX = screenX - mouseX - sizeX;
    // if percent
    if (percent) {
        mouseX = (mouseX / screenX) * 100;
        mouseY = (mouseY / screenY) * 100;
    }
    return [mouseX, mouseY];
}

/** Set the element to be active or not, and execute an animation
 * @param {Boolean} bool true (enabled) or false (disabled)
 * @param {String} c class targeted
 * @ Todo : make so we can choose id targeted and animation used */
function SetElement(bool, c) {
    setTimeout(() => {
        (bool) ? document.getElementById(c).classList.add('active') : document.getElementById(c).classList.remove('active');
    }, (bool) ? 0 : 400);
    Fade(document.getElementById(c), (bool) ? "fade-in" : "fade-out");
}

/** Create a new empty item, both in the DOM and JSON playground */
function CreateNewItem(e) {
    // TODO : if parent has target enabled, set target="_blank"
    currentGroupId = e.parentNode.parentNode.id;
    var uuid = GetRandomUUID("it-");
    document.getElementById('generating').innerHTML += `<a class="item" id="it-${uuid}" href="#" data-url="#" draggable="true"><span class="special-character add-element"><div onclick="DeleteItem(this);">&#57569;</div></span><div class="icon"><img src=""></div><p>NEW!</p></a>`;
    document.getElementById(currentGroupId).lastChild.after(document.getElementById("it-" + uuid));
    InstantiateItemEvents(document.getElementById("it-" + uuid));
    var parentJSONPos = GetGroupPerId(currentGroupId.substring(4));
    data.playground[parentJSONPos[0]].content[parentJSONPos[1]].categories[[parentJSONPos[2]]].links.push({ text: "NEW!", url: "#", icon: "", uuid: uuid, theme: "", customcss: "", target: false });
    SavePlayground();
    currentGroupId = "";
}
/** Show Choose Image menu */
function OpenChooseImageMenu() {
    SetElement(true, 'edit-image');
    // for (i = 0; i < icon.playground.original.length; i++) {
    //     console.log(icon.playground.original[i]);
    // }
    let generating = document.getElementById('generating');
    let edit = document.getElementById('edit-image').getElementsByClassName('content')[0];
    for(i in icon.playground.original) {
        let id = i.replace(' ', '-');
        // console.log(id);
        generating.innerHTML += '<div id="o-' + id + '" class="item" data-image="' + icon.playground.original[i] + '" onclick="ChooseImage(this);"><div class="icon"><img src="./content/img/logo/' + icon.playground.original[i] + '" alt="' + i + ' icon"></div><p>' + i + '</p></div>';
        edit.lastChild.after(document.getElementById('o-'+id));
    }
}

function ChooseImage(e) {
    // if (e.dataset.image == "null") e.dataset.image = "";
    document.getElementById(currentItemId).getElementsByTagName('img')[0].src = (ValidURL(e.dataset.image)) ? './content/img/logo/' + e.dataset.image : e.dataset.image;
    itemJSONPos = GetItemPerId(currentItemId.substring(3), GetGroupPerId(currentGroupId.substring(4)));
    data.playground[itemJSONPos[0]].content[itemJSONPos[1]].categories[itemJSONPos[2]].links[itemJSONPos[3]].icon = e.dataset.image;
    document.getElementById("edit-element-image").getElementsByTagName("img")[0].src = (ValidURL(e.dataset.image)) ? './content/img/logo/' + e.dataset.image : e.dataset.image;
    document.getElementById("edit-element-image").getElementsByTagName("img")[0].alt = e.dataset.image;
    document.getElementById(currentItemId).getElementsByTagName('img')[0].alt = e.dataset.image;
    document.getElementById("edit-element-image").getElementsByTagName("p")[0].innerText = (!!e.dataset.image) ? e.dataset.image : "No image";
}

function CreateCategory() {
    var uuid = GetRandomUUID("cat-");
    document.getElementById('generating').innerHTML += `<div class="category icon-list is-draggable" id="cat-${uuid}" draggable="true"><span class="special-character add-element"><div class="bold" onclick="CreateNewItem(this);">&plus;</div><div onclick="DeleteCategory(this);">&#57569;</div></span></div>`;
    document.getElementById("page-"+GetCurrentPage()).lastChild.after(document.getElementById("cat-"+uuid));
    InstantiateCategoryEvents(document.getElementById("cat-"+uuid));
    data.playground[GetCurrentPage()].content.push({categories: [{"name":"icon-list", "uuid":uuid, "theme":"", "customcss":"", "target":true,"links":[]}]});
    SavePlayground();
}

function ChooseCategory() {
    // choose category type, icon-list or sub-list
}

/************************* CREATE TODO *************************/
function ChangePage(page) {
    // check if page already exists
}
/************************* END OF TODO *************************/
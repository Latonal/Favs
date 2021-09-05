isDraggable = false;
// idCount = GetCategories().length; // Ou Unique ID // Ou Incrément


/************************* GENERAL USE *************************/
function GetCategories() {
    // Get every categories
    return document.getElementById('playground').getElementsByClassName('category');
}

function GetEmptyBoxes() {
    return document.getElementById('playground').getElementsByClassName('empty-box');
}

function GetEveryLinks() {
    return document.getElementById('playground').getElementsByTagName("a");
}

function SetEveryLinks(val) {
    if (val) document.getElementById('playground').classList.add('link-disabled');
    else document.getElementById('playground').classList.remove('link-disabled');
}

function Fade(css, animation) { // animation : "fade-in"/"fade-out"
    css.classList.add(animation);
    setTimeout(() => {
        css.classList.remove(animation);
    }, 400);
}

function GetRandomUUID() {
    // https://stackoverflow.com/a/2117523
    return crypto.randomUUID();
}

function ValidURL(str) {
    // https://stackoverflow.com/a/5717133
    var pattern = new RegExp('^(https?:\\/\\/)?'+ // protocol
      '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|'+ // domain name
      '((\\d{1,3}\\.){3}\\d{1,3}))'+ // OR ip (v4) address
      '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+ // port and path
      '(\\?[;&a-z\\d%_.~+=-]*)?'+ // query string
      '(\\#[-a-z\\d_]*)?$','i'); // fragment locator
    return !!pattern.test(str);
}
/************************* END OF GENERAL USE *************************/


/************************* PLAYGROUND PARSER *************************/
function PlaygroundParser() {
    var data = defaultPlayground; // test
    var html = '';
    var id = 0;
    console.log(data);
    var pg = document.getElementById('playground');
    // console.log(data.playground.length);
    data.playground.forEach(e1 => {
        // Page : content / name
        var v2 = '';
        e1.content.forEach(e2 => {
            var v3 = '';
            e2.categories.forEach(e3 => {
                var v4 = '';
                if (e3.links) {
                    e3.links.forEach(e4 => {
                        // console.log(e4);
                        var target4 = (e4.target) ? 'target="_blank"' : '';
                        var css4 = (e4.customcss) ? 'style="' + e4.customcss + '"' : '';
                        var icon4 = (ValidURL(e4.icon)) ? './content/img/logo/' + e4.icon : e4.icon;
                        v4 += '<a href="' + e4.url + '" ' + target4 + ' ' + css4 + '><div class="icon"><img src="' + icon4 + '"></div><p>' + e4.text + '</p></a>'
                    });
                };
                var css3 = (e3.customcss) ? 'style="' + e3.customcss + '"' : '';
                v3 += '<div class="category ' + e3.name + '" id="cat-' + e3.uuid + '" ' + css3 +'>' + v4 + '</div>';
                id++;
            });
            if (e2.categories.length > 1) {
                v3 = '<div class="group">' + v3 + "</div>";
            }
            console.log(e2);
            console.log(e2.categories.length);
            v2 += v3;
        });
        html += v2;
    });



    pg.innerHTML += html;
}
/************************* END PLAYGROUND PARSER *************************/


/************************* DRAG CATEGORIES *************************/
function SetDraggable() {
    isDraggable = !isDraggable;
    DraggableCatgegories(isDraggable);
}

function DraggableCatgegories(val) {
    var categories = GetCategories();
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
            UnSetDragListenerToCategories();
        }
    });
}

// dragstart
function DragStart(e) {
    e.dataTransfer.setData('text/plain', e.target.id);
}

function SetDragListenerToCategories() {
    var categories = GetCategories();

    Array.from(categories).forEach(box => {
        box.addEventListener('dragenter', DragEnter);
        box.addEventListener('dragover', DragOver);
        box.addEventListener('dragleave', DragLeave);
        box.addEventListener('drop', Drop);
    });
}

function UnSetDragListenerToCategories() {
    var categories = GetCategories();

    Array.from(categories).forEach(box => {
        box.removeEventListener('dragenter', DragEnter);
        box.removeEventListener('dragover', DragOver);
        box.removeEventListener('dragleave', DragLeave);
        box.removeEventListener('drop', Drop);
    });
}

function DragEnter(e) {
    e.preventDefault();
    e.currentTarget.classList.add('drag-over'); // 
}

function DragOver(e) {
    e.preventDefault();
    e.currentTarget.classList.add('drag-over'); //

    var val = GetPositionOfMouseAndSetCSS(e);

    switch (val) {
        case 1:
            SetDragClasses(e, 'drag-bottom');
            break;
        case 2:
            SetDragClasses(e, 'drag-left');
            break;
        case 3:
            SetDragClasses(e, 'drag-top');
            break;
        case 4:
            SetDragClasses(e, 'drag-right');
            break;
        default:
            break;
    }
}

function DragLeave(e) {
    e.currentTarget.classList.remove('drag-over'); //
    SetDragClasses(e, null);
}

function Drop(e) {
    e.currentTarget.classList.remove('drag-over'); //

    // drop element and data
    const id = e.dataTransfer.getData('text/plain');
    const draggable = document.getElementById(id);

    var val = GetPositionOfMouseAndSetCSS(e);

    SetCategoryPositionAndGroup(e.currentTarget, val, draggable);

    SetDragClasses(e, null);
}

function SetCategoryPositionAndGroup(e, val, draggable) {
    // if OG parent has group
    // // if parent has less or equal to 1 child (2 at this moment)
    // // // want to delete group later
    var draggableHadParent = draggable.parentNode.classList.contains("group");
    // console.log((draggableHadParent) ? "Draggable had group parent : " + draggable.parentNode.childNodes.length : "Draggable does not have group parent");
    var groupToRemove = null;
    if (draggableHadParent && draggable.parentNode.childNodes.length <= 2) {
        console.log("DESTROY");
        groupToRemove = draggable.parentNode;
    }
    // if TARGET does not have group
    // // create group
    var targetHasParent = e.parentNode.classList.contains("group");
    // console.log((targetHasParent) ? "Target has group parent : " + e.parentNode.childNodes.length : "Target does not have group parent");
    // if target does not have group parent
    if(!targetHasParent && (val == 2 || val == 4)) {
        var group = document.createElement('div');
        group.classList.add('group');
        e.before(group);
        group.appendChild(e);
    }
    // move
    console.log("val: "+ val);
    switch(val) {
        case 1: //
            if (targetHasParent) e = e.parentNode;
            e.after(draggable);
            break;
        case 2:
            e.before(draggable);
            break;
        case 3: //
            if (targetHasParent) e = e.parentNode;
            e.before(draggable);
            break;
        case 4:
            e.after(draggable);
            break;
        default:
            break;
    }
    // delete OG parent group 'later'
    if (groupToRemove != null) {
        groupToRemove.after(groupToRemove.childNodes[0]);
        groupToRemove.remove();
    }
}

function GetPositionOfMouseAndSetCSS(e) {
    // get size of element
    var x = e.currentTarget.offsetWidth;
    var y = e.currentTarget.offsetHeight;

    // position to place
    var mouseX = e.offsetX;
    var mouseY = e.offsetY;

    // assign value
    if (mouseY >= y / 100 * 50 && (mouseX > x / 100 * 15 && mouseX < x / 100 * 85)) return 1; // bottom
    if (mouseX <= x / 100 * 15) return 2; // left
    if (mouseY < y / 100 * 50 && (mouseX > x / 100 * 15 && mouseX < x / 100 * 85)) return 3; // top
    if (mouseX >= x / 100 * 15) return 4; // right
}

function SetDragClasses(e, c) {
    if (c !== 'drag-bottom') e.currentTarget.classList.remove('drag-bottom');
    if (c !== 'drag-left') e.currentTarget.classList.remove('drag-left');
    if (c !== 'drag-top') e.currentTarget.classList.remove('drag-top');
    if (c !== 'drag-right') e.currentTarget.classList.remove('drag-right');

    if (c !== null) e.currentTarget.classList.add(c);
}
/*************************  END DRAG CATEGORIES *************************/


/************************* CREATE CATEGORIES *************************/
// Don't forget unique ID
/************************* END CREATE CATEGORIES *************************/


/************************* CACHE *************************/
// if ('caches' in window) { // If web browser support cache
StartData();
PlaygroundParser();
// }
// TODO : else display message asking to upgrade web browser to allow cache
/************************* END CACHE *************************/
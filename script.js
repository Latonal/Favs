isDraggable = false;
// idCount = GetCategories().length; // Ou Unique ID // Ou Incrément

function GetCategories() {
    // Get every categories
    var categories = document.getElementById('homepage').getElementsByClassName('category');
    return categories;
}

function GetEmptyBoxes() {
    var emptyBoxes = document.getElementById('homepage').getElementsByClassName('empty-box');
    return emptyBoxes;
}

function DraggableCatgegories(val) {
    var categories = GetCategories();
    Array.from(categories).forEach(cat => {
        cat.setAttribute('draggable', val);
        cat.classList.toggle("is-draggable");
        // dragstart
        if (val) {
            cat.addEventListener('dragstart', DragStart);
            SetDragListenerToCategories(); //
        }
        else {
            cat.removeEventListener('dragstart', DragStart);
            UnSetDragListenerToCategories();
        }
    });
}

function SetDraggable() {
    isDraggable = !isDraggable;
    DraggableCatgegories(isDraggable);
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
    e.target.classList.add('drag-over'); // 
}

function DragOver(e) {
    e.preventDefault();
    e.target.classList.add('drag-over'); //

    GetPositionOfMouseAndSetCSS(e);
}

function DragLeave(e) {
    e.target.classList.remove('drag-over'); //
}

function Drop(e) {
    e.currentTarget.classList.remove('drag-over'); //

    // drop element and data
    const id = e.dataTransfer.getData('text/plain');
    const draggable = document.getElementById(id);

    e.currentTarget.after(draggable);
}

function GetPositionOfMouseAndSetCSS(e) {
    // get size of element
    var x = e.currentTarget.offsetWidth;
    var y = e.currentTarget.offsetHeight;

    // position to place
    var mouseX = e.offsetX;
    var mouseY = e.offsetY;

    // assign value = example
    if (mouseY < y / 100 * 50) {
        console.log("1");
    }
    if (mouseY >= y / 100 * 50) {
        console.log("2");
    }

}


// DraggableCatgegories(true);

// When dragged, show dotted borders
// Then show empty areas on top and bottom when over a category
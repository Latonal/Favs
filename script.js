isDraggable = false;
// idCount = GetCategory().length; // Ou Unique ID // Ou Incrément

function GetCategory() {
    // Get every categories
    var categories = document.getElementById('homepage').getElementsByClassName('category');
    return categories;
}

function GetEmptyBoxes() {
    var emptyBoxes = document.getElementById('homepage').getElementsByClassName('empty-box');
    return emptyBoxes;
}

function DraggableCatgegories(val) {
    var categories = GetCategory();
    for (let i = 0; i < categories.length; i++) {
        categories[i].setAttribute('draggable', val);
        categories[i].classList.toggle("is-draggable");
        // dragstart
        if (val) {
            categories[i].addEventListener('dragstart', DragStart);
            SetDragListenerToEmptyBoxes(); //
        }
        else {
            categories[i].removeEventListener('dragstart', DragStart);
            UnsetDragListenerToEmptyBoxes();
        }
    }
}

function SetDraggable() {
    isDraggable = !isDraggable;
    DraggableCatgegories(isDraggable);
}

// dragstart
function DragStart(e) {
    e.dataTransfer.setData('text/plain', e.target.id);
    // SetDragListenerToEmptyBoxes();
}

function SetDragListenerToEmptyBoxes() {
    var emptyBoxes = GetEmptyBoxes();

    Array.from(emptyBoxes).forEach(box => {
        box.addEventListener('dragenter', DragEnter);
        box.addEventListener('dragover', DragOver);
        box.addEventListener('dragleave', DragLeave);
        box.addEventListener('drop', Drop);
    });
}

function UnsetDragListenerToEmptyBoxes() {
    var emptyBoxes = GetEmptyBoxes();

    Array.from(emptyBoxes).forEach(box => {
        box.removeEventListener('dragenter', DragEnter);
        box.removeEventListener('dragover', DragOver);
        box.removeEventListener('dragleave', DragLeave);
        box.removeEventListener('drop', Drop);
    });
}

function DragEnter(e) {
    e.preventDefault();
    e.target.classList.add('drag-over');
}

function DragOver(e) {
    e.preventDefault();
    e.target.classList.add('drag-over');
}

function DragLeave(e) {
    e.target.classList.remove('drag-over');
}

function Drop(e) {
    e.target.classList.remove('drag-over');

    const id = e.dataTransfer.getData('text/plain');
    const draggable = document.getElementById(id);

    // e.target.appendChild(draggable);
    e.target.after(draggable);
}



// DraggableCatgegories(true);

// When dragged, show dotted borders
// Then show empty areas on top and bottom when over a category
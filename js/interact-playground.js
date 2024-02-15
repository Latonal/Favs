var editing = false;
function setEditing(canEdit) {
    if (typeof(canEdit) != "boolean") return console.error("Tried to set editing with a non-boolean");
    editing = !canEdit;
    setEditAttribute();
}

function setEditAttribute() {
    const app = document.getElementById("app");
    app.setAttribute("edit", editing);

    if (!editing) {
        // issue related to browsers with a slower dragover than dragleave
        elements = document.querySelectorAll(".drag-top, .drag-right, .drag-bottom, .drag-left, .drag-inner");
        elements.forEach(e => {
            e.classList.remove("drag-top", "drag-right", "drag-bottom", "drag-left", "drag-inner");
        });
    }
}
var editing = false;
function setEditing(canEdit) {
    if (typeof(canEdit) != "boolean") return console.error("Tried to set editing with a non-boolean");
    editing = !canEdit;
    setEditAttribute();
}

function setEditAttribute() {
    const app = document.getElementById("app");
    app.setAttribute("edit", editing);
}
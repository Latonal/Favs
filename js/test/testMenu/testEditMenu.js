function testEditMenu() {
    try {
        console.group("%cTests related to the edit menu:", test_title);
        testEditMenuButton();
        testEditMenuCanOpen();

        console.log("%cAll tests successfully passed for the edit menu", test_success_color);
        console.groupEnd();
    } catch (error) {
        throw new Error("\n" + error)
    }
}

function testEditMenuButton() {
    try {
        let saveState = {};
        const editButton = document.getElementById("edit-button");
        if (editButton.classList.contains("active")) {
            saveState.editButtonWasActive = true;
            editButton.click();
        }
        editButton.click();
        if (!editButton.classList.contains("active"))
            throw "Edit button does not contain the active state";

        if (!saveState.editButtonWasActive)
            editButton.click();

        console.log("%c- Edit button work correctly", test_success_color);
    } catch (error) {
        throw "- Test Edit Menu-1:\nCould not simulate a click on the button allowing to edit:\n" + error;
    }
}

function testEditMenuCanOpen() {
    // must open the menu on any kind of element,
    // most preferably the first sticker of the current page
}

function testEditSticker() {

}

function testEditGroup() {

}

function testEditPage() {
    
}
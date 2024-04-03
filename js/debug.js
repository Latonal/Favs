//#region Data sort
async function getSortReport() {
    const db = await openDatabase();

    return new Promise(async (resolve, reject) => {
        try {
            const transactionsRead = db.transaction("elements", "readonly");
            const elementsStore = transactionsRead.objectStore("elements");

            const data = await getElementsData(elementsStore, 0);
            const dataResult = compareElements(data);
            
            // const debugElement = document.getElementById("debug");
            displayArrayValues(data, document.getElementById("order-1"), "s0-");
            displayArrayValues(dataResult, document.getElementById("order-2"), "s1-");
            checkIfCorrect(dataResult, document.getElementById("order-3"), "s1-");
            
            resolve();
        } catch (error) {
            console.error("ERROR Debug-1:\nAn error occured while debugging the sort of the playground: ", error)
            reject();
        }
    });
}

function displayArrayValues(arr, element, idAdd) {
    arr.forEach(e => {
        let newP = document.createElement("p");
        newP.id = idAdd + e.uuid;
        newP.innerText = "Uuid: " + e.uuid + " order: " + e.order + " parent:" + e.parent;
        element.appendChild(newP);
    });
}

function checkIfCorrect(arr, element, idToCheck) {
    arr.forEach(e => {
        let newP = document.createElement("p");
        newP.id = "r1-" + e.uuid;
        checkParentCondition(arr, e, newP);
        checkOrderCondition(arr, e, newP);

        if (newP.innerText.length === 0)
            newP.innerText = "Ok";
        else
            document.getElementById(idToCheck + e.uuid).classList.add("wrong");

        element.appendChild(newP);
    });
}

function checkParentCondition(arr, currentElement, htmlElement) {
    if (currentElement.parent === 0) return;
    const currentIndex = arr.indexOf(currentElement);

    const parent = arr.find(s => s.uuid === currentElement.parent);
    const indexParent = arr.indexOf(parent);
    if (indexParent > currentIndex) {
        htmlElement.innerText += "ERROR: Parent appear after this element";
        return;
    }
}

function checkOrderCondition(arr, currentElement, htmlElement) {
    const currentIndex = arr.indexOf(currentElement);
    let badlyOrderedSiblings = [];

    const siblings = arr.filter(s => s.parent === currentElement.parent);
    siblings.forEach(e => {
        const siblingIndex = arr.indexOf(e);
        if (siblingIndex > currentIndex && e.order < currentElement.order
            || siblingIndex < currentIndex && e.order > currentElement.order) {
                console.log("w");
            badlyOrderedSiblings.push(e.uuid);
        }
    });

    if (badlyOrderedSiblings.length > 0) {
        console.log("badly ordered sibling");
        htmlElement.innerText += "ERROR: Order does not match position of siblings: ";
        badlyOrderedSiblings.forEach(e => {
            htmlElement.innerText += e + ",";
        });
    }
}
//#endregion
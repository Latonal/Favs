async function testSort() {
    const db = await openDatabase();

    return new Promise(async (resolve, reject) => {
        try {
            const transactionsRead = db.transaction(StoreName.ELEMENTS, "readonly");
            const elementsStore = transactionsRead.objectStore(StoreName.ELEMENTS);

            const data = await getElementsData(elementsStore, 0);
            const dataResult = orderObjectsByParent(data);
            
            testSortOutput(dataResult, "Test sort");
            
            resolve();
        } catch (error) {
            console.error("ERROR Test Sort:\nAn error occured while debugging the sort of the playground: ", error)
            reject();
        }
    });
}

function testSortOutput(arr, text) {
    let output;
    arr.forEach(e => {
        let currentOutput;
        currentOutput = appendStringConsole(currentOutput, testSortCheckParentCondition(arr, e))
        currentOutput = appendStringConsole(currentOutput, testSortCheckSiblingCondition(arr, e))

        if (currentOutput) {
            output = appendStringConsole(output, currentOutput)
        }
    });

    if (output) {
        console.log("%cERROR with " + text + ":\n" + output, "color:#e68181;");
    } else {
        console.log("%c" + text + " passed the tests", "color:green;");
    }
}

function testSortCheckParentCondition(arr, currentElement) {
    if (currentElement.parent === 0) return;
    const currentIndex = arr.indexOf(currentElement);

    const parent = arr.find(s => s.uuid === currentElement.parent);
    const indexParent = arr.indexOf(parent);
    if (indexParent > currentIndex) {
        return "Uuid (" + currentElement.uuid + ") appear before its parent (" + currentElement.parent + ")\n";
    }
    return;
}

function testSortCheckSiblingCondition(arr, currentElement) {
    const currentIndex = arr.indexOf(currentElement);
    if (currentElement.previous === 0) return;

    const previousSibling = arr.find(s => s.uuid === currentElement.previous);
    const previousSiblingIndex = arr.indexOf(previousSibling);
    if (currentIndex < previousSiblingIndex) {
        return "Uuid (" + currentElement.uuid + ") does not match position of previous siblings: (" + previousSibling.uuid + ")\n";
    }

    return;
}
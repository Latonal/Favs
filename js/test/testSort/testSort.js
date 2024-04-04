async function testSort() {
    const db = await openDatabase();

    return new Promise(async (resolve, reject) => {
        try {
            const transactionsRead = db.transaction("elements", "readonly");
            const elementsStore = transactionsRead.objectStore("elements");

            const data = await getElementsData(elementsStore, 0);
            const dataResult = compareElements(data);
            
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
        currentOutput = appendStringConsole(currentOutput, testSortCheckOrderCondition(arr, e))

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

function testSortCheckOrderCondition(arr, currentElement) {
    const currentIndex = arr.indexOf(currentElement);
    let badlyOrderedSiblings = [];

    const siblings = arr.filter(s => s.parent === currentElement.parent);
    siblings.forEach(e => {
        const siblingIndex = arr.indexOf(e);
        if (siblingIndex > currentIndex && e.order < currentElement.order
            || siblingIndex < currentIndex && e.order > currentElement.order) {
            badlyOrderedSiblings.push(e.uuid);
        }
    });

    let output;
    if (badlyOrderedSiblings.length > 0) {
        output = "Uuid (" + currentElement.uuid + ") does not match position of siblings: ";
        badlyOrderedSiblings.forEach(e => {
            output += "(" + e + "),";
        });
        output = output.slice(0, -1);
        output += "\n";
        
        return output;
    }

    return;
}
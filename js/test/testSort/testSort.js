async function testSort() {
    const db = await openDatabase();

    return new Promise(async (resolve, reject) => {
        try {
            console.group("%cTests related to the sort of elements:", test_title);
            const transactionsRead = db.transaction(StoreName.ELEMENTS, "readonly");
            const elementsStore = transactionsRead.objectStore(StoreName.ELEMENTS);

            const data = await getElementsData(elementsStore, 0);
            const dataResult = orderObjectsByParent(data);
            
            testSortOutput(dataResult);
            console.groupEnd();
            
            resolve();
        } catch (error) {
            reject(error);
        }
    });
}

function testSortOutput(arr) {
    let outputParentCondition;
    let outputSiblingCondition;
    arr.forEach(e => {
        outputParentCondition = appendStringConsole(outputParentCondition, testSortCheckParentCondition(arr, e));
        outputSiblingCondition = appendStringConsole(outputSiblingCondition, testSortCheckSiblingCondition(arr, e));
    });

    let err;
    if (outputParentCondition) {
        err = appendStringConsole(err, "\n- Test sort could not fulfill the parent condition requirement: " + outputParentCondition);
    } else {
        console.log("%c- Test sort fulfilled the parent condition requirement", test_success_color);
    }
    if (outputSiblingCondition) {
        err = appendStringConsole(err, "\n- Test sort could not fulfill the sibling condition requirement: " + outputSiblingCondition);
    } else {
        console.log("%c- Test sort fulfilled the sibling condition requirement", test_success_color);
    }
    
    if (err) {
        throw new Error(err);
    } else {
        console.log("%cTest sort passed the tests", test_success_color);
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
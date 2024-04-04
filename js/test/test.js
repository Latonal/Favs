function test() {
    testSort();
}

function appendStringConsole(originalString, stringToAdd) {
    if (originalString)
        originalString += stringToAdd;
    else
        originalString = stringToAdd;

    return originalString;
}
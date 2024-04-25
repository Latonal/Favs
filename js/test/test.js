function test() {
    start = performance.now();
    testSort();
    end = performance.now();
    console.log("Tests executed in", end - start ,"ms");
}

function appendStringConsole(originalString, stringToAdd) {
    if (originalString)
        originalString += stringToAdd;
    else
        originalString = stringToAdd;

    return originalString;
}
const test_success_color = "color:green;";
const test_title = "font-weight: bold;";

async function test() {
    const start = performance.now();
    try {
        await testSort();
        testEditMenu();
    } catch (error) {
        console.error(error);
        console.groupEnd();
    }
    console.log("Tests executed in", performance.now() - start ,"ms");
}

function appendStringConsole(originalString, stringToAdd) {
    if (originalString)
        originalString += stringToAdd;
    else
        originalString = stringToAdd;

    return originalString;
}
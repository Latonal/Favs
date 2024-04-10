let localStorageData = new Object();
let start, end;
Start();


async function Start() {
    start = performance.now();
    if (!window.indexedDB) {
        console.error("ERROR Browser-1:\nYour browser does not support IndexedDB. Update your browser or download one supporting IndexedDB. Browser supporting IndexedDB are listed here: https://caniuse.com/indexeddb");
        return;
    }

    try {
        localStorageData = setLocalStorageData();
        const dbInstantiated = await instantiateDB();
        if (dbInstantiated) {
            generatePlayground().then(() => {
                console.log("LAST: playground has been created");
            }).catch((error) => {
                console.error("playground has not been created: ", error);
            })
        }
    } catch (error) {
        console.error("ERROR Script-1:\nAn undetermined error occured: ", error);
    }
    end = performance.now();
    executionTime();
}

function executionTime() {
    console.log("App executed in", end - start ,"ms");
}

function testDependencies() {
    // Test localstorage & indexeddb
}

function StartTutorial() {
    console.log("TODO: starting tutorial");
}
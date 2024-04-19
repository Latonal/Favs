const currentVersion = 0.1;

function setLocalStorageData() {
    if (!localStorage) {
        return new Object({
            defaultPage: 0,
            version: currentVersion,
        });
    }
    const localStorageData = new Object();
    localStorageData.defaultPage = getLocalStorageDefaultPage();
    localStorageData.version = getLocalStorageVersion();
    return localStorageData;
}

function getLocalStorageDefaultPage() {
    if (localStorage.getItem("default_page"))
        return parseInt(localStorage.getItem("default_page"), 10);
    const page = 0;
    localStorage.setItem("default_page", page);
    return page;
}

function getLocalStorageVersion() {
    if (localStorage.getItem("version")) {
        const previous = parseFloat(localStorage.getItem("version"));
        if (previous === currentVersion) return previous;
        checkVersion(previous);
    }
    const version = localStorage.setItem("version", currentVersion);
    return version;
}

function checkVersion(previousVersion) {
    switch (previousVersion) {
        case 0.1:
            // case 0.2:
            break;
    }
}

function deleteLocalStorage() {
    localStorage.clear();
}
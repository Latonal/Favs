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
    localStorageData.firstVersion = getFirstLocalStorageVersion();
    localStorageData.version = getLocalStorageVersion();
    return localStorageData;
}

function getAppAccessibility(setAccessibility = false) {
    if (localStorage.getItem("accessibility"))
        return localStorage.getItem("accessibility");

    if (setAccessibility)
        localStorage.setItem("accessibility", true);
    return false;
}

function getLocalStorageDefaultPage() {
    if (localStorage.getItem("default_page"))
        return parseInt(localStorage.getItem("default_page"), 10);
    const page = 0;
    localStorage.setItem("default_page", page);
    return page;
}

// First version the user was meet with
function getFirstLocalStorageVersion() {
    if (localStorage.getItem("firstVersion")) 
        return parseInt(localStorage.getItem("firstVersion"), 10);

    localStorage.setItem("firstVersion", currentVersion);
    return currentVersion;
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
const currentVersion = 0.1;

function setLocalStorageData() {
    if (!localStorage) {
        return new Object({
            hasLocalStorage: false,
            dbName: "playground-ltnl",
            key: "key",
            defaultPage: 1,
            version: currentVersion,
            securityLevel: securityLevel.NONE,
        });
    }
    const localStorageData = new Object();
    localStorageData.hasLocalStorage = true;
    localStorageData.dbName = getLocalStorageDbName();
    DB_NAME = localStorageData.dbName;
    localStorageData.key = getLocalStorageKey();
    localStorageData.defaultPage = getLocalStorageDefaultPage();
    localStorageData.securityLevel = getLocalStorageSecurityLevel();
    localStorageData.version = getLocalStorageVersion();
    return localStorageData;
}

function getLocalStorageDbName() {
    if (localStorage.getItem("dbName"))
        return localStorage.getItem("dbName");
    const dbName = "playground-ltnl-" + uuidv4();
    localStorage.setItem("dbName", dbName);
    return dbName;
}

function getLocalStorageKey() {
    if (localStorage.getItem("key"))
        return localStorage.getItem("key");
    const key = uuidv4();
    localStorage.setItem("key", key);
    return key;
}

function getLocalStorageDefaultPage() {
    if (localStorage.getItem("default_page"))
        return localStorage.getItem("default_page");
    const page = 1;
    localStorage.setItem("default_page", page);
    return page;
}

function getLocalStorageSecurityLevel() {
    if (localStorage.getItem("securityLevel"))
        return parseInt(localStorage.getItem("securityLevel"), 10);
    const securityLevel = SecurityLevel.LOW;
    localStorage.setItem("securityLevel", securityLevel);
    return securityLevel;
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
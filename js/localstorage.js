function setLocalStorageData() {
    if (!localStorage) {
        return new Object({
            defaultPage: 0,
        });
    }
    const localStorageData = new Object();
    localStorageData.defaultPage = getLocalStorageDefaultPage();
    return localStorageData;
}

function getLocalStorageDefaultPage() {
    if (localStorage.getItem("default_page"))
        return parseInt(localStorage.getItem("default_page"), 10);
    const page = 0;
    localStorage.setItem("default_page", page);
    return page;
}

function deleteLocalStorage() {
    localStorage.clear();
}
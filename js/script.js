let localStorageData = new Object();
let start, end;
CheckAccessibility();

function CheckAccessibility(state = 0) {
    const sp = document.getElementById("special-popups");
    sp.querySelector("[data-popup-type='js-disabled']").setAttribute("hidden", true);

    if (state == 3) sp.querySelector("[data-popup-type='not-cookies']").setAttribute("hidden", true);

    if (getAppAccessibility()) {
        sp.setAttribute("hidden", true);
        StartApp();
        return;
    }

    if (checkMobile() && state == 0) {
        sp.querySelector("[data-popup-type='mobile-user']").removeAttribute("hidden");
        return;
    } else
        sp.querySelector("[data-popup-type='mobile-user']").setAttribute("hidden", true);

    sp.querySelector("[data-popup-type='not-cookies']").removeAttribute("hidden");
    
    if (state == 2) {
        getAppAccessibility(true);
        if (!isLocalStorageAvailable()) sp.querySelector("[data-popup-type='localstorage-is-disabled']").removeAttribute("hidden");
        if (!isIndexedDBAvailable()) sp.querySelector("[data-popup-type='indexeddb-is-disabled']").removeAttribute("hidden");
        CheckAccessibility(3);
    }
}

async function StartApp() {
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
        console.error(error);
    }
    end = performance.now();
    console.log("App executed in", end - start, "ms");
}

function deleteData() {
    deleteLocalStorage();
    deleteDB();
}

function setPopupPosition() {
    const popup = document.getElementById("popup");
    popup.classList.remove("hide");
    const top = (window.innerHeight - popup.offsetHeight) / 2 + "px";
    popup.style.top = top;
}

function closePopup() {
    const popup = document.getElementById("popup");
    const content = document.getElementsByClassName("content")[0];
    content.style.top = "0px";
    popup.classList.add("hide");
}

function aboutFavs() {
    const popup = document.getElementById("popup");
    const content = popup.getElementsByClassName("content")[0];
    content.style.width = "500px";
    content.innerHTML = "<h3 class=\"center\">Welcome!</h3></br><p>Favs is a tool allowing you to create on the go quick shortcuts to other websites or paths on your computer, and edit the style freely!</p></br><p>Currently, Favs is in beta. I'll consider the app to be out of beta once all the requirements for v1 (in \"What's next\") will be fulfilled.</p></br><p>Thank you for using Favs, and please report any bug you'll find!</p>";
    setPopupPosition();
}

function whatsNext() {
    const popup = document.getElementById("popup");
    const content = popup.getElementsByClassName("content")[0];
    content.style.width = "700px";
    content.innerHTML = "<h3 class=\"center\">What's next</h3></br><h4 class=\"center\">Requirements for version 1:</h4><p class=\"center\">*Not in order of importance</p><ul><li>Set a group as a loader: because the number of elements in a page can be infinite, it can increase the loading time when loading the page (as in, page of the app), and can increase memory usage. To avoid that, allow the user to set a group as a loader, requiring one more click to load its content.</li><li>Import/export: the content of the app is directly linked to the web browser you are using, meaning you can't share its content between other computers or even between friends. An import/export feature with a reminder to save after X changes and Y time would help you keep your precious data.</li><li>Languages! Currently, Favs is only available in English, but the end goal is to have translation for as many languages as required.</li><li>A tutorial and a mascot! Yeah currently you are lacking of a tutorial even though there is only a few features available. Sorry!</li><li>More types for groups and more customization! Why limit yourself to a text and an icon? Why not have a image viewer or more to suit your needs? Currently, only a few type of groups are available, but many are to come! Also, adding more customization to all the available elements of the app is to come.</li><li>Better style. Yes, the app will have a relooking, don't worry.</li></ul><h4 class=\"center\">After version 1:</h4><ul><li>Better import/export: Yes, I already think of improving what's not yet implemented. The import/export for v1 might only allow you to get or retrieve all the data in your application, but post-v1 you'll also be able to choose what pages you'll want to share and get.</li><li>Fetch pages and quick sharing: Because you might want to share or get informations online, creating and sharing one or many pages is one of my huge focus, even though it might not be done for version 1.</li><li>Create your custom themes! It is annoying to have to copy paste the same rules between groups, so allowing you to create your own themes will make it less tedious.</li><li>And more feature and shortcuts to make your use of Favs easier.</li></ul>";
    setPopupPosition();
}

function testDependencies() {
    // Test localstorage & indexeddb
}

function StartTutorial() {
    console.log("TODO: starting tutorial");
}
const elementTypeFormatCommon = {
    getData: function (element, elementType, object, dataToUpdate) {
        switch (dataToUpdate) {
            case "parent":
                object.parent = this.getParent(element);
                break;
            case "previous":
                object.previous = this.checkFunctionExists("getPrevious", elementType, element);
                break;
            case "customcss":
                object.customcss = this.getCustomCss(element);
                break;
            case "type":
                object.type = parseInt(this.getType(element, true), 10);
                break;
            case "text":
                object.text = this.checkFunctionExists("getText", elementType, element);
                break;
            case "img":
                object.img_uuid = this.getImg(elementType, element)[1];
                break;
            default:
                elementTypeFormat[elementType].getData(element, object, dataToUpdate);
                break;
        }
    },
    checkFunctionExists: function (callback, elementType, ...params) {
        if (typeof elementTypeFormat[elementType] === "object") {
            if (typeof elementTypeFormat[elementType][callback] === "function")
                return elementTypeFormat[elementType][callback](...params);
        }

        // console.warn("WARNING Playground-14:\nThe function \"" + callback + "\" is not handled by the type formatter \"" + elementType + "\" of elements.");

        if (typeof this[callback] === "function")
            return this[callback](...params);

        console.error("WARNING Playground-15:\nThe function \"" + callback + "\" is not handled by both the main and type formatter of elements.");
    },
    getElement: function (id) {
        return document.getElementById(id) || document.querySelector("my-tab[data-album='" + id + "']");
    },
    setMenu: function (elementType) {
        if (typeof elementTypeFormat[elementType].setMenu === "function")
            return elementTypeFormat[elementType].setMenu();

        return new MenuItemsToDisplay();
    },
    getTheme: function (element) { },
    setTheme: function (element, theme) {
        if (theme) element.setAttribute("data-theme", theme);
    },
    //#region customcss
    getCustomCss: function (element) {
        return element.style.cssText;
    },
    updateCustomCss: function (element, value) {
        element.style.cssText = value;
    },
    setCustomCss: function (element, customCss) {
        if (customCss) element.setAttribute("style", customCss);
    },
    //#endregion customcss
    //#region element type
    getElementType: function (element, byId = false) {
        const tagName = element.tagName.toLowerCase();

        switch (tagName) {
            case FavsCustomElementsName.tags.TAB:
            case FavsCustomElementsName.tags.ALBUM:
                return 'album';
            case FavsCustomElementsName.tags.GROUP:
                return 'group';
            case FavsCustomElementsName.tags.STICKER:
                return this.getType(element, byId) || 'default';
            default:
                return 'default';
        }
    },
    getType: function (element, byId = false, throughParent = false) {
        if (element.hasAttribute("data-type"))
            return byId ? getKeyByValue(FavsElementsType, element.getAttribute("data-type")) : element.getAttribute("data-type");
        else if (throughParent && element.parentNode && element.parentNode.hasAttribute("data-type"))
            return byId ? getKeyByValue(FavsElementsType, element.parentNode.getAttribute("data-type")) : element.parentNode.getAttribute("data-type");
    },
    setType: function (element, type) {
        if (type) {
            if (type == -1) {
                element.removeAttribute("data-type");
                return;
            }
            let elementType = FavsElementsType[type];
            if (elementType) element.setAttribute("data-type", elementType);
        }
    },
    //#endregion element type
    getPrevious: function (element) {
        return element.previousSibling ? parseInt(element.previousSibling.id, 10) : 0;
    },
    getParent: function (element) {
        return parseInt(element.parentElement.id, 10);
    },

    //#region text
    getText: function (element) {
        return element.querySelector("p").innerText;
    },
    updateText: function (element, value) {
        return element.querySelector("p").innerText = value;
    },
    //#endregion text

    //#region img
    getImg: function (elementType, element) {
        const img = this.checkFunctionExists("findImg", elementType, element);
        if (!img) return;
        
        const src = img.src;
        const id = parseInt(img.getAttribute("img-id"), 10);
        const alt = img.alt;
        return [src, id, alt];
    },
    findImg: function (element) {
        return element.querySelector("img");
    },
    updateImg: function (elementType, element, src, id, alt) {
        const img = this.checkFunctionExists("findImg", elementType, element);
        if (!img) return;

        id == 0 ? img.src = 'null' : img.src = src;
        img.setAttribute("img-id", id);
        img.alt = alt;
    },
    //#endregion img

    //#region others
    encrypt: function (element) {
        // return encryptMessage(element);
        return element;
    },
    decrypt: function (element) {
        // return decryptMessage(element);
        return element;
    },
    //#endregion others
}

const elementTypeFormatDefault = {
    getData: function (element, object, dataToUpdate) {
        switch (dataToUpdate) {
            default:
                break;
        }
    },
    setData: async function (element, dataElement, iconsStore) {
        let elementObj = new Object();
        elementTypeFormatCommon.setTheme(element, dataElement.theme);
        elementTypeFormatCommon.setCustomCss(element, dataElement.customcss);
        elementTypeFormatCommon.setType(element, dataElement.type);
        this.setHref(element, dataElement.href);
        this.setTarget(element, dataElement.target);

        elementObj.text = this.setText(dataElement.text);
        if (dataElement.img_uuid) {
            let imgUri = await getImgUri(dataElement.img_uuid, iconsStore);
            elementObj.img = this.setImg(imgUri, dataElement.img_uuid);
        } else
            elementObj.img = this.setImg(null, null);

        if (elementObj.img) element.appendChild(elementObj.img);
        if (elementObj.text) element.appendChild(elementObj.text);
    },
    setMenu: function () {
        return new MenuItemsToDisplay("text", "img", "customcss", "type");
    },

    findText: function (element) {
        return element.querySelector("p");
    },
    setText: function (text) {
        // if (!text) return null;
        const newP = document.createElement("p");
        newP.innerText = elementTypeFormatCommon.decrypt(text);
        return newP;
    },

    findImg: function (element) {
        return element.querySelector("img");
    },
    setImg: function (imgUri, imgUuid) {
        // if (!imgUri) return null;
        const newImg = document.createElement("img");
        newImg.setAttribute("src", imgUri);
        newImg.setAttribute("img-id", imgUuid);
        return newImg;
    },

    getHref: function (element) { },
    setHref: function (element, href) {
        if (href) element.setAttribute("href", href);
    },
    getTarget: function (element) { },
    setTarget: function (element, target) {
        if (target) element.setAttribute("target", target);
    },
}

const elementTypeFormat = {
    //#endregion Stickers
    default: {
        ...elementTypeFormatDefault,
    },
    list: {
        ...elementTypeFormatDefault,
    },
    icon: {
        ...elementTypeFormatDefault,
    },
    //#region Stickers
    //#region Not stickers    
    tab: {
        getData: function (element, object, dataToUpdate) { },
        setData: function (element, dataElement) {
            this.setAlbumId(element, dataElement.uuid);
            this.setTabContent(element, dataElement);
            return element;
        },
        getAlbumId: function (element) {

        },
        setAlbumId: function (element, albumId) {
            if (albumId) element.setAttribute("data-album", albumId);
        },
        getTabContent: function (element) { },
        setTabContent: function (element, dataElement) {
            // TODO: if img_uuid, put img_uuid instead of text & make tooltip for text
            console.log(element);
            if (dataElement.text) element.innerText = dataElement.text;
        },
    },
    album: {
        getData: function (element, object, dataToUpdate) {

        },
        setData: function (element, dataElement) {
            elementTypeFormatCommon.setTheme(element, dataElement.theme);
            elementTypeFormatCommon.setCustomCss(element, dataElement.customcss);
        },
        getPrevious: function (element) {
            let targetTab = element;
            if (targetTab.tagName.toLowerCase() === FavsCustomElementsName.tags.ALBUM)
                targetTab = document.querySelector("my-tab[data-album='" + targetTab.id + "']");
            return (targetTab.previousElementSibling) ? parseInt(targetTab.previousElementSibling.getAttribute("data-album"), 10) : 0;
        },
    },
    group: {
        getData: function (element, object, dataToUpdate) {
            switch (dataToUpdate) {
                case "setAsGroup":
                    object.isGroup = true;
                    break;
                default:
                    console.error("ERROR Playground-10a:\n" + dataToUpdate + " is not yet implemented for saving.");
                    break;
            }
        },
        setData: function (element, dataElement) {
            elementTypeFormatCommon.setTheme(element, dataElement.theme);
            elementTypeFormatCommon.setCustomCss(element, dataElement.customcss);
            elementTypeFormatCommon.setType(element, dataElement.type);
        },
        setMenu: function () {
            return new MenuItemsToDisplay("customcss", "type");
        },
    }
    //#endregion Not stickers    
}
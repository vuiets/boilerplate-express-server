const { consoleLog, insertHTML } = require("../utils/utils");
const { fetchAxiosHTML, fetchPuppeteerHTML, fetchURL  } = require("../services/services");
const products = require("../constants/products");

const getAllProducts = async (res, isHTML) => {
    const promises = [];
    for (let productName in products) {
        const { defaultItems = [] } = products[productName] || {};
        defaultItems.forEach((item) => promises.push(getAvailability(productName, item, res, isHTML)));
    }
    await Promise.all(promises);
}

const displayOutput = (item) => {
    const { productName, itemName, itemPrice, itemURL, logo, available, itemDetails, origin, isHTML, res } = item;
    if (itemName) {
        consoleLog(`\nThe item ${itemName} ${itemPrice ? (available ? `is available for ${itemPrice} here ${origin}/${itemURL}` : "is not available") : ""} ${itemDetails || ""}`, !isHTML && res)
        isHTML && insertHTML(`
            <div style="${styles.container}">
                <div style="display: flex">
                    ${logo ? `<img style="height: 50px; max-width: 100px;" src="${logo}" />` : `<div>${productName}</div>`}
                </div>
                The item <a target="_blank" href="${origin}/${itemURL}" title="${itemName}" style="${styles.itemName}">${itemName}</a> ${""}
                ${itemPrice ? (available ?
                    `is available at price <span style="${styles.itemPrice}">Rs ${itemPrice}</span>`
                    : `<span style="${styles.itemPrice}">is not available</span>`
                ): ""}
                ${itemDetails ? `<div>${itemDetails}</div>` : ""}
            </div>`
        , res);
    }
}

const getAvailability = async (productName, item, res, isHTML = true) => {
    const { selector, queryURL, isScrape, isPupeteer, isFetch, handler, redirects = [], fetchHandler, isJSON } = products[productName] || {};
    const url = queryURL && item ? queryURL.replace("{ITEM_NAME}", item.split(" ").join("+").toLowerCase()) : queryURL;
    if ( isFetch ) {
        const data = await fetchURL(url);
        const results = handler(data);
        results.forEach((itemObj) => {
            displayOutput({
                productName,
                ...products[productName],
                ...itemObj,
                res,
                handler,
                isHTML
            });
        });
    } else if ( isScrape ) {
        const $ = await fetchAxiosHTML(url);
        if ( isJSON ) {
            const data = handler($);
            res.write(JSON.stringify(data));
        } else {
            handler($).forEach((itemObj) => {
                displayOutput({
                    productName,
                    ...products[productName],
                    ...itemObj,
                    res,
                    handler,
                    isHTML
                });
            });
        }
    } else if ( isPupeteer ) {
        const $ = await fetchPuppeteerHTML(url, selector, fetchHandler);
        handler($).forEach((itemObj) => {
            displayOutput({
                productName,
                ...products[productName],
                ...itemObj,
                res,
                handler,
                isHTML
            });
        });
    }
    const redirectsPromises = [];
    redirects.forEach((redirect) => {
        item.toLowerCase().indexOf(` ${redirect.title}`) > -1 && redirectsPromises.push(
            getAvailability(
                redirect.product, item.toLowerCase().replace(redirect.title, ""), res, isHTML
            )
        )
    });
    await Promise.all(redirectsPromises);
}

const styles = {
    container: `
        margin: 10px 0px;
    `,
    itemName: `
        color: green;
        max-width: 500px;
        overflow: hidden;
        white-space: nowrap;
        display: inline-flex;
    `,
    itemPrice: `
        color: red;
    `
}

module.exports = {
    getAllProducts,
    getAvailability
};
const url = require('url');
const express = require('express');
const app = express();

const { getAllProducts, getAvailability } = require("./controllers/availableProducts");

app.get('/all', async function (req, res) {
    const queryObject = url.parse(req.url, true);
    const isHTML = queryObject.query && queryObject.query.isHTML ? queryObject.query.isHTML === "true" : true;
    res.writeHead(200, { "Content-Type": !isHTML ? "text/plain" : "text/html" });
    await getAllProducts(res, isHTML);
    res.end();
});

app.get('/*', async function (req, res) {
    const queryObject = url.parse(req.url, true);
    if (queryObject.query && queryObject.query.product) {
        const productName = queryObject.query.product.toUpperCase();
        const isHTML = queryObject.query && queryObject.query.isHTML ? queryObject.query.isHTML === "true" : true;
        res.writeHead(200, { 'Content-Type': !isHTML ? "text/plain" : "text/html" });
        if (productName) {
            await getAvailability(productName, queryObject.query.item, res, isHTML);
            res.end();
        } else {
            res.write(`The Product "${productName}" is not found.`);
            res.end();
        }
    }
});

var server = app.listen(5000, function () {
    var host = server.address().address
    var port = server.address().port
    console.log("Available Products app listening at http://%s:%s", host, port)
})
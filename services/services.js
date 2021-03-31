const fetch = require('node-fetch');
const axios = require("axios");
const cheerio = require("cheerio");
const puppeteer = require('puppeteer');

const fetchAxiosHTML = async(url) => {
    const { data } = await axios.get(url);
    return cheerio.load(data);
}
    
const fetchPuppeteerHTML = async (url, selector, fetchHandler) => {
    try {
        const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
        const page = await browser.newPage();
        await page.goto(url);
        await page.waitForSelector(selector, { timeout: 1000 });
        if ( fetchHandler ) {
            await page.exposeFunction("fetchHandler", fetchHandler);
        }
        const response = await page.evaluate(() => {
            return window.fetchHandler ? window.fetchHandler() : document.documentElement.innerHTML;
        });
        await browser.close();
        return !!fetchHandler ? response : cheerio.load(response);
    } catch (error) {
        console.log(error);
    }
};

const fetchURL = (url) => {
    return fetch(url).then(response => response.json());
}



module.exports = {
    fetchURL,
    fetchAxiosHTML,
    fetchPuppeteerHTML
}

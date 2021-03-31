const insertHTML = (html, res) => {
    res && res.write(html);
}

const consoleLog = (message, res) => {
    console.log(message);
    res && res.write(message);
}

module.exports = {
    insertHTML,
    consoleLog
};
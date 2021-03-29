const RDR2 = {
    queryURL: "https://www.ign.com/wikis/red-dead-redemption-2/Red_Dead_Online_Updates_Archive",
    origin: "https://ign.com",
    isScrape: true,
    isJSON: true,
    handler: ($) => {
        const sectionsSelector = "section";
        const allSectionEles = $(sectionsSelector);
        const articles = [];
        let article = {};
        let sections = [];
        let wordLinks = [];
        const wordRegex = `<a.*?href="([\\s\\S]+?)".*?>([\\s\\S]+?)<\/a>`;
        const getWordLinks = (text) => {
            const WORD_REGEX = new RegExp(wordRegex);
            let match = WORD_REGEX.exec(text);
            while (match) {
                const matchedString = match[0];
                if ( matchedString ) {
                    const matchWord = matchedString.match(WORD_REGEX);
                    const link = matchWord[1];
                    const word = matchWord[2];
                    if (wordLinks.filter((ele) => ele.word && ele.word.toUpperCase() === word.toUpperCase() ).length === 0 )
                        wordLinks.push({ link, word });
                }
                const unMatchedString = text.split(matchedString)[0];
                text = text.replace(unMatchedString, "").replace(match[0], "");
                match = WORD_REGEX.exec(text);
            }
        }

        const removeHyperlinks = (text) => {
            const WORD_REGEX = new RegExp(wordRegex, "g");
            return text.replace(/\\/g, "").replace(WORD_REGEX, "$2");
        }
        Array.from(allSectionEles).forEach((sectionEle, index) => {
            if (sectionEle.firstChild) {
                nodeEle = sectionEle.firstChild;
                nodeName = nodeEle.name;
                switch (nodeName.toUpperCase()) {
                    case "H2":
                        if (article.title) {
                            sections = sections.slice(0, sections.length - 1);
                            article["wordLinks"] = wordLinks;
                            article["sections"] = sections;
                            articles.push(article);
                        }
                        article = {};
                        sections = [];
                        wordLinks = [];
                        article["title"] = $(nodeEle).text().trim();
                        article["date"] = article["title"] && article["title"].split(":")[0];
                        break;
                    case "P":
                        if (!!$(nodeEle).find("img")) {
                            const image = $(nodeEle).find("img").first().attr("src");
                            if ( image ) {
                                article["image"] = image.split("?")[0];
                            }
                        }
                    break;
                    case "UL":
                        const content = nodeEle.firstChild && $(nodeEle.firstChild).html().trim().split("<br>");
                        const sectionTitle = content[0].replace(/<b>([\s\S]+?)<\/b>/g, "$1");
                        const contentList = content.slice(1, content.length).join("\n")
                        const string = sectionTitle + content.join("");
                        getWordLinks(string.replace(/\\/g, ""));
                        let section = {};
                        if (content.length > 0) {
                            section = {
                                lead_line: removeHyperlinks(sectionTitle),
                                content: removeHyperlinks(contentList)
                            }
                        }
                        if (section["lead_line"]) {
                            sections.push(section);
                        }
                        break;
                }
            }
        });
        return articles;
    }
}

module.exports = {
    RDR2
};
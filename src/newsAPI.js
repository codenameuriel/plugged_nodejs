const NewsAPI = require("newsapi");
const { newsAPIKey } = require("./apiKeys");
const newsapi = new NewsAPI(newsAPIKey);

module.exports = newsapi;

const NewsAPI = require("newsapi");
const { newsAPIKey } = require("./apiKeys");
const newsapi = new NewsAPI(newsAPIKey);

const getTopNews = async queries => {
  return await newsapi.v2.topHeadlines(queries);
};

module.exports = {
  getTopNews
};
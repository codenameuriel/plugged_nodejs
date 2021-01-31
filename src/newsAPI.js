const NewsAPI = require("newsapi");
const { newsAPIKey } = require("./apiKeys");
const newsapi = new NewsAPI(newsAPIKey);

const getNews = async queries => {
  return await newsapi.v2.topHeadlines(queries);
};

module.exports = {
  getNews,
};
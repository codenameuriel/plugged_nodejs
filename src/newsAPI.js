const NewsAPI = require("newsapi");
const { newsAPIKey } = require("./apiKeys");
const newsapi = new NewsAPI(newsAPIKey);

const getNews = async queries => {
  return await newsapi.v2.topHeadlines(queries);
};

const getSourceNews = async queries => { 
  return await newsapi.v2.sources(queries);
};

module.exports = {
  getNews,
  getSourceNews
};
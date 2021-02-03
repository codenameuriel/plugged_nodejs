const NewsAPI = require("newsapi");
const { newsAPIKey } = require("./apiKeys");
const newsapi = new NewsAPI(newsAPIKey);

const getNews = async queries => {
  return await newsapi.v2.topHeadlines(queries);
};

const getSources = async queries => { 
  return await newsapi.v2.sources(queries);
};

const getTopicNews = async queries => {
  return await newsapi.v2.everything(queries);
};

module.exports = {
  getNews,
  getSources,
  getTopicNews
};
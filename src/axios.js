const axios = require("axios");
const { newsAPIKey } = require("./apiKeys");

const topNews = axios.create({
  baseURL: "https://newsapi.org/v2/top-headlines?country=us",
  headers: {
    "Authorization": newsAPIKey
  }
});

module.exports = {
  topNews
};
const newsapi = require('../newsapi');

const fetchFromEndpoint = type => {
  switch (type) {
    case 'top-news':
      return async query => {
        return await newsapi.v2.topHeadlines(query);
      };
    case 'dashboard-news':
      break;
    default: return async query => await newsapi.v2.topHeadlines(query);
  }
};

module.exports = fetchFromEndpoint;

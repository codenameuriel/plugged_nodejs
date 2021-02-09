const { createQuery } = require("./queries");
const newsapi = require("../newsapi");

async function getNewsByType(query, q, type) {
  const updatedQuery = createQuery(query, { [type]: q });
  const data = await newsapi.v2.topHeadlines(updatedQuery);
  const { articles } = data;
  return { [q]: articles };
}

async function buildUserNews(query, queries, type) {
  const news = queries.map(q => getNewsByType(query, q, type));
  const data = await Promise.all(news);
  const [ catObj1, catObj2 ] = data;
  return { ...catObj1, ...catObj2 };
}

module.exports = {
  buildUserNews
};
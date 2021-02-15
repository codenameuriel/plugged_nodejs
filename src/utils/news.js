/** @format */

const { createQuery } = require('./queries')
const newsapi = require('../newsapi')

async function getNewsByType(query, q, type) {
  try {
    const updatedQuery = createQuery(query, { [type]: q })
    const data = await newsapi.v2.topHeadlines(updatedQuery)
    const { articles } = data
    return { [q]: articles }
  } catch (error) {
    console.error(error)
    return error
  }
}

async function buildUserNews(query, queries, type) {
  const news = queries.map(q => getNewsByType(query, q, type))
  const data = await Promise.all(news)
  let userNews = {}
  data.forEach(dataObj => (userNews = { ...userNews, ...dataObj }))
  return userNews
}

module.exports = {
  buildUserNews
}

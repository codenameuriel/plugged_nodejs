/** @format */

const { createQuery } = require('./queries');
const newsapi = require('../newsapi');

async function getNewsByType(query, q, type) {
	try {
		const updatedQuery = createQuery(query, { [type]: q });
		const data = await newsapi.v2.topHeadlines(updatedQuery);
		const { articles } = data;
		return { [q]: articles };
	} catch (error) {
		console.error(error);
		return error;
	}
}

async function buildUserNews(query, queries, type) {
	const news = queries.map(q => getNewsByType(query, q, type));
	const data = await Promise.all(news);
	let userNews = {};
	data.forEach(dataObj => (userNews = { ...userNews, ...dataObj }));
	return userNews;
}

async function getTopNews(...queries) {
	try {
		// construct query object for api call
		let query = createQuery(...queries);

		// used to compare passing time
		// want to fetch new articles every 15 minutes
		let now = new Date();

		// if articles have not been cached or if 15 minutes have passed
		if (!getTopNews.cache.articles.length || now.getMinutes() - getTopNews.cache.time.getMinutes() >= 15) {
			// update time
			getTopNews.cache.time = now;

			// make initial request for articles and totalResults
			// totalResults is the total amount of articles available
			let { articles, totalResults } = await newsapi.v2.topHeadlines(query);

			// store news in cache
			getTopNews.cache.articles = [
				...getTopNews.cache.articles,
				...articles
			];

			// restrict totalResults to 100
			// free api prevents fetching past 100 articles
			totalResults = totalResults > 100 ? 100 : totalResults;

			// compute number of fetches needed to get all articles
			const numOfFetches = totalResults / articles.length;

			// construct array of fetches
			// round up, and subtract 1 for the initial fetch of page 1
			// add 2 to index to account for removal of page 1
			const fetchArray = new Array(Math.ceil(numOfFetches - 1))
				.fill(0)
				.map(
					async (ele, idx) =>
						await newsapi.v2.topHeadlines({
							...query,
							page: idx + 2
						})
				);

			// make fetches in parallel
			const { articles: allArticles } = await (
				await Promise.all(fetchArray)
			)[0];

			// store articles in cache
			getTopNews.cache.articles = [
				...getTopNews.cache.articles,
				...allArticles
			];

      console.log('returning fetched articles');
			return getTopNews.cache.articles;
		} else {
      console.log('returning cached articles');
			// articles have been cached or 15 minutes have not passed
			// prevent making too many api calls
			return getTopNews.cache.articles;
		}
	} catch (error) {
		console.error(error);
		return error;
	}
}

// initialize cache
getTopNews.cache = {};
getTopNews.cache['articles'] = [];
getTopNews.cache['time'] = new Date();

module.exports = {
	getTopNews,
	buildUserNews
};

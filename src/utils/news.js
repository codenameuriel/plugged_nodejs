/** @format */

const newsapi = require('../newsapi');
const fetchFromEndpoint = require('./endpoints');
const { createQuery } = require('./queries');
const { checkTime } = require('./date');

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

async function getNews(query) {
	try {
		// only want to fetch new articles every 15 minutes
		const { time: cachedTime } = getNews.cache;
		const hasTimeElapsed = checkTime(cachedTime.getTime(), 15);

		// if articles have not been cached or if 15 minutes have passed
		if (!getNews.cache.articles.length || hasTimeElapsed) {
			// update time
			getNews.cache.time = new Date();

			// make initial request for articles and totalResults
			// totalResults is the total amount of articles available
			let { articles, totalResults } = (
        await fetchFromEndpoint('top-news')(query)
      );

			// store news in cache
			getNews.storeArticles(articles);

			// compute number of fetches needed to get all articles
			const numOfFetches = calcNumOfFetches(totalResults, articles.length);

			// get remaining articles due to 20 max per fetch
      const { articles: allArticles } = await getRemainingNews(numOfFetches);

			// store articles in cache
      getNews.storeArticles(allArticles);

			console.log('returning fetched articles');
			return getNews.cache.articles;
		} else {
			console.log('returning cached articles');
			// articles have been cached and 15 minutes have not passed
			// prevent making too many api calls
			return getNews.cache.articles;
		}
	} catch (error) {
		console.error(error);
		return error;
	}
}

function calcNumOfFetches(totalResults, numOfArticles) {
	// restrict totalResults to 100
	// free api prevents fetching past 100 articles
	totalResults = totalResults > 100 ? 100 : totalResults;

	// compute number of fetches needed to get all articles
	return totalResults / numOfArticles;
}

async function getRemainingNews(numOfFetches) {
  // construct array of fetches
  // round up, and subtract 1 for the initial fetch of page 1
  // add 2 to index to account for removal of page 1
	const fetchArray = new Array(Math.ceil(numOfFetches - 1))
		.fill(0)
		.map(async (ele, idx) => {
			const q = createQuery(query, { page: idx + 2 });
			return await fetchFromEndpoint('top-news')(q);
		});

	// make fetches in parallel
	return await (await Promise.all(fetchArray))[0];
}

// initialize cache
getNews.cache = {};
getNews.cache.articles = [];
getNews.cache.time = new Date();
getNews.storeArticles = articles => {
	getNews.cache.articles = [...getNews.cache.articles, ...articles];
};

module.exports = {
	getNews,
	buildUserNews
};

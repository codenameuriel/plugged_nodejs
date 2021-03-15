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

async function getNews(query, type) {
	try {
		// check for new category searches
		checkCategoryCache(query);

		// only want to fetch new articles every 15 minutes
		const { time: cachedTime } = getNews.cache;
		const timeElapsed = checkTime(cachedTime.getTime(), 15);

		// if articles have not been cached or if 15 minutes have passed
		if (!getNews.cache[type].length || timeElapsed) {
			// update time
			getNews.cache.time = new Date();

			// make initial request for articles and totalResults
			// totalResults is the total amount of articles available
			let { articles, totalResults } = (
        await fetchFromEndpoint(type)(query)
      );

      // clear cache
      getNews.clearArticlesCache(type);
			// store news in cache
			getNews.storeArticles(articles, type);

			// compute number of fetches needed to get all articles
			const numOfFetches = calcNumOfFetches(totalResults, articles.length);

			if (numOfFetches > 1) {
				// get remaining articles due to 20 max per fetch
				const { articles: remainingArticles } = (
					await getRemainingArticles(query, numOfFetches, type)
				);

				// store articles in cache
				getNews.storeArticles(remainingArticles, type);
			}

			console.log('returning fetched articles');
			return getNews.cache[type];
		} else {
			console.log('returning cached articles');
			// articles have been cached and 15 minutes have not passed
			// prevent making too many api calls
			return getNews.cache[type];
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

async function getRemainingArticles(query, numOfFetches, type) {
	// construct array of fetches
	// round up, and subtract 1 for the initial fetch of page 1
	// add 2 to index to account for removal of page 1
	const fetchArray = new Array(Math.ceil(numOfFetches - 1))
	.fill(0)
	.map(async (ele, idx) => {
		const q = createQuery(query, { page: idx + 2 });
		return await fetchFromEndpoint(type)(q);
	});

	// make fetches in parallel
	return await (await Promise.all(fetchArray))[0];
}

function getCategory(query) {
	const { category } = query;
	return category;
}

// caches the category to track when a different category page is rendered
function cacheCategory(category) {
	getNews.cache.category = category;
}

function checkCategoryCache(query) {
	const category = getCategory(query);
	// if there is no cached category
	if (!getNews.cache.category) cacheCategory(category);

	// if cached category is old from incoming category
	if (category !== getNews.cache.category) {
		getNews.clearArticlesCache('category-news');
		cacheCategory(category);
	}
}

// initialize cache
getNews.cache = {};
getNews.cache.category = '';
getNews.cache['top-news'] = [];
getNews.cache['category-news'] = [];
getNews.cache.time = new Date();

getNews.storeArticles = (articles, type) => {
	getNews.cache[type] = [...getNews.cache[type], ...articles];
};

getNews.clearArticlesCache = type => {
  getNews.cache[type] = [];
};

module.exports = {
	getNews,
	buildUserNews
};

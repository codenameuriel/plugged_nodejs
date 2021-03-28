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
		// handling news by category, sources, does not apply for top-news news
		if (type !== 'top-news') {
			// handles changes to news types i.e. category, sources, etc
			// extracts the news type and value from the query
			const newsTypeData = getNewsTypeAndValue(query, type);

			// either caches the data or updates existing cached data
			updateNewsTypeCache(newsTypeData);
		}

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
			// articles have been cached but 15 minutes have not passed
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
	// add 2 to index to account for 0 index and removal of page 1
	const fetchArray = (
		new Array(Math.ceil(numOfFetches - 1))
			.fill(0)
			.map(async (ele, idx) => {
				const q = createQuery(query, { page: idx + 2 });
				return await fetchFromEndpoint(type)(q);
			})
	);

	// make fetches in parallel
	return await (await Promise.all(fetchArray))[0];
}

function getCategory(query) {
	const { category } = query;
	return category;
}

// news api uses "sources" as a parameter to fetch news by source/sources
function getSources(query) {
	const { sources } = query;
	return sources;
}

// caches news type i.e. category, sources, etc
function cacheNewsType(type, value) {
	getNews.cache[type] = value;
}

// restructure the query object to an object
// the news type, i.e. category will be assigned to type
// the news type data i.e. business will be assigned to value
function getNewsTypeAndValue(query, type) {
	// splits type i.e. category-news => category
	type = type.split('-')[0];
	let value;

	switch (type) {
		case 'category':
			value = getCategory(query);
			break;
		case 'sources':
			value = getSources(query);
			break;
		default:
			return;
	}

	return { type, value };
}

// function either sets value for a type i.e. category = business, source = ign
// or updates the currently value for a type
function updateNewsTypeCache({ type, value }) {
	// if there is no cached news type data
	if (!getNews.cache[type]) cacheNewsType(type, value);

	// if cached new type data is outdated 
	if (value !== getNews.cache[type]) {
		getNews.clearArticlesCache(`${type}-news`);
		cacheNewsType(type, value);
	}
}

// initialize cache
getNews.cache = {};
getNews.cache.category = '';
getNews.cache.sources = '';
getNews.cache['top-news'] = [];
getNews.cache['category-news'] = [];
getNews.cache['sources-news'] = [];
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

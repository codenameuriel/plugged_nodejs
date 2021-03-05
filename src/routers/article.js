const express = require('express');
const newsapi = require('../newsapi');
const { 
	createQuery, defaultCountryQuery, defaultPaginationQuery 
} = require('../utils/queries');
const { calculateNumOfPages, perPage } = require('../utils/pagination');
const { getNews, buildUserNews } = require('../utils/news');

const router = new express.Router();

const Article = require('../models/article');

router.get('/top-news', async ({ query }, res) => {
	try {
		// create query for api call
		const apiQuery = createQuery({ page: 1 }, defaultCountryQuery());
		// initial request to get news
		const articles = await getNews(apiQuery);

		// calculate total pages needed to render 9 articles per page
		const totalPages = calculateNumOfPages(articles.length)();
		
		// initial page load will not provide a query
		if (!Object.keys(query).length) {
			res.status(200).send({ 
				articles: articles.slice(0, perPage()), totalPages 
			});
		} else {
			const to = query.page * perPage();
			const from = to - perPage(); 
			res.status(200).send({ articles: articles.slice(from, to), totalPages });
		}
	} catch (error) {
		console.error(error);
		res.status(400).send({ message: error.message });
	}
});

router.get('/category-news', async ({ query }, res) => {
	try {
		const baseQuery = createQuery(
			defaultPaginationQuery(),
			defaultCountryQuery()
		);

		// update base queries with category query
		const updatedQuery = createQuery(baseQuery, query);
		const data = await newsapi.v2.topHeadlines(updatedQuery);
		const { articles } = data;

		res.status(200).send(articles);
	} catch (error) {
		console.error(error);
		res.status(500).send(error);
	}
});

// provides an array of source objects
router.get('/sources', async (req, res) => {
	try {
		const baseQuery = defaultCountryQuery();
		const data = await newsapi.v2.sources(baseQuery);
		const { sources } = data;

		res.status(200).send(sources);
	} catch (error) {
		console.error(error);
		res.status(500).send(error);
	}
});

router.get('/source-news', async (req, res) => {
	try {
		const query = createQuery(defaultPaginationQuery(), query);
		const data = await newsapi.v2.topHeadlines(query);
		const { articles } = data;

		res.status(200).send(articles);
	} catch (error) {
		console.error(error);
		res.status(500).send(error);
	}
});

router.get('/topic-news', async ({ query }, res) => {
	try {
		console.log('inside topic-news')
		const apiQuery = createQuery(defaultPaginationQuery(), query);
		const data = await newsapi.v2.everything(apiQuery);

		console.log(data)

		console.log(data)
		const { articles, totalResults } = data;
		const totalPages = calculateNumOfPages(totalResults)();

		res.status(200).send({ articles, totalPages });
	} catch (error) {
		console.error(error);
		res.status(500).send(error);
	}
});

router.get('/dashboard-news', async ({ query }, res) => {
	// store categories string in categoriesQuery
	const { categories: categoriesQuery } = query;
	
	// if user is authenticated and subscribed to news categories
	if (categoriesQuery) {
		try {
			let apiQuery = createQuery(
				defaultPaginationQuery(),
				defaultCountryQuery()
			);
	
			// create an array of category elements
			const categories = categoriesQuery.split(',');
	
			// fetch user news in parallel from news api 
			// build an object that aggregates news by category using the categories array and query
			const userNews = await buildUserNews(apiQuery, categories, 'category');
	
			res.status(200).send(userNews);
		} catch (error) {
			console.error(error);
			res.status(500).send(error);
		}
	} else {
		// user is authenticated but is not subscribed to news categories
		res.status(200).send({});
	}
});

// router.post("/add-to-collection", async ({ body }, res) => {
//   const article = new Article({ ...body });

//   try {

//   } catch (error) {

//   }
// });

module.exports = router;

/** @format */

const express = require('express');

const { createQuery, defaultCountryQuery } = require('../utils/queries');
const { calculateNumOfPages, perPage } = require('../utils/pagination');
const { getTopNews, buildUserNews } = require('../utils/news');

const router = new express.Router();

const Article = require('../models/article');

router.get('/top-news', async ({ query }, res) => {
	try {
		// initial request to get news
		const articles = await getTopNews({ page: 1 }, defaultCountryQuery());

		// calculate total pages needed to render 9 articles per page
		const totalPages = calculateNumOfPages(articles.length)();
		
		// if query is empty, initial page load
		if (!Object.keys(query).length) {
			res.status(200).send({ articles: articles.slice(0, perPage()), totalPages });
		} else {
			const to = query.page * perPage();
			const from = to - perPage(); 
			res.status(200).send({ articles: articles.slice(from, to), totalPages });
		}
	} catch (error) {
		console.log(error);
		res.status(400).send({
			message: error.message
		});
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
		res.status(500).send(error);
	}
});

router.get('/topic-news', async ({ query: userQuery }, res) => {
	try {
		const query = createQuery(defaultPaginationQuery(), userQuery);
		const data = await newsapi.v2.everything(query);
		const { articles, totalResults } = data;
		const totalPages = calculateNumOfPages(totalResults)();

		res.status(200).send({ articles, totalPages });
	} catch (error) {
		res.status(500).send(error);
	}
});

router.get('/dashboard-news', async ({ query: userQuery }, res) => {
	try {
		// create base query
		let query = createQuery(
			defaultPaginationQuery(),
			defaultCountryQuery()
		);

		// destructure query object and store categories string in categoriesQuery variable
		const { categories: categoriesQuery } = userQuery;

		// split string into an array of category strings
		const categories = categoriesQuery.split(',');

		// fetch user news by query params to news api in parallel
		// build an object that aggregates news
		const userNews = await buildUserNews(query, categories, 'category');

		res.status(200).send(userNews);
	} catch (error) {
		console.log(error);
		res.status(500).send(error);
	}
});

// router.post("/add-to-collection", async ({ body }, res) => {
//   const article = new Article({ ...body });

//   try {

//   } catch (error) {

//   }
// });

module.exports = router;

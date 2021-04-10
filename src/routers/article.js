const express = require('express');
const newsapi = require('../newsapi');
const { 
	createQuery, defaultCountryQuery, defaultPaginationQuery 
} = require('../utils/queries');
const { calculateNumOfPages, perPage } = require('../utils/pagination');
const { getNews, buildUserNews } = require('../utils/news');

const router = new express.Router();

const Article  = require('../models/article');
const User = require('../models/user');
const Source = require('../models/source');

router.get('/top-news', async ({ query }, res) => {
	try {
		// create query for api call
		const apiQuery = createQuery({ page: 1 }, defaultCountryQuery());

		// initial request to get news
		const articles = await getNews(apiQuery, 'top-news');

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
		const apiQuery = createQuery({ page: 1 }, defaultCountryQuery(), query);
		const articles = await getNews(apiQuery, 'category-news');
		const totalPages = calculateNumOfPages(articles.length)();
		
		// initial page load will only include the category query
		if (Object.keys(query).length === 1) {
			res.status(200).send({ 
				articles: articles.slice(0, perPage()), 
				totalPages 
			});
		} else {
			const to = query.page * perPage();
			const from = to - perPage(); 
			res.status(200).send({ articles: articles.slice(from, to), totalPages });
		}
	} catch (error) {
		console.error(error);
		res.status(500).send(error);
	}
});

router.get('/sources', async (req, res) => {
	try {
		// get array of Sources from MongoDB database
		const sources = await Source.find({});
		// use object to map source category to array of sources by category
		const sourcesMap = {};

		// fill out sources map
		// reassign image field to base 64 string for client side rendering
		for (let source of sources) {
			if (!(source.category in sourcesMap)) {
				sourcesMap[source.category] = (
					sources
						.filter(s => s.category === source.category)
						.map(s => ({ ...s, image: s.image.toString('base64') }))
				);
			}
		}
		
		res.status(200).send(sourcesMap);
	} catch (error) {
		console.error(error);
		res.status(500).send(error);
	}
});

router.get('/sources-news', async ({ query }, res) => {
	try {
		// does include country query because news api does not allow it for sources
		const apiQuery = createQuery({ page: 1 }, query);
		const articles = await getNews(apiQuery, 'sources-news');
		const totalPages = calculateNumOfPages(articles.length)();

		// initial page load will only include the news type query
		if (Object.keys(query).length === 1) {
			res.status(200).send({ 
				articles: articles.slice(0, perPage()), 
				totalPages 
			});
		} else {
			const to = query.page * perPage();
			const from = to - perPage(); 
			res.status(200).send({ 
				articles: articles.slice(from, to), 
				totalPages 
			});
		}
	} catch (error) {
		console.error(error);
		res.status(500).send(error);
	}
});

router.get('/topic-news', async ({ query }, res) => {
	try {
		const apiQuery = createQuery(defaultPaginationQuery(), query);
		const data = await newsapi.v2.everything(apiQuery);
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

// handles adding news stories to user collection
router.post('/add-to-collection', async ({ body }, res) => {
  try {
		// find user
		const user = await User.findOne({ username: body.username });

		// create article with user as owner
		const article = new Article({ 
			...body.newsStory,
			owner:  user._id
		});

		// save article to database
		await article.save();

		const articles = await user.getArticles();

		// send back newly updated user news story collection
		res.status(200).send(articles);
  } catch (error) {
		console.error(error);
  }
});

router.delete('/remove-from-collection/:id', async (req, res) => {
	try {
		const article = await Article.findOneAndDelete({
			_id: req.params.id
		});

		if (!article) return res.status(404).send();

		const user = await User.findOne({ _id: article.owner._id });
		const articles = await user.getArticles();

		res.send(articles);
	} catch (error) {
		console.error(error);
		res.status(500).send(error);
	}
});

module.exports = router;

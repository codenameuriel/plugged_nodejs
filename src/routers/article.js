const express = require("express");
const newsapi = require("../newsapi");
const { updateQueries, defaultPaginationQueries, defaultCountryQuery } = require("../utils/queries");
const { totalNumberOfPages } = require("../utils/pagination");
const router = new express.Router();
const Article = require("../models/article");

router.get("/top-news", async ({ query }, res) => {
  try {
    // construct base queries
    let queries = { ...defaultPaginationQueries(), ...defaultCountryQuery() };

    // if user provided queries, add the user's queries to the base queries
    if (query) queries = updateQueries(queries, query);
 
    // api call for top headlines providing constructed queries object
    const data = await newsapi.v2.topHeadlines(queries);

    // calculate total amount of pages needed to render new articles (9 per page)
    const newsPerPage = totalNumberOfPages(data.totalResults);
    const totalPages = newsPerPage();
    // destructure data object and store articles array in articles variable
    const { articles } = data;

    // return to client-side an object with articles and totalPages
    res.status(200).send({ articles, totalPages });
  } catch (error) {
    res.status(500).send(error);
  }
});

router.get("/category-news", async ({ query }, res) => { 
  try {
    const queries = (
      updateQueries(defaultCountryQuery(), defaultPaginationQueries(), query)
    );
    const data = await newsapi.v2.topHeadlines(queries);
    const { articles } = data;

    res.status(200).send(articles);
  } catch (error) {
    res.status(500).send(error);
  }
});

// provides an array of source objects
router.get("/sources", async ({ query }, res) => { 
  try {
    const queries = defaultCountryQuery();
    const data = await newsapi.v2.sources(queries);
    const { sources } = data;

    res.status(200).send(sources);
  } catch (error) {
    res.status(500).send(error);
  }
});

router.get("/source-news", async ({ query }, res) => { 
  try {
    let queries = updateQueries(defaultPaginationQueries(), query);
    const data = await newsapi.v2.topHeadlines(queries);
    const { articles } = data;

    res.status(200).send(articles);
  } catch (error) {
    res.status(500).send(error);
  }
});

router.get("/topic-news", async ({ query }, res) => { 
  try {
    let queries = updateQueries(defaultPaginationQueries(), query);
    const data = await newsapi.v2.everything(queries);
    const { articles } = data;

    res.status(200).send(articles);
  } catch (error) {
    res.status(500).send(error);
  }
});

router.get("/dashboard-news", async ({ query }, res) => { 
  try {
    let queries = { ...defaultPaginationQueries(), ...defaultCountryQuery() };
    console.log(queries);
    const { categories: categoriesQuery } = query; 
    const categories = categoriesQuery.split(",");
    let newsByCategories = {};

    categories.forEach(async category => {
      queries = updateQueries(queries, { category: category });
      const data = await newsapi.v2.topHeadlines(queries);
      newsByCategories = { ...newsByCategories, [category]: data.articles };
    });

    res.status(200).send(newsByCategories);
  } catch (error) {
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
const express = require("express");
const newsapi = require("../newsapi");
const { createQuery, defaultPaginationQuery, defaultCountryQuery } = require("../utils/queries");
const { calculateNumOfPages } = require("../utils/pagination");
const router = new express.Router();
const Article = require("../models/article");

router.get("/top-news", async ({ query: userQuery }, res) => {
  try {
    // construct base query
    let query = (
      createQuery(defaultPaginationQuery(), defaultCountryQuery())
    );

    // if user provided queries, add the user's queries to the base query
    if (Object.keys(userQuery).length > 0) {
      query = createQuery(query, userQuery);
    }
 
    // api call for top headlines providing constructed queries object
    const data = await newsapi.v2.topHeadlines(query);
    
    // destructure data object
    const { articles, totalResults } = data;

    // calculate total amount of pages needed to render new articles (9 per page)
    const totalPages = calculateNumOfPages(totalResults)();

    // return to client-side an object with articles and totalPages
    res.status(200).send({ articles, totalPages });
  } catch (error) {
    res.status(500).send(error);
  }
});

router.get("/category-news", async ({ query }, res) => { 
  try {
    const baseQuery = (
      createQuery(defaultPaginationQuery(), defaultCountryQuery())
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
router.get("/sources", async (req, res) => { 
  try {
    const baseQuery = defaultCountryQuery();
    const data = await newsapi.v2.sources(baseQuery);
    const { sources } = data;

    res.status(200).send(sources);
  } catch (error) {
    res.status(500).send(error);
  }
});

router.get("/source-news", async (req, res) => { 
  try {
    const query = createQuery(defaultPaginationQuery(), query);
    const data = await newsapi.v2.topHeadlines(query);
    const { articles } = data;

    res.status(200).send(articles);
  } catch (error) {
    res.status(500).send(error);
  }
});

router.get("/topic-news", async ({ query: userQuery }, res) => { 
  try {
    const query = createQuery(defaultPaginationQuery(), userQuery);
    const data = await newsapi.v2.everything(query);
    const { articles } = data;

    res.status(200).send(articles);
  } catch (error) {
    res.status(500).send(error);
  }
});

router.get("/dashboard-news", async ({ query: userQuery }, res) => { 
  try {
    // create base query
    let query = (
      createQuery(defaultPaginationQuery(), defaultCountryQuery())
    );

    // destructure query object and store categories string in categoriesQuery variable
    const { categories: categoriesQuery } = userQuery; 

    // split string into an array of category strings
    const categories = categoriesQuery.split(",");

    // initialize object that will contain k:v pairs -> category name : array of news
    let newsByCategories = {};

    // iterate over array of category strings
    // for each category string create a query object adding a category property that maps to the category string
    // make an api call with the query containing the category
    // update the newsByCategories object by adding the k:v pair -> category name : array of news
    categories.forEach(async category => {
      query = createQuery(query, { category: category });
      const data = await newsapi.v2.topHeadlines(query);
      const { articles } = data;
      newsByCategories = { ...newsByCategories, [category]: articles };
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
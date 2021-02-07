const express = require("express");
const newsapi = require("../newsapi");
const { updateQueries, defaultPaginationQueries, defaultCountryQuery } = require("../utils/queries");
const { totalNumberOfPages } = require("../utils/pagination");
const router = new express.Router();
const Article = require("../models/article");

router.get("/top-news", async ({ query }, res) => {
  try {
    let queries = updateQueries(defaultCountryQuery(), defaultPaginationQueries());
    if (query) queries = updateQueries(queries, query);
 
    const data = await newsapi.v2.topHeadlines(queries);
    const totalPages = totalNumberOfPages(data.totalResults)();
    const { articles } = data;

    res.status(200).send({ articles, totalPages });
  } catch (error) {
    res.status(500).send(error);
  }
});

router.get("/category-news", async ({ query }, res) => { 
  try {
    const queries = updateQueries(defaultCountryQuery(), defaultPaginationQueries(), query);
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

// router.post("/add-to-collection", async ({ body }, res) => { 
//   const article = new Article({ ...body });

//   try {

//   } catch (error) {

//   }
// });

module.exports = router;
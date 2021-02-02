const express = require("express");
const { getNews, getSourceNews } = require("../newsAPI");
const { updateQueries, defaultPaginationQueries, defaultCountryQuery } = require("../utils/queries");
const router = new express.Router();

router.get("/top-news", async (req, res) => {
  try {
    let queries = updateQueries(defaultCountryQuery(), defaultPaginationQueries());
    if (req.query) queries = updateQueries(queries, req.query);
    const data = await getNews(queries);
    const { articles } = data;
    res.status(200).send(articles);
  } catch (error) {
    res.status(500).send(error);
  }
});

router.get("/category-news", async (req, res) => { 
  try {
    let queries = updateQueries(defaultCountryQuery(), defaultPaginationQueries());
    // will always at least receive a user-provided category query
    updateQueries(queries, req.query);
    const data = await getNews(queries);
    const { articles } = data;
    res.status(200).send(articles);
  } catch (error) {
    res.status(500).send(error);
  }
});

// provides an array of source objects
router.get("/source-news", async (req, res) => { 
  try {
    let queries = defaultQueries();
    updateQueries(queries)(req.query);
  } catch (error) {

  }
});

module.exports = router;
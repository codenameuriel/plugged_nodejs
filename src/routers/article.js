const express = require("express");
const { getNews, getSources } = require("../newsAPI");
const { updateQueries, defaultPaginationQueries, defaultCountryQuery } = require("../utils/queries");
const router = new express.Router();

router.get("/top-news", async ({ query }, res) => {
  try {
    let queries = updateQueries(defaultCountryQuery(), defaultPaginationQueries());
    if (query) queries = updateQueries(queries, query);
    const data = await getNews(queries);
    const { articles } = data;
    res.status(200).send(articles);
  } catch (error) {
    res.status(500).send(error);
  }
});

router.get("/category-news", async ({ query }, res) => { 
  try {
    let queries = updateQueries(defaultCountryQuery(), defaultPaginationQueries());
    // will always receive a minimum user-provided category query
    updateQueries(queries, query);
    const data = await getNews(queries);
    const { articles } = data;
    res.status(200).send(articles);
  } catch (error) {
    res.status(500).send(error);
  }
});

// provides an array of source objects
router.get("/sources", async (req, res) => { 
  try {
    let queries = defaultCountryQuery();
    const data = await getSources(queries);
    const { sources } = data;
    res.status(200).send(data);
  } catch (error) {
    res.status(500).send(error);
  }
});

module.exports = router;
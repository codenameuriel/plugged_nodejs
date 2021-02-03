const express = require("express");
const { getNews, getSources, getTopicNews } = require("../newsAPI");
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
    const queries = updateQueries(defaultCountryQuery(), defaultPaginationQueries(), query);
    const data = await getNews(queries);
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
    const data = await getSources(queries);
    const { sources } = data;
    res.status(200).send(sources);
  } catch (error) {
    res.status(500).send(error);
  }
});

router.get("/source-news", async ({ query }, res) => { 
  try {
    let queries = updateQueries(defaultPaginationQueries(), query);
    const data = await getNews(queries);
    const { articles } = data;
    res.status(200).send(articles);
  } catch (error) {
    res.status(500).send(error);
  }
});

router.get("/topic-news", async ({ query }, res) => { 
  try {
    let queries = updateQueries(defaultPaginationQueries(), query);
    const data = await getTopicNews(queries);
    const { articles } = data;
    res.status(200).send(articles);
  } catch (error) {
    res.status(500).send(error);
  }
});

module.exports = router;
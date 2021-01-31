const express = require("express");
const { getNews } = require("../newsAPI");
const { updateQueries, defaultQueries } = require("../utils/queries");
const router = new express.Router();

router.get("/top-news", async (req, res) => {
  try {
    let queries = defaultQueries();
    if (req.query) queries = updateQueries(queries)(req.query);
    const data = await getNews(queries);
    const { articles } = data;
    res.status(200).send(articles);
  } catch (error) {
    res.status(500).send(error);
  }
});

router.get("/category-news", async (req, res) => { 
  try {
    let queries = defaultQueries();
    // will always at least receive a user-provided category query
    updateQueries(queries)(req.query);
    const data = await getNews(queries);
    const { articles } = data;
    res.status(200).send(articles);
  } catch (error) {
    res.status(500).send(error);
  }
});

module.exports = router;
const express = require("express");
const { getTopNews } = require("../newsAPI");
const { updateQueries, defaultTopNewsQueries } = require("../utils/queries");
const router = new express.Router();

router.get("/top-news", async (req, res) => {
  try {
    let queries = defaultTopNewsQueries();
    if (req.query) queries = updateQueries(queries)(req.query);

    const data = await getTopNews(queries);
    const { articles } = data;
    console.log(articles);
    res.status(200).send(articles);
  } catch (error) {
    res.status(500).send(error);
  }
});

module.exports = router;
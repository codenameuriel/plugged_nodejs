const express = require("express");
const { topNews } = require("../axios");
const router = new express.Router();

router.get("/top-news", async (req, res) => { 
  try {
    const response = await topNews.get();
    const { articles } = response.data;

    res.status(200).send(articles);
  } catch (error) {
    console.error(error);
  }
});

module.exports = router;
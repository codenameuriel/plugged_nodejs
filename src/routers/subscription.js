const express = require('express');

const router = new express.Router();

const User = require('../models/user');

router.post("/subscribe/categories", async (req, res) => {
  try {
    const { body: { username, categories } } = req;
    const user = await User.findOne({ username });

    const categoriesArray = categories.split(',');
    await user.addCategories(categoriesArray);

    const updatedCategories = user.formattedCategories();

    res.status(200).send({ categories: updatedCategories });
  } catch (error) {
    console.error(error);
    res.status(400).send({ error: error.message });
  }
});

module.exports = router;
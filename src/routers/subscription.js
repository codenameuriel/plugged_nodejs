const express = require('express');

const router = new express.Router();

const User = require('../models/user');

router.post("/subscriptions/categories", async (req, res) => {
  try {
    const { body: { username, categories, isSubscribed } } = req;
    const user = await User.findOne({ username });

    // check whether to add or remove categories from user's categories
    if (!isSubscribed) await user.addCategories(categories);
    else await user.removeCategories(categories);
    
    const updatedCategories = user.formattedCategories();

    // return array of user's categories
    res.status(200).send(updatedCategories);
  } catch (error) {
    console.error(error);
    res.status(400).send({ error: error.message });
  }
});

module.exports = router;
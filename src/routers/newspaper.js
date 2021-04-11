const express = require('express');

const router = new express.Router();

const User = require('../models/user');
const Source = require('../models/source');
const Newspaper = require('../models/newspaper');

router.post('/newspaper', async ({ body }, res) => {
  try {
    // find user
    const user = await User.findOne({ username: body.username });

    // find sources
    // create array of source objects with 'source' property pointing to an id
    // of a source object in database
    // returns an array of async searches
    const sourceSearches = body.sources.map(async (source) => {
      return { source: (await Source.findOne({ name: source }))._id };
    });

    // resolve searches in parallel
    const sources = await (Promise.all(sourceSearches));

    // format categories for newspaper model
    const categories = body.categories.map(category => ({ category }));

    // format topics for newspaper model
    const topics = body.topics.map(topic => ({ topic }));

    const newspaper = new Newspaper({
      owner: user._id,
      title: body.newspaperTitle,
      categories,
      sources,
      topics
    });

    await newspaper.save();
    res.redirect('/newspapers/all');
  } catch (error) {
    console.error(error);
    res.status(500).send(error);
  }
});

module.exports = router;

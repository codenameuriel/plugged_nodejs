const express = require('express');

const router = new express.Router();

const User = require('../models/user');
const Source = require('../models/source');
const Newspaper = require('../models/newspaper');

// create a newspaper for user
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
    res.redirect('/newspaper/view?user=' + user._id);
  } catch (error) {
    console.error(error);
    res.status(500).send(error);
  }
});

// get all users newspapers
router.get('/newspaper/view', async (req, res) => {
  try {
    // find user
    const user = await User.findOne({ _id: req.query.user });
    // populate users newspaper instances
    await user.populate('newspapers').execPopulate();
  
    // send back an object with users newspapers
    res.send({ newspapers: user.newspapers });
  } catch (error) {
    console.log(error);
  }
});

module.exports = router;

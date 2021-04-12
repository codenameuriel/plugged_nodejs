const express = require('express');

const router = new express.Router();

const User = require('../models/user');
const Source = require('../models/source');
const Newspaper = require('../models/newspaper');

// create a Newspaper for user
router.post('/newspaper', async (req, res) => {
  const { username, newspaperTitle, categories, sources, topics } = req.body;
  try {
    // find user
    const user = await User.findOne({ username });
    
    // format attributes to instantiate a Newspaper
    const formattedCategories = categories.map(category => ({ category }));
    const formattedSources = sources.map(source => ({ source }));
    const formattedTopics = topics.map(topic => ({ topic }));

    // instantiate a Newspaper
    const newspaper = new Newspaper({
      owner: user._id,
      title: newspaperTitle,
      categories: formattedCategories,
      sources: formattedSources,
      topics: formattedTopics
    });

    // save Newspaper to database
    await newspaper.save();
    
    // redirect to return all newspapers back to client-side
    res.redirect('/newspaper/view-all?user=' + user._id);
  } catch (error) {
    console.error(error);
    res.status(500).send(error);
  }
});

// get all users Newspapers
router.get('/newspaper/view-all', async (req, res) => {
  try {
    // find user
    const user = await User.findOne({ _id: req.query.user });
    
    // populate users newspaper instances
    await user.populate('newspapers').execPopulate();
  
    // send back array of users newspapers
    res.send(user.newspapers);
  } catch (error) {
    console.log(error);
  }
});

module.exports = router;

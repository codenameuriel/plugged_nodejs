const express = require("express");
const User = require("../models/user");
const router = new express.Router();

router.post("/signup", async ({ body: { username, password, categories} }, res) => { 
  try {
    const userData = { username, password };
    const user = new User(userData);

    // bcrypt middleware hashes password before saving
    await user.save();

    await user.addCategories(categories);

    // JSON auth token is generated and added to the users collection of tokens to track various points of login
    const token = await user.generateAuthToken();

    const returnedUser = { username: user.username, tokens: user.tokens, categories: user.formattedCategories() };

    res.status(201).send({ returnedUser, token });
  } catch (error) {
    res.status(400).send(error);
  }
});

router.post("/login", async ({ body: { username, password } }, res) => { 
  try {
    // if user is not found or password does not match hashed password, will throw error
    const user = await User.findByCredentials(username, password);
    const token = await user.generateAuthToken();

    res.send({ user, token });
  } catch (error) {
    res.status(404).send(error);
  }
});

module.exports = router;
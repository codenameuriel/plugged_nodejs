const express = require("express");
const User = require("../models/user");
const router = new express.Router();

router.post("/signup", async ({ body }, res) => { 
  const user = new User(body);
  try {
    // bcrypt middleware hashes password before saving
    await user.save();

    // JSON auth token is generated and added to the users collection of tokens to track various points of login
    const token = await user.generateAuthToken();

    res.status(201).send({ user, token });
  } catch (error) {
    res.status(400).send(error);
  }
});

router.post("/login", async ({ body: { username, password }}, res) => { 
  try {
    console.log(username, password);
    // if user is not found or password does not match hashed password, will throw error
    const user = await User.findByCredentials(username, password);
    const token = await user.generateAuthToken();

    res.send({ user, token });
  } catch (error) {
    res.status(404).send(error);
  }
});

module.exports = router;
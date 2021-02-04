const express = require("express");
const User = require("../models/user");
const router = new express.Router();

router.post("/signup", async ({ body }, res) => { 
  console.log(body);
  const user = new User(body);
  try {
    // bcrypt middleware executes hashing password before saving
    await user.save();

    // JSON auth token is generated and added to the users collection of tokens to track various points of login
    const token = await user.generateAuthToken();
    console.log(user);
    res.status(201).send({ user, token });
  } catch (error) {
    res.status(400).send(error);
  }
});

module.exports = router;
const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const { Article, articleSchema } = require('./article');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    trim: true,
    minlength: 4,
    validate(value) {
      if (value.match(/password/i)) {
        throw new Error("Password cannot contain password");
      }
    }
  },
  categories: [
    {
      category: {
        type: String
      }
    }
  ],
  articles: [
    {
      article: {
        type: articleSchema
      }
    }
  ],
  tokens : [
    {
      token : {
        type: String,
        require: true
      }
    }
  ]
});

// INSTANCE METHODS

// User instance method to generate a JSON auth token upon user logging in/signing up
userSchema.methods.generateAuthToken = async function() {
  const user = this;
  const token = jwt.sign({ _id: user._id.toString() }, `newuser:${user.username}createdviaPlugged`);

  user.tokens = user.tokens.concat({ token });
  await user.save();

  return token;
}

// User instance method to prevent sending to client-side a user's password or tokens upon logging in/signing up
userSchema.methods.toJSON = function() {
  const user = this;
  const userObject = user.toObject();
  
  delete userObject.password;
  delete userObject.tokens;

  return userObject;
}

// User instance method to add subscribed categories to User's categories list
userSchema.methods.addCategories = async function(categories) {
  const user = this;
  const userCategories = categories.map(cat => ({ category: cat }));

  user.categories = [...user.categories, ...userCategories];
  await user.save();

  return user;
}

// User instance method to reformat user's categories data for client-side consumption
userSchema.methods.formattedCategories = function() {
  const user = this;

  return user.categories.map(cat => cat.category);
}

// adds article's id to the user's articles 
userSchema.methods.addToArticles = async function(article) {
  // add article to user's articles
  this.articles = [...this.articles, article];
  await this.save();
  return this;
}

// create array of articles for client-side rendering
userSchema.methods.mapArticles = async function() {
  let userArticles = this.articles.map(async (article) => {
    return Article.findOne({ _id: article._id });
  });

  return Promise.all(userArticles);
}

// CLASS METHODS

// User class method to authenticate User instances by email and password
userSchema.statics.findByCredentials = async (username, password) => {
  const user = await User.findOne({ username });
  if (!user) throw new Error("Unable to authenticate!");

  // user.password === hashed password in database
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw new Error("Unable to authenticate!");

  return user;
};

// middleware to hash user password before saving it to the database
userSchema.pre("save", async function(next) {
  const user = this;

  if (user.isModified("password")) {
    user.password = await bcrypt.hash(user.password, 8)
  }

  next();
});

const User = mongoose.model("User", userSchema);

module.exports = User;
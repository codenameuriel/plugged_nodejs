const mongoose = require("mongoose");
// const validator = require("validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const Article = require('./article');

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
  tokens : [
    {
      token : {
        type: String,
        require: true
      }
    }
  ]
});

// VIRTUAL PROPERTY

// assign an articles property for the user instance to access their added articles
userSchema.virtual('articles', {
  ref: 'Article',
  localField: '_id',
  foreignField: 'owner'
});

// assign newspapers property for user instance
// will allow access to all newspapers belonging to user
userSchema.virtual('newspapers', {
  ref: 'Newspaper',
  localField: 'id',
  foreignField: 'owner'
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

userSchema.methods.removeCategories = async function(categories) {
  let subscribedCategories = this.categories;

  categories.forEach(category => {
    subscribedCategories = subscribedCategories.filter(catObj => catObj.category !== category);
  });

  this.categories = subscribedCategories;
  await this.save();
  
  return this;
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

// create array of articles for client-side rendering
userSchema.methods.getArticles = async function() {
  return await Article.find({ owner: this._id });
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
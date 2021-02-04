const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

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
    minlength: 7,
    validate(value) {
      if (value.match(/password/i)) {
        throw new Error("Password cannot contain password");
      }
    }
  },
  tokens : [
    {
      token : {
        type: String,
        require: true
      }
    }
  ]
});

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

// User class method to authenticate User instances by email and password
userSchema.statics.findByCredentials = async (username, password) => {
  const user = await User.findOne({ username });
  if (!user) throw new Error("Unable to login!");

  // user.password === hashed password in database
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw new Error("Unable to login!");

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
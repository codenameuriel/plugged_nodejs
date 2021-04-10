const mongoose = require("mongoose");

const newspaperSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  categories: [
    {
      category: {
        type: String
      }
    } 
  ],
  sources: [
    {
      source: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Source'
      }
    }
  ],
  topics: [
    {
      topic: {
        type: String
      }
    }
  ],
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  }
});

const Newspaper = mongoose.model("Newspaper", newspaperSchema);

module.exports = Newspaper;

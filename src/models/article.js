const mongoose = require("mongoose");

const articleSchema = new mongoose.Schema({
  source: {
    type: String
  },
  author: {
    type: String
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  url: {
    type: String,
    required: true
  },
  urlToImage: {
    type: String,
    required: true
  },
  publishedAt: {
    type: String,
    required: true
  },
  content: {
    type: String
  }
}, { timestamps: true });

const Article = mongoose.model("Article", articleSchema);

module.exports = Article;
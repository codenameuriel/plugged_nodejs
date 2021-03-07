const mongoose = require("mongoose");

const articleSchema = new mongoose.Schema({
  source: {
    type: String
  },
  author: {
    type: String
  },
  title: {
    type: String
  },
  description: {
    type: String
  },
  url: {
    type: String
  },
  urlToImage: {
    type: String
  },
  publishedAt: {
    type: String
  },
  content: {
    type: String
  }
}, { timestamps: true });

const Article = mongoose.model("Article", articleSchema);

module.exports = {
  Article,
  articleSchema
};

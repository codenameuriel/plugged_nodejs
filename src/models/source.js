const mongoose = require('mongoose');

const sourceSchema = new mongoose.Schema({
  id: {
    type: String
  },
  name: {
    type: String
  },
  description: {
    type: String
  },
  url: {
    type: String
  },
  category: {
    type: String
  },
  language: {
    type: String
  },
  country: {
    type: String
  },
  image: {
    type: Buffer
  }
});

const Source = mongoose.model('Source', sourceSchema);

module.exports = Source;

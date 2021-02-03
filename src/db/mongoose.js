const mongoose = require("mongoose");

mongoose.connect("mongodb://127.0.0.1:27017/plugged-api", {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false,
  useUnifiedTopology: true
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));

const express = require("express");
const cors = require("cors");
require("./db/mongoose");
const articleRouter = require("./routers/article");

const app = express();
const port = 8000;

app.use(cors());
app.use(articleRouter);

app.listen(port, () => {
  console.log(`Server up on port ${port}`);
});
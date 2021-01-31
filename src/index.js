const express = require("express");
const articleRouter = require("./routers/article");

const app = express();
const port = 8000;

app.use(articleRouter);

app.listen(port, () => {
  console.log(`Server up on port ${port}`);
});
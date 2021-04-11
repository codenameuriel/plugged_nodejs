const express = require('express');
const cors = require('cors');
require('./db/mongoose');

const articleRouter = require('./routers/article');
const userRouter = require('./routers/user');
const subscriptionRouter = require('./routers/subscription');
const newspaperRouter = require('./routers/newspaper');

const app = express();
const port = 8000;

app.use(cors());
app.use(express.json());
app.use(articleRouter);
app.use(userRouter);
app.use(subscriptionRouter);
app.use(newspaperRouter);

app.listen(port, () => {
	console.log(`Server up on port ${port}`);
});

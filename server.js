import router from './routes/index';

const express = require('express');

const app = express();

app.use(router);

const port = process.env.PORT || 5000;
app.listen(port);

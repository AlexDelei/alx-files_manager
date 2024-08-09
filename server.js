const app = require('./routes/index');

const port = process.env.PORT || 5000;
app.listen(port);

export default app;

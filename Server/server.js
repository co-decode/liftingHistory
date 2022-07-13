const port = process.env.PORT || 3001;
const makeRouter = require('./src/session/routes');
const makeApp = require('./app');
const app = makeApp(makeRouter());

app.listen(port, () => console.log(`app listening on port ${port}`));
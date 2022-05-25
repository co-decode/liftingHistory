const express = require('express');
const sessionRoutes = require('./src/session/routes');
const app = express();
const port = process.env.PORT || 3001;

const cors = require('cors');

app.use(
    cors({
        origin: "*"
    })
)

app.use(express.json());

app.get("/", (req, res) => {
    res.send("Hello World!");
})   

app.use('/sessions', sessionRoutes);

app.listen(port, () => console.log(`app listening on port ${port}`))
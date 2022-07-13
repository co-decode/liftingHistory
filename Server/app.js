const express = require('express');
const makeRouter = require('./src/session/routes');
const cors = require('cors');


function makeApp(sessionRoutes) { 
    const app = express();

    app.use(
        cors({
            origin: '*',
        })
    )

    app.use(express.json());

    app.get("/", (req, res) => {
        res.send("Hello World!");
    })   

    app.use('/sessions', sessionRoutes);

    app.post('/users', (req,res) => {
        const { password, username } = req.body
        if (!password || !username) {
            res.sendStatus(400);
            return
        }
        res.send({userId: 0})
    })
    return app
}
module.exports = makeApp

const express = require('express');
const makeRouter = require('./src/session/routes');
const cors = require('cors');


function makeApp(sessionRoutes, database) { 
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

    app.post('/users', async (req,res) => {
        const { password, username } = req.body
        if (!password || !username) {
            res.sendStatus(400);
            return
        }
        const userId = await database.createUser(username, password);

        res.send({userId})
    })
    return app
}
module.exports = makeApp

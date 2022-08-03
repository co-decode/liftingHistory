const https = require('https')
const path = require('path')
const fs = require('fs')
const port = process.env.PORT || 3001;
const database = require('./queryFunctions')
const makeRouter = require('./src/session/routes');
const makeApp = require('./app');
const app = makeApp(database);



app.listen(port, () => console.log(`app listening on port ${port}`));

const sslServer = https.createServer({
    key: fs.readFileSync(path.join(__dirname, 'certificate', 'key.pem')),
    cert:fs.readFileSync(path.join(__dirname, 'certificate', 'certificate.pem'))
}, app)

sslServer.listen(3443, () => console.log('Secure server on port 3443'))
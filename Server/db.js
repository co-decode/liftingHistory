const Pool = require('pg-pool');
const url = require('url')

// RAILWAY URL

const params = url.parse(process.env.DATABASE_URL);
const auth = params.auth.split(':');
const configRAILWAY = {
  user: auth[0],
  password: auth[1],
  host: params.hostname,
  port: params.port,
  database: params.pathname.split('/')[1],
  ssl: { rejectUnauthorized: false }
};

const userPool = new Pool(configRAILWAY)

module.exports = {userPool};
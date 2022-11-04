const Pool = require('pg-pool');
const url = require('url')

// LOCAL URL, Note: Re enter correct password to run locally.

// const userDB = {
//   host: "localhost",
//   database: "weightlifting_3",
//   user: "postgres",
//   password: !!!,
//   port: 5432
// }


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
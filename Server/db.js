const Pool = require('pg-pool');
const url = require('url')

// LOCAL URL

// const configLOCAL = {
//   host: "localhost",
//   database:"liftinghistory",
//   user: "postgres",
//   password: " ",
//   port: 5432
// };

// const userDB = {
//   host: "localhost",
//   database: "Lifting Database",
//   user: "postgres",
//   password: " ",
//   port: 5432
// }
// const userDB = {
//   host: "localhost",
//   database: "Weightlifting",
//   user: "postgres",
//   password: " ",
//   port: 5432
// }

// HEROKU URL

const params = url.parse(process.env.DATABASE_URL);
const auth = params.auth.split(':');

const configHEROKU = {
  user: auth[0],
  password: auth[1],
  host: params.hostname,
  port: params.port,
  database: params.pathname.split('/')[1],
 // ssl: true
};

// const pool = new Pool(configLOCAL);
// const userPool = new Pool(userDB)
const userPool = new Pool(configHEROKU)

module.exports = {pool, userPool};
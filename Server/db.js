const Pool = require('pg-pool');
const url = require('url')

// LOCAL URL

// const userDB = {
//   host: "localhost",
//   database: "railway",
//   user: "code",
//   password: "",
//   port: 5432
// }



// CLOUD URL
const params = url.parse(process.env.DATABASE_URL);
const auth = params.auth.split(':');
const configCloud = {
  user: auth[0],
  password: auth[1],
  host: params.hostname,
  port: params.port,
  database: params.pathname.split('/')[1],
  ssl: { rejectUnauthorized: false }
};

const userPool = new Pool(configCloud)

module.exports = {userPool};

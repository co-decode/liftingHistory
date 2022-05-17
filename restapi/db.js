const Pool = require('pg').Pool;

const pool = new Pool({
    user: "postgres",
    host: "localhost",
    database: "liftinghistory",
    password: " ",
    port: 5432,
})

module.exports = pool;
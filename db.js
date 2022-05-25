const Pool = require('pg').Pool;

const pool = new Pool({
    user: "hssgwxnsugbpxe",
    host: "ec2-3-228-235-79.compute-1.amazonaws.com",
    database: "d1jobvt6b8bieu",
    password: "2ad9b5106f384a36d6d17460f804f08ef30f24390a924c51225aecde41c8d4ff",
    port: 5432,
})

module.exports = pool;
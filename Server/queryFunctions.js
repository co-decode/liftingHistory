const { deleteSessionQuery } = require("./utils") 
const { userPool } = require("./db")

async function deleteQuery(sid, exerciseArray) {
    const result = await userPool.query(deleteSessionQuery(sid, exerciseArray))
    return   
}

module.exports = {deleteQuery}
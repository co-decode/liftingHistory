const { userPool } = require("./db")

async function deleteQuery(sid, res) {
    const client = await userPool.connect()
    const [result] = await client.query(`DELETE FROM deadlift WHERE sid = ${sid}; DELETE FROM squat WHERE sid = ${sid}; DELETE FROM bench WHERE sid = ${sid}; DELETE FROM sessions WHERE sid = ${sid}`)
    return result.rows    
}

module.exports = {deleteQuery}
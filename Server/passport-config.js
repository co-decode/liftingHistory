const LocalStrategy = require("passport-local").Strategy
const bcrypt = require('bcryptjs')
const {userPool} = require('./db')
function initialize(passport) {
    const authenticateUser = async (username, password, done) => {
        userPool.query(`SELECT * FROM users WHERE username = '${username}'`,
            (err, result) => {
                if (err) throw err

                if (result.rows.length > 0) {
                    const user = result.rows[0]
                    bcrypt.compare(password, user.password, (err, match)=> {
                        if (err) throw err
                        if (match) {
                            return done(null, user)
                        } else {
                            return done(null, false, {message: "Password incorrect"})
                        }

                    })
                }
                else {
                    return (done(null, false, {message: "Something went wrong"}))
                }
        })
    }
    passport.use(new LocalStrategy(authenticateUser))
    passport.serializeUser((user,done) => { done(null,user.uid) })
    passport.deserializeUser((id,done) => { 
        userPool.query(
            `SELECT * FROM users WHERE uid = ${id}`,
            (err, result) => {
                if (err) throw err
                return done(null, result.rows[0])
            }
        )
    })
}

module.exports = initialize
const express = require("express");
const cors = require("cors");
const passport = require("passport");
const passportLocal = require("passport-local").Strategy;
const bcrypt = require("bcryptjs");
const session = require("express-session");
const { userPool } = require("./db");
const db = require("./queryFunctions");
const {
  createExercisesFromBody,
  createInsertFromObject,
  createUpdateFromObject,
  createDeleteFromArray,
} = require("./utils");

function makeApp(database,  ) {
  const app = express();
  const initializePassport = require("./passport-config");
  initializePassport(passport);

  app.use(
    cors({
      origin: ["http://localhost:3000", "http://localhost:3001"], //This'll need to change...
      credentials: true,
    })
  );

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  const salt1 = bcrypt.genSaltSync();
  const salt2 = bcrypt.genSaltSync();
  const secret = bcrypt.hashSync(salt1 + salt2, 10);
  app.use(
    session({
      secret,
      resave: false,
      saveUninitialized: false,
    })
  );
  //Look up more about the secret ^^^, maybe heroku will provide an environment variable?
  // Currently Bcrypt is generating a new secret each time the app is started.
  app.use(passport.initialize());
  app.use(passport.session());

  // -- CRUD Endpoints --

  app.get("/sessions/:id", (req, res, next) => {
    const id = parseInt(req.params.id);
    userPool.query(`select json_agg(distinct dl) deadlift, json_agg(distinct sq) squat, json_agg(distinct bp) bench, json_agg(DISTINCT sessions) date FROM deadlift dl FULL JOIN bench bp USING (uid) FULL JOIN squat sq USING (uid) FULL JOIN sessions USING (uid) WHERE uid = ${id};`, (err, result) => {
      // console.log(result.rows)
      if (err) throw err;
      res.status(200).json(result.rows);
    } )
    // userPool.connect((err, client, release) => {
    //   if (err) throw err;
    //   client.query(
    //     `select json_agg(distinct dl) deadlift, json_agg(distinct sq) squat, json_agg(distinct bp) bench, json_agg(DISTINCT sessions) date FROM deadlift dl FULL JOIN bench bp USING (uid) FULL JOIN squat sq USING (uid) FULL JOIN sessions USING (uid) WHERE uid = ${id};`,
    //     (err, result) => {
    //       release();
    //       // console.log(result.rows)
    //       if (err) throw err;
    //       res.status(200).json(result.rows);
    //     }
    //   );
    // });
  });

  app.post("/sessions/:id", (req, res, next) => {
    const id = parseInt(req.params.id);
    const lifts = req.body.lifts;
    const date = req.body.date;
    userPool.query(
      `INSERT INTO sessions (uid, date, exercises) VALUES (${id}, '${date}', ${createExercisesFromBody(
        lifts
      )})`,
      (err, result) => {
        if (err) throw err;
        userPool.query(
          `SELECT sid FROM sessions WHERE date = '${date}' AND uid = ${id}`,
          (err, result) => {
            if (err) throw err;
            const sid = result.rows[0].sid;
            console.log(sid);
            userPool.query(
              `${createInsertFromObject(id, sid, lifts)}`,
              (err, result) => {
                if (err) throw err;
                res.send("Session successfully recorded");
              }
            );
          }
        );
      }
    );
  });

  app.put("/sessions/:id/:sid", (req, res, next) => {
    const [id, sid] = [parseInt(req.params.id), parseInt(req.params.sid)];
    const { lifts, newLifts, lostLifts, date } = req.body;
    const allLifts = { ...lifts, ...newLifts };
    userPool.query(
      `
        UPDATE sessions SET date = '${date}', exercises = ${createExercisesFromBody(
        allLifts
      )} WHERE sid = ${sid};${createUpdateFromObject(
        sid,
        lifts
      )};${createInsertFromObject(id, sid, newLifts)};${createDeleteFromArray(
        sid,
        lostLifts
      )}`,
      (err, result) => {
        if (err) throw err;
        res.status(200).send("Session updated");
      }
    );
  });

  app.delete("/sessions/:sid", async (req, res, next) => {
    const { sid } = req.params;
    try {
      const returned = await database.deleteQuery(sid);
      res.status(200).send("Session removed");
    } catch (error) {
      res.send("Failure");
    }
  });

  // -- Authentication Endpoints --
  app.post("/login", (req, res, next) => {
    passport.authenticate("local", (err, user, info) => {
      if (err) {
        throw err;
      }
      if (!user) {
        res.send(info);
        // console.log(info)
      } else {
        req.logIn(user, (err) => {
          if (err) throw err;
          res.send("Successfully Authenticated");
          // console.log(req.user, res.json(info))
        });
      }
    })(req, res, next);
  });

  app.post("/register", async (req, res) => {
    try {
      if (!req.body.username || !req.body.password) {
        return res.send("Missing Credentials");
      } else {
        const hashedPassword = await bcrypt.hash(req.body.password, 10);

        userPool.query(`SELECT username FROM users`, (e, results) => {
          if (e) throw e;
          else if (
            results.rows.some((user) => user.username === req.body.username)
          ) {
            res.send("Registration failed");
            return;
          }
          userPool.query(
            `INSERT INTO users (username, password) VALUES ('${req.body.username}', '${hashedPassword}');`,
            (err, results) => {
              if (err) throw err;
              else {
                res.status(201).send("Registration Successful");
              }
            }
          );
        });
      }
    } catch {
      console.error("Something went wrong");
    }
  });

  app.put("/change/:uid", async (req, res) => {
    try {
      const client = await userPool.connect();

      const result = await client.query(
        `SELECT password FROM users WHERE uid = ${req.params.uid}`
      );
      const comparison = await bcrypt.compare(
        req.body.password,
        result.rows[0].password
      );

      if (comparison) {
        res.send(
          "Change failed: the new password is the same as the old password"
        );
        return;
      }
      const hashedPassword = await bcrypt.hash(req.body.password, 10);
      const updateResult = await client.query(
        `UPDATE users SET password = '${hashedPassword}' WHERE uid = ${req.params.uid};`
      );
      if (updateResult) {
        res.status(201).send("Password Changed Successfully");
        return;
      }
    } catch {
      console.error("Something went wrong");
    }
  });

  app.post("/logout", function (req, res, next) {
    req.logout(function (err) {
      if (err) {
        return next(err);
      }
      res.send("Logged Out");
    });
    // console.log("Logged Out");
  });

  app.get("/authenticated", (req, res, next) => {
    if (req.user) {
      res.send({ uid: req.user.uid, username: req.user.username });
    } else {
      res.send(null);
    }
  });

  return app;
}
module.exports = makeApp;

// 1 - DONE - Users should come from postgres now.
// 2 - Sessions queries should be passed a user.
// DONE - Get all sessions for user
// DEFER... when I need it - Get single session for user by xdatex -> sid.
// DONE - Post session from user, client needs to pass date.
// DONE - Delete session by user and user id
// DONE - Update session by user and user id, and lifts object

// 2.5 = The client should deliver data in the form required by the server logic, also be sure to lock the passing of sensitive information to client logic, users should not be ablfe to delete random session ids, etc.
// DONE - Receive and display all sessions for user
// Add a session from the client
// Needs to receive client ID from the authenticated check on the front end
// DONE - Delete a session from the clienT
// DONE - Update a sessions from the client - Need to add lifts and remove lifts from update object.

// 3 - I should clean up the state of the front end, keep it as an object.

// 4 - Testing after that? Ha, probably needs a start from the beginning. I need more tutorial experience.
// Still should see if my current tests can be adapted to my new users table.
// 5 - I would like to have a friending feature, along with instant messaging with sockets.
// 6 - Should package it up with docker. Yes
// 7 - Should set up Travis CI. XXX
// 8 - Should implement redis, even if it doesn't improve anything... Okay... I want a use case though.

//     (username) => {
//         let user
//         userPool.query(`SELECT * FROM users WHERE username = '${username}'`,
//         (err, result) => {
//             if (err) throw err
//             user = result.rows[0]
//         })

//         return user
//     },
//     id => userPool.query(`SELECT uid FROM users`, (error, result) => {
//         if (error) throw error
//         return result.rows[0]
//     })
// )

// const users = []

// app.use('/sessions', sessionRoutes);

// app.post('/users', async (req,res) => {
//     const { password, username } = req.body
//     if (!password || !username) {
//         res.sendStatus(400);
//         return
//     }
//     const userId = await database.createUser(username, password);

//     res.send({userId})
// })

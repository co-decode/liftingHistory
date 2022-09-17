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
  createGetFromExercises,
  createGet
} = require("./utils");

function makeApp(database,  ) {
  const app = express();
  const initializePassport = require("./passport-config");
  initializePassport(passport);

  app.use(
    cors({
      origin: ["https://lifting-log.netlify.app"],
      // origin: ["http://localhost:3000"],
      credentials: true,
    })
  );
  //"http://localhost:3000"
  //"https://lifting-history-2-container.herokuapp.com", 
  //"https://node-lifting-history2.herokuapp.com"

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
  app.use(passport.initialize());
  app.use(passport.session());

  // -- CRUD Endpoints --

  app.get("/", (req, res) => {
    res.send("Hello, world!")
  })

  app.get("/sessions/:id", async (req, res, next) => {
    try {
    const id = parseInt(req.params.id);
    let {rows} = await userPool.query(createGet(id))
    console.log(rows)
    let output = rows[0]
      Object.keys(output).filter(key => output[key] === null).forEach(nullKey => delete output[nullKey])
    return res.status(200).json(output)
    } catch {
      throw new Error('Something went wrong')
    }
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
    const exerciseArray = req.body
    try {
      await database.deleteQuery(sid, exerciseArray);
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
      } else {
        req.logIn(user, (err) => {
          if (err) throw err;
          res.send("Successfully Authenticated");
        });
      }
    })(req, res, next);
  });

  app.post("/register", async (req, res) => {
    try {
      if (!req.body.username || req.body.password.length < 1) {
        return res.send("Missing Credentials");
      } else {
        const hashedPassword = await bcrypt.hash(req.body.password, 10);

        userPool.query(`SELECT username FROM users`, (e, results) => {
          if (e) throw e;
          else if (
            results.rows.some((user) => user.username === req.body.username)
          ) {
            res.send("Registration failed; the username is already in use");
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


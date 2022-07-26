const {pool} = require("../../db");
const queries = require("./queries");

function makeRoutes() {
  const getSessions = (req, res) => {
    pool.query(queries.getSessions, (error, results) => {
      if (error) throw error;
      res.status(200).json(results.rows);
    });
  };

  const getSessionById = (req, res) => {
    const sessionNumber = parseInt(req.params.sessionNumber);
    pool.query(queries.getSessionById, [sessionNumber], (error, results) => {
      if (error) throw error;
      res.status(200).json(results.rows);
    });
  };

  const getRecentSessions = (req, res) => {
    pool.query(queries.getSessionsRecent, (error, results) => {
      if (error) throw error;
      res.status(200).json(results.rows);
    });
  };

  const filterSessions = (req, res) => {
    const {from, to} = req.params
    pool.query(queries.filterByDate, [from, to], (error,results) => {
      if (error) throw error;
      res.status(200).json(results.rows);
    });
  }

  const filterSessionsRecent = (req, res) => {
    const {from, to} = req.params
    pool.query(queries.filterByDateRecent, [from, to], (error,results) => {
      if (error) throw error;
      res.status(200).json(results.rows);
    });
  }

  const addSession = (req, res) => {
    const {
      date,
      alias,
      horizontal_press,
      vertical_press,
      vertical_pull,
      elbow_flexion,
      knee_flexion,
      hip_hinge,
    } = req.body;

    pool.query(queries.checkSessionDate, [date], (error, results) => {
      if (results.rows.length) {
        res.send("A session for this date has already been recorded.");
        return;
      }

      pool.query(
        queries.addSession,
        [
          date,
          alias,
          horizontal_press,
          vertical_press,
          vertical_pull,
          elbow_flexion,
          knee_flexion,
          hip_hinge,
        ],
        (error, results) => {
          if (error) throw error;
          return res.status(201).send("Session recorded successfully!");
        }
      );
    });
  };

  const removeSession = (req, res) => {
    const sessionNumber = parseInt(req.params.sessionNumber);
    pool.query(queries.getSessionById, [sessionNumber], (error, results) => {
      const noSessionFound = !results.rows.length;
      if (noSessionFound) {
        return res.send("No session is recorded for that date");
      }

      pool.query(queries.removeSession, [sessionNumber], (error, results) => {
        if (error) throw error;
        return res.status(200).send("Session removed successfully.");
      });
    });
  };

  const wipeTable = (req, res) => {
    pool.query(queries.deleteData, [], (error, results) => {
      if (error) throw error;
      return res.status(200).send("Session data has been wiped.")
    })
  }

  const updateSession = (req, res) => {
    const sessionNumber = parseInt(req.params.sessionNumber);
    const {
      date,
      alias,
      horizontal_press,
      vertical_press,
      vertical_pull,
      elbow_flexion,
      knee_flexion,
      hip_hinge,
    } = req.body;

    pool.query(queries.getSessionById, [sessionNumber], (error, results) => {
      const noSessionFound = !results.rows.length;
      if (noSessionFound) {
        res.send("Session does not exist in database");
        return;
      }

      pool.query(
        queries.updateSession,
        [
          date,
          alias,
          horizontal_press,
          vertical_press,
          vertical_pull,
          elbow_flexion,
          knee_flexion,
          hip_hinge,
          sessionNumber,
        ],
        (error, results) => {
          if (error) throw error;
          res.status(200).send("Session updated successfully");
        }
      );
    });
  };
  return {
    getSessions,
    getRecentSessions,
    getSessionById,
    filterSessions,
    filterSessionsRecent,
    addSession,
    removeSession,
    wipeTable,
    updateSession,
  };
}

module.exports = makeRoutes

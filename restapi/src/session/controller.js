const pool = require("../../db");
const queries = require("./queries");

const getStudents = (req, res) => {
  pool.query(queries.getStudents, (error, results) => {
    if (error) throw error;
    res.status(200).json(results.rows);
  });
};

const getSessions = (req, res) => {
  pool.query(queries.getSessions, (error, results) => {
    if (error) throw error;
    res.status(200).json(results.rows);
  });
};

const getStudentById = (req, res) => {
  const id = parseInt(req.params.id);
  pool.query(queries.getStudentById, [id], (error, results) => {
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

const addStudent = (req, res) => {
  const { name, email, age, dob } = req.body;
  pool.query(queries.checkEmailExists, [email], (error, results) => {
    if (results.rows.length) {
      res.send("Email already exists.");
      return;
    }

    pool.query(
      queries.addStudent,
      [name, email, age, dob],
      (error, results) => {
        if (error) throw error;
        res.status(201).send("Student created successfully!");
      }
    );
  });
};

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

const removeStudent = (req, res) => {
  const id = parseInt(req.params.id);

  pool.query(queries.getStudentById, [id], (error, results) => {
    const noStudentFound = !results.rows.length;
    if (noStudentFound) {
      res.send("Student does not exist in the database");
    }

    pool.query(queries.removeStudent, [id], (error, results) => {
      if (error) throw error;
      res.status(200).send("Student removed successfully.");
    });
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

const updateStudent = (req, res) => {
  const id = parseInt(req.params.id);
  const { name } = req.body;

  pool.query(queries.getStudentById, [id], (error, results) => {
    const noStudentFound = !results.rows.length;
    if (noStudentFound) {
      res.send("Student does not exist in database");
    }

    pool.query(queries.updateStudent, [name, id], (error, results) => {
      if (error) throw error;
      res.status(200).send("Student updated successfully");
    });
  });
};

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

module.exports = {
  getStudents,
  getSessions,
  getStudentById,
  getSessionById,
  addStudent,
  addSession,
  removeStudent,
  removeSession,
  updateStudent,
  updateSession
};

const getStudents = "SELECT * FROM students";
const getSessions = "SELECT * FROM session";

const getStudentById = "SELECT * FROM students WHERE id = $1";
const getSessionById = "SELECT * FROM session WHERE session_number  = $1";

const checkEmailExists = "SELECT s FROM students s WHERE s.email = $1";
const checkSessionDate = "SELECT s FROM session s WHERE s.date = $1";

const addStudent =
  "INSERT INTO students (name, email, age, dob) VALUES ($1, $2, $3, $4)";
const addSession =
  "INSERT INTO session (date, alias, horizontal_press, vertical_press, vertical_pull, elbow_flexion, knee_flexion, hip_hinge) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)";

const removeStudent = "DELETE FROM students WHERE id = $1";
const removeSession = "DELETE FROM session WHERE session_number = $1";

const updateStudent = "UPDATE students SET name = $1 WHERE id = $2";
const updateSession = "UPDATE session SET date = $1, alias = $2, horizontal_press = $3, vertical_press = $4, vertical_pull = $5, elbow_flexion = $6, knee_flexion = $7, hip_hinge = $8 WHERE session_number = $9";

module.exports = {
  getStudents,
  getSessions,
  getStudentById,
  getSessionById,
  checkEmailExists,
  checkSessionDate,
  addStudent,
  addSession,
  removeStudent,
  removeSession,
  updateStudent,
  updateSession,
};

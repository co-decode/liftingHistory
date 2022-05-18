const getStudents = "SELECT * FROM students";
const getSessions = "SELECT * FROM session";

const getStudentById = "SELECT * FROM students WHERE id = $1";
const getSessionById = "SELECT * FROM session WHERE session_number  = $1";


const checkEmailExists = "SELECT s FROM students s WHERE s.email = $1"
const addStudent = "INSERT INTO students (name, email, age, dob) VALUES ($1, $2, $3, $4)";
// const addSession = "INSERT INTO session (date, alias, "Horizontal Press", "Vertical Press", "Vertical Pull", "Elbow Flexion", "Knee Flexion", "Hip Hinge") VALUES ($1, $2, $3, $4, $5, $6, $7, $8)";

const removeStudent = "DELETE FROM students WHERE id = $1"
// const removeSession = "DELETE FROM session WHERE (Session Number) = $1";


const updateStudent = "UPDATE students SET name = $1 WHERE id = $2";

module.exports = {
  getStudents,
  getSessions,
  getStudentById,
  getSessionById,
  checkEmailExists,
  addStudent,
  // addSession,
  removeStudent,
  // removeSession,
  updateStudent,
};

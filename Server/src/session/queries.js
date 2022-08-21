const getSessions = "SELECT * FROM session ORDER BY date";
const getSessionsRecent = "SELECT * FROM sessions ORDER BY date DESC"

const getSessionById = "SELECT * FROM sessions WHERE session_number  = $1";

const checkSessionDate = "SELECT s FROM sessions s WHERE s.date = $1";

const addSession =
  "INSERT INTO sessions (date, alias, horizontal_press, vertical_press, vertical_pull, elbow_flexion, knee_flexion, hip_hinge) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)";

const removeSession = "DELETE FROM sessions WHERE session_number = $1";

const deleteData = "DELETE FROM sessions"

const updateSession = "UPDATE sessions SET date = $1, alias = $2, horizontal_press = $3, vertical_press = $4, vertical_pull = $5, elbow_flexion = $6, knee_flexion = $7, hip_hinge = $8 WHERE session_number = $9";

const filterByDate = "SELECT * FROM sessions WHERE date > $1 AND date < $2 ORDER BY date"
const filterByDateRecent = "SELECT * FROM sessions WHERE date > $1 AND date < $2 ORDER BY date DESC"


module.exports = {
  getSessions,
  getSessionById,
  checkSessionDate,
  addSession,
  removeSession,
  deleteData,
  updateSession,
  filterByDate,
  filterByDateRecent,
  getSessionsRecent
};

const { Router } = require('express');
const controller = require('./controller');

const router = Router();

// router.get('/', controller.getStudents);
router.get('/', controller.getSessions);
// router.post('/', controller.addStudent);
router.post('/', controller.addSession);

// router.get('/:id', controller.getStudentById);
router.get('/:sessionNumber', controller.getSessionById);

// router.put('/:id', controller.updateStudent)
router.put('/:sessionNumber', controller.updateSession)


// router.delete('/:id', controller.removeStudent);
router.delete('/:sessionNumber', controller.removeSession);

module.exports = router;
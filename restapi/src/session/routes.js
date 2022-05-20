const { Router } = require('express');
const controller = require('./controller');

const router = Router();

router.get('/', controller.getSessions);
router.get('/recent', controller.getRecentSessions)

router.post('/', controller.addSession);

router.get('/:sessionNumber', controller.getSessionById);

router.put('/:sessionNumber', controller.updateSession)


router.delete('/:sessionNumber', controller.removeSession);

router.delete('/', controller.wipeTable);

module.exports = router;
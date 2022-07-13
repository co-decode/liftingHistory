const { Router } = require('express');
const controller = require('./controller');

function makeRouter() {
const routes = controller();

const router = Router();

router.get('/', routes.getSessions);
router.get('/recent', routes.getRecentSessions)
router.get('/filter/:from/:to',routes.filterSessions)
router.get('/filter/recent/:from/:to',routes.filterSessionsRecent)
router.post('/', routes.addSession);
router.get('/:sessionNumber', routes.getSessionById);
router.put('/:sessionNumber', routes.updateSession);
router.delete('/:sessionNumber', routes.removeSession);
router.delete('/', routes.wipeTable);

return router
}
module.exports = makeRouter;
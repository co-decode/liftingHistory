const request = require('supertest');
const makeApp = require('./app');
const {Router} = require('express');



const routes = {
    getSessions: jest.fn(),
    getRecentSessions: jest.fn(),
    filterSessions: jest.fn(),
    filterSessionsRecent: jest.fn(),
    addSession: jest.fn(),
    getSessionById: jest.fn(),
    updateSession: jest.fn(),
    removeSession: jest.fn(),
    wipeTable: jest.fn()
}

const makeDummyRouter = () => {
    const sessions = Router()
    sessions.get('/', routes.getSessions);
    sessions.get('/recent', routes.getRecentSessions)
    sessions.get('/filter/:from/:to',routes.filterSessions)
    sessions.get('/filter/recent/:from/:to',routes.filterSessionsRecent)
    sessions.post('/', routes.addSession);
    sessions.get('/:sessionNumber', routes.getSessionById);
    sessions.put('/:sessionNumber', routes.updateSession);
    sessions.delete('/:sessionNumber', routes.removeSession);
    sessions.delete('/', routes.wipeTable);

    return sessions
}

const app = makeApp(makeDummyRouter(), {})

describe("Access sessions", () => {

    test("calls getSessions", async () => {
        routes.getSessions.mockResolvedValue(1)
        const response = await request(app).post("/sessions").send({session: "yesterday"})
        console.log(response.body)
        expect(response.body).toBe()
    }) 
}) 
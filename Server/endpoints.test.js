const request = require('supertest');
const makeApp = require('./app');
const {Router} = require('express');

const app = makeApp()

describe("GET /sessions/:id, Given a user ID...", () => {

    describe("is correctly provided...", ()=>{
        it("should respond with a 200 status code", async () => {
            const response = await request(app).get("/sessions/2")
            expect(response.statusCode).toBe(200)
        })

        it("should respond with a json object containing the session data for that user", async () => {
                const id = 1
                const response = await request(app).get(`/sessions/${id}`)
                expect(Object.keys(response.body[0])).toEqual(["deadlift","squat","bench","date"])
                if (response.body[0].date){
                    response.body[0].date.forEach(v=>expect(v.uid).toBe(id))
                }
        })

        it("should specify json in the content type header", async () => {
            const response = await request(app).get("/sessions/2")
            expect(response.headers['content-type']).toEqual(expect.stringContaining("json"))
        })
    })

    describe("is not provided...", () => {

        it("should respond with a status code of 404", async () => {
            const response = await request(app).get("/sessions")
            expect(response.statusCode).toBe(404)
        })
    })
})

// describe("POST /sessions/:id, Given a user ID..", () => {

// })
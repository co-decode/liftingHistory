const request = require('supertest');
const app = require('./app');

describe("POST /users", () => {
    describe("given a username and password", () => {
        // should save the username and password to the database
        // should respond with a json object containing the user id
        test("should respond with a 200 status code", async () => {
            const response = await request(app).post("/users").send({
                username: "username",
                password: "password"
            })
            expect(response.statusCode).toBe(200)
        }) 
        test("should specify json in the content type header", async () => {
            const response = await request(app).post("/users").send({
                username: "username",
                password: "password"
            })
            expect(response.headers['content-type']).toEqual(expect.stringContaining("json"))
        })
        test("test has a userID", async () => {
            const response = await request(app).post("/users").send({
                username: "username",
                password: "password"
            })
            expect(response.body.userId).toBeDefined()
        }) 
    }) 

    describe("when the username and password is missing", () => {
        test("should respond with a status code of 400", async () => {
            const bodyData = [
                {username: "username"},
                {password: "password"},
                {}
            ]
            for (const body of bodyData) {
                const response = await request(app).post("/users").send(body)
                expect(response.statusCode).toBe(400)
            }
        })
    })
})

// TODO:
    // hash password before it gets to the database
    // send userID to the client in a SESSION or JWT
    // send a 500 status code when the server fails to connect to the database
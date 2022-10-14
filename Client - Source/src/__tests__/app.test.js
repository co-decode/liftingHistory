import React from "react";
import "@testing-library/jest-dom";
import { render, screen, cleanup } from "@testing-library/react";
import { MemoryRouter, useLocation } from "react-router-dom";
import userEvent from "@testing-library/user-event";
import { rest } from "msw";
import { setupServer } from "msw/node";
import App from "../App";

const LocationDisplay = () => {
    const location = useLocation()
  
    return <div data-testid="location-display">{location.pathname}</div>
  }



const server = setupServer(
    rest.get("http://localhost:3001/authenticated", ( req, res, ctx) => {
        return res(
            ctx.status(200),
            ctx.json(true)
        )
    }),
    rest.get("http://localhost:3001/sessions/*", (req,res,ctx)=> {
        return res(
            ctx.status(200),
            ctx.json("How's that?")
        )
    }),
    rest.get("*", (req, res, ctx) => {
        console.error(`Please add request handler for ${req.url.toString()}`)
        return res(ctx.status(500), ctx.json({error: "Please add request handler"}))
    })
)

beforeAll(()=> server.listen())
afterAll(()=> server.close())
afterEach(()=> {server.resetHandlers(); cleanup()})

test("kicks to log component if on login and authentication succeeds", async () => {   
    server.use(rest.get("http://localhost:3001/authenticated", ( req, res, ctx) => {
        return res(ctx.status(200),ctx.json(true))
    }))
    
    let rendeer = render(<MemoryRouter initialEntries={['/login']}><App/><LocationDisplay/></MemoryRouter>)
    let element = await rendeer.findByText(/server/i)
    expect(element).toBeInTheDocument()
    let element0 = await rendeer.findByText(/loading/i)
    expect(element0).toBeInTheDocument()
    let element2 = await rendeer.findByText(/entries/i)
    expect(element2).toBeInTheDocument()
    let rendor = render(<MemoryRouter initialEntries={['/register']}><App/><LocationDisplay/></MemoryRouter>)
    let elementa = await rendor.findByText(/server/i)
    expect(elementa).toBeInTheDocument()
    let elementb = await rendor.findByText(/loading/i)
    expect(elementb).toBeInTheDocument()
    let elementc = await rendor.findByText(/entries/i)
    expect(elementc).toBeInTheDocument()
})
test("kicks to login component if on log and authentication fails", async () => {   
    server.use(rest.get("http://localhost:3001/authenticated", ( req, res, ctx) => {
        return res(ctx.status(200),ctx.json(false))
    }))
    
    let rendeer = render(<MemoryRouter initialEntries={['/log']}><App/><LocationDisplay/></MemoryRouter>)
    let element0 = await rendeer.findByText(/loading/i)
    expect(element0).toBeInTheDocument()
    let element = await rendeer.findByText(/server/i)
    expect(element).toBeInTheDocument()
    let element2 = await rendeer.findByText(/username/i)
    expect(element2).toBeInTheDocument()
})


// describe("1", () => {

//     test("it redirects to the Login component when /authenticated check fails from the Log component", async () => {   
//         server.use(rest.get("http://localhost:3001/authenticated", ( req, res, ctx) => {
//             return res(ctx.status(200),ctx.json(false))
//         }))
        
//         let rendeer = render(<BrowserRouter><Routes><Route path="/log" element={<Log/>}/><Route path="/login" element={<Login/>}/></Routes></BrowserRouter>)
//         console.log(JSON.stringify(global.window.location))
//         let element0 = await rendeer.findByText(/loading/i)
//         expect(element0).toBeInTheDocument()
//         let element = await rendeer.findByText(/server/i)
//         expect(element).toBeInTheDocument()
//         let element2 = await rendeer.findByText(/username/i)
//         expect(element2).toBeInTheDocument()
//     })
// })

// BrowserRouter
// xdescribe("2", () => {

//     test("it redirects to the Log component when /authenticated check succeeds from the Login component", async () => {   
//         server.use(rest.get("http://localhost:3001/authenticated", ( req, res, ctx) => {
//             return res(ctx.status(200),ctx.json(true))
//         }))

//         let rendor = render(<BrowserRouter><Routes><Route path="/" element={<Login/>}/><Route path="/log" element={<Log/>}/></Routes></BrowserRouter>)
//         // let {findByText} = render(<BrowserRouter><Login/></BrowserRouter>)
//         let element = await rendor.findByText(/server/i)
//         expect(element).toBeInTheDocument()
//         let element0 = await rendor.findByText(/loading/i)
//         expect(element0).toBeInTheDocument()
//         let element2 = await rendor.findByText(/entries/i)
//         expect(element2).toBeInTheDocument()
//     })
// })


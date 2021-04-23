const request = require("supertest")
const db = require("../data/dbConfig.js")
const server = require("./server.js")

const bobInsert = {
    username: 'bob',
    password: '$2a$10$dFwWjD8hi8K2I9/Y65MWi.WU0qn9eAVaiBoRSShTvuJVGw8XpsCiq', // password "1234"
}
const bob = {
    username:"bob",
    password:"1234"
}
const sueInsert = {
    username: 'sue',
    password: '$2a$10$dFwWjD8hi8K2I9/Y65MWi.WU0qn9eAVaiBoRSShTvuJVGw8XpsCiq', // password "1234"
}
const sue = {
    username:"sue",
    password:"1234"
}

beforeAll(async ()=>{
    await db.migrate.rollback()
    await db.migrate.latest()
})
beforeEach(async ()=>{
    await db("users").truncate()
})
afterAll(async ()=>{
    await db.destroy()
})

describe("server", ()=>{
    describe("Logging in", ()=>{
        it("Rejects on missing credentials", async ()=>{
            let res
            res = await request(server).post("/api/auth/login").send({})
            expect(res.body.message).toMatch(/username and password required/i)

            res = await request(server).post("/api/auth/login").send({username:"stav"})
            expect(res.body.message).toMatch(/username and password required/i)

            res = await request(server).post("/api/auth/login").send({password:"1234"})
            expect(res.body.message).toMatch(/username and password required/i)
        })
        it("Fails to login if user is missing", async ()=>{
            let res
            res = await request(server).post("/api/auth/login").send(bob)
            expect(res.body.message).toMatch(/invalid credentials/i)
        })
        it("Logins succesfully with proper credentials", async ()=>{
            let res
            await db("users").insert(bobInsert)
            res = await request(server).post("/api/auth/login").send(bob)
            expect(res.body.message).toMatch(/welcome,/i)
        })
        it("Creates token", async ()=>{
            let res
            await db("users").insert(bobInsert)
            res = await request(server).post("/api/auth/login").send(bob)
            expect(res.body).toHaveProperty("token")
        })
    })
    describe("Registering", ()=>{
        it("Rejects on missing credentials",async ()=>{
            let res
            res = await request(server).post("/api/auth/register").send({})
            expect(res.body.message).toMatch(/username and password required/i)
    
            res = await request(server).post("/api/auth/register").send({username:"stav"})
            expect(res.body.message).toMatch(/username and password required/i)
    
            res = await request(server).post("/api/auth/register").send({password:"1234"})
            expect(res.body.message).toMatch(/username and password required/i)
        })
        it("Adds user on successful register", async ()=>{
            let res
            await request(server).post("/api/auth/register").send(bob)
            res = await db("users")
            expect(res).toHaveLength(1)
        })
    })
})

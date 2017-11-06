"use strict";

const request = require("request-promise");
const tough = require("tough-cookie");
const baseUrl = "http://localhost:3000"
const users = require("./data/users");


// This series of tests uses user[0] for registration. login, and manipulation
describe("API v1", () => {
    it("should return a string 'API call'", async () => {
        const apiCallStr = await request.get(baseUrl+"/api/v1");
        expect(apiCallStr).to.equal("API call");
    });

    it("should return Unauthorized with no session created", async () => {
        try{
            const unauthReq = await request.get(baseUrl + "/api/v1/users");
            expect(unauthReq.statusCode).to.equal(401);
        } catch(err) {
            expect(err.name).to.equal("StatusCodeError");
            expect(err.statusCode).to.equal(401);
        }
    });

    it("should return the users API token", async () => {
        const j = request.jar();
        const thisUser = users[0];
        const userOpts = {
            method: 'POST',
            uri: baseUrl + "/register",
            json: true,
            body: thisUser,
            jar: j,
        };
        const loginOpts = {
            method: 'POST',
            uri: baseUrl + "/login",
            json: true,
            body: {
                email: thisUser.email,
                password: thisUser.password
            },
            jar: j,
        };
        const tokenOpts = {
            method: 'POST',
            uri: baseUrl + "/api/v1/authenticate",
            json: true,
            jar: j,
        };

        // register the new user account
        const register = await request(userOpts);
        expect(register.firstName).to.equal(thisUser.firstName);

        // login to the new user account
        const login = await request(loginOpts);
        expect(login.success).to.equal(true);

        // request apiToken with cookie set
        const userToken = await request(tokenOpts);
        expect(userToken.token).to.equal(register.apiToken);
    });

    it("should list all users in the database", async () => {
        const j = request.jar();
        const thisUser = users[0];
        const loginOpts = {
            method: 'POST',
            uri: baseUrl + "/login",
            json: true,
            body: {
                email: thisUser.email,
                password: thisUser.password
            },
            jar: j,
        };
        const reqOpts = {
            method: 'GET',
            uri: baseUrl + "/api/v1/users",
            json: true,
            jar: j,
        }

        // login to the new user account
        const login = await request(loginOpts);
        expect(login.success).to.equal(true);
        
        const panicUsers = await request(reqOpts);
        expect(panicUsers[0].firstName).to.equal(thisUser.firstName);
    });
})
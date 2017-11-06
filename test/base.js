"use strict";

const request = require("request-promise");
const baseUrl = "http://localhost:3000"
const users = require("./data/users");

// This series of tests uses user[1] for registration. login, and manipulation
describe("User Access", () => {
    it("should successfully register a new user", async () => {
        const j = request.jar();
        const thisUser = users[1];
        const userOpts = {
            method: 'POST',
            uri: baseUrl + "/register",
            json: true,
            body: thisUser,
            jar: j,
        };
        
        const register = await request(userOpts);
        expect(register.firstName).to.equal(thisUser.firstName);
    });

    it("should successfully login as the new user", async () => {
        const j = request.jar();
        const thisUser = users[1];
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

        const login = await request(loginOpts);
        expect(login.success).to.equal(true);
    });

    it("should log out the user from their session", async () => {
        const j = request.jar();
        const thisUser = users[1];
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
        const logoutOpts = {
            method: 'GET',
            uri: baseUrl + "/logout",
            json: true,
            jar: j,
        }

        const login = await request(loginOpts);
        expect(login.success).to.equal(true);
        const logout = await request(logoutOpts);
        expect(logout.success).to.equal(true);
    });
})

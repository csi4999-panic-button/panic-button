"use strict";

const request = require("request-promise");
const baseUrl = "http://localhost:3000"
const users = require("./data/users");
const schools = require("./data/schools");


// This series of tests uses user[0] for registration. login, and manipulation
describe("Schools", () => {
    it("should create a new school in the system", async () => {
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
        const thisSchool = schools[0];
        const schoolOpts = {
            method: 'POST',
            uri: baseUrl + "/api/v1/schools",
            json: true,
            body: thisSchool,
            jar: j,
        }

        const login = await request(loginOpts);
        expect(login.success).to.equal(true);

        const createdSchool = await request(schoolOpts);
        expect(createdSchool.name).to.equal(thisSchool.name);
        expect(createdSchool.address).to.equal(thisSchool.address);
        expect(createdSchool.city).to.equal(thisSchool.city);
        expect(createdSchool.state).to.equal(thisSchool.state);
        expect(createdSchool.country).to.equal(thisSchool.country);
        expect(createdSchool.zip).to.equal(thisSchool.zip);
        expect(createdSchool.domain).to.equal(thisSchool.domain);
    });

    
});
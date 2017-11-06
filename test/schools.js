"use strict";

const request = require("request-promise");
const baseUrl = "http://localhost:3000"
const users = require("./data/users");
const schools = require("./data/schools");


// This series of tests uses user[0] for registration. login, and manipulation
describe("Schools", () => {
    it("should fail to create a school without a user session", async () => {
        const thisSchool = schools[0];
        const schoolOpts = {
            method: 'POST',
            uri: baseUrl + "/api/v1/schools",
            json: true,
            body: thisSchool,
            resolveWithFullResponse: true,
        };

        try {
            const failedSchool = await request(schoolOpts);
            return false;
        } catch(err) {
            expect(err.statusCode).to.equal(401);
        }
    });

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
        };

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

    it("should list the schools in the system", async () => {
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
            method: 'GET',
            uri: baseUrl + "/api/v1/schools",
            json: true,
            jar: j,
        };

        const login = await request(loginOpts);
        expect(login.success).to.equal(true);

        const schoolList = await request(schoolOpts);
        expect(schoolList.length).to.equal(2);
        expect(schoolList.filter(s => s.name === thisSchool.name).length).to.equal(1);
    });
});
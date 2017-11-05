"use strict";

const request = require("request-promise");
const baseUrl = "http://localhost:3000"

describe("Root", () => {
    it("should return a string 'API call'", async () => {
        const apiCallStr = await request.get(baseUrl+"/api/v1");
        expect(apiCallStr).to.equal("API call");
    });
})
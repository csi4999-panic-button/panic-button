"use strict";

const request = require("request-promise");
const tough = require("tough-cookie");
const baseUrl = "http://localhost:3000"
const users = require("./data/users");
const classrooms = require("./data/classrooms");
const schools = require("./data/schools");
const Classrooms = require("../src/server/models/classrooms");
const stuJar = request.jar();
const teaJar = request.jar();


describe("Questions", () => {

    let testId;
    
    it("should let students of the classroom ask questions", async () => {
        
        const thisUser = users[3];
        const question1 = "How do you put your pants on in the morning?"
        const loginOpts = {
            method: 'POST',
            uri: `${baseUrl}/login`,
            body: {
                email: thisUser.email,
                password: thisUser.password,
            },
            json: true,
            jar: stuJar,
        };
        const classesOpts = {
            method: 'GET',
            uri: `${baseUrl}/api/v1/classrooms`,
            json: true,
            jar: stuJar,
        };

        const loggedIn = await request(loginOpts);
        expect(loggedIn.success).to.equal(true);
        
        const testRooms = await request(classesOpts);
        testId = testRooms.filter((c)=> c.courseTitle === classrooms[0][0].courseTitle )[0]._id;

        const questionOpts = {
            method: 'POST',
            uri: `${baseUrl}/api/v1/classrooms/${testId}/ask`,
            body: {
                question: question1,
            },
            json: true,
            jar: stuJar,
        };
        const classOpts = {
            method: 'GET',
            uri: `${baseUrl}/api/v1/classrooms/${testId}`,
            json: true,
            jar: stuJar,
        };

        const questioned = await request(questionOpts);
        expect(questioned.success).to.equal(true);

        const classWithQ = await request(classOpts);
        expect(classWithQ.questions[0].question).to.equal(question1);
    });

    it("should let users of the classroom answer questions", async () => {
        
        const thisUser = users[3];
        const question = "How do you find the square root of a negative number?"
        const answer = "You use your imagination"
        const loginOpts = {
            method: 'POST',
            uri: `${baseUrl}/login`,
            body: {
                email: thisUser.email,
                password: thisUser.password,
            },
            json: true,
            jar: teaJar,
        };

        const loggedIn = await request(loginOpts);
        expect(loggedIn.success).to.equal(true);

        const questionOpts = {
            method: 'POST',
            uri: `${baseUrl}/api/v1/classrooms/${testId}/ask`,
            body: {
                question
            },
            json: true,
            jar: stuJar,
        };
        const classOpts = {
            method: 'GET',
            uri: `${baseUrl}/api/v1/classrooms/${testId}`,
            json: true,
            jar: stuJar,
        };

        const questioned = await request(questionOpts);
        expect(questioned.success).to.equal(true);

        const classWithQ = await request(classOpts);
        expect(classWithQ.questions[1].question).to.equal(question);

        const answerOpts = {
            method: 'POST',
            uri: `${baseUrl}/api/v1/classrooms/${testId}/answer`,
            body: { 
                questionId: classWithQ.questions[1]._id,
                answer,
            },
            json: true,
            jar: teaJar,
        };

        const answered = await request(answerOpts);
        expect(answered.success).to.equal(true);

        const classWithQA = await request(classOpts);
        expect(classWithQA.questions[1].question).to.equal(question);
        expect(classWithQA.questions[1].answers[0].answer).to.equal(answer);
    });
});
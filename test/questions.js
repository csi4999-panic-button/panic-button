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
const questions = [
    "How do you put your pants on in the morning?",
    "How do you find the square root of a negative number?"
]
const answers = [
    "One leg at a time",
    "You use your imagination"
]


describe("Questions", () => {

    let testId;
    let questId;
    let answerId;
    
    it("should let students of the classroom ask questions", async () => {
        
        const thisUser = users[3];
        const question1 = questions[0];
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
            uri: `${baseUrl}/api/v1/classrooms/${testId}/questions`,
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
        const question = questions[1];
        const answer = answers[1];
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
            uri: `${baseUrl}/api/v1/classrooms/${testId}/questions`,
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
        const dbQuest = classWithQ.questions[1];
        expect(dbQuest.question).to.equal(question);
        questId = dbQuest._id;

        const answerOpts = {
            method: 'POST',
            uri: `${baseUrl}/api/v1/classrooms/${testId}/questions/${dbQuest._id}/answers`,
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
        answerId = classWithQA.questions[1].answers[0]._id;
    });

    it("should allow questions to being voted for", async () => {
        const voteQuestOpts = {
            method: 'PUT',
            uri: `${baseUrl}/api/v1/classrooms/${testId}/questions/${questId}`,
            json: true,
            jar: stuJar,
            body: { up: true, }
        };
        const classOpts = {
            method: 'GET',
            uri: `${baseUrl}/api/v1/classrooms/${testId}`,
            json: true,
            jar: stuJar,
        };

        // upvote the question
        const upvoted = await request(voteQuestOpts);
        expect(upvoted.success).to.equal(true);
        
        // confirm the vote count is 1
        const upvotedQClass = await request(classOpts);
        expect(upvotedQClass.questions[1].votes.length).to.equal(1);
        
        // remove vote
        voteQuestOpts.body.up = false;
        const novoted = await request(voteQuestOpts);
        expect(novoted.success).to.equal(true);
        
        // confirm vote count is 0
        const novotedQClass = await request(classOpts);
        expect(novotedQClass.questions[1].votes.length).to.equal(0);
    });

    it("should allow answers to being voted for", async () => {
        const voteAnswOpts = {
            method: 'PUT',
            uri: `${baseUrl}/api/v1/classrooms/${testId}/questions/${questId}/answers/${answerId}`,
            json: true,
            jar: stuJar,
            body: { up: true, }
        };
        const classOpts = {
            method: 'GET',
            uri: `${baseUrl}/api/v1/classrooms/${testId}`,
            json: true,
            jar: stuJar,
        };

        // upvote the answer
        const upvoted = await request(voteAnswOpts);
        expect(upvoted.success).to.equal(true);
        
        // confirm vote count is 1
        const upvotedQClass = await request(classOpts);
        expect(upvotedQClass.questions[1].answers[0].votes.length).to.equal(1);
        
        // remove vote 
        voteAnswOpts.body.up = false;
        const novoted = await request(voteAnswOpts);
        expect(novoted.success).to.equal(true);
        
        // confirm vote count is 0
        const novotedQClass = await request(classOpts);
        expect(novotedQClass.questions[1].answers[0].votes.length).to.equal(0);
    });
});
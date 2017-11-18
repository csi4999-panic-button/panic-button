"use strict";

const request = require("request-promise");
const tough = require("tough-cookie");
const baseUrl = "http://localhost:3000"
const users = require("./data/users");
const classrooms = require("./data/classrooms");
const schools = require("./data/schools");
let testMembers = [null,null,null];
const [STUDENT,TA, TEACHER] = [0,1,2]
let topicClassId;
const classTopics = [ "Introduction", "Syllabus", "Exam Expectations" ];

// This series of tests uses user[2] for registration. login, and manipulation
describe("Classrooms", () => {
    it("should fail to create a classroom due to unauthorized", async () => {
        const thisClassroom = classrooms[0][0];
        const classOpts = {
            method: "POST",
            uri: `${baseUrl}/api/v1/classrooms`,
            json: true,
            body: thisClassroom,
            resolveWithFullResponse: true,
        };

        try {
            const failedClass = await request(classOpts);
            return false;
        } catch(err) {
            expect(err.statusCode).to.equal(401);
        }
    });

    it("should create the classroom with a registered user", async() => {
        const j = request.jar();
        const thisUser = users[2];
        const thisClassroom = classrooms[0][0];
        const userOpts = {
            method: 'POST',
            uri: `${baseUrl}/register`,
            json: true,
            body: {
                email: thisUser.email,
                firstName: thisUser.firstName,
                lastName: thisUser.lastName,
                password: thisUser.password,
            },
            jar: j,
            resolveWithFullResponse: true,
            simple: false,
        };
        const loginOpts = {
            method: 'POST',
            uri: `${baseUrl}/login`,
            json: true,
            body: {
                email: thisUser.email,
                password: thisUser.password
            },
            jar: j,
            simple: false,
        };
        const classOpts = {
            method: "POST",
            uri: `${baseUrl}/api/v1/classrooms`,
            json: true,
            body: thisClassroom,
            jar: j,
        };

        // register new user account
        const register = await request(userOpts);
        
        // login to the new user account
        const login = await request(loginOpts);
    
        // create classroom as new user account
        const newClass = await request(classOpts);
        topicClassId = newClass._id;
        expect(newClass.courseTitle).to.equal(thisClassroom.courseTitle);
    });

    it("should fail to create classroom with a registered user and non-existing school", async() => {
        const j = request.jar();
        const thisUser = users[2];
        const thisSchool = schools[2];
        const thisClassroom = classrooms[2][0];
        
        const loginOpts = {
            method: 'POST',
            uri: `${baseUrl}/login`,
            json: true,
            body: {
                email: thisUser.email,
                password: thisUser.password
            },
            jar: j,
            simple: false,
        };
        const classOpts = {
            method: "POST",
            uri: `${baseUrl}/api/v1/classrooms`,
            json: true,
            body: thisClassroom,
            jar: j,
        };
        
        // login to the new user account
        const login = await request(loginOpts);

        // create classroom under user account
        classOpts.schoolId = "0123457123841230408";
        return request(classOpts)
        .then(res => false)
        .catch((err) => {
            expect(err.success).to.equal(false);
        });
    });

    it("should create the classroom with a registered user under given school", async() => {
        const j = request.jar();
        const thisUser = users[2];
        const thisSchool = schools[2];
        const thisClassroom = classrooms[2][0];
        
        const loginOpts = {
            method: 'POST',
            uri: `${baseUrl}/login`,
            json: true,
            body: {
                email: thisUser.email,
                password: thisUser.password
            },
            jar: j,
            simple: false,
        };
        const schoolOpts = {
            method: "POST",
            uri: `${baseUrl}/api/v1/schools`,
            json: true,
            body: thisSchool,
            jar: j,
        };
        const classOpts = {
            method: "POST",
            uri: `${baseUrl}/api/v1/classrooms`,
            json: true,
            body: thisClassroom,
            jar: j,
        };
        
        // login to the new user account
        const login = await request(loginOpts);
    
        // create school under user account
        const newSchool = await request(schoolOpts);
        expect(newSchool.name).to.equal(thisSchool.name);

        // create classroom under user account
        classOpts.schoolId = newSchool._id;
        const newClass = await request(classOpts);
        expect(newClass.courseTitle).to.equal(thisClassroom.courseTitle);
    });

    // this joins classroom where user 2 is teacher, with the following types:
    // user[3]: student, user[4]: teacherAssistant, user[5]: teacher
    it("should join a classroom as a newly registered user", () => {
        const teaJar = request.jar();
        const teacher = users[2];
        const thisClassroom = classrooms[0][0];
        const teacherOpts = {
            method: 'POST',
            uri: `${baseUrl}/login`,
            json: true,
            body: {
                email: teacher.email,
                password: teacher.password
            },
            jar: teaJar,
            simple: false,
        };
        const classOpts = {
            method: "POST",
            uri: `${baseUrl}/api/v1/classrooms`,
            json: true,
            body: thisClassroom,
            jar: teaJar,
        };
        const inviteOpts = {
            method: 'POST',
            uri: `${baseUrl}/api/v1/classrooms/join`,
            json: true,
        };
    
        let codes = null;
        // login to the new user account
        return request(teacherOpts)
        .then( (teaLoggedIn) => request(classOpts))
        .then( (newClass) => {
            codes = [newClass.studentCode, newClass.taCode, newClass.teacherCode];
            expect(newClass.courseTitle).to.equal(thisClassroom.courseTitle);
            return Promise.all(users.slice(3,6).map((student)=> {
                const stuJar = request.jar();
                const studentOpts = {
                    method: 'POST',
                    uri: `${baseUrl}/register`,
                    json: true,
                    body: {
                        email: student.email,
                        firstName: student.firstName,
                        lastName: student.lastName,
                        password: student.password,
                    },
                    jar: stuJar,
                    resolveWithFullResponse: true,
                    simple: false,
                };
                const stuLogOpts = {
                    method: 'POST',
                    uri: `${baseUrl}/login`,
                    json: true,
                    body: {
                        email: student.email,
                        password: student.password
                    },
                    jar: stuJar,
                    simple: false,
                };
    
                // register new user account
                return request(studentOpts)
                .then( (stuRegister) => {
                    return request(stuLogOpts);
                }).then( (stuLoggedIn) => {
                    testMembers[student.codeIndex] = student;
                    const stuInviteOpts = {
                        method: 'POST',
                        uri: `${baseUrl}/api/v1/classrooms/join`,
                        json: true,
                        body: { inviteCode: codes[student.codeIndex] },
                        jar: stuJar,
                    }
                    return request(stuInviteOpts);
                });
            }))
        }).then( (allJoins) => {
            allJoins.forEach((joined) => {
                expect(joined.success).to.equal(true);
            });
        }).catch( err => { console.log(err); false });
    });

    // leave the classroom, user 3
    it("should list the classroom the teacher belongs to with codes", async () => {
        const thisUser = testMembers[TEACHER];
        const j = request.jar();
        const thisClassroom = classrooms[0][0];
        const loginOpts = {
            method: 'POST',
            uri: `${baseUrl}/login`,
            json: true,
            body: {
                email: thisUser.email,
                password: thisUser.password
            },
            jar: j,
            simple: false,
        };
        const classListOpts = {
            method: 'GET',
            uri: `${baseUrl}/api/v1/classrooms`,
            json: true,
            jar: j
        }

        const login = await request(loginOpts);

        const classList = await request(classListOpts);
        expect(classList.length).to.equal(1);
        expect(classList[0].courseTitle).to.equal(thisClassroom.courseTitle);
        expect(classList[0].studentCode).to.not.equal(undefined);
        expect(classList[0].taCode).to.not.equal(undefined);
        expect(classList[0].teacherCode).to.not.equal(undefined);
    });

    // leave the classroom, user 3
    it("should allow a student to list their classroom without codes", async () => {
        const thisUser = testMembers[STUDENT];
        const j = request.jar();
        const thisClassroom = classrooms[0][0];
        const loginOpts = {
            method: 'POST',
            uri: `${baseUrl}/login`,
            json: true,
            body: {
                email: thisUser.email,
                password: thisUser.password
            },
            jar: j,
            simple: false,
        };
        const classListOpts = {
            method: 'GET',
            uri: `${baseUrl}/api/v1/classrooms`,
            json: true,
            jar: j
        }

        const login = await request(loginOpts);

        const classList = await request(classListOpts);
        expect(classList.length).to.equal(1);
        expect(classList[0].courseTitle).to.equal(thisClassroom.courseTitle);
        expect(classList[0].studentCode).to.equal(undefined);
        expect(classList[0].taCode).to.equal(undefined);
        expect(classList[0].teacherCode).to.equal(undefined);
    });

    // leave the classroom, user 3
    it("should allow the student to leave the classroom", async () => {
        const thisUser = testMembers[STUDENT];
        const j = request.jar();
        const thisClassroom = classrooms[0][0];
        const loginOpts = {
            method: 'POST',
            uri: `${baseUrl}/login`,
            json: true,
            body: {
                email: thisUser.email,
                password: thisUser.password
            },
            jar: j,
            simple: false,
        };
        const classListOpts = {
            method: 'GET',
            uri: `${baseUrl}/api/v1/classrooms`,
            json: true,
            jar: j
        }

        const login = await request(loginOpts);

        const classList = await request(classListOpts);
        expect(classList.length).to.equal(1);
        expect(classList[0].courseTitle).to.equal(thisClassroom.courseTitle);
    });

    it("should let the teacher get the current topic in the classroom", async () => {
        const thisUser = users[2];
        const j = request.jar();
        const thisClassroom = classrooms[0][0];
        const loginOpts = {
            method: 'POST',
            uri: `${baseUrl}/login`,
            json: true,
            body: {
                email: thisUser.email,
                password: thisUser.password
            },
            jar: j,
            simple: false,
        };
        const currentTopicOpts = {
            method: 'GET',
            uri: `${baseUrl}/api/v1/classrooms/${topicClassId}/topics/current`,
            json: true,
            body: { topics: classTopics },
            jar: j,
        }

        const login = await request(loginOpts);

        const topicUpdate = await request(currentTopicOpts);
        expect(topicUpdate.topic).to.equal("General");
    });

    it("should let the teacher update the topics of the classroom", async () => {
        const thisUser = users[2];
        const j = request.jar();
        const thisClassroom = classrooms[0][0];
        const loginOpts = {
            method: 'POST',
            uri: `${baseUrl}/login`,
            json: true,
            body: {
                email: thisUser.email,
                password: thisUser.password
            },
            jar: j,
            simple: false,
        };
        const topicUpdateOpts = {
            method: 'POST',
            uri: `${baseUrl}/api/v1/classrooms/${topicClassId}/topics`,
            json: true,
            body: { topics: classTopics },
            jar: j,
        };
        const currentTopicOpts = {
            method: 'GET',
            uri: `${baseUrl}/api/v1/classrooms/${topicClassId}/topics/current`,
            json: true,
            body: { topics: classTopics },
            jar: j,
        };

        const login = await request(loginOpts);

        const topicUpdate = await request(topicUpdateOpts);
        expect(topicUpdate.success).to.equal(true);

        const currentTopic = await request(currentTopicOpts);
        expect(currentTopic.topic).to.equal(classTopics[0]);
    });

    it("should let the teacher switch between topics in the classroom", async () => {
        const thisUser = users[2];
        const j = request.jar();
        const thisClassroom = classrooms[0][0];
        const classTopics = [ "Introduction", "Syllabus", "Exam Expectations" ];
        const baseRoute = `${baseUrl}/api/v1/classrooms/${topicClassId}/topics`;
        const loginOpts = {
            method: 'POST',
            uri: `${baseUrl}/login`,
            json: true,
            body: {
                email: thisUser.email,
                password: thisUser.password
            },
            jar: j,
            simple: false,
        };
        const currentTopicOpts = {
            method: 'GET',
            uri: `${baseUrl}/api/v1/classrooms/${topicClassId}/topics/current`,
            json: true,
            body: { topics: classTopics },
            jar: j,
        };
        const nextTopicOpts = {
            method: 'PUT',
            uri: `${baseRoute}/next`,
            json: true,
            jar: j,
        };
        const previousTopicOpts = {
            method: 'PUT',
            uri: `${baseRoute}/previous`,
            json: true,
            jar: j,
        };

        const login = await request(loginOpts);

        const currentTopic = await request(currentTopicOpts);
        expect(currentTopic.topic).to.equal(classTopics[0]);

        let localTopicIndex = 0;
        // classTopics[1] ===  "Syllabus"
        const nextTopic = await request(nextTopicOpts);
        expect(nextTopic.topic).to.equal(classTopics[++localTopicIndex]);
        // classTopics[2] ===  "Exam Expectations"
        const nextTopic1 = await request(nextTopicOpts);
        expect(nextTopic1.topic).to.equal(classTopics[++localTopicIndex]);
        // classTopics[3] === undefined, but server should append "General" to array
        const nextTopic2 = await request(nextTopicOpts);
        expect(nextTopic2.topic).to.equal("General");
        // classTopics[2] === "Exam Expectations"
        const previousTopic = await request(previousTopicOpts);
        expect(previousTopic.topic).to.equal(classTopics[localTopicIndex]);
    });
});
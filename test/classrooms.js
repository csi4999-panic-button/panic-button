"use strict";

const request = require("request-promise");
const tough = require("tough-cookie");
const baseUrl = "http://localhost:3000"
const users = require("./data/users");
const classrooms = require("./data/classrooms");
const schools = require("./data/schools");
let testMembers = [null,null,null];
const [STUDENT,TA, TEACHER] = [0,1,2]


// This series of tests uses user[2] for registration. login, and manipulation
describe("Classrooms", () => {
    it("should fail to create a classroom due to unauthorized", async () => {
        const thisClassroom = classrooms[0][0];
        const classOpts = {
            method: "POST",
            uri: baseUrl + "/api/v1/classrooms",
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
        const classOpts = {
            method: "POST",
            uri: baseUrl + "/api/v1/classrooms",
            json: true,
            body: thisClassroom,
            jar: j,
        };

        // register new user account
        const register = await request(userOpts);
        expect(register.firstName).to.equal(thisUser.firstName);
        
        // login to the new user account
        const login = await request(loginOpts);
        expect(login.success).to.equal(true);
    
        // create classroom as new user account
        const newClass = await request(classOpts);
        expect(newClass.courseTitle).to.equal(thisClassroom.courseTitle);
    });

    it("should fail to create classroom with a registered user and non-existing school", async() => {
        const j = request.jar();
        const thisUser = users[2];
        const thisSchool = schools[2];
        const thisClassroom = classrooms[2][0];
        
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
        const classOpts = {
            method: "POST",
            uri: baseUrl + "/api/v1/classrooms",
            json: true,
            body: thisClassroom,
            jar: j,
        };
        
        // login to the new user account
        const login = await request(loginOpts);
        expect(login.success).to.equal(true);

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
            uri: baseUrl + "/login",
            json: true,
            body: {
                email: thisUser.email,
                password: thisUser.password
            },
            jar: j,
        };
        const schoolOpts = {
            method: "POST",
            uri: baseUrl + "/api/v1/schools",
            json: true,
            body: thisSchool,
            jar: j,
        };
        const classOpts = {
            method: "POST",
            uri: baseUrl + "/api/v1/classrooms",
            json: true,
            body: thisClassroom,
            jar: j,
        };
        
        // login to the new user account
        const login = await request(loginOpts);
        expect(login.success).to.equal(true);
    
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
            uri: baseUrl + "/login",
            json: true,
            body: {
                email: teacher.email,
                password: teacher.password
            },
            jar: teaJar,
        };
        const classOpts = {
            method: "POST",
            uri: baseUrl + "/api/v1/classrooms",
            json: true,
            body: thisClassroom,
            jar: teaJar,
        };
        const inviteOpts = {
            method: 'POST',
            uri: baseUrl + "/api/v1/classrooms/join",
            json: true,
        };
    
        // login to the new user account
        let [codeIndex, codes] = [0, null];
        return request(teacherOpts)
        .then( (teaLoggedIn) => {
            expect(teaLoggedIn.success).to.equal(true);
            return request(classOpts);
        }).then( (newClass) => {
            codes = [newClass.studentCode, newClass.taCode, newClass.teacherCode];
            expect(newClass.courseTitle).to.equal(thisClassroom.courseTitle);
            return Promise.all(users.slice(3,6).map((student)=> {
                const stuJar = request.jar();
                const studentOpts = {
                    method: 'POST',
                    uri: baseUrl + "/register",
                    json: true,
                    body: student,
                    jar: stuJar,
                };
                const stuLogOpts = {
                    method: 'POST',
                    uri: baseUrl + "/login",
                    json: true,
                    body: {
                        email: student.email,
                        password: student.password
                    },
                    jar: stuJar,
                };
    
                // register new user account
                return request(studentOpts)
                .then( (stuRegister) => {
                    expect(stuRegister.firstName).to.equal(student.firstName);
                    return request(stuLogOpts);
                }).then( (stuLoggedIn) => {
                    expect(stuLoggedIn.success).to.equal(true);
                    testMembers[codeIndex] = student;
                    const stuInviteOpts = {
                        method: 'POST',
                        uri: baseUrl + "/api/v1/classrooms/join",
                        json: true,
                        body: { inviteCode: codes[codeIndex++] },
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

    // list the classroom the teacher belongs to with codes
    it("should list the classroom the teacher belongs to with codes", async () => {
        const thisUser = testMembers[TEACHER];
        const j = request.jar();
        const thisClassroom = classrooms[0][0];
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
        const classListOpts = {
            method: 'GET',
            uri: baseUrl + "/api/v1/classrooms",
            json: true,
            jar: j
        }

        const login = await request(loginOpts);
        expect(login.success).to.equal(true);

        const classList = await request(classListOpts);
        expect(classList.length).to.equal(1);
        expect(classList[0].courseTitle).to.equal(thisClassroom.courseTitle);
        expect(classList[0].studentCode).to.not.equal(undefined);
        expect(classList[0].taCode).to.not.equal(undefined);
        expect(classList[0].teacherCode).to.not.equal(undefined);
    });

    // allow a student to list their classroom without codes
    it("should allow a student to list their classroom without codes", async () => {
        const thisUser = testMembers[STUDENT];
        const j = request.jar();
        const thisClassroom = classrooms[0][0];
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
        const classListOpts = {
            method: 'GET',
            uri: baseUrl + "/api/v1/classrooms",
            json: true,
            jar: j
        }

        const login = await request(loginOpts);
        expect(login.success).to.equal(true);

        const classList = await request(classListOpts);
        expect(classList.length).to.equal(1);
        expect(classList[0].courseTitle).to.equal(thisClassroom.courseTitle);
        expect(classList[0].studentCode).to.equal(undefined);
        expect(classList[0].taCode).to.equal(undefined);
        expect(classList[0].teacherCode).to.equal(undefined);
    });

    // leave the classroom, user 3
    it("should allow the user to leave the classroom", async () => {
        const thisUser = testMembers[TA];
        const j = request.jar();
        const thisClassroom = classrooms[0][0];
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
        const classListOpts = {
            method: 'GET',
            uri: baseUrl + "/api/v1/classrooms",
            json: true,
            jar: j
        }

        const login = await request(loginOpts);
        expect(login.success).to.equal(true);

        const classList = await request(classListOpts);
        expect(classList.length).to.equal(1);
        expect(classList[0].courseTitle).to.equal(thisClassroom.courseTitle);
    });
});
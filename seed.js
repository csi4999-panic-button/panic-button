"use strict";

// THIS SEED SCRIPT DELETES THE DATABASE TO ENSURE IT CREATES ACCOUNT
// THAT RESPECT THE UNIQUE INDICES OF DATABASE SCHEMAS. DO NOT USE IN PRODUCTION
//
// the purpose of this script is to fill the database with the required data 
// for consistent use of the development environment, including dev users, 
// test classrooms, schools. users, and more

const users = require("./test/data/users");
const schools = require("./test/data/schools");
const classrooms = require("./test/data/classrooms");
const request = require("request-promise");
const panichost = process.env.PANIC_HOST || "localhost";
const panicport = process.env.PANIC_PORT || "3000";

const baseUrl = "http://"+panichost+":"+panicport;
const mongoURI = require("./src/server/util").getMongoURI();

let mongoose = require("mongoose");
mongoose.connect(mongoURI,()=>{mongoose.connection.db.dropDatabase()});

const fullUsers = users.map(u => Object.assign({},u,{jar: request.jar()}));
let fullSchools;
let fullClassrooms;
const teacherMapping = [null,null,null];

const randomCodeFrom = function(c){
    if(Math.floor(Math.random() * 4) === 0)
        return c.taCode;
    return c.studentCode;
}

const range = function(n){
    let a=[];
    while(n>0)
        a=[--n].concat(a);
    return a;
}

const generateUsers = function(){
    return Promise.all(fullUsers.map( async (user) => {
        const registerOpts = {
            method: "POST",
            uri: baseUrl + "/register",
            json: true,
            jar: user.jar,
            body: {
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                password: user.password,
            },
        }
        const loginOpts = {
            method: "POST",
            uri: baseUrl + "/login",
            json: true,
            jar: user.jar,
            body: {
                email: user.email,
                password: user.password,
            },
        }
        return request(registerOpts)
        .then( (newUser) => {
            return request(loginOpts);
        }).catch( (err) => {
            console.log(err);
            process.exit(1);
        });
    }));
}

const generateSchools = async function() {
    fullSchools = await Promise.all(schools.map( async (school) => {
        const thisUser = fullUsers[0];
        const schoolOpts = {
            method: "POST",
            uri: baseUrl + "/api/v1/schools",
            json: true,
            jar: thisUser.jar,
            body: school,
        }
        return request(schoolOpts)
        .then( (newSchool) => Object.assign({},newSchool,school))
        .catch( (err) => { 
            console.log(err); 
            process.exit(0); 
        });
    }));
}

const generateClassrooms = async function() {
    let classIndex = 0;
    const schoolsTeachers = schools.map((s)=>[classIndex++,fullUsers.filter((u)=>u.email.endsWith(s.domain))[0]]);
    fullClassrooms = await Promise.all(schoolsTeachers.map( async ([index, theTeacher])=>{
        return Promise.all(classrooms[index].map( (c) => {
            const classOpts = {
                method: "POST",
                uri: baseUrl + "/api/v1/classrooms",
                json: true,
                jar: theTeacher.jar,
                body: c,
            }
            return request(classOpts);
        }));
    })).catch( (err) => {
        console.log(err);
        process.exit(0);
    });
};

const joinOthersToClassrooms = async function() {
    const notTeachers = schools.map((s)=>fullUsers.filter((u)=>u.email.endsWith(s.domain)).slice(1));
    const joinUrl = baseUrl + "/api/v1/classrooms/join";

    return Promise.all(range(3).map((schoolIndex) => 
        Promise.all(notTeachers[schoolIndex].map((student)=>
            Promise.all(fullClassrooms[schoolIndex].map((classroom)=>
                request({
                    method: "POST",
                    uri: joinUrl,
                    body: { inviteCode: randomCodeFrom(classroom) },
                    json: true,
                    jar: student.jar,
                })
            ))
        ))
    ));
}

generateUsers()
.then(_=>generateSchools())
.then(_=>generateClassrooms())
.then(_=>joinOthersToClassrooms())
.then(_=>process.exit(0));
"use strict";

// the purpose of this script is to fill the database with the required data 
// for consistent use of the development environment, including dev users, 
// test classrooms, schools. users, and more

const users = require("./test/data/users");
const schools = require("./test/data/schools");
const classrooms = require("./test/data/classrooms");
const request = require("request-promise");
const baseUrl = "http://localhost:3000";

const fullUsers = users.map(u => Object.assign({},u,{jar: request.jar()}));
console.log(fullUsers);
let fullSchools;
let fullClassrooms;

Promise.all(fullUsers.map( async (user) => {
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
    return request(registerOpts)
    .then( (newUser) => {
        console.log("Received response"); 
        console.log(newUser);
    }).catch( (err) => {
        console.log(err);
        process.exit(1);
    });
}))
.then( (allStudents) => {
    const thisUser = fullUsers[0];
    const loginOpts = {
        method: "POST",
        uri: baseUrl + "/login",
        json: true,
        jar: thisUser.jar,
        body: {
            email: thisUser.email,
            password: thisUser.password,
        },
    }
    return request(loginOpts);
}).then( (loggedIn) => {
    return Promise.all(schools.map( async (school) => {
        const thisUser = fullUsers[0];
        const schoolOpts = {
            method: "POST",
            uri: baseUrl + "/api/v1/schools",
            json: true,
            jar: thisUser.jar,
            body: school,
        }
        request(schoolOpts)
        .then( (newSchool) => { 
            school._id = newSchool._id; 
        }).catch( (err) => { 
            //console.log(err); 
            process.exit(0); 
        });
    }));
}).then( (allSchools) => {
    fullSchools = allSchools;
    let schoolIndex = 0;
    return Promise.all(fullUsers.slice(0,4).map( async (thisUser) => {
        return Promise.all(classrooms[schoolIndex++].map( async (classroom) => {
            const classOpts = {
                method: "POST",
                uri: baseUrl + "/api/v1/classrooms",
                json: true,
                jar: thisUser.jar,
                body: classroom,
            }
            return request(classOpts);
        }));
    }));
}).then( (allClasses) => {
    console.log(allClasses);
}).catch( (err) => { 
    console.log(err); 
    process.exit(0)
});

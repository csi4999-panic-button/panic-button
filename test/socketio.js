"use strict";

const request = require("request-promise");
const tough = require("tough-cookie");
const users = require("./data/users");
const classrooms = require("./data/classrooms");

const io = require("socket.io-client");
const baseUrl = 'http://localhost:3000';
const options = {  
  transports: ['websocket'],
  'force new connection': true
};

let authToken;

// DANS CODE
// const socketio = require("socket.io-client");
// const io = socketio("http://localhost:3000");
// io.on("connect", () => {
//   console.log("connected");
//   io.emit("login", "e571602e6cd3aa819dab11c882e31e2b33649c5c692c46a655868d1515f7cf16e97257bf352c0121c91af70cc8b8ddb2");
// });
// io.on("login_success", console.log);
// io.on("disconnect", () => console.log("disconnect"));


// This series of tests uses user[2] for registration. login, and manipulation
describe("Socket.IO", () => {
    let client1, client2, client3;

    it("should connect to the server successfully", (done) => {
        client1 = io(baseUrl, options);
        client1.on("connect",()=>{
            console.log("Connected:",client1.connected);
            expect(client1.connected).to.equal(true);
            client1.disconnect();
            done();
        });
    });

    it("should login to server using token", (done) => {
        const thisUser = users[1];
        const j = request.jar();
        const loginOpts = {
            method: "POST",
            uri: baseUrl + "/login",
            json: true,
            body: {
                email: thisUser.email,
                password: thisUser.password,
            },
            jar: j,
        };
        const authOpts = {
            method: "POST",
            uri: baseUrl + "/api/v1/authenticate",
            json: true,
            jar: j,
            resolveWithFullResponse: true,
        };

        request(loginOpts)
        .then( (user) => {
            expect(user.firstName).to.equal(thisUser.firstName);
            expect(user.lastName).to.equal(thisUser.lastName);
            console.log("User logged in as: " + user.firstName + " " + user.lastName);
            return request(authOpts);
        }).then( (auth) => {
            console.log(auth);
            expect(auth.statusCode).to.equal(200);
            authToken = auth.body.token;
            console.log("Auth token:",authToken);
            client2 = io(baseUrl, options);
            client2.on("connect",()=>{
                client2.emit("login", authToken);
                client2.on("login_success",(status)=>{
                    console.log("logged in successfully");
                    expect(status).to.equal(true);
                    done();
                });
            });
        })
        .catch( (err) => {
            done(err);
        }); 
    });

    it("should emit messages to server", (done) => {
        client3 = io(baseUrl, options);
        client3.emit("login",authToken);
        client3.on("login_success", (status)=>{
            expect(status).to.equal(true);
            client3.emit("panic", { classroom: "asdf", state: true });
            done();
        });
    });

    it("should receive panic updates from the server", (done) => {
        const thisUser = users[3];
        const j = request.jar();
        const loginOpts = {
            method: "POST",
            uri: baseUrl + "/login",
            json: true,
            body: {
                email: thisUser.email,
                password: thisUser.password,
            },
            jar: j,
            resolveWithFullResponse: true,
        };
        const classOpts = {
            method: "GET",
            uri: baseUrl + "/api/v1/classrooms",
            json: true,
            jar: j,
        };
        request(loginOpts)
        .then((loginReq)=>{
            console.log(loginReq);
            expect(loginReq.statusCode).to.equal(200);
            expect(loginReq.body.firstName).to.equal(thisUser.firstName);
            expect(loginReq.body.lastName).to.equal(thisUser.lastName);
            return request(classOpts);
        }).then((classes)=>{
            console.log(classes);
            client3 = io(baseUrl, options);
            client3.emit("login",authToken);
            client3.on("login_success", (status)=>{
                console.log("Status:",status);
                expect(status).to.equal(true);
                console.log("Classroom:",classes[0]._id);
                client3.on("panic",(body) => {
                    console.log(body);
                    done(); 
                 });
                client3.emit("panic", { classroom: classes[0]._id, state: true });
                
            });
        }).catch( (err) => {
            done(err);
        });
        
    });

    
});
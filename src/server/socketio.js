"use strict";

const Classrooms = require("./models/classrooms");
const Users = require("./models/users");

const panicked = {};
const timers = {};

module.exports = (app, io) => {
  io.on("connection", async (socket) => {
    console.log("New socket connection");
    socket.once("login", async (token) => {
      const user = await Users.findOne({ apiToken: token });
      if (!user) {
        socket.emit("login_success", false);
        socket.disconnect(true);
        console.log("Socket login failure");
        return;
      }

      socket.user = user;
      console.log("Socket login success", user.email);
      socket.emit("login_success", true);

      // join to all classrooms
      const classrooms = await Classrooms.find({
        students: socket.user.id,
      });
      classrooms.forEach((classroom) => {
        socket.join(classroom.id);
        console.log("Joining socket to classroom",classroom.id);
      });

      // join/leave classrooms after socket connection
      app.ee.on(`${socket.user.id}:join`, (classroom) => socket.join(classroom));
      app.ee.on(`${socket.user.id}:leave`, (classroom) => socket.leave(classroom));

      socket.on("panic", async (event) => {
        if(typeof event === 'string')
          event = JSON.parse(event);
        console.log("socket panic event received");
        console.log("_id:",event.classroom);
        console.log("students:",socket.user.id);
        console.log("event contains:", event);
        const classroom = await Classrooms.findOne({
          _id: event.classroom,
          students: socket.user.id,
        });
        console.log(classroom);
        if (!classroom) return;
        console.log(socket.user.id, "belongs to", classroom.courseTitle);
        if (event.state === null || event.state === undefined) {
          event.state = true;
        }
        console.log("emitted state:", event.state);
        app.ee.emit("panic", { user: socket.user.id, classroom: event.classroom, state: event.state });
      });

    });
  });

  app.ee.on("panic", (event) => {
    console.log("app.ee panic event received");
    if (!panicked[event.classroom]) {
      panicked[event.classroom] = new Set();
      console.log("Created new classroom panic session");
    }

    // clear timer
    if (timers[event.user] && timers[event.user][event.classroom]) {
      clearTimeout(timers[event.user][event.classroom]);
      console.log("Cleared",event.user,"due to timeout");
    }

    if (event.state) {
      panicked[event.classroom].add(event.user);
      // set timer
      timers[event.user] = timers[event.user] || {};
      timers[event.user][event.classroom] = setTimeout(() => {
        app.ee.emit("panic", {
          classroom: event.classroom,
          user: event.user,
          state: false,
        });
      }, 1000 * 10);
      console.log("Added user",event.user,"to panic state");
    } else {
      panicked[event.classroom].delete(event.user);
      console.log("Removed user",event.user,"from panic state");
    }

    io.in(event.classroom).emit("panic", {
      classroom: event.classroom,
      panicNumber: panicked[event.classroom].size,
    });
    console.log("panicNumber:", panicked[event.classroom].size)
  });

  return io;
};


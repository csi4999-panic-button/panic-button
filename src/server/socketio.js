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
        socket.join(socket.user.id);
        console.log("Joining socket to classroom",classroom.id);
        console.log("Joining socket to user",socket.user.id);
      });

      socket.on("panic", async (event) => {
        // Android app sends strings, Web UI sends objects
        event = (typeof event === "string") ? JSON.parse(event) : event;

        // judicious logging
        console.log("socket panic event received");
        console.log("_id:",event.classroom);
        console.log("students:",socket.user.id);
        console.log("event contains:", event);

        const classroom = await Classrooms.findOne({
          _id: event.classroom,
          students: socket.user.id,
        });

        if (!classroom) return;
        console.log(socket.user.id, "belongs to", classroom.name);
        if (event.state === null || event.state === undefined) {
          event.state = true;
        }
        console.log("emitted state:", event.state);
        app.ee.emit("panic", { user: socket.user.id, classroom: event.classroom, state: event.state });
      });

      // join/leave classrooms after socket connection
      app.ee.on(`${socket.user.id}:join`, (classroom) => socket.join(classroom));
      app.ee.on(`${socket.user.id}:leave`, (classroom) => socket.leave(classroom));
    });
  });

  app.ee.on("panic", (event) => {
    console.log("app.ee panic event received");

    // ensure set of panicked students exists for classroom
    // default empty set
    if (!panicked[event.classroom]) {
      panicked[event.classroom] = new Set();
      console.log("Created new classroom panic session");
    }

    // clear timer. Will be reset if panic state is true
    if (timers[event.user] && timers[event.user][event.classroom]) {
      clearTimeout(timers[event.user][event.classroom]);
      console.log("Cleared",event.user,"due to timeout");
    }

    if (event.state) {
      // set user's panicked state true
      panicked[event.classroom].add(event.user);

      // ensure timers object exists for user
      timers[event.user] = timers[event.user] || {};

      // after 10 seconds, set panic to false for user in classroom
      timers[event.user][event.classroom] = setTimeout(() => {
        app.ee.emit("panic", { classroom: event.classroom, user: event.user, state: false });
      }, 1000 * 10);
    } else {
      // unpanick user
      panicked[event.classroom].delete(event.user);
      console.log("Removed user",event.user,"from panic state");
    }

    io.in(event.classroom).emit("panic", {
      classroom: event.classroom,
      panicNumber: panicked[event.classroom].size,
    })
      .in(event.user).emit("panic_state_change", {
        classroom: event.classroom,
        state: event.state,
      });
    console.log("panicNumber:", panicked[event.classroom].size)
  });

  app.ee.on("new_question", (event) => {
    console.log("event contains", event);

    io.in(event.classroom).emit("new_question", {
      classroom: event.classroom,
      questionId: event.question.id,
      questionStr: event.question.question,
    });
  });

  app.ee.on("new_answer", (event) => {
    console.log("event contains", event);
    
    io.in(event.classroom).emit("new_question", {
      classroom: event.classroom,
      questionId: event.question.id,
      answerId: event.answer.id,
      answerStr: event.answer.answer,
    });
  });
  

  app.ee.on("refresh_questions", (event) => {
    console.log("event contains", event);
    
    io.in(event.user).emit("refresh_questions", event.questions);
  })
  
  return io;
};


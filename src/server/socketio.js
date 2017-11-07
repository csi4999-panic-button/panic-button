"use strict";

const ClassroomModel = require("./models/classrooms");

const panicked = {};
const timers = {};

module.exports = (app, io) => {
  io.on("connection", async (socket) => {
    // if not logged in, do nothing
    if (!socket.handshake.session.user) return;

    socket.user = await UserModel.findById(socket.handshake.session.user);

    // join to all classrooms
    const classrooms = await ClassroomModel.find({
      students: socket.user.id,
    });
    classrooms.forEach((classroom) => socket.join(classroom.id));

    // join/leave classrooms after socket connection
    app.ee.on(`${socket.user.id}:join`, (classroom) => socket.join(classroom));
    app.ee.on(`${socket.user.id}:leave`, (classroom) => socket.leave(classroom));

    socket.on("panic", async (event) => {
      const classroom = await ClassroomModel.findOne({
        _id: event.classroom,
        students: socket.user.id,
      });

      if (!classroom) return;

      if (event.state === null || event.state === undefined) {
        event.state = true;
      }

      app.ee.emit("panic", { user: socket.user.id, classroom: event.classroom, state: event.state });
    });
  });

  app.ee.on("panic", (event) => {
    if (!panicked[event.classroom]) {
      panicked[event.classroom] = new Set();
    }

    // clear timer
    if (timers[event.user] && timers[event.user][event.classroom]) {
      clearTimeout(timers[event.user][event.classroom]);
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
    } else {
      panicked[event.classroom].delete(event.user);
    }

    io.in(event.classroom).emit("panic", {
      classroom: event.classroom,
      panicNumber: panicked[event.classroom].size,
    });
  });
};


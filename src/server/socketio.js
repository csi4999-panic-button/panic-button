"use strict";

const ClassroomModel = require("./models/classrooms");

const panicked = {};

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

    socket.on("panic", (event) => {
      const classroom = await ClassroomModel.findOne({
        _id: event.classroom,
        students: socket.user.id,
      });

      if (!classroom) return;

      app.ee.emit("panic", { user: socket.user.id, classroom: event.classroom });
    });
  });
};


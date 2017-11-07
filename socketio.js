"use strict";

const socketio = require("socket.io-client");
const io = socketio("http://localhost:3000");

io.on("connect", () => {
  console.log("connected");
  io.emit("login", "e571602e6cd3aa819dab11c882e31e2b33649c5c692c46a655868d1515f7cf16e97257bf352c0121c91af70cc8b8ddb2");
});

io.on("login_success", console.log);
io.on("disconnect", () => console.log("disconnect"));

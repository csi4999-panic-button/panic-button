"use strict";

const path = require("path");
const fs = require("fs");
const EventEmitter = require('events');

const express = require("express");

// Inintialize express app
const app = express();
app.ee = new EventEmitter();

app.ee.on("logout", console.log);

// connect to database
const mongoose = require("mongoose");

// parsers
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");

// sessions
const session = require("express-session");
const MongoStore = require("connect-mongo")(session);

// passport
const passport = require("passport");
const strategies = require("./auth");

const localStrategy = strategies.local;
const bearerStrategy = strategies.token;

// request logging
const morgan = require("morgan")("dev")

// routes
const routes = require("./routes");

mongoose.Promise = global.Promise;

const mongoURI = require("./util").getMongoURI();

console.log(mongoURI);

mongoose.connect(mongoURI, {
  useMongoClient: true,
  promiseLibrary: global.Promise,
}, (err) => {
  if (err) {
    // mongo connection failure
    console.error(err);
    process.exit(1);
  }

  // decode requests
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(cookieParser());

  // Session middleware
  app.use(session({
    resave: false,
    saveUninitialized: false,
    secret: process.env.LOGIN_SECRET || "this is a secret",
    cookie: {
      httpOnly: true,
    },
    store: new MongoStore({
      mongooseConnection: mongoose.connection,
      touchAfter: 24 * 3600,
    }),
  }));

  // set up passport middlewares
  passport.use(localStrategy);
  passport.use(bearerStrategy);
  app.use(passport.initialize());
  app.use(passport.session());

  // log all requests
  app.use(morgan);

  const addr = process.env.ADDR || '0.0.0.0';
  const port = process.env.PORT || 3000;

  // set up routes
  app.use("/", routes);

  app.use(express.static(path.join(__dirname, "../client/dist")));
  app.use((req, res, next) => {
    fs.exists(path.join(__dirname, "../client/dist/index.html"), (exists) => {
      if (exists) {
        res.sendFile(path.resolve(path.join(__dirname, "../client/dist/index.html")));
      } else {
        next();
      }
    });
  });

  const server = app.listen(port);
  const io = require("socket.io")(server);

  require("./socketio")(app, io);

  process.on("message", (msg) => {
    if (msg === "shutdown") {
      io.close(() => {
        server.close(() => {
          process.exit(0);
        });
      });
    }
  });

  console.log(`Listening on port ${port}`);
});


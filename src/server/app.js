"use strict";

const path = require("path");

const express = require("express");

// Inintialize express app
const app = express();
app.use(express.static(path.join(__dirname, "../client/dist")));

// connect to database
const mongoose = require("mongoose");

var mongoURI;
if(process.env.MONGODB_PORT_27017_TCP_ADDR){
  mongoURI = "mongodb://" + process.env.MONGODB_PORT_27017_TCP_ADDR + ":" + process.env.MONGODB_PORT_27017_TCP_PORT + "/panic-button"
} else { 
  mongoURI = "mongodb://localhost/panic-button";
}
console.log(mongoURI);
mongoose.connect(mongoURI, {
  useMongoClient: true,
  promiseLibrary: global.Promise,
});



mongoose.Promise = global.Promise;

// decode requests
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

// Session middleware
const session = require("express-session");
const MongoStore = require("connect-mongo")(session);
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
const passport = require("passport");
const strategies = require("./auth");

const localStrategy = strategies.local;
const bearerStrategy = strategies.token;

passport.use(localStrategy);
passport.use(bearerStrategy);
app.use(passport.initialize());
app.use(passport.session());

// log all requests
app.use(require("morgan")("dev"));


// set up routes
const routes = require("./routes");

const addr = process.env.ADDR || '0.0.0.0';
const port = process.env.PORT || 3000;

app.use("/", routes);

app.listen(port);
console.log(`Listening on port ${port}`);


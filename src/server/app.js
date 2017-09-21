"use strict";

const app = require("express")();

// log all requests
app.use(require("morgan")("dev"));

const routes = require("./routes");

const port = process.env.PORT || 3000;

app.use("/", routes);

app.listen(port);
console.log(`Listening on port ${port}`);

